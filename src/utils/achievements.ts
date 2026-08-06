import { Item, User, Claim } from '../types';

export type SamaritanTier = 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface SamaritanBadge {
  tier: SamaritanTier;
  title: string;
  minHelps: number;
  badgeEmoji: string;
  iconName: string; // Award, ShieldCheck, Medal, Crown, Heart
  bgGradient: string;
  borderColor: string;
  textColor: string;
  pillBg: string;
  pillText: string;
  description: string;
  perks: string;
}

export const SAMARITAN_BADGES: SamaritanBadge[] = [
  {
    tier: 'Novice',
    title: 'Campus Citizen',
    minHelps: 0,
    badgeEmoji: '🌱',
    iconName: 'Heart',
    bgGradient: 'from-slate-50 to-slate-100',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-600',
    pillBg: 'bg-slate-100',
    pillText: 'text-slate-700 border-slate-200',
    description: 'Every campus hero starts here! Help return a lost item to earn your first Samaritan badge.',
    perks: 'Standard item reporting & listing access',
  },
  {
    tier: 'Bronze',
    title: 'Bronze Samaritan',
    minHelps: 1,
    badgeEmoji: '🥉',
    iconName: 'Award',
    bgGradient: 'from-amber-50 to-orange-100',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-900',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-900 border-amber-300 font-bold',
    description: 'Unlocked by helping return at least 1 lost item to its rightful owner on campus.',
    perks: 'Verified Samaritan Badge displayed on profile & item posts. Trust Boost (+120 Karma)',
  },
  {
    tier: 'Silver',
    title: 'Silver Samaritan',
    minHelps: 3,
    badgeEmoji: '🥈',
    iconName: 'ShieldCheck',
    bgGradient: 'from-slate-100 to-sky-100',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-800',
    pillBg: 'bg-slate-200',
    pillText: 'text-slate-900 border-slate-300 font-bold',
    description: 'Consistently helps the campus community! Returned 3+ items safely.',
    perks: 'Silver Samaritan Halo badge on listings. Priority AI Smart-Match notifications (+450 Karma)',
  },
  {
    tier: 'Gold',
    title: 'Gold Samaritan',
    minHelps: 5,
    badgeEmoji: '🥇',
    iconName: 'Medal',
    bgGradient: 'from-amber-100 via-orange-100 to-yellow-100',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-950',
    pillBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    pillText: 'text-slate-950 border-amber-400 font-black shadow-sm',
    description: 'Campus Hero status! Unlocked by helping 5+ students recover lost belongings.',
    perks: 'Gold Hero Crown on listings, Top Samaritan Leaderboard placement (+900 Karma)',
  },
  {
    tier: 'Diamond',
    title: 'Diamond Samaritan',
    minHelps: 10,
    badgeEmoji: '💎',
    iconName: 'Crown',
    bgGradient: 'from-cyan-100 via-sky-100 to-indigo-100',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-950',
    pillBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    pillText: 'text-white border-cyan-400 font-black shadow-md',
    description: 'Legendary Campus Samaritan! Outstanding dedication to restoring lost property across campus.',
    perks: 'Legendary Crown badge, Campus Hall of Fame entry, Admin Verified Honor (+1650 Karma)',
  },
];

const EXTRA_HELPS_KEY = 'campus_samaritan_extra_helps_v1';

