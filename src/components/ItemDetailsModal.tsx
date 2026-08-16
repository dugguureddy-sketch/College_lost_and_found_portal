import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  Clock,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Printer,
  MessageSquare,
  History,
  Box,
  Key,
  Shield,
  Plus,
} from 'lucide-react';
import { Item, User as UserType, CustodyStep } from '../types';
import { findSmartMatchesForItem } from '../utils/matching';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';
import { addCustodyStepToItem } from '../utils/storage';

interface ItemDetailsModalProps {
  item: Item;
  allItems: Item[];
  currentUser: UserType;
  onClose: () => void;
  onOpenFoundModal: (item: Item) => void;
  onOpenConfirmReceivedModal: (item: Item) => void;
  onOpenClaimModal: (item: Item) => void;
  onOpenReportSuspiciousModal: (item: Item) => void;
  onSelectMatchingItem: (item: Item) => void;
  onOpenQRCode?: (item: Item) => void;
  onOpenChat?: (item: Item) => void;
  onCustodyUpdated?: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  allItems,
  currentUser,
  onClose,
  onOpenFoundModal,
  onOpenConfirmReceivedModal,
  onOpenClaimModal,
  onOpenReportSuspiciousModal,
  onSelectMatchingItem,
  onOpenQRCode,
  onOpenChat,
  onCustodyUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'custody' | 'matches'>('details');
  const [showAddCustody, setShowAddCustody] = useState(false);
  const [custodyStep, setCustodyStep] = useState<CustodyStep['step']>('Storage Assigned');
  const [custodyLocation, setCustodyLocation] = useState('Admin Security Desk Locker #B-14');
  const [custodyNote, setCustodyNote] = useState('');

  // Find potential matches for this item
  const matches = findSmartMatchesForItem(item, allItems, 30);
  const topMatch = matches.length > 0 ? matches[0] : null;
  const matchedItem = topMatch ? (item.type === 'Lost' ? topMatch.foundItem : topMatch.lostItem) : null;

  const isOwner = currentUser.id === item.userId || currentUser.regNumber === item.userRegNumber;
  const isStaffOrAdmin = currentUser.role === 'admin' || currentUser.role === 'security' || currentUser.role === 'faculty';

  const handleAddCustodyStep = (e: React.FormEvent) => {
    e.preventDefault();
    addCustodyStepToItem(item.id, {
      step: custodyStep,
      actor: currentUser.name,
      role: isStaffOrAdmin ? 'Campus Security Officer' : 'Student Custodian',
      location: custodyLocation,
      note: custodyNote || 'Custody transfer verified and recorded in tamper-proof audit log.',
    });
    setShowAddCustody(false);
    setCustodyNote('');
    if (onCustodyUpdated) onCustodyUpdated();
  };

