import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  PlusCircle,
  User as UserIcon,
  Shield,
  Zap,
  Briefcase,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Users,
  Database,
  Trophy,
  Camera,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { User, PlatformStats, Item } from '../types';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';
import { getItems } from '../utils/storage';
import { NotificationsDropdown } from './NotificationsDropdown';

interface NavbarProps {
  currentUser: User;
  stats: PlatformStats;
  items?: Item[];
  activeTab: 'home' | 'explore' | 'smart-match' | 'map' | 'my-dashboard' | 'admin';
  setActiveTab: (tab: 'home' | 'explore' | 'smart-match' | 'map' | 'my-dashboard' | 'admin') => void;
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
  onOpenAuthModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenImageSearch: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectItem?: (item: Item) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  stats,
  items,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenSupabaseModal,
  onOpenImageSearch,
  onLogout,
  searchQuery,
  setSearchQuery,
  onSelectItem,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const currentItems = items || getItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-orange-200 text-slate-800 shadow-sm">
      {/* Top Banner Counter Strip */}
      <div className="bg-orange-50/90 px-4 py-1.5 border-b border-orange-100 text-xs font-semibold text-slate-600 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 min-w-max sm:min-w-0">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-900 font-bold whitespace-nowrap">
              Campus Lost & Found Live Portal
            </span>
            <span className="text-orange-300">|</span>
            <span className="text-slate-600 font-medium whitespace-nowrap">
              Official Student & Staff Network
            </span>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6 text-xs font-bold whitespace-nowrap">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span>
                👥 <strong className="text-slate-950 font-black">{stats.totalUsers}</strong> Users
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>
                🔴 <strong className="text-rose-600 font-black">{stats.totalLostItems}</strong> Lost
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                🟢 <strong className="text-emerald-700 font-black">{stats.totalFoundItems}</strong> Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-md text-white font-black group-hover:scale-105 transition-transform shrink-0">
            <span className="text-white font-black text-base sm:text-lg">L&F</span>
          </div>
          <div className="shrink-0 leading-tight">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                Campus <span className="text-orange-600">Lost & Found</span>
              </h1>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold tracking-wide block mt-0.5 whitespace-nowrap">
              Privacy-First Student Network
            </span>
          </div>
        </div>

