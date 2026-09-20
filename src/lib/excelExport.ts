import * as XLSX from 'xlsx';
import { GstRecord, TdsRecord, ReconciliationRun } from '../types';

export function exportGstReconciliationExcel(
  records: GstRecord[],
  summary: ReconciliationRun | any,
  filename = 'Reconciliation_With_RB_GST_Report.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Executive Summary Sheet
  const summaryData = [
    ['RECONCILIATION WITH RB - GST AUDIT REPORT'],
    ['Smart Reconciliation. Accurate Compliance. Better Control.'],
    [''],
    ['Report Period', summary.period || 'April 2026'],
    ['Financial Year', summary.financialYear || '2026-27'],
    ['GSTIN', summary.gstinOrTan || '27AABCA1234F1Z5'],
    ['Run Date', new Date().toLocaleString('en-IN')],
    [''],
    ['METRIC', 'COUNT / VALUE'],
    ['Total Purchase Invoices', summary.totalRecords || records.length],
    ['Matched Invoices (Exact + Probable)', summary.matchedCount || 0],
    ['Partial Matches (Value/Rate Diff)', summary.partialCount || 0],
    ['Unmatched / Missing Invoices', summary.unmatchedCount || 0],
    ['Match Rate (%)', `${summary.matchRate || 0}%`],
    ['Books Total Tax (₹)', summary.booksTaxAmount || 0],
    ['Portal 2B Total Tax (₹)', summary.portalTaxAmount || 0],
    ['Tax Variance (₹)', summary.taxDifference || 0],
    ['ITC at Risk under Sec 16(2)(aa) (₹)', summary.itcAtRisk || 0],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // 2. All Reconciled Records
  const allRows = records.map((r) => ({
    'Invoice Number (Books)': r.invoiceNumber,
    'Invoice Number (2B)': r.portalInvoiceNumber || '-',
    'Invoice Date': r.invoiceDate,
    'Supplier GSTIN': r.supplierGstin,
    'Supplier Name': r.supplierName,
    'Books Taxable (₹)': r.booksTaxable,
    '2B Taxable (₹)': r.portalTaxable,
    'Taxable Diff (₹)': r.taxableDiff,
    'Books IGST (₹)': r.booksIgst,
    '2B IGST (₹)': r.portalIgst,
    'Books CGST (₹)': r.booksCgst,
    '2B CGST (₹)': r.portalCgst,
    'Books SGST (₹)': r.booksSgst,
    '2B SGST (₹)': r.portalSgst,
    'Books Total Tax (₹)': r.booksTotalTax,
    '2B Total Tax (₹)': r.portalTotalTax,
    'Total Tax Diff (₹)': r.taxDiff,
    'Match Status': r.matchStatus,
    'Exception Type': r.exceptionType,
    'Priority': r.priority,
    'ITC Eligibility': r.itcEligibility,
    'ITC at Risk (₹)': r.itcAtRiskAmount,
    'Resolution Status': r.resolutionStatus,
    'Reviewer / Remarks': r.remarks || '',
  }));
  const wsAll = XLSX.utils.json_to_sheet(allRows);
  XLSX.utils.book_append_sheet(wb, wsAll, 'All Records');

  // 3. Exceptions Sheet
  const exceptionsRows = allRows.filter((r) => r['Match Status'] !== 'Exact Match');
  if (exceptionsRows.length > 0) {
    const wsExceptions = XLSX.utils.json_to_sheet(exceptionsRows);
    XLSX.utils.book_append_sheet(wb, wsExceptions, 'Exceptions & Action List');
  }

  // 4. Missing in 2B (Vendor Follow-up Sheet)
  const missing2bRows = allRows.filter((r) => r['Match Status'] === 'Missing in 2B');
  if (missing2bRows.length > 0) {
    const wsMissing2B = XLSX.utils.json_to_sheet(missing2bRows);
    XLSX.utils.book_append_sheet(wb, wsMissing2B, 'Vendor Followup (Missing 2B)');
  }

  // Trigger download
  XLSX.writeFile(wb, filename);
}

export const exportToExcel = exportGstReconciliationExcel;

export function exportTdsReconciliationExcel(
  records: TdsRecord[],
  summary: any,
  filename = 'Reconciliation_With_RB_TDS_Report.xlsx'
) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['RECONCILIATION WITH RB - TDS AUDIT REPORT'],
    ['Smart Reconciliation. Accurate Compliance. Better Control.'],
    [''],
    ['Period / Quarter', summary.period || 'Q1 2026-27'],
    ['Deductor TAN', summary.gstinOrTan || 'MUMA12345E'],
    ['Total Deductions', summary.totalRecords || records.length],
    ['Matched Deductions', summary.matchedCount || 0],
    ['Short / Excess Deductions', summary.partialCount || 0],
    ['Unmatched / PAN Mismatches', summary.unmatchedCount || 0],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'TDS Summary');

  const rows = records.map((r) => ({
    'Deductee Name': r.deducteeName,
    'PAN': r.pan,
    'Section': r.section,
    'Nature of Payment': r.natureOfPayment,
    'Payment Date': r.paymentDate,
    'Gross Amount (₹)': r.paymentAmount,
    'TDS Base (₹)': r.tdsBase,
    'TDS Rate (%)': r.tdsRate,
    'Expected TDS (₹)': r.expectedTds,
    'Books TDS (₹)': r.booksTds,
    'Reported / 26AS TDS (₹)': r.reportedTds,
    'Deposited TDS (₹)': r.depositedTds,
    'Difference (₹)': r.difference,
    'Challan Number': r.challanNumber,
    'BSR Code': r.bsrCode,
    'Match Status': r.matchStatus,
    'Exception Type': r.exceptionType,
    'Priority': r.priority,
    'Resolution Status': r.resolutionStatus,
    'Remarks': r.remarks || '',
  }));
  const wsRecords = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsRecords, 'TDS Deductions');

  XLSX.writeFile(wb, filename);
}

export function exportToCsv(data: Record<string, any>[], filename = 'export.csv') {
  if (!data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
