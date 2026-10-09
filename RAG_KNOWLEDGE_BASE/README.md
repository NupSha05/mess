# Career Saathi AI — Controlled RAG Knowledge Base (System B)

This directory contains the authoritative, version-controlled framework documents for **System B (Controlled RAG Knowledge Base)** as specified in Document 08 (AI & RAG Architecture) and Document 10 (End-to-End Flow).

---

## 1. Directory Manifest & Alignment

| Document ID | File Name | Domain | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **RAG-01** | `RAG-01_Academic_Intelligence_and_Education_Framework.md` | Academic Intelligence | CGPA calculations, Mode A/B feasibility, completed vs pursuing logic, marksheet discrepancy governance ($|\Delta| \ge 0.1$). |
| **RAG-02** | `RAG-02_Career_Evaluation_Evidence_and_Profile_Framework.md` | Evidence & Career Profile | Evidence Strength scale (Levels 0–4), Relevance taxonomy, Triad of Career Truth, 3-Way Gap taxonomy (*Profile Gap*, *CV Gap*, *Evidence Gap*). |
| **RAG-03** | `RAG-03_JD_and_Opportunity_Intelligence_Framework.md` | Opportunity & JD | Requirement classification (Must-have, Preferred, Good-to-have), deterministic eligibility gate vs semantic fit, ambiguity and uncertainty flags. |
| **RAG-04** | `RAG-04_Responsible_AI_and_Career_Preparation_Framework.md` | Responsible AI & Coaching | Anti-hallucination guardrails, refusal of unsupported certainty, prompt-injection isolation, STAR / Case / Technical rubrics (0–10). |
| **RAG-05** | `RAG-05_Dual_System_Logic_Flow_and_RAG_Orchestration.md` | System Boundary & Orchestration | System A (Database / deterministic truth) vs System B (RAG policy) boundary, Golden Rule, prompt context hierarchy, failure handling. |

---

## 2. Alignment with `rag-knowledge-base.ts`

The application backend (`server/ragKnowledgeBase.ts` and `server/rag-knowledge-base.ts`) directly loads and links with this directory at runtime:
1. **Dynamic Ingestion**: Reads markdown files directly into the active RAG runtime index.
2. **Selective Retrieval**: When an AI prompt is formulated (in `server/aiService.ts`), the selective retriever attaches only the task-relevant framework and answering style to conserve token budget and prevent context pollution.
3. **Answering Styles & Framework Enforcement**: The AI layer must follow the structured answering styles, communication standards, and evaluation rubrics defined herein.
4. **Strict Grounding Boundary**: Student-specific facts come from System A (Database). Methodology, answering guidelines, and rules come from System B (this directory). Gemini acts solely as an interpreter, never an authoritative arithmetic calculator or ungrounded claim generator.
