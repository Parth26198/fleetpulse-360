import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Phone, ShieldCheck, MapPin, FileText, Trash2, X } from 'lucide-react';
import { Api } from '../services/api';
import { Driver } from '../types';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyPhone: '',
    tempAddress: '',
    permanentAddress: '',
    licenseNumber: '',
    licenseExpiry: '',
    aadharNumber: '',
  });

  const loadDrivers = () => {
    setLoading(true);
    Api.listDrivers(search)
      .then((res) => {
        if (res.data.success) setDrivers(res.data.drivers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDrivers();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.createDriver(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        phone: '',
        emergencyPhone: '',
        tempAddress: '',
        permanentAddress: '',
        licenseNumber: '',
        licenseExpiry: '',
        aadharNumber: '',
      });
      loadDrivers();
    } catch (err: any) {
      alert('Failed to register driver.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete driver profile for ${name}?`)) {
      await Api.deleteDriver(id);
      loadDrivers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DRIVERS DIRECTORY & KYC</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete driver dossiers, licenses, PCC verification, medical fitness, and emergency contacts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver by name, phone, license..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{drivers.length} Drivers Enrolled</span>
      </div>

      {/* Grid of Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      {d.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(d.id, d.name)}
                  className="text-slate-300 hover:text-rose-500 transition"
                  title="Delete driver"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <span>{d.phone || 'No phone'}</span>
                  {d.emergencyPhone && (
                    <span className="ml-2 text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      Emerg: {d.emergencyPhone}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-slate-600">
                  <FileText className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <span className="font-mono">License: {d.licenseNumber || 'N/A'}</span>
                </div>

                <div className="flex items-start text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-500 line-clamp-2">
                    {d.permanentAddress || d.tempAddress || 'Address on file'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Assigned Cab:</span>
              <span className="font-mono font-bold text-slate-800">
                {d.vehicles && d.vehicles.length > 0 ? d.vehicles[0].registrationNumber : 'None'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-orange" />
                <span>Enroll Commercial Driver</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="91XXXXXXXX"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driving License No.</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="MH12XXXXXXXX"
                    className="w-full uppercase font-mono border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Aadhar Card Number</label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full font-mono border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
                <textarea
                  rows={2}
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="Village, Taluka, District, Pincode"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                />
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
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
