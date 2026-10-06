import React, { useState } from 'react';
import {
  Subject,
  AcademicActivity,
  RevisionSession,
  ActivityType,
  ActivityStatus,
  StudySession,
} from '../types';
import { calculateSubjectMetrics } from '../utils/calculations';
import { Mascot } from './Mascot';
import { StudyMaterialsView } from './StudyMaterialsView';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  RotateCcw,
  BookOpen,
  FlaskConical,
  FileCheck,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Timer,
  Sparkles,
  Filter,
} from 'lucide-react';

interface SubjectDetailViewProps {
  subject: Subject;
  activities: AcademicActivity[];
  sessions?: StudySession[];
  currentDateAnchor?: string;
  onBack: () => void;
  onOpenAddModal: (type?: ActivityType) => void;
  onEditActivity: (activity: AcademicActivity) => void;
  onDeleteActivity: (activityId: string) => void;
  onToggleActivityStatus: (activity: AcademicActivity) => void;
  onOpenRevisionModal: (activity: AcademicActivity) => void;
  onOpenExamModal: (examType: 'midterm' | 'practical' | 'final') => void;
  onStartStudySession: (activity: AcademicActivity) => void;
}

type TabType = 'overview' | 'lectures' | 'sections' | 'assignments' | 'revisions' | 'exams';

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  activities,
  sessions = [],
  currentDateAnchor = '2026-10-06',
  onBack,
  onOpenAddModal,
  onEditActivity,
  onDeleteActivity,
  onToggleActivityStatus,
  onOpenRevisionModal,
  onOpenExamModal,
  onStartStudySession,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<'all' | 'Theory' | 'Practical'>('all');

  const subjectActivities = activities.filter((a) => a.subjectId === subject.id);
  const metrics = calculateSubjectMetrics(subject.id, activities, sessions, currentDateAnchor);
  const health = metrics.scheduleHealth;

  // Filter activities based on first-class instructor filter and track
  const filteredActivities = subjectActivities.filter((act) => {
    if (selectedInstructor !== 'all' && act.instructor !== selectedInstructor) {
      return false;
    }
    if (selectedTrack !== 'all' && act.track !== selectedTrack) {
      return false;
    }
    if (activeTab === 'lectures') return act.type === 'Lecture';
    if (activeTab === 'sections') return act.type === 'Section';
    if (activeTab === 'assignments') return act.type === 'Assignment' || act.type === 'Task';
    if (activeTab === 'revisions') return act.type === 'Revision' || (act.revisionCount || 0) > 0;
    return true;
  });

  const lectures = subjectActivities.filter((a) => a.type === 'Lecture');
  const sections = subjectActivities.filter((a) => a.type === 'Section');
  const assignments = subjectActivities.filter((a) => a.type === 'Assignment' || a.type === 'Task');
  const revisionsList = subjectActivities.filter((a) => (a.revisionCount || 0) > 0 || a.type === 'Revision');

  return (
    <div className="space-y-6">
      {/* Top navigation back bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-900/70 hover:text-purple-950 bg-white px-3 py-1.5 rounded-xl border border-purple-200/80 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Subjects</span>
        </button>

        <button
          onClick={() => onOpenAddModal()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to {subject.code}</span>
        </button>
      </div>

      {/* Subject Header Banner */}
      <div className="bg-white/95 rounded-2xl border border-purple-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${subject.color.accent}`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900">
                {subject.code}
              </span>
              <span className={`text-xs font-semibold ${health.colorClass}`}>
                {health.title}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#3B1F4B]">
              {subject.name}
            </h1>
            <p className="text-xs sm:text-sm text-purple-900/75 leading-relaxed">
              {subject.description}
            </p>

            {/* Instructor stream tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-semibold text-purple-900/50 uppercase">
                Instructors:
              </span>
              {subject.instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F5] border border-purple-200/70 text-purple-950 font-medium flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{inst.name}</span>
                  <span className="text-purple-900/50 text-[10px]">
                    · {inst.streamName ? inst.streamName : inst.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Circle & Status */}
          <div className="flex items-center gap-4 sm:gap-6 bg-[#FAF7F5] p-4 rounded-xl border border-purple-100/80 self-start md:self-auto shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-950 font-mono tabular-nums">
                {metrics.overallCompletionPercentage}%
              </div>
              <div className="text-[10px] text-purple-900/60 uppercase">Progress</div>
            </div>

            <div className="h-8 w-px bg-purple-200/60" />

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-950 font-mono tabular-nums">
                {metrics.pendingActivities}
              </div>
              <div className="text-[10px] text-purple-900/60 uppercase">
                {metrics.overdueActivities > 0 ? `${metrics.overdueActivities} overdue` : 'Pending'}
              </div>
            </div>

            <div className="h-8 w-px bg-purple-200/60" />

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-950 font-mono tabular-nums">
                {Math.round((metrics.totalStudyTime / 60) * 10) / 10}h
              </div>
              <div className="text-[10px] text-purple-900/60 uppercase">Studied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-purple-200/60 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'lectures', label: `Lectures (${lectures.length})` },
              { id: 'sections', label: `Sections (${sections.length})` },
              { id: 'assignments', label: `Assignments (${assignments.length})` },
              { id: 'revisions', label: `Revisions (${metrics.revisions})` },
              { id: 'exams', label: 'Exams' },
            ] as { id: TabType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-purple-900 text-purple-950'
                  : 'border-transparent text-purple-900/60 hover:text-purple-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* First-Class Instructor & Track Filters (shown on activity tabs) */}
      {activeTab !== 'overview' && activeTab !== 'exams' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-3 rounded-xl border border-purple-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-purple-950 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-purple-600" />
              <span>Instructor:</span>
            </span>
            <button
              onClick={() => setSelectedInstructor('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                selectedInstructor === 'all'
                  ? 'bg-purple-900 text-white font-semibold shadow-2xs'
                  : 'bg-[#FAF7F5] text-purple-900/70 hover:text-purple-950'
              }`}
            >
              All Instructors
            </button>
            {subject.instructors.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setSelectedInstructor(inst.name)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedInstructor === inst.name
                    ? 'bg-purple-900 text-white font-semibold shadow-2xs'
                    : 'bg-[#FAF7F5] text-purple-900/70 hover:text-purple-950'
                }`}
              >
                {inst.name} {inst.streamName ? `(${inst.streamName.replace(' Stream', '')})` : ''}
              </button>
            ))}
          </div>

          {/* Track Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-purple-900/60">Track:</span>
            {(['all', 'Theory', 'Practical'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTrack(t)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  selectedTrack === t
                    ? 'bg-purple-200 text-purple-950 font-semibold'
                    : 'text-purple-900/60 hover:text-purple-950'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Panes */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Exam Status Row */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-purple-950">
                Exam Milestones
              </h3>
              <button
                onClick={() => setActiveTab('exams')}
                className="text-xs text-purple-700 hover:underline font-medium"
              >
                Manage Exam Dates
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {(['midterm', 'practical', 'final'] as const).map((eType) => {
                const ex = subject.exams[eType];
                return (
                  <div
                    key={eType}
                    onClick={() => onOpenExamModal(eType)}
                    className="p-4 bg-white rounded-xl border border-purple-200/80 hover:border-purple-400 transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-purple-950">{ex.type}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            ex.date
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {ex.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-purple-900 font-mono">
                        {ex.date ? ex.date : 'Date not set yet'}
                      </div>
                      {ex.notes && (
                        <p className="text-[11px] text-purple-900/70 mt-1 line-clamp-2">
                          {ex.notes}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 mt-2 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-600 group-hover:text-purple-900">
                      <span>Click to edit date/scope</span>
                      <Edit2 className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick breakdown of subject activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-purple-950">
                Recent Entries in {subject.name}
              </h3>
              <button
                onClick={() => onOpenAddModal()}
                className="text-xs font-semibold text-purple-900 hover:text-purple-950 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            {subjectActivities.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-purple-200/60 text-center space-y-3">
                <Mascot expression="encouraging" size="md" className="mx-auto" />
                <h4 className="font-display text-base font-bold text-purple-950">
                  No activities recorded yet ♡
                </h4>
                <p className="text-xs text-purple-900/65 max-w-sm mx-auto">
                  Record your lectures, practical sections, and assignments as they happen.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => onOpenAddModal('Lecture')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-purple-900 text-white rounded-xl shadow-xs"
                  >
                    + Record Lecture
                  </button>
                  <button
                    onClick={() => onOpenAddModal('Section')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-purple-100 text-purple-950 rounded-xl"
                  >
                    + Record Section
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {subjectActivities.slice(0, 5).map((act) => renderActivityRow(act))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LECTURES / SECTIONS / ASSIGNMENTS / REVISIONS TABS */}
      {(activeTab === 'lectures' ||
        activeTab === 'sections' ||
        activeTab === 'assignments' ||
        activeTab === 'revisions') && (
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-purple-200/60 text-center space-y-3">
              <Mascot expression="happy" size="md" className="mx-auto" />
              <h4 className="font-display text-base font-bold text-purple-950">
                {activeTab === 'lectures' && 'No lectures logged yet ♡'}
                {activeTab === 'sections' && 'No practical sections logged yet ♡'}
                {activeTab === 'assignments' && 'No assignments due here ♡'}
                {activeTab === 'revisions' && 'No revision sessions logged yet ♡'}
              </h4>
              <p className="text-xs text-purple-900/65 max-w-sm mx-auto">
                {activeTab === 'lectures' && "Add your first lecture whenever you're ready."}
                {activeTab === 'sections' && 'Track lab experiments and practical demonstrations here.'}
                {activeTab === 'assignments' && 'Keep problem sets and lab reports organized.'}
                {activeTab === 'revisions' && 'Future you will be grateful for multiple revision passes!'}
              </p>
              <button
                onClick={() =>
                  onOpenAddModal(
                    activeTab === 'lectures'
                      ? 'Lecture'
                      : activeTab === 'sections'
                      ? 'Section'
                      : activeTab === 'assignments'
                      ? 'Assignment'
                      : 'Revision'
                  )
                }
                className="px-4 py-2 text-xs font-semibold bg-purple-900 text-white rounded-xl shadow-xs"
              >
                + Add{' '}
                {activeTab === 'lectures'
                  ? 'Lecture'
                  : activeTab === 'sections'
                  ? 'Section'
                  : activeTab === 'assignments'
                  ? 'Assignment'
                  : 'Revision Item'}
              </button>
            </div>
          ) : (
            filteredActivities.map((act) => renderActivityRow(act))
          )}
        </div>
      )}

      {/* 3. EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-950 leading-relaxed">
            <span className="font-bold">Exam Dates & Scope:</span> Every subject contains placeholders for Midterm, Practical, and Final exams. When the department posts official dates, click any card to set the date, time, and exam room.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['midterm', 'practical', 'final'] as const).map((eType) => {
              const ex = subject.exams[eType];
              return (
                <div
                  key={eType}
                  className="bg-white rounded-2xl border border-purple-200/90 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-base text-purple-950">
                        {ex.type}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          ex.date
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF7F5] rounded-xl border border-purple-100">
                      <div className="text-xs text-purple-900/60 uppercase tracking-wider mb-0.5">
                        Scheduled Date
                      </div>
                      <div className="text-lg font-bold text-purple-950 font-mono">
                        {ex.date ? ex.date : 'Date not set yet'}
                      </div>
                      {ex.time && (
                        <div className="text-xs text-purple-900/70 mt-1 font-mono">
                          Time: {ex.time}
                        </div>
                      )}
                      {ex.location && (
                        <div className="text-xs text-purple-900/70 font-mono">
                          Room: {ex.location}
                        </div>
                      )}
                    </div>

                    {ex.notes ? (
                      <div className="text-xs text-purple-900/80 bg-white p-2.5 rounded-lg border border-purple-100">
                        <span className="font-semibold text-purple-950 block mb-0.5">
                          Notes / Syllabus:
                        </span>
                        {ex.notes}
                      </div>
                    ) : (
                      <p className="text-[11px] text-purple-900/50 italic">
                        No syllabus notes added yet.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-100">
                    <button
                      onClick={() => onOpenExamModal(eType)}
                      className="w-full py-2 text-xs font-semibold text-purple-900 bg-purple-100/70 hover:bg-purple-200/80 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{ex.date ? 'Edit Date & Scope' : 'Set Date'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  function renderActivityRow(act: AcademicActivity) {
    const isDone = act.completed || act.status === 'Studied' || act.status === 'Completed';

    return (
      <div
        key={act.id}
        className={`p-4 rounded-2xl bg-white border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
          isDone ? 'border-emerald-200/70 bg-emerald-50/20' : 'border-purple-200/80 hover:border-purple-300'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Quick toggle check button */}
          <button
            onClick={() => onToggleActivityStatus(act)}
            className="mt-0.5 text-purple-400 hover:text-purple-700 transition-colors shrink-0"
            title={isDone ? 'Mark as In Progress' : 'Mark as Studied'}
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-purple-950 truncate">
                {act.title}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-900">
                {act.type}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FAF7F5] border border-purple-200 text-purple-800">
                {act.track}
              </span>
              {act.streamName && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-50 border border-pink-200 text-pink-800">
                  {act.streamName}
                </span>
              )}
            </div>

            {/* Unboxed metadata line with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-purple-900/70 font-medium">
              <span>{act.instructor}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{act.date}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`text-[11px] font-semibold ${
                  act.status === 'Studied' || act.status === 'Completed'
                    ? 'text-emerald-700'
                    : act.status === 'Needs Revision'
                    ? 'text-rose-700'
                    : act.status === 'Taken'
                    ? 'text-amber-800'
                    : 'text-purple-900'
                }`}
              >
                {act.status}
              </span>
              {act.estimatedStudyTime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-purple-900/60">
                    Est: {act.estimatedStudyTime}m
                  </span>
                </>
              ) : null}
              {act.actualStudyTime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    Studied: {act.actualStudyTime}m
                  </span>
                </>
              ) : null}
            </div>

            {act.notes && (
              <p className="text-xs text-purple-900/75 bg-[#FAF7F5] p-2 rounded-lg mt-1 border border-purple-100 max-w-xl">
                {act.notes}
              </p>
            )}

            {/* Study Materials (Files & Links) */}
            <StudyMaterialsView activity={act} />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-100">
          {/* Quick study timer button */}
          <button
            onClick={() => onStartStudySession(act)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
            title="Start Study Timer for this item"
          >
            <Timer className="w-3.5 h-3.5 text-purple-700" />
            <span>Study</span>
          </button>

          {/* Multiple Revisions Button */}
          <button
            onClick={() => onOpenRevisionModal(act)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-900/80 hover:text-purple-950 bg-[#FAF7F5] hover:bg-purple-100/60 rounded-lg border border-purple-200/80 transition-colors"
            title="Manage Revisions (Revision 1, 2, 3...)"
          >
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span className="font-mono text-[11px]">
              Rev ({act.revisions?.length || act.revisionCount || 0})
            </span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEditActivity(act)}
            className="p-1.5 text-purple-600 hover:text-purple-950 hover:bg-purple-50 rounded-lg transition-colors"
            title="Edit activity"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteActivity(act.id)}
            className="p-1.5 text-purple-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete activity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
};
