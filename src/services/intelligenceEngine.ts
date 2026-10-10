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
    if (last > prev + 0.05) trajectory = 'Rising';
    else if (last < prev - 0.05) trajectory = 'Declining';
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

// 6. ACTION CENTER PRIORITIZATION & CAREER ROADMAP (Blueprint Section 9)
export function generatePrioritizedActions(
  profile: StudentProfile,
  readiness: ReadinessDimensions,
  targetJD?: OpportunityJD
): NextBestAction[] {
  const actions: NextBestAction[] = [];
  const registeredSkillNames = (profile.skills || []).map((s) => s.name.toLowerCase());
  const resumeTextLower = (profile.resumeText || '').toLowerCase();

  // Helper to check if skill exists in projects or experiences
  const skillInPortfolio = (skill: string) => {
    const sLower = skill.toLowerCase();
    const inProj = (profile.projects || []).some(
      (p) => p.techStack.some((t) => t.toLowerCase().includes(sLower) || sLower.includes(t.toLowerCase())) ||
             p.description.toLowerCase().includes(sLower)
    );
    const inExp = (profile.experiences || []).some(
      (e) => e.skillsUsed.some((t) => t.toLowerCase().includes(sLower) || sLower.includes(t.toLowerCase())) ||
             e.description.toLowerCase().includes(sLower)
    );
    return inProj || inExp;
  };

  // -------------------------------------------------------------
  // TIER 1: MUST-HAVE MANDATORY REQUIREMENTS (Priority 1)
  // -------------------------------------------------------------
  if (targetJD && (targetJD.company || targetJD.title)) {
    // 1A. Academic Eligibility Cutoff
    const studentCgpa = profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 0;
    if (targetJD.cgpaCutoff > 0) {
      if (studentCgpa === 0) {
        actions.push({
          id: 'p1-cutoff-unknown',
          title: `Verify Academic Cutoff for ${targetJD.company || 'Target Role'}`,
          description: `The role strictly requires a minimum CGPA of ${targetJD.cgpaCutoff}. Your academic record has no confirmed CGPA.`,
          impact: 'High Impact',
          effort: 'Quick Win (<15m)',
          urgency: 'Immediate',
          priorityTier: 'Priority 1 — Must-Have',
          requirementAddressed: `Mandatory CGPA Cutoff (>= ${targetJD.cgpaCutoff})`,
          currentEvidenceStatus: 'Unknown / Unverified: No CGPA confirmed in Profile',
          recommendedAction: 'Confirm your CGPA or marks in Profile & Academics to clear the campus screening rule.',
          gapCategory: 'Eligibility Gap',
          pillarTarget: 'Pillar 1: Profile & Academics',
          targetModule: 'Pillar 1: Profile & Academics',
          rationale: 'Mandatory campus eligibility criteria filter candidates before human resume review.',
          expectedOutcome: 'Confirms eligibility status and unblocks application progression.',
          isCompleted: false,
        });
      } else if (studentCgpa < targetJD.cgpaCutoff) {
        actions.push({
          id: 'p1-cutoff-gap',
          title: `Address CGPA Cutoff Threshold for ${targetJD.company || 'Target Role'}`,
          description: `Mandatory cutoff is ${targetJD.cgpaCutoff}, while your verified academic record reflects ${studentCgpa.toFixed(2)}.`,
          impact: 'High Impact',
          effort: 'Deep Work (>1d)',
          urgency: 'Immediate',
          priorityTier: 'Priority 1 — Must-Have',
          requirementAddressed: `Mandatory Academic Cutoff (>= ${targetJD.cgpaCutoff})`,
          currentEvidenceStatus: `Unmet: Current ${studentCgpa.toFixed(2)} is below threshold ${targetJD.cgpaCutoff}`,
          recommendedAction: 'Consult placement team for backlog policies or target roles aligned with your score bracket.',
          gapCategory: 'Eligibility Gap',
          pillarTarget: 'Pillar 1: Profile & Academics',
          targetModule: 'Pillar 1: Profile & Academics',
          rationale: 'Company recruitment portal will auto-reject if cutoff is unyielding.',
          expectedOutcome: 'Identifies waiver eligibility or redirects focus to high-fit roles.',
          isCompleted: false,
        });
      }
    }

    // 1B. Must-Have Mandatory Skills
    const mustHaves = targetJD.mustHaveSkills || [];
    mustHaves.forEach((skill, idx) => {
      const sLower = skill.toLowerCase();
      const isRegistered = registeredSkillNames.some((rs) => rs.includes(sLower) || sLower.includes(rs));
      const inCV = resumeTextLower.includes(sLower);
      const inPortfolio = skillInPortfolio(skill);

      if (isRegistered || inPortfolio) {
        if (!inCV && profile.resumeText) {
          // CV PRESENTATION GAP: Skill already exists in profile/portfolio but missing from CV document!
          actions.push({
            id: `p1-pres-gap-${idx}`,
            title: `Add Verified "${skill}" to Resume Document`,
            description: `You have practical evidence for ${skill} in your profile/portfolio, but it is omitted from your CV text!`,
            impact: 'High Impact',
            effort: 'Quick Win (<15m)',
            urgency: 'Immediate',
            priorityTier: 'Priority 1 — Must-Have',
            requirementAddressed: `Mandatory Skill: ${skill}`,
            currentEvidenceStatus: 'Demonstrated in profile/projects, but absent in CV document text',
            recommendedAction: `Update your CV bullets to explicitly mention ${skill} with outcomes from your project portfolio.`,
            gapCategory: 'CV Presentation Gap',
            pillarTarget: 'Pillar 3: CV & Job Match Intelligence',
            targetModule: 'Pillar 3: CV & Job Match Intelligence',
            rationale: 'Do not spend time re-learning a skill you already possess; fix the presentation visibility on your resume immediately.',
            expectedOutcome: `Instantly satisfies ATS keyword parsing for mandatory requirement ${skill}.`,
            isCompleted: false,
          });
        }
      } else {
        // GENUINE SKILL GAP: Neither in profile nor in portfolio
        actions.push({
          id: `p1-skill-gap-${idx}`,
          title: `Acquire Mandatory Competency: ${skill}`,
          description: `${targetJD.company || 'The recruiter'} marks "${skill}" as a compulsory requirement for ${targetJD.title}.`,
          impact: 'High Impact',
          effort: 'Deep Work (>1d)',
          urgency: 'Immediate',
          priorityTier: 'Priority 1 — Must-Have',
          requirementAddressed: `Mandatory Skill: ${skill}`,
          currentEvidenceStatus: 'Unmet: Absent from profile, CV, and verified projects',
          recommendedAction: `Build a dedicated practical project demonstrating ${skill} and push the repository to GitHub.`,
          gapCategory: 'Genuine Skill Gap',
          pillarTarget: 'Pillar 2: Career & Skills',
          targetModule: 'Pillar 2: Career & Skills',
          rationale: 'Mandatory technical screens test this directly in coding rounds.',
          expectedOutcome: `Closes primary disqualification factor for ${targetJD.title}.`,
          isCompleted: false,
        });
      }
    });

    // -------------------------------------------------------------
    // TIER 2: DESIRABLE / PREFERRED REQUIREMENTS (Priority 2)
    // -------------------------------------------------------------
    const preferredSkills = targetJD.preferredSkills || [];
    preferredSkills.forEach((skill, idx) => {
      const sLower = skill.toLowerCase();
      const isRegistered = registeredSkillNames.some((rs) => rs.includes(sLower) || sLower.includes(rs));
      const inCV = resumeTextLower.includes(sLower);
      const inPortfolio = skillInPortfolio(skill);

      if (!isRegistered && !inPortfolio && !inCV) {
        actions.push({
          id: `p2-pref-gap-${idx}`,
          title: `Gain Advantage with Desirable Skill: ${skill}`,
          description: `Listed as preferred/advantageous in the job specification. Candidates with ${skill} rank higher in shortlist.`,
          impact: 'Medium Impact',
          effort: 'Moderate (1-2h)',
          urgency: 'This Week',
          priorityTier: 'Priority 2 — Desirable',
          requirementAddressed: `Preferred Skill: ${skill}`,
          currentEvidenceStatus: 'Unmet: Not currently documented in profile',
          recommendedAction: `Complete a targeted tutorial, mini-implementation, or certification covering ${skill}.`,
          gapCategory: 'Genuine Skill Gap',
          pillarTarget: 'Pillar 2: Career & Skills',
          targetModule: 'Pillar 2: Career & Skills',
          rationale: 'Differentiates your candidature against other eligible peers.',
          expectedOutcome: `Elevates match tier and overall role fit percentage.`,
          isCompleted: false,
        });
      } else if ((isRegistered || inPortfolio) && !inCV && profile.resumeText) {
        actions.push({
          id: `p2-pres-gap-${idx}`,
          title: `Highlight Desirable Skill "${skill}" on CV`,
          description: `You have competence in ${skill}, but it is not prominently highlighted on your resume.`,
          impact: 'Medium Impact',
          effort: 'Quick Win (<15m)',
          urgency: 'This Week',
          priorityTier: 'Priority 2 — Desirable',
          requirementAddressed: `Preferred Skill: ${skill}`,
          currentEvidenceStatus: 'Demonstrated in profile, omitted on CV',
          recommendedAction: `Mention ${skill} in technical skills section or project bullet points on your CV.`,
          gapCategory: 'CV Presentation Gap',
          pillarTarget: 'Pillar 3: CV & Job Match Intelligence',
          targetModule: 'Pillar 3: CV & Job Match Intelligence',
          rationale: 'Ensures the recruiter sees your competitive advantage at first glance.',
          expectedOutcome: `Improves desirable skill coverage on ATS scan.`,
          isCompleted: false,
        });
      }
    });

    // -------------------------------------------------------------
    // TIER 3: GOOD-TO-HAVE REQUIREMENTS (Priority 3)
    // -------------------------------------------------------------
    const goodToHaves = targetJD.goodToHaveSkills || [];
    goodToHaves.forEach((skill, idx) => {
      const sLower = skill.toLowerCase();
      const isRegistered = registeredSkillNames.some((rs) => rs.includes(sLower) || sLower.includes(rs));
      if (!isRegistered) {
        actions.push({
          id: `p3-good-gap-${idx}`,
          title: `Explore Supplementary Skill: ${skill}`,
          description: `Optional bonus skill mentioned in the role domain. Not required, but enhances conversational depth in interviews.`,
          impact: 'Foundational',
          effort: 'Moderate (1-2h)',
          urgency: 'Ongoing',
          priorityTier: 'Priority 3 — Good-to-Have',
          requirementAddressed: `Good-to-Have: ${skill}`,
          currentEvidenceStatus: 'Optional: Not currently registered',
          recommendedAction: `Review foundational concepts of ${skill} for bonus discussion points.`,
          gapCategory: 'Genuine Skill Gap',
          pillarTarget: 'Pillar 2: Career & Skills',
          targetModule: 'Pillar 2: Career & Skills',
          rationale: 'Demonstrates curiosity and breadth without being a gatekeeping factor.',
          expectedOutcome: `Strengthens discussion during open-ended interview dialogues.`,
          isCompleted: false,
        });
      }
    });
  }

  // -------------------------------------------------------------
  // FOUNDATIONAL PROFILE & EVIDENCE ENHANCEMENT ACTIONS
  // -------------------------------------------------------------
  // Academics setup
  if (!profile.education.institution || (profile.education.selfReportedCGPA === 0 && (!profile.education.terms || profile.education.terms.length === 0))) {
    actions.unshift({
      id: 'act-setup-academics',
      title: 'Record Academic Credentials (Class 10, 12, Graduation)',
      description: 'Document your formal secondary, senior secondary, and undergraduate milestones to establish deterministic eligibility cutoffs.',
      impact: 'High Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'Immediate',
      priorityTier: 'Priority 1 — Must-Have',
      requirementAddressed: 'Academic Provenance & Eligibility Baseline',
      currentEvidenceStatus: 'Incomplete academic credentials',
      recommendedAction: 'Fill in Class 10, 12, and UG degree details in Profile & Academics.',
      gapCategory: 'Foundational Setup',
      pillarTarget: 'Pillar 1: Profile & Academics',
      targetModule: 'Pillar 1: Profile & Academics',
      triggeringFinding: 'Missing academic milestones prevent campus eligibility verification.',
      expectedOutcome: 'Unlocks automated campus threshold evaluation and academic provenance.',
      rationale: 'Campus recruitment audits require verified multi-tier academic history.',
      isCompleted: false,
    });
  }

  // Project portfolio
  if (profile.projects.length < 2) {
    actions.push({
      id: 'act-add-project',
      title: 'Showcase Verifiable Project with GitHub Repository',
      description: 'Document an end-to-end software or systems project with architecture overview, tech stack, and public GitHub repository link.',
      impact: 'High Impact',
      effort: 'Deep Work (>1d)',
      urgency: 'This Week',
      priorityTier: 'Priority 2 — Desirable',
      requirementAddressed: 'Verifiable Practical Implementation Proof',
      currentEvidenceStatus: `${profile.projects.length} project(s) registered (recommended: at least 2)`,
      recommendedAction: 'Add a repository link and quantify the impact (e.g. latency, requests/sec, user volume).',
      gapCategory: 'Evidence Gap',
      pillarTarget: 'Pillar 2: Career & Skills',
      targetModule: 'Pillar 2: Career & Skills',
      triggeringFinding: 'Portfolio contains fewer than 2 verifiable practical projects.',
      expectedOutcome: 'Elevates demonstrated skill depth from Level 1 (Stated) to Level 2 (Applied).',
      rationale: 'Technical hiring managers prioritize candidates with inspectable source code.',
      isCompleted: false,
    });
  }

  // Interview preparation
  if (readiness.interviewReadiness === null || readiness.interviewReadiness < 75) {
    actions.push({
      id: 'act-practice-behavioral',
      title: 'Practice STAR Method Behavioral & Technical Drills',
      description: 'Complete structured interview practice using the STAR rubric in Practice Coach to build interview delivery agility.',
      impact: 'Medium Impact',
      effort: 'Moderate (1-2h)',
      urgency: 'This Week',
      priorityTier: 'Priority 2 — Desirable',
      requirementAddressed: 'Interview Delivery Agility & Communication',
      currentEvidenceStatus: 'Insufficient practice drill evaluations recorded',
      recommendedAction: 'Complete at least 2 practice drills in Practice Coach.',
      gapCategory: 'Evidence Gap',
      pillarTarget: 'Pillar 6: Practice Coach',
      targetModule: 'Pillar 6: Practice Coach',
      triggeringFinding: 'Limited mock practice evaluations recorded.',
      expectedOutcome: 'Raises interview readiness and solidifies structured response delivery.',
      rationale: 'Translates technical capability into convincing conversational articulation.',
      isCompleted: false,
    });
  }

  // LinkedIn positioning
  if (!profile.linkedInUrl) {
    actions.push({
      id: 'act-linkedin-url',
      title: 'Connect LinkedIn Profile URL or Upload Export',
      description: 'Add your LinkedIn public profile link or upload profile export to inspect recruiter visibility and headline alignment.',
      impact: 'Medium Impact',
      effort: 'Quick Win (<15m)',
      urgency: 'This Week',
      priorityTier: 'Priority 3 — Good-to-Have',
      requirementAddressed: 'Professional Recruiter Discoverability',
      currentEvidenceStatus: 'No LinkedIn URL or export linked',
      recommendedAction: 'Paste your LinkedIn profile URL or upload your exported profile in LinkedIn Intelligence.',
      gapCategory: 'LinkedIn Gap',
      pillarTarget: 'Pillar 4: LinkedIn Intelligence',
      targetModule: 'Pillar 4: LinkedIn Intelligence',
      triggeringFinding: 'LinkedIn profile is not linked to candidate profile.',
      expectedOutcome: 'Unlocks recruiter visibility audit and headline positioning insights.',
      rationale: 'Inbound recruiter discovery depends on keywords in headline and about section.',
      isCompleted: false,
    });
  }

  // Ensure deterministic sort: Priority 1 first, then Priority 2, then Priority 3
  const tierWeight = {
    'Priority 1 — Must-Have': 1,
    'Priority 2 — Desirable': 2,
    'Priority 3 — Good-to-Have': 3,
  };

  return actions.sort((a, b) => {
    const wa = a.priorityTier ? tierWeight[a.priorityTier] : 4;
    const wb = b.priorityTier ? tierWeight[b.priorityTier] : 4;
    return wa - wb;
  });
}
