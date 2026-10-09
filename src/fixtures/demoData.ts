import {
  StudentProfile,
  OpportunityJD,
  ApplicationRecord,
  PracticeSession,
  CVAnalysis,
  LinkedInAnalysis,
  ReadinessSnapshot,
  EventImpactRecord,
  AcademicTerm,
} from '../types';

/**
 * EXPLICIT DEMO FIXTURE LAYER
 *
 * All seed/demo information for reference persona "Aarav Sharma" is isolated here.
 * This is NEVER used as fallback data for production flows.
 * It is only accessible when the user explicitly enables Demo Mode.
 */

export const DEMO_TERMS: AcademicTerm[] = [
  { termNumber: 1, sgpa: 8.1, credits: 24, verified: true },
  { termNumber: 2, sgpa: 8.2, credits: 24, verified: true },
  { termNumber: 3, sgpa: 8.3, credits: 25, verified: true },
  { termNumber: 4, sgpa: 8.5, credits: 24, verified: true },
  { termNumber: 5, sgpa: 8.6, credits: 23, verified: true },
  { termNumber: 6, sgpa: 8.7, credits: 24, verified: true },
];

export const AARAV_SHARMA_DEMO_PROFILE: StudentProfile = {
  id: 'aarav-sharma-demo-01',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@campus.edu',
  phone: '+91 98765 43210',
  college: 'National Institute of Technology, Karnataka (NITK)',
  headline: 'Final Year B.Tech CSE Student | Full Stack & Systems Enthusiast',
  about:
    'Aspiring software engineer passionate about scalable distributed systems and responsive user applications. Strong foundations in data structures, algorithms, TypeScript, and relational databases. Seeking SDE roles for 2026 graduation.',
  careerStage: 'Final Year Student',
  linkedInUrl: 'https://linkedin.com/in/aarav-sharma-dev',
  githubUrl: 'https://github.com/aarav-sharma-dev',
  portfolioUrl: 'https://aarav-portfolio.dev',
  class10: {
    board: 'CBSE',
    school: 'Delhi Public School, R.K. Puram',
    year: 2020,
    score: '94.2%',
    percentage: 94.2,
  },
  class12: {
    board: 'CBSE',
    school: 'Delhi Public School, R.K. Puram',
    stream: 'Science (PCM + Computer Science)',
    year: 2022,
    score: '96.0%',
    percentage: 96.0,
  },
  education: {
    id: 'edu-demo-01',
    institution: 'National Institute of Technology, Karnataka',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Computer Science & Engineering',
    startYear: 2022,
    expectedGraduationYear: 2026,
    currentSemester: 7,
    totalSemesters: 8,
    selfReportedCGPA: 8.4,
    verifiedCGPA: 8.4,
    terms: DEMO_TERMS,
    provenance: 'verified',
    verificationStatus: 'verified',
  },
  experiences: [
    {
      id: 'exp-demo-01',
      company: 'HyperGrowth Labs',
      role: 'Software Engineering Intern',
      duration: 'May 2025 - Jul 2025 (3 mos)',
      startDate: '2025-05-01',
      endDate: '2025-07-31',
      description:
        'Engineered responsive customer dashboards using React, TypeScript, and Express. Optimized relational database queries, reducing average API response latency by 38%. Participated in daily standups and bi-weekly production sprint deployments.',
      impactMetrics: [
        'Reduced API response latency by 38%',
        'Built 12+ responsive UI components',
        'Achieved 95% test coverage on core service',
      ],
      skillsUsed: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      evidenceLevel: 3,
      provenance: 'verified',
      verificationStatus: 'verified',
    },
  ],
  projects: [
    {
      id: 'proj-demo-01',
      title: 'DevPulse — Real-Time Developer Collaboration Hub',
      role: 'Solo Creator',
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'WebSockets'],
      description:
        'Architected a collaborative code editor and real-time review room with persistent workspace storage and differential synchronization.',
      outcomes: 'Used by 250+ university peers during coding hackathons with zero downtime.',
      githubUrl: 'https://github.com/aarav-sharma-dev/devpulse',
      liveUrl: 'https://devpulse-demo.app',
      evidenceLevel: 3,
      provenance: 'verified',
      verificationStatus: 'verified',
    },
    {
      id: 'proj-demo-02',
      title: 'High-Throughput In-Memory Key-Value Store',
      role: 'Core Developer',
      techStack: ['Go', 'Concurrency', 'TCP', 'Docker'],
      description:
        'Implemented an LRU-evicting memory store with thread-safe locking and asynchronous snapshot write-ahead logging.',
      outcomes: 'Benchmark achieved 45,000 queries per second with sub-millisecond p99 latency.',
      githubUrl: 'https://github.com/aarav-sharma-dev/fast-store',
      evidenceLevel: 2,
      provenance: 'verified',
      verificationStatus: 'verified',
    },
  ],
  skills: [
    {
      id: 'sk-demo-1',
      name: 'Data Structures & Algorithms',
      category: 'Core CS',
      evidenceLevel: 3,
      supportingEvidence: ['NITK Coursework (Grade A)', 'LeetCode 380+ problems solved'],
      relevance: 'Directly Relevant',
      provenance: 'verified',
    },
    {
      id: 'sk-demo-2',
      name: 'TypeScript & JavaScript',
      category: 'Languages & Frameworks',
      evidenceLevel: 3,
      supportingEvidence: ['DevPulse Project', 'HyperGrowth Labs Internship'],
      relevance: 'Directly Relevant',
      provenance: 'verified',
    },
    {
      id: 'sk-demo-3',
      name: 'React.js',
      category: 'Languages & Frameworks',
      evidenceLevel: 3,
      supportingEvidence: ['HyperGrowth Labs UI modules', 'DevPulse Collaboration Hub'],
      relevance: 'Directly Relevant',
      provenance: 'verified',
    },
    {
      id: 'sk-demo-4',
      name: 'Node.js / Express',
      category: 'Languages & Frameworks',
      evidenceLevel: 3,
      supportingEvidence: ['HyperGrowth Labs backend APIs', 'DevPulse WebSocket service'],
      relevance: 'Directly Relevant',
      provenance: 'verified',
    },
    {
      id: 'sk-demo-5',
      name: 'SQL & PostgreSQL',
      category: 'Databases',
      evidenceLevel: 3,
      supportingEvidence: ['Database course lab', 'Indexed query tuning in internship'],
      relevance: 'Directly Relevant',
      provenance: 'verified',
    },
    {
      id: 'sk-demo-6',
      name: 'Docker & Containerization',
      category: 'System & Cloud',
      evidenceLevel: 2,
      supportingEvidence: ['Docker Compose configs for local multi-container dev'],
      relevance: 'Transferably Relevant',
      provenance: 'verified',
    },
    {
      id: 'sk-demo-7',
      name: 'System Design Basics',
      category: 'Core CS',
      evidenceLevel: 1,
      supportingEvidence: ['High-level reading & university seminar'],
      relevance: 'Directly Relevant',
      provenance: 'user_provided',
    },
    {
      id: 'sk-demo-8',
      name: 'Cloud Infrastructure (AWS/GCP)',
      category: 'System & Cloud',
      evidenceLevel: 1,
      supportingEvidence: ['Basic EC2 & S3 deployment tutorial'],
      relevance: 'Transferably Relevant',
      provenance: 'user_provided',
    },
  ],
  certifications: [
    {
      id: 'cert-demo-1',
      title: 'AWS Certified Cloud Practitioner',
      issuingOrg: 'Amazon Web Services',
      issueDate: '2024-11',
      credentialUrl: 'https://aws.amazon.com/verify/109847',
      verified: true,
      provenance: 'verified',
      skillsRepresented: ['Cloud Infrastructure (AWS/GCP)', 'Docker & Containerization'],
      relevanceToTargetRole: 'Directly Relevant',
    },
  ],
  achievements: [
    {
      id: 'ach-demo-1',
      title: 'Winner — Smart India Hackathon (Internal Institutional Round)',
      category: 'Competition',
      description: 'Built an offline-first crisis relief dispatch system using WebSocket mesh networks.',
      date: '2024-09',
      impact: 'Selected among top 3 teams representing NITK out of 120 submissions.',
      verificationStatus: 'verified',
      provenance: 'verified',
    },
    {
      id: 'ach-demo-2',
      title: 'Academic Merit Scholarship for Top 5% in CSE Department',
      category: 'Academic',
      description: 'Awarded tuition waiver merit citation for consistent SGPA above 8.5 across consecutive semesters.',
      date: '2023-12',
      impact: 'Maintained top 5 percentile standing across 140 enrolled CSE undergraduates.',
      verificationStatus: 'verified',
      provenance: 'verified',
    },
    {
      id: 'ach-demo-3',
      title: 'Lead Organizer — Annual Open Source Summit NITK',
      category: 'Leadership',
      description: 'Coordinated student hackathon workshops and invited 4 industry speakers for 450+ attendees.',
      date: '2025-02',
      impact: 'Facilitated 65 beginner contributions to open-source repositories.',
      verificationStatus: 'verified',
      provenance: 'verified',
    },
  ],
  publications: [
    {
      id: 'pub-demo-1',
      title: 'Benchmarking Lock-Free In-Memory Hash Maps for Concurrency-Intensive Microservices',
      publisherOrConference: 'NITK Undergraduate Research Journal (Student Track)',
      year: 2024,
      summary: 'Comparative analysis of mutex contention vs optimistic read-copy update locks in modern multi-threaded runtimes.',
      provenance: 'verified',
    },
  ],
  preferences: {
    targetRoles: ['Software Development Engineer (SDE-1)', 'Full Stack Developer', 'Backend Engineer'],
    targetLocations: ['Bengaluru', 'Hyderabad', 'Remote'],
    preferredWorkType: 'Hybrid',
    minAcceptableCTC: '₹12 LPA',
    targetIndustry: ['Product Tech', 'FinTech', 'SaaS'],
  },
};

