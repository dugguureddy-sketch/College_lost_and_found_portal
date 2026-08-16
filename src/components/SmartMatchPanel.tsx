import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  QrCode,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Item, MatchResult } from '../types';
import { findSmartMatchesForItem } from '../utils/matching';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';

interface SmartMatchPanelProps {
  items: Item[];
  onSelectPair: (lostItem: Item, foundItem: Item) => void;
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
  onOpenChat?: (item: Item) => void;
}

export const SmartMatchPanel: React.FC<SmartMatchPanelProps> = ({
  items,
  onSelectPair,
  onOpenReportModal,
  onOpenChat,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Collect all unique Lost-Found pairs
  const lostItems = items.filter((i) => i.type === 'Lost' && i.status !== 'Found');
  const allMatches: MatchResult[] = [];
  const seenPairKeys = new Set<string>();

  for (const lost of lostItems) {
    const matches = findSmartMatchesForItem(lost, items, 30);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-1 text-xs font-black text-orange-900 shadow-xs">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
          <span>AI Multi-Dimensional Match Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Automated Campus Lost & Found Matches
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Our intelligent radar cross-references category, geographic campus zone, specific room spots, timeline windows, brand signatures, and visual color profiles to connect lost items with found inventory.
        </p>
      </div>

      {allMatches.length === 0 ? (
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 font-black">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">No Active Smart Matches Detected</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
            When campus members post complementary Lost and Found reports, the AI matching radar will automatically compute similarity matrices here.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => onOpenReportModal('Lost')}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
            >
              🔴 Post Lost Report
            </button>
            <button
              onClick={() => onOpenReportModal('Found')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
            >
              🟢 Post Found Item
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {allMatches.map(({ lostItem, foundItem, score, confidenceLabel, reasons, granularBreakdown, aiSummary }) => {
            const pairKey = `${lostItem.id}-${foundItem.id}`;
            const isExpanded = expandedMatchId === pairKey;

            return (
              <div
                key={pairKey}
                className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-3xl p-5 sm:p-7 shadow-md transition-all space-y-5"
              >
                {/* Score Banner & Probability Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-orange-100">
                  <div className="flex items-center space-x-3">
                    {/* Score Bubble */}
                    <div
                      className={`px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-black flex items-center space-x-1.5 shadow-xs ${
                        score >= 80
                          ? 'bg-emerald-600 text-white'
                          : score >= 50
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{score}% Match Probability</span>
                    </div>

                    <span className="text-xs font-bold text-slate-700">
                      {confidenceLabel || (score >= 75 ? 'High Probability' : 'Moderate Match')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(foundItem)}
                        className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-xl border border-orange-200 flex items-center space-x-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                        <span>Anonymous Chat</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectPair(lostItem, foundItem)}
                      className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow flex items-center space-x-1.5 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-orange-400" />
                      <span>Verify Ownership Claim</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lost Item Card */}
                  <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-200 text-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="bg-rose-500 text-white font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase">
                          🔴 Lost Item Report
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

                      <h4 className="font-black text-slate-900 text-sm sm:text-base mb-1">
                        {lostItem.title}
                      </h4>
                      <p className="text-slate-600 text-xs line-clamp-2 mb-2">
                        {lostItem.description}
                      </p>

                      <div className="text-slate-600 space-y-1 text-xs font-medium">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            {lostItem.location} {lostItem.roomDetails ? `(${lostItem.roomDetails})` : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Reported: {lostItem.date} {lostItem.time || ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-bold border-t border-rose-100 pt-2 flex items-center justify-between">
                      <span>Reporter: {lostItem.userName}</span>
                      <span className="font-mono text-[10px] text-rose-700">{lostItem.itemCode || 'CODE-PENDING'}</span>
                    </div>
                  </div>

                  {/* Found Item Card */}
                  <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 text-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase">
                          🟢 Found Drop-Off Item
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

                      <h4 className="font-black text-slate-900 text-sm sm:text-base mb-1">
                        {foundItem.title}
                      </h4>
                      <p className="text-slate-600 text-xs line-clamp-2 mb-2">
                        {foundItem.description}
                      </p>

                      <div className="text-slate-600 space-y-1 text-xs font-medium">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {foundItem.location} {foundItem.roomDetails ? `(${foundItem.roomDetails})` : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Found: {foundItem.date} {foundItem.time || ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-bold border-t border-emerald-100 pt-2 flex items-center justify-between">
                      <span>Finder: {foundItem.userName}</span>
                      <span className="font-mono text-[10px] text-emerald-700">{foundItem.itemCode || 'FND-CODE'}</span>
                    </div>
                  </div>
                </div>

                {/* Granular Breakdown Matrix Accordion */}
                <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        AI Reasoning & Match Matrix
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : pairKey)}
                      className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Breakdown' : 'Inspect Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {aiSummary || `AI identified a ${score}% statistical overlap across category, campus location, and reporting timeline.`}
                  </p>

                  {/* Granular Checklist Table */}
                  {isExpanded && granularBreakdown && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3 border-t border-orange-200">
                      {granularBreakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2 ${
                            item.matched
                              ? 'bg-white border-emerald-300 text-slate-800 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          <span
                            className={`p-1 rounded-md shrink-0 mt-0.5 ${
                              item.matched
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{item.title}</span>
                              <span
                                className={`text-[10px] font-black ml-1 ${
                                  item.matched ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                +{item.scoreContribution}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary Pills */}
                  {!isExpanded && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {reasons.slice(0, 4).map((r, i) => (
                        <span
                          key={i}
                          className="bg-white text-orange-900 border border-orange-200 px-2.5 py-0.5 rounded-lg font-bold shadow-2xs"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
