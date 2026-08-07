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
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-md w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto text-center">
        {/* Header */}
        <div className="px-5 py-3 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-2 text-left">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h2 className="text-base font-black text-slate-900">🎉 ITEM RECOVERED!</h2>
              <p className="text-[11px] text-emerald-700 font-bold">Confirm Physical Item Handoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 fill-emerald-600" />
          </div>

          <div className="bg-orange-50/70 rounded-2xl p-3 border border-orange-100 text-left text-xs space-y-1">
            <div className="font-black text-slate-800 text-xs">{item.title}</div>
            <div className="text-slate-600 font-medium">📍 Location: {item.location}</div>
            {item.finderPhone && (
              <div className="text-orange-600 font-bold">📞 Finder Contact: {item.finderPhone}</div>
            )}
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Have you successfully received your <strong className="text-slate-900 font-black">{item.title}</strong> back from the finder?
          </p>

          {/* Automatic Deletion Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-left text-[11px] text-slate-700 font-medium space-y-1">
            <div className="flex items-center space-x-1.5 font-black text-orange-900">
              <Trash2 className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Automatic Privacy Cleanup Execution:</span>
            </div>
            <p className="text-slate-700 pl-5 leading-tight font-medium">
              Clicking <strong className="text-slate-900 font-black">"YES, I GOT IT BACK"</strong> will:
            </p>
            <ul className="list-disc pl-9 text-slate-700 space-y-0.5 font-medium">
              <li>Update status to <strong className="text-emerald-700 font-bold">🟢 FOUND & CLOSED</strong></li>
              <li>Purge temporary personal contact phone numbers</li>
              <li>Clear private identifying descriptions</li>
              <li>Increment <strong className="text-emerald-700 font-bold">Total Items Found (+1)</strong></li>
            </ul>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-5 py-3 border-t border-orange-100 flex items-center justify-center space-x-2.5 shrink-0 bg-slate-50/90 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item.id)}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-100 flex items-center space-x-1.5 uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>YES, I GOT IT BACK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
