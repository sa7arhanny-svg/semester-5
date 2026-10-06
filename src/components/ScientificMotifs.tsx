import React from 'react';

export const TinyBenzene: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-purple-300' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
    <polygon points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="4.5" strokeWidth="1" strokeDasharray="3 2" />
  </svg>
);

export const TinyDnaHelix: React.FC<{ className?: string }> = ({ className = 'w-5 h-4 text-pink-300' }) => (
  <svg viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
    <path d="M2 3 Q8 13 16 8 Q24 3 30 13" strokeLinecap="round" />
    <path d="M2 13 Q8 3 16 8 Q24 13 30 3" strokeLinecap="round" />
    <line x1="9" y1="6" x2="9" y2="10" strokeWidth="1" />
    <line x1="16" y1="7" x2="16" y2="9" strokeWidth="1" />
    <line x1="23" y1="6" x2="23" y2="10" strokeWidth="1" />
  </svg>
);

export const TinyMicroscope: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-indigo-300' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M6 18h8" />
    <path d="M3 21h14" />
    <path d="M9 18a4 4 0 0 0 4-4V9" />
    <path d="M11 3l4 4" />
    <circle cx="15" cy="5" r="1.5" />
    <path d="M10 6l3.5 3.5" />
  </svg>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5 text-purple-400' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
  </svg>
);
