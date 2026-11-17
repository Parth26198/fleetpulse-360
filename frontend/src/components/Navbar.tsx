import React, { useState } from 'react';
import { Search, Bell, Building, Shield, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, companies, selectedCompanyId, setSelectedCompanyId } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
      {/* Left: Tenant Display & Global Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-2xl">
        {/* Tenant Organization Badge */}
        <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800">
          <Building className="w-4 h-4 text-brand-orange" />
          <span>{user?.company.name}</span>
          {user?.role === 'SUPER_ADMIN' && companies.length > 0 && (
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="ml-2 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 font-normal outline-none focus:border-brand-orange"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicles, drivers, trips, invoices..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition"
          />
        </div>
      </div>

      {/* Right: Actions, Alerts, User Badge */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Operational Alerts</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">11 Vehicles Expiring Soon</p>
                    <p className="text-[11px] text-slate-500">Statutory fitness/insurance due within 30 days.</p>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 flex items-start space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">October Payroll Verified</p>
                    <p className="text-[11px] text-slate-500">Net salary ₹2,62,548 approved by director.</p>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">5 Expired Documents</p>
                    <p className="text-[11px] text-slate-500">Cabs stopped pending PUC/Permit renewal.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
          <Shield className="w-3.5 h-3.5 text-brand-orange" />
          <span>{user?.role.replace('_', ' ')}</span>
        </div>

        {/* User Mini Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-navy-800 to-navy-700 text-white font-bold text-xs flex items-center justify-center">
            {user?.name.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden sm:inline">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};
