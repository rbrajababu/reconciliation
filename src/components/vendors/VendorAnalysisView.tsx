import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Building,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { GstRecord } from '../../types';
import { formatIndianCurrency } from '../../lib/reconciliationEngine';

interface VendorAnalysisViewProps {
  records: GstRecord[];
  companyName: string;
  companyGstin: string;
}

export const VendorAnalysisView: React.FC<VendorAnalysisViewProps> = ({
  records,
  companyName,
  companyGstin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Group records by vendor GSTIN
  const vendorScorecards = useMemo(() => {
    const map = new Map<string, any>();

    records.forEach((r) => {
      const gstin = r.supplierGstin || 'UNKNOWN';
      if (!map.has(gstin)) {
        map.set(gstin, {
          gstin,
          name: r.supplierName,
          totalInvoices: 0,
          matchedCount: 0,
          unmatchedCount: 0,
          itcAtRisk: 0,
          invoices: [],
        });
      }
      const item = map.get(gstin);
      item.totalInvoices++;
      if (r.matchStatus === 'Exact Match') {
        item.matchedCount++;
      } else {
        item.unmatchedCount++;
        item.itcAtRisk += r.itcAtRiskAmount;
      }
      item.invoices.push(r);
    });

    return Array.from(map.values()).sort((a, b) => b.itcAtRisk - a.itcAtRisk);
  }, [records]);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendorScorecards;
    const q = searchQuery.toLowerCase();
    return vendorScorecards.filter((v) =>
      v.name.toLowerCase().includes(q) || v.gstin.toLowerCase().includes(q)
    );
  }, [vendorScorecards, searchQuery]);

  const handleGenerateNotice = (vendor: any) => {
    setSelectedVendor(vendor);
    const missingInvoices = vendor.invoices.filter((i: GstRecord) => i.matchStatus !== 'Exact Match');

    const invoiceTableStr = missingInvoices.map((i: GstRecord) => 
      `- Inv No: ${i.invoiceNumber} | Date: ${i.invoiceDate} | Taxable: ${formatIndianCurrency(i.booksTaxable)} | Tax: ${formatIndianCurrency(i.booksTotalTax)} | Reason: ${i.exceptionType}`
    ).join('\n');

    const notice = `To:
Accounts & Taxation Department
${vendor.name}
GSTIN: ${vendor.gstin}

Subject: Urgent: Non-Reflection / Variance of Purchase Invoices in GSTR-2B for FY 2026-27

Dear Accounts Team,

We are writing from the Finance & Taxation Department of ${companyName} (GSTIN: ${companyGstin}).

During our monthly GST reconciliation for the period April 2026, we observed that the following purchase invoices booked in our accounting records are either missing or have discrepancies in your GSTR-1 return, and consequently are not reflected in our auto-drafted GSTR-2B statement:

${invoiceTableStr}

Total Input Tax Credit (ITC) currently blocked: ${formatIndianCurrency(vendor.itcAtRisk)}

As you are aware, pursuant to Section 16(2)(aa) of the CGST Act 2017 read with Rule 36(4), we are legally prohibited from availing Input Tax Credit on invoices not reflected in GSTR-2B. This is resulting in working capital blockage and potential tax exposure for our organization.

We kindly request you to:
1. Verify if these invoices have been filed in your monthly GSTR-1 return under our correct GSTIN (${companyGstin}).
2. If omitted, please furnish them in your upcoming GSTR-1 or file an amendment table 9A/9B.
3. Share the ARN of the filed return or payment voucher.

Your prompt action prior to the upcoming monthly return filing deadline will be highly appreciated.

Sincerely,
Accounts & Taxation Department
${companyName}
GSTIN: ${companyGstin}`;

    setGeneratedLetter(notice);
  };

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
            Supplier Compliance & Vendor Rating
          </span>
          <span className="text-xs text-slate-500">ITC Recovery Suite</span>
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
          Vendors & Deductees Compliance Scorecard
        </h1>
        <p className="text-xs text-slate-600">
          Rank vendors by filing reliability, identify recurring invoice format errors, and dispatch automated follow-up notices.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors by trade name or GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
          />
        </div>
        <span className="text-slate-500">
          Total Vendors Analyzed: <strong className="text-slate-800">{vendorScorecards.length}</strong>
        </span>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">Supplier Name & GSTIN</th>
                <th className="py-3 px-3 text-center">Total Invoices</th>
                <th className="py-3 px-3 text-center">Matched</th>
                <th className="py-3 px-3 text-center">Unmatched</th>
                <th className="py-3 px-3 text-center">Compliance Rating</th>
                <th className="py-3 px-3 text-right">ITC At Risk (Blocked)</th>
                <th className="py-3 px-3 text-center">Follow-up Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No vendor records to display. Upload purchase registers to automatically analyze vendor compliance ratings.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => {
                  const matchRate = Number(((v.matchedCount / v.totalInvoices) * 100).toFixed(0));
                  return (
                    <tr key={v.gstin} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{v.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{v.gstin}</div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {v.totalInvoices}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-emerald-600 font-bold">
                      {v.matchedCount}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-rose-600 font-bold">
                      {v.unmatchedCount}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          matchRate >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : matchRate >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {matchRate}% Match Rate
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {v.itcAtRisk > 0 ? (
                        <span className="text-rose-600">{formatIndianCurrency(v.itcAtRisk)}</span>
                      ) : (
                        <span className="text-emerald-600">₹0.00</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {v.unmatchedCount > 0 ? (
                        <button
                          onClick={() => handleGenerateNotice(v)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition inline-flex items-center space-x-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Generate Follow-Up Notice</span>
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-medium flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Generated Letter Modal */}
      {selectedVendor && generatedLetter && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Vendor Communication Engine
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  Draft Notice: {selectedVendor.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready to copy and send via Email or Official Letterhead:
                </span>
                <button
                  onClick={handleCopyNotice}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNotice ? 'Copied to Clipboard!' : 'Copy Entire Notice'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={generatedLetter}
                rows={16}
                className="w-full font-mono text-xs p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
