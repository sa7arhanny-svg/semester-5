export type SubjectId =
  | 'forensic-entomology'
  | 'forensic-botany'
  | 'analytical-chemistry'
  | 'biochemistry'
  | 'anatomy'
  | 'digital-image';

export type ActivityType =
  | 'Lecture'
  | 'Section'
  | 'Assignment'
  | 'Task'
  | 'Revision'
  | 'Quiz'
  | 'Midterm'
  | 'Practical Exam'
  | 'Final Exam'
  | 'Final'
  | 'Other';

export type ActivityStatus =
  | 'Planned'
  | 'Taken'
  | 'In Progress'
  | 'Studied'
  | 'Needs Revision'
  | 'Completed';

export type Priority = 'Low' | 'Medium' | 'High';

export type TrackType = 'Theory' | 'Practical' | 'General';

export interface Instructor {
  id: string;
  name: string;
  role: 'Theory' | 'Practical' | 'Stream' | 'Both';
  streamName?: string; // e.g. "Dr. Mohamed Stream" or "Dr. Hesham Stream"
}

export interface ExamPlaceholder {
  id: string;
  type: 'Midterm' | 'Practical Exam' | 'Final Exam';
  date: string | null; // ISO YYYY-MM-DD or null if date not set
  time?: string;
  location?: string;
  notes: string;
  status: 'Date not set yet' | 'Scheduled' | 'Completed';
}

export interface Subject {
  id: SubjectId;
  name: string;
  code: string;
  instructors: Instructor[];
  description: string;
  hasStreams?: boolean;
  streamNames?: string[];
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    dot: string;
  };
  exams: {
    midterm: ExamPlaceholder;
    practical: ExamPlaceholder;
    final: ExamPlaceholder;
  };
}

export interface RevisionSession {
  id: string;
  activityId: string;
  revisionNumber: number;
  date: string;
  durationMinutes: number;
  notes: string;
  status: 'Planned' | 'Completed';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // extension or mime category (PDF, DOCX, PPT, PNG, JPG, etc.)
  dataUrl?: string; // base64 data url for viewing/downloading in browser
}

export interface AttachedLink {
  id: string;
  url: string;
  title?: string;
}

export interface AcademicActivity {
  id: string;
  subjectId: SubjectId;
  title: string;
  type: ActivityType;
  instructor: string;
  track: TrackType;
  streamName?: string; // For analytical chemistry or specific instructor streams
  date: string; // YYYY-MM-DD
  status: ActivityStatus;
  priority: Priority;
  estimatedStudyTime: number; // in minutes
  actualStudyTime: number; // in minutes
  notes: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachedFiles?: AttachedFile[];
  attachedLinks?: AttachedLink[];
  completed: boolean;
  subtasks?: SubTask[];
  revisionCount: number;
  revisions: RevisionSession[];
  createdAt: string;
  updatedAt: string;
}

export type StudyOutcome = 'Studied' | 'Completed' | 'Needs Revision' | 'Continue Later';

export interface StudySession {
  id: string;
  subjectId: SubjectId;
  activityId?: string;
  activityTitle?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  durationMinutes: number;
  notes: string;
  mode: 'pomodoro' | 'deep' | 'ultra' | 'custom';
  outcome?: StudyOutcome;
}

export type HealthStatus =
  | 'not_enough_data'
  | 'on_track'
  | 'slightly_behind'
  | 'needs_attention'
  | 'ahead';

export interface HealthReport {
  status: HealthStatus;
  title: string;
  message: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface SubjectMetrics {
  subjectId: SubjectId;
  totalActivities: number;
  lectures: number;
  sections: number;
  assignments: number;
  tasks: number;
  revisions: number;
  completedActivities: number;
  pendingActivities: number;
  overdueActivities: number;
  totalStudyTime: number; // in minutes
  studyTimeByActivity: Record<string, number>;
  revisionCount: number;
  overallCompletionPercentage: number;
  scheduleHealth: HealthReport;
}

export interface SemesterMetrics {
  totalRecordedActivities: number;
  totalCompletedActivities: number;
  totalPendingActivities: number;
  totalOverdueActivities: number;
  totalStudyTime: number; // in minutes
  studyTimeBySubject: Record<SubjectId, number>;
  overallAcademicProgress: number; // % completed / recorded
  studyCompletion: number; // % studied / taken
  scheduleHealth: HealthReport;
  hasEnoughData: boolean;
  recordedProgress: {
    totalLectures: number;
    totalSections: number;
    totalAssignments: number;
    totalTasks: number;
    totalRevisions: number;
  };
}

export interface SemesterInfo {
  name: string;
  studentName: string;
  startDate: string; // '2026-09-20'
  endDate: string; // '2027-01-31'
  currentDateAnchor: string; // '2026-10-06'
  totalWeeks: number; // 19
  currentWeek: number; // 3
}

export type NavigationTab =
  | 'dashboard'
  | 'subjects'
  | 'plan'
  | 'study'
  | 'timeline'
  | 'analytics';
