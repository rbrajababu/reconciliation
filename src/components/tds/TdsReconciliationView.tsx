import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Building,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { TdsRecord, TdsMatchStatus, ResolutionStatus } from '../../types';
import { formatIndianCurrency } from '../../lib/reconciliationEngine';

interface TdsReconciliationViewProps {
  records: TdsRecord[];
  onUpdateRecord: (updatedRecord: TdsRecord) => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onOpenChatWithRecord?: (record?: TdsRecord) => void;
}

export const TdsReconciliationView: React.FC<TdsReconciliationViewProps> = ({
  records,
  onUpdateRecord,
  onExportExcel,
  onExportCsv,
  onOpenChatWithRecord,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<TdsRecord | null>(null);

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (activeTab !== 'ALL') {
        if (activeTab === 'EXACT' && r.matchStatus !== 'Exact Match') return false;
        if (activeTab === 'SHORT' && r.matchStatus !== 'Short Deduction') return false;
        if (activeTab === 'PAN_ERR' && r.matchStatus !== 'PAN Mismatch') return false;
        if (activeTab === 'CHALLAN_ERR' && r.matchStatus !== 'Challan Mismatch') return false;
      }

      if (sectionFilter !== 'ALL' && r.section !== sectionFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.deducteeName.toLowerCase().includes(q);
        const matchPan = r.pan.toLowerCase().includes(q);
        const matchChallan = r.challanNumber.toLowerCase().includes(q);
        if (!matchName && !matchPan && !matchChallan) return false;
      }

      return true;
    });
  }, [records, activeTab, sectionFilter, searchQuery]);

  const handleExplainTds = async (rec: TdsRecord) => {
    setSelectedRecord(rec);
    setIsExplaining(true);
    setAiExplanation(null);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TDS',
          record: rec,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAiExplanation(data);
    } catch (err) {
      console.error('Failed to explain TDS:', err);
      setAiExplanation({
        whatHappened: `TDS expected is ${formatIndianCurrency(rec.expectedTds)} but books record ${formatIndianCurrency(rec.booksTds)}. Difference is ${formatIndianCurrency(rec.difference)}.`,
        whyItHappened: `Discrepancy under Section ${rec.section}. Check if deduction was made at incorrect rate or PAN was missing.`,
        actionRequired: 'Verify deductee constitution (Individual vs Company) and file correction statement in Form 26Q.',
        statutoryReference: `Section ${rec.section} and Section 206AA of Income Tax Act 1961.`,
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleResolve = (rec: TdsRecord, status: ResolutionStatus, remarks?: string) => {
    const updated: TdsRecord = {
      ...rec,
      resolutionStatus: status,
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
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                TDS 26Q / 24Q vs 26AS & Challans
              </span>
              <span className="text-xs text-slate-500">Income Tax Act 1961 Aligned</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              TDS Reconciliation & Challan Audit
            </h1>
            <p className="text-xs text-slate-600">
              Audit TDS deductions, verify challan receipts, identify short deductions, and flag Section 206AA rate breaches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenChatWithRecord && (
              <button
                onClick={() => onOpenChatWithRecord(undefined)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Launch Multi-Turn AI Chatbot for TDS Reconciliation Assistance"
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
              <span>Export TDS Audit Pack</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          {[
            { id: 'ALL', label: 'All Deductions', count: records.length },
            { id: 'EXACT', label: 'Exact Matched', count: records.filter(r => r.matchStatus === 'Exact Match').length },
            { id: 'SHORT', label: 'Short Deductions', count: records.filter(r => r.matchStatus === 'Short Deduction').length },
            { id: 'PAN_ERR', label: 'PAN Mismatches (Sec 206AA)', count: records.filter(r => r.matchStatus === 'PAN Mismatch').length },
            { id: 'CHALLAN_ERR', label: 'Challan Mismatches', count: records.filter(r => r.matchStatus === 'Challan Mismatch').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Section Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by deductee, PAN, or challan number..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500">TDS Section:</span>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Sections</option>
            <option value="194C">194C (Contractors)</option>
            <option value="194J">194J (Professional / Tech)</option>
            <option value="194I">194I (Rent)</option>
            <option value="194Q">194Q (Purchase of Goods)</option>
          </select>
        </div>
      </div>

      {/* Comparative Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">Deductee & PAN</th>
                <th className="py-3 px-3">Section</th>
                <th className="py-3 px-3">Payment Date</th>
                <th className="py-3 px-3 text-right">Payment Base</th>
                <th className="py-3 px-3 text-center">Rate</th>
                <th className="py-3 px-3 text-right">Expected TDS</th>
                <th className="py-3 px-3 text-right">Books TDS</th>
                <th className="py-3 px-3 text-right">Difference</th>
                <th className="py-3 px-3">Challan / BSR</th>
                <th className="py-3 px-3 text-center">Match Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        No TDS Records Loaded — Demo Data Removed
                      </div>
                      <div className="text-xs text-slate-500">
                        Import your Form 26AS, AIS/TIS JSON, and books deduction register to begin TDS compliance reconciliation.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No matching TDS deduction records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate" title={r.deducteeName}>
                        {r.deducteeName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 flex items-center space-x-1">
                        <span>PAN: {r.pan}</span>
                        {r.pan === 'PANNOTAVBL' && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] px-1 rounded font-bold">
                            NO PAN
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800">
                        {r.section}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">{r.paymentDate}</td>

                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                      {formatIndianCurrency(r.tdsBase)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {r.tdsRate}%
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatIndianCurrency(r.expectedTds)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatIndianCurrency(r.booksTds)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {r.difference !== 0 ? (
                        <span className="text-rose-600">{formatIndianCurrency(r.difference)}</span>
                      ) : (
                        <span className="text-emerald-600">₹0.00</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono text-[11px] text-slate-800">{r.challanNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">BSR: {r.bsrCode}</div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.matchStatus === 'Exact Match'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.matchStatus === 'Short Deduction'
                            ? 'bg-rose-100 text-rose-800'
                            : r.matchStatus === 'PAN Mismatch'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.matchStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setAiExplanation(null);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition"
                          title="Side-by-Side Audit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExplainTds(r)}
                          className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                          title="AI Diagnosis"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        {onOpenChatWithRecord && (
                          <button
                            onClick={() => onOpenChatWithRecord(r)}
                            className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                            title="Chat with Gemini Chatbot about this deduction"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TDS Detail & AI Diagnosis Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  TDS Section {selectedRecord.section} Audit
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedRecord.deducteeName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Gross Payment:</span>
                  <span className="font-bold text-slate-900">{formatIndianCurrency(selectedRecord.paymentAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Expected TDS:</span>
                  <span className="font-bold text-slate-900">{formatIndianCurrency(selectedRecord.expectedTds)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Books TDS:</span>
                  <span className="font-bold text-slate-900">{formatIndianCurrency(selectedRecord.booksTds)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Discrepancy:</span>
                  <span className={`font-bold ${selectedRecord.difference > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatIndianCurrency(selectedRecord.difference)}
                  </span>
                </div>
              </div>

              {/* AI Explanation Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      RB Tax AI Section Audit Diagnosis
                    </h3>
                  </div>
                  <button
                    onClick={() => handleExplainTds(selectedRecord)}
                    disabled={isExplaining}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition disabled:opacity-50"
                  >
                    {isExplaining ? 'Diagnosing...' : 'Run AI Diagnosis'}
                  </button>
                </div>

                {aiExplanation ? (
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                      <strong className="text-indigo-950 block text-[11px]">Audit Finding:</strong>
                      <p className="mt-0.5">{aiExplanation.whatHappened}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                      <strong className="text-indigo-950 block text-[11px]">Root Cause:</strong>
                      <p className="mt-0.5">{aiExplanation.whyItHappened}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                      <strong className="text-indigo-950 block text-[11px]">Action Required:</strong>
                      <p className="mt-0.5 font-semibold text-indigo-900">{aiExplanation.actionRequired}</p>
                    </div>
                    {aiExplanation.statutoryReference && (
                      <div className="text-[11px] text-slate-500 italic">
                        Statutory Reference: {aiExplanation.statutoryReference}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Run AI Diagnosis&rdquo; to analyze statutory section compliance under Income Tax Act.
                  </p>
                )}
              </div>

              {/* Resolution Controls */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-2">
                <button
                  onClick={() => handleResolve(selectedRecord, 'Resolved', 'Correction filed in revised Form 26Q.')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition"
                >
                  Mark Corrected in Revised 26Q
                </button>
                <button
                  onClick={() => handleResolve(selectedRecord, 'Clarification Required', 'Awaiting valid PAN from deductee.')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm transition"
                >
                  Request Deductee PAN
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {onOpenChatWithRecord && (
                  <button
                    onClick={() => {
                      const rec = selectedRecord;
                      setSelectedRecord(null);
                      onOpenChatWithRecord(rec);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with AI About This Deduction</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
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
