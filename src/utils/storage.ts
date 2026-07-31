import { Item, User, PlatformStats, Claim, Report, ItemStatus } from '../types';
import { INITIAL_ITEMS, INITIAL_STATS, SAMPLE_USERS } from '../data/initialData';

const STORAGE_KEYS = {
  ITEMS: 'campus_lost_found_items_v2',
  USERS: 'campus_lost_found_users_v2',
  STATS: 'campus_lost_found_stats_v2',
  CLAIMS: 'campus_lost_found_claims_v2',
  REPORTS: 'campus_lost_found_reports_v2',
  CURRENT_USER: 'campus_lost_found_current_user_v2',
};

// Initialize default storage if empty
export const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SAMPLE_USERS));
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
    // Default logged-in user: Amrit Rout
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SAMPLE_USERS[0]));
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
    return data ? JSON.parse(data) : SAMPLE_USERS;
  } catch {
    return SAMPLE_USERS;
  }
};

export const getStats = (): PlatformStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) return INITIAL_STATS;
    const parsed: PlatformStats = JSON.parse(data);
    
    // Derive live counts from items and users
    const items = getItems();
    const users = getUsers();
    const foundCountFromItems = items.filter(i => i.status === 'Found').length;
    
    return {
      totalUsers: Math.max(parsed.totalUsers || 0, users.length),
      totalLostItems: Math.max(parsed.totalLostItems || 0, items.filter(i => i.type === 'Lost').length),
      totalFoundItems: (parsed.totalFoundItems || 31) + foundCountFromItems,
      activeCasesCount: items.filter(i => i.status !== 'Found').length,
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

// Setters & Actions
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
  
  // Increment permanent totalUsers counter
  const stats = getStats();
  stats.totalUsers += 1;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  
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

  // Update permanent totalLostItems or stats
  const stats = getStats();
  if (createdItem.type === 'Lost') {
    stats.totalLostItems += 1;
  }
  stats.activeCasesCount += 1;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  return createdItem;
};

/**
 * Mark Item as RECOVERED (🟠) when finder clicks "YES, I'VE FOUND THIS ITEM"
 */
export const markItemRecovered = (itemId: string, finderPhone: string, finderNote?: string): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  items[itemIndex].status = 'Recovered';
  items[itemIndex].finderPhone = finderPhone;
  items[itemIndex].finderNote = finderNote || 'Finder provided contact details for physical handoff.';

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return items[itemIndex];
};

/**
 * Confirm Received -> Mark Item as FOUND (🟢) and execute Privacy Auto-Cleanup!
 * Removes temporary phone numbers, contact details, private identifies, and updates permanent stats!
 */
export const markItemReceivedAndCleanup = (itemId: string): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  const item = items[itemIndex];
  item.status = 'Found';

  // PRIVACY AUTO-CLEANUP: Wipe temporary identifiers and phone numbers
  item.userPhone = '[CLEANED - Case Resolved]';
  item.finderPhone = '[CLEANED - Case Resolved]';
  item.finderNote = '[CLEANED - Case Resolved]';
  item.identifyingDetails = '[CLEANED FOR PRIVACY]';

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

  // Permanently Increment Total Items Found counter
  const stats = getStats();
  stats.totalFoundItems += 1;
  stats.activeCasesCount = Math.max(0, stats.activeCasesCount - 1);
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  return item;
};

export const deleteItem = (itemId: string): void => {
  const items = getItems();
  const updatedItems = items.filter(i => i.id !== itemId);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));
};

export const toggleFlagItem = (itemId: string, isFlagged: boolean, reason?: string): void => {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex !== -1) {
    items[itemIndex].isFlagged = isFlagged;
    items[itemIndex].flagReason = reason;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
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
  return newClaim;
};

export const updateClaimStatus = (claimId: string, status: Claim['status']): void => {
  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === claimId);
  if (idx !== -1) {
    claims[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
  }
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
  
  // Also flag the item
  toggleFlagItem(report.itemId, true, report.reason);

  return newReport;
};

export const resolveReport = (reportId: string, status: Report['status']): void => {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    reports[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }
};

export const resetDataToSeed = (): void => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SAMPLE_USERS));
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SAMPLE_USERS[0]));
};
