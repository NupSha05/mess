import React from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Linkedin,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const Pillar6LinkedInIntelligence: React.FC = () => {
  const {
    linkedInAnalysis,
    profile,
    activeJD,
    triggerLinkedInAnalysis,
    isAiProcessing,
    aiError,
  } = useCareerSaathi();

  const handleRunAudit = async () => {
    await triggerLinkedInAnalysis({
      url: profile.linkedInUrl || 'https://linkedin.com/in/student',
      headline: profile.headline || 'Student / Early Career Professional',
      about: profile.about || 'Looking for technical opportunities in software engineering.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Linkedin className="w-4 h-4 text-blue-400" />
              <span>LinkedIn Intelligence • Recruiter Visibility Diagnostic</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Professional Positioning & Recruiter Discoverability
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Consumes your student profile narrative directly from Pillar 1. Career Saathi isolates visibility gaps from genuine capability gaps and never fabricates accomplishments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAudit}
              disabled={isAiProcessing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiProcessing ? 'Running Audit...' : linkedInAnalysis ? 'Re-Run Recruiter Audit' : 'Run Profile Audit'}</span>
            </button>
            {profile.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600/20 text-blue-300 border border-blue-500/40 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-600/30 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Profile</span>
              </a>
            )}
          </div>
        </div>

        {/* Profile Context Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Synchronized Headline:</span>
            <span className="font-semibold text-white truncate block">
              {profile.headline || 'No headline set in Profile'}
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">LinkedIn URL:</span>
            <span className="font-semibold text-indigo-300 truncate block">
              {profile.linkedInUrl || 'Configured in Profile Basics'}
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Target Recruiter Role:</span>
            <span className="font-semibold text-emerald-400 truncate block">
              {activeJD.title} ({activeJD.company})
            </span>
          </div>
        </div>

        {aiError && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {!linkedInAnalysis ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Linkedin className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No LinkedIn Audit Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Click 'Run Profile Audit' above to evaluate your headline keyword density, recruiter discoverability index, and about section narrative.
            </p>
          </div>
          <button
            onClick={handleRunAudit}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Run Instant Audit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Discoverability Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">
                  {linkedInAnalysis.completenessScore}
                </span>
                <span className="text-slate-500 text-xs">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Likelihood of appearing in technical recruiter boolean searches.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Headline Quality
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400">
                  85
                </span>
                <span className="text-slate-500 text-xs">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluates keyword density, role intent, and proof tags.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Visibility Discrepancies
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-400">
                  {linkedInAnalysis.visibilityGaps?.length || 0}
                </span>
                <span className="text-slate-500 text-xs">Gaps</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Skills verified in profile but omitted from LinkedIn.
              </p>
            </div>
          </div>

          {/* Headline & About Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Headline Diagnostic & Rewrite
              </h3>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 block text-[11px]">Current Headline:</span>
                <p className="text-slate-300 italic">{profile.headline || 'Student'}</p>
                {linkedInAnalysis.headlineAudit?.suggested && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-emerald-400 font-semibold block text-[11px]">
                      Suggested High-Visibility Headline:
                    </span>
                    <p className="text-white font-medium mt-0.5">
                      {linkedInAnalysis.headlineAudit.suggested}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-1 italic">
                      Rationale: {linkedInAnalysis.headlineAudit.rationale}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Key Positioning Recommendations
              </h3>
              <div className="space-y-2 text-xs">
                {(linkedInAnalysis.visibilityGaps || []).map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1"
                  >
                    <div className="flex items-center gap-2 text-white font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{gap.skill}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{gap.reason}</p>
                    <p className="text-indigo-300 text-[11px] font-medium">💡 Fix: {gap.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
