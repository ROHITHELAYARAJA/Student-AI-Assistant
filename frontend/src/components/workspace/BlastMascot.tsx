import React from 'react';
import './mascot.css';

// Original user-supplied stills; one consistent media slot for future videos.
export function BlastMascot({ pose = 'tutor', size = 'medium', decorative = false }: {
  pose?: 'tutor' | 'reading' | 'working' | 'graduate' | 'explorer' | 'listening';
  size?: 'avatar' | 'small' | 'medium' | 'hero'; decorative?: boolean;
}) {
  return <img className={`blast-cat blast-cat-${size}`} src={`/mascots/${pose}.png`}
    width={160} height={160} alt={decorative ? '' : 'Blast, your cat study companion'}
    loading={size === 'avatar' ? 'eager' : 'lazy'} decoding="async" />;
}
