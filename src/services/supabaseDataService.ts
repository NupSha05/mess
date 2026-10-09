import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import {
  StudentProfile,
  OpportunityJD,
  ApplicationRecord,
  PracticeSession,
  ReadinessSnapshot,
  EventImpactRecord,
  EmailLogEntry,
  CVAnalysis,
  LinkedInAnalysis,
} from '../types';

/**
 * Supabase Data Service
 * Authoritative persistence layer for authenticated students.
 * Features fault-tolerant local cache fallback if Supabase database tables
 * have not yet been created in the connected project's schema cache (PGRST205).
 */

// Schema Missing Tracking
let isSchemaMissingDetected = false;
const missingTablesSet = new Set<string>();
type SchemaStatusListener = (isMissing: boolean, missingTables: string[]) => void;
const schemaListeners = new Set<SchemaStatusListener>();

export function getIsSchemaMissing(): boolean {
  return isSchemaMissingDetected;
}

export function getMissingTables(): string[] {
  return Array.from(missingTablesSet);
}

export function subscribeSchemaStatus(listener: SchemaStatusListener): () => void {
  schemaListeners.add(listener);
  listener(isSchemaMissingDetected, Array.from(missingTablesSet));
  return () => {
    schemaListeners.delete(listener);
  };
}

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    (typeof error.message === 'string' &&
      (error.message.includes('schema cache') ||
        error.message.includes('Could not find the table') ||
        (error.message.includes('relation') && error.message.includes('does not exist'))))
  );
}

export function recordMissingTable(table: string): void {
  missingTablesSet.add(table);
  if (!isSchemaMissingDetected) {
    isSchemaMissingDetected = true;
  }
  schemaListeners.forEach((fn) => {
    try {
      fn(isSchemaMissingDetected, Array.from(missingTablesSet));
    } catch {
      // ignore
    }
  });
}

export function clearMissingTablesState(): void {
  isSchemaMissingDetected = false;
  missingTablesSet.clear();
  schemaListeners.forEach((fn) => {
    try {
      fn(false, []);
    } catch {
      // ignore
    }
  });
}

// Local Storage Fallback Helpers
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[Career Saathi] Local storage quota or write error:', err);
  }
}

// Helper to get authenticated client or throw informative error
function requireClient() {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  return client;
}

