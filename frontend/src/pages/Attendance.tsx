import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  X,
  Calendar,
} from 'lucide-react';
import { Api } from '../services/api';
import { AttendanceRow } from '../types';

export const Attendance: React.FC = () => {
  const [register, setRegister] = useState<{ month: number; year: number; daysInMonth: number; employees: AttendanceRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [markModal, setMarkModal] = useState({
    show: false,
    employeeId: '',
    employeeName: '',
    date: '2026-11-16',
    status: 'PRESENT',
    checkIn: '09:30',
    checkOut: '18:30',
  });

  const loadAttendance = () => {
    setLoading(true);
    Api.getAttendanceRegister(11, 2026)
      .then((res) => {
        if (res.data.success) {
          setRegister(res.data.register);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.markAttendance({
        employeeId: markModal.employeeId,
        date: markModal.date,
        status: markModal.status,
        checkIn: markModal.checkIn,
        checkOut: markModal.checkOut,
      });
      setMarkModal({ show: false, employeeId: '', employeeName: '', date: '2026-11-16', status: 'PRESENT', checkIn: '09:30', checkOut: '18:30' });
      loadAttendance();
    } catch (err: any) {
      alert('Failed to record attendance.');
    }
  };

  const employees = register?.employees || [];
  const daysInMonth = register?.daysInMonth || 30;

  const filtered = employees.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.employeeCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            MONTHLY ATTENDANCE REGISTER & WORKFORCE TRACKER
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            November 2026 Live Register • Automated late marks detection & penalty deduction rules (2 Late = 1 Absent)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-sm flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
            <span>Cycle: <b>November 2026</b></span>
          </div>
        </div>
      </div>

      {/* Search & Legend Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-1.5" /> P = Present</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-rose-500 mr-1.5" /> A = Absent</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-blue-400 mr-1.5" /> W/O = Week Off</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-amber-500 mr-1.5" /> L = Late Mark</span>
        </div>
      </div>

      {/* 30-Day Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-navy-800 text-white font-bold border-b border-navy-700">
                <th className="py-2.5 px-3 sticky left-0 bg-navy-800 z-10 w-44">Employee Name</th>
                <th className="py-2.5 px-2 text-center text-slate-300">Role</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <th key={d} className="py-2 px-1.5 text-center font-mono text-[10px] w-7 text-slate-300">
                    {d}
                  </th>
                ))}
                <th className="py-2.5 px-2 text-center bg-navy-900 text-emerald-400">Present</th>
                <th className="py-2.5 px-2 text-center bg-navy-900 text-rose-400">Absent</th>
                <th className="py-2.5 px-2 text-center bg-navy-900 text-blue-300">W/Off</th>
                <th className="py-2.5 px-2 text-center bg-navy-900 text-amber-300">Late</th>
                <th className="py-2.5 px-2 text-center bg-navy-900 text-amber-400">Ded Days</th>
                <th className="py-2.5 px-2 text-center bg-navy-900 text-white font-extrabold">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 font-bold text-slate-900 sticky left-0 bg-white z-10 whitespace-nowrap shadow-sm">
                    <button
                      onClick={() =>
                        setMarkModal({
                          show: true,
                          employeeId: emp.employeeId,
                          employeeName: emp.name,
                          date: '2026-11-16',
                          status: 'PRESENT',
                          checkIn: '09:30',
                          checkOut: '18:30',
                        })
                      }
                      className="text-left hover:text-brand-orange transition"
                      title="Click to mark attendance"
                    >
                      {emp.name}
                    </button>
                    <p className="text-[9px] text-slate-400">{emp.employeeCode}</p>
                  </td>

                  <td className="py-2 px-2 text-slate-500 whitespace-nowrap text-[10px]">
                    {emp.department}
                  </td>

                  {/* Days 1 - 30 */}
                  {emp.days.map((dayObj) => (
                    <td key={dayObj.day} className="py-2 px-1 text-center font-mono font-bold text-[10px]">
                      {dayObj.status === 'PRESENT' && (
                        dayObj.isLate ? (
                          <span className="text-amber-600 bg-amber-50 px-1 rounded" title={dayObj.checkIn || 'Late'}>
                            L
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-1 rounded" title={dayObj.checkIn || 'Present'}>
                            P
                          </span>
                        )
                      )}
                      {dayObj.status === 'ABSENT' && (
                        <span className="text-rose-600 bg-rose-50 px-1 rounded">A</span>
                      )}
                      {dayObj.status === 'WEEK_OFF' && (
                        <span className="text-blue-500 bg-blue-50 px-1 rounded text-[9px]">WO</span>
                      )}
                    </td>
                  ))}

                  {/* Summaries matching Excel Attendance Register */}
                  <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40">
                    {emp.summary.presentDays}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/40">
                    {emp.summary.absentDays}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-blue-700 bg-blue-50/40">
                    {emp.summary.weekOffDays}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-amber-700 bg-amber-50/40">
                    {emp.summary.lateMarks}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-amber-800 bg-amber-100/50">
                    {emp.summary.lateDeductionDays}
                  </td>
                  <td className="py-2 px-2 text-center font-extrabold text-slate-900 bg-slate-100">
                    {emp.summary.payableDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {markModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-brand-orange" />
                <span>Mark Attendance — {markModal.employeeName}</span>
              </h2>
              <button onClick={() => setMarkModal({ ...markModal, show: false })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkAttendance} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attendance Date</label>
                <input
                  type="date"
                  required
                  value={markModal.date}
                  onChange={(e) => setMarkModal({ ...markModal, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attendance Status</label>
                <select
                  value={markModal.status}
                  onChange={(e) => setMarkModal({ ...markModal, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="PRESENT">Present (P)</option>
                  <option value="ABSENT">Absent (A)</option>
                  <option value="WEEK_OFF">Week Off (W/O)</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Paid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-in Time</label>
                  <input
                    type="time"
                    value={markModal.checkIn}
                    onChange={(e) => setMarkModal({ ...markModal, checkIn: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Late mark if &gt; 10:00 AM</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-out Time</label>
                  <input
                    type="time"
                    value={markModal.checkOut}
                    onChange={(e) => setMarkModal({ ...markModal, checkOut: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMarkModal({ ...markModal, show: false })}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg font-semibold shadow transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
