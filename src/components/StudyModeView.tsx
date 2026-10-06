import React, { useState } from 'react';
import { Subject, AcademicActivity, StudySession, SubjectId, StudyOutcome } from '../types';
import { Mascot } from './Mascot';
import { Play, Pause, RotateCcw, Check, Sparkles, Volume2, VolumeX, BookOpen, Clock, Tag } from 'lucide-react';
import { SparkleIcon, TinyBenzene, TinyDnaHelix } from './ScientificMotifs';
import { StudyMaterialsView } from './StudyMaterialsView';

interface StudyModeViewProps {
  subjects: Subject[];
  activities: AcademicActivity[];
  isRunning: boolean;
  secondsLeft: number;
  initialMinutes: number;
  selectedSubjectId: SubjectId;
  selectedActivityId: string;
  onSetSelectedSubject: (id: SubjectId) => void;
  onSetSelectedActivity: (id: string) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: (newMinutes?: number) => void;
  onFinishSession: (outcome: StudyOutcome, notes: string, actualMinutesSpent: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  recentSessions: StudySession[];
}

export const StudyModeView: React.FC<StudyModeViewProps> = ({
  subjects,
  activities,
  isRunning,
  secondsLeft,
  initialMinutes,
  selectedSubjectId,
  selectedActivityId,
  onSetSelectedSubject,
  onSetSelectedActivity,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onFinishSession,
  soundEnabled,
  onToggleSound,
  recentSessions,
}) => {
  const [customInput, setCustomInput] = useState<string>('30');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<StudyOutcome>('Studied');
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectActivities = activities.filter((a) => a.subjectId === selectedSubjectId);
  const currentActivity = activities.find((a) => a.id === selectedActivityId);

  const totalSeconds = initialMinutes * 60;
  const elapsedSeconds = Math.max(0, totalSeconds - secondsLeft);
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100)) : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handlePreset = (mins: number) => {
    onResetTimer(mins);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0 && val <= 300) {
      onResetTimer(val);
    }
  };

  const handlePromptFinish = () => {
    setShowFinishModal(true);
  };

  const handleConfirmFinish = () => {
    const minutesStudied = Math.max(1, Math.round(elapsedSeconds / 60));
    onFinishSession(selectedOutcome, sessionNotes.trim(), minutesStudied);
    setShowFinishModal(false);
    setSessionNotes('');
    setSelectedOutcome('Studied');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner - Little Girl Study Desk & Scientific Journal feel */}
      <div className="relative overflow-hidden bg-[#FCFAF8] rounded-3xl p-5 sm:p-6 border border-[#F4DEE5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Decorative corner motifs */}
        <div className="absolute right-4 top-3 opacity-25 pointer-events-none hidden sm:flex items-center gap-2">
          <TinyBenzene className="w-6 h-6 text-purple-400" />
          <TinyDnaHelix className="w-8 h-4 text-pink-400" />
        </div>

        <div className="flex items-center gap-3.5 z-10">
          <Mascot expression={isRunning ? 'thinking' : 'reading'} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-900/60 font-semibold">
                Study Journal · Focus Desk
              </span>
              <span className="text-pink-400 text-xs font-serif">✦</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#3B1F4B] flex items-center gap-1.5 mt-0.5">
              <span>Luna's Focus Garden</span>
              <span className="text-pink-400 font-normal">♡</span>
            </h1>
            <p className="text-xs text-purple-900/70 mt-0.5">
              Settle in, select your activity, and enjoy calm scientific focus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 self-start sm:self-auto">
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              soundEnabled
                ? 'bg-purple-100/70 border-purple-200 text-purple-950'
                : 'bg-white border-purple-200/70 text-purple-900/50'
            }`}
            title={soundEnabled ? 'Soft crystal chime is enabled' : 'Muted'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Focus Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Target Selector & Presets */}
        <div className="lg:col-span-5 bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4DEE5] pb-2.5">
            <h2 className="font-display text-sm font-bold text-[#3B1F4B] flex items-center gap-1.5">
              <span>Selected Activity</span>
              <span className="text-pink-400 text-xs">✦</span>
            </h2>
            <span className="text-[10px] font-mono text-purple-900/60">
              {subjectActivities.length} items logged
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const newSubId = e.target.value as SubjectId;
                onSetSelectedSubject(newSubId);
                onSetSelectedActivity('');
              }}
              className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-white px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 transition-colors"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1">
              Academic Activity
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => onSetSelectedActivity(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-white px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 transition-colors"
            >
              <option value="">General {currentSubject?.name} Review</option>
              {subjectActivities.map((act) => (
                <option key={act.id} value={act.id}>
                  [{act.type}] {act.title}
                </option>
              ))}
            </select>
            {subjectActivities.length === 0 && (
              <p className="text-[11px] text-purple-900/60 mt-1">
                No individual activities logged in this subject yet. General session will be recorded!
              </p>
            )}

            {/* Attached Study Materials for currently selected activity */}
            {currentActivity && (
              <StudyMaterialsView activity={currentActivity} />
            )}
          </div>

          {/* Preset buttons: 25 / 5, 50 / 10, 90 / 15, Custom */}
          <div className="pt-2 border-t border-[#F4DEE5]">
            <label className="block text-xs font-semibold text-purple-950 mb-2">
              Focus Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 25, label: '25 / 5', sub: 'Pomodoro' },
                { mins: 50, label: '50 / 10', sub: 'Deep Work' },
                { mins: 90, label: '90 / 15', sub: 'Ultra Focus' },
              ].map((p) => (
                <button
                  key={p.mins}
                  onClick={() => handlePreset(p.mins)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    initialMinutes === p.mins
                      ? 'bg-purple-900 border-purple-950 text-white shadow-2xs font-semibold'
                      : 'bg-white border-[#F4DEE5] text-purple-950 hover:bg-purple-50'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{p.label}</div>
                  <div className={`text-[10px] ${initialMinutes === p.mins ? 'text-purple-200' : 'text-purple-900/60'}`}>
                    {p.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration Form */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-[#F4DEE5] flex items-center gap-2">
            <span className="text-xs text-purple-950 font-medium">Custom:</span>
            <input
              type="number"
              min="1"
              max="240"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-16 text-xs font-mono font-medium rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-center text-purple-950 tabular-nums focus:outline-none"
            />
            <span className="text-xs text-purple-900/60">mins</span>
            <button
              type="submit"
              className="px-2.5 py-1.5 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors ml-auto"
            >
              Set
            </button>
          </form>
        </div>

        {/* Right Column: Large Timer Display & Primary Action Controls */}
        <div className="lg:col-span-7 bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Current Activity Label */}
          <div className="mb-6 z-10 max-w-sm">
            <span className="text-[11px] font-semibold text-purple-900/60 uppercase tracking-wider block font-mono">
              {currentSubject?.name}
            </span>
            <h3 className="font-display text-base font-bold text-[#3B1F4B] truncate mt-0.5">
              {currentActivity ? currentActivity.title : 'General Study & Review'}
            </h3>
            {currentActivity && (
              <span className="text-xs text-purple-900/70 font-medium">
                {currentActivity.type} · {currentActivity.instructor} · {currentActivity.track}
              </span>
            )}
          </div>

          {/* Large Circular Timer Visual */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center z-10">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-[#F4DEE5]"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-purple-700 transition-all duration-500 ease-linear"
                strokeWidth="3.5"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[#3B1F4B] tabular-nums">
                {timeDisplay}
              </span>
              <span className="text-xs text-purple-900/70 font-medium mt-1">
                {isRunning ? '✦ Deep in the garden ✦' : 'Ready when you are ♡'}
              </span>
              <div className="text-[11px] font-mono text-purple-900/50 mt-1">
                {progressPercent}% elapsed
              </div>
            </div>
          </div>

          {/* Timer Buttons: Start, Pause, Resume, Finish */}
          <div className="mt-8 flex items-center justify-center gap-3 z-10">
            {!isRunning ? (
              <button
                onClick={onStartTimer}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-purple-900 hover:bg-purple-950 active:scale-98 rounded-2xl shadow-xs transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{elapsedSeconds > 0 ? 'Resume' : 'Start'}</span>
              </button>
            ) : (
              <button
                onClick={onPauseTimer}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-purple-950 bg-purple-100 hover:bg-purple-200 active:scale-98 rounded-2xl transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={() => onResetTimer()}
              className="p-2.5 rounded-2xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handlePromptFinish}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors"
              title="Finish & Log Study Session"
            >
              <Check className="w-4 h-4" />
              <span>Finish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Dialog with What Happened Options */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/20 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <Mascot expression="celebrate" size="lg" className="mx-auto" />
              <h3 className="font-display text-lg font-bold text-[#3B1F4B]">
                Nice little session ✦
              </h3>
              <p className="text-xs text-purple-900/70">
                You studied for ~{Math.max(1, Math.round(elapsedSeconds / 60))} minutes on {currentSubject?.name}.
              </p>
            </div>

            {/* What happened? Selector */}
            <div className="space-y-2 pt-2 border-t border-[#F4DEE5]">
              <label className="block text-xs font-bold text-[#3B1F4B]">
                What happened?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'Studied', label: 'Studied', sub: 'Thoroughly reviewed' },
                    { id: 'Completed', label: 'Completed', sub: 'Task finished' },
                    { id: 'Needs Revision', label: 'Needs Revision', sub: 'Flag for next pass' },
                    { id: 'Continue Later', label: 'Continue Later', sub: 'Keep in progress' },
                  ] as { id: StudyOutcome; label: string; sub: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOutcome(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      selectedOutcome === opt.id
                        ? 'bg-purple-900 border-purple-950 text-white shadow-2xs'
                        : 'bg-white border-[#F4DEE5] text-purple-950 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className={`text-[10px] ${selectedOutcome === opt.id ? 'text-purple-200' : 'text-purple-900/60'}`}>
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Short note or takeaways (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Key concepts reviewed, formulas practiced..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-purple-200 bg-white p-3 text-purple-950 placeholder:text-purple-300 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F4DEE5]">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 text-xs font-medium text-purple-900/70 hover:text-purple-950"
              >
                Keep Timer Running
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-xs"
              >
                Save & Log Session ♡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Study Sessions Log */}
      <div className="bg-[#FCFAF8] rounded-3xl border border-[#F4DEE5] p-5 shadow-xs space-y-3">
        <h3 className="font-display text-sm font-bold text-[#3B1F4B] flex items-center justify-between">
          <span>Recent Focus Sessions</span>
          <span className="text-xs font-mono font-normal text-purple-900/60">
            {recentSessions.length} logged
          </span>
        </h3>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-purple-900/60 text-center py-4">
            No study sessions logged yet. Complete a session above to record your study time! ♡
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {recentSessions.slice(0, 8).map((sess) => {
              const sub = subjects.find((s) => s.id === sess.subjectId);
              return (
                <div
                  key={sess.id}
                  className="p-3 rounded-2xl bg-white border border-[#F4DEE5] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-950">
                        {sub?.name || 'Study Session'}
                      </span>
                      {sess.activityTitle && (
                        <span className="text-purple-900/70 truncate max-w-xs font-medium">
                          · {sess.activityTitle}
                        </span>
                      )}
                      {sess.outcome && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">
                          {sess.outcome}
                        </span>
                      )}
                    </div>
                    {sess.notes && (
                      <p className="text-[11px] text-purple-900/75 italic">
                        "{sess.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-purple-900 font-mono tabular-nums">
                      {sess.durationMinutes} min
                    </span>
                    <div className="text-[10px] text-purple-900/50 font-mono">
                      {sess.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