// 1. STUDENT PROFILE & ASSOCIATED DOMAINS
export async function fetchFullStudentProfile(userId: string): Promise<StudentProfile | null> {
  const localKey = `careersaathi_profile_${userId}`;
  let localCachedProfile = getLocalItem<StudentProfile | null>(localKey, null);

  // 1a. Attempt server profile fetch to guarantee persistence across sessions & browsers
  try {
    const res = await fetch(`/api/auth/profile/${userId}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.profile) {
        localCachedProfile = { ...(localCachedProfile || {}), ...json.profile };
        setLocalItem(localKey, localCachedProfile);
      }
    }
  } catch {
    // offline/network fallback
  }

  const sanitizeProfile = (p: any): StudentProfile => {
    if (!p.education) {
      p.education = {
        institution: p.college || '',
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        totalSemesters: 8,
        termsCompleted: 6,
        currentSemester: 7,
        degreeStatus: 'pursuing',
        gradingSystem: 'cgpa',
        selfReportedCGPA: 8.5,
        verifiedCGPA: 8.5,
        terms: [],
      };
    }
    if (!Array.isArray(p.education.terms)) p.education.terms = [];
    if (!Array.isArray(p.skills)) p.skills = [];
    if (!Array.isArray(p.projects)) p.projects = [];
    if (!Array.isArray(p.experiences)) p.experiences = [];
    if (!Array.isArray(p.certifications)) p.certifications = [];
    if (!p.preferences) {
      p.preferences = {
        targetRoles: ['Software Development Engineer', 'Full Stack Developer'],
        targetLocations: ['Bengaluru', 'Hyderabad', 'Remote'],
        preferredWorkType: 'Hybrid',
        minAcceptableCTC: '₹12,00,000',
        targetIndustry: ['Technology'],
      };
    }
    p.onboardingCompleted = true;
    return p as StudentProfile;
  };

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localCachedProfile ? sanitizeProfile(localCachedProfile) : null;
  }

  // 1b. Fetch student_profiles from Supabase if connected
  try {
    const { data: profileRow, error: profileErr } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileErr) {
      if (isTableMissingError(profileErr)) {
        recordMissingTable('student_profiles');
        console.info('[Career Saathi] student_profiles table not in schema cache. Using local session profile.');
        return localCachedProfile;
      }
      console.warn('Non-fatal error fetching student_profiles:', profileErr);
      return localCachedProfile;
    }

    if (!profileRow) {
      return localCachedProfile;
    }

    const profileId = profileRow.id;

    // 1b. Fetch career preferences
    let prefsRow: any = null;
    try {
      const { data, error } = await supabase
        .from('career_preferences')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();
      if (error && isTableMissingError(error)) recordMissingTable('career_preferences');
      else prefsRow = data;
    } catch {
      // ignore
    }

    // 1c. Fetch education
    let eduRow: any = null;
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();
      if (error && isTableMissingError(error)) recordMissingTable('education');
      else eduRow = data;
    } catch {
      // ignore
    }

    // 1d. Fetch academic terms if education exists
    let academicTerms: any[] = [];
    if (eduRow?.id) {
      try {
        const { data, error } = await supabase
          .from('academic_terms')
          .select('*')
          .eq('education_id', eduRow.id)
          .order('term_number', { ascending: true });
        if (error && isTableMissingError(error)) recordMissingTable('academic_terms');
        else academicTerms = data || [];
      } catch {
        // ignore
      }
    }

    // 1e. Fetch experiences
    let expRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error && isTableMissingError(error)) recordMissingTable('experiences');
      else expRows = data || [];
    } catch {
      // ignore
    }

    // 1f. Fetch projects
    let projRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error && isTableMissingError(error)) recordMissingTable('projects');
      else projRows = data || [];
    } catch {
      // ignore
    }

    // 1g. Fetch skills
    let skillRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true });
      if (error && isTableMissingError(error)) recordMissingTable('skills');
      else skillRows = data || [];
    } catch {
      // ignore
    }

    // 1h. Fetch certifications
    let certRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error && isTableMissingError(error)) recordMissingTable('certifications');
      else certRows = data || [];
    } catch {
      // ignore
    }

    // Construct full domain object
    const profile: StudentProfile = {
      id: profileRow.id,
      name: profileRow.name || '',
      email: profileRow.email || '',
      phone: profileRow.phone || '',
      college: profileRow.college || '',
      headline: profileRow.headline || '',
      about: profileRow.about || '',
      careerStage: (profileRow.career_stage as any) || 'Final Year Student',
      onboardingCompleted: Boolean(profileRow.onboarding_completed),
      linkedInUrl: profileRow.linkedin_url || '',
      githubUrl: profileRow.github_url || '',
      portfolioUrl: profileRow.portfolio_url || '',
      education: {
        id: eduRow?.id || 'edu-primary',
        institution: eduRow?.institution || profileRow.college || '',
        degree: eduRow?.degree || 'B.Tech',
        branch: eduRow?.branch || 'Computer Science & Engineering',
        startYear: eduRow?.start_year || 2022,
        expectedGraduationYear: eduRow?.expected_graduation_year || 2026,
        currentSemester: eduRow?.current_semester || 1,
        totalSemesters: eduRow?.total_semesters || 8,
        selfReportedCGPA: Number(eduRow?.self_reported_cgpa || 0),
        verifiedCGPA: eduRow?.verified_cgpa ? Number(eduRow.verified_cgpa) : undefined,
        marksheetExtractedCGPA: eduRow?.marksheet_extracted_cgpa ? Number(eduRow.marksheet_extracted_cgpa) : undefined,
        discrepancyFlag: Boolean(eduRow?.discrepancy_flag),
        verificationStatus: (eduRow?.verification_status as any) || 'unverified',
        provenance: (eduRow?.provenance as any) || 'user_provided',
        terms: academicTerms.map((t) => ({
          termNumber: t.term_number,
          sgpa: Number(t.sgpa),
          credits: t.credits || 24,
          verified: Boolean(t.verified),
          marksheetDocId: t.marksheet_doc_id,
        })),
      },
      experiences: (expRows || []).map((e) => ({
        id: e.id,
        company: e.company,
        role: e.role,
        duration: e.duration || '',
        startDate: e.start_date || '',
        endDate: e.end_date || '',
        description: e.description || '',
        impactMetrics: e.impact_metrics || [],
        skillsUsed: e.skills_used || [],
        evidenceLevel: (e.evidence_level as any) || 'medium',
        provenance: (e.provenance as any) || 'user_provided',
        verificationStatus: (e.verification_status as any) || 'unverified',
      })),
      projects: (projRows || []).map((p) => ({
        id: p.id,
        title: p.title,
        role: p.role || '',
        techStack: p.tech_stack || [],
        description: p.description || '',
        outcomes: p.outcomes || [],
        githubUrl: p.github_url || undefined,
        liveUrl: p.live_url || undefined,
        evidenceLevel: (p.evidence_level as any) || 'medium',
        provenance: (p.provenance as any) || 'user_provided',
        verificationStatus: (p.verification_status as any) || 'unverified',
      })),
      skills: (skillRows || []).map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category as any,
        evidenceLevel: s.evidence_level as any,
        supportingEvidence: s.supporting_evidence || [],
        relevance: s.relevance as any,
        provenance: s.provenance as any,
      })),
      certifications: (certRows || []).map((c) => ({
        id: c.id,
        title: c.title,
        issuingOrg: c.issuing_org || c.issuer || 'Certification Authority',
        issueDate: c.issue_date || '',
        credentialUrl: c.credential_url || undefined,
        verified: Boolean(c.verified),
        provenance: (c.provenance as any) || 'user_provided',
      })),
      achievements: [],
      preferences: {
        targetRoles: prefsRow?.target_roles || ['Full Stack Engineer', 'Backend Specialist'],
        targetLocations: prefsRow?.preferred_locations || ['Bengaluru', 'Hyderabad'],
        preferredWorkType: (prefsRow?.preferred_work_type as any) || 'Hybrid',
        minAcceptableCTC: prefsRow?.min_acceptable_ctc || '₹10 LPA',
        targetIndustry: prefsRow?.target_industries || ['Technology'],
      },
    };

    // Keep local cache synced
    setLocalItem(localKey, profile);
    return profile;
  } catch (err: any) {
    if (isTableMissingError(err)) {
      recordMissingTable('student_profiles');
    }
    console.info('[Career Saathi] Database unavailable, using local cache for profile:', err.message || err);
    return localCachedProfile;
  }
}

export async function upsertStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<void> {
  // Always update local cache immediately for zero data loss
  const localKey = `careersaathi_profile_${userId}`;
  const existing = getLocalItem<any>(localKey, {});
  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  setLocalItem(localKey, merged);

  // Sync to server database
  try {
    fetch(`/api/auth/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    }).catch(() => {});
  } catch {
    // ignore
  }

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  const profileData: any = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) profileData.name = updates.name;
  if (updates.email !== undefined) profileData.email = updates.email;
  if (updates.phone !== undefined) profileData.phone = updates.phone;
  if (updates.college !== undefined) profileData.college = updates.college;
  if (updates.headline !== undefined) profileData.headline = updates.headline;
  if (updates.about !== undefined) profileData.about = updates.about;
  if (updates.careerStage !== undefined) profileData.career_stage = updates.careerStage;
  if (updates.onboardingCompleted !== undefined) profileData.onboarding_completed = updates.onboardingCompleted;
  if (updates.linkedInUrl !== undefined) profileData.linkedin_url = updates.linkedInUrl;
  if (updates.githubUrl !== undefined) profileData.github_url = updates.githubUrl;
  if (updates.portfolioUrl !== undefined) profileData.portfolio_url = updates.portfolioUrl;

  try {
    const { error } = await supabase
      .from('student_profiles')
      .upsert(profileData, { onConflict: 'user_id' });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('student_profiles');
        console.info('[Career Saathi] student_profiles table not in schema cache. Safely persisted locally.');
        return;
      }
      console.warn('Warning updating student_profiles:', error.message);
    }
  } catch (err: any) {
    if (isTableMissingError(err)) {
      recordMissingTable('student_profiles');
      return;
    }
    console.warn('Non-fatal error in upsertStudentProfile:', err.message);
  }
}

