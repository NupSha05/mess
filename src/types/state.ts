import { StudentProfile, OpportunityJD, ApplicationRecord, PracticeSession, EmailLogEntry, EventImpactRecord } from './index';
import { ReadinessDimensions, ReadinessSnapshot, NextBestAction } from './index';
import { CVAnalysis, LinkedInAnalysis } from './index';
import { AuthState } from './auth';

/**
 * Clean architectural state boundary interfaces
 */

// 1. Persistent User Application Data (the persistent source of truth)
export interface PersistentApplicationData {
  profile: StudentProfile;
  jds: OpportunityJD[];
  activeJdId: string | null;
  applications: ApplicationRecord[];
  practiceSessions: PracticeSession[];
  emailLogs: EmailLogEntry[];
  eventImpactLog: EventImpactRecord[];
}

// 2. Derived Deterministic Intelligence (computed pure functions of persistent data)
export interface DerivedDeterministicState {
  readiness: ReadinessDimensions;
  readinessSnapshots: ReadinessSnapshot[];
  currentFitReport: import('./index').RoleFitReport | null;
  actions: NextBestAction[];
  termMetrics: {
    currentCalculatedCGPA: number;
    totalCompletedCredits: number;
    totalTermsCompleted: number;
    remainingTerms: number;
    trajectory: 'Rising' | 'Steady' | 'Declining';
  };
}

// 3. AI Analysis State (asynchronous LLM/RAG analyses, with proper status & error states)
export interface AsyncOperationState<T> {
  data: T | null;
  status: 'idle' | 'loading' | 'completed' | 'error';
  error: string | null;
  lastRunAt: string | null;
}

export interface AiAnalysisState {
  cvAnalysis: AsyncOperationState<CVAnalysis>;
  linkedInAnalysis: AsyncOperationState<LinkedInAnalysis>;
  jdParsing: AsyncOperationState<OpportunityJD>;
  isProcessing: boolean;
}

// 4. UI State
export interface UIState {
  activeTab: string;
  isAskSaathiOpen: boolean;
  isDemoModeActive: boolean;
  notification: {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null;
}
