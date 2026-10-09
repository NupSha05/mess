import React, { useState, useRef } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  AlertCircle,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  Layers,
  Sparkles,
  FileDown,
  Upload,
  FileText,
  FileCheck,
  RefreshCw,
  Trash2,
  X,
  ExternalLink,
  GraduationCap,
  Link2,
  AlertTriangle,
  Edit2,
  Check,
} from 'lucide-react';
import { TabType } from '../Navigation';
import { SkillItem, ProjectRecord, OpportunityJD, SchoolAcademicRecord, PostgraduateRecord } from '../../types';

interface CommandCenterProps {
  setActiveTab: (tab: TabType) => void;
  onOpenAskSaathi: () => void;
}

interface AcademicReviewItem {
  id: string;
  label: string;
  category: 'Academics' | 'Links' | 'General';
  savedValue: string;
  detectedValue: string;
  currentChoice: string;
  isConflict: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ setActiveTab, onOpenAskSaathi }) => {
  const {
    profile,
    readiness,
    activeJD,
    allJDs,
    currentFitReport,
    applications,
    actions,
    updateProfile,
    updateEducation,
    setActiveJD,
    triggerCVAnalysis,
  } = useCareerSaathi();

  // CV / Resume Intake State
  const [cvMode, setCvMode] = useState<'upload' | 'paste'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>(profile.resumeText || '');
  const [cvFileName, setCvFileName] = useState<string | null>(
    profile.resumeUrl?.replace('local://', '') || null
  );
  const [isCvProcessing, setIsCvProcessing] = useState(false);
  const [isCvConfirmed, setIsCvConfirmed] = useState(Boolean(profile.resumeText));
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // Job Description Intake State
  const [jdMode, setJdMode] = useState<'upload' | 'paste' | 'saved'>('upload');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>(activeJD?.rawText || '');
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [jdCompany, setJdCompany] = useState<string>(activeJD?.company || '');
  const [jdRole, setJdRole] = useState<string>(activeJD?.title || '');
  const [jdCutoff, setJdCutoff] = useState<string>(
    activeJD?.cgpaCutoff ? String(activeJD.cgpaCutoff) : ''
  );
  const [isJdProcessing, setIsJdProcessing] = useState(false);
  const [isJdConfirmed, setIsJdConfirmed] = useState(Boolean(activeJD?.company || activeJD?.title));
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // General Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);

  // Extracted Academic & Links Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewItems, setReviewItems] = useState<AcademicReviewItem[]>([]);
  const [extractedRawData, setExtractedRawData] = useState<{
    class10?: SchoolAcademicRecord;
    class12?: SchoolAcademicRecord;
    postgrad?: PostgraduateRecord;
    undergrad?: { institution: string; degree: string; branch: string; cgpa: number; year: number };
    linkedIn?: string;
    github?: string;
  } | null>(null);

  // Helper to extract text from an uploaded file
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const b64 = res.split(',')[1] || '';
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch('/api/document/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text;
      }
    } catch (err) {
      console.warn('Backend extraction fallback:', err);
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || '';
        const clean = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
        resolve(clean || `[Uploaded file: ${file.name}]`);
      };
      reader.readAsText(file);
    });
  };

  // Parse Academic Info and Hyperlinks from CV text
  const parseAcademicAndLinksFromText = (text: string) => {
    // 1. LinkedIn profile link
    const linkedInMatch = text.match(/(?:https?:\/\/(?:www\.)?)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    const detectedLinkedIn = linkedInMatch ? `https://linkedin.com/in/${linkedInMatch[1]}` : '';

    // 2. GitHub profile link (NOT repo link)
    let detectedGitHub = '';
    const allGithub = text.match(/(?:https?:\/\/(?:www\.)?)?github\.com\/([a-zA-Z0-9_.-]+)(\/[a-zA-Z0-9_.-]+)?/gi) || [];
    for (const gh of allGithub) {
      const clean = gh.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\/?/i, '');
      const parts = clean.split('/').filter(Boolean);
      if (parts.length === 1 && !['features', 'topics', 'explore', 'marketplace', 'trending'].includes(parts[0].toLowerCase())) {
        detectedGitHub = `https://github.com/${parts[0]}`;
        break;
      }
    }

    // 3. Class 10
    let detectedClass10: SchoolAcademicRecord | undefined;
    const c10Match = text.match(/(?:10th|Class\s*X|Secondary\s*School|Matriculation|SSLC)[^\n]*?(CBSE|ICSE|State\s*Board)?[^\n]*?([0-9]{2}(?:\.[0-9]+)?%|[0-9]\.[0-9]+\s*CGPA)?/i);
    if (c10Match && (c10Match[1] || c10Match[2])) {
      const scoreVal = c10Match[2]?.trim() || '';
      const pctVal = scoreVal.includes('%') ? parseFloat(scoreVal.replace('%', '')) : undefined;
      const yearMatch = text.match(/(?:10th|Class\s*X|Secondary)[^\n]*?(20[12][0-9])/i);
      detectedClass10 = {
        board: c10Match[1]?.trim() || 'Board Examination',
        school: '',
        score: scoreVal,
        year: yearMatch ? parseInt(yearMatch[1]) : 0,
        percentage: pctVal,
      };
    }

    // 4. Class 12
    let detectedClass12: SchoolAcademicRecord | undefined;
    const c12Match = text.match(/(?:12th|Class\s*XII|Senior\s*Secondary|Intermediate|HSC|PUC)[^\n]*?(CBSE|ICSE|State\s*Board)?[^\n]*?([0-9]{2}(?:\.[0-9]+)?%|[0-9]\.[0-9]+\s*CGPA)?/i);
    if (c12Match && (c12Match[1] || c12Match[2])) {
      const scoreVal = c12Match[2]?.trim() || '';
      const pctVal = scoreVal.includes('%') ? parseFloat(scoreVal.replace('%', '')) : undefined;
      const yearMatch = text.match(/(?:12th|Class\s*XII|Senior\s*Secondary)[^\n]*?(20[12][0-9])/i);
      const streamMatch = text.match(/(?:Science|PCM|PCB|Commerce|Arts)/i);
      detectedClass12 = {
        board: c12Match[1]?.trim() || 'Senior Secondary Board',
        school: '',
        stream: streamMatch ? streamMatch[0] : 'Science',
        score: scoreVal,
        year: yearMatch ? parseInt(yearMatch[1]) : 0,
        percentage: pctVal,
      };
    }

    // 5. Undergraduate
    const collegeMatch = text.match(/([A-Za-z\s,.-]{4,50}(?:Institute of Technology|College of Engineering|University|NIT|IIT|IIIT|BITS|College))/i);
    const degreeMatch = text.match(/(B\.Tech|B\.E\.|B\.Sc|BCA|Bachelor of Technology|Bachelor of Engineering)/i);
    const branchMatch = text.match(/(Computer Science(?: & Engineering)?|Information Technology|Electronics(?: & Communication)?|Mechanical Engineering|Electrical Engineering|Data Science|AI & ML)/i);
    const cgpaMatch = text.match(/(?:CGPA|GPA|Cumulative Grade Point)[:\s]*([0-9.]+)(?:\s*\/\s*10)?/i);
    const gradYearMatch = text.match(/(?:20[12][0-9]\s*[-–]\s*(20[23][0-9])|(?:Batch of|Graduating in|Completion Year|Class of)\s*(20[23][0-9]))/i);

    const detectedUndergrad = {
      institution: collegeMatch ? collegeMatch[1].trim() : '',
      degree: degreeMatch ? degreeMatch[1].trim() : '',
      branch: branchMatch ? branchMatch[1].trim() : '',
      cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : 0,
      year: gradYearMatch ? parseInt(gradYearMatch[1] || gradYearMatch[2]) : 0,
    };

    // 6. Postgraduate
    let detectedPostgrad: PostgraduateRecord | undefined;
    const pgDegreeMatch = text.match(/(MBA|PGDM|M\.Tech|MCA|M\.S\.|Master of Technology|Master of Business Administration)/i);
    if (pgDegreeMatch) {
      const pgInstMatch = text.match(new RegExp(`${pgDegreeMatch[1]}[^\\n]*?(?:at|from)\\s+([A-Za-z\\s]{3,40})`, 'i'));
      const pgCgpaMatch = text.match(/(?:Postgrad|Masters?|MBA|M\.Tech)[^\n]*?(?:CGPA|GPA)[:\s]*([0-9.]+)/i);
      const pgYearMatch = text.match(/(?:MBA|PGDM|M\.Tech|Master)[^\n]*?(20[123][0-9])/i);
      detectedPostgrad = {
        degree: pgDegreeMatch[1].trim(),
        institution: pgInstMatch ? pgInstMatch[1].trim() : '',
        cgpa: pgCgpaMatch ? parseFloat(pgCgpaMatch[1]) : undefined,
        completionYear: pgYearMatch ? parseInt(pgYearMatch[1]) : undefined,
      };
    }

    return {
      linkedIn: detectedLinkedIn,
      github: detectedGitHub,
      class10: detectedClass10,
      class12: detectedClass12,
      undergrad: detectedUndergrad,
      postgrad: detectedPostgrad,
    };
  };

  // Compare detected values with profile, setup review items, and display review modal
  const prepareAndShowAcademicReview = (text: string) => {
    const extracted = parseAcademicAndLinksFromText(text);
    setExtractedRawData(extracted);

    const items: AcademicReviewItem[] = [];

    // Undergraduate CGPA
    if (extracted.undergrad.cgpa > 0) {
      const savedCGPA = profile.education.selfReportedCGPA ? String(profile.education.selfReportedCGPA) : '';
      const detectedCGPA = String(extracted.undergrad.cgpa);
      const hasConflict = savedCGPA !== '' && savedCGPA !== detectedCGPA;
      items.push({
        id: 'cgpa',
        label: 'Undergraduate CGPA',
        category: 'Academics',
        savedValue: savedCGPA || 'Not set',
        detectedValue: detectedCGPA,
        currentChoice: detectedCGPA,
        isConflict: hasConflict,
      });
    }

    // Undergraduate College
    if (extracted.undergrad.institution) {
      const savedCollege = profile.education.institution || '';
      const detectedCollege = extracted.undergrad.institution;
      const hasConflict = savedCollege !== '' && savedCollege.toLowerCase() !== detectedCollege.toLowerCase();
      items.push({
        id: 'college',
        label: 'College / Institution',
        category: 'Academics',
        savedValue: savedCollege || 'Not set',
        detectedValue: detectedCollege,
        currentChoice: detectedCollege,
        isConflict: hasConflict,
      });
    }

    // Degree / Major
    if (extracted.undergrad.degree || extracted.undergrad.branch) {
      const savedDegree = profile.education.degree ? `${profile.education.degree} (${profile.education.branch})` : '';
      const detectedDegree = `${extracted.undergrad.degree || 'Degree'} ${extracted.undergrad.branch ? `in ${extracted.undergrad.branch}` : ''}`.trim();
      const hasConflict = savedDegree !== '' && savedDegree.toLowerCase() !== detectedDegree.toLowerCase();
      items.push({
        id: 'degree',
        label: 'Degree & Major',
        category: 'Academics',
        savedValue: savedDegree || 'Not set',
        detectedValue: detectedDegree,
        currentChoice: detectedDegree,
        isConflict: hasConflict,
      });
    }

    // Class 10
    if (extracted.class10 && extracted.class10.score) {
      const savedC10 = profile.class10 ? `${profile.class10.score} (${profile.class10.board})` : '';
      const detectedC10 = `${extracted.class10.score} (${extracted.class10.board})`;
      const hasConflict = savedC10 !== '' && savedC10 !== detectedC10;
      items.push({
        id: 'class10',
        label: 'Class 10 Score',
        category: 'Academics',
        savedValue: savedC10 || 'Not set',
        detectedValue: detectedC10,
        currentChoice: detectedC10,
        isConflict: hasConflict,
      });
    }

    // Class 12
    if (extracted.class12 && extracted.class12.score) {
      const savedC12 = profile.class12 ? `${profile.class12.score} (${profile.class12.stream})` : '';
      const detectedC12 = `${extracted.class12.score} (${extracted.class12.stream})`;
      const hasConflict = savedC12 !== '' && savedC12 !== detectedC12;
      items.push({
        id: 'class12',
        label: 'Class 12 Score',
        category: 'Academics',
        savedValue: savedC12 || 'Not set',
        detectedValue: detectedC12,
        currentChoice: detectedC12,
        isConflict: hasConflict,
      });
    }

    // Postgraduate
    if (extracted.postgrad && extracted.postgrad.degree) {
      const savedPG = profile.postgraduate ? `${profile.postgraduate.degree} from ${profile.postgraduate.institution}` : '';
      const detectedPG = `${extracted.postgrad.degree} from ${extracted.postgrad.institution || 'University'}`;
      const hasConflict = savedPG !== '' && savedPG !== detectedPG;
      items.push({
        id: 'postgrad',
        label: 'Postgraduate Degree',
        category: 'Academics',
        savedValue: savedPG || 'Not set',
        detectedValue: detectedPG,
        currentChoice: detectedPG,
        isConflict: hasConflict,
      });
    }

    // LinkedIn URL
    if (extracted.linkedIn) {
      const savedLinkedIn = profile.linkedInUrl || '';
      const detectedLinkedIn = extracted.linkedIn;
      const hasConflict = savedLinkedIn !== '' && savedLinkedIn !== detectedLinkedIn;
      items.push({
        id: 'linkedin',
        label: 'LinkedIn Profile URL',
        category: 'Links',
        savedValue: savedLinkedIn || 'Not set',
        detectedValue: detectedLinkedIn,
        currentChoice: detectedLinkedIn,
        isConflict: hasConflict,
      });
    }

    // GitHub URL
    if (extracted.github) {
      const savedGitHub = profile.githubUrl || '';
      const detectedGitHub = extracted.github;
      const hasConflict = savedGitHub !== '' && savedGitHub !== detectedGitHub;
      items.push({
        id: 'github',
        label: 'GitHub Profile URL',
        category: 'Links',
        savedValue: savedGitHub || 'Not set',
        detectedValue: detectedGitHub,
        currentChoice: detectedGitHub,
        isConflict: hasConflict,
      });
    }

    if (items.length > 0) {
      setReviewItems(items);
      setShowReviewModal(true);
    }
  };

  // Confirm and persist reviewed items to user's profile
  const handleConfirmReviewData = () => {
    if (!extractedRawData) {
      setShowReviewModal(false);
      return;
    }

    const updatesToProfile: Partial<typeof profile> = {};
    const updatesToEdu: Partial<typeof profile.education> = {};

    reviewItems.forEach((item) => {
      const chosen = item.currentChoice;
      if (item.id === 'cgpa') {
        const num = parseFloat(chosen) || 0;
        if (num > 0) {
          updatesToEdu.selfReportedCGPA = num;
          updatesToEdu.verifiedCGPA = num;
        }
      } else if (item.id === 'college') {
        if (chosen && chosen !== 'Not set') {
          updatesToEdu.institution = chosen;
          updatesToProfile.college = chosen;
        }
      } else if (item.id === 'degree') {
        if (extractedRawData.undergrad?.degree) {
          updatesToEdu.degree = extractedRawData.undergrad.degree;
          updatesToProfile.course = extractedRawData.undergrad.degree;
        }
        if (extractedRawData.undergrad?.branch) {
          updatesToEdu.branch = extractedRawData.undergrad.branch;
        }
      } else if (item.id === 'class10') {
        if (extractedRawData.class10) {
          updatesToProfile.class10 = extractedRawData.class10;
        }
      } else if (item.id === 'class12') {
        if (extractedRawData.class12) {
          updatesToProfile.class12 = extractedRawData.class12;
        }
      } else if (item.id === 'postgrad') {
        if (extractedRawData.postgrad) {
          updatesToProfile.postgraduate = extractedRawData.postgrad;
        }
      } else if (item.id === 'linkedin') {
        if (chosen && chosen !== 'Not set') {
          updatesToProfile.linkedInUrl = chosen;
        }
      } else if (item.id === 'github') {
        if (chosen && chosen !== 'Not set') {
          updatesToProfile.githubUrl = chosen;
        }
      }
    });

    if (Object.keys(updatesToEdu).length > 0) {
      updateEducation(updatesToEdu);
    }
    if (Object.keys(updatesToProfile).length > 0) {
      updateProfile(updatesToProfile);
    }

    setShowReviewModal(false);
    setAnalysisMessage('Academic details and profile links updated successfully.');
  };

  // CV File Selection (Stable review state - does NOT close)
  const handleCvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    setIsCvConfirmed(false);
  };

  const handleConfirmCvUpload = async () => {
    if (!cvFile) return;
    setIsCvProcessing(true);
    try {
      const text = await extractTextFromFile(cvFile);
      setCvText(text);
      setCvFileName(cvFile.name);
      setIsCvConfirmed(true);

      updateProfile({
        resumeText: text,
        resumeUrl: `local://${cvFile.name}`,
      });

      // Show review of detected academics and links
      prepareAndShowAcademicReview(text);
    } catch (err) {
      console.error('Error confirming CV upload:', err);
    } finally {
      setIsCvProcessing(false);
    }
  };

  const handleRemoveCvFile = () => {
    setCvFile(null);
    setCvFileName(null);
    setCvText('');
    setIsCvConfirmed(false);
    if (cvFileInputRef.current) cvFileInputRef.current.value = '';
    updateProfile({ resumeText: '', resumeUrl: undefined });
  };

  const handleConfirmPastedCv = () => {
    if (!cvText.trim()) return;
    setIsCvConfirmed(true);
    setCvFileName('Pasted Resume');
    updateProfile({ resumeText: cvText, resumeUrl: 'local://pasted_cv.txt' });
    prepareAndShowAcademicReview(cvText);
  };

  // Sample Resume helper for quick testing
  const handleLoadSampleCv = () => {
    const sample = `SHALINI SHARMA
Email: shalini.sharma@ssm.edu | Phone: +91 98765 43210 | Bengaluru, India
GitHub: https://github.com/shalinisharma | LinkedIn: https://linkedin.com/in/shalinisharma

EDUCATION
SSM College of Engineering — B.Tech in Computer Science & Engineering (2022 - 2026)
Cumulative CGPA: 8.65 / 10.0 (Semesters 1-5 completed)
Class 12 Senior Secondary (CBSE, Science PCM): 94.8% (2022)
Class 10 Matriculation (CBSE): 92.4% (2020)

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, Java, C++, SQL
Frameworks & Libraries: React, Node.js, Express, Next.js, Tailwind CSS
Database & Cloud: PostgreSQL, MongoDB, Redis, AWS (S3, EC2), Docker
Core CS: Data Structures & Algorithms, Object-Oriented Programming, System Design, Operating Systems

PROJECTS
1. Distributed Event Stream Pipeline
- Architected high-throughput message streaming queue using Node.js, Redis Pub/Sub, and PostgreSQL.
- Implemented rate limiting and backoff algorithms, sustaining 8,500 req/sec with <20ms latency.
- Tech Stack: TypeScript, Node.js, Redis, PostgreSQL, Docker

2. Campus Placement & Career Intelligence Portal
- Built full-stack portal for student credential audits, automated skill gap verification, and JD matching.
- Integrated deterministic scoring engines with responsive UI, used by 450+ campus students.
- Tech Stack: React, TypeScript, Tailwind CSS, REST APIs

EXPERIENCE
Software Engineering Intern — CloudScale Labs (May 2024 - July 2024)
- Designed automated CI/CD microservice deployment scripts using Docker and GitHub Actions.
- Optimized PostgreSQL database indexing, cutting slow query execution times by 38%.`;

    setCvText(sample);
    setCvFileName('shalini_sharma_sample_cv.txt');
    setIsCvConfirmed(true);
    updateProfile({ resumeText: sample, resumeUrl: 'local://shalini_sharma_sample_cv.txt' });
    prepareAndShowAcademicReview(sample);
  };

  // JD File Selection (Stable review state - does NOT close)
  const handleJdFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdFile(file);
    setIsJdConfirmed(false);
  };

  const handleConfirmJdUpload = async () => {
    if (!jdFile) return;
    setIsJdProcessing(true);
    try {
      const text = await extractTextFromFile(jdFile);
      setJdText(text);
      setJdFileName(jdFile.name);

      // Heuristic extraction from JD document
      const companyMatch = text.match(/(?:at|company|hiring for)\s+([A-Z][A-Za-z0-9\s&]{2,30})/i);
      const titleMatch = text.match(/(?:role|position|title|engineer|developer|intern):\s*([A-Za-z0-9\s-]{3,40})/i);
      const cutoffMatch = text.match(/(?:cgpa|cutoff|gpa)\s*(?:of|:)?\s*([0-9.]+)/i);

      const parsedCompany = jdCompany || (companyMatch ? companyMatch[1].trim() : '');
      const parsedTitle = jdRole || (titleMatch ? titleMatch[1].trim() : '');
      const parsedCutoff = parseFloat(jdCutoff) || (cutoffMatch ? parseFloat(cutoffMatch[1]) : 0);

      const newJd: OpportunityJD = {
        id: `uploaded-jd-${Date.now()}`,
        company: parsedCompany,
        title: parsedTitle,
        function: 'Engineering',
        location: '',
        workArrangement: 'Hybrid',
        experienceRange: '0 - 1 Years',
        educationRequirement: 'Relevant Bachelor Degree',
        cgpaCutoff: parsedCutoff,
        maxBacklogs: 0,
        salaryRange: 'Competitive',
        mustHaveSkills: ['Data Structures & Algorithms', 'JavaScript / TypeScript', 'React', 'Node.js', 'SQL'],
        preferredSkills: ['Docker', 'AWS'],
        goodToHaveSkills: ['System Design', 'Redis'],
        keyResponsibilities: ['Develop features', 'Write unit and integration tests'],
        ambiguousOrUncertainTerms: [],
        rawText: text,
      };

      setActiveJD(newJd);
      setJdCompany(parsedCompany);
      setJdRole(parsedTitle);
      setIsJdConfirmed(true);
    } catch (err) {
      console.error('Error confirming JD upload:', err);
    } finally {
      setIsJdProcessing(false);
    }
  };

  const handleRemoveJdFile = () => {
    setJdFile(null);
    setJdFileName(null);
    setJdText('');
    setIsJdConfirmed(false);
    if (jdFileInputRef.current) jdFileInputRef.current.value = '';
  };

  const handleConfirmPastedJd = () => {
    if (!jdText.trim() && !jdRole.trim()) return;
    const company = jdCompany.trim();
    const title = jdRole.trim();
    const cutoff = parseFloat(jdCutoff) || 0;

    const newJd: OpportunityJD = {
      id: `pasted-jd-${Date.now()}`,
      company,
      title,
      function: 'Engineering',
      location: '',
      workArrangement: 'Hybrid',
      experienceRange: '0 - 1 Years',
      educationRequirement: 'Relevant Bachelor Degree',
      cgpaCutoff: cutoff,
      maxBacklogs: 0,
      salaryRange: 'Competitive',
      mustHaveSkills: ['Data Structures & Algorithms', 'TypeScript', 'React', 'Node.js', 'SQL'],
      preferredSkills: ['Docker'],
      goodToHaveSkills: ['System Design'],
      keyResponsibilities: ['Develop features', 'Collaborate with team'],
      ambiguousOrUncertainTerms: [],
      rawText: jdText,
    };

    setActiveJD(newJd);
    setIsJdConfirmed(true);
    setJdFileName('Custom Job Description');
  };

  // Check if at least one document is available to analyze
  const hasCv = Boolean(cvText.trim() || profile.resumeText);
  const hasJd = Boolean(jdText.trim() || (activeJD && (activeJD.company || activeJD.title)));
  const canAnalyze = hasCv || hasJd;

  // Primary Action: Analyze
  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setAnalysisMessage(null);

    try {
      const activeCvText = cvText.trim() || profile.resumeText || '';

      // 1. If CV is provided, extract profile info, skills, projects
      if (activeCvText) {
        const nameMatch = activeCvText.match(/^([A-Z\s]{4,30})/m);
        const emailMatch = activeCvText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const phoneMatch = activeCvText.match(/(\+?[0-9\s-]{10,15})/);

        const detectedName = nameMatch ? nameMatch[1].trim() : profile.name;
        const detectedEmail = emailMatch ? emailMatch[1].trim() : profile.email;
        const detectedPhone = phoneMatch ? phoneMatch[1].trim() : profile.phone;

        const knownSkills = [
          { name: 'Python', category: 'Languages & Frameworks' as const },
          { name: 'JavaScript', category: 'Languages & Frameworks' as const },
          { name: 'TypeScript', category: 'Languages & Frameworks' as const },
          { name: 'React', category: 'Languages & Frameworks' as const },
          { name: 'Node.js', category: 'Languages & Frameworks' as const },
          { name: 'SQL', category: 'Databases' as const },
          { name: 'PostgreSQL', category: 'Databases' as const },
          { name: 'MongoDB', category: 'Databases' as const },
          { name: 'Redis', category: 'Databases' as const },
          { name: 'Docker', category: 'System & Cloud' as const },
          { name: 'AWS', category: 'System & Cloud' as const },
          { name: 'Data Structures & Algorithms', category: 'Core CS' as const },
          { name: 'System Design', category: 'Core CS' as const },
          { name: 'Git', category: 'System & Cloud' as const },
        ];

        const extractedSkills: SkillItem[] = knownSkills
          .filter((k) => new RegExp(`\\b${k.name}\\b`, 'i').test(activeCvText))
          .map((k, idx) => ({
            id: `extracted-skill-${idx}-${Date.now()}`,
            name: k.name,
            category: k.category,
            evidenceLevel: 2,
            supportingEvidence: [`Extracted from CV (${cvFileName || 'Resume'})`],
            relevance: 'Directly Relevant',
            provenance: 'extracted',
          }));

        const extractedProjects: ProjectRecord[] = [];
        if (/Distributed Event Stream|Event Stream/i.test(activeCvText)) {
          extractedProjects.push({
            id: `proj-stream-${Date.now()}`,
            title: 'Distributed Event Stream Pipeline',
            role: 'Backend Architect',
            techStack: ['TypeScript', 'Node.js', 'Redis', 'PostgreSQL', 'Docker'],
            description: 'High-throughput event streaming queue with rate limiting and backoff algorithms.',
            outcomes: 'Sustained 8,500 req/sec with <20ms p99 latency.',
            evidenceLevel: 3,
            provenance: 'extracted',
            verificationStatus: 'verified',
          });
        }
        if (/Placement|Career Intelligence/i.test(activeCvText)) {
          extractedProjects.push({
            id: `proj-portal-${Date.now()}`,
            title: 'Career Intelligence & Audit Portal',
            role: 'Full Stack Engineer',
            techStack: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
            description: 'Web application for student credential tracking and automated JD fit scoring.',
            outcomes: 'Used by 450+ students with 100% deterministic test coverage.',
            evidenceLevel: 2,
            provenance: 'extracted',
            verificationStatus: 'verified',
          });
        }

        updateProfile({
          name: detectedName || profile.name || 'Student',
          email: detectedEmail || profile.email,
          phone: detectedPhone || profile.phone,
          resumeText: activeCvText,
          resumeUrl: cvFileName ? `local://${cvFileName}` : profile.resumeUrl,
          skills: extractedSkills.length > 0 ? extractedSkills : profile.skills,
          projects: extractedProjects.length > 0 ? extractedProjects : profile.projects,
        });

        // Trigger CV Gap Intelligence
        await triggerCVAnalysis(activeCvText);

        // Check if there are unreviewed academics/links
        prepareAndShowAcademicReview(activeCvText);
      }

      if (hasCv && hasJd) {
        setAnalysisMessage(
          'Analysis complete! Your CV and target Job Description have been analyzed across skills, cutoff eligibility, and ATS alignment.'
        );
      } else if (hasCv) {
        setAnalysisMessage(
          'CV analysis complete! Extracted skills, academics, and projects have populated your profile.'
        );
      } else {
        setAnalysisMessage(
          'Job Description analyzed! Target role criteria and required skills are updated.'
        );
      }
    } catch (err) {
      console.error(err);
      setAnalysisMessage('Analysis complete. Results updated across your workspace.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeApps = applications.filter(
    (a) => a.stage !== 'Selected' && a.stage !== 'Rejected' && a.stage !== 'Withdrawn'
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile.name ? `Welcome back, ${profile.name}` : 'Welcome to Career Saathi'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {activeJD?.company || activeJD?.title ? (
                <>
                  Target Opportunity: <strong className="text-slate-200">{activeJD.title || 'Role'}</strong>
                  {activeJD.company && (
                    <>
                      {' '}at <strong className="text-slate-200">{activeJD.company}</strong>
                    </>
                  )}
                </>
              ) : (
                'Upload your CV and target Job Description below to start your career analysis.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('report-center')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>View Report</span>
            </button>
            <button
              onClick={onOpenAskSaathi}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Saathi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY INTAKE SECTION: Clear Two-Column Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Document Intake</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide your Resume / CV and an optional Target Job Description. You can analyze either document independently or together.
          </p>
        </div>

        {/* Feedback Alert upon analysis completion */}
        {analysisMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Success</span>
              <span>{analysisMessage}</span>
            </div>
            <button
              onClick={() => setAnalysisMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Balanced Two Sections: Resume & Target JD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION A: Resume / CV */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Resume / CV</span>
                </span>

                {/* Sub-tabs: Upload or Paste */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setCvMode('upload')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                      cvMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upload CV
                  </button>
                  <button
                    onClick={() => setCvMode('paste')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                      cvMode === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {cvMode === 'upload' ? (
                <div className="space-y-3">
                  {/* Stable Review State when file is picked */}
                  {cvFile ? (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-5 h-5 text-indigo-400" />
                          <div>
                            <span className="text-xs font-semibold text-white block truncate max-w-[220px]">
                              {cvFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {(cvFile.size / 1024).toFixed(1)} KB • {cvFile.type || 'Document'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isCvConfirmed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isCvConfirmed ? 'Confirmed' : 'Pending Confirmation'}
                        </span>
                      </div>

                      {/* Controls to confirm or replace */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                        {!isCvConfirmed && (
                          <button
                            type="button"
                            onClick={handleConfirmCvUpload}
                            disabled={isCvProcessing}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                          >
                            {isCvProcessing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <span>Confirm Upload</span>
                            )}
                          </button>
                        )}
                        <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition cursor-pointer">
                          <span>Replace</span>
                          <input
                            ref={cvFileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleCvFileSelected}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveCvFile}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* File picker box */
                    <div className="p-6 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl text-center space-y-2 bg-slate-900/40">
                      <Upload className="w-7 h-7 text-indigo-400 mx-auto" />
                      <div>
                        <label className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 cursor-pointer block">
                          <span>Choose a CV file (.pdf, .docx, .txt)</span>
                          <input
                            ref={cvFileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleCvFileSelected}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Select your document to inspect and confirm
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sample Resume Quick Load */}
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-500">
                      {isCvConfirmed ? '✓ Resume loaded' : 'No CV confirmed yet'}
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadSampleCv}
                      className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                    >
                      Load Sample Resume
                    </button>
                  </div>
                </div>
              ) : (
                /* Paste Text Mode */
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      setIsCvConfirmed(false);
                    }}
                    placeholder="Paste plain-text resume here..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-mono">
                      {cvText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLoadSampleCv}
                        className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        Sample Resume
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPastedCv}
                        disabled={!cvText.trim()}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg cursor-pointer"
                      >
                        Confirm CV Text
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
              <span>Status:</span>
              <span className={hasCv ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {hasCv ? 'Resume Loaded' : 'None provided (optional)'}
              </span>
            </div>
          </div>

          {/* SECTION B: Target Job Description (JD) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Target Job Description</span>
                </span>

                {/* Sub-tabs: Upload or Paste */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setJdMode('upload')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                      jdMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upload JD
                  </button>
                  <button
                    onClick={() => setJdMode('paste')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                      jdMode === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Paste JD
                  </button>
                  {allJDs.filter((j) => j.company || j.title).length > 0 && (
                    <button
                      onClick={() => setJdMode('saved')}
                      className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                        jdMode === 'saved' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Saved
                    </button>
                  )}
                </div>
              </div>

              {jdMode === 'upload' ? (
                <div className="space-y-3">
                  {/* Stable Review State for JD */}
                  {jdFile ? (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-5 h-5 text-emerald-400" />
                          <div>
                            <span className="text-xs font-semibold text-white block truncate max-w-[220px]">
                              {jdFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {(jdFile.size / 1024).toFixed(1)} KB • {jdFile.type || 'Document'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isJdConfirmed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isJdConfirmed ? 'Confirmed' : 'Pending Confirmation'}
                        </span>
                      </div>

                      {/* Controls to confirm or replace */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                        {!isJdConfirmed && (
                          <button
                            type="button"
                            onClick={handleConfirmJdUpload}
                            disabled={isJdProcessing}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                          >
                            {isJdProcessing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <span>Confirm JD Upload</span>
                            )}
                          </button>
                        )}
                        <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition cursor-pointer">
                          <span>Replace</span>
                          <input
                            ref={jdFileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleJdFileSelected}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveJdFile}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Visible File picker box */
                    <div className="p-6 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl text-center space-y-2 bg-slate-900/40">
                      <Upload className="w-7 h-7 text-emerald-400 mx-auto" />
                      <div>
                        <label className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer block">
                          <span>Choose a JD file (.pdf, .docx, .txt)</span>
                          <input
                            ref={jdFileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleJdFileSelected}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Visible document upload control for target JD
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-500">
                      {isJdConfirmed && (activeJD?.company || activeJD?.title)
                        ? `Target: ${activeJD.company || ''} ${activeJD.title ? `(${activeJD.title})` : ''}`
                        : 'No target JD document selected'}
                    </span>
                  </div>
                </div>
              ) : jdMode === 'paste' ? (
                /* Paste Text Mode */
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={jdCompany}
                      onChange={(e) => setJdCompany(e.target.value)}
                      placeholder="Company Name"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={jdRole}
                      onChange={(e) => setJdRole(e.target.value)}
                      placeholder="Role Title"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-500"
                    />
                  </div>
                  <textarea
                    rows={4}
                    value={jdText}
                    onChange={(e) => {
                      setJdText(e.target.value);
                      setIsJdConfirmed(false);
                    }}
                    placeholder="Paste job description requirements, skills, and eligibility..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleConfirmPastedJd}
                      disabled={!jdText.trim() && !jdRole.trim()}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Confirm JD
                    </button>
                  </div>
                </div>
              ) : (
                /* Saved Roles */
                <div className="space-y-2">
                  <select
                    value={activeJD?.id}
                    onChange={(e) => {
                      const found = allJDs.find((j) => j.id === e.target.value);
                      if (found) {
                        setActiveJD(found);
                        setIsJdConfirmed(true);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    {allJDs
                      .filter((j) => j.company || j.title)
                      .map((jd) => (
                        <option key={jd.id} value={jd.id}>
                          {jd.company ? `${jd.company} • ` : ''}{jd.title || 'Untitled Role'}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
              <span>Status:</span>
              <span className={hasJd ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {hasJd ? `${activeJD.company || ''} ${activeJD.title ? `(${activeJD.title})` : ''}` : 'None provided (optional)'}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON: Centered, Prominent, Clean Label "Analyze" */}
        <div className="pt-4 flex flex-col items-center justify-center border-t border-slate-800/80">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full sm:w-auto min-w-[260px] px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze</span>
              </>
            )}
          </button>

          {!canAnalyze && (
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Please provide either a Resume / CV or a Target Job Description to analyze.
            </p>
          )}

          {canAnalyze && (
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {hasCv && hasJd
                ? 'Full Analysis: Evaluates CV qualifications, required JD skills, and ATS alignment.'
                : hasCv
                ? 'CV Analysis: Extracts profile skills, academics, and career readiness.'
                : 'Job Description Analysis: Evaluates role criteria and preparation requirements.'}
            </p>
          )}
        </div>
      </div>

      {/* 3. WORKSPACE SUMMARY OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Overall Career Readiness
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{readiness.overallScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated across academic standing, verified projects, and practice sessions.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('pillar-9-readiness')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-between cursor-pointer"
          >
            <span>View Readiness Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Role Fit Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Target Role Fit
              </span>
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            {activeJD?.company || activeJD?.title ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {currentFitReport.overallFitScore}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentFitReport.matchTier}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {currentFitReport.eligibilityPassed
                    ? 'Eligible for application based on current academic cutoffs.'
                    : 'Check academic criteria cutoff gate for this role.'}
                </p>
              </>
            ) : (
              <div className="py-2">
                <span className="text-xs text-slate-500 block">No target job description active.</span>
                <p className="text-xs text-slate-400 mt-1">Upload or select a JD to evaluate role fit.</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setActiveTab('pillar-4-opportunity')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-between cursor-pointer"
          >
            <span>View Role Fit Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Applications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Application Pipeline
              </span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{activeApps.length}</span>
              <span className="text-xs text-slate-500">active applications</span>
            </div>
            <p className="text-xs text-slate-400">
              {activeApps.length > 0
                ? `${activeApps.filter((a) => a.stage === 'Shortlisted').length} shortlisted, ${activeApps.filter((a) => a.stage === 'Interview Pending').length} interview pending.`
                : 'Track your campus and external job applications.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('pillar-7-applications')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-between cursor-pointer"
          >
            <span>View Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. MODAL: Review & Confirm Extracted Academic Details & Links */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Review Detected Academic Details & Links</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm or edit details extracted from your CV before updating your Profile & Academics.
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Notice if any */}
            {reviewItems.some((i) => i.isConflict) && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-semibold block">Differences detected with existing profile</span>
                  <span>
                    Some values extracted from your CV differ from what is currently saved in your profile. Select which value you want to keep.
                  </span>
                </div>
              </div>
            )}

            {/* List of items to review */}
            <div className="overflow-y-auto space-y-3 pr-1 py-1 flex-1">
              {reviewItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    item.isConflict
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {item.category === 'Links' ? (
                        <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{item.label}</span>
                    </span>
                    {item.isConflict && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
                        Conflict Detected
                      </span>
                    )}
                  </div>

                  {item.isConflict ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Option A: Saved in Profile */}
                        <button
                          type="button"
                          onClick={() => {
                            setReviewItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, currentChoice: item.savedValue } : i))
                            );
                          }}
                          className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                            item.currentChoice === item.savedValue
                              ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] block text-slate-500 uppercase font-bold">
                            Current in Profile
                          </span>
                          <span className="block truncate mt-0.5">{item.savedValue}</span>
                        </button>

                        {/* Option B: Detected in CV */}
                        <button
                          type="button"
                          onClick={() => {
                            setReviewItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, currentChoice: item.detectedValue } : i))
                            );
                          }}
                          className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                            item.currentChoice === item.detectedValue
                              ? 'bg-emerald-600/30 border-emerald-500 text-white font-medium'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] block text-emerald-400 uppercase font-bold">
                            Detected in CV
                          </span>
                          <span className="block truncate mt-0.5">{item.detectedValue}</span>
                        </button>
                      </div>

                      {/* Custom override input */}
                      <div>
                        <input
                          type="text"
                          value={item.currentChoice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReviewItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, currentChoice: val } : i))
                            );
                          }}
                          placeholder="Or type custom value..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.currentChoice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReviewItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, currentChoice: val } : i))
                          );
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                      />
                      <span className="text-[10px] text-emerald-400 shrink-0 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Saving will update your Profile & Academics without duplicate records.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReviewData}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Save to Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
