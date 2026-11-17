import React, { useEffect, useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Trash2,
  Edit,
  ExternalLink,
  Download,
  X,
} from 'lucide-react';
import { Api } from '../services/api';
import { Vehicle } from '../types';

export const Fleet: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'STOPPED'>('ALL');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'Sedan',
    make: 'Maruti Suzuki',
    model: 'Swift Dzire',
    capacity: '4+1',
    fuelType: 'CNG',
    gpsInstalled: true,
    ownerName: '',
    ownerPhone: '',
    remark: '',
  });

  const loadVehicles = () => {
    setLoading(true);
    Api.listVehicles({ status: activeTab === 'ALL' ? undefined : activeTab, search })
      .then((res) => {
        if (res.data.success) setVehicles(res.data.vehicles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicles();
  }, [activeTab, search]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.createVehicle(formData);
      setShowAddModal(false);
      setFormData({
        registrationNumber: '',
        vehicleType: 'Sedan',
        make: 'Maruti Suzuki',
        model: 'Swift Dzire',
        capacity: '4+1',
        fuelType: 'CNG',
        gpsInstalled: true,
        ownerName: '',
        ownerPhone: '',
        remark: '',
      });
      loadVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create vehicle.');
    }
  };

  const handleDelete = async (id: string, reg: string) => {
    if (confirm(`Are you sure you want to delete vehicle ${reg}?`)) {
      try {
        await Api.deleteVehicle(id);
        loadVehicles();
      } catch (err: any) {
        alert('Failed to delete vehicle.');
      }
    }
  };

  const filtered = vehicles.filter((v) => {
    if (typeFilter && !v.vehicleType.toLowerCase().includes(typeFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FLEET MANAGEMENT</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full commercial vehicle registry, statutory document statuses, and driver assignments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={Api.exportFleetComplianceUrl()}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Fleet</span>
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 border-b md:border-b-0 pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'ALL'
                ? 'bg-navy-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Fleet ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Fleet
          </button>
          <button
            onClick={() => setActiveTab('STOPPED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'STOPPED'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Stopped Cabs
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Reg, Make, Model..."
              className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>

          {/* Vehicle Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-brand-orange"
          >
            <option value="">All Types</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="TT 17">TT 17 Seater</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Fuel & GPS</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4">Days Left</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                          {v.registrationNumber.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-mono text-sm tracking-wide text-slate-900">
                            {v.registrationNumber}
                          </span>
                          <p className="text-[10px] text-slate-400">{v.status}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">
                        {v.make} {v.model}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {v.vehicleType} • Cap: {v.capacity}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {v.fuelType}
                        </span>
                        {v.gpsInstalled ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> GPS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                            No GPS
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {v.assignedDriver ? (
                        <div>
                          <p className="font-semibold text-slate-800">{v.assignedDriver.name}</p>
                          <p className="text-[11px] text-slate-500">{v.assignedDriver.phone || 'No phone'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {v.complianceStatus === 'DONE' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLIANT
                        </span>
                      )}
                      {v.complianceStatus === 'EXPIRING SOON' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" /> EXPIRING SOON
                        </span>
                      )}
                      {v.complianceStatus === 'EXPIRED' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" /> EXPIRED
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      {typeof v.daysRemaining === 'number' ? (
                        v.daysRemaining < 0 ? (
                          <span className="text-rose-600 font-bold">Overdue</span>
                        ) : (
                          <span className={v.daysRemaining <= 30 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                            {v.daysRemaining} days
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleDelete(v.id, v.registrationNumber)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-brand-orange" />
                <span>Onboard New Commercial Cab</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registration Number (e.g. MH-12-AB-1234) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="MH-12-XX-0000"
                  className="w-full uppercase font-mono border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="Sedan">Sedan (Swift Dzire / Aura)</option>
                    <option value="SUV">SUV (Ertiga / Innova)</option>
                    <option value="TT 17 Seater">Tempo Traveller (17 Seater)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="text"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="CNG">CNG</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV</option>
                    <option value="Petrol">Petrol</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Telemetry</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="gps"
                      checked={formData.gpsInstalled}
                      onChange={(e) => setFormData({ ...formData, gpsInstalled: e.target.checked })}
                      className="w-4 h-4 text-brand-orange rounded"
                    />
                    <label htmlFor="gps" className="text-xs text-slate-700 font-medium">
                      GPS Installed & Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg font-semibold shadow transition"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
