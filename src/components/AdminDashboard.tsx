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
  Ban
} from 'lucide-react';
import { Item, User, Claim, Report, PlatformStats } from '../types';

interface AdminDashboardProps {
  stats: PlatformStats;
  items: Item[];
  users: User[];
  claims: Claim[];
  reports: Report[];
  onDeleteItem: (itemId: string) => void;
  onToggleFlagItem: (itemId: string, flagged: boolean) => void;
  onResolveReport: (reportId: string, status: Report['status']) => void;
  onUpdateClaimStatus: (claimId: string, status: Claim['status']) => void;
  onResetData: () => void;
  onViewItemDetails: (item: Item) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  items,
  users,
  claims,
  reports,
  onDeleteItem,
  onToggleFlagItem,
  onResolveReport,
  onUpdateClaimStatus,
  onResetData,
  onViewItemDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'reports' | 'claims' | 'analytics'>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.userRegNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingReports = reports.filter(r => r.status === 'Pending Review');

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

            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">🟡 Pending</option>
                <option value="Recovered">🟠 Recovered</option>
                <option value="Found">🟢 Found</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-orange-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-orange-50 text-slate-700 text-[11px] uppercase tracking-wider font-black border-b border-orange-100">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Type & Status</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Posted By</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 font-medium">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
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
                      <td className="p-3.5 text-right space-x-2">
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
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                <th className="p-3.5">Reg Number</th>
                <th className="p-3.5">Branch & Year</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-orange-50/50">
                  <td className="p-3.5 font-black text-slate-800">{u.name}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
