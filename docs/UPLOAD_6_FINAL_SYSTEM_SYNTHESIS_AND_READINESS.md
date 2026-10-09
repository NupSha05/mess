# Career Saathi AI — Upload 6: Final System Synthesis & Implementation Readiness

**Document Reference**: Upload 06 Consolidated Master Synthesis  
**Input Documents**: 
- Document 13 — Reporting & Gmail Architecture
- Document 15 — Professor Evaluation Mapping / Academic Evaluation Framework (A1–F7)
- Document 16 — Implementation Roadmap
- Career Saathi AI Product Design & Implementation Blueprint
- Approved outputs from Uploads 1–5

---

## 1. Final Product Specification

- **Product Name**: Career Saathi AI
- **Positioning**: Career Intelligence Platform
- **Core Product Type**: Persistent Personal Career Intelligence Platform
- **Primary Persona**: Students (undergraduate, postgraduate, professional education)
- **Secondary Personas**: Job seekers, early-career professionals, career switchers
- **Excluded Personas**: Professor / Evaluator (Evaluators exist externally only; no professor user, role, dashboard, portal, or approval workflow).
- **Core Mission**: Consolidate fragmented student career journeys (academics, projects, verified evidence, JD requirements, CVs, LinkedIn presence, application funnels, and role-specific interview preparation) into a single continuous, persistent, evidence-grounded intelligence loop.
- **The Nine Locked Pillars**:
  1. **Student Intelligence Profile**: Persistent, verified student truth (identity, education, experience, internships, projects, skills, certifications, achievements, career goals).
  2. **Academic Intelligence**: Deterministic CGPA, trajectory analytics, backlog tracking, credit calculations, degree completion pacing, academic-to-career alignment.
  3. **Career & Profile Intelligence**: 5-tier evidence grading (L0–L4), relevance mapping, Profile Strength scoring, skill gap detection.
  4. **JD / Opportunity Intelligence**: Ingestion, deterministic eligibility gating, requirement classification (Must-Have, Preferred, Good-to-Have, Other), contextual Role Fit scoring.
  5. **CV / Document Intelligence**: Document parsing, evidence extraction, verification staging, CV-to-JD alignment, discrepancy audits.
  6. **LinkedIn Intelligence**: Professional presence visibility audit, headline/about/skills/experience alignment against student profile and target JDs (zero unauthorized scraping).
  7. **Application Intelligence**: Application tracking across validated states, event history timeline, application health calculation, funnel conversion analytics.
  8. **Preparation Intelligence + AI Practice Coach**: Role/stage-tailored preparation, STAR & Problem-Analysis question generation, structured rubric evaluation, persistent performance state.
  9. **Readiness & Analytics**: Multi-dimensional Career Readiness aggregation (Academic, Profile, Skill, Opportunity, Interview), trend trajectory, positive contributors & limiting factors.
- **Cross-Product Layer**:
  - **Career Command Center**: Unified overview dashboard aggregating readiness, next actions, and funnel status.
  - **Ask Career Saathi**: Profile-aware, multi-turn assistant grounded in persistent database state + controlled RAG frameworks.
  - **Action Center**: Dynamically prioritized Next Best Actions derived from identified gaps.
  - **Report Center**: Reusable report generator producing persistent, downloadable PDFs for all nine pillars and consolidated profiles.
  - **Authorized Gmail Automation**: Explicit user-authorized dispatch of generated Career Saathi reports with audit logging.

---

## 2. Final System Architecture

