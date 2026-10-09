export type DataProvenance =
  | 'user_provided'
  | 'extracted'
  | 'verified'
  | 'system_derived'
  | 'deterministic'
  | 'ai_interpreted'
  | 'ai_recommended'
  | 'estimate'
  | 'uncertain';

export type VerificationStatus = 'verified' | 'pending_verification' | 'discrepancy' | 'unverified';

export type EvidenceLevel = 0 | 1 | 2 | 3 | 4;

export type EvidenceRelevance = 'Directly Relevant' | 'Transferably Relevant' | 'Low Relevance';

export type GapType = 'Profile Gap' | 'CV Gap' | 'Evidence Gap';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ApplicationStage =
  | 'Applied'
  | 'Shortlisted'
  | 'Assessment Pending'
  | 'GD Pending'
  | 'Interview Pending'
  | 'Result Awaited'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn'
  | 'Other/Custom';

export interface AcademicTerm {
  termNumber: number;
  sgpa: number;
  credits: number;
  verified: boolean;
  marksheetDocId?: string;
}

export interface EducationRecord {
  id: string;
  institution: string;
  degree: string;
  course?: string;
  branch: string;
  startYear: number;
  expectedGraduationYear: number;
  expectedCompletionDate?: string;
  degreeStatus?: 'pursuing' | 'completed';
  gradingSystem?: 'cgpa' | 'percentage';
  termsCompleted?: number;
  currentSemester: number;
  totalSemesters: number;
  selfReportedCGPA: number;
  percentageValue?: number;
  verifiedCGPA?: number;
  marksheetExtractedCGPA?: number;
  discrepancyFlag?: boolean;
  credentialDocUrl?: string;
  terms: AcademicTerm[];
  provenance: DataProvenance;
  verificationStatus: VerificationStatus;
}

export interface ExperienceRecord {
  id: string;
  company: string;
  role: string;
  duration: string;
  startDate: string;
  endDate: string;
  description: string;
  impactMetrics: string[];
  skillsUsed: string[];
  evidenceLevel: EvidenceLevel;
  provenance: DataProvenance;
  verificationStatus: VerificationStatus;
}

export interface SchoolAcademicRecord {
  board: string;
  school: string;
  year: number;
  score: string;
  percentage?: number;
  stream?: string;
}

export interface PostgraduateRecord {
  institution: string;
  degree: string;
  specialisation?: string;
  startYear?: number;
  completionYear?: number;
  cgpa?: number;
}

export interface AchievementRecord {
  id: string;
  title: string;
  category: 'Academic' | 'Professional' | 'Competition' | 'Leadership' | 'Extracurricular' | 'Other';
  description: string;
  date?: string;
  impact?: string;
  verificationStatus: VerificationStatus;
  provenance: DataProvenance;
}

export interface PublicationRecord {
  id: string;
  title: string;
  publisherOrConference?: string;
  year?: number;
  url?: string;
  summary?: string;
  provenance: DataProvenance;
}

export type CompetencyStatus =
  | 'Explicit Statement'
  | 'Practiced in Project/Work'
  | 'Certified'
  | 'Evidence insufficient to assess'
  | 'Required by Role (Gap)';

export interface ProjectRecord {
  id: string;
  title: string;
  role: string;
  techStack: string[];
  description: string;
  outcomes: string;
  objective?: string;
  contribution?: string;
  methodology?: string;
  quantifiedImpact?: string;
  relevanceToTargetRole?: string;
  missingDetailsNote?: string;
  githubUrl?: string;
  liveUrl?: string;
  evidenceLevel: EvidenceLevel;
  provenance: DataProvenance;
  verificationStatus: VerificationStatus;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Core CS' | 'Languages & Frameworks' | 'System & Cloud' | 'Databases' | 'Soft Skills';
  evidenceLevel: EvidenceLevel;
  supportingEvidence: string[];
  relevance: EvidenceRelevance;
  provenance: DataProvenance;
  competencyStatus?: CompetencyStatus;
  demonstratedDepth?: string;
  relevanceToTargetRole?: string;
  missingEvidenceNote?: string;
  recommendedNextAction?: string;
}

export interface CertificationRecord {
  id: string;
  title: string;
  issuingOrg: string;
  issueDate: string;
  credentialUrl?: string;
  verified: boolean;
  provenance: DataProvenance;
  skillsRepresented?: string[];
  relevanceToTargetRole?: string;
  verificationNote?: string;
}