export const DEMO_JDS: OpportunityJD[] = [
  {
    id: 'jd-demo-01',
    company: 'Tech Innovators Corp',
    title: 'Software Development Engineer (SDE-1)',
    function: 'Core Engineering',
    location: 'Bengaluru / Hybrid',
    workArrangement: 'Hybrid',
    experienceRange: '0 - 1 Years (2025/2026 Batch Eligible)',
    educationRequirement: 'B.Tech/B.E in Computer Science, IT or related engineering',
    cgpaCutoff: 7.5,
    maxBacklogs: 0,
    salaryRange: '₹14 - ₹18 LPA CTC',
    mustHaveSkills: ['Data Structures & Algorithms', 'TypeScript & JavaScript', 'React.js', 'Node.js / Express', 'SQL & PostgreSQL'],
    preferredSkills: ['System Design Basics', 'Docker & Containerization', 'Cloud Infrastructure (AWS/GCP)'],
    goodToHaveSkills: ['GraphQL', 'Redis', 'CI/CD Pipelines'],
    keyResponsibilities: [
      'Design, develop, and maintain web services and responsive user applications.',
      'Collaborate in agile sprint cycles with product designers and backend architects.',
      'Write comprehensive unit and integration tests for zero regression.',
    ],
    ambiguousOrUncertainTerms: [
      'Specific cloud provider certification is noted as preferred, but alternative cloud experience may be accepted at recruiter discretion.',
    ],
    rawText: `Tech Innovators Corp is hiring for Software Development Engineer (SDE-1) in Bengaluru (Hybrid).
Minimum Requirements: B.Tech in CSE/IT, minimum 7.5 CGPA with zero active backlogs.
Required Skills: Strong DSA, JavaScript/TypeScript, React, Node.js, and SQL.
Preferred: Docker, Cloud platforms (AWS/GCP), System Design fundamentals.`,
  },
  {
    id: 'jd-demo-02',
    company: 'FinTech Global Scale',
    title: 'High-Frequency Systems Trainee',
    function: 'Quantitative Infrastructure',
    location: 'Mumbai / On-site',
    workArrangement: 'On-site',
    experienceRange: '0 - 2 Years',
    educationRequirement: 'B.Tech / M.Tech in CS or ECE with strict top-percentile academic standing',
    cgpaCutoff: 8.8,
    maxBacklogs: 0,
    salaryRange: '₹22 - ₹28 LPA CTC',
    mustHaveSkills: ['C++ / Go Low Latency', 'Linux Kernel & Sockets', 'High-Throughput Concurrency', 'Advanced Algorithms'],
    preferredSkills: ['FPGA Architecture', 'Memory Profiling', 'Distributed Consensus'],
    goodToHaveSkills: ['Python Data Analysis'],
    keyResponsibilities: ['Build ultra low-latency message queues and exchange connectivity adapters.'],
    ambiguousOrUncertainTerms: ['Cut-off criteria strictly non-negotiable for 1st round aptitude shortlist.'],
    rawText: `FinTech Global Scale: Hiring Systems Trainees. Mandatory CGPA Cutoff: 8.80. Zero backlogs. Focus on C++/Go low-latency systems.`,
  },
  {
    id: 'jd-demo-03',
    company: 'Stealth AI Venture',
    title: 'Full Stack AI Explorer',
    function: 'Experimental Product',
    location: 'Remote / Flexible',
    workArrangement: 'Remote',
    experienceRange: 'Flexible / Student or Fresher',
    educationRequirement: 'Relevant degree or equivalent proof of work',
    cgpaCutoff: 6.5,
    maxBacklogs: 1,
    salaryRange: 'Equity + ₹10 - ₹15 LPA',
    mustHaveSkills: ['React.js', 'TypeScript & JavaScript', 'Python / GenAI API integration'],
    preferredSkills: ['Vector Databases', 'Prompt Engineering'],
    goodToHaveSkills: ['Next.js', 'Tailwind CSS'],
    keyResponsibilities: ['Move fast, prototype LLM agents, and build delighting user experiences.'],
    ambiguousOrUncertainTerms: [
      'Unclear job security: "High performance or exit in 90 days" clause present in advisory notice.',
      'Uncertain tech stack requirement: mentions both Python backend and Node backend simultaneously.',
    ],
    rawText: `Stealth AI: Looking for hustlers to build next-gen AI interfaces. Need React, TypeScript, quick prototyping skills.`,
  },
];

