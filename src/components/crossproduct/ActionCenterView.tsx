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
} from 'lucide-react';
import { TabType } from '../Navigation';

interface ActionCenterViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({ setActiveTab }) => {
  const { actions, profile, readiness } = useCareerSaathi();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [filterImpact, setFilterImpact] = useState<string>('All');

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getPillarTab = (pillarTarget: string): TabType => {
    if (pillarTarget.includes('Academic')) return 'pillar-2-academics';
    if (pillarTarget.includes('JD') || pillarTarget.includes('Opportunity')) return 'pillar-4-opportunity';
    if (pillarTarget.includes('CV')) return 'pillar-5-cv';
    if (pillarTarget.includes('LinkedIn')) return 'pillar-6-linkedin';
    if (pillarTarget.includes('Practice') || pillarTarget.includes('Preparation')) return 'pillar-8-practice';
    return 'pillar-1-profile';
  };

  const filteredActions =
    filterImpact === 'All'
      ? actions
      : actions.filter((a) => a.impact === filterImpact);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>Cross-Product Layer • Action Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Prioritized Next Best Actions
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Turn multidimensional intelligence into concrete next steps. Prioritized strictly by urgency, evidence impact, and your target recruitment deadlines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl font-bold">
              {completedIds.length} of {actions.length} Completed
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Filter by Impact:</span>
            {['All', 'High Impact', 'Medium Impact'].map((imp) => (
              <button
                key={imp}
                onClick={() => setFilterImpact(imp)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filterImpact === imp
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {imp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-lg space-y-2">
            <p className="text-sm font-semibold text-white">No actions in this view.</p>
            <p className="text-xs text-slate-400">
              Configure your candidate profile, target opportunity, or CV analysis to generate prioritized strategic milestones.
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
          const isDone = completedIds.includes(action.id);
          const targetTab = getPillarTab(action.pillarTarget);

          return (
            <div
              key={action.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleComplete(action.id)}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400 bg-slate-800'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-bold text-sm text-white ${
                          isDone ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {action.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          action.impact === 'High Impact'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {action.impact}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {action.effort}
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-medium">
                        {action.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{action.description}</p>

                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                      <span className="font-semibold text-indigo-400">Why this matters:</span>
                      <span>{action.rationale}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:self-center shrink-0">
                  <button
                    onClick={() => setActiveTab(targetTab)}
                    className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Open in {action.pillarTarget.split(':')[0]}</span>
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
