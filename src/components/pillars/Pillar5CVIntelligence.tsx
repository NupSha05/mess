import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Layers,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { GapType } from '../../types';

export const Pillar5CVIntelligence: React.FC = () => {
  const {
    cvAnalysis,
    activeJD,
    profile,
    triggerCVAnalysis,
    isAiProcessing,
    aiError,
  } = useCareerSaathi();

  const [selectedFilter, setSelectedFilter] = useState<GapType | 'All'>('All');

  const filteredGaps =
    cvAnalysis && cvAnalysis.gaps
      ? selectedFilter === 'All'
        ? cvAnalysis.gaps
        : cvAnalysis.gaps.filter((g) => g.gapType === selectedFilter)
      : [];

  const getGapBadge = (type: GapType) => {
    switch (type) {
      case 'CV Gap':
        return {
          label: 'CV Gap (Omitted from Resume)',
          desc: 'Verified in your profile, but missing from your CV document!',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'Evidence Gap':
        return {
          label: 'Evidence Gap (Unbacked Claim)',
          desc: 'Claimed on CV, but no project/internship proof exists in profile.',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'Profile Gap':
      default:
        return {
          label: 'Profile Gap (Skill Lacking)',
          desc: 'Target JD requires this skill, but neither profile nor CV has it.',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
    }
  };

  const handleReAnalyze = async () => {
    await triggerCVAnalysis(profile.resumeText || undefined);
  };

  const hasResume = Boolean(profile.resumeText);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>CV Intelligence • 3-Way Gap Diagnostic</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Triad Reconciliation: Profile ↔ CV ↔ Target JD
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Consumes your resume and target JD directly from the Command Center Cockpit. Evaluates ATS compatibility and pinpoints omitted skills, unsubstantiated claims, and missing requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReAnalyze}
              disabled={isAiProcessing || !hasResume}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
            >
              {isAiProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-Audit CV Dossier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Source Dossier Summary */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Role:</span>
            <span className="font-semibold text-white">{activeJD.title} ({activeJD.company})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Resume Source:</span>
            {hasResume ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> Synchronized from Command Center ({profile.resumeText?.split(/\s+/).filter(Boolean).length || 0} words)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Not uploaded yet (Paste in Command Center)
              </span>
            )}
          </div>
        </div>

        {aiError && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {!cvAnalysis ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No CV Gap Analysis Available</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Please paste or upload your resume in the Command Center Cockpit to trigger automated 3-way gap reconciliation.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                ATS Compatibility
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-400">{cvAnalysis.targetJDAlignmentScore || cvAnalysis.completenessScore}</span>
                <span className="text-slate-500 text-xs">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Keyword parse rate</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                Quantified Bullets
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-indigo-400">
                  {Math.round((cvAnalysis.quantifiedAchievementsRatio || 0.65) * 100)}%
                </span>
                <span className="text-slate-500 text-xs">Ratio</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Points with metrics</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                Action Verbs
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-purple-400">
                  {Math.round((cvAnalysis.activeVoiceRatio || 0.7) * 20)}
                </span>
                <span className="text-slate-500 text-xs">Strong</span>
              </div>
              <span className="text-[10px] text-slate-400 block">High-impact leadership verbs</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                Gaps Reconciled
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-400">
                  {cvAnalysis.gaps?.length || 0}
                </span>
                <span className="text-slate-500 text-xs">Actionable</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Triad discrepancies</span>
            </div>
          </div>

          {/* 3-Way Gap Diagnostic Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Triad Gap Diagnostic Feed
                </h2>
                <p className="text-xs text-slate-400">
                  Classified into CV Gaps (missing from resume), Evidence Gaps (unsubstantiated claims), and Profile Gaps.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['All', 'CV Gap', 'Evidence Gap', 'Profile Gap'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFilter(tab as any)}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      selectedFilter === tab
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Gaps List */}
            <div className="space-y-3">
              {filteredGaps.map((gap, i) => {
                const badge = getGapBadge(gap.gapType);
                return (
                  <div
                    key={i}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{gap.skillOrCapability}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Type: {gap.gapType}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{gap.description}</p>
                    <p className="text-indigo-300 text-[11px] bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                      💡 Recommended Fix: {gap.suggestedAction}
                    </p>
                  </div>
                );
              })}
              {filteredGaps.length === 0 && (
                <p className="text-xs text-slate-500 italic py-6 text-center">
                  No gaps found under filter "{selectedFilter}".
                </p>
              )}
            </div>
          </div>

          {/* Bullet Point Enhancement Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Quantified Bullet Point Rewrite Proposals
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {(cvAnalysis.bulletImprovements || []).map((enhancement, i) => (
                <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">
                      Before (Weak / Vague):
                    </span>
                    <p className="text-slate-400 italic">"{enhancement.original}"</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      After (Quantified & Action-Oriented):
                    </span>
                    <p className="text-white font-medium">"{enhancement.improved}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