export const DEMO_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app-demo-01',
    company: 'Tech Innovators Corp',
    role: 'Software Development Engineer (SDE-1)',
    appliedDate: '2026-09-20',
    stage: 'Shortlisted',
    stageUpdatedDate: '2026-10-02',
    healthCategory: 'Healthy',
    healthRationale: 'Deterministic eligibility satisfied (8.4 CGPA >= 7.5 cutoff); role fit evaluated as Strong Match.',
    history: [
      { stage: 'Applied', timestamp: '2026-09-20', comment: 'Applied via campus recruitment portal' },
      { stage: 'Shortlisted', timestamp: '2026-10-02', comment: 'Cleared resume and academic threshold screening' },
    ],
    location: 'Bengaluru',
    notes: 'Campus drive technical interview round expected within 7-10 days.',
  },
  {
    id: 'app-demo-02',
    company: 'FinTech Global Scale',
    role: 'High-Frequency Systems Trainee',
    appliedDate: '2026-09-15',
    stage: 'Rejected',
    stageUpdatedDate: '2026-09-18',
    healthCategory: 'Completed / Closed',
    healthRationale: 'Deterministic eligibility cutoff of 8.80 CGPA was not met (student CGPA: 8.40).',
    history: [
      { stage: 'Applied', timestamp: '2026-09-15', comment: 'Off-campus referral application' },
      { stage: 'Rejected', timestamp: '2026-09-18', comment: 'Automated academic cut-off filter rejected profile' },
    ],
    location: 'Mumbai',
    notes: 'Reinforces focus on opportunities where 8.4 CGPA qualifies candidate comfortably.',
  },
  {
    id: 'app-demo-03',
    company: 'CloudNexus Inc',
    role: 'Associate Frontend Engineer',
    appliedDate: '2026-09-28',
    stage: 'Interview Pending',
    stageUpdatedDate: '2026-10-05',
    healthCategory: 'Requires Attention',
    healthRationale: 'Technical interview scheduled for upcoming Friday. Practice coach focus recommended on React internals.',
    history: [
      { stage: 'Applied', timestamp: '2026-09-28' },
      { stage: 'Assessment Pending', timestamp: '2026-10-01' },
      { stage: 'Interview Pending', timestamp: '2026-10-05', comment: 'Cleared online coding assessment' },
    ],
    location: 'Hyderabad / Remote',
    notes: 'Round 1 technical discussion with Senior UI Architect.',
  },
];

