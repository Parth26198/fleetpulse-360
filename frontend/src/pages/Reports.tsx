import React from 'react';
import { FileBarChart, Download, FileSpreadsheet, ShieldCheck, CreditCard, Activity, Calendar } from 'lucide-react';
import { Api } from '../services/api';

export const Reports: React.FC = () => {
  const reportsList = [
    {
      title: 'Fleet Statutory Compliance Register',
      description: 'Comprehensive audit register of 28 vehicles including Fitness, Road Tax, Tourist Permit, PUC, and Insurance validity dates, days remaining, and expiry flags.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
      downloadUrl: Api.exportFleetComplianceUrl(),
      format: 'Excel (.xlsx)',
    },
    {
      title: 'Executive Monthly Payroll Register',
      description: 'Monthly payroll calculation sheet with attendance linkages, present/absent counts, late mark penalty deductions (2 Late = 1 Absent), and net payable disbursement ledger.',
      icon: CreditCard,
      color: 'text-blue-600 bg-blue-50',
      downloadUrl: Api.exportPayrollUrl(11, 2026),
      format: 'Excel (.xlsx)',
    },
    {
      title: 'Daily Vehicle Attendance & CNG Tracker',
      description: '24-hour fleet telemetry register showing cab trip volume, operating attendance status, daily and MTD fuel outflow, and 5% CNG recovery surcharge calculation.',
      icon: Activity,
      color: 'text-amber-600 bg-amber-50',
      downloadUrl: Api.exportDailyTrackerUrl(),
      format: 'Excel (.xlsx)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">REPORTS & ANALYTICS CENTER</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, audit, and stream live enterprise registers formatted with automated ExcelJS styling
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${rep.color}`}>
                <rep.icon className="w-6 h-6" />
              </div>

              <h2 className="text-base font-bold text-slate-900 mb-2">{rep.title}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{rep.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-semibold">{rep.format}</span>
              <a
                href={rep.downloadUrl}
                download
                className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
