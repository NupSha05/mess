import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Lock,
  Mail,
  User,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Loader2,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { COURSE_MAJOR_MAPPING, COMMON_COLLEGES, getMajorsForCourse } from '../../data/academicMapping';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signIn, signUp, resetPassword, enableDemoMode, authLoading, authError } = useCareerSaathi();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  // College, Course, and Branch MUST start completely empty per user requirements
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableMajors = course ? getMajorsForCourse(course) : [];

  const handleSignInAsDemo = () => {
    enableDemoMode();
    onClose();
  };

  const handleFillDemoCreds = () => {
    setEmail('demo@careersaathi.org');
    setPassword('demo123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (mode !== 'reset' && !password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (mode === 'signup' && !fullName) {
      setLocalError('Please enter your full name.');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUp({
          email,
          password,
          fullName,
          college: college.trim(),
          course: course.trim(),
          branch: branch.trim(),
        });
        setSuccessMsg('Account created successfully! Session established.');
        setTimeout(() => {
          onClose();
        }, 800);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMsg(`Password reset link dispatched to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication operation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-800/80 flex items-start justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {mode === 'signin' && 'Student Sign In'}
                {mode === 'signup' && 'Create Student Account'}
                {mode === 'reset' && 'Password Recovery'}
              </h3>
              <p className="text-xs text-slate-400">
                Persistent personal career intelligence platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {(localError || authError) && (
          <div className="mx-6 mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localError || authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          {/* Quick Dummy Account Action in Sign In Mode */}
          {mode === 'signin' && (
            <div className="mb-5 p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Dummy / Demo Account
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded font-medium">
                  Instant Test
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Want to test immediately without registering? Sign in with the verified demo account.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSignInAsDemo}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Demo Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoCreds}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  Fill Dummy Credentials
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shalini Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password *
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setLocalError(null);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-3 pt-1">
                {/* 1. College */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    College / University (Empty by default)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      list="common-colleges-list"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. SSM College of Engineering"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <datalist id="common-colleges-list">
                      {COMMON_COLLEGES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* 2. Course & Major Correct Mapping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Course / Degree
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={course}
                        onChange={(e) => {
                          const newCourse = e.target.value;
                          setCourse(newCourse);
                          // Reset branch when course changes to enforce correct mapping
                          setBranch('');
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">-- Select Course --</option>
                        {Object.keys(COURSE_MAJOR_MAPPING).map((cKey) => (
                          <option key={cKey} value={cKey}>
                            {cKey}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Major / Specialization
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                      {course && availableMajors.length > 0 ? (
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="">-- Select Major / Branch --</option>
                          {availableMajors.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          placeholder={course ? 'Enter specialization' : 'Select course first'}
                          disabled={!course}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                  ℹ️ Selected College, Course, and Major will be pre-filled inside your student profile. Other profile sections (projects, skills, resume) will start clean and unpopulated.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Create Student Account</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Send Password Reset Link</span>
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mode Toggle Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400 shrink-0">
          {mode === 'signin' && (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setLocalError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
              >
                Create one now
              </button>
            </span>
          )}
          {mode === 'signup' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setLocalError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
              >
                Sign in instead
              </button>
            </span>
          )}
          {mode === 'reset' && (
            <span>
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setLocalError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
              >
                Return to sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
