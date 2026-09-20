import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { GstRecord } from '../../types';
import { formatIndianCurrency, formatIndianLakhs } from '../../lib/reconciliationEngine';

interface ItcDashboardViewProps {
  records: GstRecord[];
  onExportExcel: () => void;
}

export const ItcDashboardView: React.FC<ItcDashboardViewProps> = ({
  records,
  onExportExcel,
}) => {
  // Aggregate ITC numbers
  const totalBooksItc = records.reduce((acc, r) => acc + r.booksTotalTax, 0);
  const totalPortal2bItc = records.reduce((acc, r) => acc + r.portalTotalTax, 0);

  const eligibleMatchedItc = records
    .filter((r) => r.matchStatus === 'Exact Match' && r.itcEligibility === 'Eligible')
    .reduce((acc, r) => acc + r.booksTotalTax, 0);

  const blockedCredit17_5 = records
    .filter((r) => r.itcEligibility === 'Ineligible - Sec 17(5)')
    .reduce((acc, r) => acc + (r.booksTotalTax || r.portalTotalTax), 0);

  const pending16_2_aa = records
    .filter((r) => r.matchStatus === 'Missing in 2B' || r.itcEligibility === 'Pending - Sec 16(2)(aa)')
    .reduce((acc, r) => acc + r.booksTotalTax, 0);

  const reversalRequired = records
    .filter((r) => r.itcEligibility === 'Reversal Required')
    .reduce((acc, r) => acc + r.booksTotalTax, 0);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                Statutory ITC Audit
              </span>
              <span className="text-xs text-slate-500">CGST Section 16 & 17</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Input Tax Credit (ITC) Risk Center
            </h1>
            <p className="text-xs text-slate-600">
              Ensure 100% compliance with Section 16(2)(aa) & identify blocked credits under Section 17(5).
            </p>
          </div>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export ITC Compliance Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Available in Books */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-600">Total ITC in Books</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {formatIndianCurrency(totalBooksItc)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Purchase Register Total</span>
        </div>

        {/* Matched & Eligible */}
        <div className="p-4 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-xs font-semibold text-emerald-800">Eligible Matched ITC</span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatIndianCurrency(eligibleMatchedItc)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready for GSTR-3B Table 4(A)(5)
          </span>
        </div>

        {/* Pending under Sec 16(2)(aa) */}
        <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs font-semibold text-amber-800">Pending - Sec 16(2)(aa)</span>
          <div className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            {formatIndianCurrency(pending16_2_aa)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Awaiting Supplier GSTR-1
          </span>
        </div>

        {/* Blocked under Sec 17(5) */}
        <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <span className="text-xs font-semibold text-rose-800">Blocked Credit - Sec 17(5)</span>
          <div className="text-xl font-extrabold text-rose-700 font-mono mt-1">
            {formatIndianCurrency(blockedCredit17_5)}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Report in Table 4(B)(1) Ineligible
          </span>
        </div>

      </div>

      {/* Statutory Guidance Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md">
        <div className="flex items-center space-x-2 text-blue-300">
          <Info className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Statutory Framework for Input Tax Credit under CGST Act
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <strong className="text-white block font-semibold">Section 16(2)(aa) - Strict Mandate:</strong>
            <p className="mt-1 text-slate-400 leading-relaxed">
              No registered person is entitled to ITC unless the details of the invoice or debit note have been furnished by the supplier in GSTR-1 and communicated in GSTR-2B.
            </p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <strong className="text-white block font-semibold">Section 17(5) - Blocked Credits:</strong>
            <p className="mt-1 text-slate-400 leading-relaxed">
              ITC is permanently blocked on motor vehicles for personal use, food and beverage, outdoor catering, health insurance, works contract for immovable property, and lost/written off goods.
            </p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <strong className="text-white block font-semibold">Rule 37 - 180 Days Reversal:</strong>
            <p className="mt-1 text-slate-400 leading-relaxed">
              If payment to the vendor (value + tax) is not made within 180 days from invoice date, proportionate ITC along with interest under Section 50 must be reversed in GSTR-3B.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
