import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, Download, Copy, AlertTriangle, RefreshCw, Flame, Check, QrCode, Image as ImageIcon, Sparkles, Video, FileText, UploadCloud, Info } from 'lucide-react';
import { encryptBinary, packMediaData, generatePreSharedKey, deriveKeyFromPassphrase, packPayload } from '../crypto/crypto';
import { generateQRCode } from '../qr/qr';
import { encodeStegoImage, generateRandomCoverImage } from '../stego/stego';
import { Card3DTilt } from './Card3DTilt';
import { CryptoAnimationOverlay } from './CryptoAnimationOverlay';

// Max limits
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_QR_SAFE_SIZE = 1800; // ~1.8 KB for QR code data capacity

export const EncryptScreen: React.FC = () => {
  // Input Target: Text, Image File, or Video File
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');

  // Text message state
  const [message, setMessage] = useState('');

  // Media file state (image or video)
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaBytes, setMediaBytes] = useState<Uint8Array | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  // Security mode: passphrase vs preshared
  const [mode, setMode] = useState<'passphrase' | 'preshared'>('passphrase');
  
  // Carrier State: QR Code vs Steganography Image
  const [carrier, setCarrier] = useState<'qr' | 'stego'>('qr');
  const [stegoSource, setStegoSource] = useState<'random' | 'custom'>('random');
  const [customCoverSrc, setCustomCoverSrc] = useState<string | null>(null);
  const [randomCoverSrc, setRandomCoverSrc] = useState<string | null>(null);

  // Passphrase Mode States
  const [passphrase, setPassphrase] = useState('');
  const [kdfMethod, setKdfMethod] = useState<'argon2id' | 'pbkdf2'>('argon2id');
  
  // Pre-shared Key States
  const [presharedKey, setPresharedKey] = useState('');
  const [showPresharedKeyWarning, setShowPresharedKeyWarning] = useState(true);

  // General States
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgContent, setQrSvgContent] = useState<string | null>(null);
  const [stegoDataUrl, setStegoDataUrl] = useState<string | null>(null);
  
  const [isComputingKey, setIsComputingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Success Flags
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Performance Optimization: Cache the derived CryptoKey
  const cachedKeyRef = useRef<{
    passphrase: string;
    kdf: 'argon2id' | 'pbkdf2';
    saltHex: string;
    key: CryptoKey;
  } | null>(null);

  // Initialize pre-shared key
  const initPresharedKey = () => {
    const key = generatePreSharedKey();
    setPresharedKey(key);
    setShowPresharedKeyWarning(true);
  };

  // Generate initial random cover image for stego mode
  const regenerateRandomCover = () => {
    const newCover = generateRandomCoverImage(600, 600);
    setRandomCoverSrc(newCover);
  };

  useEffect(() => {
    if (mode === 'preshared' && !presharedKey) {
      initPresharedKey();
    }
  }, [mode]);

  useEffect(() => {
    if (!randomCoverSrc) {
      regenerateRandomCover();
    }
  }, []);

  // When changing contentType to video, force carrier to stego (video exceeds QR capacity)
  useEffect(() => {
    if (contentType === 'video') {
      setCarrier('stego');
    }
  }, [contentType]);

  // Handle Media File Selection
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = contentType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of 50 MB.`);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setMediaFile(file);
      setMediaBytes(bytes);
      
      // Revoke previous preview URL
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
      const preview = URL.createObjectURL(file);
      setMediaPreviewUrl(preview);
      setError(null);

      // If file is larger than QR limit, automatically switch carrier to stego
      if (file.size > MAX_QR_SAFE_SIZE) {
        setCarrier('stego');
      }
    } catch (err: any) {
      setError("Failed to read file: " + (err?.message || String(err)));
    }
  };

  const removeSelectedFile = () => {
    setMediaFile(null);
    setMediaBytes(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    setQrDataUrl(null);
    setQrSvgContent(null);
    setStegoDataUrl(null);
  };

  // Debounced / Triggered Generation
  useEffect(() => {
    let active = true;
    const generateTimer = setTimeout(() => {
      if (active) {
        triggerGeneration();
      }
    }, mode === 'passphrase' ? 400 : 100);

    return () => {
      active = false;
      clearTimeout(generateTimer);
    };
  }, [
    contentType,
    message,
    mediaBytes,
    mode,
    carrier,
    stegoSource,
    customCoverSrc,
    randomCoverSrc,
    passphrase,
    kdfMethod,
    burnAfterReading,
    errorCorrection,
    presharedKey
  ]);

  const triggerGeneration = async () => {
    // Check if there is data to encrypt
    const hasData = contentType === 'text' ? !!message : !!mediaBytes;
    if (!hasData) {
      setQrDataUrl(null);
      setQrSvgContent(null);
      setStegoDataUrl(null);
      setError(null);
      return;
    }

    if (mode === 'passphrase' && passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters long.");
      setQrDataUrl(null);
      setQrSvgContent(null);
      setStegoDataUrl(null);
      return;
    }

    if (mode === 'preshared' && presharedKey.length !== 64) {
      setError("Pre-shared key must be exactly 64 hex characters (32 bytes).");
      setQrDataUrl(null);
      setQrSvgContent(null);
      setStegoDataUrl(null);
      return;
    }

    if (carrier === 'stego' && stegoSource === 'custom' && !customCoverSrc) {
      setError("Please upload a cover image to hide your encrypted file inside.");
      setStegoDataUrl(null);
      return;
    }

    setIsComputingKey(true);
    setError(null);

    try {
      let unencryptedPayload: Uint8Array;

      if (contentType === 'text') {
        const encoder = new TextEncoder();
        const textBytes = encoder.encode(message);
        unencryptedPayload = packMediaData('text', textBytes, 'text/plain', '');
      } else if (contentType === 'image' && mediaBytes && mediaFile) {
        unencryptedPayload = packMediaData('image', mediaBytes, mediaFile.type || 'image/png', mediaFile.name);
      } else if (contentType === 'video' && mediaBytes && mediaFile) {
        unencryptedPayload = packMediaData('video', mediaBytes, mediaFile.type || 'video/mp4', mediaFile.name);
      } else {
        throw new Error("Missing content to encrypt.");
      }

      // Check if trying to put large data into QR code
      if (carrier === 'qr' && unencryptedPayload.length > MAX_QR_SAFE_SIZE) {
        setCarrier('stego');
        setError("Content exceeds QR code physical capacity (1.8 KB). Automatically switched to Stego Image Carrier (supports up to 50 MB).");
      }

      let payloadBytes: Uint8Array;

      if (mode === 'passphrase') {
        let keyToUse: CryptoKey;
        const currentCache = cachedKeyRef.current;
        
        if (currentCache && currentCache.passphrase === passphrase && currentCache.kdf === kdfMethod) {
          keyToUse = currentCache.key;
        } else {
          const freshSalt = crypto.getRandomValues(new Uint8Array(16));
          const derivation = await deriveKeyFromPassphrase(passphrase, freshSalt, kdfMethod);
          keyToUse = derivation.key;
          
          cachedKeyRef.current = {
            passphrase,
            kdf: kdfMethod,
            saltHex: Array.from(freshSalt).map(b => b.toString(16).padStart(2, '0')).join(''),
            key: keyToUse
          };
        }

        const nonce = crypto.getRandomValues(new Uint8Array(12));
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: nonce, tagLength: 128 },
          keyToUse,
          unencryptedPayload as any
        );

        const saltBytes = new Uint8Array(
          (cachedKeyRef.current!.saltHex.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16))
        );
        const encryptedData = new Uint8Array(encryptedBuffer);
        const modeFlag = burnAfterReading ? (0x01 | 0x10) : 0x01;
        
        payloadBytes = packPayload(1, modeFlag, saltBytes, nonce, encryptedData);
      } else {
        payloadBytes = await encryptBinary(unencryptedPayload, presharedKey, 'preshared', kdfMethod, burnAfterReading);
      }

      if (carrier === 'qr') {
        const pngUrl = await generateQRCode(payloadBytes, 'png', errorCorrection);
        const svgSrc = await generateQRCode(payloadBytes, 'svg', errorCorrection);
        setQrDataUrl(pngUrl);
        setQrSvgContent(svgSrc);
        setStegoDataUrl(null);
      } else {
        const coverToUse = stegoSource === 'custom' ? customCoverSrc : (randomCoverSrc || generateRandomCoverImage());
        const stegoPng = await encodeStegoImage(coverToUse, payloadBytes);
        setStegoDataUrl(stegoPng);
        setQrDataUrl(null);
        setQrSvgContent(null);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to generate encrypted payload.");
      setQrDataUrl(null);
      setQrSvgContent(null);
      setStegoDataUrl(null);
    } finally {
      setIsComputingKey(false);
    }
  };

  const handleCustomCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCustomCoverSrc(evt.target?.result as string);
        setStegoSource('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const getPassphraseStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-200 dark:bg-slate-800', width: 'w-0' };
    if (pwd.length < 8) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/4' };
    
    let strength = 0;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;

    if (strength === 0) return { label: 'Weak', color: 'bg-red-500', width: 'w-2/4' };
    if (strength === 1) return { label: 'Medium', color: 'bg-amber-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const copyKeyToClipboard = () => {
    navigator.clipboard.writeText(presharedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyResultToClipboard = async () => {
    const targetUrl = carrier === 'qr' ? qrDataUrl : stegoDataUrl;
    if (!targetUrl) return;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  const downloadResult = (format: 'png' | 'svg') => {
    if (carrier === 'qr') {
      if (format === 'png' && qrDataUrl) {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `qrcrypt-${Date.now()}.png`;
        link.click();
      } else if (format === 'svg' && qrSvgContent) {
        const blob = new Blob([qrSvgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcrypt-${Date.now()}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } else if (stegoDataUrl) {
      const link = document.createElement('a');
      link.href = stegoDataUrl;
      link.download = `stegocrypt-${Date.now()}.png`;
      link.click();
    }
  };

  const strengthInfo = getPassphraseStrength(passphrase);
  const activeResultUrl = carrier === 'qr' ? qrDataUrl : stegoDataUrl;
  const isLargeMedia = (contentType === 'image' && (mediaFile?.size || 0) > MAX_QR_SAFE_SIZE) || contentType === 'video';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in p-2 max-w-6xl mx-auto">
      {/* Configuration controls */}
      <div className="lg:col-span-7 space-y-6">
        <Card3DTilt>
          <div className="glass-panel-3d rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
                <Shield className="h-5 w-5 text-indigo-500" />
                <span>Encrypt & Conceal</span>
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Max 50 MB
              </span>
            </div>

            {/* Input Content Type Selector: Text vs Image vs Video */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Select Content to Encrypt
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-200/50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-300/40 dark:border-slate-800/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setContentType('text');
                    removeSelectedFile();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    contentType === 'text'
                      ? 'bg-gradient-to-b from-white to-slate-100 dark:from-indigo-600 dark:to-indigo-700 text-indigo-600 dark:text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Text Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContentType('image');
                    setMessage('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    contentType === 'image'
                      ? 'bg-gradient-to-b from-white to-slate-100 dark:from-indigo-600 dark:to-indigo-700 text-indigo-600 dark:text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Image File</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContentType('video');
                    setMessage('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    contentType === 'video'
                      ? 'bg-gradient-to-b from-white to-slate-100 dark:from-indigo-600 dark:to-indigo-700 text-indigo-600 dark:text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Video className="h-4 w-4" />
                  <span>Video File</span>
                </button>
              </div>
            </div>

            {/* Plaintext Input (if text selected) */}
            {contentType === 'text' && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Plaintext Message
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {message.length} chars
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (!e.target.value) cachedKeyRef.current = null;
                  }}
                  placeholder="Type your confidential message here..."
                  rows={4}
                  className="w-full glass-input-3d rounded-2xl p-4 text-sm font-sans resize-none"
                />
              </div>
            )}

            {/* Media Upload Area (if image or video selected) */}
            {(contentType === 'image' || contentType === 'video') && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Upload {contentType === 'image' ? 'Image' : 'Video'} to Encrypt (Up to 50 MB)
                </label>

                {!mediaFile ? (
                  <label className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 dark:border-indigo-400/30 dark:hover:border-indigo-400 rounded-3xl p-6 flex flex-col items-center justify-center space-y-3 cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 hover:bg-indigo-500/5 transition-all">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Click or drag & drop {contentType === 'image' ? 'photo' : 'video'} here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {contentType === 'image' ? 'PNG, JPG, WebP, GIF' : 'MP4, WebM, MOV'} (Max 50MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept={contentType === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                          {contentType === 'image' ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {mediaFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB • {mediaFile.type || 'Binary'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Preview Thumbnail / Video */}
                    {mediaPreviewUrl && (
                      <div className="max-h-48 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                        {contentType === 'image' ? (
                          <img src={mediaPreviewUrl} alt="Preview" className="max-h-48 object-contain rounded-xl" />
                        ) : (
                          <video src={mediaPreviewUrl} controls className="max-h-48 rounded-xl w-full" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Carrier Selector (QR vs Stego) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Output Format (Carrier)
                </label>
                {isLargeMedia && (
                  <span className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center space-x-1 font-mono">
                    <Info className="h-3 w-3" />
                    <span>Large files require Stego PNG</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-200/50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-300/40 dark:border-slate-800/80 shadow-inner">
                <button
                  type="button"
                  disabled={isLargeMedia}
                  onClick={() => setCarrier('qr')}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                    isLargeMedia
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : carrier === 'qr'
                      ? 'bg-gradient-to-b from-white to-slate-100 dark:from-indigo-600 dark:to-indigo-700 text-indigo-600 dark:text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCarrier('stego')}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                    carrier === 'stego'
                      ? 'bg-gradient-to-b from-white to-slate-100 dark:from-indigo-600 dark:to-indigo-700 text-indigo-600 dark:text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Stego Image (Up to 50MB)</span>
                </button>
              </div>
            </div>

            {/* Stego Cover Settings */}
            {carrier === 'stego' && (
              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-4 space-y-3 animate-slide-down">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Cover Image Settings</span>
                  </label>
                  {stegoSource === 'random' && (
                    <button
                      type="button"
                      onClick={regenerateRandomCover}
                      className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium flex items-center space-x-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>New Random Pattern</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStegoSource('random')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                      stegoSource === 'random'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Auto-Generated Pattern
                  </button>
                  <label className={`py-1.5 px-3 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                    stegoSource === 'custom'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}>
                    <span>Upload Own Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {stegoSource === 'custom' && customCoverSrc && (
                  <div className="flex items-center space-x-3 pt-1">
                    <img src={customCoverSrc} alt="Custom cover preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">Custom Cover Loaded</span>
                      <span>Your encrypted file will be invisibly embedded in this image.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Mode Switcher */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Security Mode
              </label>
              <div className="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setMode('passphrase')}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    mode === 'passphrase'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Passphrase
                </button>
                <button
                  type="button"
                  onClick={() => setMode('preshared')}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    mode === 'preshared'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Pre-Shared Key
                </button>
              </div>
            </div>

            {/* Passphrase Mode Panel */}
            {mode === 'passphrase' && (
              <div className="space-y-4 animate-slide-down">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter a strong passphrase..."
                      className="w-full glass-input-3d rounded-2xl py-3 pl-11 pr-4 text-sm font-sans"
                    />
                    <Key className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                  {passphrase && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                        <span>Passphrase Strength:</span>
                        <span>{strengthInfo.label}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Key Derivation Function (KDF)
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="kdf"
                        value="argon2id"
                        checked={kdfMethod === 'argon2id'}
                        onChange={() => setKdfMethod('argon2id')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Argon2id <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono">(Recommended)</span></span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="kdf"
                        value="pbkdf2"
                        checked={kdfMethod === 'pbkdf2'}
                        onChange={() => setKdfMethod('pbkdf2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>PBKDF2-SHA256 <span className="text-[10px] text-slate-400 font-mono">(Fallback)</span></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Pre-shared Key Mode Panel */}
            {mode === 'preshared' && (
              <div className="space-y-4 animate-slide-down">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Pre-Shared AES Key
                    </label>
                    <button
                      onClick={initPresharedKey}
                      className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium flex items-center space-x-1"
                      title="Generate New Key"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={presharedKey}
                      className="w-full glass-input-3d bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl py-3 pl-4 pr-12 text-xs font-mono text-indigo-600 dark:text-indigo-400 border-dashed"
                    />
                    <button
                      onClick={copyKeyToClipboard}
                      className="absolute right-3 top-2.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {showPresharedKeyWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="font-bold mb-1">Make sure to copy this key!</p>
                      <p>
                        This pre-shared key is generated client-side and will not be stored.
                        Copy it now and share it securely with the recipient.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shared Options */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/30 dark:border-slate-800/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={burnAfterReading}
                  onChange={(e) => setBurnAfterReading(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2">
                  <Flame className={`h-4 w-4 ${burnAfterReading ? 'text-orange-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Burn After Reading
                    </span>
                    <span className="text-[9px] text-slate-400 block leading-tight">
                      Alert recipient if opened multiple times
                    </span>
                  </div>
                </div>
              </label>

              {carrier === 'qr' && (
                <div className="flex flex-col justify-center">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                    QR Error Correction
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setErrorCorrection(level)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          errorCorrection === level
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card3DTilt>
      </div>

      {/* Preview & Actions Panel with 3D Cyber Styling */}
      <div className="lg:col-span-5">
        <Card3DTilt>
          <div className="glass-panel-3d rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
            <div className="w-full text-left flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {carrier === 'qr' ? 'QR Code Preview' : 'Stego Image Preview'}
                </h3>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {carrier === 'qr' ? 'Updates in real-time' : 'Conceals encrypted data into image'}
                </p>
              </div>
              {carrier === 'stego' && (
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                  PNG Steganography
                </span>
              )}
            </div>

            <div className="relative border-2 border-indigo-500/20 dark:border-indigo-400/20 rounded-3xl p-4 bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center w-full aspect-square max-w-[280px] overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
              <CryptoAnimationOverlay type="encrypt" isActive={isComputingKey} statusText="Deriving Argon2 Keys & Encrypting..." />

              {activeResultUrl ? (
                <img src={activeResultUrl} alt="Encrypted Output" className="w-full h-full object-contain select-none rounded-2xl shadow-md animate-fade-in" />
              ) : (
                <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center justify-center space-y-3">
                  {carrier === 'qr' ? (
                    <QrCode className="h-16 w-16 stroke-[1.5]" />
                  ) : (
                    <ImageIcon className="h-16 w-16 stroke-[1.5]" />
                  )}
                  <span className="text-xs text-slate-400 max-w-[180px]">
                    {carrier === 'qr'
                      ? 'Enter message or choose file to generate your secure QR code.'
                      : 'Enter message or upload video/image to generate your Stego image.'}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-600 dark:text-red-400 w-full flex items-start space-x-2 text-left animate-shake">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {activeResultUrl && !error && (
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadResult('png')}
                  className="py-3 px-4 btn-3d-primary rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PNG</span>
                </button>
                {carrier === 'qr' ? (
                  <button
                    onClick={() => downloadResult('svg')}
                    className="py-3 px-4 btn-3d-secondary rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download SVG</span>
                  </button>
                ) : (
                  <div className="text-[10px] text-slate-400 flex items-center justify-center px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span>Lossless PNG Format</span>
                  </div>
                )}
                <button
                  onClick={copyResultToClipboard}
                  className="col-span-2 py-3 px-4 btn-3d-secondary rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {copiedResult ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Copied Image to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Image to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </Card3DTilt>
      </div>
    </div>
  );
};