export const DEMO_PRACTICE_SESSIONS: PracticeSession[] = [
  {
    id: 'prac-demo-01',
    category: 'Personal Interview',
    mode: 'Practice',
    frameworkApplied: 'STAR (Situation, Task, Action, Result)',
    question: 'Tell me about a challenging technical hurdle you faced during your internship and how you resolved it.',
    studentAnswer:
      'Situation: At HyperGrowth Labs, our analytics dashboard query times exceeded 3.5 seconds during peak client loads. Task: I was assigned to investigate slow response times. Action: I used pg_stat_statements to identify unindexed joins, added targeted composite indexes on user_id and created_at, and introduced an in-memory Redis cache for frequently accessed aggregate summaries. Result: Query latency plummeted by 38% from 3.5s to 2.1s, and customer complaints dropped significantly.',
    evaluation: {
      scoreOutOf10: 8.5,
      overallVerdict: 'Strong',
      rubricBreakdown: {
        correctnessAndTechnicalDepth: {
          score: 8.5,
          feedback: 'Excellent usage of production diagnostic tools (pg_stat_statements) and concrete index tuning strategy.',
        },
        structureAndFrameworkAdherence: {
          score: 9.0,
          feedback: 'Flawless adherence to STAR structure. Clear transition between Situation, Task, Action, and Result.',
        },
        communicationAndClarity: {
          score: 8.5,
          feedback: 'Succinct, confident articulation without filler words.',
        },
        relevanceToTargetRole: {
          score: 8.5,
          feedback: 'Directly demonstrates full-stack and database competence demanded in SDE-1 interviews.',
        },
      },
      highlightedStrengths: [
        'Precise quantitative metric (38% reduction from 3.5s to 2.1s)',
        'Clear demonstration of individual technical agency and tool proficiency',
      ],
      pinpointedWeaknesses: [
        'Could briefly mention trade-offs of adding indexes on write heavy tables',
      ],
      idealAnswerStructure: 'STAR method with explicit metrics, diagnostic methodology, and reflection on architectural trade-offs.',
      followUpQuestion: 'When adding those composite indexes, did you evaluate the write amplification or memory footprint impact on the database?',
    },
    completedAt: '2026-10-04T11:20:00Z',
  },
];

