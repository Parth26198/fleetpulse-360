import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  CheckCircle2,
  X,
  FileCheck,
  Search,
} from 'lucide-react';
import { Api } from '../services/api';
import { Vehicle } from '../types';

export const Compliance: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DONE' | 'EXPIRING SOON' | 'EXPIRED'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [docModal, setDocModal] = useState({
    show: false,
    vehicleId: '',
    regNo: '',
    docType: 'FITNESS',
    expiryDate: '',
    documentNumber: '',
  });

  const loadData = () => {
    setLoading(true);
    Api.listVehicles({ status: 'ACTIVE' })
      .then((res) => {
        if (res.data.success) setVehicles(res.data.vehicles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const compliantCount = vehicles.filter((v) => v.complianceStatus === 'DONE').length;
  const expiringSoonCount = vehicles.filter((v) => v.complianceStatus === 'EXPIRING SOON').length;
  const expiredCount = vehicles.filter((v) => v.complianceStatus === 'EXPIRED').length;
  const totalCabs = vehicles.length;
  const complianceRate = totalCabs > 0 ? Number(((compliantCount / totalCabs) * 100).toFixed(1)) : 0;

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.updateDocument(docModal.vehicleId, docModal.docType, {
        expiryDate: docModal.expiryDate,
        documentNumber: docModal.documentNumber,
      });
      setDocModal({ show: false, vehicleId: '', regNo: '', docType: 'FITNESS', expiryDate: '', documentNumber: '' });
      loadData();
    } catch (err: any) {
      alert('Failed to update document.');
    }
  };

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== 'ALL' && v.complianceStatus !== statusFilter) return false;
    if (search && !v.registrationNumber.toLowerCase().includes(search.toLowerCase()) && !v.assignedDriver?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            FLEET COMPLIANCE & EXPIRY DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time statutory tracking: Fitness, Road Tax, Tourist Permit, PUC, and Comprehensive Insurance
          </p>
        </div>

        <a
          href={Api.exportFleetComplianceUrl()}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Compliance Register (XLSX)</span>
        </a>
      </div>

      {/* KPI Cards (Matching vehicels complince row 2-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ACTIVE CABS</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalCabs}</p>
          <p className="text-xs text-slate-500 mt-1">Active Fleet in Circulation</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">COMPLIANT (DONE)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{compliantCount}</p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">{complianceRate}% Compliant Rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">EXPIRING SOON</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">{expiringSoonCount}</p>
          <p className="text-xs text-slate-500 mt-1">Renewal Due ≤ 30 Days</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">EXPIRED</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600 mt-2">{expiredCount}</p>
          <p className="text-xs text-rose-600 font-bold mt-1">Immediate Action Required</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {(['ALL', 'DONE', 'EXPIRING SOON', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? st === 'EXPIRED'
                    ? 'bg-rose-600 text-white'
                    : st === 'EXPIRING SOON'
                    ? 'bg-amber-500 text-white'
                    : st === 'DONE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-navy-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cab or driver..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>
      </div>

      {/* Compliance Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Fitness</th>
                <th className="py-3 px-3">Road Tax</th>
                <th className="py-3 px-3">Permit</th>
                <th className="py-3 px-3">PUC</th>
                <th className="py-3 px-3">Insurance</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Days Left</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => {
                const docMap = new Map<string, string>();
                for (const d of v.vehicleDocuments || []) {
                  if (d.expiryDate) {
                    docMap.set(d.documentType, new Date(d.expiryDate).toISOString().split('T')[0]);
                  }
                }

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {v.registrationNumber}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{v.assignedDriver?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-400">{v.assignedDriver?.phone}</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {docMap.get('FITNESS') || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {docMap.get('TAX') || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {docMap.get('PERMIT') || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {docMap.get('PUC') || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {docMap.get('INSURANCE') || '—'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {v.complianceStatus === 'DONE' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          DONE
                        </span>
                      )}
                      {v.complianceStatus === 'EXPIRING SOON' && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          EXPIRING SOON
                        </span>
                      )}
                      {v.complianceStatus === 'EXPIRED' && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          EXPIRED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                      {typeof v.daysRemaining === 'number' ? (
                        v.daysRemaining < 0 ? (
                          <span className="text-rose-600">{v.daysRemaining}d</span>
                        ) : v.daysRemaining <= 30 ? (
                          <span className="text-amber-600">{v.daysRemaining}d</span>
                        ) : (
                          <span className="text-slate-600">{v.daysRemaining}d</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          setDocModal({
                            show: true,
                            vehicleId: v.id,
                            regNo: v.registrationNumber,
                            docType: 'FITNESS',
                            expiryDate: '',
                            documentNumber: '',
                          })
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition"
                      >
                        Renew
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Document Modal */}
      {docModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-brand-orange" />
                <span>Renew Document — {docModal.regNo}</span>
              </h2>
              <button
                onClick={() => setDocModal({ ...docModal, show: false })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                <select
                  value={docModal.docType}
                  onChange={(e) => setDocModal({ ...docModal, docType: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="FITNESS">Fitness Certificate</option>
                  <option value="TAX">Road Tax Receipt</option>
                  <option value="PERMIT">Tourist/Contract Carriage Permit</option>
                  <option value="PUC">Pollution Under Control (PUC)</option>
                  <option value="INSURANCE">Commercial Insurance Policy</option>
                  <option value="REGISTRATION">RC / Registration</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={docModal.expiryDate}
                  onChange={(e) => setDocModal({ ...docModal, expiryDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document / Policy Number</label>
                <input
                  type="text"
                  value={docModal.documentNumber}
                  onChange={(e) => setDocModal({ ...docModal, documentNumber: e.target.value })}
                  placeholder="e.g. POL-9828-2027"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocModal({ ...docModal, show: false })}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg font-semibold shadow transition"
                >
                  Save & Update Expiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
