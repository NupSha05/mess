# RAG-01 — Academic Intelligence & Education Framework
**Career Saathi AI — Controlled RAG Knowledge Base**

**Status:** PROPOSED KNOWLEDGE-BASE ARTIFACT  
**Purpose:** Retrieval-grounded, reusable policy and framework knowledge. This document is not student-specific data and must not override deterministic application rules.

---

## 1. Purpose
This framework defines the reusable knowledge Career Saathi AI may retrieve when interpreting academic information. It operationalizes the source requirements around CGPA methodology, projection principles, education validation, and completed/pursuing logic. Student-specific values remain in the database and source documents; this framework supplies interpretation rules.

---

## 2. Scope
- Education history and academic records
- CGPA/percentage/grade interpretation
- Completed versus pursuing status
- Academic-document validation
- Projection and reachability reasoning
- Academic-to-career connection
- Uncertainty and conflict handling

---

## 3. Core Principles
- **Never invent academic facts.**
- **Never use an LLM as the authoritative calculator for arithmetic.**
- **Separate extracted values from verified values.**
- **Preserve the source of every academic value.**
- **When records conflict, surface the conflict instead of silently choosing a value.**
- **Projection is a mathematical scenario, not a guarantee.**
- **Eligibility decisions must be rules-based.**

---

## 4. Academic Data Semantics

| Concept | Meaning | Authority | Typical use |
| :--- | :--- | :--- | :--- |
| **Raw extracted value** | Value extracted from a transcript/CV/document | Source document; unverified until validated | Candidate review |
| **User-entered value** | Value supplied by the student | User; may require verification | Profile completion |
| **Verified value** | Value confirmed through an accepted source/process | System verification state | Eligibility/calculation |
| **Deterministic calculation** | Arithmetic derived from stored values | Application engine | CGPA, projection, timelines |
| **AI interpretation** | Qualitative explanation of academic context | Gemini + retrieved framework | Narrative/recommendation |
| **Uncertain value** | Value whose correctness cannot be established | No authoritative status | Warning/fallback |

---

## 5. CGPA Methodology
Career Saathi should preserve the institution's stated calculation method when available. If the institution provides a formula, that formula is authoritative for that student's record. If a formula is not available, the system should not silently invent an institutional conversion. It may present the stored CGPA as reported and explain that conversion is unavailable.
- Store value, scale, source, term/period, and verification state.
- Do not compare values on different scales without normalization rules.
- Do not infer a final CGPA from incomplete terms unless the available academic structure supports a deterministic calculation.
- Clearly distinguish current CGPA from projected/future CGPA.

---

## 6. Projection Principles
1. Identify the current verified academic state.
2. Identify remaining academic components only when the program structure is known.
3. Determine whether a target is mathematically reachable using deterministic arithmetic.
4. Show assumptions and remaining credits/terms used.
5. Label the result as a projection/scenario.
6. Never describe a projection as a guaranteed outcome.

---

## 7. Completed vs Pursuing Logic

| State | Interpretation | System behavior |
| :--- | :--- | :--- |
| **Completed** | Program/degree is completed according to reliable evidence | Treat final academic result as final unless correction is supplied |
| **Pursuing** | Program is currently underway | Use current verified results; future values may be projected only with sufficient inputs |
| **Unknown** | Status cannot be established | Ask for clarification or flag uncertainty |
| **Conflicting** | Sources disagree | Preserve both source values and request verification |

---

## 8. Academic Eligibility Logic
Eligibility is deterministic whenever the requirement is expressible as a rule. Example: if a JD states minimum CGPA 6.5 and the verified student CGPA is 6.42, the system must identify an eligibility concern; Gemini must not decide whether 6.42 satisfies 6.5.

---

## 9. Academic-to-Career Connection
- Academic alignment is one component of broader role fit, not the entire fit.
- A course can support skill evidence but does not automatically equal applied proficiency.
- A project/internship may increase evidence strength beyond coursework alone.
- The relevance of an academic subject depends on the target role and career direction.
- Academic weakness and profile weakness are not interchangeable concepts.

---

## 10. Retrieval Guidance
- Retrieve this framework when the user asks about academic interpretation, CGPA, projections, eligibility logic, or academic readiness.
- Combine with student records for personalized answers.
- Do not retrieve it as a substitute for the database.
- If retrieved guidance conflicts with a deterministic application rule, deterministic rule wins and the conflict should be logged.

---

## 11. Examples
- **Example A — Minimum CGPA**: JD says 6.5; verified CGPA is 6.42 -> eligibility concern. The system may then separately calculate whether the target is mathematically reachable if the student is still pursuing the program.
- **Example B — Course vs skill**: A student completed a SQL course but has no applied evidence -> the course may support Level 1 evidence, but should not be represented as demonstrated professional impact.

---

## 12. Limitations
This framework does not define a universal CGPA conversion, institution-specific grading rules, or a final numerical Career Readiness formula. Those require authoritative source data or separately locked product decisions.
