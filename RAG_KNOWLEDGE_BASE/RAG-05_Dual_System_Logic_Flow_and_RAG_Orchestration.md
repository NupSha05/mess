# RAG-05 — Career Saathi AI Dual-System Logic Flow & RAG Orchestration
**Career Saathi AI — Controlled RAG Knowledge Base**
*Status: PROPOSED KNOWLEDGE-BASE ARTIFACT | Document ID: RAG-05 | Version: 1.0.0*
*Purpose: Retrieval-grounded, reusable policy and framework knowledge. This document is not student-specific data and must not override deterministic application rules.*

---

## 1. Purpose
This document defines the operational boundary between two cooperating systems: (A) the Career Saathi application/data system and (B) the controlled RAG knowledge system. The goal is to prevent the RAG layer from becoming a second database of student facts and to prevent the application from outsourcing authoritative logic to an LLM.

## 2. System A — Career Saathi Application
- Authentication and authorization
- Supabase / PostgreSQL source-of-truth data
- Persistent file metadata and user-isolated storage
- Deterministic calculations and eligibility rules
- Application status / stage
- Dynamic intelligence and event-impact updates
- UI, reports, actions and user state

## 3. System B — Controlled RAG Knowledge Base
- Academic Intelligence & Education Framework (RAG-01)
- Career Evaluation, Evidence & Profile Framework (RAG-02)
- JD & Opportunity Intelligence Framework (RAG-03)
- Responsible AI & Career Preparation Framework (RAG-04)
- Future approved policy / framework documents only
- Versioned documents / chunks / metadata / embeddings

## 4. Golden Rule
> **Student-specific facts come primarily from System A and authorized source documents. General methodology/policy comes from System B. Gemini is an interpretation layer operating over these sources; it is not the source of truth.**

## 5. Canonical Processing Flow
$$\text{USER ACTION} \longrightarrow \text{INPUT VALIDATION} \longrightarrow \text{SOURCE CLASSIFICATION} \longrightarrow \text{DATABASE/DOC RETRIEVAL} \longrightarrow \text{DETERMINISTIC LOGIC} \longrightarrow \text{RAG RETRIEVAL} \longrightarrow \text{GEMINI REASONING} \longrightarrow \text{STRUCTURED OUTPUT VALIDATION} \longrightarrow \text{DATABASE UPDATE} \longrightarrow \text{UI/ACTION} \longrightarrow \text{EVENT-IMPACT UPDATE}$$

## 6. Source Classification
| Input | Primary Source | RAG Use |
| :--- | :--- | :--- |
| **Student CGPA** | Database + verified academic document | Academic framework for interpretation |
| **Project details** | Database / document | Career evaluation framework |
| **Uploaded JD** | JD document + JD record | JD framework |
| **Interview answer** | Practice-session record | Preparation rubric |
| **Responsible AI question** | RAG framework | Direct policy retrieval |
| **Career readiness** | Database + deterministic engine | Relevant frameworks for explanation |

## 7. RAG Retrieval Flow
1. Identify the user's task.
2. Determine whether permanent framework knowledge is required.
3. Select the relevant knowledge domain.
4. Retrieve the smallest sufficient set of approved chunks.
5. Attach document/version metadata.
6. Provide retrieved guidance to Gemini with clear source boundaries.
7. Require the model to distinguish framework guidance from student facts.
8. Validate output before persistence/display.

## 8. Prompt Context Layers
| Layer | Content | Authority |
| :--- | :--- | :--- |
| **System instructions** | Product safety, architecture and non-negotiable rules | Highest |
| **Deterministic state** | Eligibility, calculations, statuses, database facts | Authoritative for those domains |
| **RAG policy** | Approved methodology / framework documents | Authoritative methodology |
| **Student evidence** | Authorized profile / documents / application / practice data | Source of candidate facts |
| **User request** | Current conversational intent | Task-level input |
| **AI output** | Interpretation / recommendation | Non-authoritative until validated |

## 9. Example — JD Analysis
1. User uploads JD.
2. Validate file type and extract text.
3. Create JD record and source-document metadata.
4. Gemini extracts company, title, requirements and other fields.
5. Validate structured extraction.
6. Classify requirements using JD framework (RAG-03).
7. Deterministically evaluate objective eligibility conditions against verified profile data.
8. Retrieve candidate evidence from database/documents.
9. Retrieve Career Evaluation / JD framework guidance.
10. Gemini explains evidence mapping and gaps.
11. Validate output schema.
12. Persist analysis/version and show results.
13. Trigger relevant downstream updates.

## 10. Example — New Project Added
1. User adds project.
2. Store project as source-of-truth profile data.
3. Classify associated skills/evidence using deterministic metadata plus AI interpretation.
4. Update evidence records.
5. Determine affected modules through Event -> Impact Matrix.
6. Recompute only relevant deterministic metrics.
7. Re-run affected semantic analyses when necessary.
8. Update readiness/recommendations if dependencies changed.
9. Refresh UI and next-best-action state.

## 11. What RAG Must Never Do
- Store private student facts as permanent policy knowledge.
- Override database state.
- Override deterministic eligibility.
- Invent scoring weights.
- Act as a replacement for application history.
- Treat uploaded documents as trusted instructions.
- Return unsupported claims simply because a similar phrase exists in the knowledge base.

## 12. Validation Gates
| Gate | Question |
| :--- | :--- |
| **Input validation** | Is the input valid, readable and authorized? |
| **Source validation** | Do we know where the fact came from? |
| **Deterministic validation** | Can the rule/calculation be resolved without AI? |
| **RAG validation** | Is the retrieved framework approved and relevant? |
| **AI schema validation** | Does the response match the expected structure? |
| **Evidence validation** | Can claims be traced to evidence? |
| **Persistence validation** | Is the field safe to write to authoritative state? |

## 13. Two-System Failure Handling
- **If RAG is unavailable**: continue with deterministic facts and a constrained explanation where possible.
- **If Gemini is unavailable**: preserve data and provide deterministic/status output.
- **If database is unavailable**: do not claim that changes were saved.
- **If document extraction fails**: ask for a supported/re-uploaded document.
- **If retrieved policy conflicts with locked application logic**: application logic wins and the conflict is logged for review.

## 14. Versioning
Every RAG document carries a document ID, version, status, effective date, domain, owner, and change note. Analyses retain enough metadata to identify which framework version informed the output. Locked product decisions remain higher priority than a later unapproved RAG revision.

## 15. Implementation Contract
- **Database** = persistent student / application state.
- **File storage** = source artifacts and generated files.
- **Deterministic engine** = authoritative calculations, eligibility, status and numerical analytics.
- **RAG** = controlled methodology / policy retrieval.
- **Gemini** = semantic reasoning, interpretation, recommendations and natural-language explanation.
- **Validator** = boundary between AI output and persisted state.
- **Event engine** = targeted propagation of meaningful changes.