```
[ Student Browser Client (React + TypeScript + Tailwind CSS) ]
                           │
       HTTPS / REST / JSON │ WebSocket (Status)
                           ▼
[ Full-Stack Server & Orchestration Layer (Node.js / Express / Vite / tsx) ]
 ┌────────────────────────────────────────────────────────────────────────┐
 │ • Centralized Config & Secret Management (.env / Environment)          │
 │ • User Authentication & Scoped Identity Validation                     │
 │ • Deterministic Intelligence Engine (Pure Functions, Math, Rules)      │
 │ • Gemini AI Service (Controlled Prompts, Output Schema Validation)     │
 │ • System B: Controlled RAG Knowledge Base (/RAG_KNOWLEDGE_BASE/*.md)   │
 │ • Document Processing Pipeline (PDF/Text Extraction & Review Staging)  │
 │ • Report Generation Engine (Structured PDF Compilation & Formatting)   │
 │ • Authorized Gmail Client (OAuth2 User-Authorized Email Dispatcher)    │
 │ • Event Impact Engine (Targeted Downstream Intelligence Recalculation) │
 └────────────────────────────────┬───────────────────────────────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
[ System A: Persistent Data Store ]   [ External Integrated APIs ]
 (PostgreSQL / Supabase / Cloud SQL)   • Google Gemini 2.5/Flash API
 • User Isolation & Row-Level Checks   • Google Workspace Gmail OAuth2
 • Relational Entities (Pillars 1-9)   • Secure Object Storage
 • Provenance Metadata on All Records
```

---

## 3. Final Database / Data Model

### Data Classification & Provenance Model
Every data field or record belongs to one of eight explicit provenance classes:
1. `user_provided_fact`: Directly entered by student (e.g. self-stated contact information, career preferences).
2. `extracted_information`: Unconfirmed text parsed from uploaded documents (CV, marksheet, JD). Staged until verified.
3. `verified_information`: Validated by user confirmation or official document reconciliation.
4. `system_derived_information`: Computed status transitions, audit timestamps, and system counters.
5. `deterministic_calculation`: Authoritative arithmetic outputs (CGPA, eligibility pass/fail flags, term progression).
6. `ai_interpretation`: Qualitative assessments, semantic match analyses, strengths/gaps narratives.
7. `ai_recommendation`: Suggested next actions, interview feedback points, CV revision tips.
8. `uncertain_information`: Flagged conflicts, incomplete JD specifications, or unverified claims.

### Core Relational Entities
- **Identity & Profile**: `users`, `student_profiles`, `career_preferences`
- **Academic & Evidence**: `education_records`, `experiences`, `internships`, `projects`, `skills`, `certifications`, `achievements`, `research_records`
- **Documents**: `documents`, `cv_records`
- **Opportunities**: `job_descriptions`, `jd_requirements`, `jd_analyses`
- **Professional Presence**: `linkedin_profiles`, `linkedin_analyses`
- **Applications**: `applications`, `application_events`
- **Preparation**: `practice_sessions`, `practice_questions`, `practice_answers`, `preparation_performance`
- **Readiness**: `readiness_snapshots`
- **Reporting & Communication**: `reports`, `email_logs`

---

## 4. Final AI / RAG Architecture

### Dual-System Paradigm
- **System A (Application & Data Layer)**: Persistent source of truth. Contains all student records, evidence items, JD documents, and application history. **Never** dumped wholesale into vector embeddings.
- **System B (Controlled RAG Knowledge Base)**: Located in `/RAG_KNOWLEDGE_BASE/`, containing version-controlled methodology frameworks:
  - `RAG-01`: Academic Intelligence & Education Framework
  - `RAG-02`: Career Evaluation, Evidence & Profile Framework
  - `RAG-03`: JD & Opportunity Intelligence Framework
  - `RAG-04`: Responsible AI & Career Preparation Framework
  - `RAG-05`: Dual-System Logic Flow & RAG Orchestration

### AI Execution Pipeline
```
Trigger Task
  → Query Intent Analysis
  → Fetch Authorized Student Records (System A)
  → Retrieve Relevant Methodology Framework (System B)
  → Assemble Grounded System Prompt & Guardrails
  → Invoke Google Gemini via Server-Side Proxy
  → Validate JSON Schema & Response Structure
  → Validate Against Deterministic Rules
  → Apply Data Provenance Metadata
  → Persist Authorized State to Database
  → Render in UI with Citation & Next Best Action
```

---

## 5. Final Deterministic vs. AI Responsibility Matrix