export async function upsertEducation(userId: string, profileId: string, edu: Partial<StudentProfile['education']>): Promise<void> {
  // Always update local storage
  const localKey = `careersaathi_edu_${userId}`;
  const existingEdu = getLocalItem<any>(localKey, {});
  const mergedEdu = { ...existingEdu, ...edu, updated_at: new Date().toISOString() };
  setLocalItem(localKey, mergedEdu);

  // Also sync into full profile local cache
  const profileKey = `careersaathi_profile_${userId}`;
  const existingProfile = getLocalItem<any>(profileKey, null);
  if (existingProfile) {
    existingProfile.education = { ...existingProfile.education, ...edu };
    setLocalItem(profileKey, existingProfile);
    try {
      fetch(`/api/auth/profile/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existingProfile),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  const eduData: any = {
    user_id: userId,
    profile_id: profileId,
    updated_at: new Date().toISOString(),
  };

  if (edu.institution !== undefined) eduData.institution = edu.institution;
  if (edu.degree !== undefined) eduData.degree = edu.degree;
  if (edu.branch !== undefined) eduData.branch = edu.branch;
  if (edu.startYear !== undefined) eduData.start_year = edu.startYear;
  if (edu.expectedGraduationYear !== undefined) eduData.expected_graduation_year = edu.expectedGraduationYear;
  if (edu.currentSemester !== undefined) eduData.current_semester = edu.currentSemester;
  if (edu.totalSemesters !== undefined) eduData.total_semesters = edu.totalSemesters;
  if (edu.selfReportedCGPA !== undefined) eduData.self_reported_cgpa = edu.selfReportedCGPA;
  if (edu.verifiedCGPA !== undefined) eduData.verified_cgpa = edu.verifiedCGPA;
  if (edu.marksheetExtractedCGPA !== undefined) eduData.marksheet_extracted_cgpa = edu.marksheetExtractedCGPA;
  if (edu.discrepancyFlag !== undefined) eduData.discrepancy_flag = edu.discrepancyFlag;
  if (edu.verificationStatus !== undefined) eduData.verification_status = edu.verificationStatus;

  try {
    const { data, error } = await supabase
      .from('education')
      .upsert(eduData, { onConflict: 'profile_id' })
      .select('id')
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('education');
        console.info('[Career Saathi] education table not in schema cache. Safely persisted locally.');
        return;
      }
      console.warn('Warning upserting education:', error.message);
      return;
    }

    // Update terms if provided
    if (edu.terms && data?.id) {
      for (const term of edu.terms) {
        try {
          const { error: termErr } = await supabase.from('academic_terms').upsert({
            user_id: userId,
            education_id: data.id,
            term_number: term.termNumber,
            sgpa: term.sgpa,
            credits: term.credits,
            verified: term.verified,
            marksheet_doc_id: term.marksheetDocId || null,
          }, { onConflict: 'education_id,term_number' });

          if (termErr && isTableMissingError(termErr)) {
            recordMissingTable('academic_terms');
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (err: any) {
    if (isTableMissingError(err)) {
      recordMissingTable('education');
      return;
    }
    console.warn('Non-fatal error in upsertEducation:', err.message);
  }
}

export async function addProjectToDb(userId: string, profileId: string, proj: Omit<StudentProfile['projects'][0], 'id'>): Promise<string> {
  const generatedId = `proj-${Date.now()}`;
  const localKey = `careersaathi_projects_${userId}`;
  const existingProjs = getLocalItem<any[]>(localKey, []);
  setLocalItem(localKey, [{ id: generatedId, ...proj }, ...existingProjs]);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return generatedId;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        profile_id: profileId,
        title: proj.title,
        role: proj.role,
        tech_stack: proj.techStack,
        description: proj.description,
        outcomes: proj.outcomes,
        github_url: proj.githubUrl || null,
        live_url: proj.liveUrl || null,
        evidence_level: proj.evidenceLevel,
        provenance: proj.provenance,
        verification_status: proj.verificationStatus,
      })
      .select('id')
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('projects');
        return generatedId;
      }
      return generatedId;
    }
    return data.id;
  } catch {
    return generatedId;
  }
}

export async function addSkillToDb(userId: string, profileId: string, skill: Omit<StudentProfile['skills'][0], 'id'>): Promise<string> {
  const generatedId = `skill-${Date.now()}`;
  const localKey = `careersaathi_skills_${userId}`;
  const existingSkills = getLocalItem<any[]>(localKey, []);
  setLocalItem(localKey, [{ id: generatedId, ...skill }, ...existingSkills]);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return generatedId;
  }

  try {
    const { data, error } = await supabase
      .from('skills')
      .insert({
        user_id: userId,
        profile_id: profileId,
        name: skill.name,
        category: skill.category,
        evidence_level: skill.evidenceLevel,
        supporting_evidence: skill.supportingEvidence,
        relevance: skill.relevance,
        provenance: skill.provenance,
      })
      .select('id')
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('skills');
        return generatedId;
      }
      return generatedId;
    }
    return data.id;
  } catch {
    return generatedId;
  }
}

// 2. OPPORTUNITY / JOB DESCRIPTIONS
export async function fetchJobDescriptionsFromDb(userId: string): Promise<OpportunityJD[]> {
  const localKey = `careersaathi_jds_${userId}`;
  const localJds = getLocalItem<OpportunityJD[]>(localKey, []);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localJds;
  }

  try {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('job_descriptions');
        return localJds;
      }
      return localJds;
    }

    const fetched = (data || []).map((j) => ({
      id: j.id,
      company: j.company,
      title: j.title,
      function: j.function || 'Engineering',
      location: j.location || 'Hybrid',
      workArrangement: (j.work_arrangement as any) || 'Hybrid',
      experienceRange: j.experience_range || '0-2 Years',
      educationRequirement: j.education_requirement || 'B.Tech / B.E.',
      cgpaCutoff: Number(j.cgpa_cutoff || 7.0),
      maxBacklogs: j.max_backlogs || 0,
      salaryRange: j.salary_range || 'Competitive',
      mustHaveSkills: j.must_have_skills || [],
      preferredSkills: j.preferred_skills || [],
      goodToHaveSkills: j.good_to_have_skills || [],
      keyResponsibilities: j.key_responsibilities || [],
      ambiguousOrUncertainTerms: j.ambiguous_terms || [],
      rawText: j.raw_text || '',
    }));

    if (fetched.length > 0) {
      setLocalItem(localKey, fetched);
      return fetched;
    }
    return localJds;
  } catch {
    return localJds;
  }
}

export async function saveJobDescriptionToDb(userId: string, profileId: string, jd: OpportunityJD): Promise<string> {
  const localKey = `careersaathi_jds_${userId}`;
  const localJds = getLocalItem<OpportunityJD[]>(localKey, []);
  const existingIndex = localJds.findIndex((j) => j.id === jd.id);
  if (existingIndex >= 0) {
    localJds[existingIndex] = jd;
  } else {
    localJds.unshift(jd);
  }
  setLocalItem(localKey, localJds);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return jd.id;
  }

  try {
    const { data, error } = await supabase
      .from('job_descriptions')
      .upsert({
        id: jd.id.startsWith('custom-') || jd.id.startsWith('jd-') ? undefined : jd.id,
        user_id: userId,
        profile_id: profileId,
        company: jd.company,
        title: jd.title,
        function: jd.function,
        location: jd.location,
        work_arrangement: jd.workArrangement,
        experience_range: jd.experienceRange,
        education_requirement: jd.educationRequirement,
        cgpa_cutoff: jd.cgpaCutoff,
        max_backlogs: jd.maxBacklogs,
        salary_range: jd.salaryRange,
        must_have_skills: jd.mustHaveSkills,
        preferred_skills: jd.preferredSkills,
        good_to_have_skills: jd.goodToHaveSkills,
        key_responsibilities: jd.keyResponsibilities,
        ambiguous_terms: jd.ambiguousOrUncertainTerms,
        raw_text: jd.rawText || '',
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('job_descriptions');
        return jd.id;
      }
      return jd.id;
    }
    return data.id;
  } catch {
    return jd.id;
  }
}

// 3. APPLICATIONS & FUNNEL
export async function fetchApplicationsFromDb(userId: string): Promise<ApplicationRecord[]> {
  const localKey = `careersaathi_apps_${userId}`;
  const localApps = getLocalItem<ApplicationRecord[]>(localKey, []);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localApps;
  }

  try {
    const { data: apps, error } = await supabase
      .from('applications')
      .select(`
        *,
        application_events (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('applications');
        return localApps;
      }
      return localApps;
    }

    const fetched = (apps || []).map((a) => {
      const events = (a.application_events || []).sort(
        (e1: any, e2: any) => new Date(e1.timestamp).getTime() - new Date(e2.timestamp).getTime()
      );

      return {
        id: a.id,
        company: a.company,
        role: a.role,
        appliedDate: a.applied_date,
        stage: a.stage as any,
        stageUpdatedDate: a.stage_updated_date || a.created_at,
        healthCategory: a.health_category as any,
        healthRationale: a.health_rationale || '',
        location: a.location || undefined,
        notes: a.notes || undefined,
        history: events.map((ev: any) => ({
          stage: ev.stage,
          timestamp: ev.timestamp,
          comment: ev.comment || undefined,
        })),
      };
    });

    if (fetched.length > 0) {
      setLocalItem(localKey, fetched);
      return fetched;
    }
    return localApps;
  } catch {
    return localApps;
  }
}

export async function saveApplicationToDb(userId: string, profileId: string, app: ApplicationRecord): Promise<string> {
  const localKey = `careersaathi_apps_${userId}`;
  const localApps = getLocalItem<ApplicationRecord[]>(localKey, []);
  localApps.unshift(app);
  setLocalItem(localKey, localApps);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return app.id;
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        profile_id: profileId,
        company: app.company,
        role: app.role,
        applied_date: app.appliedDate,
        stage: app.stage,
        stage_updated_date: app.stageUpdatedDate,
        health_category: app.healthCategory,
        health_rationale: app.healthRationale,
        location: app.location || null,
        notes: app.notes || null,
      })
      .select('id')
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('applications');
        return app.id;
      }
      return app.id;
    }

    try {
      await supabase.from('application_events').insert({
        user_id: userId,
        application_id: data.id,
        stage: app.stage,
        timestamp: new Date().toISOString(),
        comment: 'Initial application logged.',
      });
    } catch {
      // ignore
    }

    return data.id;
  } catch {
    return app.id;
  }
}

