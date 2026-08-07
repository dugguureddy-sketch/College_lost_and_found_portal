import { Item, User, PlatformStats, Claim, Report } from '../types';
import { INITIAL_ITEMS, INITIAL_STATS, SAMPLE_USERS } from '../data/initialData';
import {
  fetchSupabaseItems,
  insertSupabaseItem,
  updateSupabaseItem,
  deleteSupabaseItem,
  fetchSupabaseUsers,
  insertSupabaseUser,
  fetchSupabaseClaims,
  insertSupabaseClaim,
  updateSupabaseClaimStatus,
  fetchSupabaseReports,
  insertSupabaseReport,
  updateSupabaseReportStatus,
  fetchSupabaseStats,
  updateSupabaseStats,
  seedSupabaseIfEmpty,
} from '../lib/supabase';

const STORAGE_KEYS = {
  ITEMS: 'campus_lost_found_items_v4',
  USERS: 'campus_lost_found_users_v4',
  STATS: 'campus_lost_found_stats_v4',
  CLAIMS: 'campus_lost_found_claims_v4',
  REPORTS: 'campus_lost_found_reports_v4',
  CURRENT_USER: 'campus_lost_found_current_user_v4',
};

// Auto-purge user data from local disk storage for items that are marked as Found
export const autoPurgeFoundItemsFromLocalDB = (): void => {
  try {
    const rawItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!rawItems) return;
    const items: Item[] = JSON.parse(rawItems);
    let modified = false;

    const cleanedItems = items.map((item) => {
      if (item.status === 'Found') {
        // If data hasn't been cleaned yet for found items, purge user details from local disk database
        if (
          item.imageUrl !== undefined ||
          item.userRegNumber !== '[CLEANED - ITEM FOUND]' ||
          item.userPhone !== '[CLEANED - ITEM FOUND]' ||
          item.finderPhone !== '[CLEANED - ITEM FOUND]' ||
          item.identifyingDetails !== '[CLEANED FOR PRIVACY]'
        ) {
          modified = true;
          return {
            ...item,
            imageUrl: undefined,
            userRegNumber: '[CLEANED - ITEM FOUND]',
            userPhone: '[CLEANED - ITEM FOUND]',
            finderPhone: '[CLEANED - ITEM FOUND]',
            finderNote: '[CLEANED - CASE CLOSED]',
            identifyingDetails: '[CLEANED FOR PRIVACY]',
          };
        }
      }
      return item;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(cleanedItems));

      // Also clean claims for resolved items
      const foundItemIds = cleanedItems.filter((i) => i.status === 'Found').map((i) => i.id);
      const rawClaims = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      if (rawClaims) {
        const claims: Claim[] = JSON.parse(rawClaims);
        const filteredClaims = claims.filter((c) => !foundItemIds.includes(c.itemId));
        if (filteredClaims.length !== claims.length) {
          localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(filteredClaims));
        }
      }
    }
  } catch (err) {
    console.error('Error during autoPurgeFoundItemsFromLocalDB:', err);
  }
};

// Initialize default storage & sync with Supabase
export const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SAMPLE_USERS[0]));
  }

  // Run auto-purge on launch to ensure resolved items have user data cleared from local disk
  autoPurgeFoundItemsFromLocalDB();

  // Asynchronously seed/sync Supabase
  seedSupabaseIfEmpty().then(() => {
    syncFromSupabase();
  });
};

// Sync data from Supabase into local cache if available
export const syncFromSupabase = async (): Promise<boolean> => {
  try {
    const remoteItems = await fetchSupabaseItems();
    if (remoteItems && remoteItems.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(remoteItems));
    }

    const remoteUsers = await fetchSupabaseUsers();
    if (remoteUsers && remoteUsers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(remoteUsers));
    }

    const remoteClaims = await fetchSupabaseClaims();
    if (remoteClaims) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(remoteClaims));
    }

    const remoteReports = await fetchSupabaseReports();
    if (remoteReports) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(remoteReports));
    }

    const remoteStats = await fetchSupabaseStats();
    if (remoteStats) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(remoteStats));
    }

    return true;
  } catch {
    return false;
  }
};

// Getters
export const getItems = (): Item[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return data ? JSON.parse(data) : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
};

