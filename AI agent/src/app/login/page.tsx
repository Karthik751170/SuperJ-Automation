'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Sparkles, AlertCircle, CheckCircle, ArrowRight, Target } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workspace, setWorkspace] = useState<'video' | 'marketing'>('video');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramWorkspace = params.get('workspace');
    if (paramWorkspace === 'marketing' || paramWorkspace === 'video') {
      setWorkspace(paramWorkspace);
      localStorage.setItem('logout_source', paramWorkspace);
    } else {
      const savedSource = localStorage.getItem('logout_source');
      if (savedSource === 'marketing') {
        setWorkspace('marketing');
      }
    }
  }, []);

  // Load Google Identity Services SDK on mount
  useEffect(() => {
    if (document.getElementById('google-jssdk')) {
      initializeGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleButton();
    };
    document.body.appendChild(script);
  }, []);

  const initializeGoogleButton = () => {
    try {
      const google = (window as any).google;
      if (!google) return;

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1029255850989-qfpl5c7n4225h653i26l12i3qf2srm41.apps.googleusercontent.com";

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        cancel_on_tap_outside: false
      });

      google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { 
          theme: "dark", 
          size: "large", 
          width: "360",
          type: "standard",
          shape: "rectangular",
          text: "signin_with",
          logo_alignment: "left"
        }
      );
    } catch (e) {
      console.warn("Failed to initialize Google Sign-in button:", e);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Google verification failed.");
      }

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_email', data.email);

      setSuccessMsg("Google login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete Google authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid login credentials.");
      }

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_email', data.email);
      
      const savedWs = localStorage.getItem('workspace_type') || workspace;
      setSuccessMsg("Logged in successfully! Redirecting...");
      
      setTimeout(() => {
        if (savedWs === 'collaboration' || savedWs === 'interview') {
          window.location.href = '/marketing?tab=ai_interview';
        } else if (savedWs === 'video') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/marketing?tab=seo';
        }
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reach auth backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Apple SSO Sign-in
  const handleAppleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: "apple_mock_client_sso_credentials",
          email: "user.apple@icloud.com",
          provider_id: `apple_id_${Math.floor(Math.random() * 1000000)}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Apple authentication failed.");
      }

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_email', data.email);

      setSuccessMsg("Apple mock login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col md:flex-row font-sans antialiased overflow-hidden relative">
      
      {/* Decorative blurred backdrops */}
      <div className="absolute top-1/3 left-1/10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* LEFT SIDE: Clean Auth panel */}
      <section className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between p-8 md:p-12 xl:p-16 z-10 bg-slate-950/40 border-r border-slate-900/60 backdrop-blur-3xl">
        
        {/* Top Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-600/15">
            {workspace === 'marketing' ? (
              <Target className="w-4 h-4 text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
            {workspace === 'marketing' ? 'AURA MARKETING' : 'AURA STUDIO'}
          </span>
        </div>

        {/* Form area */}
        <div className="my-auto py-10 space-y-6 max-w-[360px] mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {workspace === 'marketing' 
                ? 'Login to manage your marketing dashboards.' 
                : 'Login with your credentials to sync projects.'}
            </p>
          </div>

          {/* Status Alerts */}
          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-450 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-450 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950/50 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-1.5"
            >
              {isLoading ? 'Checking credentials...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-900"></div>
            <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Or SSO</span>
            <div className="flex-grow border-t border-slate-900"></div>
          </div>

          {/* Social Credentials buttons */}
          <div className="flex flex-col gap-3 items-center">
            <div id="google-signin-btn" className="w-full min-h-[40px] flex justify-center"></div>

            <button
              type="button"
              onClick={handleAppleAuth}
              disabled={isLoading}
              className="w-full max-w-[360px] flex items-center justify-center gap-2.5 bg-[#000000] hover:bg-slate-900 border border-slate-800 rounded-md py-2 text-xs font-semibold text-white transition h-[40px] shadow"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.22-.58 2.94-1.39z"/>
              </svg>
              Sign in with Apple
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-[11px] text-slate-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald-450 hover:text-emerald-400 font-bold transition">
              Sign Up
            </Link>
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold hover:bg-emerald-900/60 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try Live AI Interview & Team Chat Demos on Home Page →
            </Link>
          </div>
        </div>

      </section>

      {/* RIGHT SIDE: Immersive AI Graphics (Full cover) */}
      <section className="hidden md:block md:flex-1 relative overflow-hidden bg-slate-950">
        
        {/* AI Graphic Background */}
        <img 
          src="/woman_laughing.jpg" 
          alt="AI Studio Keyart" 
          className="absolute inset-0 w-full h-full object-cover scale-102 select-none pointer-events-none"
        />

        {/* Gradients blending with Auth panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05060b] via-[#05060b]/30 to-transparent z-15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060b]/95 via-transparent to-[#05060b]/30 z-15"></div>

        {/* Tagline Overlay Content */}
        <div className="absolute bottom-16 left-16 right-16 z-20 max-w-[540px] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-300 tracking-wider uppercase font-mono shadow-inner">
            {workspace === 'marketing' ? '★ Digital Marketing Hub' : '★ Next-Gen Procedural Compiler'}
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight font-sans">
            {workspace === 'marketing' 
              ? 'Elevate your marketing campaigns & outreach.' 
              : 'Orchestrate cinematic video timelines on-device.'}
          </h2>
          
          <p className="text-xs text-slate-350 leading-relaxed font-medium">
            {workspace === 'marketing'
              ? 'Analyze website SEO scores, set campaign ad budgets, and track lead conversions in a unified, high-performance sandbox.'
              : 'Create infinite story canvases without third-party APIs. Experience mathematical synthesizer loops, custom particle systems, and dual WebM/MP4 render layers running entirely locally on your processor.'}
          </p>
        </div>

      </section>

    </div>
  );
}
