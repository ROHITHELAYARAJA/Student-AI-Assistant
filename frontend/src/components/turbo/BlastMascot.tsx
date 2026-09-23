import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export type BlastMascotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'processing'
  | 'speaking'
  | 'happy'
  | 'success'
  | 'error'
  | 'excited'
  | 'greeting'
  | 'empty_state'
  | 'waiting';

export type MascotState = BlastMascotState;

export interface BlastMascotProps {
  state?: BlastMascotState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  mood?: 'neutral' | 'curious' | 'celebrating' | 'playful';
  context?: 'chat' | 'onboarding' | 'empty_state' | 'celebration' | 'milestone' | 'inline';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const BlastMascot: React.FC<BlastMascotProps> = ({
  state = 'idle',
  size = 'md',
  mood = 'neutral',
  context = 'inline',
  className = '',
  onClick,
  interactive = true
}) => {
  const [internalState, setInternalState] = useState<BlastMascotState>(state);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const blinkTimerRef = useRef<any>(null);
  const speechTimerRef = useRef<any>(null);

  // Sync external state changes
  useEffect(() => {
    setInternalState(state);
    if (state === 'success') {
      triggerSuccessCelebration();
    }
  }, [state]);

  // Periodic natural blinking
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
      blinkTimerRef.current = setTimeout(triggerBlink, 2800 + Math.random() * 3200);
    };

