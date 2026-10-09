import React, { useState, useEffect } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  MessageSquareCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
  RotateCw,
  Timer,
  Play,
  Pause,
  Target,
  BrainCircuit,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { PracticeEvaluation, PracticeSession } from '../../types';

interface QuestionBankItem {
  id: string;
  category: 'Aptitude' | 'Technical' | 'Group Discussion (GD)' | 'Case Interview' | 'Personal Interview';
  framework: string;
  question: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  reason: string;
  source: string;
  referenceIdealStructure: string;
}

const QUESTION_BANK: QuestionBankItem[] = [
  {
    id: 'qb-star-01',
    category: 'Personal Interview',
    framework: 'STAR (Situation, Task, Action, Result)',
    question: 'Describe a situation where a software project or academic assignment you were leading ran behind schedule. How did you realign priorities and deliver?',
    difficulty: 'Intermediate',
    reason: 'Evaluates accountability, task triage, and structured execution in engineering workflows.',
    source: 'Behavioral Competency Matrix (SDE-1)',
    referenceIdealStructure: 'State the specific deadline constraint (Situation) -> Define your direct ownership (Task) -> Articulate specific scope pruning or profiling actions (Action) -> Quantify final delivery on-time outcome (Result).',
  },
  {
    id: 'qb-tech-01',
    category: 'Technical',
    framework: 'Concept → Explanation → Example → Application',
    question: 'How do database transactions maintain ACID compliance, specifically isolation levels between Read Committed and Serializable?',
    difficulty: 'Advanced',
    reason: 'Target engineering roles require deep command of concurrent systems and storage consistency.',
    source: 'Core Relational DB Requirements',
    referenceIdealStructure: 'Define concurrency phenomena like dirty reads and phantom reads -> Contrast locking vs MVCC mechanisms -> Provide concrete e-commerce ledger example -> State performance trade-offs for scaling.',
  },
  {
    id: 'qb-case-01',
    category: 'Case Interview',
    framework: 'Problem → Analysis → Options → Recommendation',
    question: 'During peak morning traffic, an API gateway begins returning HTTP 504 Gateway Timeouts to 15% of mobile users. Formulate your triage and mitigation plan.',
    difficulty: 'Intermediate',
    reason: 'Tests structured diagnostic decomposition under system stress.',
    source: 'Distributed Architecture Assessment',
    referenceIdealStructure: 'Isolate upstream vs downstream saturation -> Hypothesize connection pool exhaustion or unindexed lock contention -> Present immediate circuit-breaker vs cache-warming alternatives -> Recommend staged rollout and post-mortem telemetry.',
  },
  {
    id: 'qb-gd-01',
    category: 'Group Discussion (GD)',
    framework: 'Perspective → Structured Argument → Nuance / Counter-balance → Consensus',
    question: 'Should early-career engineers prioritize full-stack breadth across modern frameworks, or deep specialization in low-level systems programming?',
    difficulty: 'Foundation',
    reason: 'Evaluates structured perspective articulation, balancing trade-offs, and collegiate discussion building.',
    source: 'Campus Placement GD Framework',
    referenceIdealStructure: 'Acknowledge rapid product agility of full-stack foundations -> Highlight durable longevity of systems fundamentals -> Propose a T-shaped progression model -> Conclude with career-stage synthesis.',
  },
  {
    id: 'qb-apt-01',
    category: 'Aptitude',
    framework: 'Premise → Analytical Formulation → Step-by-Step Logic → Verification',
    question: 'A distributed queue processes 1,200 events per minute. Worker nodes process 25 events per second each. If worker failure rate is 20%, what is the minimum worker count required to prevent backlog growth?',
    difficulty: 'Intermediate',
    reason: 'Evaluates quantitative translation of throughput constraints into capacity sizing.',
    source: 'Technical Assessment Aptitude Rubric',
    referenceIdealStructure: 'Convert incoming load to seconds (1,200 / 60 = 20 events/sec) -> Calculate effective worker throughput accounting for 20% failure (25 * 0.8 = 20 events/sec) -> Conclude 1 active worker minimum, plus N+1 redundancy recommended.',
  },
];

