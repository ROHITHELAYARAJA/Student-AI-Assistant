import React, { useState } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { FlashcardItem } from '../../types/study.js';

interface FlashcardDeckProps {
  cards: FlashcardItem[];
  title: string;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards, title }) => {
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const currentCard = deck[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setDeck([...deck].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const toggleMastery = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!cards || cards.length === 0) {
    return <div>No flashcard items generated.</div>;
  }

  const isMastered = masteredIds.has(currentCard?.id);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '10px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)' }}>
            {title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-accent)',
              backgroundColor: 'rgba(255, 225, 226, 0.8)',
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid var(--color-border)'
            }}
          >
            {currentIndex + 1} / {deck.length} Cards
          </span>

          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text)'
            }}
          >
            <Shuffle size={13} /> Shuffle
          </button>
        </div>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          minHeight: '260px',
          perspective: '1000px',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            minHeight: '260px',
            backgroundColor: isFlipped ? 'var(--color-surface-hover)' : 'var(--color-surface)',
            border: isMastered ? '2px solid #10B981' : '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s',
            transform: isFlipped ? 'scale(1.02)' : 'scale(1)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: isFlipped ? 'var(--color-primary)' : 'var(--color-accent)',
                letterSpacing: '0.06em'
              }}
            >
              {isFlipped ? 'Reverse / Answer & Details' : 'Front / Concept Query'}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--color-text-muted)'
              }}
            >
              <RotateCw size={13} /> Click card to flip
            </span>
          </div>

          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p
              style={{
                fontSize: isFlipped ? '16px' : '20px',
                fontWeight: isFlipped ? 500 : 700,
                color: 'var(--color-text)',
                lineHeight: 1.6
              }}
            >
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px dashed var(--color-border-subtle)',
              paddingTop: '12px'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMastery(currentCard.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: isMastered ? '#10B981' : 'var(--color-accent)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isMastered ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: '1px solid',
                borderColor: isMastered ? '#10B981' : 'var(--color-border)'
              }}
            >
              <CheckCircle size={14} />
              {isMastered ? 'Mastered!' : 'Mark as Mastered'}
            </button>

            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Mastered: {masteredIds.size} of {deck.length}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '18px'
        }}
      >
        <button
          onClick={handlePrev}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-primary)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          Flip Card Space
        </button>

        <button
          onClick={handleNext}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};
