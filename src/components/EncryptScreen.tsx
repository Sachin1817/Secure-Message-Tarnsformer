import React, { useState, useEffect } from 'react';
import { Key, Download, Copy, AlertTriangle, RefreshCw, Flame, Check, QrCode, Image as ImageIcon, Video, FileText, UploadCloud, Info, Cpu, Shield, Eye, EyeOff } from 'lucide-react';
import { encryptBinary, packMediaData, generatePreSharedKey } from '../crypto/crypto';
import { generateQRCode } from '../qr/qr';
import { encodeStegoImage, generateRandomCoverImage } from '../stego/stego';

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
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [kdfMethod, setKdfMethod] = useState<'argon2id' | 'pbkdf2'>('argon2id');
  const [presharedKey, setPresharedKey] = useState('');
  
  // Carrier State: QR Code vs Steganography Image
  const [carrier, setCarrier] = useState<'qr' | 'stego'>('qr');
  const [randomCoverSrc, setRandomCoverSrc] = useState<string | null>(null);

  // General States
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgContent, setQrSvgContent] = useState<string | null>(null);
  const [stegoDataUrl, setStegoDataUrl] = useState<string | null>(null);
  
  const [isComputingKey, setIsComputingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Success Flags
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Initialize pre-shared key
  const initPresharedKey = () => {
    const key = generatePreSharedKey();
    setPresharedKey(key);
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
  }, [mode, presharedKey]);

  useEffect(() => {
    if (!randomCoverSrc) {
      regenerateRandomCover();
    }
  }, []);

  // When changing contentType to video, force carrier to stego
  useEffect(() => {
    if (contentType === 'video') {
      setCarrier('stego');
    }
  }, [contentType]);

  // Handle Media File Selection
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (contentType === 'video' && file.size > MAX_VIDEO_SIZE) {
      setError(`Video exceeds maximum allowed size of 50 MB (File is ${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    if (contentType === 'image' && file.size > MAX_IMAGE_SIZE) {
      setError(`Image exceeds maximum allowed size of 50 MB (File is ${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setError(null);
    setMediaFile(file);

    const arrayBuffer = await file.arrayBuffer();
    setMediaBytes(new Uint8Array(arrayBuffer));

    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(previewUrl);

    if (file.size > MAX_QR_SAFE_SIZE) {
      setCarrier('stego');
    }
  };

  // Remove selected media
  const removeSelectedFile = () => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(null);
    setMediaBytes(null);
    setMediaPreviewUrl(null);
    setError(null);
  };

  // Automatic Encryption Trigger
  useEffect(() => {
    const runEncryption = async () => {
      let rawPayloadBytes: Uint8Array | null = null;

      if (contentType === 'text') {
        if (!message.trim()) {
          setQrDataUrl(null);
          setQrSvgContent(null);
          setStegoDataUrl(null);
          setError(null);
          return;
        }
        const textEncoder = new TextEncoder();
        rawPayloadBytes = packMediaData('text', textEncoder.encode(message), 'text/plain', 'message.txt');
      } else if (contentType === 'image' || contentType === 'video') {
        if (!mediaBytes || !mediaFile) {
          setQrDataUrl(null);
          setQrSvgContent(null);
          setStegoDataUrl(null);
          return;
        }
        rawPayloadBytes = packMediaData(contentType, mediaBytes, mediaFile.type || 'application/octet-stream', mediaFile.name);
      }

      if (!rawPayloadBytes) return;

      if (mode === 'passphrase' && !passphrase) {
        setQrDataUrl(null);
        setQrSvgContent(null);
        setStegoDataUrl(null);
        return;
      }

      if (mode === 'preshared' && !presharedKey) {
        return;
      }

      try {
        setError(null);
        setIsComputingKey(true);

        const encryptedBytes = await encryptBinary(
          rawPayloadBytes,
          mode === 'passphrase' ? passphrase : presharedKey,
          mode,
          kdfMethod,
          burnAfterReading
        );

        if (carrier === 'qr') {
          if (encryptedBytes.length > 2953) {
            setError(`Payload (${(encryptedBytes.length / 1024).toFixed(1)} KB) exceeds physical QR code limit. Switched to Stego PNG.`);
            setCarrier('stego');
            setIsComputingKey(false);
            return;
          }

          const pngUrl = await generateQRCode(encryptedBytes, 'png', 'M');
          const svgCode = await generateQRCode(encryptedBytes, 'svg', 'M');
          setQrDataUrl(pngUrl);
          setQrSvgContent(svgCode);
          setStegoDataUrl(null);
        } else {
          if (randomCoverSrc) {
            const stegoUrl = await encodeStegoImage(randomCoverSrc, encryptedBytes);
            setStegoDataUrl(stegoUrl);
            setQrDataUrl(null);
            setQrSvgContent(null);
          }
        }
      } catch (err: any) {
        console.error("Encryption error:", err);
        setError(err.message || "Failed to encrypt payload");
      } finally {
        setIsComputingKey(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      runEncryption();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [
    contentType,
    message,
    mediaBytes,
    mediaFile,
    mode,
    passphrase,
    presharedKey,
    kdfMethod,
    carrier,
    randomCoverSrc,
    burnAfterReading
  ]);

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

  const activeResultUrl = carrier === 'qr' ? qrDataUrl : stegoDataUrl;
  const isLargeMedia = (contentType === 'image' && (mediaFile?.size || 0) > MAX_QR_SAFE_SIZE) || contentType === 'video';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto animate-fade-in relative z-10">
      {/* COLUMN 1: Plaintext Stream / Media Input */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl p-5 flex flex-col h-full shadow-lg relative group">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 dark:border-[#3b4b37]/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00daf3]/15 text-[#00daf3]">
                <FileText className="h-4 w-4 stroke-[2.5]" />
              </span>
              <h2 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Plaintext Stream
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-[#b9ccb2] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#2a2a2b] border border-slate-200 dark:border-[#3b4b37]/50">
              {contentType === 'text' ? 'UTF-8' : contentType === 'image' ? 'IMG/RAW' : 'VID/50MB'}
            </span>
          </div>

          {/* Target Content Type Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-[#131314] p-1 rounded-xl border border-slate-200 dark:border-[#3b4b37]/50 mb-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setContentType('text');
                removeSelectedFile();
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                contentType === 'text'
                  ? 'bg-white dark:bg-[#00ff41]/20 text-slate-900 dark:text-[#00ff41] shadow-sm'
                  : 'text-slate-500 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setContentType('image');
                setMessage('');
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                contentType === 'image'
                  ? 'bg-white dark:bg-[#00ff41]/20 text-slate-900 dark:text-[#00ff41] shadow-sm'
                  : 'text-slate-500 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Image</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setContentType('video');
                setMessage('');
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                contentType === 'video'
                  ? 'bg-white dark:bg-[#00ff41]/20 text-slate-900 dark:text-[#00ff41] shadow-sm'
                  : 'text-slate-500 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Video</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="flex-1 flex flex-col min-h-[220px]">
            {contentType === 'text' ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full flex-1 bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-800 dark:text-[#e5e2e3] focus:outline-none glow-border resize-none placeholder:text-slate-400 dark:placeholder:text-[#b9ccb2]/40"
                placeholder="> Initialize secure text sequence..."
              />
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                {!mediaFile ? (
                  <label className="border-2 border-dashed border-slate-300 dark:border-[#3b4b37] hover:border-[#00ff41] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer bg-slate-50 dark:bg-[#131314] transition-colors">
                    <UploadCloud className="h-8 w-8 text-[#00ff41]" />
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-[#e5e2e3]">
                      Upload {contentType === 'image' ? 'Image' : 'Video'} File
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#84967e]">
                      Max 50 MB • MP4, WebM, PNG, JPG
                    </span>
                    <input
                      type="file"
                      accept={contentType === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-[#131314] rounded-2xl border border-slate-200 dark:border-[#3b4b37] flex flex-col items-center space-y-2">
                    {contentType === 'image' && mediaPreviewUrl && (
                      <img src={mediaPreviewUrl} alt="Preview" className="max-h-36 rounded-lg object-contain" />
                    )}
                    {contentType === 'video' && mediaPreviewUrl && (
                      <video src={mediaPreviewUrl} controls className="max-h-36 rounded-lg w-full" />
                    )}
                    <div className="flex justify-between w-full items-center font-mono text-xs text-slate-600 dark:text-[#b9ccb2] pt-2 border-t border-slate-200 dark:border-[#3b4b37]/40">
                      <span className="truncate max-w-[150px]">{mediaFile.name}</span>
                      <span className="text-[#00ff41]">{(mediaFile.size / 1024).toFixed(1)} KB</span>
                      <button onClick={removeSelectedFile} className="text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-3 flex justify-between items-center text-slate-500 dark:text-[#b9ccb2] font-mono text-xs">
            <span>
              {contentType === 'text' ? `Chars: ${message.length} / 2048` : mediaFile ? `${(mediaFile.size / (1024*1024)).toFixed(2)} MB / 50 MB` : 'Size: 0 MB'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${message.trim() || mediaFile ? 'bg-[#00ff41] animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-[11px]">{message.trim() || mediaFile ? 'Ready to Transform' : 'Awaiting Input'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Configuration Pane */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl p-5 flex flex-col h-full shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200/60 dark:border-[#3b4b37]/50 pb-3">
            <span className="p-1.5 rounded-lg bg-[#00daf3]/15 text-[#00daf3]">
              <Key className="h-4 w-4 stroke-[2.5]" />
            </span>
            <h2 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Transformer Config
            </h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {/* Security Mode Toggle */}
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-slate-500 dark:text-[#b9ccb2] font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Security Mode</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="flex bg-slate-100 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setMode('passphrase')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    mode === 'passphrase'
                      ? 'bg-white dark:bg-[#00ff41]/20 text-slate-900 dark:text-[#00ff41] shadow-sm'
                      : 'text-slate-500 dark:text-[#b9ccb2]'
                  }`}
                >
                  Passphrase
                </button>
                <button
                  type="button"
                  onClick={() => setMode('preshared')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    mode === 'preshared'
                      ? 'bg-white dark:bg-[#00daf3]/20 text-slate-900 dark:text-[#00daf3] shadow-sm'
                      : 'text-slate-500 dark:text-[#b9ccb2]'
                  }`}
                >
                  Pre-Shared Key
                </button>
              </div>
            </div>

            {/* Passphrase / Key Input Field */}
            {mode === 'passphrase' ? (
              <div className="space-y-1 font-mono text-xs">
                <label className="text-slate-500 dark:text-[#b9ccb2] font-bold uppercase tracking-wider block">
                  Secret Passphrase
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter high-entropy passphrase..."
                    className="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-3 pr-10 text-xs sm:text-sm text-slate-800 dark:text-[#e5e2e3] focus:outline-none glow-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 text-slate-400 hover:text-[#00ff41] transition-colors p-1"
                    title={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                  >
                    {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 dark:text-[#b9ccb2] font-bold uppercase tracking-wider">
                    256-Bit Raw Hex Key
                  </label>
                  <button onClick={initPresharedKey} className="text-[#00daf3] hover:underline flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Gen
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={presharedKey}
                    readOnly
                    className="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-2.5 text-[11px] text-[#00daf3] truncate select-all"
                  />
                  <button
                    onClick={copyKeyToClipboard}
                    className="p-2.5 bg-slate-200 dark:bg-[#2a2a2b] rounded-xl text-slate-700 dark:text-[#e5e2e3] hover:text-[#00daf3]"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-[#00ff41]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Carrier Selector (QR vs Stego) */}
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-slate-500 dark:text-[#b9ccb2] font-bold uppercase tracking-wider">
                Carrier Format
              </label>
              <div className="flex bg-slate-100 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37] rounded-xl p-1">
                <button
                  type="button"
                  disabled={isLargeMedia}
                  onClick={() => setCarrier('qr')}
                  className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    carrier === 'qr'
                      ? 'bg-white dark:bg-[#00ff41]/20 text-slate-900 dark:text-[#00ff41] shadow-sm'
                      : isLargeMedia ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-slate-500 dark:text-[#b9ccb2]'
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCarrier('stego')}
                  className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    carrier === 'stego'
                      ? 'bg-white dark:bg-[#00ff41]/20 text-slate-900 dark:text-[#00ff41] shadow-sm'
                      : 'text-slate-500 dark:text-[#b9ccb2]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Stego PNG</span>
                </button>
              </div>
            </div>

            {/* KDF Setting */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-[#3b4b37]/40 bg-slate-50 dark:bg-[#131314]/80 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-[#e5e2e3] flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-[#00daf3]" />
                  <span>Memory-Hard KDF</span>
                </span>
                <button
                  type="button"
                  onClick={() => setKdfMethod(kdfMethod === 'argon2id' ? 'pbkdf2' : 'argon2id')}
                  className="w-10 h-5 rounded-full bg-[#00ff41]/20 border border-[#00ff41]/50 relative transition-colors"
                >
                  <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-[#00ff41] shadow-[0_0_5px_#00e639] transition-all ${kdfMethod === 'argon2id' ? 'right-1' : 'left-1 bg-slate-400'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-[#84967e]">
                <span className="text-[#00ff41] font-semibold">{kdfMethod === 'argon2id' ? 'Argon2id WASM Active' : 'PBKDF2-HMAC Active'}</span>
                <span>Iter: {kdfMethod === 'argon2id' ? '2 (16MB)' : '600k'}</span>
              </div>
            </div>

            {/* Burn After Reading */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#3b4b37]/40 bg-slate-50 dark:bg-[#131314]/80 font-mono text-xs">
              <label className="font-bold text-slate-800 dark:text-[#e5e2e3] flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Burn After Reading</span>
              </label>
              <button
                type="button"
                onClick={() => setBurnAfterReading(!burnAfterReading)}
                className={`w-10 h-5 rounded-full border relative transition-colors ${burnAfterReading ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-3 h-3 rounded-full transition-all ${burnAfterReading ? 'right-1 bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'left-1 bg-slate-400'}`} />
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Security Strength Gauge */}
            <div className="mt-auto flex flex-col gap-1 font-mono text-xs pt-2">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-[#b9ccb2]">
                <span>Entropy Level</span>
                <span className="text-[#00daf3] font-bold">Optimal</span>
              </div>
              <div className="flex gap-1 h-2">
                <div className="flex-1 bg-[#00daf3]/80 rounded-l-full shadow-[0_0_8px_rgba(0,218,243,0.5)]"></div>
                <div className="flex-1 bg-[#00daf3]/80 shadow-[0_0_8px_rgba(0,218,243,0.5)]"></div>
                <div className="flex-1 bg-[#00ff41]/80 shadow-[0_0_8px_rgba(0,230,57,0.5)]"></div>
                <div className="flex-1 bg-slate-200 dark:bg-[#131314] border border-slate-300 dark:border-[#3b4b37]/50 rounded-r-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3: Live Output */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-xl border border-slate-200 dark:border-[#00ff41]/40 rounded-2xl p-5 flex flex-col h-full shadow-lg relative overflow-hidden group">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 dark:border-[#00ff41]/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00ff41]/15 text-[#00ff41]">
                <QrCode className="h-4 w-4 stroke-[2.5]" />
              </span>
              <h2 className="font-mono text-xs sm:text-sm font-bold text-[#00ff41] uppercase tracking-wider">
                Encrypted Payload
              </h2>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00e639] animate-pulse"></div>
          </div>

          {/* Glass Frame & QR / Stego Preview */}
          <div className="flex-1 flex items-center justify-center p-4 relative min-h-[260px]">
            {/* Targeting Reticles */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#00ff41]/70"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#00ff41]/70"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#00ff41]/70"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#00ff41]/70"></div>

            <div className="relative w-full max-w-[240px] aspect-square p-2.5 border border-[#00ff41]/40 rounded-2xl bg-white dark:bg-[#131314] shadow-[0_0_40px_rgba(0,230,57,0.15)] group-hover:shadow-[0_0_60px_rgba(0,230,57,0.25)] transition-shadow duration-500 flex items-center justify-center overflow-hidden">
              {/* Simulated Scanner Line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff41]/25 to-transparent h-4 w-full animate-laser-scan z-20 pointer-events-none"></div>

              {activeResultUrl ? (
                <img
                  src={activeResultUrl}
                  alt="Encrypted Output"
                  className="w-full h-full object-contain rounded-lg relative z-10"
                />
              ) : (
                <div className="text-center font-mono text-xs text-slate-400 dark:text-[#84967e] p-4">
                  <Shield className="h-10 w-10 mx-auto text-slate-400 dark:text-[#3b4b37] mb-2 stroke-[1.5]" />
                  <span>{isComputingKey ? 'Computing AES-GCM tag...' : 'Enter message or media above to generate payload'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2 font-mono text-xs">
            <div className="bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-2.5 flex items-center justify-between text-slate-600 dark:text-[#b9ccb2]">
              <span className="truncate mr-2 text-[11px]">
                {activeResultUrl ? `qrc://enc/v1?p=${(message || mediaFile?.name || 'media').substring(0, 12)}...` : 'qrc://enc/v1?p=...'}
              </span>
              <button
                onClick={copyResultToClipboard}
                title="Copy Payload"
                className="hover:text-[#00ff41] p-1"
              >
                {copiedResult ? <Check className="h-3.5 w-3.5 text-[#00ff41]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <button
              onClick={() => downloadResult('png')}
              disabled={!activeResultUrl}
              className="w-full bg-[#00ff41] text-black font-mono text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00e639] hover:shadow-[0_0_20px_rgba(0,230,57,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>Download {carrier === 'qr' ? 'QR Code' : 'Stego PNG'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
