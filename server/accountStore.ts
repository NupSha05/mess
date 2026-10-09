import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'careersaathi_accounts.json');
const PROFILES_FILE = path.join(DATA_DIR, 'careersaathi_profiles.json');
const USER_DATA_FILE = path.join(DATA_DIR, 'careersaathi_userdata.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Error creating data directory:', e);
}

export interface StoredUserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  college?: string;
  branch?: string;
  role: 'student' | 'job_seeker';
  createdAt: string;
  lastSignInAt?: string;
}

// In-memory cache
let accountsCache: StoredUserAccount[] = [];
let profilesCache: Record<string, any> = {};
let userDataCache: Record<string, Record<string, any>> = {};

function loadAccounts(): StoredUserAccount[] {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const content = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
      accountsCache = JSON.parse(content);
      return accountsCache;
    }
  } catch (err) {
    console.warn('Error reading accounts file:', err);
  }
  return accountsCache;
}

function persistAccounts(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accountsCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error persisting accounts file:', err);
  }
}

function loadProfiles(): Record<string, any> {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const content = fs.readFileSync(PROFILES_FILE, 'utf8');
      profilesCache = JSON.parse(content);
      return profilesCache;
    }
  } catch (err) {
    console.warn('Error reading profiles file:', err);
  }
  return profilesCache;
}

function persistProfiles(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profilesCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error persisting profiles file:', err);
  }
}

function loadUserData(): Record<string, Record<string, any>> {
  try {
    if (fs.existsSync(USER_DATA_FILE)) {
      const content = fs.readFileSync(USER_DATA_FILE, 'utf8');
      userDataCache = JSON.parse(content);
      return userDataCache;
    }
  } catch (err) {
    console.warn('Error reading userdata file:', err);
  }
  return userDataCache;
}

function persistUserData(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(userDataCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error persisting userdata file:', err);
  }
}

// Initial load
loadAccounts();
loadProfiles();
loadUserData();

