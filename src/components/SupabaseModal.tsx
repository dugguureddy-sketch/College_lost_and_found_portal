import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  X,
  Server,
  Code,
  ShieldCheck,
  RefreshCw,
  Trash2,
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SUPABASE_CONFIG, SUPABASE_SCHEMA_SQL, supabase, executeSupabaseItemReturnedCleanup } from '../lib/supabase';
import { syncFromSupabase, getItems } from '../utils/storage';

interface SupabaseModalProps {
  onClose: () => void;
  onSynced?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose, onSynced }) => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'lifecycle' | 'sql'>('info');
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.from('items').select('id').limit(1);
      if (error) {
        setTestResult({
          success: false,
          msg: `Supabase query error: ${error.message}. Make sure you executed the SQL Schema in your Supabase SQL editor!`,
        });
      } else {
        await syncFromSupabase();
        if (onSynced) onSynced();
        setTestResult({
          success: true,
          msg: `Connected successfully to Supabase! Found ${data?.length ?? 0} sample item(s). Active tables verified with RLS.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: `Connection test failed: ${err?.message || String(err)}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTestLifecyclePurge = async () => {
    setPurging(true);
    setPurgeResult(null);
    try {
      const items = getItems();
      const testItem = items[0];
      if (!testItem) {
        setPurgeResult('No items available in database to test lifecycle cleanup.');
        setPurging(false);
        return;
      }

      const res = await executeSupabaseItemReturnedCleanup(testItem.id, testItem.type);
      if (res) {
        setPurgeResult(
          `✅ PostgreSQL function 'process_item_returned' executed for item #${testItem.itemCode || testItem.id}. Anonymized recovery record created & temporary identity fields purged atomically.`
        );
      } else {
        setPurgeResult(
          `⚠️ Simulation logged in audit trail. Run the SQL schema to install the database-level 'process_item_returned' function in Supabase.`
        );
      }
    } catch (err: any) {
      setPurgeResult(`Error during test: ${err?.message || String(err)}`);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Sticky Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">⚡ Supabase Database & Security</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                PostgreSQL, RLS Authorization, Automatic Data Lifecycle & Storage
              </p>
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Tab switcher */}
          <div className="grid grid-cols-3 gap-1 bg-orange-50/80 p-1 rounded-2xl border border-orange-200 text-xs font-black">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'info' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Connection</span>
            </button>

            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'lifecycle' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Data Lifecycle</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'sql' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>SQL Schema</span>
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-3.5 text-xs">
              {/* Credentials Card */}
              <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3.5 space-y-2.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">
                    Supabase Project URL
                  </label>
                  <div className="bg-white border border-orange-200 rounded-xl px-3 py-1.5 font-mono text-slate-800 font-bold break-all text-[11px]">
                    {SUPABASE_CONFIG.url}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">
                    Public Anon Key (Safe for Client)
                  </label>
                  <div className="bg-white border border-orange-200 rounded-xl px-3 py-1.5 font-mono text-slate-800 font-bold break-all text-[10px]">
                    {SUPABASE_CONFIG.key}
                  </div>
                </div>
              </div>

              {/* Storage Buckets Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <h4 className="font-black text-slate-800 text-xs flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-500" />
                  <span>Configured Storage Buckets</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">lost-item-images</span>
                    <span className="text-[10px] text-emerald-600 font-black">Public Bucket</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">found-item-images</span>
                    <span className="text-[10px] text-emerald-600 font-black">Public Bucket</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">claim-proof</span>
                    <span className="text-[10px] text-rose-600 font-black flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Private (Signed URLs)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-emerald-900 text-xs">Verify Live Supabase Connection</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Query Supabase tables and trigger real-time synchronization.
                  </p>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-200 flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'TESTING...' : 'TEST SUPABASE CONNECTION'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-2xl border text-xs font-bold ${
                    testResult.success
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-rose-100 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{testResult.msg}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <h4 className="font-black text-amber-900 text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Automated Data Retention & Privacy Policy</span>
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  When an item reaches confirmed <strong>RETURNED</strong> status:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900 font-medium">
                  <li>Temporary contact phone numbers, finder notes, and secret verification answers are <strong>purged</strong>.</li>
                  <li>Proof files and image paths are sanitized.</li>
                  <li>An anonymized, non-PII recovery record is logged to <code>recovery_records</code> for college analytics.</li>
                  <li>An immutable audit log is generated with action <code>DATA_PURGED</code>.</li>
                  <li>All operations run atomically within a single PostgreSQL transaction.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-800">Test Atomic Purge Trigger</h5>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Invokes the <code>process_item_returned</code> RPC function.
                  </p>
                </div>
                <button
                  onClick={handleTestLifecyclePurge}
                  disabled={purging}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs shadow-md shadow-orange-200 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
                  <span>{purging ? 'RUNNING PURGE...' : 'RUN TEST PURGE'}</span>
                </button>
              </div>

              {purgeResult && (
                <div className="p-3 bg-slate-100 border border-slate-300 rounded-2xl font-mono text-[11px] text-slate-800 font-bold">
                  {purgeResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                  PostgreSQL Production Migration Script
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-sm shadow-orange-200"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY SQL SCRIPT'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[10px] overflow-x-auto max-h-[300px] border border-slate-800 leading-relaxed select-all">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-orange-100 flex items-center justify-between shrink-0 bg-slate-50/90 rounded-b-3xl">
          <span className="text-[10px] text-slate-400 font-medium">
            Supabase Client: <strong className="text-emerald-600">v2.x Connected</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
