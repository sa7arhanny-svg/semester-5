import React from 'react';

interface MascotProps {
  expression?: 'happy' | 'reading' | 'encouraging' | 'celebrate' | 'thinking';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  expression = 'happy',
  size = 'md',
  className = '',
}) => {
  const sizePx = size === 'sm' ? 24 : size === 'md' ? 36 : 48;

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      style={{ width: sizePx, height: sizePx }}
      aria-label="Luna's study mascot: Astra"
      title="Astra ✦ Luna's study sparkle"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform hover:scale-110 duration-200"
      >
        {/* Soft background aura */}
        <circle cx="24" cy="24" r="22" fill="#FAF5FF" opacity="0.8" />
        <circle cx="24" cy="24" r="18" fill="#FDF2F8" opacity="0.6" />

        {/* 4-point soft star shape body with rounded corners */}
        <path
          d="M24 4 C24 16 28 20 40 24 C28 28 24 32 24 44 C24 32 20 28 8 24 C20 20 24 16 24 4 Z"
          fill="url(#mascotGradient)"
          stroke="#E9D5FF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Face Elements */}
        {expression === 'reading' ? (
          <>
            {/* Cute glasses */}
            <circle cx="20" cy="23" r="3.2" stroke="#6B21A8" strokeWidth="1.2" fill="#FFFFFF" fillOpacity="0.7" />
            <circle cx="28" cy="23" r="3.2" stroke="#6B21A8" strokeWidth="1.2" fill="#FFFFFF" fillOpacity="0.7" />
            <path d="M23.2 23 L24.8 23" stroke="#6B21A8" strokeWidth="1.2" />
            <circle cx="20" cy="23" r="1.1" fill="#4C1D95" />
            <circle cx="28" cy="23" r="1.1" fill="#4C1D95" />
            {/* Smile */}
            <path d="M22 28 Q24 30 26 28" stroke="#7E22CE" strokeWidth="1.2" strokeLinecap="round" />
          </>
        ) : expression === 'celebrate' ? (
          <>
            {/* Joyful closed eyes ^^ */}
            <path d="M18 22 Q20 19 22 22" stroke="#6B21A8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M26 22 Q28 19 30 22" stroke="#6B21A8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Cheerful open smile */}
            <path d="M21 26 Q24 30 27 26" stroke="#7E22CE" strokeWidth="1.3" strokeLinecap="round" fill="#F472B6" />
            {/* Little party sparkle */}
            <circle cx="36" cy="12" r="1.5" fill="#F472B6" />
            <circle cx="12" cy="14" r="1" fill="#A855F7" />
          </>
        ) : expression === 'thinking' ? (
          <>
            {/* Curious eyes */}
            <circle cx="20" cy="22" r="1.4" fill="#581C87" />
            <circle cx="28" cy="21" r="1.8" fill="#581C87" />
            {/* Pondering mouth */}
            <ellipse cx="24" cy="27" rx="1.5" ry="1.2" fill="#7E22CE" />
          </>
        ) : (
          <>
            {/* Happy eyes */}
            <circle cx="20" cy="22" r="1.4" fill="#581C87" />
            <circle cx="28" cy="22" r="1.4" fill="#581C87" />
            <circle cx="19.4" cy="21.4" r="0.5" fill="#FFFFFF" />
            <circle cx="27.4" cy="21.4" r="0.5" fill="#FFFFFF" />
            {/* Blush cheeks */}
            <circle cx="17" cy="25" r="1.8" fill="#F472B6" opacity="0.6" />
            <circle cx="31" cy="25" r="1.8" fill="#F472B6" opacity="0.6" />
            {/* Sweet smile */}
            <path d="M22 26 Q24 28 26 26" stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}

        {/* Tiny science sparkle micro-accent */}
        <path d="M34 16 L35 14 L36 16 L38 17 L36 18 L35 20 L34 18 L32 17 Z" fill="#C084FC" opacity="0.7" />

        <defs>
          <linearGradient id="mascotGradient" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAF5FF" />
            <stop offset="0.5" stopColor="#F3E8FF" />
            <stop offset="1" stopColor="#FCE7F3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
