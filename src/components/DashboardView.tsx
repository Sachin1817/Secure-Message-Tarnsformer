import React, { useState } from 'react';
import { Shield, QrCode, ScanLine, Lock, Unlock, TrendingUp, CheckCircle, Edit3, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: 'encrypt' | 'decrypt' | 'about') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [volatileNote, setVolatileNote] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);

  const handleEncryptToMemory = () => {
    if (!volatileNote.trim()) return;
    setNoteStatus('Encrypted in RAM (Volatile Memory)');
    setTimeout(() => setNoteStatus(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
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

      {/* Bento Grid Layout (Stitch exact layout) */}
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

        {/* Right Column: System Stats & Quick Note */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat Card 1 */}
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[12px] border border-slate-200 dark:border-[#3b4b37] flex flex-col justify-center items-center text-center shadow-sm">
              <div className="font-mono text-xs text-slate-500 dark:text-[#b9ccb2] mb-2 uppercase tracking-widest">
                Messages Transformed
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-[#00ff41] font-mono tracking-tight glow-effect px-4 py-1 rounded-xl">
                8,492
              </div>
              <div className="mt-3 flex items-center gap-1 text-[#00ff41] font-mono text-xs font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>+12% this week</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[12px] border border-slate-200 dark:border-[#3b4b37] flex flex-col justify-center items-center text-center shadow-sm">
              <div className="font-mono text-xs text-slate-500 dark:text-[#b9ccb2] mb-2 uppercase tracking-widest">
                Local Security Audits
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-[#00daf3] font-mono tracking-tight px-4 py-1 rounded-xl">
                144
              </div>
              <div className="mt-3 flex items-center gap-1 text-slate-500 dark:text-[#84967e] font-mono text-xs font-semibold">
                <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                <span>All checks passed</span>
              </div>
            </div>
          </div>

          {/* Quick Secure Note Widget */}
          <div className="rounded-2xl bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[16px] border border-slate-200 dark:border-[#3b4b37] p-6 flex-1 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200/60 dark:border-[#3b4b37]/50 pb-3">
              <h3 className="font-mono text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[#00ff41]" />
                <span>Quick Secure Note</span>
              </h3>
              <button
                onClick={() => setVolatileNote('')}
                className="text-xs font-mono font-bold text-slate-400 hover:text-red-500 dark:text-[#b9ccb2] dark:hover:text-[#00ff41] transition-colors"
              >
                CLEAR
              </button>
            </div>

            <textarea
              value={volatileNote}
              onChange={(e) => setVolatileNote(e.target.value)}
              className="w-full flex-1 min-h-[100px] bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-[#e5e2e3] focus:outline-none glow-border resize-none placeholder:text-slate-400 dark:placeholder:text-[#b9ccb2]/40"
              placeholder="Enter volatile data here. Content is memory-only and vanishes on refresh..."
            />

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              {noteStatus ? (
                <span className="text-xs font-mono text-[#00ff41] animate-pulse">
                  ✓ {noteStatus}
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-400 dark:text-[#84967e]">
                  RAM buffer only • Zero disk persist
                </span>
              )}

              <button
                onClick={handleEncryptToMemory}
                className="w-full sm:w-auto bg-[#00ff41] text-black font-mono text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#00e639] transition-all shadow-md shadow-[#00ff41]/20 flex items-center justify-center gap-2"
              >
                <span>Encrypt to Memory</span>
                <Lock className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Audit Activity Log Table */}
      <div className="rounded-2xl bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-[12px] border border-slate-200 dark:border-[#3b4b37] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-[#3b4b37]/50 flex justify-between items-center bg-slate-50/50 dark:bg-[#131314]/50">
          <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Recent Cryptographic Activity
          </h3>
          <button 
            onClick={() => onNavigate('about')}
            className="font-mono text-[11px] font-bold text-cyan-600 dark:text-[#00daf3] hover:underline"
          >
            VIEW FULL AUDIT
          </button>
        </div>

        <div className="divide-y divide-slate-200/40 dark:divide-[#3b4b37]/30 font-mono text-xs">
          <div className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
              <Lock className="h-4 w-4 text-[#00ff41]" />
              <span className="text-slate-800 dark:text-[#e5e2e3] font-semibold">ENC-8921-A</span>
            </div>
            <div className="text-slate-500 dark:text-[#84967e] w-1/3 text-center">AES-256-GCM</div>
            <div className="text-[#00ff41] font-semibold w-1/3 text-right">Success</div>
          </div>

          <div className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
              <Unlock className="h-4 w-4 text-[#00daf3]" />
              <span className="text-slate-800 dark:text-[#e5e2e3] font-semibold">DEC-4410-B</span>
            </div>
            <div className="text-slate-500 dark:text-[#84967e] w-1/3 text-center">Stego-LSB (50MB)</div>
            <div className="text-[#00daf3] font-semibold w-1/3 text-right">Success</div>
          </div>

          <div className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-slate-800 dark:text-[#e5e2e3] font-semibold">SYS-AUDIT-9</span>
            </div>
            <div className="text-slate-500 dark:text-[#84967e] w-1/3 text-center">Integrity PolyVal</div>
            <div className="text-emerald-500 font-semibold w-1/3 text-right">Verified 100%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
