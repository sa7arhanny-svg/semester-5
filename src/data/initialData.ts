import { Subject, SemesterInfo, AcademicActivity, StudySession } from '../types';

export const SEMESTER_DATA: SemesterInfo = {
  name: 'Semester 5 / 2026',
  studentName: 'Luna',
  startDate: '2026-09-20',
  endDate: '2027-01-31',
  currentDateAnchor: '2026-10-06',
  totalWeeks: 19,
  currentWeek: 3, // Exactly three academic weeks have already passed
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'forensic-entomology',
    name: 'FORENSIC ENTOMOLOGY',
    code: 'F-ENT 301',
    description: 'Arthropod succession, post-mortem interval estimation, and insect specimen analysis in forensic investigations.',
    instructors: [
      { id: 'dr-nehad', name: 'Dr. Nehad', role: 'Theory' },
      { id: 'dr-mohamed-saeed', name: 'Dr. Mohamed Saeed', role: 'Practical' },
    ],
    color: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/70',
      text: 'text-emerald-900',
      accent: 'bg-emerald-500',
      dot: 'bg-emerald-400',
    },
    exams: {
      midterm: {
        id: 'fe-midterm',
        type: 'Midterm',
        date: null,
        notes: 'Midterm covering theory lectures to week 7',
        status: 'Date not set yet',
      },
      practical: {
        id: 'fe-practical',
        type: 'Practical Exam',
        date: null,
        notes: 'Insect morphology and specimen identification practical',
        status: 'Date not set yet',
      },
      final: {
        id: 'fe-final',
        type: 'Final Exam',
        date: null,
        notes: 'Comprehensive theory final exam',
        status: 'Date not set yet',
      },
    },
  },
  {
    id: 'forensic-botany',
    name: 'FORENSIC BOTANY',
    code: 'F-BOT 302',
    description: 'Plant anatomy, palynology, limnology (diatoms), and forensic ecological profiling.',
    instructors: [
      { id: 'dr-reham', name: 'Dr. Reham', role: 'Theory' },
      { id: 'dr-youref', name: 'Dr. Youref', role: 'Practical' },
    ],
    color: {
      bg: 'bg-teal-50/60',
      border: 'border-teal-200/70',
      text: 'text-teal-900',
      accent: 'bg-teal-500',
      dot: 'bg-teal-400',
    },
    exams: {
      midterm: {
        id: 'fb-midterm',
        type: 'Midterm',
        date: null,
        notes: 'Theory pollen & plant structure midterm',
        status: 'Date not set yet',
      },
      practical: {
        id: 'fb-practical',
        type: 'Practical Exam',
        date: null,
        notes: 'Microscopic identification & sample isolation practical',
        status: 'Date not set yet',
      },
      final: {
        id: 'fb-final',
        type: 'Final Exam',
        date: null,
        notes: 'Comprehensive botany final exam',
        status: 'Date not set yet',
      },
    },
  },
  {
    id: 'analytical-chemistry',
    name: 'ANALYTICAL CHEMISTRY',
    code: 'A-CHM 303',
    description: 'Instrumental analytical techniques, spectroscopy, chromatography, and quantification methods split across two distinct instructor streams.',
    hasStreams: true,
    streamNames: ['Dr. Mohamed Stream', 'Dr. Hesham Stream'],
    instructors: [
      { id: 'dr-mohamed', name: 'Dr. Mohamed', role: 'Stream', streamName: 'Dr. Mohamed Stream' },
      { id: 'dr-hesham', name: 'Dr. Hesham', role: 'Stream', streamName: 'Dr. Hesham Stream' },
    ],
    color: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200/80',
      text: 'text-purple-900',
      accent: 'bg-purple-500',
      dot: 'bg-purple-400',
    },
    exams: {
      midterm: {
        id: 'ac-midterm',
        type: 'Midterm',
        date: null,
        notes: 'Shared midterm across both chemistry streams',
        status: 'Date not set yet',
      },
      practical: {
        id: 'ac-practical',
        type: 'Practical Exam',
        date: null,
        notes: 'Titration, instrumentation and lab practical exam',
        status: 'Date not set yet',
      },
      final: {
        id: 'ac-final',
        type: 'Final Exam',
        date: null,
        notes: 'Comprehensive analytical chemistry final',
        status: 'Date not set yet',
      },
    },
  },
  {
    id: 'biochemistry',
    name: 'BIOCHEMISTRY',
    code: 'BIO 304',
    description: 'Metabolic pathways, biomolecular kinetics, enzyme mechanisms, and clinical diagnostics.',
    instructors: [
      { id: 'dr-duha', name: 'Dr. Duha', role: 'Theory' },
      { id: 'dr-amina', name: 'Dr. Amina', role: 'Practical' },
    ],
    color: {
      bg: 'bg-pink-50/70',
      border: 'border-pink-200/80',
      text: 'text-pink-900',
      accent: 'bg-pink-500',
      dot: 'bg-pink-400',
    },
    exams: {
      midterm: {
        id: 'bc-midterm',
        type: 'Midterm',
        date: null,
        notes: 'Metabolic regulation midterm',
        status: 'Date not set yet',
      },
      practical: {
        id: 'bc-practical',
        type: 'Practical Exam',
        date: null,
        notes: 'Enzyme assays & spectrophotometry practical',
        status: 'Date not set yet',
      },
      final: {
        id: 'bc-final',
        type: 'Final Exam',
        date: null,
        notes: 'Comprehensive biochemistry theory final',
        status: 'Date not set yet',
      },
    },
  },
  {
    id: 'anatomy',
    name: 'ANATOMY',
    code: 'ANA 305',
    description: 'Systemic human anatomy, structural relations, osteology, and dissection topography under Dr. Samar Fawzy.',
    instructors: [
      { id: 'dr-samar-fawzy', name: 'Dr. Samar Fawzy', role: 'Both' },
    ],
    color: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200/70',
      text: 'text-rose-900',
      accent: 'bg-rose-500',
      dot: 'bg-rose-400',
    },
    exams: {
      midterm: {
        id: 'an-midterm',
        type: 'Midterm',
        date: null,
        notes: 'Anatomical regions & osteology midterm',
        status: 'Date not set yet',
      },
      practical: {
        id: 'an-practical',
        type: 'Practical Exam',
        date: null,
        notes: 'Cadaveric & model structure identification practical',
        status: 'Date not set yet',
      },
      final: {
        id: 'an-final',
        type: 'Final Exam',
        date: null,
        notes: 'Comprehensive human anatomy final exam',
        status: 'Date not set yet',
      },
    },
  },
  {
    id: 'digital-image',
    name: 'DIGITAL IMAGE (MATLAB)',
    code: 'DIM 306',
    description: 'Digital image processing in MATLAB: spatial filtering, frequency transformations, segmentation, and forensic image enhancement.',
    instructors: [
      { id: 'dr-eman', name: 'Dr. Eman', role: 'Both' },
    ],
    color: {
      bg: 'bg-indigo-50/60',
      border: 'border-indigo-200/70',
      text: 'text-indigo-900',
      accent: 'bg-indigo-500',
      dot: 'bg-indigo-400',
    },
    exams: {
      midterm: {
        id: 'di-midterm',
        type: 'Midterm',
        date: null,
        notes: 'Image matrices & point operations midterm',
        status: 'Date not set yet',
      },
      practical: {
        id: 'di-practical',
        type: 'Practical Exam',
        date: null,
        notes: 'Hands-on MATLAB script and algorithm implementation exam',
        status: 'Date not set yet',
      },
      final: {
        id: 'di-final',
        type: 'Final Exam',
        date: null,
        notes: 'Digital image processing final examination',
        status: 'Date not set yet',
      },
    },
  },
];

// Initial activities: Strictly empty as requested ("Do not invent lectures that the student has not provided.")
export const INITIAL_ACTIVITIES: AcademicActivity[] = [];

// Initial study sessions: Empty
export const INITIAL_SESSIONS: StudySession[] = [];
