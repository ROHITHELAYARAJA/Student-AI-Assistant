import React from 'react';
import confetti from 'canvas-confetti';
import { GlowingFireLogo } from './GlowingFireLogo.js';

export type BlastMascotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'processing'
  | 'speaking'
  | 'happy'
  | 'success'
  | 'error'
  | 'excited'
  | 'greeting'
  | 'empty_state'
  | 'waiting';

export type MascotState = BlastMascotState;

export interface BlastMascotProps {
  state?: BlastMascotState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  mood?: 'neutral' | 'curious' | 'celebrating' | 'playful';
  context?: 'chat' | 'onboarding' | 'empty_state' | 'celebration' | 'milestone' | 'inline';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const BlastMascot: React.FC<BlastMascotProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  onClick,
  interactive = true
}) => {
  const triggerCelebration = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF5500', '#FFAA00', '#FF2200', '#FFDD44']
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (interactive) {
      triggerCelebration();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center justify-center ${className}`}
      title="Blast AI Fire Engine"
    >
      <GlowingFireLogo
        size={size}
        showGlow={size !== 'xs'}
        interactive={interactive}
      />
    </div>
  );
};

export default BlastMascot;
