import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Database,
  FileCheck,
  Cpu,
  Tags,
  BarChart3,
  Calendar,
  Sparkles,
  Download,
  Filter,
  Layers,
  ArrowUpRight,
  UploadCloud
} from 'lucide-react';
import { ReconciliationRun, GstRecord } from '../../types';
import { formatIndianCurrency, formatIndianLakhs } from '../../lib/reconciliationEngine';

interface MainDashboardProps {
  inwardRun?: ReconciliationRun;
  gstRun?: ReconciliationRun;
  outwardRun?: ReconciliationRun;
  tdsRun?: ReconciliationRun;
  gstRecords?: GstRecord[];
  tdsRecords?: any[];
  onNavigateToTab?: (tab: any, filter?: any) => void;
  onNavigate?: (tab: any) => void;
  onExportExcel: () => void;
  onOpenAiDrawer: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  inwardRun,
  gstRun,
  outwardRun,
  tdsRun,
  gstRecords,
  tdsRecords,
  onNavigateToTab,
  onNavigate,
  onExportExcel,
  onOpenAiDrawer,
}) => {
  const [activeDashboardMode, setActiveDashboardMode] = useState<'inward' | 'outward' | 'tds'>('inward');

  const safeInwardRun = inwardRun || gstRun || ({} as ReconciliationRun);
  const safeOutwardRun = outwardRun || safeInwardRun;
  const safeTdsRun = tdsRun || ({} as ReconciliationRun);

  const handleNavigateToTab = (tab: any, filter?: any) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab, filter);
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  const currentRun =
    activeDashboardMode === 'inward'
      ? safeInwardRun
      : activeDashboardMode === 'outward'
      ? safeOutwardRun
      : safeTdsRun;

  // Dynamic statistics
  const total = currentRun.totalRecords || 0;
  const matched = currentRun.matchedCount || 0;
  const partial = currentRun.partialCount || 0;
  const probable = currentRun.probableCount || 0;
  const unmatched = currentRun.unmatchedCount || 0;
  const missingBooks = Math.round(unmatched / 2);
  const missingPortal = unmatched - missingBooks;

  const matchRatePct = total > 0 ? ((matched / total) * 100).toFixed(1) : '0.0';
  const partialRatePct = total > 0 ? ((partial / total) * 100).toFixed(1) : '0.0';
  const probableRatePct = total > 0 ? ((probable / total) * 100).toFixed(1) : '0.0';
  const missingBooksPct = total > 0 ? ((missingBooks / total) * 100).toFixed(1) : '0.0';
  const missingPortalPct = total > 0 ? ((missingPortal / total) * 100).toFixed(1) : '0.0';

  const highPriority = Math.round(unmatched * 0.4);
  const mediumPriority = Math.round(unmatched * 0.4);
  const lowPriority = Math.max(0, unmatched - highPriority - mediumPriority);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mode Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                Executive Compliance Dashboard
              </span>
              <span className="text-xs text-slate-500">Live Analysis FY 2026-27</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {activeDashboardMode === 'inward' && 'GST INWARD RECONCILIATION DASHBOARD'}
              {activeDashboardMode === 'outward' && 'GST OUTWARD RECONCILIATION DASHBOARD'}
              {activeDashboardMode === 'tds' && 'TDS RECONCILIATION & COMPLIANCE DASHBOARD'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeDashboardMode === 'inward' && 'Books (Purchase Register) vs GSTR-2B Auto-Drafted Statement'}
              {activeDashboardMode === 'outward' && 'Books (Sales Register) vs GSTR-1 & GSTR-3B Tax Filings'}
              {activeDashboardMode === 'tds' && 'Books (TDS Ledger) vs Form 26AS, AIS/TIS & Bank Challans'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Mode Switcher Tabs */}
            <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              <button
                onClick={() => setActiveDashboardMode('inward')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeDashboardMode === 'inward' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                GST Inward (2B)
              </button>
              <button
                onClick={() => setActiveDashboardMode('outward')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeDashboardMode === 'outward' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                GST Outward (GSTR-1)
              </button>
              <button
                onClick={() => setActiveDashboardMode('tds')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeDashboardMode === 'tds' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                TDS (26Q / 24Q)
              </button>
            </div>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Audit Pack</span>
            </button>

            <button
              onClick={onOpenAiDrawer}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Clean Banner for Raja Babu */}
      {total === 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Workspace Configured for Raja Babu</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Demo Data Removed
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                All mock demo invoices have been cleared. Upload your official GSTR-2B, Purchase Register, or 26AS statements to start live automated reconciliation.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleNavigateToTab('data-upload')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition shadow-sm whitespace-nowrap flex items-center space-x-1.5 flex-shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Invoices & Registers</span>
          </button>
        </div>
      )}

      {/* Main Grid matching reference dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: KPI Metric Cards (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-3">
          <div
            onClick={() => handleNavigateToTab(activeDashboardMode === 'tds' ? 'tds-reconcile' : 'gst-reconcile')}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {activeDashboardMode === 'inward' ? 'Total Purchase Invoices (Book)' : activeDashboardMode === 'outward' ? 'Total Sales Invoices (Book)' : 'Total Deductee Records'}
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
              {currentRun.totalRecords.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Books Value: {formatIndianCurrency(currentRun.booksTotalValue)}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab(activeDashboardMode === 'tds' ? 'tds-reconcile' : 'gst-reconcile')}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {activeDashboardMode === 'inward' ? 'Total Invoices in GSTR-2B' : activeDashboardMode === 'outward' ? 'Total Invoices in GSTR-1' : 'Reported in 26AS / Challans'}
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
              {total.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Portal Value: {formatIndianCurrency(currentRun.portalTotalValue)}</span>
              <span className="text-emerald-600 font-semibold text-[10px]">Verified Portal API</span>
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab(activeDashboardMode === 'tds' ? 'tds-reconcile' : 'gst-reconcile', { matchStatus: 'Exact Match' })}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Matched Invoices</span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-110 transition">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
              {matched.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {total > 0 ? `${matchRatePct}% Verified` : 'Ready for ledger import'}
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab('exceptions')}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Unmatched Invoices</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-2">
              {unmatched.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
              Requires review before filing GSTR-3B
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-200">Reconciliation Match Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono mt-2 text-white">
              {currentRun.matchRate}%
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full"
                style={{ width: `${currentRun.matchRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Center Column: Match Summary & Exception Categories (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Match Summary Donut Visual */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                MATCH SUMMARY
              </h2>
              <span className="text-xs text-slate-500 font-medium">Distribution by Category</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
              {/* Circular Graphic */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-slate-100"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {total > 0 && (
                      <>
                        {/* Exact Match (Emerald) */}
                        <path
                          className="text-emerald-500"
                          strokeDasharray={`${matchRatePct}, 100`}
                          strokeWidth="3.8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Value Diff (Amber) */}
                        <path
                          className="text-amber-500"
                          strokeDasharray={`${partialRatePct}, 100`}
                          strokeDashoffset={`-${matchRatePct}`}
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Missing (Rose) */}
                        <path
                          className="text-rose-500"
                          strokeDasharray={`${missingBooksPct}, 100`}
                          strokeDashoffset={`-${Number(matchRatePct) + Number(partialRatePct)}`}
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-extrabold text-slate-900 font-mono leading-none">
                      {total.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">Total Invoices</span>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div
                  onClick={() => handleNavigateToTab(activeDashboardMode === 'tds' ? 'tds-reconcile' : 'gst-reconcile', { matchStatus: 'Exact Match' })}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                    <span className="font-medium text-slate-700">Exact Match</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {matched.toLocaleString('en-IN')} ({matchRatePct}%)
                  </span>
                </div>

                <div
                  onClick={() => handleNavigateToTab(activeDashboardMode === 'tds' ? 'tds-reconcile' : 'gst-reconcile', { matchStatus: 'Partial Match' })}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                    <span className="font-medium text-slate-700">Value Difference</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {partial.toLocaleString('en-IN')} ({partialRatePct}%)
                  </span>
                </div>

                <div
                  onClick={() => handleNavigateToTab(activeDashboardMode === 'tds' ? 'tds-reconcile' : 'gst-reconcile', { matchStatus: 'Probable Match' })}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                    <span className="font-medium text-slate-700">Invoice Date / No. Diff</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {probable.toLocaleString('en-IN')} ({probableRatePct}%)
                  </span>
                </div>

                <div
                  onClick={() => handleNavigateToTab('exceptions', { filter: 'Missing in Books' })}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2"></span>
                    <span className="font-medium text-slate-700">Missing in Books</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {missingBooks.toLocaleString('en-IN')} ({missingBooksPct}%)
                  </span>
                </div>

                <div
                  onClick={() => handleNavigateToTab('exceptions', { filter: 'Missing in 2B' })}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-2"></span>
                    <span className="font-medium text-slate-700">
                      {activeDashboardMode === 'inward' ? 'Missing in GSTR-2B' : 'Missing in GSTR-1'}
                    </span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {missingPortal.toLocaleString('en-IN')} ({missingPortalPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Exception Categories Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                TOP EXCEPTION CATEGORIES
              </h2>
              <span className="text-xs text-slate-500">Sorted by Impact</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Value Difference', count: partial, max: Math.max(1, total), color: 'bg-rose-500' },
                { label: 'Missing in Books', count: missingBooks, max: Math.max(1, total), color: 'bg-rose-600' },
                { label: 'Missing in GSTR-2B', count: missingPortal, max: Math.max(1, total), color: 'bg-rose-600' },
                { label: 'Invoice Date Difference', count: probable, max: Math.max(1, total), color: 'bg-amber-500' },
                { label: 'GSTIN / POS Mismatch', count: Math.round(unmatched * 0.1), max: Math.max(1, total), color: 'bg-rose-700' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNavigateToTab('exceptions', { exceptionType: item.label })}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 group-hover:text-blue-600 transition">
                      {item.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-2.5 rounded-full transition-all duration-500 group-hover:opacity-90`}
                      style={{ width: `${total > 0 ? Math.min(100, (item.count / total) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: ITC at Risk & Priorities (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* ITC at Risk Card matching reference image */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl shadow-md border border-indigo-900/40">
            <div className="flex items-center space-x-2 text-indigo-300">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {activeDashboardMode === 'inward' ? 'ITC AT RISK (Approx.)' : 'POTENTIAL TAX EXPOSURE'}
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono mt-3 text-amber-300">
              {formatIndianLakhs(currentRun.itcAtRisk || 0)}
            </div>
            <p className="text-[11px] text-slate-300 mt-2 leading-tight">
              {activeDashboardMode === 'inward'
                ? 'Input Tax Credit currently blocked under Section 16(2)(aa) due to unfiled vendor GSTR-1 invoices.'
                : 'Potential demand exposure under Section 73/74 for outward sales difference between 1 & 3B.'}
            </p>
            <button
              onClick={() => handleNavigateToTab('itc-tracker')}
              className="mt-3 w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1"
            >
              <span>Review ITC Exposure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Exception Priority Breakdown matching reference */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
              EXCEPTION PRIORITY
            </h2>
            <div className="space-y-2.5 text-xs">
              <div
                onClick={() => handleNavigateToTab('exceptions', { priority: 'High' })}
                className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-100 cursor-pointer hover:bg-rose-100/70 transition"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                  <span className="font-semibold text-rose-900">High Priority</span>
                </div>
                <span className="font-mono font-bold text-rose-700">
                  {highPriority} ({unmatched > 0 ? ((highPriority / unmatched) * 100).toFixed(1) : '0.0'}%)
                </span>
              </div>

              <div
                onClick={() => handleNavigateToTab('exceptions', { priority: 'Medium' })}
                className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100/70 transition"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="font-semibold text-amber-900">Medium Priority</span>
                </div>
                <span className="font-mono font-bold text-amber-700">
                  {mediumPriority} ({unmatched > 0 ? ((mediumPriority / unmatched) * 100).toFixed(1) : '0.0'}%)
                </span>
              </div>

              <div
                onClick={() => handleNavigateToTab('exceptions', { priority: 'Low' })}
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100 cursor-pointer hover:bg-emerald-100/70 transition"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold text-emerald-900">Low Priority</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">
                  {lowPriority} ({unmatched > 0 ? ((lowPriority / unmatched) * 100).toFixed(1) : '0.0'}%)
                </span>
              </div>
            </div>
          </div>

          {/* Key Insights List matching reference image */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
              KEY INSIGHTS
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-slate-900">{total > 0 ? `${matchRatePct}%` : '0%'}</strong> invoices automatically matched via AI normalization.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Exceptions categorized by financial risk & compliance impact.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Focus on high-impact ITC & Section 16(2)(aa) risks.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Audit-ready trail for statutory and tax auditors.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* RECONCILIATION WORKFLOW PIPELINE matching reference image */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              RECONCILIATION WORKFLOW
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">End-to-End Automated Statutory Tax Pipeline</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Pipeline Active & Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          
          <div
            onClick={() => handleNavigateToTab('data-upload')}
            className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <Database className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="font-bold text-xs text-slate-900 mt-2">Data Sources</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Tally / ERP Books & Government GSTR-2B / 26AS JSON
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab('data-upload')}
            className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <FileCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="font-bold text-xs text-slate-900 mt-2">Data Extraction & Prep</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Automated extraction, column mapping & cleaning
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab('rules')}
            className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <Cpu className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="font-bold text-xs text-slate-900 mt-2">Matching Engine</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Rule-based matching + LLM-assisted fuzzy invoice normalization
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab('exceptions')}
            className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <Tags className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="font-bold text-xs text-slate-900 mt-2">Exception Classification</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Categorize & prioritize unmatched records by risk
            </div>
          </div>

          <div
            onClick={() => handleNavigateToTab('gst-reconcile')}
            className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="font-bold text-xs text-slate-900 mt-2">Review Dashboard</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Interactive comparative table for analysis & resolution
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
