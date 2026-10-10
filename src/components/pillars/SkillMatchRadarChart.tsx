import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { StudentProfile, OpportunityJD, RoleFitReport } from '../../types';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SkillMatchRadarChartProps {
  profile: StudentProfile;
  activeJD: OpportunityJD;
  currentFitReport: RoleFitReport;
}

interface SkillRadarDatum {
  skill: string;
  fullName: string;
  userLevel: number; // 0 - 100
  requiredLevel: number; // 0 - 100
  userEvidenceTier: string;
  requiredEvidenceTier: string;
  status: 'Exceeds' | 'Meets' | 'Gap';
  gapValue: number;
  category: string;
}

export const SkillMatchRadarChart: React.FC<SkillMatchRadarChartProps> = ({
  profile,
  activeJD,
  currentFitReport,
}) => {
  const [viewMode, setViewMode] = useState<'jd-skills' | 'core-pillars'>('jd-skills');
  const [selectedSkill, setSelectedSkill] = useState<SkillRadarDatum | null>(null);

  // Helper to map evidence level (0-4) to percentage score (0-100)
  const evidenceToScore = (level: number): number => {
    switch (level) {
      case 4: return 100;
      case 3: return 85;
      case 2: return 65;
      case 1: return 40;
      default: return 15;
    }
  };

  const scoreToEvidenceLabel = (score: number): string => {
    if (score >= 95) return 'Level 4: Mastery';
    if (score >= 80) return 'Level 3: Production / Internship';
    if (score >= 60) return 'Level 2: Hands-On Project';
    if (score >= 35) return 'Level 1: Coursework';
    return 'Level 0: Unverified';
  };

  // Build the radar dataset
  const radarData: SkillRadarDatum[] = useMemo(() => {
    const userSkills = profile.skills || [];

    // Helper: Find user skill evidence level
    const findUserSkillLevel = (skillName: string): number => {
      const q = skillName.toLowerCase().trim();
      const match = userSkills.find((s) => {
        const sName = s.name.toLowerCase().trim();
        return (
          sName === q ||
          sName.includes(q) ||
          q.includes(sName) ||
          (q.includes('dsa') && sName.includes('data structure')) ||
          (q.includes('data structure') && sName.includes('dsa')) ||
          (q.includes('db') && sName.includes('database')) ||
          (q.includes('sql') && (sName.includes('sql') || sName.includes('postgres')))
        );
      });

      if (match) {
        return match.evidenceLevel;
      }

      // Check projects tech stack
      const inProjects = profile.projects?.some((p) =>
        p.techStack?.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()))
      );
      if (inProjects) return 2;

      // Check experiences
      const inExp = profile.experiences?.some((e) =>
        e.skillsUsed?.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()))
      );
      if (inExp) return 3;

      // Check CV text
      if (profile.resumeText && profile.resumeText.toLowerCase().includes(q)) {
        return 1;
      }

      return 0;
    };

    if (viewMode === 'core-pillars') {
      // 6 Standard Computer Science & Software Engineering Core Pillars
      const pillars = [
        { label: 'DSA & Algorithms', full: 'Data Structures & Algorithms', req: 85, cat: 'Core CS' },
        { label: 'System Design', full: 'System Design & Scalability', req: 75, cat: 'Architecture' },
        { label: 'Backend & APIs', full: 'Backend Architecture & REST/GraphQL', req: 85, cat: 'Languages & Frameworks' },
        { label: 'Databases & SQL', full: 'Relational & NoSQL Databases', req: 80, cat: 'Databases' },
        { label: 'DevOps & Cloud', full: 'Cloud, Docker & Deployment', req: 70, cat: 'System & Cloud' },
        { label: 'Frontend & UI', full: 'Frontend Frameworks & UI Architecture', req: 65, cat: 'Languages & Frameworks' },
      ];

      return pillars.map((p) => {
        const lvl = findUserSkillLevel(p.label);
        const userScore = evidenceToScore(lvl);
        const gap = userScore - p.req;
        const status: 'Exceeds' | 'Meets' | 'Gap' =
          gap >= 10 ? 'Exceeds' : gap >= -5 ? 'Meets' : 'Gap';

        return {
          skill: p.label,
          fullName: p.full,
          userLevel: userScore,
          requiredLevel: p.req,
          userEvidenceTier: scoreToEvidenceLabel(userScore),
          requiredEvidenceTier: scoreToEvidenceLabel(p.req),
          status,
          gapValue: gap,
          category: p.cat,
        };
      });
    }

    // Default: 'jd-skills' mode based on activeJD
    const mustHaves = activeJD.mustHaveSkills || [];
    const preferred = activeJD.preferredSkills || [];
    const goodToHave = activeJD.goodToHaveSkills || [];

    const candidates: Array<{ name: string; req: number; cat: string }> = [];

    mustHaves.forEach((s) => candidates.push({ name: s, req: 85, cat: 'Must-Have Requirement' }));
    preferred.forEach((s) => candidates.push({ name: s, req: 70, cat: 'Preferred Capability' }));
    goodToHave.forEach((s) => candidates.push({ name: s, req: 50, cat: 'Good-To-Have Skill' }));

    // If activeJD has very few skills, fill up to 6 with common role skills
    if (candidates.length < 5) {
      const fallbackPillars = [
        { name: 'Problem Solving & DSA', req: 80, cat: 'Core Engineering' },
        { name: 'Relational Databases (SQL)', req: 75, cat: 'Core Engineering' },
        { name: 'Modern Web Frameworks', req: 70, cat: 'Core Engineering' },
        { name: 'System Architecture', req: 70, cat: 'Core Engineering' },
        { name: 'Git & Version Control', req: 65, cat: 'Tooling' },
      ];
      for (const fb of fallbackPillars) {
        if (!candidates.some((c) => c.name.toLowerCase().includes(fb.name.toLowerCase()))) {
          candidates.push(fb);
        }
        if (candidates.length >= 6) break;
      }
    }

    // Take top 6 - 7 skills for ideal visual radar display
    const selected = candidates.slice(0, 7);

    return selected.map((item) => {
      // Abbreviate label slightly for compact radar labels
      let shortLabel = item.name;
      if (shortLabel.length > 18) {
        shortLabel = shortLabel
          .replace('Fundamentals', '')
          .replace('Architecture', 'Arch')
          .replace('Development', 'Dev')
          .trim();
        if (shortLabel.length > 16) {
          shortLabel = shortLabel.slice(0, 15) + '…';
        }
      }

      const lvl = findUserSkillLevel(item.name);
      const userScore = evidenceToScore(lvl);
      const gap = userScore - item.req;
      const status: 'Exceeds' | 'Meets' | 'Gap' =
        gap >= 10 ? 'Exceeds' : gap >= -5 ? 'Meets' : 'Gap';

      return {
        skill: shortLabel,
        fullName: item.name,
        userLevel: userScore,
        requiredLevel: item.req,
        userEvidenceTier: scoreToEvidenceLabel(userScore),
        requiredEvidenceTier: scoreToEvidenceLabel(item.req),
        status,
        gapValue: gap,
        category: item.cat,
      };
    });
  }, [viewMode, profile, activeJD]);

  // Summary Metrics
  const totalSkills = radarData.length;
  const meetingCount = radarData.filter((d) => d.status === 'Meets' || d.status === 'Exceeds').length;
  const gapCount = radarData.filter((d) => d.status === 'Gap').length;
  const avgCoverage = Math.round(
    radarData.reduce((acc, curr) => acc + Math.min(100, (curr.userLevel / Math.max(1, curr.requiredLevel)) * 100), 0) /
      Math.max(1, totalSkills)
  );

  // Custom Radar Tooltip
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SkillRadarDatum;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-xs max-w-xs text-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-indigo-300">{data.fullName}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                data.status === 'Exceeds'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : data.status === 'Meets'
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {data.status === 'Exceeds' ? '★ Exceeds' : data.status === 'Meets' ? '✓ Meets' : '⚠ Skill Gap'}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span>Your Evidence Level:</span>
              </span>
              <strong className="text-indigo-400">{data.userLevel}%</strong>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">{data.userEvidenceTier}</div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Target Role Requirement:</span>
              </span>
              <strong className="text-rose-400">{data.requiredLevel}%</strong>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">{data.requiredEvidenceTier}</div>

            <div className="pt-1.5 border-t border-slate-800 text-[10px] flex justify-between items-center text-slate-300">
              <span>Category: {data.category}</span>
              <span className={data.gapValue >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {data.gapValue >= 0 ? `+${data.gapValue}% Surplus` : `${data.gapValue}% Deficit`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5 text-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Interactive Competency Radar</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Skill Match Radar: Current Level vs. Target Job Role</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares your verified internal evidence levels directly against the expectations for{' '}
            <strong className="text-white">{activeJD.title || 'Target Role'}</strong> at{' '}
            <strong className="text-indigo-300">{activeJD.company || 'Target Organization'}</strong>.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('jd-skills')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'jd-skills'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Target Role Skills</span>
            </button>
            <button
              onClick={() => setViewMode('core-pillars')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'core-pillars'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Core SWE Pillars</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Requirement Coverage</span>
          <span className="text-xl font-black text-indigo-400 mt-0.5 block">{avgCoverage}%</span>
          <span className="text-[10px] text-slate-500 font-medium">Weighted capability index</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Skills Meeting Bar</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5 block">
            {meetingCount} / {totalSkills}
          </span>
          <span className="text-[10px] text-emerald-500/80 font-medium">Cleared for screening</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Competency Gaps</span>
          <span className="text-xl font-black text-amber-400 mt-0.5 block">{gapCount}</span>
          <span className="text-[10px] text-amber-500/80 font-medium">Needs evidence/project</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Role</span>
          <span className="text-sm font-bold text-white mt-1 block truncate" title={activeJD.title}>
            {activeJD.title || 'Software Engineer'}
          </span>
          <span className="text-[10px] text-purple-300 truncate block">
            {activeJD.company || 'Target Organization'}
          </span>
        </div>
      </div>

      {/* Main Chart + Side Legend & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Canvas (Takes 7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[340px]">
          <div className="w-full h-80 sm:h-88">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  stroke="#475569"
                />
                {/* User Current Level (Indigo/Cyan polygon) */}
                <Radar
                  name="Your Current Skill Level"
                  dataKey="userLevel"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                {/* Target Role Requirement (Rose polygon) */}
                <Radar
                  name="Target Role Requirement"
                  dataKey="requiredLevel"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="#f43f5e"
                  fillOpacity={0.2}
                />
                <Tooltip content={<CustomRadarTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  formatter={(value) => (
                    <span className="text-slate-300 font-semibold text-[11px] mx-1">{value}</span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-500 text-center mt-1">
            Hover over points to inspect precise evidence levels and gap margins.
          </div>
        </div>

        {/* Side Dimension Breakdown List (Takes 5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Competency Gap Breakdown</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {meetingCount}/{totalSkills} Cleared
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {radarData.map((item, idx) => {
              const isSelected = selectedSkill?.skill === item.skill;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSkill(isSelected ? null : item)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 text-[11px] truncate" title={item.fullName}>
                      {item.fullName}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        item.status === 'Exceeds'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'Meets'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status === 'Exceeds'
                        ? '+ Surplus'
                        : item.status === 'Meets'
                        ? '✓ Aligned'
                        : `${item.gapValue}% Gap`}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {/* Visual Comparison Progress Bar */}
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden relative">
                      {/* Target Required Marker (Thin vertical tick) */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                        style={{ left: `${item.requiredLevel}%` }}
                        title={`Requirement: ${item.requiredLevel}%`}
                      />
                      {/* User Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.gapValue >= 0 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.userLevel)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {item.userLevel}% / {item.requiredLevel}%
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.userEvidenceTier.split(':')[0]}</span>
                    <span>Req: {item.requiredEvidenceTier.split(':')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10.5px] text-indigo-300 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-400 mt-0.5" />
            <span>
              <strong>Actionable Tip:</strong> To close gaps in red/amber dimensions, upload a project repository or certification in Pillar 1 or 2 to promote evidence level from Level 1 to Level 2+.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
