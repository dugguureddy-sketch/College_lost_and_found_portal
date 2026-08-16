export type ItemType = 'Lost' | 'Found';

export type ItemStatus = 'Pending' | 'Recovered' | 'Found';

export type CategoryType = 
  | 'Electronics' 
  | 'Books' 
  | 'ID Cards' 
  | 'Wallet' 
  | 'Keys' 
  | 'Accessories' 
  | 'Clothing' 
  | 'Bags' 
  | 'Documents' 
  | 'Other';

export type LocationType = 
  | 'Academic Block'
  | 'Central Library'
  | 'Canteen / Cafeteria'
  | 'Hostel'
  | 'Playground / Sports Complex'
  | 'Science & Tech Labs'
  | 'Auditorium'
  | 'Administrative Block'
  | 'Bus Stand / Parking'
  | 'Other Campus Area'
  | 'Custom Location'
  | (string & {});

export type BranchType = 'CSE' | 'ECE' | 'ME' | 'EEE' | 'Civil' | 'Biotech' | 'IT' | 'MBA' | 'Other';
export type YearType = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Faculty / Staff';
export type UserRole = 'student' | 'faculty' | 'security' | 'admin';

export interface User {
  id: string;
  regNumber: string;
  name: string;
  email?: string;
  branch: BranchType;
  year: YearType;
  phone: string;
  role: UserRole;
  trustScore?: number; // 0 to 100
  verifiedBadges?: string[];
  createdAt: string;
}

export interface CustodyStep {
  step: 'Found' | 'Submitted to Desk' | 'Verified by Security' | 'Storage Assigned' | 'Claimed' | 'Returned & Closed';
  timestamp: string;
  actor: string;
  role?: string;
  location?: string;
  note?: string;
}

export interface Item {
  id: string;
  itemCode?: string; // e.g. FND-CAMPUS-2026-01842
  userId: string;
  userRegNumber: string;
  userName: string;
  userBranch: BranchType;
  userYear: YearType;
  userPhone: string; // Temporary during active case
  
  title: string;
  type: ItemType; // Lost or Found
  category: CategoryType;
  brand?: string;
  description: string;
  location: LocationType;
  roomDetails: string; // Room / Place e.g. "Room 204", "Table 12"
  date: string; // YYYY-MM-DD
  time?: string;
  color?: string;
  identifyingDetails?: string; // Private / secret detail
  imageUrl?: string;
  visualTags?: string[];
  storageLocation?: string; // e.g. "Security Desk Locker #B-14"
  
  status: ItemStatus; // 'Pending' (🟡), 'Recovered' (🟠), 'Found' (🟢)
  finderPhone?: string; // Finder contact number when 🟠 Recovered
  finderNote?: string;
  isFlagged?: boolean;
  flagReason?: string;
  
  custodyHistory?: CustodyStep[];
  
  createdAt: string;
}

export interface HiddenVerificationAnswers {
  stickerOrMark?: string;
  contents?: string;
  uniqueMark?: string;
  lockOrSerial?: string;
  reason?: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCode?: string;
  claimantId: string;
  claimantName: string;
  claimantPhone: string;
  claimantBranch: BranchType;
  claimantYear: YearType;
  reason: string;
  secretDetail?: string;
  hiddenAnswers?: HiddenVerificationAnswers;
  confidenceScore?: number; // AI verification confidence 0-100
  aiVerdict?: string;
  aiAssessmentReason?: string;
  status: 'Pending' | 'Under Verification' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Report {
  id: string;
  itemId: string;
  itemTitle: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reason: 'Fake Photo' | 'Inappropriate Content' | 'Extortion / Scam' | 'Duplicate / Spam' | 'Other';
  details: string;
  status: 'Pending Review' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalLostItems: number;
  totalFoundItems: number;
  activeCasesCount: number;
  recoveryRatePercent?: number;
  avgRecoveryHours?: number;
}

export interface FilterOptions {
  searchQuery: string;
  type: 'All' | 'Lost' | 'Found';
  status: 'All' | 'Pending' | 'Recovered' | 'Found';
  category: string;
  location: string;
  color?: string;
  brand?: string;
  dateFrom: string;
  dateTo: string;
}

export interface MatchReasonDetail {
  title: string;
  matched: boolean;
  scoreContribution: number;
  detail: string;
}

export interface MatchResult {
  lostItem: Item;
  foundItem: Item;
  score: number; // 0 to 100
  confidenceLabel?: 'High Probability' | 'Moderate Match' | 'Low Possibility';
  reasons: string[];
  granularBreakdown?: MatchReasonDetail[];
  aiSummary?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'claim' | 'item' | 'system' | 'chat';
  timestamp: string;
  isRead: boolean;
  linkItemId?: string;
  matchScore?: number;
}

export interface ChatMessage {
  id: string;
  itemId: string;
  itemTitle: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  recipientId: string;
  text: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId: string;
  details: string;
}

export interface CampusZone {
  name: LocationType;
  shortName: string;
  x: number; // % from left
  y: number; // % from top
  hotspotLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

