import React from 'react';
import { EmmaExpression } from '../../types/study.js';

interface EmmaAvatarProps {
  expression?: EmmaExpression;
  size?: number;
  showStatus?: boolean;
  isOnline?: boolean;
  isPulsing?: boolean;
  useOfficialLogo?: boolean;
  style?: React.CSSProperties;
}

const EXPRESSION_MAP: Record<EmmaExpression, string> = {
  reading: './emma-expressions/emma-reading.png',
  thinking: './emma-expressions/emma-thinking.png',
  teaching: './emma-expressions/emma-teaching.png',
  loving: './emma-expressions/emma-loving.png',
  coding: './emma-expressions/emma-coding.png',
  celebrating: './emma-expressions/emma-celebrating.png',
  sleeping: './emma-expressions/emma-sleeping.png',
  waving: './emma-expressions/emma-waving.png'
};

export const EmmaAvatar: React.FC<EmmaAvatarProps> = ({
  expression,
  size = 36,
  showStatus = false,
  isOnline = true,
  isPulsing = false,
  useOfficialLogo = false,
  style = {}
}) => {
  const imageSrc =
    useOfficialLogo || !expression
      ? './emma-logo.jpg'
      : EXPRESSION_MAP[expression] || './emma-logo.jpg';

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
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--color-border)',
          boxShadow: isPulsing
            ? '0 0 0 3px rgba(225, 29, 72, 0.25), 0 2px 8px rgba(81, 0, 0, 0.1)'
            : '0 1px 4px rgba(81, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={imageSrc}
          alt={`Emma ${expression || 'Avatar'}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = './emma-logo.jpg';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>

      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: `${Math.max(8, Math.round(size * 0.26))}px`,
            height: `${Math.max(8, Math.round(size * 0.26))}px`,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#10B981' : '#F59E0B',
            border: '2px solid #FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)'
          }}
          title={isOnline ? 'Emma is online & ready' : 'Local synthesis active'}
        />
      )}
    </div>
  );
};
