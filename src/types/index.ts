export type UserRole =
  | 'Super Admin'
  | 'Senior Tax Manager'
  | 'Organization Admin'
  | 'Tax Auditor / Reviewer'
  | 'Accountant'
  | 'Accountant / Data Entry'
  | 'Viewer'
  | 'Guest / Reviewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  currentOrgId: string;
  isGuest?: boolean;
}

export interface CurrentUser {
  email: string;
  name: string;
  role: UserRole;
  isGuest?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  tradeName: string;
  pan: string;
  tan: string;
  defaultGstin: string;
  state: string;
  stateCode: string;
  financialYear: string;
  booksPeriod: string;
  gstins: GstinProfile[];
  isDemo?: boolean;
}

export interface GstinProfile {
  gstin: string;
  tradeName: string;
  state: string;
  registrationType: 'Regular' | 'Composition' | 'SEZ' | 'ISD';
}

export type GstMatchStatus =
  | 'Exact Match'
  | 'Probable Match'
  | 'Partial Match'
  | 'Timing Difference'
  | 'Missing in 2B'
  | 'Missing in Books'
  | 'Duplicate';

export type ExceptionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ResolutionStatus =
  | 'New'
  | 'Under Review'
  | 'Clarification Required'
  | 'Resolved'
  | 'Ignored';

export interface GstRecord {
  id: string;
  runId: string;
  orgId: string;
  invoiceNumber: string;
  portalInvoiceNumber?: string;
  invoiceDate: string;
  portalInvoiceDate?: string;
  supplierGstin: string;
  portalSupplierGstin?: string;
  supplierName: string;
  documentType: 'INV' | 'CRN' | 'DBN';
  // Books values
  booksTaxable: number;
  booksIgst: number;
  booksCgst: number;
  booksSgst: number;
  booksCess: number;
  booksTotalTax: number;
  booksTotalValue: number;
  // GSTR-2B values
  portalTaxable: number;
  portalIgst: number;
  portalCgst: number;
  portalSgst: number;
  portalCess: number;
  portalTotalTax: number;
  portalTotalValue: number;
  // Differences
  taxableDiff: number;
  taxDiff: number;
  // Classification
  matchStatus: GstMatchStatus;
  exceptionType: string;
  priority: ExceptionPriority;
  itcEligibility: 'Eligible' | 'Ineligible - Sec 17(5)' | 'Pending - Sec 16(2)(aa)' | 'Reversal Required';
  itcAtRiskAmount: number;
  // Workflow
  resolutionStatus: ResolutionStatus;
  assignedTo?: string;
  reviewer?: string;
  remarks?: string;
  hasAttachment?: boolean;
  updatedAt: string;
}

export type TdsMatchStatus =
  | 'Exact Match'
  | 'Probable Match'
  | 'Short Deduction'
  | 'Excess Deduction'
  | 'PAN Mismatch'
  | 'Challan Mismatch'
  | 'Unmatched'
  | 'Timing Difference';

export interface TdsRecord {
  id: string;
  runId: string;
  orgId: string;
  deducteeName: string;
  pan: string;
  portalPan?: string;
  section: string; // e.g. 194C, 194J, 194I, 194Q
  natureOfPayment: string;
  invoiceDate: string;
  paymentDate: string;
  paymentAmount: number;
  tdsBase: number;
  tdsRate: number; // e.g. 1, 2, 10
  expectedTds: number;
  booksTds: number;
  reportedTds: number;
  depositedTds: number;
  difference: number;
  challanNumber: string;
  bsrCode: string;
  challanDate: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  financialYear: string;
  matchStatus: TdsMatchStatus;
  exceptionType: string;
  priority: ExceptionPriority;
  resolutionStatus: ResolutionStatus;
  remarks?: string;
  updatedAt: string;
}

export interface ReconciliationRun {
  id: string;
  orgId: string;
  type: 'GST_INWARD' | 'GST_OUTWARD' | 'TDS';
  period: string;
  financialYear: string;
  gstinOrTan: string;
  status: 'Draft' | 'Processing' | 'Completed' | 'Reviewed' | 'Finalized';
  totalRecords: number;
  matchedCount: number;
  probableCount: number;
  partialCount: number;
  unmatchedCount: number;
  duplicateCount: number;
  matchRate: number;
  booksTotalValue: number;
  portalTotalValue: number;
  booksTaxAmount: number;
  portalTaxAmount: number;
  taxDifference: number;
  itcAtRisk: number;
  potentialTaxExposure?: number;
  runDate?: string;
  exactMatchCount?: number;
  probableMatchCount?: number;
  missingInPortalCount?: number;
  missingInBooksCount?: number;
  taxDifferenceCount?: number;
  itcAtRiskTotal?: number;
  taxDifferenceTotal?: number;
  createdAt: string;
  finalizedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  orgId?: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  userRole?: string;
  action: string;
  module: 'GST' | 'TDS' | 'AUTH' | 'RULES' | 'EXPORT' | 'AI' | 'COMPANY';
  details: string;
  timestamp: string;
}

export interface ReconciliationRules {
  orgId: string;
  dateToleranceDays: number;
  amountToleranceRupees: number;
  taxToleranceRupees: number;
  fuzzyThresholdPercent: number;
  ignoreLeadingZeros: boolean;
  ignoreSpecialChars: boolean;
  autoAcceptExactMatches: boolean;
  priorityThresholdCritical: number; // e.g. > 50000
  priorityThresholdHigh: number; // e.g. > 10000
}

export interface ColumnMappingTemplate {
  name: string;
  type: 'GSTR2B' | 'PURCHASE_REGISTER' | 'TDS_REGISTER' | 'FORM26AS';
  mappings: Record<string, string>;
}
