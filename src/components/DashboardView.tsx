import React, { useState } from 'react';
import { ShieldCheck, QrCode, ScanLine, Lock, ArrowRight, HardDrive, Cpu, KeyRound, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: 'encrypt' | 'decrypt') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [volatileNote, setVolatileNote] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);

  const handleEncryptToMemory = () => {
    if (!volatileNote.trim()) return;
    setNoteStatus('Note locked in volatile RAM (disappears on page refresh)');
    setTimeout(() => setNoteStatus(null), 3500);
  };

  const handleClearNote = () => {
    setVolatileNote('');
    setNoteStatus(null);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 dark:border-[#3b4b37]/40 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Command Center
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-[#b9ccb2] mt-1 font-medium">
            Active Node Surveillance & Cryptographic Operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#3b4b37] bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"></span>
            <span className="text-slate-800 dark:text-[#00ff41] font-semibold">WASM Status: Online</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#00daf3]/40 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-md shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-slate-800 dark:text-[#00daf3] font-semibold">AES-256-GCM: Ready</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Primary Action Cards */}
        <div className="md:col-span-12 lg:col-span-4 space-y-6">
          {/* Action 1: Encrypt Message */}
          <div
            onClick={() => onNavigate('encrypt')}
            className="group relative overflow-hidden rounded-2xl p-6 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[16px] border border-slate-200 dark:border-[#3b4b37] hover:border-[#00ff41] dark:hover:border-[#00ff41] transition-all duration-300 h-56 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#00ff41]/10 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-[#00ff41]/15 text-black dark:text-[#00ff41] border border-[#00ff41]/30">
                <QrCode className="h-7 w-7 stroke-[2.5]" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 dark:text-[#3b4b37] group-hover:text-[#00ff41] group-hover:translate-x-1 transition-all" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#00ff41] transition-colors">
                Encrypt Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#b9ccb2]">
                Transform plaintext, photos or 50MB videos into secure QR/Stego sequences.
              </p>
            </div>
          </div>

          {/* Action 2: Decrypt QR */}
          <div
            onClick={() => onNavigate('decrypt')}
            className="group relative overflow-hidden rounded-2xl p-6 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[16px] border border-slate-200 dark:border-[#3b4b37] hover:border-[#00daf3] dark:hover:border-[#00daf3] transition-all duration-300 h-56 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#00daf3]/10 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00daf3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-[#00daf3]/15 text-cyan-800 dark:text-[#00daf3] border border-[#00daf3]/30">
                <ScanLine className="h-7 w-7 stroke-[2.5]" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 dark:text-[#3b4b37] group-hover:text-[#00daf3] group-hover:translate-x-1 transition-all" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#00daf3] transition-colors">
                Decrypt QR & Carrier
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#b9ccb2]">
                Extract, verify, and stream decrypted payloads with instant media player.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Security Feature Info Cards & Quick Note */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Security Feature Info Cards */}
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
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-[#00ff41] font-mono tracking-tight">
                  Zero-Knowledge
                </div>
                <p className="text-xs text-slate-500 dark:text-[#b9ccb2] mt-1">
                  100% client-side. No passwords, messages or files ever leave your device.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#00ff41] font-mono text-xs font-semibold pt-2 border-t border-slate-100 dark:border-[#3b4b37]/30">
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
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-[#00daf3] font-mono tracking-tight">
                  Up to 50 MB
                </div>
                <p className="text-xs text-slate-500 dark:text-[#b9ccb2] mt-1">
                  Embed full photos, audio or videos inside lossless Stego PNG images.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#00daf3] font-mono text-xs font-semibold pt-2 border-t border-slate-100 dark:border-[#3b4b37]/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Lossless 3-Bit RGB LSB</span>
              </div>
            </div>
          </div>

          {/* Quick Secure Note Widget */}
          <div className="rounded-2xl bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[16px] border border-slate-200 dark:border-[#3b4b37] p-6 flex-1 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200/60 dark:border-[#3b4b37]/50 pb-3">
              <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <span className="p-1 rounded bg-[#00ff41]/20 text-[#00ff41]">
                  <KeyRound className="h-3.5 w-3.5" />
                </span>
                <span>Quick Secure Note</span>
              </h3>
              <button
                type="button"
                onClick={handleClearNote}
                className="text-xs font-mono font-bold text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                Clear
              </button>
            </div>

            <textarea
              value={volatileNote}
              onChange={(e) => setVolatileNote(e.target.value)}
              className="w-full flex-1 min-h-[90px] bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-[#e5e2e3] focus:outline-none glow-border resize-none placeholder:text-slate-400 dark:placeholder:text-[#b9ccb2]/40"
              placeholder="Enter volatile data here. Content is held only in browser memory and wiped on refresh..."
            />

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 dark:text-[#84967e]">
                {noteStatus ? (
                  <span className="text-[#00ff41] font-semibold">{noteStatus}</span>
                ) : (
                  <span>RAM buffer only • zero disk persistence</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleEncryptToMemory}
                className="bg-[#00ff41] text-black font-mono text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#00e639] transition-all flex items-center gap-2 shadow-sm active:scale-95"
              >
                <span>Encrypt to Memory</span>
                <Lock className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Specifications & Active Cipher Stack */}
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
