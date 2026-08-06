import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Tag, 
  MapPin, 
  Calendar, 
  X, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Item, CategoryType, LocationType, FilterOptions } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../data/initialData';
import { ItemCard } from './ItemCard';

interface ExploreViewProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
  onOpenQRCode?: (item: Item) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory?: CategoryType;
  setSelectedCategory: (cat?: CategoryType) => void;
  selectedLocation?: LocationType;
  setSelectedLocation: (loc?: LocationType) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  items,
  onViewDetails,
  onOpenQRCode,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
}) => {
  const [typeFilter, setTypeFilter] = useState<'All' | 'Lost' | 'Found'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Recovered' | 'Found'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter Items
  const filteredItems = items.filter((item) => {
    // Type Filter
    if (typeFilter !== 'All' && item.type !== typeFilter) return false;

    // Status Filter
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;

    // Category Filter
    if (selectedCategory && item.category !== selectedCategory) return false;

    // Location Filter
    if (selectedLocation && item.location !== selectedLocation) return false;

    // Date Range Filter
    if (dateFrom && item.date < dateFrom) return false;
    if (dateTo && item.date > dateTo) return false;

    // Search Query (matches title, description, location, roomDetails)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchRoom = (item.roomDetails || '').toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchRoom && !matchUser) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
    setSelectedCategory(undefined);
    setSelectedLocation(undefined);
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = 
    searchQuery || 
    typeFilter !== 'All' || 
    statusFilter !== 'All' || 
    selectedCategory || 
    selectedLocation || 
    dateFrom || 
    dateTo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Search & Explore Campus Listings</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Filter lost and found items by category, campus location, date, or status.
        </p>
      </div>

      {/* Filter Toolbar Box */}
      <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm mb-8 space-y-4">
        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔎 Search by item name, keywords, calculator model, library, room number..."
            className="w-full bg-orange-50/70 border border-orange-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Item Type Pill */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wide">Item Type</label>
            <div className="grid grid-cols-3 gap-1 bg-orange-50/80 p-1 rounded-xl border border-orange-200">
              <button
                onClick={() => setTypeFilter('All')}
                className={`py-1 rounded-lg text-[11px] font-black transition-all ${
                  typeFilter === 'All' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('Lost')}
                className={`py-1 rounded-lg text-[11px] font-black transition-all ${
                  typeFilter === 'Lost' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔴 Lost
              </button>
              <button
                onClick={() => setTypeFilter('Found')}
                className={`py-1 rounded-lg text-[11px] font-black transition-all ${
                  typeFilter === 'Found' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🟢 Found
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wide">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">🟡 Pending</option>
              <option value="Recovered">🟠 Recovered</option>
              <option value="Found">🟢 Found & Returned</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wide">Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? (e.target.value as CategoryType) : undefined)}
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wide">Campus Location</label>
            <select
              value={selectedLocation || ''}
              onChange={(e) => setSelectedLocation(e.target.value ? (e.target.value as LocationType) : undefined)}
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">All Campus Locations</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wide">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-orange-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-bold">Active:</span>
              {typeFilter !== 'All' && (
                <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-lg text-[11px] font-black">
                  Type: {typeFilter}
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-lg text-[11px] font-black">
                  Status: {statusFilter}
                </span>
              )}
              {selectedCategory && (
                <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-lg text-[11px] font-black">
                  Cat: {selectedCategory}
                </span>
              )}
              {selectedLocation && (
                <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-lg text-[11px] font-black">
                  Loc: {selectedLocation}
                </span>
              )}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-black flex items-center space-x-1 uppercase tracking-wide"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Showing <span className="text-slate-800 font-black">{filteredItems.length}</span> listings
        </h2>
      </div>

      {/* Item Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center text-slate-500 text-xs max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
          <h3 className="text-sm font-black text-slate-800 mb-1">No Matching Listings Found</h3>
          <p className="text-slate-500 mb-4 font-medium">Try clearing filters or searching with different keywords.</p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl text-xs shadow-md shadow-orange-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              allItems={items}
              onViewDetails={onViewDetails}
              onOpenQRCode={onOpenQRCode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
