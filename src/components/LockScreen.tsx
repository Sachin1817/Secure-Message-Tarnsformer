import React from 'react';
import { Shield, Lock, LogIn, Video, Image as ImageIcon, QrCode, Sparkles, Cpu, EyeOff, Sun, Moon } from 'lucide-react';
import { Card3DTilt } from './Card3DTilt';

interface LockScreenProps {
  onOpenAuth: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onOpenAuth, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between relative z-10">
      {/* Top Navigation */}
      <header className="w-full glass-panel-3d px-4 py-3.5 md:px-8 border-b border-slate-200/60 dark:border-[#3b4b37]/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#00ff41] to-[#00aa28] text-black shadow-lg shadow-[#00ff41]/20 border-t border-white/40">
              <Shield className="h-6 w-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-[#00ff41] font-sans">
                  QRCrypt
                </h1>
                <span className="text-[9px] font-black uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-md bg-[#00ff41]/10 text-emerald-700 dark:text-[#00ff41] border border-[#00ff41]/30">
                  STITCH NODE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#b9ccb2] font-mono tracking-wider">
                MILITARY-GRADE CLIENT CRYPTO
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl btn-3d-secondary flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-indigo-600" />
              )}
            </button>

            <button
              onClick={onOpenAuth}
              className="py-2.5 px-5 btn-3d-primary rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Lock Screen Hero */}
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center space-y-12 flex-grow flex flex-col justify-center">
        {/* Lock Hero Emblem */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#00ff41]/10 dark:bg-[#00ff41]/15 border border-[#00ff41]/30 text-emerald-700 dark:text-[#00ff41] text-xs font-semibold animate-pulse font-mono">
            <Lock className="h-3.5 w-3.5" />
            <span>Authentication Required to Access Command Center</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Next-Gen Encryption for{' '}
            <span className="bg-gradient-to-r from-[#00ff41] via-[#00daf3] to-emerald-400 bg-clip-text text-transparent">
              Text, Images & Videos
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Protect your sensitive data with client-side <strong>AES-256-GCM</strong> and <strong>Argon2id WASM</strong>. 
            Conceal messages, confidential images, and full videos up to <strong>50MB</strong> directly inside QR codes or invisible Stego PNG images.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-3.5 px-8 btn-3d-primary rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center space-x-3 cursor-pointer shadow-xl shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all font-mono"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In with Google / Email</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1: Video & Image Stego */}
          <Card3DTilt>
            <div className="glass-panel-3d rounded-3xl p-6 h-full flex flex-col justify-between border-t-2 border-[#00ff41]/50">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00ff41] to-emerald-700 text-black flex items-center justify-center shadow-md">
                  <Video className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Video & Image Steganography
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00ff41]/20 text-[#00ff41] font-bold">
                    50 MB
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Conceal entire high-definition videos (MP4, WebM) or photos invisibly inside innocent-looking PNG cover photos via 3-bit RGB LSB manipulation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-[#3b4b37]/50 flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-[#00ff41] font-semibold font-mono">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Lossless In-Browser Embedding</span>
              </div>
            </div>
          </Card3DTilt>

          {/* Card 2: Encrypted QR Code */}
          <Card3DTilt>
            <div className="glass-panel-3d rounded-3xl p-6 h-full flex flex-col justify-between border-t-2 border-[#00daf3]/50">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00daf3] to-cyan-700 text-black flex items-center justify-center shadow-md">
                  <QrCode className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  AES-256 Encrypted QR Codes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generate scan-ready military-grade encrypted QR codes. Scan in real-time with camera or upload directly to decrypt securely.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-[#3b4b37]/50 flex items-center space-x-2 text-[11px] text-cyan-600 dark:text-[#00daf3] font-semibold font-mono">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Burn After Reading Support</span>
              </div>
            </div>
          </Card3DTilt>

          {/* Card 3: 100% Local Zero-Knowledge */}
          <Card3DTilt>
            <div className="glass-panel-3d rounded-3xl p-6 h-full flex flex-col justify-between border-t-2 border-emerald-500/40">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-black flex items-center justify-center shadow-md">
                  <EyeOff className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  100% Zero-Knowledge Privacy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your raw messages, photos, videos, and passphrases never touch a server. All AES operations are handled purely in your browser's WebCrypto engine.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-[#3b4b37]/50 flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                <Cpu className="h-3.5 w-3.5" />
                <span>Argon2id WASM Hardware Hardening</span>
              </div>
            </div>
          </Card3DTilt>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 dark:border-[#3b4b37]/40 py-6 px-4 md:px-8 bg-white/40 dark:bg-[#131314]/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          <div className="flex items-center space-x-2 font-medium">
            <Lock className="h-4 w-4 text-[#00ff41]" />
            <span>QRCrypt — Client-side Zero-Knowledge Web App</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-[#1c1b1c] border border-slate-300/40 dark:border-[#3b4b37] text-[#00ff41]">
              AES-256-GCM
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-[#1c1b1c] border border-slate-300/40 dark:border-[#3b4b37] text-[#00daf3]">
              Video & Image LSB (50MB)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
