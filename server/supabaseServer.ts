import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve server-side environment variables (privileged)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isServerSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('placeholder') &&
    supabaseSecretKey &&
    supabaseSecretKey.trim() !== ''
  );
};

let serverClientInstance: SupabaseClient | null = null;

export const getServerSupabaseClient = (): SupabaseClient | null => {
  if (!isServerSupabaseConfigured()) {
    return null;
  }
  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serverClientInstance;
};

/**
 * Ensures the default storage bucket 'career-documents' is created and accessible.
 */
export async function ensureStorageBucketExists(): Promise<{ success: boolean; message: string }> {
  const client = getServerSupabaseClient();
  if (!client) {
    return { success: false, message: 'Server Supabase client not configured' };
  }

  try {
    const { data: buckets, error: listErr } = await client.storage.listBuckets();
    if (listErr) {
      return { success: false, message: `List buckets error: ${listErr.message}` };
    }

    const bucketName = 'career-documents';
    const exists = buckets?.some((b) => b.name === bucketName);

    if (!exists) {
      const { error: createErr } = await client.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });

      if (createErr && !createErr.message.includes('already exists')) {
        return { success: false, message: `Create bucket error: ${createErr.message}` };
      }
    }

    return { success: true, message: `Storage bucket '${bucketName}' is ready.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Unknown storage bucket error' };
  }
}

/**
 * Checks whether core tables exist in the Supabase schema cache.
 */
export async function checkDatabaseSchemaStatus(): Promise<{
  tablesExist: boolean;
  missingTables: string[];
  checkedTables: string[];
}> {
  const client = getServerSupabaseClient();
  if (!client) {
    return { tablesExist: false, missingTables: ['all'], checkedTables: [] };
  }

  const expectedTables = [
    'student_profiles',
    'career_preferences',
    'education',
    'academic_terms',
    'skills',
    'projects',
    'job_descriptions',
    'applications',
    'practice_sessions',
    'readiness_snapshots',
    'event_impact_logs',
    'documents',
  ];

  const missing: string[] = [];

  for (const table of expectedTables) {
    try {
      const { error } = await client.from(table).select('id').limit(1);
      if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
        missing.push(table);
      }
    } catch {
      missing.push(table);
    }
  }

  return {
    tablesExist: missing.length === 0,
    missingTables: missing,
    checkedTables: expectedTables,
  };
}
