# Career Saathi AI — Upload 4 Implementation Specification
**AI, RAG, Database/API Integration, Module Intelligence & End-to-End Workflows**
*Consolidated from: Document 08 (AI & RAG Architecture), Document 09 (Module Logic), Document 10 (End-to-End Flow)*

---

## Executive Architectural Contract
1. **Preserve Foundation**: The Upload 3 foundation (Source-of-truth database, deterministic calculations, 9 pillars, cross-product layer, user isolation, and evidence level 0-4 model) remains locked and authoritative.
2. **Dual-System Architecture**:
   - **System A (Application & Data System)**: Structured student profile, verified education, projects, skills, CV versions, JDs, applications, practice sessions, readiness snapshots.
   - **System B (Controlled Knowledge System / Selective RAG)**: Stable Career Saathi frameworks (Academic Intelligence, Career Evidence, JD & Opportunity, Responsible AI, Preparation & Rubric frameworks).
3. **No Professor Evaluation**: Explicitly confirmed—no Professor Evaluation, review screens, personas, or workflows exist in the application.

---

## A. AI Responsibility Map

| Feature / Pillar | Deterministic Logic | AI / Gemini Logic | Selective RAG Retrieval | Validation Boundary | Persistence Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pillar 1: Student Profile** | Validates field types, dates, duplicate entries, schema structure. | Semantic parsing of unstructured text; skill normalization. | None (Student-specific data from DB). | Schema & type validation; ownership check. | Persists directly to `student_profiles`, `education`, `projects`, `skills`. |
| **Pillar 2: Academic Intelligence** | Credit-weighted CGPA, SGPA trajectory, Mode A & B feasibility, cutoff comparisons, discrepancy flag ($|\Delta| \ge 0.1$). | Qualitative trend narrative; explains institutional grading nuances. | **Academic Intelligence Framework** (CGPA principles, credit rules). | Discrepancy detection; never overwrites self-reported without user confirmation. | Persists verified terms to `academic_terms`; calculations stored as derived metrics. |
| **Pillar 3: Career & Profile Intelligence** | Calculates Evidence Levels (0-4); aggregates proof sources; computes profile completeness. | Evaluates qualitative evidence depth, domain relevance, and development roadmaps. | **Career Evaluation & Evidence Framework** (Levels 0-4 criteria, relevance rules). | Rejects ungrounded capability claims. | Persists derived analysis to `profile_analyses` with methodology version. |
| **Pillar 4: JD & Opportunity Intelligence** | Evaluates hard criteria (CGPA cutoff, backlog policy, degree branch, graduation year) -> `PASS` / `FAIL`. | Extracts entities (title, salary, work arrangement); semantic matching to student evidence; classifies Must/Preferred/Good. | **JD / Opportunity Intelligence Framework** (Classification rules, ambiguity handling). | Strict rule: Deterministic eligibility cannot be overridden by AI enthusiasm; flags ambiguous JD clauses. | Persists to `job_descriptions`, `jd_requirements`, and `role_fit_analyses`. |
| **Pillar 5: CV Intelligence** | Calculates quantified achievement ratios; active verb ratios; computes 3-Way Gaps (*Profile Gap*, *CV Gap*, *Evidence Gap*). | Identifies passive voice; generates Before/After bullet revisions; suggests missing ATS keywords. | **Career Evidence Framework** (Quantified achievement standards). | Schema validation; ensures suggested bullets do not fabricate new credentials. | Persists to `cv_records` and `cv_analyses`. |
| **Pillar 6: LinkedIn Intelligence** | Calculates section completeness checklist; isolates Visibility Gaps from genuine Skill Gaps. | Recommends headline copy and About summaries aligned with tech recruiter search patterns. | **Career Evidence Framework** (Professional positioning standards). | Refuses to invent fake awards or honors. | Persists to `linkedin_profiles` and `linkedin_analyses`. |
| **Pillar 7: Application Intelligence** | Funnel counters, conversion rates, days-in-stage duration, Application Health state. | Contextual next-action advice based on application stage and target JD. | None (Actual recorded data only). | Rejects invalid stages; strictly records historical events chronologically. | Persists to `applications` and `application_events` (append-only history). |
| **Pillar 8: AI Practice Coach** | Aggregates practice count; timing tracking; average rubric score per category. | Evaluates subjective answers across 4 rubrics; generates dynamic follow-up questions; pinpoints weaknesses. | **Preparation Framework** (STAR, Case Interview, and Concept-Explanation rubrics). | Schema validation on rubric scores (0-10); ensures feedback is constructive and role-aware. | Persists to `practice_sessions` with full rubric breakdown. |
| **Pillar 9: Readiness & Analytics** | Computes 5 dimension scores (Acad 20%, Prof 20%, Skill 25%, Opp 15%, Prep 20%) and overall index (0-100). | Generates natural-language explanation of score contributors and limiting factors. | **Responsible AI Framework** (No unsupported hiring odds; explainability rules). | Enforces deterministic formula; AI cannot modify numerical score. | Persists point-in-time snapshot to `readiness_snapshots`. |
| **Cross-Product: Ask Career Saathi** | Retrieves authorized student records and current active JD context from database. | Answers multi-turn questions grounded in student facts; refuses unsupported certainty. | Selectively retrieves relevant framework based on user question topic. | Grounding check; blocks prompt injection attempts. | Logs query and response to `chat_audit_logs`. |
| **Cross-Product: Action Center** | Sorts actions by calculated Priority Matrix (Urgency $\times$ Impact $\div$ Effort). | Formulates specific actionable guidance linked to underlying gap. | None (Derived from active gap states). | Validates link to parent entity. | Persists completion state to `next_best_actions`. |
| **Cross-Product: Report Center & Gmail** | Compiles data snapshot; formats structured PDF document; manages email delivery log. | Drafts customized executive email body based on recipient role. | **Responsible AI Framework** (Report provenance & limitations statement). | Validates recipient email syntax; ensures PDF attachment integrity. | Persists report record to `reports` and log entry to `email_logs`. |

