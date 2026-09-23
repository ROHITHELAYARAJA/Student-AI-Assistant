import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  let icon = <CheckCircle2 size={16} color="#10B981" />;
  let borderColor = '#10B981';

  if (type === 'error') {
    icon = <AlertTriangle size={16} color="#EF4444" />;
    borderColor = '#EF4444';
  } else if (type === 'info') {
    icon = <Info size={16} color="var(--color-primary)" />;
    borderColor = 'var(--color-primary)';
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        backgroundColor: 'var(--color-surface)',
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-text)',
        fontSize: '13px',
        fontWeight: 600,
        maxWidth: '380px'
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
        <X size={14} />
      </button>
    </div>
  );
};
