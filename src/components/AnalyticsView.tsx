import React, { useRef, useState } from 'react';
import { Subject, AcademicActivity, StudySession, SemesterInfo } from '../types';
import { exportGardenBackup, importGardenBackup, StoredData } from '../utils/storage';
import {
  calculateSemesterMetrics,
  calculateActivityTypeBreakdown,
  calculateAverageSessionDuration,
  calculateStudyTimeToday,
  calculateStudyTimeThisWeek,
  calculateWeeklyTrends,
  calculateSubjectMetrics,
} from '../utils/calculations';
import { Mascot } from './Mascot';
import { SparkleIcon, TinyBenzene, TinyDnaHelix } from './ScientificMotifs';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Download,
  Upload,
  Calendar,
  Sparkles,
  BookOpen,
  FlaskConical,
  FileCheck,
  Flame,
  Award,
  ChevronRight,
  BarChart2,
  TrendingUp,
} from 'lucide-react';

interface AnalyticsViewProps {
  subjects: Subject[];
  activities: AcademicActivity[];
  sessions: StudySession[];
  semester: SemesterInfo;
  onDataImported: (data: StoredData) => void;
  onResetToDefaults: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  subjects,
  activities,
  sessions,
  semester,
  onDataImported,
  onResetToDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedWeekTrendIndex, setSelectedWeekTrendIndex] = useState<number>(semester.currentWeek - 1); // 0-indexed, default Week 3

  // 1. Semester Metrics
  const semMetrics = calculateSemesterMetrics(subjects, activities, sessions, semester);

  // 2. Study Metrics
  const totalStudyMinutes = semMetrics.totalStudyTime;
  const studyMinutesToday = calculateStudyTimeToday(sessions, semester.currentDateAnchor);
  const studyMinutesThisWeek = calculateStudyTimeThisWeek(sessions, '2026-10-04', '2026-10-10');
  const avgSessionDuration = calculateAverageSessionDuration(sessions);

  // Helper to format minutes into readable hours & minutes
  const formatMins = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // 3. Activity Type Breakdown
  const activityBreakdown = calculateActivityTypeBreakdown(activities);

  // 4. Weekly Trends across 19 weeks
  const weeklyTrends = calculateWeeklyTrends(semester, activities, sessions);
  const maxWeeklyStudyMinutes = Math.max(60, ...weeklyTrends.map((w) => w.studyMinutes));
  const maxWeeklyActivities = Math.max(4, ...weeklyTrends.map((w) => w.activityCount));

  const selectedWeekData = weeklyTrends[selectedWeekTrendIndex] || weeklyTrends[2];

  // Backup handlers
  const handleExport = () => {
    const data: StoredData = {
      version: 1,
      semester,
      subjects,
      activities,
      sessions,
      lastUpdated: new Date().toISOString(),
    };
    exportGardenBackup(data);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = importGardenBackup(content);
        if (imported) {
          onDataImported(imported);
          alert('Luna Study Garden data restored successfully! ♡');
        } else {
          alert('Could not read backup file. Please verify it is a valid Luna Garden JSON export.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FCFAF8] rounded-3xl p-5 sm:p-6 border border-[#F4DEE5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <Mascot expression="reading" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900">
                Semester 5 / 2026
              </span>
              <span className="text-[11px] font-mono text-purple-900/60">
                Week 3 Active
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#3B1F4B] flex items-center gap-2 mt-0.5">
              <span>Academic Analytics & Insights</span>
              <SparkleIcon className="w-3.5 h-3.5 text-pink-400" />
            </h1>
            <p className="text-xs text-purple-900/65 mt-0.5">
              A calm view of your semester workload, study volume, and subject balance.
            </p>
          </div>
        </div>

        {/* Export / Import Data */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-950 bg-white hover:bg-purple-50 border border-[#F4DEE5] rounded-xl transition-colors shadow-2xs"
            title="Download JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-950 bg-white hover:bg-purple-50 border border-[#F4DEE5] rounded-xl transition-colors shadow-2xs"
            title="Restore from JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SEMESTER */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-700" />
            <h2 className="font-display text-base font-bold text-[#3B1F4B]">
              Semester Progress
            </h2>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${semMetrics.scheduleHealth.bgClass} ${semMetrics.scheduleHealth.borderClass} ${semMetrics.scheduleHealth.colorClass}`}>
            {semMetrics.scheduleHealth.title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Total Activities */}
          <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-purple-100/80">
            <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
              Total Activities
            </span>
            <div className="text-2xl font-bold text-[#3B1F4B] font-mono tabular-nums mt-1">
              {semMetrics.totalRecordedActivities}
            </div>
            <p className="text-[10px] text-purple-900/50 mt-0.5">
              recorded by you
            </p>
          </div>

          {/* Completed */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70">
            <span className="text-[10px] font-semibold text-emerald-900/70 uppercase tracking-wider block">
              Completed
            </span>
            <div className="text-2xl font-bold text-emerald-950 font-mono tabular-nums mt-1">
              {semMetrics.totalCompletedActivities}
            </div>
            <p className="text-[10px] text-emerald-800/60 mt-0.5">
              studied & reviewed
            </p>
          </div>

          {/* Pending */}
          <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-purple-100/80">
            <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
              Pending
            </span>
            <div className="text-2xl font-bold text-purple-950 font-mono tabular-nums mt-1">
              {semMetrics.totalPendingActivities}
            </div>
            <p className="text-[10px] text-purple-900/50 mt-0.5">
              remaining in queue
            </p>
          </div>

          {/* Overdue */}
          <div className={`p-3.5 rounded-2xl border ${
            semMetrics.totalOverdueActivities > 0
              ? 'bg-rose-50/50 border-rose-200/80'
              : 'bg-[#FCFAF8] border-purple-100/80'
          }`}>
            <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
              semMetrics.totalOverdueActivities > 0 ? 'text-rose-900/70' : 'text-purple-900/60'
            }`}>
              Overdue
            </span>
            <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              semMetrics.totalOverdueActivities > 0 ? 'text-rose-950' : 'text-purple-950'
            }`}>
              {semMetrics.totalOverdueActivities}
            </div>
            <p className={`text-[10px] mt-0.5 ${
              semMetrics.totalOverdueActivities > 0 ? 'text-rose-800/60' : 'text-purple-900/50'
            }`}>
              prior to Week 3 anchor
            </p>
          </div>

          {/* Academic Progress */}
          <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/70 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold text-purple-900/70 uppercase tracking-wider block">
              Academic Progress
            </span>
            <div className="text-2xl font-bold text-purple-950 font-mono tabular-nums mt-1">
              {semMetrics.overallAcademicProgress}%
            </div>
            <div className="w-full bg-purple-200/50 rounded-full h-1.5 overflow-hidden mt-1.5">
              <div
                className="h-full bg-purple-700 transition-all duration-300"
                style={{ width: `${semMetrics.overallAcademicProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: STUDY */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
          <Clock className="w-4 h-4 text-purple-700" />
          <h2 className="font-display text-base font-bold text-[#3B1F4B]">
            Study Time & Volume
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Study Time */}
          <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-purple-100/80">
            <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
              Total Study Time
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#3B1F4B] font-mono tabular-nums mt-1">
              {formatMins(totalStudyMinutes)}
            </div>
            <p className="text-[10px] text-purple-900/50 font-mono mt-0.5">
              {totalStudyMinutes} minutes total
            </p>
          </div>

          {/* This Week */}
          <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-purple-100/80">
            <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
              This Week (Week 3)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#3B1F4B] font-mono tabular-nums mt-1">
              {formatMins(studyMinutesThisWeek)}
            </div>
            <p className="text-[10px] text-purple-900/50 font-mono mt-0.5">
              Oct 04 → Oct 10
            </p>
          </div>

          {/* Today */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-200/70">
            <span className="text-[10px] font-semibold text-pink-900/70 uppercase tracking-wider block">
              Today
            </span>
            <div className="text-xl sm:text-2xl font-bold text-pink-950 font-mono tabular-nums mt-1">
              {formatMins(studyMinutesToday)}
            </div>
            <p className="text-[10px] text-pink-900/60 font-mono mt-0.5">
              {semester.currentDateAnchor}
            </p>
          </div>

          {/* Average Session Duration */}
          <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-purple-100/80">
            <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
              Average Session
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#3B1F4B] font-mono tabular-nums mt-1">
              {avgSessionDuration > 0 ? `${avgSessionDuration} min` : '0 min'}
            </div>
            <p className="text-[10px] text-purple-900/50 mt-0.5">
              {sessions.length} sessions logged
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: BY SUBJECT */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-700" />
            <h2 className="font-display text-base font-bold text-[#3B1F4B]">
              Subject Balance & Completion
            </h2>
          </div>
          <span className="text-[11px] font-mono text-purple-900/60">
            All 6 Subjects Tracked
          </span>
        </div>

        <div className="space-y-3">
          {subjects.map((sub) => {
            const subMetrics = calculateSubjectMetrics(sub.id, activities, sessions, semester.currentDateAnchor);
            const timeFormatted = formatMins(subMetrics.totalStudyTime);

            return (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-purple-100/80 hover:border-purple-200 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900">
                      {sub.code}
                    </span>
                    <h3 className="font-semibold text-xs sm:text-sm text-purple-950">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-purple-900/50 uppercase mr-1.5 font-sans">
                        Study Time:
                      </span>
                      <span className="font-bold text-purple-900">
                        {timeFormatted}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-purple-900/50 uppercase mr-1.5 font-sans">
                        Completion:
                      </span>
                      <span className="font-bold text-emerald-800">
                        {subMetrics.overallCompletionPercentage}%
                      </span>
                      <span className="text-[10px] text-purple-900/50 ml-1">
                        ({subMetrics.completedActivities}/{subMetrics.totalActivities})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slim progress bar */}
                <div className="w-full bg-purple-100/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${sub.color.accent} transition-all duration-300`}
                    style={{ width: `${subMetrics.overallCompletionPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: ACTIVITY BREAKDOWN */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-700" />
            <h2 className="font-display text-base font-bold text-[#3B1F4B]">
              Activity Breakdown
            </h2>
          </div>
          <span className="text-[11px] text-purple-900/60 font-mono">
            Categorized academic workload
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
          {/* Lectures */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70">
            <BookOpen className="w-4 h-4 text-purple-700 mx-auto mb-1" />
            <div className="text-xl font-bold text-purple-950 font-mono tabular-nums">
              {activityBreakdown.lectures}
            </div>
            <div className="text-[10px] font-semibold text-purple-900/70 uppercase tracking-wider mt-0.5">
              Lectures
            </div>
          </div>

          {/* Sections */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/70">
            <FlaskConical className="w-4 h-4 text-teal-700 mx-auto mb-1" />
            <div className="text-xl font-bold text-teal-950 font-mono tabular-nums">
              {activityBreakdown.sections}
            </div>
            <div className="text-[10px] font-semibold text-teal-900/70 uppercase tracking-wider mt-0.5">
              Sections
            </div>
          </div>

          {/* Assignments */}
          <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-200/70">
            <FileCheck className="w-4 h-4 text-pink-700 mx-auto mb-1" />
            <div className="text-xl font-bold text-pink-950 font-mono tabular-nums">
              {activityBreakdown.assignments}
            </div>
            <div className="text-[10px] font-semibold text-pink-900/70 uppercase tracking-wider mt-0.5">
              Assignments
            </div>
          </div>

          {/* Revisions */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70">
            <RotateCcw className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
            <div className="text-xl font-bold text-indigo-950 font-mono tabular-nums">
              {activityBreakdown.revisions}
            </div>
            <div className="text-[10px] font-semibold text-indigo-900/70 uppercase tracking-wider mt-0.5">
              Revisions
            </div>
          </div>

          {/* Quizzes */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
            <Flame className="w-4 h-4 text-amber-700 mx-auto mb-1" />
            <div className="text-xl font-bold text-amber-950 font-mono tabular-nums">
              {activityBreakdown.quizzes}
            </div>
            <div className="text-[10px] font-semibold text-amber-900/70 uppercase tracking-wider mt-0.5">
              Quizzes
            </div>
          </div>

          {/* Exams */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/70">
            <Award className="w-4 h-4 text-rose-700 mx-auto mb-1" />
            <div className="text-xl font-bold text-rose-950 font-mono tabular-nums">
              {activityBreakdown.exams}
            </div>
            <div className="text-[10px] font-semibold text-rose-900/70 uppercase tracking-wider mt-0.5">
              Exams
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: WEEKLY TRENDS ACROSS SEMESTER WEEKS */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-700" />
            <h2 className="font-display text-base font-bold text-[#3B1F4B]">
              Weekly Study & Activity Trend
            </h2>
          </div>
          <span className="text-[11px] text-purple-900/60 font-mono">
            19 Weeks · Week 3 Active
          </span>
        </div>

        <p className="text-xs text-purple-900/70 leading-relaxed">
          Clean visual distribution across the 19 academic weeks. Tap any week bar to inspect its exact study minutes and recorded activities.
        </p>

        {/* Minimalist 19-Week SVG/CSS Bar Chart */}
        <div className="pt-2">
          <div className="grid grid-cols-19 gap-1 sm:gap-1.5 items-end h-36 bg-[#FCFAF8] p-3 rounded-2xl border border-purple-100/80 overflow-x-auto">
            {weeklyTrends.map((w, idx) => {
              const isSelected = selectedWeekTrendIndex === idx;
              // Bar height relative to max weekly study minutes, with a clean minimum
              const heightPercent = w.studyMinutes > 0
                ? Math.max(12, Math.round((w.studyMinutes / maxWeeklyStudyMinutes) * 100))
                : w.activityCount > 0
                ? 16
                : 6;

              return (
                <button
                  key={w.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeekTrendIndex(idx)}
                  className="flex flex-col items-center justify-end h-full group focus:outline-none min-w-[14px]"
                  title={`Week ${w.weekNumber}: ${w.studyMinutes}m studied · ${w.activityCount} activities`}
                >
                  <div
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-900 ring-2 ring-purple-400'
                        : w.isCurrent
                        ? 'bg-pink-500 hover:bg-pink-600'
                        : w.studyMinutes > 0
                        ? 'bg-purple-400 hover:bg-purple-500'
                        : w.activityCount > 0
                        ? 'bg-purple-200 hover:bg-purple-300'
                        : w.status === 'past'
                        ? 'bg-purple-100'
                        : 'bg-purple-50 hover:bg-purple-100'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span
                    className={`text-[9px] font-mono mt-1 ${
                      w.isCurrent
                        ? 'font-bold text-pink-600'
                        : isSelected
                        ? 'font-bold text-purple-950'
                        : 'text-purple-900/50'
                    }`}
                  >
                    W{w.weekNumber}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Week Inspector Pill */}
          <div className="mt-3 p-3 rounded-2xl bg-[#FCFAF8] border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                selectedWeekData.isCurrent
                  ? 'bg-pink-100 text-pink-900 border border-pink-200'
                  : 'bg-purple-100 text-purple-900'
              }`}>
                Week {selectedWeekData.weekNumber} {selectedWeekData.isCurrent ? '(Current Week ♡)' : ''}
              </span>
              <span className="font-mono text-purple-900/70">
                {selectedWeekData.startDate} → {selectedWeekData.endDate}
              </span>
            </div>

            <div className="flex items-center gap-4 text-purple-900 font-mono">
              <span>
                Study: <span className="font-bold">{formatMins(selectedWeekData.studyMinutes)}</span>
              </span>
              <span>
                Activities: <span className="font-bold">{selectedWeekData.activityCount}</span>
              </span>
              <span>
                Completed: <span className="font-bold text-emerald-800">{selectedWeekData.completedCount}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Storage and Data Safety Note */}
      <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-purple-200/70 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold">Client-Side Persistence:</span> All calculations update dynamically in real time and persist locally in browser storage (`luna_study_garden_v1`).
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset Luna Study Garden to initial clean Week 3 state?')) {
              onResetToDefaults();
            }
          }}
          className="text-xs text-rose-700 hover:underline shrink-0"
        >
          Reset to default state
        </button>
      </div>
    </div>
  );
};
