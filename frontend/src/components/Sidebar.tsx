import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  ShieldCheck,
  Users,
  UserCheck,
  Route,
  Activity,
  CalendarCheck,
  CreditCard,
  Receipt,
  Building2,
  FileSpreadsheet,
  CheckSquare,
  FileBarChart,
  UploadCloud,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
        { to: '/trips', label: 'Daily Dispatch (Trips)', icon: Route },
        { to: '/daily-tracker', label: 'Daily Vehicle Tracker', icon: Activity },
        { to: '/tasks', label: 'Department Tasks', icon: CheckSquare },
      ],
    },
    {
      title: 'FLEET & WORKFORCE',
      items: [
        { to: '/fleet', label: 'Fleet Management', icon: Truck },
        { to: '/compliance', label: 'Vehicle Compliance', icon: ShieldCheck },
        { to: '/drivers', label: 'Drivers Dossier', icon: Users },
        { to: '/employees', label: 'Employee Master', icon: UserCheck },
        { to: '/attendance', label: 'Attendance Register', icon: CalendarCheck },
        { to: '/payroll', label: 'Executive Payroll', icon: CreditCard },
      ],
    },
    {
      title: 'FINANCE & CLIENTS',
      items: [
        { to: '/expenses', label: 'Expense Ledger', icon: Receipt },
        { to: '/clients', label: 'Clients & Rate Cards', icon: Building2 },
        { to: '/invoices', label: 'Invoices & Billing', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'SYSTEM & TOOLS',
      items: [
        { to: '/reports', label: 'Reports & Analytics', icon: FileBarChart },
        { to: '/excel-import', label: 'Excel Import Wizard', icon: UploadCloud },
        { to: '/settings', label: 'Organization & Users', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-navy-800 text-slate-200 border-r border-navy-700 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-700 bg-navy-900/40">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                FLEETPULSE <span className="text-xs px-1.5 py-0.5 rounded bg-brand-orange text-white">360</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Complete Fleet Control</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition hidden md:block"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
                {sec.title}
              </h3>
            )}
            <ul className="space-y-1">
              {sec.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20 font-semibold'
                          : 'text-slate-300 hover:bg-navy-700 hover:text-white'
                      } ${collapsed ? 'justify-center' : 'space-x-3'}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-navy-700 bg-navy-900/60">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-3'}`}>
            <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-sm text-brand-orange shrink-0">
              {user?.name.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-700 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
