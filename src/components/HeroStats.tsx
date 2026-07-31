import React from 'react';
import { 
  Search, 
  PlusCircle, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { PlatformStats, CategoryType, LocationType } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../data/initialData';

interface HeroStatsProps {
  stats: PlatformStats;
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
  onExploreFilter: (category?: CategoryType, location?: LocationType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const HeroStats: React.FC<HeroStatsProps> = ({
  stats,
  onOpenReportModal,
  onExploreFilter,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="relative pt-6 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* VIBRANT PALETTE HERO BANNER (Emerald Box with decorative circles) */}
        <div className="bg-emerald-500 rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden text-white mb-8">
          {/* Decorative Background Accents */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-400/30 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-emerald-600/40 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-600/80 border border-emerald-400/40 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-100 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Student & Staff Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              Lost something on campus? <br className="hidden sm:inline" />
              <span className="text-amber-200">
                We'll help you recover it safely.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-medium max-w-2xl">
              A privacy-first portal connecting students and staff to return lost calculators, ID cards, wallets, and bags across all academic blocks, hostels, and library.
            </p>

            {/* Primary Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenReportModal('Lost')}
                className="px-6 py-3.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-950/20 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide"
              >
                <PlusCircle className="w-4 h-4" />
                <span>🔴 Report Lost Item</span>
              </button>

              <button
                onClick={() => onOpenReportModal('Found')}
                className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-lg flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>🟢 Report Found Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 PERMANENT PUBLIC COUNTERS BOX */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm mb-8">
          <div className="text-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              ━━━━━━━━━━━━━━━━ CAMPUS LIVE PLATFORM STATISTICS ━━━━━━━━━━━━━━━━
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-orange-100">
            {/* Stat 1: Total Users */}
            <div className="pt-2 md:pt-0">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 mb-2 font-black">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                👥 {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs font-black text-slate-700 uppercase tracking-wide mt-1">
                Verified Users
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Students, faculty & staff</p>
            </div>

            {/* Stat 2: Total Lost */}
            <div className="pt-4 md:pt-0">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mb-2 font-black">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-rose-600 tracking-tight">
                🔴 {stats.totalLostItems.toLocaleString()}
              </div>
              <div className="text-xs font-black text-slate-700 uppercase tracking-wide mt-1">
                Total Lost Reported
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Active cases seeking owners</p>
            </div>

            {/* Stat 3: Total Found */}
            <div className="pt-4 md:pt-0">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2 font-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-emerald-600 tracking-tight">
                🟢 {stats.totalFoundItems.toLocaleString()}
              </div>
              <div className="text-xs font-black text-slate-700 uppercase tracking-wide mt-1">
                Items Recovered & Returned
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Successfully closed cases</p>
            </div>
          </div>
        </div>

        {/* Quick Search & Category Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-2 border-orange-100 rounded-2xl p-2 flex items-center shadow-sm">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔎 Search lost calculator, blue ID card, black wallet, library room..."
              className="w-full bg-transparent border-0 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Categories Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            <span className="text-slate-500 font-medium">Quick Categories:</span>
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat.name}
                onClick={() => onExploreFilter(cat.name, undefined)}
                className="bg-white hover:bg-orange-50 border border-orange-100 text-slate-700 px-3 py-1.5 rounded-full transition-colors flex items-center space-x-1 shadow-sm"
              >
                <Tag className="w-3 h-3 text-orange-500" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Auto-Deletion Guarantee Note */}
        <div className="mt-8 max-w-3xl mx-auto bg-white border border-orange-100 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center space-x-3 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <strong className="text-slate-800 font-black">Privacy Auto-Cleanup Guarantee:</strong>{' '}
            Your registration number and phone number are kept private. Once an owner confirms receiving their item back, temporary contact details and private case data are automatically deleted from the database!
          </div>
        </div>

      </div>
    </div>
  );
};