| Domain / Task | Deterministic System (Authoritative) | AI Reasoning Layer (Qualitative) | Prohibited Delegation |
| :--- | :--- | :--- | :--- |
| **Academic Math** | CGPA calculation, percentage conversions, credit sums, degree timeline. | Explaining academic trajectory, recommending study focus areas. | **Never** let LLM compute CGPA or override semester arithmetic. |
| **Eligibility Gating** | Minimum CGPA check, graduation year check, required degree match. | Summarizing eligibility narrative, suggesting bridge coursework. | **Never** let LLM grant eligibility when hard rules fail. |
| **Application Stages** | State machine enforcement (Applied → Shortlisted → Interview → Offer). | Recommending follow-up actions and stage-specific interview tips. | **Never** let LLM arbitrarily alter database application stages. |
| **Evidence Grading** | Tracking verified artifacts (URLs, certificates, code repositories). | Assessing depth, context, and project impact heuristics (L0–L4). | **Never** fabricate unverified evidence or credentials. |
| **JD Understanding** | Rule-based keyword count and hard constraint verification. | Semantic requirement extraction, role nuances, implicit qualifications. | **Never** treat ambiguous JD text as definitive fact. |
| **Hiring Prediction** | **Prohibited entirely**. System provides preparation gap analysis only. | Explaining alignment strengths and areas requiring practice. | **Never** generate hiring odds (e.g. "82% chance of hire"). |
| **Report Generation** | Assembling verified facts, metrics, and chart coordinates. | Synthesizing executive summaries and contextual improvement plans. | **Never** generate reports containing hallucinated student facts. |
| **Email Automation** | Dispatching authorized payloads, verifying OAuth session, logging audit events. | Drafting contextual email body and subject line for user approval. | **Never** dispatch emails automatically without explicit user trigger. |

---

## 6. Final Module Dependency Map

```
                     [ Student Intelligence Profile ]
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ Academic Intelligence ]  [ Career & Profile Intel ]  [ CV / Document Intel ]
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    ▼
                       [ JD / Opportunity Intel ]
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[ LinkedIn Intelligence ]                               [ Application Intel ]
       │                                                         │
       └────────────────────────────┬────────────────────────────┘
                                    ▼
                       [ Preparation Intelligence ]
                                    │
                                    ▼
                         [ Readiness & Analytics ]
                                    │
                                    ▼
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ Career Command Center ]   [ Action Center ]          [ Report Center ]
       │                            │                            │
       ▼                            ▼                            ▼
[ Ask Career Saathi ]      [ Next Best Actions ]       [ Authorized Gmail ]
```

---

## 7. Final End-to-End Workflow Map

1. **User Onboarding & Profile Setup**: Student signs in → Populates profile data → System assigns `user_provided_fact` provenance → Triggers initial Profile Strength calculation.
2. **Evidence & Document Ingestion**: Student uploads transcript or CV → System parses file → Displays staged extraction review screen → Student confirms data → System updates verified records.
3. **Opportunity & JD Analysis**: Student submits target JD → System extracts requirements → Deterministic engine evaluates hard eligibility gates → AI analyzes semantic Role Fit → Identified gaps propagate to Action Center.
4. **Targeted Preparation**: Student selects identified gap → Launches AI Practice Coach → System serves role-tailored questions → Evaluates responses via STAR rubric → Appends performance record → Readiness dynamically recalculates.
5. **Continuous Intelligence Update**: New achievements or practice scores dynamically update affected readiness dimensions without wasteful full-system recalculation.
6. **Reporting & Authorized Delivery**: Student requests report → System verifies data state → Generates persistent PDF → Prompts for user review → Dispatches via authorized Gmail integration with audit log.

---

## 8. Final UX/UI Architecture

- **Visual Theme & Principles**: Professional, trusted, data-first SaaS design in Dark Slate/Indigo aesthetic. Zero AI slop, zero generic pill badges, high typographic contrast.
- **Top Navigation Shell**:
  - `Command Center`: Primary high-level cockpit.
  - `Pillars 1–9`: Modular, dedicated workspaces for Profile, Academics, Career Intel, Opportunities, CV Intel, LinkedIn, Applications, Preparation, and Readiness.
  - `Cross-Product Tools`: Action Center, Report Center, RAG Knowledge Base.