  const custodyList = item.custodyHistory || [
    {
      step: item.type === 'Found' ? 'Found' : 'Submitted to Desk',
      timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent',
      actor: item.userName,
      role: 'Student Reporter',
      location: item.location,
      note: `Initial ${item.type.toLowerCase()} report logged in system`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Sticky Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 pr-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                item.type === 'Lost' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {item.type === 'Lost' ? '🔴 LOST REPORT' : '🟢 FOUND INVENTORY'}
            </span>

            <span className="font-mono text-xs bg-orange-100 text-orange-900 border border-orange-200 px-2.5 py-0.5 rounded-full font-bold">
              {item.itemCode || 'CAMPUS-REF'}
            </span>

            {item.status === 'Pending' && (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>PENDING</span>
              </span>
            )}

            {item.status === 'Recovered' && (
              <span className="bg-orange-100 text-orange-800 border border-orange-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                🟠 HANDOFF IN PROGRESS
              </span>
            )}

            {item.status === 'Found' && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>🟢 RETURNED & RESOLVED</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-5 pt-3 pb-1 border-b border-orange-100 bg-orange-50/50 flex items-center space-x-2 text-xs font-black">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'details'
                ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Item Profile
          </button>
          <button
            onClick={() => setActiveTab('custody')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'custody'
                ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-orange-600" />
            <span>Digital Custody ({custodyList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'matches'
                ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Matches ({matches.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: ITEM PROFILE & DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Title & Brand */}
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {item.title}
                </h2>
                {item.brand && (
                  <span className="text-xs text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                    Brand: {item.brand}
                  </span>
                )}
              </div>

              {/* Photo Preview / Privacy Wiped Notice */}
              <div className="w-full h-52 sm:h-60 bg-slate-900 rounded-2xl overflow-hidden border border-orange-100 relative shadow-inner">
                {item.status === 'Found' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-900 p-6 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-600 mb-2" />
                    <h4 className="text-sm font-black uppercase tracking-wide mb-1">
                      Privacy Auto-Purge Activated
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium max-w-sm">
                      Case resolved and returned to verified owner. Identifying photographs and personal records were purged to protect student privacy.
                    </p>
                  </div>
                ) : item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 font-medium">
                    <Tag className="w-10 h-10 mb-2 text-slate-300" />
                    <span className="text-xs font-bold text-slate-500">No Photo Uploaded</span>
                  </div>
                )}

                {/* Storage Locker Badge */}
                {item.storageLocation && item.status !== 'Found' && (
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-bold flex items-center space-x-1.5">
                    <Box className="w-3.5 h-3.5 text-orange-400" />
                    <span>Locker Location: {item.storageLocation}</span>
                  </div>
                )}
              </div>

              {/* Visual Tags */}
              {item.visualTags && item.visualTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">AI Vision Tags:</span>
                  {item.visualTags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Item Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-orange-50/60 p-4 rounded-2xl border border-orange-200 text-xs">
                <div>
                  <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px]">
                    Category
                  </span>
                  <span className="text-slate-900 font-bold flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-orange-600" />
                    <span>{item.category}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px]">
                    Campus Location & Room
                  </span>
                  <span className="text-slate-900 font-bold flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>
                      {item.location} {item.roomDetails ? `(${item.roomDetails})` : ''}
                    </span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px]">
                    Date & Time
                  </span>
                  <span className="text-slate-900 font-bold flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    <span>{item.date} {item.time ? `at ${item.time}` : ''}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px]">
                    Color
                  </span>
                  <span className="text-slate-900 font-bold">{item.color || 'Not specified'}</span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-orange-200">
                  <span className="text-slate-500 block font-bold mb-1 uppercase text-[10px]">
                    Description
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">{item.description}</p>
                </div>
              </div>

              {/* Reporter Info Box */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-white text-xs shadow-xs">
                    {item.userName ? item.userName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">{item.userName}</span>
                    <span className="text-slate-500 text-[11px] font-medium">
                      {item.userBranch} • {item.userYear} • ID: {item.userRegNumber}
                    </span>
                  </div>
                </div>

                <GoodSamaritanBadgePill
                  user={{
                    id: item.userId,
                    regNumber: item.userRegNumber,
                    name: item.userName,
                    branch: item.userBranch,
                    year: item.userYear,
                    phone: item.userPhone,
                  }}
                  items={allItems}
                  size="sm"
                  showKarma
                />
              </div>
            </div>
          )}

          {/* TAB 2: DIGITAL CHAIN OF CUSTODY (Tier 2 Requirement) */}
          {activeTab === 'custody' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Digital Chain of Custody Audit Log
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verifiable chronological custody timeline from discovery to physical handoff.
                  </p>
                </div>

                {isStaffOrAdmin && (
                  <button
                    onClick={() => setShowAddCustody(!showAddCustody)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Custody Step</span>
                  </button>
                )}
              </div>

              {/* Add Custody Step Form */}
              {showAddCustody && (
                <form
                  onSubmit={handleAddCustodyStep}
                  className="bg-orange-50/90 border-2 border-orange-300 rounded-2xl p-4 space-y-3 animate-fade-in"
                >
                  <span className="text-xs font-black text-orange-950 uppercase tracking-wider block">
                    Record New Custody Milestone
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        Custody Action Step
                      </label>
                      <select
                        value={custodyStep}
                        onChange={(e) => setCustodyStep(e.target.value as CustodyStep['step'])}
                        className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        <option value="Submitted to Desk">Submitted to Desk</option>
                        <option value="Storage Assigned">Storage Assigned (Locker)</option>
                        <option value="Transferred to Admin HQ">Transferred to Admin HQ</option>
                        <option value="Claimed">Claim Verified / Claimed</option>
                        <option value="Returned & Closed">Returned & Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        Location / Bay #
                      </label>
                      <input
                        type="text"
                        value={custodyLocation}
                        onChange={(e) => setCustodyLocation(e.target.value)}
                        placeholder="e.g. Security Locker #B-14"
                        className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Audit Note & ID Verification
                    </label>
                    <input
                      type="text"
                      value={custodyNote}
                      onChange={(e) => setCustodyNote(e.target.value)}
                      placeholder="e.g. Checked Student ID against record and handed off item."
                      className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustody(false)}
                      className="px-3 py-1.5 bg-white text-slate-700 rounded-xl font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs shadow-xs"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              )}

              {/* Custody Timeline Visualization */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200">
                {custodyList.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-orange-500 text-orange-600 flex items-center justify-center font-black text-[10px] shadow-xs">
                      {idx + 1}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 hover:border-orange-300 rounded-2xl p-3.5 space-y-1 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 flex items-center space-x-1.5">
                          <span>{step.step}</span>
                          {step.role && (
                            <span className="text-[9px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded-sm font-bold">
                              {step.role}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {step.timestamp}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-center space-x-2">
                        <span>👤 Custodian: <strong>{step.actor}</strong></span>
                        <span>•</span>
                        <span>📍 {step.location}</span>
                      </div>

                      {step.note && (
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded-xl border border-slate-100">
                          "{step.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI SMART MATCHES RADAR */}
          {activeTab === 'matches' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Candidate Item Matches ({matches.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time AI matching score based on category, campus location, and timeline.
                  </p>
                </div>
              </div>

              {matches.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-600">No candidate matches at this time.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    We will notify you immediately when a matching report is logged.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map(({ lostItem, foundItem, score, reasons }) => {
                    const otherItem = item.type === 'Lost' ? foundItem : lostItem;
                    return (
                      <div
                        key={otherItem.id}
                        className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-2xl p-4 shadow-xs transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                                score >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {score}% Match Probability
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {otherItem.itemCode || otherItem.date}
                            </span>
                          </div>

                          <button
                            onClick={() => onSelectMatchingItem(otherItem)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                          >
                            <span>Inspect Match</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{otherItem.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{otherItem.description}</p>
                          <div className="text-[11px] text-slate-600 mt-1 flex items-center space-x-2">
                            <span>📍 {otherItem.location}</span>
                            <span>•</span>
                            <span>📅 {otherItem.date}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 border-t border-orange-100 pt-2">
                          {reasons.slice(0, 3).map((r, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-orange-50 text-orange-900 border border-orange-200 px-2 py-0.5 rounded-md font-bold"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer Interactive Action Buttons */}
        <div className="px-5 py-3.5 border-t border-orange-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50/90 rounded-b-3xl z-10">
          <div className="flex items-center space-x-2">
            {/* Suspicious report */}
            <button
              onClick={() => onOpenReportSuspiciousModal(item)}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center space-x-1 hover:underline font-bold"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report Suspicious</span>
            </button>

            {/* QR Code / Printable Poster Button */}
            {onOpenQRCode && (
              <button
                onClick={() => onOpenQRCode(item)}
                className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-2xs transition-all"
              >
                <QrCode className="w-4 h-4 text-orange-600" />
                <span>QR Poster</span>
              </button>
            )}

            {/* In-App Anonymous Chat */}
            {onOpenChat && (
              <button
                onClick={() => onOpenChat(item)}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                <span>Safe Chat</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Close
            </button>

            {/* ACTION 1: "YES, I'VE FOUND THIS ITEM" (For Lost items in Pending status) */}
            {item.type === 'Lost' && item.status === 'Pending' && !isOwner && (
              <button
                onClick={() => onOpenFoundModal(item)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I'VE FOUND THIS ITEM</span>
              </button>
            )}

            {/* ACTION 2: "CLAIM THIS ITEM" (For Found items in Pending status) */}
            {item.type === 'Found' && item.status === 'Pending' && !isOwner && (
              <button
                onClick={() => onOpenClaimModal(item)}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>VERIFY OWNERSHIP & CLAIM</span>
              </button>
            )}

            {/* ACTION 3: "ITEM HAS BEEN RECEIVED / YES I GOT IT BACK" (For Recovered status) */}
            {item.status === 'Recovered' && (
              <button
                onClick={() => onOpenConfirmReceivedModal(item)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM RECEIVED (CLOSE CASE)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
