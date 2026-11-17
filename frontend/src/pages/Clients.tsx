import React, { useEffect, useState } from 'react';
import { Building2, Plus, Search, Phone, Mail, ShieldAlert, DollarSign, X } from 'lucide-react';
import { Api } from '../services/api';
import { Client } from '../types';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddRateCard, setShowAddRateCard] = useState(false);

  // Form State for Rate Card
  const [rateCardForm, setRateCardForm] = useState({
    vehicleType: 'Sedan',
    isAc: true,
    minDistanceKm: 0,
    maxDistanceKm: 10,
    baseRate: 343,
  });

  const loadClients = () => {
    setLoading(true);
    Api.listClients()
      .then((res) => {
        if (res.data.success) {
          setClients(res.data.clients);
          if (res.data.clients.length > 0 && !selectedClient) {
            setSelectedClient(res.data.clients[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddRateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await Api.addRateCard(selectedClient.id, rateCardForm);
      setShowAddRateCard(false);
      // reload client
      const updated = await Api.getClient(selectedClient.id);
      setSelectedClient(updated.data.client);
      loadClients();
    } catch (err: any) {
      alert('Failed to add rate card.');
    }
  };

  const filtered = clients.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            CLIENT DIRECTORY & ESCALATION MATRIX
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Corporate client profiles, billing contacts, escalation pathways, and distance-based rate card slabs
          </p>
        </div>

        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Corporate Client</span>
        </button>
      </div>

      {/* Main Grid: Left Clients List, Right Details & Rate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client List */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[700px]">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client name or code..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={async () => {
                  const res = await Api.getClient(c.id);
                  setSelectedClient(res.data.client);
                }}
                className={`w-full text-left p-3 rounded-lg border transition flex flex-col justify-between ${
                  selectedClient?.id === c.id
                    ? 'bg-navy-800 text-white border-navy-700 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{c.name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      selectedClient?.id === c.id ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.code}
                  </span>
                </div>
                <p className={`text-[11px] mt-1.5 truncate ${selectedClient?.id === c.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {c.officeContact || c.contactPerson || 'Escalation on file'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Client Profile, Escalation Matrix & Rate Cards */}
        <div className="lg:col-span-2 space-y-4">
          {selectedClient ? (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 text-brand-orange font-bold text-base flex items-center justify-center">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">{selectedClient.name}</h2>
                      <p className="text-xs text-slate-400">Account Code: {selectedClient.code}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ACTIVE CLIENT
                  </span>
                </div>

                {/* Escalation Matrix (Matching CLINET DETAILS & ESCSLETIONS MA Row 2-9) */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Dedicated Escalation Matrix</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Office Contact</span>
                      <p className="font-semibold text-slate-800 mt-1">{selectedClient.officeContact || 'Ops Desk'}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">MIS Contact</span>
                      <p className="font-semibold text-slate-800 mt-1">{selectedClient.misContact || 'MIS Lead'}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Induction Desk</span>
                      <p className="font-semibold text-slate-800 mt-1">{selectedClient.inductionContact || 'Supervisor'}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Billing Contact</span>
                      <p className="font-semibold text-slate-800 mt-1">{selectedClient.billingContact || 'Accounts'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Cards Slab Matrix (Matching Excel Rate Card Slabs) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">DISTANCE SLAB RATE CARD MATRIX</h3>
                    <p className="text-[11px] text-slate-400">Fixed trip pricing across distance slabs & vehicle classes</p>
                  </div>

                  <button
                    onClick={() => setShowAddRateCard(true)}
                    className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slab</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Distance Slab</th>
                        <th className="py-2.5 px-3">Vehicle Class</th>
                        <th className="py-2.5 px-3">AC Option</th>
                        <th className="py-2.5 px-3 text-right">Fixed Trip Rate (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedClient.rateCards && selectedClient.rateCards.length > 0 ? (
                        selectedClient.rateCards.map((rc, i) => (
                          <tr key={rc.id || i} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                              {rc.minDistanceKm} to {rc.maxDistanceKm} Kms One Way
                            </td>
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-700">
                              {rc.vehicleType}
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              {rc.isAc ? (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                                  AC
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                                  Non-AC
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-sm text-slate-900">
                              ₹{rc.baseRate.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                            No custom rate slabs defined. Client inherits general commercial tariff.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              Select a client to view profile, escalation matrix and rate cards.
            </div>
          )}
        </div>
      </div>

      {/* Add Rate Card Modal */}
      {showAddRateCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-brand-orange" />
                <span>Add Rate Card Slab</span>
              </h2>
              <button onClick={() => setShowAddRateCard(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRateCard} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vehicle Category</label>
                <select
                  value={rateCardForm.vehicleType}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, vehicleType: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="Sedan">Sedan (Swift Dzire / Aura)</option>
                  <option value="SUV">SUV (Ertiga / Innova)</option>
                  <option value="TT 17 Seater">Tempo Traveller (17 Seater)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min KM</label>
                  <input
                    type="number"
                    value={rateCardForm.minDistanceKm}
                    onChange={(e) => setRateCardForm({ ...rateCardForm, minDistanceKm: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max KM</label>
                  <input
                    type="number"
                    value={rateCardForm.maxDistanceKm}
                    onChange={(e) => setRateCardForm({ ...rateCardForm, maxDistanceKm: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={rateCardForm.baseRate}
                    onChange={(e) => setRateCardForm({ ...rateCardForm, baseRate: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">AC Vehicle</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="ac"
                      checked={rateCardForm.isAc}
                      onChange={(e) => setRateCardForm({ ...rateCardForm, isAc: e.target.checked })}
                      className="w-4 h-4 text-brand-orange rounded"
                    />
                    <label htmlFor="ac" className="text-xs text-slate-700 font-medium">Air Conditioned</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRateCard(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg font-semibold shadow transition"
                >
                  Add Slab Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
