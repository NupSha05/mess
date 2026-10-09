import React, { useState } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface AskCareerSaathiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  isFallback?: boolean;
  ragFrameworkApplied?: string;
}

const QUICK_QUESTIONS = [
  'How is my role fit score calculated for my target opportunity?',
  'Am I eligible under deterministic academic criteria?',
  'Which skill gap should I prioritize to increase my Readiness Index?',
  'What are the critical three-way gaps between my profile, CV, and target JD?',
  'Will I definitely get selected for campus placement?', // Critical thinking test: refusal of unsupported certainty
  'Why did my readiness score change recently?',
];

export const AskCareerSaathiDrawer: React.FC<AskCareerSaathiDrawerProps> = ({ isOpen, onClose }) => {
  const { profile, activeJD, readiness, currentFitReport, cvAnalysis, linkedInAnalysis } = useCareerSaathi();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: 'assistant',
      text: profile.name
        ? `Hello ${profile.name.split(' ')[0]}! I am Career Saathi AI. I have context of your academic records, registered projects, and target opportunity (${activeJD?.company || 'None selected'}). How can I assist your career preparation today?`
        : `Hello! I am Career Saathi AI. I have context of your active target opportunity (${activeJD?.company || 'None selected'}) and evidence repository. How can I assist your career preparation today?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const studentContext = {
        personal: {
          name: profile.name,
          college: profile.college,
          careerStage: profile.careerStage,
        },
        academics: {
          currentCGPA: profile.education.verifiedCGPA || profile.education.selfReportedCGPA,
          termsCompleted: profile.education.termsCompleted || (profile.education.terms?.length ?? 0),
          totalTerms: profile.education.totalSemesters,
          discrepancyFlag: profile.education.discrepancyFlag,
        },
        skills: (profile.skills || []).map((s) => ({ name: s.name, level: s.evidenceLevel, proof: s.supportingEvidence })),
        projects: (profile.projects || []).map((p) => ({ title: p.title, stack: p.techStack, level: p.evidenceLevel })),
        experiences: (profile.experiences || []).map((e) => ({ role: e.role, company: e.company, metrics: e.impactMetrics })),
        readiness: {
          overall: readiness.overallScore,
          academic: readiness.academicReadiness,
          profile: readiness.profileReadiness,
          skill: readiness.skillReadiness,
          opportunity: readiness.opportunityReadiness,
          interview: readiness.interviewReadiness,
        },
        cvGaps: cvAnalysis?.gaps ? cvAnalysis.gaps.map((g) => ({ skill: g.skillOrCapability, type: g.gapType })) : [],
        linkedInVisibilityGaps: linkedInAnalysis?.visibilityGaps || [],
      };

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          studentContext,
          currentJD: activeJD,
          chatHistory: messages,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'No answer generated.',
          isFallback: data.isFallback,
          ragFrameworkApplied: data.ragFrameworkApplied,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Encountered temporary network communication error. Stored career state remains completely safe.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-white text-sm">Ask Career Saathi</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Grounded in Your State
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Context: {profile.name} • {activeJD.company} ({activeJD.title})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-800/40 border-b border-slate-800/60 overflow-x-auto scrollbar-none flex gap-2">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/40 text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[11px] font-bold ${
                  msg.role === 'user'
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {msg.text}
                <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-indigo-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>RAG Grounding: {msg.ragFrameworkApplied ? `System B (${msg.ragFrameworkApplied})` : 'System B Frameworks'}</span>
                  </span>
                  {msg.isFallback && (
                    <span className="italic text-slate-400">Deterministic fallback mode</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing student evidence & opportunity requirements...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1.5 focus-within:border-indigo-500">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything regarding your readiness, eligibility, or gaps..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 pt-2">
            <span>Grounding: NITK 8.40 CGPA • SDE-1 Profile</span>
            <span>Refuses unsupported certainty</span>
          </div>
        </form>
      </div>
    </div>
  );
};
