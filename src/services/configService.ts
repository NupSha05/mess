/**
 * Career Saathi AI - Centralized Infrastructure Configuration & Validation Service
 * Validates required environment variables and services at application startup.
 * Enforces fail-loud reporting for missing infrastructure configurations.
 */

export interface InfrastructureConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  hasSupabaseUrl: boolean;
  hasSupabaseKey: boolean;
  isValid: boolean;
  missingVariables: string[];
  aiServiceAvailable: boolean;
  environment: 'development' | 'production' | 'test';
}

export interface SystemDiagnosticReport {
  timestamp: string;
  config: InfrastructureConfig;
  status: 'healthy' | 'configuration_error' | 'degraded';
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Validates and extracts client environment configuration.
 * Never logs or exposes raw secrets.
 */
export function validateClientConfiguration(): InfrastructureConfig {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const supabasePublishableKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const isUrlValid = Boolean(
    supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'))
  );

  const isKeyValid = Boolean(
    supabasePublishableKey &&
    !supabasePublishableKey.includes('placeholder') &&
    supabasePublishableKey.length > 10
  );

  const missingVariables: string[] = [];
  if (!isUrlValid) missingVariables.push('VITE_SUPABASE_URL');
  if (!isKeyValid) missingVariables.push('VITE_SUPABASE_PUBLISHABLE_KEY');

  const isValid = isUrlValid && isKeyValid;

  return {
    supabaseUrl,
    supabasePublishableKey,
    hasSupabaseUrl: isUrlValid,
    hasSupabaseKey: isKeyValid,
    isValid,
    missingVariables,
    aiServiceAvailable: true, // Express proxy handles Gemini server-side
    environment: (import.meta.env.MODE as any) || 'development',
  };
}

/**
 * Generates an end-to-end diagnostic report of infrastructure readiness.
 */
export function getDiagnosticReport(): SystemDiagnosticReport {
  const config = validateClientConfiguration();
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!config.hasSupabaseUrl) {
    errors.push('Missing or invalid VITE_SUPABASE_URL in client environment.');
    recommendations.push(
      'Set VITE_SUPABASE_URL in your .env file with your project URL (e.g., https://your-project.supabase.co).'
    );
  }

  if (!config.hasSupabaseKey) {
    errors.push('Missing or invalid VITE_SUPABASE_PUBLISHABLE_KEY in client environment.');
    recommendations.push(
      'Set VITE_SUPABASE_PUBLISHABLE_KEY (or anon key) in your .env file from your Supabase dashboard.'
    );
  }

  let status: SystemDiagnosticReport['status'] = 'healthy';
  if (errors.length > 0) {
    status = 'configuration_error';
  } else if (warnings.length > 0) {
    status = 'degraded';
  }

  return {
    timestamp: new Date().toISOString(),
    config,
    status,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Checks server health via central API.
 */
export async function checkServerInfrastructure(): Promise<{
  serverOnline: boolean;
  hasApiKey: boolean;
  hasSupabaseServer: boolean;
  ragDocsCount: number;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check returned non-200');
    const data = await res.json();
    return {
      serverOnline: true,
      hasApiKey: !!data.hasApiKey,
      hasSupabaseServer: !!data.hasSupabaseServer,
      ragDocsCount: typeof data.ragDocsCount === 'number' ? data.ragDocsCount : 0,
    };
  } catch {
    return {
      serverOnline: false,
      hasApiKey: false,
      hasSupabaseServer: false,
      ragDocsCount: 0,
    };
  }
}
