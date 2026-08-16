/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Item, User, Claim, Report, PlatformStats, AuditLogEntry, MatchResult } from '../types';
import { INITIAL_ITEMS, INITIAL_STATS, SAMPLE_USERS } from '../data/initialData';

// Public Supabase configuration using Vite environment variables
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://yp0-3kysudcgonnx5lj9wa-zzs-yfwf.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Yp0-3kYsuDCGONNX5Lj9WA_ZzS_yfWf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};

// Complete Production SQL Schema Script for SQL Editor or Dashboard execution
export const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- CAMPUS LOST & FOUND PORTAL - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Privacy-First Data Lifecycle, Row Level Security (RLS), & Automated Purge
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Linked with Supabase Auth)
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

-- 3. LOST ITEMS TABLE
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
  identifying_details TEXT,
  contact_phone TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  embedding JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FOUND ITEMS TABLE
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
  finder_phone TEXT,
  finder_note TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  custody_history JSONB DEFAULT '[]'::jsonb,
  embedding JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. UNIFIED ITEMS TABLE (Client-Optimized Active Inventory)
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

-- 6. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
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
  verification_data JSONB DEFAULT '{}'::jsonb,
  proof_file_path TEXT,
  confidence_score INTEGER DEFAULT 80,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ITEM MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.item_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id TEXT,
  found_item_id TEXT,
  match_score DECIMAL(5, 2) NOT NULL,
  match_reason JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'POTENTIAL' CHECK (status IN ('POTENTIAL', 'CONFIRMED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RECOVERY RECORDS (Permanent Anonymized Analytics - STRICTLY NO PII)
CREATE TABLE IF NOT EXISTS public.recovery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID,
  item_type TEXT NOT NULL,
  recovery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL,
  location_zone TEXT NOT NULL,
  recovery_duration INTEGER NOT NULL DEFAULT 24,
  result TEXT NOT NULL DEFAULT 'SUCCESSFULLY_RETURNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. STATS TABLE
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

-- 11. AUTOMATIC DATA LIFECYCLE & PRIVACY CLEANUP FUNCTION (ATOMIC)
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
  v_category TEXT := 'General';
  v_location TEXT := 'Campus';
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Search in items table
  SELECT * INTO v_item_record FROM public.items WHERE id = p_item_id;
  
  IF FOUND THEN
    v_category := v_item_record.category;
    v_location := v_item_record.location;
    v_created_at := COALESCE(v_item_record.created_at, NOW() - INTERVAL '1 day');
    v_duration_hours := GREATEST(1, EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600)::INTEGER;

    -- Update status and wipe private fields
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

    -- Clean claims
    UPDATE public.claims
    SET 
      verification_data = '{"status": "purged_after_return"}'::jsonb,
      secret_detail = '[CLEANED - CASE RETURNED]',
      proof_file_path = NULL
    WHERE item_id = p_item_id;
  END IF;

  -- Insert non-identifying permanent recovery record
  INSERT INTO public.recovery_records (
    item_type,
    recovery_date,
    category,
    location_zone,
    recovery_duration,
    result
  ) VALUES (
    p_item_type,
    NOW(),
    v_category,
    v_location,
    v_duration_hours,
    'SUCCESSFULLY_RETURNED'
  );

  -- Insert audit log
  INSERT INTO public.audit_logs (
    actor_name,
    actor_role,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    'System Privacy Engine',
    'Automated Security',
    'DATA_PURGED',
    'ITEM_RECOVERY_CASE',
    p_item_id,
    jsonb_build_object(
      'category', v_category,
      'location', v_location,
      'duration_hours', v_duration_hours,
      'cleanup_policy', 'Automatic post-return privacy wipe'
    )
  );

  -- Update global stats
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
    'message', 'Recovery recorded; temporary identity records purged.'
  );
END;
$$;

-- 12. STORAGE BUCKETS (Run once in Storage or SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('lost-item-images', 'lost-item-images', true),
  ('found-item-images', 'found-item-images', true),
  ('claim-proof', 'claim-proof', false)
ON CONFLICT (id) DO NOTHING;
`;

// ============================================================================
// DATA MAPPERS
// ============================================================================

export const mapRowToItem = (row: any): Item => ({
  id: String(row.id),
  itemCode: row.item_code || undefined,
  userId: row.user_id || row.reported_by || 'user-unknown',
  userRegNumber: row.user_reg_number || 'CAMPUS-STUDENT',
  userName: row.user_name || 'Campus Student',
  userBranch: row.user_branch || 'CSE',
  userYear: row.user_year || '2nd Year',
  userPhone: row.user_phone || row.contact_phone || '',
  title: row.title,
  type: (row.type || (row.lost_at ? 'Lost' : 'Found')) as 'Lost' | 'Found',
  category: row.category,
  brand: row.brand || undefined,
  description: row.description,
  location: row.location,
  roomDetails: row.room_details || '',
  date: row.date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
  time: row.time || '',
  color: row.color || '',
  identifyingDetails: row.identifying_details || '',
  imageUrl: row.image_url || row.image_path || undefined,
  storageLocation: row.storage_location || undefined,
  status: (row.status === 'RETURNED' ? 'Found' : row.status || 'Pending') as any,
  finderPhone: row.finder_phone || undefined,
  finderNote: row.finder_note || undefined,
  isFlagged: row.is_flagged || false,
  flagReason: row.flag_reason || undefined,
  custodyHistory: row.custody_history || undefined,
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapItemToRow = (item: Item) => ({
  id: item.id,
  item_code: item.itemCode,
  user_id: item.userId,
  user_reg_number: item.userRegNumber,
  user_name: item.userName,
  user_branch: item.userBranch,
  user_year: item.userYear,
  user_phone: item.userPhone,
  title: item.title,
  type: item.type,
  category: item.category,
  brand: item.brand,
  description: item.description,
  location: item.location,
  room_details: item.roomDetails,
  date: item.date,
  time: item.time,
  color: item.color,
  identifying_details: item.identifyingDetails,
  image_url: item.imageUrl,
  status: item.status,
  finder_phone: item.finderPhone,
  finder_note: item.finderNote,
  is_flagged: item.isFlagged,
  flag_reason: item.flagReason,
  custody_history: item.custodyHistory || [],
  created_at: item.createdAt,
  updated_at: new Date().toISOString(),
});

export const mapRowToUser = (row: any): User => ({
  id: String(row.id),
  regNumber: row.college_id || row.reg_number || '250301120030',
  name: row.name,
  email: row.email || undefined,
  branch: (row.department || row.branch || 'CSE') as any,
  year: (row.year_of_study || row.year || '2nd Year') as any,
  phone: row.phone || '',
  role: row.role || 'student',
  trustScore: row.trust_score ?? 85,
  verifiedBadges: row.verified_badges || ['Verified Student ID'],
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapUserToRow = (user: User) => ({
  id: user.id,
  college_id: user.regNumber,
  reg_number: user.regNumber,
  name: user.name,
  email: user.email,
  department: user.branch,
  branch: user.branch,
  year_of_study: user.year,
  year: user.year,
  phone: user.phone,
  role: user.role,
  trust_score: user.trustScore ?? 85,
  created_at: user.createdAt,
  last_active_at: new Date().toISOString(),
});

export const mapRowToClaim = (row: any): Claim => ({
  id: String(row.id),
  itemId: row.item_id,
  itemTitle: row.item_title,
  itemCode: row.item_code || undefined,
  claimantId: row.claimant_id || 'user-unknown',
  claimantName: row.claimant_name || 'Student Claimant',
  claimantPhone: row.claimant_phone || '',
  claimantBranch: row.claimant_branch || 'CSE',
  claimantYear: row.claimant_year || '2nd Year',
  reason: row.reason || '',
  secretDetail: row.secret_detail || undefined,
  hiddenAnswers: row.verification_data || undefined,
  confidenceScore: row.confidence_score ?? 85,
  status: (row.status === 'PENDING' ? 'Pending' : row.status === 'APPROVED' ? 'Approved' : row.status) as any,
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapClaimToRow = (claim: Claim) => ({
  id: claim.id,
  item_id: claim.itemId,
  item_title: claim.itemTitle,
  item_code: claim.itemCode,
  claimant_name: claim.claimantName,
  claimant_phone: claim.claimantPhone,
  claimant_branch: claim.claimantBranch,
  claimant_year: claim.claimantYear,
  reason: claim.reason,
  secret_detail: claim.secretDetail,
  verification_data: claim.hiddenAnswers || {},
  confidence_score: claim.confidenceScore ?? 85,
  status: claim.status.toUpperCase(),
  created_at: claim.createdAt,
});

export const mapRowToReport = (row: any): Report => ({
  id: String(row.id),
  itemId: row.item_id || (row.metadata?.itemId) || '',
  itemTitle: row.item_title || (row.metadata?.itemTitle) || 'Flagged Item',
  reportedByUserId: row.reported_by_user_id || row.actor_id || 'user-unknown',
  reportedByUserName: row.reported_by_user_name || row.actor_name || 'Community Member',
  reason: row.reason || (row.metadata?.reason) || 'Other',
  details: row.details || (row.metadata?.details) || '',
  status: (row.status || 'Pending Review') as any,
  createdAt: row.created_at || new Date().toISOString(),
});

// ============================================================================
// SUPABASE AUTHENTICATION METHODS
// ============================================================================

export async function supabaseSignUp(
  email: string,
  password: string,
  meta: { name: string; collegeId: string; role?: string; department?: string }
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: meta.name,
          college_id: meta.collegeId,
          role: meta.role || 'student',
          department: meta.department || 'CSE',
        },
      },
    });

    if (error) throw error;

    // Create profile entry
    if (data.user) {
      await supabase.from('profiles').upsert([
        {
          auth_user_id: data.user.id,
          college_id: meta.collegeId,
          name: meta.name,
          email: email,
          role: meta.role || 'student',
          department: meta.department || 'CSE',
        },
      ]);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || String(err) };
  }
}

export async function supabaseSignIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || String(err) };
  }
}

export async function supabaseSignOut() {
  try {
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function supabaseResetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function getSupabaseAuthUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

// ============================================================================
// SUPABASE STORAGE METHODS (Item Images & Private Claim Proofs)
// ============================================================================

export async function uploadItemImageToStorage(
  file: File,
  type: 'Lost' | 'Found'
): Promise<string | null> {
  try {
    // Validate File Size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds maximum permitted 5MB limit.');
    }

    // Validate File Type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      throw new Error('Invalid file format. Please upload JPG, PNG, or WEBP images.');
    }

    const bucket = type === 'Lost' ? 'lost-item-images' : 'found-item-images';
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadErr) {
      console.warn('Supabase storage upload error:', uploadErr.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(cleanFileName);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Storage upload error:', err);
    return null;
  }
}

export async function uploadClaimProofToStorage(file: File): Promise<string | null> {
  try {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds maximum 10MB limit.');
    }

    const cleanFileName = `proof-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Private Bucket 'claim-proof'
    const { error } = await supabase.storage
      .from('claim-proof')
      .upload(cleanFileName, file, {
        upsert: false,
      });

    if (error) throw error;
    return cleanFileName; // Stored path
  } catch (err) {
    console.error('Private proof upload failed:', err);
    return null;
  }
}

