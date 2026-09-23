import React from 'react';
import { GlowingFireLogo } from './GlowingFireLogo.js';
import { BlastMascotProps } from './BlastMascot.js';

export interface RiveBlastMascotProps extends BlastMascotProps {
  riveSrc?: string;
  stateMachine?: string;
}

export const RiveBlastMascot: React.FC<RiveBlastMascotProps> = ({
  size = 'md',
  className = '',
  onClick,
  interactive = true
}) => {
  return (
    <GlowingFireLogo
      size={size}
      className={className}
      interactive={interactive}
      showGlow={size !== 'xs'}
    />
  );
};

export default RiveBlastMascot;
