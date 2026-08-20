import React, { useState, useEffect, useRef } from 'react';
import { Shield, Scan, Upload, Key, Copy, AlertTriangle, Check, Trash2, Sparkles, Clock, RefreshCw, Flame } from 'lucide-react';
import { decryptMessage, unpackPayload, bytesToBase64 } from '../crypto/crypto';
import { decodeQRCodeFromImageData } from '../qr/qr';
import { decodeStegoFromImageData } from '../stego/stego';
import { Card3DTilt } from './Card3DTilt';
import { CryptoAnimationOverlay } from './CryptoAnimationOverlay';

export const DecryptScreen: React.FC = () => {
  // Navigation / Camera states
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  
  // Decoded payload states
  const [rawPayload, setRawPayload] = useState<Uint8Array | null>(null);
  const [payloadBase64, setPayloadBase64] = useState<string | null>(null);
  const [payloadMetadata, setPayloadMetadata] = useState<{
    mode: number;
    isPassphraseMode: boolean;
    isBurnAfterReading: boolean;
  } | null>(null);

  // Decryption inputs
  const [secretInput, setSecretInput] = useState('');
  
  // Status states
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  
  // Clipboard copy status
  const [copiedText, setCopiedText] = useState(false);
  
  // Timer States
  const [clearTimer, setClearTimer] = useState<number>(60); // 60 seconds default
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Burn Warnings
  const [showBurnWarning, setShowBurnWarning] = useState(false);

  // Drag and drop / file upload states
  const [isDragging, setIsDragging] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanAnimFrameRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop camera stream when component unmounts or active state changes
  useEffect(() => {
    return () => {
      stopCamera();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Countdown timer for clearing decrypted message
  useEffect(() => {
    if (timeLeft !== null) {
      if (timeLeft > 0) {
        countdownTimerRef.current = setTimeout(() => {
          setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        clearDecryptedResult();
      }
    }
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [timeLeft]);

  const startCamera = async () => {
    setCameraPermissionError(null);
    setIsScanning(true);
    setDecryptedText(null);
    setRawPayload(null);
    setPayloadMetadata(null);
    setDecryptionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraPermissionError("Camera access denied or unavailable. Please upload a QR code image below.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
      scanAnimFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Compute a SHA-256 hash of a string
  const getPayloadHash = async (dataStr: string): Promise<string> => {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataStr));
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const processDecodedPayload = async (payload: Uint8Array, b64Data: string) => {
    try {
      const unpacked = unpackPayload(payload);
      const isPassphraseMode = (unpacked.mode & 0x0F) === 0x01;
      const isBurnAfterReading = (unpacked.mode & 0x10) !== 0;

      setRawPayload(payload);
      setPayloadBase64(b64Data);
      setPayloadMetadata({
        mode: unpacked.mode,
        isPassphraseMode,
        isBurnAfterReading
      });

      // Reset decryption inputs
      setSecretInput('');
      setDecryptionError(null);
      setDecryptedText(null);

      // Check Burn-After-Reading Local Storage tracking
      if (isBurnAfterReading) {
        const payloadHash = await getPayloadHash(b64Data);
        const savedScans = localStorage.getItem('qrcrypt_scans');
        const scansList = savedScans ? JSON.parse(savedScans) : [];
        
        if (scansList.includes(payloadHash)) {
          setShowBurnWarning(true);
        } else {
          setShowBurnWarning(false);
        }
      } else {
        setShowBurnWarning(false);
      }
    } catch (e) {
      setDecryptionError("The scanned QR code is not a valid QRCrypt payload.");
    }
  };

  // Core frame scanner loop
  const scanFrame = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Decode QR code or Stego payload
      let decodedPayload = decodeQRCodeFromImageData(imgData.data, canvas.width, canvas.height);
      if (!decodedPayload) {
        decodedPayload = decodeStegoFromImageData(imgData.data);
      }
      
      if (decodedPayload) {
        // Success! Stop camera and load payload
        stopCamera();
        
        // Convert to base64 for tracking
        const b64Str = bytesToBase64(decodedPayload);
        processDecodedPayload(decodedPayload, b64Str);
        return;
      }
    }
    scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle image file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readQRFromFile(file);
    }
  };

  const readQRFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Try QR code decoding first, then fall back to Stego decoding
          let decoded = decodeQRCodeFromImageData(imgData.data, canvas.width, canvas.height);
          if (!decoded) {
            decoded = decodeStegoFromImageData(imgData.data);
          }

          if (decoded) {
            const b64 = bytesToBase64(decoded);
            processDecodedPayload(decoded, b64);
          } else {
            setDecryptionError("Could not find any readable QR code or hidden Stego payload in this image.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readQRFromFile(file);
    } else {
      setDecryptionError("Invalid file type. Please upload an image file (PNG/JPG).");
    }
  };

  // Execute decryption operation
  const handleDecrypt = async () => {
    if (!rawPayload || !secretInput) return;

    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      const plaintext = await decryptMessage(rawPayload, secretInput);
      setDecryptedText(plaintext);
      
      // Start secure auto-clear countdown
      setTimeLeft(clearTimer);

      // Record Burn-After-Reading Hash on first successful decryption
      if (payloadMetadata?.isBurnAfterReading && payloadBase64) {
        const payloadHash = await getPayloadHash(payloadBase64);
        const savedScans = localStorage.getItem('qrcrypt_scans');
        const scansList = savedScans ? JSON.parse(savedScans) : [];
        if (!scansList.includes(payloadHash)) {
          scansList.push(payloadHash);
          // Keep a max of 500 scans recorded to prevent local storage bloat
          if (scansList.length > 500) {
            scansList.shift();
          }
          localStorage.setItem('qrcrypt_scans', JSON.stringify(scansList));
        }
      }
    } catch (err: any) {
      setDecryptionError("Decryption failed. Invalid passphrase/key or tampered payload.");
      setDecryptedText(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const copyToClipboard = () => {
    if (!decryptedText) return;
    navigator.clipboard.writeText(decryptedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const clearDecryptedResult = () => {
    setDecryptedText(null);
    setTimeLeft(null);
    setSecretInput('');
    // Wipe sensitive references if desired
  };

  const resetScanner = () => {
    stopCamera();
    setRawPayload(null);
    setPayloadMetadata(null);
    setPayloadBase64(null);
    setDecryptedText(null);
    setDecryptionError(null);
    setTimeLeft(null);
    setShowBurnWarning(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in p-2">
      <Card3DTilt>
        <div className="glass-panel-3d rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
              <Scan className="h-5 w-5 text-indigo-500" />
              <span>Decrypt & Scan</span>
            </h2>
            {rawPayload && (
              <button
                onClick={resetScanner}
                className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center space-x-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Scan Another</span>
              </button>
            )}
          </div>

          {/* Phase 1: Camera Scanner & Upload Selection */}
          {!rawPayload && (
            <div className="space-y-6">
              {/* Live Camera Scanner Box */}
              {isScanning ? (
                <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-500/30 aspect-video bg-black max-w-[500px] mx-auto shadow-2xl">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  {/* Target overlay indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] border-2 border-indigo-500 rounded-3xl relative animate-pulse flex items-center justify-center shadow-lg shadow-indigo-500/40">
                      <div className="absolute inset-0 border border-white/20 rounded-3xl" />
                      <span className="text-[10px] text-white font-mono bg-black/70 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        ALIGN IMAGE OR QR CODE
                      </span>
                    </div>
                  </div>
                  {/* Stop Action */}
                  <button
                    onClick={stopCamera}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 py-2 px-5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-lg transition-all transform hover:scale-105"
                  >
                    Cancel Scan
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <button
                    onClick={startCamera}
                    className="py-3.5 px-7 btn-3d-primary rounded-2xl font-bold text-sm flex items-center space-x-2.5 cursor-pointer shadow-xl"
                  >
                    <Scan className="h-5 w-5" />
                    <span>Start Camera Scanner</span>
                  </button>
                  {cameraPermissionError && (
                    <p className="text-[10px] text-red-500 font-medium mt-2 text-center max-w-[280px]">
                      {cameraPermissionError}
                    </p>
                  )}
                </div>
              )}

              {/* Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-300/40 dark:border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider font-mono">OR</span>
                <div className="flex-grow border-t border-slate-300/40 dark:border-slate-800/80"></div>
              </div>

              {/* File Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/30'
                }`}
              >
                <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-3">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Drag and drop your QR Code or Stego Image
                </p>
                <p className="text-xs text-slate-400 mb-5 max-w-[320px]">
                  Supports PNG, JPG, or SVG files. Stego payloads are automatically detected!
                </p>
                <label className="py-2.5 px-5 btn-3d-secondary rounded-2xl text-xs font-bold cursor-pointer inline-flex items-center space-x-2">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Phase 2: Decrypted Payload Configuration Input */}
          {rawPayload && payloadMetadata && !decryptedText && (
            <div className="space-y-6 animate-slide-down max-w-[500px] mx-auto relative p-1 overflow-hidden">
              <CryptoAnimationOverlay type="decrypt" isActive={isDecrypting} statusText="Verifying AES-GCM Tag & Decrypting..." />
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-wider block">
                    Payload Detected & Loaded
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Mode: {payloadMetadata.isPassphraseMode ? 'Passphrase Protected' : 'Pre-Shared Key Protected'}
                  </span>
                </div>
                {payloadMetadata.isBurnAfterReading && (
                  <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center space-x-1 border border-orange-500/30">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Burn On Scan</span>
                  </span>
                )}
              </div>

              {showBurnWarning && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-700 dark:text-red-300 flex items-start space-x-3 shadow-sm">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-bold mb-1">⚠️ Burn Warning Detected!</p>
                    <p>
                      This payload has already been decrypted on this device in the past.
                      If this is a secure single-use "Burn after reading" message, it might have been read or intercepted.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {payloadMetadata.isPassphraseMode ? 'Decryption Passphrase' : 'AES Pre-Shared Key (Hex)'}
                </label>
                <div className="relative">
                  <input
                    type={payloadMetadata.isPassphraseMode ? "password" : "text"}
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder={payloadMetadata.isPassphraseMode ? "Enter passphrase..." : "Enter 64 hex characters..."}
                    className="w-full glass-input-3d rounded-2xl py-3 pl-11 pr-4 text-sm font-sans"
                  />
                  <Key className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetScanner}
                  className="py-3 px-4 btn-3d-secondary rounded-2xl text-xs font-bold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting || !secretInput}
                  className="py-3 px-4 btn-3d-primary disabled:opacity-50 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isDecrypting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Decrypting...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      <span>Decrypt Payload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {decryptionError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-600 dark:text-red-400 max-w-[500px] mx-auto flex items-start space-x-2 text-left animate-shake shadow-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{decryptionError}</span>
            </div>
          )}

          {/* Phase 3: Success state - Decrypted text output */}
          {decryptedText && (
            <div className="space-y-6 animate-slide-down border-t border-slate-200/50 dark:border-slate-800/50 pt-6 max-w-[500px] mx-auto">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-bold">Decrypted Plaintext Message</span>
                </div>
                
                {timeLeft !== null && (
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 font-bold bg-white/80 dark:bg-slate-900 px-2.5 py-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <Clock className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                    <span>{timeLeft}s</span>
                  </div>
                )}
              </div>

              <div className="relative border-2 border-slate-300/40 dark:border-slate-800/80 rounded-3xl p-5 bg-white/70 dark:bg-slate-950/60 shadow-xl min-h-[140px] max-h-[300px] overflow-y-auto font-sans text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap select-text break-words">
                {decryptedText}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Auto-clear timer:
                  </span>
                  <select
                    value={clearTimer}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setClearTimer(val);
                      if (timeLeft !== null) setTimeLeft(val);
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-xl text-xs p-1.5 font-bold text-slate-700 dark:text-slate-300 outline-none shadow-inner"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                    <option value={120}>2m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearDecryptedResult}
                    className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Wipe Now</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="py-2.5 px-5 btn-3d-primary rounded-xl text-xs font-bold flex items-center space-x-1.5"
                  >
                    {copiedText ? (
                      <>
                        <Check className="h-4 w-4 text-green-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card3DTilt>
      {/* Hidden canvas for video frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