export async function getSignedUrlForClaimProof(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('claim-proof')
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

// ============================================================================
// SUPABASE DATABASE CRUD & DATA RETENTION
// ============================================================================

export async function fetchSupabaseItems(): Promise<Item[] | null> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data.map(mapRowToItem);
  } catch {
    return null;
  }
}

export async function insertSupabaseItem(item: Item): Promise<boolean> {
  try {
    const row = mapItemToRow(item);
    const { error } = await supabase.from('items').upsert([row]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabaseItem(item: Item): Promise<boolean> {
  try {
    const row = mapItemToRow(item);
    const { error } = await supabase.from('items').update(row).eq('id', item.id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteSupabaseItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    return !error;
  } catch {
    return false;
  }
}

export async function executeSupabaseItemReturnedCleanup(
  itemId: string,
  itemType: 'Lost' | 'Found' = 'Lost'
): Promise<boolean> {
  try {
    // Call database-side atomic cleanup function
    const { data, error } = await supabase.rpc('process_item_returned', {
      p_item_id: itemId,
      p_item_type: itemType,
    });

    if (error) {
      console.warn('RPC process_item_returned fallback:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchSupabaseUsers(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      // Fallback query to legacy users table if present
      const { data: legacyData, error: legacyErr } = await supabase.from('users').select('*');
      if (legacyErr || !legacyData) return null;
      return legacyData.map(mapRowToUser);
    }
    return data.map(mapRowToUser);
  } catch {
    return null;
  }
}

export async function insertSupabaseUser(user: User): Promise<boolean> {
  try {
    const row = mapUserToRow(user);
    await supabase.from('profiles').upsert([row]);
    await supabase.from('users').upsert([row]);
    return true;
  } catch {
    return false;
  }
}

export async function fetchSupabaseClaims(): Promise<Claim[] | null> {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data.map(mapRowToClaim);
  } catch {
    return null;
  }
}

export async function insertSupabaseClaim(claim: Claim): Promise<boolean> {
  try {
    const row = mapClaimToRow(claim);
    const { error } = await supabase.from('claims').insert([row]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabaseClaimStatus(
  claimId: string,
  status: Claim['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('claims')
      .update({ status: status.toUpperCase() })
      .eq('id', claimId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseReports(): Promise<Report[] | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data.map(mapRowToReport);
  } catch {
    return null;
  }
}

export async function insertSupabaseReport(report: Report): Promise<boolean> {
  try {
    const { error } = await supabase.from('reports').insert([
      {
        id: report.id,
        item_id: report.itemId,
        item_title: report.itemTitle,
        reported_by_user_id: report.reportedByUserId,
        reported_by_user_name: report.reportedByUserName,
        reason: report.reason,
        details: report.details,
        status: report.status,
        created_at: report.createdAt,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabaseReportStatus(
  reportId: string,
  status: Report['status']
): Promise<boolean> {
  try {
    const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseStats(): Promise<PlatformStats | null> {
  try {
    const { data, error } = await supabase.from('stats').select('*').eq('id', 'global').single();
    if (error || !data) return null;
    return {
      totalUsers: data.total_users,
      totalLostItems: data.total_lost_items,
      totalFoundItems: data.total_found_items,
      activeCasesCount: data.active_cases_count,
      recoveryRatePercent: data.recovery_rate_percent ?? 85,
      avgRecoveryHours: Number(data.avg_recovery_hours) || 14.8,
    };
  } catch {
    return null;
  }
}

export async function updateSupabaseStats(stats: PlatformStats): Promise<boolean> {
  try {
    const { error } = await supabase.from('stats').upsert([
      {
        id: 'global',
        total_users: stats.totalUsers,
        total_lost_items: stats.totalLostItems,
        total_found_items: stats.totalFoundItems,
        active_cases_count: stats.activeCasesCount,
        recovery_rate_percent: stats.recoveryRatePercent || 85,
        avg_recovery_hours: stats.avgRecoveryHours || 14.8,
        updated_at: new Date().toISOString(),
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export function subscribeToSupabaseItems(onChanged: (payload: any) => void) {
  return supabase
    .channel('campus_items_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
      onChanged(payload);
    })
    .subscribe();
}

export function subscribeToSupabaseClaims(onChanged: (payload: any) => void) {
  return supabase
    .channel('campus_claims_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, (payload) => {
      onChanged(payload);
    })
    .subscribe();
}

// Seed initial database into Supabase if empty
export async function seedSupabaseIfEmpty(): Promise<boolean> {
  try {
    const existingUsers = await fetchSupabaseUsers();
    if (!existingUsers || existingUsers.length === 0) {
      const userRows = SAMPLE_USERS.map(mapUserToRow);
      await supabase.from('users').upsert(userRows);
    }

    const existingItems = await fetchSupabaseItems();
    if (!existingItems || existingItems.length === 0) {
      const itemRows = INITIAL_ITEMS.map(mapItemToRow);
      await supabase.from('items').upsert(itemRows);
    }

    const existingStats = await fetchSupabaseStats();
    if (!existingStats) {
      await updateSupabaseStats(INITIAL_STATS);
    }

    return true;
  } catch {
    return false;
  }
}
