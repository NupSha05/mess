-- ============================================================================
-- Career Saathi AI — Database Schema Migration
-- Migration: 20261008000001_initial_career_saathi_schema.sql
-- PostgreSQL / Supabase Schema for Persistent Career Intelligence Platform
-- Complies with: FOUNDATION_IMPLEMENTATION_SPECIFICATION.md
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. DOMAIN: IDENTITY & MASTER PROFILE
-- ============================================================================

-- Master Student Profile
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    college TEXT DEFAULT '',
    headline TEXT DEFAULT '',
    about TEXT DEFAULT '',
    career_stage TEXT DEFAULT 'Final Year Student',
    linkedin_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    portfolio_url TEXT DEFAULT '',
    profile_status TEXT DEFAULT 'active',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Career Preferences
CREATE TABLE IF NOT EXISTS public.career_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE UNIQUE,
    target_roles TEXT[] DEFAULT ARRAY['Software Development Engineer'],
    target_locations TEXT[] DEFAULT ARRAY['Bengaluru', 'Remote'],
    preferred_work_type TEXT DEFAULT 'Hybrid',
    min_acceptable_ctc TEXT DEFAULT '₹12 LPA',
    target_industries TEXT[] DEFAULT ARRAY['Technology', 'Product Tech'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. DOMAIN: ACADEMICS & EVIDENCE
-- ============================================================================

-- Degree & Academic Program
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL DEFAULT '',
    degree TEXT NOT NULL DEFAULT 'B.Tech',
    branch TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    start_year INT DEFAULT 2022,
    expected_graduation_year INT DEFAULT 2026,
    current_semester INT DEFAULT 1,
    total_semesters INT DEFAULT 8,
    self_reported_cgpa NUMERIC(4,2) DEFAULT 0.00,
    verified_cgpa NUMERIC(4,2) DEFAULT 0.00,
    marksheet_extracted_cgpa NUMERIC(4,2),
    discrepancy_flag BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'unverified',
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Semester-by-Semester Academic Terms
CREATE TABLE IF NOT EXISTS public.academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    education_id UUID NOT NULL REFERENCES public.education(id) ON DELETE CASCADE,
    term_number INT NOT NULL,
    sgpa NUMERIC(4,2) NOT NULL,
    credits INT NOT NULL DEFAULT 24,
    verified BOOLEAN DEFAULT false,
    marksheet_doc_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(education_id, term_number)
);

-- Industry & Internship Experiences
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    duration TEXT,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    impact_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    evidence_level INT NOT NULL DEFAULT 1,
    verification_status TEXT DEFAULT 'unverified',
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects & Code Repositories
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role TEXT DEFAULT 'Solo Developer',
    tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    outcomes TEXT,
    github_url TEXT,
    live_url TEXT,
    evidence_level INT NOT NULL DEFAULT 2,
    verification_status TEXT DEFAULT 'unverified',
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skills & Evidence Mappings
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Core CS',
    evidence_level INT NOT NULL DEFAULT 0,
    supporting_evidence TEXT[] DEFAULT ARRAY[]::TEXT[],
    relevance TEXT NOT NULL DEFAULT 'Directly Relevant',
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuing_org TEXT NOT NULL,
    issue_date TEXT,
    credential_url TEXT,
    verified BOOLEAN DEFAULT false,
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievements & Research Milestones
CREATE TABLE IF NOT EXISTS public.achievements_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'Hackathon / Contest',
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    evidence_url TEXT,
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. DOMAIN: DOCUMENTS & STORAGE METADATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'academic_transcript', 'cv_resume', 'jd_document', 'certification_proof'
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    extraction_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    extracted_data JSONB DEFAULT '{}'::JSONB,
    provenance TEXT DEFAULT 'user_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CV Versions & Parsed Content
CREATE TABLE IF NOT EXISTS public.cv_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    version_number INT DEFAULT 1,
    raw_text TEXT,
    is_active_version BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CV Triad Analyses (Profile ↔ CV ↔ JD)
