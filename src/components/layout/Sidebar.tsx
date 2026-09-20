import React from 'react';
import {
  LayoutDashboard,
  FileCheck,
  Receipt,
  UploadCloud,
  AlertOctagon,
  ShieldAlert,
  Users,
  FileSpreadsheet,
  History,
  Sliders,
  Building,
  Settings2,
  HelpCircle,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'gst-reconcile'
  | 'tds-reconcile'
  | 'data-upload'
  | 'exceptions'
  | 'itc-tracker'
  | 'vendors'
  | 'reports'
  | 'audit-trail'
  | 'rules'
  | 'companies'
  | 'admin';

interface SidebarProps {
  currentTab?: NavTab | string;
  activeNav?: string;
  onSelectTab?: (tab: NavTab) => void;
  onSelectNav?: (nav: any) => void;
  userRole?: UserRole;
  pendingExceptionsCount?: number;
  exceptionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeNav,
  onSelectTab,
  onSelectNav,
  userRole = 'Senior Tax Manager',
  pendingExceptionsCount,
  exceptionCount = 0,
}) => {
  const rawTab = activeNav || currentTab || 'dashboard';
  const tabMap: Record<string, string> = {
    'DASHBOARD': 'dashboard',
    'GST_RECON': 'gst-reconcile',
    'TDS_RECON': 'tds-reconcile',
    'DATA_IMPORT': 'data-upload',
    'EXCEPTIONS': 'exceptions',
    'ITC_DASHBOARD': 'itc-tracker',
    'VENDOR_ANALYSIS': 'vendors',
    'REPORTS': 'reports',
    'AUDIT_TRAIL': 'audit-trail',
    'RULES': 'rules',
    'COMPANIES': 'companies',
    'ADMIN': 'admin',
  };
  const reverseMap: Record<string, string> = {
    'dashboard': 'DASHBOARD',
    'gst-reconcile': 'GST_RECON',
    'tds-reconcile': 'TDS_RECON',
    'data-upload': 'DATA_IMPORT',
    'exceptions': 'EXCEPTIONS',
    'itc-tracker': 'ITC_DASHBOARD',
    'vendors': 'VENDOR_ANALYSIS',
    'reports': 'REPORTS',
    'audit-trail': 'AUDIT_TRAIL',
    'rules': 'RULES',
    'companies': 'COMPANIES',
    'admin': 'ADMIN',
  };

  const activeId = tabMap[rawTab] || rawTab;
  const totalExceptions = exceptionCount || pendingExceptionsCount || 0;

  const handleSelect = (id: string) => {
    if (onSelectNav) {
      onSelectNav(reverseMap[id] || id);
    }
    if (onSelectTab) {
      onSelectTab(id as NavTab);
    }
  };
  const mainNavItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'gst-reconcile', label: 'GST Reconciliation', icon: FileCheck, badge: 'Inward & Outward' },
    { id: 'tds-reconcile', label: 'TDS Reconciliation', icon: Receipt, badge: '26Q / 24Q' },
    { id: 'data-upload', label: 'Data Import & Mapping', icon: UploadCloud },
    {
      id: 'exceptions',
      label: 'Exceptions & Triage',
      icon: AlertOctagon,
      count: totalExceptions,
    },
    { id: 'itc-tracker', label: 'ITC Risk Center', icon: ShieldAlert, badge: 'Sec 16(2)(aa)' },
    { id: 'vendors', label: 'Vendors & Deductees', icon: Users },
  ];

  const secondaryNavItems = [
    { id: 'reports', label: 'Reports & Excel Pack', icon: FileSpreadsheet },
    { id: 'audit-trail', label: 'Audit Trail Logs', icon: History },
    { id: 'rules', label: 'Reconciliation Rules', icon: Sliders },
    { id: 'companies', label: 'Company & GSTINs', icon: Building },
  ];

  if (userRole === 'Super Admin') {
    secondaryNavItems.push({ id: 'admin', label: 'Super Admin Control', icon: Settings2 });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-6">
        
        {/* Main Workflows */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Reconciliation Engine
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-blue-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {item.badge && !item.count && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Administration & Audit */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Compliance & Governance
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
            Rules Engine v2.4
          </span>
          <span className="font-mono text-[10px] text-slate-500">GST+TDS</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
          Audit-ready reconciliation aligned with CGST Sec 16(2)(aa) & TDS Sec 194C/J.
        </p>
      </div>
    </aside>
  );
};
