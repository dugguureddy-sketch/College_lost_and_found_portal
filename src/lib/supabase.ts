/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Item, User, Claim, Report, PlatformStats } from '../types';
import { INITIAL_ITEMS, INITIAL_STATS, SAMPLE_USERS } from '../data/initialData';

// Public Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yp0-3kysudcgonnx5lj9wa-zzs-yfwf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Yp0-3kYsuDCGONNX5Lj9WA_ZzS_yfWf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};

// SQL Schema definition export for user reference or easy copy
export const SUPABASE_SCHEMA_SQL = `-- Campus Lost & Found Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  reg_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Items Table
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_reg_number TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_branch TEXT NOT NULL,
  user_year TEXT NOT NULL,
  user_phone TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Claims Table
CREATE TABLE IF NOT EXISTS public.claims (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  claimant_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT NOT NULL,
  claimant_branch TEXT NOT NULL,
  claimant_year TEXT NOT NULL,
  reason TEXT NOT NULL,
  secret_detail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  reported_by_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_by_user_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Review',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Stats Table
CREATE TABLE IF NOT EXISTS public.stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_users INTEGER DEFAULT 0,
  total_lost_items INTEGER DEFAULT 0,
  total_found_items INTEGER DEFAULT 0,
  active_cases_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Grant Public Access Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for campus lost & found workflow
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Insert Users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public Read Items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public Insert Items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Public Delete Items" ON public.items FOR DELETE USING (true);

CREATE POLICY "Public Read Claims" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Public Insert Claims" ON public.claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Claims" ON public.claims FOR UPDATE USING (true);

CREATE POLICY "Public Read Reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public Insert Reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Reports" ON public.reports FOR UPDATE USING (true);

CREATE POLICY "Public Read Stats" ON public.stats FOR SELECT USING (true);
CREATE POLICY "Public Update Stats" ON public.stats FOR UPDATE USING (true);
CREATE POLICY "Public Insert Stats" ON public.stats FOR INSERT WITH CHECK (true);
`;

// Map database row to TypeScript Item
export const mapRowToItem = (row: any): Item => ({
  id: row.id,
  userId: row.user_id,
  userRegNumber: row.user_reg_number,
  userName: row.user_name,
  userBranch: row.user_branch,
  userYear: row.user_year,
  userPhone: row.user_phone || '',
  title: row.title,
  type: row.type,
  category: row.category,
  description: row.description,
  location: row.location,
  roomDetails: row.room_details || '',
  date: row.date,
  time: row.time || '',
  color: row.color || '',
  identifyingDetails: row.identifying_details || '',
  imageUrl: row.image_url || '',
  status: row.status,
  finderPhone: row.finder_phone || undefined,
  finderNote: row.finder_note || undefined,
  isFlagged: row.is_flagged || false,
  flagReason: row.flag_reason || undefined,
  createdAt: row.created_at,
});

// Map Item to database row
export const mapItemToRow = (item: Item) => ({
  id: item.id,
  user_id: item.userId,
  user_reg_number: item.userRegNumber,
  user_name: item.userName,
  user_branch: item.userBranch,
  user_year: item.userYear,
  user_phone: item.userPhone,
  title: item.title,
  type: item.type,
  category: item.category,
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
  created_at: item.createdAt,
});

// Map database row to TypeScript User
export const mapRowToUser = (row: any): User => ({
  id: row.id,
  regNumber: row.reg_number,
  name: row.name,
  email: row.email || undefined,
  branch: row.branch,
  year: row.year,
  phone: row.phone,
  role: row.role,
  createdAt: row.created_at,
});

// Map User to database row
export const mapUserToRow = (user: User) => ({
  id: user.id,
  reg_number: user.regNumber,
  name: user.name,
  email: user.email,
  branch: user.branch,
  year: user.year,
  phone: user.phone,
  role: user.role,
  created_at: user.createdAt,
});

// Map Row to Claim
export const mapRowToClaim = (row: any): Claim => ({
  id: row.id,
  itemId: row.item_id,
  itemTitle: row.item_title,
  claimantId: row.claimant_id,
  claimantName: row.claimant_name,
  claimantPhone: row.claimant_phone,
  claimantBranch: row.claimant_branch,
  claimantYear: row.claimant_year,
  reason: row.reason,
  secretDetail: row.secret_detail,
  status: row.status,
  createdAt: row.created_at,
});

// Map Claim to Row
export const mapClaimToRow = (claim: Claim) => ({
  id: claim.id,
  item_id: claim.itemId,
  item_title: claim.itemTitle,
  claimant_id: claim.claimantId,
  claimant_name: claim.claimantName,
  claimant_phone: claim.claimantPhone,
  claimant_branch: claim.claimantBranch,
  claimant_year: claim.claimantYear,
  reason: claim.reason,
  secret_detail: claim.secretDetail,
  status: claim.status,
  created_at: claim.createdAt,
});

// Map Row to Report
export const mapRowToReport = (row: any): Report => ({
  id: row.id,
  itemId: row.item_id,
  itemTitle: row.item_title,
  reportedByUserId: row.reported_by_user_id,
  reportedByUserName: row.reported_by_user_name,
  reason: row.reason,
  details: row.details,
  status: row.status,
  createdAt: row.created_at,
});

// Map Report to Row
export const mapReportToRow = (report: Report) => ({
  id: report.id,
  item_id: report.itemId,
  item_title: report.itemTitle,
  reported_by_user_id: report.reportedByUserId,
  reported_by_user_name: report.reportedByUserName,
  reason: report.reason,
  details: report.details,
  status: report.status,
  created_at: report.createdAt,
});

// Supabase Async API functions with automatic fallbacks
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
    const { error } = await supabase.from('items').insert([row]);
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

export async function fetchSupabaseUsers(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(mapRowToUser);
  } catch {
    return null;
  }
}

export async function insertSupabaseUser(user: User): Promise<boolean> {
  try {
    const row = mapUserToRow(user);
    const { error } = await supabase.from('users').upsert([row]);
    return !error;
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

export async function updateSupabaseClaimStatus(claimId: string, status: Claim['status']): Promise<boolean> {
  try {
    const { error } = await supabase.from('claims').update({ status }).eq('id', claimId);
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
    const row = mapReportToRow(report);
    const { error } = await supabase.from('reports').insert([row]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabaseReportStatus(reportId: string, status: Report['status']): Promise<boolean> {
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
    };
  } catch {
    return null;
  }
}

export async function updateSupabaseStats(stats: PlatformStats): Promise<boolean> {
  try {
    const { error } = await supabase.from('stats').upsert([{
      id: 'global',
      total_users: stats.totalUsers,
      total_lost_items: stats.totalLostItems,
      total_found_items: stats.totalFoundItems,
      active_cases_count: stats.activeCasesCount,
      updated_at: new Date().toISOString(),
    }]);
    return !error;
  } catch {
    return false;
  }
}

// Seed initial database into Supabase if empty
export async function seedSupabaseIfEmpty(): Promise<boolean> {
  try {
    const existingUsers = await fetchSupabaseUsers();
    if (!existingUsers || existingUsers.length === 0) {
      // Seed users
      const userRows = SAMPLE_USERS.map(mapUserToRow);
      await supabase.from('users').upsert(userRows);
    }

    const existingItems = await fetchSupabaseItems();
    if (!existingItems || existingItems.length === 0) {
      // Seed items
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