CREATE TABLE IF NOT EXISTS public.cv_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    cv_record_id UUID REFERENCES public.cv_records(id) ON DELETE SET NULL,
    completeness_score NUMERIC DEFAULT 0,
    quantified_achievements_ratio NUMERIC DEFAULT 0,
    active_voice_ratio NUMERIC DEFAULT 0,
    target_jd_alignment_score NUMERIC DEFAULT 0,
    gaps JSONB DEFAULT '[]'::JSONB,
    bullet_improvements JSONB DEFAULT '[]'::JSONB,
    suggested_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    provenance TEXT DEFAULT 'ai_interpreted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. DOMAIN: LINKEDIN PRESENCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.linkedin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE UNIQUE,
    profile_url TEXT,
    headline_text TEXT,
    about_text TEXT,
    raw_content JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.linkedin_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    completeness_score NUMERIC DEFAULT 0,
    headline_audit JSONB DEFAULT '{}'::JSONB,
    about_audit JSONB DEFAULT '{}'::JSONB,
    visibility_gaps JSONB DEFAULT '[]'::JSONB,
    genuine_skill_gaps JSONB DEFAULT '[]'::JSONB,
    section_checklist JSONB DEFAULT '[]'::JSONB,
    provenance TEXT DEFAULT 'ai_interpreted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. DOMAIN: OPPORTUNITIES & JOB DESCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    function TEXT DEFAULT 'Engineering',
    location TEXT DEFAULT 'Hybrid',
    work_arrangement TEXT DEFAULT 'Hybrid',
    experience_range TEXT DEFAULT '0-2 Years',
    education_requirement TEXT DEFAULT 'B.Tech / B.E.',
    cgpa_cutoff NUMERIC(4,2) DEFAULT 7.00,
    max_backlogs INT DEFAULT 0,
    salary_range TEXT DEFAULT 'Competitive',
    must_have_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    good_to_have_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    key_responsibilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    ambiguous_terms TEXT[] DEFAULT ARRAY[]::TEXT[],
    raw_text TEXT,
    is_active_target BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_fit_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    jd_id UUID NOT NULL REFERENCES public.job_descriptions(id) ON DELETE CASCADE,
    overall_fit_score NUMERIC DEFAULT 0,
    match_tier TEXT DEFAULT 'Conditional Match',
    eligibility_passed BOOLEAN DEFAULT false,
    criteria_breakdown JSONB DEFAULT '[]'::JSONB,
    matched_skills JSONB DEFAULT '[]'::JSONB,
    missing_must_haves JSONB DEFAULT '[]'::JSONB,
    missing_preferred JSONB DEFAULT '[]'::JSONB,
    positive_contributors TEXT[] DEFAULT ARRAY[]::TEXT[],
    limiting_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
    ambiguity_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. DOMAIN: APPLICATION TRACKING & FUNNEL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    jd_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    applied_date TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'Applied',
    stage_updated_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    health_category TEXT NOT NULL DEFAULT 'Healthy',
    health_rationale TEXT DEFAULT 'Application logged in active tracking lifecycle.',
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. DOMAIN: INTERVIEW PREPARATION & COACH
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Practice',
    framework_applied TEXT NOT NULL,
    question TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    evaluation JSONB DEFAULT '{}'::JSONB,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. DOMAIN: READINESS DIAGNOSTICS & EVENT-TO-IMPACT AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.readiness_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    academic_readiness NUMERIC NOT NULL DEFAULT 0,
    profile_readiness NUMERIC NOT NULL DEFAULT 0,
    skill_readiness NUMERIC NOT NULL DEFAULT 0,
    opportunity_readiness NUMERIC NOT NULL DEFAULT 0,
    interview_readiness NUMERIC NOT NULL DEFAULT 0,
    overall_score NUMERIC NOT NULL DEFAULT 0,
    trend TEXT DEFAULT 'stable',
    trigger_event TEXT DEFAULT 'Baseline',
    positive_contributors TEXT[] DEFAULT ARRAY[]::TEXT[],
    limiting_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_impact_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    source_pillar TEXT NOT NULL,
    affected_dimensions TEXT[] DEFAULT ARRAY[]::TEXT[],
    explanation TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. DOMAIN: REPORTS & EXPORT AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    source_data_snapshot JSONB DEFAULT '{}'::JSONB,
    storage_file_path TEXT,
    status TEXT DEFAULT 'generated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    recipient_role TEXT,
    report_title TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'AUDIT_LOGGED',
    authenticated_sender TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. DOMAIN: CONVERSATIONS & CHAT AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Career Consultation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    rag_framework_applied TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict enforcement: auth.uid() = user_id for all student-owned entities
-- ============================================================================

DO $$
DECLARE
    tbl TEXT;
    tbls TEXT[] := ARRAY[
        'student_profiles', 'career_preferences', 'education', 'academic_terms',
        'experiences', 'projects', 'skills', 'certifications', 'achievements_research',
        'documents', 'cv_records', 'cv_analyses', 'linkedin_profiles', 'linkedin_analyses',
        'job_descriptions', 'role_fit_analyses', 'applications', 'application_events',
        'practice_sessions', 'readiness_snapshots', 'event_impact_logs', 'reports',
        'email_logs', 'conversations', 'chat_messages'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "%s_user_isolation" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "%s_user_isolation" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================================
-- 12. STORAGE BUCKET CONFIGURATION & POLICIES
-- ============================================================================

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('career-documents', 'career-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for user-isolated access
DROP POLICY IF EXISTS "career_documents_select_policy" ON storage.objects;
CREATE POLICY "career_documents_select_policy"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'career-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "career_documents_insert_policy" ON storage.objects;
CREATE POLICY "career_documents_insert_policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'career-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "career_documents_delete_policy" ON storage.objects;
CREATE POLICY "career_documents_delete_policy"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'career-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- 13. AUTOMATIC PROFILE CREATION TRIGGER
-- On Supabase Auth user registration, automatically seed the student profile record
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.student_profiles (
        id,
        user_id,
        email,
        name,
        onboarding_completed
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        false
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