export async function updateApplicationStageInDb(
  userId: string,
  appId: string,
  newStage: ApplicationRecord['stage'],
  healthCategory: ApplicationRecord['healthCategory'],
  healthRationale: string,
  note?: string
): Promise<void> {
  const localKey = `careersaathi_apps_${userId}`;
  const localApps = getLocalItem<ApplicationRecord[]>(localKey, []);
  const app = localApps.find((a) => a.id === appId);
  if (app) {
    app.stage = newStage;
    app.stageUpdatedDate = new Date().toISOString();
    app.healthCategory = healthCategory;
    app.healthRationale = healthRationale;
    app.history.push({
      stage: newStage,
      timestamp: new Date().toISOString(),
      comment: note || `Stage transitioned to ${newStage}`,
    });
    setLocalItem(localKey, localApps);
  }

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  const now = new Date().toISOString();

  try {
    const { error: appErr } = await supabase
      .from('applications')
      .update({
        stage: newStage,
        stage_updated_date: now,
        health_category: healthCategory,
        health_rationale: healthRationale,
        updated_at: now,
      })
      .eq('id', appId)
      .eq('user_id', userId);

    if (appErr && isTableMissingError(appErr)) {
      recordMissingTable('applications');
      return;
    }

    try {
      await supabase.from('application_events').insert({
        user_id: userId,
        application_id: appId,
        stage: newStage,
        timestamp: now,
        comment: note || `Stage transitioned to ${newStage}`,
      });
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

// 4. PRACTICE SESSIONS
export async function fetchPracticeSessionsFromDb(userId: string): Promise<PracticeSession[]> {
  const localKey = `careersaathi_practice_${userId}`;
  const localSessions = getLocalItem<PracticeSession[]>(localKey, []);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localSessions;
  }

  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('practice_sessions');
        return localSessions;
      }
      return localSessions;
    }

    const fetched = (data || []).map((p) => ({
      id: p.id,
      category: p.category as any,
      mode: p.mode as any,
      frameworkApplied: p.framework_applied,
      question: p.question,
      studentAnswer: p.student_answer,
      evaluation: p.evaluation,
      completedAt: p.completed_at,
    }));

    if (fetched.length > 0) {
      setLocalItem(localKey, fetched);
      return fetched;
    }
    return localSessions;
  } catch {
    return localSessions;
  }
}

