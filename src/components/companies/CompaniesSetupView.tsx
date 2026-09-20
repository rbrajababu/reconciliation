import React, { useState } from 'react';
import { Building, Plus, CheckCircle2, MapPin, Hash, ShieldCheck, Edit3 } from 'lucide-react';
import { Organization, GstinProfile } from '../../types';

interface CompaniesSetupViewProps {
  organizations: Organization[];
  currentOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  onAddOrganization: (newOrg: Organization) => void;
}

export const CompaniesSetupView: React.FC<CompaniesSetupViewProps> = ({
  organizations,
  currentOrg,
  onSelectOrg,
  onAddOrganization,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newTan, setNewTan] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newState, setNewState] = useState('Maharashtra');

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newGstin) return;

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newCompanyName,
      legalName: newCompanyName,
      tradeName: newCompanyName,
      pan: newPan || newGstin.substring(2, 12),
      tan: newTan || 'BLRA12345F',
      defaultGstin: newGstin,
      state: newState,
      stateCode: newGstin.substring(0, 2) || '27',
      financialYear: '2026-27',
      booksPeriod: 'April 2026',
      gstins: [
        {
          gstin: newGstin,
          tradeName: newCompanyName,
          state: newState,
          registrationType: 'Regular',
        },
      ],
    };

    onAddOrganization(newOrg);
    onSelectOrg(newOrg);
    setShowAddModal(false);
    setNewCompanyName('');
    setNewPan('');
    setNewTan('');
    setNewGstin('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                Multi-Entity & Branch Hierarchy
              </span>
              <span className="text-xs text-slate-500">Corporate Master</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Companies, GSTINs & TAN Setup
            </h1>
            <p className="text-xs text-slate-600">
              Manage client companies, multi-state GSTIN registrations, and deductor TAN profiles for CA firms and corporate groups.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {organizations.map((org) => {
          const isSelected = org.id === currentOrg.id;
          return (
            <div
              key={org.id}
              className={`p-5 rounded-xl border transition relative ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/20 shadow-md ring-1 ring-blue-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{org.name}</span>
                      {org.isDemo && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          DEMO DATA
                        </span>
                      )}
                    </h2>
                    <p className="text-slate-500 text-[11px] font-mono">PAN: {org.pan} | TAN: {org.tan}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="flex items-center text-xs text-blue-600 font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectOrg(org)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Switch to Org
                  </button>
                )}
              </div>

              {/* GSTIN List */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered GSTIN Branches ({org.gstins.length})
                </span>
                {org.gstins.map((g) => (
                  <div
                    key={g.gstin}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{g.gstin}</span>
                      <span className="text-slate-500 block text-[10px]">{g.tradeName} ({g.state})</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {g.registrationType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add New Company / Client</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Entity Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Reliance Retail Ventures Ltd"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Default 15-Digit GSTIN *</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAACR1234E1Z5"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Entity PAN (10-Digit)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newPan}
                    onChange={(e) => setNewPan(e.target.value.toUpperCase())}
                    placeholder="e.g. AAACR1234E"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deductor TAN (10-Digit)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newTan}
                    onChange={(e) => setNewTan(e.target.value.toUpperCase())}
                    placeholder="e.g. MUMA12345E"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State / Jurisdiction</label>
                <select
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Maharashtra">Maharashtra (27)</option>
                  <option value="Karnataka">Karnataka (29)</option>
                  <option value="Delhi">Delhi (07)</option>
                  <option value="Gujarat">Gujarat (24)</option>
                  <option value="Tamil Nadu">Tamil Nadu (33)</option>
                  <option value="Telangana">Telangana (36)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save & Activate Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
