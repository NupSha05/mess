import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import { useTheme } from '../../context/ThemeContext';
import {
  calculateDeterministicCGPA,
  calculateTargetFeasibility,
} from '../../services/intelligenceEngine';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Zap,
  Award,
  Plus,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Code2,
  FileBadge,
  Edit3,
  Sun,
  Moon,
  Building2,
  BookOpen,
  Calendar,
  FileText,
  Calculator,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Layers,
} from 'lucide-react';
import { EvidenceLevel, AcademicTerm } from '../../types';
import {
  COURSE_MAJOR_MAPPING,
  COMMON_COLLEGES,
  getMajorsForCourse,
} from '../../data/academicMapping';

export const Pillar1Profile: React.FC = () => {
  const {
    profile,
    updateProfile,
    updateEducation,
    addProject,
    addSkill,
  } = useCareerSaathi();

  const { theme, toggleTheme } = useTheme();

  // Basic Profile & Academic Credentials Modal State
  const [showEditBasicsModal, setShowEditBasicsModal] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editCollege, setEditCollege] = useState(profile.college || profile.education.institution);
  const [editCourse, setEditCourse] = useState(profile.course || profile.education.course || profile.education.degree || 'B.Tech / B.E.');
  const [editMajor, setEditMajor] = useState(profile.education.branch || '');
  const [editCGPA, setEditCGPA] = useState(
    String(profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 8.5)
  );
  const [editGradingSystem, setEditGradingSystem] = useState<'cgpa' | 'percentage'>(
    profile.education.gradingSystem || 'cgpa'
  );
  const [editCompletionDate, setEditCompletionDate] = useState(
    profile.education.expectedCompletionDate || 'May 2026'
  );
  const [editGradYear, setEditGradYear] = useState(
    profile.education.expectedGraduationYear || 2026
  );
  const [editDegreeStatus, setEditDegreeStatus] = useState<'pursuing' | 'completed'>(
    profile.education.degreeStatus || 'pursuing'
  );
  const [editTotalSemesters, setEditTotalSemesters] = useState(
    profile.education.totalSemesters || 8
  );
  const [editResumeUrl, setEditResumeUrl] = useState(profile.resumeUrl || '');
  const [editCredentialDocUrl, setEditCredentialDocUrl] = useState(
    profile.education.credentialDocUrl || ''
  );
  const [editHeadline, setEditHeadline] = useState(profile.headline);
  const [editAbout, setEditAbout] = useState(profile.about);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editGithub, setEditGithub] = useState(profile.githubUrl);
  const [editLinkedIn, setEditLinkedIn] = useState(profile.linkedInUrl);

  // Term Modal & Feasibility State
  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const nextTermNumber = (profile.education.terms?.length || 0) + 1;
  const [termNumber, setTermNumber] = useState<number>(nextTermNumber);
  const [sgpaInput, setSgpaInput] = useState<string>('8.0');
  const [creditsInput, setCreditsInput] = useState<string>('24');
  const [targetCGPAInput, setTargetCGPAInput] = useState<number>(8.5);
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'academics-deep' | 'projects' | 'skills'>('credentials');

  // Project Modal State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjRole, setNewProjRole] = useState('Solo Developer');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjOutcomes, setNewProjOutcomes] = useState('');
  const [newProjLevel, setNewProjLevel] = useState<EvidenceLevel>(2);

  // Skill Modal State
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<
    'Core CS' | 'Languages & Frameworks' | 'System & Cloud' | 'Databases' | 'Soft Skills'
  >('Languages & Frameworks');
  const [newSkillLevel, setNewSkillLevel] = useState<EvidenceLevel>(2);
  const [newSkillEvidence, setNewSkillEvidence] = useState('');

  // Dynamic Major options for current course
  const majorsForSelectedCourse = getMajorsForCourse(editCourse);

  // Calculations for Academic records
  const termMetrics = calculateDeterministicCGPA(
    profile.education.terms,
    profile.education.totalSemesters || 8
  );
  const currentCalculatedCGPA =
    profile.education.verifiedCGPA ||
    profile.education.selfReportedCGPA ||
    termMetrics.currentCalculatedCGPA ||
    0;

  const feasibilityResult = calculateTargetFeasibility(
    currentCalculatedCGPA,
    termMetrics.totalTermsCompleted,
    profile.education.totalSemesters || 8,
    targetCGPAInput,
    profile.education.terms
  );

  const handleOpenEditBasics = () => {
    setEditName(profile.name);
    setEditCollege(profile.college || profile.education.institution || '');
    setEditCourse(profile.course || profile.education.course || profile.education.degree || 'B.Tech / B.E.');
    setEditMajor(profile.education.branch || '');
    setEditCGPA(
      String(profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 8.5)
    );
    setEditGradingSystem(profile.education.gradingSystem || 'cgpa');
    setEditCompletionDate(profile.education.expectedCompletionDate || 'May 2026');
    setEditGradYear(profile.education.expectedGraduationYear || 2026);
    setEditDegreeStatus(profile.education.degreeStatus || 'pursuing');
    setEditTotalSemesters(profile.education.totalSemesters || 8);
    setEditResumeUrl(profile.resumeUrl || '');
    setEditCredentialDocUrl(profile.education.credentialDocUrl || '');
    setEditHeadline(profile.headline);
    setEditAbout(profile.about);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditGithub(profile.githubUrl);
    setEditLinkedIn(profile.linkedInUrl);
    setShowEditBasicsModal(true);
  };

  const handleSaveBasics = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCGPA = parseFloat(editCGPA) || 0;
    const cgpaEquivalent =
      editGradingSystem === 'percentage'
        ? Number(Math.min(10, parsedCGPA / 9.5).toFixed(2))
        : Number(parsedCGPA.toFixed(2));
    const percentageEquivalent =
      editGradingSystem === 'percentage'
        ? Number(parsedCGPA.toFixed(2))
        : Number((parsedCGPA * 9.5).toFixed(2));

    updateProfile({
      name: editName.trim(),
      college: editCollege.trim(),
      course: editCourse.trim(),
      headline: editHeadline.trim(),
      about: editAbout.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      githubUrl: editGithub.trim(),
      linkedInUrl: editLinkedIn.trim(),
      resumeUrl: editResumeUrl.trim(),
    });

    updateEducation({
      institution: editCollege.trim(),
      degree: editCourse.trim(),
      course: editCourse.trim(),
      branch: editMajor.trim(),
      selfReportedCGPA: cgpaEquivalent,
      verifiedCGPA: cgpaEquivalent,
      percentageValue: percentageEquivalent,
      gradingSystem: editGradingSystem,
      expectedCompletionDate: editCompletionDate.trim(),
      expectedGraduationYear: Number(editGradYear),
      degreeStatus: editDegreeStatus,
      totalSemesters: Number(editTotalSemesters),
      credentialDocUrl: editCredentialDocUrl.trim(),
    });

    setShowEditBasicsModal(false);
  };

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    const sgpa = parseFloat(sgpaInput);
    const credits = parseFloat(creditsInput);
    if (isNaN(sgpa) || isNaN(credits) || sgpa < 0 || sgpa > 10) return;

    const newTerm: AcademicTerm = {
      termNumber,
      sgpa: Number(sgpa.toFixed(2)),
      credits,
      verified: true,
    };

    const existingTerms = profile.education.terms || [];
    const updatedTerms = [...existingTerms.filter((t) => t.termNumber !== termNumber), newTerm].sort(
      (a, b) => a.termNumber - b.termNumber
    );

    // Compute updated CGPA
    const totalCredits = updatedTerms.reduce((sum, t) => sum + t.credits, 0);
    const totalPoints = updatedTerms.reduce((sum, t) => sum + t.sgpa * t.credits, 0);
    const newCgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : sgpa;

    updateEducation({
      terms: updatedTerms,
      termsCompleted: updatedTerms.length,
      currentSemester: Math.min(profile.education.totalSemesters || 8, updatedTerms.length + 1),
      verifiedCGPA: newCgpa,
      selfReportedCGPA: newCgpa,
    });

    setShowAddTermModal(false);
    setTermNumber(updatedTerms.length + 1);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    addProject({
      title: newProjTitle.trim(),
      role: newProjRole.trim(),
      techStack: newProjTech.split(',').map((s) => s.trim()).filter(Boolean),
      description: newProjDesc.trim(),
      outcomes: newProjOutcomes.trim(),
      evidenceLevel: newProjLevel,
      provenance: 'user_provided',
      verificationStatus: 'unverified',
    });

    setNewProjTitle('');
    setNewProjTech('');
    setNewProjDesc('');
    setNewProjOutcomes('');
    setShowAddProjectModal(false);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      evidenceLevel: newSkillLevel,
      supportingEvidence: newSkillEvidence ? [newSkillEvidence.trim()] : ['User reported coursework / practice'],
      relevance: 'Directly Relevant',
      provenance: 'user_provided',
    });

    setNewSkillName('');
    setNewSkillEvidence('');
    setShowAddSkillModal(false);
  };

  const getEvidenceBadge = (level: EvidenceLevel) => {
    switch (level) {
      case 4:
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            L4: Production Verified
          </span>
        );
      case 3:
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            L3: Internship / Capstone
          </span>
        );
      case 2:
        return (
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            L2: Project Repository
          </span>
        );
      case 1:
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            L1: Coursework / Theory
          </span>
        );
      case 0:
      default:
        return (
          <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            L0: Self-Claim
          </span>
        );
    }
  };

  const institutionDisplay = profile.college || profile.education.institution || 'Institution not configured';
  const courseDisplay = profile.course || profile.education.course || profile.education.degree || 'Degree not configured';
  const majorDisplay = profile.education.branch || 'Discipline not specified';
  const cgpaDisplay = (profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 0).toFixed(2);
  const completionDateDisplay = profile.education.expectedCompletionDate || `Year ${profile.education.expectedGraduationYear || 2026}`;

  return (
    <div className="space-y-6">
      {/* 1. Master Profile Header Banner with Theme Switcher & Edit Basics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {profile.name || 'Setup Candidate Profile'}
                </h1>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Authoritative Record
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                  CGPA: {cgpaDisplay} / 10.0
                </span>
              </div>
              <p className="text-xs text-indigo-400 mt-1 font-medium">
                {profile.headline || 'No headline set — click Edit Profile & Credentials'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>{institutionDisplay}</span>
                <span>•</span>
                <span>{courseDisplay}</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">{majorDisplay}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Direct Theme Switcher Button in Record */}
            <button
              onClick={toggleTheme}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Color Theme: Dark (Switch to Light)</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Color Theme: Light (Switch to Dark)</span>
                </>
              )}
            </button>

            {/* Edit Profile & Academic Credentials Button */}
            <button
              onClick={handleOpenEditBasics}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer font-semibold shadow-md shadow-indigo-600/30"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile & Credentials</span>
            </button>

            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> View CV
              </a>
            )}

            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> GitHub
              </a>
            )}
            {profile.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Narrative / About */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] block mb-1">
            Career Objective & Summary:
          </span>
          {profile.about ? (
            <p className="text-slate-200">{profile.about}</p>
          ) : (
            <span className="text-slate-500 italic">
              No objective specified. Click 'Edit Profile & Credentials' to provide your background narrative.
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs within Unified Pillar 1 */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('credentials')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'credentials'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academic Credentials & Mapping</span>
        </button>
        <button
          onClick={() => setActiveSubTab('academics-deep')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'academics-deep'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Semester Performance & Target Feasibility</span>
        </button>
        <button
          onClick={() => setActiveSubTab('projects')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'projects'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Applied Projects ({profile.projects?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('skills')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'skills'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Technical Skills ({profile.skills?.length || 0})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Academic Credentials & Proper Mapping */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Credentials Card */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">
                    Primary Academic Credentials & Institution Mapping
                  </h2>
                </div>
                <button
                  onClick={handleOpenEditBasics}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Hierarchy Display: College -> Course -> Major */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    1. College / Institution
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {institutionDisplay}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Accredited University</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    2. Course / Degree Program
                  </span>
                  <span className="text-sm font-bold text-indigo-300 block">
                    {courseDisplay}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Degree Framework</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    3. Major / Specialization
                  </span>
                  <span className="text-sm font-bold text-emerald-400 block">
                    {majorDisplay}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Course-Aligned Discipline</span>
                </div>
              </div>

              {/* Detailed Credentials Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Cumulative CGPA:</span>
                  <span className="font-bold text-emerald-400 text-lg">
                    {cgpaDisplay} <span className="text-xs text-slate-500">/ 10.0</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {profile.education.gradingSystem === 'percentage'
                      ? `~${profile.education.percentageValue || 0}% equivalent`
                      : 'Self-Reported / Verified'}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Completion Timeline:</span>
                  <span className="font-bold text-white text-sm">
                    {completionDateDisplay}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {profile.education.degreeStatus === 'completed' ? 'Graduated' : 'Currently Pursuing'}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Semester Progress:</span>
                  <span className="font-bold text-indigo-300 text-sm">
                    {profile.education.terms?.length || 0} / {profile.education.totalSemesters || 8}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Semesters Audited</span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">CV / Resume Dossier:</span>
                  {profile.resumeUrl ? (
                    <span className="font-bold text-emerald-400 text-xs flex items-center gap-1 mt-1">
                      <FileCheck className="w-3.5 h-3.5" /> Linked
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-400 text-xs flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {profile.resumeUrl ? 'Ready for ATS' : 'Upload via Cockpit'}
                  </span>
                </div>
              </div>

              {/* Notice regarding correct mapping */}
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
                <span>
                  ✓ Strict validation enabled: Course programs (e.g. B.Tech vs MBA vs B.Com) strictly restrict invalid disciplines (e.g., prevents B.Tech in Finance).
                </span>
                <button
                  onClick={handleOpenEditBasics}
                  className="underline text-indigo-200 hover:text-white shrink-0 ml-2 cursor-pointer"
                >
                  Edit Mapping
                </button>
              </div>
            </div>

            {/* Quick Profile Snapshot Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-emerald-400" />
                Dossier & Contact Evidence
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-200">{profile.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-medium text-slate-200">{profile.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">LinkedIn:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[150px]">
                    {profile.linkedInUrl ? 'Connected' : 'Not linked'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">GitHub:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[150px]">
                    {profile.githubUrl ? 'Connected' : 'Not linked'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Color Preference:</span>
                  <span className="font-medium text-amber-300 uppercase">{theme}</span>
                </div>
              </div>

              <button
                onClick={handleOpenEditBasics}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Update Contact & CV Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Semester Performance & Target Feasibility (Merged from Pillar 2) */}
      {activeSubTab === 'academics-deep' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Semester Breakdown */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                    Semester-by-Semester Audit & Credits
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deterministic credit-weighted tracking. No hallucinated grades.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTermNumber((profile.education.terms?.length || 0) + 1);
                    setShowAddTermModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Semester Term
                </button>
              </div>

              {/* Term Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(profile.education.terms || []).map((term) => (
                  <div
                    key={term.termNumber}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Semester {term.termNumber}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="font-bold text-white text-base block">
                      {term.sgpa.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">SGPA</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">{term.credits} Credits</span>
                  </div>
                ))}
                {(!profile.education.terms || profile.education.terms.length === 0) && (
                  <div className="col-span-4 p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500">
                    No semester marks records added yet. Use the 'Add Semester Term' button above or enter your Cumulative CGPA directly in Profile Basics.
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Target CGPA Feasibility Calculator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Target CGPA Feasibility</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Cumulative CGPA:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="10"
                      value={targetCGPAInput}
                      onChange={(e) => setTargetCGPAInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold"
                    />
                    <span className="text-slate-400 font-semibold">/ 10.0</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Required Future SGPA:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {feasibilityResult.requiredAverageSGPA !== undefined
                        ? feasibilityResult.requiredAverageSGPA.toFixed(2)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mathematical Status:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        feasibilityResult.isFeasible
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {feasibilityResult.isFeasible ? 'Achievable' : 'Infeasible'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
                    {feasibilityResult.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Applied Projects */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                Applied Projects & Repositories ({profile.projects?.length || 0})
              </h2>
              <p className="text-xs text-slate-400">
                Verified repositories and capstone deliverables with Level 0-4 evidence tiers.
              </p>
            </div>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profile.projects || []).map((project) => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{project.title}</h3>
                    <span className="text-xs text-indigo-400 font-medium">{project.role}</span>
                  </div>
                  {getEvidenceBadge(project.evidenceLevel)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{project.description}</p>
                {project.outcomes && (
                  <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    🎯 Outcome: {project.outcomes}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {(!profile.projects || profile.projects.length === 0) && (
              <div className="col-span-2 p-10 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300">No projects recorded yet.</p>
                <p className="text-slate-500">
                  Upload your CV in the Command Center Cockpit to automatically extract projects, or click 'Add Project' above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Technical Skills */}
      {activeSubTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Technical & Core Skill Stack ({profile.skills?.length || 0})
              </h2>
              <p className="text-xs text-slate-400">
                Skills categorized with audit-ready proof points and directional alignment.
              </p>
            </div>
            <button
              onClick={() => setShowAddSkillModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(profile.skills || []).map((skill) => (
              <div
                key={skill.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-sm">{skill.name}</span>
                  {getEvidenceBadge(skill.evidenceLevel)}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{skill.category}</span>
                  <span className="text-indigo-400">{skill.relevance}</span>
                </div>
                {skill.supportingEvidence && skill.supportingEvidence.length > 0 && (
                  <p className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-1">
                    Proof: {skill.supportingEvidence[0]}
                  </p>
                )}
              </div>
            ))}
            {(!profile.skills || profile.skills.length === 0) && (
              <div className="col-span-3 p-10 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300">No skills added yet.</p>
                <p className="text-slate-500">
                  Upload your CV in the Command Center Cockpit to automatically extract skills, or click 'Add Skill' above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MASTER MODAL: Edit Profile Basics & Academic Credentials */}
      {showEditBasicsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">
                  Edit Profile Basics & Academic Credentials
                </h3>
                <p className="text-xs text-slate-400">
                  Authoritative student record including College, Course, Major mapping & CGPA.
                </p>
              </div>
              <button
                onClick={() => setShowEditBasicsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBasics} className="overflow-y-auto px-6 py-4 space-y-4 flex-1 text-xs">
              {/* Section 1: Identity */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  1. Personal Identity & Overview
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Professional Headline</label>
                    <input
                      type="text"
                      value={editHeadline}
                      onChange={(e) => setEditHeadline(e.target.value)}
                      placeholder="e.g. Aspiring Software Engineer | B.Tech CSE"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">About / Career Narrative</label>
                  <textarea
                    rows={2}
                    value={editAbout}
                    onChange={(e) => setEditAbout(e.target.value)}
                    placeholder="Brief background, technical interests, and goals..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Section 2: College -> Course -> Major Correct Mapping */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  2. Academic Hierarchy: College → Course → Major
                </span>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">College / University *</label>
                  <input
                    type="text"
                    required
                    list="colleges-options"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="e.g. SSM College of Engineering"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                  <datalist id="colleges-options">
                    {COMMON_COLLEGES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Course / Degree Program *</label>
                    <select
                      value={editCourse}
                      onChange={(e) => {
                        const newCourse = e.target.value;
                        setEditCourse(newCourse);
                        // Reset major if it is not in the new course's valid majors
                        const valid = getMajorsForCourse(newCourse);
                        if (!valid.includes(editMajor)) {
                          setEditMajor(valid[0] || '');
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                    >
                      {Object.keys(COURSE_MAJOR_MAPPING).map((cKey) => (
                        <option key={cKey} value={cKey}>
                          {cKey}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">
                      Major / Branch (Strictly mapped to {editCourse}) *
                    </label>
                    {majorsForSelectedCourse.length > 0 ? (
                      <select
                        value={editMajor}
                        onChange={(e) => setEditMajor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                      >
                        <option value="">-- Select Major / Branch --</option>
                        {majorsForSelectedCourse.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editMajor}
                        onChange={(e) => setEditMajor(e.target.value)}
                        placeholder="Enter specialization"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: CGPA & Completion Details */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  3. Performance & Completion Milestones
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Grading System</label>
                    <select
                      value={editGradingSystem}
                      onChange={(e) => setEditGradingSystem(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                    >
                      <option value="cgpa">10-Point CGPA Scale</option>
                      <option value="percentage">Percentage (%) Scale</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">
                      {editGradingSystem === 'percentage' ? 'Percentage Score (%) *' : 'Cumulative CGPA *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      max={editGradingSystem === 'percentage' ? 100 : 10}
                      value={editCGPA}
                      onChange={(e) => setEditCGPA(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Degree Status</label>
                    <select
                      value={editDegreeStatus}
                      onChange={(e) => setEditDegreeStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                    >
                      <option value="pursuing">Currently Pursuing</option>
                      <option value="completed">Completed / Graduated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">
                      Expected Completion Month & Year *
                    </label>
                    <input
                      type="text"
                      value={editCompletionDate}
                      onChange={(e) => setEditCompletionDate(e.target.value)}
                      placeholder="e.g. May 2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Total Semesters</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editTotalSemesters}
                      onChange={(e) => setEditTotalSemesters(parseInt(e.target.value) || 8)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: CV & Credential Document Links */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  4. CV Dossier & Professional Presence
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Resume / CV Document URL</label>
                    <input
                      type="url"
                      value={editResumeUrl}
                      onChange={(e) => setEditResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Transcript / Credential URL</label>
                    <input
                      type="url"
                      value={editCredentialDocUrl}
                      onChange={(e) => setEditCredentialDocUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">GitHub Profile URL</label>
                    <input
                      type="url"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={editLinkedIn}
                      onChange={(e) => setEditLinkedIn(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditBasicsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow cursor-pointer"
                >
                  Save Profile & Academic Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TERM MODAL */}
      {showAddTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Semester Record</h3>
              <button onClick={() => setShowAddTermModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddTerm} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Semester Number</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={termNumber}
                  onChange={(e) => setTermNumber(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Semester SGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={sgpaInput}
                  onChange={(e) => setSgpaInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Semester Credits (e.g. 24)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={creditsInput}
                  onChange={(e) => setCreditsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTermModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow"
                >
                  Record Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Applied Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Your Role</label>
                  <input
                    type="text"
                    value={newProjRole}
                    onChange={(e) => setNewProjRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Evidence Level</label>
                  <select
                    value={newProjLevel}
                    onChange={(e) => setNewProjLevel(parseInt(e.target.value) as EvidenceLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white cursor-pointer"
                  >
                    <option value={0}>L0: Self-Claim</option>
                    <option value={1}>L1: Coursework / Theory</option>
                    <option value={2}>L2: Public Git Repo</option>
                    <option value={3}>L3: Internship / Capstone</option>
                    <option value={4}>L4: Production Deployed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="Go, Redis, Docker, gRPC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Problem solved, architecture, and personal contributions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Measurable Outcomes</label>
                <input
                  type="text"
                  value={newProjOutcomes}
                  onChange={(e) => setNewProjOutcomes(e.target.value)}
                  placeholder="e.g. Handled 10,000 req/sec with <15ms p99 latency"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SKILL MODAL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Technical Skill</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSkill} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Distributed Systems / Go"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white cursor-pointer"
                  >
                    <option value="Languages & Frameworks">Languages & Frameworks</option>
                    <option value="Core CS">Core CS</option>
                    <option value="System & Cloud">System & Cloud</option>
                    <option value="Databases">Databases</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Evidence Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(parseInt(e.target.value) as EvidenceLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white cursor-pointer"
                  >
                    <option value={0}>L0: Self-Claim</option>
                    <option value={1}>L1: Theory / Coursework</option>
                    <option value={2}>L2: Project Evidence</option>
                    <option value={3}>L3: Internship / Capstone</option>
                    <option value={4}>L4: Production Verified</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Supporting Proof / Verification</label>
                <input
                  type="text"
                  value={newSkillEvidence}
                  onChange={(e) => setNewSkillEvidence(e.target.value)}
                  placeholder="e.g. Built microservices in Internship or Repo link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
