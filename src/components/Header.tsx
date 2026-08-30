import React from 'react';
import { LayoutDashboard, QrCode, ScanLine, Sun, Moon, Shield, LogIn, LogOut, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
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

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* TopAppBar (Mobile exact Stitch layout) */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-[#131314]/90 backdrop-blur-xl border-b border-[#3b4b37]/40 shadow-[0_0_20px_rgba(0,230,57,0.1)]">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="p-1 rounded-lg bg-[#00ff41]/20 text-[#00ff41]">
            <Lock className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-sans font-black text-xl text-[#00ff41] tracking-tight">
            QRCrypt
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#b9ccb2]">
          <button
            onClick={() => setActiveTab('about')}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${activeTab === 'about' ? 'text-[#00ff41]' : 'hover:text-[#00ff41]'}`}
            title="Security Audit"
          >
            <ShieldCheck className="h-5 w-5" />
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-white/10 hover:text-[#00ff41] transition-colors active:scale-95"
            title="Refresh Node"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 hover:text-[#00daf3] transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>

          {user ? (
            <button
              onClick={logout}
              className="p-1.5 rounded-full border border-[#00ff41]/50 text-[#00ff41] hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="p-1.5 rounded-full border border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 transition-all"
              title="Sign In"
            >
              <LogIn className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Top Header (Desktop) */}
      <header className="hidden md:block w-full glass-panel-3d sticky top-0 z-50 px-4 py-3 md:px-8 border-b border-slate-200/60 dark:border-[#3b4b37]/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                  NODE ACTIVE
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 dark:text-[#b9ccb2]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse"></span>
                <span>Status: Secure</span>
              </div>
            </div>
          </div>

          {/* Real-time Security Badges */}
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

          {/* Desktop Navigation tabs */}
          <nav className="flex items-center space-x-1 bg-slate-200/60 dark:bg-[#1c1b1c] p-1.5 rounded-2xl border border-slate-300/40 dark:border-[#3b4b37]/60 shadow-inner font-mono text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-[#00ff41]/15 text-emerald-800 dark:text-[#00ff41] dark:border-b-2 dark:border-[#00ff41] shadow-md'
                  : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('encrypt')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all duration-200 ${
                activeTab === 'encrypt'
                  ? 'bg-white dark:bg-[#00ff41]/15 text-emerald-800 dark:text-[#00ff41] dark:border-b-2 dark:border-[#00ff41] shadow-md'
                  : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Encrypt</span>
            </button>

            <button
              onClick={() => setActiveTab('decrypt')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all duration-200 ${
                activeTab === 'decrypt'
                  ? 'bg-white dark:bg-[#00daf3]/15 text-cyan-800 dark:text-[#00daf3] dark:border-b-2 dark:border-[#00daf3] shadow-md'
                  : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ScanLine className="h-4 w-4" />
              <span>Decrypt</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all duration-200 ${
                activeTab === 'about'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-[#b9ccb2] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Audit</span>
            </button>
          </nav>

          {/* User Auth Profile & Theme Switcher */}
          <div className="flex items-center space-x-2.5">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-200/50 dark:bg-[#1c1b1c] p-1.5 pl-3 rounded-2xl border border-slate-300/40 dark:border-[#3b4b37]">
                <div className="w-7 h-7 rounded-full bg-[#00ff41]/20 flex items-center justify-center text-xs font-bold text-[#00ff41]">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-[#e5e2e3] truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center space-x-1.5 bg-[#00ff41] hover:bg-[#00e639] text-black px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shadow-md active:scale-95"
              >
                <LogIn className="h-4 w-4 stroke-[2.5]" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-[#1c1b1c] border border-slate-300/40 dark:border-[#3b4b37] text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
