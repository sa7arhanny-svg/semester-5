import React, { useState } from 'react';
import { AcademicActivity, Subject, SubjectId } from '../types';
import { generateTodaysPlan, groupBacklog } from '../utils/calculations';
import { Mascot } from './Mascot';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Circle,
  Timer,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SparkleIcon } from './ScientificMotifs';
import { StudyMaterialsView } from './StudyMaterialsView';

interface BacklogViewProps {
  activities: AcademicActivity[];
  subjects: Subject[];
  currentDateAnchor: string;
  onStartStudySession: (activity: AcademicActivity) => void;
  onToggleActivityStatus: (activity: AcademicActivity) => void;
  onEditActivity: (activity: AcademicActivity) => void;
  onDeleteActivity: (activityId: string) => void;
  onOpenAddModal: () => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
  activities,
  subjects,
  currentDateAnchor,
  onStartStudySession,
  onToggleActivityStatus,
  onEditActivity,
  onDeleteActivity,
  onOpenAddModal,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'needs_attention' | 'high_priority' | 'normal' | 'completed'>('all');

  const { recommended, queue } = generateTodaysPlan(activities, subjects, currentDateAnchor);
  const { needsAttention, highPriority, normal, completed } = groupBacklog(activities, currentDateAnchor);

  const getSubject = (subId: SubjectId) => subjects.find((s) => s.id === subId);

