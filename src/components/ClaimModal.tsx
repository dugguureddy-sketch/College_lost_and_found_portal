import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, X, Send } from 'lucide-react';
import { Item, User } from '../types';

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
  }) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  currentUser,
  onClose,
  onSubmitClaim,
}) => {
  const [reason, setReason] = useState('');
  const [secretDetail, setSecretDetail] = useState('');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !secretDetail.trim() || !phone.trim()) {
      setError('Please fill in all fields including a secret identifying detail.');
      return;
    }

    onSubmitClaim({
      itemId: item.id,
      itemTitle: item.title,
      reason,
      secretDetail,
      phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-md w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">🤝 Claim This Item</h2>
              <p className="text-[11px] text-orange-600 font-bold">Verify your ownership to poster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
            <div className="bg-orange-50/70 rounded-2xl p-3 border border-orange-100 text-xs">
              <div className="font-black text-slate-800 text-xs">{item.title}</div>
              <div className="text-slate-600 font-medium mt-0.5">Found Location: {item.location} ({item.roomDetails})</div>
              <div className="text-slate-500 text-[11px] font-medium mt-1">Found date: {item.date}</div>
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Why do you believe this item belongs to you? <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. I lost my scientific calculator in library reading hall table 14 on July 29 around 4 PM."
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Describe a private identifying detail: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={secretDetail}
                onChange={(e) => setSecretDetail(e.target.value)}
                placeholder="e.g. Contains a tiny scratch on the back battery cover or a specific sticker inside the lid."
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                This private detail is only shown to the finder and admin to prevent false claims.
              </p>
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Your Phone / Contact Number: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="px-5 py-3 border-t border-orange-100 flex items-center justify-end space-x-2.5 shrink-0 bg-slate-50/90 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs shadow-md shadow-orange-100 flex items-center space-x-1.5 uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT CLAIM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
