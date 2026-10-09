import React, { useState } from 'react';
import { CareerSaathiProvider, useCareerSaathi } from './context/CareerSaathiContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { CommandCenter } from './components/pillars/CommandCenter';
import { Pillar1Profile } from './components/pillars/Pillar1Profile';
import { Pillar2Academics } from './components/pillars/Pillar2Academics';
import { Pillar3CareerIntelligence } from './components/pillars/Pillar3CareerIntelligence';
import { Pillar4OpportunityJD } from './components/pillars/Pillar4OpportunityJD';
import { Pillar5CVIntelligence } from './components/pillars/Pillar5CVIntelligence';
import { Pillar6LinkedInIntelligence } from './components/pillars/Pillar6LinkedInIntelligence';
import { Pillar7Applications } from './components/pillars/Pillar7Applications';
import { Pillar8PracticeCoach } from './components/pillars/Pillar8PracticeCoach';
import { Pillar9Readiness } from './components/pillars/Pillar9Readiness';
import { ActionCenterView } from './components/crossproduct/ActionCenterView';
import { ReportCenterView } from './components/crossproduct/ReportCenterView';
import { AskCareerSaathiDrawer } from './components/crossproduct/AskCareerSaathiDrawer';
import { RAGKnowledgeBaseView } from './components/crossproduct/RAGKnowledgeBaseView';
import { AuthLandingView } from './components/auth/AuthLandingView';
import { Loader2, Shield } from 'lucide-react';

function WorkspaceLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('command-center');
  const [isAskSaathiOpen, setIsAskSaathiOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenter setActiveTab={setActiveTab} onOpenAskSaathi={() => setIsAskSaathiOpen(true)} />;
      case 'pillar-1-profile':
      case 'pillar-2-academics':
        return <Pillar1Profile />;
      case 'pillar-3-career':
        return <Pillar3CareerIntelligence />;
      case 'pillar-4-opportunity':
        return <Pillar4OpportunityJD />;
      case 'pillar-5-cv':
        return <Pillar5CVIntelligence />;
      case 'pillar-6-linkedin':
        return <Pillar6LinkedInIntelligence />;
      case 'pillar-7-applications':
        return <Pillar7Applications />;
      case 'pillar-8-practice':
        return <Pillar8PracticeCoach />;
      case 'pillar-9-readiness':
        return <Pillar9Readiness />;
      case 'action-center':
        return <ActionCenterView setActiveTab={setActiveTab} />;
      case 'report-center':
        return <ReportCenterView />;
      case 'rag-knowledge-base':
        return <RAGKnowledgeBaseView />;
      default:
        return <CommandCenter setActiveTab={setActiveTab} onOpenAskSaathi={() => setIsAskSaathiOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header onOpenAskSaathi={() => setIsAskSaathiOpen(true)} />

      {/* 9 Pillars & Cross-Product Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveTab()}
      </main>

      {/* Grounded AI Assistant Drawer */}
      <AskCareerSaathiDrawer
        isOpen={isAskSaathiOpen}
        onClose={() => setIsAskSaathiOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-[11px] text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Career Saathi AI • Persistent Personal Career Intelligence Platform</span>
          <div className="flex items-center gap-3">
            <span>Deterministic Reasoning Engine</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('rag-knowledge-base')}
              className="text-slate-500 hover:text-indigo-400 transition underline cursor-pointer"
              title="Internal Policy & Framework Documents (Auditors / Admin)"
            >
              Internal Knowledge Base & Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RootApp() {
  const { authState, authLoading, profile, isDemoMode } = useCareerSaathi();

  // 1. Authenticating / restoring session state
  if (authLoading && !isDemoMode && authState.status === 'authenticating') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Connecting to Career Saathi Intelligence...</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">Restoring Supabase authenticated session</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state (when not in demo mode)
  if (!isDemoMode && authState.status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Header onOpenAskSaathi={() => {}} />
        <main className="flex-1">
          <AuthLandingView />
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-[11px] text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>Career Saathi AI • Persistent Personal Career Intelligence Platform</span>
            <span>Deterministic Intelligence Engine</span>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Authenticated (or Demo Mode active)
  return <WorkspaceLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <CareerSaathiProvider>
        <RootApp />
      </CareerSaathiProvider>
    </ThemeProvider>
  );
}
