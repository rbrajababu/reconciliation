import { Organization, GstRecord, TdsRecord, ReconciliationRun, AuditLogEntry, ReconciliationRules, CurrentUser } from '../types';

export const GUEST_USER: CurrentUser = {
  email: 'guest@session.local',
  name: 'Guest User',
  role: 'Guest / Reviewer',
  isGuest: true,
};

export const GUEST_ORGANIZATION: Organization = {
  id: 'org-guest-recon',
  name: 'Guest Tax Reconciliation',
  legalName: 'Guest Tax Reconciliation Workspace',
  tradeName: 'Guest Tax Solutions',
  pan: 'AAAPG0000Z',
  tan: 'MUMG00000Z',
  defaultGstin: '27AAAPG0000Z1Z5',
  state: 'Maharashtra',
  stateCode: '27',
  financialYear: '2026-27',
  booksPeriod: 'April 2026',
  isDemo: false,
  gstins: [
    {
      gstin: '27AAAPG0000Z1Z5',
      tradeName: 'Guest Entity - Primary GSTIN',
      state: 'Maharashtra',
      registrationType: 'Regular',
    },
  ],
};

export const PRIMARY_ORGANIZATION: Organization = {
  id: 'org-rb-tax',
  name: 'Raja Babu & Associates',
  legalName: 'Raja Babu & Associates Tax Advisory LLP',
  tradeName: 'Raja Babu Tax Solutions',
  pan: 'AABCR1204B',
  tan: 'DELR12045E',
  defaultGstin: '07AABCR1204B1Z2',
  state: 'Delhi',
  stateCode: '07',
  financialYear: '2026-27',
  booksPeriod: 'April 2026',
  isDemo: false,
  gstins: [
    {
      gstin: '07AABCR1204B1Z2',
      tradeName: 'Raja Babu & Associates - HO Delhi',
      state: 'Delhi',
      registrationType: 'Regular',
    },
    {
      gstin: '27AABCR1204B1Z9',
      tradeName: 'Raja Babu & Associates - Mumbai Operations',
      state: 'Maharashtra',
      registrationType: 'Regular',
    },
  ],
};

// Backwards compatibility alias
export const DEMO_ORGANIZATION = PRIMARY_ORGANIZATION;

export const DEFAULT_RULES: ReconciliationRules = {
  orgId: 'org-rb-tax',
  dateToleranceDays: 5,
  amountToleranceRupees: 1.0,
  taxToleranceRupees: 0.5,
  fuzzyThresholdPercent: 85,
  ignoreLeadingZeros: true,
  ignoreSpecialChars: true,
  autoAcceptExactMatches: true,
  priorityThresholdCritical: 50000,
  priorityThresholdHigh: 10000,
};

export const INITIAL_GST_INWARD_RUN: ReconciliationRun = {
  id: 'run-gst-inward-apr26',
  orgId: 'org-rb-tax',
  type: 'GST_INWARD',
  period: 'April 2026',
  financialYear: '2026-27',
  gstinOrTan: '07AABCR1204B1Z2',
  status: 'Draft',
  totalRecords: 0,
  matchedCount: 0,
  probableCount: 0,
  partialCount: 0,
  unmatchedCount: 0,
  duplicateCount: 0,
  matchRate: 0,
  booksTotalValue: 0,
  portalTotalValue: 0,
  booksTaxAmount: 0,
  portalTaxAmount: 0,
  taxDifference: 0,
  itcAtRisk: 0,
  createdAt: new Date().toISOString(),
};

export const INITIAL_GST_OUTWARD_RUN: ReconciliationRun = {
  id: 'run-gst-outward-apr26',
  orgId: 'org-rb-tax',
  type: 'GST_OUTWARD',
  period: 'April 2026',
  financialYear: '2026-27',
  gstinOrTan: '07AABCR1204B1Z2',
  status: 'Draft',
  totalRecords: 0,
  matchedCount: 0,
  probableCount: 0,
  partialCount: 0,
  unmatchedCount: 0,
  duplicateCount: 0,
  matchRate: 0,
  booksTotalValue: 0,
  portalTotalValue: 0,
  booksTaxAmount: 0,
  portalTaxAmount: 0,
  taxDifference: 0,
  itcAtRisk: 0,
  potentialTaxExposure: 0,
  createdAt: new Date().toISOString(),
};

export const INITIAL_TDS_RUN: ReconciliationRun = {
  id: 'run-tds-q1-2627',
  orgId: 'org-rb-tax',
  type: 'TDS',
  period: 'Q1 (Apr - Jun) 2026',
  financialYear: '2026-27',
  gstinOrTan: 'DELR12045E',
  status: 'Draft',
  totalRecords: 0,
  matchedCount: 0,
  probableCount: 0,
  partialCount: 0,
  unmatchedCount: 0,
  duplicateCount: 0,
  matchRate: 0,
  booksTotalValue: 0,
  portalTotalValue: 0,
  booksTaxAmount: 0,
  portalTaxAmount: 0,
  taxDifference: 0,
  itcAtRisk: 0,
  potentialTaxExposure: 0,
  createdAt: new Date().toISOString(),
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    orgId: 'org-rb-tax',
    userId: 'rajababu57268@gmail.com',
    userEmail: 'rajababu57268@gmail.com',
    userName: 'Raja Babu',
    userRole: 'Senior Tax Manager',
    action: 'Workspace Configured & Cleaned',
    module: 'AUTH',
    details: 'User authenticated as Raja Babu (Senior Tax Manager). Demo records purged. Clean ledger workspace initialized.',
    timestamp: new Date().toISOString(),
  },
];

// Aliases for compatibility
export const SAMPLE_GST_INWARD_RUN = INITIAL_GST_INWARD_RUN;
export const SAMPLE_GST_OUTWARD_RUN = INITIAL_GST_OUTWARD_RUN;
export const SAMPLE_TDS_RUN = INITIAL_TDS_RUN;
export const SAMPLE_GST_RECORDS: GstRecord[] = [];
export const SAMPLE_TDS_RECORDS: TdsRecord[] = [];
export const SAMPLE_AUDIT_LOGS = INITIAL_AUDIT_LOGS;

// Default clean export sets (Demo Data Removed)
export const mockOrganizations = [PRIMARY_ORGANIZATION];
export const mockDefaultRules = DEFAULT_RULES;
export const mockGstRun = INITIAL_GST_INWARD_RUN;
export const mockGstOutwardRun = INITIAL_GST_OUTWARD_RUN;
export const mockTdsRun = INITIAL_TDS_RUN;
export const mockGstRecords: GstRecord[] = [];
export const mockTdsRecords: TdsRecord[] = [];
export const mockAuditLogs: AuditLogEntry[] = INITIAL_AUDIT_LOGS;
