// Authentication and Session Types
export type AuthStatus = 'unauthenticated' | 'authenticated' | 'authenticating';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'job_seeker';
  authProvider: 'supabase' | 'local' | 'guest' | 'server_database' | 'local_persistent';
  createdAt: string;
  lastSignInAt?: string;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  mode: 'production' | 'demo';
  sessionToken?: string;
  isSupabaseConnected: boolean;
  error?: string | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
  fullName?: string;
  college?: string;
  course?: string;
  branch?: string;
  role?: 'student' | 'job_seeker';
}
