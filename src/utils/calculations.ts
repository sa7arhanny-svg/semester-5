import {
  AcademicActivity,
  Subject,
  SubjectId,
  HealthReport,
  SemesterInfo,
  SubjectMetrics,
  SemesterMetrics,
  StudySession,
} from '../types';

/**
 * Centralized deterministic thresholds for schedule health.
 * Can be adjusted here to tune sensitivity.
 */
export const SCHEDULE_HEALTH_THRESHOLDS = {
  // Below this count of activities, do not generate a misleading schedule percentage/status
  MIN_ACTIVITIES_FOR_EVALUATION: 3,

  // Overdue count triggering RED (Needs Attention)
  OVERDUE_CRITICAL_COUNT: 3,

  // Overdue count triggering YELLOW (Slightly Behind)
  OVERDUE_WARNING_COUNT: 1,

  // Overdue ratio of total activities triggering RED (Needs Attention)
  OVERDUE_CRITICAL_RATIO: 0.35,

  // Overdue ratio triggering YELLOW (Slightly Behind)
  OVERDUE_WARNING_RATIO: 0.15,

  // Study completion % of taken activities below which health is YELLOW
  STUDY_COMPLETION_WARNING_PERCENT: 60,

  // Study completion % of taken activities above which health is PURPLE (Ahead)
  STUDY_COMPLETION_AHEAD_PERCENT: 90,

  // Minimum activities required to qualify for PURPLE (Ahead)
  MIN_ACTIVITIES_FOR_AHEAD: 5,
};

export function calculateAcademicProgress(activities: AcademicActivity[]): number {
  if (activities.length === 0) return 0;
  const completed = activities.filter(
    (a) => a.completed || a.status === 'Studied' || a.status === 'Completed'
  ).length;
  return Math.round((completed / activities.length) * 100);
}

export function calculateStudyCompletion(activities: AcademicActivity[]): {
  percentage: number;
  studied: number;
  taken: number;
} {
  const takenPool = activities.filter((a) =>
    ['Taken', 'In Progress', 'Studied', 'Needs Revision', 'Completed'].includes(a.status)
  );

  if (takenPool.length === 0) {
    return { percentage: 100, studied: 0, taken: 0 };
  }

  const studiedCount = takenPool.filter(
    (a) => a.completed || a.status === 'Studied' || a.status === 'Completed'
  ).length;

  return {
    percentage: Math.round((studiedCount / takenPool.length) * 100),
    studied: studiedCount,
    taken: takenPool.length,
  };
}

/**
 * Computes elapsed semester progress ratio:
 * Semester starts 2026-09-20, ends 2027-01-31 (~133 days total).
 * On 2026-10-06 (Week 3), elapsed = 16 days / 133 days = ~12% (or week 3 / 19 weeks = ~15.8%).
 */
export function calculateSemesterElapsedRatio(
  startDate: string = '2026-09-20',
  endDate: string = '2027-01-31',
  currentDateAnchor: string = '2026-10-06'
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = new Date(currentDateAnchor).getTime();
  if (end <= start) return 0;
  return Math.max(0, Math.min(1, (current - start) / (end - start)));
}

/**
 * Deterministic schedule health evaluator.
 * Compares elapsed semester time with completed academic workload only when sufficient data exists.
 * Returns:
 * - "Not enough data yet" if activities < MIN_ACTIVITIES_FOR_EVALUATION (3)
 * - RED: Needs Attention (3+ overdue or high overdue ratio)
 * - YELLOW: Slightly Behind (1-2 overdue or low study completion)
 * - PURPLE: Ahead (90%+ completion with 5+ items)
 * - GREEN: On Track
 */
