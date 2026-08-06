import React from 'react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  MapPin, 
  Calendar, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Item, MatchResult } from '../types';
import { findSmartMatchesForItem } from '../utils/matching';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';
import { getItems } from '../utils/storage';

interface SmartMatchPanelProps {
  items: Item[];
  onSelectPair: (lostItem: Item, foundItem: Item) => void;
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
}

export const SmartMatchPanel: React.FC<SmartMatchPanelProps> = ({
  items,
  onSelectPair,
  onOpenReportModal,
}) => {
  // Collect all unique Lost-Found pairs with score >= 35
  const lostItems = items.filter(i => i.type === 'Lost' && i.status !== 'Found');
  const allMatches: MatchResult[] = [];
  const seenPairKeys = new Set<string>();

  for (const lost of lostItems) {
    const matches = findSmartMatchesForItem(lost, items, 35);
    for (const m of matches) {
      const pairKey = `${m.lostItem.id}-${m.foundItem.id}`;
      if (!seenPairKeys.has(pairKey)) {
        seenPairKeys.add(pairKey);
        allMatches.push(m);
      }
    }
  }

  // Sort descending by score
  allMatches.sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      {/* Header */}
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-orange-100 border border-orange-200 rounded-full px-3.5 py-1 text-xs font-black text-orange-800 mb-3 shadow-sm">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
          <span>Smart Matching Radar System</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
          Automated Lost & Found Matches
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Our algorithm continuously analyzes category, campus area, specific spot notes, date proximity, and item descriptions to discover potential matches automatically.
        </p>
      </div>

      {allMatches.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 font-black">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">No High-Confidence Matches Found Yet</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
            As students post new Lost and Found items, our system will automatically match them and calculate similarity scores here.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => onOpenReportModal('Lost')}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-black text-xs rounded-xl shadow-md shadow-orange-200"
            >
              🔴 Post Lost Item
            </button>
            <button
              onClick={() => onOpenReportModal('Found')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-200"
            >
              🟢 Post Found Item
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {allMatches.map(({ lostItem, foundItem, score, reasons }) => (
            <div
              key={`${lostItem.id}-${foundItem.id}`}
              className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-3xl p-6 shadow-sm transition-all"
            >
              {/* Score Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-orange-100">
                <div className="flex items-center space-x-2">
                  <span className="bg-orange-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>{score}% Match Score</span>
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    High probability match detected
                  </span>
                </div>

                <button
                  onClick={() => onSelectPair(lostItem, foundItem)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow flex items-center space-x-1.5 transition-all hover:scale-105"
                >
                  <span>Connect & Review Match</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </button>
              </div>

              {/* Pair Cards Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lost Side */}
                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200 text-xs flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                      <span className="bg-rose-500 text-white font-black px-2.5 py-0.5 rounded-lg text-[11px]">
                        🔴 LOST REPORT
                      </span>
                      <GoodSamaritanBadgePill
                        user={{
                          id: lostItem.userId,
                          regNumber: lostItem.userRegNumber,
                          name: lostItem.userName,
                          branch: lostItem.userBranch,
                          year: lostItem.userYear,
                          phone: lostItem.userPhone,
                        }}
                        items={items}
                        size="sm"
                      />
                    </div>
                    <h4 className="font-black text-slate-800 text-sm mb-1">{lostItem.title}</h4>
                    <div className="text-slate-600 space-y-0.5 text-[11px] font-medium">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{lostItem.location} ({lostItem.roomDetails})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{lostItem.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold border-t border-rose-100 pt-1.5">
                    Posted by: {lostItem.userName} ({lostItem.userRegNumber})
                  </div>
                </div>

                {/* Found Side */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 text-xs flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                      <span className="bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-lg text-[11px]">
                        🟢 FOUND REPORT
                      </span>
                      <GoodSamaritanBadgePill
                        user={{
                          id: foundItem.userId,
                          regNumber: foundItem.userRegNumber,
                          name: foundItem.userName,
                          branch: foundItem.userBranch,
                          year: foundItem.userYear,
                          phone: foundItem.userPhone,
                        }}
                        items={items}
                        size="sm"
                        showKarma
                      />
                    </div>
                    <h4 className="font-black text-slate-800 text-sm mb-1">{foundItem.title}</h4>
                    <div className="text-slate-600 space-y-0.5 text-[11px] font-medium">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{foundItem.location} ({foundItem.roomDetails})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{foundItem.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold border-t border-emerald-100 pt-1.5">
                    Posted by: {foundItem.userName} ({foundItem.userRegNumber})
                  </div>
                </div>
              </div>

              {/* Match Score Reasons pills */}
              <div className="mt-3 pt-3 border-t border-orange-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-bold mr-1">Match Factors:</span>
                {reasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-0.5 rounded-lg font-bold"
                  >
                    ✓ {reason}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
