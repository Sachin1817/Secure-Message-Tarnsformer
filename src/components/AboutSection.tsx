import React, { useState } from 'react';
import { ListFilter, Download, Sliders, MemoryStick, Check, Shield } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  cipher: string;
  hash: string;
  status: 'Purged' | 'Active';
}

export const AboutSection: React.FC = () => {
  const [autoWipeTimer, setAutoWipeTimer] = useState(120);
  const [kdfRounds, setKdfRounds] = useState(600000);
  const [wasmFallback, setWasmFallback] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const [auditLogs] = useState<AuditEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString().replace('T', ' ').substring(0, 19),
      action: 'ENCRYPT',
      cipher: 'AES-GCM',
      hash: 'a7f8b9c0d1e2f3a4b5c6d7e8...',
      status: 'Purged'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString().replace('T', ' ').substring(0, 19),
      action: 'DECRYPT',
      cipher: 'ChaCha20',
      hash: 'e5d4c3b2a1f0987654321fed...',
      status: 'Purged'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString().replace('T', ' ').substring(0, 19),
      action: 'KEYGEN',
      cipher: 'Argon2id',
      hash: '1234567890abcdef12345678...',
      status: 'Active'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString().replace('T', ' ').substring(0, 19),
      action: 'ENCRYPT',
      cipher: 'AES-GCM',
      hash: '9876543210fedcba98765432...',
      status: 'Purged'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString().replace('T', ' ').substring(0, 19),
      action: 'AUDIT',
      cipher: 'SHA-256',
      hash: '4a6b8c0e2f4a6b8c0e2f4a6b...',
      status: 'Active'
    }
  ]);

  const handleApplyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const exportAuditLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `qrcrypt-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
      {/* Header section */}
      <div className="border-b border-slate-200/60 dark:border-[#3b4b37]/40 pb-4">
        <h1 className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-[#e5e2e3] tracking-tight">
          Security Audit Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#b9ccb2] font-mono mt-1">
          Review local cryptographic history and adjust node security parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Local History Table (Bento Grid) */}
        <div className="lg:col-span-8 bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl flex flex-col overflow-hidden shadow-lg h-[580px]">
          <div className="p-4 border-b border-slate-200 dark:border-[#3b4b37]/50 flex justify-between items-center bg-slate-50 dark:bg-[#201f20]/60">
            <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Shield className="h-4 w-4 text-[#00ff41]" />
              <span>Local History</span>
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-[#353436] text-slate-600 dark:text-[#b9ccb2] transition-colors"
                title="Filter Records"
              >
                <ListFilter className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={exportAuditLog}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-[#353436] text-slate-600 dark:text-[#b9ccb2] transition-colors"
                title="Download JSON Export"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="sticky top-0 bg-slate-100 dark:bg-[#131314] z-10 border-b border-slate-200 dark:border-[#3b4b37]/50 text-slate-500 dark:text-[#84967e] text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Hash (SHA-256)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#3b4b37]/30 text-slate-700 dark:text-[#e5e2e3]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#bcc7de] text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={log.action === 'ENCRYPT' ? 'text-[#00daf3] font-bold' : log.action === 'DECRYPT' ? 'text-[#00ff41] font-bold' : 'text-slate-400 font-bold'}>
                        {log.action}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">({log.cipher})</span>
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-[150px] text-[11px] opacity-70">
                      {log.hash}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {log.status === 'Active' ? (
                        <div className="inline-flex items-center gap-1.5 border border-[#00ff41]/40 rounded-full px-2.5 py-0.5 bg-[#00ff41]/10 text-[#00ff41] text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] shadow-[0_0_6px_#00ff41]"></span>
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 rounded-full px-2.5 py-0.5 text-red-500 dark:text-[#ffb4ab] text-[10px] font-bold bg-red-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
                          <span>Purged</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Node Parameters & Runtime Environment */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Node Parameters Panel */}
          <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl p-5 shadow-lg">
            <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-[#3b4b37]/50 pb-2">
              <Sliders className="h-4 w-4 text-[#00daf3]" />
              <span>Node Parameters</span>
            </h3>

            <form onSubmit={handleApplyConfig} className="flex flex-col gap-4 font-mono text-xs">
              {/* Auto-Wipe Timer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 dark:text-[#b9ccb2] flex justify-between font-bold">
                  <span>Auto-Wipe Timer</span>
                  <span className="text-[#00ff41]">{formatTimer(autoWipeTimer)}</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={autoWipeTimer}
                  onChange={(e) => setAutoWipeTimer(Number(e.target.value))}
                  className="w-full accent-[#00ff41] bg-slate-200 dark:bg-[#353436] rounded-full h-2 appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>30s</span>
                  <span>5m</span>
                </div>
              </div>

              {/* KDF Iterations */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 dark:text-[#b9ccb2] font-bold">
                  KDF Iterations (PBKDF2)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={kdfRounds}
                    onChange={(e) => setKdfRounds(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#3b4b37]/50 rounded-xl py-2 px-3 text-[#00ff41] font-bold focus:outline-none glow-border"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-[10px]">rounds</span>
                </div>
              </div>

              {/* WASM Fallback */}
              <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-[#3b4b37]/40">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-white">WASM Fallback</span>
                  <span className="text-[10px] text-slate-400">Use JS if WebAssembly fails</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWasmFallback(!wasmFallback)}
                  className={`w-10 h-5 rounded-full border relative transition-colors ${
                    wasmFallback ? 'bg-[#00ff41]/20 border-[#00ff41]/50' : 'bg-slate-200 dark:bg-slate-800 border-slate-400'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-3 h-3 rounded-full transition-all ${
                      wasmFallback ? 'right-1 bg-[#00ff41] shadow-[0_0_5px_#00e639]' : 'left-1 bg-slate-400'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-[#00ff41] text-black hover:bg-[#00e639] transition-all py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-[#00ff41]/20 active:scale-[0.98]"
              >
                {isSaved ? <Check className="h-4 w-4 stroke-[3]" /> : null}
                <span>{isSaved ? 'Configuration Applied' : 'Apply Configuration'}</span>
              </button>
            </form>
          </div>

          {/* System Status Card */}
          <div className="bg-white/70 dark:bg-[#1c1b1c]/80 backdrop-blur-lg border border-slate-200 dark:border-[#3b4b37] rounded-2xl p-5 shadow-lg flex-grow font-mono text-xs">
            <h3 className="text-slate-500 dark:text-[#b9ccb2] font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-[#00daf3]" />
              <span>Runtime Environment</span>
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 dark:border-[#3b4b37]/30 pb-2">
                <span className="text-slate-500 dark:text-[#b9ccb2]">Crypto Engine</span>
                <span className="text-[#00ff41] font-bold">WebCrypto API v1.2</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-[#3b4b37]/30 pb-2">
                <span className="text-slate-500 dark:text-[#b9ccb2]">Memory Wipe</span>
                <span className="text-[#00daf3] font-bold">Zero-fill Active</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 dark:text-[#b9ccb2]">Network</span>
                <span className="text-red-400 font-bold">Air-gapped (Offline)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
