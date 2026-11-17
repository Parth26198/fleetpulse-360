import React, { useEffect, useState } from 'react';
import { Settings, Building2, Users, Shield, CheckCircle2, Lock, Key } from 'lucide-react';
import { Api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([Api.listUsers(), Api.listRoles()])
      .then(([uRes, rRes]) => {
        if (uRes.data.success) setUsers(uRes.data.users);
        if (rRes.data.success) setRoles(rRes.data.roles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ORGANIZATION & ACCESS CONTROL</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Company profile, multi-tenant subscription tiers, role-based authorization, and user provisioning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-navy-800 text-brand-orange font-bold text-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{user?.company.name}</h2>
              <p className="text-xs text-slate-400">Code: {user?.company.code}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Subscription Tier</span>
              <span className="font-bold text-brand-orange text-sm">ENTERPRISE SAAS</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Fleet Limit</span>
              <span className="font-semibold text-slate-800">Up to 150 Registered Vehicles</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">GSTIN / Tax ID</span>
              <span className="font-mono font-semibold text-slate-800">27AAECP1234F1Z8</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Registered Headquarters</span>
              <p className="text-slate-600 mt-0.5">
                Fortune Business Center, Baner-Pashan Link Road, Pune, Maharashtra 411045
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Multi-Tenant Isolated
            </span>
          </div>
        </div>

        {/* Roles & Permissions Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">ROLE-BASED ACCESS CONTROL (RBAC)</h2>
              <p className="text-[11px] text-slate-400">Pre-configured operational roles and access privileges</p>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
              {roles.length} System Roles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {roles.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{r.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {r.rolePermissions ? `${r.rolePermissions.length} Perms` : 'Full'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{r.description || 'System access role'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4 text-brand-orange" />
          <span>Active Users in Organization</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{u.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {u.role?.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{u.createdAt?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
