import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Flag, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  UserCheck,
  FileText,
  ShieldCheck,
  Ban,
  QrCode,
  CheckSquare,
  Square,
  Layers,
  Tag,
  X,
  ListChecks
} from 'lucide-react';
import { Item, User, Claim, Report, PlatformStats } from '../types';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';

interface AdminDashboardProps {
  stats: PlatformStats;
  items: Item[];
  users: User[];
  claims: Claim[];
  reports: Report[];
  onDeleteItem: (itemId: string) => void;
  onDeleteMultipleItems?: (itemIds: string[]) => void;
  onToggleFlagItem: (itemId: string, flagged: boolean, reason?: string) => void;
  onToggleFlagMultipleItems?: (itemIds: string[], flagged: boolean) => void;
  onUpdateMultipleItemStatuses?: (itemIds: string[], status: Item['status']) => void;
  onResolveReport: (reportId: string, status: Report['status']) => void;
  onUpdateClaimStatus: (claimId: string, status: Claim['status']) => void;
  onResetData: () => void;
  onViewItemDetails: (item: Item) => void;
  onOpenQRCode?: (item: Item) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateItemDetails?: (itemId: string, updates: Partial<Item>) => void;
  onPurgeItemPrivacyData?: (itemId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  items,
  users,
  claims,
  reports,
  onDeleteItem,
  onDeleteMultipleItems,
  onToggleFlagItem,
  onToggleFlagMultipleItems,
  onUpdateMultipleItemStatuses,
  onResolveReport,
  onUpdateClaimStatus,
  onResetData,
  onViewItemDetails,
  onOpenQRCode,
  onDeleteUser,
  onUpdateItemDetails,
  onPurgeItemPrivacyData,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'reports' | 'claims' | 'analytics'>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Bulk Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userRegNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'Pending') return item.status === 'Pending';
    if (statusFilter === 'Recovered') return item.status === 'Recovered';
    if (statusFilter === 'Found') return item.status === 'Found';
    if (statusFilter === 'Pending_LongTime') {
      if (item.status !== 'Pending') return false;
      const createdDate = new Date(item.createdAt || item.date);
      const diffDays = (Date.now() - createdDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 7;
    }

    return true;
  });

  const pendingReports = reports.filter(r => r.status === 'Pending Review');

  // Selection handlers
  const isAllFilteredSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.includes(i.id));

  const handleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      // Unselect filtered items
      const filteredIds = new Set(filteredItems.map(i => i.id));
      setSelectedItemIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      // Select all filtered items
      const newSelected = new Set([...selectedItemIds, ...filteredItems.map(i => i.id)]);
      setSelectedItemIds(Array.from(newSelected));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk operations
  const handleBulkDelete = () => {
    if (selectedItemIds.length === 0) return;
    const confirmMsg = `Are you sure you want to permanently delete ${selectedItemIds.length} selected listing(s)?`;
    if (confirm(confirmMsg)) {
      if (onDeleteMultipleItems) {
        onDeleteMultipleItems(selectedItemIds);
      } else {
        selectedItemIds.forEach(id => onDeleteItem(id));
      }
      setSelectedItemIds([]);
    }
  };

  const handleBulkFlag = (flagged: boolean) => {
    if (selectedItemIds.length === 0) return;
    if (onToggleFlagMultipleItems) {
      onToggleFlagMultipleItems(selectedItemIds, flagged);
    } else {
      selectedItemIds.forEach(id => onToggleFlagItem(id, flagged, 'Admin bulk action'));
    }
    setSelectedItemIds([]);
  };

  const handleBulkStatusChange = (targetStatus: Item['status']) => {
    if (selectedItemIds.length === 0) return;
    if (onUpdateMultipleItemStatuses) {
      onUpdateMultipleItemStatuses(selectedItemIds, targetStatus);
    }
    setSelectedItemIds([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-md mb-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">Campus Admin Control Panel</h1>
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">ADMIN AUTHORIZED</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Manage campus listings, user reports, verification claims, and platform integrity.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset demo items and stats to default seed data?')) {
                onResetData();
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Real-time Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800 text-center">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-xl font-black text-white">👥 {stats.totalUsers}</div>
            <div className="text-[11px] text-slate-400 font-bold">Registered Users</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-xl font-black text-rose-400">🔴 {stats.totalLostItems}</div>
            <div className="text-[11px] text-slate-400 font-bold">Lost Listings</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-xl font-black text-emerald-400">🟢 {stats.totalFoundItems}</div>
            <div className="text-[11px] text-slate-400 font-bold">Items Found</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-xl font-black text-orange-400">{stats.activeCasesCount}</div>
            <div className="text-[11px] text-slate-400 font-bold">Active Cases</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 col-span-2 sm:col-span-1">
            <div className="text-xl font-black text-amber-400">{pendingReports.length}</div>
            <div className="text-[11px] text-amber-300 font-bold">Flagged Reports</div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-orange-100 mb-6 overflow-x-auto text-xs font-black space-x-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-3 rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'listings'
              ? 'border-orange-500 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4 text-orange-500" />
          <span>Manage Listings ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'reports'
              ? 'border-orange-500 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Flag className="w-4 h-4 text-rose-500" />
          <span>Flagged Reports ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-3 rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'claims'
              ? 'border-orange-500 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Claims Queue ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'users'
              ? 'border-orange-500 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Profiles ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* BULK SELECTION ACTIONS BAR */}
          {selectedItemIds.length > 0 && (
            <div className="bg-slate-900 border-2 border-orange-500 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 animate-slide-up sticky top-4 z-20">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 text-slate-950 font-black px-2.5 py-1 rounded-xl text-xs flex items-center space-x-1.5 shadow">
                  <CheckSquare className="w-4 h-4" />
                  <span>{selectedItemIds.length} Selected</span>
                </div>
                <div className="text-xs text-slate-300 font-medium hidden sm:block">
                  Out of {filteredItems.length} matching listings
                </div>
                <button
                  onClick={handleSelectAllFiltered}
                  className="text-xs text-orange-400 hover:text-orange-300 font-bold underline transition-colors"
                >
                  {isAllFilteredSelected ? 'Deselect All' : `Select All (${filteredItems.length})`}
                </button>
              </div>

              {/* Bulk Operations Control Group */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Bulk Status Selector */}
                <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wide">Status:</span>
                  <button
                    onClick={() => handleBulkStatusChange('Pending')}
                    className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition-colors"
                    title="Mark all selected as Pending"
                  >
                    🟡 Pending
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Recovered')}
                    className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-orange-400 font-bold text-[11px] transition-colors"
                    title="Mark all selected as Recovered"
                  >
                    🟠 Recovered
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Found')}
                    className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-emerald-400 font-bold text-[11px] transition-colors"
                    title="Mark all selected as Found & Auto-Purge Privacy Data"
                  >
                    🟢 Found
                  </button>
                </div>

                {/* Bulk Flag / Unflag */}
                <button
                  onClick={() => handleBulkFlag(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flag</span>
                </button>

                <button
                  onClick={() => handleBulkFlag(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unflag</span>
                </button>

                {/* Mass Delete Button */}
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center space-x-1.5 shadow-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedItemIds.length})</span>
                </button>

                {/* Clear Selection */}
                <button
                  onClick={() => setSelectedItemIds([])}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Clear Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-orange-100 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listing name, student name, or reg number..."
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs font-bold">
              <button
                onClick={handleSelectAllFiltered}
                className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 flex items-center space-x-1.5 text-xs font-black transition-colors"
              >
                <ListChecks className="w-3.5 h-3.5 text-orange-600" />
                <span>{isAllFilteredSelected ? 'Deselect All' : 'Select All Filtered'}</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-black">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">🟡 Pending</option>
                  <option value="Pending_LongTime">⏳ Long-Time Pending (&gt;7 Days)</option>
                  <option value="Recovered">🟠 Recovered</option>
                  <option value="Found">🟢 Found (Cleaned)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-orange-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-orange-50 text-slate-700 text-[11px] uppercase tracking-wider font-black border-b border-orange-100">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={handleSelectAllFiltered}
                        className="w-4 h-4 text-orange-500 rounded accent-orange-500 cursor-pointer"
                        title="Select/Deselect All Filtered"
                      />
                    </th>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Type & Status</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Posted By</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 font-medium">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isSelected ? 'bg-amber-50/90 font-semibold' : 'hover:bg-orange-50/50'
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectItem(item.id)}
                            className="w-4 h-4 text-orange-500 rounded accent-orange-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          <button
                            onClick={() => onViewItemDetails(item)}
                            className="hover:text-orange-600 text-left"
                          >
                            {item.title}
                          </button>
                          {item.isFlagged && (
                            <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-black">
                              ⚠️ FLAGGED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black mr-1.5 ${
                            item.type === 'Lost' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-slate-600 font-bold">{item.status}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">{item.location}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{item.userName}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{item.userRegNumber} • {item.userBranch}</div>
                        </td>
                        <td className="p-3.5 text-slate-500">{item.date}</td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-black"
                            title="Edit Notice Details"
                          >
                            ✏️ Edit
                          </button>
                          {onPurgeItemPrivacyData && (
                            <button
                              onClick={() => {
                                if (confirm(`Purge user details and photograph for "${item.title}"?`)) {
                                  onPurgeItemPrivacyData(item.id);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black"
                              title="Purge Sensitive User Data"
                            >
                              🔒 Purge
                            </button>
                          )}
                          {onOpenQRCode && (
                            <button
                              onClick={() => onOpenQRCode(item)}
                              className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-[11px] font-black shadow-sm inline-flex items-center space-x-1"
                              title="Generate Campus QR Poster"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>QR</span>
                            </button>
                          )}
                          <button
                            onClick={() => onToggleFlagItem(item.id, !item.isFlagged, 'Admin manual flag')}
                            className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 text-[11px] font-black"
                          >
                            {item.isFlagged ? 'Unflag' : 'Flag'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete listing "${item.title}"?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-700 text-[11px] font-black transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLAGGED REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider mb-2">Suspicious Listing Reports</h3>
          {reports.length === 0 ? (
            <div className="bg-white border border-orange-100 p-8 rounded-3xl text-center text-slate-400 text-xs font-medium shadow-sm">
              No reports filed yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-white border border-orange-100 rounded-2xl p-4 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-lg font-black">
                        ⚠️ {rep.reason}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium">Reported by {rep.reportedByUserName}</span>
                    </div>
                    <div className="font-black text-slate-800 text-sm">Item: {rep.itemTitle}</div>
                    <p className="text-slate-600 font-medium mt-1">"{rep.details}"</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onResolveReport(rep.id, 'Resolved')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-sm"
                    >
                      Resolve Report
                    </button>
                    <button
                      onClick={() => onDeleteItem(rep.itemId)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-sm"
                    >
                      Take Down Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLAIMS QUEUE */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider mb-2">Submitted Item Verification Claims</h3>
          {claims.length === 0 ? (
            <div className="bg-white border border-orange-100 p-8 rounded-3xl text-center text-slate-400 text-xs font-medium shadow-sm">
              No claims submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim.id} className="bg-white border border-orange-100 rounded-2xl p-4 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="font-black text-slate-800 text-sm">Claim for: {claim.itemTitle}</div>
                    <div className="text-slate-600 font-medium mt-1">Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantBranch} • {claim.claimantYear})</div>
                    <div className="text-orange-600 font-bold mt-1">Secret Proof: "{claim.secretDetail}"</div>
                    <div className="text-slate-500 text-[11px] font-medium mt-0.5">Phone: {claim.claimantPhone}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateClaimStatus(claim.id, 'Approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-sm"
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={() => onUpdateClaimStatus(claim.id, 'Rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-sm"
                    >
                      Reject Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USER PROFILES */}
      {activeTab === 'users' && (
        <div className="bg-white border border-orange-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-orange-50 text-slate-700 text-[11px] uppercase font-black border-b border-orange-100">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Samaritan Rank & Karma</th>
                <th className="p-3.5">Reg Number</th>
                <th className="p-3.5">Branch & Year</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-orange-50/50">
                  <td className="p-3.5 font-black text-slate-800">{u.name}</td>
                  <td className="p-3.5">
                    <GoodSamaritanBadgePill user={u} items={items} size="sm" showKarma />
                  </td>
                  <td className="p-3.5 text-slate-600 font-mono font-bold">{u.regNumber}</td>
                  <td className="p-3.5 text-slate-600">{u.branch} • {u.year}</td>
                  <td className="p-3.5 text-orange-600 font-bold">{u.phone}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      u.role === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {onDeleteUser && u.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete user profile and data for "${u.name}" (${u.regNumber})?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-700 text-[11px] font-black transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        <span>Delete User</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT LISTING MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-orange-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span>✏️ Edit Notice Details</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Item Title / Name</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    className="w-full bg-orange-50/50 border border-orange-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as Item['status'] })}
                    className="w-full bg-orange-50/50 border border-orange-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Pending">🟡 Pending</option>
                    <option value="Recovered">🟠 Recovered</option>
                    <option value="Found">🟢 Found</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-orange-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onUpdateItemDetails && editingItem) {
                    onUpdateItemDetails(editingItem.id, editingItem);
                    setEditingItem(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