export async function savePracticeSessionToDb(userId: string, profileId: string, session: PracticeSession): Promise<string> {
  const localKey = `careersaathi_practice_${userId}`;
  const localSessions = getLocalItem<PracticeSession[]>(localKey, []);
  localSessions.unshift(session);
  setLocalItem(localKey, localSessions);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return session.id;
  }

  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        profile_id: profileId,
        category: session.category,
        mode: session.mode,
        framework_applied: session.frameworkApplied,
        question: session.question,
        student_answer: session.studentAnswer,
        evaluation: session.evaluation || {},
        completed_at: session.completedAt || new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('practice_sessions');
        return session.id;
      }
      return session.id;
    }
    return data.id;
  } catch {
    return session.id;
  }
}

// 5. READINESS SNAPSHOTS
export async function fetchReadinessSnapshotsFromDb(userId: string): Promise<ReadinessSnapshot[]> {
  const localKey = `careersaathi_readiness_${userId}`;
  const localSnaps = getLocalItem<ReadinessSnapshot[]>(localKey, []);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localSnaps;
  }

  try {
    const { data, error } = await supabase
      .from('readiness_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('readiness_snapshots');
        return localSnaps;
      }
      return localSnaps;
    }

    const fetched = (data || []).map((s) => ({
      id: s.id,
      academicReadiness: Number(s.academic_readiness),
      profileReadiness: Number(s.profile_readiness),
      skillReadiness: Number(s.skill_readiness),
      opportunityReadiness: Number(s.opportunity_readiness),
      interviewReadiness: Number(s.interview_readiness),
      overallScore: Number(s.overall_score),
      trend: (s.trend as any) || 'stable',
      triggerEvent: s.trigger_event || 'Baseline Update',
      positiveContributors: s.positive_contributors || [],
      limitingFactors: s.limiting_factors || [],
      timestamp: s.timestamp,
      lastCalculated: s.timestamp,
    }));

    if (fetched.length > 0) {
      setLocalItem(localKey, fetched);
      return fetched;
    }
    return localSnaps;
  } catch {
    return localSnaps;
  }
}

