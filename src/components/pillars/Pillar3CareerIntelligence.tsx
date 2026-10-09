import React from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Target,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Compass,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { EvidenceLevel } from '../../types';

export const Pillar3CareerIntelligence: React.FC = () => {
  const { profile, activeJD, readiness } = useCareerSaathi();

  const getEvidenceLevelText = (lvl: EvidenceLevel) => {
    switch (lvl) {
      case 4:
        return { label: 'Level 4: Industry Production', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 3:
        return { label: 'Level 3: Internship / Capstone', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 2:
        return { label: 'Level 2: Academic / Repo Project', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 1:
        return { label: 'Level 1: Coursework / Theory', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 0:
      default:
        return { label: 'Level 0: Claim (No Evidence)', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const highEvidenceSkills = profile.skills.filter((s) => s.evidenceLevel >= 3);
  const mediumEvidenceSkills = profile.skills.filter((s) => s.evidenceLevel === 2);
  const foundationalSkills = profile.skills.filter((s) => s.evidenceLevel <= 1);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Pillar 3 • Career & Profile Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Evidence Maturity & Directional Alignment
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Career Saathi separates mere claims from verified proof. No single universal profile formula is forced; intelligence is strictly contextual to your target trajectory.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Career Stage:</span>
            <span className="font-bold text-white">{profile.careerStage}</span>
          </div>
        </div>
      </div>

      {/* Conceptual Separation Box: Profile Strength vs Role Fit vs Readiness */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          The Triad of Career Truth (Blueprint Locked Separation)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="font-bold text-white block mb-1">1. Profile Strength (Intrinsic)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Measures the depth and verification level of your portfolio, academics, and experiences regardless of any single company.
            </p>
            <span className="text-indigo-400 font-bold block mt-2 text-sm">{readiness.profileReadiness}% Strength</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="font-bold text-white block mb-1">2. Role Fit (Contextual)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Measures how closely your verified evidence matches a specific job description (e.g. {activeJD.company}).
            </p>
            <span className="text-purple-400 font-bold block mt-2 text-sm">{readiness.opportunityReadiness}% Fit</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="font-bold text-white block mb-1">3. Career Readiness (Aggregate)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Multi-dimensional operational index incorporating your readiness to pass interview screening and recruitment rounds.
            </p>
            <span className="text-emerald-400 font-bold block mt-2 text-sm">{readiness.overallScore}/100 Readiness</span>
          </div>
        </div>
      </div>

      {/* Evidence Hierarchy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level 3-4 High Evidence Capabilities */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Verified & High Proof ({highEvidenceSkills.length})
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-semibold">
              Level 3–4
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Backed by live production codebase, paid internship metrics, or full repository architectures.
          </p>
          <div className="space-y-2.5">
            {highEvidenceSkills.length > 0 ? (
              highEvidenceSkills.map((s) => (
                <div key={s.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{s.relevance}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    {s.supportingEvidence.map((ev, i) => (
                      <div key={i} className="truncate">• {ev}</div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No Level 3–4 evidence recorded. Add verified internship or production work in Pillar 1.
              </p>
            )}
          </div>
        </div>

        {/* Level 2 Project Evidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Project Proof ({mediumEvidenceSkills.length})
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded font-semibold">
              Level 2
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Backed by academic and personal code repositories, demonstrating functional synthesis.
          </p>
          <div className="space-y-2.5">
            {mediumEvidenceSkills.length > 0 ? (
              mediumEvidenceSkills.map((s) => (
                <div key={s.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-[10px] text-purple-300 font-semibold">{s.relevance}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    {s.supportingEvidence.map((ev, i) => (
                      <div key={i} className="truncate">• {ev}</div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No Level 2 project proof recorded. Log code repositories in Pillar 1.
              </p>
            )}
          </div>
        </div>

        {/* Level 0-1 Foundational & Gaps */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Coursework / Unbacked ({foundationalSkills.length})
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-semibold">
              Level 0–1
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Theory or claim only. Prime targets for conversion into repository or deployed evidence.
          </p>
          <div className="space-y-2.5">
            {foundationalSkills.length > 0 ? (
              foundationalSkills.map((s) => (
                <div key={s.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{s.relevance}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1">
                    {s.supportingEvidence.join(', ')}
                  </p>
                  <span className="text-[10px] text-indigo-400 font-medium block">
                    Action: Build 1 deployed module to upgrade to Level 2
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No foundational or unbacked skills logged. Add skills in Pillar 1.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