        {/* Quick Search & AI Image Search Button */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'explore') setActiveTab('explore');
              }}
              placeholder="Search or describe: 'lost black wallet in library'..."
              className="w-full bg-orange-50/70 border border-orange-200 rounded-2xl pl-9 pr-10 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
            />
            {/* Visual Image Search Camera Trigger */}
            <button
              onClick={onOpenImageSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-white hover:bg-orange-100 text-orange-600 border border-orange-200 shadow-2xs transition-all"
              title="AI Vision Image Search (Find similar items from a photo)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 font-bold text-xs sm:text-sm text-slate-700">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'bg-orange-100 text-orange-950 font-black'
                : 'hover:text-orange-600 hover:bg-orange-50/50'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'explore'
                ? 'bg-orange-100 text-orange-950 font-black'
                : 'hover:text-orange-600 hover:bg-orange-50/50'
            }`}
          >
            Explore Listings
          </button>

          <button
            onClick={() => setActiveTab('smart-match')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'smart-match'
                ? 'bg-orange-500 text-white font-black shadow-xs'
                : 'hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-bounce" />
            <span>AI Smart Match</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'map'
                ? 'bg-orange-100 text-orange-950 font-black'
                : 'hover:text-orange-600 hover:bg-orange-50/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Campus Map</span>
          </button>

          <button
            onClick={() => setActiveTab('my-dashboard')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'my-dashboard'
                ? 'bg-orange-100 text-orange-950 font-black'
                : 'hover:text-orange-600 hover:bg-orange-50/50'
            }`}
          >
            My Activity
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* CTAs, Notifications, & Profile */}
        <div className="flex items-center space-x-2">
          {/* AI Vision Search Button for Mobile / Small Screens */}
          <button
            onClick={onOpenImageSearch}
            className="inline-flex md:hidden p-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs font-bold text-xs items-center space-x-1"
            title="AI Image Search"
          >
            <Camera className="w-4 h-4 text-orange-600" />
          </button>

          {/* Real-time Notifications Bell */}
          <NotificationsDropdown
            currentUserId={currentUser.id}
            onSelectNotification={() => {}}
          />

          {/* Supabase DB Badge Button */}
          <button
            onClick={onOpenSupabaseModal}
            className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black transition-all"
            title="Inspect Supabase Database Connection & Schema"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>⚡ Supabase</span>
          </button>

          {/* Post Lost Button */}
          <button
            onClick={() => onOpenReportModal('Lost')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>🔴 Report Lost</span>
          </button>

          {/* Post Found Button */}
          <button
            onClick={() => onOpenReportModal('Found')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>🟢 Report Found</span>
          </button>

          {/* User Profile Corner */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 rounded-2xl p-1.5 sm:px-3 shadow-xs transition-colors"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 border-2 border-white shadow-2xs flex items-center justify-center font-black text-xs text-white">
                  A
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="text-left leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-slate-900">Amrit Rout</span>

                  {/* Founders Badge */}
                  <span className="relative inline-flex items-center space-x-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                    <span>👑</span>
                    <span className="tracking-wider uppercase font-black">FOUNDERS</span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-800 font-bold mt-0.5 tracking-tight font-mono">
                  250301120030 • CSE 2nd Year
                </div>
              </div>
            </button>

            {/* User & Founders Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-orange-200 rounded-2xl shadow-xl py-2 z-50 text-slate-900 animate-slide-up">
                {/* Founders Header Section */}
                <div className="px-3.5 py-3 border-b-2 border-orange-100 space-y-2 bg-gradient-to-br from-orange-50/90 via-amber-50/60 to-orange-50/90 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center space-x-1">
                      <span>👑</span>
                      <span className="font-black text-orange-950">PLATFORM FOUNDERS</span>
                    </span>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black shadow-2xs border border-amber-200 uppercase">
                      FOUNDERS
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center justify-between font-black bg-white/90 p-2 rounded-xl border border-orange-200 shadow-2xs">
                      <span className="text-slate-950 font-black text-xs">Amrit Rout</span>
                      <span className="font-mono font-black text-orange-950 bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-300 text-[11px]">
                        250301120030
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-black bg-white/90 p-2 rounded-xl border border-orange-200 shadow-2xs">
                      <span className="text-slate-950 font-black text-xs">Atirajam Giridhar</span>
                      <span className="font-mono font-black text-orange-950 bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-300 text-[11px]">
                        250301120010
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-black bg-white/90 p-2 rounded-xl border border-orange-200 shadow-2xs">
                      <span className="text-slate-950 font-black text-xs">Arindam Mohanty</span>
                      <span className="font-mono font-black text-orange-950 bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-300 text-[11px]">
                        250301120059
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <GoodSamaritanBadgePill
                      user={{
                        ...currentUser,
                        name: 'Amrit Rout',
                        regNumber: '250301120030',
                        branch: 'CSE',
                        year: '2nd Year',
                      }}
                      items={currentItems}
                      size="sm"
                      showKarma
                    />
                  </div>
                </div>

                <div className="py-1 text-xs font-bold">
                  <button
                    onClick={() => {
                      setActiveTab('my-dashboard');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-slate-800"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                    <span>My Activity & Posts</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('smart-match');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-orange-700"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Smart Match Radar</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('map');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-slate-800"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Interactive Campus Map</span>
                  </button>

                  {currentUser.role === 'admin' ? (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-slate-950 font-black"
                    >
                      <Shield className="w-3.5 h-3.5 text-orange-600" />
                      <span>Admin Control Panel</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      onOpenAuthModal();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-emerald-700"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Switch Student Account</span>
                  </button>
                </div>

                <div className="border-t border-orange-100 pt-1 text-xs font-bold">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Subbar */}
      <div className="lg:hidden flex items-center justify-around bg-orange-100 border-t border-orange-200 py-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('home')}
          className={activeTab === 'home' ? 'text-orange-700 font-black' : 'text-slate-700'}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={activeTab === 'explore' ? 'text-orange-700 font-black' : 'text-slate-700'}
        >
          Explore
        </button>
        <button
          onClick={() => setActiveTab('smart-match')}
          className={
            activeTab === 'smart-match'
              ? 'text-amber-700 font-black flex items-center space-x-0.5'
              : 'text-slate-700 flex items-center space-x-0.5'
          }
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Matches</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={activeTab === 'map' ? 'text-rose-600 font-black flex items-center space-x-0.5' : 'text-slate-700 flex items-center space-x-0.5'}
        >
          <MapPin className="w-3 h-3 text-rose-500" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setActiveTab('my-dashboard')}
          className={activeTab === 'my-dashboard' ? 'text-orange-700 font-black' : 'text-slate-700'}
        >
          Activity
        </button>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'text-slate-950 font-black' : 'text-slate-700'}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