export const getExtraSamaritanHelps = (userId: string): number => {
  try {
    const data = localStorage.getItem(`${EXTRA_HELPS_KEY}_${userId}`);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
};

export const addExtraSamaritanHelp = (userId: string, count = 1): number => {
  const current = getExtraSamaritanHelps(userId);
  const updated = current + count;
  localStorage.setItem(`${EXTRA_HELPS_KEY}_${userId}`, updated.toString());
  return updated;
};

export interface UserSamaritanStats {
  userId: string;
  userName: string;
  regNumber: string;
  branch?: string;
  year?: string;
  totalHelps: number;
  foundItemsPosted: number;
  recoveredCount: number;
  extraCredits: number;
  karmaPoints: number;
  currentBadge: SamaritanBadge;
  nextBadge: SamaritanBadge | null;
  progressPercent: number;
  helpsNeededForNext: number;
  unlockedBadges: SamaritanBadge[];
}

export const calculateUserSamaritanStats = (
  user: { id: string; regNumber: string; name: string; branch?: string; year?: string; phone?: string },
  items: Item[],
  claims?: Claim[]
): UserSamaritanStats => {
  const userId = user.id;
  const userReg = user.regNumber.toLowerCase();

  // 1. Found items posted by this user
  const foundItemsPosted = items.filter(
    (i) => (i.userId === userId || i.userRegNumber.toLowerCase() === userReg) && i.type === 'Found'
  );

  // 2. Found items posted by this user that reached Recovered or Found status
  const foundItemsResolved = foundItemsPosted.filter(
    (i) => i.status === 'Found' || i.status === 'Recovered'
  ).length;

  // 3. Items where this user acted as finder (finderPhone match)
  const itemsWhereFinder = items.filter((i) => {
    if (i.status === 'Recovered' || i.status === 'Found') {
      if (user.phone && i.finderPhone && i.finderPhone === user.phone) return true;
    }
    return false;
  }).length;

  // 4. Approved claims for found items posted by user
  const approvedClaimsForUserItems = claims
    ? claims.filter(
        (c) =>
          c.status === 'Approved' &&
          items.some((i) => i.id === c.itemId && (i.userId === userId || i.userRegNumber.toLowerCase() === userReg))
      ).length
    : 0;

  // 5. Extra manually logged / simulated credits
  const extraCredits = getExtraSamaritanHelps(userId);

  // Base helps count calculation
  const rawHelps = foundItemsResolved + itemsWhereFinder + approvedClaimsForUserItems + extraCredits;
  
  // Active found items bonus (+1 per active found listing)
  const activeFoundBonus = foundItemsPosted.filter((i) => i.status === 'Pending').length;
  
  const totalHelps = Math.max(0, rawHelps + activeFoundBonus);

  // Determine current badge tier based on totalHelps
  let currentBadge = SAMARITAN_BADGES[0];
  for (let i = SAMARITAN_BADGES.length - 1; i >= 0; i--) {
    if (totalHelps >= SAMARITAN_BADGES[i].minHelps) {
      currentBadge = SAMARITAN_BADGES[i];
      break;
    }
  }

  // Find next badge
  const currentIndex = SAMARITAN_BADGES.findIndex((b) => b.tier === currentBadge.tier);
  const nextBadge = currentIndex < SAMARITAN_BADGES.length - 1 ? SAMARITAN_BADGES[currentIndex + 1] : null;

  let progressPercent = 100;
  let helpsNeededForNext = 0;

  if (nextBadge) {
    const prevMin = currentBadge.minHelps;
    const nextMin = nextBadge.minHelps;
    helpsNeededForNext = Math.max(0, nextMin - totalHelps);
    progressPercent = Math.min(100, Math.round(((totalHelps - prevMin) / (nextMin - prevMin)) * 100));
  }

  // Unlocked badges list
  const unlockedBadges = SAMARITAN_BADGES.filter((b) => totalHelps >= b.minHelps);

  // Karma points: 120 per help + tier bonuses
  const karmaPoints = totalHelps * 120 + (unlockedBadges.length - 1) * 150;

  return {
    userId,
    userName: user.name,
    regNumber: user.regNumber,
    branch: user.branch,
    year: user.year,
    totalHelps,
    foundItemsPosted: foundItemsPosted.length,
    recoveredCount: foundItemsResolved,
    extraCredits,
    karmaPoints,
    currentBadge,
    nextBadge,
    progressPercent,
    helpsNeededForNext,
    unlockedBadges,
  };
};
