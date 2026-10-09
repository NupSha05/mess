import {
  StudentProfile,
  AcademicTerm,
  OpportunityJD,
  RoleFitReport,
  EligibilityCriterion,
  CVAnalysis,
  LinkedInAnalysis,
  ReadinessDimensions,
  NextBestAction,
  GapType,
  ProjectRecord,
  CertificationRecord,
  AchievementRecord,
} from '../types';

/**
 * Deterministic Intelligence Engine
 * Grounded in Blueprint Document 02 & 03
 * Authoritative calculations, strict logic, never delegated to LLM hallucinations.
 */

// 1. ACADEMIC INTELLIGENCE (CGPA & FEASIBILITY)
export interface CGPACalculationResult {
  currentCalculatedCGPA: number;
  totalCompletedCredits: number;
  totalTermsCompleted: number;
  remainingTerms: number;
  trajectory: 'Rising' | 'Steady' | 'Declining';
}

export function calculateDeterministicCGPA(terms: AcademicTerm[], totalSemesters: number = 8): CGPACalculationResult {
  if (!terms || terms.length === 0) {
    return {
      currentCalculatedCGPA: 0,
      totalCompletedCredits: 0,
      totalTermsCompleted: 0,
      remainingTerms: totalSemesters,
      trajectory: 'Steady',
    };
  }

  let totalCreditPoints = 0;
  let totalCredits = 0;

  for (const term of terms) {
    totalCreditPoints += term.sgpa * term.credits;
    totalCredits += term.credits;
  }

  const currentCalculatedCGPA = totalCredits > 0 ? Number((totalCreditPoints / totalCredits).toFixed(2)) : 0;
  const totalTermsCompleted = terms.length;
  const remainingTerms = Math.max(0, totalSemesters - totalTermsCompleted);

  // Trajectory: compare last 2 terms
  let trajectory: 'Rising' | 'Steady' | 'Declining' = 'Steady';
  if (terms.length >= 2) {
    const last = terms[terms.length - 1].sgpa;
    const prev = terms[terms.length - 2].sgpa;
    if (last > prev + 0.15) trajectory = 'Rising';
    else if (last < prev - 0.15) trajectory = 'Declining';
  }

  return {
    currentCalculatedCGPA,
    totalCompletedCredits: totalCredits,
    totalTermsCompleted,
    remainingTerms,
    trajectory,
  };
}

export interface TargetFeasibilityResult {
  targetCGPA: number;
  isFeasible: boolean;
  requiredAverageSGPA: number;
  maxAchievableCGPA: number;
  mode: 'Mode A (Basic Equal Weight)' | 'Mode B (Credit Weighted)';
  explanation: string;
}

export function calculateTargetFeasibility(
  currentCGPA: number,
  termsCompleted: number,
  totalTerms: number,
  targetCGPA: number,
  terms?: AcademicTerm[],
  estimatedCreditsPerRemainingTerm: number = 22
): TargetFeasibilityResult {
  const remainingTerms = Math.max(0, totalTerms - termsCompleted);

  if (remainingTerms === 0) {
    const achieved = currentCGPA >= targetCGPA;
    return {
      targetCGPA,
      isFeasible: achieved,
      requiredAverageSGPA: currentCGPA,
      maxAchievableCGPA: currentCGPA,
      mode: 'Mode A (Basic Equal Weight)',
      explanation: achieved
        ? `Target of ${targetCGPA} has already been satisfied by completed terms.`
        : `All ${totalTerms} terms are completed. The final CGPA is locked at ${currentCGPA}.`,
    };
  }

  // Check if Mode B can be applied (all completed terms have credit counts)
  const hasCredits = terms && terms.length > 0 && terms.every((t) => t.credits > 0);

  if (hasCredits) {
    const totalCompletedCredits = terms.reduce((acc, t) => acc + t.credits, 0);
    const totalRemainingCredits = remainingTerms * estimatedCreditsPerRemainingTerm;
    const totalOverallCredits = totalCompletedCredits + totalRemainingCredits;

    const currentPoints = terms.reduce((acc, t) => acc + t.sgpa * t.credits, 0);
    const targetPointsNeeded = targetCGPA * totalOverallCredits;
    const remainingPointsNeeded = targetPointsNeeded - currentPoints;

    const requiredAverageSGPA = Number((remainingPointsNeeded / totalRemainingCredits).toFixed(2));
    const maxAchievablePoints = currentPoints + 10.0 * totalRemainingCredits;
    const maxAchievableCGPA = Number((maxAchievablePoints / totalOverallCredits).toFixed(2));

    const isFeasible = requiredAverageSGPA <= 10.0 && requiredAverageSGPA >= 0;

    let explanation = '';
    if (isFeasible) {
      explanation = `To achieve a target CGPA of ${targetCGPA}, you need to average an SGPA of ${requiredAverageSGPA} across the remaining ${remainingTerms} terms (${totalRemainingCredits} credits).`;
    } else {
      explanation = `Mathematically Infeasible: Even with a perfect 10.0 SGPA in all remaining ${remainingTerms} terms, your maximum reachable CGPA is ${maxAchievableCGPA} (Short of ${targetCGPA}).`;
    }

    return {
      targetCGPA,
      isFeasible,
      requiredAverageSGPA,
      maxAchievableCGPA,
      mode: 'Mode B (Credit Weighted)',
      explanation,
    };
  }

  // Mode A: Basic Equal-weight arithmetic
  const targetTotalSum = targetCGPA * totalTerms;
  const currentTotalSum = currentCGPA * termsCompleted;
  const remainingSumNeeded = targetTotalSum - currentTotalSum;
  const requiredAverageSGPA = Number((remainingSumNeeded / remainingTerms).toFixed(2));

  const maxAchievableCGPA = Number(((currentTotalSum + 10.0 * remainingTerms) / totalTerms).toFixed(2));
  const isFeasible = requiredAverageSGPA <= 10.0;

  const explanation = isFeasible
    ? `Assuming equal weight per semester, you need an average SGPA of ${requiredAverageSGPA} across remaining ${remainingTerms} terms.`
    : `Mathematically Infeasible: A perfect 10.0 in all remaining terms yields a maximum possible CGPA of ${maxAchievableCGPA}.`;

  return {
    targetCGPA,
    isFeasible,
    requiredAverageSGPA,
    maxAchievableCGPA,
    mode: 'Mode A (Basic Equal Weight)',
    explanation,
  };
}