export interface CareerPreferences {
  targetRoles: string[];
  targetLocations: string[];
  preferredWorkType: 'Hybrid' | 'Remote' | 'On-site' | 'Flexible';
  minAcceptableCTC: string;
  targetIndustry: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course?: string;
  headline: string;
  about: string;
  careerStage: 'Final Year Student' | 'Pre-final Year' | 'Fresh Graduate' | 'Early-Career Professional';
  onboardingCompleted?: boolean;
  linkedInUrl: string;
  linkedInExportText?: string;
  linkedInExportFileName?: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeUrl?: string;
  resumeText?: string;
  themePreference?: 'dark' | 'light';
  class10?: SchoolAcademicRecord;
  class12?: SchoolAcademicRecord;
  postgraduate?: PostgraduateRecord;
  education: EducationRecord;
  experiences: ExperienceRecord[];
  projects: ProjectRecord[];
  skills: SkillItem[];
  certifications: CertificationRecord[];
  achievements: AchievementRecord[];
  publications?: PublicationRecord[];
  preferences: CareerPreferences;
}

export interface OpportunityJD {
  id: string;
  company: string;
  title: string;
  function: string;
  location: string;
  workArrangement: 'On-site' | 'Hybrid' | 'Remote';
  experienceRange: string;
  educationRequirement: string;
  cgpaCutoff: number;
  maxBacklogs: number;
  salaryRange: string;
  mustHaveSkills: string[];
  preferredSkills: string[];
  goodToHaveSkills: string[];
  keyResponsibilities: string[];
  ambiguousOrUncertainTerms: string[];
  rawText?: string;
}

export interface EligibilityCriterion {
  criterion: string;
  required: string;
  studentValue: string;
  status: 'PASS' | 'FAIL' | 'UNCERTAIN';
  notes: string;
}

export interface RoleFitReport {
  jdId: string;
  overallFitScore: number; // 0-100
  atsScore?: number; // 0-100
  atsBreakdown?: {
    keywordMatchScore: number;
    requiredSkillCoverage: number;
    preferredSkillCoverage: number;
    educationAlignment: number;
    experienceRelevance: number;
    formattingScore: number;
    missingKeywords: string[];
    explanation: string;
  };
  matchTier: 'Strong Match' | 'Conditional Match' | 'Low Match';
  eligibilityPassed: boolean;
  criteriaBreakdown: EligibilityCriterion[];
  matchedSkills: Array<{ skill: string; evidenceLevel: EvidenceLevel; relevance: EvidenceRelevance }>;
  missingMustHaves: Array<{ skill: string; gapType: GapType }>;
  missingPreferred: Array<{ skill: string; gapType: GapType }>;
  positiveContributors: string[];
  limitingFactors: string[];
  ambiguityNotes: string[];
  // Seven-Gap Taxonomy (Requirement 9)
  profileStrengths?: string[];
  cvPresentationGaps?: string[];
  genuineCapabilityGaps?: string[];
  jdAlignmentGaps?: string[];
  eligibilityGaps?: string[];
  missingEvidenceItems?: string[];
  visibilityGaps?: string[];
  calculatedAt: string;
}

export interface CVGapItem {
  id: string;
  skillOrCapability: string;
  gapType: GapType;
  description: string;
  evidenceSource?: string;
  suggestedAction: string;
}

export interface CVAnalysis {
  completenessScore: number;
  grammarQualityScore?: number;
  structureScore?: number;
  actionVoiceScore?: number;
  quantifiedAchievementsRatio: number;
  activeVoiceRatio: number;
  targetJDAlignmentScore: number;
  atsFormattingScore?: number;
  atsFormattingIssues?: string[];
  contentCoverage?: {
    education: boolean;
    skills: boolean;
    projects: boolean;
    experience: boolean;
    certifications: boolean;
    achievements: boolean;
    contactInfo: boolean;
    links: boolean;
  };
  strengths?: string[];
  presentationGaps?: string[];
  gaps: CVGapItem[];
  bulletImprovements: Array<{ original: string; improved: string; rationale: string }>;
  suggestedKeywordsToAdd: string[];
  provenance: DataProvenance;
  lastAnalyzed: string;
}

