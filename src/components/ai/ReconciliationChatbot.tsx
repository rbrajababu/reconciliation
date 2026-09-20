import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  FileSpreadsheet,
  Paperclip,
  Zap,
  Info
} from 'lucide-react';
import { GstRecord, TdsRecord } from '../../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  contextAttached?: {
    type: 'GST' | 'TDS';
    label: string;
    diff?: number;
    status?: string;
  };
}

interface ReconciliationChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecord?: GstRecord | TdsRecord | null;
  activeRecordType?: 'GST' | 'TDS';
  onClearActiveRecord?: () => void;
  onApplyFilter?: (filter: any) => void;
  companyName?: string;
  gstin?: string;
  financialYear?: string;
}

export const ReconciliationChatbot: React.FC<ReconciliationChatbotProps> = ({
  isOpen,
  onClose,
  activeRecord,
  activeRecordType = 'GST',
  onClearActiveRecord,
  companyName = 'Prime Solutions Private Limited',
  gstin = '27AABCT2345M1Z5',
  financialYear = '2026-27',
}) => {
  // Model state: models/gemini-3.8-flash default, with gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  
  // Role Preset state
  const [rolePreset, setRolePreset] = useState<'reconciliation_specialist' | 'tax_expert' | 'vendor_dispute' | 'audit_prep'>('reconciliation_specialist');
  
  // UI states
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Welcome to RB Tax Reconciliation Assistant

I am your dedicated **Chartered Accountant & Reconciliation Chatbot** powered by **Gemini**. I can assist you in real-time while you reconcile your purchase registers against government data:

- **Diagnose Mismatches:** Determine why an invoice is flagged as *Missing in 2B*, *Probable Match*, or *Tax Variance*.
- **Statutory ITC Validation:** Check eligibility under **CGST Section 16(2)(aa)** and **Rule 36(4)**.
- **Draft Vendor Communications:** Generate copy-ready email notices and payment hold memos for non-compliant suppliers.
- **TDS Compliance:** Verify **Section 194C, 194J, 194I, 194Q** deductions and 26AS matching.
- **ERP / Tally Journal Entries:** Get exact voucher entries for tax variances and timing differences.

*Click any invoice or deduction in your reconciliation table, or choose a prompt below to get started!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Quick suggestions based on active record or general state
  const quickSuggestions = activeRecord
    ? [
        `Why is invoice ${(activeRecord as GstRecord).invoiceNumber || activeRecord.id} flagged as ${activeRecord.matchStatus}?`,
        `Draft vendor email to ${(activeRecord as GstRecord).supplierName || (activeRecord as TdsRecord).deducteeName} for ITC variance`,
        `What journal entry should I pass for this ${activeRecord.matchStatus} discrepancy?`,
        `Can I claim this ITC under Section 16(2)(aa) if supplier files late?`,
      ]
    : [
        'How to resolve invoices Missing in GSTR-2B under Section 16(2)(aa)?',
        'Draft standard vendor email requesting urgent GSTR-1 amendment',
        'How do quarterly QRMP supplier invoices reflect in monthly 2B?',
        'Tally journal entry for holding blocked ITC in separate ledger',
        'What is the penalty & interest under Section 50 for wrong ITC claim?',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextAttached: activeRecord
        ? {
            type: activeRecordType,
            label: (activeRecord as GstRecord).invoiceNumber || (activeRecord as TdsRecord).deducteeName || 'Transaction',
            diff: (activeRecord as GstRecord).taxDiff || (activeRecord as TdsRecord).difference,
            status: activeRecord.matchStatus,
          }
        : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare payload for multi-turn chat endpoint
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: selectedModel,
        rolePreset,
        reconciliationContext: {
          type: activeRecordType,
          activeRecord: activeRecord || null,
          companyName,
          gstin,
          financialYear,
        },
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I have analyzed your request. How else may I help?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Fallback message
      const fallbackMessage: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'assistant',
        content: `### Response for Reconciliation Query

Under **Section 16(2)(aa) of the CGST Act 2017**, Input Tax Credit cannot be claimed unless the invoice has been uploaded by the vendor in GSTR-1 and communicated in **GSTR-2B**. 

**Actionable Next Steps:**
1. **Invoice Verification:** Request the supplier to provide GSTR-1 filing ARN.
2. **Hold Tax Amount:** Withhold the tax variance from the supplier's pending disbursement to protect cash flows.
3. **Table 4(A)(5) Compliance:** Claim only matched GSTR-2B credit in monthly Form GSTR-3B to prevent Section 50 interest notices (18% p.a.).

*Would you like me to draft an email to the supplier or provide the Tally journal entry?*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear current chat conversation history?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Conversation history cleared. How can I assist you with your GST or TDS reconciliation now?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="reconciliation-chatbot-panel"
      className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl bg-white border border-slate-300 rounded-2xl overflow-hidden font-sans ${
        isExpanded
          ? 'inset-4 md:inset-8 w-auto h-auto'
          : 'bottom-4 right-4 w-[95vw] sm:w-[460px] h-[640px] max-h-[90vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-inner shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold truncate text-white">RB Tax Reconciliation Chatbot</h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-2.5 h-2.5 mr-1 text-blue-300" />
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Multi-Turn Assistance • GST 2A/2B & TDS 26AS Expert
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            id="chat-clear-btn"
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="chat-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer hidden sm:block"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            id="chat-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Chatbot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Model & Role Controls Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
        {/* Model Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-semibold text-slate-500">Model:</span>
          <select
            id="chat-model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Default • High-Precision)</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (General Tasks)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra-Fast)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Complex Reasoning)</option>
          </select>
        </div>

        {/* Role Presets */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Role:</span>
          <button
            onClick={() => setRolePreset('reconciliation_specialist')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
              rolePreset === 'reconciliation_specialist'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Recon Specialist
          </button>
          <button
            onClick={() => setRolePreset('tax_expert')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
              rolePreset === 'tax_expert'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Tax & ITC Expert
          </button>
          <button
            onClick={() => setRolePreset('vendor_dispute')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
              rolePreset === 'vendor_dispute'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Vendor Dispute
          </button>
          <button
            onClick={() => setRolePreset('audit_prep')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
              rolePreset === 'audit_prep'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Audit Prep
          </button>
        </div>
      </div>

      {/* Active Reconciliation Item Badge (if attached) */}
      {activeRecord && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-1.5 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
              Attached Context
            </span>
            <span className="font-semibold truncate">
              {(activeRecord as GstRecord).invoiceNumber || (activeRecord as TdsRecord).deducteeName}
            </span>
            <span className="text-amber-700">({activeRecord.matchStatus})</span>
            {((activeRecord as GstRecord).taxDiff || (activeRecord as TdsRecord).difference) !== undefined && (
              <span className="font-mono text-amber-800 font-bold">
                Diff: ₹{Math.abs((activeRecord as GstRecord).taxDiff || (activeRecord as TdsRecord).difference || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {onClearActiveRecord && (
            <button
              onClick={onClearActiveRecord}
              className="text-amber-700 hover:text-amber-900 p-0.5 rounded cursor-pointer"
              title="Remove attached context"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-900 text-white shadow-2xs'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}
            >
              {/* Context label if attached in this user message */}
              {msg.contextAttached && (
                <div className="mb-2 pb-1.5 border-b border-blue-500/40 text-[10px] text-blue-100 flex items-center space-x-1.5">
                  <Paperclip className="w-3 h-3" />
                  <span>Referencing: {msg.contextAttached.label} ({msg.contextAttached.status})</span>
                </div>
              )}

              {/* Message Content with simple markdown rendering */}
              <div className="whitespace-pre-wrap space-y-2">
                {msg.content.split('\n\n').map((paragraph, pIdx) => {
                  // Heading 3
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={pIdx} className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1 mt-1 mb-1">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  // Heading 4
                  if (paragraph.startsWith('#### ')) {
                    return (
                      <h4 key={pIdx} className="font-bold text-xs text-slate-800 mt-2 mb-0.5">
                        {paragraph.replace('#### ', '')}
                      </h4>
                    );
                  }
                  // Code block (emails / journal entries)
                  if (paragraph.startsWith('```')) {
                    const cleanCode = paragraph.replace(/```[a-z]*\n?/g, '');
                    return (
                      <div key={pIdx} className="relative group my-2">
                        <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800">
                          {cleanCode}
                        </pre>
                        <button
                          onClick={() => handleCopyMessage(msg.id + '-' + pIdx, cleanCode)}
                          className="absolute top-1.5 right-1.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition cursor-pointer"
                          title="Copy block"
                        >
                          {copiedMessageId === msg.id + '-' + pIdx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    );
                  }
                  // Regular text with bold formatting
                  return (
                    <p key={pIdx} className="text-xs">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Bottom footer: Timestamp & Copy */}
              <div
                className={`mt-2 pt-1 flex items-center justify-between text-[10px] ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                <div className="flex items-center space-x-2">
                  {msg.modelUsed && msg.role === 'assistant' && (
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {msg.modelUsed}
                    </span>
                  )}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-slate-700 transition cursor-pointer flex items-center space-x-0.5"
                      title="Copy full response"
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></span>
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  RB Tax AI analyzing reconciliation records ({selectedModel})...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 shrink-0 overflow-x-auto">
        <div className="flex items-center space-x-1.5 whitespace-nowrap">
          <span className="text-[10px] font-bold text-slate-500 flex items-center shrink-0">
            <Zap className="w-3 h-3 mr-0.5 text-amber-500" />
            Suggested:
          </span>
          {quickSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full border border-slate-300 transition shrink-0 cursor-pointer shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              id="reconciliation-chat-input"
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about GSTR-2B mismatches, Section 16(2)(aa), vendor email drafts, TDS rules..."
              className="w-full text-xs p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none text-slate-900 placeholder:text-slate-400"
              disabled={isLoading}
            />
          </div>
          <button
            id="reconciliation-chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-xl font-medium transition flex items-center justify-center shrink-0 shadow-2xs cursor-pointer ${
              inputText.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px]">Shift+Enter</kbd> for new line</span>
          <span>Role: {rolePreset.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
};
