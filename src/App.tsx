import React, { useState, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { GstReconciliationView } from './components/gst/GstReconciliationView';
import { TdsReconciliationView } from './components/tds/TdsReconciliationView';
import { DataImportView } from './components/upload/DataImportView';
import { ExceptionsWorkflowView } from './components/exceptions/ExceptionsWorkflowView';
import { ItcDashboardView } from './components/itc/ItcDashboardView';
import { VendorAnalysisView } from './components/vendors/VendorAnalysisView';
import { ReconciliationRulesView } from './components/rules/ReconciliationRulesView';
import { ReportsCenterView } from './components/reports/ReportsCenterView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { CompaniesSetupView } from './components/companies/CompaniesSetupView';
import { AdminControlPanelView } from './components/admin/AdminControlPanelView';
import { AskRbAiDrawer } from './components/ai/AskRbAiDrawer';
import { ReconciliationChatbot } from './components/ai/ReconciliationChatbot';
import { AuthModal } from './components/auth/AuthModal';

import {
  mockOrganizations,
  mockGstRecords,
  mockTdsRecords,
  mockGstRun,
  mockTdsRun,
  mockAuditLogs,
  mockDefaultRules,
  GUEST_USER,
} from './data/mockIndianData';

import {
  Organization,
  GstRecord,
  TdsRecord,
  ReconciliationRun,
  ReconciliationRules,
  AuditLogEntry,
  UserRole,
  CurrentUser,
} from './types';

import { exportGstReconciliationExcel, exportTdsReconciliationExcel, exportToCsv } from './lib/excelExport';
import {
  db,
  auth,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  serverTimestamp,
} from './lib/firebase';
import { CloudOff, Download, LogIn, MessageSquare } from 'lucide-react';

export function App() {
  // Navigation
  const [activeNav, setActiveNav] = useState<string>('DASHBOARD');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Entities & Context
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [currentOrg, setCurrentOrg] = useState<Organization>(mockOrganizations[0]);
  const [currentGstin, setCurrentGstin] = useState<string>(mockOrganizations[0].defaultGstin);
  const [financialYear, setFinancialYear] = useState<string>('2026-27');
  const [period, setPeriod] = useState<string>('April 2026');

  // User & Auth: Default to Guest User without login (reconciliation in-memory, zero DB persistence)
  const [currentUser, setCurrentUser] = useState<CurrentUser>(GUEST_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cloudSyncState, setCloudSyncState] = useState<'synced' | 'syncing' | 'ready'>('ready');

  // Core Data
  const [gstRecords, setGstRecords] = useState<GstRecord[]>(mockGstRecords);
  const [tdsRecords, setTdsRecords] = useState<TdsRecord[]>(mockTdsRecords);
  const [gstRun, setGstRun] = useState<ReconciliationRun>(mockGstRun);
  const [tdsRun, setTdsRun] = useState<ReconciliationRun>(mockTdsRun);
  const [rules, setRules] = useState<ReconciliationRules>(mockDefaultRules);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);

  // AI Drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Gemini Reconciliation Chatbot
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatActiveRecord, setChatActiveRecord] = useState<GstRecord | TdsRecord | null>(null);
  const [chatActiveRecordType, setChatActiveRecordType] = useState<'GST' | 'TDS'>('GST');

  const handleOpenChatWithRecord = (record?: GstRecord | TdsRecord, type: 'GST' | 'TDS' = 'GST') => {
    if (record) {
      setChatActiveRecord(record);
      setChatActiveRecordType(type);
    } else {
      setChatActiveRecord(null);
    }
    setIsChatbotOpen(true);
  };

  // Selected item for detail view across views
  const [selectedGstRecord, setSelectedGstRecord] = useState<GstRecord | null>(null);

  // Ensure logged out into guest mode by default on startup
  React.useEffect(() => {
    // Explicitly sign out of Firebase auth on startup to ensure guest session
    signOut(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentUser({
          email: user.email,
          name: user.displayName || (user.email === 'rajababu57268@gmail.com' ? 'Raja Babu' : user.email.split('@')[0]),
          role: 'Senior Tax Manager',
          isGuest: false,
        });
        setCloudSyncState('synced');
      } else {
        // Guest user without login
        setCurrentUser(GUEST_USER);
        setCloudSyncState('ready');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setCurrentUser(GUEST_USER);
    setCloudSyncState('ready');
    logAudit(
      'Switched to Guest Session',
      'AUTH',
      'Logged out from cloud account. Switched to in-memory guest user mode (zero database saves).'
    );
  };

  const handleLogin = (user: { email: string; name: string; role: UserRole }) => {
    setCurrentUser({
      ...user,
      isGuest: false,
    });
    setCloudSyncState('synced');
    logAudit(
      'Authenticated via Login',
      'AUTH',
      `User signed in as ${user.name} (${user.role}). Cloud database persistence enabled.`
    );
  };

  const handleContinueAsGuest = () => {
    signOut(auth).catch(() => {});
    setCurrentUser(GUEST_USER);
    setCloudSyncState('ready');
  };

  // Helper: Log audit entry and sync to Firestore
  const logAudit = (action: string, module: 'GST' | 'TDS' | 'RULES' | 'EXPORT' | 'AI' | 'AUTH', details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Guest Mode Check: Do NOT persist anything to Firestore!
    if (currentUser.isGuest) {
      return;
    }

    // Persist to Firestore asynchronously for authenticated users only
    try {
      setDoc(doc(db, 'organizations', currentOrg.id, 'auditLogs', newLog.id), {
        orgId: currentOrg.id,
        userId: currentUser.email,
        userEmail: currentUser.email,
        action: `${module}: ${action}`,
        details,
        timestamp: newLog.timestamp,
        serverTime: serverTimestamp(),
      }).catch((err) => {
        console.warn('Firestore audit log persist notice:', err?.message);
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Record update handlers
  const handleUpdateGstRecord = (updatedRecord: GstRecord) => {
    setGstRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    logAudit(
      'Updated GST Exception Status',
      'GST',
      `Invoice ${updatedRecord.invoiceNumber} status set to ${updatedRecord.resolutionStatus}`
    );

    // Guest Mode Check: In-memory only, do NOT save to database
    if (currentUser.isGuest) {
      return;
    }

    // Sync to Firestore for authenticated users
    try {
      setCloudSyncState('syncing');
      setDoc(doc(db, 'organizations', currentOrg.id, 'gstRecords', updatedRecord.id), {
        orgId: currentOrg.id,
        invoiceNumber: updatedRecord.invoiceNumber,
        invoiceDate: updatedRecord.invoiceDate,
        supplierGstin: updatedRecord.supplierGstin,
        supplierName: updatedRecord.supplierName,
        booksTaxable: updatedRecord.booksTaxable,
        portalTaxable: updatedRecord.portalTaxable,
        taxDifference: updatedRecord.taxDiff,
        matchStatus: updatedRecord.matchStatus,
        exceptionType: updatedRecord.exceptionType || 'None',
        itcStatus: updatedRecord.itcEligibility,
        resolutionStatus: updatedRecord.resolutionStatus,
        remarks: updatedRecord.remarks || '',
        updatedAt: serverTimestamp(),
      })
        .then(() => setCloudSyncState('synced'))
        .catch(() => setCloudSyncState('synced'));
    } catch (e) {
      setCloudSyncState('synced');
    }
  };

  const handleUpdateTdsRecord = (updatedRecord: TdsRecord) => {
    setTdsRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    logAudit(
      'Updated TDS Deduction Status',
      'TDS',
      `Deductee ${updatedRecord.deducteeName} status set to ${updatedRecord.resolutionStatus}`
    );

    // Guest Mode Check: In-memory only, do NOT save to database
    if (currentUser.isGuest) {
      return;
    }

    // Sync to Firestore for authenticated users
    try {
      setCloudSyncState('syncing');
      setDoc(doc(db, 'organizations', currentOrg.id, 'tdsRecords', updatedRecord.id), {
        orgId: currentOrg.id,
        deducteeName: updatedRecord.deducteeName,
        pan: updatedRecord.pan,
        section: updatedRecord.section,
        paymentDate: updatedRecord.paymentDate,
        paymentAmount: updatedRecord.paymentAmount,
        booksTds: updatedRecord.booksTds,
        reportedTds: updatedRecord.reportedTds,
        difference: updatedRecord.difference,
        matchStatus: updatedRecord.matchStatus,
        exceptionType: updatedRecord.exceptionType || 'None',
        resolutionStatus: updatedRecord.resolutionStatus,
        updatedAt: serverTimestamp(),
      })
        .then(() => setCloudSyncState('synced'))
        .catch(() => setCloudSyncState('synced'));
    } catch (e) {
      setCloudSyncState('synced');
    }
  };

  // Reconcile Complete from File Upload
  const handleReconcileComplete = (newRecords: GstRecord[], summary: any) => {
    setGstRecords(newRecords);
    const updatedRun: ReconciliationRun = {
      ...gstRun,
      id: `run-${Date.now()}`,
      runDate: new Date().toISOString(),
      totalRecords: summary.totalRecords,
      exactMatchCount: summary.exactMatchCount,
      probableMatchCount: summary.probableMatchCount,
      missingInPortalCount: summary.missingInPortalCount,
      missingInBooksCount: summary.missingInBooksCount,
      taxDifferenceCount: summary.taxDifferenceCount,
      matchRate: summary.matchRate,
      itcAtRiskTotal: summary.itcAtRiskTotal,
      taxDifferenceTotal: summary.taxDifferenceTotal,
    };
    setGstRun(updatedRun);
    logAudit(
      'Executed Reconciliation Run',
      'GST',
      `Imported and matched ${summary.totalRecords} records. Match rate: ${summary.matchRate}%`
    );

    // Guest Mode Check: In-memory reconciliation only, zero data saved to database
    if (currentUser.isGuest) {
      setActiveNav('GST_RECON');
      return;
    }

    // Persist run to Firestore for authenticated users
    try {
      setCloudSyncState('syncing');
      setDoc(doc(db, 'organizations', currentOrg.id, 'runs', updatedRun.id), {
        orgId: currentOrg.id,
        type: 'GST_INWARD',
        period: updatedRun.period || 'April 2026',
        financialYear: financialYear,
        status: 'Completed',
        totalRecords: updatedRun.totalRecords,
        matchedCount: (updatedRun.exactMatchCount || 0) + (updatedRun.probableMatchCount || 0),
        unmatchedCount: (updatedRun.missingInPortalCount || 0) + (updatedRun.missingInBooksCount || 0),
        partialCount: updatedRun.taxDifferenceCount || 0,
        taxDifference: updatedRun.taxDifferenceTotal || 0,
        itcAtRisk: updatedRun.itcAtRiskTotal || 0,
        createdAt: updatedRun.runDate,
        updatedAt: serverTimestamp(),
      })
        .then(() => setCloudSyncState('synced'))
        .catch(() => setCloudSyncState('synced'));
    } catch (e) {
      setCloudSyncState('synced');
    }

    setActiveNav('GST_RECON');
  };

  // Export handlers
  const handleExportGstExcel = () => {
    exportGstReconciliationExcel(gstRecords, gstRun);
    logAudit('Exported GST Audit Pack', 'EXPORT', `Generated multi-worksheet Excel workbook for ${gstRun.period}`);
  };

  const handleExportTdsExcel = () => {
    // Generate TDS Excel schedule
    exportTdsReconciliationExcel(tdsRecords, tdsRun);
    logAudit('Exported TDS Audit Pack', 'EXPORT', `Generated TDS 26Q/24Q schedule for ${tdsRun.period}`);
  };

  const handleExportGstCsv = () => {
    exportToCsv(gstRecords, 'Reconciliation_With_RB_GST_Invoices');
    logAudit('Exported GST CSV', 'EXPORT', 'Exported comma-separated invoice file');
  };

  const handleExportTdsCsv = () => {
    exportToCsv(tdsRecords, 'Reconciliation_With_RB_TDS_Deductions');
    logAudit('Exported TDS CSV', 'EXPORT', 'Exported comma-separated TDS deduction file');
  };

  const exceptionCount = useMemo(() => {
    return gstRecords.filter((r) => r.matchStatus !== 'Exact Match').length;
  }, [gstRecords]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={(org) => {
          setCurrentOrg(org);
          setCurrentGstin(org.defaultGstin);
          logAudit('Switched Active Company', 'AUTH', `Switched workspace to ${org.name}`);
        }}
        currentGstin={currentGstin}
        onSelectGstin={setCurrentGstin}
        financialYear={financialYear}
        onChangeFinancialYear={setFinancialYear}
        period={period}
        onChangePeriod={setPeriod}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onSelectRole={(role) => setCurrentUser((prev) => ({ ...prev, role }))}
        onExportExcel={handleExportGstExcel}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        exceptionCount={exceptionCount}
      />

      {/* Guest Mode Banner */}
      {currentUser.isGuest && (
        <div
          id="guest-mode-banner"
          className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs"
        >
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
              <CloudOff className="w-3 h-3 mr-1 text-amber-700" />
              Guest User (Without Login)
            </span>
            <span className="text-slate-700 font-medium">
              Reconcile data directly in browser memory. <strong className="text-amber-900 font-semibold">No data is saved to any database.</strong> Reconciled registers can be exported to Excel / CSV anytime.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="guest-banner-chatbot-btn"
              onClick={() => {
                setChatActiveRecord(null);
                setIsChatbotOpen(true);
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded font-semibold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chatbot Help</span>
            </button>
            <button
              id="guest-banner-export-btn"
              onClick={handleExportGstExcel}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 rounded font-semibold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Reconciled Excel</span>
            </button>
            <button
              id="guest-banner-signin-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      )}

      {/* Main App Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop & Mobile Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={(nav) => {
            setActiveNav(nav);
            setIsMobileSidebarOpen(false);
          }}
          exceptionCount={exceptionCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          
          {activeNav === 'DASHBOARD' && (
            <MainDashboard
              gstRun={gstRun}
              tdsRun={tdsRun}
              gstRecords={gstRecords}
              tdsRecords={tdsRecords}
              onNavigate={setActiveNav}
              onExportExcel={handleExportGstExcel}
              onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
            />
          )}

          {activeNav === 'GST_RECON' && (
            <GstReconciliationView
              records={gstRecords}
              onUpdateRecord={handleUpdateGstRecord}
              onExportExcel={handleExportGstExcel}
              onExportCsv={handleExportGstCsv}
              onOpenUpload={() => setActiveNav('DATA_IMPORT')}
              onOpenChatWithRecord={(record) => handleOpenChatWithRecord(record, 'GST')}
            />
          )}

          {activeNav === 'TDS_RECON' && (
            <TdsReconciliationView
              records={tdsRecords}
              onUpdateRecord={handleUpdateTdsRecord}
              onExportExcel={handleExportTdsExcel}
              onExportCsv={handleExportTdsCsv}
              onOpenChatWithRecord={(record) => handleOpenChatWithRecord(record, 'TDS')}
            />
          )}

          {activeNav === 'DATA_IMPORT' && (
            <DataImportView
              rules={rules}
              onReconcileComplete={handleReconcileComplete}
            />
          )}

          {activeNav === 'EXCEPTIONS' && (
            <ExceptionsWorkflowView
              records={gstRecords}
              onUpdateRecord={handleUpdateGstRecord}
              onSelectRecordToView={(rec) => {
                setSelectedGstRecord(rec);
                setActiveNav('GST_RECON');
              }}
              onOpenChatWithRecord={(record) => handleOpenChatWithRecord(record, 'GST')}
            />
          )}

          {activeNav === 'ITC_DASHBOARD' && (
            <ItcDashboardView
              records={gstRecords}
              onExportExcel={handleExportGstExcel}
            />
          )}

          {activeNav === 'VENDOR_ANALYSIS' && (
            <VendorAnalysisView
              records={gstRecords}
              companyName={currentOrg.name}
              companyGstin={currentGstin}
            />
          )}

          {activeNav === 'RULES' && (
            <ReconciliationRulesView
              rules={rules}
              onSaveRules={(updatedRules) => {
                setRules(updatedRules);
                logAudit('Modified Reconciliation Rules', 'RULES', 'Updated tolerance windows and matching expressions');
              }}
            />
          )}

          {activeNav === 'REPORTS' && (
            <ReportsCenterView
              onExportGstExcel={handleExportGstExcel}
              onExportTdsExcel={handleExportTdsExcel}
              onExportGstCsv={handleExportGstCsv}
              onExportTdsCsv={handleExportTdsCsv}
              gstRun={gstRun}
              tdsRun={tdsRun}
            />
          )}

          {activeNav === 'AUDIT_TRAIL' && (
            <AuditTrailView logs={auditLogs} />
          )}

          {activeNav === 'COMPANIES' && (
            <CompaniesSetupView
              organizations={organizations}
              currentOrg={currentOrg}
              onSelectOrg={(org) => {
                setCurrentOrg(org);
                setCurrentGstin(org.defaultGstin);
              }}
              onAddOrganization={(newOrg) => {
                setOrganizations((prev) => [...prev, newOrg]);
                logAudit('Added New Company', 'AUTH', `Registered company ${newOrg.name}`);
              }}
            />
          )}

          {activeNav === 'ADMIN' && (
            <AdminControlPanelView />
          )}

        </main>
      </div>

      {/* Floating Action Trigger Buttons */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center space-x-2.5">
        <button
          id="open-gemini-chatbot-btn"
          onClick={() => {
            setChatActiveRecord(null);
            setIsChatbotOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 transition transform hover:scale-105 border border-white/25 cursor-pointer text-xs font-bold"
          title="Open Gemini Reconciliation Chatbot Assistant"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <MessageSquare className="w-4 h-4" />
          <span>Gemini Chatbot</span>
        </button>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-105 border border-slate-700 cursor-pointer"
          title="Open Smart Query & Tax Law Drawer"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
            RB
          </div>
        </button>
      </div>

      {/* Multi-turn Gemini Reconciliation Chatbot Modal / Overlay */}
      <ReconciliationChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        activeRecord={chatActiveRecord}
        activeRecordType={chatActiveRecordType}
        onClearActiveRecord={() => setChatActiveRecord(null)}
        companyName={currentOrg.name}
        gstin={currentGstin}
        financialYear={financialYear}
      />

      {/* Slide-over Ask RB AI Drawer */}
      <AskRbAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onOpenLiveChatbot={() => setIsChatbotOpen(true)}
        onApplyQueryFilter={(filters) => {
          setActiveNav('GST_RECON');
          setIsAiDrawerOpen(false);
        }}
      />

      {/* Auth / Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />

    </div>
  );
}

export default App;