  const filterList = (list: AcademicActivity[]) => {
    if (selectedSubjectFilter === 'all') return list;
    return list.filter((a) => a.subjectId === selectedSubjectFilter);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* What should I do now? (Today's Plan Hero Recommendation) */}
      <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-white rounded-2xl border border-purple-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Mascot expression="encouraging" size="md" />
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-900/60 font-mono">
                Deterministic Study Dispatcher
              </span>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#3B1F4B] flex items-center gap-1.5">
                <span>What should I do now?</span>
                <span className="text-pink-400 font-normal">♡</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl shadow-2xs transition-colors"
          >
            + New Task / Lecture
          </button>
        </div>

        {recommended ? (
          <div className="bg-white rounded-xl border border-purple-200/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-bold uppercase tracking-wider">
                  Top Recommendation
                </span>
                <span className="text-xs font-semibold text-purple-900">
                  {getSubject(recommended.activity.subjectId)?.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100/70 text-purple-900">
                  {recommended.activity.type} · {recommended.activity.track}
                </span>
              </div>

              <h3 className="font-display text-base sm:text-lg font-bold text-[#3B1F4B]">
                {recommended.activity.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-purple-900/70 font-medium">
                <span>Instructor: {recommended.activity.instructor}</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-700 font-semibold">{recommended.reason}</span>
                {recommended.activity.estimatedStudyTime ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">Est: {recommended.activity.estimatedStudyTime}m</span>
                  </>
                ) : null}
              </div>

              {/* Study Materials */}
              <StudyMaterialsView activity={recommended.activity} compact />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onStartStudySession(recommended.activity)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-xs transition-colors"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Start This Session</span>
              </button>
              <button
                onClick={() => onToggleActivityStatus(recommended.activity)}
                className="p-2 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-700 transition-colors"
                title="Mark as Studied"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-xl border border-purple-200/60 p-5 text-center">
            <p className="text-xs text-purple-900/70">
              {activities.length === 0
                ? "No pending activities recorded yet. Add your lectures and assignments to get customized study recommendations! ♡"
                : "Look at you go ✦! No pending study tasks in your queue right now."}
            </p>
          </div>
        )}

        {/* Next up in queue */}
        {queue.length > 0 && (
          <div className="mt-4 pt-3 border-t border-purple-100">
            <span className="text-[11px] font-semibold text-purple-900/70 block mb-2">
              Next in queue today:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {queue.slice(0, 4).map((item) => (
                <div
                  key={item.activity.id}
                  className="p-2.5 rounded-lg bg-white/70 border border-purple-100 flex items-center justify-between text-xs hover:border-purple-300 transition-colors"
                >
                  <div className="truncate mr-2">
                    <div className="font-bold text-purple-950 truncate">
                      {item.activity.title}
                    </div>
                    <div className="text-[10px] text-purple-900/60 truncate">
                      {getSubject(item.activity.subjectId)?.code} · {item.reason}
                    </div>
                  </div>
                  <button
                    onClick={() => onStartStudySession(item.activity)}
                    className="p-1 text-purple-600 hover:text-purple-950 shrink-0"
                    title="Study this"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backlog Section */}
      <div className="space-y-4">
        {/* Filters and Group Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-purple-200/80">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-purple-900/60 mr-1">View Group:</span>
            {[
              { id: 'all', label: `All (${activities.length})` },
              { id: 'needs_attention', label: `Needs Attention (${needsAttention.length})` },
              { id: 'high_priority', label: `High Priority (${highPriority.length})` },
              { id: 'normal', label: `Normal (${normal.length})` },
              { id: 'completed', label: `Completed (${completed.length})` },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  selectedGroup === g.id
                    ? 'bg-purple-900 text-white font-bold'
                    : 'bg-[#FAF7F5] text-purple-900/70 hover:text-purple-950'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-purple-900/60">Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="text-xs font-medium rounded-lg border border-purple-200 bg-[#FAF7F5] px-2 py-1 text-purple-950 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Group Renderings */}
        <div className="space-y-5">
          {/* 1. Needs Attention */}
          {(selectedGroup === 'all' || selectedGroup === 'needs_attention') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Needs Attention / Overdue ({filterList(needsAttention).length})</span>
              </div>
              {filterList(needsAttention).length === 0 ? (
                <p className="text-[11px] text-purple-900/50 italic pl-5">
                  No overdue or urgent items waiting. Clean garden! ✦
                </p>
              ) : (
                filterList(needsAttention).map((act) => renderBacklogCard(act, 'rose'))
              )}
            </div>
          )}

          {/* 2. High Priority */}
          {(selectedGroup === 'all' || selectedGroup === 'high_priority') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>High Priority Incomplete ({filterList(highPriority).length})</span>
              </div>
              {filterList(highPriority).length === 0 ? (
                <p className="text-[11px] text-purple-900/50 italic pl-5">
                  No high priority items pending.
                </p>
              ) : (
                filterList(highPriority).map((act) => renderBacklogCard(act, 'purple'))
              )}
            </div>
          )}

          {/* 3. Normal Backlog */}
          {(selectedGroup === 'all' || selectedGroup === 'normal') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Regular Backlog ({filterList(normal).length})</span>
              </div>
              {filterList(normal).length === 0 ? (
                <p className="text-[11px] text-purple-900/50 italic pl-5">
                  No regular items currently waiting.
                </p>
              ) : (
                filterList(normal).map((act) => renderBacklogCard(act, 'normal'))
              )}
            </div>
          )}

          {/* 4. Completed */}
          {(selectedGroup === 'all' || selectedGroup === 'completed') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed / Studied Archive ({filterList(completed).length})</span>
              </div>
              {filterList(completed).length === 0 ? (
                <p className="text-[11px] text-purple-900/50 italic pl-5">
                  No completed activities yet. Your accomplishments will accumulate here!
                </p>
              ) : (
                filterList(completed).map((act) => renderBacklogCard(act, 'emerald'))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderBacklogCard(act: AcademicActivity, tone: 'rose' | 'purple' | 'normal' | 'emerald') {
    const sub = getSubject(act.subjectId);
    const isOverdue = act.date < currentDateAnchor && !act.completed && act.status !== 'Studied';

    return (
      <div
        key={act.id}
        className={`p-4 rounded-2xl bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs transition-colors ${
          tone === 'rose'
            ? 'border-rose-200/90 bg-rose-50/20'
            : tone === 'emerald'
            ? 'border-emerald-200/90 bg-emerald-50/20'
            : 'border-[#F4DEE5] hover:border-purple-300'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => onToggleActivityStatus(act)}
            className="mt-0.5 text-purple-400 hover:text-purple-700 transition-colors shrink-0"
            title={act.completed || act.status === 'Studied' ? 'Mark incomplete' : 'Mark complete'}
          >
            {act.completed || act.status === 'Studied' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-4 h-4 text-purple-400" />
            )}
          </button>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-purple-950 truncate max-w-sm">
                {act.title}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F5] border border-purple-200 text-purple-900">
                {sub?.code}
              </span>
              <span className="text-[10px] text-purple-900/60">
                {act.type} · {act.track}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-purple-900/70 font-medium">
              <span>{act.instructor}</span>
              <span aria-hidden="true">·</span>
              <span className={isOverdue ? 'text-rose-700 font-bold' : 'font-mono'}>
                {act.date} {isOverdue && '(Past date)'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-bold">{act.priority} priority</span>
              {act.estimatedStudyTime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Est: {act.estimatedStudyTime}m</span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-purple-900">Status: {act.status}</span>
            </div>

            {/* Study Materials */}
            <StudyMaterialsView activity={act} compact />
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <button
            onClick={() => onStartStudySession(act)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors"
          >
            <Timer className="w-3.5 h-3.5 text-purple-700" />
            <span>Study</span>
          </button>

          <button
            onClick={() => onEditActivity(act)}
            className="p-1.5 text-purple-600 hover:text-purple-950 rounded-lg hover:bg-purple-50"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteActivity(act.id)}
            className="p-1.5 text-purple-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
};