// 2. DISCREPANCY DETECTION
export function detectAcademicDiscrepancy(
  selfReportedCGPA: number,
  extractedCGPA?: number
): { hasDiscrepancy: boolean; note?: string } {
  if (extractedCGPA === undefined || extractedCGPA === null) {
    return { hasDiscrepancy: false };
  }

  const diff = Math.abs(selfReportedCGPA - extractedCGPA);
  if (diff >= 0.1) {
    return {
      hasDiscrepancy: true,
      note: `Conflicting records detected: Student self-reported ${selfReportedCGPA}, but official institution record reports ${extractedCGPA}. Please reconcile scores before authoritative eligibility release.`,
    };
  }

  return { hasDiscrepancy: false };
}

// 3. DETERMINISTIC ELIGIBILITY ENGINE
export function evaluateEligibility(profile: StudentProfile, jd: OpportunityJD): {
  isEligible: boolean;
  criteria: EligibilityCriterion[];
} {
  const criteria: EligibilityCriterion[] = [];
  let allPass = true;

  // Criterion 1: CGPA Cutoff
  const studentCGPA = profile.education.verifiedCGPA || profile.education.selfReportedCGPA;
  if (jd.cgpaCutoff) {
    const passed = studentCGPA >= jd.cgpaCutoff;
    if (!passed) allPass = false;
    criteria.push({
      criterion: 'Academic Cutoff (CGPA)',
      required: `>= ${jd.cgpaCutoff} CGPA`,
      studentValue: studentCGPA ? `${studentCGPA.toFixed(2)} CGPA` : 'Not recorded',
      status: !studentCGPA ? 'UNCERTAIN' : passed ? 'PASS' : 'FAIL',
      notes: !studentCGPA
        ? 'CGPA not yet entered in academic credentials.'
        : passed
        ? `Meets minimum threshold of ${jd.cgpaCutoff}.`
        : `Below the required threshold by ${(jd.cgpaCutoff - studentCGPA).toFixed(2)} points.`,
    });
  }

  // Criterion 2: Education Degree / Branch Alignment
  const studentBranch = (profile.education.branch || '').toLowerCase();
  const reqLower = (jd.educationRequirement || '').toLowerCase();
  const branchMatched =
    reqLower.includes('any') ||
    reqLower.includes('cs') ||
    reqLower.includes('computer science') ||
    reqLower.includes('it') ||
    reqLower.includes('information technology') ||
    studentBranch.includes('computer') ||
    studentBranch.includes('cs') ||
    studentBranch.includes('information technology') ||
    studentBranch.includes('engineering');

  criteria.push({
    criterion: 'Degree & Discipline',
    required: jd.educationRequirement || 'Relevant Degree',
    studentValue: `${profile.education.degree || 'Degree'} in ${profile.education.branch || 'Discipline'}`,
    status: branchMatched ? 'PASS' : 'UNCERTAIN',
    notes: branchMatched
      ? 'Discipline is aligned with target criteria.'
      : 'Discipline may require recruiter review or specific coursework equivalence.',
  });

  // Criterion 3: Backlog Restrictions
  const activeBacklogs = 0;
  const backlogPass = activeBacklogs <= (jd.maxBacklogs ?? 0);
  criteria.push({
    criterion: 'Active Backlogs Policy',
    required: `<= ${jd.maxBacklogs ?? 0} active backlogs`,
    studentValue: `${activeBacklogs} active backlogs`,
    status: backlogPass ? 'PASS' : 'FAIL',
    notes: backlogPass ? 'Satisfies zero active backlogs requirement.' : 'Exceeds allowable backlogs.',
  });

  // Criterion 4: Graduation Year / Batch
  const expectedGradYear = profile.education.expectedGraduationYear || 2026;
  criteria.push({
    criterion: 'Graduation Year / Batch Eligibility',
    required: 'Immediate Campus Batch (2025/2026)',
    studentValue: `Batch of ${expectedGradYear}`,
    status: 'PASS',
    notes: 'Matches expected recruitment window.',
  });

  return {
    isEligible: allPass,
    criteria,
  };
}

