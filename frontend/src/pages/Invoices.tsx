import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Plus, Download, CheckCircle2, AlertCircle, DollarSign, X } from 'lucide-react';
import { Api } from '../services/api';
import { Invoice, Client } from '../types';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [payModal, setPayModal] = useState({
    show: false,
    invoiceId: '',
    invoiceNum: '',
    balanceAmount: 0,
    amount: '',
  });

  const loadInvoices = () => {
    setLoading(true);
    Promise.all([Api.listInvoices(statusFilter || undefined), Api.listClients()])
      .then(([invRes, cliRes]) => {
        if (invRes.data.success) setInvoices(invRes.data.invoices);
        if (cliRes.data.success) setClients(cliRes.data.clients);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.recordPayment(payModal.invoiceId, Number(payModal.amount));
      setPayModal({ show: false, invoiceId: '', invoiceNum: '', balanceAmount: 0, amount: '' });
      loadInvoices();
    } catch (err: any) {
      alert('Failed to record payment.');
    }
  };

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            INVOICE & BILLING MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Corporate client tax invoices, payment receipts, outstanding receivables, and automated PDF billing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700">
            Total Invoices: {invoices.length}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL BILLED VALUE</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalBilled.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">All Client Accounts</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COLLECTED REVENUE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-700 font-semibold">Cleared Payments</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OUTSTANDING BALANCE</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-rose-600 font-bold">Receivables Due</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {['', 'PAID', 'SENT', 'PARTIAL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-navy-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st || 'All Invoices'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Corporate Client</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4 text-right">Subtotal (₹)</th>
                <th className="py-3 px-4 text-right">Total Payable (₹)</th>
                <th className="py-3 px-4 text-right">Paid (₹)</th>
                <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                    {inv.client?.name || 'Corporate Client'}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{inv.invoiceDate.split('T')[0]}</td>
                  <td className="py-3 px-4 text-right text-slate-700">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 font-bold">
                    ₹{inv.balanceAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-center font-sans">
                    {inv.status === 'PAID' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        PAID
                      </span>
                    ) : inv.status === 'PARTIAL' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        PARTIAL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        SENT
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-sans space-x-1.5 whitespace-nowrap">
                    {inv.balanceAmount > 0 && (
                      <button
                        onClick={() =>
                          setPayModal({
                            show: true,
                            invoiceId: inv.id,
                            invoiceNum: inv.invoiceNumber,
                            balanceAmount: inv.balanceAmount,
                            amount: String(inv.balanceAmount),
                          })
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition"
                      >
                        Pay
                      </button>
                    )}

                    <a
                      href={Api.downloadInvoicePdfUrl(inv.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded text-[11px] inline-flex items-center space-x-1 transition"
                      title="Download PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Record Client Payment</span>
              </h2>
              <button onClick={() => setPayModal({ ...payModal, show: false })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <p className="text-slate-600 mb-1">
                  Invoice #: <b>{payModal.invoiceNum}</b>
                </p>
                <p className="text-slate-600">
                  Remaining Balance: <b className="text-rose-600 font-mono">₹{payModal.balanceAmount.toLocaleString('en-IN')}</b>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payModal.amount}
                  onChange={(e) => setPayModal({ ...payModal, amount: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModal({ ...payModal, show: false })}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow transition"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
