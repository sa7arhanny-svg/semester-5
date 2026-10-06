import React, { useState } from 'react';
import { SemesterInfo, Subject, AcademicActivity, ExamPlaceholder, ActivityType } from '../types';
import { generateSemesterWeeks, WeekTimelineItem } from '../utils/calculations';
import { Mascot } from './Mascot';
import { StudyMaterialsView } from './StudyMaterialsView';
import { SparkleIcon, TinyBenzene, TinyDnaHelix } from './ScientificMotifs';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FlaskConical,
  FileCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Circle,
  Timer,
  Plus,
  HelpCircle,
  Flame,
  Award,
  Clock,
  Layers,
} from 'lucide-react';

interface SemesterTimelineViewProps {
  semester: SemesterInfo;
  subjects: Subject[];
  activities: AcademicActivity[];
  onSelectActivity?: (act: AcademicActivity) => void;
  onOpenExamModal: (subjectId: Subject['id'], examType: 'midterm' | 'practical' | 'final') => void;
  onOpenAddModal?: (subjectId?: Subject['id'], prefillDate?: string) => void;
  onToggleActivityStatus?: (activity: AcademicActivity) => void;
  onStartStudySession?: (activity: AcademicActivity) => void;
}

type ViewMode = 'calendar' | 'timeline';

interface CalendarMonthOption {
  year: number;
  monthIndex: number; // 0-11
  label: string;
  isCurrent?: boolean;
}

const MONTHS: CalendarMonthOption[] = [
  { year: 2026, monthIndex: 8, label: 'September 2026' },
  { year: 2026, monthIndex: 9, label: 'October 2026', isCurrent: true },
  { year: 2026, monthIndex: 10, label: 'November 2026' },
  { year: 2026, monthIndex: 11, label: 'December 2026' },
  { year: 2027, monthIndex: 0, label: 'January 2027' },
];

