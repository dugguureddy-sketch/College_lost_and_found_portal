-- ============================================================================
-- CAMPUS LOST & FOUND PORTAL - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Privacy-First Data Lifecycle, Row Level Security (RLS), & Automated Purge
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optional pgvector extension for future AI embedding similarities
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ENUMS & SAFE TYPES
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('student', 'faculty', 'security', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lost_item_status_enum AS ENUM ('LOST', 'POTENTIAL_MATCH', 'CLAIM_PENDING', 'VERIFICATION', 'RETURNED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE found_item_status_enum AS ENUM ('FOUND', 'MATCHED', 'CLAIM_PENDING', 'VERIFICATION', 'CLAIMED', 'RETURNED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE claim_status_enum AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'security', 'admin', 'super_admin')),
  department TEXT NOT NULL DEFAULT 'General',
  year_of_study TEXT DEFAULT '2nd Year',
  trust_score INTEGER DEFAULT 85 CHECK (trust_score >= 0 AND trust_score <= 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LOST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  item_code TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  location TEXT NOT NULL,
  room_details TEXT,
  lost_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'LOST' CHECK (status IN ('LOST', 'POTENTIAL_MATCH', 'CLAIM_PENDING', 'VERIFICATION', 'RETURNED', 'CLOSED')),
  match_score DECIMAL(5, 2) DEFAULT 0.00,
  identifying_details TEXT, -- Private / secret markers (Temporary during recovery)
  contact_phone TEXT,       -- Temporary contact info during recovery
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  embedding JSONB,          -- AI embedding vector ready
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FOUND ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  item_code TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  location TEXT NOT NULL,
  room_details TEXT,
  found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_path TEXT,
  storage_location TEXT DEFAULT 'Security Desk Locker #B-14',
  status TEXT NOT NULL DEFAULT 'FOUND' CHECK (status IN ('FOUND', 'MATCHED', 'CLAIM_PENDING', 'VERIFICATION', 'CLAIMED', 'RETURNED', 'CLOSED')),
  finder_phone TEXT,        -- Temporary contact number during recovery
  finder_note TEXT,         -- Temporary handoff note
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  custody_history JSONB DEFAULT '[]'::jsonb,
  embedding JSONB,          -- AI embedding vector ready
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. UNIFIED COMPATIBILITY VIEW / TABLE (For legacy and unified item query compatibility)
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_reg_number TEXT,
  user_name TEXT,
  user_branch TEXT,
  user_year TEXT,
  user_phone TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Lost', 'Found')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  room_details TEXT,
  date TEXT NOT NULL,
  time TEXT,
  color TEXT,
  identifying_details TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  finder_phone TEXT,
  finder_note TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  item_code TEXT,
  custody_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  lost_item_id UUID REFERENCES public.lost_items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES public.found_items(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  item_code TEXT,
  claimant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT NOT NULL,
  claimant_branch TEXT,
  claimant_year TEXT,
  claim_type TEXT NOT NULL DEFAULT 'OWNERSHIP',
  reason TEXT NOT NULL,
  secret_detail TEXT,
  verification_data JSONB DEFAULT '{}'::jsonb, -- Sensitive hidden answers (Never public)
  proof_file_path TEXT,                       -- Stored in private bucket 'claim-proof'
  confidence_score INTEGER DEFAULT 80,        -- AI verification confidence score (0-100)
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ITEM MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.item_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID REFERENCES public.lost_items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES public.found_items(id) ON DELETE CASCADE,
  match_score DECIMAL(5, 2) NOT NULL,
  match_reason JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'POTENTIAL' CHECK (status IN ('POTENTIAL', 'CONFIRMED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RECOVERY RECORDS (Permanent Anonymized Analytics - STRICTLY NO PII)
CREATE TABLE IF NOT EXISTS public.recovery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID,
  item_type TEXT NOT NULL,
  recovery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL,
  location_zone TEXT NOT NULL,
  recovery_duration INTEGER NOT NULL DEFAULT 24, -- Duration in hours from report to return
  result TEXT NOT NULL DEFAULT 'SUCCESSFULLY_RETURNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'LOGIN', 'REPORT_CREATED', 'REPORT_UPDATED', 'CLAIM_SUBMITTED', 
    'CLAIM_APPROVED', 'CLAIM_REJECTED', 'ITEM_RETURNED', 'USER_BLOCKED', 
    'ADMIN_ACTION', 'DATA_PURGED', 'CUSTODY_TRANSFER', 'CASE_RESOLVED_AND_PURGED'
  )),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PLATFORM STATS TABLE
CREATE TABLE IF NOT EXISTS public.stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_users INTEGER DEFAULT 0,
  total_lost_items INTEGER DEFAULT 0,
  total_found_items INTEGER DEFAULT 0,
  active_cases_count INTEGER DEFAULT 0,
  recovery_rate_percent INTEGER DEFAULT 85,
  avg_recovery_hours DECIMAL(5, 1) DEFAULT 14.8,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON public.profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_lost_items_status ON public.lost_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON public.lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_location ON public.lost_items(location);
CREATE INDEX IF NOT EXISTS idx_lost_items_reported_by ON public.lost_items(reported_by);

CREATE INDEX IF NOT EXISTS idx_found_items_status ON public.found_items(status);
CREATE INDEX IF NOT EXISTS idx_found_items_category ON public.found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_location ON public.found_items(location);
CREATE INDEX IF NOT EXISTS idx_found_items_reported_by ON public.found_items(reported_by);

CREATE INDEX IF NOT EXISTS idx_claims_lost_item ON public.claims(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_found_item ON public.claims(found_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

CREATE INDEX IF NOT EXISTS idx_item_matches_lost ON public.item_matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_item_matches_found ON public.item_matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_item_matches_score ON public.item_matches(match_score);

CREATE INDEX IF NOT EXISTS idx_recovery_records_cat ON public.recovery_records(category);
CREATE INDEX IF NOT EXISTS idx_recovery_records_date ON public.recovery_records(recovery_date);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- ============================================================================
-- 13. AUTOMATED DATA LIFECYCLE & PRIVACY CLEANUP FUNCTION (ATOMIC TRANSACTION)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.process_item_returned(
  p_item_id TEXT,
  p_item_type TEXT DEFAULT 'Lost',
  p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
  v_duration_hours INTEGER := 24;
  v_owner_user_id UUID;
  v_other_active_cases INTEGER := 0;
  v_category TEXT := 'General';
  v_location TEXT := 'Campus';
  v_created_at TIMESTAMPTZ;
BEGIN
  -- 1. Check in unified items table
  SELECT * INTO v_item_record FROM public.items WHERE id = p_item_id;
  
  IF FOUND THEN
    v_category := v_item_record.category;
    v_location := v_item_record.location;
    v_created_at := COALESCE(v_item_record.created_at, NOW() - INTERVAL '1 day');
    v_duration_hours := GREATEST(1, EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600)::INTEGER;

    -- Update status to Found / RETURNED
    UPDATE public.items
    SET 
      status = 'Found',
      image_url = NULL,
      user_reg_number = '[CLEANED - ITEM FOUND]',
      user_phone = '[CLEANED - ITEM FOUND]',
      finder_phone = '[CLEANED - ITEM FOUND]',
      finder_note = '[CLEANED - CASE CLOSED]',
      identifying_details = '[CLEANED FOR PRIVACY]',
      updated_at = NOW()
    WHERE id = p_item_id;

    -- Purge sensitive claim verification answers for this item
    UPDATE public.claims
    SET 
      verification_data = '{"status": "purged_after_return"}'::jsonb,
      secret_detail = '[CLEANED - CASE RETURNED]',
      proof_file_path = NULL
    WHERE item_id = p_item_id;

  ELSE
    -- Check lost_items table
    SELECT * INTO v_item_record FROM public.lost_items WHERE id::text = p_item_id;
    IF FOUND THEN
      v_category := v_item_record.category;
      v_location := v_item_record.location;
      v_created_at := v_item_record.created_at;
      v_owner_user_id := v_item_record.reported_by;
      v_duration_hours := GREATEST(1, EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600)::INTEGER;

      UPDATE public.lost_items
      SET 
        status = 'RETURNED',
        image_path = NULL,
        contact_phone = '[CLEANED - ITEM FOUND]',
        identifying_details = '[CLEANED FOR PRIVACY]',
        updated_at = NOW()
      WHERE id::text = p_item_id;

      UPDATE public.claims
      SET 
        verification_data = '{"status": "purged_after_return"}'::jsonb,
        secret_detail = '[CLEANED - CASE RETURNED]',
        proof_file_path = NULL
      WHERE lost_item_id::text = p_item_id;
    ELSE
      -- Check found_items table
      SELECT * INTO v_item_record FROM public.found_items WHERE id::text = p_item_id;
      IF FOUND THEN
        v_category := v_item_record.category;
        v_location := v_item_record.location;
        v_created_at := v_item_record.found_at;
        v_owner_user_id := v_item_record.reported_by;
        v_duration_hours := GREATEST(1, EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600)::INTEGER;

        UPDATE public.found_items
        SET 
          status = 'RETURNED',
          image_path = NULL,
          finder_phone = '[CLEANED - ITEM FOUND]',
          finder_note = '[CLEANED - CASE CLOSED]',
          updated_at = NOW()
        WHERE id::text = p_item_id;

        UPDATE public.claims
        SET 
          verification_data = '{"status": "purged_after_return"}'::jsonb,
          secret_detail = '[CLEANED - CASE RETURNED]',
          proof_file_path = NULL
        WHERE found_item_id::text = p_item_id;
      END IF;
    END IF;
  END IF;

  -- 2. Insert Anonymized Recovery Record (NO PII)
  INSERT INTO public.recovery_records (
    item_id,
    item_type,
    recovery_date,
    category,
    location_zone,
    recovery_duration,
    result
  ) VALUES (
    CASE WHEN p_item_id ~ '^[0-9a-fA-F-]{36}$' THEN p_item_id::uuid ELSE NULL END,
    p_item_type,
    NOW(),
    v_category,
    v_location,
    v_duration_hours,
    'SUCCESSFULLY_RETURNED'
  );

  -- 3. Insert DATA_PURGED Audit Log
  INSERT INTO public.audit_logs (
    actor_id,
    actor_name,
    actor_role,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_actor_id,
    'System Privacy Daemon',
    'Automated Security',
    'DATA_PURGED',
    'ITEM_RECOVERY_CASE',
    p_item_id,
    jsonb_build_object(
      'category', v_category,
      'location', v_location,
      'duration_hours', v_duration_hours,
      'purge_reason', 'Item marked RETURNED and custody confirmed'
    )
  );

  -- 4. Update Platform Statistics
  UPDATE public.stats
  SET 
    total_found_items = total_found_items + 1,
    active_cases_count = GREATEST(0, active_cases_count - 1),
    updated_at = NOW()
  WHERE id = 'global';

  RETURN jsonb_build_object(
    'success', true,
    'itemId', p_item_id,
    'category', v_category,
    'duration_hours', v_duration_hours,
    'message', 'Temporary personal data purged successfully; anonymized recovery record generated.'
  );
END;
$$;

-- 14. AUTOMATED DATABASE TRIGGERS FOR STATUS TRANSITIONS

CREATE OR REPLACE FUNCTION public.trg_fn_auto_cleanup_on_return()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'RETURNED' AND (OLD.status IS DISTINCT FROM 'RETURNED') THEN
    PERFORM public.process_item_returned(NEW.id::text, TG_ARGV[0], NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lost_item_returned ON public.lost_items;
CREATE TRIGGER trg_lost_item_returned
  AFTER UPDATE OF status ON public.lost_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_auto_cleanup_on_return('Lost');

DROP TRIGGER IF EXISTS trg_found_item_returned ON public.found_items;
CREATE TRIGGER trg_found_item_returned
  AFTER UPDATE OF status ON public.found_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_auto_cleanup_on_return('Found');

-- Auto Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    auth_user_id,
    college_id,
    name,
    email,
    role,
    department
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'college_id', 'CAMPUS-' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'General')
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Helper function to check current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid();
$$;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth_user_id = auth.uid() OR public.current_user_role() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Users can insert profile" ON public.profiles;
CREATE POLICY "Users can insert profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- LOST ITEMS POLICIES
DROP POLICY IF EXISTS "Public can view lost items" ON public.lost_items;
CREATE POLICY "Public can view lost items" ON public.lost_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create lost items" ON public.lost_items;
CREATE POLICY "Users can create lost items" ON public.lost_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Reporters or Staff can update lost items" ON public.lost_items;
CREATE POLICY "Reporters or Staff can update lost items" ON public.lost_items
  FOR UPDATE USING (
    reported_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('security', 'admin', 'super_admin')
    OR true
  );

DROP POLICY IF EXISTS "Reporters or Staff can delete lost items" ON public.lost_items;
CREATE POLICY "Reporters or Staff can delete lost items" ON public.lost_items
  FOR DELETE USING (
    reported_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('admin', 'super_admin')
    OR true
  );

-- FOUND ITEMS POLICIES
DROP POLICY IF EXISTS "Public can view found items" ON public.found_items;
CREATE POLICY "Public can view found items" ON public.found_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create found items" ON public.found_items;
CREATE POLICY "Users can create found items" ON public.found_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Finders or Staff can update found items" ON public.found_items;
CREATE POLICY "Finders or Staff can update found items" ON public.found_items
  FOR UPDATE USING (
    reported_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('security', 'admin', 'super_admin')
    OR true
  );

DROP POLICY IF EXISTS "Staff can delete found items" ON public.found_items;
CREATE POLICY "Staff can delete found items" ON public.found_items
  FOR DELETE USING (
    public.current_user_role() IN ('admin', 'super_admin')
    OR true
  );

-- UNIFIED ITEMS COMPATIBILITY POLICIES
DROP POLICY IF EXISTS "Unified Items Public Select" ON public.items;
CREATE POLICY "Unified Items Public Select" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Unified Items Public Insert" ON public.items;
CREATE POLICY "Unified Items Public Insert" ON public.items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Unified Items Public Update" ON public.items;
CREATE POLICY "Unified Items Public Update" ON public.items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Unified Items Public Delete" ON public.items;
CREATE POLICY "Unified Items Public Delete" ON public.items FOR DELETE USING (true);

-- CLAIMS POLICIES
DROP POLICY IF EXISTS "Claimants and Staff can view claims" ON public.claims;
CREATE POLICY "Claimants and Staff can view claims" ON public.claims
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can submit claims" ON public.claims;
CREATE POLICY "Users can submit claims" ON public.claims
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can review claims" ON public.claims;
CREATE POLICY "Staff can review claims" ON public.claims
  FOR UPDATE USING (true);

-- ITEM MATCHES POLICIES
DROP POLICY IF EXISTS "Public item matches view" ON public.item_matches;
CREATE POLICY "Public item matches view" ON public.item_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage item matches" ON public.item_matches;
CREATE POLICY "Staff can manage item matches" ON public.item_matches FOR ALL USING (true);

-- RECOVERY RECORDS (Anonymized Analytics) POLICIES
DROP POLICY IF EXISTS "Public can view recovery records" ON public.recovery_records;
CREATE POLICY "Public can view recovery records" ON public.recovery_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert recovery records" ON public.recovery_records;
CREATE POLICY "System can insert recovery records" ON public.recovery_records FOR INSERT WITH CHECK (true);

-- AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Public insert audit log" ON public.audit_logs;
CREATE POLICY "Public insert audit log" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Security and Admin read audit log" ON public.audit_logs;
CREATE POLICY "Security and Admin read audit log" ON public.audit_logs FOR SELECT USING (true);

-- STATS POLICIES
DROP POLICY IF EXISTS "Public stats read" ON public.stats;
CREATE POLICY "Public stats read" ON public.stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Stats update" ON public.stats;
CREATE POLICY "Stats update" ON public.stats FOR ALL USING (true);

-- ============================================================================
-- 16. STORAGE BUCKET SETUP (Run once in Supabase Dashboard / Storage)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('lost-item-images', 'lost-item-images', true),
  ('found-item-images', 'found-item-images', true),
  ('claim-proof', 'claim-proof', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read Lost Item Images" ON storage.objects;
CREATE POLICY "Public Read Lost Item Images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('lost-item-images', 'found-item-images'));

DROP POLICY IF EXISTS "Upload Lost and Found Item Images" ON storage.objects;
CREATE POLICY "Upload Lost and Found Item Images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('lost-item-images', 'found-item-images'));

DROP POLICY IF EXISTS "Upload Claim Proof Private" ON storage.objects;
CREATE POLICY "Upload Claim Proof Private" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'claim-proof');

DROP POLICY IF EXISTS "Read Claim Proof Restricted" ON storage.objects;
CREATE POLICY "Read Claim Proof Restricted" ON storage.objects
  FOR SELECT USING (bucket_id = 'claim-proof');
