import {
  Item,
  User,
  PlatformStats,
  Claim,
  Report,
  CustodyStep,
  NotificationItem,
  ChatMessage,
  AuditLogEntry,
  UserRole,
} from '../types';
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
  executeSupabaseItemReturnedCleanup,
} from '../lib/supabase';

const STORAGE_KEYS = {
  ITEMS: 'campus_lost_found_items_v6',
  USERS: 'campus_lost_found_users_v6',
  STATS: 'campus_lost_found_stats_v6',
  CLAIMS: 'campus_lost_found_claims_v6',
  REPORTS: 'campus_lost_found_reports_v6',
  CURRENT_USER: 'campus_lost_found_current_user_v6',
  NOTIFICATIONS: 'campus_lost_found_notifications_v6',
  CHAT_MESSAGES: 'campus_lost_found_chats_v6',
  AUDIT_LOGS: 'campus_lost_found_audit_logs_v6',
};

export const DEFAULT_USER: User = {
  id: 'guest-student-01',
  regNumber: 'Student/Staff',
  name: 'Campus User',
  email: 'user@campus.edu',
  branch: 'CSE',
  year: '1st Year',
  phone: '',
  role: 'student',
  trustScore: 100,
  verifiedBadges: ['Campus Member'],
  createdAt: new Date().toISOString(),
};

// Initial Seed Notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// Initial Seed Audit Logs
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Initial Chat Messages
const INITIAL_CHATS: ChatMessage[] = [];


// Auto-purge user data from local disk storage for items that are marked as Found
export const autoPurgeFoundItemsFromLocalDB = (): void => {
  try {
    const rawItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!rawItems) return;
    const items: Item[] = JSON.parse(rawItems);
    let modified = false;

    const cleanedItems = items.map((item) => {
      if (item.status === 'Found') {
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
  // Clear any old v5 keys to wipe out historical demo caches
  try {
    const oldKeys = [
      'campus_lost_found_items_v5',
      'campus_lost_found_users_v5',
      'campus_lost_found_stats_v5',
      'campus_lost_found_claims_v5',
      'campus_lost_found_reports_v5',
      'campus_lost_found_current_user_v5',
      'campus_lost_found_notifications_v5',
      'campus_lost_found_chats_v5',
      'campus_lost_found_audit_logs_v5',
    ];
    oldKeys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }

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
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
  }

  autoPurgeFoundItemsFromLocalDB();

  seedSupabaseIfEmpty().then(() => {
    syncFromSupabase();
  });
};

// Sync data from Supabase
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
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
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
    const foundCountFromItems = items.filter((i) => i.status === 'Found' || i.status === 'Recovered').length;
    const lostCountFromItems = items.filter((i) => i.type === 'Lost').length;
    const activeCases = items.filter((i) => i.status === 'Pending').length;

    const total = items.length;
    const recoveryRate = total > 0 ? Math.round((foundCountFromItems / total) * 100) : 0;

    return {
      totalUsers: users.length,
      totalLostItems: lostCountFromItems,
      totalFoundItems: foundCountFromItems,
      activeCasesCount: activeCases,
      recoveryRatePercent: recoveryRate,
      avgRecoveryHours: 0,
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
    return data ? JSON.parse(data) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
};


export const getNotifications = (): NotificationItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const getAuditLogs = (): AuditLogEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

export const getChatMessages = (itemId?: string): ChatMessage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const chats: ChatMessage[] = data ? JSON.parse(data) : INITIAL_CHATS;
    if (itemId) {
      return chats.filter((c) => c.itemId === itemId);
    }
    return chats;
  } catch {
    return INITIAL_CHATS;
  }
};

// Setters & Operations
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const registerUser = (user: User): User => {
  const users = getUsers();
  const existing = users.find((u) => u.regNumber.toLowerCase() === user.regNumber.toLowerCase());
  if (existing) {
    setCurrentUser(existing);
    return existing;
  }

  const updatedUser: User = {
    ...user,
    trustScore: user.trustScore ?? 85,
    verifiedBadges: user.verifiedBadges || ['Verified Student ID'],
  };

  const updatedUsers = [updatedUser, ...users];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  setCurrentUser(updatedUser);

  const stats = getStats();
  stats.totalUsers += 1;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  insertSupabaseUser(updatedUser);
  updateSupabaseStats(stats);

  addAuditLog({
    actorName: updatedUser.name,
    actorRole: updatedUser.role,
    action: 'USER_REGISTERED',
    targetId: updatedUser.id,
    details: `New ${updatedUser.role} registration for ID ${updatedUser.regNumber}`,
  });

  return updatedUser;
};