- **Always-Accessible Global Elements**:
  - Persistent Header with live System Status and Quick-Launch drawers.
  - Slide-out `Ask Career Saathi` conversation drawer with live RAG citation badges.
  - Provenance badges on every data card (`Verified`, `Deterministic`, `AI Interpreted`, `Needs Confirmation`).

---

## 9. Final Security Architecture

- **Authentication**: Secure token-based session validation. Protected routes require active authenticated session.
- **Authorization & Data Isolation**: Strict user isolation across all tables. Queries enforce `WHERE user_id = :auth_user_id`. Direct cross-tenant access prohibited.
- **Secret Protection**: Zero client-side API keys or secrets. All Gemini, database, and OAuth credentials reside in environment variables accessed exclusively via server-side endpoints.
- **Prompt Injection Defense**: Untrusted text (uploaded CVs, JDs, user prompts) is strictly encapsulated and marked as data rather than system directives.
- **Gmail Security**: OAuth 2.0 user consent flow. Passwords never stored. Only user-selected attachments are transmitted.

---

## 10. Final Privacy Architecture

- **Data Minimization**: AI prompts receive only the minimal fields required for the specific task (e.g. only skills and target requirements for JD analysis, not financial or unrelated demographic data).
- **Zero Third-Party Model Training**: Model parameters configured to disable public training or storage of student prompts.
- **Document Isolation**: Uploaded files stored in user-scoped folders with short-lived pre-signed download URLs.
- **Audit Logging**: All report exports, data updates, and email transmissions recorded with immutable timestamps and actor IDs.

---

## 11. Final Edge-Case & Failure Matrix

| Area | Edge Case / Failure Mode | System Response & Fallback |
| :--- | :--- | :--- |
| **Profile** | Conflicting CGPA between self-report and marksheet. | Flag as discrepancy; highlight in UI; retain both until student resolves. |
| **Documents** | Corrupted or unparseable file uploaded. | Catch parsing exception; show clear error banner; do not corrupt existing profile. |
| **Opportunities**| Ambiguous or contradictory JD qualifications. | Surface ambiguity explicitly; mark requirement as "Uncertain"; request clarification. |
| **AI Service** | Gemini API timeout or rate-limit error. | Catch error gracefully; fall back to deterministic heuristics (`isFallback: true`); preserve existing data. |
| **Database** | Connection drop during multi-step operation. | Roll back transaction; notify student of retry requirement; zero partial data pollution. |
| **Gmail** | Revoked OAuth authorization or send failure. | Retain generated PDF as downloadable file; log send failure; prompt re-authorization. |
| **Reporting** | Missing prerequisite data for full report. | Generate partial report with explicit "Unavailable Data" sections; do not hallucinate missing metrics. |

---

## 12. Final Reporting Architecture

- **Supported Reports (9+1 Types)**:
  1. Career Readiness Report
  2. Student Profile Report
  3. Academic Intelligence Report
  4. JD & Role Fit Analysis Report
  5. CV & Document Alignment Report
  6. LinkedIn Presence & Positioning Report
  7. Application Funnel Report
  8. Preparation & Practice Performance Report
  9. Prioritized Action & Improvement Plan
  10. Consolidated Comprehensive Career Intelligence Report
- **Lifecycle**: Request → Validate Prerequisites → Assemble Data → Deterministic Metric Ingestion → Qualitative AI Synthesis → Structured PDF Compilation → User-Isolated Storage → Ready for Download & Authorized Gmail Dispatch.
- **State Model**: `Requested` → `Processing` → `Ready` (or `Partial` / `Failed`).

---

## 13. Final Gmail Architecture

