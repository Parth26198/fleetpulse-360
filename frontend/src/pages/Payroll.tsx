import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { Api } from '../services/api';
import { PayrollRecord } from '../types';

export const Payroll: React.FC = () => {
  const [data, setData] = useState<{ summary: any; records: PayrollRecord[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(2026);

  const loadPayroll = () => {
    setLoading(true);
    Api.getPayroll(month, year)
      .then((res) => {
        if (res.data.success) {
          setData(res.data.payroll);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayroll();
  }, [month, year]);

  const handleRecalculate = async () => {
    try {
      setLoading(true);
      await Api.recalculatePayroll({ month, year });
      loadPayroll();
    } catch (err: any) {
      alert('Failed to recalculate payroll.');
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await Api.updatePayrollStatus(id, 'APPROVED');
      loadPayroll();
    } catch (err: any) {
      alert('Approval failed.');
    }
  };

  const sm = data?.summary || {};
  const records = data?.records || [];

  const filtered = records.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.employeeCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            EXECUTIVE PAYROLL & PENALTY DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live Linked to Attendance Register • Salary & Late Deduction Rules (2 Late Marks = 1 Absent Day)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecalculate}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
            title="Recalculate from live attendance records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-orange" />
            <span>Sync Attendance</span>
          </button>

          <a
            href={Api.exportPayrollUrl(month, year)}
            className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Payroll (XLSX)</span>
          </a>
        </div>
      </div>

      {/* KPI Cards (Matching MONTHLY_PAYROLL_TRACKER Row 3-6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL WORKFORCE</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{sm.totalWorkforce || 14} Staff</p>
          <p className="text-[10px] text-slate-500">Registered Roster</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OVERALL PRESENT RATE</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{sm.overallPresentRate || 94.8}%</p>
          <p className="text-[10px] text-slate-500">Live Attendance</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL GROSS SALARY</span>
          <p className="text-xl font-extrabold text-blue-600 mt-1">₹{sm.totalGrossSalary?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Budgeted Base</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DEDUCTIONS</span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">₹{sm.totalDeductions?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Absent & Late Penalties</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NET PAYABLE PAYROLL</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">₹{sm.netPayablePayroll?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Ready for Disbursement</p>
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
            placeholder="Search employee in payroll register..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">Verified Rule: 2 Late Marks = 1 Absent Deduction</span>
      </div>

      {/* Payroll Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-2 text-center">Present</th>
                <th className="py-3 px-2 text-center">Absent</th>
                <th className="py-3 px-2 text-center">W/Off</th>
                <th className="py-3 px-2 text-center">Late</th>
                <th className="py-3 px-2 text-center">Late Ded</th>
                <th className="py-3 px-2 text-center">Payable Days</th>
                <th className="py-3 px-3 text-right">Base Salary (₹)</th>
                <th className="py-3 px-3 text-right">Absent Ded (₹)</th>
                <th className="py-3 px-3 text-right">Late Ded (₹)</th>
                <th className="py-3 px-3 text-right">Total Ded (₹)</th>
                <th className="py-3 px-3 text-right font-extrabold text-slate-900">Net Salary (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-sans">
                    <p className="font-bold text-slate-800">{r.name}</p>
                    <p className="text-[10px] text-slate-400">{r.employeeCode} • {r.department}</p>
                  </td>

                  <td className="py-3 px-2 text-center text-emerald-700 font-bold">{r.presentDays}</td>
                  <td className="py-3 px-2 text-center text-rose-700 font-bold">{r.absentDays}</td>
                  <td className="py-3 px-2 text-center text-blue-700 font-bold">{r.weekOffDays}</td>
                  <td className="py-3 px-2 text-center text-amber-700 font-bold">{r.lateMarks}</td>
                  <td className="py-3 px-2 text-center text-amber-800 font-bold bg-amber-50/50">{r.lateDeductionDays}</td>
                  <td className="py-3 px-2 text-center text-slate-900 font-extrabold bg-slate-50">{r.payableDays}</td>

                  <td className="py-3 px-3 text-right text-slate-800">
                    ₹{r.baseSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-600">
                    ₹{r.absentDeduction.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-600">
                    ₹{r.lateDeduction.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-700 font-bold">
                    ₹{r.totalDeductions.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-sm text-slate-900 bg-slate-50/60">
                    ₹{r.netSalary.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-center font-sans">
                    {r.status === 'APPROVED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        APPROVED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        DRAFT
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right font-sans">
                    {r.status !== 'APPROVED' ? (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[10px] transition"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
