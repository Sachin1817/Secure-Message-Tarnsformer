import React from 'react';
import { Shield, Key, Trash2, CheckCircle2, Cpu, Lock, Video, Image as ImageIcon } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-2">
      {/* Introduction Banner */}
      <div className="glass-panel-3d rounded-3xl p-6 md:p-8 space-y-4 border-l-4 border-[#00ff41]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#00ff41]/15 p-3 rounded-2xl text-emerald-800 dark:text-[#00ff41] border border-[#00ff41]/30">
              <Shield className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                QRCrypt Security Audit & Architecture
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-[#b9ccb2]">
                Verified Zero-Knowledge Client-Side Cryptosystem
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#00ff41]/10 text-emerald-700 dark:text-[#00ff41] border border-[#00ff41]/30 font-mono text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Audit: Passed</span>
          </div>
        </div>

        <p className="text-slate-600 dark:text-[#e5e2e3] leading-relaxed font-medium">
          QRCrypt operates on a strict <strong>zero-knowledge architecture</strong>. All encryption, key derivation, 
          steganographic pixel transformations, and QR decoding occur purely in your browser memory. 
          Plaintext data, media files, and secret keys are never transmitted to any cloud server or API.
        </p>
      </div>

      {/* Real-time Crypto Specs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel-3d rounded-2xl p-4 border border-slate-200 dark:border-[#3b4b37]">
          <div className="text-[11px] text-slate-500 dark:text-[#b9ccb2] uppercase tracking-wider">Cipher Protocol</div>
          <div className="text-lg font-black text-slate-800 dark:text-[#00ff41] mt-1">AES-256-GCM</div>
          <div className="text-[10px] text-emerald-600 dark:text-[#00ff41]/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Authenticated AEAD
          </div>
        </div>

        <div className="glass-panel-3d rounded-2xl p-4 border border-slate-200 dark:border-[#3b4b37]">
          <div className="text-[11px] text-slate-500 dark:text-[#b9ccb2] uppercase tracking-wider">Key Derivation</div>
          <div className="text-lg font-black text-slate-800 dark:text-[#00daf3] mt-1">Argon2id WASM</div>
          <div className="text-[10px] text-cyan-600 dark:text-[#00daf3]/80 mt-1 flex items-center gap-1">
            <Cpu className="h-3 w-3" /> Memory Hardened
          </div>
        </div>

        <div className="glass-panel-3d rounded-2xl p-4 border border-slate-200 dark:border-[#3b4b37]">
          <div className="text-[11px] text-slate-500 dark:text-[#b9ccb2] uppercase tracking-wider">Stego Engine</div>
          <div className="text-lg font-black text-slate-800 dark:text-white mt-1">3-Bit RGB LSB</div>
          <div className="text-[10px] text-slate-500 dark:text-[#b9ccb2] mt-1 flex items-center gap-1">
            <Video className="h-3 w-3" /> Up to 50 MB Video/Photo
          </div>
        </div>

        <div className="glass-panel-3d rounded-2xl p-4 border border-slate-200 dark:border-[#3b4b37]">
          <div className="text-[11px] text-slate-500 dark:text-[#b9ccb2] uppercase tracking-wider">Integrity Check</div>
          <div className="text-lg font-black text-slate-800 dark:text-emerald-400 mt-1">128-Bit PolyVal</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Tamper Detection
          </div>
        </div>
      </div>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symmetric Encryption */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3 border-t-2 border-[#00ff41]/50">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-[#00ff41]">
            <Shield className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">AES-256-GCM Authenticated Encryption</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#b9ccb2] leading-relaxed">
            All messages, photos, and videos are encrypted using <strong>AES-256-GCM</strong>. GCM provides both confidentiality and <strong>authenticated integrity</strong> with a 128-bit authentication tag. If even a single bit in the carrier or QR code is tampered with, decryption fails cleanly instead of yielding corrupted plaintext.
          </p>
        </div>

        {/* Key Derivation */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3 border-t-2 border-[#00daf3]/50">
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-[#00daf3]">
            <Key className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">Argon2id Memory-Hard KDF</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#b9ccb2] leading-relaxed">
            When you enter a passphrase, we derive a 256-bit key using <strong>Argon2id WASM</strong> (preferred) or <strong>PBKDF2-SHA256 with 600,000 iterations</strong>. This makes GPU and ASIC brute-force password cracking attacks computationally infeasible.
          </p>
        </div>

        {/* Steganography */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3 border-t-2 border-emerald-500/50">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <ImageIcon className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">High-Capacity Steganography (50 MB)</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#b9ccb2] leading-relaxed">
            Conceals entire video files or photos directly inside the least significant bits (LSB) of PNG carrier pixels. Changes are mathematically imperceptible to the human eye, with zero loss in carrier quality.
          </p>
        </div>

        {/* Burn after reading */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3 border-t-2 border-amber-500/50">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
            <Trash2 className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">Best-Effort Burn-After-Reading</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#b9ccb2] leading-relaxed">
            The optional <strong>"Burn after reading"</strong> flag encodes a specific instruction in the payload.
            The app records scanned payloads' cryptographic hashes locally using memory and `localStorage` to warn if opened more than once.
          </p>
        </div>
      </div>

      {/* Security Model Limitations */}
      <div className="glass-panel-3d rounded-3xl p-6 md:p-8 border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20 space-y-3">
        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center space-x-2">
          <span>⚠️ Important Security Limitations</span>
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Passphrase Distribution:</strong> Share the passphrase or pre-shared key through a separate, secure communication channel (e.g., in person or via signal).
          </li>
          <li>
            <strong>No Forward Secrecy:</strong> If an attacker steals your passphrase and intercepts the QR/stego image, they can decrypt the message. Use unique passphrases.
          </li>
          <li>
            <strong>Single-Use Limits:</strong> Without a central database, true server-enforced "burn after reading" is impossible.
          </li>
        </ul>
      </div>
    </div>
  );
};
