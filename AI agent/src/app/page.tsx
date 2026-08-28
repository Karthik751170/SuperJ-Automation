'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, MessageSquare, Video, Calendar, Users, Plus, Send, Mic, 
  CheckCircle, ArrowRight, ShieldCheck, Volume2, Mail, ExternalLink, Clock, Target, FileImage, Lock 
} from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userWorkspace, setUserWorkspace] = useState<string>('collaboration');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedWs = localStorage.getItem('workspace_type') || 'collaboration';
    setUserWorkspace(savedWs);
    if (savedToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const getWorkspaceRoute = () => {
    if (userWorkspace === 'marketing') return '/marketing?tab=seo';
    if (userWorkspace === 'video') return '/dashboard';
    return '/marketing?tab=ai_interview';
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 font-sans antialiased overflow-x-hidden relative">
      
      {/* Background Neon Blurs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-black tracking-widest text-white uppercase font-mono">AURA PLATFORM</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => router.push(getWorkspaceRoute())}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
              >
                Go to My Workspace <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
                >
                  Sign Up Free <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> 3 Specialized Platform Modules
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Enterprise AI Platform for <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Interviews, Marketing & Video Studio
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select and register for your specific module below to unlock full feature access including live WebRTC AI Video Call Interviews, Real Google SEO Analytics, or GPU Procedural Video Generation.
        </p>

        {/* 3 Module Direct Registration Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup?module=collaboration"
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            <Video className="w-4 h-4" /> Sign Up: AI Interview & Chat
          </Link>

          <Link
            href="/signup?module=marketing"
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <Target className="w-4 h-4 text-emerald-400" /> Sign Up: Digital Marketing
          </Link>

          <Link
            href="/signup?module=video"
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <FileImage className="w-4 h-4 text-cyan-400" /> Sign Up: AI Video Studio
          </Link>
        </div>
      </section>

      {/* 3 Module Feature Cards Showcase (Unlocked After Sign-Up / Login) */}
      <section className="max-w-6xl mx-auto px-6 pb-24 space-y-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">MODULE ARCHITECTURE</span>
          <h2 className="text-2xl font-black text-white font-mono">Select a Module to Sign Up & Unlock</h2>
          <p className="text-xs text-slate-400">Features are activated upon account registration or sign in to your workspace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MODULE CARD 1: AI VIDEO INTERVIEW & TEAM CHAT */}
          <div className="bg-slate-950/80 border border-slate-850 hover:border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Requires Module Auth
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-mono group-hover:text-emerald-400 transition">
                  1. AI Interview & Team Chat
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time WebRTC camera feeds, Speech Synthesis AI Moderator, live spoken transcripts, dynamic custom channels, and calendar email scheduling.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Voice AI Interview Moderator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Exact Spoken Transcript Sidebar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>User-Created Custom Channels (`+ Create Channel`)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Google Meet / Teams WebRTC Rooms</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup?module=collaboration"
              className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-2"
            >
              Sign Up for AI Interview Module <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>

          {/* MODULE CARD 2: DIGITAL MARKETING HUB */}
          <div className="bg-slate-950/80 border border-slate-850 hover:border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-teal-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Requires Module Auth
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-mono group-hover:text-teal-400 transition">
                  2. Digital Marketing Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real Google SEO search trends, Google Autocomplete keyword suggestions, PageSpeed Lighthouse audits, competitor SWOT analysis & ad copy generator.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Real Google Trends & SERP Difficulty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Google PageSpeed Lighthouse Scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Real Scraped Competitor SWOT</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Multi-API AI Social & Ad Studio</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup?module=marketing"
              className="w-full py-3 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-300 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-2"
            >
              Sign Up for Digital Marketing <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            </Link>
          </div>

          {/* MODULE CARD 3: AI VIDEO GENERATION STUDIO */}
          <div className="bg-slate-950/80 border border-slate-850 hover:border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileImage className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Requires Module Auth
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-mono group-hover:text-cyan-400 transition">
                  3. AI Video Studio
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Procedural GPU video compiler, particle synthesizer loops, keyart generation, anddual WebM/MP4 render layers running on-device.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Promo Video Timeline Compiler</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Procedural Particle Synthesizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>AI Image & Keyart Editing Studio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Token Wallet & Export History</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup?module=video"
              className="w-full py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-2"
            >
              Sign Up for AI Video Studio <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-center text-xs text-slate-500 font-mono">
        Aura AI Platform © 2026. AI Video Interviews, Digital Marketing Hub & Video Generation Studio.
      </footer>
    </div>
  );
}
