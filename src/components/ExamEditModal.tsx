import React, { useState } from 'react';
import { Subject, ExamPlaceholder } from '../types';
import { X, Calendar, Clock, MapPin, FileText } from 'lucide-react';

interface ExamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  examType: 'midterm' | 'practical' | 'final' | null;
  onSaveExam: (
    subjectId: Subject['id'],
    examType: 'midterm' | 'practical' | 'final',
    updated: ExamPlaceholder
  ) => void;
}

export const ExamEditModal: React.FC<ExamEditModalProps> = ({
  isOpen,
  onClose,
  subject,
  examType,
  onSaveExam,
}) => {
  if (!isOpen || !subject || !examType) return null;

  const currentExam = subject.exams[examType];
  const [date, setDate] = useState<string>(currentExam.date || '');
  const [time, setTime] = useState<string>(currentExam.time || '');
  const [location, setLocation] = useState<string>(currentExam.location || '');
  const [notes, setNotes] = useState<string>(currentExam.notes || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ExamPlaceholder = {
      ...currentExam,
      date: date ? date : null,
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim(),
      status: date ? 'Scheduled' : 'Date not set yet',
    };
    onSaveExam(subject.id, examType, updated);
    onClose();
  };

  const handleClearDate = () => {
    setDate('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/20 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl border border-purple-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-5 py-4 border-b border-[#F1E5E9] flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-[#3B1F4B]">
              Edit {currentExam.type}
            </h2>
            <p className="text-[11px] text-purple-900/60 font-medium">
              {subject.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-purple-700/60 hover:text-purple-900 hover:bg-white/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                Exam Date
              </span>
              {date && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="text-[11px] text-pink-600 hover:underline"
                >
                  Clear date (set as unknown)
                </button>
              )}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-mono font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
            />
            <p className="text-[11px] text-purple-900/60 mt-1">
              Leave empty if the date is not confirmed yet. It will stay as "Date not set yet".
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" />
                Time (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 09:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-purple-200 bg-white px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple-600" />
                Hall / Lab (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 4 / Lab B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs rounded-xl border border-purple-200 bg-white px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-purple-600" />
              Syllabus Scope & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Syllabus chapters covered, format (MCQ / essay), permitted materials..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-purple-200 bg-white p-3 text-purple-950 placeholder:text-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-[#F1E5E9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-purple-900/70 hover:text-purple-950 hover:bg-purple-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-xs transition-all font-semibold"
            >
              Update Exam Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
