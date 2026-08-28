'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Menu, Coins, LogOut, Settings, Plus, Send, Key, Lock, CheckCircle, RefreshCw, Terminal, Download, Target
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  provider: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // Session state
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tokensBalance, setTokensBalance] = useState<number>(10);
  
  // UI toggles
  const [showHamburger, setShowHamburger] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Prompt input
  const [promptInput, setPromptInput] = useState('');

  // Settings credentials inputs
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpKeySecret, setRzpKeySecret] = useState('');
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generative Engine States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Toast Notifications State & Helper
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Authenticate session on load
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedEmail = localStorage.getItem('auth_email');

    if (!savedToken) {
      router.push('/login');
      return;
    }

    setToken(savedToken);
    loadDashboardData(savedToken, savedEmail);
  }, []);

  const loadDashboardData = async (sessionToken: string, fallbackEmail: string | null) => {
    setIsLoading(true);
    try {
      // Fetch Profile
      const profileRes = await fetch('http://127.0.0.1:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (profileRes.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_email');
        router.push('/login');
        return;
      }

      if (!profileRes.ok) throw new Error("Profile API error");
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch Wallet Balance
      const walletRes = await fetch('http://127.0.0.1:8000/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setTokensBalance(walletData.tokens ?? 0);
      } else {
        setTokensBalance(100);
      }

    } catch (e) {
      setProfile({ id: "mock", email: fallbackEmail || 'Creator', provider: 'local', created_at: new Date().toISOString() });
      setTokensBalance(100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    window.location.href = '/login?workspace=video';
  };

  // Create new project mock
  const handleNewProject = () => {
    setPromptInput('');
    setShowHamburger(false);
    showToast("New empty timeline project initialized.", "info", "Project Reset");
  };

  // Save Razorpay Credentials
  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingKeys(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/settings/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_key_id: rzpKeyId,
          razorpay_key_secret: rzpKeySecret
        })
      });

      if (!response.ok) throw new Error("Saving keys failed");
      
      setSaveSuccess(true);
      showToast("Razorpay API key credentials saved.", "success", "Settings Saved");
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSettingsModal(false);
      }, 1200);

    } catch (err) {
      showToast("Failed to write API key configuration to backend.", "error", "Save Failed");
    } finally {
      setIsSavingKeys(false);
    }
  };

  // Poll Job Status
  const pollJobStatus = (jobId: string) => {
    const interval = setInterval(async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/video/status/${jobId}`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        if (!res.ok) throw new Error("Status query failed.");
        const data = await res.json();

        if (data.logs) {
          setCompilationLogs(data.logs);
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          setGeneratedVideo(data.video_url);
          setIsGenerating(false);
          setActiveJobId(null);
          showToast("AI video generation completed successfully!", "success", "Video Compiled");
          
          // Reload dashboard info to update token count widget
          const savedEmail = localStorage.getItem('auth_email');
          loadDashboardData(savedToken, savedEmail);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setIsGenerating(false);
          setActiveJobId(null);
          showToast("AI video compilation failed inside the diffusion pipeline. Please try again.", "error", "Pipeline Error");
        }

      } catch (e) {
        console.error(e);
      }
    }, 1000);
  };

  // Send prompt to generator API
  const handleSendPrompt = async () => {
    if (!promptInput.trim() || !token) return;
    if (tokensBalance < 5) {
      showToast("Insufficient token balance. AI video compiles require at least 5 tokens. Please visit the Wallet to top up.", "error", "Insufficient Tokens");
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setCompilationLogs(["[SYSTEM] Connecting to AI Generative Pipeline...", "[SYSTEM] Reserving GPU memory blocks..."]);
    
    const userPrompt = promptInput;
    setPromptInput('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: userPrompt })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Generation initiation failed.");

      const jobId = data.job_id;
      setActiveJobId(jobId);
      
      // Start polling
      pollJobStatus(jobId);

    } catch (err: any) {
      showToast(err.message || "Failed to start video generation. Backend service unreachable.", "error", "Connection Error");
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Verifying secure credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans antialiased overflow-hidden relative">
      
      {/* Background Emerald Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER: Minimalist bar */}
      <header className="bg-slate-950/40 border-b border-slate-900/60 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        
        {/* Left Side: Hamburger & Title Logo */}
        <div className="flex items-center gap-3 relative">
          
          {/* Hamburger Menu Toggle */}
          <button 
            onClick={() => setShowHamburger(!showHamburger)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all shadow"
            title="Menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          {/* Hamburger Dropdown Panel (Aligned Left) */}
          {showHamburger && (
            <div className="absolute left-0 top-11 w-48 bg-slate-900 border border-slate-800/80 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-fade-in backdrop-blur-md">
              <button
                onClick={handleNewProject}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-950/50 rounded-lg transition text-left"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                New Project
              </button>

              <Link
                href="/wallet"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-950/50 rounded-lg transition text-left block"
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                Wallet Store
              </Link>

              <Link
                href="/marketing"
                onClick={() => setShowHamburger(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-950/50 rounded-lg transition text-left block"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                Marketing Hub
              </Link>

              <button
                onClick={() => {
                  setShowHamburger(false);
                  setShowSettingsModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-950/50 rounded-lg transition text-left"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                Settings Config
              </button>

              <div className="border-t border-slate-850 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-350 hover:bg-rose-955/10 rounded-lg transition text-left"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}

          {/* Title Logo next to Hamburger */}
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-550 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-black tracking-widest text-white uppercase font-mono">AURA STUDIO</span>
          </div>

        </div>

        {/* Right Side: Wallet link */}
        <div className="flex items-center gap-3">
          
          {/* Wallet Balance widget */}
          <Link
            href="/marketing"
            className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-mono font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" /> AI Marketing Hub
          </Link>

          <Link 
            href="/wallet"
            className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-xl px-4 py-1.5 flex items-center gap-2 transition-all hover:bg-slate-900/80 shadow"
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-white font-mono">{tokensBalance} 🪙</span>
          </Link>

        </div>
      </header>

      {/* MAIN CONTAINER: Minimal Chat-like Input focus */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 z-10 w-full">
        
        <div className="w-full max-w-[640px] space-y-6">
          
          {isGenerating ? (
            /* CONSOLE LOGS TERMINAL PANEL */
            <div className="bg-slate-950/80 border border-emerald-500/20 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in w-full">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-450 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-emerald-400 font-mono uppercase">Aura Compilation Console</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">GPU Active</span>
                </div>
              </div>
              
              <div className="font-mono text-[11px] text-emerald-450 space-y-1 p-5 text-left max-h-[220px] overflow-y-auto leading-relaxed h-[220px] select-none scrollbar-thin">
                {compilationLogs.map((log, index) => (
                  <div key={index} className="opacity-90 tracking-wide font-medium">{log}</div>
                ))}
                <div className="w-1.5 h-3.5 bg-emerald-500 inline-block animate-pulse ml-0.5 mt-0.5"></div>
              </div>
            </div>

          ) : generatedVideo ? (
            /* VIDEO PLAYER DISPLAY CONTAINER */
            <div className="bg-slate-950/40 border border-slate-900/60 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl space-y-4 animate-fade-in w-full">
              
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-900 group shadow-inner">
                <video 
                  src={generatedVideo}
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                  className="w-full max-h-[350px] object-contain mx-auto bg-black"
                />
                
                {/* Visual Glow Overlay */}
                <div className="absolute inset-0 pointer-events-none border border-emerald-500/10 rounded-xl"></div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-mono text-emerald-450 uppercase tracking-widest block font-bold">Successfully Rendered</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate max-w-[320px]">Compiled MP4 video stream</span>
                </div>
                
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => {
                      setGeneratedVideo(null);
                      setCompilationLogs([]);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Compile Another
                  </button>
                  
                  <a 
                    href={generatedVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow shadow-emerald-600/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>

            </div>

          ) : (
            /* DEFAULT PROMPT INPUT STAGE */
            <div className="space-y-6 text-center w-full">
              {/* Welcome Deck */}
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">What can I compile for you?</h2>
                <p className="text-xs text-slate-450 leading-relaxed max-w-[400px] mx-auto">
                  Enter description prompt keywords. Procedural frame compiles will consume <span className="text-emerald-400 font-bold">5 tokens</span>.
                </p>
              </div>

              {/* Interactive Text Field with integrated Send Button */}
              <div className="relative group">
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe what you want to render... (Try 'cyberpunk city' or 'nature stream' loops)"
                  className="w-full bg-slate-950/40 border border-slate-900 focus:border-emerald-500 rounded-2xl p-4 pr-14 text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition-all shadow-2xl h-28 resize-none leading-relaxed backdrop-blur-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                />
                
                {/* Integrated Send Button */}
                <button
                  onClick={handleSendPrompt}
                  disabled={!promptInput.trim()}
                  className="absolute right-3.5 bottom-3.5 w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 disabled:hover:bg-emerald-600 transition-all flex items-center justify-center shadow shadow-emerald-600/10"
                  title="Send Prompt"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* SETTINGS POPUP MODAL (from Hamburger Settings option) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          
          <div className="w-full max-w-[380px] bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 relative">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider font-mono">API Credentials</h3>
                <p className="text-[9.5px] text-slate-450 mt-0.5">Configure your Razorpay settings.</p>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-[10px] font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-450 text-[11px] p-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Keys saved & updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveKeys} className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 mb-1 uppercase font-mono">Razorpay Key ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    required
                    placeholder="rzp_test_..."
                    value={rzpKeyId}
                    onChange={(e) => setRzpKeyId(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-850 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 mb-1 uppercase font-mono">Razorpay Key Secret</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={rzpKeySecret}
                    onChange={(e) => setRzpKeySecret(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-850 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-655 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingKeys}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1"
              >
                {isSavingKeys ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Save Settings'
                )}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Floating Toast Notification Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-fade-in ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/50'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-slate-950/50'
            }`}
          >
            <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
              toast.type === 'error' ? 'text-rose-400' :
              toast.type === 'success' ? 'text-emerald-400' :
              toast.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
            }`} />
            <div className="flex-1 text-xs">
              {toast.title && <div className="font-bold font-mono uppercase tracking-wider mb-0.5">{toast.title}</div>}
              <div className="leading-relaxed opacity-95">{toast.message}</div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white transition p-1 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