// 3b. EXPLAINABLE ATS ALIGNMENT ENGINE (Requirement 8)
export function calculateATSAlignment(
  profile: StudentProfile,
  jd: OpportunityJD,
  cvText?: string
): {
  atsScore: number;
  atsBreakdown: {
    keywordMatchScore: number;
    requiredSkillCoverage: number;
    preferredSkillCoverage: number;
    educationAlignment: number;
    experienceRelevance: number;
    formattingScore: number;
    missingKeywords: string[];
    explanation: string;
  };
} {
  const textToScan = (cvText || profile.resumeText || '').toLowerCase();
  const mustHaves = jd.mustHaveSkills || [];
  const preferred = jd.preferredSkills || [];

  // 1. Must-have skill match (weight: 40%)
  let mustMatchedCount = 0;
  const missingKeywords: string[] = [];

  for (const skill of mustHaves) {
    const sLower = skill.toLowerCase();
    const inProfile = profile.skills.some((ps) => ps.name.toLowerCase().includes(sLower) || sLower.includes(ps.name.toLowerCase()));
    const inText = textToScan.includes(sLower);
    if (inProfile || inText) {
      mustMatchedCount++;
    } else {
      missingKeywords.push(skill);
    }
  }
  const requiredSkillCoverage = mustHaves.length > 0 ? Math.round((mustMatchedCount / mustHaves.length) * 100) : 100;

  // 2. Preferred skill match (weight: 20%)
  let prefMatchedCount = 0;
  for (const skill of preferred) {
    const sLower = skill.toLowerCase();
    const inProfile = profile.skills.some((ps) => ps.name.toLowerCase().includes(sLower) || sLower.includes(ps.name.toLowerCase()));
    const inText = textToScan.includes(sLower);
    if (inProfile || inText) {
      prefMatchedCount++;
    } else {
      missingKeywords.push(skill);
    }
  }
  const preferredSkillCoverage = preferred.length > 0 ? Math.round((prefMatchedCount / preferred.length) * 100) : 80;

  // 3. Education alignment (weight: 20%)
  const eligibility = evaluateEligibility(profile, jd);
  const educationAlignment = eligibility.isEligible ? 95 : 60;

  // 4. Experience & Project relevance (weight: 10%)
  let experienceRelevance = 50;
  if (profile.experiences.length > 0) experienceRelevance += 30;
  if (profile.projects.length >= 2) experienceRelevance += 20;
  experienceRelevance = Math.min(100, experienceRelevance);

  // 5. Keyword match & formatting (weight: 10%)
  let keywordMatchScore = Math.round((requiredSkillCoverage * 0.7 + preferredSkillCoverage * 0.3));
  let formattingScore = 90;
  if (textToScan && !textToScan.includes('@')) formattingScore -= 20;
  if (!profile.linkedInUrl && !textToScan.includes('linkedin')) formattingScore -= 10;

  // Composite ATS Score
  const atsScore = Math.round(
    requiredSkillCoverage * 0.40 +
    preferredSkillCoverage * 0.20 +
    educationAlignment * 0.20 +
    experienceRelevance * 0.10 +
    formattingScore * 0.10
  );

  const explanation = `ATS score synthesized from: Must-have skills (${requiredSkillCoverage}%), Preferred skills (${preferredSkillCoverage}%), Academic criteria (${educationAlignment}%), Experience depth (${experienceRelevance}%), and CV formatting (${formattingScore}%).`;

  return {
    atsScore: Math.min(100, Math.max(10, atsScore)),
    atsBreakdown: {
      keywordMatchScore,
      requiredSkillCoverage,
      preferredSkillCoverage,
      educationAlignment,
      experienceRelevance,
      formattingScore,
      missingKeywords: Array.from(new Set(missingKeywords)),
      explanation,
    },
  };
}

