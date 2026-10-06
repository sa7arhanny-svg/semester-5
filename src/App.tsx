import React, { useState, useEffect, useRef } from 'react';
import {
  Subject,
  AcademicActivity,
  StudySession,
  SemesterInfo,
  NavigationTab,
  SubjectId,
  ActivityType,
  RevisionSession,
  ExamPlaceholder,
  StudyOutcome,
} from './types';
import { loadStoredData, saveStoredData, resetStorageToDefaults, StoredData } from './utils/storage';
import { determineScheduleHealth } from './utils/calculations';
import { playGentleBellChime } from './utils/audio';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SubjectsListView } from './components/SubjectsListView';
import { SubjectDetailView } from './components/SubjectDetailView';
import { BacklogView } from './components/BacklogView';
import { StudyModeView } from './components/StudyModeView';
import { SemesterTimelineView } from './components/SemesterTimelineView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddActivityModal } from './components/AddActivityModal';
import { RevisionModal } from './components/RevisionModal';
import { ExamEditModal } from './components/ExamEditModal';
import { SettingsModal } from './components/SettingsModal';
import { SparkleIcon } from './components/ScientificMotifs';

export default function App() {
  // Primary application state initialized from LocalStorage
  const [storedData, setStoredData] = useState<StoredData>(() => loadStoredData());

  const semester = storedData.semester;
  const subjects = storedData.subjects;
  const activities = storedData.activities;
  const sessions = storedData.sessions;

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialSubjectId, setModalInitialSubjectId] = useState<SubjectId | undefined>();
  const [editingActivity, setEditingActivity] = useState<AcademicActivity | null>(null);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionActivity, setRevisionActivity] = useState<AcademicActivity | null>(null);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examModalSubjectId, setExamModalSubjectId] = useState<SubjectId | null>(null);
  const [examModalType, setExamModalType] = useState<'midterm' | 'practical' | 'final' | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Study timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimerMinutes, setInitialTimerMinutes] = useState(25);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [timerSubjectId, setTimerSubjectId] = useState<SubjectId>(subjects[0]?.id || 'forensic-entomology');
  const [timerActivityId, setTimerActivityId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync to localStorage whenever data changes
  const saveAll = (updated: StoredData) => {
    setStoredData(updated);
    saveStoredData(updated);
  };

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (soundEnabled) {
              playGentleBellChime();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, soundEnabled]);

  // Overall schedule health calculation
  const health = determineScheduleHealth(activities, semester.currentDateAnchor);

  // Navigation handlers
  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    if (tab !== 'subjects') {
      setActiveSubjectId(null);
    }
  };

  const handleSelectSubject = (id: SubjectId) => {
    setActiveSubjectId(id);
    setCurrentTab('subjects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Activity management handlers
  const handleSaveActivity = (newOrUpdated: AcademicActivity) => {
    const existingIndex = activities.findIndex((a) => a.id === newOrUpdated.id);
    let updatedActivities: AcademicActivity[];
    if (existingIndex >= 0) {
      updatedActivities = [...activities];
      updatedActivities[existingIndex] = newOrUpdated;
    } else {
      updatedActivities = [newOrUpdated, ...activities];
    }

    const updatedData = { ...storedData, activities: updatedActivities };
    saveAll(updatedData);

    // If modal was for revision target, keep it refreshed
    if (revisionActivity && revisionActivity.id === newOrUpdated.id) {
      setRevisionActivity(newOrUpdated);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      const updated = activities.filter((a) => a.id !== activityId);
      saveAll({ ...storedData, activities: updated });
    }
  };

  const handleToggleActivityStatus = (activity: AcademicActivity) => {
    const isDone = activity.completed || activity.status === 'Studied' || activity.status === 'Completed';
    const newStatus = isDone ? 'In Progress' : 'Studied';
    const updated = activities.map((a) => {
      if (a.id === activity.id) {
        return {
          ...a,
          completed: !isDone,
          status: newStatus as any,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    saveAll({ ...storedData, activities: updated });
  };

  // Revision management handlers
  const handleAddRevision = (activityId: string, revision: RevisionSession) => {
    const updated = activities.map((a) => {
      if (a.id === activityId) {
        const revs = [...(a.revisions || []), revision];
        return {
          ...a,
          revisions: revs,
          revisionCount: revs.length,
          actualStudyTime: (a.actualStudyTime || 0) + revision.durationMinutes,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    saveAll({ ...storedData, activities: updated });
    const refreshed = updated.find((a) => a.id === activityId);
    if (refreshed) setRevisionActivity(refreshed);
  };

  const handleToggleRevisionStatus = (activityId: string, revisionId: string) => {
    const updated = activities.map((a) => {
      if (a.id === activityId) {
        const revs = (a.revisions || []).map((r) => {
          if (r.id === revisionId) {
            return {
              ...r,
              status: r.status === 'Completed' ? ('Planned' as const) : ('Completed' as const),
            };
          }
          return r;
        });
        return { ...a, revisions: revs };
      }
      return a;
    });
    saveAll({ ...storedData, activities: updated });
    const refreshed = updated.find((a) => a.id === activityId);
    if (refreshed) setRevisionActivity(refreshed);
  };

  const handleDeleteRevision = (activityId: string, revisionId: string) => {
    const updated = activities.map((a) => {
      if (a.id === activityId) {
        const revs = (a.revisions || []).filter((r) => r.id !== revisionId);
        return { ...a, revisions: revs, revisionCount: revs.length };
      }
      return a;
    });
    saveAll({ ...storedData, activities: updated });
    const refreshed = updated.find((a) => a.id === activityId);
    if (refreshed) setRevisionActivity(refreshed);
  };

  // Exam placeholder management handler
  const handleSaveExam = (
    subId: SubjectId,
    examType: 'midterm' | 'practical' | 'final',
    updatedPlaceholder: ExamPlaceholder
  ) => {
    const updatedSubjects = subjects.map((s) => {
      if (s.id === subId) {
        return {
          ...s,
          exams: {
            ...s.exams,
            [examType]: updatedPlaceholder,
          },
        };
      }
      return s;
    });
    saveAll({ ...storedData, subjects: updatedSubjects });
  };

  // Study timer controls
  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = (newMinutes?: number) => {
    setIsTimerRunning(false);
    const mins = newMinutes || initialTimerMinutes;
    setInitialTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
  };

  const handleFinishSession = (outcome: StudyOutcome, notes: string, actualMinutesSpent: number) => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(initialTimerMinutes * 60);

    const targetAct = activities.find((a) => a.id === timerActivityId);

    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId: timerSubjectId,
      activityId: timerActivityId || undefined,
      activityTitle: targetAct ? targetAct.title : undefined,
      date: semester.currentDateAnchor,
      startTime: new Date().toISOString(),
      durationMinutes: actualMinutesSpent,
      notes,
      outcome,
      mode: initialTimerMinutes === 25 ? 'pomodoro' : initialTimerMinutes === 50 ? 'deep' : initialTimerMinutes === 90 ? 'ultra' : 'custom',
    };

    // Update study time and status on specific activity if linked
    let updatedActivities = activities;
    if (timerActivityId) {
      updatedActivities = activities.map((a) => {
        if (a.id === timerActivityId) {
          const isDone = outcome === 'Studied' || outcome === 'Completed';
          const newStatus =
            outcome === 'Studied'
              ? 'Studied'
              : outcome === 'Completed'
              ? 'Completed'
              : outcome === 'Needs Revision'
              ? 'Needs Revision'
              : 'In Progress';

          return {
            ...a,
            status: newStatus as any,
            completed: isDone,
            actualStudyTime: (a.actualStudyTime || 0) + actualMinutesSpent,
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      });
    }

    const updatedSessions = [newSession, ...sessions];
    saveAll({
      ...storedData,
      activities: updatedActivities,
      sessions: updatedSessions,
    });

    if (soundEnabled) {
      playGentleBellChime();
    }
  };

  const handleStartStudySessionFromActivity = (activity: AcademicActivity) => {
    setTimerSubjectId(activity.subjectId);
    setTimerActivityId(activity.id);
    const est = activity.estimatedStudyTime || 25;
    setInitialTimerMinutes(est);
    setTimerSecondsLeft(est * 60);
    setIsTimerRunning(true);
    setCurrentTab('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open modal helpers
  const handleOpenAddModal = (subId?: SubjectId, prefillType?: ActivityType) => {
    setEditingActivity(null);
    setModalInitialSubjectId(subId || activeSubjectId || subjects[0]?.id);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (activity: AcademicActivity) => {
    setEditingActivity(activity);
    setModalInitialSubjectId(activity.subjectId);
    setIsAddModalOpen(true);
  };

  const handleOpenRevisionModal = (activity: AcademicActivity) => {
    setRevisionActivity(activity);
    setIsRevisionModalOpen(true);
  };

  const handleOpenExamModal = (subId: SubjectId, examType: 'midterm' | 'practical' | 'final') => {
    setExamModalSubjectId(subId);
    setExamModalType(examType);
    setIsExamModalOpen(true);
  };

  const handleResetToDefaults = () => {
    const fresh = resetStorageToDefaults();
    setStoredData(fresh);
  };

  const activeSubjectObj = subjects.find((s) => s.id === activeSubjectId);
  const examModalSubjectObj = subjects.find((s) => s.id === examModalSubjectId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-[#2D2438] notebook-dots">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTimerRunning={isTimerRunning}
        timerSecondsLeft={timerSecondsLeft}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            semester={semester}
            subjects={subjects}
            activities={activities}
            sessions={sessions}
            health={health}
            onSelectSubject={handleSelectSubject}
            onOpenAddModal={handleOpenAddModal}
            onNavigateToTab={handleSelectTab}
            onStartStudySession={handleStartStudySessionFromActivity}
            onToggleActivityStatus={handleToggleActivityStatus}
            onOpenExamModal={handleOpenExamModal}
          />
        )}

        {currentTab === 'subjects' && !activeSubjectId && (
          <SubjectsListView
            subjects={subjects}
            activities={activities}
            sessions={sessions}
            currentDateAnchor={semester.currentDateAnchor}
            onSelectSubject={handleSelectSubject}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {currentTab === 'subjects' && activeSubjectId && activeSubjectObj && (
          <SubjectDetailView
            subject={activeSubjectObj}
            activities={activities}
            sessions={sessions}
            currentDateAnchor={semester.currentDateAnchor}
            onBack={() => setActiveSubjectId(null)}
            onOpenAddModal={(type) => handleOpenAddModal(activeSubjectId, type)}
            onEditActivity={handleOpenEditModal}
            onDeleteActivity={handleDeleteActivity}
            onToggleActivityStatus={handleToggleActivityStatus}
            onOpenRevisionModal={handleOpenRevisionModal}
            onOpenExamModal={(eType) => handleOpenExamModal(activeSubjectId, eType)}
            onStartStudySession={handleStartStudySessionFromActivity}
          />
        )}

        {currentTab === 'plan' && (
          <BacklogView
            activities={activities}
            subjects={subjects}
            currentDateAnchor={semester.currentDateAnchor}
            onStartStudySession={handleStartStudySessionFromActivity}
            onToggleActivityStatus={handleToggleActivityStatus}
            onEditActivity={handleOpenEditModal}
            onDeleteActivity={handleDeleteActivity}
            onOpenAddModal={() => handleOpenAddModal()}
          />
        )}

        {currentTab === 'study' && (
          <StudyModeView
            subjects={subjects}
            activities={activities}
            isRunning={isTimerRunning}
            secondsLeft={timerSecondsLeft}
            initialMinutes={initialTimerMinutes}
            selectedSubjectId={timerSubjectId}
            selectedActivityId={timerActivityId}
            onSetSelectedSubject={setTimerSubjectId}
            onSetSelectedActivity={setTimerActivityId}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResetTimer={handleResetTimer}
            onFinishSession={handleFinishSession}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            recentSessions={sessions}
          />
        )}

        {currentTab === 'timeline' && (
          <SemesterTimelineView
            semester={semester}
            subjects={subjects}
            activities={activities}
            onSelectActivity={(act) => {
              setActiveSubjectId(act.subjectId);
              setCurrentTab('subjects');
            }}
            onOpenExamModal={handleOpenExamModal}
            onOpenAddModal={(subId, prefillDate) => handleOpenAddModal(subId)}
            onToggleActivityStatus={handleToggleActivityStatus}
            onStartStudySession={handleStartStudySessionFromActivity}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            subjects={subjects}
            activities={activities}
            sessions={sessions}
            semester={semester}
            onDataImported={(imported) => setStoredData(imported)}
            onResetToDefaults={handleResetToDefaults}
          />
        )}
      </main>

      {/* Global Modals */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveActivity}
        subjects={subjects}
        initialSubjectId={modalInitialSubjectId}
        initialActivity={editingActivity}
      />

      <RevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        activity={revisionActivity}
        onAddRevision={handleAddRevision}
        onToggleRevisionStatus={handleToggleRevisionStatus}
        onDeleteRevision={handleDeleteRevision}
      />

      <ExamEditModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        subject={examModalSubjectObj}
        examType={examModalType}
        onSaveExam={handleSaveExam}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        semester={semester}
        storedData={storedData}
        onDataImported={(imported) => saveAll(imported)}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Quiet Academic Footer */}
      <footer className="border-t border-[#F1E5E9] py-6 text-center text-xs text-purple-900/60 bg-white/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <SparkleIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Luna Study Garden</span>
            <span className="text-pink-400">♡</span>
            <span>Semester 5 (2026)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-purple-900/60">
            <span className="font-mono">Pure client-side notebook · Local storage persistence · Week 3 Active</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-purple-700 hover:text-purple-950 font-semibold underline underline-offset-2 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
