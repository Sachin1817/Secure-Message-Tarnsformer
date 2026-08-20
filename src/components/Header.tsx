import React from 'react';
import { QrCode, ScanLine, Sun, Moon, HelpCircle, Shield, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user, openAuthModal, logout } = useAuth();

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

        {/* User Auth Profile & Theme Switcher */}
        <div className="flex items-center space-x-2.5">
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-200/50 dark:bg-slate-900/80 p-1.5 pl-3 rounded-2xl border border-slate-300/40 dark:border-slate-800/80">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full ring-2 ring-indigo-500/40" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
                  {user.email ? user.email[0].toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden md:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="py-2 px-3.5 btn-3d-primary rounded-2xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In with Google</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

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