export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getStats = (): PlatformStats => {
  try {
    const items = getItems();
    const users = getUsers();
    const foundCountFromItems = items.filter(i => i.status === 'Found' || i.status === 'Recovered').length;
    const lostCountFromItems = items.filter(i => i.type === 'Lost' && i.status === 'Pending').length;
    
    return {
      totalUsers: users.length,
      totalLostItems: items.filter(i => i.type === 'Lost').length,
      totalFoundItems: foundCountFromItems,
      activeCasesCount: items.filter(i => i.status === 'Pending').length,
    };
  } catch {
    return INITIAL_STATS;
  }
};

export const getClaims = (): Claim[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getReports = (): Report[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getCurrentUser = (): User => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : SAMPLE_USERS[0];
  } catch {
    return SAMPLE_USERS[0];
  }
};

// Setters & Actions (Local + Supabase async write)
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const registerUser = (user: User): User => {
  const users = getUsers();
  const existing = users.find(u => u.regNumber.toLowerCase() === user.regNumber.toLowerCase());
  if (existing) {
    setCurrentUser(existing);
    return existing;
  }
  
  const updatedUsers = [user, ...users];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  setCurrentUser(user);
  
  const stats = getStats();
  stats.totalUsers += 1;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  
  // Async write to Supabase
  insertSupabaseUser(user);
  updateSupabaseStats(stats);
  
  return user;
};

export const addItem = (newItem: Omit<Item, 'id' | 'createdAt' | 'status'>): Item => {
  const items = getItems();
  const createdItem: Item = {
    ...newItem,
    id: `item-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const updatedItems = [createdItem, ...items];
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

  const stats = getStats();
  if (createdItem.type === 'Lost') {
    stats.totalLostItems += 1;
  }
  stats.activeCasesCount += 1;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  // Async write to Supabase
  insertSupabaseItem(createdItem);
  updateSupabaseStats(stats);

  return createdItem;
};

export const markItemRecovered = (itemId: string, finderPhone: string, finderNote?: string): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  items[itemIndex].status = 'Recovered';
  items[itemIndex].finderPhone = finderPhone;
  items[itemIndex].finderNote = finderNote || 'Finder provided contact details for physical handoff.';

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

  // Async update to Supabase
  updateSupabaseItem(items[itemIndex]);

  return items[itemIndex];
};

export const markItemReceivedAndCleanup = (itemId: string): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  const item = items[itemIndex];
  item.status = 'Found';

  // PRIVACY AUTO-CLEANUP: Wipe temporary identifiers, regd number, phone numbers, and photos from local disk database on item recovery
  item.imageUrl = undefined;
  item.userRegNumber = '[CLEANED - ITEM FOUND]';
  item.userPhone = '[CLEANED - ITEM FOUND]';
  item.finderPhone = '[CLEANED - ITEM FOUND]';
  item.finderNote = '[CLEANED - CASE CLOSED]';
  item.identifyingDetails = '[CLEANED FOR PRIVACY]';

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

  // Auto-clear claims associated with this item from local disk database
  const claims = getClaims();
  const updatedClaims = claims.filter(c => c.itemId !== itemId);
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedClaims));

  const stats = getStats();
  stats.totalFoundItems += 1;
  stats.activeCasesCount = Math.max(0, stats.activeCasesCount - 1);
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  // Async update to Supabase
  updateSupabaseItem(item);
  updateSupabaseStats(stats);

  return item;
};

export const deleteItem = (itemId: string): void => {
  const items = getItems();
  const updatedItems = items.filter(i => i.id !== itemId);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

  // Async delete from Supabase
  deleteSupabaseItem(itemId);
};

export const toggleFlagItem = (itemId: string, isFlagged: boolean, reason?: string): void => {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex !== -1) {
    items[itemIndex].isFlagged = isFlagged;
    items[itemIndex].flagReason = reason;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    
    // Async update to Supabase
    updateSupabaseItem(items[itemIndex]);
  }
};

export const addClaim = (claim: Omit<Claim, 'id' | 'createdAt' | 'status'>): Claim => {
  const claims = getClaims();
  const newClaim: Claim = {
    ...claim,
    id: `claim-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([newClaim, ...claims]));

  // Async write to Supabase
  insertSupabaseClaim(newClaim);

  return newClaim;
};

