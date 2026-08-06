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
  Trophy
} from 'lucide-react';
import { User, PlatformStats, Item } from '../types';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';
import { getItems } from '../utils/storage';

interface NavbarProps {
  currentUser: User;
  stats: PlatformStats;
  items?: Item[];
  activeTab: 'home' | 'explore' | 'smart-match' | 'my-dashboard' | 'admin';
  setActiveTab: (tab: 'home' | 'explore' | 'smart-match' | 'my-dashboard' | 'admin') => void;
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
  onOpenAuthModal: () => void;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
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
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const currentItems = items || getItems();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-orange-100 text-slate-800 shadow-sm">
      {/* Top Banner Counter Strip */}
      <div className="bg-orange-50 px-4 py-1.5 border-b border-orange-100 text-xs font-semibold text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-bold">Campus Lost & Found Live Portal</span>
            <span className="text-orange-200">|</span>
            <span className="text-slate-500">Official Student & Staff Network</span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-bold">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              <span>👥 <strong className="text-slate-800">{stats.totalUsers}</strong> Users</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>🔴 <strong className="text-rose-600">{stats.totalLostItems}</strong> Lost</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>🟢 <strong className="text-emerald-600">{stats.totalFoundItems}</strong> Found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg text-white font-black group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg">L&F</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Campus <span className="text-orange-500">Lost & Found</span>
              </h1>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold tracking-wide block -mt-1">
              Privacy-First Student Network
            </span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'explore') setActiveTab('explore');
              }}
              placeholder="Search calculator, wallet, library..."
              className="w-full bg-orange-50/70 border border-orange-200 rounded-2xl pl-9 pr-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 font-bold text-sm text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'home'
                ? 'text-orange-500 underline underline-offset-4 font-black'
                : 'hover:text-orange-500'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'explore'
                ? 'text-orange-500 underline underline-offset-4 font-black'
                : 'hover:text-orange-500'
            }`}
          >
            Explore Listings
          </button>

          <button
            onClick={() => setActiveTab('smart-match')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'smart-match'
                ? 'bg-orange-100 text-orange-700 font-black'
                : 'hover:text-orange-500 hover:bg-orange-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            <span>Smart Match</span>
          </button>

          <button
            onClick={() => setActiveTab('my-dashboard')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'my-dashboard'
                ? 'text-orange-500 underline underline-offset-4 font-black'
                : 'hover:text-orange-500'
            }`}
          >
            My Activity
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* CTAs & Profile */}
        <div className="flex items-center space-x-2">
          {/* Supabase DB Badge Button */}
          <button
            onClick={onOpenSupabaseModal}
            className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black transition-all hover:scale-105 active:scale-95"
            title="Inspect Supabase Database Connection & SQL Schema"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>⚡ Supabase</span>
          </button>

          {/* Post Lost Button */}
          <button
            onClick={() => onOpenReportModal('Lost')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-black shadow-md shadow-orange-200 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>🔴 Report Lost</span>
          </button>

          {/* Post Found Button */}
          <button
            onClick={() => onOpenReportModal('Found')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-md shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>🟢 Report Found</span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 bg-white hover:bg-orange-50 border-2 border-orange-100 rounded-2xl p-1.5 sm:px-2.5 shadow-sm transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-black text-slate-800 leading-tight flex items-center space-x-1.5">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold leading-tight flex items-center space-x-1 mt-0.5">
                  <GoodSamaritanBadgePill user={currentUser} items={currentItems} size="sm" />
                </div>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-orange-100 rounded-2xl shadow-xl py-2 z-50 text-slate-800">
                <div className="px-3.5 py-2.5 border-b border-orange-100 space-y-1">
                  <p className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>{currentUser.name}</span>
                    {currentUser.role === 'admin' && (
                      <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded font-black">ADMIN</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">{currentUser.regNumber} • {currentUser.branch} ({currentUser.year})</p>
                  <div className="pt-1">
                    <GoodSamaritanBadgePill user={currentUser} items={currentItems} size="sm" showKarma />
                  </div>
                </div>

                <div className="py-1 text-xs font-bold">
                  <button
                    onClick={() => {
                      setActiveTab('my-dashboard');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-slate-700"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                    <span>My Activity & Posts</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('smart-match');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-orange-600"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Smart Match Radar</span>
                  </button>

                  {currentUser.role === 'admin' ? (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-slate-900 font-black"
                    >
                      <Shield className="w-3.5 h-3.5 text-orange-500" />
                      <span>Admin Control Panel</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      onOpenAuthModal();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center space-x-2 text-emerald-600"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
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
          className={activeTab === 'home' ? 'text-orange-600 font-black' : 'text-slate-600'}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('explore')}
          className={activeTab === 'explore' ? 'text-orange-600 font-black' : 'text-slate-600'}
        >
          Explore
        </button>
        <button 
          onClick={() => setActiveTab('smart-match')}
          className={activeTab === 'smart-match' ? 'text-amber-600 font-black flex items-center space-x-0.5' : 'text-slate-600 flex items-center space-x-0.5'}
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Smart Match</span>
        </button>
        <button 
          onClick={() => setActiveTab('my-dashboard')}
          className={activeTab === 'my-dashboard' ? 'text-orange-600 font-black' : 'text-slate-600'}
        >
          Activity
        </button>
        {currentUser.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'text-slate-900 font-black' : 'text-slate-700'}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
