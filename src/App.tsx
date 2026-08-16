import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { EncryptScreen } from './components/EncryptScreen';
import { DecryptScreen } from './components/DecryptScreen';
import { AboutSection } from './components/AboutSection';
import { Lock, KeyRound } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'about'>('encrypt');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-950 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main dashboard content area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:px-8">
        {activeTab === 'encrypt' && <EncryptScreen />}
        {activeTab === 'decrypt' && <DecryptScreen />}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Modern footer with security note */}
      <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/50 py-6 px-4 md:px-8 bg-slate-100/50 dark:bg-slate-950/40 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              All operations are executed <strong>100% locally</strong> in your browser using the Web Crypto API.
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <KeyRound className="h-3 w-3 text-violet-500" />
              <span>AES-256-GCM</span>
            </span>
            <span>•</span>
            <span>Argon2id KDF</span>
            <span>•</span>
            <span>PBKDF2 Fallback</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
