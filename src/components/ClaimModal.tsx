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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">🤝 Claim This Item</h2>
            <p className="text-xs text-orange-600 font-bold">Verify your ownership to poster</p>
          </div>
        </div>

        <div className="bg-orange-50/70 rounded-2xl p-3.5 border border-orange-100 mb-4 text-xs">
          <div className="font-black text-slate-800 text-sm">{item.title}</div>
          <div className="text-slate-600 font-medium mt-0.5">Found Location: {item.location} ({item.roomDetails})</div>
          <div className="text-slate-500 text-[11px] font-medium mt-1">Found date: {item.date}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs shadow-md shadow-orange-100 flex items-center space-x-1.5 uppercase tracking-wider"
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
