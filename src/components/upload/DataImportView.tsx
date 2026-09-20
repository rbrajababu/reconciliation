import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Layers,
  Database,
  Table
} from 'lucide-react';
import { ReconciliationRules } from '../../types';
import { reconcileGstDatasets } from '../../lib/reconciliationEngine';

interface DataImportViewProps {
  onReconcileComplete: (records: any[], summary: any) => void;
  rules: ReconciliationRules;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  onReconcileComplete,
  rules,
}) => {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [importType, setImportType] = useState<'GST_INWARD' | 'GST_OUTWARD' | 'TDS'>('GST_INWARD');

  // File states
  const [booksFile, setBooksFile] = useState<File | null>(null);
  const [portalFile, setPortalFile] = useState<File | null>(null);
  const [booksData, setBooksData] = useState<any[]>([]);
  const [portalData, setPortalData] = useState<any[]>([]);
  const [booksColumns, setBooksColumns] = useState<string[]>([]);
  const [portalColumns, setPortalColumns] = useState<string[]>([]);

  // Column mappings
  const [booksMapping, setBooksMapping] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    supplierGstin: '',
    supplierName: '',
    taxableValue: '',
    igst: '',
    cgst: '',
    sgst: '',
  });

  const [portalMapping, setPortalMapping] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    supplierGstin: '',
    supplierName: '',
    taxableValue: '',
    igst: '',
    cgst: '',
    sgst: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const booksInputRef = useRef<HTMLInputElement>(null);
  const portalInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect columns
  const autoMapFields = (headers: string[]) => {
    const findMatch = (patterns: string[]) => {
      return headers.find(h => patterns.some(p => h.toLowerCase().includes(p))) || '';
    };

    return {
      invoiceNumber: findMatch(['invoice no', 'inv no', 'bill no', 'voucher no', 'invoice_num', 'invoicenumber']),
      invoiceDate: findMatch(['invoice date', 'inv date', 'date', 'bill date']),
      supplierGstin: findMatch(['supplier gstin', 'gstin', 'gstin of supplier', 'party gstin', 'pan']),
      supplierName: findMatch(['supplier name', 'party name', 'vendor name', 'name of party', 'name']),
      taxableValue: findMatch(['taxable value', 'taxable amt', 'taxable amount', 'taxable', 'base amount']),
      igst: findMatch(['integrated tax', 'igst', 'igst amount', 'igst amt']),
      cgst: findMatch(['central tax', 'cgst', 'cgst amount', 'cgst amt']),
      sgst: findMatch(['state/ut tax', 'state tax', 'sgst', 'sgst amount', 'sgst amt']),
    };
  };

  const handleFileUpload = async (file: File, target: 'books' | 'portal') => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (json.length === 0) return;
      const headers = Object.keys(json[0]);

      if (target === 'books') {
        setBooksFile(file);
        setBooksData(json);
        setBooksColumns(headers);
        setBooksMapping(autoMapFields(headers));
      } else {
        setPortalFile(file);
        setPortalData(json);
        setPortalColumns(headers);
        setPortalMapping(autoMapFields(headers));
      }
    } catch (err) {
      console.error('Error reading Excel file:', err);
    }
  };

  // Pre-load realistic Sample Dataset
  const handleLoadSampleDataset = () => {
    // Generate 15 sample realistic purchase vouchers
    const sampleBooks = [
      { 'Invoice No': 'INV/2026/0412', 'Date': '2026-04-05', 'Supplier GSTIN': '27AABCT8921K1Z2', 'Supplier Name': 'Tata Communications Ltd', 'Taxable Value': 250000, 'IGST': 0, 'CGST': 22500, 'SGST': 22500 },
      { 'Invoice No': 'INV-1025', 'Date': '2026-04-08', 'Supplier GSTIN': '29AAACS8832L1Z9', 'Supplier Name': 'Infosys BPM Solutions Ltd', 'Taxable Value': 500000, 'IGST': 90000, 'CGST': 0, 'SGST': 0 },
      { 'Invoice No': 'DS/26-27/089', 'Date': '2026-04-12', 'Supplier GSTIN': '27AABCD4491E1Z3', 'Supplier Name': 'Dell India Global Logistics', 'Taxable Value': 180000, 'IGST': 0, 'CGST': 16200, 'SGST': 16200 },
      { 'Invoice No': 'AWS-IND-99120', 'Date': '2026-04-15', 'Supplier GSTIN': '27AABCA9918F1ZV', 'Supplier Name': 'Amazon Web Services India Pvt Ltd', 'Taxable Value': 340000, 'IGST': 0, 'CGST': 30600, 'SGST': 30600 },
      { 'Invoice No': 'VL/04/2026/11', 'Date': '2026-04-20', 'Supplier GSTIN': '29AAACV5512M1Z0', 'Supplier Name': 'Vanguard Logistics LLP', 'Taxable Value': 85000, 'IGST': 15300, 'CGST': 0, 'SGST': 0 },
      { 'Invoice No': 'WIP/MUM/0091', 'Date': '2026-04-22', 'Supplier GSTIN': '27AABCW1928N1Z4', 'Supplier Name': 'Wipro Enterprises Ltd', 'Taxable Value': 45000, 'IGST': 0, 'CGST': 4050, 'SGST': 4050 },
      { 'Invoice No': 'WIP/MUM/0091', 'Date': '2026-04-22', 'Supplier GSTIN': '27AABCW1928N1Z4', 'Supplier Name': 'Wipro Enterprises Ltd', 'Taxable Value': 45000, 'IGST': 0, 'CGST': 4050, 'SGST': 4050 }, // duplicate in books
      { 'Invoice No': 'BLR/HOTEL/551', 'Date': '2026-04-25', 'Supplier GSTIN': '29AAACH4821D1Z8', 'Supplier Name': 'The Leela Palaces & Hotels', 'Taxable Value': 62000, 'IGST': 0, 'CGST': 5580, 'SGST': 5580 },
    ];

    const samplePortal = [
      { 'Invoice No': 'INV/2026/0412', 'Date': '2026-04-05', 'Supplier GSTIN': '27AABCT8921K1Z2', 'Supplier Name': 'Tata Communications Ltd', 'Taxable Value': 250000, 'IGST': 0, 'CGST': 22500, 'SGST': 22500 },
      { 'Invoice No': 'INV1025', 'Date': '2026-04-08', 'Supplier GSTIN': '29AAACS8832L1Z9', 'Supplier Name': 'Infosys BPM Solutions Ltd', 'Taxable Value': 500000, 'IGST': 90000, 'CGST': 0, 'SGST': 0 }, // hyphen variation
      { 'Invoice No': 'DS/26-27/089', 'Date': '2026-04-12', 'Supplier GSTIN': '27AABCD4491E1Z3', 'Supplier Name': 'Dell India Global Logistics', 'Taxable Value': 165000, 'IGST': 0, 'CGST': 14850, 'SGST': 14850 }, // taxable value diff
      { 'Invoice No': 'MS-SUB-8812', 'Date': '2026-04-18', 'Supplier GSTIN': '07AAACM1234P1Z8', 'Supplier Name': 'Microsoft Corporation India Pvt Ltd', 'Taxable Value': 120000, 'IGST': 21600, 'CGST': 0, 'SGST': 0 }, // missing in books
      { 'Invoice No': 'VL/04/2026/11', 'Date': '2026-04-20', 'Supplier GSTIN': '27AAACV5512M1Z5', 'Supplier Name': 'Vanguard Logistics LLP', 'Taxable Value': 85000, 'IGST': 0, 'CGST': 7650, 'SGST': 7650 }, // POS/GSTIN diff
      { 'Invoice No': 'WIP/MUM/0091', 'Date': '2026-04-22', 'Supplier GSTIN': '27AABCW1928N1Z4', 'Supplier Name': 'Wipro Enterprises Ltd', 'Taxable Value': 45000, 'IGST': 0, 'CGST': 4050, 'SGST': 4050 },
      { 'Invoice No': 'BLR/HOTEL/551', 'Date': '2026-04-25', 'Supplier GSTIN': '29AAACH4821D1Z8', 'Supplier Name': 'The Leela Palaces & Hotels', 'Taxable Value': 62000, 'IGST': 0, 'CGST': 5580, 'SGST': 5580 },
    ];

    setBooksFile(new File([''], 'Tally_Prime_Purchase_Register_Apr2026.xlsx'));
    setBooksData(sampleBooks);
    setBooksColumns(Object.keys(sampleBooks[0]));
    setBooksMapping({
      invoiceNumber: 'Invoice No',
      invoiceDate: 'Date',
      supplierGstin: 'Supplier GSTIN',
      supplierName: 'Supplier Name',
      taxableValue: 'Taxable Value',
      igst: 'IGST',
      cgst: 'CGST',
      sgst: 'SGST',
    });

    setPortalFile(new File([''], 'GSTR2B_Government_Portal_Apr2026.xlsx'));
    setPortalData(samplePortal);
    setPortalColumns(Object.keys(samplePortal[0]));
    setPortalMapping({
      invoiceNumber: 'Invoice No',
      invoiceDate: 'Date',
      supplierGstin: 'Supplier GSTIN',
      supplierName: 'Supplier Name',
      taxableValue: 'Taxable Value',
      igst: 'IGST',
      cgst: 'CGST',
      sgst: 'SGST',
    });

    setActiveWorkflowStep(2);
  };

  const handleRunReconciliation = () => {
    setIsProcessing(true);

    // Transform mapped data
    const normalizedBooks = booksData.map((row) => ({
      invoiceNumber: String(row[booksMapping.invoiceNumber] || ''),
      invoiceDate: String(row[booksMapping.invoiceDate] || ''),
      supplierGstin: String(row[booksMapping.supplierGstin] || ''),
      supplierName: String(row[booksMapping.supplierName] || ''),
      taxableValue: Number(row[booksMapping.taxableValue] || 0),
      igst: Number(row[booksMapping.igst] || 0),
      cgst: Number(row[booksMapping.cgst] || 0),
      sgst: Number(row[booksMapping.sgst] || 0),
    }));

    const normalizedPortal = portalData.map((row) => ({
      invoiceNumber: String(row[portalMapping.invoiceNumber] || ''),
      invoiceDate: String(row[portalMapping.invoiceDate] || ''),
      supplierGstin: String(row[portalMapping.supplierGstin] || ''),
      supplierName: String(row[portalMapping.supplierName] || ''),
      taxableValue: Number(row[portalMapping.taxableValue] || 0),
      igst: Number(row[portalMapping.igst] || 0),
      cgst: Number(row[portalMapping.cgst] || 0),
      sgst: Number(row[portalMapping.sgst] || 0),
    }));

    setTimeout(() => {
      const { records, summary } = reconcileGstDatasets(normalizedBooks, normalizedPortal, rules);
      setIsProcessing(false);
      onReconcileComplete(records, summary);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                Universal Tax Importer
              </span>
              <span className="text-xs text-slate-500">Excel / CSV / Tally Prime</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Data Import & Column Mapping Engine
            </h1>
            <p className="text-xs text-slate-600">
              Upload Tally purchase/sales registers and GSTR-2B or 26AS files with automated AI header mapping.
            </p>
          </div>

          <button
            onClick={handleLoadSampleDataset}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Load Sample Tally & GSTR-2B Files</span>
          </button>
        </div>

        {/* Workflow Steps Indicator */}
        <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
          <div
            onClick={() => setActiveWorkflowStep(1)}
            className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer transition ${
              activeWorkflowStep === 1
                ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              1
            </div>
            <span>Upload Accounting & Tax Files</span>
          </div>

          <div
            onClick={() => booksData.length > 0 && setActiveWorkflowStep(2)}
            className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer transition ${
              activeWorkflowStep === 2
                ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
              2
            </div>
            <span>Map Column Headers</span>
          </div>

          <div
            onClick={() => booksData.length > 0 && portalData.length > 0 && setActiveWorkflowStep(3)}
            className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer transition ${
              activeWorkflowStep === 3
                ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
              3
            </div>
            <span>Run Matching & Audit</span>
          </div>
        </div>
      </div>

      {/* Step 1: Upload Zones */}
      {activeWorkflowStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* File 1: Books Data */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Books Accounting File</h2>
                  <p className="text-[11px] text-slate-500">Tally Prime / Busy / SAP Purchase Register</p>
                </div>
              </div>
              {booksFile && (
                <span className="flex items-center text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Loaded
                </span>
              )}
            </div>

            <div
              onClick={() => booksInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition space-y-2"
            >
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                {booksFile ? booksFile.name : 'Click to select or drag & drop Books Excel/CSV'}
              </div>
              <p className="text-[11px] text-slate-500">Supports .xlsx, .xls, .csv files</p>
              <input
                ref={booksInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'books');
                  }
                }}
              />
            </div>

            {booksData.length > 0 && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between font-mono">
                <span>Total Vouchers Loaded: {booksData.length}</span>
                <span className="text-blue-600 font-semibold">{booksColumns.length} Columns Detected</span>
              </div>
            )}
          </div>

          {/* File 2: Government Portal File */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Government Portal File</h2>
                  <p className="text-[11px] text-slate-500">GSTR-2B Statement / Form 26AS / Challans</p>
                </div>
              </div>
              {portalFile && (
                <span className="flex items-center text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Loaded
                </span>
              )}
            </div>

            <div
              onClick={() => portalInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition space-y-2"
            >
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                {portalFile ? portalFile.name : 'Click to select or drag & drop Portal Excel/CSV'}
              </div>
              <p className="text-[11px] text-slate-500">Supports .xlsx, .xls, .csv files</p>
              <input
                ref={portalInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'portal');
                  }
                }}
              />
            </div>

            {portalData.length > 0 && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between font-mono">
                <span>Total Portal Invoices Loaded: {portalData.length}</span>
                <span className="text-emerald-600 font-semibold">{portalColumns.length} Columns Detected</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Step 2: Column Mapping */}
      {activeWorkflowStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Map Header Columns</h2>
              <p className="text-xs text-slate-500">AI has auto-detected most columns. Confirm or adjust mapping below.</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              AI Assisted Mapping
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Books Columns */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs">Books File Columns</h3>
              
              <div className="space-y-2">
                {[
                  { field: 'invoiceNumber', label: 'Invoice / Voucher Number *' },
                  { field: 'invoiceDate', label: 'Invoice Date *' },
                  { field: 'supplierGstin', label: 'Supplier GSTIN / PAN *' },
                  { field: 'supplierName', label: 'Supplier Name *' },
                  { field: 'taxableValue', label: 'Taxable Amount (₹) *' },
                  { field: 'igst', label: 'IGST Amount' },
                  { field: 'cgst', label: 'CGST Amount' },
                  { field: 'sgst', label: 'SGST Amount' },
                ].map((item) => (
                  <div key={item.field} className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{item.label}:</span>
                    <select
                      value={(booksMapping as any)[item.field]}
                      onChange={(e) => setBooksMapping({ ...booksMapping, [item.field]: e.target.value })}
                      className="w-48 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-[11px] focus:outline-none"
                    >
                      <option value="">-- Select Column --</option>
                      {booksColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Portal Columns */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs">Portal (GSTR-2B) Columns</h3>
              
              <div className="space-y-2">
                {[
                  { field: 'invoiceNumber', label: 'Invoice / Voucher Number *' },
                  { field: 'invoiceDate', label: 'Invoice Date *' },
                  { field: 'supplierGstin', label: 'Supplier GSTIN / PAN *' },
                  { field: 'supplierName', label: 'Supplier Name *' },
                  { field: 'taxableValue', label: 'Taxable Amount (₹) *' },
                  { field: 'igst', label: 'IGST Amount' },
                  { field: 'cgst', label: 'CGST Amount' },
                  { field: 'sgst', label: 'SGST Amount' },
                ].map((item) => (
                  <div key={item.field} className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{item.label}:</span>
                    <select
                      value={(portalMapping as any)[item.field]}
                      onChange={(e) => setPortalMapping({ ...portalMapping, [item.field]: e.target.value })}
                      className="w-48 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-[11px] focus:outline-none"
                    >
                      <option value="">-- Select Column --</option>
                      {portalColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setActiveWorkflowStep(3)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <span>Confirm Mapping & Proceed to Reconcile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Run Engine */}
      {activeWorkflowStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Layers className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Ready to Execute Reconciliation Run</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Matching engine will normalize invoice numbers, apply tolerance thresholds (Date: {rules.dateToleranceDays}d, Amount: ₹{rules.amountToleranceRupees}), and categorize ITC risks.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunReconciliation}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-extrabold shadow-md transition disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Datasets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Reconciliation Run</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