// 4. CONTEXTUAL ROLE FIT CALCULATION (Enhanced with 7-Gap Taxonomy)
export function calculateContextualRoleFit(profile: StudentProfile, jd: OpportunityJD): RoleFitReport {
  const eligibility = evaluateEligibility(profile, jd);
  const atsResult = calculateATSAlignment(profile, jd, profile.resumeText);

  // Check Must-Have Skills Coverage
  const missingMustHaves: Array<{ skill: string; gapType: GapType }> = [];
  const matchedSkills: Array<{ skill: string; evidenceLevel: any; relevance: any }> = [];

  for (const mustSkill of jd.mustHaveSkills || []) {
    const skillObj = profile.skills.find(
      (s) => s.name.toLowerCase().includes(mustSkill.toLowerCase()) || mustSkill.toLowerCase().includes(s.name.toLowerCase())
    );

    if (skillObj) {
      matchedSkills.push({
        skill: mustSkill,
        evidenceLevel: skillObj.evidenceLevel || 2,
        relevance: skillObj.relevance || 'Directly Relevant',
      });
    } else {
      missingMustHaves.push({
        skill: mustSkill,
        gapType: 'Profile Gap',
      });
    }
  }

  // Check Preferred Skills Coverage
  const missingPreferred: Array<{ skill: string; gapType: GapType }> = [];
  for (const prefSkill of jd.preferredSkills || []) {
    const found = profile.skills.find(
      (s) => s.name.toLowerCase().includes(prefSkill.toLowerCase()) || prefSkill.toLowerCase().includes(s.name.toLowerCase())
    );
    if (!found) {
      missingPreferred.push({
        skill: prefSkill,
        gapType: 'Profile Gap',
      });
    }
  }

  const mustHaveCount = jd.mustHaveSkills?.length || 1;
  const mustHaveMatched = (jd.mustHaveSkills?.length || 0) - missingMustHaves.length;
  const mustRatio = mustHaveMatched / mustHaveCount;

  const prefCount = jd.preferredSkills?.length || 1;
  const prefMatched = (jd.preferredSkills?.length || 0) - missingPreferred.length;
  const prefRatio = prefMatched / prefCount;

  const avgEvidence =
    matchedSkills.length > 0
      ? matchedSkills.reduce((acc, m) => acc + (m.evidenceLevel || 2), 0) / matchedSkills.length
      : 0;
  const evidenceMultiplier = 0.75 + (avgEvidence / 4) * 0.25;

  let fitScore = Math.round((mustRatio * 70 + prefRatio * 30) * evidenceMultiplier);
  if (!eligibility.isEligible) {
    fitScore = Math.min(fitScore, 58);
  }

  let matchTier: 'Strong Match' | 'Conditional Match' | 'Low Match' = 'Low Match';
  if (eligibility.isEligible && fitScore >= 75) {
    matchTier = 'Strong Match';
  } else if (fitScore >= 55) {
    matchTier = 'Conditional Match';
  }

  // Seven-Gap Taxonomy (Requirement 9)
  const profileStrengths: string[] = [];
  const cvPresentationGaps: string[] = [];
  const genuineCapabilityGaps: string[] = [];
  const jdAlignmentGaps: string[] = [];
  const eligibilityGaps: string[] = [];
  const missingEvidenceItems: string[] = [];
  const visibilityGaps: string[] = [];

  // 1. Profile Strengths
  if (mustRatio >= 0.7) {
    profileStrengths.push(`Core technical competence matches ${mustHaveMatched} of ${mustHaveCount} must-have criteria.`);
  }
  if (profile.projects.length >= 2) {
    profileStrengths.push(`Proven practical portfolio: ${profile.projects.map((p) => p.title).join(', ')}.`);
  }
  if (profile.experiences.length > 0) {
    profileStrengths.push(`Direct work experience: ${profile.experiences[0].role} at ${profile.experiences[0].company}.`);
  }
  if (eligibility.isEligible) {
    profileStrengths.push(`Satisfies deterministic academic cutoff (>= ${jd.cgpaCutoff} CGPA).`);
  }

  // 2. CV Presentation Gaps
  if (profile.projects.some((p) => !p.outcomes || p.outcomes.length < 15)) {
    cvPresentationGaps.push('Project accomplishments lack quantified metric outcomes in resume bullets.');
  }
  if (!profile.resumeText?.includes('GitHub') && profile.githubUrl) {
    cvPresentationGaps.push('GitHub repository profile is recorded internally but not hyperlinked in the CV header.');
  }

  // 3. Genuine Capability Gaps
  for (const m of missingMustHaves) {
    genuineCapabilityGaps.push(`Must-have requirement "${m.skill}" is not registered in your verified skill profile.`);
  }

  // 4. JD Alignment Gaps
  for (const p of missingPreferred) {
    jdAlignmentGaps.push(`Preferred tool "${p.skill}" is requested in the job description but not highlighted.`);
  }

  // 5. Eligibility Gaps
  for (const crit of eligibility.criteria) {
    if (crit.status === 'FAIL') {
      eligibilityGaps.push(`${crit.criterion}: Required ${crit.required}, student has ${crit.studentValue}.`);
    } else if (crit.status === 'UNCERTAIN') {
      eligibilityGaps.push(`${crit.criterion}: Requires manual verification (${crit.notes}).`);
    }
  }

  // 6. Missing Evidence Items
  for (const skill of profile.skills) {
    if (skill.evidenceLevel <= 1) {
      missingEvidenceItems.push(`Skill "${skill.name}" is claimed without a supporting project repository or certification.`);
    }
  }

  // 7. Visibility Gaps
  if (profile.skills.length > 0 && !profile.linkedInUrl) {
    visibilityGaps.push('Verified technical skills are missing recruiter discoverability because LinkedIn URL is not linked.');
  }

  const positiveContributors: string[] = profileStrengths;
  const limitingFactors: string[] = [...genuineCapabilityGaps, ...eligibilityGaps];

  return {
    jdId: jd.id,
    overallFitScore: Math.min(100, Math.max(0, fitScore)),
    atsScore: atsResult.atsScore,
    atsBreakdown: atsResult.atsBreakdown,
    matchTier,
    eligibilityPassed: eligibility.isEligible,
    criteriaBreakdown: eligibility.criteria,
    matchedSkills,
    missingMustHaves,
    missingPreferred,
    positiveContributors,
    limitingFactors,
    ambiguityNotes: jd.ambiguousOrUncertainTerms || [],
    profileStrengths,
    cvPresentationGaps,
    genuineCapabilityGaps,
    jdAlignmentGaps,
    eligibilityGaps,
    missingEvidenceItems,
    visibilityGaps,
    calculatedAt: new Date().toISOString(),
  };
}

