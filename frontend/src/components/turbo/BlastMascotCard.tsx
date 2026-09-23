import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BlastMascot, BlastMascotState } from './BlastMascot';

export interface BlastMascotCardProps {
  state?: BlastMascotState;
  className?: string;
  onClick?: () => void;
}

export const BlastMascotCard: React.FC<BlastMascotCardProps> = ({
  state = 'idle',
  className = '',
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!badgeRef.current) return;

    // GSAP floating animation for top energy badge
    const badgeTween = gsap.to(badgeRef.current, {
      y: -4,
      rotation: 1.5,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    return () => {
      badgeTween.kill();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#1E1E28] border-2 border-orange-400 shadow-xl shadow-orange-500/15 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-98 select-none ${className}`}
      title="Blast AI Study Mascot"
    >
      {/* Top Floating Energy Badge (Fire + Lightning as in Image 1) */}
      <div
        ref={badgeRef}
        className="absolute -top-3 right-3 sm:-top-3.5 sm:right-4 bg-white/95 dark:bg-[#2A2A38] border border-orange-200 dark:border-orange-500/30 rounded-full px-2.5 py-0.5 shadow-md flex items-center gap-1.5 z-10"
      >
        <span className="text-xs">🔥</span>
        <span className="text-xs">⚡</span>
      </div>

      {/* Mascot Animated with GSAP + SVG */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        <BlastMascot size={110} state={state} interactive={true} />
      </div>
    </div>
  );
};

export default BlastMascotCard;
