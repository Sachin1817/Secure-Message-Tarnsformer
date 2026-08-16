import React from 'react';
import { Shield, Key, EyeOff, Trash2, HelpCircle } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-2">
      {/* Introduction */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 dark:bg-indigo-950 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            About QRCrypt
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          QRCrypt is a client-side secure messaging tool that encrypts text messages into scannable QR codes.
          The recipient can open the app, scan the QR code using their camera or upload the image, enter the passphrase, and view the decrypted plaintext.
          The entire flow works <strong>fully offline and client-side</strong>. No server ever sees your messages, passwords, or keys.
        </p>
      </div>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symmetric Encryption */}
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Shield className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 dark:text-white">AES-256-GCM Encryption</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            All messages are encrypted using <strong>AES-256-GCM</strong>, the gold standard for symmetric encryption. 
            GCM (Galois/Counter Mode) provides both confidentiality and <strong>authenticated integrity</strong>.
            If even a single pixel of the QR code is tampered with or modified, decryption will fail completely instead of yielding corrupted plaintext.
          </p>
        </div>

        {/* Key Derivation */}
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Key className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 dark:text-white">Robust Key Derivation</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            When you use a passphrase, we derive a cryptographically strong 256-bit key using <strong>Argon2id</strong> (preferred) or <strong>PBKDF2-SHA256 with 600,000 iterations</strong> (fallback).
            This makes brute-force attacks on the passphrase extremely resource-intensive for attackers, even if they obtain the printed QR code.
          </p>
        </div>

        {/* Absolute Privacy */}
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <EyeOff className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 dark:text-white">Zero Server Exposure</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Because all encryption and decryption happen client-side, the keys, plaintext, and passphrases never touch a server.
            You can verify this by running the application entirely offline or inspecting the network traffic in your browser's Developer Tools.
          </p>
        </div>

        {/* Burn after reading */}
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Trash2 className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 dark:text-white">Best-Effort Burn-After-Reading</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The optional <strong>"Burn after reading"</strong> flag encodes a specific instruction in the payload.
            The app records scanned payloads' cryptographic hashes locally using `localStorage`.
            If the hash is scanned a second time, the app displays a warning.
            <em>Note: This is a client-side, best-effort constraint and cannot guarantee absolute destruction if the recipient uses a third-party QR scanner or copies the code manually.</em>
          </p>
        </div>
      </div>

      {/* Security Model Limitations */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border-l-4 border-l-amber-500/80 bg-amber-500/5 dark:bg-amber-950/20 space-y-3">
        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center space-x-2">
          <span>⚠️ Important Security Limitations</span>
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Passphrase Distribution:</strong> You must share the decryption passphrase or pre-shared key with the recipient through a separate, secure communication channel (e.g., in person or via an end-to-end encrypted chat).
          </li>
          <li>
            <strong>No Forward Secrecy:</strong> If an attacker steals your passphrase and intercepts the QR code, they can decrypt the message. Use unique, strong passphrases for each QR code.
          </li>
          <li>
            <strong>Single-Use Limits:</strong> Without a central database, true server-enforced "burn after reading" is impossible. A recipient could scan the QR code using standard scanner apps, duplicate the image, or read the screen contents.
          </li>
        </ul>
      </div>
    </div>
  );
};
