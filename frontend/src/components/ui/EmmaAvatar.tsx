import React from 'react';
import { BlastExpression } from '../../types/study.js';
import { BlastMascot, MascotState } from '../turbo/BlastMascot.js';

interface BlastAvatarProps {
  expression?: BlastExpression;
  size?: number;
  showStatus?: boolean;
  isOnline?: boolean;
  isPulsing?: boolean;
  useOfficialLogo?: boolean;
  style?: React.CSSProperties;
}

export type EmmaAvatarProps = BlastAvatarProps;

const mapExpressionToState = (expr: string): MascotState => {
  switch (expr) {
    case 'waving': return 'greeting';
    case 'celebrating': return 'success';
    case 'thinking': return 'thinking';
    case 'sleeping': return 'idle';
    case 'teaching': return 'speaking';
    case 'confused': return 'error';
    case 'reading': return 'listening';
    default: return 'idle';
  }
};

export const BlastAvatar: React.FC<BlastAvatarProps> = ({
  expression = 'reading',
  size = 36,
  showStatus = false,
  isOnline = true,
  isPulsing = false,
  style = {}
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        ...style
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#161622',
          border: '1.5px solid rgba(255, 94, 0, 0.3)',
          boxShadow: isPulsing
            ? '0 0 0 3px rgba(249, 115, 22, 0.35), 0 2px 10px rgba(249, 115, 22, 0.25)'
            : '0 2px 8px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <BlastMascot size={size} state={mapExpressionToState(expression)} />
      </div>

      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: `${Math.max(8, Math.round(size * 0.25))}px`,
            height: `${Math.max(8, Math.round(size * 0.25))}px`,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#10B981' : '#6B7280',
            border: '2px solid var(--color-bg, #0C0C11)'
          }}
        />
      )}
    </div>
  );
};

export const EmmaAvatar = BlastAvatar;
export default BlastAvatar;
