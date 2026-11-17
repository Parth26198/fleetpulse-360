import React, { useEffect, useState } from 'react';
import { UserCheck, Search, Building2, Phone, MapPin, DollarSign, Plus } from 'lucide-react';
import api from '../services/api';
import { Employee } from '../types';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    // Attendance register API returns all employees with full details
    api.get('/attendance')
      .then((res) => {
        if (res.data.success) {
          const list = res.data.register.employees.map((e: any) => ({
            id: e.employeeId,
            employeeCode: e.employeeCode,
            name: e.name,
            department: e.department,
            roleTitle: e.roleTitle,
            shiftTiming: e.shiftTiming,
            emergencyContact: e.emergencyContact,
            location: e.location,
            baseSalary: 15000,
            status: 'ACTIVE',
          }));
          setEmployees(list);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    if (deptFilter && !e.department.toLowerCase().includes(deptFilter.toLowerCase())) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.employeeCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EMPLOYEE MASTER DIRECTORY</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active workforce roster, departmental roles, shifts, and salary allocations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-bold">
            Total Staff: {employees.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or code..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-brand-orange"
        >
          <option value="">All Departments</option>
          <option value="Admin">Admin</option>
          <option value="Operations">Operations</option>
          <option value="Billing">Billing & MIS</option>
          <option value="Accounts">Accounts</option>
          <option value="Driver">Drivers</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Emp Code</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Shift Timing</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.employeeCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{emp.name}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{emp.department}</p>
                    <p className="text-[11px] text-slate-400">{emp.roleTitle}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{emp.shiftTiming || 'General Shift'}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{emp.emergencyContact || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{emp.location || 'OFFICE'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {emp.status}
                    </span>
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