export async function saveReadinessSnapshotToDb(userId: string, profileId: string, snap: ReadinessSnapshot): Promise<void> {
  // Always update local cache
  const localKey = `careersaathi_readiness_${userId}`;
  const localSnaps = getLocalItem<ReadinessSnapshot[]>(localKey, []);
  localSnaps.unshift(snap);
  setLocalItem(localKey, localSnaps.slice(0, 30)); // keep last 30 snapshots

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  try {
    const { error } = await supabase
      .from('readiness_snapshots')
      .insert({
        user_id: userId,
        profile_id: profileId,
        academic_readiness: snap.academicReadiness,
        profile_readiness: snap.profileReadiness,
        skill_readiness: snap.skillReadiness,
        opportunity_readiness: snap.opportunityReadiness,
        interview_readiness: snap.interviewReadiness,
        overall_score: snap.overallScore,
        trend: snap.trend,
        trigger_event: snap.triggerEvent,
        positive_contributors: snap.positiveContributors,
        limiting_factors: snap.limitingFactors,
        timestamp: snap.timestamp || new Date().toISOString(),
      });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('readiness_snapshots');
        return;
      }
      console.warn('Warning saving readiness snapshot:', error.message);
    }
  } catch (err: any) {
    if (isTableMissingError(err)) {
      recordMissingTable('readiness_snapshots');
      return;
    }
    console.warn('Non-fatal error in saveReadinessSnapshotToDb:', err.message);
  }
}

