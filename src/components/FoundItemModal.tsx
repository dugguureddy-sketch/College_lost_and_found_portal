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
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-md w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">🔔 Item Found!</h2>
              <p className="text-[11px] text-emerald-700 font-bold">Have you found this item?</p>
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
            {/* Item Summary */}
            <div className="bg-orange-50/70 rounded-2xl p-3 border border-orange-100 text-xs">
              <div className="font-black text-slate-800 text-xs">{item.title}</div>
              <div className="text-slate-600 font-medium mt-0.5">
                📍 {item.location} {item.roomDetails ? `(${item.roomDetails})` : ''}
              </div>
              <div className="text-slate-500 text-[11px] font-medium mt-1">
                Reported lost by: <strong className="text-slate-800">{item.userName}</strong> ({item.userBranch} • {item.userYear})
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                📞 Your Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                This contact number will be provided directly to {item.userName} to coordinate item return.
              </p>
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                📝 Safe Location / Message Note (Optional)
              </label>
              <textarea
                rows={2}
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

            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-[11px] text-slate-700 font-medium flex items-start space-x-2">
              <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-orange-900 font-bold">Privacy Protection:</strong> Submitting will update status to <span className="text-orange-600 font-black">🟠 RECOVERED</span> and send your phone number to the owner.
              </div>
            </div>
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
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-100 flex items-center space-x-1.5 uppercase tracking-wider"
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
