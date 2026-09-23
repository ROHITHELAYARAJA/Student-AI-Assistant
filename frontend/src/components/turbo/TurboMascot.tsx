import React from 'react';

export interface TurboMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  expression?: 'reading' | 'teaching' | 'thinking' | 'celebrating' | 'happy' | 'waving' | string;
  className?: string;
}

export const TurboMascot: React.FC<TurboMascotProps> = ({
  size = 'md',
  expression = 'reading',
  className = ''
}) => {
  const sizeMap: Record<string, number> = {
    xs: 20,
    sm: 32,
    md: 48,
    lg: 80,
    xl: 120
  };

  const px = typeof size === 'number' ? size : sizeMap[size] || 48;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: px, height: px }}
      title={`Turbo Mascot (${expression})`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="turboBodyGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="0.6" stopColor="#6D28D9" />
            <stop offset="1" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="turboBellyGrad" x1="30" y1="40" x2="70" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DDD6FE" />
            <stop offset="1" stopColor="#C4B5FD" />
          </linearGradient>
          <linearGradient id="turboBookGrad" x1="20" y1="65" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="turboEyeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#1E1B4B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* Outer Glow / Halo */}
        <circle cx="50" cy="50" r="44" fill="#7C3AED" opacity="0.15" />

        {/* Mascot Body (Round Purple Owl/Bird) */}
        <circle cx="50" cy="52" r="38" fill="url(#turboBodyGrad)" />

        {/* Owl Ear Tufts */}
        <path d="M26 24 C24 14, 34 18, 38 22 Z" fill="#6D28D9" />
        <path d="M74 24 C76 14, 66 18, 62 22 Z" fill="#6D28D9" />

        {/* Soft Lavender Belly */}
        <ellipse cx="50" cy="62" rx="23" ry="20" fill="url(#turboBellyGrad)" />

        {/* Feather Pattern Marks on Belly */}
        <path d="M44 58 Q50 62 56 58" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M41 66 Q50 70 59 66" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

        {/* Eyes Behind Glasses */}
        {expression === 'thinking' ? (
          <>
            <circle cx="36" cy="44" r="9" fill="#FFFFFF" />
            <circle cx="64" cy="44" r="9" fill="#FFFFFF" />
            <circle cx="38" cy="42" r="4.5" fill="url(#turboEyeGrad)" />
            <circle cx="66" cy="42" r="4.5" fill="url(#turboEyeGrad)" />
            <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" />
            <circle cx="68" cy="40" r="1.5" fill="#FFFFFF" />
          </>
        ) : expression === 'celebrating' || expression === 'happy' ? (
          <>
            <circle cx="36" cy="44" r="9" fill="#FFFFFF" />
            <circle cx="64" cy="44" r="9" fill="#FFFFFF" />
            <path d="M30 46 Q36 40 42 46" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M58 46 Q64 40 70 46" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          /* Default Reading / Teaching Expression */
          <>
            <circle cx="36" cy="44" r="9" fill="#FFFFFF" />
            <circle cx="64" cy="44" r="9" fill="#FFFFFF" />
            <circle cx="37" cy="45" r="5" fill="url(#turboEyeGrad)" />
            <circle cx="63" cy="45" r="5" fill="url(#turboEyeGrad)" />
            <circle cx="35.5" cy="43" r="1.8" fill="#FFFFFF" />
            <circle cx="61.5" cy="43" r="1.8" fill="#FFFFFF" />
          </>
        )}

        {/* Round Smart Glasses */}
        <circle cx="36" cy="44" r="11" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
        <circle cx="64" cy="44" r="11" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
        <path d="M47 44 Q50 42 53 44" stroke="#FBBF24" strokeWidth="2.5" fill="none" />

        {/* Cute Golden Beak */}
        <polygon points="50,49 44,55 56,55" fill="#F59E0B" />
        <polygon points="50,56 46,55 54,55" fill="#D97706" />

        {/* Open Book or Graduation Cap / Wand */}
        {expression === 'celebrating' ? (
          <g>
            <polygon points="50,14 26,22 50,30 74,22" fill="#1E1B4B" />
            <path d="M34 26 L34 33 Q50 39 66 33 L66 26" fill="#1E1B4B" />
            <path d="M72 23 L74 34 L76 34" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : expression === 'thinking' ? (
          /* Lightbulb Sparkle */
          <g transform="translate(68, 12)">
            <circle cx="8" cy="8" r="6" fill="#FEF08A" opacity="0.9" />
            <path d="M8 2 L8 0 M8 16 L8 14 M2 8 L0 8 M16 8 L14 8" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          /* Open Book held by wings */
          <g transform="translate(0, 4)">
            {/* Book Left & Right Pages */}
            <path d="M50 74 Q36 68 25 71 L25 82 Q36 78 50 83 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M50 74 Q64 68 75 71 L75 82 Q64 78 50 83 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            {/* Book Spine Cover */}
            <path d="M23 72 L50 84 L77 72" stroke="url(#turboBookGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Page text lines */}
            <line x1="30" y1="74" x2="44" y2="72" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="30" y1="78" x2="42" y2="76" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="56" y1="72" x2="70" y2="74" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="58" y1="76" x2="70" y2="78" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {/* Wings resting on side */}
        <path d="M12 52 Q18 64 26 70" stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M88 52 Q82 64 74 70" stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};
export default TurboMascot;