export function determineScheduleHealth(
  activities: AcademicActivity[],
  currentDateAnchor: string = '2026-10-06',
  semester?: SemesterInfo
): HealthReport {
  if (activities.length < SCHEDULE_HEALTH_THRESHOLDS.MIN_ACTIVITIES_FOR_EVALUATION) {
    return {
      status: 'not_enough_data',
      title: 'Not enough data yet',
      message: 'Add at least 3 activities to evaluate your semester schedule health.',
      colorClass: 'text-purple-800',
      bgClass: 'bg-purple-50/70',
      borderClass: 'border-purple-200',
    };
  }

  const overdue = activities.filter(
    (a) =>
      a.date < currentDateAnchor &&
      !a.completed &&
      a.status !== 'Studied' &&
      a.status !== 'Completed'
  );

  const overdueRatio = activities.length > 0 ? overdue.length / activities.length : 0;
  const needsRevision = activities.filter((a) => a.status === 'Needs Revision');
  const studyComp = calculateStudyCompletion(activities);

  // RED: Needs Attention
  if (
    overdue.length >= SCHEDULE_HEALTH_THRESHOLDS.OVERDUE_CRITICAL_COUNT ||
    overdueRatio >= SCHEDULE_HEALTH_THRESHOLDS.OVERDUE_CRITICAL_RATIO
  ) {
    return {
      status: 'needs_attention',
      title: 'Needs Attention',
      message: `${overdue.length} overdue items need your attention. A gentle 25-minute study pass will get things rolling ♡`,
      colorClass: 'text-rose-700',
      bgClass: 'bg-rose-50/80',
      borderClass: 'border-rose-200/80',
    };
  }

  // YELLOW: Slightly Behind
  if (
    overdue.length >= SCHEDULE_HEALTH_THRESHOLDS.OVERDUE_WARNING_COUNT ||
    overdueRatio >= SCHEDULE_HEALTH_THRESHOLDS.OVERDUE_WARNING_RATIO ||
    studyComp.percentage < SCHEDULE_HEALTH_THRESHOLDS.STUDY_COMPLETION_WARNING_PERCENT ||
    needsRevision.length >= 2
  ) {
    return {
      status: 'slightly_behind',
      title: 'Slightly Behind',
      message:
        overdue.length > 0
          ? `${overdue.length} overdue items waiting for a study session.`
          : `A few attended lectures are ready for their first study pass.`,
      colorClass: 'text-amber-800',
      bgClass: 'bg-amber-50/80',
      borderClass: 'border-amber-200/80',
    };
  }

  // PURPLE: Ahead
  if (
    overdue.length === 0 &&
    studyComp.percentage >= SCHEDULE_HEALTH_THRESHOLDS.STUDY_COMPLETION_AHEAD_PERCENT &&
    activities.length >= SCHEDULE_HEALTH_THRESHOLDS.MIN_ACTIVITIES_FOR_AHEAD
  ) {
    return {
      status: 'ahead',
      title: 'Ahead',
      message: 'Most of this week’s work is complete and all taken lectures are reviewed ✦',
      colorClass: 'text-purple-800',
      bgClass: 'bg-purple-50/80',
      borderClass: 'border-purple-200/80',
    };
  }

  // GREEN: On Track
  return {
    status: 'on_track',
    title: 'On Track',
    message: 'Most of this week’s work is complete and pacing smoothly with Week 3 ♡',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50/80',
    borderClass: 'border-emerald-200/80',
  };
}

/**
 * Calculates all required metrics for a single subject:
 * - total activities
 * - lectures
 * - sections
 * - assignments
 * - tasks
 * - revisions
 * - completed activities
 * - pending activities
 * - overdue activities
 * - total study time
 * - study time by activity
 * - revision count
 * - overall completion percentage
 */
