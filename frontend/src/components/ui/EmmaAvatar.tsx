import React from 'react';
import { EmmaExpression } from '../../types/study.js';
import { TurboMascot } from '../turbo/TurboMascot.js';

interface EmmaAvatarProps {
  expression?: EmmaExpression;
  size?: number;
  showStatus?: boolean;
  isOnline?: boolean;
  isPulsing?: boolean;
  useOfficialLogo?: boolean;
  style?: React.CSSProperties;
}

export const EmmaAvatar: React.FC<EmmaAvatarProps> = ({
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
          backgroundColor: '#1E1B4B',
          border: '1.5px solid var(--color-border, #272738)',
          boxShadow: isPulsing
            ? '0 0 0 3px rgba(124, 58, 237, 0.25), 0 2px 8px rgba(124, 58, 237, 0.2)'
            : '0 1px 4px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TurboMascot size={size} expression={expression} />
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
export default EmmaAvatar;
