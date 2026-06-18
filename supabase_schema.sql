-- Supabase DDL Schema for RageRadar v2.0
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/<ref>/sql/editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- references auth.users.id
    email TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'trial' NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    company_email TEXT DEFAULT '',
    contact_number TEXT DEFAULT '',
    job_title TEXT DEFAULT '',
    company_size TEXT DEFAULT '',
    brands_used INTEGER DEFAULT 0 NOT NULL,
    max_brands INTEGER DEFAULT 1 NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT,
    gdpr_consent JSONB DEFAULT '{"analytics": false, "marketing": false, "functional": true, "dataProcessing": false}'::jsonb,
    gdpr_consent_updated TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '3 days') NOT NULL,
    signup_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
    welcome_email_sent BOOLEAN DEFAULT false NOT NULL,
    welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Analyses Table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    brand_id TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    total_mentions INTEGER DEFAULT 0 NOT NULL,
    positive_percentage INTEGER DEFAULT 0 NOT NULL,
    negative_percentage INTEGER DEFAULT 0 NOT NULL,
    neutral_percentage INTEGER DEFAULT 0 NOT NULL,
    weighted_sentiment_score INTEGER DEFAULT 0 NOT NULL,
    confidence_score INTEGER DEFAULT 0 NOT NULL,
    rage_index INTEGER DEFAULT 0 NOT NULL,
    rage_alert BOOLEAN DEFAULT false NOT NULL,
    caution_alert BOOLEAN DEFAULT false NOT NULL,
    emotions JSONB DEFAULT '[]'::jsonb,
    platform_stats JSONB DEFAULT '{}'::jsonb,
    top_positive_posts JSONB DEFAULT '[]'::jsonb,
    top_negative_posts JSONB DEFAULT '[]'::jsonb,
    search_results JSONB DEFAULT '[]'::jsonb,
    themes JSONB DEFAULT '[]'::jsonb,
    insights JSONB DEFAULT '[]'::jsonb,
    trendline_summary JSONB,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    is_demo BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT DEFAULT 'custom' NOT NULL,
    description TEXT DEFAULT '',
    pre_event_window JSONB NOT NULL,
    post_event_window JSONB NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    color TEXT NOT NULL,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- GDPR Consent Logs Table
CREATE TABLE IF NOT EXISTS public.gdpr_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    consent JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    details JSONB NOT NULL,
    compliance TEXT NOT NULL
);

-- Billing Events Table
CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    session_id TEXT,
    plan_id TEXT,
    billing_cycle TEXT,
    price_id TEXT,
    subscription_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Password Resets Table
CREATE TABLE IF NOT EXISTS public.password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for all exposed tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies

-- Users Policies
CREATE POLICY "Allow authenticated users to read their own profile" ON public.users
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated users to create their own profile" ON public.users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Analyses Policies
CREATE POLICY "Allow authenticated users to manage their own analyses" ON public.analyses
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events Policies
CREATE POLICY "Allow authenticated users to manage their own events" ON public.events
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- GDPR Consent Policies
CREATE POLICY "Allow authenticated users to manage their own GDPR consents" ON public.gdpr_consent
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Allow authenticated users to insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow users to read their own audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- Billing Events Policies
CREATE POLICY "Allow authenticated users to view/manage their billing events" ON public.billing_events
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Allow authenticated users to manage their own notifications" ON public.notifications
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
