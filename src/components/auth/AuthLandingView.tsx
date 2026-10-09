import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { getDiagnosticReport } from '../../services/configService';
import { AuthModal } from './AuthModal';
import {
  Sparkles,
  Shield,
  GraduationCap,
  Briefcase,
  FileText,
  Linkedin,
  Layers,
  Award,
  TrendingUp,
  LogIn,
  UserPlus,
  AlertCircle,
  Database,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const PILLARS_LIST = [
  { id: 1, title: 'Student Intelligence Profile', desc: 'Central repository of verified identity, education, projects, skills, and evidence.', icon: GraduationCap },
  { id: 2, title: 'Academic Intelligence', desc: 'Consolidated degree tracking, semester-by-semester audit, credit tracking, and trajectory projection.', icon: Award },
  { id: 3, title: 'Career & Profile Intelligence', desc: 'Skill evidence tiers (Level 0-4), experience auditing, and project verification.', icon: Briefcase },
  { id: 4, title: 'JD / Opportunity Intelligence', desc: 'Deterministic 5-tier role-fit scoring against industry job descriptions.', icon: Layers },
  { id: 5, title: 'CV / Document Intelligence', desc: 'Action-verb audits, quantified metrics ratio, and triad gap reconciliation.', icon: FileText },
  { id: 6, title: 'LinkedIn Intelligence', desc: 'Recruiter search discoverability, headline audits, and visibility gap detection.', icon: Linkedin },
  { id: 7, title: 'Application Intelligence', desc: 'Stalled pipeline detection, application event logs, and status transitions.', icon: TrendingUp },
  { id: 8, title: 'Preparation Intelligence & Practice Coach', desc: 'STAR/PREP rubric practice sessions with real-time AI evaluation.', icon: Sparkles },
  { id: 9, title: 'Readiness & Analytics', desc: 'Weighted readiness composite (Academic, Profile, Skill, Opportunity, Interview).', icon: Shield },
];

export const AuthLandingView: React.FC = () => {
  const { enableDemoMode } = useCareerSaathi();
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Persistent Personal Career Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Your Autonomous Career Saathi <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Backed by Authoritative Intelligence
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          A persistent 9-pillar career ecosystem for students and early-career engineers. Connect your academic credentials, projects, documents, and interview preparation with deterministic scoring and grounded AI reasoning.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => setAuthModalMode('signin')}
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Student Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Create Student Account</span>
          </button>

          <button
            type="button"
            onClick={enableDemoMode}
            className="w-full sm:w-auto px-5 py-3.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 text-indigo-300 text-xs font-semibold rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>Explore Demo Persona (Aarav Sharma)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 9 Pillars Overview Cards */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            The 9 Architectural Pillars of Career Saathi AI
          </h2>
          <span className="text-xs text-indigo-400 font-medium">Deterministic • Grounded • Audited</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS_LIST.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="p-5 bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl transition space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Pillar {pillar.id}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supabase Security Guarantees */}
      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">PostgreSQL Row Level Security</h4>
            <p>Every student record is cryptographically isolated by <code>auth.uid() = user_id</code> at the database engine level.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">User-Scoped Cloud Storage</h4>
            <p>CVs, resumes, and career portfolios are stored in dedicated Supabase Storage buckets with user-path security.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">Audit Logged Intelligence</h4>
            <p>Every skill modification, document upload, and readiness calculation produces verifiable provenance trails.</p>
          </div>
        </div>
      </div>

      {/* Auth Modal Trigger */}
      {authModalMode && (
        <AuthModal
          isOpen={Boolean(authModalMode)}
          onClose={() => setAuthModalMode(null)}
          initialMode={authModalMode}
        />
      )}
    </div>
  );
};