export const AccountStore = {
  signUp(payload: {
    email: string;
    password: string;
    fullName: string;
    college?: string;
    branch?: string;
    role?: 'student' | 'job_seeker';
  }): { user: StoredUserAccount; profile: any } {
    loadAccounts();
    loadProfiles();

    const cleanEmail = payload.email.trim().toLowerCase();
    const existingIndex = accountsCache.findIndex(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    let account: StoredUserAccount;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing account credentials & metadata
      account = {
        ...accountsCache[existingIndex],
        password: payload.password,
        name: payload.fullName.trim() || accountsCache[existingIndex].name,
        college: payload.college || accountsCache[existingIndex].college,
        branch: payload.branch || accountsCache[existingIndex].branch,
        lastSignInAt: now,
      };
      accountsCache[existingIndex] = account;
    } else {
      const newId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      account = {
        id: newId,
        email: cleanEmail,
        password: payload.password,
        name: payload.fullName.trim() || cleanEmail.split('@')[0],
        college: payload.college || '',
        branch: payload.branch || 'Computer Science & Engineering',
        role: payload.role || 'student',
        createdAt: now,
        lastSignInAt: now,
      };
      accountsCache.push(account);
    }

    persistAccounts();

    // Check or initialize profile
    let profile = profilesCache[account.id];
    if (!profile) {
      profile = {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: '',
        college: account.college || '',
        headline: `${account.branch || 'Computer Science & Engineering'} Student`,
        about: '',
        careerStage: 'Final Year Student',
        onboardingCompleted: true,
        linkedInUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        education: {
          id: `edu-${account.id}`,
          institution: account.college || '',
          degree: 'B.Tech',
          branch: account.branch || 'Computer Science & Engineering',
          startYear: 2022,
          expectedGraduationYear: 2026,
          degreeStatus: 'pursuing',
          gradingSystem: 'cgpa',
          totalSemesters: 8,
          termsCompleted: 6,
          currentSemester: 7,
          selfReportedCGPA: 8.5,
          verifiedCGPA: 8.5,
          terms: [],
        },
        preferences: {
          targetRoles: ['Software Development Engineer', 'Full Stack Developer'],
          preferredLocations: ['Bengaluru', 'Hyderabad', 'Remote'],
          minAcceptableCTC: '₹12,00,000',
          preferredWorkType: 'Hybrid',
          willingToRelocate: true,
        },
        skills: [],
        projects: [],
        experiences: [],
        certifications: [],
        readinessScores: {
          academic: 85,
          profile: 80,
          skill: 78,
          opportunity: 82,
          interview: 75,
          overall: 80,
        },
      };
      profilesCache[account.id] = profile;
      persistProfiles();
    } else {
      // Ensure onboardingCompleted is set to true and account details are preserved
      profile.onboardingCompleted = true;
      if (account.name && !profile.name) profile.name = account.name;
      if (account.college && !profile.college) profile.college = account.college;
      if (account.college && !profile.education?.institution) {
        profile.education = { ...(profile.education || {}), institution: account.college };
      }
      persistProfiles();
    }

    return { user: account, profile };
  },

  signIn(email: string, password: string): { user: StoredUserAccount; profile: any } {
    loadAccounts();
    loadProfiles();

    const cleanEmail = email.trim().toLowerCase();
    const account = accountsCache.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    if (!account) {
      throw new Error(`No account found matching "${email}". Please verify your email or click "Create Student Account".`);
    }

    if (account.password !== password) {
      throw new Error('Incorrect password. Please verify and re-enter your password.');
    }

    account.lastSignInAt = new Date().toISOString();
    persistAccounts();

    let profile = profilesCache[account.id];
    if (!profile) {
      profile = {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: '',
        college: account.college || '',
        headline: `${account.branch || 'Computer Science & Engineering'} Student`,
        about: '',
        careerStage: 'Final Year Student',
        onboardingCompleted: true,
        linkedInUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        education: {
          id: `edu-${account.id}`,
          institution: account.college || '',
          degree: 'B.Tech',
          branch: account.branch || 'Computer Science & Engineering',
          startYear: 2022,
          expectedGraduationYear: 2026,
          totalSemesters: 8,
          termsCompleted: 6,
          currentSemester: 7,
          degreeStatus: 'pursuing',
          gradingSystem: 'cgpa',
          selfReportedCGPA: 8.5,
          verifiedCGPA: 8.5,
          terms: [],
        },
        preferences: {
          targetRoles: ['Software Development Engineer', 'Full Stack Developer'],
          preferredLocations: ['Bengaluru', 'Hyderabad', 'Remote'],
          minAcceptableCTC: '₹12,00,000',
          preferredWorkType: 'Hybrid',
          willingToRelocate: true,
        },
        skills: [],
        projects: [],
        experiences: [],
        certifications: [],
        readinessScores: {
          academic: 85,
          profile: 80,
          skill: 78,
          opportunity: 82,
          interview: 75,
          overall: 80,
        },
      };
      profilesCache[account.id] = profile;
      persistProfiles();
    } else {
      // Guarantee all necessary structures exist
      profile.onboardingCompleted = true;
      if (!profile.name && account.name) profile.name = account.name;
      if (!profile.college && account.college) profile.college = account.college;
      if (!profile.education) {
        profile.education = {
          id: `edu-${account.id}`,
          institution: account.college || '',
          degree: 'B.Tech',
          branch: account.branch || 'Computer Science & Engineering',
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
      if (!profile.education.institution && account.college) {
        profile.education.institution = account.college;
      }
      if (!Array.isArray(profile.education.terms)) profile.education.terms = [];
      if (!Array.isArray(profile.skills)) profile.skills = [];
      if (!Array.isArray(profile.projects)) profile.projects = [];
      if (!Array.isArray(profile.experiences)) profile.experiences = [];
      if (!Array.isArray(profile.certifications)) profile.certifications = [];
      persistProfiles();
    }

    return { user: account, profile };
  },

  getProfile(userId: string): any {
    loadProfiles();
    loadAccounts();
    let profile = profilesCache[userId] || null;
    if (profile) {
      if (!Array.isArray(profile.education?.terms)) {
        if (!profile.education) profile.education = {};
        profile.education.terms = [];
      }
      if (!Array.isArray(profile.skills)) profile.skills = [];
      if (!Array.isArray(profile.projects)) profile.projects = [];
      if (!Array.isArray(profile.experiences)) profile.experiences = [];
      if (!Array.isArray(profile.certifications)) profile.certifications = [];
      profile.onboardingCompleted = true;
    } else {
      // If profile not yet created but account exists, synthesize it
      const account = accountsCache.find((a) => a.id === userId);
      if (account) {
        profile = {
          id: account.id,
          name: account.name,
          email: account.email,
          phone: '',
          college: account.college || '',
          headline: `${account.branch || 'Computer Science'} Student`,
          about: '',
          careerStage: 'Final Year Student',
          onboardingCompleted: true,
          linkedInUrl: '',
          githubUrl: '',
          portfolioUrl: '',
          education: {
            id: `edu-${account.id}`,
            institution: account.college || '',
            degree: 'B.Tech',
            branch: account.branch || 'Computer Science & Engineering',
            startYear: 2022,
            expectedGraduationYear: 2026,
            degreeStatus: 'pursuing',
            gradingSystem: 'cgpa',
            totalSemesters: 8,
            termsCompleted: 6,
            currentSemester: 7,
            selfReportedCGPA: 8.5,
            verifiedCGPA: 8.5,
            terms: [],
          },
          preferences: {
            targetRoles: ['Software Development Engineer', 'Full Stack Developer'],
            preferredLocations: ['Bengaluru', 'Hyderabad', 'Remote'],
            minAcceptableCTC: '₹12,00,000',
            preferredWorkType: 'Hybrid',
            willingToRelocate: true,
          },
          skills: [],
          projects: [],
          experiences: [],
          certifications: [],
          readinessScores: {
            academic: 85,
            profile: 80,
            skill: 78,
            opportunity: 82,
            interview: 75,
            overall: 80,
          },
        };
        profilesCache[account.id] = profile;
        persistProfiles();
      }
    }
    return profile;
  },

  saveProfile(userId: string, profileData: any): any {
    loadProfiles();
    const existing = profilesCache[userId] || {};
    const merged = {
      ...existing,
      ...profileData,
      id: userId,
      onboardingCompleted: true,
      education: {
        ...(existing.education || {}),
        ...(profileData.education || {}),
        terms: profileData.education?.terms || existing.education?.terms || [],
      },
      preferences: {
        ...(existing.preferences || {}),
        ...(profileData.preferences || {}),
      },
      readinessScores: {
        ...(existing.readinessScores || {}),
        ...(profileData.readinessScores || {}),
      },
      skills: Array.isArray(profileData.skills) ? profileData.skills : (existing.skills || []),
      projects: Array.isArray(profileData.projects) ? profileData.projects : (existing.projects || []),
      experiences: Array.isArray(profileData.experiences) ? profileData.experiences : (existing.experiences || []),
      certifications: Array.isArray(profileData.certifications) ? profileData.certifications : (existing.certifications || []),
      updated_at: new Date().toISOString(),
    };
    profilesCache[userId] = merged;
    persistProfiles();

    // If profile includes name/college, update account registry too
    if (profileData.name || profileData.college) {
      loadAccounts();
      const acc = accountsCache.find((a) => a.id === userId);
      if (acc) {
        if (profileData.name) acc.name = profileData.name;
        if (profileData.college) acc.college = profileData.college;
        persistAccounts();
      }
    }

    return merged;
  },

  getUserData(userId: string, key: string): any {
    loadUserData();
    return userDataCache[userId]?.[key] || null;
  },

  saveUserData(userId: string, key: string, data: any): void {
    loadUserData();
    if (!userDataCache[userId]) {
      userDataCache[userId] = {};
    }
    userDataCache[userId][key] = data;
    persistUserData();
  },

  getAccountByEmail(email: string): StoredUserAccount | null {
    loadAccounts();
    const cleanEmail = email.trim().toLowerCase();
    return accountsCache.find((a) => a.email.toLowerCase() === cleanEmail) || null;
  },

  getAccountById(userId: string): StoredUserAccount | null {
    loadAccounts();
    return accountsCache.find((a) => a.id === userId) || null;
  },
};
