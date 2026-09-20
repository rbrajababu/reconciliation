import React, { useState } from 'react';
import { Settings2, ShieldCheck, Sparkles, Database, Users, CheckCircle2, Save } from 'lucide-react';

export const AdminControlPanelView: React.FC = () => {
  const [appName, setAppName] = useState('Reconciliation With RB');
  const [tagline, setTagline] = useState('Smart Reconciliation. Accurate Compliance. Better Control.');
  const [enableHighThinkingByDefault, setEnableHighThinkingByDefault] = useState(false);
  const [maxUploadLimitMb, setMaxUploadLimitMb] = useState(25);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
            Super Administrator Console
          </span>
          <span className="text-xs text-slate-500">System Configuration</span>
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
          Super Admin Control Panel
        </h1>
        <p className="text-xs text-slate-600">
          Global branding, multi-tenant RBAC policies, and server-side Gemini AI orchestration parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        
        {/* Branding & Platform Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Platform Branding & Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* AI & Infrastructure Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Server-Side AI & Infrastructure Parameters
          </h2>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Gemini Model Routing</span>
                <span className="text-[11px] text-slate-500">
                  Fast queries use <code>gemini-3.8-flash</code>; Deep Exception reasoning uses <code>gemini-3.1-pro-preview</code> with Thinking Budget.
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Active & Connected
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Firebase Firestore & Auth</span>
                <span className="text-[11px] text-slate-500">
                  Database: <code>ai-studio-7d7cdc5f-7412-45a2-bc60-4ff7acefbee1</code> (valiant-freehold-kdtd0)
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Rules Deployed
              </span>
            </div>

            <label className="flex items-center space-x-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableHighThinkingByDefault}
                onChange={(e) => setEnableHighThinkingByDefault(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-semibold text-slate-800">
                Default to Deep Thinking (High Thinking Budget) for all Exception Diagnoses
              </span>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          {isSaved ? (
            <span className="flex items-center text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Super Admin configurations saved!
            </span>
          ) : (
            <span className="text-slate-500">Changes take effect immediately across all sessions.</span>
          )}

          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
