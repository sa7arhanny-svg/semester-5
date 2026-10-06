import { Subject, AcademicActivity, StudySession, SemesterInfo } from '../types';
import { INITIAL_SUBJECTS, INITIAL_ACTIVITIES, INITIAL_SESSIONS, SEMESTER_DATA } from '../data/initialData';

const STORAGE_KEY = 'luna_study_garden_v1';

export interface StoredData {
  version: number;
  semester: SemesterInfo;
  subjects: Subject[];
  activities: AcademicActivity[];
  sessions: StudySession[];
  lastUpdated: string;
}

export function loadStoredData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: StoredData = {
        version: 1,
        semester: SEMESTER_DATA,
        subjects: INITIAL_SUBJECTS,
        activities: INITIAL_ACTIVITIES,
        sessions: INITIAL_SESSIONS,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as StoredData;
    // Safety check that essential arrays exist
    if (!parsed.subjects || parsed.subjects.length === 0) {
      parsed.subjects = INITIAL_SUBJECTS;
    }
    if (!parsed.activities) {
      parsed.activities = [];
    }
    if (!parsed.sessions) {
      parsed.sessions = [];
    }
    if (!parsed.semester) {
      parsed.semester = SEMESTER_DATA;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load local storage data:', err);
    return {
      version: 1,
      semester: SEMESTER_DATA,
      subjects: INITIAL_SUBJECTS,
      activities: INITIAL_ACTIVITIES,
      sessions: INITIAL_SESSIONS,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function saveStoredData(data: StoredData): boolean {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err: any) {
    console.warn('LocalStorage quota limit reached. Attempting graceful storage optimization...', err);
    try {
      // Create a lightened clone where large file payload dataUrls in older activities are trimmed to preserve activity metadata
      const prunedData: StoredData = {
        ...data,
        activities: data.activities.map((act, index) => {
          if (index < 3) return act; // keep freshest files
          return {
            ...act,
            attachedFiles: act.attachedFiles?.map((f) => ({
              ...f,
              dataUrl: f.dataUrl ? '[stored locally; re-upload if needed]' : undefined,
            })),
          };
        }),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prunedData));
      return true;
    } catch (fallbackErr) {
      console.error('Browser local storage limit reached. Please remove large files or use external links ♡', fallbackErr);
      return false;
    }
  }
}

export function exportGardenBackup(data: StoredData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `luna-study-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importGardenBackup(jsonString: string): StoredData | null {
  try {
    const parsed = JSON.parse(jsonString) as StoredData;
    if (parsed.subjects && Array.isArray(parsed.activities)) {
      saveStoredData(parsed);
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Invalid backup JSON:', err);
    return null;
  }
}

export function resetStorageToDefaults(): StoredData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
  const initial: StoredData = {
    version: 1,
    semester: SEMESTER_DATA,
    subjects: INITIAL_SUBJECTS,
    activities: INITIAL_ACTIVITIES,
    sessions: INITIAL_SESSIONS,
    lastUpdated: new Date().toISOString(),
  };
  saveStoredData(initial);
  return initial;
}