export function calculateSubjectMetrics(
  subjectId: SubjectId,
  activities: AcademicActivity[],
  sessions: StudySession[] = [],
  currentDateAnchor: string = '2026-10-06'
): SubjectMetrics {
  const subActs = activities.filter((a) => a.subjectId === subjectId);
  const lectures = subActs.filter((a) => a.type === 'Lecture').length;
  const sections = subActs.filter((a) => a.type === 'Section').length;
  const assignments = subActs.filter((a) => a.type === 'Assignment').length;
  const tasks = subActs.filter((a) => a.type === 'Task').length;

  const totalRevisionSessions = subActs.reduce(
    (acc, a) => acc + (a.revisions?.length || a.revisionCount || 0),
    0
  );
  const revisionActivityCount = subActs.filter((a) => a.type === 'Revision').length;
  const revisions = Math.max(revisionActivityCount, totalRevisionSessions);

  const completedActivities = subActs.filter(
    (a) => a.completed || a.status === 'Studied' || a.status === 'Completed'
  ).length;

  const pendingActivities = subActs.length - completedActivities;

  const overdueActivities = subActs.filter(
    (a) =>
      a.date < currentDateAnchor &&
      !a.completed &&
      a.status !== 'Studied' &&
      a.status !== 'Completed'
  ).length;

  const studyTimeByActivity: Record<string, number> = {};
  subActs.forEach((act) => {
    studyTimeByActivity[act.id] = act.actualStudyTime || 0;
  });

  const totalStudyFromActs = subActs.reduce((acc, a) => acc + (a.actualStudyTime || 0), 0);
  const totalStudyFromSessions = sessions
    .filter((s) => s.subjectId === subjectId)
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalStudyTime = Math.max(totalStudyFromActs, totalStudyFromSessions);

  const overallCompletionPercentage =
    subActs.length > 0 ? Math.round((completedActivities / subActs.length) * 100) : 0;

  const scheduleHealth = determineScheduleHealth(subActs, currentDateAnchor);

  return {
    subjectId,
    totalActivities: subActs.length,
    lectures,
    sections,
    assignments,
    tasks,
    revisions,
    completedActivities,
    pendingActivities,
    overdueActivities,
    totalStudyTime,
    studyTimeByActivity,
    revisionCount: totalRevisionSessions,
    overallCompletionPercentage,
    scheduleHealth,
  };
}

/**
 * Calculates all required semester-wide metrics:
 * - total recorded activities
 * - total completed activities
 * - total pending activities
 * - total overdue activities
 * - total study time
 * - study time by subject
 * - overall academic progress
 * - study completion
 * - schedule health
 */
export function calculateSemesterMetrics(
  subjects: Subject[],
  activities: AcademicActivity[],
  sessions: StudySession[] = [],
  semester: SemesterInfo
): SemesterMetrics {
  const totalRecordedActivities = activities.length;
  const totalCompletedActivities = activities.filter(
    (a) => a.completed || a.status === 'Studied' || a.status === 'Completed'
  ).length;
  const totalPendingActivities = totalRecordedActivities - totalCompletedActivities;
  const totalOverdueActivities = activities.filter(
    (a) =>
      a.date < semester.currentDateAnchor &&
      !a.completed &&
      a.status !== 'Studied' &&
      a.status !== 'Completed'
  ).length;

  const studyTimeBySubject: Record<SubjectId, number> = {
    'forensic-entomology': 0,
    'forensic-botany': 0,
    'analytical-chemistry': 0,
    'biochemistry': 0,
    'anatomy': 0,
    'digital-image': 0,
  };

  subjects.forEach((s) => {
    const sMetric = calculateSubjectMetrics(s.id, activities, sessions, semester.currentDateAnchor);
    studyTimeBySubject[s.id] = sMetric.totalStudyTime;
  });

  const totalStudyTime = Object.values(studyTimeBySubject).reduce((a, b) => a + b, 0);

  const overallAcademicProgress =
    totalRecordedActivities > 0
      ? Math.round((totalCompletedActivities / totalRecordedActivities) * 100)
      : 0;

  const studyComp = calculateStudyCompletion(activities);
  const studyCompletion = studyComp.percentage;

  const scheduleHealth = determineScheduleHealth(activities, semester.currentDateAnchor, semester);
  const hasEnoughData = totalRecordedActivities >= SCHEDULE_HEALTH_THRESHOLDS.MIN_ACTIVITIES_FOR_EVALUATION;

  const recordedProgress = {
    totalLectures: activities.filter((a) => a.type === 'Lecture').length,
    totalSections: activities.filter((a) => a.type === 'Section').length,
    totalAssignments: activities.filter((a) => a.type === 'Assignment').length,
    totalTasks: activities.filter((a) => a.type === 'Task').length,
    totalRevisions: activities.reduce(
      (acc, a) => acc + (a.revisions?.length || a.revisionCount || (a.type === 'Revision' ? 1 : 0)),
      0
    ),
  };

  return {
    totalRecordedActivities,
    totalCompletedActivities,
    totalPendingActivities,
    totalOverdueActivities,
    totalStudyTime,
    studyTimeBySubject,
    overallAcademicProgress,
    studyCompletion,
    scheduleHealth,
    hasEnoughData,
    recordedProgress,
  };
}


