import React, { useState, useEffect, useRef } from 'react';
import { Shield, Scan, Upload, Key, Copy, AlertTriangle, Check, Trash2, RefreshCw, Download, Lock } from 'lucide-react';
import { decryptBinary, unpackPayload, type DecryptedResult } from '../crypto/crypto';
import { decodeQRCodeFromImageData } from '../qr/qr';
import { decodeStegoFromImageData } from '../stego/stego';

export const DecryptScreen: React.FC = () => {
  // Navigation / Camera states
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  
  // Decoded payload states
  const [rawPayload, setRawPayload] = useState<Uint8Array | null>(null);
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
  const [decryptedResult, setDecryptedResult] = useState<DecryptedResult | null>(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  
  // Clipboard copy status
  const [copiedText, setCopiedText] = useState(false);
  
  // Timer States
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
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
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
    clearDecryptedResult();
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
      console.error("Camera access error:", err);
      setCameraPermissionError("Unable to access camera. Please check permissions or upload an image instead.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
      scanAnimFrameRef.current = null;
    }
    setIsScanning(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const qrResult = decodeQRCodeFromImageData(imageData.data, imageData.width, imageData.height);
    if (qrResult) {
      stopCamera();
      processPayload(qrResult);
      return;
    }

    const stegoResult = decodeStegoFromImageData(imageData.data);
    if (stegoResult) {
      stopCamera();
      processPayload(stegoResult);
      return;
    }

    scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    clearDecryptedResult();
    setDecryptionError(null);
    setRawPayload(null);
    setPayloadMetadata(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setDecryptionError("Failed to process image canvas.");
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const qrResult = decodeQRCodeFromImageData(imageData.data, imageData.width, imageData.height);
        if (qrResult) {
          processPayload(qrResult);
          return;
        }

        const stegoResult = decodeStegoFromImageData(imageData.data);
        if (stegoResult) {
          processPayload(stegoResult);
          return;
        }

        setDecryptionError("No valid encrypted QR Code or Stego payload found in image.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processPayload = (bytes: Uint8Array) => {
    try {
      const unpacked = unpackPayload(bytes);
      const isPassphrase = (unpacked.mode & 0x0F) === 0x01;
      const isBurn = (unpacked.mode & 0x10) !== 0;

      setRawPayload(bytes);
      setPayloadMetadata({
        mode: unpacked.mode,
        isPassphraseMode: isPassphrase,
        isBurnAfterReading: isBurn
      });

      if (isBurn) {
        const hashStr = Array.from(bytes.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('');
        const seen = localStorage.getItem(`qrcrypt_seen_${hashStr}`);
        if (seen) {
          setShowBurnWarning(true);
        } else {
          localStorage.setItem(`qrcrypt_seen_${hashStr}`, Date.now().toString());
        }
      }
    } catch (err: any) {
      setDecryptionError("Failed to unpack payload metadata: " + err.message);
    }
  };

  const handleDecrypt = async () => {
    if (!rawPayload || !secretInput) return;

    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      const result = await decryptBinary(rawPayload, secretInput);
      setDecryptedResult(result);

      if (result.type === 'image' || result.type === 'video' || result.type === 'file') {
        if (mediaBlobUrl) {
          URL.revokeObjectURL(mediaBlobUrl);
        }
        const blob = new Blob([result.data as any], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        setMediaBlobUrl(url);
      }

      if (clearTimer > 0) {
        setTimeLeft(clearTimer);
      }
    } catch (err: any) {
      setDecryptionError(err.message || "Decryption failed. Please check the secret or passphrase.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const clearDecryptedResult = () => {
    setDecryptedResult(null);
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl);
      setMediaBlobUrl(null);
    }
    setTimeLeft(null);
    setSecretInput('');
  };

  const resetScanner = () => {
    stopCamera();
    setRawPayload(null);
    setPayloadMetadata(null);
    clearDecryptedResult();
    setDecryptionError(null);
    setTimeLeft(null);
    setShowBurnWarning(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative z-10 space-y-6">
      {/* Header section matching exact mobile stitch screenshot */}
      <div className="flex justify-between items-start md:items-center border-b border-slate-200/60 dark:border-[#3b4b37]/40 pb-4">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-black text-[#00ff41] tracking-tight">
            Scanner Operations
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#b9ccb2] font-mono uppercase tracking-widest mt-1">
            {rawPayload ? 'ENCRYPTED PAYLOAD DETECTED' : 'AWAITING ENCRYPTED PAYLOAD...'}
          </p>
        </div>

        {rawPayload && (
          <button
            onClick={resetScanner}
            className="font-mono text-xs text-[#00daf3] hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#3b4b37] bg-white/70 dark:bg-[#1c1b1c]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Scan Another</span>
          </button>
        )}
      </div>

      {/* Main Scanner & Decrypt Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Source (Camera or Dropzone) */}
        <div className={`${rawPayload ? 'lg:col-span-5' : 'lg:col-span-12'} transition-all duration-300`}>
          <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden">
            {!rawPayload ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Live Camera Scanner Box */}
                {isScanning ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#00daf3]/50 aspect-video bg-black max-w-[500px] mx-auto shadow-2xl">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] border-2 border-[#00daf3] rounded-2xl relative animate-pulse flex items-center justify-center shadow-lg shadow-[#00daf3]/30">
                        {/* Corner brackets */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />
                        <div className="scanner-line"></div>
                        <span className="text-[10px] text-white font-mono bg-black/80 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-[#00daf3]/40">
                          ALIGN QR / STEGO
                        </span>
                      </div>
                    </div>

                    {/* CAM_ACTV_01 pill */}
                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-[#131314]/90 px-3 py-1 rounded-full border border-[#3b4b37]/70 font-mono text-[10px] text-[#00ff41]">
                      <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"></span>
                      <span>CAM_ACTV_01</span>
                    </div>

                    <button
                      onClick={stopCamera}
                      className="absolute bottom-3 right-3 py-1 px-3 bg-red-600/80 hover:bg-red-600 text-white rounded-full text-[10px] font-mono font-bold shadow-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2">
                    <button
                      onClick={startCamera}
                      className="py-3 px-6 bg-[#00daf3] text-black font-mono font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00daf3]/20 hover:bg-[#00e3fd] transition-all"
                    >
                      <Scan className="h-4 w-4 stroke-[2.5]" />
                      <span>Start Camera Scanner</span>
                    </button>
                    {cameraPermissionError && (
                      <p className="text-[10px] font-mono text-red-500 mt-2 text-center">
                        {cameraPermissionError}
                      </p>
                    )}
                  </div>
                )}

                {/* File Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
                    isDragging
                      ? 'border-[#00daf3] bg-[#00daf3]/10'
                      : 'border-slate-200 dark:border-[#3b4b37] hover:border-[#00daf3] bg-slate-50/50 dark:bg-[#131314]/50'
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-[#00daf3]/15 text-[#00daf3] mb-2">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white font-mono mb-0.5">
                    Drag & Drop QR Image
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 dark:text-[#84967e] mb-3">
                    or click to browse local files
                  </p>
                  <label className="py-1.5 px-4 bg-slate-200 dark:bg-[#2a2a2b] hover:bg-slate-300 dark:hover:bg-[#353436] rounded-xl text-xs font-mono font-bold cursor-pointer inline-flex items-center gap-2 text-slate-800 dark:text-[#e5e2e3] transition-all">
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
            ) : (
              /* DECRYPTION REQUIRED card (Stitch exact layout) */
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#00daf3]">
                  <Lock className="h-5 w-5 stroke-[2.5]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    Decryption Required
                  </h2>
                </div>
                <p className="text-slate-500 dark:text-[#b9ccb2] text-xs">
                  {payloadMetadata?.isPassphraseMode ? 'Passphrase-protected payload detected.' : 'Pre-shared key payload detected.'}
                </p>

                {showBurnWarning && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] flex items-center gap-2 font-mono">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>Single-use payload was already read previously.</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <input
                    type="password"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="Enter passphrase..."
                    className="w-full bg-slate-50 dark:bg-[#0e0e0f] border border-slate-200 dark:border-[#3b4b37]/60 rounded-xl p-3 text-xs text-slate-800 dark:text-[#e5e2e3] focus:outline-none glow-border font-mono"
                  />
                </div>

                {decryptionError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{decryptionError}</span>
                  </div>
                )}

                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting || !secretInput}
                  className="w-full py-3 border border-[#00daf3] text-[#00daf3] hover:bg-[#00daf3] hover:text-black font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Key className="h-4 w-4 stroke-[2.5]" />
                  <span>{isDecrypting ? 'Decrypting...' : 'Initialize Decryption'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Decrypted Result Terminal / Player (when payload exists) */}
        {rawPayload && (
          <div className="lg:col-span-7">
            <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl p-6 shadow-lg h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-[#3b4b37]/50 pb-3 mb-4">
                  <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#00ff41]" />
                    <span>Decrypted Payload Output</span>
                  </h3>
                  {decryptedResult && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/30">
                      {decryptedResult.type.toUpperCase()}
                    </span>
                  )}
                </div>

                {decryptedResult ? (
                  <div className="space-y-4">
                    {/* Text result */}
                    {decryptedResult.type === 'text' && (
                      <div className="bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-800 dark:text-[#00ff41] whitespace-pre-wrap select-all min-h-[160px]">
                        {decryptedResult.text}
                      </div>
                    )}

                    {/* Image result */}
                    {decryptedResult.type === 'image' && mediaBlobUrl && (
                      <div className="flex flex-col items-center justify-center p-3 bg-black/10 dark:bg-[#131314] rounded-xl border border-slate-200 dark:border-[#3b4b37]/50">
                        <img src={mediaBlobUrl} alt="Decrypted file" className="max-h-64 object-contain rounded-lg shadow-md" />
                      </div>
                    )}

                    {/* Video result */}
                    {decryptedResult.type === 'video' && mediaBlobUrl && (
                      <div className="rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-[#3b4b37]/50">
                        <video src={mediaBlobUrl} controls className="w-full max-h-72 object-contain" />
                      </div>
                    )}

                    {/* Generic file */}
                    {decryptedResult.type === 'file' && (
                      <div className="p-4 bg-slate-50 dark:bg-[#131314] rounded-xl font-mono text-xs text-slate-700 dark:text-[#e5e2e3]">
                        <p className="font-bold">{decryptedResult.filename || 'Encrypted Binary File'}</p>
                        <p className="text-slate-400 text-[11px] mt-1">{decryptedResult.mimeType || 'application/octet-stream'}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-[#84967e] font-mono text-xs">
                    <Lock className="h-10 w-10 text-slate-400 dark:text-[#3b4b37] mb-2" />
                    <span>Enter your passphrase or hex key on the left to reveal content</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {decryptedResult && (
                <div className="pt-4 border-t border-slate-200/60 dark:border-[#3b4b37]/40 flex flex-wrap gap-2 mt-4 font-mono text-xs">
                  {decryptedResult.type === 'text' && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(decryptedResult.text || '');
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="flex-1 py-2.5 px-4 bg-[#00ff41] text-black font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#00e639]"
                    >
                      {copiedText ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  )}

                  {mediaBlobUrl && (
                    <a
                      href={mediaBlobUrl}
                      download={decryptedResult.filename || (decryptedResult.type === 'image' ? 'decrypted-photo.png' : 'decrypted-video.mp4')}
                      className="flex-1 py-2.5 px-4 bg-[#00daf3] text-black font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#00e3fd]"
                    >
                      <Download className="h-4 w-4 stroke-[2.5]" />
                      <span>Download {decryptedResult.type === 'image' ? 'Image' : 'Video'}</span>
                    </a>
                  )}

                  <button
                    onClick={clearDecryptedResult}
                    className="py-2.5 px-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Wipe</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
