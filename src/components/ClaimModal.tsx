import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, X, Send, Sparkles, CheckCircle2, RefreshCw, HelpCircle } from 'lucide-react';
import { Item, User, HiddenVerificationAnswers } from '../types';
import { evaluateClaimWithAI } from '../utils/ai';

interface ClaimModalProps {
  item: Item;
  currentUser: User;
  onClose: () => void;
  onSubmitClaim: (claimData: {
    itemId: string;
    itemTitle: string;
    reason: string;
    secretDetail: string;
    phone: string;
    hiddenAnswers?: HiddenVerificationAnswers;
    confidenceScore?: number;
    aiVerdict?: string;
  }) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  currentUser,
  onClose,
  onSubmitClaim,
}) => {
  const [reason, setReason] = useState('');
  const [stickerOrMark, setStickerOrMark] = useState('');
  const [contents, setContents] = useState('');
  const [uniqueMark, setUniqueMark] = useState('');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    confidenceScore: number;
    verdict: string;
    assessmentReason: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleRunAIVerification = async () => {
    if (!reason.trim() && !stickerOrMark.trim() && !contents.trim() && !uniqueMark.trim()) {
      setError('Please answer at least one verification question first.');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      const answers: HiddenVerificationAnswers = {
        stickerOrMark,
        contents,
        uniqueMark,
        reason,
      };

      const result = await evaluateClaimWithAI(
        item.identifyingDetails || item.secretIdentifyingDetails || '',
        answers,
        item.title
      );

      setVerificationResult(result);
    } catch (e) {
      console.error('Claim AI verification error:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !phone.trim()) {
      setError('Please provide a reason and your contact phone number.');
      return;
    }

    const secretCombined = [
      stickerOrMark ? `Sticker/Mark: ${stickerOrMark}` : '',
      contents ? `Contents: ${contents}` : '',
      uniqueMark ? `Unique Feature: ${uniqueMark}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    onSubmitClaim({
      itemId: item.id,
      itemTitle: item.title,
      reason,
      secretDetail: secretCombined || 'No additional secret details provided',
      phone,
      hiddenAnswers: {
        stickerOrMark,
        contents,
        uniqueMark,
        reason,
      },
      confidenceScore: verificationResult?.confidenceScore,
      aiVerdict: verificationResult?.verdict,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-lg w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span>Advanced Claim Verification</span>
                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                  Zero-Knowledge
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Answer secret ownership questions to verify legitimate item ownership.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Target Item Reference Box */}
            <div className="bg-orange-50/80 rounded-2xl p-3.5 border border-orange-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-orange-700 uppercase tracking-wider block">
                  Claiming Item #{item.itemCode || 'CAMPUS-REF'}
                </span>
                <div className="font-black text-slate-900 text-sm mt-0.5">{item.title}</div>
                <div className="text-slate-600 text-xs mt-0.5">
                  📍 {item.location} {item.roomDetails ? `(${item.roomDetails})` : ''} • {item.date}
                </div>
              </div>
              <span className="p-2 bg-white text-orange-600 rounded-xl border border-orange-200 shadow-2xs">
                <Lock className="w-4 h-4" />
              </span>
            </div>

            {/* Hidden Ownership Challenge Questions (Tier 1 #5) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-900">
                <HelpCircle className="w-4 h-4 text-orange-600" />
                <span className="font-black text-xs uppercase tracking-wider">
                  Hidden Ownership Challenge Questions
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                To prevent fraudulent claims, answer these private questions known only to the true owner:
              </p>

              {/* Question 1: Stickers or Markings */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  1. What sticker, keychain, initial, or logo was on the item?
                </label>
                <input
                  type="text"
                  value={stickerOrMark}
                  onChange={(e) => setStickerOrMark(e.target.value)}
                  placeholder="e.g. Silver NASA sticker on rear lid, 'DR' initial on bottom..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Question 2: Contents */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  2. What specific items, cards, or notes were inside / attached?
                </label>
                <input
                  type="text"
                  value={contents}
                  onChange={(e) => setContents(e.target.value)}
                  placeholder="e.g. Blue Parker pen in front pocket, graph paper notebook..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Question 3: Unique Scratches or Serial */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  3. What unique scratch, battery cover mark, or serial digit exists?
                </label>
                <input
                  type="text"
                  value={uniqueMark}
                  onChange={(e) => setUniqueMark(e.target.value)}
                  placeholder="e.g. Diagonal scratch near power switch, battery compartment tape..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* AI Real-time Confidence Check Button */}
              <button
                type="button"
                onClick={handleRunAIVerification}
                disabled={isVerifying}
                className="w-full py-2 bg-white hover:bg-orange-50 text-orange-700 border border-orange-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-2xs"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Cross-Evaluating Answers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Run AI Ownership Confidence Evaluation</span>
                  </>
                )}
              </button>

              {/* AI Verification Assessment Result Display */}
              {verificationResult && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    verificationResult.confidenceScore >= 75
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : verificationResult.confidenceScore >= 40
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-black">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AI Verification: {verificationResult.verdict}</span>
                    </span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full border shadow-2xs">
                      {verificationResult.confidenceScore}% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    {verificationResult.assessmentReason}
                  </p>
                </div>
              )}
            </div>

            {/* Circumstances & Location Context */}
            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                When and how did you lose this item? <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. I left it on table 14 in Central Library around 2:30 PM after math study..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                Your Contact Phone Number: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-orange-100 bg-slate-50 rounded-b-3xl flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Verified Claim</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
