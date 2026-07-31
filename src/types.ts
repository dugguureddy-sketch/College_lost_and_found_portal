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
  | 'Other Campus Area';

export type BranchType = 'CSE' | 'ECE' | 'ME' | 'EEE' | 'Civil' | 'Biotech' | 'IT' | 'MBA' | 'Other';
export type YearType = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Faculty / Staff';

export interface User {
  id: string;
  regNumber: string;
  name: string;
  email?: string;
  branch: BranchType;
  year: YearType;
  phone: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface Item {
  id: string;
  userId: string;
  userRegNumber: string;
  userName: string;
  userBranch: BranchType;
  userYear: YearType;
  userPhone: string; // Temporary during active case
  
  title: string;
  type: ItemType; // Lost or Found
  category: CategoryType;
  description: string;
  location: LocationType;
  roomDetails: string; // Room / Place e.g. "Room 204", "Table 12"
  date: string; // YYYY-MM-DD
  time?: string;
  color?: string;
  identifyingDetails?: string; // Private / secret detail
  imageUrl?: string;
  
  status: ItemStatus; // 'Pending' (🟡), 'Recovered' (🟠), 'Found' (🟢)
  finderPhone?: string; // Finder contact number when 🟠 Recovered
  finderNote?: string;
  isFlagged?: boolean;
  flagReason?: string;
  
  createdAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  claimantId: string;
  claimantName: string;
  claimantPhone: string;
  claimantBranch: BranchType;
  claimantYear: YearType;
  reason: string;
  secretDetail: string;
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
}

export interface FilterOptions {
  searchQuery: string;
  type: 'All' | 'Lost' | 'Found';
  status: 'All' | 'Pending' | 'Recovered' | 'Found';
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
}

export interface MatchResult {
  lostItem: Item;
  foundItem: Item;
  score: number; // 0 to 100
  reasons: string[];
}
