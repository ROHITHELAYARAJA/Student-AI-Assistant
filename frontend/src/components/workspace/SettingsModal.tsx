import React, { useState } from 'react';
import { UserProfile, saveStoredProfile } from '../../services/auth';
import {
  X,
  Settings as SettingsIcon,
  Crown,
  Sparkles,
  Copy,
  Check,
  Edit2,
  Mail,
  User as UserIcon,
  LogOut,
  Cpu,
  Sliders,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  Layers,
  HelpCircle,
  Volume2
} from 'lucide-react';

interface SettingsModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenUpgrade: () => void;
  onOpenLibrary: () => void;
  onOpenDraftUploads: () => void;
  onClearAllHistory?: () => void;
  onLogOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onOpenUpgrade,
  onOpenLibrary,
  onOpenDraftUploads,
  onClearAllHistory,
  onLogOut
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile.name);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Stored preferences
  const [difficulty, setDifficulty] = useState<string>(() => {
    try { return localStorage.getItem('blast_pref_difficulty') || 'beginner'; } catch { return 'beginner'; }
  });
  const [cardCount, setCardCount] = useState<number>(() => {
    try { return Number(localStorage.getItem('blast_pref_cards') || 8); } catch { return 8; }
  });
  const [questionCount, setQuestionCount] = useState<number>(() => {
    try { return Number(localStorage.getItem('blast_pref_questions') || 5); } catch { return 5; }
  });
  const [voiceReadout, setVoiceReadout] = useState<boolean>(() => {
    try { return localStorage.getItem('blast_pref_voice') === 'true'; } catch { return false; }
  });

  function handleSaveName() {
    if (!nameValue.trim()) return;
    const parts = nameValue.trim().split(/\s+/);
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : nameValue.slice(0, 2).toUpperCase();

    const updated: UserProfile = {
      ...profile,
      name: nameValue.trim(),
      initials
    };
    saveStoredProfile(updated);
    onUpdateProfile(updated);
    setIsEditingName(false);
  }

  function handleCopyUserId() {
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  function handlePrefChange(key: string, val: any) {
    try { localStorage.setItem(key, String(val)); } catch {}
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 5, 8, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          background: '#111116',
          border: '1px solid #232330',
          borderRadius: '24px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f0f0f5',
          fontFamily: "'DM Sans', -apple-system, sans-serif"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #1f1f2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#14141a'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(147, 51, 234, 0.18)',
                border: '1px solid rgba(147, 51, 234, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc'
              }}
            >
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 id="settings-heading" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Blast AI Settings & Preferences
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#88889a' }}>
                Manage active AI model, study parameters, and data collections
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: '#1d1d26',
              border: '1px solid #2f2f3e',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9090a2',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Grid */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr',
            gap: '20px'
          }}
        >
          {/* Left Column: Account Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#16161d',
                border: '1px solid #242432',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: '3px solid #111116',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)'
                }}
              >
                {profile.initials || 'ST'}
              </div>

              {/* Name Editor */}
              {isEditingName ? (
                <div style={{ display: 'flex', gap: '6px', width: '100%', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: '#1d1d28',
                      border: '1px solid #7c3aed',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    style={{
                      background: '#7c3aed',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '0 12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '17px', color: '#ffffff' }}>{profile.name}</strong>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '2px' }}
                    title="Edit Name"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}

              <span style={{ fontSize: '12px', color: '#88889b', marginBottom: '14px' }}>
                {profile.email || 'Guest Student Account'}
              </span>

              {/* Plan Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: '#121217',
                  border: '1px solid #20202c',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  boxSizing: 'border-box',
                  marginBottom: '12px'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#717182', fontWeight: 700, letterSpacing: '0.5px' }}>
                    CURRENT PLAN
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#c084fc', marginTop: '2px' }}>
                    {profile.plan || 'Free Student'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '6px 14px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>Pro</span>
                </button>
              </div>

              {/* Copy ID */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: '#121217',
                  border: '1px solid #20202c',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  fontSize: '11px',
                  color: '#717182'
                }}
              >
                <span>ID: {profile.id.slice(0, 14)}…</span>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  style={{ background: 'none', border: 'none', color: copiedId ? '#22c55e' : '#a0a0b2', cursor: 'pointer' }}
                >
                  {copiedId ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={onLogOut}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '9px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Column: AI Engine, Study Defaults & Data Management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Active AI Engine Status Card */}
            <div
              style={{
                background: '#16161d',
                border: '1px solid #242432',
                borderRadius: '18px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} style={{ color: '#c084fc' }} />
                  <strong style={{ fontSize: '15px', color: '#ffffff' }}>Active AI Engine</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '3px 10px',
                    color: '#4ade80',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  <span>OPERATIONAL</span>
                </div>
              </div>

              <div
                style={{
                  background: '#111116',
                  border: '1px solid #20202c',
                  borderRadius: '12px',
                  padding: '14px',
                  marginTop: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                      NVIDIA Nemotron Ultra (550B)
                    </div>
                    <div style={{ fontSize: '12px', color: '#88889b', marginTop: '2px' }}>
                      500k context window · High-speed reasoning · Diagram vision enabled
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'rgba(147, 51, 234, 0.2)',
                      border: '1px solid rgba(147, 51, 234, 0.4)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#d8b4fe'
                    }}
                  >
                    Primary Engine
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Study Preferences Card */}
            <div
              style={{
                background: '#16161d',
                border: '1px solid #242432',
                borderRadius: '18px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sliders size={18} style={{ color: '#38bdf8' }} />
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>Study Pack Defaults</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Default Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={e => {
                      setDifficulty(e.target.value);
                      handlePrefChange('blast_pref_difficulty', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      background: '#121217',
                      border: '1px solid #232330',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  >
                    <option value="beginner">Beginner / Fundamentals</option>
                    <option value="intermediate">Intermediate / Standard</option>
                    <option value="advanced">Advanced / Exam Mastery</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Flashcards per Pack
                  </label>
                  <select
                    value={cardCount}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setCardCount(val);
                      handlePrefChange('blast_pref_cards', val);
                    }}
                    style={{
                      width: '100%',
                      background: '#121217',
                      border: '1px solid #232330',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  >
                    <option value={5}>5 Flashcards (Quick)</option>
                    <option value={8}>8 Flashcards (Standard)</option>
                    <option value={15}>15 Flashcards (Deep Dive)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Quiz Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setQuestionCount(val);
                      handlePrefChange('blast_pref_questions', val);
                    }}
                    style={{
                      width: '100%',
                      background: '#121217',
                      border: '1px solid #232330',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  >
                    <option value={3}>3 Questions (Micro-Quiz)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={10}>10 Questions (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Voice Tutor Readout
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !voiceReadout;
                      setVoiceReadout(next);
                      handlePrefChange('blast_pref_voice', next);
                    }}
                    style={{
                      width: '100%',
                      background: voiceReadout ? 'rgba(56, 189, 248, 0.15)' : '#121217',
                      border: voiceReadout ? '1px solid #38bdf8' : '1px solid #232330',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: voiceReadout ? '#38bdf8' : '#88889b',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Volume2 size={15} />
                    <span>{voiceReadout ? 'Enabled' : 'Muted'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Data & Zero-Slate History Management */}
            <div
              style={{
                background: '#16161d',
                border: '1px solid #242432',
                borderRadius: '18px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trash2 size={17} style={{ color: '#ef4444' }} />
                    <strong style={{ fontSize: '15px', color: '#ffffff' }}>History & Collections</strong>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#8e8e9c' }}>
                    Wipe all saved notebooks, chat history, and uploaded docs to start completely fresh.
                  </p>
                </div>

                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      color: '#f87171',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Clear All History
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      style={{
                        background: '#232330',
                        border: '1px solid #36364a',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        color: '#a0a0b2',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmClear(false);
                        onClearAllHistory?.();
                      }}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Confirm Wipe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