export const DEMO_CV_ANALYSIS: CVAnalysis = {
  completenessScore: 82,
  quantifiedAchievementsRatio: 0.65,
  activeVoiceRatio: 0.88,
  targetJDAlignmentScore: 78,
  gaps: [
    {
      id: 'cvgap-demo-1',
      skillOrCapability: 'API Latency Optimization Metric',
      gapType: 'CV Gap',
      description: 'Profile documents 38% API latency reduction with pg_stat_statements, but current CV draft omits the exact metric.',
      evidenceSource: 'HyperGrowth Labs Internship Record',
      suggestedAction: 'Update bullet in CV: "Reduced Postgres query latency by 38% via composite index tuning".',
    },
    {
      id: 'cvgap-demo-2',
      skillOrCapability: 'Cloud Infrastructure / AWS',
      gapType: 'Evidence Gap',
      description: 'CV claims "AWS Cloud Deployment", but profile only contains foundational coursework without a verified repository link.',
      evidenceSource: 'AWS Certified Cloud Practitioner certificate',
      suggestedAction: 'Deploy DevPulse project live on AWS/GCP and link public live demo URL.',
    },
    {
      id: 'cvgap-demo-3',
      skillOrCapability: 'Distributed Consensus & Kafka',
      gapType: 'Profile Gap',
      description: 'Target role mentions message streaming architectures, which is currently unrepresented in the candidate profile.',
      suggestedAction: 'Build a small Kafka/RabbitMQ consumer demo or complete distributed systems module.',
    },
  ],
  bulletImprovements: [
    {
      original: 'Worked on database queries and improved speed of user dashboard.',
      improved: 'Optimized PostgreSQL queries via composite indexing, reducing dashboard API latency by 38% across 5,000+ daily active sessions.',
      rationale: 'Replaces passive duty statement with action verb, technical methodology, and quantifiable metric.',
    },
    {
      original: 'Helped build collaboration feature in web app.',
      improved: 'Architected real-time WebSocket communication layer in DevPulse, supporting 250+ concurrent users with sub-50ms sync.',
      rationale: 'Demonstrates ownership, architecture choice, scale, and concrete outcome.',
    },
  ],
  suggestedKeywordsToAdd: ['PostgreSQL Indexing', 'WebSocket Synchronization', 'RESTful API Design', 'Jest / Unit Testing', 'Docker Containerization'],
  provenance: 'deterministic',
  lastAnalyzed: '2026-10-06T12:00:00Z',
};

