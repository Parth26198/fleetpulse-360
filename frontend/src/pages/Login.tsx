import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, Mail, ArrowRight, KeyRound, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@shreej.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { role: 'Company Admin', badge: 'Shreej', email: 'admin@shreej.com', desc: 'Full Operational & Financial Authority' },
    { role: 'Operations Lead', badge: 'Dispatch', email: 'ops@shreej.com', desc: 'Trip Dispatch & Route Roster' },
    { role: 'Fleet Manager', badge: 'Fleet', email: 'fleet@shreej.com', desc: 'Vehicles & Statutory Compliance' },
    { role: 'Accounts Exec', badge: 'Finance', email: 'accounts@shreej.com', desc: 'Expenses, Advances & Invoicing' },
    { role: 'HR Executive', badge: 'HR/MIS', email: 'hr@shreej.com', desc: 'Attendance Register & Payroll' },
    { role: 'Client Viewer', badge: 'Orix Portal', email: 'client@orix.com', desc: 'Restricted Corporate Client Portal' },
    { role: 'Super Admin', badge: 'Global', email: 'admin@fleetpulse.com', desc: 'Global Platform Multi-Tenant Admin' },
    { role: 'Apex Admin', badge: 'Isolated', email: 'admin@apex.com', desc: 'Test Multi-Tenant Data Isolation' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-brand-orange/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 shadow-xl shadow-brand-orange/30 mb-4 ring-4 ring-white/10">
          <Truck className="w-9 h-9 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FLEETPULSE 360</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 uppercase tracking-wide">
            Enterprise
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-400 font-medium">Complete Fleet. Complete Control.</p>
      </div>

      {/* Main Login Card (Crisp White Card on Deep Navy) */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/50 border border-slate-200/80 p-6 sm:p-10">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sign In to Dashboard</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter your credentials to access your company portal</p>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              <span>TLS 256-bit Secure</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition outline-none font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] font-medium text-slate-400">Default demo: admin123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg shadow-brand-orange/25 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-brand-orange/30 transition disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to FLEETPULSE 360</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1-Click Role Switcher
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">8 Pre-Seeded Roles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickLogins.map((ql, idx) => {
                const isSelected = email === ql.email;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setEmail(ql.email);
                      setPassword('admin123');
                      setError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-50/80 border-brand-orange text-slate-900 ring-2 ring-brand-orange/20 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center space-x-1.5">
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />}
                        <span className={`text-xs font-bold ${isSelected ? 'text-brand-orangeDark' : 'text-slate-800'}`}>
                          {ql.role}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ql.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight truncate">{ql.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>FLEETPULSE 360 Enterprise Transport Management System • Shreej Logistics & Operations</p>
        </div>
      </div>
    </div>
  );
};
