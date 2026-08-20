import React from 'react';
import { Unlock, Lock, Sparkles, Cpu } from 'lucide-react';

interface CryptoAnimationOverlayProps {
  type: 'encrypt' | 'decrypt';
  isActive: boolean;
  statusText?: string;
}

export const CryptoAnimationOverlay: React.FC<CryptoAnimationOverlayProps> = ({
  type,
  isActive,
  statusText,
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center space-y-4 p-6 border-2 border-indigo-500/40 animate-fade-in shadow-2xl overflow-hidden">
      {/* Laser Scanning Beam Line Animation */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse top-0 animate-laser-scan" />

      {/* Background Matrix Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

      {/* 3D Animated Icon Badge */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/40 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            {type === 'encrypt' ? (
              <Lock className="h-8 w-8 text-indigo-400 animate-pulse" />
            ) : (
              <Unlock className="h-8 w-8 text-cyan-400 animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Orbiting Tech Ring */}
        <div className="absolute -inset-3 border-2 border-dashed border-indigo-500/50 rounded-full animate-spin" style={{ animationDuration: '6s' }} />
      </div>

      {/* Status Text & Indicators */}
      <div className="text-center space-y-1.5 z-10">
        <div className="flex items-center justify-center space-x-2 text-indigo-400 dark:text-indigo-300 font-extrabold text-sm tracking-wide">
          <Cpu className="h-4 w-4 animate-spin text-cyan-400" />
          <span>{statusText || (type === 'encrypt' ? 'Deriving Keys & Encrypting...' : 'Scanning Stego/QR & Decrypting...')}</span>
        </div>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center space-x-1">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span>AES-256-GCM • Argon2id WASM</span>
        </p>
      </div>

      {/* Progress Line */}
      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 animate-pulse w-full" />
      </div>
    </div>
  );
};