    blinkTimerRef.current = setTimeout(triggerBlink, 2500);
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Speech phoneme mouth animation when speaking
  useEffect(() => {
    if (internalState === 'speaking') {
      speechTimerRef.current = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 140);
    } else {
      setMouthOpen(false);
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    }
    return () => {
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    };
  }, [internalState]);

  // Duolingo-style celebration sequence for success
  const triggerSuccessCelebration = () => {
    setCelebrating(true);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#FF5E00', '#FFAA00', '#FFDD00', '#7C3AED', '#FF3366']
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setCelebrating(false);
    }, 2000);
  };

  const handlePointerEnter = () => {
    if (interactive && internalState === 'idle') {
      setInternalState('happy');
    }
  };

  const handlePointerLeave = () => {
    if (interactive && internalState === 'happy') {
      setInternalState('idle');
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (interactive) {
      triggerSuccessCelebration();
    }
  };

  const sizeMap: Record<string, number> = {
    xs: 24,
    sm: 36,
    md: 52,
    lg: 84,
    xl: 130
  };

  const px = typeof size === 'number' ? size : sizeMap[size] || 52;

  // Determine current active animation state
  const isThinking = internalState === 'thinking';
  const isProcessing = internalState === 'processing';
  const isSpeaking = internalState === 'speaking';
  const isHappy = internalState === 'happy' || celebrating;
  const isError = internalState === 'error';
  const isExcited = internalState === 'excited';
  const isListening = internalState === 'listening';
  const isGreeting = internalState === 'greeting';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      className={`relative inline-flex items-center justify-center shrink-0 select-none cursor-pointer transition-transform duration-300 ${
        celebrating ? 'scale-110 -translate-y-2' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      style={{ width: px, height: px }}
      title={`Blast Mascot (${internalState})`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Flame Gradients */}
          <linearGradient id="blastFlameMain" x1="50" y1="5" x2="50" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF275" />
            <stop offset="0.3" stopColor="#FF9F1C" />
            <stop offset="0.8" stopColor="#FF4000" />
            <stop offset="1" stopColor="#D90429" />
          </linearGradient>

          <linearGradient id="blastHandFire" x1="75" y1="35" x2="88" y2="65" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF75E" />
            <stop offset="0.4" stopColor="#FF8500" />
            <stop offset="0.9" stopColor="#FF2A00" />
          </linearGradient>

          <linearGradient id="blastFurCrimson" x1="20" y1="20" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8C1D2F" />
            <stop offset="0.5" stopColor="#671120" />
            <stop offset="1" stopColor="#430713" />
          </linearGradient>

          <linearGradient id="blastBellyWhite" x1="50" y1="45" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.85" stopColor="#F1F3F5" />
            <stop offset="1" stopColor="#E2E6EA" />
          </linearGradient>

          <linearGradient id="blastChestStar" x1="45" y1="55" x2="55" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD166" />
            <stop offset="0.5" stopColor="#FF8500" />
            <stop offset="1" stopColor="#FF2A00" />
          </linearGradient>

          <radialGradient id="blastAuraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8500" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#FF3800" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Fire Aura Glow */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#blastAuraGlow)"
          className={isProcessing || celebrating ? 'animate-pulse' : ''}
        />

        {/* Floating Sparks / Embers for Celebration & Processing */}
        {(celebrating || isProcessing || isExcited) && (
          <g className="animate-ping" style={{ animationDuration: '1.2s' }}>
            <circle cx="82" cy="28" r="2.5" fill="#FFE600" />
            <circle cx="22" cy="24" r="1.8" fill="#FF5E00" />
            <circle cx="78" cy="16" r="1.5" fill="#FFAA00" />
            <circle cx="16" cy="46" r="2" fill="#FFDD00" />
          </g>
        )}

        {/* Ears */}
        {/* Left Ear */}
        <circle cx="28" cy="28" r="13" fill="url(#blastFurCrimson)" />
        <path d="M25 24 Q30 18 35 24 Q30 32 25 24 Z" fill="url(#blastFlameMain)" />

        {/* Right Ear */}
        <circle cx="72" cy="28" r="13" fill="url(#blastFurCrimson)" />
        <path d="M65 24 Q70 18 75 24 Q70 32 65 24 Z" fill="url(#blastFlameMain)" />

        {/* Fiery Hair Crest on Head (Living Moving Flame) */}
        <g
          className={
            celebrating
              ? 'animate-bounce'
              : isThinking
              ? 'animate-pulse'
              : ''
          }
          style={{ transformOrigin: '50px 25px' }}
        >
          {/* Back Flame Tongue */}
          <path
            d="M50 4 C40 14, 34 26, 42 34 C48 38, 56 36, 58 30 C64 22, 60 12, 50 4 Z"
            fill="#E63946"
            opacity="0.8"
          />
          {/* Main Dancing Flame */}
          <path
            d="M49 6 C42 16, 36 24, 43 32 C47 36, 54 36, 57 28 C61 20, 58 12, 49 6 Z"
            fill="url(#blastFlameMain)"
          />
          {/* Inner Golden Core */}
          <path
            d="M49 13 C45 19, 42 25, 46 29 C48 31, 52 31, 54 26 C56 21, 54 16, 49 13 Z"
            fill="#FFF3B0"
          />
        </g>

        {/* Body Base & Legs */}
        <ellipse cx="50" cy="74" rx="28" ry="20" fill="url(#blastFurCrimson)" />

        {/* Left Leg */}
        <ellipse cx="33" cy="87" rx="9" ry="6" fill="#430713" />
        <path d="M28 89 Q33 87 38 89" stroke="#FF5E00" strokeWidth="1.5" strokeLinecap="round" />

        {/* Right Leg */}
        <ellipse cx="67" cy="87" rx="9" ry="6" fill="#430713" />
        <path d="M62 89 Q67 87 72 89" stroke="#FF5E00" strokeWidth="1.5" strokeLinecap="round" />

        {/* White Belly */}
        <ellipse cx="50" cy="70" rx="19" ry="17" fill="url(#blastBellyWhite)" />

        {/* 4-Point Golden Fire Star Badge on Belly */}
        <g
          className={isProcessing || celebrating ? 'animate-pulse' : ''}
          style={{ transformOrigin: '50px 68px' }}
        >
          <path
            d="M50 60 Q51 66 57 68 Q51 70 50 76 Q49 70 43 68 Q49 66 50 60 Z"
            fill="url(#blastChestStar)"
          />
          <circle cx="50" cy="68" r="2" fill="#FFFFFF" />
        </g>

        {/* Head Base */}
        <circle cx="50" cy="45" r="26" fill="url(#blastBellyWhite)" />

        {/* Crimson Eye Patches (Red Panda / Flame Marks) */}
        <ellipse
          cx="35"
          cy="44"
          rx="10"
          ry="11"
          fill="url(#blastFurCrimson)"
          transform="rotate(-8 35 44)"
        />
        <ellipse
          cx="65"
          cy="44"
          rx="10"
          ry="11"
          fill="url(#blastFurCrimson)"
          transform="rotate(8 65 44)"
        />

        {/* Eyebrows */}
        {isThinking ? (
          <>
            <path d="M30 33 Q36 30 41 35" stroke="#430713" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M59 36 Q64 31 70 33" stroke="#430713" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : isError ? (
          <>
            <path d="M30 36 Q36 33 41 37" stroke="#430713" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M59 34 Q64 36 70 34" stroke="#430713" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          /* Confident, playful brows */
          <>
            <path d="M30 34 Q36 31 41 34" stroke="#430713" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M59 34 Q64 31 70 34" stroke="#430713" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Expressive Living Eyes */}
        {isBlinking ? (
          /* Blinking closed line */
          <>
            <path d="M30 45 Q35 48 40 45" stroke="#1A0307" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M60 45 Q65 48 70 45" stroke="#1A0307" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : isHappy || celebrating ? (
          /* Happy curved anime eyes */
          <>
            <path d="M29 45 Q35 39 41 45" stroke="#1A0307" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M59 45 Q65 39 71 45" stroke="#1A0307" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          /* Big bright eyes with pupil specular reflections */
          <>
            {/* Left Eye White & Iris */}
            <circle cx="35" cy="44" r="6" fill="#1A0307" />
            <circle cx="34" cy="42.5" r="2.2" fill="#FFFFFF" />
            <circle cx="37" cy="45" r="1.1" fill="#FFFFFF" />

            {/* Right Eye White & Iris */}
            <circle cx="65" cy="44" r="6" fill="#1A0307" />
            <circle cx="64" cy="42.5" r="2.2" fill="#FFFFFF" />
            <circle cx="67" cy="45" r="1.1" fill="#FFFFFF" />
          </>
        )}

        {/* Cute Dark Button Nose */}
        <ellipse cx="50" cy="50.5" rx="3.2" ry="2.2" fill="#200408" />

        {/* Expressive Mouth */}
        {isSpeaking ? (
          mouthOpen ? (
            /* Open talking mouth */
            <path d="M45 53 Q50 61 55 53 Z" fill="#D90429" stroke="#671120" strokeWidth="1" />
          ) : (
            /* Closed speaking line */
            <path d="M46 54 Q50 56 54 54" stroke="#671120" strokeWidth="1.8" strokeLinecap="round" />
          )
        ) : isHappy || celebrating || isGreeting ? (
          /* Big joyful open smile */
          <g>
            <path d="M44 52 Q50 60 56 52" fill="#C9184A" stroke="#430713" strokeWidth="1.5" />
            <path d="M46 56 Q50 58 54 56" fill="#FF758F" />
          </g>
        ) : isError ? (
          /* Confused small mouth */
          <path d="M46 56 Q50 53 54 55" stroke="#430713" strokeWidth="2" strokeLinecap="round" />
        ) : (
          /* Cheerful default friendly curve */
          <path d="M46 53 Q50 57 54 53" stroke="#430713" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}

        {/* Arms & Hands */}
        {/* Right Arm (Resting or Waving) */}
        {isGreeting ? (
          <g className="animate-bounce" style={{ transformOrigin: '22px 60px' }}>
            <path d="M28 65 Q18 55 18 46" stroke="url(#blastFurCrimson)" strokeWidth="8" strokeLinecap="round" />
            <circle cx="18" cy="44" r="5" fill="#430713" />
          </g>
        ) : (
          <path d="M28 65 Q20 70 24 78" stroke="url(#blastFurCrimson)" strokeWidth="7" strokeLinecap="round" />
        )}

        {/* Left Arm Conjuring Fire Burst (Signature Blast Move) */}
        <g>
          {/* Arm reaching out */}
          <path d="M72 63 Q82 56 80 48" stroke="url(#blastFurCrimson)" strokeWidth="7" strokeLinecap="round" />
          {/* Paw */}
          <circle cx="78" cy="48" r="5.5" fill="#430713" />

          {/* Swirling Hand Flame Effect */}
          <g
            className={isProcessing || celebrating ? 'animate-spin' : ''}
            style={{ transformOrigin: '82px 42px', animationDuration: '3s' }}
          >
            <path
              d="M78 45 C84 32, 94 36, 88 44 C84 48, 92 54, 84 56 C78 54, 76 48, 78 45 Z"
              fill="url(#blastHandFire)"
            />
            {/* Sparkle Star in Hand Flame */}
            <path
              d="M84 41 L85.5 37 L87 41 L91 42.5 L87 44 L85.5 48 L84 44 L80 42.5 Z"
              fill="#FFFFFF"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
export default BlastMascot;
