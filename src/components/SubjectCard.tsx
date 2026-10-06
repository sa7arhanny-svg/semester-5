import React from 'react';
import { Subject, AcademicActivity, StudySession } from '../types';
import { calculateSubjectMetrics } from '../utils/calculations';
import { ChevronRight, Calendar } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  activities: AcademicActivity[];
  sessions?: StudySession[];
  currentDateAnchor?: string;
  onSelect: (subjectId: Subject['id']) => void;
  onQuickAdd: (subjectId: Subject['id']) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  activities,
  sessions = [],
  currentDateAnchor = '2026-10-06',
  onSelect,
  onQuickAdd,
}) => {
  const metrics = calculateSubjectMetrics(subject.id, activities, sessions, currentDateAnchor);
  const health = metrics.scheduleHealth;

  return (
    <div
      onClick={() => onSelect(subject.id)}
      className="group text-left bg-white/90 backdrop-blur-xs border border-[#F1E5E9] hover:border-purple-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${subject.color.accent}`} />

      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-mono font-medium text-purple-900/60 tracking-wider">
              {subject.code}
            </span>
            <h3 className="font-display text-base font-bold text-[#3B1F4B] group-hover:text-purple-900 transition-colors leading-snug">
              {subject.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-bold text-[#3B1F4B] font-mono tabular-nums">
              {metrics.overallCompletionPercentage}%
            </span>
            <p className="text-[10px] text-purple-900/50">progress</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#FAF7F5] rounded-full h-1.5 overflow-hidden mb-3.5 border border-purple-100">
          <div
            className={`h-full ${subject.color.accent} transition-all duration-300`}
            style={{ width: `${metrics.overallCompletionPercentage}%` }}
          />
        </div>

        {/* Instructors preview */}
        <div className="text-[11px] text-purple-950/80 mb-3.5 space-y-0.5">
          <div className="text-[10px] font-semibold text-purple-900/50 uppercase tracking-wider">
            Instructors
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
            {subject.instructors.map((inst) => (
              <span key={inst.id} className="text-purple-900">
                {inst.name}
                <span className="text-purple-900/50 text-[10px] ml-1">
                  ({inst.streamName ? inst.streamName.replace(' Stream', '') : inst.role})
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Stats grid displaying required automatic subject calculations */}
        <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#FAF7F5] rounded-xl border border-[#F1E5E9] text-center mb-3">
          <div>
            <span className="text-xs font-bold text-purple-950 font-mono tabular-nums">
              {metrics.lectures}
            </span>
            <p className="text-[9px] text-purple-900/60 uppercase">Lectures</p>
          </div>
          <div>
            <span className="text-xs font-bold text-purple-950 font-mono tabular-nums">
              {metrics.sections}
            </span>
            <p className="text-[9px] text-purple-900/60 uppercase">Sections</p>
          </div>
          <div>
            <span className="text-xs font-bold text-purple-950 font-mono tabular-nums">
              {metrics.assignments + (metrics.tasks || 0)}
            </span>
            <p className="text-[9px] text-purple-900/60 uppercase">Tasks</p>
          </div>
          <div>
            <span className="text-xs font-bold text-purple-950 font-mono tabular-nums">
              {metrics.revisions}
            </span>
            <p className="text-[9px] text-purple-900/60 uppercase">Revs</p>
          </div>
        </div>

        {/* Exam placeholders summary */}
        <div className="text-[11px] text-purple-900/70 py-1.5 px-2 bg-purple-50/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3 h-3 text-purple-500 shrink-0" />
            <span className="truncate">
              {subject.exams.midterm.date
                ? `Midterm: ${subject.exams.midterm.date}`
                : 'Midterm: Date not set yet'}
            </span>
          </div>
          {subject.exams.midterm.date ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shrink-0" />
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="pt-3 mt-3 border-t border-[#F1E5E9] flex items-center justify-between text-xs">
        <span className={`text-[11px] font-medium ${health.colorClass}`}>
          {metrics.overdueActivities > 0
            ? `${metrics.overdueActivities} overdue`
            : metrics.pendingActivities > 0
            ? `${metrics.pendingActivities} pending`
            : metrics.totalActivities === 0
            ? 'Ready for week 3 logs'
            : 'All caught up ✦'}
        </span>

        <span className="text-purple-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-xs font-medium">
          Open
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
