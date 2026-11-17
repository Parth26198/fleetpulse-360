import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Search, Filter, Fuel, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { Api } from '../services/api';
import { Expense } from '../types';

export const Expenses: React.FC = () => {
  const [data, setData] = useState<{ summary: any; expenses: Expense[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [recoveryFilter, setRecoveryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    expenseDate: '2026-11-16',
    category: 'CNG',
    amount: '',
    paymentMode: 'GPAY',
    paidBy: 'CHHAYA',
    beneficiary: '',
    description: '',
    recoveryStatus: 'UNRECOVER',
  });

  const loadExpenses = () => {
    setLoading(true);
    Api.listExpenses({
      category: categoryFilter || undefined,
      recoveryStatus: recoveryFilter || undefined,
      search: search || undefined,
    })
      .then((res) => {
        if (res.data.success) {
          setData({ summary: res.data.summary, expenses: res.data.expenses });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExpenses();
  }, [categoryFilter, recoveryFilter, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.createExpense({
        ...formData,
        amount: Number(formData.amount),
      });
      setShowAddModal(false);
      setFormData({
        expenseDate: '2026-11-16',
        category: 'CNG',
        amount: '',
        paymentMode: 'GPAY',
        paidBy: 'CHHAYA',
        beneficiary: '',
        description: '',
        recoveryStatus: 'UNRECOVER',
      });
      loadExpenses();
    } catch (err: any) {
      alert('Failed to log expense.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense entry?')) {
      await Api.deleteExpense(id);
      loadExpenses();
    }
  };

  const sm = data?.summary || {};
  const expenses = data?.expenses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            EXPENSE MANAGEMENT & CASH SETTLEMENT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily advance and cash expense settlements, CNG fuel records, office overheads, and vendor payouts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Expense Outflow</span>
        </button>
      </div>

      {/* Summary KPI Cards (Matching EXPENSES_NOV Row 2-4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL OUTFLOW</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{sm.totalOutflow?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Month Ledger</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CNG FUEL TOTAL</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">₹{sm.cngTotal?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Fleet Outflow</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENDING DEDUCTIONS</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">₹{sm.unrecoveredTotal?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Unrecovered Cash</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UNSETTLED EXPENSES</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">₹{sm.unsettledTotal?.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Pending Approval</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search beneficiary or paid by..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-brand-orange"
          >
            <option value="">All Categories</option>
            <option value="CNG">CNG Fuel</option>
            <option value="OFFICE RENT">Office Rent</option>
            <option value="STAFF SALARY">Staff Salary</option>
            <option value="VENDOR PAYMENT">Vendor Payment</option>
            <option value="TOLL">Toll & Parking</option>
          </select>

          <select
            value={recoveryFilter}
            onChange={(e) => setRecoveryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-brand-orange"
          >
            <option value="">All Recovery States</option>
            <option value="UNRECOVER">Unrecovered</option>
            <option value="CLEARED">Cleared / Settled</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4">Pay Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4">Recovery Status</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {exp.expenseDate.split('T')[0]}
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-800 whitespace-nowrap">
                    {exp.category}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700">
                    {exp.beneficiary || 'Office Account'}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{exp.paidBy || 'Admin'}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                      {exp.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {exp.recoveryStatus === 'UNRECOVER' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        UNRECOVER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        CLEARED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {exp.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-brand-orange" />
                <span>Log Commercial Outflow / Cash Advance</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="900"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="CNG">CNG Fuel</option>
                    <option value="DRIVER_SALARY">Driver Salary Advance</option>
                    <option value="OFFICE RENT">Office Rent</option>
                    <option value="VENDOR PAYMENT">Vendor Payment</option>
                    <option value="TOLL">Toll & Parking</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other Operational Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="GPAY">GPAY</option>
                    <option value="ONLINE">ONLINE (NEFT/RTGS)</option>
                    <option value="CASH">CASH</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Beneficiary / Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. SUBHASH MOKALE"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid By</label>
                  <input
                    type="text"
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recovery Status</label>
                  <select
                    value={formData.recoveryStatus}
                    onChange={(e) => setFormData({ ...formData, recoveryStatus: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="UNRECOVER">UNRECOVER (Pending)</option>
                    <option value="CLEARED">CLEARED (Settled)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg font-semibold shadow transition"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
