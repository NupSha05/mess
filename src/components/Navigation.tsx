import React from 'react';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Target,
  Briefcase,
  FileText,
  Linkedin,
  Send,
  MessageSquareCode,
  LineChart,
  CheckSquare,
  FileDown,
  BookOpen,
} from 'lucide-react';

export type TabType =
  | 'command-center'
  | 'pillar-1-profile'
  | 'pillar-2-academics'
  | 'pillar-3-career'
  | 'pillar-4-opportunity'
  | 'pillar-5-cv'
  | 'pillar-6-linkedin'
  | 'pillar-7-applications'
  | 'pillar-8-practice'
  | 'pillar-9-readiness'
  | 'action-center'
  | 'report-center'
  | 'rag-knowledge-base';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'command-center' as TabType, label: 'Command Center', icon: LayoutDashboard, badge: 'Cockpit' },
    { id: 'pillar-1-profile' as TabType, label: '1. Profile & Academics', icon: User, subtitle: 'Credentials & Evidence' },
    { id: 'pillar-3-career' as TabType, label: '2. Career & Skills', icon: Target, subtitle: 'Evidence Levels 0-4' },
    { id: 'pillar-4-opportunity' as TabType, label: '3. JD & Role Fit', icon: Briefcase, subtitle: 'Rules + Semantic' },
    { id: 'pillar-5-cv' as TabType, label: '4. CV Intelligence', icon: FileText, subtitle: '3-Way Gaps' },
    { id: 'pillar-6-linkedin' as TabType, label: '5. LinkedIn Intel', icon: Linkedin, subtitle: 'Recruiter Visibility' },
    { id: 'pillar-7-applications' as TabType, label: '6. Applications', icon: Send, subtitle: 'Lifecycle Funnel' },
    { id: 'pillar-8-practice' as TabType, label: '7. Practice Coach', icon: MessageSquareCode, subtitle: 'STAR Rubrics' },
    { id: 'pillar-9-readiness' as TabType, label: '8. Readiness Intel', icon: LineChart, subtitle: 'Event Impact' },
    { id: 'action-center' as TabType, label: 'Action Center', icon: CheckSquare, badge: 'Prioritized' },
    { id: 'report-center' as TabType, label: 'Profile Analysis & Export', icon: FileDown, subtitle: 'Mail & Audit' },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
