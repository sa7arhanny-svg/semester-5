import React from 'react';
import { Mascot } from './Mascot';
import { HealthReport } from '../types';
import { TinyBenzene, TinyDnaHelix } from './ScientificMotifs';

interface GreetingProps {
  studentName?: string;
  health: HealthReport;
  totalActivities: number;
  completedActivities: number;
  studyMinutesToday?: number;
}

export const Greeting: React.FC<GreetingProps> = ({
  studentName = 'Luna',
  health,
  totalActivities,
  completedActivities,
  studyMinutesToday = 0,
}) => {
  // Determine soft contextual line based on health & activity
  let contextualLine = "Let's see where we are today.";
  let mascotExpression: 'happy' | 'reading' | 'encouraging' | 'celebrate' | 'thinking' = 'happy';

  if (totalActivities === 0) {
    contextualLine = "Let's see where we are today.";
    mascotExpression = 'encouraging';
  } else if (health.status === 'needs_attention') {
    contextualLine = "A tiny catch-up session would help today.";
    mascotExpression = 'reading';
  } else if (health.status === 'slightly_behind') {
    contextualLine = "A little progress still counts.";
    mascotExpression = 'reading';
  } else if (health.status === 'ahead') {
    contextualLine = "Look at you go ✦";
    mascotExpression = 'celebrate';
  } else {
    contextualLine = "You're right on track ✦";
    mascotExpression = 'happy';
  }

  if (studyMinutesToday >= 45) {
    contextualLine = "Look at you go.";
    mascotExpression = 'celebrate';
  }

  return (
    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xs border border-[#F1E5E9] rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* Background delicate scientific watermarks */}
      <div className="absolute right-3 top-3 opacity-20 pointer-events-none hidden sm:flex items-center gap-3">
        <TinyBenzene className="w-8 h-8 text-purple-400" />
        <TinyDnaHelix className="w-10 h-6 text-pink-400" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Mascot expression={mascotExpression} size="md" className="shrink-0" />
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#3B1F4B] tracking-tight flex items-center gap-1.5">
              <span>Good morning, {studentName}</span>
              <span className="text-pink-400 text-sm font-normal">♡</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-900/75 mt-0.5 font-medium">
              {contextualLine}
            </p>
          </div>
        </div>

        {/* Quiet metadata indicator */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-purple-900">Semester 5 · 2026</span>
          <span className="text-[11px] text-purple-900/60 font-mono">Week 3 of 19</span>
        </div>
      </div>
    </div>
  );
};
