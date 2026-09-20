import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GstRecord, TdsRecord, ReconciliationRun } from '../../types';

interface ReportsCenterViewProps {
  onExportGstExcel: () => void;
  onExportTdsExcel: () => void;
  onExportGstCsv: () => void;
  onExportTdsCsv: () => void;
  gstRun: ReconciliationRun;
  tdsRun: ReconciliationRun;
}

export const ReportsCenterView: React.FC<ReportsCenterViewProps> = ({
  onExportGstExcel,
  onExportTdsExcel,
  onExportGstCsv,
  onExportTdsCsv,
  gstRun,
  tdsRun,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                Statutory Export Center
              </span>
              <span className="text-xs text-slate-500">Excel / CSV / Printable</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Audit-Ready Reports & Excel Automation
            </h1>
            <p className="text-xs text-slate-600">
              Generate structured, multi-worksheet spreadsheets with calculated difference columns for management and statutory tax auditors.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* Report 1: GST Inward Audit Pack */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-blue-300 transition">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Multi-Sheet .xlsx
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              GST Inward Reconciliation Audit Pack
            </h2>
            <p className="text-slate-500 mt-1">
              Complete workbook containing Executive Summary, All Invoices, Exceptions with variance breakdowns, and Missing in 2B action items.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 font-mono">Period: {gstRun.period}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onExportGstCsv}
                className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-slate-700 transition"
              >
                CSV
              </button>
              <button
                onClick={onExportGstExcel}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report 2: TDS Statutory Audit Pack */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-blue-300 transition">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Multi-Sheet .xlsx
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              TDS 26Q / 24Q Reconciliation Pack
            </h2>
            <p className="text-slate-500 mt-1">
              Detailed deduction schedule comparing books deductions against 26AS/Challans, highlighting Section 206AA breaches and short deductions.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 font-mono">Period: {tdsRun.period}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onExportTdsCsv}
                className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-slate-700 transition"
              >
                CSV
              </button>
              <button
                onClick={onExportTdsExcel}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Certificate Printable View Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-800 space-y-4">
        <div className="text-center border-b border-slate-200 pb-4">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Internal Statutory Compliance Certificate
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-1">
            RECONCILIATION WITH RB - AUDIT SUMMARY NOTE
          </h2>
          <p className="text-xs text-slate-500">
            Prepared for Statutory Audit & Board Compliance Review | Period: {gstRun.period}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 text-[10px] block">Total Invoices:</span>
            <span className="font-bold text-slate-900">{gstRun.totalRecords}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Overall Match Rate:</span>
            <span className="font-bold text-emerald-700">{gstRun.matchRate}%</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">ITC At Risk:</span>
            <span className="font-bold text-amber-700">₹ 32.47 L</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Compliance Status:</span>
            <span className="font-bold text-blue-700">Audit Ready</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed italic text-center">
          &ldquo;All records processed through the RB Tax Reconciliation Engine adhere to CGST Section 16(2)(aa) and relevant Income Tax circulars. Supporting audit logs and comparative workbooks are archived with cryptographic timestamps.&rdquo;
        </p>
      </div>

    </div>
  );
};
