import React, { useState, useEffect } from 'react';
import {
  Item,
  User,
  PlatformStats,
  Claim,
  Report,
  CategoryType,
  LocationType,
  ItemType,
} from './types';
import {
  initializeStorage,
  getItems,
  getUsers,
  getStats,
  getClaims,
  getReports,
  getCurrentUser,
  setCurrentUser,
  registerUser,
  addItem,
  markItemRecovered,
  markItemReceivedAndCleanup,
  deleteItem,
  deleteMultipleItems,
  toggleFlagItem,
  toggleFlagMultipleItems,
  updateMultipleItemStatuses,
  addClaim,
  updateClaimStatus,
  addReport,
  resolveReport,
  resetDataToSeed,
  deleteUser,
  updateItemDetails,
  purgeItemPrivacyData,
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { HeroStats } from './components/HeroStats';
import { ItemCard } from './components/ItemCard';
import { ExploreView } from './components/ExploreView';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { FoundItemModal } from './components/FoundItemModal';
import { ConfirmReceivedModal } from './components/ConfirmReceivedModal';
import { ClaimModal } from './components/ClaimModal';
import { ReportSuspiciousModal } from './components/ReportSuspiciousModal';
import { ReportModal } from './components/ReportModal';
import { SmartMatchPanel } from './components/SmartMatchPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { AuthModal } from './components/AuthModal';
import { SupabaseModal } from './components/SupabaseModal';
import { QRCodeModal } from './components/QRCodeModal';
import { MovableNotification } from './components/MovableNotification';
import { CampusMapView } from './components/CampusMapView';
import { AIImageSearchModal } from './components/AIImageSearchModal';
import { SecureChatModal } from './components/SecureChatModal';

import { CATEGORIES } from './data/initialData';
import { Sparkles, ArrowRight, ShieldCheck, Zap, HeartHandshake, QrCode, MapPin } from 'lucide-react';

export default function App() {
  // Initialize storage once & check URL for scanned QR deep links
  useEffect(() => {
    initializeStorage();

    // Check if URL search params contains ?itemId=... or ?item=...
    const params = new URLSearchParams(window.location.search);
    const itemIdFromUrl = params.get('itemId') || params.get('item');
    if (itemIdFromUrl) {
      const allCurrentItems = getItems();
      const targetItem = allCurrentItems.find((i) => i.id === itemIdFromUrl);
      if (targetItem) {
        setActiveItemForDetails(targetItem);
        showToast(`📱 Scanned QR Code! Opened item details for "${targetItem.title}"`);
      }
    }
  }, []);

  // Application States
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [stats, setStatsState] = useState<PlatformStats>(getStats());
  const [items, setItemsState] = useState<Item[]>(getItems());
  const [users, setUsersState] = useState<User[]>(getUsers());
  const [claims, setClaimsState] = useState<Claim[]>(getClaims());
  const [reports, setReportsState] = useState<Report[]>(getReports());

  // Page View Tab State
  const [activeTab, setActiveTab] = useState<
    'home' | 'explore' | 'smart-match' | 'map' | 'my-dashboard' | 'admin'
  >('home');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<LocationType | undefined>();

  // Modals state
  const [activeItemForDetails, setActiveItemForDetails] = useState<Item | null>(null);
  const [activeItemForQRCode, setActiveItemForQRCode] = useState<Item | null>(null);
  const [activeItemForChat, setActiveItemForChat] = useState<Item | null>(null);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [reportModalType, setReportModalType] = useState<ItemType | null>(null);
  const [itemForFoundModal, setItemForFoundModal] = useState<Item | null>(null);
  const [itemForConfirmReceivedModal, setItemForConfirmReceivedModal] = useState<Item | null>(null);
  const [itemForClaimModal, setItemForClaimModal] = useState<Item | null>(null);
  const [itemForReportSuspiciousModal, setItemForReportSuspiciousModal] = useState<Item | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Helper to sync states from localStorage
  const refreshAllStates = () => {
    setItemsState(getItems());
    setUsersState(getUsers());
    setStatsState(getStats());
    setClaimsState(getClaims());
    setReportsState(getReports());
    setCurrentUserState(getCurrentUser());
  };

  // Handlers
  const handleOpenReportModal = (type: ItemType) => {
    setReportModalType(type);
  };

  const handleReportSubmit = (itemData: any) => {
    const newItem = addItem(itemData);
    refreshAllStates();
    setReportModalType(null);
    showToast(`🎉 ${newItem.type} item "${newItem.title}" posted successfully!`);
  };

  const handleMarkRecoveredSubmit = (itemId: string, finderPhone: string, finderNote?: string) => {
    const updated = markItemRecovered(itemId, finderPhone, finderNote);
    refreshAllStates();
    setItemForFoundModal(null);
    if (activeItemForDetails && activeItemForDetails.id === itemId) {
      setActiveItemForDetails(updated);
    }
    showToast('📞 Contact details sent to owner! Status updated to RECOVERED 🟠.');
  };

  const handleConfirmReceivedSubmit = (itemId: string) => {
    const updated = markItemReceivedAndCleanup(itemId);
    refreshAllStates();
    setItemForConfirmReceivedModal(null);
    if (activeItemForDetails && activeItemForDetails.id === itemId) {
      setActiveItemForDetails(updated);
    }
    showToast('🎉 Case Completed! Total Items Found statistic updated & private data auto-cleared.');
  };

  const handleSubmitClaim = (claimData: any) => {
    addClaim({
      ...claimData,
      claimantId: currentUser.id,
      claimantName: currentUser.name,
      claimantPhone: claimData.phone,
      claimantBranch: currentUser.branch,
      claimantYear: currentUser.year,
    });
    refreshAllStates();
    setItemForClaimModal(null);
    showToast('🤝 Verification Claim submitted to poster and admin!');
  };

  const handleSubmitReportSuspicious = (reportData: any) => {
    addReport({
      ...reportData,
      reportedByUserId: currentUser.id,
      reportedByUserName: currentUser.name,
    });
    refreshAllStates();
    setItemForReportSuspiciousModal(null);
    showToast('🚨 Suspicious listing report submitted to Campus Admin.');
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    refreshAllStates();
    if (activeItemForDetails?.id === itemId) {
      setActiveItemForDetails(null);
    }
    showToast('Post deleted successfully.');
  };

  const handleDeleteMultipleItems = (itemIds: string[]) => {
    deleteMultipleItems(itemIds);
    refreshAllStates();
    showToast(`🗑️ Successfully deleted ${itemIds.length} listings in bulk.`);
  };

  const handleToggleFlagItem = (itemId: string, flagged: boolean, reason?: string) => {
    toggleFlagItem(itemId, flagged, reason);
    refreshAllStates();
  };

  const handleToggleFlagMultipleItems = (itemIds: string[], flagged: boolean) => {
    toggleFlagMultipleItems(itemIds, flagged);
    refreshAllStates();
    showToast(`⚠️ ${flagged ? 'Flagged' : 'Unflagged'} ${itemIds.length} listings in bulk.`);
  };

  const handleUpdateMultipleItemStatuses = (itemIds: string[], status: Item['status']) => {
    updateMultipleItemStatuses(itemIds, status);
    refreshAllStates();
    showToast(`🏷️ Status updated to "${status}" for ${itemIds.length} listings in bulk.`);
  };

  const handleResolveReport = (reportId: string, status: Report['status']) => {
    resolveReport(reportId, status);
    refreshAllStates();
    showToast('Report status updated.');
  };

  const handleUpdateClaimStatus = (claimId: string, status: Claim['status']) => {
    updateClaimStatus(claimId, status);
    refreshAllStates();
    showToast(`Claim marked as ${status}.`);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
    setShowAuthModal(false);
    showToast(`Switched account to ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleRegisterUser = (newUser: User) => {
    const regged = registerUser(newUser);
    refreshAllStates();
    setShowAuthModal(false);
    showToast(`Welcome ${regged.name}! Total registered users updated.`);
  };

  const handleResetData = () => {
    resetDataToSeed();
    refreshAllStates();
    showToast('Demo data reset to initial seed state.');
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    refreshAllStates();
    showToast('🗑️ User profile and user data deleted permanently.');
  };

  const handleUpdateItemDetails = (itemId: string, updates: Partial<Item>) => {
    updateItemDetails(itemId, updates);
    refreshAllStates();
    showToast('✏️ Listing details updated successfully.');
  };

  const handlePurgeItemPrivacyData = (itemId: string) => {
    purgeItemPrivacyData(itemId);
    refreshAllStates();
    showToast('🔒 Sensitive user details purged from listing.');
  };

  // Recent Lost & Found lists for Home Page
  const recentLost = items.filter((i) => i.type === 'Lost').slice(0, 6);
  const recentFound = items.filter((i) => i.type === 'Found').slice(0, 6);

  return (
    <div className="min-h-screen bg-[#fff7ed] text-slate-800 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-emerald-500 text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 animate-slide-up">
          <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0" />
          <span className="text-xs font-bold text-slate-900">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        stats={stats}
        items={items}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleOpenReportModal}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenImageSearch={() => setShowImageSearchModal(true)}
        onLogout={() => setShowAuthModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectItem={(item) => setActiveItemForDetails(item)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div>
            <HeroStats
              stats={stats}
              onOpenReportModal={handleOpenReportModal}
              onExploreFilter={(cat, loc) => {
                setSelectedCategory(cat);
                setSelectedLocation(loc);
                setActiveTab('explore');
              }}
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setSearchQuery(q);
                if (q) setActiveTab('explore');
              }}
            />

            {/* Recent Lost & Found Items Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
              {/* Category Browser Row */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Browse By Category</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Find items lost or found across campus categories
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setActiveTab('explore');
                      }}
                      className="bg-white hover:bg-orange-50/80 border border-orange-100 hover:border-orange-300 p-4 rounded-2xl text-center cursor-pointer transition-all shadow-sm group"
                    >
                      <div className="font-black text-slate-800 text-xs group-hover:text-orange-600">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-1">
                        {cat.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Lost Items */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <h2 className="text-xl font-black text-slate-900">Recent Lost Items</h2>
                  </div>

                  <button
                    onClick={() => setActiveTab('explore')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                  >
                    <span>View All Lost Items ({items.filter((i) => i.type === 'Lost').length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentLost.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      allItems={items}
                      onViewDetails={(i) => setActiveItemForDetails(i)}
                      onOpenQRCode={(i) => setActiveItemForQRCode(i)}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Found Items */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h2 className="text-xl font-black text-slate-900">Recent Found Items</h2>
                  </div>

                  <button
                    onClick={() => setActiveTab('explore')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <span>View All Found Items ({items.filter((i) => i.type === 'Found').length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentFound.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      allItems={items}
                      onViewDetails={(i) => setActiveItemForDetails(i)}
                      onOpenQRCode={(i) => setActiveItemForQRCode(i)}
                    />
                  ))}
                </div>
              </div>

              {/* How It Works Privacy Workflow */}
              <div className="bg-white border border-orange-100 rounded-3xl p-8 my-12 text-center shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2">How Campus Lost & Found Works</h3>
                <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto mb-8">
                  3 simple steps to recover items while protecting student privacy and phone numbers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-black flex items-center justify-center text-sm mb-3">
                      1
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Report Lost or Found</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Post item details with photo, date, and specific spot. Sensitive personal phone numbers are hidden from public view.
                    </p>
                  </div>

                  <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm mb-3">
                      2
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Smart Match or Finder Contact</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Finder clicks "Yes, I've Found This Item" to exchange contact details securely and set status to{' '}
                      <strong className="text-orange-600 font-bold">🟠 RECOVERED</strong>.
                    </p>
                  </div>

                  <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm mb-3">
                      3
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Confirm Received & Auto Cleanup</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Owner confirms receipt ("YES, I GOT IT BACK") &rarr; Status becomes{' '}
                      <strong className="text-emerald-700 font-bold">🟢 FOUND</strong>, statistics increment (+1), and private case data auto-clears.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: EXPLORE & SEARCH */}
        {activeTab === 'explore' && (
          <ExploreView
            items={items}
            onViewDetails={(i) => setActiveItemForDetails(i)}
            onOpenQRCode={(i) => setActiveItemForQRCode(i)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        )}

        {/* VIEW 3: SMART MATCH RADAR */}
        {activeTab === 'smart-match' && (
          <SmartMatchPanel
            items={items}
            onSelectPair={(lostItem, foundItem) => setActiveItemForDetails(lostItem)}
            onOpenReportModal={handleOpenReportModal}
            onOpenChat={(item) => setActiveItemForChat(item)}
          />
        )}

        {/* VIEW 4: CAMPUS INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <CampusMapView
            items={items}
            onSelectItem={(i) => setActiveItemForDetails(i)}
            onOpenReportModal={handleOpenReportModal}
          />
        )}

        {/* VIEW 5: MY ACTIVITY DASHBOARD */}
        {activeTab === 'my-dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            items={items}
            claims={claims}
            onOpenReportModal={handleOpenReportModal}
            onViewItemDetails={(i) => setActiveItemForDetails(i)}
            onOpenConfirmReceivedModal={(i) => setItemForConfirmReceivedModal(i)}
            onDeleteItem={handleDeleteItem}
            onOpenQRCode={(i) => setActiveItemForQRCode(i)}
          />
        )}

        {/* VIEW 6: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard
            stats={stats}
            items={items}
            users={users}
            claims={claims}
            reports={reports}
            onDeleteItem={handleDeleteItem}
            onDeleteMultipleItems={handleDeleteMultipleItems}
            onToggleFlagItem={handleToggleFlagItem}
            onToggleFlagMultipleItems={handleToggleFlagMultipleItems}
            onUpdateMultipleItemStatuses={handleUpdateMultipleItemStatuses}
            onResolveReport={handleResolveReport}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            onResetData={handleResetData}
            onViewItemDetails={(i) => setActiveItemForDetails(i)}
            onOpenQRCode={(i) => setActiveItemForQRCode(i)}
            onDeleteUser={handleDeleteUser}
            onUpdateItemDetails={handleUpdateItemDetails}
            onPurgeItemPrivacyData={handlePurgeItemPrivacyData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-slate-100">Campus Lost & Found System</span>
            <span>• Privacy-Preserving Student Network</span>
          </div>

          <div className="flex items-center space-x-4 font-semibold">
            <span>👥 {stats.totalUsers} Registered</span>
            <span>🔴 {stats.totalLostItems} Lost</span>
            <span className="text-emerald-400 font-bold">🟢 {stats.totalFoundItems} Recovered</span>
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}

      {/* 1. Item Details Modal */}
      {activeItemForDetails && (
        <ItemDetailsModal
          item={activeItemForDetails}
          allItems={items}
          currentUser={currentUser}
          onClose={() => setActiveItemForDetails(null)}
          onOpenFoundModal={(i) => {
            setActiveItemForDetails(null);
            setItemForFoundModal(i);
          }}
          onOpenConfirmReceivedModal={(i) => {
            setActiveItemForDetails(null);
            setItemForConfirmReceivedModal(i);
          }}
          onOpenClaimModal={(i) => {
            setActiveItemForDetails(null);
            setItemForClaimModal(i);
          }}
          onOpenReportSuspiciousModal={(i) => {
            setActiveItemForDetails(null);
            setItemForReportSuspiciousModal(i);
          }}
          onSelectMatchingItem={(i) => setActiveItemForDetails(i)}
          onOpenQRCode={(i) => {
            setActiveItemForDetails(null);
            setActiveItemForQRCode(i);
          }}
          onOpenChat={(i) => {
            setActiveItemForChat(i);
          }}
          onCustodyUpdated={refreshAllStates}
        />
      )}

      {/* AI Vision Image Search Modal */}
      {showImageSearchModal && (
        <AIImageSearchModal
          items={items}
          onClose={() => setShowImageSearchModal(false)}
          onSelectItem={(i) => {
            setShowImageSearchModal(false);
            setActiveItemForDetails(i);
          }}
        />
      )}

      {/* Secure In-App Anonymous Chat Modal */}
      {activeItemForChat && (
        <SecureChatModal
          item={activeItemForChat}
          currentUser={currentUser}
          onClose={() => setActiveItemForChat(null)}
        />
      )}

      {/* QR Code & Campus Printable Flyer Modal */}
      {activeItemForQRCode && (
        <QRCodeModal
          item={activeItemForQRCode}
          onClose={() => setActiveItemForQRCode(null)}
          onSimulateScan={(itemId) => {
            const target = items.find((i) => i.id === itemId);
            if (target) {
              setActiveItemForDetails(target);
              showToast(`📱 Scanned QR Code! Opened item details for "${target.title}"`);
            }
          }}
        />
      )}

      {/* 2. Report Lost / Found Modal */}
      {reportModalType && (
        <ReportModal
          initialType={reportModalType}
          currentUser={currentUser}
          existingItems={items}
          onClose={() => setReportModalType(null)}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* 3. Found Item Modal ("YES, I'VE FOUND THIS ITEM") */}
      {itemForFoundModal && (
        <FoundItemModal
          item={itemForFoundModal}
          currentUser={currentUser}
          onClose={() => setItemForFoundModal(null)}
          onSubmit={handleMarkRecoveredSubmit}
        />
      )}

      {/* 4. Confirm Received Modal ("YES, I GOT IT BACK") */}
      {itemForConfirmReceivedModal && (
        <ConfirmReceivedModal
          item={itemForConfirmReceivedModal}
          onClose={() => setItemForConfirmReceivedModal(null)}
          onConfirm={handleConfirmReceivedSubmit}
        />
      )}

      {/* 5. Claim Modal ("CLAIM THIS ITEM") */}
      {itemForClaimModal && (
        <ClaimModal
          item={itemForClaimModal}
          currentUser={currentUser}
          onClose={() => setItemForClaimModal(null)}
          onSubmitClaim={handleSubmitClaim}
        />
      )}

      {/* 6. Report Suspicious Modal */}
      {itemForReportSuspiciousModal && (
        <ReportSuspiciousModal
          item={itemForReportSuspiciousModal}
          currentUser={currentUser}
          onClose={() => setItemForReportSuspiciousModal(null)}
          onSubmitReport={handleSubmitReportSuspicious}
        />
      )}

      {/* 7. Auth / Switch Profile Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setShowAuthModal(false)}
          onSelectUser={handleSelectUser}
          onRegisterUser={handleRegisterUser}
        />
      )}

      {/* 8. Supabase Database Inspector & SQL Schema Modal */}
      {showSupabaseModal && (
        <SupabaseModal onClose={() => setShowSupabaseModal(false)} onSynced={refreshAllStates} />
      )}

      {/* Interactive Movable Live Notification Demo Widget */}
      <MovableNotification
        items={items}
        onViewItemDetails={(i) => setActiveItemForDetails(i)}
        onOpenReportModal={handleOpenReportModal}
      />
    </div>
  );
}
