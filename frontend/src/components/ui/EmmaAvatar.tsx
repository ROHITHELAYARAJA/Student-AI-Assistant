import React from 'react';
import { EmmaExpression } from '../../types/study.js';

interface EmmaAvatarProps {
  expression?: EmmaExpression;
  size?: number;
  showStatus?: boolean;
  isOnline?: boolean;
  isPulsing?: boolean;
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
  size = 34,
  showStatus = false,
  isOnline = true,
  isPulsing = false,
  style = {}
}) => {
  const imageSrc = expression && EXPRESSION_MAP[expression] ? EXPRESSION_MAP[expression] : './emma-logo.jpg';

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1.5px solid var(--color-primary)',
        boxShadow: isPulsing ? '0 0 12px rgba(225, 29, 72, 0.45)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style
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

      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: '1px',
            right: '1px',
            width: `${Math.max(6, Math.round(size * 0.24))}px`,
            height: `${Math.max(6, Math.round(size * 0.24))}px`,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#10B981' : '#F59E0B',
            border: '1.5px solid #FFFFFF'
          }}
          title={isOnline ? 'Emma is online' : 'Local fallback'}
        />
      )}
    </div>
  );
};