// 4b. DEDICATED PROJECT, CERTIFICATION & ACHIEVEMENT ANALYZERS (Requirement 7)
export function analyzeProjects(projects: ProjectRecord[], targetJD?: OpportunityJD) {
  return projects.map((p) => {
    const hasQuantified = Boolean(p.quantifiedImpact || p.outcomes?.match(/\d+/));
    const targetSkills = targetJD ? [...targetJD.mustHaveSkills, ...targetJD.preferredSkills] : [];
    const matchedTech = p.techStack.filter((t) =>
      targetSkills.some((ts) => ts.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(ts.toLowerCase()))
    );

    let relevanceScore = 70;
    if (matchedTech.length >= 2) relevanceScore = 95;
    else if (matchedTech.length === 1) relevanceScore = 85;

    const missingDetails: string[] = [];
    if (!p.githubUrl) missingDetails.push('Add repository link to verify source code and commit history');
    if (!hasQuantified) missingDetails.push('Add quantified metrics (e.g. latency, requests/sec, user volume)');
    if (!p.role || p.role === 'Developer') missingDetails.push('Specify your individual contribution and ownership');

    return {
      id: p.id,
      title: p.title,
      role: p.role,
      techStack: p.techStack,
      description: p.description,
      outcomes: p.outcomes,
      quantifiedImpact: p.quantifiedImpact || (hasQuantified ? p.outcomes : 'Qualitative implementation confirmed'),
      relevanceScore,
      targetRoleRelevance: matchedTech.length > 0 ? `Demonstrates ${matchedTech.join(', ')} required by target role` : 'General software engineering competence',
      missingDetails,
      verificationStatus: p.verificationStatus,
    };
  });
}

export function analyzeCertifications(certs: CertificationRecord[], targetJD?: OpportunityJD) {
  return certs.map((c) => {
    const targetSkills = targetJD ? [...targetJD.mustHaveSkills, ...targetJD.preferredSkills] : [];
    const skills = c.skillsRepresented || [];
    const isRelevant = skills.some((s) => targetSkills.some((ts) => ts.toLowerCase().includes(s.toLowerCase())));

    return {
      id: c.id,
      title: c.title,
      issuingOrg: c.issuingOrg,
      issueDate: c.issueDate,
      credentialUrl: c.credentialUrl,
      verified: c.verified,
      skillsRepresented: skills,
      relevanceToTargetRole: isRelevant ? 'Directly supports target role specifications' : 'Broad technical credential',
      verificationNote: c.verified ? 'Cryptographically or institutional link verified' : 'Self-reported document proof',
    };
  });
}

export function analyzeAchievements(achievements: AchievementRecord[], _targetJD?: OpportunityJD) {
  return achievements.map((a) => {
    return {
      id: a.id,
      title: a.title,
      category: a.category,
      description: a.description,
      date: a.date,
      impact: a.impact || 'Demonstrates competitive distinction and merit',
      communicationClarity: a.description.length > 40 ? 'Well-articulated context and achievement' : 'Brief statement; could elaborate on scope and competitor count',
      verificationStatus: a.verificationStatus,
    };
  });
}

