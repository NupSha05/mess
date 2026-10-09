import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { AuthCredentials, AuthUser } from '../types/auth';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthSessionResult {
  user: AuthUser | null;
  session: Session | null;
}

const ACCOUNTS_STORAGE_KEY = 'careersaathi_accounts_registry';
const ACTIVE_SESSION_STORAGE_KEY = 'careersaathi_active_user_session';

interface StoredAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  college?: string;
  branch?: string;
  role: 'student' | 'job_seeker';
  createdAt: string;
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccount(acc: StoredAccount): void {
  try {
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex((a) => a.email.toLowerCase() === acc.email.toLowerCase());
    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...acc };
    } else {
      accounts.push(acc);
    }
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Error saving local account:', e);
  }
}

/**
 * Maps Supabase User to Career Saathi AuthUser
 */
export function mapSupabaseUserToAuthUser(user: User): AuthUser {
  const meta = user.user_metadata || {};
  const name = (meta.full_name as string) || (user.email ? user.email.split('@')[0] : 'Student');
  return {
    id: user.id,
    email: user.email || '',
    name,
    role: (meta.role as 'student' | 'job_seeker') || 'student',
    authProvider: 'supabase',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
  };
}

export const authService = {
  /**
   * Check if authentication service is available
   */
  isAvailable(): boolean {
    return true;
  },

  /**
   * Get the current active session
   */
  async getSession(): Promise<AuthSessionResult> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          return {
            user: mapSupabaseUserToAuthUser(session.user),
            session,
          };
        }
      } catch {
        // Fall back to local active session
      }
    }

    // Check local active session
    try {
      const storedRaw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (storedRaw) {
        const user: AuthUser = JSON.parse(storedRaw);
        return { user, session: null };
      }
    } catch {
      // ignore
    }

    return { user: null, session: null };
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();
    let supabaseError: any = null;

    // 1. First attempt authoritative server-side sign-in
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.user) {
          const authUser: AuthUser = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role || 'student',
            authProvider: 'server_database',
            createdAt: result.user.createdAt,
            lastSignInAt: result.user.lastSignInAt || new Date().toISOString(),
          };

          // Also save in local registry
          saveStoredAccount({
            id: authUser.id,
            email: cleanEmail,
            password,
            name: authUser.name,
            college: result.user.college || '',
            branch: result.user.branch || '',
            role: authUser.role,
            createdAt: authUser.createdAt,
          });

          // Cache profile in localStorage for fast retrieval
          if (result.profile) {
            try {
              localStorage.setItem(`careersaathi_profile_${authUser.id}`, JSON.stringify(result.profile));
            } catch (e) {
              console.warn('Profile cache notice:', e);
            }
          }

          localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(authUser));
          return authUser;
        }
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error && !errorData.error.includes('No account found')) {
          // If explicit error (like incorrect password), throw that error
          throw new Error(errorData.error);
        }
      }
    } catch (serverErr: any) {
      if (serverErr.message && (serverErr.message.includes('password') || serverErr.message.includes('credentials'))) {
        throw serverErr;
      }
      // Continue to Supabase / local fallback if network or route error
    }

    // 2. Attempt Supabase Auth if configured
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
          const authUser = mapSupabaseUserToAuthUser(data.user);
          saveStoredAccount({
            id: authUser.id,
            email: cleanEmail,
            password,
            name: authUser.name,
            role: authUser.role,
            createdAt: authUser.createdAt,
          });
          localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(authUser));
          return authUser;
        }
        supabaseError = error;
      } catch (err: any) {
        supabaseError = err;
      }
    }

    // 3. Resilient local account verification fallback
    const accounts = getStoredAccounts();
    const localAccount = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (localAccount) {
      if (localAccount.password !== password) {
        throw new Error('Incorrect password. Please verify and re-enter your password.');
      }

      const authUser: AuthUser = {
        id: localAccount.id,
        email: localAccount.email,
        name: localAccount.name,
        role: localAccount.role || 'student',
        authProvider: 'local_persistent',
        createdAt: localAccount.createdAt,
        lastSignInAt: new Date().toISOString(),
      };

      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(authUser));
      return authUser;
    }

    if (supabaseError) {
      throw new Error(supabaseError.message || 'Authentication failed. Please verify your email and password.');
    }

    throw new Error(`No account found matching "${email}". Please verify your email address or click "Create Student Account".`);
  },

  /**
   * Register a new student account
   */
  async signUp(creds: AuthCredentials): Promise<AuthUser> {
    const cleanEmail = creds.email.trim().toLowerCase();
    const name = creds.fullName?.trim() || cleanEmail.split('@')[0] || 'Student';
    let userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const supabase = getSupabaseClient();
    let serverProfile: any = null;

    // 1. Authoritative server database signup
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: creds.password,
          fullName: name,
          college: creds.college || '',
          branch: creds.branch || '',
          role: creds.role || 'student',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.user) {
          userId = result.user.id;
          serverProfile = result.profile;
        }
      }
    } catch (serverErr) {
      console.warn('Server signup notice (continuing with offline-resilient store):', serverErr);
    }

    // 2. Supabase registration if configured
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: creds.password,
          options: {
            data: {
              full_name: name,
              college: creds.college || '',
              branch: creds.branch || '',
              role: creds.role || 'student',
            },
          },
        });

        if (!error && data.user) {
          userId = data.user.id;
        }
      } catch (err) {
        console.warn('Supabase remote signUp notice (stored in persistent local account):', err);
      }
    }

    const storedAcc: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password: creds.password,
      name,
      college: creds.college || '',
      branch: creds.branch || '',
      role: creds.role || 'student',
      createdAt: new Date().toISOString(),
    };

    saveStoredAccount(storedAcc);

    if (serverProfile) {
      try {
        localStorage.setItem(`careersaathi_profile_${userId}`, JSON.stringify(serverProfile));
      } catch (e) {
        // ignore
      }
    }

    const authUser: AuthUser = {
      id: userId,
      email: cleanEmail,
      name,
      role: creds.role || 'student',
      authProvider: (supabase && isSupabaseConfigured()) ? 'supabase' : 'server_database',
      createdAt: storedAcc.createdAt,
      lastSignInAt: storedAcc.createdAt,
    };

    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(authUser));
    return authUser;
  },

  /**
   * Sign out current user session
   */
  async signOut(): Promise<void> {
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  },

  /**
   * Request password reset email
   */
  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectTo || window.location.origin,
      });
      if (error) throw error;
      return;
    }

    // Local account check
    const accounts = getStoredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!acc) {
      throw new Error(`No account registered with email "${email}".`);
    }
  },

  /**
   * Update password for an active session
   */
  async updatePassword(newPassword: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    }

    try {
      const activeRaw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (activeRaw) {
        const user: AuthUser = JSON.parse(activeRaw);
        const accounts = getStoredAccounts();
        const acc = accounts.find((a) => a.id === user.id);
        if (acc) {
          acc.password = newPassword;
          saveStoredAccount(acc);
        }
      }
    } catch {
      // ignore
    }
  },

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null, authUser: AuthUser | null) => void
  ) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const authUser = session?.user ? mapSupabaseUserToAuthUser(session.user) : null;
        callback(event, session, authUser);
      });

      return {
        unsubscribe: () => subscription.unsubscribe(),
      };
    }

    return { unsubscribe: () => {} };
  },
};