export const SemesterTimelineView: React.FC<SemesterTimelineViewProps> = ({
  semester,
  subjects,
  activities,
  onSelectActivity,
  onOpenExamModal,
  onOpenAddModal,
  onToggleActivityStatus,
  onStartStudySession,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(1); // Default to October 2026 (current month)
  const [selectedDate, setSelectedDate] = useState<string>(semester.currentDateAnchor); // 2026-10-06
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(semester.currentWeek); // Week 3
  const [filterType, setFilterType] = useState<string>('all');

  const weeks = generateSemesterWeeks(semester);
  const currentMonth = MONTHS[selectedMonthIndex];

  // Helper to map event type to cute scientific journal markers
  const getMarkerConfig = (type: ActivityType | string) => {
    switch (type) {
      case 'Lecture':
        return {
          label: 'Lecture',
          icon: BookOpen,
          bg: 'bg-purple-100 text-purple-900 border-purple-200',
          dot: 'bg-purple-600',
        };
      case 'Section':
        return {
          label: 'Section',
          icon: FlaskConical,
          bg: 'bg-teal-100 text-teal-900 border-teal-200',
          dot: 'bg-teal-600',
        };
      case 'Assignment':
      case 'Task':
        return {
          label: 'Assignment',
          icon: FileCheck,
          bg: 'bg-pink-100 text-pink-900 border-pink-200',
          dot: 'bg-pink-600',
        };
      case 'Revision':
        return {
          label: 'Revision',
          icon: RotateCcw,
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          dot: 'bg-indigo-600',
        };
      case 'Quiz':
        return {
          label: 'Quiz',
          icon: Flame,
          bg: 'bg-amber-100 text-amber-950 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'Midterm':
        return {
          label: 'Midterm',
          icon: Award,
          bg: 'bg-rose-100 text-rose-950 border-rose-300',
          dot: 'bg-rose-600',
        };
      case 'Practical Exam':
        return {
          label: 'Practical Exam',
          icon: FlaskConical,
          bg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          dot: 'bg-emerald-600',
        };
      case 'Final':
      case 'Final Exam':
        return {
          label: 'Final Exam',
          icon: Sparkles,
          bg: 'bg-purple-200 text-purple-950 border-purple-400',
          dot: 'bg-purple-900',
        };
      default:
        return {
          label: type,
          icon: BookOpen,
          bg: 'bg-gray-100 text-gray-900 border-gray-200',
          dot: 'bg-gray-600',
        };
    }
  };

  // Collect scheduled exams into event list
  const scheduledExams: {
    id: string;
    subjectId: Subject['id'];
    subjectCode: string;
    subjectName: string;
    title: string;
    type: ActivityType;
    date: string;
    time?: string;
    location?: string;
    notes?: string;
    status: string;
    isExamPlaceholder: boolean;
    examType: 'midterm' | 'practical' | 'final';
  }[] = [];

  subjects.forEach((s) => {
    (['midterm', 'practical', 'final'] as const).forEach((et) => {
      const ex = s.exams[et];
      if (ex.date) {
        scheduledExams.push({
          id: `exam-${s.id}-${et}`,
          subjectId: s.id,
          subjectCode: s.code,
          subjectName: s.name,
          title: `${s.name} ${ex.type}`,
          type: ex.type as ActivityType,
          date: ex.date,
          time: ex.time,
          location: ex.location,
          notes: ex.notes,
          status: ex.status,
          isExamPlaceholder: true,
          examType: et,
        });
      }
    });
  });

  // Calendar calculation: Days in currentMonth
  const year = currentMonth.year;
  const month = currentMonth.monthIndex;
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to format ISO date string
  const formatDateStr = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Filter activities by event type
  const filterPass = (type: string) => {
    if (filterType === 'all') return true;
    if (filterType === 'exams') return ['Midterm', 'Practical Exam', 'Final Exam', 'Final'].includes(type);
    return type.toLowerCase() === filterType.toLowerCase();
  };

  // Events for selected date in Calendar
  const selectedDateActivities = activities
    .filter((a) => a.date === selectedDate && filterPass(a.type));
  const selectedDateExams = scheduledExams
    .filter((e) => e.date === selectedDate && filterPass(e.type));

  const totalUserEnteredEvents = activities.length + scheduledExams.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-[#FCFAF8] rounded-3xl p-5 sm:p-6 border border-[#F4DEE5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Soft watermark motifs */}
        <div className="absolute right-4 top-4 opacity-15 pointer-events-none hidden sm:flex items-center gap-2">
          <TinyBenzene className="w-10 h-10 text-purple-400" />
          <TinyDnaHelix className="w-12 h-6 text-pink-400" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-100/80 text-purple-950">
              Semester 5 / 2026
            </span>
            <span className="text-[11px] font-mono text-purple-900/60">
              Sep 20, 2026 → Jan 31, 2027 · 19 Weeks
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#3B1F4B] flex items-center gap-2">
            <span>Semester Map & Calendar</span>
            <SparkleIcon className="w-4 h-4 text-pink-400" />
          </h1>

          <p className="text-xs text-purple-900/70 max-w-lg leading-relaxed">
            Exactly 3 academic weeks have elapsed. Anchored in Week 3. Only showing authentic
            academic events you have recorded.
          </p>
        </div>

        {/* View Mode Segmented Control Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="bg-white p-1 rounded-2xl border border-[#F4DEE5] shadow-2xs flex items-center gap-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                viewMode === 'calendar'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                viewMode === 'timeline'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semester Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar by Event Type */}
      <div className="bg-white/80 p-3 rounded-2xl border border-[#F4DEE5] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-purple-900/60 uppercase text-[10px] tracking-wider mr-1">
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'lecture', label: 'Lectures' },
            { id: 'section', label: 'Sections' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'revision', label: 'Revisions' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'exams', label: 'Exams' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                filterType === f.id
                  ? 'bg-purple-900 text-white font-semibold shadow-2xs'
                  : 'bg-[#FAF7F5] text-purple-900/70 hover:text-purple-950 hover:bg-purple-100/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-purple-900/60 flex items-center gap-1.5">
          <span>{totalUserEnteredEvents} recorded event{totalUserEnteredEvents === 1 ? '' : 's'}</span>
          <span className="text-purple-300">·</span>
          <span>Zero fabricated items</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CALENDAR VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* Month Selector Strip */}
          <div className="bg-[#FCFAF8] p-4 rounded-3xl border border-[#F4DEE5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                disabled={selectedMonthIndex === 0}
                onClick={() => setSelectedMonthIndex((prev) => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-purple-200 text-purple-700 hover:text-purple-950 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h2 className="font-display text-base sm:text-lg font-bold text-[#3B1F4B] min-w-[170px] text-center">
                {currentMonth.label}
              </h2>

              <button
                disabled={selectedMonthIndex === MONTHS.length - 1}
                onClick={() => setSelectedMonthIndex((prev) => Math.min(MONTHS.length - 1, prev + 1))}
                className="w-8 h-8 rounded-xl bg-white border border-purple-200 text-purple-700 hover:text-purple-950 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Month Jump Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {MONTHS.map((m, idx) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMonthIndex(idx)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap transition-colors ${
                    selectedMonthIndex === idx
                      ? 'bg-purple-900 text-white font-bold shadow-2xs'
                      : 'bg-white text-purple-900/60 hover:text-purple-950 border border-purple-100'
                  }`}
                >
                  {m.label.split(' ')[0]} {m.isCurrent ? '✦' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white rounded-3xl border border-[#F4DEE5] p-4 sm:p-5 shadow-xs">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-semibold text-purple-900/60 pb-2 border-b border-purple-100 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {/* Empty leading padding cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="min-h-[70px] sm:min-h-[88px] rounded-2xl bg-purple-50/20 opacity-30" />
              ))}

              {/* Day cells in month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = formatDateStr(dayNum);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === semester.currentDateAnchor;
                const isWithinSemester = dateStr >= semester.startDate && dateStr <= semester.endDate;
                const isElapsedWeek = dateStr < '2026-10-04'; // Weeks 1 & 2
                const isCurrentWeek = dateStr >= '2026-10-04' && dateStr <= '2026-10-10'; // Week 3

                // Events on this date
                const dayActs = activities.filter((a) => a.date === dateStr && filterPass(a.type));
                const dayEx = scheduledExams.filter((e) => e.date === dateStr && filterPass(e.type));
                const totalEventsOnDay = dayActs.length + dayEx.length;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[70px] sm:min-h-[88px] p-1.5 rounded-2xl border text-left transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-300 bg-purple-50/70 shadow-xs'
                        : isToday
                        ? 'border-pink-300 bg-pink-50/40'
                        : isCurrentWeek
                        ? 'border-purple-200/80 bg-purple-50/30'
                        : !isWithinSemester
                        ? 'border-transparent bg-gray-50/50 opacity-40'
                        : 'border-[#F1E5E9] bg-white hover:border-purple-200 hover:bg-[#FAF7F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none ${
                          isToday
                            ? 'bg-purple-900 text-white shadow-2xs'
                            : isSelected
                            ? 'text-purple-950'
                            : 'text-purple-900/80'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {isToday && (
                        <span className="text-[9px] font-bold text-pink-600 font-mono uppercase tracking-tight">
                          Today
                        </span>
                      )}

                      {isCurrentWeek && !isToday && (
                        <span className="text-[9px] text-purple-400 font-mono">
                          W3
                        </span>
                      )}
                    </div>

                    {/* Event visual markers inside cell */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayEx.slice(0, 1).map((ex) => {
                        const marker = getMarkerConfig(ex.type);
                        return (
                          <div
                            key={ex.id}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border truncate flex items-center gap-1 ${marker.bg}`}
                            title={ex.title}
                          >
                            <span className={`w-1 h-1 rounded-full ${marker.dot} shrink-0`} />
                            <span className="truncate">{ex.subjectCode} {ex.type}</span>
                          </div>
                        );
                      })}

                      {dayActs.slice(0, 2).map((act) => {
                        const marker = getMarkerConfig(act.type);
                        const isDone = act.completed || act.status === 'Studied' || act.status === 'Completed';
                        return (
                          <div
                            key={act.id}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium border truncate flex items-center justify-between gap-0.5 ${
                              isDone ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : marker.bg
                            }`}
                            title={`${act.title} (${act.type})`}
                          >
                            <span className="truncate">{act.title}</span>
                            {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}

                      {totalEventsOnDay > 2 && (
                        <span className="text-[9px] text-purple-900/60 font-mono font-medium block pl-1">
                          +{totalEventsOnDay - 2} more
                        </span>
                      )}
                    </div>

                    <div className="h-1 flex items-center gap-0.5">
                      {dayActs.some((a) => a.date === dateStr) && (
                        <span className="w-1 h-1 rounded-full bg-purple-500" />
                      )}
                      {dayEx.some((e) => e.date === dateStr) && (
                        <span className="w-1 h-1 rounded-full bg-rose-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Inspector & Events on Selected Date */}
          <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4DEE5] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
                <h3 className="font-display text-base font-bold text-[#3B1F4B]">
                  Schedule for {selectedDate}
                </h3>
                {selectedDate === semester.currentDateAnchor && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                    Today · Week 3
                  </span>
                )}
              </div>

              {onOpenAddModal && (
                <button
                  onClick={() => onOpenAddModal(undefined, selectedDate)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl shadow-2xs transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Event on this date</span>
                </button>
              )}
            </div>

            {selectedDateActivities.length === 0 && selectedDateExams.length === 0 ? (
              <div className="py-6 text-center text-xs text-purple-900/60 space-y-1">
                <p>No user-entered events recorded on this date.</p>
                <p className="text-[11px] text-purple-900/40">
                  (Luna Study Garden never invents or simulates academic entries ♡)
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Scheduled Exams on this date */}
                {selectedDateExams.map((ex) => {
                  const marker = getMarkerConfig(ex.type);
                  const Icon = marker.icon;
                  return (
                    <div
                      key={ex.id}
                      className="p-3.5 rounded-2xl bg-white border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold">
                              {ex.subjectCode}
                            </span>
                            <span className="text-xs font-bold text-rose-900">
                              {ex.type}
                            </span>
                            <span className="text-[11px] text-purple-900/60">
                              · {ex.subjectName}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-purple-950 mt-0.5">
                            {ex.title}
                          </h4>
                          {ex.notes && (
                            <p className="text-[11px] text-purple-900/70 mt-1">
                              {ex.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenExamModal(ex.subjectId, ex.examType)}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-950 underline underline-offset-2 self-start sm:self-auto"
                      >
                        Edit Exam Details
                      </button>
                    </div>
                  );
                })}

                {/* Academic Activities on this date */}
                {selectedDateActivities.map((act) => {
                  const marker = getMarkerConfig(act.type);
                  const Icon = marker.icon;
                  const isDone = act.completed || act.status === 'Studied' || act.status === 'Completed';

                  return (
                    <div
                      key={act.id}
                      className={`p-3.5 rounded-2xl bg-white border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-purple-200/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {onToggleActivityStatus && (
                          <button
                            onClick={() => onToggleActivityStatus(act)}
                            className="mt-0.5 text-purple-400 hover:text-purple-700 transition-colors shrink-0"
                            title={isDone ? 'Mark in progress' : 'Mark completed'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${marker.bg}`}>
                              {act.type}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FAF7F5] border border-purple-200 text-purple-900">
                              {act.track}
                            </span>
                            <span className="text-[11px] font-medium text-purple-900/60">
                              {act.instructor}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-purple-950 mt-1">
                            {act.title}
                          </h4>
                          {act.notes && (
                            <p className="text-[11px] text-purple-900/70 mt-0.5">
                              {act.notes}
                            </p>
                          )}

                          {/* Study Materials */}
                          <StudyMaterialsView activity={act} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {onStartStudySession && (
                          <button
                            onClick={() => onStartStudySession(act)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                          >
                            <Timer className="w-3 h-3 text-purple-700" />
                            <span>Study</span>
                          </button>
                        )}
                        {onSelectActivity && (
                          <button
                            onClick={() => onSelectActivity(act)}
                            className="px-2 py-1 text-xs text-purple-700 hover:text-purple-950 underline underline-offset-2"
                          >
                            Open Subject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SEMESTER TIMELINE (PERSONAL ACADEMIC JOURNEY) */}
      {/* ========================================================================= */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* Journey Path Introduction */}
          <div className="bg-[#FCFAF8] p-5 rounded-3xl border border-[#F4DEE5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold text-[#3B1F4B] flex items-center gap-2">
                <span>19-Week Personal Academic Journey</span>
                <SparkleIcon className="w-3.5 h-3.5 text-pink-400" />
              </h3>
              <p className="text-xs text-purple-900/70 mt-0.5">
                A gentle narrative path through Semester 5. Three weeks have elapsed. We are currently pacing in Week 3.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-purple-100 text-xs text-purple-900/70 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-300" />
                <span>Weeks 1–2 (Elapsed)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-900" />
                <span>Week 3 (You Are Here ♡)</span>
              </span>
            </div>
          </div>

          {/* 19-Week Journey Trail */}
          <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-6 sm:before:left-8 before:w-0.5 before:bg-gradient-to-b before:from-purple-300 before:via-purple-200 before:to-pink-200">
            {weeks.map((w) => {
              const weekActs = activities.filter((a) => a.date >= w.startDate && a.date <= w.endDate);
              const weekExams = scheduledExams.filter((e) => e.date >= w.startDate && e.date <= w.endDate);
              const totalItemsInWeek = weekActs.length + weekExams.length;

              // Journey milestone labels
              let phaseNote = '';
              if (w.weekNumber <= 2) phaseNote = 'Elapsed Academic Weeks · Early Term Foundation';
              else if (w.weekNumber === 3) phaseNote = 'Current Academic Week · You are here ♡';
              else if (w.weekNumber >= 7 && w.weekNumber <= 9) phaseNote = 'Midterm Examination Milestone Window';
              else if (w.weekNumber >= 14 && w.weekNumber <= 16) phaseNote = 'Practical Lab Exams Milestone Window';
              else if (w.weekNumber >= 18) phaseNote = 'Semester Final Examinations & Concluding Revision';

              return (
                <div
                  key={w.weekNumber}
                  className={`relative pl-12 sm:pl-16 transition-all duration-200 ${
                    w.isCurrent ? 'scale-[1.01]' : ''
                  }`}
                >
                  {/* Journey Node Marker */}
                  <div
                    className={`absolute left-3.5 sm:left-5.5 -translate-x-1/2 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      w.isCurrent
                        ? 'bg-purple-900 border-pink-300 text-white shadow-xs ring-4 ring-purple-100 scale-125'
                        : w.status === 'past'
                        ? 'bg-purple-200 border-purple-400 text-purple-900'
                        : 'bg-white border-[#F4DEE5] text-purple-300'
                    }`}
                  >
                    {w.isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />
                    )}
                  </div>

                  {/* Week Card */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      w.isCurrent
                        ? 'bg-white border-purple-400 shadow-md ring-1 ring-purple-200'
                        : w.status === 'past'
                        ? 'bg-white/70 border-purple-200/70'
                        : 'bg-white/90 border-[#F4DEE5] hover:border-purple-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100/70">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-xl ${
                            w.isCurrent
                              ? 'bg-purple-900 text-white'
                              : w.status === 'past'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-[#FAF7F5] border border-purple-100 text-purple-900/70'
                          }`}
                        >
                          Week {w.weekNumber}
                        </span>

                        <span className="text-xs font-mono text-purple-900/60 font-medium">
                          {w.startDate} → {w.endDate}
                        </span>

                        {w.isCurrent && (
                          <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200 flex items-center gap-1">
                            <span>Active Now</span>
                            <span>✦</span>
                          </span>
                        )}
                      </div>

                      {phaseNote && (
                        <span className="text-[11px] font-medium text-purple-900/60 italic">
                          {phaseNote}
                        </span>
                      )}
                    </div>

                    {/* Events Recorded In This Week */}
                    <div className="pt-3 space-y-2">
                      {totalItemsInWeek === 0 ? (
                        <div className="py-2 text-[11px] text-purple-900/50 flex items-center justify-between">
                          <span>
                            {w.status === 'past'
                              ? 'Academic weeks elapsed prior to journal setup.'
                              : w.isCurrent
                              ? 'Week 3 active · Ready to record lectures and practical sections ♡'
                              : 'Syllabus entries will appear as the semester advances.'}
                          </span>
                          {w.isCurrent && onOpenAddModal && (
                            <button
                              onClick={() => onOpenAddModal(undefined, w.startDate)}
                              className="text-xs font-semibold text-purple-900 hover:underline"
                            >
                              + Record Entry
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Scheduled Exams */}
                          {weekExams.map((ex) => {
                            const marker = getMarkerConfig(ex.type);
                            return (
                              <div
                                key={ex.id}
                                className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                  <span className="font-bold text-rose-950 font-mono">
                                    {ex.date}
                                  </span>
                                  <span className="font-semibold text-purple-950">
                                    {ex.subjectCode} · {ex.type}
                                  </span>
                                </div>
                                <span className="text-[11px] text-rose-900/70 font-mono">
                                  {ex.status}
                                </span>
                              </div>
                            );
                          })}

                          {/* Academic Activities */}
                          {weekActs.map((act) => {
                            const marker = getMarkerConfig(act.type);
                            const isDone = act.completed || act.status === 'Studied' || act.status === 'Completed';

                            return (
                              <div
                                key={act.id}
                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                                  isDone
                                    ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                                    : 'bg-[#FAF7F5] border-purple-100 text-purple-950'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  {onToggleActivityStatus && (
                                    <button
                                      onClick={() => onToggleActivityStatus(act)}
                                      className="text-purple-400 hover:text-purple-700 transition-colors shrink-0"
                                    >
                                      {isDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                      ) : (
                                        <Circle className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}

                                  <span className="font-mono text-[11px] text-purple-900/60 shrink-0">
                                    {act.date}
                                  </span>

                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${marker.bg}`}>
                                    {act.type}
                                  </span>

                                  <span className="font-medium truncate">
                                    {act.title}
                                  </span>

                                  <span className="text-[11px] text-purple-900/50 hidden md:inline shrink-0">
                                    ({act.instructor})
                                  </span>

                                  {/* Compact Study Materials */}
                                  <StudyMaterialsView activity={act} compact />
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {onStartStudySession && (
                                    <button
                                      onClick={() => onStartStudySession(act)}
                                      className="p-1 text-purple-700 hover:text-purple-950 hover:bg-purple-100 rounded-lg transition-colors"
                                      title="Start study timer"
                                    >
                                      <Timer className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      isDone ? 'text-emerald-700' : 'text-purple-900/60'
                                    }`}
                                  >
                                    {act.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
