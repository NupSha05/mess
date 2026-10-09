import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  StudentProfile,
  OpportunityJD,
  RoleFitReport,
  CVAnalysis,
  LinkedInAnalysis,
  ApplicationRecord,
  ApplicationEvent,
  PracticeSession,
  ReadinessDimensions,
  ReadinessSnapshot,
  NextBestAction,
  EventImpactRecord,
  EmailLogEntry,
  AuthState,
  AuthCredentials,
} from '../types';
import {
  calculateContextualRoleFit,
  calculateReadiness,
  generatePrioritizedActions,
} from '../services/intelligenceEngine';
import {
  AARAV_SHARMA_DEMO_PROFILE,
  DEMO_JDS,
  DEMO_APPLICATIONS,
  DEMO_PRACTICE_SESSIONS,
  DEMO_CV_ANALYSIS,
  DEMO_LINKEDIN_ANALYSIS,
  DEMO_READINESS_SNAPSHOTS,
  DEMO_EVENT_LOG,
  createBlankProductionProfile,
  DEFAULT_PRODUCTION_JDS,
} from '../fixtures/demoData';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';
import { authService } from '../services/authService';
import * as dbService from '../services/supabaseDataService';

/**
 * Career Saathi Master Context
 *
 * Authoritative Persistence Architecture:
 * - Supabase Auth + PostgreSQL + Storage forms the authoritative bedrock for student data.
 * - Derived deterministic calculations remain pure functions of authoritative state.
 * - Controlled Demo Mode runs in an isolated fixture sandbox.
 */

