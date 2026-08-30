import React from 'react';
import { ShieldCheck, QrCode, ScanLine, Lock, ArrowRight, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: 'encrypt' | 'decrypt') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Header Section */}
      <div className="border-b border-slate-200/60 dark:border-[#3b4b37]/40 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Command Center
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-[#b9ccb2] mt-1 font-medium">
          Zero-knowledge client-side encryption & steganographic transformer.
        </p>
      </div>

      {/* Primary Action Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action 1: Encrypt Message */}
        <div
          onClick={() => onNavigate('encrypt')}
          className="group relative overflow-hidden rounded-2xl p-7 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[16px] border border-slate-200 dark:border-[#3b4b37] hover:border-[#00ff41] dark:hover:border-[#00ff41] transition-all duration-300 min-h-[220px] flex flex-col justify-between cursor-pointer shadow-md hover:shadow-2xl hover:shadow-[#00ff41]/15 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="p-3.5 rounded-2xl bg-[#00ff41]/15 text-black dark:text-[#00ff41] border border-[#00ff41]/30">
              <QrCode className="h-8 w-8 stroke-[2.5]" />
            </div>
            <ArrowRight className="h-6 w-6 text-slate-400 dark:text-[#3b4b37] group-hover:text-[#00ff41] group-hover:translate-x-1.5 transition-all" />
          </div>

          <div className="relative z-10 mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#00ff41] transition-colors">
              Encrypt Message
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#b9ccb2]">
              Transform plaintext, private photos, or video files up to 50MB into encrypted QR codes or lossless Stego PNG carriers.
            </p>
          </div>
        </div>

        {/* Action 2: Decrypt QR */}
        <div
          onClick={() => onNavigate('decrypt')}
          className="group relative overflow-hidden rounded-2xl p-7 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[16px] border border-slate-200 dark:border-[#3b4b37] hover:border-[#00daf3] dark:hover:border-[#00daf3] transition-all duration-300 min-h-[220px] flex flex-col justify-between cursor-pointer shadow-md hover:shadow-2xl hover:shadow-[#00daf3]/15 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00daf3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="p-3.5 rounded-2xl bg-[#00daf3]/15 text-cyan-800 dark:text-[#00daf3] border border-[#00daf3]/30">
              <ScanLine className="h-8 w-8 stroke-[2.5]" />
            </div>
            <ArrowRight className="h-6 w-6 text-slate-400 dark:text-[#3b4b37] group-hover:text-[#00daf3] group-hover:translate-x-1.5 transition-all" />
          </div>

          <div className="relative z-10 mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#00daf3] transition-colors">
              Decrypt QR & Carrier
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#b9ccb2]">
              Scan live with your camera or drop a QR / Stego image to extract, verify AEAD integrity, and play decrypted media in-browser.
            </p>
          </div>
        </div>
      </div>

      {/* Security Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Feature 1: Zero-Knowledge */}
        <div className="rounded-2xl p-6 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[12px] border border-slate-200 dark:border-[#3b4b37] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-slate-500 dark:text-[#b9ccb2] uppercase tracking-widest">
              Security Architecture
            </div>
            <div className="p-2 rounded-xl bg-[#00ff41]/10 text-[#00ff41]">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 dark:text-[#00ff41] font-mono tracking-tight">
              Zero-Knowledge
            </div>
            <p className="text-xs text-slate-500 dark:text-[#b9ccb2] mt-1">
              100% client-side execution. Passphrases, messages and media files never leave your device.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[#00ff41] font-mono text-xs font-semibold pt-2 border-t border-slate-100 dark:border-[#3b4b37]/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Air-Gapped Processing</span>
          </div>
        </div>

        {/* Feature 2: 50MB Capacity */}
        <div className="rounded-2xl p-6 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[12px] border border-slate-200 dark:border-[#3b4b37] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-slate-500 dark:text-[#b9ccb2] uppercase tracking-widest">
              Carrier Capacity
            </div>
            <div className="p-2 rounded-xl bg-[#00daf3]/10 text-[#00daf3]">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 dark:text-[#00daf3] font-mono tracking-tight">
              Up to 50 MB
            </div>
            <p className="text-xs text-slate-500 dark:text-[#b9ccb2] mt-1">
              Embed full photos, voice notes, or high-definition video files inside lossless Stego PNG images.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[#00daf3] font-mono text-xs font-semibold pt-2 border-t border-slate-100 dark:border-[#3b4b37]/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Lossless 3-Bit RGB LSB</span>
          </div>
        </div>
      </div>

      {/* Cryptographic Specifications */}
      <div className="rounded-2xl bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[12px] border border-slate-200 dark:border-[#3b4b37] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-[#3b4b37]/50 flex justify-between items-center bg-slate-50/50 dark:bg-[#201f20]/40">
          <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#00ff41]" />
            <span>Active Cryptosystem Specs</span>
          </h3>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#00daf3] bg-[#00daf3]/10 px-2.5 py-1 rounded-full border border-[#00daf3]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse"></span>
            <span>ACTIVE & VERIFIED</span>
          </div>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-[#3b4b37]/30 font-mono text-xs">
          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
              <Lock className="h-4 w-4 text-[#00ff41]" />
              <span className="text-slate-800 dark:text-[#e5e2e3] font-semibold">AES-256-GCM</span>
            </div>
            <div className="text-slate-500 dark:text-[#84967e] w-1/3 text-center text-[11px]">
              256-Bit Key + 128-Bit AEAD Tag
            </div>
            <div className="text-[#00ff41] font-bold w-1/3 text-right">
              Hardware Accelerated
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
              <Cpu className="h-4 w-4 text-[#00daf3]" />
              <span className="text-slate-800 dark:text-[#e5e2e3] font-semibold">Argon2id WASM</span>
            </div>
            <div className="text-slate-500 dark:text-[#84967e] w-1/3 text-center text-[11px]">
              Memory-Hard (16MB RAM / 2 Iter)
            </div>
            <div className="text-[#00daf3] font-bold w-1/3 text-right">
              GPU-Resistant
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-800 dark:text-[#e5e2e3] font-semibold">3-Bit Stego Engine</span>
            </div>
            <div className="text-slate-500 dark:text-[#84967e] w-1/3 text-center text-[11px]">
              Dynamic Auto-Scaling Carrier
            </div>
            <div className="text-emerald-400 font-bold w-1/3 text-right">
              50 MB Max
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