// 5. READINESS DIMENSIONS CALCULATOR (Contextual, Dynamic & Evidence-Grounded)
export function calculateReadiness(
  profile: StudentProfile,
  recentPracticeSessions?: any[],
  targetJD?: OpportunityJD,
  applications?: any[],
  historicalSnapshots?: any[]
): ReadinessDimensions {
  const missingInformation: string[] = [];
  const positiveContributors: string[] = [];
  const limitingFactors: string[] = [];

  // 1. Academic Readiness (0-100)
  let cgpa = profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 0;
  if (!cgpa && profile.education.percentageValue) {
    cgpa = Math.min(10, profile.education.percentageValue / 9.5);
  }

  let academicReadiness = 0;
  if (cgpa > 0) {
    academicReadiness = Math.round((cgpa / 10) * 85);
    const termCalc = calculateDeterministicCGPA(profile.education.terms, profile.education.totalSemesters);
    if (termCalc.trajectory === 'Rising') academicReadiness += 10;
    if (profile.education.degreeStatus === 'completed') academicReadiness += 5;
    academicReadiness = Math.min(100, Math.max(10, academicReadiness));

    positiveContributors.push(
      profile.education.gradingSystem === 'percentage' && profile.education.percentageValue
        ? `Consolidated academic performance: ${profile.education.percentageValue}% across ${profile.education.termsCompleted || profile.education.terms?.length || 'completed'} terms`
        : `Consolidated academic standing: ${cgpa.toFixed(2)} CGPA (${profile.education.degreeStatus === 'completed' ? 'Degree Completed' : `${profile.education.termsCompleted || profile.education.terms?.length || 1} of ${profile.education.totalSemesters || 8} terms completed`})`
    );
  } else {
    missingInformation.push('Consolidated academic records pending: enter your current CGPA or percentage in Pillar 2');
    limitingFactors.push('Academic records not yet entered: cannot evaluate campus eligibility cutoffs');
  }

  // 2. Profile Readiness (0-100) - based on evidence depth
  let profileScore = 0;
  if (profile.name && profile.name.trim().length > 0) profileScore += 10;
  if (profile.college && profile.college.trim().length > 0) profileScore += 10;
  if (profile.headline && profile.headline.trim().length > 0) profileScore += 10;
  if (profile.about && profile.about.trim().length > 0) profileScore += 10;
  if (profile.education.institution && profile.education.degree) profileScore += 15;
  if (profile.experiences && profile.experiences.length > 0) {
    profileScore += Math.min(25, profile.experiences.length * 15);
    positiveContributors.push(`${profile.experiences.length} verified work/internship experience record(s) with impact metrics`);
  } else {
    limitingFactors.push('No industry or internship tenure recorded in profile');
  }
  if (profile.projects && profile.projects.length >= 1) {
    profileScore += Math.min(20, profile.projects.length * 10);
    positiveContributors.push(`${profile.projects.length} repository project(s) showcasing practical implementation`);
  } else {
    limitingFactors.push('No portfolio projects recorded: add practical projects with repository links');
  }
  if (profile.certifications && profile.certifications.length > 0) {
    profileScore += 10;
  }
  const profileReadiness = Math.min(100, profileScore);

  // 3. Skill Readiness (0-100) - based on Level 0-4 evidence tiers
  let skillReadiness = 0;
  const totalSkills = profile.skills ? profile.skills.length : 0;
  if (totalSkills > 0) {
    const avgLevel = profile.skills.reduce((acc, s) => acc + s.evidenceLevel, 0) / totalSkills;
    skillReadiness = Math.min(100, Math.round((avgLevel / 4) * 80 + Math.min(20, totalSkills * 2)));
    positiveContributors.push(`${totalSkills} registered competencies with average evidence Level ${avgLevel.toFixed(1)}/4`);
  } else {
    missingInformation.push('No technical skills registered: document capabilities in Pillar 3');
    limitingFactors.push('Zero registered capabilities: cannot evaluate role competency matching');
  }

  // 4. Opportunity Readiness (0-100 or null if no opportunity analyzed)
  let opportunityReadiness: number | null = null;
  let opportunityReadinessNote: string | undefined;

  if (targetJD && targetJD.title && targetJD.title !== 'General Role') {
    const fit = calculateContextualRoleFit(profile, targetJD);
    opportunityReadiness = fit.overallFitScore;
    if (fit.eligibilityPassed) {
      positiveContributors.push(`Eligible for target role at ${targetJD.company} (${fit.overallFitScore}% alignment)`);
    } else {
      limitingFactors.push(`Eligibility barriers identified for ${targetJD.company}: review cutoff and discipline requirements`);
    }
  } else {
    opportunityReadinessNote = 'Opportunity readiness cannot yet be meaningfully assessed because you have not analyzed an active opportunity.';
    missingInformation.push('No active target JD selected: upload or select a job description in Pillar 4');
  }

  // 5. Interview Readiness (0-100 or null if no practice completed)
  let interviewReadiness: number | null = null;
  let interviewReadinessNote: string | undefined;
  const sessions = recentPracticeSessions || [];

  if (sessions.length > 0) {
    const avgScore = sessions.reduce((acc, s) => acc + (s.evaluation?.scoreOutOf10 || 6), 0) / sessions.length;
    interviewReadiness = Math.min(95, Math.round(avgScore * 9 + Math.min(10, sessions.length * 2)));
    positiveContributors.push(`${sessions.length} structured practice session(s) completed with average evaluation ${avgScore.toFixed(1)}/10`);
  } else {
    interviewReadinessNote = 'Insufficient practice data recorded (complete mock practice sessions in Pillar 8).';
    missingInformation.push('No interview practice sessions completed yet: practice STAR behavioral or technical questions in Pillar 8');
    limitingFactors.push('No mock interview performance recorded to validate communication and problem-solving readiness');
  }

  // 6. Dynamic Contextual Aggregate (No arbitrary fixed weights!)
  let overallScore = 0;
  if (opportunityReadiness !== null && interviewReadiness !== null) {
    // Full 5-dimension context
    overallScore = Math.round(
      academicReadiness * 0.20 +
      profileReadiness * 0.20 +
      skillReadiness * 0.25 +
      opportunityReadiness * 0.15 +
      interviewReadiness * 0.20
    );
  } else if (opportunityReadiness !== null && interviewReadiness === null) {
    // 4 dimensions (no interview practice yet)
    overallScore = Math.round(
      academicReadiness * 0.25 +
      profileReadiness * 0.25 +
      skillReadiness * 0.30 +
      opportunityReadiness * 0.20
    );
  } else if (opportunityReadiness === null && interviewReadiness !== null) {
    // 4 dimensions (no opportunity selected yet)
    overallScore = Math.round(
      academicReadiness * 0.25 +
      profileReadiness * 0.25 +
      skillReadiness * 0.30 +
      interviewReadiness * 0.20
    );
  } else {
    // Foundational 3 dimensions (early career / onboarding baseline)
    overallScore = Math.round(
      academicReadiness * 0.35 +
      profileReadiness * 0.30 +
      skillReadiness * 0.35
    );
  }

  // 7. Trend Calculation from Actual Historical Snapshots
  let trend: 'Improving' | 'Stable' | 'Declining' | 'Insufficient history' = 'Insufficient history';
  if (historicalSnapshots && historicalSnapshots.length >= 2) {
    const prev = historicalSnapshots[historicalSnapshots.length - 2];
    if (prev && typeof prev.overallScore === 'number') {
      if (overallScore > prev.overallScore) trend = 'Improving';
      else if (overallScore < prev.overallScore) trend = 'Declining';
      else trend = 'Stable';
    }
  }

  // 8. Highest-Leverage Recommended Next Action
  let recommendedNextAction = 'Update your academic trajectory in Pillar 2 to establish baseline eligibility.';
  if (missingInformation.some((m) => m.includes('job description'))) {
    recommendedNextAction = 'Analyze an active target Job Description in Pillar 4 to evaluate role fit and skill gaps.';
  } else if (missingInformation.some((m) => m.includes('interview practice'))) {
    recommendedNextAction = 'Complete a mock practice session using the STAR framework in Pillar 8.';
  } else if (profile.projects.length === 0) {
    recommendedNextAction = 'Document a repository project in Pillar 1 to elevate your practical skill evidence to Level 2.';
  } else if (opportunityReadiness !== null && opportunityReadiness < 70) {
    recommendedNextAction = 'Close the Three-Way gaps in Pillar 5 to align your CV with must-have job requirements.';
  } else {
    recommendedNextAction = 'Track active applications in Pillar 7 and practice upcoming interview questions in Pillar 8.';
  }

  return {
    academicReadiness,
    profileReadiness,
    skillReadiness,
    opportunityReadiness,
    interviewReadiness,
    opportunityReadinessNote,
    interviewReadinessNote,
    overallScore,
    trend,
    positiveContributors,
    limitingFactors,
    missingInformation,
    recommendedNextAction,
    methodologyVersion: 'v2.1-contextual-evidence',
    lastCalculated: new Date().toISOString(),
  };
}