// 6. EVENT IMPACT LOGS
export async function fetchEventImpactLogsFromDb(userId: string): Promise<EventImpactRecord[]> {
  const localKey = `careersaathi_events_${userId}`;
  const localEvents = getLocalItem<EventImpactRecord[]>(localKey, []);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localEvents;
  }

  try {
    const { data, error } = await supabase
      .from('event_impact_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('event_impact_logs');
        return localEvents;
      }
      return localEvents;
    }

    const fetched = (data || []).map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      eventType: l.event_type,
      sourcePillar: l.source_pillar,
      affectedDimensions: l.affected_dimensions || [],
      explanation: l.explanation,
    }));

    if (fetched.length > 0) {
      setLocalItem(localKey, fetched);
      return fetched;
    }
    return localEvents;
  } catch {
    return localEvents;
  }
}

export async function saveEventImpactLogToDb(userId: string, profileId: string, log: EventImpactRecord): Promise<void> {
  // Always update local cache
  const localKey = `careersaathi_events_${userId}`;
  const localEvents = getLocalItem<EventImpactRecord[]>(localKey, []);
  localEvents.unshift(log);
  setLocalItem(localKey, localEvents.slice(0, 50)); // keep last 50 logs

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  try {
    const { error } = await supabase.from('event_impact_logs').insert({
      user_id: userId,
      profile_id: profileId,
      event_type: log.eventType,
      source_pillar: log.sourcePillar,
      affected_dimensions: log.affectedDimensions,
      explanation: log.explanation,
      timestamp: log.timestamp || new Date().toISOString(),
    });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('event_impact_logs');
        return;
      }
      console.warn('Warning saving event impact log:', error.message);
    }
  } catch (err: any) {
    if (isTableMissingError(err)) {
      recordMissingTable('event_impact_logs');
      return;
    }
    console.warn('Non-fatal error in saveEventImpactLogToDb:', err.message);
  }
}

// 7. EMAIL LOGS & AUDIT REGISTRY
export async function fetchEmailLogsFromDb(userId: string): Promise<EmailLogEntry[]> {
  const localKey = `careersaathi_emails_${userId}`;
  const localEmails = getLocalItem<EmailLogEntry[]>(localKey, []);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localEmails;
  }

  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('email_logs');
        return localEmails;
      }
      return localEmails;
    }

    const fetched = (data || []).map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      recipient: e.recipient,
      recipientRole: e.recipient_role || undefined,
      reportTitle: e.report_title,
      subject: e.subject || '',
      status: (e.status as any) || 'AUDIT_LOGGED',
      authenticatedSender: e.authenticated_sender,
    }));

    if (fetched.length > 0) {
      setLocalItem(localKey, fetched);
      return fetched;
    }
    return localEmails;
  } catch {
    return localEmails;
  }
}

export async function saveEmailLogToDb(userId: string, profileId: string, log: EmailLogEntry): Promise<void> {
  const localKey = `careersaathi_emails_${userId}`;
  const localEmails = getLocalItem<EmailLogEntry[]>(localKey, []);
  localEmails.unshift(log);
  setLocalItem(localKey, localEmails);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  try {
    const { error } = await supabase.from('email_logs').insert({
      user_id: userId,
      profile_id: profileId,
      recipient: log.recipient,
      recipient_role: log.recipientRole,
      report_title: log.reportTitle,
      subject: log.subject,
      status: log.status,
      authenticated_sender: log.authenticatedSender,
      timestamp: log.timestamp || new Date().toISOString(),
    });

    if (error && isTableMissingError(error)) {
      recordMissingTable('email_logs');
    }
  } catch {
    // ignore
  }
}

// 8. STORAGE & DOCUMENT UPLOAD
export async function uploadDocumentToStorage(
  userId: string,
  profileId: string,
  file: File,
  category: 'academic_transcript' | 'cv_resume' | 'jd_document' | 'certification_proof'
): Promise<{ documentId: string; filePath: string; fileName: string }> {
  const generatedId = `doc-${Date.now()}`;
  const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = `${userId}/${category}/${cleanFileName}`;

  // Always create a local document record to guarantee user experience
  const localDocsKey = `careersaathi_docs_${userId}`;
  const localDocs = getLocalItem<any[]>(localDocsKey, []);
  const localDocEntry = {
    id: generatedId,
    userId,
    profileId,
    category,
    filePath: storagePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    createdAt: new Date().toISOString(),
    localDataUrl: URL.createObjectURL(file),
  };
  localDocs.unshift(localDocEntry);
  setLocalItem(localDocsKey, localDocs);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return {
      documentId: generatedId,
      filePath: storagePath,
      fileName: file.name,
    };
  }

  // Attempt upload to bucket 'career-documents'
  try {
    const { error: uploadError } = await supabase.storage
      .from('career-documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.info('[Career Saathi Storage] Bucket upload notice:', uploadError.message, '- document stored locally.');
      return {
        documentId: generatedId,
        filePath: storagePath,
        fileName: file.name,
      };
    }
  } catch (e: any) {
    console.info('[Career Saathi Storage] Storage network/bucket notice:', e.message, '- document stored locally.');
    return {
      documentId: generatedId,
      filePath: storagePath,
      fileName: file.name,
    };
  }

  // Record metadata in 'documents' table if it exists
  try {
    const { data: docRecord, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        profile_id: profileId,
        category,
        file_path: storagePath,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        extraction_status: 'completed',
      })
      .select('id')
      .single();

    if (docError) {
      if (isTableMissingError(docError)) {
        recordMissingTable('documents');
        return {
          documentId: generatedId,
          filePath: storagePath,
          fileName: file.name,
        };
      }
      return {
        documentId: generatedId,
        filePath: storagePath,
        fileName: file.name,
      };
    }

    return {
      documentId: docRecord.id,
      filePath: storagePath,
      fileName: file.name,
    };
  } catch {
    return {
      documentId: generatedId,
      filePath: storagePath,
      fileName: file.name,
    };
  }
}

