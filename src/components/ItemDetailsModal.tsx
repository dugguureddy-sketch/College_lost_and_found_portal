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
  Printer
} from 'lucide-react';
import { Item, User as UserType } from '../types';
import { findSmartMatchesForItem } from '../utils/matching';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';

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
}) => {
  // Find potential matches for this item
  const matches = findSmartMatchesForItem(item, allItems, 35);
  const topMatch = matches.length > 0 ? matches[0] : null;
  const matchedItem = topMatch ? (item.type === 'Lost' ? topMatch.foundItem : topMatch.lostItem) : null;

  const isOwner = currentUser.id === item.userId || currentUser.regNumber === item.userRegNumber;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Sticky Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 pr-4">
            <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
              item.type === 'Lost'
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}>
              {item.type === 'Lost' ? '🔴 LOST ITEM REPORT' : '🟢 FOUND ITEM REPORT'}
            </span>

            {item.status === 'Pending' && (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1 rounded-full flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>🟡 STATUS: PENDING</span>
              </span>
            )}

            {item.status === 'Recovered' && (
              <span className="bg-orange-100 text-orange-800 border border-orange-200 text-xs font-black px-3 py-1 rounded-full flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>🟠 STATUS: RECOVERED</span>
              </span>
            )}

            {item.status === 'Found' && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>🟢 STATUS: RETURNED</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Item Title */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {item.title}
          </h2>

        {/* Image Preview or Local Storage Auto-Purged State */}
        <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden mb-5 border border-orange-100 relative">
          {item.status === 'Found' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/80 text-emerald-900 p-6 text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mb-2" />
              <h4 className="text-sm font-black uppercase tracking-wide mb-1">Local Storage Privacy Cleared</h4>
              <p className="text-xs text-emerald-800 font-medium max-w-sm">
                This case is resolved! To protect user privacy, the item photograph, registration number (250301120030), and contact phone number were automatically erased from local disk database.
              </p>
            </div>
          ) : item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50/50 text-slate-400 font-medium">
              <Tag className="w-10 h-10 mb-2 text-orange-300" />
              <span className="text-xs font-bold text-slate-500">No Photograph Uploaded</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">Stored in Local Disk Database</span>
            </div>
          )}
        </div>

        {/* SMART MATCH ALERT BOX */}
        {topMatch && matchedItem && item.status !== 'Found' && (
          <div className="mb-6 bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
                <span className="text-sm font-black text-slate-800">🔔 Possible Smart Match Discovered!</span>
              </div>
              <span className="bg-orange-200 text-orange-800 font-black text-xs px-2.5 py-0.5 rounded-full">
                {topMatch.score}% Match Score
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium mb-2">
              Our campus matching system detected a candidate {item.type === 'Lost' ? 'Found' : 'Lost'} item report that matches this case:
            </p>

            <div className="bg-white rounded-xl p-3 border border-orange-200 text-xs flex items-center justify-between gap-2 shadow-sm">
              <div>
                <span className="font-black text-slate-900 text-sm block">{matchedItem.title}</span>
                <span className="text-slate-500 text-[11px] font-medium">
                  📍 {matchedItem.location} • 📅 {matchedItem.date}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {topMatch.reasons.slice(0, 2).map((r, i) => (
                    <span key={i} className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md font-bold">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectMatchingItem(matchedItem)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-black text-xs flex items-center space-x-1 shadow-sm"
              >
                <span>Compare Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Item Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
          <div>
            <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px] tracking-wide">Category</span>
            <span className="text-slate-800 font-bold flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-orange-500" />
              <span>{item.category}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px] tracking-wide">Location & Room</span>
            <span className="text-slate-800 font-bold flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{item.location} {item.roomDetails ? `(${item.roomDetails})` : ''}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px] tracking-wide">Date & Time</span>
            <span className="text-slate-800 font-bold flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span>{item.date} {item.time ? `at ${item.time}` : ''}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-bold mb-0.5 uppercase text-[10px] tracking-wide">Color</span>
            <span className="text-slate-800 font-bold">{item.color || 'Not specified'}</span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-orange-100">
            <span className="text-slate-500 block font-bold mb-1 uppercase text-[10px] tracking-wide">Description</span>
            <p className="text-slate-700 leading-relaxed text-xs font-medium">{item.description}</p>
          </div>

          {item.identifyingDetails && item.status !== 'Found' && (
            <div className="sm:col-span-2 pt-2 border-t border-orange-100">
              <span className="text-orange-600 block font-black mb-0.5 flex items-center space-x-1">
                <Lock className="w-3 h-3 text-orange-500" />
                <span>Private Secret Details (Verification):</span>
              </span>
              <p className="text-slate-600 italic font-medium">{item.identifyingDetails}</p>
            </div>
          )}
        </div>

        {/* Poster Info Box */}
        <div className="mb-6 p-4 rounded-2xl bg-orange-50/70 border border-orange-100 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-black text-white text-xs">
                {item.userName ? item.userName.charAt(0) : 'S'}
              </div>
              <div>
                <span className="font-black text-slate-800 block">{item.userName}</span>
                <span className="text-slate-500 text-[11px] font-medium">{item.userBranch} • {item.userYear}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
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
              <span className="bg-white border border-orange-200 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold">
                ID: {item.userRegNumber}
              </span>
            </div>
          </div>

          {/* Privacy Phone Notice or Revealed Contact */}
          {item.status === 'Recovered' && item.finderPhone ? (
            <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-900 mt-2 space-y-1">
              <div className="font-black flex items-center space-x-1.5 text-xs text-amber-900">
                <Phone className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Finder Contact Provided: {item.finderPhone}</span>
              </div>
              {item.finderNote && <p className="text-[11px] text-slate-700 font-medium">Note: "{item.finderNote}"</p>}
            </div>
          ) : item.status === 'Found' ? (
            <div className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Case Completed: Temporary contact details automatically purged.</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-2">
              <Lock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>Contact phone number is protected until you click "I've Found This Item" or submit a claim.</span>
            </div>
          )}
        </div>

        </div> {/* End Scrollable Body */}

        {/* Sticky Footer Interactive Action Buttons */}
        <div className="px-5 py-3.5 border-t border-orange-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50/90 rounded-b-3xl z-10">
          <div className="flex items-center space-x-3">
            {/* Report Fake Link */}
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
                className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <QrCode className="w-4 h-4 text-orange-600" />
                <span>QR Poster</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>

            {/* ACTION 1: "YES, I'VE FOUND THIS ITEM" (For Lost items in Pending status) */}
            {item.type === 'Lost' && item.status === 'Pending' && !isOwner && (
              <button
                onClick={() => onOpenFoundModal(item)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-100 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>YES, I'VE FOUND THIS ITEM</span>
              </button>
            )}

            {/* ACTION 2: "CLAIM THIS ITEM" (For Found items in Pending status) */}
            {item.type === 'Found' && item.status === 'Pending' && !isOwner && (
              <button
                onClick={() => onOpenClaimModal(item)}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs shadow-md shadow-orange-100 flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>CLAIM THIS ITEM</span>
              </button>
            )}

            {/* ACTION 3: "ITEM HAS BEEN RECEIVED / YES I GOT IT BACK" (For Recovered status) */}
            {item.status === 'Recovered' && (
              <button
                onClick={() => onOpenConfirmReceivedModal(item)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-100 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ITEM HAS BEEN RECEIVED (YES, I GOT IT BACK)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
