import React, { useState } from 'react';
import { UserProfile, saveStoredProfile } from '../../services/auth';
import {
  X,
  Settings as SettingsIcon,
  Crown,
  Sparkles,
  Mic,
  Copy,
  Check,
  Edit2,
  Mail,
  Globe,
  User as UserIcon,
  LogOut,
  Camera,
  ArrowRight,
  Key
} from 'lucide-react';

interface SettingsModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenUpgrade: () => void;
  onOpenLibrary: () => void;
  onOpenDraftUploads: () => void;
  onLogOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onOpenUpgrade,
  onOpenLibrary,
  onOpenDraftUploads,
  onLogOut
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile.name);
  const [isEditingLang, setIsEditingLang] = useState(false);
  const [langValue, setLangValue] = useState(profile.language);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditingAccessCode, setIsEditingAccessCode] = useState(false);
  const [accessCodeValue, setAccessCodeValue] = useState(profile.accessCode || 'Not assigned');

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

  function handleSaveLang(newLang: string) {
    setLangValue(newLang);
    const updated: UserProfile = {
      ...profile,
      language: newLang
    };
    saveStoredProfile(updated);
    onUpdateProfile(updated);
    setIsEditingLang(false);
  }

  function handleSaveAccessCode() {
    const updated: UserProfile = {
      ...profile,
      accessCode: accessCodeValue.trim() || 'Not assigned'
    };
    saveStoredProfile(updated);
    onUpdateProfile(updated);
    setIsEditingAccessCode(false);
  }

  function handleCopyUserId() {
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
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
        backgroundColor: 'rgba(5, 5, 8, 0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        overflowY: 'auto',
        fontFamily: "'DM Sans', -apple-system, sans-serif"
      }}
    >
      <div
        className="blast-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        style={{
          width: '100%',
          maxWidth: '920px',
          background: '#121215',
          borderRadius: '24px',
          border: '1px solid #24242e',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 45px rgba(108, 71, 255, 0.12)',
          color: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1f1f28'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SettingsIcon size={22} style={{ color: '#a855f7' }} />
              <h2
                id="settings-title"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#ffffff',
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                }}
              >
                Settings
              </h2>
            </div>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#8e8e9c' }}>
              Manage your account, subscription, and preferences
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: '#1e1e26',
              border: '1px solid #2b2b38',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8e8e9c',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = '#282834';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#8e8e9c';
              e.currentTarget.style.background = '#1e1e26';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div
          style={{
            padding: '26px 28px 28px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr',
            gap: '24px'
          }}
        >
          {/* Left Column: Account Profile Card */}
          <div
            style={{
              background: '#16161b',
              border: '1px solid #242430',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Purple Banner */}
            <div
              style={{
                height: '90px',
                background: 'linear-gradient(135deg, #6c47ff 0%, #a855f7 100%)',
                position: 'relative'
              }}
            />

            {/* Avatar & Info */}
            <div
              style={{
                padding: '0 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                marginTop: '-44px'
              }}
            >
              {/* Circular Avatar */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #44326d 0%, #2f214f 100%)',
                    border: '4px solid #16161b',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                  }}
                >
                  {profile.initials}
                </div>
                <button
                  type="button"
                  title="Change avatar photo"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#242430',
                    border: '2px solid #16161b',
                    color: '#a855f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* User Name with inline edit */}
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <input
                    type="text"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    style={{
                      background: '#1f1f28',
                      border: '1px solid #6c47ff',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: 600,
                      outline: 'none',
                      textAlign: 'center',
                      width: '160px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    style={{
                      background: '#6c47ff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <h3
                    style={{
                      fontSize: '19px',
                      fontWeight: 700,
                      margin: 0,
                      color: '#ffffff',
                      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                    }}
                  >
                    {profile.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    title="Edit name"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8e8e9c',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex'
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}

              <p style={{ margin: 0, fontSize: '12px', color: '#7a7a88', marginBottom: '18px' }}>
                Member since {profile.memberSince}
              </p>

              {/* Details Box Rows */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Email */}
                <div
                  style={{
                    background: '#111114',
                    border: '1px solid #22222c',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#7a7a88', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Mail size={12} style={{ color: '#8e8e9c' }} />
                    <span>Email</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500, wordBreak: 'break-all' }}>
                    {profile.email}
                  </div>
                </div>

                {/* Language */}
                <div
                  style={{
                    background: '#111114',
                    border: '1px solid #22222c',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#7a7a88', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <Globe size={12} style={{ color: '#8e8e9c' }} />
                      <span>Language</span>
                    </div>
                    {isEditingLang ? (
                      <select
                        value={langValue}
                        onChange={e => handleSaveLang(e.target.value)}
                        style={{
                          background: '#1f1f28',
                          border: '1px solid #6c47ff',
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                        {profile.language}
                      </div>
                    )}
                  </div>
                  {!isEditingLang && (
                    <button
                      type="button"
                      onClick={() => setIsEditingLang(true)}
                      style={{ background: 'transparent', border: 'none', color: '#8e8e9c', cursor: 'pointer' }}
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>

                {/* User ID */}
                <div
                  style={{
                    background: '#111114',
                    border: '1px solid #22222c',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: '#7a7a88', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <UserIcon size={12} style={{ color: '#8e8e9c' }} />
                      <span>User ID</span>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#a0a0b0',
                        fontFamily: "'Fira Code', monospace",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px'
                      }}
                      title={profile.id}
                    >
                      {profile.id.slice(0, 18)}...
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUserId}
                    title="Copy User ID"
                    style={{
                      background: '#1e1e26',
                      border: '1px solid #2c2c3a',
                      borderRadius: '6px',
                      padding: '5px 7px',
                      color: copiedId ? '#22c55e' : '#a0a0b0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px'
                    }}
                  >
                    {copiedId ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={onLogOut}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3 Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Subscription Card */}
            <div
              style={{
                background: '#16161b',
                border: '1px solid #242430',
                borderRadius: '20px',
                padding: '22px 24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    margin: 0,
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                  }}
                >
                  Subscription
                </h4>
                <Crown size={18} style={{ color: '#e5a83b' }} />
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#8e8e9c' }}>
                Basic access with essential features
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: '#111114',
                  border: '1px solid #22222c',
                  borderRadius: '14px',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#7a7a88', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                    CURRENT PLAN
                  </div>
                  <div style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', marginTop: '2px', fontFamily: "'Space Grotesk', -apple-system, sans-serif" }}>
                    {profile.plan}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  style={{
                    background: 'linear-gradient(135deg, #6c47ff 0%, #8c66da 100%)',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(108, 71, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  <Sparkles size={14} />
                  <span>Upgrade</span>
                </button>
              </div>

              {/* Access Code */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#8e8e9c'
                }}
              >
                <Key size={14} style={{ color: '#a855f7' }} />
                <span>Access Code:</span>
                {isEditingAccessCode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={accessCodeValue}
                      onChange={e => setAccessCodeValue(e.target.value)}
                      placeholder="Enter code"
                      style={{
                        background: '#1f1f28',
                        border: '1px solid #6c47ff',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveAccessCode}
                      style={{ background: '#6c47ff', border: 'none', borderRadius: '4px', padding: '2px 6px', color: '#fff' }}
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#ffffff' }}>{profile.accessCode}</strong>
                    <button
                      type="button"
                      onClick={() => setIsEditingAccessCode(true)}
                      style={{ background: 'transparent', border: 'none', color: '#7a7a88', cursor: 'pointer' }}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Pre-Generated Notes Card */}
            <div
              style={{
                background: '#16161b',
                border: '1px solid #242430',
                borderRadius: '20px',
                padding: '22px 24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    margin: 0,
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                  }}
                >
                  Pre-Generated Notes
                </h4>
                <Sparkles size={18} style={{ color: '#a855f7' }} />
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#8e8e9c', lineHeight: 1.5 }}>
                Instantly access curated study materials across multiple subjects. Perfect for quick learning and exam preparation.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '16px',
                    background: '#281c44',
                    color: '#c4b5fd',
                    border: '1px solid #3c2a68'
                  }}
                >
                  AP classes
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '16px',
                    background: '#1e2448',
                    color: '#a5b4fc',
                    border: '1px solid #2d366c'
                  }}
                >
                  Expert Curated
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '16px',
                    background: '#251b3d',
                    color: '#d8b4fe',
                    border: '1px solid #3d2b64'
                  }}
                >
                  Ready to Study
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLibrary();
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '12px',
                  background: '#202029',
                  border: '1px solid #2d2d3a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#282834')}
                onMouseLeave={e => (e.currentTarget.style.background = '#202029')}
              >
                <span>Explore Library</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 3. Draft Uploads Card */}
            <div
              style={{
                background: '#16161b',
                border: '1px solid #242430',
                borderRadius: '20px',
                padding: '22px 24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    margin: 0,
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                  }}
                >
                  Draft Uploads
                </h4>
                <Mic size={18} style={{ color: '#a855f7' }} />
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#8e8e9c', lineHeight: 1.5 }}>
                Recordings that never became a lesson. The audio is safe — play it, download it, or recover interrupted recordings.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDraftUploads();
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '12px',
                  background: '#202029',
                  border: '1px solid #2d2d3a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#282834')}
                onMouseLeave={e => (e.currentTarget.style.background = '#202029')}
              >
                <span>View Draft Uploads</span>
              </button>
            </div>

            {/* Footer Support Notice */}
            <div style={{ textAlign: 'center', paddingTop: '4px', fontSize: '12px', color: '#7a7a88' }}>
              Need assistance? Contact our support team{' '}
              <a
                href="mailto:support@blastai.com"
                style={{
                  color: '#a855f7',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginLeft: '4px'
                }}
              >
                support@blastai.com &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