export interface LinkedInAnalysis {
  completenessScore: number;
  headlineAudit: { current: string; suggested: string; rationale: string };
  aboutSummaryAudit: { current: string; suggested: string; rationale: string };
  visibilityGaps: Array<{ skill: string; reason: string; action: string }>;
  genuineSkillGaps: Array<{ skill: string; reason: string; action: string }>;
  sectionChecklist: Array<{ section: string; status: 'Optimized' | 'Needs Attention' | 'Missing'; note: string }>;
  lastAnalyzed: string;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  previousStage: ApplicationStage | null;
  newStage: ApplicationStage;
  eventType: string;
  eventDate: string;
  notes?: string;
  created_at: string;
}

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  stage: ApplicationStage;
  stageUpdatedDate: string;
  applicationType?: 'On-Campus' | 'Off-Campus';
  opportunityId?: string;
  source?: string;
  sourceUrl?: string;
  healthCategory: 'Healthy' | 'Requires Attention' | 'At Risk' | 'Completed / Closed' | 'No recorded update' | 'Stale';
  healthRationale: string;
  history: Array<{ stage: ApplicationStage; timestamp: string; comment?: string }>;
  events?: ApplicationEvent[];
  salaryOffered?: string;
  location?: string;
  notes?: string;
}

export interface PracticeRubricScore {
  score: number;
  feedback: string;
}

export interface PracticeEvaluation {
  scoreOutOf10: number;
  overallVerdict: 'Strong' | 'Satisfactory' | 'Needs Development' | 'Incomplete';
  rubricBreakdown: {
    correctnessAndTechnicalDepth: PracticeRubricScore;
    structureAndFrameworkAdherence: PracticeRubricScore;
    communicationAndClarity: PracticeRubricScore;
    relevanceToTargetRole: PracticeRubricScore;
  };
  highlightedStrengths: string[];
  pinpointedWeaknesses: string[];
  idealAnswerStructure: string;
  followUpQuestion: string;
  recommendedFocus?: string;
}

export interface PracticeQuestionContext {
  category: string;
  reason: string;
  source: string;
  difficulty: string;
  framework?: string;
}

export interface PracticeSession {
  id: string;
  category: 'Aptitude' | 'Technical' | 'Group Discussion (GD)' | 'Case Interview' | 'Personal Interview';
  mode: 'Practice' | 'Timed Practice' | 'Targeted Weakness Practice';
  frameworkApplied: string;
  targetRole?: string;
  opportunityId?: string;
  applicationId?: string;
  question: string;
  questionContext?: PracticeQuestionContext;
  studentAnswer: string;
  evaluation?: PracticeEvaluation;
  status?: 'in_progress' | 'completed';
  startedAt?: string;
  completedAt: string;
}

export interface ReadinessDimensions {
  academicReadiness: number; // 0-100
  profileReadiness: number; // 0-100
  skillReadiness: number; // 0-100
  opportunityReadiness: number | null; // 0-100 or null if no opportunity analyzed
  interviewReadiness: number | null; // 0-100 or null if no practice completed
  opportunityReadinessNote?: string;
  interviewReadinessNote?: string;
  overallScore: number; // 0-100
  trend: 'Improving' | 'Stable' | 'Declining' | 'Insufficient history';
  positiveContributors: string[];
  limitingFactors: string[];
  missingInformation?: string[];
  recommendedNextAction?: string;
  methodologyVersion?: string;
  lastCalculated: string;
}

export interface ReadinessSnapshot extends ReadinessDimensions {
  id: string;
  triggerEvent: string;
  timestamp: string;
}

export interface NextBestAction {
  id: string;
  title: string;
  description: string;
  impact: 'High Impact' | 'Medium Impact' | 'Foundational';
  effort: 'Quick Win (<15m)' | 'Moderate (1-2h)' | 'Deep Work (>1d)';
  urgency: 'Immediate' | 'This Week' | 'Ongoing';
  pillarTarget: string;
  rationale: string;
  isCompleted: boolean;
  triggeringFinding?: string;
  targetModule?: string;
  expectedOutcome?: string;
}

export interface EventImpactRecord {
  id: string;
  timestamp: string;
  eventType: string;
  sourcePillar: string;
  affectedDimensions: string[];
  explanation: string;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  recipient: string;
  recipientRole?: string;
  reportTitle: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'PENDING_APPROVAL' | 'AUDIT_LOGGED' | 'SIMULATED_PREVIEW';
  authenticatedSender: string;
}

export * from './auth';
export * from './state';

