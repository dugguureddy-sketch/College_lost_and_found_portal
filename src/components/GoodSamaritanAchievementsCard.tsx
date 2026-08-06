import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Medal, 
  Crown, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Trophy, 
  TrendingUp, 
  PlusCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { User, Item, Claim } from '../types';
import { 
  SAMARITAN_BADGES, 
  calculateUserSamaritanStats, 
  addExtraSamaritanHelp,
  SamaritanBadge 
} from '../utils/achievements';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';

interface GoodSamaritanAchievementsCardProps {
  currentUser: User;
  items: Item[];
  claims?: Claim[];
  onStatsUpdate?: () => void;
}

export const GoodSamaritanAchievementsCard: React.FC<GoodSamaritanAchievementsCardProps> = ({
  currentUser,
  items,
  claims,
  onStatsUpdate,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<SamaritanBadge | null>(null);
  const [showLogDeedSuccess, setShowLogDeedSuccess] = useState<string | null>(null);

  const stats = calculateUserSamaritanStats(currentUser, items, claims);

  const handleLogTestDeed = () => {
    addExtraSamaritanHelp(currentUser.id, 1);
    setShowLogDeedSuccess('🎉 Good Deed Logged! +120 Karma Points added & Samaritan progress updated.');
    if (onStatsUpdate) onStatsUpdate();
    setTimeout(() => setShowLogDeedSuccess(null), 4000);
  };

  // Generate top samaritans for campus leaderboard
  const sampleLeaderboard = [
    {
      name: currentUser.name,
      reg: currentUser.regNumber,
      branch: currentUser.branch,
      helps: stats.totalHelps,
      karma: stats.karmaPoints,
      badge: stats.currentBadge,
      isCurrent: true,
    },
    {
      name: 'Rahul Verma',
      reg: '21ECE088',
      branch: 'ECE',
      helps: 6,
      karma: 900,
      badge: SAMARITAN_BADGES.find((b) => b.tier === 'Gold')!,
      isCurrent: false,
    },
    {
      name: 'Priya Sharma',
      reg: '23ME015',
      branch: 'ME',
      helps: 4,
      karma: 600,
      badge: SAMARITAN_BADGES.find((b) => b.tier === 'Silver')!,
      isCurrent: false,
    },
    {
      name: 'Amrit Rout',
      reg: '22CSE1042',
      branch: 'CSE',
      helps: 2,
      karma: 300,
      badge: SAMARITAN_BADGES.find((b) => b.tier === 'Bronze')!,
      isCurrent: false,
    },
  ].sort((a, b) => b.helps - a.helps);

  return (
    <div className="bg-gradient-to-br from-orange-50/80 via-white to-amber-50/40 border-2 border-orange-200 rounded-3xl p-6 shadow-sm mb-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orange-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-200 shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Good Samaritan Achievements
              </h2>
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Visual Badge System
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Earn recognized campus badges & karma points by helping students return lost belongings.
            </p>
          </div>
        </div>

        {/* Action Button: Log Good Deed */}
        <button
          onClick={handleLogTestDeed}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 flex items-center space-x-1.5 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
          <span>+ Log Help Action (+120 Karma)</span>
        </button>
      </div>

      {showLogDeedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{showLogDeedSuccess}</span>
          <button onClick={() => setShowLogDeedSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Main Status & Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Current Tier & Karma */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              Your Current Status
            </span>
            <div className="flex items-center space-x-3">
              <div className={`text-4xl p-2 rounded-2xl bg-orange-50 border border-orange-200`}>
                {stats.currentBadge.badgeEmoji}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {stats.currentBadge.title}
                </h3>
                <div className="mt-1">
                  <GoodSamaritanBadgePill user={currentUser} items={items} size="sm" showKarma />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
              {stats.currentBadge.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] font-black text-amber-800 uppercase block">Items Helped</span>
              <span className="text-lg font-black text-amber-900">{stats.totalHelps}</span>
            </div>
            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] font-black text-amber-800 uppercase block">Karma Points</span>
              <span className="text-lg font-black text-amber-900">{stats.karmaPoints}</span>
            </div>
          </div>
        </div>

        {/* Middle Card: Next Level Progress Bar */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm flex flex-col justify-between space-y-4 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Next Achievement Progress
              </span>
              {stats.nextBadge && (
                <span className="text-xs font-black text-orange-600">
                  {stats.helpsNeededForNext} help{stats.helpsNeededForNext > 1 ? 's' : ''} to unlock{' '}
                  {stats.nextBadge.badgeEmoji} {stats.nextBadge.tier}
                </span>
              )}
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Current: {stats.totalHelps} Helped</span>
                <span>{stats.nextBadge ? `Target: ${stats.nextBadge.minHelps}` : 'Max Rank Achieved!'}</span>
              </div>
            </div>

            {stats.nextBadge && (
              <div className="mt-4 p-3 bg-orange-50/70 border border-orange-100 rounded-xl text-xs flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-slate-700 font-medium">
                  <strong>Upcoming Perk:</strong> {stats.nextBadge.perks}
                </span>
              </div>
            )}
          </div>

          {/* Quick Breakdown of Actions that Earn Karma */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px]">
            <div className="bg-slate-50 p-2 rounded-xl text-slate-700 font-bold border border-slate-200">
              🟢 Post Found Item: <span className="text-emerald-600">+120 Karma</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl text-slate-700 font-bold border border-slate-200">
              🤝 Confirm Recovery: <span className="text-amber-600">+150 Karma</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl text-slate-700 font-bold border border-slate-200">
              ✅ Approve Claim: <span className="text-sky-600">+120 Karma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div>
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center space-x-1.5">
          <Medal className="w-4 h-4 text-orange-500" />
          <span>All Good Samaritan Badge Tiers</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SAMARITAN_BADGES.map((badge) => {
            const isUnlocked = stats.unlockedBadges.some((b) => b.tier === badge.tier);
            const isCurrent = stats.currentBadge.tier === badge.tier;

            return (
              <div
                key={badge.tier}
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-500 shadow-md ring-2 ring-amber-200'
                    : isUnlocked
                    ? 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Badge Status Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{badge.badgeEmoji}</span>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">{badge.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    {badge.minHelps === 0 ? 'Starter' : `${badge.minHelps}+ Helps Needed`}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                  {isUnlocked ? (
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <span>✓ Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus Samaritan Leaderboard Drawer / Preview */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">Campus Samaritan Leaderboard</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">Top Helpful Students This Month</span>
        </div>

        <div className="space-y-2">
          {sampleLeaderboard.map((user, idx) => (
            <div
              key={user.reg}
              className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border transition-colors ${
                user.isCurrent
                  ? 'bg-orange-50/80 border-orange-200 font-bold text-slate-900'
                  : 'bg-slate-50/50 border-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-950'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-900'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {idx + 1}
                </span>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900">{user.name}</span>
                    {user.isCurrent && (
                      <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {user.reg} • {user.branch}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="font-black text-slate-900 block">{user.helps} Items Helped</span>
                  <span className="text-[10px] text-amber-600 font-bold">{user.karma} Karma</span>
                </div>

                <div className="hidden sm:block">
                  <span
                    className={`inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${user.badge.pillBg} ${user.badge.pillText}`}
                  >
                    <span>{user.badge.badgeEmoji}</span>
                    <span>{user.badge.tier}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-orange-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="text-5xl my-2">{selectedBadge.badgeEmoji}</div>
              <h3 className="text-xl font-black text-slate-900">{selectedBadge.title}</h3>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-900 font-black text-xs rounded-full">
                {selectedBadge.minHelps === 0 ? 'Starter Level' : `Requires ${selectedBadge.minHelps}+ Helps`}
              </span>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <strong className="text-slate-900 block font-black uppercase text-[10px] text-slate-400 mb-0.5">
                  Description
                </strong>
                <p className="text-slate-700">{selectedBadge.description}</p>
              </div>

              <div>
                <strong className="text-slate-900 block font-black uppercase text-[10px] text-slate-400 mb-0.5">
                  Unlocked Privileges & Perks
                </strong>
                <p className="text-amber-700 font-bold">{selectedBadge.perks}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all"
            >
              Close Badge Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
