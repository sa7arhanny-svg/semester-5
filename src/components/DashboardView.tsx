import React from 'react';
import {
  Subject,
  AcademicActivity,
  SemesterInfo,
  StudySession,
  HealthReport,
} from '../types';
import { Greeting } from './Greeting';
import { SubjectCard } from './SubjectCard';
import {
  calculateSemesterMetrics,
  generateTodaysPlan,
  groupBacklog,
} from '../utils/calculations';
import { Mascot } from './Mascot';
import {
  Clock,
  Calendar,
  ChevronRight,
  Timer,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { TinyBenzene, TinyDnaHelix, SparkleIcon } from './ScientificMotifs';

interface DashboardViewProps {
  semester: SemesterInfo;
  subjects: Subject[];
  activities: AcademicActivity[];
  sessions: StudySession[];
  health: HealthReport;
  onSelectSubject: (subjectId: Subject['id']) => void;
  onOpenAddModal: (subjectId?: Subject['id']) => void;
  onNavigateToTab: (tab: any) => void;
  onStartStudySession: (activity: AcademicActivity) => void;
  onToggleActivityStatus: (activity: AcademicActivity) => void;
  onOpenExamModal: (subjectId: Subject['id'], examType: 'midterm' | 'practical' | 'final') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  semester,
  subjects,
  activities,
  sessions,
  health,
  onSelectSubject,
  onOpenAddModal,
  onNavigateToTab,
  onStartStudySession,
  onToggleActivityStatus,
  onOpenExamModal,
}) => {
  const semMetrics = calculateSemesterMetrics(subjects, activities, sessions, semester);
  const { recommended, queue } = generateTodaysPlan(activities, subjects, semester.currentDateAnchor);
  const { needsAttention, highPriority, normal } = groupBacklog(activities, semester.currentDateAnchor);

  // 1. Study time metrics
  const todaySessions = sessions.filter((s) => s.date === semester.currentDateAnchor);
  const studyMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const thisWeekSessions = sessions.filter((s) => s.date >= '2026-10-04' && s.date <= '2026-10-10');
  const studyMinutesThisWeek = thisWeekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalStudyMinutes = semMetrics.totalStudyTime;

  // 2. Upcoming dates evaluation (assignments, quizzes, midterm, practical exam, final)
  const upcomingItems: {
    title: string;
    type: string;
    subjectCode: string;
    date: string;
    isExam?: boolean;
    subjectId?: string;
    examType?: 'midterm' | 'practical' | 'final';
  }[] = [];

  // Add activities that are assignments, quizzes, exams with dates
  activities.forEach((act) => {
    if (['Assignment', 'Quiz', 'Midterm', 'Practical Exam', 'Final Exam'].includes(act.type)) {
      if (act.date && act.date >= semester.currentDateAnchor && !act.completed) {
        const sub = subjects.find((s) => s.id === act.subjectId);
        upcomingItems.push({
          title: act.title,
          type: act.type,
          subjectCode: sub?.code || 'SEM 5',
          date: act.date,
        });
      }
    }
  });

  // Add scheduled subject exams
  subjects.forEach((s) => {
    (['midterm', 'practical', 'final'] as const).forEach((et) => {
      const ex = s.exams[et];
      if (ex.date && ex.date >= semester.currentDateAnchor) {
        upcomingItems.push({
          title: `${s.name} ${ex.type}`,
          type: ex.type,
          subjectCode: s.code,
          date: ex.date,
          isExam: true,
          subjectId: s.id,
          examType: et,
        });
      }
    });
  });

  // Sort upcoming chronologically
  upcomingItems.sort((a, b) => a.date.localeCompare(b.date));

  // 3. Backlog preview: 3 to 5 most important pending items
  const backlogPreviewItems = [...needsAttention, ...highPriority, ...normal].slice(0, 4);

  // Helper to format minutes to nice readable text
  const formatMins = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. GREETING */}
      <Greeting
        studentName={semester.studentName}
        health={semMetrics.scheduleHealth}
        totalActivities={semMetrics.totalRecordedActivities}
        completedActivities={semMetrics.totalCompletedActivities}
        studyMinutesToday={studyMinutesToday}
      />

      {/* 2. SEMESTER PROGRESS CARD */}
      <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Soft watermark motifs */}
        <div className="absolute right-4 top-4 opacity-20 pointer-events-none hidden sm:flex items-center gap-2">
          <TinyBenzene className="w-8 h-8 text-purple-400" />
          <TinyDnaHelix className="w-10 h-5 text-pink-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-100/80 text-purple-950">
                Semester 5 / 2026
              </span>
              <span className="text-[11px] text-purple-900/60 font-mono">
                Week 3 of 19 · Sep 20, 2026 → Jan 31, 2027
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#3B1F4B]">
              Academic Progress Overview
            </h2>
            <p className="text-xs text-purple-900/70 leading-relaxed">
              Tracking your lectures, sections, and study sessions across Semester 5. Three weeks have elapsed.
            </p>

            {/* Three key metrics displayed cleanly */}
            <div className="pt-3 grid grid-cols-3 gap-3 border-t border-[#F4DEE5]">
              <div>
                <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
                  Academic Progress
                </span>
                <span className="text-lg font-bold text-[#3B1F4B] font-mono tabular-nums">
                  {semMetrics.overallAcademicProgress}%
                </span>
                <span className="text-[10px] text-purple-900/50 block font-mono">
                  {semMetrics.totalCompletedActivities}/{semMetrics.totalRecordedActivities} items
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
                  Study Completion
                </span>
                <span className="text-lg font-bold text-[#3B1F4B] font-mono tabular-nums">
                  {semMetrics.studyCompletion}%
                </span>
                <span className="text-[10px] text-purple-900/50 block font-mono">
                  reviewed rate
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
                  Schedule Health
                </span>
                <span className={`text-xs font-bold block mt-1 ${semMetrics.scheduleHealth.colorClass}`}>
                  {semMetrics.scheduleHealth.title}
                </span>
              </div>
            </div>
          </div>

          {/* Satisfying Progress Ring Visual */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 self-center md:self-auto shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[#F4DEE5]"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-purple-700 transition-all duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={251.32}
                strokeDashoffset={251.32 - (251.32 * semMetrics.overallAcademicProgress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-bold text-[#3B1F4B] tabular-nums">
                {semMetrics.overallAcademicProgress}%
              </span>
              <span className="text-[10px] text-purple-900/60 font-medium">completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SCHEDULE HEALTH (Answers: "Am I keeping up?") */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${semMetrics.scheduleHealth.bgClass} ${semMetrics.scheduleHealth.borderClass}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-900/60 font-semibold">
              Schedule Health · Am I keeping up?
            </span>
            <span className="text-xs">✦</span>
          </div>

          <h3 className={`font-display text-lg sm:text-xl font-bold ${semMetrics.scheduleHealth.colorClass}`}>
            {semMetrics.scheduleHealth.title}
          </h3>

          <p className="text-xs text-purple-950/80 leading-relaxed">
            {semMetrics.scheduleHealth.message}
          </p>

          {/* Actual reason shown gently below */}
          <div className="pt-1 text-[11px] text-purple-900/70 font-medium flex items-center gap-2">
            <span>Current pacing note:</span>
            <span className="font-mono bg-white/70 px-2 py-0.5 rounded-md border border-purple-200/60 text-purple-900">
              {semMetrics.totalOverdueActivities > 0
                ? `${semMetrics.totalOverdueActivities} overdue items`
                : semMetrics.totalPendingActivities > 0
                ? `${semMetrics.totalPendingActivities} unfinished activities in queue`
                : semMetrics.totalRecordedActivities === 0
                ? 'Ready for first lecture records'
                : 'Most of this week’s work is complete'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('timeline')}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-white hover:bg-purple-50 text-purple-900 border border-purple-200/80 rounded-2xl shadow-2xs transition-colors shrink-0"
        >
          Check 19-Wk Timeline →
        </button>
      </div>

      {/* 4. TODAY'S PLAN (Most actionable section) */}
      <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-[#3B1F4B] flex items-center gap-1.5">
              <span>Today's Plan</span>
              <span className="text-pink-400 font-normal">♡</span>
            </h3>
            <p className="text-xs text-purple-900/70">
              Your most relevant unfinished activities for today.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('plan')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-950 transition-colors"
          >
            Open Plan Manager →
          </button>
        </div>

        {recommended ? (
          <div className="space-y-3">
            {/* Top featured recommended activity */}
            <div className="p-4 rounded-2xl bg-white border border-[#F4DEE5] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-purple-900">
                    {subjects.find((s) => s.id === recommended.activity.subjectId)?.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-950 font-medium">
                    {recommended.activity.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      recommended.activity.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : recommended.activity.priority === 'Medium'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {recommended.activity.priority} Priority
                  </span>
                  {recommended.activity.estimatedStudyTime && (
                    <span className="text-[11px] text-purple-900/60 font-mono">
                      · Est: {recommended.activity.estimatedStudyTime}m
                    </span>
                  )}
                </div>

                <h4 className="font-display text-base font-bold text-[#3B1F4B]">
                  {recommended.activity.title}
                </h4>

                <p className="text-xs text-purple-900/70">
                  {recommended.reason}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onStartStudySession(recommended.activity)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-950 rounded-2xl shadow-xs transition-colors"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => onToggleActivityStatus(recommended.activity)}
                  className="p-2 rounded-xl border border-purple-200/80 hover:bg-purple-50 text-purple-700 transition-colors"
                  title="Mark as Studied"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Queue items */}
            {queue.slice(0, 2).map((item) => (
              <div
                key={item.activity.id}
                className="p-3 rounded-2xl bg-white border border-[#F4DEE5] flex items-center justify-between text-xs gap-3 hover:border-purple-300 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-950 truncate">
                      {item.activity.title}
                    </span>
                    <span className="text-[10px] text-purple-900/60 shrink-0 font-mono">
                      {subjects.find((s) => s.id === item.activity.subjectId)?.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-900/60 font-medium">
                    {item.activity.priority} Priority · {item.activity.estimatedStudyTime}m · {item.reason}
                  </div>
                </div>

                <button
                  onClick={() => onStartStudySession(item.activity)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors shrink-0"
                >
                  <Timer className="w-3 h-3 text-purple-700" />
                  <span>Start</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded-2xl border border-[#F4DEE5] text-xs text-purple-900/60 space-y-1">
            <p>No study tasks queued right now ♡</p>
            <p className="text-[11px] text-purple-400">
              Record your lectures and assignments to populate today's plan!
            </p>
            <button
              onClick={() => onOpenAddModal()}
              className="mt-2 text-xs font-semibold text-purple-900 underline"
            >
              + Record activity
            </button>
          </div>
        )}
      </div>

      {/* 5. SUBJECT OVERVIEW (All six subjects) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-[#3B1F4B] flex items-center gap-1.5">
              <span>Subject Overview</span>
              <span className="text-xs font-normal text-purple-900/60 font-mono">(6 subjects)</span>
            </h3>
            <p className="text-xs text-purple-900/70">
              Click any subject to open its detailed notebook page.
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal()}
            className="text-xs font-semibold px-3 py-1.5 bg-purple-900 text-white rounded-xl hover:bg-purple-950 shadow-2xs transition-colors"
          >
            + Record Activity
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              activities={activities}
              sessions={sessions}
              currentDateAnchor={semester.currentDateAnchor}
              onSelect={onSelectSubject}
              onQuickAdd={onOpenAddModal}
            />
          ))}
        </div>
      </div>

      {/* 6. BACKLOG PREVIEW (Only the most important 3–5 items) */}
      <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F4DEE5] pb-2.5">
          <div>
            <h3 className="font-display text-sm font-bold text-[#3B1F4B]">
              Backlog Preview
            </h3>
            <p className="text-[11px] text-purple-900/60">
              Important pending items waiting for review.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('plan')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-950 transition-colors"
          >
            View all backlog ({needsAttention.length + highPriority.length + normal.length}) →
          </button>
        </div>

        {backlogPreviewItems.length === 0 ? (
          <p className="text-xs text-purple-900/60 text-center py-4">
            No items in your backlog right now. Everything is clear! ✦
          </p>
        ) : (
          <div className="space-y-2">
            {backlogPreviewItems.map((act) => {
              const sub = subjects.find((s) => s.id === act.subjectId);
              return (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-white border border-[#F4DEE5] flex items-center justify-between text-xs gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-950 truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FAF7F5] border border-purple-200 text-purple-900">
                        {sub?.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-900/60 font-medium">
                      {act.priority} priority · Est: {act.estimatedStudyTime || 30}m · Status: {act.status}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartStudySession(act)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors shrink-0"
                  >
                    <Timer className="w-3 h-3 text-purple-700" />
                    <span>Study</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. STUDY TIME & 8. UPCOMING DATES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 7. Study Time (Today, This Week, Semester Total) */}
        <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F4DEE5] pb-2.5">
            <h3 className="font-display text-sm font-bold text-[#3B1F4B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-700" />
              <span>Study Time Log</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('study')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-950"
            >
              Start Focus Timer
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-3 bg-white rounded-2xl border border-[#F4DEE5]">
              <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
                Today
              </span>
              <span className="text-base font-bold text-[#3B1F4B] font-mono tabular-nums mt-0.5 block">
                {formatMins(studyMinutesToday)}
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#F4DEE5]">
              <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
                This Week
              </span>
              <span className="text-base font-bold text-[#3B1F4B] font-mono tabular-nums mt-0.5 block">
                {formatMins(studyMinutesThisWeek)}
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#F4DEE5]">
              <span className="text-[10px] font-semibold text-purple-900/60 uppercase tracking-wider block">
                Semester
              </span>
              <span className="text-base font-bold text-[#3B1F4B] font-mono tabular-nums mt-0.5 block">
                {formatMins(totalStudyMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* 8. Upcoming (Nearest assignment, quiz, midterm, practical exam, final) */}
        <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F4DEE5] pb-2.5">
            <h3 className="font-display text-sm font-bold text-[#3B1F4B] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-600" />
              <span>Upcoming Dates</span>
            </h3>
            <span className="text-[10px] font-mono text-purple-900/50">
              Exam & Task Horizon
            </span>
          </div>

          {upcomingItems.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-2xl border border-[#F4DEE5] text-xs text-purple-900/70">
              Exam dates are still unknown ♡
              <p className="text-[11px] text-purple-400 mt-0.5">
                When official dates are confirmed, you can add them to any subject.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {upcomingItems.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.isExam && item.subjectId && item.examType) {
                      onOpenExamModal(item.subjectId as any, item.examType);
                    }
                  }}
                  className={`p-2.5 rounded-2xl bg-white border border-[#F4DEE5] flex items-center justify-between text-xs ${
                    item.isExam ? 'cursor-pointer hover:border-purple-300' : ''
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-purple-950 truncate block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-purple-900/60">
                      {item.subjectCode} · {item.type}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-900 shrink-0">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
