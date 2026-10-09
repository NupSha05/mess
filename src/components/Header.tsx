import React, { useState } from 'react';
import { useCareerSaathi } from '../context/CareerSaathiContext';
import { useTheme } from '../context/ThemeContext';
import { AuthModal } from './auth/AuthModal';
import {
  Sparkles,
  TrendingUp,
  HelpCircle,
  Beaker,
  Trash2,
  Database,
  LogIn,
  LogOut,
  UserCheck,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  onOpenAskSaathi: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAskSaathi }) => {
  const {
    profile,
    readiness,
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    resetProductionData,
    authState,
    isSupabaseConnected,
    signOut,
  } = useCareerSaathi();

  const { theme, toggleTheme } = useTheme();

  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAuthenticated = authState.status === 'authenticated' && !isDemoMode;

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Product Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Career Saathi AI
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Career Intelligence Platform
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Persistent personal evidence repository & deterministic intelligence
                </p>
              </div>
            </div>

            {/* Quick Context & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mode Banner / Indicator */}
              {isDemoMode ? (
                <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs">
                  <Beaker className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-semibold hidden md:inline">Demo Mode: Aarav Sharma</span>
                  <button
                    onClick={disableDemoMode}
                    className="ml-1 text-[11px] underline text-amber-400 hover:text-amber-200 cursor-pointer font-medium"
                    title="Return to clean production workspace"
                  >
                    Exit Demo
                  </button>
                </div>
              ) : (
                <button
                  onClick={enableDemoMode}
                  className="hidden lg:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Load the Aarav Sharma reference demo dataset"
                >
                  <Beaker className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Demo Dataset</span>
                </button>
              )}

              {/* Authentication Button or Student Profile Pill */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-slate-200 max-w-[110px] truncate">
                    {authState.user?.name || profile.name || 'Student'}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-slate-400 hover:text-rose-400 transition cursor-pointer ml-1"
                    title="Sign Out of Supabase Workspace"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  title="Sign In or Register with Supabase"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Overall Career Readiness Score Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowScoreInfo(!showScoreInfo)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 hover:border-indigo-400 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                  title="Click for Career Readiness calculation breakdown"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-medium">Readiness:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {readiness.overallScore}/100
                  </span>
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                </button>

                {/* Explainability Popover */}
                {showScoreInfo && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-50 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Readiness Breakdown
                      </span>
                      <button
                        onClick={() => setShowScoreInfo(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Academic Readiness (20%)</span>
                        <span className="font-semibold text-emerald-400">
                          {readiness.academicReadiness}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Profile Completeness (20%)</span>
                        <span className="font-semibold text-emerald-400">
                          {readiness.profileReadiness}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Skill & Evidence Depth (25%)</span>
                        <span className="font-semibold text-emerald-400">
                          {readiness.skillReadiness}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Opportunity Alignment (15%)</span>
                        <span className="font-semibold text-emerald-400">
                          {readiness.opportunityReadiness}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Interview Preparation (20%)</span>
                        <span className="font-semibold text-emerald-400">
                          {readiness.interviewReadiness}%
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 italic">
                      Calculated deterministically from verified evidence and completed sessions. Never hallucinated.
                    </p>
                  </div>
                )}
              </div>

              {/* Color Theme Switcher (Light / Dark) */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Color Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden md:inline">Dark</span>
                  </>
                )}
              </button>

              {/* Ask Career Saathi Floating Trigger */}
              <button
                onClick={onOpenAskSaathi}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Saathi</span>
              </button>

              {/* Clear Production Workspace Action */}
              {!isDemoMode && (
                <div className="relative">
                  <button
                    onClick={() => setShowModeConfirm(!showModeConfirm)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition cursor-pointer"
                    title="Reset workspace to clean slate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {showModeConfirm && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 text-xs space-y-2">
                      <p className="text-slate-300">
                        Reset production workspace to clean baseline? This clears custom entries.
                      </p>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setShowModeConfirm(false)}
                          className="px-2 py-1 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            resetProductionData();
                            setShowModeConfirm(false);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                        >
                          Reset Clean
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