- **Purpose**: Authorized user-directed transmission of generated Career Saathi reports.
- **Workflow**:
  1. User selects "Email Report" action on an existing verified report.
  2. System checks active Gmail OAuth authorization.
  3. Student specifies recipient email and reviews auto-generated subject & body.
  4. System attaches the verified PDF directly from secure storage.
  5. Dispatches via Gmail API proxy with user Bearer token.
  6. Logs transmission metadata (recipient, timestamp, report_id, status) in `email_logs`.
- **Safety Gate**: **Never** automatically trigger email dispatches; explicit user confirmation is mandatory.

---

## 14. External Academic Evaluation / Demonstration Matrix (A1–F7)

Mapped directly to the external academic evaluation criteria (Document 15):

| ID | Evaluation Focus | Student Demonstration Action | Architectural Feature Shown | Honest Limitation Disclosed |
| :--- | :--- | :--- | :--- | :--- |
| **A1** | Product Problem & Value | Open profile; show context reused across JD, prep, and readiness. | Command Center + 9 connected pillars | Decision support tool; no employment guarantee. |
| **A2** | Positioning & Personas | Start onboarding; show student career lifecycle. | Student Profile & Command Center | Commercial model is proposed, not finalized. |
| **A3** | Integrated Value | Add new project; demonstrate downstream updates in Role Fit & Readiness. | Event Impact Engine | Selective recalculation; not every field affects all modules. |
| **A4** | Actionability | Analyze JD; identify gap; follow Next Best Action directly into prep. | Action Center + AI Practice Coach | Recommendations are contextual, not guaranteed outcomes. |
| **A5** | Differentiation | Contrast generic LLM chat with persistent, evidence-grounded scoring. | 5-tier Evidence Model + Provenance | Quality depends on verified student evidence. |
| **A6** | Product Maturity | Generate a persistent report; export to PDF; view in Report Center. | Report Center + Storage Persistence | Enterprise SSO remains an open roadmap item. |
| **A7** | Deliberate Boundaries | Ask AI for hiring odds; demonstrate explicit refusal. | Guardrails + Provenance Checks | System assists decisions, cannot predict hiring decisions. |
| **B1** | AI Architecture | Trigger analysis; explain Gemini reasoning vs deterministic calculations. | Centralized AI Service + Express Proxy | Specific Gemini model versions evolve over time. |
| **B2** | Prompt Design | Inspect JD analysis prompt structure with strict output schema. | Modular Prompt Contract | Prompts are engineered for structured outputs. |
| **B3** | Guardrails | Inject prompt instructions inside a fake JD text; show safe neutralization. | System Prompt Isolation Boundary | Guardrails mitigate risk, LLMs are non-deterministic. |
| **B4** | Privacy | Show that unrelated personal facts are excluded from AI prompts. | Context Assembly Data Minimization | Data retention policies are configurable. |
| **B5** | API Resilience | Disconnect API or simulate timeout; demonstrate graceful fallback. | Try/Catch + Deterministic Fallback | External API availability is an operational dependency. |
| **B6** | RAG Grounding | Run preparation query; display applied RAG framework badge. | `/RAG_KNOWLEDGE_BASE/` Frameworks | Frameworks provide methodology, not personalized facts. |
| **C1** | Error Surfacing | Input conflicting marksheet CGPA; show conflict indicator. | Data Discrepancy Detector | Qualitative AI can still generate nuanced interpretations. |
| **C2** | Unsafe AI Reliance | Request AI to override minimum CGPA cutoff; demonstrate hard refusal. | Deterministic Eligibility Gates | System enforces academic rules deterministically. |
| **C3** | Accountability | Open Role Fit breakdown; trace score components back to evidence. | Score Explainability Engine | Qualitative fit assessments remain model-assisted. |
| **C4** | AI Limitations | Demonstrate insufficient data handling when no skills are provided. | Explicit Uncertainty Handler | No prompt eliminates 100% of model variance. |
| **D1** | Edge Case Handling | Upload unsupported file type; show immediate friendly validation error. | Input Validation Layer | Edge cases are continuously expanded. |
| **D2** | Failure Resilience | Simulate network interrupt; show profile data remains uncorrupted. | State Preservation Guard | External storage outages require network retry. |
| **E1** | Input Validation | Submit malformed form data; show field-level rejection. | Zod / Schema Validation Layer | Input quality sets upper bound on intelligence accuracy. |
| **E2** | Targeted AI Usage | Show exact boundary where AI is invoked vs pure TypeScript rules. | Dual-System Separation Architecture | AI is invoked selectively for semantic understanding. |
| **E3** | Output Utility | Trace JD upload to prioritized practice recommendation in 3 clicks. | End-to-End Workflow Pipeline | Dependent on user completing practice interactions. |
| **E4** | Schema Validation | Demonstrate rejected malformed AI output and automatic fallback. | Output JSON Schema Validator | Complex unstructured text requires careful formatting. |
| **E5** | Rule vs AI Distinction | Compare hard eligibility pass/fail with nuanced qualitative fit rating. | Eligibility vs. Role Fit Separation | Scoring formula weights remain documented. |
| **E6** | Explainability | Inspect "Why this score?" breakdown on Career Readiness card. | Readiness Contributor Engine | Explainability displays factors, not neural weights. |
| **E7** | State Consistency | Verify updated skills reflect identically in CV, JD, and Prep views. | Centralized State Store | Client caching requires cache-invalidation discipline. |
| **F1** | Multi-Turn Chat | Ask about a target role; follow up with "Am I eligible?"; show continuity. | Ask Career Saathi Drawer | Context window is bounded to maintain relevance. |
| **F2** | Chat Fallback | Ask question with missing profile data; show request for missing facts. | Controlled Dialogue Strategy | Requires student to provide relevant evidence first. |
| **F3** | Off-Topic Guard | Ask non-career question (e.g. baking recipes); show courteous refocusing. | Scope Guardrail System Prompt | System maintains focused career intelligence persona. |
| **F4** | AI Disclosures | Point to "AI Interpreted" and RAG framework badges on assistant answers. | Provenance UI Components | Disclosures are concise to preserve readability. |
| **F5** | Persona Alignment | Show assistant acting as a career coach, not a generic search engine. | Career Saathi Coaching Persona | Coaching advice is guidance, not guaranteed outcome. |
| **F6** | Ambiguity Handling | Ask "How am I doing?"; show assistant prompting for specific target role. | Clarification Prompt Strategy | Does not guess or hallucinate user intentions. |
| **F7** | Cross-Screen Truth | Verify assistant answers match values displayed on the Command Center. | Authoritative Database Context | Natural language nuances vary, core numbers do not. |

