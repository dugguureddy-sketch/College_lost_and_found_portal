import React, { useState } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Phone, 
  Lock, 
  Sparkles,
  ArrowUpRight,
  QrCode
} from 'lucide-react';
import { Item, User, Claim } from '../types';
import { GoodSamaritanAchievementsCard } from './GoodSamaritanAchievementsCard';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';

interface UserDashboardProps {
  currentUser: User;
  items: Item[];
  claims: Claim[];
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
  onViewItemDetails: (item: Item) => void;
  onOpenConfirmReceivedModal: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenQRCode?: (item: Item) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  items,
  claims,
  onOpenReportModal,
  onViewItemDetails,
  onOpenConfirmReceivedModal,
  onDeleteItem,
  onOpenQRCode,
}) => {
  const [activeTab, setActiveTab] = useState<'my-posts' | 'my-claims'>('my-posts');

  const myPosts = items.filter(
    (item) => item.userId === currentUser.id || item.userRegNumber.toLowerCase() === currentUser.regNumber.toLowerCase()
  );

  const myLostPosts = myPosts.filter((i) => i.type === 'Lost');
  const myFoundPosts = myPosts.filter((i) => i.type === 'Found');
  const myRecoveredPosts = myPosts.filter((i) => i.status === 'Recovered' || i.status === 'Found');
  const myClaims = claims.filter((c) => c.claimantId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      {/* Welcome Banner */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
            <span>Hello, {currentUser.name}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {currentUser.regNumber} • {currentUser.branch} ({currentUser.year})
          </p>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenReportModal('Lost')}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-md shadow-rose-200 flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Lost</span>
          </button>
          <button
            onClick={() => onOpenReportModal('Found')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Found</span>
          </button>
        </div>
      </div>

      {/* Personal Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-orange-100 text-center shadow-sm">
          <div className="text-2xl font-black text-rose-500">{myLostPosts.length}</div>
          <div className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Lost Posts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-100 text-center shadow-sm">
          <div className="text-2xl font-black text-emerald-600">{myFoundPosts.length}</div>
          <div className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Found Posts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-100 text-center shadow-sm">
          <div className="text-2xl font-black text-orange-500">{myClaims.length}</div>
          <div className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Submitted Claims</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-100 text-center shadow-sm">
          <div className="text-2xl font-black text-amber-500">{myRecoveredPosts.length}</div>
          <div className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Resolved Items</div>
        </div>
      </div>

      {/* Visual Good Samaritan Achievement System Card */}
      <GoodSamaritanAchievementsCard
        currentUser={currentUser}
        items={items}
        claims={claims}
        onStatsUpdate={() => {
          // Force update local view state
          setActiveTab(activeTab);
        }}
      />

      {/* Tabs */}
      <div className="flex border-b border-orange-100 mb-6 font-bold text-xs space-x-6">
        <button
          onClick={() => setActiveTab('my-posts')}
          className={`pb-3 transition-colors border-b-2 uppercase tracking-wide ${
            activeTab === 'my-posts'
              ? 'border-orange-500 text-orange-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          My Posted Items ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('my-claims')}
          className={`pb-3 transition-colors border-b-2 uppercase tracking-wide ${
            activeTab === 'my-claims'
              ? 'border-orange-500 text-orange-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          My Verification Claims ({myClaims.length})
        </button>
      </div>

      {/* TAB 1: MY POSTS */}
      {activeTab === 'my-posts' && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <div className="bg-white border border-orange-100 rounded-3xl p-10 text-center text-slate-400 text-xs shadow-sm font-medium">
              You haven't reported any lost or found items yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPosts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                        item.type === 'Lost' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {item.type}
                      </span>

                      {item.status === 'Pending' && (
                        <span className="text-amber-800 text-[11px] font-black bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          🟡 Active Pending
                        </span>
                      )}
                      {item.status === 'Recovered' && (
                        <span className="text-orange-800 text-[11px] font-black bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-full">
                          🟠 Someone Found This!
                        </span>
                      )}
                      {item.status === 'Found' && (
                        <span className="text-emerald-800 text-[11px] font-black bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          🟢 Completed & Returned
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-2">📍 {item.location} ({item.roomDetails})</p>

                    {item.status === 'Recovered' && item.finderPhone && (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-xs mb-3 text-slate-800">
                        <div className="font-black flex items-center space-x-1 text-orange-600">
                          <Phone className="w-3.5 h-3.5 text-orange-500" />
                          <span>Finder Contact: {item.finderPhone}</span>
                        </div>
                        {item.finderNote && <p className="text-[11px] text-slate-600 mt-0.5 font-medium">"{item.finderNote}"</p>}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onViewItemDetails(item)}
                        className="text-xs text-orange-500 hover:text-orange-600 font-black flex items-center space-x-1 uppercase tracking-wide"
                      >
                        <span>View Listing</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {onOpenQRCode && (
                        <button
                          onClick={() => onOpenQRCode(item)}
                          className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-200 text-[11px] font-black rounded-lg flex items-center space-x-1"
                        >
                          <QrCode className="w-3.5 h-3.5 text-orange-600" />
                          <span>QR Poster</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.status === 'Recovered' && (
                        <button
                          onClick={() => onOpenConfirmReceivedModal(item)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl shadow-sm"
                        >
                          Confirm Received
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Delete post "${item.title}"?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl bg-slate-50 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY CLAIMS */}
      {activeTab === 'my-claims' && (
        <div className="space-y-4">
          {myClaims.length === 0 ? (
            <div className="bg-white border border-orange-100 rounded-3xl p-10 text-center text-slate-400 text-xs shadow-sm font-medium">
              You haven't submitted any item claims yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => (
                <div key={claim.id} className="bg-white border border-orange-100 rounded-2xl p-4 text-xs shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-800 text-sm">Claim for: {claim.itemTitle}</span>
                    <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-lg font-black text-[10px] uppercase">
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">Reason: "{claim.reason}"</p>
                  <p className="text-orange-600 font-bold mt-1">Secret Proof: "{claim.secretDetail}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