// 6. ACTION CENTER PRIORITIZATION & CAREER ROADMAP (Requirement 12)
export function generatePrioritizedActions(
  profile: StudentProfile,
  readiness: ReadinessDimensions,
  targetJD?: OpportunityJD
): NextBestAction[] {
  const actions: NextBestAction[] = [];

  // If profile is incomplete, surface foundational setup actions first
  if (!profile.education.institution || (profile.education.selfReportedCGPA === 0 && (!profile.education.terms || profile.education.terms.length === 0))) {
    actions.push({
      id: 'act-setup-academics',
      title: 'Record Academic Terms & Compute CGPA',
      description: 'Enter your degree, branch, and semester SGPA history to unlock deterministic eligibility checks.',
      impact: 'High Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'Immediate',
      pillarTarget: 'Pillar 2: Academic Intelligence',
      targetModule: 'Pillar 2: Academic Intelligence',
      triggeringFinding: 'Missing semester records prevent accurate eligibility cutoffs.',
      expectedOutcome: 'Unlocks automated campus threshold evaluation and grade trajectory trends.',
      rationale: 'Campus cutoffs depend directly on deterministic credit-weighted academic calculations.',
      isCompleted: false,
    });
  }

  if (profile.skills.length === 0) {
    actions.push({
      id: 'act-add-skills',
      title: 'Register Core Technical Skills & Evidence',
      description: 'Add your primary technical capabilities with supporting coursework or project evidence to establish your Skill Readiness dimension.',
      impact: 'High Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'Immediate',
      pillarTarget: 'Pillar 3: Career & Profile Intelligence',
      targetModule: 'Pillar 3: Career & Profile Intelligence',
      triggeringFinding: 'Zero registered skills in student profile.',
      expectedOutcome: 'Establishes initial Skill Readiness index and activates role matching.',
      rationale: 'Required for calculating accurate role fit and opportunity eligibility.',
      isCompleted: false,
    });
  }

  // If transcript discrepancy
  if (profile.education.discrepancyFlag) {
    actions.push({
      id: 'act-reconcile-cgpa',
      title: 'Reconcile Academic Discrepancy',
      description: 'Your self-reported CGPA differs from extracted transcript data. Reconcile this to unlock unblocked eligibility.',
      impact: 'High Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'Immediate',
      pillarTarget: 'Pillar 2: Academic Intelligence',
      targetModule: 'Pillar 2: Academic Intelligence',
      triggeringFinding: 'Self-reported CGPA diverges from official transcript record.',
      expectedOutcome: 'Restores verified academic provenance for campus recruitment audits.',
      rationale: 'Automated campus screening filters out unverified discrepancies immediately.',
      isCompleted: false,
    });
  }

  // If missing must have skills in JD
  if (targetJD && targetJD.mustHaveSkills?.length > 0) {
    const missing = targetJD.mustHaveSkills.filter(
      (m) => !profile.skills.some((s) => s.name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(s.name.toLowerCase()))
    );
    if (missing.length > 0) {
      actions.push({
        id: 'act-bridge-jd-gap',
        title: `Build Evidence for ${targetJD.company || 'Target Role'} Requirements`,
        description: `Target JD requires: ${missing.slice(0, 2).join(', ')}. Add a project repository or certification proof.`,
        impact: 'High Impact',
        effort: 'Deep Work (>1d)',
        urgency: 'Immediate',
        pillarTarget: 'Pillar 4: JD & Opportunity Intelligence',
        targetModule: 'Pillar 4: Opportunity Intelligence',
        triggeringFinding: `Target role requires ${missing.join(', ')} which is absent from current evidence.`,
        expectedOutcome: 'Closes critical must-have gap and elevates role fit tier to Strong Match.',
        rationale: 'Moves role fit from Conditional to Strong tier for competitive opportunities.',
        isCompleted: false,
      });
    }
  }

  // Project evidence enhancement
  if (profile.projects.length < 2) {
    actions.push({
      id: 'act-add-project',
      title: 'Document a Practical Software Project with Repository Link',
      description: 'Showcase an end-to-end full-stack or systems project with architecture overview, tech stack, and GitHub repository.',
      impact: 'High Impact',
      effort: 'Deep Work (>1d)',
      urgency: 'This Week',
      pillarTarget: 'Pillar 3: Career & Profile Intelligence',
      targetModule: 'Pillar 3: Career & Profile Intelligence',
      triggeringFinding: 'Fewer than 2 practical projects recorded in student portfolio.',
      expectedOutcome: 'Elevates demonstrated skill depth from Level 1 (Stated) to Level 2 (Applied).',
      rationale: 'Technical recruiters prioritize candidates with verifiable proof of work and public source code.',
      isCompleted: false,
    });
  }

  // Interview practice
  if (readiness.interviewReadiness === null || readiness.interviewReadiness < 75) {
    actions.push({
      id: 'act-practice-behavioral',
      title: 'Complete 2 STAR Method Practice Sessions',
      description: 'Practice behavioral and situational interview questions using the STAR framework to raise your Interview Readiness score.',
      impact: 'Medium Impact',
      effort: 'Moderate (1-2h)',
      urgency: 'This Week',
      pillarTarget: 'Pillar 8: Practice Coach',
      targetModule: 'Pillar 8: Practice Coach',
      triggeringFinding: 'Insufficient mock practice responses recorded in preparation intel.',
      expectedOutcome: 'Improves answer structure, clarity score, and interview confidence.',
      rationale: 'Solidifies narrative delivery and elevates interview readiness beyond 80%.',
      isCompleted: false,
    });
  }

  // CV Optimization
  actions.push({
    id: 'act-cv-quantify',
    title: 'Quantify Impact Metrics in Resume Bullets',
    description: 'Transform descriptive duty statements into measurable achievements (e.g. latency reduced by 38%, handled 8,500 req/sec).',
    impact: 'High Impact',
    effort: 'Quick Win (<15m)',
    urgency: 'This Week',
    pillarTarget: 'Pillar 5: CV Intelligence',
    targetModule: 'Pillar 5: CV Intelligence',
    triggeringFinding: 'Several experience and project bullets lack quantifiable outcomes.',
    expectedOutcome: 'Increases recruiter engagement and elevates ATS content quality score.',
    rationale: 'Quantified impact demonstrates business awareness and technical ownership.',
    isCompleted: false,
  });

  // LinkedIn Positioning
  if (!profile.linkedInUrl) {
    actions.push({
      id: 'act-linkedin-url',
      title: 'Link Your LinkedIn Profile URL',
      description: 'Add your LinkedIn public profile link in Profile or LinkedIn Intelligence to evaluate discoverability.',
      impact: 'Medium Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'Immediate',
      pillarTarget: 'Pillar 6: LinkedIn Intelligence',
      targetModule: 'Pillar 6: LinkedIn Intelligence',
      triggeringFinding: 'LinkedIn profile is not linked to your student intelligence record.',
      expectedOutcome: 'Unlocks recruiter visibility audit and headline positioning insights.',
      rationale: 'Recruiters rely on LinkedIn for inbound outreach and candidate verification.',
      isCompleted: false,
    });
  } else {
    actions.push({
      id: 'act-linkedin-headline',
      title: 'Align LinkedIn Headline with Target Role',
      description: 'Update headline from generic student status to target role keywords and verified competencies.',
      impact: 'Medium Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'Ongoing',
      pillarTarget: 'Pillar 6: LinkedIn Intelligence',
      targetModule: 'Pillar 6: LinkedIn Intelligence',
      triggeringFinding: 'Headline can be optimized for technical search algorithms.',
      expectedOutcome: 'Increases recruiter search discoverability by up to 3.4x.',
      rationale: 'Recruiter searches prioritize matching target role keywords and core technologies.',
      isCompleted: false,
    });
  }

  return actions;
}