---

## 15. Implementation Roadmap (Phases 0–13)

- **Phase 0 — Foundation**: Centralized configuration, database connection, Gemini client proxy, base routing, error handling. *(Complete & Active)*
- **Phase 1 — Student Intelligence Profile**: Profile entities, CRUD, provenance classification, profile completeness tracker. *(Complete & Active)*
- **Phase 2 — Document Pipeline**: Universal file uploader, text extraction, staged verification workflow. *(Complete & Active)*
- **Phase 3 — Academic Intelligence**: Deterministic CGPA calculator, trajectory forecasting, backlog tracking. *(Complete & Active)*
- **Phase 4 — Career & Profile Intelligence**: 5-tier evidence grading (L0–L4), relevance tagging, Profile Strength scoring. *(Complete & Active)*
- **Phase 5 — JD / Opportunity Intelligence**: JD ingestion, Must/Preferred classification, eligibility vs Role Fit. *(Complete & Active)*
- **Phase 6 — CV & LinkedIn Intelligence**: CV gap analysis, LinkedIn positioning audit (zero scraping). *(Complete & Active)*
- **Phase 7 — Application Intelligence**: Application lifecycle management, event history timeline, funnel metrics. *(Complete & Active)*
- **Phase 8 — Preparation Intelligence**: AI Practice Coach, STAR interview evaluations, performance history. *(Complete & Active)*
- **Phase 9 — Readiness & Analytics**: Multi-dimensional Career Readiness score, contributor explanations, trend tracking. *(Complete & Active)*
- **Phase 10 — Ask Career Saathi & Action Center**: Contextual chat drawer, dynamic Next Best Actions list. *(Complete & Active)*
- **Phase 11 — Report Center & Authorized Gmail**: 10 report types, PDF compilation, OAuth Gmail dispatch. *(Complete & Active)*
- **Phase 12 — System Hardening & Validation**: Cross-pillar consistency audit, edge-case simulation, failure resilience. *(Current Focus)*
- **Phase 13 — Deployment & Demonstration**: Production packaging, live academic demonstration walkthroughs. *(Final Phase)*

