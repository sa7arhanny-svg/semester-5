import React, { useState } from 'react';
import { Subject, AcademicActivity, SubjectId, StudySession } from '../types';
import { SubjectCard } from './SubjectCard';
import { Plus, Search, BookOpen } from 'lucide-react';
import { Mascot } from './Mascot';

interface SubjectsListViewProps {
  subjects: Subject[];
  activities: AcademicActivity[];
  sessions?: StudySession[];
  currentDateAnchor?: string;
  onSelectSubject: (id: SubjectId) => void;
  onOpenAddModal: (subjectId?: SubjectId) => void;
}

export const SubjectsListView: React.FC<SubjectsListViewProps> = ({
  subjects,
  activities,
  sessions = [],
  currentDateAnchor = '2026-10-06',
  onSelectSubject,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = subjects.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      s.instructors.some((inst) => inst.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl p-5 border border-purple-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#3B1F4B] flex items-center gap-2">
            <span>Academic Subjects</span>
            <span className="text-xs font-normal text-purple-900/60 font-mono">
              (6 Modules)
            </span>
          </h1>
          <p className="text-xs text-purple-900/70 mt-0.5">
            Organized by theory & practical instructors, syllabus streams, and exam placeholders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-purple-200 bg-[#FAF7F5] text-purple-950 placeholder:text-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white w-48 sm:w-64"
            />
          </div>

          <button
            onClick={() => onOpenAddModal()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-2xs transition-colors whitespace-nowrap"
          >
            + Record
          </button>
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => (
          <SubjectCard
            key={sub.id}
            subject={sub}
            activities={activities}
            sessions={sessions}
            currentDateAnchor={currentDateAnchor}
            onSelect={onSelectSubject}
            onQuickAdd={onOpenAddModal}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-purple-200 text-center space-y-2">
          <Mascot expression="thinking" size="md" className="mx-auto" />
          <p className="text-xs text-purple-900/70">
            No subjects matched "{searchTerm}".
          </p>
        </div>
      )}
    </div>
  );
};
