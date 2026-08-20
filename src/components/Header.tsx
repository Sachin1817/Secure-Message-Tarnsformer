import React from 'react';
import { QrCode, ScanLine, Sun, Moon, HelpCircle, Shield } from 'lucide-react';

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
    <header className="w-full glass-panel-3d sticky top-0 z-50 px-4 py-3.5 md:px-8 border-b transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand logo with 3D Cyber Emblem */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setActiveTab('encrypt')}
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/30 border-t border-indigo-300/40 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
            <Shield className="h-6 w-6 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-300 dark:to-violet-400 bg-clip-text text-transparent">
                QRCrypt
              </h1>
              <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                3D CYBER
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">
              CLIENT-SIDE SECURE MESSAGING
            </p>
          </div>
        </div>

        {/* 3D Navigation tabs */}
        <nav className="flex items-center space-x-1.5 bg-slate-200/60 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-300/40 dark:border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActiveTab('encrypt')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'encrypt'
                ? 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-900/10 border-t border-white dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Encrypt & Generate</span>
            <span className="sm:hidden">Encrypt</span>
          </button>

          <button
            onClick={() => setActiveTab('decrypt')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'decrypt'
                ? 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-900/10 border-t border-white dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">Decrypt & Scan</span>
            <span className="sm:hidden">Decrypt</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'about'
                ? 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-900/10 border-t border-white dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Info</span>
          </button>
        </nav>

        {/* 3D Theme Switcher */}
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </header>
  );
};