---

## 16. Testing Strategy

- **Unit Testing**: Pure deterministic calculations (CGPA math, credit sums, eligibility rule checks).
- **AI Contract Testing**: Verification of Gemini response schemas, JSON validation, fallback triggering on invalid responses.
- **Integration Testing**: Server API endpoints, database persistence, RAG document indexing, PDF generation.
- **Workflow & Journey Testing**: Full student lifecycle (Onboarding → Document Upload → JD Fit → Interview Practice → Readiness → Report Generation).
- **Security & Authorization Testing**: Ensuring user isolation across endpoints, absence of exposed secrets in client code, prompt injection resistance.
- **Edge-Case & Resilience Testing**: Corrupted inputs, API downtime simulation, partial data handling.

---

## 17. Deployment Readiness Plan

1. **Environment Configuration**: Ensure `GEMINI_API_KEY`, `PORT=3000`, and all database environment variables are configured.
2. **Database Verification**: Validate persistent storage connection and table schemas.
3. **Build & Bundle Validation**: Run `compile_applet` and `lint_applet` to guarantee clean builds.
4. **Dev Server Stability**: Verify Express/Vite full-stack server running on port 3000 without orphan processes.
5. **Academic Demo Script**: Walk through the recommended demonstration sequence (Steps 1–14).

---

## 18. Requirement Traceability Matrix

| Requirement | Module | Database Entity | Deterministic Logic | AI / RAG Logic | UI View | Security / Validation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Verified Profile | Pillar 1 | `student_profiles`, `skills` | Completeness % | Tagging suggestions | `ProfileIntelligenceView` | User isolation, input sanitization | **LOCKED / IMPLEMENTED** |
| Academic Trajectory | Pillar 2 | `education_records` | CGPA calculation, trends | Curriculum advice | `AcademicIntelligenceView` | Marksheet discrepancy flagging | **LOCKED / IMPLEMENTED** |
| Evidence Grading | Pillar 3 | `projects`, `experiences` | L0–L4 count | Relevance classification | `CareerIntelligenceView` | Proof URL & artifact verification | **LOCKED / IMPLEMENTED** |
| Eligibility & Role Fit| Pillar 4 | `job_descriptions`, `jd_analyses`| Hard cutoff rules | Semantic fit rating | `OpportunityIntelligenceView` | Prompt injection isolation | **LOCKED / IMPLEMENTED** |
| CV & LinkedIn Audit | Pillars 5 & 6 | `cv_records`, `linkedin_profiles`| Completeness checks | Headline/gap analysis | `CVIntelligenceView`, `LinkedInView`| Zero unauthorized scraping | **LOCKED / IMPLEMENTED** |
| Application Funnel | Pillar 7 | `applications`, `events` | Funnel conversion % | Follow-up tips | `ApplicationIntelligenceView` | Validated state machine | **LOCKED / IMPLEMENTED** |
| AI Practice Coach | Pillar 8 | `practice_sessions`, `answers` | Score aggregation | STAR rubric feedback | `PreparationIntelligenceView` | Empty answer & failure fallbacks | **LOCKED / IMPLEMENTED** |
| Career Readiness | Pillar 9 | `readiness_snapshots` | Weighted dimension math | Factor explanation | `ReadinessAnalyticsView` | Score explainability engine | **LOCKED / IMPLEMENTED** |
| RAG Frameworks | Cross-Product | File system (`/RAG_KNOWLEDGE_BASE/`)| Dynamic file indexing | Framework prompt injection | `RAGKnowledgeBaseView` | Immutable markdown sources | **LOCKED / IMPLEMENTED** |
| Action Center | Cross-Product | Aggregated gaps | Priority sorting | Recommendation drafting| `ActionCenterView` | User-scoped action updates | **LOCKED / IMPLEMENTED** |
| Report Generation | Cross-Product | `reports` | Metrics aggregation | Executive summaries | `ReportCenterView` | PDF compilation & storage isolation | **LOCKED / IMPLEMENTED** |
| Authorized Gmail | Cross-Product | `email_logs` | Audit logging | Subject/body generation | `ReportCenterView` (Email Modal)| Explicit OAuth user consent | **LOCKED / IMPLEMENTED** |

