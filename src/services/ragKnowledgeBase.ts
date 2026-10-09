/**
 * Client-Side Career Saathi RAG Knowledge Base Interface
 * Links directly with /RAG_KNOWLEDGE_BASE and /api/rag/* backend endpoints.
 * Provides the UI with full visibility into the loaded frameworks, answering styles, and policies.
 */

export interface RAGDocumentMeta {
  id: string;
  title: string;
  domain: string;
  version: string;
  filename: string;
  sectionsCount: number;
  bytes: number;
  content?: string;
  sections?: Array<{
    heading: string;
    level: number;
    text: string;
  }>;
}

export interface RAGSearchMatch {
  documentId: string;
  title: string;
  sectionHeading: string;
  snippet: string;
  score: number;
}

export interface RAGStatusResponse {
  directory: string;
  documentsCount: number;
  documents: RAGDocumentMeta[];
  lastLoadedTimestamp: string;
  answeringStyleActive: boolean;
}

// Built-in client-accessible frameworks for immediate offline access
export const CLIENT_RAG_FRAMEWORKS = {
  'RAG-01': {
    id: 'RAG-01',
    title: 'Academic Intelligence & Education Framework',
    domain: 'Academic Intelligence',
    version: '1.0.0',
    summary: 'Deterministic CGPA arithmetic (Sum(SGPA*Credits)/Credits), Mode A/B Feasibility, Discrepancy flag (|Δ| >= 0.1), and Completed vs Pursuing logic.',
  },
  'RAG-02': {
    id: 'RAG-02',
    title: 'Career Evaluation, Evidence & Profile Framework',
    domain: 'Evidence & Profile Strength',
    version: '1.0.0',
    summary: 'Evidence Strength scale (Levels 0–4), Relevance taxonomy (Directly, Transferably, Low), 3-Way Gap taxonomy (Profile Gap, CV Gap, Evidence Gap).',
  },
  'RAG-03': {
    id: 'RAG-03',
    title: 'JD & Opportunity Intelligence Framework',
    domain: 'Opportunity Intelligence',
    version: '1.0.0',
    summary: 'Requirement classification (Must-have, Preferred, Good-to-have), Deterministic eligibility gate vs semantic fit, ambiguity and uncertainty flags.',
  },
  'RAG-04': {
    id: 'RAG-04',
    title: 'Responsible AI & Career Preparation Framework',
    domain: 'Responsible AI & Coaching',
    version: '1.0.0',
    summary: 'STAR Behavioral interview rubric, Case problem-solving rubric, 4-part Technical rubrics (0–10), Anti-hallucination & refusal of unsupported certainty.',
  },
  'RAG-05': {
    id: 'RAG-05',
    title: 'Dual-System Logic Flow & RAG Orchestration',
    domain: 'System Orchestration',
    version: '1.0.0',
    summary: 'System A (Database / student source-of-truth) vs System B (Controlled RAG policy), Canonical processing flow, prompt context hierarchy, failure handling.',
  },
};

export const ANSWERING_STYLE_SUMMARY = [
  {
    title: 'Structure First',
    rule: 'Direct, unambiguous answer in paragraph 1, followed by evidence citations and 1-2 prioritized next best actions.',
  },
  {
    title: 'Explainable Reasoning',
    rule: 'Every recommendation or score must expose positive contributors, limiting factors, and the specific gap type.',
  },
  {
    title: 'Refusal of Unsupported Certainty',
    rule: 'Explicitly decline questions like "Will I get hired?" or "What are my odds?". Pivot to evidence readiness and gap remediation.',
  },
  {
    title: 'Anti-Hallucination & Provenance',
    rule: 'Ground claims exclusively in verified student records. Never invent achievements, projects, or credentials.',
  },
  {
    title: 'Deterministic Rules Non-Negotiable',
    rule: 'CGPA calculations, backlog cutoffs, and eligibility gates are mathematical boundaries that cannot be bypassed by AI.',
  },
];

/**
 * Fetch full RAG Knowledge Base status from backend
 */
export async function fetchRAGStatus(): Promise<RAGStatusResponse> {
  try {
    const res = await fetch('/api/rag/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Return client-side fallback
    return {
      directory: '/RAG_KNOWLEDGE_BASE',
      documentsCount: 5,
      documents: Object.values(CLIENT_RAG_FRAMEWORKS).map((f) => ({
        id: f.id,
        title: f.title,
        domain: f.domain,
        version: f.version,
        filename: `${f.id}_Framework.md`,
        sectionsCount: 12,
        bytes: 6000,
      })),
      lastLoadedTimestamp: new Date().toISOString(),
      answeringStyleActive: true,
    };
  }
}

/**
 * Fetch a specific RAG document by ID from backend
 */
export async function fetchRAGDocument(docId: string): Promise<RAGDocumentMeta | null> {
  try {
    const res = await fetch(`/api/rag/documents/${docId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Query the RAG Knowledge base for matches
 */
export async function queryRAGKnowledgeBase(query: string): Promise<RAGSearchMatch[]> {
  try {
    const res = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    return [];
  }
}
