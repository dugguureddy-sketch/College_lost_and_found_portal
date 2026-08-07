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
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-md w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">🚨 Report Suspicious Listing</h2>
              <p className="text-[11px] text-rose-600 font-bold">Flag fake or inappropriate posts</p>
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
              <div className="font-black text-slate-800">{item.title}</div>
              <div className="text-slate-500 font-medium mt-0.5">Posted by: {item.userName} ({item.userBranch})</div>
            </div>

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
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-md shadow-rose-100 flex items-center space-x-1.5 uppercase tracking-wider"
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
