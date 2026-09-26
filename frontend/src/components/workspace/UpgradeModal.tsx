import React, { useState } from 'react';
import { UserProfile, saveStoredProfile } from '../../services/auth';
import { X, Sparkles, Check, Zap, Crown, ShieldCheck } from 'lucide-react';

interface UpgradeModalProps {
  profile: UserProfile;
  onClose: () => void;
  onPlanUpgraded: (updated: UserProfile) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  profile,
  onClose,
  onPlanUpgraded
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  function handleUpgrade() {
    const updated: UserProfile = {
      ...profile,
      plan: 'Pro'
    };
    saveStoredProfile(updated);
    onPlanUpgraded(updated);
    onClose();
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
        className="blast-upgrade-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        style={{
          width: '100%',
          maxWidth: '820px',
          background: '#121215',
          borderRadius: '24px',
          border: '1px solid #24242e',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 55px rgba(229, 168, 59, 0.15)',
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
            padding: '26px 30px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1f1f28'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #e5a83b 0%, #d4973b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Crown size={18} />
              </div>
              <h2
                id="upgrade-title"
                style={{
                  fontSize: '23px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#ffffff',
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                }}
              >
                Upgrade to Blast AI Pro
              </h2>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#8e8e9c' }}>
              Supercharge your studying with frontier reasoning models, unlimited notes, and instant lecture audio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upgrade dialog"
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
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Billing Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 6px 0' }}>
          <div
            style={{
              background: '#18181e',
              border: '1px solid #262632',
              borderRadius: '30px',
              padding: '3px',
              display: 'inline-flex',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                background: billingCycle === 'monthly' ? '#6c47ff' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : '#8e8e9c',
                border: 'none',
                borderRadius: '24px',
                padding: '6px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              style={{
                background: billingCycle === 'yearly' ? '#6c47ff' : 'transparent',
                color: billingCycle === 'yearly' ? '#ffffff' : '#8e8e9c',
                border: 'none',
                borderRadius: '24px',
                padding: '6px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Yearly</span>
              <span style={{ fontSize: '10px', background: '#22c55e', color: '#000', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                SAVE 34%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            padding: '16px 30px 28px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}
        >
          {/* Starter Plan */}
          <div
            style={{
              background: '#16161b',
              border: profile.plan === 'Starter' ? '1px solid #363644' : '1px solid #242430',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: "'Space Grotesk', -apple-system, sans-serif" }}>Starter</h3>
                {profile.plan === 'Starter' && (
                  <span style={{ fontSize: '11px', background: '#262634', color: '#a0a0b2', padding: '3px 9px', borderRadius: '12px', fontWeight: 600 }}>
                    Current Plan
                  </span>
                )}
              </div>
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800 }}>$0</span>
                <span style={{ fontSize: '13px', color: '#8e8e9c' }}> / forever</span>
              </div>
              <p style={{ fontSize: '13px', color: '#8e8e9c', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                Essential AI study tools to organize notes and get started.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#d0d0dc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span>5 AI generations per day</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span>Interactive Flashcards & Quizzes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span>Standard Document Uploads (up to 10MB)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span>Basic Audio Lecture Transcription</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              style={{
                marginTop: '24px',
                padding: '11px',
                borderRadius: '12px',
                background: '#22222a',
                border: '1px solid #30303c',
                color: '#8e8e9c',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'default'
              }}
            >
              {profile.plan === 'Starter' ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Blast Pro Plan */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1b172a 0%, #151320 100%)',
              border: '2px solid #8c66da',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 30px rgba(108, 71, 255, 0.25)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: "'Space Grotesk', -apple-system, sans-serif" }}>Blast AI Pro</h3>
                  <Zap size={16} style={{ color: '#e5a83b' }} />
                </div>
                <span style={{ fontSize: '11px', background: 'linear-gradient(135deg, #e5a83b 0%, #d4973b 100%)', color: '#000', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  POPULAR
                </span>
              </div>
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
                  {billingCycle === 'monthly' ? '$9.99' : '$6.58'}
                </span>
                <span style={{ fontSize: '13px', color: '#8e8e9c' }}>
                  {billingCycle === 'monthly' ? ' / month' : ' / month (billed $79/yr)'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#c4b5fd', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                Frontier AI study partner with unlimited intelligence and instant learning.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                  <strong>Unlimited AI Generations</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                  <span>Frontier Reasoning Models (Grok 4.6 & GLM 5)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                  <span>Full Textbook & PDF Analysis (up to 50MB)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                  <span>Unlimited High-Accuracy Audio Transcription</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                  <span>Interactive Code Walkthroughs & Mind Maps</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                  <span>Priority Speed & 24/7 Student Support</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUpgrade}
              style={{
                marginTop: '24px',
                padding: '12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6c47ff 0%, #8c66da 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(108, 71, 255, 0.45)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <Sparkles size={16} />
              <span>{profile.plan === 'Pro' ? 'Manage Pro Plan' : 'Upgrade to Blast Pro'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
