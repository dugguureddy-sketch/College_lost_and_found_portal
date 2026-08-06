import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react';
import { Item } from '../types';

interface ConfirmReceivedModalProps {
  item: Item;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
}

export const ConfirmReceivedModal: React.FC<ConfirmReceivedModalProps> = ({
  item,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-800 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Sparkles className="w-8 h-8 fill-emerald-600" />
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-1">🎉 ITEM FOUND!</h2>
        <p className="text-xs text-emerald-700 font-bold mb-4">
          Confirmation of Physical Item Handoff
        </p>

        <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-100 text-left mb-4 text-xs space-y-1">
          <div className="font-black text-slate-800 text-sm">{item.title}</div>
          <div className="text-slate-600 font-medium">📍 Location: {item.location}</div>
          {item.finderPhone && (
            <div className="text-orange-600 font-bold">📞 Finder Contact: {item.finderPhone}</div>
          )}
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
          Have you successfully received your <strong className="text-slate-900 font-black">{item.title}</strong> back from the finder?
        </p>

        {/* Automatic Deletion Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 text-left mb-6 text-[11px] text-slate-700 font-medium space-y-1.5">
          <div className="flex items-center space-x-1.5 font-black text-orange-900">
            <Trash2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Automatic Privacy Cleanup Execution:</span>
          </div>
          <p className="text-slate-700 pl-5 leading-tight font-medium">
            Clicking <strong className="text-slate-900 font-black">"YES, I GOT IT BACK"</strong> will automatically:
          </p>
          <ul className="list-disc pl-9 text-slate-700 space-y-0.5 font-medium">
            <li>Update status to <strong className="text-emerald-700 font-bold">🟢 FOUND & CLOSED</strong></li>
            <li>Purge temporary personal contact phone numbers</li>
            <li>Clear private identifying descriptions</li>
            <li>Increment permanent statistic: <strong className="text-emerald-700 font-bold">Total Items Found (+1)</strong></li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item.id)}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-100 flex items-center space-x-2 uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>YES, I GOT IT BACK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
