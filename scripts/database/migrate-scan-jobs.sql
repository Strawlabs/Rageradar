-- Migration: Add scan_jobs table for tracking search/scan execution
-- Run this in the Supabase SQL Editor

-- Scan Jobs Table - tracks each search/scan execution
CREATE TABLE IF NOT EXISTS public.scan_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    scan_type TEXT NOT NULL DEFAULT 'full',          -- 'full', 'web', 'reddit', 'youtube', 'producthunt', 'appstore', 'playstore'
    status TEXT NOT NULL DEFAULT 'pending',           -- 'pending', 'running', 'completed', 'failed'
    platforms_scanned JSONB DEFAULT '[]'::jsonb,      -- list of platforms that were scanned
    results_count INTEGER DEFAULT 0,                  -- total mentions found
    provider_used TEXT DEFAULT NULL,                   -- which search provider was used (google, bing, serpapi)
    errors JSONB DEFAULT '{}'::jsonb,                 -- any errors per platform
    duration_ms INTEGER DEFAULT NULL,                 -- total scan duration in milliseconds
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_scan_jobs_user_id ON public.scan_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_brand_name ON public.scan_jobs(brand_name);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON public.scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created_at ON public.scan_jobs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scan jobs"
    ON public.scan_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan jobs"
    ON public.scan_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan jobs"
    ON public.scan_jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role bypass (for server-side operations)
CREATE POLICY "Service role full access on scan_jobs"
    ON public.scan_jobs FOR ALL
    USING (true)
    WITH CHECK (true);