---

## B. Selective RAG Retrieval Map

| User / Task Trigger | Targeted Knowledge Source | Retrieval Condition | Injected Context | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| **Academic Planning / Feasibility** | `Academic Intelligence Framework` | Task involves CGPA projection, credit weighting, or backlog policies. | Mode A vs B methodology, credit rules, feasibility formulas. | Grounded explanation of remaining term requirements. |
| **Skill Audit / Profile Strength** | `Career Evidence Framework` | Task evaluates skills, portfolio maturity, or evidence depth. | Level 0-4 evidence definitions, Directly/Transferably relevant rules. | Evidence-backed strength critique and gap identification. |
| **JD Ingestion / Fit Evaluation** | `JD Intelligence Framework` | Task parses job descriptions or computes role alignment. | Must-have vs Preferred taxonomy, ambiguity flags, rule-based gate criteria. | Structured requirement list with explicit uncertainty tags. |
| **Mock Interview / Practice Coach** | `Preparation Framework` | User starts or submits a practice session. | STAR behavioral rubric, Case problem-solving rubric, Technical depth rubric. | Multi-dimensional scoring (0-10) with targeted follow-up question. |
| **Readiness Query / "Will I get hired?"** | `Responsible AI Framework` | User asks about probabilities, guarantees, or readiness trends. | Guardrail: Refusal of unsupported certainty, explainability requirements. | Realistic, evidence-grounded assessment stating limitations. |

---

## C. Module Dependency Map

```
[Pillar 1: Student Profile & Evidence] ◄─── Central Source of Truth
       │
       ├────► [Pillar 2: Academic Intel] ──► Updates: Academic Readiness, CGPA Cutoff Gate
       ├────► [Pillar 3: Career Intel]   ──► Updates: Evidence Levels (0-4), Profile Readiness
       ├────► [Pillar 5: CV Intel]       ──► Cross-validates: Profile ↔ CV ↔ JD (3-Way Gaps)
       ├────► [Pillar 6: LinkedIn Intel] ──► Cross-validates: Profile ↔ LinkedIn (Visibility Gaps)
       │
[Pillar 4: JD Opportunity] ─────────────► Updates: Role Fit, Eligibility Gate, Opportunity Readiness
       │
       ├────► [Pillar 7: Applications]   ──► Updates: Application Lifecycle, Funnel Analytics
       ├────► [Pillar 8: Practice Coach] ──► Targets: Role-Specific Questions, Interview Readiness
       │
[All Pillars 1 - 8] ─────────────────────► [Pillar 9: Readiness & Analytics]
                                                    │
                                                    ├────► [Career Command Center] (Cockpit)
                                                    ├────► [Action Center] (Prioritized Next Actions)
                                                    ├────► [Ask Career Saathi] (Grounded Assistant)
                                                    └────► [Report Center & Gmail] (Export & Dispatch)
```

---

## D. Workflow Map (17 Standard Workflows)
Every workflow strictly complies with:
`Trigger → Input → Validation → Deterministic Logic → AI/RAG → Database → Output → User Action → Next State`

