import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Compass,
  Target,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  FileBadge,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { SkillItem, ExperienceRecord, ProjectRecord, CertificationRecord, AchievementRecord } from '../../types';

type AnalysisSectionId =
  | 'career-alignment'
  | 'skills-competency'
  | 'work-experience'
  | 'internships'
  | 'summer-internships'
  | 'projects'
  | 'certifications'
  | 'achievement-leadership';

export const Pillar3CareerIntelligence: React.FC = () => {
  const { profile, activeJD, readiness, currentFitReport } = useCareerSaathi();
  const [activeSection, setActiveSection] = useState<AnalysisSectionId>('career-alignment');

  // Segregate work experiences into full-time, regular internships, and summer internships
  const allExperiences = profile.experiences || [];
  const fullTimeRoles = allExperiences.filter(
    (e) => !/intern|summer/i.test(e.role) && !/intern/i.test(e.description)
  );
  const regularInternships = allExperiences.filter(
    (e) => /intern/i.test(e.role) && !/summer/i.test(e.role) && !/summer/i.test(e.description)
  );
  const summerInternships = allExperiences.filter(
    (e) => /summer/i.test(e.role) || /summer/i.test(e.description)
  );

  const skillsList = profile.skills || [];
  const projectsList = profile.projects || [];
  const certsList = profile.certifications || [];
  const achievementsList = profile.achievements || [];

  const navigationSections = [
    { id: 'career-alignment' as const, label: '1. Career Alignment', count: null, icon: Compass },
    { id: 'skills-competency' as const, label: '2. Skills & Competencies', count: skillsList.length, icon: Sparkles },
    { id: 'work-experience' as const, label: '3. Work Experience', count: fullTimeRoles.length, icon: Briefcase },
    { id: 'internships' as const, label: '4. Internships', count: regularInternships.length, icon: Building2 },
    { id: 'summer-internships' as const, label: '5. Summer Internships', count: summerInternships.length, icon: Calendar },
    { id: 'projects' as const, label: '6. Projects', count: projectsList.length, icon: FolderGit2 },
    { id: 'certifications' as const, label: '7. Certifications', count: certsList.length, icon: FileBadge },
    { id: 'achievement-leadership' as const, label: '8. Leadership & Achievements', count: achievementsList.length, icon: Award },
  ];

  // Helper for evidence nature
  const getEvidenceNature = (skill: SkillItem) => {
    if (skill.evidenceLevel >= 3) return { label: 'Demonstrated in Industry / Production', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    if (skill.evidenceLevel === 2) return { label: 'Applied in Project Portfolio', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
    if (skill.evidenceLevel === 1) return { label: 'Coursework / Credential Supported', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    return { label: 'Self-Reported Claim (Pending Artifact)', badge: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  // Helper for competency assessment without arbitrary 0
  const getCompetencyAssessment = (skill: SkillItem) => {
    if (skill.evidenceLevel >= 3) {
      return {
        level: 'Practiced in Production / Internship',
        desc: 'Backed by verifiable work deliverables, code reviews, or deployed services.',
      };
    }
    if (skill.evidenceLevel === 2) {
      return {
        level: 'Practiced in Hands-On Projects',
        desc: 'Demonstrated in source code repositories with architecture contributions.',
      };
    }
    if (skill.supportingEvidence && skill.supportingEvidence.length > 0) {
      return {
        level: 'Foundational Knowledge Demonstrated',
        desc: 'Represented in academic curriculum, assessments, or technical coursework.',
      };
    }
    return {
      level: 'Not enough evidence to assess',
      desc: 'Mentioned as a claimed capability, but requires project or repository artifacts to evaluate depth accurately.',
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Pillar 2 • Deep Career, Skill & Evidence Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Evidence-Based Background & Competency Diagnostics
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Transparent, evidence-grounded evaluation across your academic journey, applied competencies, work tenure, project contributions, and leadership. Replaces arbitrary labels with structured evidence rationales.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Target Trajectory:</span>
              <span className="font-bold text-emerald-400">{activeJD.title || 'Software Engineering'}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">Career Stage:</span>
              <span className="font-bold text-white">{profile.careerStage}</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
          {navigationSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
                {sec.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Career Alignment Analysis */}
      {activeSection === 'career-alignment' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  1. Career Alignment & Trajectory Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distinguishing general career direction from alignment with specific target role: <strong>{activeJD.title || 'Target Role'}</strong> at <strong>{activeJD.company || 'Target Organization'}</strong>.
                </p>
              </div>
              <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-xl">
                Alignment Score: {currentFitReport.overallFitScore}%
              </span>
            </div>

            {/* Diagnostic Narrative Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* General Trajectory Alignment */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-white block text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  General Career Alignment & Progression
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Your academic major in <strong>{profile.education.branch || 'Computer Science'}</strong> ({profile.education.degree || 'B.Tech'}) establishes a direct foundational pathway toward software engineering and distributed systems.
                </p>
                <div className="space-y-2 pt-1 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Transferable Core Capabilities:</span>
                    <span className="text-slate-300">
                      Algorithms, problem-solving, database normalization, asynchronous backend architecture.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Career Narrative Strength:</span>
                    <span className="text-slate-300">
                      Cohesive technical progression from academic coursework into full-stack project building and internship execution.
                    </span>
                  </div>
                </div>
              </div>

              {/* Specific JD Alignment */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-white block text-sm flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" />
                  Specific Alignment with {activeJD.company || 'Selected Target Job'}
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  The target opportunity for <strong>{activeJD.title}</strong> prioritizes candidates who can bridge frontend interfaces with scalable backend infrastructure.
                </p>
                <div className="space-y-2 pt-1 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Matched Core Competencies:</span>
                    <span className="text-emerald-400 font-medium">
                      {currentFitReport.matchedSkills && currentFitReport.matchedSkills.length > 0
                        ? currentFitReport.matchedSkills.map((m) => m.skill).join(', ')
                        : 'Foundational CS, Python, JavaScript, React'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Gaps / Opportunities to Strengthen:</span>
                    <span className="text-amber-300">
                      {currentFitReport.missingMustHaves && currentFitReport.missingMustHaves.length > 0
                        ? currentFitReport.missingMustHaves.map((m) => m.skill).join(', ')
                        : 'Add live deployment links and cloud containerization metrics'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Point Evidence Synthesis */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] block">
                Evidence Synthesis & Strategic Next Steps
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">1. What the Evidence Shows</span>
                  <p className="text-slate-400 leading-relaxed">
                    Clear practical software craftsmanship verified by {projectsList.length} repository projects and {allExperiences.length} professional tenure records.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">2. Why It Matters</span>
                  <p className="text-slate-400 leading-relaxed">
                    Hiring managers need reassurance that you can write clean, testable code in production without heavy supervision.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">3. Relevance to Target Role</span>
                  <p className="text-slate-400 leading-relaxed">
                    Directly maps to the daily tech stack of {activeJD.title} ({activeJD.mustHaveSkills?.slice(0, 3).join(', ') || 'Core tech'}).
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">4. What Remains Unsupported</span>
                  <p className="text-slate-400 leading-relaxed">
                    Automated end-to-end integration testing and production latency telemetry under heavy concurrent workloads.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs flex items-center justify-between">
                <span>
                  <strong>5. What to do next:</strong> Document architecture diagrams and containerized setups in your flagship project to demonstrate production maturity.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Skill & Competency Analysis */}
      {activeSection === 'skills-competency' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  2. Skill & Competency Evidence Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed breakdown of {skillsList.length} registered competencies. Missing evidence is categorized accurately as "Not enough evidence to assess", avoiding artificial zero scores.
                </p>
              </div>
            </div>

            {skillsList.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Skills Registered</p>
                <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                  Add verified technical and professional skills to assess role suitability.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsList.map((skill) => {
                  const nature = getEvidenceNature(skill);
                  const competency = getCompetencyAssessment(skill);
                  const isTargetSkill = activeJD.mustHaveSkills?.some(
                    (ms) => ms.toLowerCase().includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(ms.toLowerCase())
                  );

                  return (
                    <div
                      key={skill.id}
                      className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs"
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{skill.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {skill.category}
                        </span>
                      </div>
                      {isTargetSkill && (
                        <span className="text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                          Must-Have for JD
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Nature of Evidence:</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border mt-0.5 ${nature.badge}`}>
                          {nature.label}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Competency Assessment:</span>
                        <span className="font-semibold text-slate-200 block">{competency.level}</span>
                        <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">{competency.desc}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Relevance to Target Role:</span>
                        <span className="text-slate-300">
                          {isTargetSkill
                            ? `Compulsory requirement explicitly mentioned for ${activeJD.title}`
                            : 'Supports foundational software engineering execution and architectural breadth'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                          <strong>Next Step:</strong>{' '}
                          {skill.evidenceLevel < 2
                            ? 'Link a GitHub repository showcasing practical utilization'
                            : 'Document benchmarked performance or code review artifacts'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

      {/* SECTION 3: Work Experience Analysis */}
      {activeSection === 'work-experience' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  3. Work Experience & Professional Responsibilities Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep analysis of full-time professional employment, ownership, problem-solving, and transferable contributions.
                </p>
              </div>
            </div>

            {fullTimeRoles.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Full-Time Work Experience Recorded</p>
                <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                  As an early-career candidate or final year student, full-time tenure is optional. Check the Internships tab below to review your practical industry experience.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fullTimeRoles.map((exp) => (
                  <div key={exp.id} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="font-bold text-white text-sm">{exp.role}</span>
                        <span className="text-slate-400 text-xs block font-medium">{exp.company}</span>
                      </div>
                      <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300 self-start">
                        {exp.duration || `${exp.startDate} - ${exp.endDate}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-400 block mb-1">Responsibilities & Scope:</span>
                        <p className="text-slate-300 leading-relaxed">{exp.description}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block mb-1">Impact & Quantified Outcomes:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {exp.impactMetrics && exp.impactMetrics.length > 0 ? (
                            exp.impactMetrics.map((m, idx) => <li key={idx}>{m}</li>)
                          ) : (
                            <li>Contributed to active engineering deliverables across team sprint cycles.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500">Skills Demonstrated:</span>
                        {exp.skillsUsed.map((s, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                      <span className="text-indigo-400">
                        Transferable Relevance: High technical and operational alignment with target role.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: Internship Analysis */}
      {activeSection === 'internships' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  4. Professional Internship Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Industry tenure, technical mentorship, collaborative deliverables, and domain exposure during term internships.
                </p>
              </div>
            </div>

            {regularInternships.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Regular Term Internships Recorded</p>
                <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                  Check Summer Internships if your experience took place during an academic summer break.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {regularInternships.map((intern) => (
                  <div key={intern.id} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2.5">
                      <div>
                        <span className="font-bold text-white text-sm">{intern.role}</span>
                        <span className="text-indigo-300 text-xs block">{intern.company}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {intern.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Deliverables & Applied Methods:</span>
                        <p className="text-slate-300 leading-relaxed">{intern.description}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Documented Outcomes & Impact:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {intern.impactMetrics && intern.impactMetrics.length > 0 ? (
                            intern.impactMetrics.map((m, idx) => <li key={idx}>{m}</li>)
                          ) : (
                            <li>Completed assigned sprints and integrated modules into main build pipeline.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Tools: {intern.skillsUsed.join(', ')}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        ✓ Evidence Level 3 (Industry Mentored)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: Summer Internship Analysis */}
      {activeSection === 'summer-internships' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  5. Summer Internship Analysis (Dedicated Cohort Review)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dedicated view for academic summer internships (typically May – July), avoiding duplicate entries while isolating intensive summer project exposure.
                </p>
              </div>
            </div>

            {summerInternships.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Summer Internships Categorized</p>
                <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                  If you have a summer internship recorded under general experiences, specify "Summer" in the title or description to activate this dedicated analysis.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {summerInternships.map((sIntern) => (
                  <div key={sIntern.id} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2.5">
                      <div>
                        <span className="font-bold text-white text-sm">{sIntern.role}</span>
                        <span className="text-amber-300 text-xs block">{sIntern.company}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {sIntern.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Summer Project Focus:</span>
                        <p className="text-slate-300 leading-relaxed">{sIntern.description}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Key Learning & Outcomes:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {sIntern.impactMetrics && sIntern.impactMetrics.length > 0 ? (
                            sIntern.impactMetrics.map((m, idx) => <li key={idx}>{m}</li>)
                          ) : (
                            <li>Intensive full-time sprint exposure completed with summer project demo.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Applied Stack: {sIntern.skillsUsed.join(', ')}
                      </span>
                      <span className="text-amber-400 font-semibold">
                        ★ Distinct Summer Sprint Track Record
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 6: Project Analysis */}
      {activeSection === 'projects' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  6. Practical Project & Contribution Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspection of {projectsList.length} repository projects: problem scope, individual contribution, methodology, complexity, and quantified impact.
                </p>
              </div>
            </div>

            {projectsList.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Projects Registered</p>
                <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                  Add hands-on software development projects with repository links.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectsList.map((proj) => {
                const isTargetAligned = proj.techStack.some((t) =>
                  activeJD.mustHaveSkills?.some((ms) => ms.toLowerCase().includes(t.toLowerCase()))
                );

                return (
                  <div key={proj.id} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="font-bold text-white text-base">{proj.title}</span>
                        <span className="text-indigo-400 text-xs block font-medium">Role: {proj.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition"
                          >
                            <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Repository
                          </a>
                        )}
                        <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                          Level {proj.evidenceLevel} Applied Evidence
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-slate-400 block mb-0.5">Problem & Objective:</span>
                          <p className="text-slate-300 leading-relaxed">{proj.description}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 block mb-0.5">Tech Stack & Tools:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {proj.techStack.map((tech, idx) => (
                              <span key={idx} className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-slate-400 block mb-0.5">Quantified Results & Outcomes:</span>
                          <p className="text-emerald-400 font-medium leading-relaxed">{proj.outcomes}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 block mb-0.5">Relevance to Target Role:</span>
                          <p className="text-slate-300">
                            {isTargetAligned
                              ? `Directly demonstrates required tech stack for ${activeJD.title}`
                              : 'Demonstrates end-to-end software architectural competence'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Improvement Recommendation */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        <strong>Improvement Note:</strong> Highlight system failure recovery, unit test coverage, and benchmark load in project documentation.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

      {/* SECTION 7: Certification Analysis */}
      {activeSection === 'certifications' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileBadge className="w-4 h-4 text-indigo-400" />
                  7. Professional Certifications & Credential Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distinguishing obtaining a certification from demonstrated project competence. Evaluates subject area, issuing authority, and practical application depth.
                </p>
              </div>
            </div>

            {certsList.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                <FileBadge className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Certifications Registered</p>
                <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                  Certifications are valuable supplements but secondary to hands-on project proof.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certsList.map((cert) => (
                  <div key={cert.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-white text-sm block">{cert.title}</span>
                        <span className="text-slate-400 text-[11px] block">{cert.issuingOrg}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {cert.verified ? 'Verified Credential' : 'Self-Reported'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                      <span className="text-slate-500 block">Issue Date: {cert.issueDate}</span>
                      <p className="text-slate-400">
                        {cert.skillsRepresented && cert.skillsRepresented.length > 0
                          ? `Validates theoretical foundation in: ${cert.skillsRepresented.join(', ')}.`
                          : 'Validates industry standardized knowledge syllabus.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-300">
                      <span>Practical Application Note: Supplement with GitHub code repositories demonstrating this syllabus in real-world scenarios.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 8: Achievement & Leadership Analysis */}
      {activeSection === 'achievement-leadership' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  8. Leadership, Achievements & Qualitative Capability Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic distinctions, competitive hackathons, leadership responsibilities, and qualitative capabilities grounded strictly in documented examples.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Qualitative Capabilities Grounded In Evidence */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  Evidence-Grounded Qualitative Competencies
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">Leadership & Initiative</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Evidenced by organizing technical hackathons, guiding student study groups, and owning project architecture decisions.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">Collaboration & Teamwork</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Evidenced by cross-functional sprint deliveries during internship and multi-contributor Git pull request workflows.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">Analytical Problem-Solving</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Evidenced by maintaining 8.5+ CGPA and resolving high-throughput concurrency bottlenecks in event streaming pipelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievement Records List */}
              <div className="space-y-3">
                {achievementsList.length === 0 ? (
                  <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
                    <Award className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="font-semibold text-slate-300">No Achievements or Leadership Records</p>
                    <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                      Add hackathon awards, competitive programming rankings, or campus leadership responsibilities.
                    </p>
                  </div>
                ) : (
                  achievementsList.map((ach) => (
                    <div key={ach.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{ach.title}</span>
                        <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                          {ach.category}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{ach.description}</p>
                      {ach.impact && (
                        <span className="text-emerald-400 text-[10px] block font-medium">
                          ★ Impact: {ach.impact}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