export const Pillar8PracticeCoach: React.FC = () => {
  const {
    activeJD,
    applications,
    practiceSessions,
    recordPracticeSession,
    readiness,
  } = useCareerSaathi();

  // Selected State
  const [selectedCategory, setSelectedCategory] = useState<'Aptitude' | 'Technical' | 'Group Discussion (GD)' | 'Case Interview' | 'Personal Interview'>('Personal Interview');
  const [selectedMode, setSelectedMode] = useState<'Practice' | 'Timed Practice' | 'Targeted Weakness Practice'>('Practice');

  // Active Question
  const [activeQuestionItem, setActiveQuestionItem] = useState<QuestionBankItem>(QUESTION_BANK[0]);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Timer State (for Timed Practice)
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Latest Evaluation
  const [latestEvaluation, setLatestEvaluation] = useState<PracticeEvaluation | null>(
    practiceSessions && practiceSessions.length > 0 ? practiceSessions[0]?.evaluation || null : null
  );

  // Restore draft answer from localStorage if available
  useEffect(() => {
    const draftKey = `cs_draft_${activeQuestionItem.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setUserAnswer(savedDraft);
    } else {
      setUserAnswer('');
    }
  }, [activeQuestionItem.id]);

  // Persist draft on edit
  const handleAnswerChange = (val: string) => {
    setUserAnswer(val);
    localStorage.setItem(`cs_draft_${activeQuestionItem.id}`, val);
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0 && selectedMode === 'Timed Practice') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, selectedMode]);

  // Stage-Aware Recommendation from Active Applications
  const interviewPendingApp = applications.find(
    (a) => a.stage === 'Interview Pending' || a.stage === 'Assessment Pending' || a.stage === 'GD Pending'
  );

  const stageRecommendedCategory = interviewPendingApp
    ? interviewPendingApp.stage === 'Assessment Pending'
      ? 'Aptitude'
      : interviewPendingApp.stage === 'GD Pending'
      ? 'Group Discussion (GD)'
      : 'Personal Interview'
    : null;

  const handleSelectQuestion = (q: QuestionBankItem) => {
    setActiveQuestionItem(q);
    setSelectedCategory(q.category);
    setTimerSeconds(q.category === 'Aptitude' ? 120 : 180);
    setIsTimerRunning(false);
    setLatestEvaluation(null);
    setEvalError(null);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    setEvalError(null);
    setIsTimerRunning(false);

    try {
      const res = await fetch('/api/ai/evaluate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestionItem.question,
          answer: userAnswer.trim(),
          category: selectedCategory,
          targetRole: activeJD?.title || 'Software Development Engineer',
          rubricFramework: activeQuestionItem.framework,
        }),
      });

      if (!res.ok) {
        throw new Error(`Evaluation endpoint responded with status ${res.status}`);
      }

      const evaluation: PracticeEvaluation = await res.json();
      setLatestEvaluation(evaluation);

      // Persist practice session
      recordPracticeSession({
        category: selectedCategory,
        mode: selectedMode,
        frameworkApplied: activeQuestionItem.framework,
        targetRole: activeJD?.title || 'Software Development Engineer',
        opportunityId: activeJD?.id,
        question: activeQuestionItem.question,
        questionContext: {
          category: activeQuestionItem.category,
          reason: activeQuestionItem.reason,
          source: activeQuestionItem.source,
          difficulty: activeQuestionItem.difficulty,
          framework: activeQuestionItem.framework,
        },
        studentAnswer: userAnswer.trim(),
        evaluation,
        status: 'completed',
      });

      // Clear draft
      localStorage.removeItem(`cs_draft_${activeQuestionItem.id}`);
    } catch (err: any) {
      console.error('Practice evaluation error:', err);
      setEvalError('AI evaluation temporarily unavailable. Your answer has been saved and can be evaluated again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <MessageSquareCode className="w-4 h-4" />
              <span>Pillar 8 • Preparation Intelligence & AI Practice Coach</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Targeted Interview Coaching & STAR Rubric Feedback
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Stage-aware practice calibrated to your target opportunity. The student must formulate authentic responses—sample answers are never pre-seeded.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Context:</span>
              <span className="font-semibold text-white">
                {activeJD?.title ? `${activeJD.title} @ ${activeJD.company}` : 'General Role Preparation'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage-Aware Preparation Alert if Application Pending */}
      {interviewPendingApp && stageRecommendedCategory && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <div className="font-bold text-white">
                Stage-Aware Preparation Signal: {interviewPendingApp.company} ({interviewPendingApp.stage})
              </div>
              <p className="text-slate-300">
                Your application for <strong className="text-white">{interviewPendingApp.company}</strong> is currently in{' '}
                <span className="text-amber-300 font-semibold">{interviewPendingApp.stage}</span>. We recommend prioritizing{' '}
                <strong className="text-indigo-300">{stageRecommendedCategory}</strong> practice sessions.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const matched = QUESTION_BANK.find((q) => q.category === stageRecommendedCategory);
              if (matched) handleSelectQuestion(matched);
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition"
          >
            Switch to Recommended
          </button>
        </div>
      )}

      {/* Mode & Category Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Mode:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['Practice', 'Timed Practice', 'Targeted Weakness Practice'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    selectedMode === m ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Timed Mode Widget */}
          {selectedMode === 'Timed Practice' && (
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-white text-sm">{formatTimer(timerSeconds)}</span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 text-slate-300 hover:text-white transition"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Question Selector Carousel */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Practice Challenge (5 Frameworks Supported):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {QUESTION_BANK.map((qb) => (
              <button
                key={qb.id}
                onClick={() => handleSelectQuestion(qb)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeQuestionItem.id === qb.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block mb-1">
                    {qb.category}
                  </span>
                  <p className="text-xs line-clamp-2 text-slate-200">{qb.question}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{qb.difficulty}</span>
                  <span>{qb.framework.split('(')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Question & Answer Submission Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        {/* Question Context Header */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {activeQuestionItem.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                Difficulty: {activeQuestionItem.difficulty}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Rubric: <strong className="text-indigo-300">{activeQuestionItem.framework}</strong>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            "{activeQuestionItem.question}"
          </h2>

          <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
            <p>
              <strong className="text-slate-300">Why this question?</strong> {activeQuestionItem.reason}
            </p>
            <p>
              <strong className="text-slate-300">Source:</strong> {activeQuestionItem.source}
            </p>
          </div>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <label className="font-semibold text-slate-300">
                Your Answer (Formulate authentic response according to the rubric):
              </label>
              <span className="text-slate-500 text-[11px] font-mono">
                {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={7}
              required
              value={userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Structure your answer here. For behavioral questions, follow Situation -> Task -> Action -> Result. Sample answers are never pre-seeded so you can genuinely practice."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {evalError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{evalError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500 italic">
              Answers are evaluated server-side using Gemini AI and structured rubric frameworks.
            </p>

            <button
              type="submit"
              disabled={isEvaluating || !userAnswer.trim()}
              className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              {isEvaluating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating STAR Rubrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Answer for AI Evaluation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Evaluation Results Card (Only Shown After Submission) */}
      {latestEvaluation && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evaluation Report • AI Practice Coach</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">Objective Assessment & Feedback</h3>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
                <span className="text-2xl font-black text-white">{latestEvaluation.scoreOutOf10}/10</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  latestEvaluation.overallVerdict === 'Strong'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : latestEvaluation.overallVerdict === 'Satisfactory'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {latestEvaluation.overallVerdict}
              </span>
            </div>
          </div>

          {/* 4 Rubric Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(latestEvaluation.rubricBreakdown || {}).map(([key, rubric]) => {
              const label =
                key === 'correctnessAndTechnicalDepth'
                  ? 'Technical Depth'
                  : key === 'structureAndFrameworkAdherence'
                  ? 'Structure Adherence'
                  : key === 'communicationAndClarity'
                  ? 'Communication Clarity'
                  : 'Role Relevance';

              return (
                <div key={key} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">{label}</span>
                    <span className="font-mono font-bold text-indigo-400">{rubric.score}/10</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{rubric.feedback}</p>
                </div>
              );
            })}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What Went Well:
              </h4>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {latestEvaluation.highlightedStrengths?.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> What Could Improve:
              </h4>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {latestEvaluation.pinpointedWeaknesses?.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reference Ideal Structure (Revealed ONLY after submission) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold">
              <BookOpen className="w-4 h-4" />
              <span>Reference Framework / Ideal Answer Structure:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {latestEvaluation.idealAnswerStructure || activeQuestionItem.referenceIdealStructure}
            </p>
          </div>

          {/* Follow-up / Next Adaptive Challenge */}
          {latestEvaluation.followUpQuestion && (
            <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">
                  Adaptive Follow-Up Question:
                </span>
                <p className="text-white font-medium mt-0.5">"{latestEvaluation.followUpQuestion}"</p>
              </div>
              <button
                onClick={() => {
                  setActiveQuestionItem((prev) => ({
                    ...prev,
                    id: `qb-followup-${Date.now()}`,
                    question: latestEvaluation.followUpQuestion,
                    reason: 'Adaptive deep-dive based on your previous answer.',
                  }));
                  setUserAnswer('');
                  setLatestEvaluation(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold whitespace-nowrap cursor-pointer transition flex items-center gap-1"
              >
                <span>Practice Follow-Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