// Generate standardized campus QR code string
export const generateCampusItemCode = (type: 'Lost' | 'Found'): string => {
  const prefix = type === 'Found' ? 'FND' : 'LST';
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-CAMPUS-${year}-${randomSuffix}`;
};

export const addItem = (newItem: Omit<Item, 'id' | 'createdAt' | 'status'>): Item => {
  const items = getItems();
  const itemCode = newItem.itemCode || generateCampusItemCode(newItem.type);

  const initialCustody: CustodyStep[] = [
    {
      step: newItem.type === 'Found' ? 'Found' : 'Submitted to Desk',
      timestamp: new Date().toLocaleString(),
      actor: newItem.userName,
      role: 'Student Reporter',
      location: newItem.location,
      note: `${newItem.type} report generated under code ${itemCode}`,
    },
  ];

  const createdItem: Item = {
    ...newItem,
    id: `item-${Date.now()}`,
    itemCode,
    status: 'Pending',
    custodyHistory: newItem.custodyHistory || initialCustody,
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

  insertSupabaseItem(createdItem);
  updateSupabaseStats(stats);

  addAuditLog({
    actorName: createdItem.userName,
    actorRole: 'Reporter',
    action: `${createdItem.type.toUpperCase()}_REPORT_CREATED`,
    targetId: createdItem.itemCode || createdItem.id,
    details: `Item "${createdItem.title}" reported at ${createdItem.location}`,
  });

  // Trigger automated notification for real-time demonstration
  addNotification({
    userId: createdItem.userId,
    title: `📋 ${createdItem.type} Item Registered: #${createdItem.itemCode}`,
    message: `"${createdItem.title}" is now active in the campus recovery network with AI monitoring enabled.`,
    type: 'item',
    linkItemId: createdItem.id,
  });

  return createdItem;
};

export const addCustodyStepToItem = (
  itemId: string,
  stepData: Omit<CustodyStep, 'timestamp'>
): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return null;

  const newStep: CustodyStep = {
    ...stepData,
    timestamp: new Date().toLocaleString(),
  };

  const currentHistory = items[itemIndex].custodyHistory || [];
  items[itemIndex].custodyHistory = [...currentHistory, newStep];

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  updateSupabaseItem(items[itemIndex]);

  addAuditLog({
    actorName: stepData.actor,
    actorRole: stepData.role || 'Staff',
    action: 'CUSTODY_UPDATED',
    targetId: items[itemIndex].itemCode || itemId,
    details: `Step "${stepData.step}" logged. Note: ${stepData.note || 'No note'}`,
  });

  return items[itemIndex];
};

export const markItemRecovered = (itemId: string, finderPhone: string, finderNote?: string): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return null;

  items[itemIndex].status = 'Recovered';
  items[itemIndex].finderPhone = finderPhone;
  items[itemIndex].finderNote = finderNote || 'Finder provided contact details for physical handoff.';

  addCustodyStepToItem(itemId, {
    step: 'Claimed',
    actor: 'Campus Good Samaritan / Finder',
    role: 'Finder',
    location: items[itemIndex].location,
    note: 'Finder verified and submitted handoff coordinates to owner.',
  });

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  updateSupabaseItem(items[itemIndex]);

  return items[itemIndex];
};

