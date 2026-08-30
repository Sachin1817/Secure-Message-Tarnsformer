import React from 'react';
import { LayoutDashboard, QrCode, ScanLine, Sun, Moon, HelpCircle, Shield, LogIn, LogOut, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'encrypt' | 'decrypt' | 'about';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
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
    <header className="w-full glass-panel-3d sticky top-0 z-50 px-4 py-3 md:px-8 border-b border-slate-200/60 dark:border-[#3b4b37]/40 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand logo with Stitch Cyber Emblem */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-[#00ff41] to-[#00aa28] text-black shadow-lg shadow-[#00ff41]/20 border-t border-white/40 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
            <Shield className="h-6 w-6 text-black stroke-[2.5]" />
            <div className="absolute inset-0 rounded-2xl bg-white/30 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-[#00ff41] font-sans">
                QRCrypt
              </h1>
              <span className="text-[9px] font-black uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-md bg-[#00ff41]/10 text-emerald-700 dark:text-[#00ff41] border border-[#00ff41]/30 shadow-sm">
                STITCH NODE
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 dark:text-[#b9ccb2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse"></span>
              <span>Status: Secure</span>
            </div>
          </div>
        </div>

        {/* Real-time Security Badges (from Stitch Dashboard) */}
        <div className="hidden lg:flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-[#3b4b37] bg-white/60 dark:bg-[#1c1b1c]/80 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"></span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-[#00ff41]">WASM: Online</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-[#00daf3]/40 bg-white/60 dark:bg-[#1c1b1c]/80 backdrop-blur-md">
            <Lock className="h-3 w-3 text-[#00daf3]" />
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-[#00daf3]">AES-256-GCM</span>
          </div>
        </div>

        {/* 3D Navigation tabs */}
        <nav className="flex items-center space-x-1 bg-slate-200/60 dark:bg-[#1c1b1c] p-1.5 rounded-2xl border border-slate-300/40 dark:border-[#3b4b37]/60 shadow-inner">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-[#00ff41]/15 text-emerald-800 dark:text-[#00ff41] dark:border-b-2 dark:border-[#00ff41] shadow-md'
                : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Dash</span>
          </button>

          <button
            onClick={() => setActiveTab('encrypt')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'encrypt'
                ? 'bg-white dark:bg-[#00ff41]/15 text-emerald-800 dark:text-[#00ff41] dark:border-b-2 dark:border-[#00ff41] shadow-md'
                : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Encrypt</span>
            <span className="sm:hidden">Enc</span>
          </button>

          <button
            onClick={() => setActiveTab('decrypt')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'decrypt'
                ? 'bg-white dark:bg-[#00daf3]/15 text-cyan-800 dark:text-[#00daf3] dark:border-b-2 dark:border-[#00daf3] shadow-md'
                : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">Decrypt</span>
            <span className="sm:hidden">Dec</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Audit</span>
          </button>
        </nav>

        {/* User Auth Profile & Theme Switcher */}
        <div className="flex items-center space-x-2.5">
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-200/50 dark:bg-[#1c1b1c] p-1.5 pl-3 rounded-2xl border border-slate-300/40 dark:border-[#3b4b37]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full ring-2 ring-[#00ff41]/60" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#00ff41]/20 text-[#00ff41] flex items-center justify-center font-bold text-xs">
                  {user.email ? user.email[0].toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden md:inline font-mono">
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
              <span className="hidden sm:inline">Sign In</span>
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
