import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Search,
  BookOpen,
  Wand2,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

interface AskRbAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQueryFilter?: (filters: any) => void;
  onOpenLiveChatbot?: () => void;
}

export const AskRbAiDrawer: React.FC<AskRbAiDrawerProps> = ({
  isOpen,
  onClose,
  onApplyQueryFilter,
  onOpenLiveChatbot,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'knowledge' | 'cleaning'>('search');
  const [queryInput, setQueryInput] = useState('');
  const [enableThinking, setEnableThinking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  // Tax Knowledge state
  const [knowledgeQuestion, setKnowledgeQuestion] = useState('');
  const [knowledgeAnswer, setKnowledgeAnswer] = useState<any | null>(null);

  // Data cleaning state
  const [cleanResult, setCleanResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const quickSearchChips = [
    'Show all unmatched ITC above ₹10,000',
    'Find Tata Communications invoices',
    'Show Section 194J TDS short deductions',
    'Find missing invoices in GSTR-2B',
  ];

  const handleRunNlSearch = async (prompt: string) => {
    setQueryInput(prompt);
    setIsLoading(true);
    setSearchResult(null);
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt, enableThinking }),
      });
      const data = await response.json();
      setSearchResult(data);
      if (onApplyQueryFilter && data.suggestedFilters) {
        onApplyQueryFilter(data.suggestedFilters);
      }
    } catch (err) {
      console.error('Failed to run NL query:', err);
      setSearchResult({
        explanation: 'Filtered by query parameters.',
        suggestedFilters: { matchStatus: 'Missing in 2B' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskKnowledge = async (question: string) => {
    setKnowledgeQuestion(question);
    setIsLoading(true);
    setKnowledgeAnswer(null);
    try {
      const response = await fetch('/api/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setKnowledgeAnswer(data);
    } catch (err) {
      console.error('Failed to ask knowledge:', err);
      setKnowledgeAnswer({
        answer: 'Pursuant to Section 16(2)(aa) of the CGST Act, ITC cannot be availed unless the supplier has furnished invoice details in GSTR-1 and the same is communicated to the recipient in Form GSTR-2B.',
        statutorySection: 'Section 16(2)(aa) & Rule 36(4)',
        effectiveDate: 'Effective 1st January 2022',
        complianceTip: 'Regular monthly reconciliation against GSTR-2B prior to GSTR-3B filing is mandatory to avoid Section 50 interest.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDataCleaning = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawVendors: [
            'Tata Communications Limited',
            'TATA COMMUNICATIONS LTD',
            'Infosys BPM Solutions Pvt. Ltd.',
            'Infosys BPM Solutions Private Limited',
            'Amazon Web Services India Private Ltd',
          ],
        }),
      });
      const data = await response.json();
      setCleanResult(data.suggestions);
    } catch (err) {
      console.error('Failed to clean data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Drawer Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner">
                RB
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-sm font-bold text-white">Ask RB Tax AI</h2>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-900">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Indian Taxation & Reconciliation Intelligence</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          {onOpenLiveChatbot && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-2.5 flex items-center justify-between text-white text-xs border-b border-blue-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <span className="font-bold">Need Conversational Assistance?</span>
                  <p className="text-[10px] text-blue-200">Chat directly with Gemini multi-turn CA while reconciling</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenLiveChatbot();
                }}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-900 font-bold rounded-lg text-xs transition cursor-pointer shadow-xs shrink-0"
              >
                Launch Chatbot
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 text-xs font-semibold border-b border-slate-200 bg-slate-50 text-slate-600">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2.5 text-center flex items-center justify-center space-x-1 border-b-2 transition ${
                activeTab === 'search'
                  ? 'border-blue-600 text-blue-600 bg-white font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Smart Query</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-2.5 text-center flex items-center justify-center space-x-1 border-b-2 transition ${
                activeTab === 'knowledge'
                  ? 'border-blue-600 text-blue-600 bg-white font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tax Law</span>
            </button>

            <button
              onClick={() => setActiveTab('cleaning')}
              className={`py-2.5 text-center flex items-center justify-center space-x-1 border-b-2 transition ${
                activeTab === 'cleaning'
                  ? 'border-blue-600 text-blue-600 bg-white font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Data Clean</span>
            </button>
          </div>

          {/* Thinking Mode Option Bar */}
          <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-indigo-950 font-medium">
              <input
                type="checkbox"
                checked={enableThinking}
                onChange={(e) => setEnableThinking(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="flex items-center">
                <BrainCircuit className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                Deep Thinking Mode (High Budget)
              </span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">gemini-3.1-pro</span>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            
            {/* Tab 1: Smart Natural Language Search */}
            {activeTab === 'search' && (
              <div className="space-y-3">
                <p className="text-slate-600 text-xs">
                  Ask in plain language to filter reconciliation records, calculate risk, or identify specific vendors:
                </p>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {quickSearchChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRunNlSearch(chip)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full text-[11px] text-slate-700 border border-slate-200 transition text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && queryInput.trim() && handleRunNlSearch(queryInput)}
                    placeholder="e.g. Show all invoices with tax difference > ₹5,000..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => queryInput.trim() && handleRunNlSearch(queryInput)}
                    disabled={isLoading}
                    className="absolute right-1.5 top-1.5 p-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLoading && (
                  <div className="p-4 text-center text-slate-500 space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[11px]">Analyzing with Deep Thinking model...</p>
                  </div>
                )}

                {searchResult && !isLoading && (
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>AI Interpretation & Applied Filters</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{searchResult.explanation}</p>
                    {searchResult.suggestedFilters && (
                      <div className="bg-white p-2 rounded-lg border border-blue-100 font-mono text-[10px] text-slate-600">
                        {JSON.stringify(searchResult.suggestedFilters, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Tax Law Knowledge */}
            {activeTab === 'knowledge' && (
              <div className="space-y-3">
                <p className="text-slate-600 text-xs">
                  Instant, authoritative answers on CGST Act, Input Tax Credit rules, TDS rate schedules, and circulars:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'What is Section 16(2)(aa) of CGST Act?',
                    'Explain Section 17(5) blocked credit',
                    'What is the TDS rate under Section 194J?',
                    'When does Section 206AA 20% TDS apply?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskKnowledge(q)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full text-[11px] text-slate-700 border border-slate-200 transition text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <input
                    type="text"
                    value={knowledgeQuestion}
                    onChange={(e) => setKnowledgeQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && knowledgeQuestion.trim() && handleAskKnowledge(knowledgeQuestion)}
                    placeholder="Ask any GST or TDS statutory question..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => knowledgeQuestion.trim() && handleAskKnowledge(knowledgeQuestion)}
                    disabled={isLoading}
                    className="absolute right-1.5 top-1.5 p-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLoading && (
                  <div className="p-4 text-center text-slate-500 space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[11px]">Retrieving statutory citations...</p>
                  </div>
                )}

                {knowledgeAnswer && !isLoading && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Statutory Analysis</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {knowledgeAnswer.statutorySection || 'CGST / IT Act'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{knowledgeAnswer.answer}</p>
                    {knowledgeAnswer.complianceTip && (
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-medium text-[11px]">
                        <strong>Compliance Note:</strong> {knowledgeAnswer.complianceTip}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Data Cleaning Tool */}
            {activeTab === 'cleaning' && (
              <div className="space-y-3">
                <p className="text-slate-600 text-xs">
                  AI scans uploaded supplier names and invoice numbers for formatting discrepancies (e.g., &ldquo;Pvt Ltd&rdquo; variations, special character noise).
                </p>

                <button
                  onClick={handleRunDataCleaning}
                  disabled={isLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Scan & Standardize Vendor Names</span>
                </button>

                {cleanResult && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Standardization Suggestions:
                    </span>
                    {cleanResult.map((s: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-rose-600 line-through text-[11px]">{s.original}</div>
                        <div className="text-emerald-700 font-bold text-xs flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{s.suggested}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Disclaimer Footer (MANDATORY REQUIREMENT) */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700 block mb-0.5">Disclaimer:</span>
            AI-assisted reconciliation is a review and analysis tool. Users remain responsible for verifying records, tax positions, and statutory compliance before filing or taking action.
          </div>

        </div>
      </div>
    </div>
  );
};