export const DEMO_LINKEDIN_ANALYSIS: LinkedInAnalysis = {
  completenessScore: 74,
  headlineAudit: {
    current: 'Final Year B.Tech CSE Student at NITK | Aspiring Techie',
    suggested: 'Software Engineer (Incoming) | TypeScript, React & Distributed Systems | Ex-Intern @ HyperGrowth Labs',
    rationale: 'Recruiters search by target job title and core tech stack rather than generic student status.',
  },
  aboutSummaryAudit: {
    current: 'I am a final year computer science student interested in technology and looking for opportunities.',
    suggested:
      'Final year CS engineer focused on high-throughput backend services and modern TypeScript web apps. Built DevPulse (real-time editor for 250+ users) and improved DB response times by 38% at HyperGrowth Labs. Open to Software Engineering roles starting 2026.',
    rationale: 'Concisely leads with proven results, flagship projects, and availability timeline.',
  },
  visibilityGaps: [
    {
      skill: 'PostgreSQL & Query Tuning',
      reason: 'Student has proven internship impact, but skill is buried below Fold 3 on LinkedIn profile.',
      action: 'Pin HyperGrowth Labs internship with highlighted media link and add SQL to Top 5 Skills.',
    },
    {
      skill: 'In-Memory Store (Go)',
      reason: 'Flagship systems project is completely absent from LinkedIn Featured section.',
      action: 'Add GitHub link to Featured media card with benchmark stats (45k QPS).',
    },
  ],
  genuineSkillGaps: [
    {
      skill: 'Production Kubernetes / Orchestration',
      reason: 'Demanded by 40% of tech job descriptions in target bracket; candidate currently has basic Docker Compose only.',
      action: 'Undertake hands-on Minikube/K8s deployment exercise before applying to high-scale roles.',
    },
  ],
  sectionChecklist: [
    { section: 'Headline', status: 'Needs Attention', note: 'Missing target job title and core tech keywords' },
    { section: 'About Summary', status: 'Needs Attention', note: 'Too generic; needs quantified accomplishments' },
    { section: 'Featured Media', status: 'Missing', note: 'No projects or GitHub repositories pinned' },
    { section: 'Experience', status: 'Optimized', note: 'Internship details and outcomes clearly articulated' },
    { section: 'Skills & Endorsements', status: 'Optimized', note: 'Top 5 skills aligned with software engineering' },
  ],
  lastAnalyzed: '2026-10-06T12:00:00Z',
};

