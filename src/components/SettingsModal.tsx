import React, { useRef } from 'react';
import { SemesterInfo } from '../types';
import { SCHEDULE_HEALTH_THRESHOLDS } from '../utils/calculations';
import { exportGardenBackup, importGardenBackup, StoredData } from '../utils/storage';
import { Mascot } from './Mascot';
import { SparkleIcon, TinyBenzene, TinyDnaHelix } from './ScientificMotifs';
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Calendar,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: SemesterInfo;
  storedData: StoredData;
  onDataImported: (data: StoredData) => void;
  onResetToDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  semester,
  storedData,
  onDataImported,
  onResetToDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportGardenBackup(storedData);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = importGardenBackup(content);
        if (imported) {
          onDataImported(imported);
          alert('Luna Study Garden backup restored successfully! ♡');
        } else {
          alert('Could not read backup file. Please verify it is a valid Luna Garden JSON export.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    const confirmed = confirm(
      'Are you sure you want to reset Luna Study Garden to its initial Semester 5 state?\n\nThis will clear recorded activities and study logs while keeping the 6 subjects and semester structure intact.'
    );
    if (confirmed) {
      onResetToDefaults();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/20 backdrop-blur-xs">
      <div className="bg-[#FAF7F5] rounded-3xl border border-[#F4DEE5] shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F1E5E9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100/70 border border-purple-200/60 flex items-center justify-center text-purple-700">
              <Sliders className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#3B1F4B] flex items-center gap-1.5">
                <span>Garden Settings</span>
                <span className="text-pink-400">♡</span>
              </h2>
              <p className="text-[11px] text-purple-900/60">
                Semester configuration, schedule thresholds & local storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-purple-700/60 hover:text-purple-900 hover:bg-purple-100/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-purple-950">
          {/* Semester Timeline Profile */}
          <div className="bg-white/80 rounded-2xl p-4 border border-[#F1E5E9] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-950 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Semester Timeline (Semester 5)</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-semibold">
                Week 3 Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[#FAF7F5] border border-purple-100">
                <span className="text-purple-900/50 block uppercase text-[9px] font-semibold">
                  Start Date
                </span>
                <span className="font-medium text-purple-900 font-mono">
                  {semester.startDate} (Sep 20, 2026)
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF7F5] border border-purple-100">
                <span className="text-purple-900/50 block uppercase text-[9px] font-semibold">
                  Expected End Date
                </span>
                <span className="font-medium text-purple-900 font-mono">
                  {semester.endDate} (Jan 31, 2027)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-purple-900/70 leading-relaxed">
              Exactly three academic weeks have elapsed. No mock activities exist for past weeks;
              the semester timeline anchors at Week 3.
            </p>
          </div>

          {/* Automatic Status Logic Thresholds */}
          <div className="bg-white/80 rounded-2xl p-4 border border-[#F1E5E9] space-y-2">
            <span className="font-semibold text-purple-950 flex items-center gap-1.5">
              <SparkleIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Deterministic Schedule Health Logic</span>
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-950">
                <span className="font-semibold">GREEN · On Track</span>
                <span className="text-emerald-800 text-[10px]">No critical overdue · Pace matches Week 3</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200/70 text-amber-950">
                <span className="font-semibold">YELLOW · Slightly Behind</span>
                <span className="text-amber-800 text-[10px]">≥ {SCHEDULE_HEALTH_THRESHOLDS.OVERDUE_WARNING_COUNT} overdue or &lt;{SCHEDULE_HEALTH_THRESHOLDS.STUDY_COMPLETION_WARNING_PERCENT}% study rate</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 border border-rose-200/70 text-rose-950">
                <span className="font-semibold">RED · Needs Attention</span>
                <span className="text-rose-800 text-[10px]">≥ {SCHEDULE_HEALTH_THRESHOLDS.OVERDUE_CRITICAL_COUNT} overdue items</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/70 border border-purple-200/70 text-purple-950">
                <span className="font-semibold">PURPLE · Ahead</span>
                <span className="text-purple-800 text-[10px]">≥ {SCHEDULE_HEALTH_THRESHOLDS.STUDY_COMPLETION_AHEAD_PERCENT}% study rate with 5+ items</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200/70 text-gray-700">
                <span className="font-semibold">NEUTRAL · Not enough data yet</span>
                <span className="text-gray-600 text-[10px]">&lt; {SCHEDULE_HEALTH_THRESHOLDS.MIN_ACTIVITIES_FOR_EVALUATION} activities recorded</span>
              </div>
            </div>
          </div>

          {/* Local Persistence & Backup */}
          <div className="bg-white/80 rounded-2xl p-4 border border-[#F1E5E9] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-950 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-600" />
                <span>Local Persistence</span>
              </span>
              <span className="text-[10px] font-mono text-purple-900/60 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                key: luna_study_garden_v1
              </span>
            </div>

            <p className="text-[11px] text-purple-900/70">
              Frontend-only storage. All your entered lectures, sections, revisions, and study sessions are saved in your browser.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-950 bg-[#FAF7F5] hover:bg-purple-100/60 border border-purple-200/70 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-purple-700" />
                <span>Export JSON Backup</span>
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-950 bg-[#FAF7F5] hover:bg-purple-100/60 border border-purple-200/70 rounded-xl transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-purple-700" />
                <span>Import JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Danger zone / Local Reset */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-semibold">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Local Data</span>
            </div>
            <p className="text-[11px] text-rose-950/70">
              Clear all recorded activities and study session logs back to the clean initial Week 3 semester state.
            </p>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl transition-all shadow-xs"
            >
              Reset to Initial Clean Semester State
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F1E5E9] bg-white/70 flex items-center justify-between">
          <span className="text-[11px] text-purple-900/60 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Private · Stored in your browser</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-purple-950 bg-purple-100/70 hover:bg-purple-200/70 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