export const markItemReceivedAndCleanup = (itemId: string): Item | null => {
  const items = getItems();
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return null;

  const item = items[itemIndex];
  item.status = 'Found';

  // Add final custody milestone
  if (item.custodyHistory) {
    item.custodyHistory.push({
      step: 'Returned & Closed',
      timestamp: new Date().toLocaleString(),
      actor: item.userName || 'Owner',
      role: 'Owner',
      location: item.location,
      note: 'Item confirmed in possession of legitimate owner. Privacy data purged.',
    });
  }

  // PRIVACY AUTO-CLEANUP
  item.imageUrl = undefined;
  item.userRegNumber = '[CLEANED - ITEM FOUND]';
  item.userPhone = '[CLEANED - ITEM FOUND]';
  item.finderPhone = '[CLEANED - ITEM FOUND]';
  item.finderNote = '[CLEANED - CASE CLOSED]';
  item.identifyingDetails = '[CLEANED FOR PRIVACY]';

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

  const claims = getClaims();
  const updatedClaims = claims.filter((c) => c.itemId !== itemId);
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedClaims));

  const stats = getStats();
  stats.totalFoundItems += 1;
  stats.activeCasesCount = Math.max(0, stats.activeCasesCount - 1);
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  updateSupabaseItem(item);
  updateSupabaseStats(stats);
  executeSupabaseItemReturnedCleanup(itemId, item.type);

  addAuditLog({
    actorName: 'System & Owner',
    actorRole: 'Security / Owner',
    action: 'CASE_RESOLVED_AND_PURGED',
    targetId: item.itemCode || itemId,
    details: `Item successfully recovered. All identifying user records purged from local database.`,
  });

  addNotification({
    userId: item.userId,
    title: '🎉 Item Returned & Case Closed',
    message: `Case for "${item.title}" (${item.itemCode}) closed. Privacy protection data wipe applied.`,
    type: 'system',
  });

  return item;
};

export const deleteItem = (itemId: string): void => {
  const items = getItems();
  const target = items.find((i) => i.id === itemId);
  const updatedItems = items.filter((i) => i.id !== itemId);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

  deleteSupabaseItem(itemId);

  if (target) {
    addAuditLog({
      actorName: 'Admin / Owner',
      actorRole: 'Authorized User',
      action: 'ITEM_DELETED',
      targetId: target.itemCode || itemId,
      details: `Item "${target.title}" permanently removed from records`,
    });
  }
};

export const toggleFlagItem = (itemId: string, isFlagged: boolean, reason?: string): void => {
  const items = getItems();
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex !== -1) {
    items[itemIndex].isFlagged = isFlagged;
    items[itemIndex].flagReason = reason;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    updateSupabaseItem(items[itemIndex]);

    addAuditLog({
      actorName: 'Moderation System',
      actorRole: 'Security',
      action: isFlagged ? 'ITEM_FLAGGED' : 'FLAG_CLEARED',
      targetId: items[itemIndex].itemCode || itemId,
      details: reason || 'Item moderation flag toggled',
    });
  }
};

export const addClaim = (claim: Omit<Claim, 'id' | 'createdAt' | 'status'>): Claim => {
  const claims = getClaims();
  const items = getItems();
  const targetItem = items.find((i) => i.id === claim.itemId);

  const newClaim: Claim = {
    ...claim,
    id: `claim-${Date.now()}`,
    itemCode: targetItem?.itemCode,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([newClaim, ...claims]));
  insertSupabaseClaim(newClaim);

  addAuditLog({
    actorName: newClaim.claimantName,
    actorRole: 'Student Claimant',
    action: 'CLAIM_SUBMITTED',
    targetId: newClaim.itemCode || newClaim.itemId,
    details: `Verification claim submitted with AI Confidence Score: ${newClaim.confidenceScore ?? 'Pending'}%`,
  });

  addNotification({
    userId: targetItem?.userId || 'all',
    title: '📝 New Verification Claim Submitted',
    message: `${newClaim.claimantName} submitted a hidden ownership verification claim for "${newClaim.itemTitle}".`,
    type: 'claim',
    linkItemId: newClaim.itemId,
  });

  return newClaim;
};

