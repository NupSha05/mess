import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  CheckSquare,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Filter,
  Sparkles,
  AlertTriangle,
  Briefcase,
  Target,
  ShieldAlert,
  Layers,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { TabType } from '../Navigation';
import { NextBestAction } from '../../types';

interface ActionCenterViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({ setActiveTab }) => {
  const { actions, profile, readiness, activeJD } = useCareerSaathi();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [filterTier, setFilterTier] = useState<string>('All');

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getPillarTab = (pillarTarget: string): TabType => {
    if (pillarTarget.includes('Academic') || pillarTarget.includes('Profile')) return 'pillar-1-profile';
    if (pillarTarget.includes('Career') || pillarTarget.includes('Skill')) return 'pillar-3-career';
    if (pillarTarget.includes('Match') || pillarTarget.includes('JD') || pillarTarget.includes('CV')) return 'pillar-4-opportunity';
    if (pillarTarget.includes('LinkedIn')) return 'pillar-6-linkedin';
    if (pillarTarget.includes('Practice') || pillarTarget.includes('Coach')) return 'pillar-8-practice';
    return 'pillar-1-profile';
  };

  // Tier counts
  const p1Count = actions.filter((a) => a.priorityTier === 'Priority 1 — Must-Have').length;
  const p2Count = actions.filter((a) => a.priorityTier === 'Priority 2 — Desirable').length;
  const p3Count = actions.filter((a) => a.priorityTier === 'Priority 3 — Good-to-Have').length;
  const presentationGapCount = actions.filter((a) => a.gapCategory === 'CV Presentation Gap').length;

  const filteredActions = actions.filter((a) => {
    if (filterTier === 'All') return true;
    if (filterTier === 'P1') return a.priorityTier === 'Priority 1 — Must-Have';
    if (filterTier === 'P2') return a.priorityTier === 'Priority 2 — Desirable';
    if (filterTier === 'P3') return a.priorityTier === 'Priority 3 — Good-to-Have';
    if (filterTier === 'presentation') return a.gapCategory === 'CV Presentation Gap';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>Job-Specific Action Center • Strategic Recruitment Roadmap</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              What to Work On First for {activeJD.title || 'Target Role'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Targeted priority roadmap answering: <em>"What do I need to work on first to improve my suitability for this specific job?"</em> Requirements are strictly classified into Must-Have, Desirable, and Good-to-Have tiers, prioritizing immediate resume presentation fixes before time-consuming skill learning.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Target Organization:</span>
              <span className="font-bold text-purple-300">{activeJD.company || 'Selected Role'}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">Action Progress:</span>
              <span className="font-bold text-emerald-400">{completedIds.length} of {actions.length} Completed</span>
            </div>
          </div>
        </div>

        {/* Priority Tier Metrics Snapshot */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <span className="text-[10px] text-rose-300 uppercase font-bold block">Priority 1: Must-Have</span>
            <span className="text-2xl font-black text-rose-400">{p1Count}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Compulsory role gates</span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <span className="text-[10px] text-indigo-300 uppercase font-bold block">Priority 2: Desirable</span>
            <span className="text-2xl font-black text-indigo-400">{p2Count}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Competitive advantages</span>
          </div>
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Priority 3: Good-to-Have</span>
            <span className="text-2xl font-black text-slate-200">{p3Count}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Supplementary capabilities</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">Presentation Quick Wins</span>
            <span className="text-2xl font-black text-amber-400">{presentationGapCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Already in profile, fix CV!</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Filter by Requirement Tier:</span>
            {[
              { id: 'All', label: `All Actions (${actions.length})` },
              { id: 'P1', label: `Priority 1: Must-Have (${p1Count})` },
              { id: 'P2', label: `Priority 2: Desirable (${p2Count})` },
              { id: 'P3', label: `Priority 3: Good-to-Have (${p3Count})` },
              { id: 'presentation', label: `CV Quick Wins (${presentationGapCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTier(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer text-xs ${
                  filterTier === tab.id
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-lg space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">All actions in this filter are addressed!</p>
            <p className="text-xs text-slate-400">
              Select another requirement tier or switch target job descriptions to audit other roles.
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isDone = completedIds.includes(action.id);
            const targetTab = getPillarTab(action.pillarTarget);

            const tierBadge =
              action.priorityTier === 'Priority 1 — Must-Have'
                ? { bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30', label: 'Priority 1 — Must-Have (Compulsory)' }
                : action.priorityTier === 'Priority 2 — Desirable'
                ? { bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', label: 'Priority 2 — Desirable (Advantage)' }
                : { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: 'Priority 3 — Good-to-Have (Bonus)' };

            const isPresentationFix = action.gapCategory === 'CV Presentation Gap';

            return (
              <div
                key={action.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => toggleComplete(action.id)}
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400 bg-slate-800'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-2 flex-1">
                      {/* Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${tierBadge.bg}`}>
                          {tierBadge.label}
                        </span>

                        {isPresentationFix && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ★ CV Presentation Quick Win (Zero Re-Learning)
                          </span>
                        )}

                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                          {action.effort}
                        </span>

                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                          {action.urgency}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3
                          className={`font-bold text-sm text-white ${
                            isDone ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {action.title}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{action.description}</p>
                      </div>

                      {/* Evidence & Status Details */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Requirement Addressed:</span>
                          <span className="font-semibold text-slate-200">
                            {action.requirementAddressed || action.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Current Evidence Status:</span>
                          <span className={`font-semibold ${isPresentationFix ? 'text-amber-300' : 'text-slate-300'}`}>
                            {action.currentEvidenceStatus || 'Documented in candidate intelligence'}
                          </span>
                        </div>
                      </div>

                      {/* Strategic Rationale & Expected Outcome */}
                      <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                        <div>
                          <span className="font-semibold text-indigo-400">Recommended Action: </span>
                          <span className="text-slate-300">{action.recommendedAction || action.description}</span>
                        </div>
                        {action.expectedOutcome && (
                          <div>
                            <span className="font-semibold text-emerald-400">Expected Outcome: </span>
                            <span className="text-slate-300">{action.expectedOutcome}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation CTA */}
                  <div className="flex items-center md:self-center shrink-0">
                    <button
                      onClick={() => setActiveTab(targetTab)}
                      className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                    >
                      <span>Take Action in {action.pillarTarget.split(':')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
