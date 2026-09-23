import React, { useEffect, useRef, useId } from 'react';
import gsap from 'gsap';

export interface GlowingFireLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showGlow?: boolean;
  interactive?: boolean;
}

export const GlowingFireLogo: React.FC<GlowingFireLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = true,
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerFlameRef = useRef<SVGPathElement>(null);
  const midFlameRef = useRef<SVGPathElement>(null);
  const coreFlameRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sparkRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');

  const sizeMap: Record<string, number> = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 84,
    xl: 120
  };

  const px = typeof size === 'number' ? size : sizeMap[size] || 48;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Ambient Glow Pulsing
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.3,
          opacity: 0.9,
          duration: 1.3,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }

      // 2. Outer Flame Flickering & Dancing
      if (outerFlameRef.current) {
        gsap.to(outerFlameRef.current, {
          scaleY: 1.1,
          scaleX: 0.93,
          skewX: -3,
          transformOrigin: '50% 100%',
          duration: 0.65,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to(outerFlameRef.current, {
          skewX: 3.5,
          duration: 1.05,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // 3. Mid Flame Movement
      if (midFlameRef.current) {
        gsap.to(midFlameRef.current, {
          scaleY: 1.14,
          scaleX: 0.91,
          transformOrigin: '50% 100%',
          duration: 0.48,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 0.08
        });

        gsap.to(midFlameRef.current, {
          skewX: -4,
          duration: 0.85,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // 4. White-Hot Core High-Frequency Micro-Flicker
      if (coreFlameRef.current) {
        gsap.to(coreFlameRef.current, {
          scaleY: 1.18,
          scaleX: 0.88,
          opacity: 0.98,
          transformOrigin: '50% 100%',
          duration: 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: 0.04
        });
      }

      // 5. Rising Ember Sparks with Randomized Physics
      sparkRefs.current.forEach((spark, index) => {
        if (!spark) return;
        const dur = 1.1 + (index % 3) * 0.35;
        const xOffset = ((index % 2 === 0 ? 1 : -1) * (10 + (index * 5)));

        gsap.fromTo(
          spark,
          {
            y: 0,
            x: 0,
            scale: 0.9,
            opacity: 0.95
          },
          {
            y: -px * 0.85,
            x: xOffset,
            scale: 0.15,
            opacity: 0,
            duration: dur,
            repeat: -1,
            ease: 'power1.out',
            delay: index * 0.25
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [px]);

  const outerGradId = `outerFlameGrad_${uid}`;
  const midGradId = `midFlameGrad_${uid}`;
  const coreGradId = `coreFlameGrad_${uid}`;
  const sparkGradId = `sparkGrad_${uid}`;
  const glowFilterId = `fireGlow_${uid}`;

  return (
    <div
      ref={containerRef}
      style={{ width: px, height: px }}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Dynamic Radial Ambient Heat Glow */}
      {showGlow && (
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 80, 0, 0.6) 0%, rgba(255, 160, 0, 0.3) 50%, transparent 75%)',
            transform: 'scale(1)'
          }}
        />
      )}

      {/* SVG Realistic Glowing Flame */}
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full relative z-10 drop-shadow-[0_0_14px_rgba(255,100,0,0.85)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Flame Gradients */}
          <linearGradient id={outerGradId} x1="50" y1="110" x2="50" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7A0000" />
            <stop offset="20%" stopColor="#C81E00" />
            <stop offset="55%" stopColor="#FF4F00" />
            <stop offset="85%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#FFDC33" />
          </linearGradient>

          <linearGradient id={midGradId} x1="50" y1="105" x2="50" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF3300" />
            <stop offset="40%" stopColor="#FF7700" />
            <stop offset="80%" stopColor="#FFC200" />
            <stop offset="100%" stopColor="#FFEC55" />
          </linearGradient>

          <linearGradient id={coreGradId} x1="50" y1="100" x2="50" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA500" />
            <stop offset="45%" stopColor="#FFF277" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Ember Spark Gradient */}
          <radialGradient id={sparkGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FFEE66" />
            <stop offset="75%" stopColor="#FF4900" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Glow Filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Flame Tongue */}
        <path
          ref={outerFlameRef}
          d="M50 8C50 8 62 26 62 42C62 48 59 53 56 56C64 48 68 40 68 34C78 48 82 66 79 80C76 96 64 108 50 110C36 108 24 96 21 80C18 66 22 48 32 34C32 40 36 48 44 56C41 53 38 48 38 42C38 26 50 8 50 8Z"
          fill={`url(#${outerGradId})`}
          filter={`url(#${glowFilterId})`}
        />

        {/* 2. Mid Warm Flame Tongue */}
        <path
          ref={midFlameRef}
          d="M50 28C50 28 58 40 58 52C58 57 55 61 53 64C59 58 62 52 62 48C69 58 72 72 70 82C68 94 59 104 50 105C41 104 32 94 30 82C28 72 31 58 38 48C38 52 41 58 47 64C45 61 42 57 42 52C42 40 50 28 50 28Z"
          fill={`url(#${midGradId})`}
        />

        {/* 3. White-Hot Intense Core */}
        <path
          ref={coreFlameRef}
          d="M50 52C50 52 55 60 55 68C55 72 53 75 52 77C56 73 58 69 58 66C62 73 64 82 62 89C61 96 55 101 50 102C45 101 39 96 38 89C36 82 38 73 42 66C42 69 44 73 48 77C47 75 45 72 45 68C45 60 50 52 50 52Z"
          fill={`url(#${coreGradId})`}
        />

        {/* 4. Rising Glowing Embers / Sparks */}
        <circle
          ref={(el) => (sparkRefs.current[0] = el)}
          cx="48"
          cy="45"
          r="2.5"
          fill={`url(#${sparkGradId})`}
        />
        <circle
          ref={(el) => (sparkRefs.current[1] = el)}
          cx="54"
          cy="38"
          r="2"
          fill={`url(#${sparkGradId})`}
        />
        <circle
          ref={(el) => (sparkRefs.current[2] = el)}
          cx="44"
          cy="32"
          r="1.8"
          fill={`url(#${sparkGradId})`}
        />
        <circle
          ref={(el) => (sparkRefs.current[3] = el)}
          cx="52"
          cy="24"
          r="2.2"
          fill={`url(#${sparkGradId})`}
        />
      </svg>
    </div>
  );
};

export default GlowingFireLogo;
