# RAG-02 — Career Evaluation, Evidence & Profile Framework
**Career Saathi AI — Controlled RAG Knowledge Base**
*Status: PROPOSED KNOWLEDGE-BASE ARTIFACT | Document ID: RAG-02 | Version: 1.0.0*
*Purpose: Retrieval-grounded, reusable policy and framework knowledge. This document is not student-specific data and must not override deterministic application rules.*

---

## 1. Purpose
This framework defines the reusable policy for evaluating evidence, profile strength, relevance, contextual career fit, gaps, and development priorities. It implements the source principles that scoring must be contextual, evidence-based, explainable, dynamic, role-aware, career-stage-aware, and data-aware.

## 2. Evaluation Philosophy
- **Contextual does not mean arbitrary.**
- Evidence must be traceable to a source.
- Profile Strength, Role Fit, and Career Readiness answer different questions.
- AI can interpret evidence but must not secretly invent numerical weights.
- Career-stage and target-role context must be explicit.
- Recency, depth, relevance, and demonstrated impact matter.

## 3. Evidence Strength Scale
| Level | Name | Typical Evidence | Interpretation |
| :--- | :--- | :--- | :--- |
| **0** | **No Evidence** | Claim with no supporting evidence | Do not treat capability as demonstrated |
| **1** | **Basic Evidence** | Course, certification, self-report | Awareness / foundational exposure |
| **2** | **Applied Evidence** | Academic project or internship | Capability has been applied in a bounded context |
| **3** | **Strong Applied Evidence** | Multiple applications through projects / internships / work | Repeated application with stronger confidence |
| **4** | **Demonstrated Impact** | Professional application with meaningful outcome | Strongest evidence; impact is demonstrable |

## 4. Relevance Classification
| Class | Meaning | Use |
| :--- | :--- | :--- |
| **Directly relevant** | Evidence closely matches target requirement | Strong contribution to role fit |
| **Transferably relevant** | Evidence supports adjacent capability such as problem solving or systems understanding | Contextual contribution |
| **Low relevance** | Evidence has limited connection to target role | May remain in profile but should not dominate fit |

## 5. Evidence Provenance
- **Source type**: profile entry, academic record, CV, LinkedIn, project, internship, employment, certification, achievement, research.
- **Verification state**: unverified, extracted, verified, system-derived.
- Timestamp / version should be retained where useful.
- AI interpretation must cite or reference the underlying evidence internally.
- Conflicting evidence must remain visible.

## 6. Profile Strength
Profile Strength answers: *"How strong and well-supported is this candidate profile overall?"* It should consider career stage, experience, target direction, evidence depth, relevance, recency, demonstrated impact, academics, projects, skills, certifications, achievements, and professional history.

## 7. Role Fit
Role Fit answers: *"How well does this candidate's demonstrated evidence align with this specific opportunity?"* It should consider requirement importance, evidence strength, relevance, experience alignment, academic alignment, and career alignment. The product must not permit Gemini to invent a hidden formula. Any numerical implementation must be explicit, versioned, testable, and explainable.

## 8. Career Readiness
Career Readiness is broader than role fit. It reflects preparedness across relevant dimensions such as profile quality, academics, skills, opportunity readiness, and interview/preparation readiness. Its exact aggregation is an implementation decision and should remain transparent and versioned.

## 9. Career-Stage Context
| Stage | Evidence Emphasis | Important Caution |
| :--- | :--- | :--- |
| **Student / fresher** | Academics, projects, internships, certifications, competitions | Do not penalize lack of full-time experience as if it were a failed requirement unless the role explicitly requires it |
| **Early career** | Professional experience, projects, applied skills, impact, academics where relevant | Prioritize relevant experience and outcomes |
| **Experienced** | Professional impact, domain relevance, leadership, demonstrated skills | Avoid overweighting coursework or generic certifications |

## 10. Gap Classification
| Gap | Meaning | Typical Action |
| :--- | :--- | :--- |
| **Critical** | Blocks eligibility or represents a major essential requirement gap | Clarify eligibility or prioritize immediate remediation |
| **High Priority** | Materially reduces fit/readiness | Targeted development / action |
| **Development Opportunity** | Useful improvement but not a major blocker | Planned improvement |
| **Low Priority** | Minor enhancement | Optional refinement |

## 11. Three-Way CV/Profile Distinction
- **Profile Gap**: the candidate genuinely lacks evidence.
- **CV Gap**: evidence exists but is not communicated effectively.
- **Evidence Gap**: a claimed capability lacks sufficiently strong supporting evidence.

## 12. Explainability Requirements
1. State what the assessment measures.
2. Identify the strongest supporting evidence.
3. Identify missing/weak evidence.
4. Explain contextual relevance.
5. Separate deterministic facts from AI interpretation.
6. Give actionable next steps.
7. State important limitations.

## 13. What the AI Must Not Say
- Guaranteed selection.
- Guaranteed rejection when only fit is being assessed.
- Unsupported hiring probability.
- Fabricated experience, impact, or skill evidence.
- A numerical score without an explainable basis.

## 14. Retrieval Guidance
Retrieve this framework for profile evaluation, evidence interpretation, role-fit explanations, gap analysis, skill evidence discussions, and development recommendations. Student-specific evidence must come from the database/document layer.
