import React, { useEffect, useState } from 'react';
import {
  Route,
  Plus,
  Calendar,
  Clock,
  Building,
  Truck,
  Filter,
  CheckCircle2,
  Trash2,
  X,
  MapPin,
} from 'lucide-react';
import { Api } from '../services/api';
import { Trip, Vehicle, Client } from '../types';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [shiftFilter, setShiftFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicleId: '',
    clientId: '',
    shift: 'LOGIN',
    tripDirection: 'IN',
    tripDate: '2026-11-16',
    remarks: '',
    stops: [
      { stopName: 'Hinjewadi Phase 1 - Blue Ridge', scheduledTime: '06:00', stopType: 'PICKUP' },
      { stopName: 'Wakad - Mont Vert Corner', scheduledTime: '08:00', stopType: 'PICKUP' },
    ],
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      Api.listTrips({ shift: shiftFilter || undefined }),
      Api.listVehicles({ status: 'ACTIVE' }),
      Api.listClients(),
    ])
      .then(([tripsRes, vehRes, cliRes]) => {
        if (tripsRes.data.success) setTrips(tripsRes.data.trips);
        if (vehRes.data.success) setVehicles(vehRes.data.vehicles);
        if (cliRes.data.success) setClients(cliRes.data.clients);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [shiftFilter]);

  const handleAddStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { stopName: '', scheduledTime: '14:00', stopType: 'DROP' }],
    });
  };

  const handleRemoveStop = (idx: number) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== idx),
    });
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      alert('Please select a vehicle.');
      return;
    }
    try {
      await Api.createTrip(formData);
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert('Failed to schedule trip.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this trip schedule?')) {
      await Api.deleteTrip(id);
      loadData();
    }
  };

  const pickupsCount = trips.filter((t) => t.tripDirection === 'IN').length;
  const dropsCount = trips.filter((t) => t.tripDirection === 'OUT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DAILY TRIP DISPATCH & ROSTER</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            5-Stage multi-stop employee transport routing, login/logout shifts, and live landmarks
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dispatch New Trip</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Trips Today</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{trips.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pickups (IN)</span>
          <p className="text-2xl font-extrabold text-brand-orange mt-1">{pickupsCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Drops (OUT)</span>
          <p className="text-2xl font-extrabold text-navy-800 mt-1">{dropsCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Shift Filter</span>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs font-semibold text-slate-800"
          >
            <option value="">All Shifts</option>
            <option value="LOGIN">LOGIN (Day)</option>
            <option value="LOGOUT">LOGOUT (Night)</option>
            <option value="DAY">DAY</option>
            <option value="NIGHT">NIGHT</option>
          </select>
        </div>
      </div>

      {/* Trips Cards / Table */}
      <div className="space-y-3">
        {trips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
            No dispatched trips scheduled. Click "Dispatch New Trip" to create one.
          </div>
        ) : (
          trips.map((trp) => (
            <div
              key={trp.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-800 text-brand-orange font-bold font-mono text-xs flex items-center justify-center">
                    {trp.shift.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-extrabold text-slate-900">
                        {trp.vehicle?.registrationNumber || 'Unassigned Cab'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {trp.client?.name || 'Corporate Roster'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          trp.tripDirection === 'IN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {trp.tripDirection === 'IN' ? 'PICKUP (IN)' : 'DROP (OUT)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Vehicle Type: {trp.vehicle?.vehicleType} • Driver: {trp.vehicle?.assignedDriver?.name || 'Assigned Driver'} ({trp.vehicle?.assignedDriver?.phone || 'No Phone'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED
                  </span>
                  <button
                    onClick={() => handleDelete(trp.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5-Stage Stops Sequential Path */}
              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Scheduled Stops & Route Landmarks (Trip 1 - Trip 5)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {trp.stops && trp.stops.length > 0 ? (
                    trp.stops.map((stop, sIdx) => (
                      <div
                        key={stop.id || sIdx}
                        className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs relative"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>STOP {stop.stopOrder}</span>
                          <span className="font-mono text-brand-orange">{stop.scheduledTime || '—'}</span>
                        </div>
                        <p className="font-semibold text-slate-800 truncate" title={stop.stopName}>
                          {stop.stopName}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No intermediate stops configured.</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Trip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Route className="w-4 h-4 text-brand-orange" />
                <span>Schedule New Daily Trip</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Vehicle *</label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                >
                  <option value="">-- Choose Active Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.vehicleType} - {v.make} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="">-- Select Corporate Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="LOGIN">LOGIN (Morning/Day Drop)</option>
                    <option value="LOGOUT">LOGOUT (Evening/Night Pick)</option>
                    <option value="DAY">DAY SHIFT</option>
                    <option value="NIGHT">NIGHT SHIFT</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Stops */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Trip Stops & Landmarks</label>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="text-brand-orange hover:text-brand-orangeHover font-semibold text-xs flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-0.5" /> Add Stop
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.stops.map((stop, sIdx) => (
                    <div key={sIdx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="time"
                        value={stop.scheduledTime}
                        onChange={(e) => {
                          const updated = [...formData.stops];
                          updated[sIdx].scheduledTime = e.target.value;
                          setFormData({ ...formData, stops: updated });
                        }}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Landmark / Route Stop"
                        value={stop.stopName}
                        onChange={(e) => {
                          const updated = [...formData.stops];
                          updated[sIdx].stopName = e.target.value;
                          setFormData({ ...formData, stops: updated });
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs outline-none"
                      />
                      {formData.stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(sIdx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
                  Dispatch Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
