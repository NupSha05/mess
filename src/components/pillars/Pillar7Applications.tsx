import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Send,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  Layers,
  History,
  Building2,
  Calendar,
  ExternalLink,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ApplicationRecord, ApplicationStage } from '../../types';

const STAGE_OPTIONS: ApplicationStage[] = [
  'Applied',
  'Shortlisted',
  'Assessment Pending',
  'GD Pending',
  'Interview Pending',
  'Result Awaited',
  'Selected',
  'Rejected',
  'Withdrawn',
  'Other/Custom',
];

export const Pillar7Applications: React.FC = () => {
  const { applications, allJDs, activeJD, updateApplicationStage, addApplication } = useCareerSaathi();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Interview' | 'Selected' | 'Closed'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppDetail, setSelectedAppDetail] = useState<ApplicationRecord | null>(null);

  // New application form state - all fields start empty so user is never forced with a pre-filled company
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newAppType, setNewAppType] = useState<'On-Campus' | 'Off-Campus'>('Off-Campus');
  const [newSource, setNewSource] = useState('Company Careers Portal');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newStage, setNewStage] = useState<ApplicationStage>('Applied');
  const [newNotes, setNewNotes] = useState('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');

  // Duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState<ApplicationRecord | null>(null);
  const [allowDuplicateBypass, setAllowDuplicateBypass] = useState(false);

  // Filter applications
  const filteredApps = applications.filter((app) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return !['Selected', 'Rejected', 'Withdrawn'].includes(app.stage);
    if (activeFilter === 'Interview') return ['Assessment Pending', 'GD Pending', 'Interview Pending', 'Result Awaited'].includes(app.stage);
    if (activeFilter === 'Selected') return app.stage === 'Selected';
    if (activeFilter === 'Closed') return ['Rejected', 'Withdrawn'].includes(app.stage);
    return true;
  });

  // Calculate actual funnel metrics deterministically (Only from stored records)
  const totalApps = applications.length;
  const activeCount = applications.filter((a) => !['Selected', 'Rejected', 'Withdrawn'].includes(a.stage)).length;
  const shortlisted = applications.filter((a) => ['Shortlisted', 'Assessment Pending', 'GD Pending', 'Interview Pending', 'Result Awaited', 'Selected'].includes(a.stage)).length;
  const interviews = applications.filter((a) => ['Interview Pending', 'Result Awaited', 'Selected'].includes(a.stage)).length;
  const offers = applications.filter((a) => a.stage === 'Selected').length;
  const rejections = applications.filter((a) => a.stage === 'Rejected').length;

  const handleSelectOpportunityPreset = (jdId: string) => {
    setSelectedOpportunityId(jdId);
    const target = allJDs.find((j) => j.id === jdId);
    if (target) {
      setNewCompany(target.company);
      setNewRole(target.title);
      setNewLocation(target.location);
    }
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    // Duplicate detection check
    const existing = applications.find(
      (a) =>
        a.company.trim().toLowerCase() === newCompany.trim().toLowerCase() &&
        a.role.trim().toLowerCase() === newRole.trim().toLowerCase()
    );

    if (existing && !allowDuplicateBypass) {
      setDuplicateWarning(existing);
      return;
    }

    addApplication({
      company: newCompany.trim(),
      role: newRole.trim(),
      appliedDate: newDate,
      stage: newStage,
      applicationType: newAppType,
      source: newSource,
      sourceUrl: newSourceUrl.trim() || undefined,
      opportunityId: selectedOpportunityId || undefined,
      location: newLocation.trim(),
      notes: newNotes.trim(),
    });

    // Reset
    setNewCompany('');
    setNewRole('');
    setNewLocation('');
    setNewNotes('');
    setNewSourceUrl('');
    setSelectedOpportunityId('');
    setDuplicateWarning(null);
    setAllowDuplicateBypass(false);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Send className="w-4 h-4" />
              <span>Pillar 7 • Application Intelligence & Funnel Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Lifecycle Application Tracker & Transparent Health
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Manual recording is the authoritative source behavior. All statistics derive strictly from recorded entries—no fabricated recruitment probabilities or synthetic averages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setNewCompany('');
                setNewRole('');
                setNewLocation('');
                setSelectedOpportunityId('');
                setNewSourceUrl('');
                setNewNotes('');
                setDuplicateWarning(null);
                setAllowDuplicateBypass(false);
                setShowAddModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track New Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Funnel Analytics (Deterministic from Recorded Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Tracked</span>
          <span className="text-2xl font-black text-white">{totalApps}</span>
          <span className="text-[10px] text-slate-500 block">{activeCount} active in pipeline</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Shortlisted</span>
          <span className="text-2xl font-black text-indigo-400">{shortlisted}</span>
          <span className="text-[10px] text-slate-500 block">
            {totalApps >= 3 ? `${Math.round((shortlisted / totalApps) * 100)}% Conv.` : 'Baseline stage'}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Assessments / Interviews</span>
          <span className="text-2xl font-black text-amber-400">{interviews}</span>
          <span className="text-[10px] text-slate-500 block">Requiring active prep</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Selected / Offers</span>
          <span className="text-2xl font-black text-emerald-400">{offers}</span>
          <span className="text-[10px] text-slate-500 block">Successful conversions</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Closed / Inactive</span>
          <span className="text-2xl font-black text-slate-400">{rejections}</span>
          <span className="text-[10px] text-slate-500 block">Archived transitions</span>
        </div>
      </div>

      {/* Insufficient data disclosure if totalApps < 3 */}
      {totalApps > 0 && totalApps < 3 && (
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            You have {totalApps} recorded application(s). Insufficient volume for a statistically meaningful conversion percentage (minimum 3 applications required).
          </span>
        </div>
      )}

      {/* Filter Tabs & Application List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Application Lifecycle Pipeline
            </h2>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['All', 'Active', 'Interview', 'Selected', 'Closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-10 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300">No applications found under filter "{activeFilter}".</p>
            <p className="text-slate-500">
              Click 'Track New Application' to record opportunities and manage stage transitions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-5 space-y-4 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">{app.company}</h3>
                      <span className="text-xs text-indigo-400 font-semibold">• {app.role}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {app.applicationType || 'Off-Campus'}
                      </span>
                      {app.opportunityId && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          Linked to JD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Applied: {app.appliedDate} • {app.location || 'Remote/Campus'} • Source: {app.source || 'Direct'}
                    </p>
                  </div>

                  {/* Stage Transition Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:inline">Current Stage:</span>
                    <select
                      value={app.stage}
                      onChange={(e) => updateApplicationStage(app.id, e.target.value as ApplicationStage)}
                      className="bg-slate-900 border border-indigo-500/50 text-indigo-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer"
                    >
                      {STAGE_OPTIONS.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Transparent Application Health Indicator */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Application Health & Recency:
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        app.healthCategory === 'Healthy'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : app.healthCategory === 'Requires Attention'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : app.healthCategory === 'No recorded update'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {app.healthCategory}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{app.healthRationale}</p>
                  {app.notes && (
                    <p className="text-indigo-300/80 text-[11px] italic pt-1 border-t border-slate-800/80">
                      Notes: {app.notes}
                    </p>
                  )}
                </div>

                {/* Timeline of Application Events */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3 text-indigo-400" />
                    Verified Stage Transitions & Events ({app.events?.length || app.history?.length || 1}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(app.events || []).map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="font-semibold text-white">{ev.newStage}</span>
                        <span className="text-slate-400 text-[10px]">({ev.eventDate})</span>
                        {ev.notes && <span className="text-slate-400 text-[10px]">"{ev.notes}"</span>}
                      </div>
                    ))}
                    {(!app.events || app.events.length === 0) &&
                      app.history.map((h, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span className="font-semibold text-white">{h.stage}</span>
                          <span className="text-slate-400 text-[10px]">
                            ({h.timestamp ? new Date(h.timestamp).toLocaleDateString() : 'Recorded'})
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Track New Application */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Record Job Application</h3>
                <p className="text-xs text-slate-400">Manual entry is authoritative. Tracks lifecycle & events.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setDuplicateWarning(null);
                  setAllowDuplicateBypass(false);
                }}
                className="text-slate-400 hover:text-white text-sm px-1.5 py-0.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Duplicate Application Alert Banner */}
            {duplicateWarning && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Potential Duplicate Application Detected</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  You are already tracking an application for <strong className="text-white">{duplicateWarning.company} — {duplicateWarning.role}</strong> (Current Stage: <span className="text-indigo-300 font-semibold">{duplicateWarning.stage}</span>, Applied: {duplicateWarning.appliedDate}).
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAllowDuplicateBypass(true);
                      setDuplicateWarning(null);
                    }}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg font-semibold hover:bg-amber-500/30 cursor-pointer"
                  >
                    Track As Separate Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setDuplicateWarning(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-3.5 text-xs">
              {/* Option to preload from parsed Opportunity */}
              {allJDs.length > 0 && (
                <div>
                  <label className="text-slate-400 block mb-1">Link to Target Opportunity (Optional):</label>
                  <select
                    value={selectedOpportunityId}
                    onChange={(e) => handleSelectOpportunityPreset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    <option value="">-- Manual / Direct Application --</option>
                    {allJDs.map((jd) => (
                      <option key={jd.id} value={jd.id}>
                        {jd.company} • {jd.title} ({jd.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Google / Microsoft"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. SDE-1 / Product Analyst"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Application Type</label>
                  <select
                    value={newAppType}
                    onChange={(e) => setNewAppType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    <option value="On-Campus">On-Campus Placement</option>
                    <option value="Off-Campus">Off-Campus Direct</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Initial Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as ApplicationStage)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    {STAGE_OPTIONS.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Application Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Location / Mode</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Bengaluru (Hybrid)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Source Portal / Job Link</label>
                <input
                  type="text"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://careers.company.com/job/1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Notes & Context</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Referral contact, assessment link expected by Friday, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setDuplicateWarning(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
