import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';
import { Api } from '../services/api';
import { Task } from '../types';

export const Tasks: React.FC = () => {
  const [data, setData] = useState<{ summary: any; tasks: Task[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    department: 'Billing & MIS',
    assigneeName: 'SHREEJ',
    description: '',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    bossRemarks: '',
  });

  const loadTasks = () => {
    setLoading(true);
    Api.listTasks({ status: statusFilter || undefined })
      .then((res) => {
        if (res.data.success) setData({ summary: res.data.summary, tasks: res.data.tasks });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.createTask(formData);
      setShowAddModal(false);
      setFormData({
        department: 'Billing & MIS',
        assigneeName: 'SHREEJ',
        description: '',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        bossRemarks: '',
      });
      loadTasks();
    } catch (err: any) {
      alert('Failed to create task.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await Api.updateTask(id, { status: newStatus });
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete task?')) {
      await Api.deleteTask(id);
      loadTasks();
    }
  };

  const sm = data?.summary || {};
  const tasks = data?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            DAILY TASK MANAGEMENT & WORKFLOW DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Departmental task allocation (Billing & MIS, Administration, Fleet & Induction, Operations, Management)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* KPI Status Strip (Matching DAILY WORKING_Shreej Row 2-4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL TASKS</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{sm.totalTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">COMPLETED</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{sm.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">PROCESSING</span>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{sm.processing}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">NOT STARTED</span>
          <p className="text-2xl font-extrabold text-slate-600 mt-1">{sm.notStarted}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ON HOLD</span>
          <p className="text-2xl font-extrabold text-rose-500 mt-1">{sm.onHold}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">COMPLETION RATE</span>
          <p className="text-2xl font-extrabold text-brand-orange mt-1">{sm.completionRate}%</p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Task Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Boss Remarks</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{t.department}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{t.assigneeName || 'Ops Team'}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 max-w-md">{t.description}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className={`text-[10px] font-bold rounded px-2 py-1 outline-none border ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : t.status === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-slate-500 italic">{t.bossRemarks || '—'}</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-brand-orange" />
                <span>Assign Departmental Task</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="Billing & MIS">Billing & MIS</option>
                  <option value="Administration">Administration</option>
                  <option value="Fleet & Induction">Fleet & Induction</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    required
                    value={formData.assigneeName}
                    onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange outline-none"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Action items, deadline and deliverables..."
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
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
