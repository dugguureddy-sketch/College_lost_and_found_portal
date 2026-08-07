import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, X, Server, Code, ShieldCheck, RefreshCw } from 'lucide-react';
import { SUPABASE_CONFIG, SUPABASE_SCHEMA_SQL, supabase } from '../lib/supabase';
import { syncFromSupabase } from '../utils/storage';

interface SupabaseModalProps {
  onClose: () => void;
  onSynced?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose, onSynced }) => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'sql'>('info');

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
          msg: `Supabase returned error: ${error.message}. Make sure you ran the SQL Schema in your Supabase SQL editor!`,
        });
      } else {
        await syncFromSupabase();
        if (onSynced) onSynced();
        setTestResult({
          success: true,
          msg: `Connected successfully to Supabase! Found ${data?.length ?? 0} sample item(s) in database table. Data synced!`,
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
                <h2 className="text-base sm:text-lg font-black text-slate-900">⚡ Supabase Database Integration</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Connected to cloud Supabase tables for real-time lost & found persistence.
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
          <div className="flex space-x-2 bg-orange-50/80 p-1 rounded-2xl border border-orange-200 text-xs font-black">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'info'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Connection Details & Test</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'sql'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>SQL Schema Script</span>
            </button>
          </div>

          {activeTab === 'info' ? (
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
                    Public API Key / Anon Key
                  </label>
                  <div className="bg-white border border-orange-200 rounded-xl px-3 py-1.5 font-mono text-slate-800 font-bold break-all text-[10px]">
                    {SUPABASE_CONFIG.key}
                  </div>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-emerald-900 text-xs">Verify Live Supabase Connection</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Test query to Supabase `items` table and trigger state sync.
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
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-600 font-medium">
                  Copy and run this SQL script in your <strong>Supabase Dashboard &rarr; SQL Editor</strong>:
                </p>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs flex items-center space-x-1 shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED!' : 'COPY SQL'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl text-[10px] font-mono max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-orange-100 flex justify-end shrink-0 bg-slate-50/90 rounded-b-3xl">
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
