import React, { useState, useEffect } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Database,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export const DatabaseSchemaBanner: React.FC = () => {
  const { isSchemaMissing, missingTables, refreshSchemaStatus } = useCareerSaathi();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [migrationSql, setMigrationSql] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fetch migration SQL from backend endpoint
    fetch('/api/supabase/migration-sql')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sql) {
          setMigrationSql(data.sql);
        }
      })
      .catch(() => {});
  }, []);

  if (!isSchemaMissing || dismissed) {
    return null;
  }

  const handleCopySql = async () => {
    try {
      let sqlToCopy = migrationSql;
      if (!sqlToCopy) {
        const res = await fetch('/api/supabase/migration-sql');
        const data = await res.json();
        sqlToCopy = data.sql;
        setMigrationSql(data.sql);
      }

      if (sqlToCopy) {
        await navigator.clipboard.writeText(sqlToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Failed to copy migration SQL:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSchemaStatus();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  if (isCollapsed) {
    return (
      <div className="bg-amber-950/60 border-y border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-200">
          <Database className="w-4 h-4 text-amber-400" />
          <span>
            <strong>Local Storage Fallback Active</strong>: Supabase database tables pending creation ({missingTables.length} tables). All progress is preserved locally.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySql}
            className="text-xs bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied SQL' : 'Copy SQL'}
          </button>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-amber-400 hover:text-amber-300 p-1"
            title="Expand migration helper"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/30 text-slate-200 px-4 sm:px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 shrink-0 mt-0.5">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-amber-200">
                Supabase Tables Pending in Schema Cache
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                PGRST205 Resilient Local Mode
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Data Safely Preserved Locally
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Your Supabase Auth and Storage are connected. To enable cloud database synchronization, paste the initial SQL migration into your Supabase project's SQL editor. All student profiles, education, and readiness scores are currently preserved in your browser local storage.
            </p>
            {missingTables.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-400/90 font-mono flex-wrap">
                <span className="text-slate-400">Tables missing in cache:</span>
                {missingTables.slice(0, 5).map((tbl) => (
                  <span key={tbl} className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
                    {tbl}
                  </span>
                ))}
                {missingTables.length > 5 && (
                  <span className="text-slate-400">+{missingTables.length - 5} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleCopySql}
            className="text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'SQL Copied!' : 'Copy Migration SQL'}</span>
          </button>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Supabase Dashboard</span>
          </a>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            title="Check if tables are now visible in schema cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Verify</span>
          </button>

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="Collapse banner"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="Dismiss notice for this session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