export const updateClaimStatus = (claimId: string, status: Claim['status']): void => {
  const claims = getClaims();
  const idx = claims.findIndex((c) => c.id === claimId);
  if (idx !== -1) {
    claims[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    updateSupabaseClaimStatus(claimId, status);

    addAuditLog({
      actorName: 'Admin / Security Desk',
      actorRole: 'Desk Custodian',
      action: `CLAIM_${status.toUpperCase().replace(/\s+/g, '_')}`,
      targetId: claims[idx].itemCode || claims[idx].itemId,
      details: `Claim by ${claims[idx].claimantName} was marked as ${status}`,
    });

    addNotification({
      userId: claims[idx].claimantId,
      title: `🛡️ Claim ${status}: "${claims[idx].itemTitle}"`,
      message:
        status === 'Approved'
          ? 'Your claim was verified! You may pick up your item at the Security Desk.'
          : `Your claim status has been updated to ${status}.`,
      type: 'claim',
      linkItemId: claims[idx].itemId,
    });
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

  toggleFlagItem(report.itemId, true, report.reason);
  insertSupabaseReport(newReport);

  addAuditLog({
    actorName: newReport.reportedByUserName,
    actorRole: 'Community Member',
    action: 'FRAUD_OR_SPAM_REPORTED',
    targetId: newReport.itemId,
    details: `Flagged for "${newReport.reason}": ${newReport.details}`,
  });

  return newReport;
};

export const resolveReport = (reportId: string, status: Report['status']): void => {
  const reports = getReports();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    reports[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    updateSupabaseReportStatus(reportId, status);
  }
};

export const deleteMultipleItems = (itemIds: string[]): void => {
  if (!itemIds.length) return;
  const items = getItems();
  const updatedItems = items.filter((i) => !itemIds.includes(i.id));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));
  itemIds.forEach((id) => deleteSupabaseItem(id));
};

export const toggleFlagMultipleItems = (itemIds: string[], isFlagged: boolean, reason?: string): void => {
  if (!itemIds.length) return;
  const items = getItems();
  let modified = false;

  items.forEach((item) => {
    if (itemIds.includes(item.id)) {
      item.isFlagged = isFlagged;
      item.flagReason = isFlagged ? reason || 'Bulk admin flag action' : undefined;
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

  items.forEach((item) => {
    if (itemIds.includes(item.id)) {
      const oldStatus = item.status;
      if (oldStatus !== targetStatus) {
        item.status = targetStatus;
        modified = true;

        if (targetStatus === 'Found') {
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
  const updatedUsers = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
};

export const updateItemDetails = (itemId: string, updates: Partial<Item>): Item | null => {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;

  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  updateSupabaseItem(items[idx]);
  return items[idx];
};

export const purgeItemPrivacyData = (itemId: string): Item | null => {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
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

// Notifications Operations
export const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem => {
  const notifs = getNotifications();
  const newNotif: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}`,
    timestamp: 'Just now',
    isRead: false,
  };
  const updated = [newNotif, ...notifs].slice(0, 30);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  return newNotif;
};

export const markNotificationRead = (notifId: string): void => {
  const notifs = getNotifications();
  const updated = notifs.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
};

export const markAllNotificationsRead = (): void => {
  const notifs = getNotifications();
  const updated = notifs.map((n) => ({ ...n, isRead: true }));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
};

export const clearAllNotifications = (): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
};

// Audit Log Operation
export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  const updated = [newEntry, ...logs].slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  return newEntry;
};

// Anonymous In-App Chat Operations
export const sendChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
  const chats = getChatMessages();
  const newMsg: ChatMessage = {
    ...message,
    id: `chat-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  const updated = [...chats, newMsg];
  localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updated));

  addNotification({
    userId: message.recipientId,
    title: `💬 Secure Message on "${message.itemTitle}"`,
    message: `${message.senderName}: "${message.text.slice(0, 60)}${message.text.length > 60 ? '...' : ''}"`,
    type: 'chat',
    linkItemId: message.itemId,
  });

  return newMsg;
};

// Fraud Detection Heuristics
export interface FraudAlert {
  type: 'RAPID_CLAIMS' | 'DUPLICATE_IMAGES' | 'REPEATED_FAILED_CLAIMS';
  severity: 'HIGH' | 'MEDIUM';
  message: string;
  userId?: string;
  count: number;
}

export const scanForFraudAlerts = (): FraudAlert[] => {
  const claims = getClaims();
  const alerts: FraudAlert[] = [];

  // 1. Detect rapid multi-claims (>3 claims in short period by same user)
  const claimsByUser: Record<string, number> = {};
  claims.forEach((c) => {
    claimsByUser[c.claimantName] = (claimsByUser[c.claimantName] || 0) + 1;
  });

  Object.entries(claimsByUser).forEach(([name, count]) => {
    if (count >= 3) {
      alerts.push({
        type: 'RAPID_CLAIMS',
        severity: 'HIGH',
        message: `User "${name}" has submitted ${count} distinct item claims. Recommend identity cross-verification.`,
        count,
      });
    }
  });

  return alerts;
};

export const resetDataToSeed = (): void => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
};

