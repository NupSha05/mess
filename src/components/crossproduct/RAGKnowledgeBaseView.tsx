import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Terminal,
} from 'lucide-react';
import {
  fetchRAGStatus,
  fetchRAGDocument,
  queryRAGKnowledgeBase,
  RAGStatusResponse,
  RAGDocumentMeta,
  RAGSearchMatch,
  CLIENT_RAG_FRAMEWORKS,
  ANSWERING_STYLE_SUMMARY,
} from '../../services/ragKnowledgeBase';

export const RAGKnowledgeBaseView: React.FC = () => {
  const [status, setStatus] = useState<RAGStatusResponse | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('RAG-01');
  const [selectedDoc, setSelectedDoc] = useState<RAGDocumentMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RAGSearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'answering_style' | 'search' | 'architecture'>('documents');

  useEffect(() => {
    fetchRAGStatus().then((s) => {
      setStatus(s);
      if (s.documents.length > 0) {
        loadDoc(s.documents[0].id);
      }
    });
  }, []);

  const loadDoc = async (id: string) => {
    setSelectedDocId(id);
    const doc = await fetchRAGDocument(id);
    setSelectedDoc(doc);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const matches = await queryRAGKnowledgeBase(searchQuery);
    setSearchResults(matches);
    setIsSearching(false);
    setActiveTab('search');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Controlled RAG Knowledge Base (System B)
              </h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Linked to /RAG_KNOWLEDGE_BASE & ragKnowledgeBase.ts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">
              Houses stable methodologies, answering styles, evaluation rubrics, and responsible AI guardrails.
              Student-specific facts are maintained in System A (Database), while System B supplies the authoritative frameworks that ground Gemini reasoning.
            </p>
          </div>

          {/* Diagnostic Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Documents</span>
              <span className="text-white font-bold text-sm">
                {status?.documentsCount ?? 5} Frameworks
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Directory Path</span>
              <span className="text-indigo-300 font-mono text-[11px]">/RAG_KNOWLEDGE_BASE</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frameworks (e.g., 'STAR Method', 'Mode B Feasibility', '3-Way Gaps', 'Unsupported Certainty')..."
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search RAG</span>
          </button>
        </form>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 px-3 font-medium transition border-b-2 ${
            activeTab === 'documents'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Framework Documents ({status?.documentsCount ?? 5})
        </button>
        <button
          onClick={() => setActiveTab('answering_style')}
          className={`pb-2.5 px-3 font-medium transition border-b-2 ${
            activeTab === 'answering_style'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Answering Styles & Constitution
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-2.5 px-3 font-medium transition border-b-2 ${
            activeTab === 'architecture'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dual-System Architecture (System A ↔ System B)
        </button>
        {searchResults.length > 0 && (
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 font-medium transition border-b-2 ${
              activeTab === 'search'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Search Results ({searchResults.length})
          </button>
        )}
      </div>

      {/* Tab 1: Documents View */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Document Selector Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            {(status?.documents ?? Object.values(CLIENT_RAG_FRAMEWORKS)).map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => loadDoc(doc.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {doc.id}
                    </span>
                    <span className="text-[10px] text-slate-500">v{doc.version || '1.0.0'}</span>
                  </div>
                  <h3 className="font-semibold text-xs text-white leading-snug">{doc.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {doc.domain || CLIENT_RAG_FRAMEWORKS[doc.id as keyof typeof CLIENT_RAG_FRAMEWORKS]?.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Document Content View */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            {selectedDoc ? (
              <>
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                      {selectedDoc.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      File: {selectedDoc.filename}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-2">{selectedDoc.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Domain: {selectedDoc.domain}</p>
                </div>

                {/* Structured Sections */}
                {selectedDoc.sections && selectedDoc.sections.length > 0 ? (
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {selectedDoc.sections.map((section, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
                        <h4 className="font-semibold text-xs text-indigo-300 flex items-center gap-1.5 mb-2">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                          {section.heading}
                        </h4>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {section.text}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-h-[550px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedDoc.content}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select a framework document from the list to view its contents.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Answering Styles & Constitution */}
      {activeTab === 'answering_style' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Career Saathi Answering Styles & Communication Constitution
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enforced across all Gemini AI reasoning calls in <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">server/aiService.ts</code> via <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">ragKnowledgeBase.ts</code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ANSWERING_STYLE_SUMMARY.map((style, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-xs text-white">{style.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{style.rule}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-indigo-300 mb-2">STAR Interview Rubric</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Applied in Pillar 8 Practice Coach: Situation, Task, Action, Result with quantified business/engineering metrics. Evaluated across Correctness, Structure, Communication, and Relevance (0-10 each).
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-300 mb-2">3-Way Gap Taxonomy</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Separates <strong>Profile Gaps</strong> (genuinely absent capability), <strong>CV Gaps</strong> (verified in profile, omitted on CV), and <strong>Evidence Gaps</strong> (claimed on CV without proof).
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-purple-300 mb-2">Evidence Scale (0 to 4)</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Level 0 (No Evidence) → Level 1 (Coursework/Basic) → Level 2 (Academic Project) → Level 3 (Production Capstone/Internship) → Level 4 (Demonstrated Business Impact).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dual-System Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            System A (Database) ↔ System B (Controlled RAG) Orchestration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs text-white">System A — Application & Source of Truth</h3>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Student identity, verified CGPA, SGPA, transcripts</li>
                <li>Projects, repositories, internship logs, skill evidence</li>
                <li>Target JD records, application pipeline records</li>
                <li>Deterministic arithmetic (CGPA, SGPA delta, eligibility gates)</li>
                <li>Persistent storage with user isolation and RLS</li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-white">System B — Controlled RAG Knowledge Base</h3>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>RAG-01: Academic Intelligence Framework</li>
                <li>RAG-02: Career Evaluation & Evidence Progression</li>
                <li>RAG-03: JD & Opportunity Intelligence Framework</li>
                <li>RAG-04: Responsible AI & Career Preparation Framework</li>
                <li>RAG-05: Dual-System Logic Flow & RAG Orchestration</li>
                <li>Loaded directly from <code className="text-emerald-300">/RAG_KNOWLEDGE_BASE</code></li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
            <h4 className="text-xs font-semibold text-indigo-300 mb-1">Golden Rule of Career Saathi AI:</h4>
            <p className="text-xs text-slate-300 italic">
              "Student-specific facts come exclusively from System A and authorized source documents. General methodology and answering policies come from System B. Gemini is an interpretation layer operating over these sources; it is never the authoritative source of truth or arithmetic calculator."
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Search Results */}
      {activeTab === 'search' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Search Results for "{searchQuery}"</span>
            <span className="text-xs text-slate-400 font-normal">{searchResults.length} matches found</span>
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No matching framework sections found. Try a different query.</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((match, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-indigo-400">
                      {match.documentId} • {match.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Relevance: {match.score}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{match.sectionHeading}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{match.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
