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
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
        No flashcard items generated.
      </div>
    );
  }

  const isMastered = masteredIds.has(currentCard?.id);
  const progressPct = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={15} color="var(--color-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
            Card {currentIndex + 1} of {deck.length}
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '999px',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              color: 'var(--color-primary)',
              fontWeight: 800
            }}
          >
            {masteredIds.size} Mastered
          </span>
        </div>

        <button
          onClick={handleShuffle}
          title="Shuffle Deck"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Shuffle size={11} />
          <span>Shuffle</span>
        </button>
      </div>

      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-border-subtle)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          minHeight: '160px',
          perspective: '1000px',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: '160px',
            backgroundColor: isFlipped ? 'var(--color-surface-hover)' : 'var(--color-surface)',
            border: isMastered ? '2px solid #10B981' : '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 14px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.3s ease, background-color 0.2s',
            transform: isFlipped ? 'scale(1.01)' : 'scale(1)'
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
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: isFlipped ? 'var(--color-primary)' : 'var(--color-accent)',
                letterSpacing: '0.05em'
              }}
            >
              {isFlipped ? 'Answer & Explanation' : 'Concept Question'}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                color: 'var(--color-text-muted)'
              }}
            >
              <RotateCw size={11} /> Flip
            </span>
          </div>

          <div style={{ textAlign: 'center', padding: '14px 4px' }}>
            <p
              style={{
                fontSize: isFlipped ? '13.5px' : '14.5px',
                fontWeight: isFlipped ? 500 : 700,
                color: 'var(--color-text)',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Card {currentIndex + 1} of {deck.length}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          gap: '8px'
        }}
      >
        <button
          onClick={handlePrev}
          title="Previous Card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        <button
          onClick={() => toggleMastery(currentCard.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isMastered ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface)',
            border: isMastered ? '1.5px solid #10B981' : '1px solid var(--color-border)',
            color: isMastered ? '#059669' : 'var(--color-text)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isMastered ? <CheckCircle size={13} color="#10B981" /> : <HelpCircle size={13} />}
          <span>{isMastered ? 'Mastered' : 'Mark Learned'}</span>
        </button>

        <button
          onClick={handleNext}
          title="Next Card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
