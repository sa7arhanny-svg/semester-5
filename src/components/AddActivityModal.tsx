import React, { useState, useEffect, useRef } from 'react';
import {
  Subject,
  SubjectId,
  AcademicActivity,
  ActivityType,
  ActivityStatus,
  Priority,
  TrackType,
  AttachedFile,
  AttachedLink,
} from '../types';
import { MAX_SINGLE_FILE_SIZE_BYTES, formatFileSize, validateFileUpload } from '../utils/fileHelpers';
import {
  X,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  AlertCircle,
  Paperclip,
  Upload,
  Link as LinkIcon,
  FileText,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: AcademicActivity) => void;
  subjects: Subject[];
  initialSubjectId?: SubjectId;
  initialActivity?: AcademicActivity | null;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  initialSubjectId,
  initialActivity,
}) => {
  const [subjectId, setSubjectId] = useState<SubjectId>(
    initialSubjectId || subjects[0]?.id || 'forensic-entomology'
  );
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('Lecture');
  const [instructor, setInstructor] = useState('');
  const [track, setTrack] = useState<TrackType>('Theory');
  const [streamName, setStreamName] = useState<string>('');
  const [date, setDate] = useState('2026-10-06');
  const [status, setStatus] = useState<ActivityStatus>('Taken');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [estimatedStudyTime, setEstimatedStudyTime] = useState<number>(45);
  const [actualStudyTime, setActualStudyTime] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [attachedLinks, setAttachedLinks] = useState<AttachedLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [fileWarning, setFileWarning] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSubject = subjects.find((s) => s.id === subjectId) || subjects[0];

  // Sync instructor list when subject changes
  useEffect(() => {
    if (!initialActivity) {
      if (currentSubject && currentSubject.instructors.length > 0) {
        const defaultInst = currentSubject.instructors[0];
        setInstructor(defaultInst.name);
        if (defaultInst.streamName) {
          setStreamName(defaultInst.streamName);
        } else {
          setStreamName('');
        }
        if (defaultInst.role === 'Theory') setTrack('Theory');
        else if (defaultInst.role === 'Practical') setTrack('Practical');
        else setTrack('Theory');
      }
    }
  }, [subjectId, currentSubject, initialActivity]);

  // Sync editing fields when initialActivity changes
  useEffect(() => {
    if (initialActivity) {
      setSubjectId(initialActivity.subjectId);
      setTitle(initialActivity.title);
      setType(initialActivity.type);
      setInstructor(initialActivity.instructor);
      setTrack(initialActivity.track);
      setStreamName(initialActivity.streamName || '');
      setDate(initialActivity.date);
      setStatus(initialActivity.status);
      setPriority(initialActivity.priority);
      setEstimatedStudyTime(initialActivity.estimatedStudyTime || 45);
      setActualStudyTime(initialActivity.actualStudyTime || 0);
      setNotes(initialActivity.notes || '');

      // Load attached files
      setAttachedFiles(initialActivity.attachedFiles ? [...initialActivity.attachedFiles] : []);

      // Load attached links (incorporating legacy attachmentUrl if present)
      const initLinks: AttachedLink[] = initialActivity.attachedLinks ? [...initialActivity.attachedLinks] : [];
      if (initialActivity.attachmentUrl && !initLinks.some((l) => l.url === initialActivity.attachmentUrl)) {
        initLinks.push({
          id: `link-legacy-${Date.now()}`,
          url: initialActivity.attachmentUrl,
          title: initialActivity.attachmentName || initialActivity.attachmentUrl.replace(/^https?:\/\/(www\.)?/, ''),
        });
      }
      setAttachedLinks(initLinks);
      setNewLinkUrl('');
      setFileWarning('');
    } else {
      if (initialSubjectId) {
        setSubjectId(initialSubjectId);
      }
      setTitle('');
      setType('Lecture');
      setStatus('Taken');
      setPriority('Medium');
      setEstimatedStudyTime(45);
      setActualStudyTime(0);
      setNotes('');
      setAttachedFiles([]);
      setAttachedLinks([]);
      setNewLinkUrl('');
      setFileWarning('');
      setError('');
    }
  }, [initialActivity, initialSubjectId, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setFileWarning('');

    Array.from(selected).forEach((file) => {
      const validation = validateFileUpload(file, attachedFiles);
      if (!validation.valid) {
        setFileWarning(validation.error || 'File cannot be attached due to size limits.');
        return;
      }
      if (validation.warning) {
        setFileWarning(validation.warning);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const attached: AttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: file.size,
          type: ext,
          dataUrl,
        };
        setAttachedFiles((prev) => [...prev, attached]);
      };
      reader.onerror = () => {
        setFileWarning(`Could not read "${file.name}". Please try another file or attach a link.`);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleAddLink = () => {
    const trimmed = newLinkUrl.trim();
    if (!trimmed) return;
    let formatted = trimmed;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    const newLink: AttachedLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url: formatted,
      title: trimmed.replace(/^https?:\/\/(www\.)?/, ''),
    };
    setAttachedLinks((prev) => [...prev, newLink]);
    setNewLinkUrl('');
  };

  const handleRemoveLink = (linkId: string) => {
    setAttachedLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  if (!isOpen) return null;

  // Contextual helper to align instructor with track/type for the selected subject
  const alignInstructorForTrack = (subId: SubjectId, targetTrack: TrackType, currentInst: string) => {
    const subj = subjects.find((s) => s.id === subId);
    if (!subj) return { instructor: currentInst, stream: '' };

    if (subId === 'forensic-entomology') {
      const inst = targetTrack === 'Practical' ? 'Dr. Mohamed Saeed' : 'Dr. Nehad';
      return { instructor: inst, stream: '' };
    }
    if (subId === 'forensic-botany') {
      const inst = targetTrack === 'Practical' ? 'Dr. Youref' : 'Dr. Reham';
      return { instructor: inst, stream: '' };
    }
    if (subId === 'biochemistry') {
      const inst = targetTrack === 'Practical' ? 'Dr. Amina' : 'Dr. Duha';
      return { instructor: inst, stream: '' };
    }
    if (subId === 'anatomy') {
      return { instructor: 'Dr. Samar Fawzy', stream: '' };
    }
    if (subId === 'digital-image') {
      return { instructor: 'Dr. Eman', stream: '' };
    }
    if (subId === 'analytical-chemistry') {
      // Keep Dr. Mohamed or Dr. Hesham, ensuring stream is set
      const selected = currentInst === 'Dr. Hesham' ? 'Dr. Hesham' : 'Dr. Mohamed';
      return { instructor: selected, stream: selected === 'Dr. Hesham' ? 'Dr. Hesham Stream' : 'Dr. Mohamed Stream' };
    }
    return { instructor: subj.instructors[0]?.name || currentInst, stream: '' };
  };

  // When subject changes
  const handleSubjectChange = (newSubId: SubjectId) => {
    setSubjectId(newSubId);
    const aligned = alignInstructorForTrack(newSubId, track, instructor);
    setInstructor(aligned.instructor);
    setStreamName(aligned.stream);
  };

  // When type changes
  const handleTypeChange = (newType: ActivityType) => {
    setType(newType);
    let nextTrack = track;
    if (newType === 'Section' || newType === 'Practical Exam') {
      nextTrack = 'Practical';
      setTrack('Practical');
    } else if (newType === 'Lecture') {
      nextTrack = 'Theory';
      setTrack('Theory');
    }
    const aligned = alignInstructorForTrack(subjectId, nextTrack, instructor);
    setInstructor(aligned.instructor);
    if (aligned.stream) setStreamName(aligned.stream);
  };

  // When track changes
  const handleTrackChange = (newTrack: TrackType) => {
    setTrack(newTrack);
    const aligned = alignInstructorForTrack(subjectId, newTrack, instructor);
    setInstructor(aligned.instructor);
    if (aligned.stream) setStreamName(aligned.stream);
  };

  const handleInstructorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setInstructor(selectedName);
    const instObj = currentSubject?.instructors.find((i) => i.name === selectedName);
    if (instObj) {
      if (instObj.streamName) {
        setStreamName(instObj.streamName);
      } else {
        setStreamName('');
      }
      if (instObj.role === 'Theory') setTrack('Theory');
      else if (instObj.role === 'Practical') setTrack('Practical');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please give this activity a title');
      return;
    }

    const isCompleted = status === 'Studied' || status === 'Completed';

    // Consolidate links, auto-including anything entered in the new link input
    let finalLinks = [...attachedLinks];
    const pendingUrl = newLinkUrl.trim();
    if (pendingUrl) {
      let formatted = pendingUrl;
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `https://${formatted}`;
      }
      finalLinks.push({
        id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: formatted,
        title: pendingUrl.replace(/^https?:\/\/(www\.)?/, ''),
      });
    }

    const newActivity: AcademicActivity = {
      id: initialActivity ? initialActivity.id : `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subjectId,
      title: title.trim(),
      type,
      instructor: instructor || (currentSubject?.instructors[0]?.name || 'Instructor'),
      track,
      streamName: streamName || undefined,
      date,
      status,
      priority,
      estimatedStudyTime: Number(estimatedStudyTime) || 30,
      actualStudyTime: Number(actualStudyTime) || 0,
      notes: notes.trim(),
      attachmentUrl: finalLinks[0]?.url || undefined,
      attachmentName: finalLinks[0]?.title || undefined,
      attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
      attachedLinks: finalLinks.length > 0 ? finalLinks : undefined,
      completed: isCompleted,
      subtasks: initialActivity ? initialActivity.subtasks : undefined,
      revisionCount: initialActivity ? initialActivity.revisionCount : 0,
      revisions: initialActivity ? initialActivity.revisions : [],
      createdAt: initialActivity ? initialActivity.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/20 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-purple-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Soft decorative header band */}
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 px-5 py-4 border-b border-[#F1E5E9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#3B1F4B]">
                {initialActivity ? 'Edit Academic Activity' : 'Record Academic Activity'}
              </h2>
              <p className="text-[11px] text-purple-900/60">
                Luna Study Garden · Semester 5
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-purple-700/60 hover:text-purple-900 hover:bg-white/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject & Activity Type row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Activity Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as ActivityType)}
                className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              >
                <option value="Lecture">Lecture</option>
                <option value="Section">Section (Practical)</option>
                <option value="Assignment">Assignment</option>
                <option value="Task">Academic Task / To-Do</option>
                <option value="Revision">Revision</option>
                <option value="Quiz">Quiz</option>
                <option value="Midterm">Midterm</option>
                <option value="Practical Exam">Practical Exam</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Instructor & Track / Stream row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Instructor
              </label>
              <select
                value={instructor}
                onChange={handleInstructorSelect}
                className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              >
                {currentSubject?.instructors.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.name} ({inst.streamName ? inst.streamName : inst.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Track / Content Stream
              </label>
              <select
                value={track}
                onChange={(e) => handleTrackChange(e.target.value as TrackType)}
                className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="General">General</option>
              </select>
              {currentSubject?.hasStreams && (
                <div className="text-[10px] text-purple-600 mt-1">
                  Stream: {streamName || 'Selected above'}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1">
              Title / Topic Description
            </label>
            <input
              type="text"
              placeholder="e.g. Lecture 01: Succession Patterns & Blowfly Cycle"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-purple-950 placeholder:text-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-600" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-mono font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full text-xs font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              >
                <option value="Planned">Planned</option>
                <option value="Taken">Taken (Attended / recorded)</option>
                <option value="In Progress">In Progress</option>
                <option value="Studied">Studied</option>
                <option value="Needs Revision">Needs Revision</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Priority & Estimated Study Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F5] rounded-xl border border-purple-200/80">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`text-xs py-1 rounded-lg font-medium transition-colors ${
                      priority === p
                        ? p === 'High'
                          ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                          : p === 'Medium'
                          ? 'bg-purple-700 text-white shadow-2xs font-semibold'
                          : 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'text-purple-900/70 hover:text-purple-950'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" />
                <span>Est. Study Time (mins)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="360"
                  step="5"
                  value={estimatedStudyTime}
                  onChange={(e) => setEstimatedStudyTime(Number(e.target.value))}
                  className="w-full text-xs font-mono font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors tabular-nums"
                />
                <span className="text-xs text-purple-900/60 font-mono">min</span>
              </div>
            </div>
          </div>

          {/* Actual Study Time (if already studied) */}
          {(status === 'Studied' || status === 'Completed' || actualStudyTime > 0) && (
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Actual Time Spent Studying (mins)</span>
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={actualStudyTime}
                onChange={(e) => setActualStudyTime(Number(e.target.value))}
                className="w-full text-xs font-mono font-medium rounded-xl border border-purple-200 bg-[#FAF7F5] px-3 py-2 text-purple-950 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors tabular-nums"
              />
            </div>
          )}

          {/* Notes / Key Takeaways */}
          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1">
              Notes & Key Questions
            </label>
            <textarea
              rows={3}
              placeholder="Key concepts, page numbers, formula highlights, or lab notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-purple-200 bg-white p-3 text-purple-950 placeholder:text-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* Study Materials (optional) */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-[#FCFAF8] border border-[#F4DEE5]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-purple-950 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                <span>Study Materials (optional)</span>
              </label>
              <span className="text-[10px] text-purple-900/50">
                Upload files or attach links
              </span>
            </div>

            {/* 1. Upload from device */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-900/80">
                  Upload from device
                </span>
                <span className="text-[10px] text-purple-900/50">
                  PDF, DOC, DOCX, PPT, PPTX, PNG, JPG
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/png,image/jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-950 bg-white hover:bg-purple-100/60 border border-purple-200/80 rounded-xl transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-700" />
                  <span>Upload from device</span>
                </button>
                <span className="text-[11px] text-purple-900/60">
                  {attachedFiles.length === 0
                    ? 'No local files chosen yet'
                    : `${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached`}
                </span>
              </div>

              {/* Graceful file size warning if file is large */}
              {fileWarning && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{fileWarning}</span>
                </div>
              )}

              {/* Uploaded files list */}
              {attachedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100/80 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-medium text-purple-950 truncate max-w-[200px] sm:max-w-[280px]">
                          {file.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-100 uppercase">
                          {file.type || 'file'}
                        </span>
                        <span className="text-[10px] text-purple-900/50 font-mono">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 text-purple-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove uploaded file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Add a link */}
            <div className="border-t border-purple-100/70 pt-2.5 space-y-2">
              <label className="block text-[11px] font-semibold text-purple-900/80">
                Add a link
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Google Drive, Slides, Notion, YouTube, etc."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                  className="flex-1 text-xs rounded-xl border border-purple-200 bg-white px-3 py-2 text-purple-950 placeholder:text-purple-300 focus:outline-none focus:border-purple-400 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-2 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors shrink-0"
                >
                  Add Link
                </button>
              </div>

              {/* Saved links list */}
              {attachedLinks.length > 0 && (
                <div className="space-y-1 pt-1">
                  {attachedLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100/80 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <LinkIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-mono text-purple-900 truncate max-w-[240px] sm:max-w-[340px]">
                          {link.url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-1 text-purple-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#F1E5E9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-purple-900/70 hover:text-purple-950 hover:bg-purple-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-purple-900 hover:bg-purple-950 active:scale-98 rounded-xl shadow-xs transition-all font-semibold"
            >
              {initialActivity ? 'Save Changes' : 'Record Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
