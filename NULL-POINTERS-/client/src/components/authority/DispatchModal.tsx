import React, { useState, useEffect } from 'react';
import { Complaint, Department, FieldWorker } from '../../types';
import { api } from '../../services/api';
import { useComplaints } from '../../context/ComplaintContext';
import { X, Send, MapPin, Phone, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DispatchModal: React.FC<Props> = ({ complaint, isOpen, onClose }) => {
  const { assignWorker } = useComplaints();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<FieldWorker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getTeams().then(data => {
        setDepartments(data.departments);
        setWorkers(data.workers);
        if (complaint) {
          setSelectedDept(complaint.department);
          if (complaint.assignedWorker) {
            setSelectedWorkerId(complaint.assignedWorker.id);
          }
        }
      });
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const filteredWorkers = workers.filter(
    w => !selectedDept || w.department.toLowerCase().includes(selectedDept.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await assignWorker(complaint.id, selectedWorkerId || undefined, selectedDept);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Dispatch Field Team
            </h3>
            <p className="text-xs text-slate-500">
              Ticket #{complaint.ticketNumber} — {complaint.category} ({complaint.location.area})
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Department selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Field Workers list */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Available Field Response Units
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredWorkers.map(w => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedWorkerId === w.id
                      ? 'border-civic-600 bg-civic-50/70 dark:bg-civic-950/40 ring-2 ring-civic-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {w.teamName}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Available • {w.completedTasks} Tasks Done
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Lead: {w.name} ({w.phone})</span>
                    <span>Zone: {w.area}</span>
                  </div>
                </div>
              ))}
              {filteredWorkers.length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  No field units registered for this department.
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold flex items-center shadow"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isSubmitting ? 'Dispatching...' : 'Confirm Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
