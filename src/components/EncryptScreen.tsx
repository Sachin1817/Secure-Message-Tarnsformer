import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, Download, Copy, AlertTriangle, RefreshCw, Flame, Check, QrCode } from 'lucide-react';
import { encryptMessage, generatePreSharedKey, deriveKeyFromPassphrase, packPayload } from '../crypto/crypto';
import { generateQRCode } from '../qr/qr';

export const EncryptScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'passphrase' | 'preshared'>('passphrase');
  
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
  
  const [isComputingKey, setIsComputingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Success Flags
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedQR, setCopiedQR] = useState(false);

  // Performance Optimization: Cache the derived CryptoKey
  // This allows real-time QR updates as the user types their message without freezing the browser.
  const cachedKeyRef = useRef<{
    passphrase: string;
    kdf: 'argon2id' | 'pbkdf2';
    saltHex: string;
    key: CryptoKey;
  } | null>(null);

  // Generate a random Pre-Shared Key when the screen loads or when mode is switched
  const initPresharedKey = () => {
    const key = generatePreSharedKey();
    setPresharedKey(key);
    setShowPresharedKeyWarning(true);
  };

  useEffect(() => {
    if (mode === 'preshared' && !presharedKey) {
      initPresharedKey();
    }
  }, [mode]);

  // Debounced/Triggered Generation
  useEffect(() => {
    let active = true;
    const generateTimer = setTimeout(() => {
      if (active) {
        triggerQRGeneration();
      }
    }, mode === 'passphrase' ? 400 : 100); // Higher debounce when deriving passphrase keys

    return () => {
      active = false;
      clearTimeout(generateTimer);
    };
  }, [message, mode, passphrase, kdfMethod, burnAfterReading, errorCorrection, presharedKey]);

  const triggerQRGeneration = async () => {
    if (!message) {
      setQrDataUrl(null);
      setQrSvgContent(null);
      setError(null);
      return;
    }

    if (mode === 'passphrase' && passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters long.");
      setQrDataUrl(null);
      setQrSvgContent(null);
      return;
    }

    if (mode === 'preshared' && presharedKey.length !== 64) {
      setError("Pre-shared key must be exactly 64 hex characters (32 bytes).");
      setQrDataUrl(null);
      setQrSvgContent(null);
      return;
    }

    setIsComputingKey(true);
    setError(null);

    try {
      let payloadBytes: Uint8Array;

      if (mode === 'passphrase') {
        // Look up key in cache, or derive a new one
        // Note: For real-time updates as user types the *message*, salt remains fixed
        // for that key derivation session to avoid freezing. A fresh random salt is used
        // if they modify the passphrase or when they first load.
        let keyToUse: CryptoKey;
        const currentCache = cachedKeyRef.current;
        
        if (currentCache && currentCache.passphrase === passphrase && currentCache.kdf === kdfMethod) {
          keyToUse = currentCache.key;
        } else {
          // Derive fresh key
          const freshSalt = crypto.getRandomValues(new Uint8Array(16));
          // Derive with helper (handles Argon2 -> PBKDF2 fallback internally)
          const derivation = await deriveKeyFromPassphrase(passphrase, freshSalt, kdfMethod);
          
          keyToUse = derivation.key;
          
          // Cache it for subsequent message typing speed
          cachedKeyRef.current = {
            passphrase,
            kdf: kdfMethod,
            saltHex: Array.from(freshSalt).map(b => b.toString(16).padStart(2, '0')).join(''),
            key: keyToUse
          };
        }

        // Encrypt with our cached key and fresh random nonce (IV)
        // Web Crypto encrypt
        const encoder = new TextEncoder();
        const plaintextBytes = encoder.encode(message);
        const nonce = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: nonce, tagLength: 128 },
          keyToUse,
          plaintextBytes
        );

        const saltBytes = new Uint8Array(
          (cachedKeyRef.current!.saltHex.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16))
        );
        const encryptedData = new Uint8Array(encryptedBuffer);
        const modeFlag = burnAfterReading ? (0x01 | 0x10) : 0x01;
        
        payloadBytes = packPayload(1, modeFlag, saltBytes, nonce, encryptedData);
      } else {
        // Pre-shared key encryption
        payloadBytes = await encryptMessage(message, presharedKey, 'preshared', kdfMethod, burnAfterReading);
      }

      // Generate PNG and SVG
      const pngUrl = await generateQRCode(payloadBytes, 'png', errorCorrection);
      const svgSrc = await generateQRCode(payloadBytes, 'svg', errorCorrection);

      setQrDataUrl(pngUrl);
      setQrSvgContent(svgSrc);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to generate QR code payload.");
      setQrDataUrl(null);
      setQrSvgContent(null);
    } finally {
      setIsComputingKey(false);
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

  const copyQRToClipboard = async () => {
    if (!qrDataUrl) return;
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedQR(true);
      setTimeout(() => setCopiedQR(false), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };


  const downloadQR = (format: 'png' | 'svg') => {
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
  };

  const strengthInfo = getPassphraseStrength(passphrase);
  const remainingBytes = Math.max(0, 1500 - message.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in p-2 max-w-6xl mx-auto">
      {/* Configuration controls */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
            <Shield className="h-5 w-5 text-indigo-500" />
            <span>Encrypt Message</span>
          </h2>

          {/* Mode Switcher */}
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

          {/* Plaintext Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Plaintext Message
              </label>
              <span className={`text-[10px] font-mono ${remainingBytes < 100 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                {remainingBytes} bytes remaining
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // Clear cache key if text box becomes empty so next generation starts fresh
                if (!e.target.value) cachedKeyRef.current = null;
              }}
              placeholder="Type your sensitive message here..."
              rows={5}
              className="w-full glass-input rounded-2xl p-4 text-sm font-sans resize-none"
            />
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
                    className="w-full glass-input rounded-2xl py-3 pl-11 pr-4 text-sm font-sans"
                  />
                  <Key className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                </div>
                {/* Strength Meter */}
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

              {/* Advanced KDF Selector */}
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
                    className="w-full glass-input bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl py-3 pl-4 pr-12 text-xs font-mono text-indigo-600 dark:text-indigo-400 border-dashed"
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
                      Copy it now and share it securely with the recipient. It will not be shown again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shared Options */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Burn after reading */}
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
                    Alert recipient if scanned multiple times
                  </span>
                </div>
              </div>
            </label>

            {/* Error correction level */}
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
                    title={
                      level === 'L' ? 'Low (~7%)' :
                      level === 'M' ? 'Medium (~15%)' :
                      level === 'Q' ? 'Quarter (~25%)' : 'High (~30%)'
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output / QR Code Display Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
          {/* Header */}
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">QR Code Preview</h3>
            <p className="text-[10px] text-slate-400 leading-tight">Updates in real-time as you write</p>
          </div>

          {/* QR Area */}
          <div className="relative border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 bg-white shadow-sm flex items-center justify-center w-full aspect-square max-w-[280px]">
            {isComputingKey ? (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center space-y-3 z-10 backdrop-blur-[1px]">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                <span className="text-xs font-medium text-slate-500">Deriving crypto keys...</span>
              </div>
            ) : null}

            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Encrypted QR Code" className="w-full h-full object-contain select-none" />
            ) : (
              <div className="text-slate-300 dark:text-slate-800 flex flex-col items-center justify-center space-y-3">
                <QrCode className="h-16 w-16 stroke-[1.5]" />
                <span className="text-xs text-slate-400 max-w-[180px]">
                  Write a message and set a passphrase to generate your secure QR code.
                </span>
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-600 dark:text-red-400 w-full flex items-start space-x-2 text-left animate-shake">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Download & Share Actions */}
          {qrDataUrl && !error && (
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={() => downloadQR('png')}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all duration-200 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => downloadQR('svg')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download SVG</span>
              </button>
              <button
                onClick={copyQRToClipboard}
                className="col-span-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer"
              >
                {copiedQR ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Copied Image to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy QR Image to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
