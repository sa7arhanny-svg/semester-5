import React, { useState } from 'react';
import { AcademicActivity, RevisionSession } from '../types';
import { X, Plus, Calendar, Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: AcademicActivity | null;
  onAddRevision: (activityId: string, revision: RevisionSession) => void;
  onToggleRevisionStatus: (activityId: string, revisionId: string) => void;
  onDeleteRevision: (activityId: string, revisionId: string) => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  onClose,
  activity,
  onAddRevision,
  onToggleRevisionStatus,
  onDeleteRevision,
}) => {
  if (!isOpen || !activity) return null;

  const existingRevisions = activity.revisions || [];
  const nextRevNumber = existingRevisions.length + 1;

  const [date, setDate] = useState('2026-10-06');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: RevisionSession = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      activityId: activity.id,
      revisionNumber: nextRevNumber,
      date,
      durationMinutes: Number(durationMinutes) || 30,
      notes: notes.trim(),
      status: 'Completed',
    };
    onAddRevision(activity.id, newRev);
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/20 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-purple-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-5 py-4 border-b border-[#F1E5E9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#3B1F4B]">
                Revision History & Plan
              </h2>
              <p className="text-[11px] text-purple-900/60 truncate max-w-xs font-medium">
                {activity.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-purple-700/60 hover:text-purple-900 hover:bg-white/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary Banner */}
          <div className="bg-[#FAF7F5] rounded-xl p-3 border border-purple-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-900/70 font-medium">Completed Revisions</span>
              <p className="text-sm font-bold text-purple-950 font-mono tabular-nums">
                {existingRevisions.length} round{existingRevisions.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Log Revision {nextRevNumber}</span>
            </button>
          </div>

          {/* New Revision Form */}
          {isAdding && (
            <form onSubmit={handleSaveNew} className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
              <h4 className="text-xs font-bold text-purple-950 flex items-center justify-between">
                <span>Record Revision Round {nextRevNumber}</span>
                <span className="text-[10px] text-purple-600 font-normal">Active review pass</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-950 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-mono font-medium rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-purple-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-950 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-600" />
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-mono font-medium rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-purple-950 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                  Revision Notes & Weak Spots
                </label>
                <textarea
                  rows={2}
                  placeholder="Formulas memorized, flashcard review, questions solved..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-lg border border-purple-200 bg-white p-2 text-purple-950 placeholder:text-purple-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs text-purple-900/60 hover:text-purple-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-medium text-white bg-purple-900 hover:bg-purple-950 rounded-lg shadow-2xs font-semibold"
                >
                  Save Revision Round
                </button>
              </div>
            </form>
          )}

          {/* List of existing revisions */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {existingRevisions.length === 0 ? (
              <div className="text-center py-6 text-purple-900/60 text-xs">
                No revisions recorded for this activity yet.
                <p className="mt-1 text-[11px] text-purple-400">
                  Multiple revision passes will show up here nicely ♡
                </p>
              </div>
            ) : (
              existingRevisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-white border border-purple-100 flex items-start justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-950">
                        Revision {rev.revisionNumber}
                      </span>
                      <span className="text-[11px] text-purple-900/60 font-mono">
                        {rev.date}
                      </span>
                      <span className="text-[11px] text-purple-900/60 font-mono">
                        · {rev.durationMinutes} min
                      </span>
                      <button
                        onClick={() => onToggleRevisionStatus(activity.id, rev.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                          rev.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {rev.status}
                      </button>
                    </div>
                    {rev.notes && (
                      <p className="text-[11px] text-purple-900/80 bg-[#FAF7F5] p-2 rounded-lg mt-1 border border-purple-100">
                        {rev.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteRevision(activity.id, rev.id)}
                    className="text-purple-300 hover:text-rose-600 transition-colors text-xs p-1"
                    title="Delete revision entry"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
