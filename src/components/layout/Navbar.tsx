import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Sparkles,
  User as UserIcon,
  Bell,
  ChevronDown,
  ShieldCheck,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  CloudOff,
  UserCheck
} from 'lucide-react';
import { Organization, UserProfile, UserRole } from '../../types';

interface NavbarProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  currentGstin?: string;
  onSelectGstin?: (g: string) => void;
  financialYear?: string;
  onChangeFinancialYear?: (fy: string) => void;
  user?: UserProfile | null;
  currentUser?: { email: string; name: string; role: UserRole; isGuest?: boolean } | null;
  onOpenAuth?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onOpenAiDrawer: () => void;
  onSelectRole?: (role: UserRole) => void;
  onExportExcel?: () => void;
  activePeriod?: string;
  period?: string;
  onChangePeriod?: (p: string) => void;
  exceptionCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  currentGstin,
  onSelectGstin,
  financialYear = '2026-27',
  onChangeFinancialYear,
  user,
  currentUser,
  onOpenAuth,
  onOpenAuthModal,
  onSignOut,
  onOpenAiDrawer,
  onSelectRole,
  onExportExcel,
  activePeriod,
  period,
  onChangePeriod,
  exceptionCount = 0,
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayPeriod = period || activePeriod || 'April 2026';
  const handleAuthClick = onOpenAuthModal || onOpenAuth || (() => {});
  const isGuestUser = Boolean(currentUser?.isGuest);

  const activeUser = currentUser
    ? { displayName: currentUser.name, email: currentUser.email, role: currentUser.role, isGuest: currentUser.isGuest }
    : user
    ? { displayName: user.displayName, email: user.email, role: user.role, isGuest: user.isGuest }
    : null;

  const notifications = [
    { id: 1, title: 'Reconciliation Completed', desc: 'April 2026 GSTR-2B vs Books processed with 95.3% match.', time: '10m ago', type: 'success' },
    { id: 2, title: 'High-Value ITC at Risk', desc: '₹61,200 ITC missing in 2B for AWS India Pvt Ltd.', time: '25m ago', type: 'alert' },
    { id: 3, title: 'TDS Short Deduction', desc: 'Advocate Rameshwar Bhargav deducted @ 2% instead of 10%.', time: '1h ago', type: 'alert' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-extrabold text-lg text-white shadow-inner tracking-tight">
              RB
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">RECONCILIATION WITH RB</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  TAX AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Smart Reconciliation. Accurate Compliance. Better Control.
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden lg:block mx-2" />

          {/* Organization Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentOrg.name}</span>
              {currentOrg.isDemo && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-1 rounded uppercase">
                  DEMO DATA
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showOrgDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Organization
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      onSelectOrg(org);
                      setShowOrgDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      org.id === currentOrg.id ? 'text-blue-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span>{org.name}</span>
                        {org.isDemo && (
                          <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 rounded">DEMO</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{org.defaultGstin}</div>
                    </div>
                    {org.id === currentOrg.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800/80 rounded-md border border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Period:</span>
            <select
              value={displayPeriod}
              onChange={(e) => onChangePeriod && onChangePeriod(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="April 2026" className="bg-slate-900">April 2026</option>
              <option value="May 2026" className="bg-slate-900">May 2026</option>
              <option value="June 2026" className="bg-slate-900">June 2026</option>
              <option value="Q1 (Apr - Jun) 2026" className="bg-slate-900">Q1 (Apr - Jun) 2026</option>
            </select>
          </div>

          {/* Ask RB AI Button */}
          <button
            onClick={onOpenAiDrawer}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow transition transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Ask RB AI</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {exceptionCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-blue-400 cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guest indicator */}
          {isGuestUser && (
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
              <CloudOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>In-Memory Session • Zero DB Persistence</span>
            </div>
          )}

          {/* User / Auth */}
          <div className="relative flex items-center space-x-2">
            {isGuestUser ? (
              <>
                <button
                  id="guest-user-menu-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700/80 border border-amber-500/50 transition"
                  title="Guest Mode: No login required. Reconcile in memory without saving to database."
                >
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    G
                  </div>
                  <div className="text-left hidden md:block">
                    <div id="user-name-display" className="text-xs font-bold text-amber-200 tracking-wide leading-tight">
                      Guest User
                    </div>
                    <div className="text-[10px] text-amber-300/90 font-medium">No Login Required</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  id="guest-signin-btn"
                  onClick={handleAuthClick}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold transition shadow-sm"
                  title="Sign in with credentials to enable cloud persistence"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              </>
            ) : activeUser ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {activeUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div id="user-name-display" className="text-xs font-semibold text-slate-100 tracking-wide leading-tight">
                    {activeUser.displayName}
                  </div>
                  <div className="text-[10px] text-blue-400 font-semibold">{activeUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={handleAuthClick}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                {isGuestUser ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">Guest User (Without Login)</p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700">
                          In-Memory Mode
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Reconciliation runs locally in your browser memory. <strong>No data is saved to any database.</strong> When you leave or refresh, temporary session data is cleared.
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      {onExportExcel && (
                        <button
                          onClick={() => {
                            onExportExcel();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-slate-800 rounded flex items-center space-x-2 transition font-semibold"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Export Reconciled Excel Workbook</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleAuthClick();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-400 hover:bg-slate-800 rounded flex items-center space-x-2 transition font-medium"
                      >
                        <LogIn className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span>Sign In / Connect Cloud Account</span>
                      </button>
                    </div>
                  </>
                ) : activeUser ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{activeUser.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{activeUser.email}</p>
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {activeUser.role}
                      </div>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Role (RBAC)
                    </div>
                    {([
                      'Super Admin',
                      'Senior Tax Manager',
                      'Tax Auditor / Reviewer',
                      'Accountant',
                    ] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onSelectRole && onSelectRole(r);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                          activeUser.role === r ? 'text-blue-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <span>{r}</span>
                        {activeUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    ))}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        onSignOut && onSignOut();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-slate-800 rounded flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-amber-400" />
                      <span>Log Out to Guest Mode</span>
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
