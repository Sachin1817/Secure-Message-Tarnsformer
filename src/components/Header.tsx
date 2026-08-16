import React from 'react';
import { QrCode, ScanLine, Sun, Moon, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'encrypt' | 'decrypt' | 'about';
  setActiveTab: (tab: 'encrypt' | 'decrypt' | 'about') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
}) => {
  return (
    <header className="w-full glass-panel sticky top-0 z-50 border-b px-4 py-3 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('encrypt')}>
          <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20 flex items-center justify-center animate-pulse">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              QRCrypt
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">
              CLIENT-SIDE SECURE QR
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center space-x-1 md:space-x-2 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => setActiveTab('encrypt')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'encrypt'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/30'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Encrypt & Generate</span>
            <span className="sm:hidden">Encrypt</span>
          </button>

          <button
            onClick={() => setActiveTab('decrypt')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'decrypt'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/30'
            }`}
          >
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">Decrypt & Scan</span>
            <span className="sm:hidden">Decrypt</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/30'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Info</span>
          </button>
        </nav>

        {/* Theme and Actions toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
