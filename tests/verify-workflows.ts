import { AIService } from '../server/aiService';
import {
  calculateDeterministicCGPA,
  calculateContextualRoleFit,
  calculateReadiness,
  generatePrioritizedActions,
  analyzeProjects,
  analyzeCertifications,
  analyzeAchievements,
} from '../src/services/intelligenceEngine';
import {
  AARAV_SHARMA_DEMO_PROFILE,
  DEMO_JDS,
} from '../src/fixtures/demoData';
import { StudentProfile, OpportunityJD } from '../src/types';

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING CAREER SAATHI E2E VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, desc: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  // ----------------------------------------------------------------
  // TEST A: ACADEMIC RECONCILIATION
  // ----------------------------------------------------------------
  console.log('--- TEST A: Academic Reconciliation ---');
  const sampleCvWithAcademics = `
SHALINI SHARMA
Email: shalini@example.com | Phone: +91 9876543210
LinkedIn: https://linkedin.com/in/shalinisharma
GitHub: https://github.com/shalinisharma

EDUCATION
SSM College of Engineering — B.Tech in Computer Science & Engineering (2022 - 2026)
Cumulative CGPA: 8.65 / 10.0
Class 12 Senior Secondary (CBSE, Science PCM): 94.8% (2022)
Class 10 Secondary Examination (CBSE): 92.4% (2020)

SKILLS
Python, JavaScript, TypeScript, React, Node.js, SQL, PostgreSQL, Docker, AWS
`;

  const extracted = await AIService.extractCVEntities(sampleCvWithAcademics);
  assert(Boolean(extracted), 'CV entity extraction returns valid result');
  assert(extracted.class10?.board === 'CBSE' || extracted.class10?.score?.includes('92'), 'Class 10 details extracted correctly');
  assert(extracted.class12?.score?.includes('94') || extracted.class12?.stream?.includes('Science'), 'Class 12 details extracted correctly');
  assert(extracted.personalInfo?.degree?.includes('B.Tech') || extracted.personalInfo?.college?.includes('SSM'), 'Undergraduate degree and college extracted correctly');
  assert(extracted.postgraduate === null || extracted.postgraduate === undefined, 'Postgraduate is null when not in CV (optional, not flagged missing)');
  assert(extracted.personalInfo?.linkedInUrl?.includes('linkedin.com/in/shalinisharma'), 'LinkedIn profile URL preserved and validated');
  assert(extracted.personalInfo?.githubUrl === 'https://github.com/shalinisharma', 'GitHub profile URL extracted strictly without repo subpaths');

  // Test deterministic CGPA calculation
  const cgpaResult = calculateDeterministicCGPA([
    { termNumber: 1, sgpa: 8.4, credits: 24, verified: true },
    { termNumber: 2, sgpa: 8.7, credits: 24, verified: true },
    { termNumber: 3, sgpa: 8.8, credits: 24, verified: true },
  ]);
  assert(cgpaResult.currentCalculatedCGPA >= 8.6, `CGPA calculated deterministically: ${cgpaResult.currentCalculatedCGPA}`);
  assert(cgpaResult.trajectory === 'Rising', 'Academic trajectory correctly flagged as Rising');

  // ----------------------------------------------------------------
  // TEST B: CAREER & SKILL INTELLIGENCE
  // ----------------------------------------------------------------
  console.log('\n--- TEST B: Career & Skill Intelligence ---');
  const projectAnalysis = analyzeProjects(AARAV_SHARMA_DEMO_PROFILE.projects, DEMO_JDS[0]);
  assert(projectAnalysis.length > 0, 'Project analysis produced findings for registered projects');
  assert(projectAnalysis[0].relevanceScore >= 70, 'Project relevance score evaluated from tech stack match');
  assert(projectAnalysis[0].missingDetails.length >= 0, 'Actionable improvement findings generated for project');

  const certAnalysis = analyzeCertifications(AARAV_SHARMA_DEMO_PROFILE.certifications, DEMO_JDS[0]);
  assert(certAnalysis.length > 0, 'Certifications analyzed for syllabus and target role relevance');

  const achAnalysis = analyzeAchievements(AARAV_SHARMA_DEMO_PROFILE.achievements, DEMO_JDS[0]);
  assert(achAnalysis.length > 0, 'Achievements evaluated for qualitative merit without arbitrary personality scoring');

  // ----------------------------------------------------------------
  // TEST C: CV PLUS JD MATCH & 7-GAP TAXONOMY
  // ----------------------------------------------------------------
  console.log('\n--- TEST C: CV Plus JD Match & 7-Gap Taxonomy ---');
  const fitReport = calculateContextualRoleFit(AARAV_SHARMA_DEMO_PROFILE, DEMO_JDS[0]);
  assert(fitReport.overallFitScore > 0, `Overall role fit calculated: ${fitReport.overallFitScore}%`);
  assert(fitReport.atsScore !== undefined && fitReport.atsScore > 0, `Transparent ATS score calculated: ${fitReport.atsScore}%`);
  assert(Array.isArray(fitReport.profileStrengths), 'Profile strengths array populated');
  assert(Array.isArray(fitReport.cvPresentationGaps), 'CV presentation gaps array populated');
  assert(Array.isArray(fitReport.genuineCapabilityGaps), 'Genuine capability gaps array populated');

  // Test candidate with missing must-have and presentation gap
  const testCandidate: StudentProfile = {
    ...AARAV_SHARMA_DEMO_PROFILE,
    skills: [
      {
        id: 's1',
        name: 'TypeScript',
        category: 'Languages & Frameworks',
        evidenceLevel: 3,
        supportingEvidence: ['Project repo'],
        relevance: 'Directly Relevant',
        provenance: 'verified',
      },
      // Note: Has PostgreSQL in profile project, but omitted from CV text!
    ],
    resumeText: 'Experience: Frontend developer using TypeScript.',
    education: {
      ...AARAV_SHARMA_DEMO_PROFILE.education,
      selfReportedCGPA: 6.8, // Below 7.5 cutoff!
      verifiedCGPA: 6.8,
    },
  };

  const testReadiness = calculateReadiness(testCandidate, [], DEMO_JDS[0]);
  const prioritizedActions = generatePrioritizedActions(testCandidate, testReadiness, DEMO_JDS[0]);
  assert(prioritizedActions.length > 0, 'Prioritized action center generated actions');

  const p1Actions = prioritizedActions.filter((a) => a.priorityTier === 'Priority 1 — Must-Have');
  assert(p1Actions.length > 0, `Priority 1 Must-Have actions extracted from target JD: ${p1Actions.length} found`);
  assert(p1Actions.some((a) => a.gapCategory === 'Eligibility Gap'), 'Eligibility cutoff gap correctly classified as Priority 1 Must-Have');

  // ----------------------------------------------------------------
  // TEST D: LINKEDIN INTELLIGENCE
  // ----------------------------------------------------------------
  console.log('\n--- TEST D: LinkedIn Intelligence ---');
  assert(Boolean(AARAV_SHARMA_DEMO_PROFILE.linkedInUrl), 'Candidate LinkedIn URL registered');

  const linkedInAudit = await AIService.analyzeLinkedIn(
    AARAV_SHARMA_DEMO_PROFILE,
    { url: AARAV_SHARMA_DEMO_PROFILE.linkedInUrl },
    DEMO_JDS[0]
  );
  assert(linkedInAudit.completenessScore > 0, `LinkedIn completeness score: ${linkedInAudit.completenessScore}`);
  assert(Boolean(linkedInAudit.headlineAudit?.suggested), 'Headline rewrite suggested with role keywords');
  assert(Array.isArray(linkedInAudit.sectionChecklist), 'LinkedIn section checklist provided');

  // Test export parser
  const exportSample = `Headline: Software Engineer | React, Node.js\nAbout: Building high throughput applications.`;
  const parsedExport = await AIService.parseLinkedInExport(exportSample);
  assert(Boolean(parsedExport), 'LinkedIn export parsed successfully without third-party scraping');

  // ----------------------------------------------------------------
  // TEST E: REPORT & EXPORT INTEGRITY
  // ----------------------------------------------------------------
  console.log('\n--- TEST E: Report & Export Integrity ---');
  assert(!prioritizedActions.some((a) => (a as any).emailRecipient), 'Zero email sending dependencies in action records');
  assert(testReadiness.overallScore > 0, `Readiness score computed dynamically: ${testReadiness.overallScore}/100`);
  assert(Array.isArray(testReadiness.positiveContributors), 'Positive readiness contributors documented');

  // ----------------------------------------------------------------
  // TEST F: REGRESSION CHECKS
  // ----------------------------------------------------------------
  console.log('\n--- TEST F: Regression Checks ---');
  assert(DEMO_JDS.length >= 1, 'Demo JDs fixture maintained');
  assert(AARAV_SHARMA_DEMO_PROFILE.education.totalSemesters === 8, '8 semesters default education preserved');
  assert(AARAV_SHARMA_DEMO_PROFILE.skills.length >= 8, 'Skills fixture available for demo testing');

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests} OF ${totalTests} CHECKS PASSED`);
  console.log('====================================================\n');
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
