import React from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  LineChart,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  History,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Scale,
  BrainCircuit,
  Info,
} from 'lucide-react';

export const Pillar9Readiness: React.FC = () => {
  const { readiness, readinessSnapshots, eventImpactLog, profile, activeJD, practiceSessions } = useCareerSaathi();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <LineChart className="w-4 h-4" />
              <span>Pillar 9 • Readiness Intelligence & Event-Impact Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Contextual Career Readiness Diagnostic
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strictly explainable and evidence-grounded. Dynamically synthesizes academic standing, profile proof, skill depth, target opportunity alignment, and mock practice performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Readiness Index</span>
              <div className="flex items-baseline space-x-1.5 justify-end">
                <span className="text-2xl font-black text-emerald-400">{readiness.overallScore}</span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible AI Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Diagnostic Preparation Metric • Not a hiring probability, quota prediction, or employment guarantee.
          </span>
          <span className="font-mono text-slate-500 text-[10px]">
            Methodology: {readiness.methodologyVersion || 'v2.1-contextual'}
          </span>
        </div>
      </div>

      {/* Deep-Dive on the 5 Dimensions (Contextual, No Fixed Universal Weights) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* 1. Academic */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Academic</span>
              <span className="text-[10px] text-blue-400 font-mono font-semibold">Foundational</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-white">{readiness.academicReadiness}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            {profile.education.gradingSystem === 'percentage' && profile.education.percentageValue
              ? `${profile.education.percentageValue}% across ${profile.education.termsCompleted || profile.education.terms?.length || 'all'} terms.`
              : `${(profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 0).toFixed(2)} CGPA (${profile.education.degreeStatus === 'completed' ? 'Completed' : `${profile.education.termsCompleted || profile.education.terms?.length || 1} terms completed`}).`}
          </p>
        </div>

        {/* 2. Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Profile</span>
              <span className="text-[10px] text-indigo-400 font-mono font-semibold">Evidence</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-white">{readiness.profileReadiness}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            {profile.experiences.length > 0 ? `${profile.experiences.length} experience(s)` : 'No industry tenure'}, and {profile.projects.length} repository project(s).
          </p>
        </div>

        {/* 3. Skill Depth */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3. Skill Depth</span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">Verified Tiers</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-white">{readiness.skillReadiness}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            {profile.skills.length > 0
              ? `${profile.skills.length} technical competencies documented with Level 0-4 proof.`
              : 'No skills registered in profile.'}
          </p>
        </div>

        {/* 4. Opportunity Alignment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">4. Opportunity</span>
              <span className="text-[10px] text-purple-400 font-mono font-semibold">Role-Fit</span>
            </div>
            <div className="flex items-baseline space-x-1">
              {readiness.opportunityReadiness !== null ? (
                <>
                  <span className="text-3xl font-black text-white">{readiness.opportunityReadiness}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </>
              ) : (
                <span className="text-xs text-slate-500 italic font-mono pt-2">No Active JD</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            {readiness.opportunityReadiness !== null
              ? `Evaluated against ${activeJD?.company || 'target role'} criteria.`
              : readiness.opportunityReadinessNote || 'Opportunity readiness cannot yet be assessed without an active JD.'}
          </p>
        </div>

        {/* 5. Interview Prep */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">5. Interview Prep</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Practice Coach</span>
            </div>
            <div className="flex items-baseline space-x-1">
              {readiness.interviewReadiness !== null ? (
                <>
                  <span className="text-3xl font-black text-white">{readiness.interviewReadiness}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </>
              ) : (
                <span className="text-xs text-slate-500 italic font-mono pt-2">No Practice Yet</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            {readiness.interviewReadiness !== null
              ? `Derived from ${practiceSessions.length} rubric evaluations in Pillar 8.`
              : readiness.interviewReadinessNote || 'Insufficient practice data recorded.'}
          </p>
        </div>
      </div>

      {/* Why This State? Detailed Explainability Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positive Contributors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Positive Contributors (Helping Readiness)</span>
          </div>
          {readiness.positiveContributors && readiness.positiveContributors.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {readiness.positiveContributors.map((c, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No significant positive signals recorded yet.</p>
          )}
        </div>

        {/* Limiting Factors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Limiting Factors (Constraining Readiness)</span>
          </div>
          {readiness.limitingFactors && readiness.limitingFactors.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {readiness.limitingFactors.map((f, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No major blockers detected.</p>
          )}
        </div>

        {/* Missing Information & Highest-Leverage Action */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Missing Information</span>
            </div>
            {readiness.missingInformation && readiness.missingInformation.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-300">
                {readiness.missingInformation.map((m, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">All 5 dimensions populated with verified student evidence.</p>
            )}
          </div>

          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">
              Recommended Next Best Action:
            </span>
            <p className="text-white font-medium">{readiness.recommendedNextAction}</p>
          </div>
        </div>
      </div>

      {/* Historical Trend & Snapshots Evolution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Historical Readiness Snapshots & Trajectory Trend
            </h2>
            <p className="text-xs text-slate-400">
              Computed strictly from recorded snapshots over time—never hardcoded.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Trend Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                readiness.trend === 'Improving'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : readiness.trend === 'Declining'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : readiness.trend === 'Stable'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {readiness.trend}
            </span>
          </div>
        </div>

        {readinessSnapshots.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <p>Not enough historical data to establish a reliable trend.</p>
            <p className="text-slate-500">
              Snapshots are automatically created when your profile evidence, application state, or practice evaluations update.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {readinessSnapshots.slice(-6).map((snap, idx) => (
                <div
                  key={snap.id || idx}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>{snap.timestamp ? new Date(snap.timestamp).toLocaleDateString() : 'Snapshot'}</span>
                    <span className="font-bold text-emerald-400">{snap.overallScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${snap.overallScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate" title={snap.triggerEvent}>
                    {snap.triggerEvent || 'State Update'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event-Impact Matrix Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Event → Impact Traceability Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Audits which actions triggered selective recalculation across the 9 pillars.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{eventImpactLog.length} Events Logged</span>
        </div>

        {eventImpactLog.length === 0 ? (
          <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500">
            No event transitions logged yet in this workspace.
          </div>
        ) : (
          <div className="space-y-2.5">
            {eventImpactLog.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.eventType}</span>
                    <span className="text-[10px] font-mono text-indigo-400">• {log.sourcePillar}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.explanation}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {log.affectedDimensions.map((dim, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
