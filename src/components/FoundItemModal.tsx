import React, { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, X, Shield, Lock } from 'lucide-react';
import { Item, User } from '../types';

interface FoundItemModalProps {
  item: Item;
  currentUser: User;
  onClose: () => void;
  onSubmit: (itemId: string, finderPhone: string, note?: string) => void;
}

export const FoundItemModal: React.FC<FoundItemModalProps> = ({
  item,
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please provide your contact number so the owner can reach you.');
      return;
    }
    onSubmit(item.id, phone, note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">🔔 Item Found!</h2>
            <p className="text-xs text-emerald-700 font-bold">Have you found this item?</p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="bg-orange-50/70 rounded-2xl p-3.5 border border-orange-100 mb-4 text-xs">
          <div className="font-black text-slate-800 text-sm">{item.title}</div>
          <div className="text-slate-600 font-medium mt-0.5">
            📍 {item.location} {item.roomDetails ? `(${item.roomDetails})` : ''}
          </div>
          <div className="text-slate-500 text-[11px] font-medium mt-1">
            Reported lost by: <strong className="text-slate-800">{item.userName}</strong> ({item.userBranch} • {item.userYear})
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
              📞 Your Contact Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              This contact number will be provided directly to {item.userName} to coordinate item return.
            </p>
          </div>

          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
              📝 Safe Location / Message Note (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Left safely with central library desk manager, or 'Call me after 5 PM'."
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-[11px] text-slate-700 font-medium flex items-start space-x-2">
            <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-orange-900 font-bold">Privacy Protection:</strong> Submitting will update status to <span className="text-orange-600 font-black">🟠 RECOVERED</span> and send your phone number to the owner. Contact info is automatically purged once the owner confirms receipt!
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-100 flex items-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>YES, SEND TO OWNER</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
