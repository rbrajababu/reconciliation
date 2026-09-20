import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Copy,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { GstRecord, GstMatchStatus, ExceptionPriority, ResolutionStatus } from '../../types';
import { formatIndianCurrency } from '../../lib/reconciliationEngine';

interface GstReconciliationViewProps {
  records: GstRecord[];
  onUpdateRecord: (updatedRecord: GstRecord) => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onOpenAiDrawerWithQuery?: (query: string) => void;
  onOpenUpload?: () => void;
  onOpenChatWithRecord?: (record?: GstRecord) => void;
}

export const GstReconciliationView: React.FC<GstReconciliationViewProps> = ({
  records,
  onUpdateRecord,
  onExportExcel,
  onExportCsv,
  onOpenAiDrawerWithQuery,
  onOpenUpload,
  onOpenChatWithRecord,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [itcFilter, setItcFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<GstRecord | null>(null);

  // AI Explanation State for the active modal
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [enableDeepThinking, setEnableDeepThinking] = useState(false);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Tab filter
      if (activeStatusTab !== 'ALL') {
        if (activeStatusTab === 'EXACT' && r.matchStatus !== 'Exact Match') return false;
        if (activeStatusTab === 'PROBABLE' && r.matchStatus !== 'Probable Match') return false;
        if (activeStatusTab === 'PARTIAL' && r.matchStatus !== 'Partial Match') return false;
        if (activeStatusTab === 'MISSING_2B' && r.matchStatus !== 'Missing in 2B') return false;
        if (activeStatusTab === 'MISSING_BOOKS' && r.matchStatus !== 'Missing in Books') return false;
        if (activeStatusTab === 'DUPLICATE' && r.matchStatus !== 'Duplicate') return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;

      // ITC filter
      if (itcFilter !== 'ALL' && r.itcEligibility !== itcFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInv = r.invoiceNumber.toLowerCase().includes(q) || (r.portalInvoiceNumber || '').toLowerCase().includes(q);
        const matchSupplier = r.supplierName.toLowerCase().includes(q) || r.supplierGstin.toLowerCase().includes(q);
        if (!matchInv && !matchSupplier) return false;
      }

      return true;
    });
  }, [records, activeStatusTab, priorityFilter, itcFilter, searchQuery]);

  // Request AI Explanation for a selected record
  const handleExplainRecord = async (rec: GstRecord) => {
    setSelectedRecord(rec);
    setIsExplaining(true);
    setAiExplanation(null);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'GST',
          record: rec,
          enableThinking: enableDeepThinking,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAiExplanation(data);
    } catch (err) {
      console.error('Failed to get AI explanation:', err);
      setAiExplanation({
        whatHappened: `Discrepancy detected: Books Taxable is ${formatIndianCurrency(rec.booksTaxable)} while 2B Taxable is ${formatIndianCurrency(rec.portalTaxable)}. Total Tax Variance is ${formatIndianCurrency(rec.taxDiff)}.`,
        whyItHappened: 'Vendor might have entered a different value or issued a credit note not yet accounted in books.',
        actionRequired: 'Verify purchase voucher against original physical/tax invoice and follow up with vendor.',
        statutoryReference: 'Section 16(2)(aa) & Rule 36(4) of CGST Act.',
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleResolveRecord = (rec: GstRecord, newStatus: ResolutionStatus, remarks?: string) => {
    const updated: GstRecord = {
      ...rec,
      resolutionStatus: newStatus,
      remarks: remarks || rec.remarks,
      updatedAt: new Date().toISOString(),
    };
    onUpdateRecord(updated);
    if (selectedRecord && selectedRecord.id === rec.id) {
      setSelectedRecord(updated);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                GSTR-2B vs Books
              </span>
              <span className="text-xs text-slate-500">CGST Section 16(2)(aa) Aligned</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              GST Reconciliation & Comparative Analysis
            </h1>
            <p className="text-xs text-slate-600">
              Verify purchase register vouchers against GSTR-2B to maximize legitimate ITC and prevent interest under Sec 50.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenChatWithRecord && (
              <button
                onClick={() => onOpenChatWithRecord(undefined)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Launch Multi-Turn AI Chatbot for Reconciliation Assistance"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Chatbot Assistant</span>
              </button>
            )}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onExportExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Multi-Sheet Excel</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          {[
            { id: 'ALL', label: 'All Invoices', count: records.length, color: 'text-slate-700' },
            { id: 'EXACT', label: 'Exact Match', count: records.filter(r => r.matchStatus === 'Exact Match').length, color: 'text-emerald-700' },
            { id: 'PROBABLE', label: 'Probable / Format Diff', count: records.filter(r => r.matchStatus === 'Probable Match').length, color: 'text-blue-700' },
            { id: 'PARTIAL', label: 'Value / Tax Diff', count: records.filter(r => r.matchStatus === 'Partial Match').length, color: 'text-amber-700' },
            { id: 'MISSING_2B', label: 'Missing in GSTR-2B', count: records.filter(r => r.matchStatus === 'Missing in 2B').length, color: 'text-rose-700' },
            { id: 'MISSING_BOOKS', label: 'Missing in Books', count: records.filter(r => r.matchStatus === 'Missing in Books').length, color: 'text-orange-700' },
            { id: 'DUPLICATE', label: 'Duplicates', count: records.filter(r => r.matchStatus === 'Duplicate').length, color: 'text-purple-700' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                activeStatusTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeStatusTab === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, vendor name, or GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">ITC Status:</span>
            <select
              value={itcFilter}
              onChange={(e) => setItcFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All ITC Types</option>
              <option value="Eligible">Eligible</option>
              <option value="Ineligible - Sec 17(5)">Ineligible Sec 17(5)</option>
              <option value="Pending - Sec 16(2)(aa)">Pending Sec 16(2)(aa)</option>
              <option value="Reversal Required">Reversal Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Comparative Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">Invoice Details</th>
                <th className="py-3 px-3">Supplier / GSTIN</th>
                <th className="py-3 px-3 text-right">Books Taxable</th>
                <th className="py-3 px-3 text-right">2B Taxable</th>
                <th className="py-3 px-3 text-right">Books Tax</th>
                <th className="py-3 px-3 text-right">2B Tax</th>
                <th className="py-3 px-3 text-right">Variance (Diff)</th>
                <th className="py-3 px-3 text-center">Match Status</th>
                <th className="py-3 px-3 text-center">ITC Eligibility</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        No Invoices Loaded — Demo Data Removed
                      </div>
                      <div className="text-xs text-slate-500">
                        The workspace is ready for live reconciliation. Upload your purchase register and GSTR-2B to begin.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No matching reconciliation records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const hasDiff = r.taxDiff !== 0 || r.taxableDiff !== 0;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/40 transition group"
                    >
                      {/* Invoice Details */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-900">{r.invoiceNumber}</div>
                        {r.portalInvoiceNumber && r.portalInvoiceNumber !== r.invoiceNumber && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            2B: {r.portalInvoiceNumber}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">{r.invoiceDate}</div>
                      </td>

                      {/* Supplier */}
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="font-medium text-slate-900 truncate" title={r.supplierName}>
                          {r.supplierName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">{r.supplierGstin}</div>
                      </td>

                      {/* Books Taxable */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                        {formatIndianCurrency(r.booksTaxable)}
                      </td>

                      {/* 2B Taxable */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                        {formatIndianCurrency(r.portalTaxable)}
                      </td>

                      {/* Books Tax */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatIndianCurrency(r.booksTotalTax)}
                      </td>

                      {/* 2B Tax */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatIndianCurrency(r.portalTotalTax)}
                      </td>

                      {/* Variance */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {hasDiff ? (
                          <span className={`font-bold ${r.taxDiff > 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                            {formatIndianCurrency(r.taxDiff)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">₹0.00</span>
                        )}
                      </td>

                      {/* Match Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.matchStatus === 'Exact Match'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : r.matchStatus === 'Probable Match'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : r.matchStatus === 'Partial Match'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : r.matchStatus === 'Missing in 2B'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : r.matchStatus === 'Missing in Books'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {r.matchStatus}
                        </span>
                      </td>

                      {/* ITC Eligibility */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            r.itcEligibility === 'Eligible'
                              ? 'bg-slate-100 text-slate-700'
                              : r.itcEligibility === 'Ineligible - Sec 17(5)'
                              ? 'bg-rose-100 text-rose-700 font-bold'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.itcEligibility}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            r.priority === 'Critical'
                              ? 'bg-rose-600 text-white'
                              : r.priority === 'High'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : r.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedRecord(r);
                              setAiExplanation(null);
                            }}
                            title="Side-by-Side Comparison"
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExplainRecord(r)}
                            title="Ask AI to Explain Discrepancy"
                            className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          {onOpenChatWithRecord && (
                            <button
                              onClick={() => onOpenChatWithRecord(r)}
                              title="Chat with Gemini Chatbot about this invoice"
                              className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {r.resolutionStatus !== 'Resolved' && (
                            <button
                              onClick={() => handleResolveRecord(r, 'Resolved')}
                              title="Mark Resolved"
                              className="p-1 rounded hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> of{' '}
            <strong className="text-slate-800">{records.length}</strong> reconciled records
          </span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Exact
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Probable
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span> Value Diff
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span> Missing 2B
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison & AI Explanation Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Side-by-Side Comparative Audit
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {selectedRecord.invoiceNumber}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedRecord.supplierName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              
              {/* Comparative Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Books Data Card */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200 text-blue-900 font-bold">
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1.5 text-blue-600" />
                      Books (Purchase Register)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Source: Tally Prime
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px]">Invoice Number:</span>
                      <p className="font-mono font-semibold text-slate-900">{selectedRecord.invoiceNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Invoice Date:</span>
                      <p className="font-medium text-slate-900">{selectedRecord.invoiceDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Supplier GSTIN:</span>
                      <p className="font-mono font-semibold text-slate-900">{selectedRecord.supplierGstin}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Document Type:</span>
                      <p className="font-medium text-slate-900">{selectedRecord.documentType}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-blue-200/80 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxable Value:</span>
                      <span className="font-semibold text-slate-900">{formatIndianCurrency(selectedRecord.booksTaxable)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>IGST:</span>
                      <span>{formatIndianCurrency(selectedRecord.booksIgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>CGST:</span>
                      <span>{formatIndianCurrency(selectedRecord.booksCgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SGST:</span>
                      <span>{formatIndianCurrency(selectedRecord.booksSgst)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-blue-200 font-bold text-blue-900">
                      <span>Total Invoice Value:</span>
                      <span>{formatIndianCurrency(selectedRecord.booksTotalValue)}</span>
                    </div>
                  </div>
                </div>

                {/* GSTR-2B Statement Card */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200 text-emerald-900 font-bold">
                    <span className="flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Government Portal (GSTR-2B)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      GSTN Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px]">Invoice Number:</span>
                      <p className="font-mono font-semibold text-slate-900">{selectedRecord.portalInvoiceNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Invoice Date:</span>
                      <p className="font-medium text-slate-900">{selectedRecord.portalInvoiceDate || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Supplier GSTIN:</span>
                      <p className="font-mono font-semibold text-slate-900">{selectedRecord.portalSupplierGstin || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Filing Period:</span>
                      <p className="font-medium text-slate-900">April 2026</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-200/80 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxable Value:</span>
                      <span className="font-semibold text-slate-900">{formatIndianCurrency(selectedRecord.portalTaxable)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>IGST:</span>
                      <span>{formatIndianCurrency(selectedRecord.portalIgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>CGST:</span>
                      <span>{formatIndianCurrency(selectedRecord.portalCgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SGST:</span>
                      <span>{formatIndianCurrency(selectedRecord.portalSgst)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold text-emerald-900">
                      <span>Total Invoice Value:</span>
                      <span>{formatIndianCurrency(selectedRecord.portalTotalValue)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Variance Calculator Strip */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 font-mono">
                <div>
                  <span className="text-slate-500 text-[11px] block">Taxable Difference:</span>
                  <span className={`text-sm font-bold ${selectedRecord.taxableDiff !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatIndianCurrency(selectedRecord.taxableDiff)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Tax Difference:</span>
                  <span className={`text-sm font-bold ${selectedRecord.taxDiff !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatIndianCurrency(selectedRecord.taxDiff)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">ITC At Risk:</span>
                  <span className="text-sm font-bold text-amber-600">
                    {formatIndianCurrency(selectedRecord.itcAtRiskAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Resolution Status:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {selectedRecord.resolutionStatus}
                  </span>
                </div>
              </div>

              {/* AI Explanation Section */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-xl border border-indigo-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      RB Tax AI Exception Diagnosis
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableDeepThinking}
                        onChange={(e) => setEnableDeepThinking(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Deep Thinking Mode</span>
                    </label>
                    <button
                      onClick={() => handleExplainRecord(selectedRecord)}
                      disabled={isExplaining}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition flex items-center space-x-1 disabled:opacity-50"
                    >
                      {isExplaining ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{aiExplanation ? 'Re-analyze' : 'Run AI Analysis'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiExplanation ? (
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="p-2.5 bg-white/90 rounded-lg border border-indigo-100">
                      <strong className="text-indigo-950 block text-[11px] uppercase tracking-wide">What Happened:</strong>
                      <p className="mt-0.5">{aiExplanation.whatHappened}</p>
                    </div>
                    <div className="p-2.5 bg-white/90 rounded-lg border border-indigo-100">
                      <strong className="text-indigo-950 block text-[11px] uppercase tracking-wide">Why It Happened (Root Cause):</strong>
                      <p className="mt-0.5">{aiExplanation.whyItHappened}</p>
                    </div>
                    <div className="p-2.5 bg-white/90 rounded-lg border border-indigo-100">
                      <strong className="text-indigo-950 block text-[11px] uppercase tracking-wide">Recommended Action for Accountant:</strong>
                      <p className="mt-0.5 font-medium text-indigo-900">{aiExplanation.actionRequired}</p>
                    </div>
                    {aiExplanation.statutoryReference && (
                      <div className="text-[11px] text-slate-500 italic">
                        Statutory Reference: {aiExplanation.statutoryReference}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Run AI Analysis&rdquo; to have RB Tax AI diagnose root cause, calculate tax impact, and provide recommended statutory resolution.
                  </p>
                )}
              </div>

              {/* Resolution Controls & Remarks */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-xs">Workflow Action & Remarks</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleResolveRecord(selectedRecord, 'Resolved', 'Accepted and verified by accountant.')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Accept & Mark Resolved
                  </button>
                  <button
                    onClick={() => handleResolveRecord(selectedRecord, 'Clarification Required', 'Awaiting vendor confirmation on value diff.')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Send for Vendor Clarification
                  </button>
                  <button
                    onClick={() => handleResolveRecord(selectedRecord, 'Under Review', 'Escalated to Tax Manager / CA.')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Assign to Senior Reviewer
                  </button>
                  <button
                    onClick={() => handleResolveRecord(selectedRecord, 'Ignored', 'Immaterial difference within threshold.')}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    Ignore Variance
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="text-[11px] italic">
                AI-assisted reconciliation is a review tool. Verify records before statutory filing.
              </span>
              <div className="flex items-center space-x-2">
                {onOpenChatWithRecord && (
                  <button
                    onClick={() => {
                      const rec = selectedRecord;
                      setSelectedRecord(null);
                      onOpenChatWithRecord(rec);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with AI About This Invoice</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-medium transition cursor-pointer"
                >
                  Close Audit View
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