export const updateClaimStatus = (claimId: string, status: Claim['status']): void => {
  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === claimId);
  if (idx !== -1) {
    claims[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

    // Async update to Supabase
    updateClaimStatusInSupabase(claimId, status);
  }
};

const updateClaimStatusInSupabase = async (claimId: string, status: Claim['status']) => {
  await updateSupabaseClaimStatus(claimId, status);
};

export const addReport = (report: Omit<Report, 'id' | 'createdAt' | 'status'>): Report => {
  const reports = getReports();
  const newReport: Report = {
    ...report,
    id: `report-${Date.now()}`,
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([newReport, ...reports]));
  
  toggleFlagItem(report.itemId, true, report.reason);

  // Async write to Supabase
  insertSupabaseReport(newReport);

  return newReport;
};

export const resolveReport = (reportId: string, status: Report['status']): void => {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    reports[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Async update to Supabase
    updateSupabaseReportStatus(reportId, status);
  }
};

export const deleteMultipleItems = (itemIds: string[]): void => {
  if (!itemIds.length) return;
  const items = getItems();
  const updatedItems = items.filter(i => !itemIds.includes(i.id));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

  // Async delete from Supabase
  itemIds.forEach(id => deleteSupabaseItem(id));
};

export const toggleFlagMultipleItems = (itemIds: string[], isFlagged: boolean, reason?: string): void => {
  if (!itemIds.length) return;
  const items = getItems();
  let modified = false;

  items.forEach(item => {
    if (itemIds.includes(item.id)) {
      item.isFlagged = isFlagged;
      item.flagReason = isFlagged ? (reason || 'Bulk admin flag action') : undefined;
      modified = true;
      updateSupabaseItem(item);
    }
  });

  if (modified) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }
};

export const updateMultipleItemStatuses = (itemIds: string[], targetStatus: Item['status']): void => {
  if (!itemIds.length) return;
  const items = getItems();
  const stats = getStats();
  let modified = false;

  items.forEach(item => {
    if (itemIds.includes(item.id)) {
      const oldStatus = item.status;
      if (oldStatus !== targetStatus) {
        item.status = targetStatus;
        modified = true;

        if (targetStatus === 'Found') {
          // Auto privacy cleanup
          item.imageUrl = undefined;
          item.userRegNumber = '[CLEANED - ITEM FOUND]';
          item.userPhone = '[CLEANED - ITEM FOUND]';
          item.finderPhone = '[CLEANED - ITEM FOUND]';
          item.finderNote = '[CLEANED - CASE CLOSED]';
          item.identifyingDetails = '[CLEANED FOR PRIVACY]';

          if (oldStatus !== 'Found') {
            stats.totalFoundItems += 1;
            stats.activeCasesCount = Math.max(0, stats.activeCasesCount - 1);
          }
        } else if (targetStatus === 'Pending' && oldStatus === 'Found') {
          stats.totalFoundItems = Math.max(0, stats.totalFoundItems - 1);
          stats.activeCasesCount += 1;
        }

        updateSupabaseItem(item);
      }
    }
  });

  if (modified) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    updateSupabaseStats(stats);
  }
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const updatedUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
};

export const updateItemDetails = (itemId: string, updates: Partial<Item>): Item | null => {
  const items = getItems();
  const idx = items.findIndex(i => i.id === itemId);
  if (idx === -1) return null;

  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  updateSupabaseItem(items[idx]);
  return items[idx];
};

export const purgeItemPrivacyData = (itemId: string): Item | null => {
  const items = getItems();
  const idx = items.findIndex(i => i.id === itemId);
  if (idx === -1) return null;

  items[idx].imageUrl = undefined;
  items[idx].userRegNumber = '[CLEANED BY ADMIN]';
  items[idx].userPhone = '[CLEANED BY ADMIN]';
  items[idx].finderPhone = '[CLEANED BY ADMIN]';
  items[idx].finderNote = '[CLEANED BY ADMIN]';
  items[idx].identifyingDetails = '[CLEANED FOR PRIVACY BY ADMIN]';

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  updateSupabaseItem(items[idx]);
  return items[idx];
};

export const resetDataToSeed = (): void => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SAMPLE_USERS[0]));

  // Async reset Supabase
  seedSupabaseIfEmpty();
};