interface CareerSaathiContextType {
  // Auth & Mode State
  authState: AuthState;
  authLoading: boolean;
  authError: string | null;
  isSupabaseConnected: boolean;
  isSchemaMissing: boolean;
  missingTables: string[];
  refreshSchemaStatus: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (creds: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  resetProductionData: () => void;

  // Persistent Application Data
  profile: StudentProfile;
  activeJD: OpportunityJD;
  allJDs: OpportunityJD[];
  applications: ApplicationRecord[];
  practiceSessions: PracticeSession[];
  eventImpactLog: EventImpactRecord[];
  emailLogs: EmailLogEntry[];

  // Derived Deterministic Intelligence
  readiness: ReadinessDimensions;
  readinessSnapshots: ReadinessSnapshot[];
  actions: NextBestAction[];
  currentFitReport: RoleFitReport;

  // AI Analysis State
  cvAnalysis: CVAnalysis | null;
  linkedInAnalysis: LinkedInAnalysis | null;
  isAiProcessing: boolean;
  aiError: string | null;

  // Mutation Operations
  updateProfile: (updated: Partial<StudentProfile>) => void;
  updateEducation: (edu: Partial<StudentProfile['education']>) => void;
  addProject: (proj: Omit<StudentProfile['projects'][0], 'id'>) => void;
  addSkill: (skill: Omit<StudentProfile['skills'][0], 'id'>) => void;
  setActiveJD: (jd: OpportunityJD) => void;
  addJD: (jd: OpportunityJD) => void;
  updateApplicationStage: (appId: string, newStage: ApplicationRecord['stage'], note?: string) => void;
  addApplication: (app: Omit<ApplicationRecord, 'id' | 'healthCategory' | 'healthRationale' | 'history' | 'stageUpdatedDate'>) => void;
  recordPracticeSession: (session: Omit<PracticeSession, 'id' | 'completedAt'>) => void;
  reconcileDiscrepancy: (authoritativeValue: number) => void;
  logEventImpact: (eventType: string, sourcePillar: string, affected: string[], explanation: string) => void;
  logEmailDispatch: (entry: EmailLogEntry) => void;
  triggerCVAnalysis: (customCvText?: string) => Promise<void>;
  triggerLinkedInAnalysis: (customLinkedInData?: any) => Promise<void>;
  clearCVAnalysis: () => void;
  clearLinkedInAnalysis: () => void;
  uploadDocument: (file: File, category: 'academic_transcript' | 'cv_resume' | 'jd_document' | 'certification_proof') => Promise<{ documentId: string; filePath: string; fileName: string } | null>;
}

const CareerSaathiContext = createContext<CareerSaathiContextType | null>(null);

const DEMO_MODE_FLAG = 'cs_demo_mode_active';

export const CareerSaathiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. System Mode: Production vs Controlled Demo Mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_MODE_FLAG) === 'true';
  });

  // 2. Auth State
  const [authStatus, setAuthStatus] = useState<AuthState['status']>('authenticating');
  const [currentAuthUser, setCurrentAuthUser] = useState<AuthState['user']>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
  const [isSchemaMissing, setIsSchemaMissing] = useState<boolean>(dbService.getIsSchemaMissing());
  const [missingTables, setMissingTables] = useState<string[]>(dbService.getMissingTables());

  useEffect(() => {
    const unsub = dbService.subscribeSchemaStatus((missing, tables) => {
      setIsSchemaMissing(missing);
      setMissingTables(tables);
    });
    return unsub;
  }, []);

  const refreshSchemaStatus = async () => {
    try {
      const res = await fetch('/api/supabase/schema-status');
      if (res.ok) {
        const data = await res.json();
        if (data.schema?.tablesExist) {
          dbService.clearMissingTablesState();
          setIsSchemaMissing(false);
          setMissingTables([]);
          if (currentAuthUser?.id) {
            loadUserDataFromSupabase(currentAuthUser.id, currentAuthUser.email || '', currentAuthUser.name);
          }
        } else if (data.schema?.missingTables?.length > 0) {
          data.schema.missingTables.forEach((t: string) => dbService.recordMissingTable(t));
        }
      }
    } catch {
      // ignore
    }
  };

  // 3. Persistent Application Data
  const [profile, setProfile] = useState<StudentProfile>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return AARAV_SHARMA_DEMO_PROFILE;
    }
    return createBlankProductionProfile();
  });

  const [allJDs, setAllJDs] = useState<OpportunityJD[]>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_JDS;
    }
    return DEFAULT_PRODUCTION_JDS;
  });

  const [activeJD, setActiveJDState] = useState<OpportunityJD>(() => {
    return allJDs[0] || DEFAULT_PRODUCTION_JDS[0];
  });

  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_APPLICATIONS;
    }
    return [];
  });

  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_PRACTICE_SESSIONS;
    }
    return [];
  });

  const [eventImpactLog, setEventImpactLog] = useState<EventImpactRecord[]>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_EVENT_LOG;
    }
    return [];
  });

  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);

  // 4. AI Analysis State
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_CV_ANALYSIS;
    }
    return null;
  });

  const [linkedInAnalysis, setLinkedInAnalysis] = useState<LinkedInAnalysis | null>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_LINKEDIN_ANALYSIS;
    }
    return null;
  });

  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [readinessSnapshots, setReadinessSnapshots] = useState<ReadinessSnapshot[]>(() => {
    if (localStorage.getItem(DEMO_MODE_FLAG) === 'true') {
      return DEMO_READINESS_SNAPSHOTS;
    }
    return [];
  });

  // 5. Derived Deterministic State
  const readiness = useMemo(() => {
    return calculateReadiness(profile, practiceSessions, activeJD, applications, readinessSnapshots);
  }, [profile, practiceSessions, activeJD, applications, readinessSnapshots]);

  const currentFitReport = useMemo(() => {
    return calculateContextualRoleFit(profile, activeJD);
  }, [profile, activeJD]);

  const actions = useMemo(() => {
    return generatePrioritizedActions(profile, readiness, activeJD);
  }, [profile, readiness, activeJD]);

  // Track readiness snapshot evolution
  useEffect(() => {
    if (!profile.name && readiness.overallScore === 0) return;
    const snapId = `snap-${Date.now()}`;
    const snap: ReadinessSnapshot = {
      ...readiness,
      id: snapId,
      timestamp: new Date().toISOString(),
      triggerEvent: isDemoMode ? 'Demo State Active' : 'Evidence Repository Updated',
    };

    setReadinessSnapshots((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.overallScore === readiness.overallScore && last.academicReadiness === readiness.academicReadiness) {
        return prev;
      }
      return [...prev.slice(-9), snap];
    });

    // If authenticated in production, persist snapshot to Supabase
    if (!isDemoMode && currentAuthUser?.id && isSupabaseConfigured()) {
      dbService.saveReadinessSnapshotToDb(currentAuthUser.id, profile.id, snap).catch(() => {});
    }
  }, [readiness, isDemoMode, profile.name, currentAuthUser?.id, profile.id]);

  // Load authenticated student data from database or persistent store
  const loadUserDataFromSupabase = useCallback(async (userId: string, userEmail: string, userName?: string) => {
    try {
      setAuthLoading(true);
      let studentProfile = await dbService.fetchFullStudentProfile(userId);

      if (studentProfile) {
        // Ensure student name and email are populated
        if (!studentProfile.name && userName) studentProfile.name = userName;
        if (!studentProfile.email && userEmail) studentProfile.email = userEmail;
        if (!Array.isArray(studentProfile.education?.terms)) {
          if (!studentProfile.education) (studentProfile as any).education = {};
          studentProfile.education.terms = [];
        }
        if (!Array.isArray(studentProfile.skills)) studentProfile.skills = [];
        if (!Array.isArray(studentProfile.projects)) studentProfile.projects = [];
        if (!Array.isArray(studentProfile.experiences)) studentProfile.experiences = [];
        if (!Array.isArray(studentProfile.certifications)) studentProfile.certifications = [];
        studentProfile.onboardingCompleted = true;
        setProfile(studentProfile);
      } else {
        // Fallback to local storage or server profile cache
        const localKey = `careersaathi_profile_${userId}`;
        const cachedRaw = localStorage.getItem(localKey);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (cached) {
              cached.onboardingCompleted = true;
              studentProfile = cached;
              setProfile(cached);
            }
          } catch {}
        }

        if (!studentProfile) {
          // Initialize complete base profile from user credentials
          const base = createBlankProductionProfile(userId);
          base.id = userId;
          base.email = userEmail;
          base.name = userName || userEmail.split('@')[0] || 'Student';
          base.onboardingCompleted = true;
          setProfile(base);
          await dbService.upsertStudentProfile(userId, base);
        }
      }

      // Fetch JDs
      const dbJds = await dbService.fetchJobDescriptionsFromDb(userId);
      if (dbJds.length > 0) {
        setAllJDs(dbJds);
        setActiveJDState(dbJds[0]);
      } else {
        setAllJDs(DEFAULT_PRODUCTION_JDS);
        setActiveJDState(DEFAULT_PRODUCTION_JDS[0]);
      }

      // Fetch Applications
      const dbApps = await dbService.fetchApplicationsFromDb(userId);
      setApplications(dbApps);

      // Fetch Practice Sessions
      const dbPractice = await dbService.fetchPracticeSessionsFromDb(userId);
      setPracticeSessions(dbPractice);

      // Fetch Readiness Snapshots
      const dbSnaps = await dbService.fetchReadinessSnapshotsFromDb(userId);
      if (dbSnaps.length > 0) {
        setReadinessSnapshots(dbSnaps);
      }

      // Fetch Event Impact Logs
      const dbEvents = await dbService.fetchEventImpactLogsFromDb(userId);
      setEventImpactLog(dbEvents);

      // Fetch Email Logs
      const dbEmails = await dbService.fetchEmailLogsFromDb(userId);
      setEmailLogs(dbEmails);

      // Fetch Analyses
      const dbCv = await dbService.fetchCvAnalysisFromDb(userId);
      if (dbCv) setCvAnalysis(dbCv);

      const dbLinkedIn = await dbService.fetchLinkedInAnalysisFromDb(userId);
      if (dbLinkedIn) setLinkedInAnalysis(dbLinkedIn);

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Initialize Session listener
  useEffect(() => {
    authService.getSession().then(({ user }) => {
      if (user && !isDemoMode) {
        setCurrentAuthUser(user);
        setAuthStatus('authenticated');
        loadUserDataFromSupabase(user.id, user.email, user.name);
      } else {
        setAuthStatus('unauthenticated');
      }
    }).catch(() => {
      setAuthStatus('unauthenticated');
    });

    const sub = authService.onAuthStateChange((_event, session, authUser) => {
      if (authUser && !isDemoMode) {
        setCurrentAuthUser(authUser);
        setAuthStatus('authenticated');
        loadUserDataFromSupabase(authUser.id, authUser.email, authUser.name);
      } else if (!session && !isDemoMode) {
        setCurrentAuthUser(null);
        setAuthStatus('unauthenticated');
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [isDemoMode, loadUserDataFromSupabase]);

  // Auth Operations
  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await authService.signIn(email, password);
      setIsDemoMode(false);
      localStorage.removeItem(DEMO_MODE_FLAG);
      setCurrentAuthUser(user);
      setAuthStatus('authenticated');
      await loadUserDataFromSupabase(user.id, user.email, user.name);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (creds: AuthCredentials) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await authService.signUp(creds);
      setIsDemoMode(false);
      localStorage.removeItem(DEMO_MODE_FLAG);
      setCurrentAuthUser(user);
      setAuthStatus('authenticated');

      // Initialize base profile in persistent store
      const initialProfile = createBlankProductionProfile();
      initialProfile.id = user.id;
      initialProfile.name = user.name;
      initialProfile.email = user.email || '';
      initialProfile.college = creds.college || '';
      initialProfile.course = creds.course || '';
      initialProfile.education.institution = creds.college || '';
      initialProfile.education.degree = creds.course || '';
      initialProfile.education.course = creds.course || '';
      initialProfile.education.branch = creds.branch || '';
      initialProfile.onboardingCompleted = true;

      setProfile(initialProfile);
      await dbService.upsertStudentProfile(user.id, initialProfile);
      await dbService.upsertEducation(user.id, initialProfile.id, initialProfile.education);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setCurrentAuthUser(null);
    setAuthStatus('unauthenticated');
    setProfile(createBlankProductionProfile());
    setAllJDs(DEFAULT_PRODUCTION_JDS);
    setActiveJDState(DEFAULT_PRODUCTION_JDS[0]);
    setApplications([]);
    setPracticeSessions([]);
    setCvAnalysis(null);
    setLinkedInAnalysis(null);
    setEventImpactLog([]);
    setEmailLogs([]);
    setReadinessSnapshots([]);
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      throw new Error('Supabase Auth is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) {
      throw error;
    }
  };

  // 6. Controlled Demo Mode Switchers
  const enableDemoMode = () => {
    localStorage.setItem(DEMO_MODE_FLAG, 'true');
    setIsDemoMode(true);
    setProfile(AARAV_SHARMA_DEMO_PROFILE);
    setAllJDs(DEMO_JDS);
    setActiveJDState(DEMO_JDS[0]);
    setApplications(DEMO_APPLICATIONS);
    setPracticeSessions(DEMO_PRACTICE_SESSIONS);
    setCvAnalysis(DEMO_CV_ANALYSIS);
    setLinkedInAnalysis(DEMO_LINKEDIN_ANALYSIS);
    setReadinessSnapshots(DEMO_READINESS_SNAPSHOTS);
    setEventImpactLog(DEMO_EVENT_LOG);
  };

  const disableDemoMode = () => {
    localStorage.removeItem(DEMO_MODE_FLAG);
    setIsDemoMode(false);

    if (currentAuthUser && isSupabaseConfigured()) {
      loadUserDataFromSupabase(currentAuthUser.id, currentAuthUser.email, currentAuthUser.name);
    } else {
      setProfile(createBlankProductionProfile());
      setAllJDs(DEFAULT_PRODUCTION_JDS);
      setActiveJDState(DEFAULT_PRODUCTION_JDS[0]);
      setApplications([]);
      setPracticeSessions([]);
      setCvAnalysis(null);
      setLinkedInAnalysis(null);
      setEventImpactLog([]);
      setEmailLogs([]);
      setReadinessSnapshots([]);
    }
  };

  const resetProductionData = () => {
    localStorage.removeItem(DEMO_MODE_FLAG);
    setIsDemoMode(false);
    setProfile(createBlankProductionProfile());
    setAllJDs(DEFAULT_PRODUCTION_JDS);
    setActiveJDState(DEFAULT_PRODUCTION_JDS[0]);
    setApplications([]);
    setPracticeSessions([]);
    setCvAnalysis(null);
    setLinkedInAnalysis(null);
    setEventImpactLog([]);
    setEmailLogs([]);
    setReadinessSnapshots([]);
  };

  // 7. Traceability & Mutation Methods
  const logEventImpact = (eventType: string, sourcePillar: string, affected: string[], explanation: string) => {
    const newRecord: EventImpactRecord = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType,
      sourcePillar,
      affectedDimensions: affected,
      explanation,
    };
    setEventImpactLog((prev) => [newRecord, ...prev]);

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid) {
      dbService.saveEventImpactLogToDb(uid, profile.id, newRecord).catch(() => {});
    }
  };

  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      const uid = currentAuthUser?.id || prev.id;
      if (!isDemoMode && uid) {
        dbService.upsertStudentProfile(uid, next).catch((err) =>
          console.warn('Persist profile warning (safely stored locally):', err?.message || err)
        );
      }
      return next;
    });

    logEventImpact(
      'Profile Information Updated',
      'Pillar 1: Student Intelligence Profile',
      ['Profile Readiness', 'Overall Career Readiness'],
      'Updated student career profile fields.'
    );
  };

  const updateEducation = (edu: Partial<StudentProfile['education']>) => {
    setProfile((prev) => {
      const newEdu = { ...prev.education, ...edu };
      const next = { ...prev, education: newEdu };
      const uid = currentAuthUser?.id || prev.id;
      if (!isDemoMode && uid) {
        dbService.upsertEducation(uid, prev.id, newEdu).catch((err) =>
          console.warn('Persist education warning (safely stored locally):', err?.message || err)
        );
      }
      return next;
    });

    logEventImpact(
      'Academic Record Modified',
      'Pillar 2: Academic Intelligence',
      ['Academic Readiness', 'Deterministic Eligibility'],
      'Recomputed credit-weighted CGPA and updated eligibility criteria.'
    );
  };

  const addProject = (proj: Omit<StudentProfile['projects'][0], 'id'>) => {
    const tempId = `proj-${Date.now()}`;
    const newProj = { ...proj, id: tempId };

    setProfile((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
    }));

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid) {
      dbService.addProjectToDb(uid, profile.id, proj).then((dbId) => {
        setProfile((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === tempId ? { ...p, id: dbId } : p)),
        }));
      }).catch((err) => console.error('Failed to persist project:', err));
    }

    logEventImpact(
      `Project Recorded: "${proj.title}"`,
      'Pillar 1: Student Intelligence Profile',
      ['Skill Readiness', 'Role Fit', 'Profile Readiness'],
      `Registered portfolio project with Level ${proj.evidenceLevel} evidence.`
    );
  };

  const addSkill = (skill: Omit<StudentProfile['skills'][0], 'id'>) => {
    const tempId = `sk-${Date.now()}`;
    const newSkill = { ...skill, id: tempId };

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid) {
      dbService.addSkillToDb(uid, profile.id, skill).then((dbId) => {
        setProfile((prev) => ({
          ...prev,
          skills: prev.skills.map((s) => (s.id === tempId ? { ...s, id: dbId } : s)),
        }));
      }).catch((err) => console.error('Failed to persist skill:', err));
    }

    logEventImpact(
      `Skill Capability Added: ${skill.name}`,
      'Pillar 3: Career & Profile Intelligence',
      ['Skill Readiness', 'Role Fit'],
      `Registered Level ${skill.evidenceLevel} capability.`
    );
  };

  const setActiveJD = (jd: OpportunityJD) => {
    setActiveJDState(jd);
    logEventImpact(
      `Target Opportunity Set: ${jd.company} (${jd.title})`,
      'Pillar 4: JD & Opportunity Intelligence',
      ['Opportunity Alignment', 'Role Fit', 'Action Center'],
      `Evaluated requirements against ${jd.company}.`
    );
  };

  const addJD = (jd: OpportunityJD) => {
    setAllJDs((prev) => [jd, ...prev]);
    setActiveJDState(jd);

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid) {
      dbService.saveJobDescriptionToDb(uid, profile.id, jd).catch((err) =>
        console.error('Failed to persist JD:', err)
      );
    }

    logEventImpact(
      `New Job Description Added: ${jd.company}`,
      'Pillar 4: JD & Opportunity Intelligence',
      ['Opportunity Alignment', 'Role Fit'],
      'Parsed criteria and extracted skill requirements.'
    );
  };

  const updateApplicationStage = (appId: string, newStage: ApplicationRecord['stage'], note?: string) => {
    const now = new Date().toISOString();
    let updatedApp: ApplicationRecord | null = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const prevStage = app.stage;
        const newHistory = [...app.history, { stage: newStage, timestamp: now, comment: note }];
        const newEvent: ApplicationEvent = {
          id: `ev-app-${Date.now()}`,
          applicationId: app.id,
          previousStage: prevStage,
          newStage,
          eventType: 'Stage Transition',
          eventDate: now.slice(0, 10),
          notes: note || `Moved from ${prevStage} to ${newStage}`,
          created_at: now,
        };

        let healthCategory: ApplicationRecord['healthCategory'] = 'Healthy';
        let healthRationale = `Active in stage: ${newStage}.`;
        if (newStage === 'Selected') {
          healthCategory = 'Completed / Closed';
          healthRationale = 'Selection achieved! Application closed as successful offer.';
        } else if (newStage === 'Rejected' || newStage === 'Withdrawn') {
          healthCategory = 'Completed / Closed';
          healthRationale = `Application closed (${newStage}).`;
        } else if (newStage === 'Assessment Pending' || newStage === 'Interview Pending' || newStage === 'GD Pending') {
          healthCategory = 'Requires Attention';
          healthRationale = `Action required: ${newStage}. Practice targeted preparation in Pillar 8.`;
        }

        const modified: ApplicationRecord = {
          ...app,
          stage: newStage,
          stageUpdatedDate: now,
          healthCategory,
          healthRationale,
          history: newHistory,
          events: [...(app.events || []), newEvent],
        };
        updatedApp = modified;
        return modified;
      })
    );

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid && updatedApp) {
      const appRef: ApplicationRecord = updatedApp;
      dbService.updateApplicationStageInDb(
        uid,
        appId,
        newStage,
        appRef.healthCategory,
        appRef.healthRationale,
        note
      ).catch((err) => console.error('Failed to update application stage in DB:', err));
    }

    logEventImpact(
      `Application Stage Advanced: "${newStage}"`,
      'Pillar 7: Application Intelligence',
      ['Interview Readiness', 'Application Pipeline'],
      `Transitioned application stage to ${newStage}.`
    );
  };

  const addApplication = (appData: Omit<ApplicationRecord, 'id' | 'healthCategory' | 'healthRationale' | 'history' | 'stageUpdatedDate'>) => {
    const tempId = `app-${Date.now()}`;
    const now = new Date().toISOString();
    const initialEvent: ApplicationEvent = {
      id: `ev-app-${Date.now()}`,
      applicationId: tempId,
      previousStage: null,
      newStage: appData.stage,
      eventType: 'Application Created',
      eventDate: appData.appliedDate || now.slice(0, 10),
      notes: appData.notes || 'Recorded in application tracker',
      created_at: now,
    };

    const newApp: ApplicationRecord = {
      ...appData,
      id: tempId,
      applicationType: appData.applicationType || 'Off-Campus',
      stageUpdatedDate: now,
      healthCategory: 'Healthy',
      healthRationale: 'Application newly recorded in active tracking lifecycle.',
      history: [{ stage: appData.stage, timestamp: now, comment: 'Logged in tracker' }],
      events: [initialEvent],
    };

    setApplications((prev) => [newApp, ...prev]);

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid) {
      dbService.saveApplicationToDb(uid, profile.id, newApp).then((dbId) => {
        setApplications((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: dbId } : a))
        );
      }).catch((err) => console.error('Failed to persist application:', err));
    }

    logEventImpact(
      `Application Tracked: ${newApp.company} (${newApp.role})`,
      'Pillar 7: Application Intelligence',
      ['Application Funnel', 'Interview Readiness'],
      `Added ${newApp.company} to lifecycle tracker.`
    );
  };

  const recordPracticeSession = (sessionData: Omit<PracticeSession, 'id' | 'completedAt'>) => {
    const tempId = `prac-${Date.now()}`;
    const now = new Date().toISOString();
    const newSession: PracticeSession = {
      ...sessionData,
      id: tempId,
      completedAt: now,
    };

    setPracticeSessions((prev) => [newSession, ...prev]);

    const uid = currentAuthUser?.id || profile.id;
    if (!isDemoMode && uid) {
      dbService.savePracticeSessionToDb(uid, profile.id, newSession).then((dbId) => {
        setPracticeSessions((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: dbId } : s))
        );
      }).catch((err) => console.error('Failed to persist practice session:', err));
    }

    logEventImpact(
      `Practice Coach Session Evaluated: ${sessionData.category}`,
      'Pillar 8: Preparation Coach',
      ['Interview Readiness', 'Overall Career Readiness'],
      `Evaluated under ${sessionData.frameworkApplied}. Score: ${sessionData.evaluation?.scoreOutOf10 || 7}/10.`
    );
  };

  const reconcileDiscrepancy = (authoritativeValue: number) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        education: {
          ...prev.education,
          selfReportedCGPA: authoritativeValue,
          verifiedCGPA: authoritativeValue,
          discrepancyFlag: false,
          verificationStatus: 'verified' as const,
          provenance: 'verified' as const,
        },
      };

      if (!isDemoMode && currentAuthUser?.id && isSupabaseConfigured()) {
        dbService.upsertEducation(currentAuthUser.id, prev.id, next.education).catch((err) =>
          console.error('Failed to persist reconciled education:', err)
        );
      }

      return next;
    });

    logEventImpact(
      'Academic Discrepancy Reconciled by Student',
      'Pillar 2: Academic Intelligence',
      ['Academic Readiness', 'Deterministic Eligibility'],
      `Confirmed authoritative CGPA as ${authoritativeValue}.`
    );
  };

  const logEmailDispatch = (entry: EmailLogEntry) => {
    setEmailLogs((prev) => [entry, ...prev]);

    if (!isDemoMode && currentAuthUser?.id && isSupabaseConfigured()) {
      dbService.saveEmailLogToDb(currentAuthUser.id, profile.id, entry).catch((err) =>
        console.error('Failed to persist email log:', err)
      );
    }

    logEventImpact(
      `Report Activity Logged: "${entry.reportTitle}"`,
      'Cross-Product Layer: Report Center',
      ['Audit Register'],
      `Target recipient: ${entry.recipient} (${entry.status}).`
    );
  };

  const triggerCVAnalysis = async (customCvText?: string) => {
    setIsAiProcessing(true);
    setAiError(null);
    try {
      const text =
        customCvText ||
        `${profile.name || 'Candidate'} — ${profile.headline || 'Student'}\nEducation: ${profile.education.degree || 'Degree'} in ${profile.education.branch || 'Discipline'}, CGPA: ${profile.education.verifiedCGPA || profile.education.selfReportedCGPA || 'N/A'}\nExperience: ${profile.experiences.map((e) => `${e.role} at ${e.company} (${e.description})`).join('; ') || 'None recorded'}\nProjects: ${profile.projects.map((p) => `${p.title} (${p.description})`).join('; ') || 'None recorded'}\nSkills: ${profile.skills.map((s) => s.name).join(', ') || 'None recorded'}`;

      const res = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, cvText: text, activeJD }),
      });
      if (!res.ok) {
        throw new Error(`AI CV analysis failed: ${res.statusText}`);
      }
      const data: CVAnalysis = await res.json();
      setCvAnalysis(data);

      if (!isDemoMode && currentAuthUser?.id && isSupabaseConfigured()) {
        dbService.saveCvAnalysisToDb(currentAuthUser.id, profile.id, data).catch((err) =>
          console.error('Failed to persist CV analysis:', err)
        );
      }

      logEventImpact(
        'CV Triad Analysis Completed',
        'Pillar 5: CV Intelligence',
        ['CV Health', 'Three-Way Gaps', 'Action Center'],
        `Validated CV alignment against ${activeJD.company}.`
      );
    } catch (err: any) {
      console.error('Failed to trigger CV analysis:', err);
      setAiError(err.message || 'CV analysis request failed');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const triggerLinkedInAnalysis = async (customLinkedInData?: any) => {
    setIsAiProcessing(true);
    setAiError(null);
    try {
      const payload = customLinkedInData || {
        url: profile.linkedInUrl,
        headline: profile.headline,
        about: profile.about,
      };

      const res = await fetch('/api/ai/analyze-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, linkedInData: payload, activeJD }),
      });
      if (!res.ok) {
        throw new Error(`LinkedIn analysis failed: ${res.statusText}`);
      }
      const data: LinkedInAnalysis = await res.json();
      setLinkedInAnalysis(data);

      if (!isDemoMode && currentAuthUser?.id && isSupabaseConfigured()) {
        dbService.saveLinkedInAnalysisToDb(currentAuthUser.id, profile.id, data).catch((err) =>
          console.error('Failed to persist LinkedIn analysis:', err)
        );
      }

      logEventImpact(
        'LinkedIn Recruiter Visibility Audited',
        'Pillar 6: LinkedIn Intelligence',
        ['Visibility Gaps', 'Genuine Skill Gaps'],
        'Audited recruiter discoverability.'
      );
    } catch (err: any) {
      console.error('Failed to trigger LinkedIn analysis:', err);
      setAiError(err.message || 'LinkedIn audit request failed');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const clearCVAnalysis = () => {
    setCvAnalysis(null);
  };

  const clearLinkedInAnalysis = () => {
    setLinkedInAnalysis(null);
  };

  const uploadDocument = async (
    file: File,
    category: 'academic_transcript' | 'cv_resume' | 'jd_document' | 'certification_proof'
  ) => {
    const userId = currentAuthUser?.id || (isDemoMode ? 'demo-user-01' : 'student-local');
    return dbService.uploadDocumentToStorage(userId, profile.id, file, category);
  };

  const authState: AuthState = {
    status: isDemoMode ? 'authenticated' : authStatus,
    user: isDemoMode
      ? {
          id: 'demo-user-01',
          email: 'aarav.sharma@campus.edu',
          name: 'Aarav Sharma (Demo Persona)',
          role: 'student',
          authProvider: 'guest',
          createdAt: '2026-10-06T00:00:00Z',
        }
      : currentAuthUser,
    mode: isDemoMode ? 'demo' : 'production',
    isSupabaseConnected,
    error: authError,
  };

  return (
    <CareerSaathiContext.Provider
      value={{
        authState,
        authLoading,
        authError,
        isSupabaseConnected,
        isSchemaMissing,
        missingTables,
        refreshSchemaStatus,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isDemoMode,
        enableDemoMode,
        disableDemoMode,
        resetProductionData,
        profile,
        activeJD,
        allJDs,
        applications,
        practiceSessions,
        eventImpactLog,
        emailLogs,
        readiness,
        readinessSnapshots,
        actions,
        currentFitReport,
        cvAnalysis,
        linkedInAnalysis,
        isAiProcessing,
        aiError,
        updateProfile,
        updateEducation,
        addProject,
        addSkill,
        setActiveJD,
        addJD,
        updateApplicationStage,
        addApplication,
        recordPracticeSession,
        reconcileDiscrepancy,
        logEventImpact,
        logEmailDispatch,
        triggerCVAnalysis,
        triggerLinkedInAnalysis,
        clearCVAnalysis,
        clearLinkedInAnalysis,
        uploadDocument,
      }}
    >
      {children}
    </CareerSaathiContext.Provider>
  );
};

export const useCareerSaathi = () => {
  const context = useContext(CareerSaathiContext);
  if (!context) throw new Error('useCareerSaathi must be used within CareerSaathiProvider');
  return context;
};
