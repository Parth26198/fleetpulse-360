import React, { useEffect, useState } from 'react';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Users,
  Route,
  Activity,
  CreditCard,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, selectedCompanyId } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Api.getDashboardStats(selectedCompanyId || undefined)
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, [selectedCompanyId]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Calculating Live Executive Metrics...</p>
      </div>
    );
  }

  const ov = stats?.overview || {};
  const charts = stats?.charts || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            EXECUTIVE OPERATIONS OVERVIEW
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live consolidated operational, financial and compliance telemetry for{' '}
            <span className="font-semibold text-slate-700">{user?.company.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-brand-orange mr-1.5" />
            <span>Pay Cycle: <b>November 2026</b></span>
          </div>

          <a
            href={Api.exportFleetComplianceUrl()}
            className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export XLS</span>
          </a>
        </div>
      </div>

      {/* Row 1: Primary C-Suite KPI Cards (Matching EXECUTIVE SUMMARY Row 3-6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fleet Compliance Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Fleet Compliance Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{ov.complianceRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <CheckCircle className="w-3 h-3 mr-0.5" /> Valid
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Expiring Soon: <b>{ov.expiringSoonDocs}</b></span>
            <span>Expired: <b className="text-rose-600">{ov.expiredDocs}</b></span>
          </div>
        </div>

        {/* Card 2: Total Monthly Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Month Outflow
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{ov.totalExpenses?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">MTD</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>CNG Fuel: <b>₹{ov.cngExpenses?.toLocaleString('en-IN')}</b></span>
            <span>Misc & Rent: <b>₹{(ov.totalExpenses - ov.cngExpenses)?.toLocaleString('en-IN')}</b></span>
          </div>
        </div>

        {/* Card 3: Recoverable Cash */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recoverable Cash
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600">
              ₹{ov.totalRecoverableCash?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-amber-600 font-semibold">Unrecovered</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Advances Pending</span>
            <span className="font-semibold text-slate-700">5% CNG Surcharge</span>
          </div>
        </div>

        {/* Card 4: Active Workforce & Present Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Workforce
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{ov.totalWorkforce} Staff</span>
            <span className="text-xs text-emerald-600 font-semibold">{ov.overallPresentRate}% Present</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Net Payroll: <b>₹{ov.netPayablePayroll?.toLocaleString('en-IN')}</b></span>
            <span>Penalty Ded: <b>₹{ov.totalDeductions?.toLocaleString('en-IN')}</b></span>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Fleet</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{ov.activeVehicles} / {ov.totalVehicles}</p>
          <p className="text-[10px] text-slate-500">{ov.stoppedVehicles} Stopped Cabs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicles Operating</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{ov.presentToday} Present</p>
          <p className="text-[10px] text-slate-500">{ov.absentToday} Absent Today</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Fleet Utilization</span>
          <p className="text-xl font-extrabold text-brand-orange mt-1">{ov.fleetUtilization}%</p>
          <p className="text-[10px] text-slate-500">24-Hour Telemetry</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Trips Today</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{ov.totalDailyTrips}</p>
          <p className="text-[10px] text-slate-500">{ov.pickupsIn} In / {ov.dropsOut} Out</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Task Completion</span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">{ov.taskCompletionRate}%</p>
          <p className="text-[10px] text-slate-500">{ov.completedTasks} Done / {ov.totalTasks} Total</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Statutory Alerts</span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{ov.expiredDocs + ov.expiringSoonDocs}</p>
          <p className="text-[10px] text-slate-500">Renewals Due</p>
        </div>
      </div>

      {/* Row 3: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 14-Day Trip Volume Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">DAILY DISPATCH & TRIP TRENDS</h2>
              <p className="text-[11px] text-slate-400">14-Day volume breakdown by shift directions (Pickups vs Drops)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Avg: 38 Trips/Day
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.tripTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="pickups" name="Pickups (IN)" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="drops" name="Drops (OUT)" fill="#0F172A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Fleet Compliance Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">FLEET COMPLIANCE STATUS</h2>
            <p className="text-[11px] text-slate-400">Statutory document validity distribution</p>
          </div>

          <div className="h-52 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.complianceBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.complianceBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {(charts.complianceBreakdown || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-bold text-slate-800">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Expense Breakdown & Department Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">MONTHLY EXPENSE DISTRIBUTION</h2>
              <p className="text-[11px] text-slate-400">Categorical breakdown of cash outflow</p>
            </div>
            <span className="text-xs font-bold text-slate-800">
              ₹{ov.totalExpenses?.toLocaleString('en-IN')} Total
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.expenseBreakdown || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                />
                <Bar dataKey="value" fill="#F97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Tasks Quick View */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">ACTIVE DEPARTMENT WORKFLOWS</h2>
                <p className="text-[11px] text-slate-400">Live task management feeds</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {ov.processingTasks} In Progress
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">SHREEJ CLOSED OCT MIS AND FUEL EXP</p>
                  <p className="text-[11px] text-slate-400">Billing & MIS • Assignee: SHREEJ</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  Not Started
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">OFFICE VEH CONTROL AND MONITERNING SHEDUEL 24/7</p>
                  <p className="text-[11px] text-slate-400">Administration • Assignee: SHRAVAN</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  Not Started
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">CLOSED ALL OCT EXPAINSEC & UPDATE NEW VEH INDUCTION</p>
                  <p className="text-[11px] text-slate-400">Fleet & Induction • Assignee: CHHAYA</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                  Processing
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">CLOSED PENDING INDUCTION FOR WAITING VEH ASAP</p>
                  <p className="text-[11px] text-slate-400">Operations • Assignee: RAHUL_P</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  Not Started
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Completion Target: 100%</span>
            <a href="/tasks" className="text-brand-orange font-semibold hover:underline flex items-center">
              View All Tasks <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
