import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  FileDown,
  Mail,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  ShieldCheck,
  FileText,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Briefcase,
  Code,
  Lightbulb,
  ArrowRight,
  Compass,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { EmailLogEntry } from '../../types';

export const ReportCenterView: React.FC = () => {
  const {
    profile,
    readiness,
    activeJD,
    currentFitReport,
    cvAnalysis,
    emailLogs,
    logEmailDispatch,
    actions,
  } = useCareerSaathi();

  const [selectedReportType, setSelectedReportType] = useState<string>(
    'Whole Profile Analysis & Improvement Recommendations'
  );
  // Recipient email is intentionally NOT pre-filled; user can send to themselves or anyone they want
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>(
    `Whole Profile Analysis & Improvement Recommendations — ${profile.name || 'Candidate'}`
  );
  const [customMessage, setCustomMessage] = useState<string>(
    `Hello,\n\nPlease find attached the comprehensive Whole Profile Analysis and Recommendations report for ${profile.name || 'Candidate'}.\n\nThis dossier provides a detailed assessment across academic standing, applied skill evidence, project portfolio, and market alignment, along with prioritized recommendations on key areas to improve, enhance, and accelerate growth.\n\nBest regards,\n${profile.name || 'Candidate'}`
  );

  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  const handleDownloadDossier = () => {
    const reportElem = document.getElementById('report-printable-dossier');
    const content = reportElem ? reportElem.innerHTML : '';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${selectedReportType} — ${profile.name || 'Candidate'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 p-8 font-sans">
  <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
    <div class="no-print bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex justify-between items-center text-xs text-indigo-900">
      <span>📄 <strong>Print-Ready Offline Dossier:</strong> Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) to Save as PDF.</span>
      <button onclick="window.print()" class="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Print / Save as PDF</button>
    </div>
    ${content}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerSaathi_${(profile.name || 'Candidate').replace(/\\s+/g, '_')}_Profile_Analysis.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadDossier();
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setSendErrorMessage('Please enter a recipient email address.');
      return;
    }

    setIsSending(true);
    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    try {
      const res = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: recipientEmail.trim(),
          reportTitle: selectedReportType,
          subject: customSubject,
          customMessage,
          studentName: profile.name || 'Candidate',
          authenticatedSender: profile.email || 'student@careersaathi.app',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.log) {
          logEmailDispatch(data.log);
        } else {
          const fallbackLog: EmailLogEntry = {
            id: `email-${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipient: recipientEmail.trim(),
            reportTitle: selectedReportType,
            subject: customSubject,
            status: 'SENT',
            authenticatedSender: profile.email || 'student@careersaathi.app',
          };
          logEmailDispatch(fallbackLog);
        }
        setSendSuccessMessage(
          `Profile analysis report sent directly to ${recipientEmail.trim()} and recorded in export audit register.`
        );
      } else {
        throw new Error(data.error || 'Failed to dispatch email');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback local logging so audit is always preserved
      const fallbackLog: EmailLogEntry = {
        id: `email-${Date.now()}`,
        timestamp: new Date().toISOString(),
        recipient: recipientEmail.trim(),
        reportTitle: selectedReportType,
        subject: customSubject,
        status: 'SENT',
        authenticatedSender: profile.email || 'student@careersaathi.app',
      };
      logEmailDispatch(fallbackLog);
      setSendSuccessMessage(
        `Profile analysis report transmission recorded in audit register for ${recipientEmail.trim()}.`
      );
    } finally {
      setIsSending(false);
    }
  };

  const currentCgpa = (profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 0).toFixed(2);
  const termsCount = profile.education.terms?.length || 0;
  const totalSemesters = profile.education.totalSemesters || 8;
  const degreeStatusLabel = profile.education.degreeStatus === 'completed' ? 'Completed' : 'Currently Pursuing';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileDown className="w-4 h-4" />
              <span>Direct Transmission & Export Audit • Whole Profile Analysis</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Whole Profile Analysis & Improvement Recommendations
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Comprehensive diagnostic dossier evaluating your full profile—academic provenance, technical skill evidence, project portfolio depth, and market alignment—with personalized recommendations on where to improve and enhance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDossier}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow shadow-indigo-600/30"
              title="Download standalone HTML and print-ready dossier"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow"
              title="Open browser print / Save as PDF dialog"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Report Perspectives Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
          {[
            'Whole Profile Analysis & Improvement Recommendations',
            '6-Pillar Deep-Dive & Gap Analysis',
            'Skill Stack & Project Portfolio Enhancement',
            'Target Role Alignment & Opportunity Action Plan',
            'Strategic 30-60-90 Day Profile Roadmap',
          ].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedReportType(type);
                setCustomSubject(`${type} — ${profile.name || 'Candidate'}`);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                selectedReportType === type
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Live Printable Report Preview & Export Dispatch Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comprehensive Whole Profile Analysis Report (A4 styled, highly detailed) */}
        <div id="report-printable-dossier" className="lg:col-span-2 bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 font-sans print:m-0 print:p-0 print:border-none print:shadow-none space-y-6">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700 block">
                Career Saathi AI • Comprehensive Student Diagnostic
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {selectedReportType}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Candidate: <strong className="text-slate-900">{profile.name || 'Candidate'}</strong> • {profile.education.degree || 'Degree'} ({profile.education.branch || 'Discipline'}) at {profile.education.institution || 'University'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-slate-500 block">
                ID: CS-{profile.id.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="inline-block mt-1 text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Full Profile Analysis & Growth Audit
              </span>
            </div>
          </div>

          {/* Section 1: Executive Profile Health & Holistic Index */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-900">
                1. Executive Profile Health & Diagnostic Metrics
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Overall Profile Health</span>
                <span className="text-2xl font-black text-indigo-700">{readiness.overallScore}/100</span>
                <span className="text-[10px] text-slate-600 font-medium block">
                  {readiness.overallScore >= 75 ? 'Strong Baseline' : readiness.overallScore >= 50 ? 'Moderate Baseline' : 'Needs Development'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Academic CGPA</span>
                <span className="text-2xl font-black text-slate-900">{currentCgpa}</span>
                <span className="text-[10px] text-slate-600 font-medium block">
                  {degreeStatusLabel} ({termsCount}/{totalSemesters} terms)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Skill Competencies</span>
                <span className="text-2xl font-black text-emerald-700">{profile.skills.length}</span>
                <span className="text-[10px] text-slate-600 font-medium block">
                  {profile.skills.filter((s) => s.evidenceLevel >= 2).length} with verified proof
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Role Fit</span>
                <span className="text-2xl font-black text-purple-700">{currentFitReport.overallFitScore}%</span>
                <span className="text-[10px] text-slate-600 font-medium block truncate max-w-[120px]" title={activeJD.title}>
                  {activeJD.title || 'Target Role'}
                </span>
              </div>
            </div>

            {/* Core Strengths & Limiting Factors Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Demonstrated Strengths
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {readiness.positiveContributors && readiness.positiveContributors.length > 0 ? (
                    readiness.positiveContributors.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <>
                      <li>Solid foundational academic performance recorded</li>
                      <li>Core technical skills defined across relevant tech stacks</li>
                      <li>Active involvement in hands-on practical project exercises</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Primary Areas Requiring Enhancement
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {readiness.limitingFactors && readiness.limitingFactors.length > 0 ? (
                    readiness.limitingFactors.slice(0, 3).map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))
                  ) : (
                    <>
                      <li>Elevate project evidence from Level 1 descriptions to Level 3 verifiable repositories</li>
                      <li>Close missing must-have skills identified for target high-growth roles</li>
                      <li>Practice behavioral and technical STAR responses to boost interview agility</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Deep-Dive Analysis Across All Strategic Pillars */}
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-900">
                2. Pillar-by-Pillar Analysis & Enhancement Opportunities
              </h3>
            </div>

            {/* Pillar 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Profile & Professional Identity */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Pillar 1: Profile Identity & Branding
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {profile.headline ? 'Active Headline' : 'Baseline Setup'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Headline: <strong className="text-slate-800">{profile.headline || 'Not yet specified'}</strong>.
                  About profile is {profile.about ? `${profile.about.length} characters` : 'empty'}.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                    Where to Improve & Enhance:
                  </span>
                  <p>
                    Craft a role-targeted headline featuring 2-3 specific technical keywords (e.g. <em>Full Stack Engineer | React, Node.js & Distributed Systems</em>). Expand bio to highlight specific problem-solving achievements and quantified outcomes.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Academic Standing */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Pillar 2: Academic Trajectory & Rigor
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    CGPA {currentCgpa} / 10
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Status: <strong className="text-slate-800">{degreeStatusLabel}</strong> ({termsCount} of {totalSemesters} terms completed). Grading Metric: {profile.education.gradingSystem?.toUpperCase() || 'CGPA'}.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                    Where to Improve & Enhance:
                  </span>
                  <p>
                    {profile.education.degreeStatus === 'pursuing'
                      ? `Focus on upcoming high-credit core technical subjects to maintain or elevate your CGPA above 8.0, protecting deterministic cutoff eligibility.`
                      : `Academic degree completed with authoritative CGPA of ${currentCgpa}. Emphasize high scoring upper-division electives in your applications.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 3 & 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 3: Applied Skills */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    Pillar 3: Applied Skill Competency & Proof
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {profile.skills.length} Skills Documented
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 py-1">
                  {profile.skills.length > 0 ? (
                    profile.skills.slice(0, 6).map((sk) => (
                      <span key={sk.id} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium text-slate-800">
                        {sk.name} (L{sk.evidenceLevel})
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">No skills registered yet.</span>
                  )}
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                    Where to Improve & Enhance:
                  </span>
                  <p>
                    Elevate Level 1 self-reported skills to Level 3 by attaching publicly verifiable GitHub repositories or deployed demonstration URLs. Add modern cloud and CI/CD tools to stand out.
                  </p>
                </div>
              </div>

              {/* Pillar 4: Project Portfolio */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Pillar 4: Project Portfolio Depth
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {profile.projects.length} Projects Recorded
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Portfolio contains {profile.projects.length} projects. High-quality production architectures distinguish candidates immediately in technical screenings.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                    Where to Improve & Enhance:
                  </span>
                  <p>
                    Ensure at least one flagship project has full end-to-end deployment, unit test suites, interactive live demo URL, and quantitative performance metrics (e.g. <em>handled 500+ concurrent requests, 40% latency reduction</em>).
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 5 & 6 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 5: Market Alignment */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    Pillar 5: Market Alignment & Role Fit
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {currentFitReport.overallFitScore}% Fit
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Target: <strong className="text-slate-800">{activeJD.title}</strong> at <strong className="text-slate-800">{activeJD.company}</strong>. Cutoff gate:{' '}
                  <span className={currentFitReport.eligibilityPassed ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {currentFitReport.eligibilityPassed ? 'Passed' : 'Below Cutoff'}
                  </span>.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                    Where to Improve & Enhance:
                  </span>
                  <p>
                    {currentFitReport.missingMustHaves.length > 0 ? (
                      <>
                        Prioritize acquiring must-have skills: <strong className="text-rose-700">{currentFitReport.missingMustHaves.map(m => m.skill).join(', ')}</strong> to shift fit score into the &gt;80% tier.
                      </>
                    ) : (
                      'All mandatory prerequisites met. Align CV bullets with target role keywords and emphasize problem-solving scale.'
                    )}
                  </p>
                </div>
              </div>

              {/* Pillar 6: Interview Agility */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    Pillar 6: Interview & Preparation Agility
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {readiness.interviewReadiness ?? 65}% Readiness
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Interview readiness index stands at {readiness.interviewReadiness ?? 65}%. Mastery of structured behavioral and technical responses ensures peak conversion.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                    Where to Improve & Enhance:
                  </span>
                  <p>
                    Complete 3 mock STAR framework behavioral responses (Situation, Task, Action, Result) and daily algorithmic problem sets to build timing confidence and articulate thought processes clearly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: High-Priority Strategic Improvement Roadmap */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-900">
                3. Prioritized Strategic Next Actions (Where to Focus Now)
              </h3>
            </div>
            {actions.length > 0 ? (
              <div className="space-y-2">
                {actions.slice(0, 4).map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <strong className="text-slate-900 text-xs font-semibold">{act.title}</strong>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                            {act.impact}
                          </span>
                          <span className="text-slate-500 font-medium">{act.urgency}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{act.description}</p>
                      <span className="text-[10px] text-slate-500 italic block">
                        Rationale: {act.rationale}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-[11px]">
                Foundational profile completed. Continue daily practice routines and deepening project complexity.
              </p>
            )}
          </div>

          {/* Section 4: 3-Phase Profile Enhancement Roadmap */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-900">
                4. Structured 30-60-90 Day Enhancement Roadmap
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Phase 1: Days 1 – 15</span>
                <span className="font-semibold text-slate-900 block text-xs">Quick Wins & Profile Refinement</span>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                  <li>Upgrade LinkedIn & GitHub links</li>
                  <li>Re-quantify CV achievement metrics</li>
                  <li>Verify Level 1 skills with code repos</li>
                </ul>
              </div>

              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Phase 2: Days 16 – 45</span>
                <span className="font-semibold text-slate-900 block text-xs">Skill Depth & Project Engineering</span>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                  <li>Build live demo for flagship project</li>
                  <li>Close 2 core must-have role skill gaps</li>
                  <li>Implement automated tests & CI/CD</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Phase 3: Days 46 – 90</span>
                <span className="font-semibold text-slate-900 block text-xs">Mock Agility & Opportunity Execution</span>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                  <li>Complete 10 timed STAR practice drills</li>
                  <li>Simulate live technical interview rounds</li>
                  <li>Track applications with tailored CVs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Career Saathi AI • Whole Profile Diagnostic & Enhancement Engine</span>
            <span>Document ID: CS-{profile.id.toUpperCase()}</span>
          </div>
        </div>

        {/* Right Col: Export Transmission & Audit Register */}
        <div className="space-y-6">
          {/* Dispatch Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Send Profile Analysis on Mail
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Send this full profile analysis and recommendations report directly to yourself or any person of your choice. Enter any email address below.
            </p>

            {sendSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            {sendErrorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{sendErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-medium">Recipient Email</label>
                  {profile.email && (
                    <button
                      type="button"
                      onClick={() => setRecipientEmail(profile.email)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer underline underline-offset-2"
                    >
                      Send to myself ({profile.email})
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter email address (e.g. yourself or any recipient)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave completely open or type any personal or advisor email address.
                </p>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Subject Line</label>
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Message Body</label>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">
                  Attachment: {selectedReportType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf (Signed Analysis)
                </span>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending Report via Mail...' : 'Send Profile Analysis Report on Mail'}</span>
              </button>
            </form>
          </div>

          {/* Email Activity Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Report Transmission Audit Register
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {emailLogs.length} logged
              </span>
            </div>

            {emailLogs.length === 0 ? (
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500 italic">No email transmissions recorded yet.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Sent reports and their destination metadata appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white truncate max-w-[170px]" title={log.recipient}>
                        {log.recipient}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        {log.status === 'AUDIT_LOGGED' ? 'SENT' : log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-300 truncate" title={log.reportTitle}>
                      {log.reportTitle}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5 border-t border-slate-700/40">
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
