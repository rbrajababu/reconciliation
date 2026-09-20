import { GstRecord, TdsRecord, ReconciliationRules, GstMatchStatus, ExceptionPriority } from '../types';

export function normalizeInvoiceNumber(inv: string, rules?: Partial<ReconciliationRules>): string {
  if (!inv) return '';
  let str = inv.trim().toUpperCase();
  if (rules?.ignoreSpecialChars ?? true) {
    str = str.replace(/[^A-Z0-9]/gi, '');
  }
  if (rules?.ignoreLeadingZeros ?? true) {
    str = str.replace(/^0+/, '');
  }
  return str;
}

export function calculateDateDiffDays(date1: string, date2: string): number {
  if (!date1 || !date2) return 999;
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  if (isNaN(d1) || isNaN(d2)) return 999;
  return Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
}

export function reconcileGstDatasets(
  booksInvoices: any[],
  portalInvoices: any[],
  rules: ReconciliationRules
): { records: GstRecord[]; summary: any } {
  const records: GstRecord[] = [];
  const matchedPortalIndices = new Set<number>();
  const seenBookInvoices = new Map<string, number>();

  let exactCount = 0;
  let probableCount = 0;
  let partialCount = 0;
  let missingIn2bCount = 0;
  let duplicateCount = 0;

  let totalBooksTaxable = 0;
  let totalPortalTaxable = 0;
  let totalBooksTax = 0;
  let totalPortalTax = 0;
  let itcAtRiskTotal = 0;

  // Process Books entries
  booksInvoices.forEach((b, bIdx) => {
    const normBookInv = normalizeInvoiceNumber(b.invoiceNumber, rules);
    const bookGstin = (b.supplierGstin || '').trim().toUpperCase();
    const key = `${bookGstin}_${normBookInv}`;

    const isDuplicate = (seenBookInvoices.get(key) || 0) > 0;
    seenBookInvoices.set(key, (seenBookInvoices.get(key) || 0) + 1);

    const booksTaxable = Number(b.taxableValue || b.taxableAmt || b.booksTaxable || 0);
    const booksIgst = Number(b.igst || b.igstAmt || b.booksIgst || 0);
    const booksCgst = Number(b.cgst || b.cgstAmt || b.booksCgst || 0);
    const booksSgst = Number(b.sgst || b.sgstAmt || b.booksSgst || 0);
    const booksCess = Number(b.cess || b.cessAmt || b.booksCess || 0);
    const booksTotalTax = booksIgst + booksCgst + booksSgst + booksCess;
    const booksTotalValue = booksTaxable + booksTotalTax;

    totalBooksTaxable += booksTaxable;
    totalBooksTax += booksTotalTax;

    // Search corresponding in Portal (GSTR-2B)
    let bestPortalIdx = -1;
    let matchStatus: GstMatchStatus = 'Missing in 2B';
    let exceptionType = 'Invoice Missing in GSTR-2B';
    let priority: ExceptionPriority = 'High';

    if (isDuplicate) {
      matchStatus = 'Duplicate';
      exceptionType = 'Duplicate Voucher in Books';
      priority = 'Critical';
      duplicateCount++;
    } else {
      // Look for exact or fuzzy match
      for (let pIdx = 0; pIdx < portalInvoices.length; pIdx++) {
        if (matchedPortalIndices.has(pIdx)) continue;
        const p = portalInvoices[pIdx];
        const portalGstin = (p.supplierGstin || p.portalSupplierGstin || '').trim().toUpperCase();
        const normPortalInv = normalizeInvoiceNumber(p.invoiceNumber || p.portalInvoiceNumber, rules);

        const gstinMatches = bookGstin === portalGstin;
        const invMatches = normBookInv === normPortalInv;

        if (gstinMatches && invMatches) {
          bestPortalIdx = pIdx;
          const pTaxable = Number(p.taxableValue || p.portalTaxable || 0);
          const pTax = Number(p.igst || p.portalIgst || 0) + Number(p.cgst || p.portalCgst || 0) + Number(p.sgst || p.portalSgst || 0);
          const taxableDiff = Math.abs(booksTaxable - pTaxable);
          const taxDiff = Math.abs(booksTotalTax - pTax);
          const dateDiff = calculateDateDiffDays(b.invoiceDate, p.invoiceDate || p.portalInvoiceDate);

          if (taxableDiff <= rules.amountToleranceRupees && taxDiff <= rules.taxToleranceRupees) {
            if (b.invoiceNumber.trim() === (p.invoiceNumber || '').trim()) {
              matchStatus = 'Exact Match';
              exceptionType = 'None';
              priority = 'Low';
              exactCount++;
            } else {
              matchStatus = 'Probable Match';
              exceptionType = 'Invoice Number Format Diff';
              priority = 'Low';
              probableCount++;
            }
          } else {
            matchStatus = 'Partial Match';
            exceptionType = taxableDiff > rules.amountToleranceRupees ? 'Taxable Value Mismatch' : 'Tax Rate / Amount Diff';
            priority = taxableDiff > rules.priorityThresholdHigh ? 'Critical' : 'High';
            partialCount++;
          }
          break;
        }
      }
    }

    let pRec: any = {};
    if (bestPortalIdx !== -1) {
      matchedPortalIndices.add(bestPortalIdx);
      pRec = portalInvoices[bestPortalIdx];
    }

    const portalTaxable = Number(pRec.taxableValue || pRec.portalTaxable || 0);
    const portalIgst = Number(pRec.igst || pRec.portalIgst || 0);
    const portalCgst = Number(pRec.cgst || pRec.portalCgst || 0);
    const portalSgst = Number(pRec.sgst || pRec.portalSgst || 0);
    const portalCess = Number(pRec.cess || pRec.portalCess || 0);
    const portalTotalTax = portalIgst + portalCgst + portalSgst + portalCess;
    const portalTotalValue = portalTaxable + portalTotalTax;

    totalPortalTaxable += portalTaxable;
    totalPortalTax += portalTotalTax;

    if (matchStatus === 'Missing in 2B') {
      missingIn2bCount++;
      itcAtRiskTotal += booksTotalTax;
    } else if (matchStatus === 'Partial Match') {
      itcAtRiskTotal += Math.abs(booksTotalTax - portalTotalTax);
    }

    records.push({
      id: `rec-b-${bIdx + 1}`,
      runId: 'active-run',
      orgId: rules.orgId,
      invoiceNumber: b.invoiceNumber || `INV-${bIdx + 1}`,
      portalInvoiceNumber: pRec.invoiceNumber || pRec.portalInvoiceNumber,
      invoiceDate: b.invoiceDate || '2026-04-01',
      portalInvoiceDate: pRec.invoiceDate || pRec.portalInvoiceDate,
      supplierGstin: bookGstin,
      portalSupplierGstin: pRec.supplierGstin || pRec.portalSupplierGstin,
      supplierName: b.supplierName || pRec.supplierName || 'Unknown Supplier',
      documentType: b.documentType || 'INV',
      booksTaxable,
      booksIgst,
      booksCgst,
      booksSgst,
      booksCess,
      booksTotalTax,
      booksTotalValue,
      portalTaxable,
      portalIgst,
      portalCgst,
      portalSgst,
      portalCess,
      portalTotalTax,
      portalTotalValue,
      taxableDiff: booksTaxable - portalTaxable,
      taxDiff: booksTotalTax - portalTotalTax,
      matchStatus,
      exceptionType,
      priority,
      itcEligibility: matchStatus === 'Exact Match' ? 'Eligible' : matchStatus === 'Missing in 2B' ? 'Pending - Sec 16(2)(aa)' : 'Eligible',
      itcAtRiskAmount: matchStatus === 'Missing in 2B' ? booksTotalTax : Math.abs(booksTotalTax - portalTotalTax),
      resolutionStatus: matchStatus === 'Exact Match' && rules.autoAcceptExactMatches ? 'Resolved' : 'New',
      remarks: matchStatus === 'Exact Match' ? 'Auto-matched' : `Exception: ${exceptionType}`,
      updatedAt: new Date().toISOString(),
    });
  });

  // Check remaining Portal entries missing in Books
  let missingInBooksCount = 0;
  portalInvoices.forEach((p, pIdx) => {
    if (matchedPortalIndices.has(pIdx)) return;
    missingInBooksCount++;
    const portalTaxable = Number(p.taxableValue || p.portalTaxable || 0);
    const portalIgst = Number(p.igst || p.portalIgst || 0);
    const portalCgst = Number(p.cgst || p.portalCgst || 0);
    const portalSgst = Number(p.sgst || p.portalSgst || 0);
    const portalCess = Number(p.cess || p.portalCess || 0);
    const portalTotalTax = portalIgst + portalCgst + portalSgst + portalCess;
    const portalTotalValue = portalTaxable + portalTotalTax;

    totalPortalTaxable += portalTaxable;
    totalPortalTax += portalTotalTax;

    records.push({
      id: `rec-p-${pIdx + 1}`,
      runId: 'active-run',
      orgId: rules.orgId,
      invoiceNumber: p.invoiceNumber || p.portalInvoiceNumber || `PORTAL-${pIdx + 1}`,
      portalInvoiceNumber: p.invoiceNumber || p.portalInvoiceNumber,
      invoiceDate: p.invoiceDate || p.portalInvoiceDate || '2026-04-01',
      portalInvoiceDate: p.invoiceDate || p.portalInvoiceDate,
      supplierGstin: p.supplierGstin || p.portalSupplierGstin || '',
      portalSupplierGstin: p.supplierGstin || p.portalSupplierGstin,
      supplierName: p.supplierName || 'Portal Vendor',
      documentType: 'INV',
      booksTaxable: 0,
      booksIgst: 0,
      booksCgst: 0,
      booksSgst: 0,
      booksCess: 0,
      booksTotalTax: 0,
      booksTotalValue: 0,
      portalTaxable,
      portalIgst,
      portalCgst,
      portalSgst,
      portalCess,
      portalTotalTax,
      portalTotalValue,
      taxableDiff: -portalTaxable,
      taxDiff: -portalTotalTax,
      matchStatus: 'Missing in Books',
      exceptionType: 'Invoice Missing in Books',
      priority: 'Medium',
      itcEligibility: 'Eligible',
      itcAtRiskAmount: 0,
      resolutionStatus: 'New',
      remarks: 'Found in GSTR-2B but no purchase voucher in books.',
      updatedAt: new Date().toISOString(),
    });
  });

  const totalRecords = records.length;
  const matchRate = totalRecords > 0 ? Number(((exactCount + probableCount) / totalRecords * 100).toFixed(1)) : 0;

  return {
    records,
    summary: {
      totalRecords,
      exactCount,
      probableCount,
      partialCount,
      missingIn2bCount,
      missingInBooksCount,
      duplicateCount,
      matchRate,
      totalBooksTaxable,
      totalPortalTaxable,
      totalBooksTax,
      totalPortalTax,
      taxDifference: Math.abs(totalBooksTax - totalPortalTax),
      itcAtRiskTotal,
    },
  };
}

export function formatIndianCurrency(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '₹0.00';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatIndianLakhs(num: number): string {
  if (!num) return '₹ 0.00 L';
  const lakhs = num / 100000;
  return `₹ ${lakhs.toFixed(2)} L`;
}
