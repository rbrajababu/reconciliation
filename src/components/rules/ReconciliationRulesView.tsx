import React, { useState } from 'react';
import { Sliders, CheckCircle2, Shield, Sparkles, RefreshCw, Save } from 'lucide-react';
import { ReconciliationRules } from '../../types';

interface ReconciliationRulesViewProps {
  rules: ReconciliationRules;
  onSaveRules: (updatedRules: ReconciliationRules) => void;
}

export const ReconciliationRulesView: React.FC<ReconciliationRulesViewProps> = ({
  rules,
  onSaveRules,
}) => {
  const [formData, setFormData] = useState<ReconciliationRules>(rules);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
            Configurable Matching Thresholds
          </span>
          <span className="text-xs text-slate-500">Engine Parameters</span>
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
          Reconciliation & Matching Rules Engine
        </h1>
        <p className="text-xs text-slate-600">
          Fine-tune tolerance windows, normalization expressions, and auto-approval criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        
        {/* Tolerance Thresholds Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Tolerance Windows & Round-off Limits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Date Tolerance (± Days)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.dateToleranceDays}
                onChange={(e) => setFormData({ ...formData, dateToleranceDays: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Accounts for bill booking timing differences (e.g. 5 days).
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Taxable Value Tolerance (₹)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.amountToleranceRupees}
                onChange={(e) => setFormData({ ...formData, amountToleranceRupees: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Permits paise round-off variances (e.g. ₹1.00).
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tax Amount Tolerance (₹)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={formData.taxToleranceRupees}
                onChange={(e) => setFormData({ ...formData, taxToleranceRupees: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tax head penny round-off tolerance (e.g. ₹0.50).
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Number Normalization Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Invoice Number Cleansing & Fuzzy Matching
          </h2>

          <div className="space-y-3">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ignoreSpecialChars}
                onChange={(e) => setFormData({ ...formData, ignoreSpecialChars: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-800">Strip Special Characters & Delimiters</span>
                <p className="text-[11px] text-slate-500">
                  Removes slashes, hyphens, and spaces. For example: `INV/2026/012` matches `INV2026012`.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ignoreLeadingZeros}
                onChange={(e) => setFormData({ ...formData, ignoreLeadingZeros: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-800">Ignore Leading Zeros</span>
                <p className="text-[11px] text-slate-500">
                  Normalizes padded invoice numbers. For example: `000452` matches `452`.
                </p>
              </div>
            </label>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Fuzzy String Similarity Threshold: {formData.fuzzyThresholdPercent}%
              </label>
              <input
                type="range"
                min="70"
                max="99"
                value={formData.fuzzyThresholdPercent}
                onChange={(e) => setFormData({ ...formData, fuzzyThresholdPercent: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-500">
                Minimum Levenshtein / Token similarity score required to qualify as a Probable Match.
              </span>
            </div>
          </div>
        </div>

        {/* Priority & Automation Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Risk Classification & Automation Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Critical Priority Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.priorityThresholdCritical}
                onChange={(e) => setFormData({ ...formData, priorityThresholdCritical: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Discrepancies above this amount receive top-priority CA review.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                High Priority Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.priorityThresholdHigh}
                onChange={(e) => setFormData({ ...formData, priorityThresholdHigh: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoAcceptExactMatches}
                onChange={(e) => setFormData({ ...formData, autoAcceptExactMatches: e.target.checked })}
                className="rounded text-blue-600"
              />
              <div>
                <span className="font-semibold text-slate-800">Auto-Approve 100% Exact Matches</span>
                <p className="text-[11px] text-slate-500">
                  Automatically marks identical records as Resolved without manual accountant confirmation.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          {savedSuccess ? (
            <span className="flex items-center text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Rules updated and active!
            </span>
          ) : (
            <span className="text-slate-500">
              Rules apply dynamically to all future upload & matching runs.
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Rules Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
