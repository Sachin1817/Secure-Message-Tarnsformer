import React from 'react';
import { Shield, Key, EyeOff, Trash2, HelpCircle, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-2">
      {/* Introduction */}
      <div className="glass-panel-3d rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            About QRCrypt
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          QRCrypt is a client-side secure messaging tool that encrypts text messages into scannable <strong>QR codes</strong> or <strong>steganographic images</strong>.
          Choose between traditional QR codes or hide your encrypted message invisibly inside a photo using LSB Steganography.
          The entire flow works <strong>fully offline and client-side</strong>. No server ever sees your messages, passwords, or keys.
        </p>
      </div>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symmetric Encryption */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Shield className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">AES-256-GCM Encryption</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All messages are encrypted using <strong>AES-256-GCM</strong>, the gold standard for symmetric encryption. 
            GCM provides both confidentiality and <strong>authenticated integrity</strong>.
            If even a single bit is tampered with, decryption fails cleanly instead of yielding corrupted plaintext.
          </p>
        </div>

        {/* Key Derivation */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Key className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">Robust Key Derivation</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            When you use a passphrase, we derive a cryptographically strong 256-bit key using <strong>Argon2id WASM</strong> (preferred) or <strong>PBKDF2-SHA256 with 600,000 iterations</strong> (fallback).
            This makes brute-force attacks on the passphrase extremely resource-intensive.
          </p>
        </div>

        {/* Absolute Privacy */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <EyeOff className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">Zero Server Exposure</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Because all encryption and decryption happen client-side, the keys, plaintext, and passphrases never touch a server.
            You can verify this by running the application entirely offline or inspecting the network tab in Developer Tools.
          </p>
        </div>

        {/* LSB Steganography */}
        <div className="glass-panel-3d card-3d-tilt rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">LSB Image Steganography</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Hide encrypted messages invisibly inside PNG image pixels using <strong>Least Significant Bit (LSB)</strong> steganography.
            Upload your own photo or generate an abstract cover pattern. To an outside observer, it looks like a completely ordinary picture.
          </p>
        </div>

        {/* Burn after reading */}
        <div className="glass-panel-3d card-3d-tilt md:col-span-2 rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Trash2 className="h-5 w-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">Best-Effort Burn-After-Reading</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The optional <strong>"Burn after reading"</strong> flag encodes a specific instruction in the payload.
            The app records scanned payloads' cryptographic hashes locally using `localStorage`.
            If the hash is scanned a second time, the app displays a warning.
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