export const DEMO_READINESS_SNAPSHOTS: ReadinessSnapshot[] = [
  {
    id: 'snap-demo-1',
    timestamp: '2026-09-01T00:00:00Z',
    academicReadiness: 75,
    profileReadiness: 65,
    skillReadiness: 60,
    opportunityReadiness: 60,
    interviewReadiness: 50,
    overallScore: 62,
    trend: 'Stable',
    positiveContributors: ['Verified NITK enrollment'],
    limitingFactors: ['No completed internship record', 'No mock interview sessions'],
    triggerEvent: 'Semester 6 Commencement',
    lastCalculated: '2026-09-01T00:00:00Z',
  },
  {
    id: 'snap-demo-2',
    timestamp: '2026-09-25T00:00:00Z',
    academicReadiness: 82,
    profileReadiness: 80,
    skillReadiness: 72,
    opportunityReadiness: 70,
    interviewReadiness: 65,
    overallScore: 74,
    trend: 'Improving',
    positiveContributors: ['Completed HyperGrowth Labs Internship', 'Added DevPulse project evidence'],
    limitingFactors: ['System design gap', 'Only 1 practice session'],
    triggerEvent: 'Internship Verification Added',
    lastCalculated: '2026-09-25T00:00:00Z',
  },
];

export const DEMO_EVENT_LOG: EventImpactRecord[] = [
  {
    id: 'ev-demo-1',
    timestamp: '2026-10-06T10:15:00Z',
    eventType: 'Reference Profile Baseline Established',
    sourcePillar: 'Pillar 1: Student Intelligence Profile',
    affectedDimensions: ['Academic Readiness', 'Profile Readiness', 'Skill Readiness'],
    explanation: 'Verified 6 completed university terms and 2 practical software engineering projects.',
  },
];

/**
 * CLEAN PRODUCTION BASELINE (Initial state for an unconfigured student)
 *
 * Free of hardcoded names, fake CGPAs, fake internships, or phantom verifications.
 */
export function createBlankProductionProfile(id: string = 'prod-student-01'): StudentProfile {
  return {
    id,
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    headline: '',
    about: '',
    careerStage: 'Final Year Student',
    linkedInUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    resumeText: '',
    themePreference: 'dark',
    education: {
      id: `edu-${id}`,
      institution: '',
      degree: '',
      course: '',
      branch: '',
      startYear: new Date().getFullYear() - 3,
      expectedGraduationYear: new Date().getFullYear() + 1,
      expectedCompletionDate: '',
      currentSemester: 1,
      totalSemesters: 8,
      selfReportedCGPA: 0,
      terms: [],
      provenance: 'user_provided',
      verificationStatus: 'unverified',
    },
    experiences: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    publications: [],
    preferences: {
      targetRoles: [],
      targetLocations: [],
      preferredWorkType: 'Hybrid',
      minAcceptableCTC: '',
      targetIndustry: [],
    },
  };
}

export const DEFAULT_PRODUCTION_JDS: OpportunityJD[] = [
  {
    id: 'jd-custom-default',
    company: '',
    title: '',
    function: '',
    location: '',
    workArrangement: 'Hybrid',
    experienceRange: '',
    educationRequirement: '',
    cgpaCutoff: 0,
    maxBacklogs: 0,
    salaryRange: '',
    mustHaveSkills: [],
    preferredSkills: [],
    goodToHaveSkills: [],
    keyResponsibilities: [],
    ambiguousOrUncertainTerms: [],
    rawText: '',
  },
];
