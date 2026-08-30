import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Header, type ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EncryptScreen } from './components/EncryptScreen';
import { DecryptScreen } from './components/DecryptScreen';
import { CyberBackground3D } from './components/CyberBackground3D';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { LockScreen } from './components/LockScreen';
import { Lock, KeyRound, Sparkles, ShieldCheck, LayoutDashboard, QrCode } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-500 bg-slate-100 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* 3D Canvas Interactive Background Engine */}
      <CyberBackground3D />

      {/* 3D Ambient Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glowing Orb 1 - Top Left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/25 rounded-full blur-3xl animate-glow" />
        
        {/* Glowing Orb 2 - Top Right */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        
        {/* Glowing Orb 3 - Bottom Center */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/15 dark:bg-cyan-600/15 rounded-full blur-3xl animate-glow" style={{ animationDelay: '4s' }} />

        {/* 3D Floating Cyber Geometry elements */}
        <div className="absolute top-1/4 left-10 w-24 h-24 border border-indigo-500/20 dark:border-indigo-400/30 rounded-3xl animate-float pointer-events-none hidden md:block" />
        <div className="absolute bottom-1/3 right-12 w-32 h-32 border border-purple-500/20 dark:border-purple-400/30 rounded-full animate-float pointer-events-none hidden md:block" style={{ animationDelay: '3s' }} />
      </div>

      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center relative z-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center animate-spin">
              <ShieldCheck className="h-8 w-8 text-indigo-500 animate-pulse" />
            </div>
          </div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-500 animate-pulse">
            Verifying Crypto Session...
          </p>
        </div>
      ) : !user ? (
        <>
          <LockScreen
            onOpenAuth={openAuthModal}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          {/* Auth Modal Overlay */}
          <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </>
      ) : (
        <>
          {/* Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          {/* Main dashboard content area with mobile top/bottom bar offsets */}
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 pt-20 pb-24 md:pt-8 md:pb-8 z-10">
            {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
            {activeTab === 'encrypt' && <EncryptScreen />}
            {activeTab === 'decrypt' && <DecryptScreen />}
          </main>

          {/* SHARED COMPONENT: BottomNavBar (Mobile 3-tab layout) */}
          <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-4 bg-[#131314]/95 backdrop-blur-2xl rounded-t-2xl border-t border-[#3b4b37]/60 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center w-20 py-1 transition-transform active:scale-90 font-mono text-[10px] font-bold ${
                activeTab === 'dashboard'
                  ? 'text-[#00ff41] bg-[#00ff41]/15 rounded-xl'
                  : 'text-slate-400 dark:text-[#b9ccb2] hover:text-[#00ff41]'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 mb-0.5" />
              <span>Dash</span>
            </button>

            <button
              onClick={() => setActiveTab('encrypt')}
              className={`flex flex-col items-center justify-center w-20 py-1 transition-transform active:scale-90 font-mono text-[10px] font-bold ${
                activeTab === 'encrypt'
                  ? 'text-[#00ff41] bg-[#00ff41]/15 rounded-xl'
                  : 'text-slate-400 dark:text-[#b9ccb2] hover:text-[#00ff41]'
              }`}
            >
              <Lock className="h-5 w-5 mb-0.5" />
              <span>Encrypt</span>
            </button>

            <button
              onClick={() => setActiveTab('decrypt')}
              className={`flex flex-col items-center justify-center w-20 py-1 transition-transform active:scale-90 font-mono text-[10px] font-bold ${
                activeTab === 'decrypt'
                  ? 'text-[#00ff41] bg-[#00ff41]/15 rounded-xl'
                  : 'text-slate-400 dark:text-[#b9ccb2] hover:text-[#00ff41]'
              }`}
            >
              <QrCode className="h-5 w-5 mb-0.5" />
              <span>Decrypt</span>
            </button>
          </nav>

          {/* Auth Modal Overlay */}
          <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

          {/* Modern Cyber Footer (Hidden on mobile to prioritize BottomNavBar) */}
          <footer className="hidden md:block w-full border-t border-slate-200/60 dark:border-[#3b4b37]/40 py-6 px-4 md:px-8 bg-white/40 dark:bg-[#131314]/80 backdrop-blur-xl transition-colors duration-300 z-10 font-mono text-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-[#b9ccb2]">
                <div className="p-1.5 rounded-lg bg-[#00ff41]/10 text-[#00ff41]">
                  <Lock className="h-4 w-4" />
                </div>
                <span>
                  All operations are executed <strong>100% locally</strong> in your browser via WebCrypto & Canvas LSB.
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-[#84967e]">
                <span className="flex items-center space-x-1.5 bg-slate-200/50 dark:bg-[#1c1b1c] px-2.5 py-1 rounded-full border border-slate-300/40 dark:border-[#3b4b37]">
                  <KeyRound className="h-3 w-3 text-[#00daf3]" />
                  <span>AES-256-GCM</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 bg-slate-200/50 dark:bg-[#1c1b1c] px-2.5 py-1 rounded-full border border-slate-300/40 dark:border-[#3b4b37]">
                  <Sparkles className="h-3 w-3 text-[#00ff41]" />
                  <span>Argon2id WASM</span>
                </span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
