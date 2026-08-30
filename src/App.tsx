import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { EncryptScreen } from './components/EncryptScreen';
import { DecryptScreen } from './components/DecryptScreen';
import { AboutSection } from './components/AboutSection';
import { CyberBackground3D } from './components/CyberBackground3D';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { LockScreen } from './components/LockScreen';
import { Lock, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'about'>('encrypt');
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

          {/* Main dashboard content area */}
          <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:px-8 z-10">
            {activeTab === 'encrypt' && <EncryptScreen />}
            {activeTab === 'decrypt' && <DecryptScreen />}
            {activeTab === 'about' && <AboutSection />}
          </main>

          {/* Auth Modal Overlay */}
          <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

          {/* Modern 3D Cyber Footer */}
          <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 py-6 px-4 md:px-8 bg-white/40 dark:bg-slate-950/60 backdrop-blur-xl transition-colors duration-300 z-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Lock className="h-4 w-4" />
                </div>
                <span>
                  All operations are executed <strong>100% locally</strong> in your browser via Web Crypto & Canvas LSB.
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1.5 bg-slate-200/50 dark:bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-300/40 dark:border-slate-800/60">
                  <KeyRound className="h-3 w-3 text-violet-500" />
                  <span>AES-256-GCM</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center space-x-1 bg-slate-200/50 dark:bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-300/40 dark:border-slate-800/60">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
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

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