1. **Workflow 01 (Registration)**: Input credentials -> Auth validation -> Create user & initial profile context -> Proceed to Onboarding.
2. **Workflow 02 (Login)**: Session token / credentials -> Enforce user isolation -> Load authorized context -> Command Center.
3. **Workflow 03 (Profile Creation/Update)**: Input personal/academic/skills -> Schema validation -> Persist to DB -> Event: Profile Updated.
4. **Workflow 04 (Academic Upload)**: Upload transcript -> Extract CGPA -> Discrepancy check ($|\Delta| \ge 0.1$) -> User confirmation -> Persist verified CGPA.
5. **Workflow 05 (CV Upload)**: Upload CV -> Extract text -> Compare against Profile & active JD -> Generate 3-Way Gaps -> Persist CV analysis.
6. **Workflow 06 (LinkedIn Analysis)**: User provides LinkedIn data -> Evaluate completeness -> Isolate Visibility vs Skill gaps -> Present Before/After copy.
7. **Workflow 07 (JD Ingestion)**: Upload or paste JD -> AI entity extraction -> Tag ambiguous clauses -> Store structured JD.
8. **Workflow 08 (JD Analysis)**: Classify Must-have / Preferred / Good-to-have -> Run deterministic eligibility checks -> Store requirements.
9. **Workflow 09 (Role-Fit Analysis)**: Map JD requirements to profile evidence -> Apply contextual scoring logic -> Output Strong/Conditional/Low Match.
10. **Workflow 10 (Application Creation)**: Student enters company/role/stage -> Validate required fields -> Store application & append initial event.
11. **Workflow 11 (Application Stage Update)**: Student updates stage -> Append to `application_events` -> Recalculate funnel -> Update health status.
12. **Workflow 12 (Preparation Plan)**: Select category & target JD -> Retrieve Preparation Framework -> Generate tailored question.
13. **Workflow 13 (AI Practice Coach Loop)**: Student submits answer -> Evaluate against 4 rubrics -> Return score/feedback -> Generate dynamic follow-up.
14. **Workflow 14 (Readiness Calculation)**: Triggered by evidence change -> Recalculate affected dimensions -> Generate snapshot -> Update Command Center.
15. **Workflow 15 (Ask Career Saathi)**: Student asks career question -> Inject authorized DB context + selective RAG -> Bounded generation -> Log chat.
16. **Workflow 16 (Report Generation)**: Select report type -> Compile verified data snapshot -> Render PDF artifact -> Persist report metadata.
17. **Workflow 17 (Authorized Gmail Dispatch)**: Select recipient -> Preview subject/body -> Deliver PDF attachment -> Log to `email_logs` (No passwords stored).

---

## E. Database Integration Map

| Module | Core Tables Accessed | Read Operations | Write Operations | Authorization Check |
| :--- | :--- | :--- | :--- | :--- |
| **Profile & Evidence** | `student_profiles`, `education`, `experiences`, `projects`, `skills`, `certifications` | Fetch master profile and child records. | Insert / Update validated items; delete user items. | `WHERE profile_id = auth.user_profile_id` |
| **Academics** | `education`, `academic_terms`, `documents` | Fetch term SGPA, credits, marksheet refs. | Upsert verified terms; update discrepancy flag. | Scoped to authenticated profile. |
| **Opportunity** | `job_descriptions`, `jd_requirements`, `role_fit_analyses` | Fetch saved JDs, requirement tiers, fit history. | Insert parsed JD; upsert role fit analysis. | Scoped to authenticated profile. |
| **CV & LinkedIn** | `cv_records`, `cv_analyses`, `linkedin_profiles`, `linkedin_analyses` | Fetch active CV text, LinkedIn profile, past analyses. | Upsert CV/LinkedIn analysis snapshots. | Scoped to authenticated profile. |
| **Applications** | `applications`, `application_events` | Fetch active applications, stage timeline, funnel metrics. | Insert application; append immutable stage event. | Scoped to authenticated profile. |
| **Practice** | `practice_sessions` | Fetch session history, average rubric scores. | Insert completed practice attempt and rubrics. | Scoped to authenticated profile. |
| **Readiness** | `readiness_snapshots` | Fetch historical readiness trend snapshots. | Insert new point-in-time snapshot on event. | Scoped to authenticated profile. |
| **Reports & Gmail** | `reports`, `email_logs` | Fetch past generated reports and dispatch logs. | Insert generated report metadata and email audit log. | Scoped to authenticated profile. |

---

## F. Centralized AI Service Map