// 9. CV & LINKEDIN ANALYSES PERSISTENCE
export async function fetchCvAnalysisFromDb(userId: string): Promise<CVAnalysis | null> {
  const localKey = `careersaathi_cv_analysis_${userId}`;
  const localCached = getLocalItem<CVAnalysis | null>(localKey, null);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localCached;
  }

  try {
    const { data, error } = await supabase
      .from('cv_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('cv_analyses');
        return localCached;
      }
      return localCached;
    }

    if (!data) return localCached;

    const analysis: CVAnalysis = {
      completenessScore: Number(data.completeness_score || 0),
      quantifiedAchievementsRatio: Number(data.quantified_achievements_ratio || 0),
      activeVoiceRatio: Number(data.active_voice_ratio || 0),
      targetJDAlignmentScore: Number(data.target_jd_alignment_score || 0),
      gaps: data.gaps || [],
      bulletImprovements: data.bullet_improvements || [],
      suggestedKeywordsToAdd: data.suggested_keywords || [],
      provenance: 'ai_interpreted',
      lastAnalyzed: data.created_at,
    };

    setLocalItem(localKey, analysis);
    return analysis;
  } catch {
    return localCached;
  }
}

export async function saveCvAnalysisToDb(userId: string, profileId: string, analysis: CVAnalysis): Promise<void> {
  const localKey = `careersaathi_cv_analysis_${userId}`;
  setLocalItem(localKey, analysis);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  try {
    const { error } = await supabase.from('cv_analyses').insert({
      user_id: userId,
      profile_id: profileId,
      completeness_score: analysis.completenessScore,
      quantified_achievements_ratio: analysis.quantifiedAchievementsRatio,
      active_voice_ratio: analysis.activeVoiceRatio,
      target_jd_alignment_score: analysis.targetJDAlignmentScore,
      gaps: analysis.gaps,
      bullet_improvements: analysis.bulletImprovements,
      suggested_keywords: analysis.suggestedKeywordsToAdd,
      provenance: 'ai_interpreted',
    });

    if (error && isTableMissingError(error)) {
      recordMissingTable('cv_analyses');
    }
  } catch {
    // ignore
  }
}

export async function fetchLinkedInAnalysisFromDb(userId: string): Promise<LinkedInAnalysis | null> {
  const localKey = `careersaathi_linkedin_analysis_${userId}`;
  const localCached = getLocalItem<LinkedInAnalysis | null>(localKey, null);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return localCached;
  }

  try {
    const { data, error } = await supabase
      .from('linkedin_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('linkedin_analyses');
        return localCached;
      }
      return localCached;
    }

    if (!data) return localCached;

    const analysis: LinkedInAnalysis = {
      completenessScore: Number(data.completeness_score || 0),
      headlineAudit: data.headline_audit || { current: '', suggested: '', rationale: '' },
      aboutSummaryAudit: data.about_audit || { current: '', suggested: '', rationale: '' },
      visibilityGaps: data.visibility_gaps || [],
      genuineSkillGaps: data.genuine_skill_gaps || [],
      sectionChecklist: data.section_checklist || [],
      lastAnalyzed: data.created_at,
    };

    setLocalItem(localKey, analysis);
    return analysis;
  } catch {
    return localCached;
  }
}

export async function saveLinkedInAnalysisToDb(userId: string, profileId: string, analysis: LinkedInAnalysis): Promise<void> {
  const localKey = `careersaathi_linkedin_analysis_${userId}`;
  setLocalItem(localKey, analysis);

  let supabase;
  try {
    supabase = requireClient();
  } catch {
    return;
  }

  try {
    const { error } = await supabase.from('linkedin_analyses').insert({
      user_id: userId,
      profile_id: profileId,
      completeness_score: analysis.completenessScore,
      headline_audit: analysis.headlineAudit,
      about_audit: analysis.aboutSummaryAudit,
      visibility_gaps: analysis.visibilityGaps,
      genuine_skill_gaps: analysis.genuineSkillGaps,
      section_checklist: analysis.sectionChecklist,
      provenance: 'ai_interpreted',
    });

    if (error && isTableMissingError(error)) {
      recordMissingTable('linkedin_analyses');
    }
  } catch {
    // ignore
  }
}
