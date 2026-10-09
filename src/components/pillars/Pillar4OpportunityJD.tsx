import React, { useState, useRef } from 'react';
import { useCareerSaathi } from '../../context/CareerSaathiContext';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  MapPin,
  Clock,
  Layers,
  FileText,
  FileCheck,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { OpportunityJD } from '../../types';

export const Pillar4OpportunityJD: React.FC = () => {
  const {
    activeJD,
    allJDs,
    setActiveJD,
    addJD,
    currentFitReport,
    profile,
  } = useCareerSaathi();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalMode, setModalMode] = useState<'upload' | 'paste'>('upload');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [jdPasteText, setJdPasteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch('/api/document/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text;
      }
    } catch (err) {
      console.warn('Backend extraction error:', err);
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || '';
        const clean = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
        resolve(clean || `[Uploaded: ${file.name}]`);
      };
      reader.readAsText(file);
    });
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdFile(file);
    setJdFileName(file.name);
  };

  const handleRemoveFile = () => {
    setJdFile(null);
    setJdFileName(null);
    if (jdFileInputRef.current) jdFileInputRef.current.value = '';
  };

  const handleParseJD = async (e: React.FormEvent) => {
    e.preventDefault();
    let textToParse = jdPasteText.trim();

    if (modalMode === 'upload') {
      if (!jdFile) return;
      setIsParsing(true);
      try {
        textToParse = await extractTextFromFile(jdFile);
      } catch (err) {
        console.error('File read error:', err);
        setIsParsing(false);
        return;
      }
    }

    if (!textToParse) return;

    setIsParsing(true);
    try {
      const res = await fetch('/api/ai/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText: textToParse }),
      });
      const data = await res.json();

      const newJD: OpportunityJD = {
        id: `jd-${Date.now()}`,
        company: data.company || (modalMode === 'upload' && jdFile ? jdFile.name.replace(/\.[^/.]+$/, '') : ''),
        title: data.title || '',
        function: data.function || 'Engineering',
        location: data.location || '',
        workArrangement: data.workArrangement || 'Hybrid',
        experienceRange: data.experienceRange || '',
        educationRequirement: data.educationRequirement || '',
        cgpaCutoff: data.cgpaCutoff || 0,
        maxBacklogs: data.maxBacklogs ?? 0,
        salaryRange: data.salaryRange || '',
        mustHaveSkills: data.mustHaveSkills || [],
        preferredSkills: data.preferredSkills || [],
        goodToHaveSkills: data.goodToHaveSkills || [],
        keyResponsibilities: data.keyResponsibilities || [],
        ambiguousOrUncertainTerms: data.ambiguousOrUncertainTerms || [],
        rawText: textToParse,
      };

      addJD(newJD);
      setShowUploadModal(false);
      setJdPasteText('');
      setJdFile(null);
      setJdFileName(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const hasActiveOpportunity = Boolean(activeJD && (activeJD.company || activeJD.title));
  const validJDs = allJDs.filter((j) => j.company || j.title);

  return (
    <div className="space-y-6">
      {/* Top Banner & Switch Target Opportunity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Target Opportunity & Role Fit</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Job Description & Eligibility Analysis
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect eligibility cutoffs, required technical skills, and responsibilities for your target role.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Job Description</span>
          </button>
        </div>

        {/* Switch Target Opportunity if more than 1 exist */}
        {validJDs.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Target Opportunity:
            </span>
            <div className="flex flex-wrap gap-2">
              {validJDs.map((jd) => {
                const isSelected = activeJD.id === jd.id;
                return (
                  <button
                    key={jd.id}
                    onClick={() => setActiveJD(jd)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{jd.company ? `${jd.company}: ` : ''}{jd.title || 'Untitled Role'}</span>
                    {jd.cgpaCutoff > 0 && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                        Cutoff: {jd.cgpaCutoff}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Target Opportunity Header Card or Empty State */}
      {!hasActiveOpportunity ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-lg font-bold text-white">No Target Opportunity Added Yet</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a Job Description document (PDF, Word, or text) or paste the role requirements to test eligibility and analyze skill gaps.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Job Description</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{activeJD.title || 'Target Role'}</h2>
                {activeJD.workArrangement && (
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {activeJD.workArrangement}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5 flex items-center gap-2">
                {activeJD.company && <span>{activeJD.company}</span>}
                {activeJD.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3" /> {activeJD.location}
                    </span>
                  </>
                )}
                {activeJD.salaryRange && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400">{activeJD.salaryRange}</span>
                  </>
                )}
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold inline-block ${
                  currentFitReport.matchTier === 'Strong Match'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentFitReport.matchTier === 'Conditional Match'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {currentFitReport.matchTier} ({currentFitReport.overallFitScore}%)
              </span>
              <span className="block text-[10px] text-slate-500 mt-1">
                Contextual Match (Deterministic criteria + skill coverage)
              </span>
            </div>
          </div>

          {/* Deterministic Criteria Gate */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                Eligibility Criteria Check
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  currentFitReport.eligibilityPassed ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {currentFitReport.eligibilityPassed ? 'Eligible to Apply' : 'Cutoff Not Met'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentFitReport.criteriaBreakdown.map((crit, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    crit.status === 'PASS'
                      ? 'bg-slate-800/60 border-slate-700/60'
                      : crit.status === 'FAIL'
                      ? 'bg-rose-950/20 border-rose-800/40'
                      : 'bg-amber-950/20 border-amber-800/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{crit.criterion}</span>
                    {crit.status === 'PASS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : crit.status === 'FAIL' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[11px] text-slate-400">Required:</span>
                    <span className="font-semibold text-slate-200">{crit.required}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-slate-400">Your Profile:</span>
                    <span className="font-semibold text-white">{crit.studentValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Skills Required */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Skills Required by Role
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeJD.mustHaveSkills.map((skillName, idx) => {
                const userHasSkill = profile.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
                return (
                  <div
                    key={`m-${idx}`}
                    className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-white block">{skillName}</span>
                      <span className="text-[10px] text-rose-400">Mandatory requirement</span>
                    </div>
                    {userHasSkill ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                        Matched
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-semibold">
                        Missing
                      </span>
                    )}
                  </div>
                );
              })}

              {activeJD.preferredSkills.map((skillName, idx) => (
                <div
                  key={`p-${idx}`}
                  className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-slate-200 block">{skillName}</span>
                    <span className="text-[10px] text-amber-400">Preferred</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Bonus</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload JD Modal with Document File Upload and Text Support */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Upload Job Description</h3>
                <p className="text-xs text-slate-400">
                  Select a JD document or paste job requirements.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setModalMode('upload')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document (.pdf, .docx, .txt)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode('paste')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalMode === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
            </div>

            <form onSubmit={handleParseJD} className="space-y-4">
              {modalMode === 'upload' ? (
                <div>
                  {jdFile ? (
                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-5 h-5 text-indigo-400" />
                          <div>
                            <span className="text-xs font-semibold text-white block truncate max-w-[280px]">
                              {jdFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(jdFile.size / 1024).toFixed(1)} KB • {jdFile.type || 'Document'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                          Selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                        <label className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition cursor-pointer">
                          <span>Replace File</span>
                          <input
                            ref={jdFileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileSelected}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl text-center space-y-2 bg-slate-800/40">
                      <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                      <div>
                        <label className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 cursor-pointer block">
                          <span>Choose a Job Description file (.pdf, .docx, .txt)</span>
                          <input
                            ref={jdFileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileSelected}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Upload the job posting document to extract criteria
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  rows={8}
                  required
                  value={jdPasteText}
                  onChange={(e) => setJdPasteText(e.target.value)}
                  placeholder="Paste Job Description requirements, qualifications, and responsibilities..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isParsing || (modalMode === 'upload' ? !jdFile : !jdPasteText.trim())}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse Job Description</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
