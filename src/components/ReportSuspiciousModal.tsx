import React, { useState } from 'react';
import { Flag, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Item, User } from '../types';

interface ReportSuspiciousModalProps {
  item: Item;
  currentUser: User;
  onClose: () => void;
  onSubmitReport: (reportData: {
    itemId: string;
    itemTitle: string;
    reason: 'Fake Photo' | 'Inappropriate Content' | 'Extortion / Scam' | 'Duplicate / Spam' | 'Other';
    details: string;
  }) => void;
}

export const ReportSuspiciousModal: React.FC<ReportSuspiciousModalProps> = ({
  item,
  currentUser,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<'Fake Photo' | 'Inappropriate Content' | 'Extortion / Scam' | 'Duplicate / Spam' | 'Other'>('Fake Photo');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      itemId: item.id,
      itemTitle: item.title,
      reason,
      details,
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
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">🚨 Report Suspicious Listing</h2>
            <p className="text-xs text-rose-600 font-bold">Flag fake or inappropriate posts to Campus Admin</p>
          </div>
        </div>

        <div className="bg-orange-50/70 rounded-2xl p-3.5 border border-orange-100 mb-4 text-xs">
          <div className="font-black text-slate-800">{item.title}</div>
          <div className="text-slate-500 font-medium mt-0.5">Posted by: {item.userName} ({item.userBranch})</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
              Select Violation Reason:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Fake Photo">📷 Fake Photo / Stock Image</option>
              <option value="Inappropriate Content">⚠️ Inappropriate or Offensive Content</option>
              <option value="Extortion / Scam">💰 Extortion / Demand for Money</option>
              <option value="Duplicate / Spam">🔁 Duplicate / Spam Listing</option>
              <option value="Other">❓ Other Suspicious Reason</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
              Additional Details for Admin:
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain why this listing is fake or suspicious..."
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

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
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-md shadow-rose-100 flex items-center space-x-1.5 uppercase tracking-wider"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>SUBMIT REPORT TO ADMIN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