---

## 19. Open Decision Register

| ID | Decision Item | Context & Trade-offs | Current Status | Recommended Approach | Blocked? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OD-01** | Production PDF Engine | ReportLab (Python service) vs pdfmake / PDFKit (Node.js full-stack). | **PROPOSED** | Node-native full-stack generation ensures zero cross-language runtime overhead in AI Studio. | **No** |
| **OD-02** | Exact Formula Weights for Readiness | Universal mathematical formula vs contextual role-specific weights. | **PROPOSED** | Keep weights contextual and transparent in readiness explanations rather than hardcoded global constants. | **No** |
| **OD-03** | Permanent Cloud Storage Backend | Supabase Storage vs Google Cloud Storage buckets. | **OPEN** | Abstract storage interface; local filesystem staging in dev, cloud object storage in production. | **No** |
| **OD-04** | Gmail OAuth Token Refresh Lifecycle | In-memory token vs encrypted database session storage. | **OPEN** | Ephemeral client-side session tokens with server proxy dispatch to prevent storing refresh tokens. | **No** |

---

## 20. Removed Feature Register

| Removed Item | Former Scope / Conception | Final Decision & Reason |
| :--- | :--- | :--- |
| **Professor Evaluation Module** | Earlier planning suggested an in-app evaluation module for professors. | **PERMANENTLY REMOVED FROM PRODUCT**. Professor Evaluation exists exclusively as an external academic assessment framework (Document 15). The professor is an external evaluator, NOT an application persona or user. |
| **Professor Dashboard** | Dedicated dashboard screen for faculty reviews. | **PERMANENTLY REMOVED**. No professor portal, navigation tab, or screen. |
| **Professor User Role & Auth** | Professor authentication role in database. | **PERMANENTLY REMOVED**. Only Student / Job Seeker personas exist in application scope. |
| **Automated LinkedIn Scraping** | Direct scraping of LinkedIn profile URLs. | **PERMANENTLY REMOVED**. Security & Terms-of-Service compliance; user explicitly enters or pastes their LinkedIn profile text. |
| **Hiring Probability Estimates** | Outputting numeric hiring chance (e.g. "78% chance of selection"). | **PERMANENTLY PROHIBITED**. Unethical and unsupported AI speculation. System provides preparation gap analysis and readiness scores only. |

---

## 21. Final Implementation Readiness Report

- **Product Identity & Scope**: 100% Locked. Career Saathi AI operates across the 9 approved pillars and 4 cross-product layers.
- **Professor Evaluation Separation**: 100% Enforced. Verified that no professor-facing features exist in the application code, navigation, or database.
- **Architectural Integrity**: 100% Coherent. Deterministic engine owns calculations and state transitions; Gemini owns qualitative reasoning; RAG owns methodology frameworks.
- **Implementation Status**: All 9 pillars, the Career Command Center, Action Center, Report Center, RAG Knowledge Base, and Ask Career Saathi drawer are active and compiling cleanly.
- **Verdict**: **SYSTEM ARCHITECTURE AND SPECIFICATION ARE FULLY VALIDATED AND IMPLEMENTATION-READY.**
