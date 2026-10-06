import React from 'react';
import { NavigationTab } from '../types';
import { SparkleIcon } from './ScientificMotifs';
import { Plus, Timer, BookOpen, Calendar, BarChart3, ListTodo, LayoutGrid, Sliders } from 'lucide-react';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  onOpenSettings?: () => void;
  isTimerRunning: boolean;
  timerSecondsLeft: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenSettings,
  isTimerRunning,
  timerSecondsLeft,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navLinks: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'plan', label: "Today's Plan", icon: ListTodo },
    { id: 'study', label: 'Study Mode', icon: Timer },
    { id: 'timeline', label: 'Map & Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF8]/95 backdrop-blur-md border-b border-[#F4DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title, single clean text element */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 border border-purple-200/60 flex items-center justify-center text-purple-700 shadow-xs transition-transform group-hover:scale-105">
            <SparkleIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#3B1F4B] flex items-center gap-1.5">
              Luna Study Garden
              <span className="text-xs font-normal text-pink-400">♡</span>
            </span>
            <span className="text-[10px] text-purple-900/60 tracking-wider font-mono">
              SEM 05 · WK 03
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-100/70 text-purple-950 shadow-xs font-semibold'
                    : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-700' : 'text-purple-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action & Timer chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isTimerRunning && (
            <button
              onClick={() => onSelectTab('study')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-pink-50 border border-pink-200 text-pink-800 hover:bg-pink-100 transition-colors animate-pulse"
              title="Study timer is active! Click to view"
            >
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span className="font-mono tabular-nums font-semibold">{formatTime(timerSecondsLeft)}</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-purple-900 hover:bg-purple-950 active:scale-98 rounded-xl shadow-xs transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Activity</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-xl bg-white hover:bg-purple-50/80 border border-[#F4DEE5] text-purple-700/70 hover:text-purple-950 flex items-center justify-center transition-colors shadow-2xs"
              title="Garden Settings & Local Storage"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-[#F1E5E9]/60 bg-[#FAF7F5] overflow-x-auto">
        {navLinks.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[11px] whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-purple-950 font-semibold'
                  : 'text-purple-900/60 hover:text-purple-950'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-purple-700' : 'text-purple-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
