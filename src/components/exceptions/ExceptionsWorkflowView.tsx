import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { GstRecord, ResolutionStatus, ExceptionPriority } from '../../types';
import { formatIndianCurrency } from '../../lib/reconciliationEngine';

interface ExceptionsWorkflowViewProps {
  records: GstRecord[];
  onUpdateRecord: (record: GstRecord) => void;
  onSelectRecordToView: (record: GstRecord) => void;
  onOpenChatWithRecord?: (record?: GstRecord) => void;
}

export const ExceptionsWorkflowView: React.FC<ExceptionsWorkflowViewProps> = ({
  records,
  onUpdateRecord,
  onSelectRecordToView,
  onOpenChatWithRecord,
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Only consider records with non-exact match or explicit exception
  const exceptionRecords = useMemo(() => {
    return records.filter((r) => r.matchStatus !== 'Exact Match');
  }, [records]);

  const filteredExceptions = useMemo(() => {
    return exceptionRecords.filter((r) => {
      if (activeStatusFilter !== 'ALL' && r.resolutionStatus !== activeStatusFilter) return false;
      if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInv = r.invoiceNumber.toLowerCase().includes(q);
        const matchSupplier = r.supplierName.toLowerCase().includes(q) || r.supplierGstin.toLowerCase().includes(q);
        if (!matchInv && !matchSupplier) return false;
      }
      return true;
    });
  }, [exceptionRecords, activeStatusFilter, priorityFilter, searchQuery]);

  const handleStatusChange = (r: GstRecord, newStatus: ResolutionStatus) => {
    onUpdateRecord({
      ...r,
      resolutionStatus: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                Exception Resolution Engine
              </span>
              <span className="text-xs text-slate-500">Triage & Governance</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Exceptions & Discrepancy Workflow
            </h1>
            <p className="text-xs text-slate-600">
              Track, assign, and resolve tax variance items before GSTR-3B monthly return filing.
            </p>
          </div>

          {onOpenChatWithRecord && (
            <button
              onClick={() => onOpenChatWithRecord(undefined)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-center"
              title="Launch Multi-Turn AI Chatbot for Exceptions Assistance"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chatbot Assistant</span>
            </button>
          )}
        </div>

        {/* Workflow State Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          {[
            { id: 'ALL', label: 'All Exceptions', count: exceptionRecords.length },
            { id: 'New', label: 'New / Unassigned', count: exceptionRecords.filter(r => r.resolutionStatus === 'New').length },
            { id: 'Under Review', label: 'Under Review', count: exceptionRecords.filter(r => r.resolutionStatus === 'Under Review').length },
            { id: 'Clarification Required', label: 'Clarification Needed', count: exceptionRecords.filter(r => r.resolutionStatus === 'Clarification Required').length },
            { id: 'Resolved', label: 'Resolved / Closed', count: exceptionRecords.filter(r => r.resolutionStatus === 'Resolved').length },
            { id: 'Ignored', label: 'Ignored (Immaterial)', count: exceptionRecords.filter(r => r.resolutionStatus === 'Ignored').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                activeStatusFilter === tab.id
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
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
            placeholder="Search exceptions by invoice number, vendor, or GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
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
      </div>

      {/* Exception Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">Invoice & Date</th>
                <th className="py-3 px-3">Supplier Name & GSTIN</th>
                <th className="py-3 px-3">Exception Category</th>
                <th className="py-3 px-3 text-right">Taxable Diff</th>
                <th className="py-3 px-3 text-right">Tax Variance</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3 text-center">Workflow Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No exceptions match the current filters.
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{r.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">{r.invoiceDate}</div>
                    </td>

                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate" title={r.supplierName}>
                        {r.supplierName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">{r.supplierGstin}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800 block">{r.exceptionType}</span>
                      <span className="text-[10px] text-slate-400">{r.remarks}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                      {formatIndianCurrency(r.taxableDiff)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      {formatIndianCurrency(r.taxDiff)}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          r.priority === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : r.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <select
                        value={r.resolutionStatus}
                        onChange={(e) => handleStatusChange(r, e.target.value as ResolutionStatus)}
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-medium text-slate-800 focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Clarification Required">Clarification Required</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Ignored">Ignored</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onSelectRecordToView(r)}
                          className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                          title="Open Audit View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onOpenChatWithRecord && (
                          <button
                            onClick={() => onOpenChatWithRecord(r)}
                            className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                            title="Chat with Gemini Chatbot about this exception"
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

    </div>
  );
};