export interface ScoredPlanItem {
  activity: AcademicActivity;
  score: number;
  reason: string;
}

export function generateTodaysPlan(
  activities: AcademicActivity[],
  subjects: Subject[],
  currentDateAnchor: string = '2026-10-06'
): {
  recommended: ScoredPlanItem | null;
  queue: ScoredPlanItem[];
} {
  const incomplete = activities.filter(
    (a) => !a.completed && a.status !== 'Studied' && a.status !== 'Completed'
  );

  if (incomplete.length === 0) {
    return { recommended: null, queue: [] };
  }

  const scored: ScoredPlanItem[] = incomplete.map((activity) => {
    let score = 0;
    const reasons: string[] = [];

    // Overdue check
    if (activity.date < currentDateAnchor) {
      score += 100;
      reasons.push('Overdue from earlier in the semester');
    } else if (activity.date === currentDateAnchor) {
      score += 40;
      reasons.push('Scheduled for today');
    }

    // Status weighting
    if (activity.status === 'Needs Revision') {
      score += 45;
      reasons.push('Flagged for revision');
    } else if (activity.status === 'Taken') {
      score += 35;
      reasons.push('Lecture taken · Needs first study pass');
    } else if (activity.status === 'In Progress') {
      score += 30;
      reasons.push('Currently in progress');
    }

    // Priority weighting
    if (activity.priority === 'High') {
      score += 50;
      reasons.push('High priority');
    } else if (activity.priority === 'Medium') {
      score += 20;
    }

    // Type weighting
    if (activity.type === 'Assignment') {
      score += 25;
      reasons.push('Assignment deadline');
    }

    // Proximity to upcoming exam in this subject
    const subject = subjects.find((s) => s.id === activity.subjectId);
    if (subject) {
      const examDates = [
        subject.exams.midterm.date,
        subject.exams.practical.date,
        subject.exams.final.date,
      ].filter(Boolean) as string[];

      for (const ed of examDates) {
        const diffDays = Math.round(
          (new Date(ed).getTime() - new Date(currentDateAnchor).getTime()) / (1000 * 3600 * 24)
        );
        if (diffDays >= 0 && diffDays <= 14) {
          score += 40;
          reasons.push(`Exam coming up in ${diffDays} days`);
          break;
        }
      }
    }

    // Small bonus for quick actionable sessions
    if (activity.estimatedStudyTime && activity.estimatedStudyTime <= 45) {
      score += 10;
    }

    return {
      activity,
      score,
      reason: reasons.length > 0 ? reasons.slice(0, 2).join(' · ') : 'Next in your syllabus',
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    recommended: scored[0] || null,
    queue: scored.slice(1, 6),
  };
}

export function groupBacklog(
  activities: AcademicActivity[],
  currentDateAnchor: string = '2026-10-06'
): {
  needsAttention: AcademicActivity[];
  highPriority: AcademicActivity[];
  normal: AcademicActivity[];
  completed: AcademicActivity[];
} {
  const needsAttention: AcademicActivity[] = [];
  const highPriority: AcademicActivity[] = [];
  const normal: AcademicActivity[] = [];
  const completed: AcademicActivity[] = [];

  for (const act of activities) {
    const isDone = act.completed || act.status === 'Studied' || act.status === 'Completed';
    if (isDone) {
      completed.push(act);
      continue;
    }

    const isOverdue = act.date < currentDateAnchor;
    if (isOverdue || act.status === 'Needs Revision') {
      needsAttention.push(act);
    } else if (act.priority === 'High') {
      highPriority.push(act);
    } else {
      normal.push(act);
    }
  }

  return { needsAttention, highPriority, normal, completed };
}

export interface WeekTimelineItem {
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: 'past' | 'current' | 'future';
  isCurrent: boolean;
}

export function generateSemesterWeeks(semester: SemesterInfo): WeekTimelineItem[] {
  const weeks: WeekTimelineItem[] = [];
  const start = new Date(semester.startDate + 'T00:00:00');

  for (let i = 1; i <= semester.totalWeeks; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (i - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const isCurrent = i === semester.currentWeek;
    const status: 'past' | 'current' | 'future' =
      i < semester.currentWeek ? 'past' : i === semester.currentWeek ? 'current' : 'future';

    weeks.push({
      weekNumber: i,
      startDate: weekStart.toISOString().slice(0, 10),
      endDate: weekEnd.toISOString().slice(0, 10),
      status,
      isCurrent,
    });
  }

  return weeks;
}

export function getSubjectStats(activities: AcademicActivity[], subjectId: SubjectId) {
  const subActs = activities.filter((a) => a.subjectId === subjectId);
  const lectures = subActs.filter((a) => a.type === 'Lecture');
  const sections = subActs.filter((a) => a.type === 'Section');
  const assignments = subActs.filter((a) => a.type === 'Assignment');
  const revisions = subActs.reduce((acc, a) => acc + (a.revisionCount || a.revisions?.length || 0), 0);
  const pending = subActs.filter(
    (a) => !a.completed && a.status !== 'Studied' && a.status !== 'Completed'
  ).length;
  const progress = calculateAcademicProgress(subActs);
  const totalStudyMinutes = subActs.reduce((acc, a) => acc + (a.actualStudyTime || 0), 0);

  return {
    total: subActs.length,
    lecturesCount: lectures.length,
    sectionsCount: sections.length,
    assignmentsCount: assignments.length,
    revisionsCount: revisions,
    pendingCount: pending,
    progressPercentage: progress,
    totalStudyMinutes,
  };
}

export interface ActivityTypeBreakdown {
  lectures: number;
  sections: number;
  assignments: number;
  revisions: number;
  quizzes: number;
  exams: number;
}

export function calculateActivityTypeBreakdown(activities: AcademicActivity[]): ActivityTypeBreakdown {
  const lectures = activities.filter((a) => a.type === 'Lecture').length;
  const sections = activities.filter((a) => a.type === 'Section').length;
  const assignments = activities.filter((a) => a.type === 'Assignment' || a.type === 'Task').length;
  const quizzes = activities.filter((a) => a.type === 'Quiz').length;
  const exams = activities.filter((a) =>
    ['Midterm', 'Practical Exam', 'Final Exam', 'Final'].includes(a.type)
  ).length;

  const totalRevisions = activities.reduce(
    (acc, a) => acc + (a.revisions?.length || a.revisionCount || (a.type === 'Revision' ? 1 : 0)),
    0
  );

  return {
    lectures,
    sections,
    assignments,
    revisions: totalRevisions,
    quizzes,
    exams,
  };
}

export function calculateAverageSessionDuration(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const total = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  return Math.round(total / sessions.length);
}

export function calculateStudyTimeToday(sessions: StudySession[], currentDateAnchor: string = '2026-10-06'): number {
  return sessions
    .filter((s) => s.date === currentDateAnchor)
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
}

export function calculateStudyTimeThisWeek(
  sessions: StudySession[],
  weekStartDate: string = '2026-10-04',
  weekEndDate: string = '2026-10-10'
): number {
  return sessions
    .filter((s) => s.date >= weekStartDate && s.date <= weekEndDate)
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
}

export interface WeekTrendData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'past' | 'current' | 'future';
  studyMinutes: number;
  activityCount: number;
  completedCount: number;
}

export function calculateWeeklyTrends(
  semester: SemesterInfo,
  activities: AcademicActivity[],
  sessions: StudySession[]
): WeekTrendData[] {
  const weeks = generateSemesterWeeks(semester);
  return weeks.map((w) => {
    const weekActs = activities.filter((a) => a.date >= w.startDate && a.date <= w.endDate);
    const weekSessions = sessions.filter((s) => s.date >= w.startDate && s.date <= w.endDate);
    const studyMinutes = weekSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const completedCount = weekActs.filter(
      (a) => a.completed || a.status === 'Studied' || a.status === 'Completed'
    ).length;

    return {
      weekNumber: w.weekNumber,
      startDate: w.startDate,
      endDate: w.endDate,
      isCurrent: w.isCurrent,
      status: w.status,
      studyMinutes,
      activityCount: weekActs.length,
      completedCount,
    };
  });
}
