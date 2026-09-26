import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../services/auth';
import { Sparkles, User, Palette, LogOut, LogIn } from 'lucide-react';

interface UserProfileMenuProps {
  profile: UserProfile;
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
  onOpenSignIn: () => void;
  onLogOut: () => void;
  currentTheme?: string;
  onToggleTheme?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  profile,
  onOpenSettings,
  onOpenUpgrade,
  onOpenSignIn,
  onLogOut,
  currentTheme = 'Dark',
  onToggleTheme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!profile.isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSignIn}
          className="blast-signin-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #6c47ff 0%, #8c66da 100%)',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(108, 71, 255, 0.35)',
            transition: 'all 0.2s ease',
            fontFamily: "'Space Grotesk', -apple-system, sans-serif"
          }}
        >
          <LogIn size={15} />
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  const initial = profile.name ? profile.name[0].toUpperCase() : 'R';

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Upgrade Button beside profile avatar (Matching Image 2) */}
      <button
        type="button"
        onClick={onOpenUpgrade}
        className="blast-upgrade-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: 'linear-gradient(135deg, #e5a83b 0%, #d4973b 100%)',
          color: '#ffffff',
          padding: '7px 16px',
          borderRadius: '24px',
          fontSize: '13px',
          fontWeight: 700,
          border: '1px solid rgba(255, 255, 255, 0.25)',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(212, 151, 59, 0.35)',
          letterSpacing: '-0.01em',
          transition: 'all 0.2s ease',
          fontFamily: "'Space Grotesk', -apple-system, sans-serif"
        }}
      >
        <Sparkles size={14} style={{ color: '#ffffff' }} />
        <span>Upgrade</span>
      </button>

      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user profile menu"
        aria-expanded={isOpen}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #433368 0%, #2f2349 100%)',
          border: '2px solid #5a458b',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(108, 71, 255, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
          fontFamily: "'Space Grotesk', -apple-system, sans-serif"
        }}
      >
        {initial}
      </button>

      {/* Profile Popover Dropdown (Matching Image 2 in Blast AI style) */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '245px',
            background: '#151518',
            border: '1px solid #282832',
            borderRadius: '16px',
            padding: '16px 12px 10px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(108, 71, 255, 0.1)',
            zIndex: 100,
            animation: 'blastFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: "'DM Sans', -apple-system, sans-serif"
          }}
        >
          {/* User Name & Gmail Header */}
          <div style={{ padding: '0 8px 12px 8px' }}>
            <div
              style={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                fontFamily: "'Space Grotesk', -apple-system, sans-serif"
              }}
            >
              {profile.name}
            </div>
            <div
              style={{
                color: '#8e8e9c',
                fontSize: '12px',
                lineHeight: 1.4,
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={profile.email}
            >
              {profile.email}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#24242e', margin: '0 0 6px 0' }} />

          {/* Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {/* Upgrade Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenUpgrade();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#f0f0f5',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#22222a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Sparkles size={16} style={{ color: '#e5a83b', flexShrink: 0 }} />
              <span>Upgrade</span>
            </button>

            {/* Settings Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#f0f0f5',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#22222a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <User size={16} style={{ color: '#90909e', flexShrink: 0 }} />
              <span>Settings</span>
            </button>

            {/* Theme Option */}
            <button
              type="button"
              onClick={() => {
                if (onToggleTheme) onToggleTheme();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#f0f0f5',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#22222a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Palette size={16} style={{ color: '#90909e', flexShrink: 0 }} />
                <span>Theme</span>
              </div>
              <span style={{ fontSize: '11px', color: '#a855f7', background: '#251b3d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                {currentTheme}
              </span>
            </button>

            {/* Log Out Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogOut();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease',
                marginTop: '2px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
