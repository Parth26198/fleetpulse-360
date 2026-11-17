import React, { useEffect, useState } from 'react';
import {
  Activity,
  Fuel,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit2,
  X,
  Search,
  Calendar,
} from 'lucide-react';
import { Api } from '../services/api';
import { DailyTrackerRow } from '../types';

export const DailyTracker: React.FC = () => {
  const [data, setData] = useState<{ summary: any; vehicles: DailyTrackerRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({
    show: false,
    vehicleId: '',
    regNo: '',
    cngToday: '',
  });

  const loadTracker = () => {
    setLoading(true);
    Api.getDailyTracker()
      .then((res) => {
        if (res.data.success) {
          setData({ summary: res.data.summary, vehicles: res.data.vehicles });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTracker();
  }, []);

  const handleUpdateCng = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.updateVehicleCng({
        vehicleId: editModal.vehicleId,
        cngToday: Number(editModal.cngToday),
      });
      setEditModal({ show: false, vehicleId: '', regNo: '', cngToday: '' });
      loadTracker();
    } catch (err: any) {
      alert('Failed to update CNG.');
    }
  };

  const sm = data?.summary || {};
  const vehicles = data?.vehicles || [];

  const filtered = vehicles.filter((v) => {
    if (search && !v.registrationNumber.toLowerCase().includes(search.toLowerCase()) && !v.assignedDriverName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            DAILY VEHICLE ATTENDANCE & CNG TRACKER
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            24-Hour fleet telemetry, trip threshold attendance, and automated 5% CNG recovery surcharge calculation
          </p>
        </div>

        <a
          href={Api.exportDailyTrackerUrl()}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Tracker Register (XLSX)</span>
        </a>
      </div>

      {/* KPI Telemetry Cards (Matching DAILY_VEHICLE_TRACKER Row 3-5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ACTIVE FLEET</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{sm.totalFleet}</p>
          <p className="text-[10px] text-slate-500">Registered Cabs</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PRESENT</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{sm.presentCount}</p>
          <p className="text-[10px] text-slate-500">Trips &gt; 0 in 24 Hrs</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ABSENT</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{sm.absentCount}</p>
          <p className="text-[10px] text-slate-500">Zero Trips Logged</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FLEET UTILIZATION</span>
          <p className="text-2xl font-extrabold text-brand-orange mt-1">{sm.fleetUtilization}%</p>
          <p className="text-[10px] text-slate-500">% Operating Today</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CNG (MTD)</span>
          <p className="text-xl font-extrabold text-blue-600 mt-1">₹{sm.totalMtdCng?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Month Outflow</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RECOVERABLE CNG</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">₹{sm.totalRecoverableOutflow?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Includes 5% Surcharge</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Cab or Assigned Driver..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">24-Hour Live Window</span>
      </div>

      {/* Tracker Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Cab Registration</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4 text-center">24-Hr Trips</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4 text-right">Today CNG (₹)</th>
                <th className="py-3 px-4 text-right">MTD CNG Total (₹)</th>
                <th className="py-3 px-4 text-right">CNG Recovery (5%)</th>
                <th className="py-3 px-4 text-right">Total Recoverable (₹)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map((v) => (
                <tr key={v.vehicleId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{v.registrationNumber}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                    <div>
                      <span>{v.assignedDriverName}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{v.driverPhone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-sm text-slate-900">
                    {v.tripCount}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {v.attendanceStatus === 'PRESENT' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Present
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Absent
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">
                    ₹{v.cngExpenseToday.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">
                    ₹{v.cngExpenseMtd.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-600 font-bold">
                    ₹{v.cngRecoveryAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-extrabold">
                    ₹{v.totalRecoverableCng.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() =>
                        setEditModal({
                          show: true,
                          vehicleId: v.vehicleId,
                          regNo: v.registrationNumber,
                          cngToday: String(v.cngExpenseToday || ''),
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-slate-100 rounded transition"
                      title="Update Today's CNG"
                    >
                      <Fuel className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update CNG Modal */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-brand-orange" />
                <span>Log Today CNG — {editModal.regNo}</span>
              </h2>
              <button
                onClick={() => setEditModal({ ...editModal, show: false })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCng} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Today CNG Outflow Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editModal.cngToday}
                  onChange={(e) => setEditModal({ ...editModal, cngToday: e.target.value })}
                  placeholder="e.g. 700"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-brand-orange outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  System will automatically update MTD CNG total and recalculate 5% CNG recovery surcharge.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ ...editModal, show: false })}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg font-semibold shadow transition"
                >
                  Save Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
