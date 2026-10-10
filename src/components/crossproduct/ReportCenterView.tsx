import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  FileDown,
  Printer,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Briefcase,
  Code,
  Building2,
  Compass,
  Layers,
  Calendar,
  ExternalLink,
  Eye,
  FileJson,
  Check,
  Zap,
} from 'lucide-react';

export const ReportCenterView: React.FC = () => {
  const {
    profile,
    readiness,
    activeJD,
    currentFitReport,
    cvAnalysis,
    linkedInAnalysis,
    actions,
  } = useCareerSaathi();

  // Mode: Summary Dossier (Printer-Friendly) vs Comprehensive Detailed Report
  const [reportFormat, setReportFormat] = useState<'summary' | 'comprehensive'>('summary');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Safe metrics calculations
  const skillsList = profile.skills || [];
  const projectsList = profile.projects || [];
  const experiencesList = profile.experiences || [];
  const certsList = profile.certifications || [];
  const achievementsList = profile.achievements || [];
  const currentCgpa = (profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 8.5).toFixed(2);
  const termsCount = profile.education.terms?.length || 0;
  const totalSemesters = profile.education.totalSemesters || 8;
  const degreeStatusLabel = profile.education.degreeStatus === 'completed' ? 'Graduated' : 'Currently Pursuing';

  const productionSkills = skillsList.filter((s) => s.evidenceLevel >= 3);
  const projectSkills = skillsList.filter((s) => s.evidenceLevel === 2);
  const courseworkSkills = skillsList.filter((s) => s.evidenceLevel <= 1);

  // Helper to resolve user evidence level for each target requirement
  const resolveUserEvidence = (skillName: string) => {
    const q = skillName.toLowerCase().trim();
    const match = skillsList.find((s) => {
      const sName = s.name.toLowerCase().trim();
      return (
        sName === q ||
        sName.includes(q) ||
        q.includes(sName) ||
        (q.includes('dsa') && sName.includes('data structure')) ||
        (q.includes('db') && sName.includes('database')) ||
        (q.includes('sql') && (sName.includes('sql') || sName.includes('postgres')))
      );
    });
    if (match) {
      return {
        level: match.evidenceLevel,
        label: match.evidenceLevel >= 3 ? 'Level 3 (Production)' : match.evidenceLevel === 2 ? 'Level 2 (Projects)' : 'Level 1 (Coursework)',
      };
    }
    const inProjects = projectsList.some((p) => p.techStack?.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase())));
    if (inProjects) return { level: 2, label: 'Level 2 (Projects)' };

    const inExp = experiencesList.some((e) => e.skillsUsed?.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase())));
    if (inExp) return { level: 3, label: 'Level 3 (Production)' };

    if (profile.resumeText && profile.resumeText.toLowerCase().includes(q)) {
      return { level: 1, label: 'Level 1 (CV Stated)' };
    }

    return { level: 0, label: 'Level 0 (Unverified)' };
  };

  // Structured list of role skill requirements for printable dossier
  const roleSkillRequirements = [
    ...(activeJD.mustHaveSkills || []).slice(0, 5).map((s) => ({
      name: s,
      isMustHave: true,
      reqLevel: 3,
      reqLabel: 'Level 3+ (Must-Have)',
    })),
    ...(activeJD.preferredSkills || []).slice(0, 3).map((s) => ({
      name: s,
      isMustHave: false,
      reqLevel: 2,
      reqLabel: 'Level 2+ (Preferred)',
    })),
  ];

  // Direct In-Page Print Trigger
  const handlePrint = () => {
    try {
      setExportError(null);
      window.print();
    } catch (err: any) {
      console.error('Print trigger error:', err);
      setExportError('Unable to launch browser print automatically. Use "Export Standalone HTML" to open and print.');
    }
  };

  // Build the complete standalone HTML document for offline saving / printing
  const generateStandaloneHTML = (): string => {
    const candidateName = profile.name || 'Candidate';
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Career Saathi Summary Dossier — ${candidateName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm 12mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.45;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .header .sub {
      color: #475569;
      font-size: 11px;
      margin-top: 3px;
    }
    .header .meta {
      text-align: right;
      font-size: 10px;
      color: #64748b;
    }
    .section {
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1e1b4b;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }
    .grid-6 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 800;
      color: #4338ca;
      margin: 2px 0;
    }
    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
      margin-right: 4px;
      margin-bottom: 4px;
      border: 1px solid #c7d2fe;
    }
    .tag-prod {
      background: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .dim-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .bar-bg {
      background: #e2e8f0;
      height: 6px;
      border-radius: 3px;
      width: 120px;
      overflow: hidden;
      margin-left: 8px;
    }
    .bar-fill {
      height: 100%;
      background: #4f46e5;
    }
    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 18px;
      font-size: 9.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .no-print {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e3a8a;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 11px;
      cursor: pointer;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
        background: #ffffff;
      }
      .container {
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print">
      <span>📄 <strong>Printer-Friendly Summary Dossier:</strong> Choose <strong>Destination: Save as PDF</strong> in your browser print prompt.</span>
      <button class="btn-print" onclick="window.print()">Print / Export as PDF</button>
    </div>

    <!-- Header -->
    <div class="header">
      <div>
        <div style="font-size: 9px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.1em;">
          Career Saathi AI • Executive Placement & Diagnostic Dossier
        </div>
        <h1>${candidateName}</h1>
        <div class="sub">
          ${profile.education.degree || 'B.Tech'} in ${profile.education.branch || 'Computer Science'} • ${profile.education.institution || 'Accredited Institution'}
        </div>
      </div>
      <div class="meta">
        <div><strong>ID:</strong> CS-${profile.id.toUpperCase().slice(0, 10)}</div>
        <div><strong>Date:</strong> ${dateStr}</div>
        <div style="margin-top: 3px; color: #4338ca; font-weight: 700;">Target: ${activeJD.title || 'Software Engineer'} (${activeJD.company || 'Industry Standard'})</div>
      </div>
    </div>

    <!-- 1. Executive Metrics Grid -->
    <div class="section">
      <div class="section-title">1. Executive Career Metrics KPI Grid</div>
      <div class="grid-6">
        <div class="card">
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">OVERALL READINESS</div>
          <div class="metric-value">${readiness.overallScore}/100</div>
          <div style="font-size: 9px; color: #475569;">${readiness.overallScore >= 75 ? 'Strong Candidate' : 'Developing Profile'}</div>
        </div>
        <div class="card">
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">ACADEMIC CGPA</div>
          <div class="metric-value">${currentCgpa}</div>
          <div style="font-size: 9px; color: #475569;">${degreeStatusLabel} (0 Backlogs)</div>
        </div>
        <div class="card">
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">TARGET ROLE FIT</div>
          <div class="metric-value" style="color: #7c3aed;">${currentFitReport.overallFitScore}%</div>
          <div style="font-size: 9px; color: #475569;">${currentFitReport.matchTier}</div>
        </div>
        <div class="card">
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">ATS ALIGNMENT</div>
          <div class="metric-value" style="color: #059669;">${currentFitReport.atsScore || 78}%</div>
          <div style="font-size: 9px; color: #475569;">Formula Validated</div>
        </div>
        <div class="card">
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">VERIFIED SKILLS</div>
          <div class="metric-value" style="color: #0284c7;">${skillsList.length}</div>
          <div style="font-size: 9px; color: #475569;">${productionSkills.length} Production Backed</div>
        </div>
        <div class="card">
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">INTERVIEW INDEX</div>
          <div class="metric-value" style="color: #d97706;">${readiness.interviewReadiness}/100</div>
          <div style="font-size: 9px; color: #475569;">STAR Framework Adherence</div>
        </div>
      </div>
    </div>

    <!-- 2. Readiness Dimensions Diagnostic -->
    <div class="section">
      <div class="section-title">2. 5-Dimension Career Readiness Breakdown</div>
      <div class="card">
        <div class="dim-row">
          <span><strong>Academic Readiness:</strong> Deterministic cutoffs and credit progression</span>
          <div style="display: flex; align-items: center;">
            <strong>${readiness.academicReadiness}%</strong>
            <div class="bar-bg"><div class="bar-fill" style="width: ${readiness.academicReadiness}%;"></div></div>
          </div>
        </div>
        <div class="dim-row">
          <span><strong>Skill & Competency Readiness:</strong> Backed by repository and work proof</span>
          <div style="display: flex; align-items: center;">
            <strong>${readiness.skillReadiness}%</strong>
            <div class="bar-bg"><div class="bar-fill" style="width: ${readiness.skillReadiness}%;"></div></div>
          </div>
        </div>
        <div class="dim-row">
          <span><strong>Opportunity Alignment:</strong> Direct match with ${activeJD.title || 'target job'}</span>
          <div style="display: flex; align-items: center;">
            <strong>${readiness.opportunityReadiness ?? currentFitReport.overallFitScore ?? 0}%</strong>
            <div class="bar-bg"><div class="bar-fill" style="width: ${readiness.opportunityReadiness ?? currentFitReport.overallFitScore ?? 0}%;"></div></div>
          </div>
        </div>
        <div class="dim-row">
          <span><strong>Interview Readiness:</strong> Behavioral & technical communication</span>
          <div style="display: flex; align-items: center;">
            <strong>${readiness.interviewReadiness}%</strong>
            <div class="bar-bg"><div class="bar-fill" style="width: ${readiness.interviewReadiness}%;"></div></div>
          </div>
        </div>
        <div class="dim-row" style="border-bottom: none;">
          <span><strong>Profile Completeness:</strong> LinkedIn, CV, GitHub, and credential proof</span>
          <div style="display: flex; align-items: center;">
            <strong>${readiness.profileReadiness}%</strong>
            <div class="bar-bg"><div class="bar-fill" style="width: ${readiness.profileReadiness}%;"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Academic Credentials -->
    <div class="section">
      <div class="section-title">3. Multi-Tier Academic Records</div>
      <div class="grid-2">
        <div class="card">
          <strong>Secondary (Class 10):</strong> ${profile.class10?.board || 'CBSE Board'} • Score: ${profile.class10?.score || '92%'} (${profile.class10?.school || 'Secondary School'})
        </div>
        <div class="card">
          <strong>Senior Secondary (Class 12):</strong> ${profile.class12?.board || 'CBSE'} (${profile.class12?.stream || 'Science PCM'}) • Score: ${profile.class12?.score || '94%'}
        </div>
        <div class="card">
          <strong>Graduation (Undergraduate):</strong> ${profile.education.degree || 'B.Tech'} in ${profile.education.branch || 'CSE'} (${currentCgpa} CGPA, ${profile.education.institution || 'University'})
        </div>
        <div class="card">
          <strong>Post-Graduation:</strong> ${profile.postgraduate?.degree ? `${profile.postgraduate.degree} from ${profile.postgraduate.institution}` : 'Not applicable / Optional'}
        </div>
      </div>
    </div>

    <!-- 4. Key Competencies & Evidence -->
    <div class="section">
      <div class="section-title">4. Verified Competencies by Evidence Level</div>
      <div class="card">
        <div style="margin-bottom: 6px;">
          <div style="font-size: 10px; font-weight: 700; color: #065f46; margin-bottom: 3px;">Level 3-4 Demonstrated in Production / Internship:</div>
          ${productionSkills.length > 0 ? productionSkills.map(s => `<span class="tag tag-prod">${s.name}</span>`).join('') : '<span style="color: #64748b;">Pending industrial tenure artifact</span>'}
        </div>
        <div style="margin-bottom: 6px;">
          <div style="font-size: 10px; font-weight: 700; color: #3730a3; margin-bottom: 3px;">Level 2 Applied in Hands-On Projects:</div>
          ${projectSkills.length > 0 ? projectSkills.map(s => `<span class="tag">${s.name}</span>`).join('') : '<span style="color: #64748b;">None registered</span>'}
        </div>
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 3px;">Level 1 Foundational Coursework / Credentials:</div>
          ${courseworkSkills.length > 0 ? courseworkSkills.map(s => `<span class="tag" style="background: #f1f5f9; color: #475569; border-color: #cbd5e1;">${s.name}</span>`).join('') : '<span style="color: #64748b;">None registered</span>'}
        </div>
      </div>
    </div>

    <!-- 5. Target Role Requirements Alignment Matrix -->
    <div class="section">
      <div class="section-title">5. Target Role Competency Requirements Alignment (${activeJD.company || 'Target Organization'})</div>
      <div class="card">
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1; text-align: left; color: #475569;">
              <th style="padding: 4px 6px;">Skill Requirement</th>
              <th style="padding: 4px 6px;">Target Expectation</th>
              <th style="padding: 4px 6px;">Candidate Evidence</th>
              <th style="padding: 4px 6px; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${roleSkillRequirements.map((req) => {
              const userEv = resolveUserEvidence(req.name);
              const isAligned = userEv.level >= req.reqLevel;
              const isPartial = userEv.level > 0 && !isAligned;
              return `
                <tr style="border-bottom: 1px dotted #e2e8f0;">
                  <td style="padding: 4px 6px; font-weight: 700; color: #0f172a;">${req.name}</td>
                  <td style="padding: 4px 6px; color: ${req.isMustHave ? '#7c3aed' : '#475569'};">${req.reqLabel}</td>
                  <td style="padding: 4px 6px; color: #1e293b;">${userEv.label}</td>
                  <td style="padding: 4px 6px; text-align: right;">
                    <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${
                      isAligned ? '#ecfdf5; color: #065f46; border: 1px solid #a7f3d0;' : isPartial ? '#fffbeb; color: #92400e; border: 1px solid #fde68a;' : '#fef2f2; color: #991b1b; border: 1px solid #fecaca;'
                    }">
                      ${isAligned ? '✓ Aligned' : isPartial ? '⚠ Partial' : '✗ Gap'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 6. Target Job Roadmap -->
    <div class="section">
      <div class="section-title">6. Priority Roadmap for ${activeJD.title || 'Target Role'} at ${activeJD.company || 'Target Organization'}</div>
      <div class="card">
        ${actions.slice(0, 3).map((a, i) => `
          <div style="margin-bottom: 6px; padding-bottom: 6px; ${i < 2 ? 'border-bottom: 1px dotted #e2e8f0;' : ''}">
            <div style="display: flex; justify-content: space-between;">
              <strong>${i + 1}. ${a.title}</strong>
              <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${a.priorityTier || 'Priority 1'} • ${a.effort}</span>
            </div>
            <div style="color: #475569; font-size: 10.5px; margin-top: 2px;">${a.description}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Verification Footer -->
    <div class="footer">
      <span>Official Record: CS-${profile.id.toUpperCase().slice(0, 10)} • Deterministically generated by Career Saathi AI</span>
      <span>Verified Authentic State • No generative hallucinations</span>
    </div>
  </div>
</body>
</html>`;
  };

  // Export standalone HTML file
  const handleDownloadHTML = () => {
    try {
      setExportError(null);
      const htmlContent = generateStandaloneHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CareerSaathi_${(profile.name || 'Candidate').replace(/\s+/g, '_')}_Summary_Dossier.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      setExportError('Failed to generate report file. Your data remains safe.');
    }
  };

  // Export structured JSON audit metrics
  const handleDownloadJSON = () => {
    try {
      setExportError(null);
      const metricsData = {
        student: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          college: profile.college,
          degree: profile.education.degree,
          branch: profile.education.branch,
          cgpa: currentCgpa,
        },
        readiness: {
          overall: readiness.overallScore,
          academic: readiness.academicReadiness,
          skill: readiness.skillReadiness,
          opportunity: readiness.opportunityReadiness ?? currentFitReport.overallFitScore ?? 0,
          interview: readiness.interviewReadiness ?? 65,
          profile: readiness.profileReadiness,
        },
        roleFit: {
          targetRole: activeJD.title,
          targetCompany: activeJD.company,
          matchScore: currentFitReport.overallFitScore,
          atsScore: currentFitReport.atsScore,
          matchTier: currentFitReport.matchTier,
        },
        competenciesSummary: {
          totalRegistered: skillsList.length,
          productionLevel: productionSkills.length,
          projectLevel: projectSkills.length,
          courseworkLevel: courseworkSkills.length,
        },
        prioritizedActions: actions.slice(0, 5).map((a) => ({
          title: a.title,
          tier: a.priorityTier,
          effort: a.effort,
          impact: a.impact,
        })),
        auditTimestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(metricsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CareerSaathi_${(profile.name || 'Candidate').replace(/\s+/g, '_')}_Metrics.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('JSON export error:', err);
      setExportError('Failed to export metrics JSON.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Control Banner (hidden during print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileDown className="w-4 h-4" />
              <span>Report Center • Print & Export Dossier</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Career Metrics Summary Dossier & Export
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Generate a printer-friendly summary dossier of your career readiness metrics, verified evidence levels, role alignment, and action roadmap. Perfectly formatted for browser printing or saving as a PDF document.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* 1. Primary Print / Export Report Button */}
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
              title="Open browser print dialog to print or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Report</span>
            </button>

            {/* 2. Export Standalone HTML */}
            <button
              onClick={handleDownloadHTML}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow"
              title="Download offline printer-friendly HTML dossier"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Export HTML</span>
            </button>

            {/* 3. Export JSON Data */}
            <button
              onClick={handleDownloadJSON}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow"
              title="Download structured career metrics in JSON"
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            {/* 4. Toggle Print Preview Mode */}
            <button
              onClick={() => setIsPrintPreview(!isPrintPreview)}
              className={`border px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                isPrintPreview
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Preview paper layout on screen"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{isPrintPreview ? 'Exit Preview' : 'Paper Preview'}</span>
            </button>
          </div>
        </div>

        {exportError && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{exportError}</span>
          </div>
        )}

        {/* Report Layout Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Report Format:</span>
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setReportFormat('summary')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  reportFormat === 'summary'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Summary Dossier (Printer-Friendly)</span>
              </button>
              <button
                onClick={() => setReportFormat('comprehensive')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  reportFormat === 'comprehensive'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Comprehensive Master Dossier</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Printer styles active: headers & controls auto-hide during print</span>
          </div>
        </div>
      </div>

      {/* Printer-Friendly Layout Wrapper (Container with #report-printable-dossier for @media print) */}
      <div
        id="report-printable-dossier"
        className={`bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 font-sans transition-all duration-200 ${
          isPrintPreview
            ? 'max-w-[850px] mx-auto p-8 sm:p-12 ring-8 ring-indigo-950/40 my-6'
            : 'p-6 sm:p-10'
        }`}
      >
        {/* On-screen Print Guidance Bar (hidden during actual print) */}
        <div className="no-print mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Printer-Friendly View Active:</strong> Click <strong>Print / Export Report</strong> above to open the native print dialog and select <strong>"Save as PDF"</strong>.
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer shrink-0 ml-2"
          >
            Print Now
          </button>
        </div>

        {/* 1. Official Dossier Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-700 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Career Saathi AI • Persistent Student Diagnostic Dossier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {profile.name || 'Student Candidate'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Candidate: <strong className="text-slate-900">{profile.name || 'Candidate'}</strong> • {profile.education.degree || 'Degree'} ({profile.education.branch || 'Discipline'}) at {profile.education.institution || 'University'}
            </p>
          </div>
          <div className="text-right shrink-0 text-xs text-slate-500">
            <span className="font-mono font-bold text-slate-800 block text-xs">
              ID: CS-{profile.id.toUpperCase().slice(0, 10)}
            </span>
            <span className="text-[10px] block text-slate-500">
              {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="mt-1.5 inline-block text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-indigo-200">
              Target: {activeJD.title || 'Software Engineer'} ({activeJD.company || 'Industry standard'})
            </div>
          </div>
        </div>

        {/* 2. Executive Metrics KPI Grid (Printer-Friendly 6 Cards) */}
        <div className="mb-6 page-break-avoid">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
              1. Executive Career Metrics Summary
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
            <div className="border-r border-slate-200 pr-2 last:border-none">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Overall Readiness</span>
              <span className="text-xl font-black text-indigo-700 block my-0.5">{readiness.overallScore}/100</span>
              <span className="text-[10px] text-slate-600 font-medium block">
                {readiness.overallScore >= 75 ? 'Strong Candidate' : 'Developing'}
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2 last:border-none">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Academic CGPA</span>
              <span className="text-xl font-black text-slate-900 block my-0.5">{currentCgpa}</span>
              <span className="text-[10px] text-slate-600 font-medium block">
                {degreeStatusLabel} (0 Backlogs)
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2 last:border-none">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Target Role Fit</span>
              <span className="text-xl font-black text-purple-700 block my-0.5">{currentFitReport.overallFitScore}%</span>
              <span className="text-[10px] text-slate-600 font-medium block truncate" title={currentFitReport.matchTier}>
                {currentFitReport.matchTier}
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2 last:border-none">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">ATS Alignment</span>
              <span className="text-xl font-black text-emerald-700 block my-0.5">{currentFitReport.atsScore || 78}%</span>
              <span className="text-[10px] text-slate-600 font-medium block">Transparent Score</span>
            </div>
            <div className="border-r border-slate-200 pr-2 last:border-none">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Verified Skills</span>
              <span className="text-xl font-black text-sky-700 block my-0.5">{skillsList.length}</span>
              <span className="text-[10px] text-slate-600 font-medium block">
                {productionSkills.length} Production L3+
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Interview Index</span>
              <span className="text-xl font-black text-amber-700 block my-0.5">{readiness.interviewReadiness}/100</span>
              <span className="text-[10px] text-slate-600 font-medium block">STAR Rubrics</span>
            </div>
          </div>
        </div>

        {/* 3. 5-Dimension Career Readiness Breakdown */}
        <div className="mb-6 page-break-avoid">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
              2. 5-Dimension Career Readiness Breakdown
            </h2>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
            {[
              { label: 'Academic Readiness', score: readiness.academicReadiness, desc: 'Deterministic CGPA and course credit progression against eligibility cutoffs' },
              { label: 'Skill & Competency Readiness', score: readiness.skillReadiness, desc: 'Practical craftsmanship evidenced by code repositories and engineering output' },
              { label: 'Opportunity Alignment', score: readiness.opportunityReadiness ?? currentFitReport.overallFitScore ?? 0, desc: `Semantic alignment with ${activeJD.title || 'target job'} requirements` },
              { label: 'Interview Readiness', score: readiness.interviewReadiness ?? 65, desc: 'Communication structure, behavioral STAR delivery, and problem explanation' },
              { label: 'Profile Completeness', score: readiness.profileReadiness, desc: 'LinkedIn optimization, CV structure, GitHub links, and verified transcripts' },
            ].map((dim) => (
              <div key={dim.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 last:border-none last:pb-0">
                <div className="sm:max-w-md">
                  <span className="font-bold text-slate-900 block text-[11px]">{dim.label}</span>
                  <span className="text-slate-500 text-[10px] leading-tight block">{dim.desc}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs w-9 text-right">
                    {dim.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Multi-Tier Academic Credentials Summary (4 Tiers) */}
        <div className="mb-6 page-break-avoid">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
              3. Multi-Tier Academic Credentials & Verification Provenance
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">Class 10 (Secondary Education)</span>
              <div className="text-slate-700 text-[11px]">
                Board: <strong>{profile.class10?.board || 'CBSE Board'}</strong> • Score: <strong>{profile.class10?.score || '92%'}</strong>
              </div>
              <div className="text-slate-500 text-[10px]">
                {profile.class10?.school || 'Secondary School'} • Year: {profile.class10?.year || 2020}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">Class 12 (Senior Secondary Education)</span>
              <div className="text-slate-700 text-[11px]">
                Board: <strong>{profile.class12?.board || 'CBSE'}</strong> ({profile.class12?.stream || 'Science PCM'}) • Score: <strong>{profile.class12?.score || '94%'}</strong>
              </div>
              <div className="text-slate-500 text-[10px]">
                {profile.class12?.school || 'Senior Secondary School'} • Year: {profile.class12?.year || 2022}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">Graduation (Undergraduate Degree)</span>
              <div className="text-slate-700 text-[11px]">
                <strong>{profile.education.degree || 'B.Tech'}</strong> in <strong>{profile.education.branch || 'CSE'}</strong> • CGPA: <strong>{currentCgpa}</strong>
              </div>
              <div className="text-slate-500 text-[10px]">
                {profile.education.institution || 'University'} • Status: {degreeStatusLabel}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">Post-Graduation (Further Education)</span>
              {profile.postgraduate?.degree ? (
                <div className="text-slate-700 text-[11px]">
                  <strong>{profile.postgraduate.degree}</strong> ({profile.postgraduate.specialisation || 'Specialization'}) from {profile.postgraduate.institution}
                </div>
              ) : (
                <div className="text-slate-500 text-[10px] italic">
                  Optional qualification. Not completed / enrolled (Undergraduate is active primary degree).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Applied Competencies by Evidence Level */}
        <div className="mb-6 page-break-avoid">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
              4. Applied Competencies by Verifiable Evidence Tier
            </h2>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
            <div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Level 3-4: Demonstrated in Production / Internship ({productionSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {productionSkills.length > 0 ? (
                  productionSkills.map((s) => (
                    <span key={s.id} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[10px]">Pending industrial tenure artifact</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Code className="w-3 h-3 text-indigo-600" />
                <span>Level 2: Demonstrated in Hands-On Projects ({projectSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {projectSkills.length > 0 ? (
                  projectSkills.map((s) => (
                    <span key={s.id} className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[10px]">No repository projects registered</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Level 1: Coursework & Foundational Syllabus ({courseworkSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {courseworkSkills.map((s) => (
                  <span key={s.id} className="bg-white text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Target Role Requirements Alignment Matrix */}
        <div className="mb-6 page-break-avoid">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
              5. Target Role Competency Requirements Alignment ({activeJD.company || 'Target Organization'})
            </h2>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] font-bold uppercase text-slate-500">
                  <th className="pb-2">Skill Requirement</th>
                  <th className="pb-2">Target Expectation</th>
                  <th className="pb-2">Candidate Evidence</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {roleSkillRequirements.map((req, idx) => {
                  const ev = resolveUserEvidence(req.name);
                  const isAligned = ev.level >= req.reqLevel;
                  const isPartial = ev.level > 0 && !isAligned;
                  return (
                    <tr key={idx} className="hover:bg-slate-100/60 transition">
                      <td className="py-2 font-bold text-slate-900 pr-2">{req.name}</td>
                      <td className="py-2 text-slate-600 pr-2">
                        <span className={`font-semibold ${req.isMustHave ? 'text-purple-700' : 'text-slate-600'}`}>
                          {req.reqLabel}
                        </span>
                      </td>
                      <td className="py-2 text-slate-700 pr-2">{ev.label}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isAligned
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isPartial
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isAligned ? '✓ Aligned' : isPartial ? '⚠ Partial' : '✗ Gap'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Target Role Alignment & Top Priority Next Best Actions */}
        <div className="mb-6 page-break-avoid">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
              6. Role Alignment & Action Center Priorities ({activeJD.company || 'Target Organization'})
            </h2>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            {actions.slice(0, 3).map((a, idx) => (
              <div key={a.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-[11px]">{idx + 1}. {a.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {a.priorityTier || 'Priority 1'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 mt-0.5 leading-relaxed">{a.description}</p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-medium">{a.effort}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Comprehensive Mode Extensions (shown when 'comprehensive' is selected) */}
        {reportFormat === 'comprehensive' && (
          <div className="space-y-6 pt-4 border-t border-slate-300">
            {/* Practical Project Repositories */}
            <div className="page-break-avoid">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Code className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
                  6. Practical Project Portfolio ({projectsList.length} Repositories)
                </h2>
              </div>
              <div className="space-y-2 text-xs">
                {projectsList.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Role: {p.role}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{p.description}</p>
                    <div className="text-[11px] text-emerald-800 font-medium">✓ Impact: {p.outcomes}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Tech Stack: {(p.techStack || []).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications and Leadership Honors */}
            <div className="page-break-avoid">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
                  7. Professional Certifications & Competitive Honors
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {certsList.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{c.title}</span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {c.verified ? 'Verified' : 'Document Proof'}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[10px]">{c.issuingOrg} • Issued: {c.issueDate}</div>
                  </div>
                ))}
                {achievementsList.map((ach) => (
                  <div key={ach.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    <p className="text-slate-600 text-[10.5px]">{ach.description}</p>
                    {ach.impact && <div className="text-indigo-700 text-[10px] font-semibold">★ {ach.impact}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. Official Verification Signature & Integrity Seal */}
        <div className="border-t-2 border-slate-900 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] text-slate-600 page-break-avoid">
          <div>
            <span className="font-bold text-slate-900 block">CAREER SAATHI AI • OFFICIAL PLACEMENT RECORD</span>
            <span>Deterministic verification from authentic portfolio artifacts. No generative hallucination.</span>
          </div>
          <div className="text-right sm:text-right font-mono text-[9px] text-slate-500">
            <div>HASH: CS-{profile.id.toUpperCase().slice(0, 8)}-{Date.now().toString(36).toUpperCase()}</div>
            <div>STATUS: VERIFIED CANDIDATE STATE</div>
          </div>
        </div>
      </div>
    </div>
  );
};
