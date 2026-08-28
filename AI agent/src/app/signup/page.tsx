'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Sparkles, AlertCircle, CheckCircle, ArrowRight, Target, Video, Users, FileImage } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [moduleType, setModuleType] = useState<'marketing' | 'video' | 'collaboration'>('collaboration');
  const [companyName, setCompanyName] = useState('');

  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Detect URL parameter module selection on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramModule = params.get('module') || params.get('workspace');
    if (paramModule === 'marketing') {
      setModuleType('marketing');
    } else if (paramModule === 'video') {
      setModuleType('video');
    } else if (paramModule === 'collaboration' || paramModule === 'interview' || paramModule === 'chat') {
      setModuleType('collaboration');
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
        document.getElementById("google-signup-btn"),
        { 
          theme: "dark", 
          size: "large", 
          width: "360",
          type: "standard",
          shape: "rectangular",
          text: "signup_with",
          logo_alignment: "left"
        }
      );
    } catch (e) {
      console.warn("Failed to initialize Google Sign-in button:", e);
    }
  };

  const getTargetRoute = (mod: string) => {
    if (mod === 'marketing') return '/marketing?tab=seo';
    if (mod === 'video') return '/dashboard';
    return '/marketing?tab=ai_interview';
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
      localStorage.setItem('workspace_type', moduleType);

      setSuccessMsg("Account registered with Google! Redirecting...");

      setTimeout(() => {
        window.location.href = getTargetRoute(moduleType);
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete Google authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setErrorMsg("Please fill out all input fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          workspace_type: moduleType,
          company_name: companyName.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to register user account.");
      }

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_email', data.email);
      localStorage.setItem('workspace_type', moduleType);

      setSuccessMsg(`Registered for ${getModuleName(moduleType)}! Redirecting...`);
      
      setTimeout(() => {
        window.location.href = getTargetRoute(moduleType);
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reach auth backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleName = (mod: string) => {
    if (mod === 'marketing') return 'Digital Marketing Hub';
    if (mod === 'video') return 'AI Video Studio';
    return 'AI Interview & Team Chat';
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col md:flex-row font-sans antialiased overflow-hidden relative">
      
      {/* Decorative blurred backdrops */}
      <div className="absolute top-1/3 left-1/10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* LEFT SIDE: Clean Auth panel */}
      <section className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between p-8 md:p-12 xl:p-16 z-10 bg-slate-950/40 border-r border-slate-900/60 backdrop-blur-3xl overflow-y-auto">
        
        {/* Top Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-600/15">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black tracking-widest text-white uppercase font-mono">AURA PLATFORM</span>
          </div>

          <Link href="/" className="text-xs text-slate-400 hover:text-emerald-400 font-mono">
            ← Home
          </Link>
        </div>

        {/* Form area */}
        <div className="my-auto py-8 space-y-5 max-w-[380px] mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
              Create Account
            </h2>
            <p className="text-xs text-emerald-400 font-mono mt-1 font-bold">
              Target Module: {getModuleName(moduleType)}
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

          {/* 3 SEPARATE MODULE SIGN-UP SELECTION CARDS */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
              Select Module Registration (3 Options)
            </label>
            
            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: AI Interview & Team Chat */}
              <button
                type="button"
                onClick={() => setModuleType('collaboration')}
                className={`p-3 rounded-xl border text-left transition-all focus:outline-none flex items-center justify-between ${
                  moduleType === 'collaboration'
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'border-slate-850 bg-slate-950/40 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block font-mono">1. AI Interview & Team Chat</span>
                    <span className="text-[10px] text-slate-400 block">Voice Moderator, Transcripts, WebRTC & Chat</span>
                  </div>
                </div>
                {moduleType === 'collaboration' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>

              {/* Option 2: Digital Marketing Hub */}
              <button
                type="button"
                onClick={() => setModuleType('marketing')}
                className={`p-3 rounded-xl border text-left transition-all focus:outline-none flex items-center justify-between ${
                  moduleType === 'marketing'
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'border-slate-850 bg-slate-950/40 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block font-mono">2. Digital Marketing Hub</span>
                    <span className="text-[10px] text-slate-400 block">SEO, Site Audits, Ads Generator & Competitor Intel</span>
                  </div>
                </div>
                {moduleType === 'marketing' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>

              {/* Option 3: AI Video Generation Studio */}
              <button
                type="button"
                onClick={() => setModuleType('video')}
                className={`p-3 rounded-xl border text-left transition-all focus:outline-none flex items-center justify-between ${
                  moduleType === 'video'
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'border-slate-850 bg-slate-950/40 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block font-mono">3. AI Video Studio</span>
                    <span className="text-[10px] text-slate-400 block">Promo Video Timeline Compiler & GPU Keyarts</span>
                  </div>
                </div>
                {moduleType === 'video' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5 pt-2">
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
                  className="w-full bg-slate-950/50 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition-all"
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
                  className="w-full bg-slate-950/50 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-650 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Company / Team Name (Optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-slate-950/50 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-1.5"
            >
              {isLoading ? 'Creating account...' : `Register for ${getModuleName(moduleType)}`}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Social Auth */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-900"></div>
            <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Or SSO</span>
            <div className="flex-grow border-t border-slate-900"></div>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <div id="google-signup-btn" className="w-full min-h-[40px] flex justify-center"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[11px] text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="text-emerald-450 hover:text-emerald-400 font-bold transition">
              Sign In
            </Link>
          </p>
        </div>

      </section>

      {/* RIGHT SIDE: Visual Showcase */}
      <section className="hidden md:block md:flex-1 relative overflow-hidden bg-slate-950">
        <img 
          src="/studio_auth_bg_1785235857622.jpg" 
          alt="Aura Platform Keyart" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05060b] via-[#05060b]/40 to-transparent z-15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060b]/95 via-transparent to-[#05060b]/30 z-15"></div>

        <div className="absolute bottom-16 left-16 right-16 z-20 max-w-[540px] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-300 tracking-wider uppercase font-mono shadow-inner">
            ★ {getModuleName(moduleType)}
          </div>
          
          <h2 className="text-3xl font-extrabold text-white leading-tight font-sans">
            {moduleType === 'marketing' && 'Scale campaigns, SEO rankings & lead capture.'}
            {moduleType === 'video' && 'Orchestrate cinematic video timelines on-device.'}
            {moduleType === 'collaboration' && 'Voice-driven AI Moderator & WebRTC team meetings.'}
          </h2>
          
          <p className="text-xs text-slate-350 leading-relaxed font-medium">
            {moduleType === 'marketing' && 'Track live website lighthouse scores, generate ad creatives, and analyze competitor keyword SWOT matrix.'}
            {moduleType === 'video' && 'Procedural GPU video compiler with particle effects, dual WebM/MP4 exports, and zero external latency.'}
            {moduleType === 'collaboration' && 'WebSpeech API voice moderator, live exact spoken transcripts, custom channel creation, and calendar email scheduling.'}
          </p>
        </div>
      </section>
    </div>
  );
}