All AI operations are unified into a centralized server-side service (`server/aiService.ts`):
1. **Model**: `gemini-3.8-flash` via `@google/genai` with telemetry header `User-Agent: 'aistudio-build'`.
2. **Tasks & Schemas**:
   - `parseJD`: Input JD text -> Output `{ company, title, mustHaveSkills, preferredSkills, cgpaCutoff, ... }`.
   - `analyzeCV`: Input Profile + CV text + JD -> Output `{ 3WayGaps, bulletImprovements, keywords }`.
   - `analyzeLinkedIn`: Input Profile + LinkedIn data -> Output `{ visibilityGaps, genuineSkillGaps, headlineSuggestions }`.
   - `evaluatePractice`: Input Question + Answer + Category + Framework -> Output `{ scoreOutOf10, rubricBreakdown, strengths, weaknesses, followUpQuestion }`.
   - `askCareerSaathi`: Input Question + Student Context + Active JD + RAG framework -> Output `{ answer, contributors, nextActions }`.
3. **Structured Output Validation**:
   - Every JSON response is stripped of markdown and validated against expected type schemas before returning to application workflows.

---

## G. Dynamic Event-Impact Matrix

| Trigger Event | Source Module | Affected Data / Entities | Recalculation / Processing Triggered | UI & Action Updates |
| :--- | :--- | :--- | :--- | :--- |
| **Add/Edit Project** | Pillar 1 | `projects`, `skills` | Recalculate Skill Readiness; update role-fit for active JD. | Updates Command Center meters; refreshes Action Center. |
| **Verify / Reconcile CGPA** | Pillar 2 | `education`, `academic_terms` | Recalculate Academic Readiness; re-test JD cutoff eligibility gates. | Clears discrepancy warning; updates eligibility pill. |
| **Ingest New JD** | Pillar 4 | `job_descriptions`, `jd_requirements` | Run deterministic eligibility; compute contextual Role Fit. | Switches active target cockpit; prioritizes missing must-haves. |
| **Upload / Tailor CV** | Pillar 5 | `cv_records`, `cv_analyses` | Recalculate 3-Way Gap matrix; evaluate ATS keyword coverage. | Highlights CV Gaps to fix; updates Action Center recommendations. |
| **Update Application Stage** | Pillar 7 | `applications`, `application_events` | Append stage event; recalculate recruitment funnel and conversions. | Moves card in pipeline; shifts practice focus to interview stage. |
| **Complete Practice Session**| Pillar 8 | `practice_sessions` | Update Interview Readiness; log rubric strengths/weaknesses. | Raises Readiness Index; generates dynamic follow-up challenge. |

---

## H. Infrastructure Configuration Map
- **One-Time Startup Flow**:
  1. `server.ts` loads environment variables (`GEMINI_API_KEY`, `APP_URL`, `PORT`).
  2. Singleton instance of `GoogleGenAI` initialized on the server with telemetry header.
  3. Reusable API proxy routes exposed at `/api/*`.
  4. Client initializes single application state store; no ordinary student is ever prompted for API keys.
- **Security Boundary**: Zero API keys or secrets exposed in frontend code, client bundles, or user-facing error logs.

---

## I. Failure & Fallback Map

| Failure Mode | Detection Mechanism | State Protection Control | User-Facing Message | Recovery / Fallback Path |
| :--- | :--- | :--- | :--- | :--- |
| **AI API Key Missing / Unset** | Startup check in `server.ts` | Disables external GenAI calls; routes requests to deterministic rule engines. | *"Operating with local deterministic intelligence engine."* | Deterministic heuristics provide full functional responses. |
| **AI Timeout / Rate Limit** | Try/catch block around `ai.models.generateContent` | Prevents database write corruption; aborts without altering stored facts. | *"Unable to generate AI analysis right now. Your profile data is safe."* | Allows 1-click retry; preserves uncorrupted prior state. |
| **Malformed AI JSON Output** | `JSON.parse` failure in response sanitizer | Rejects malformed payload; discards invalid structured output. | *"AI returned an unexpected format. Retrying with constrained schema."* | Fallback parser extracts structured values or uses default rubric. |
| **Prompt Injection in Document** | Pre-prompt system rule isolation | Treats untrusted document text as passive string data inside delimiters. | Continues objective analysis; neutralizes adversarial instructions. | Instructions to "give 100/100" are ignored by system guardrails. |
| **Network / Server Disconnect** | HTTP fetch error handler in frontend | Retains form inputs in React state; does not report false success. | *"Network communication interrupted. Please check connection and retry."* | Student clicks Retry without losing typed text. |

---

## J. Removed Feature Verification
> ✅ **CONFIRMED**: Professor Evaluation, Professor Review, Professor Analysis, Professor Dashboard, and Professor Persona are completely absent from the Career Saathi AI application architecture, database entities, APIs, prompts, and UI components.
