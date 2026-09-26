"use client";

import React, { useEffect, useRef, useState } from 'react';
import { signInWithGoogle, signInWithGitHub, signInWithApple, signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '@/services/supabase';

interface ModernLoginSignupProps {
  onSuccess?: (user?: any) => void;
  onCancel?: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function Component({ onSuccess, onCancel, defaultMode = 'login' }: ModernLoginSignupProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    let active = true;
    let renderer: any;
    let geometry: any;
    let material: any;
    let scene: any;
    let camera: any;
    let animationId: number;

    const initThree = (THREE: any) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // Light background with charcoal/purple matrix dots matching reference Image 2
      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
        u_opacities: { value: [0.12, 0.22, 0.32, 0.45, 0.6, 0.72, 0.82, 0.9, 0.96, 1.0] },
        u_colors: { value: [
          new THREE.Vector3(0.04, 0.04, 0.06),
          new THREE.Vector3(0.12, 0.10, 0.16),
          new THREE.Vector3(0.18, 0.15, 0.24),
          new THREE.Vector3(0.08, 0.07, 0.12),
          new THREE.Vector3(0.14, 0.12, 0.20),
          new THREE.Vector3(0.02, 0.02, 0.03)
        ] },
        u_total_size: { value: 16.0 * dpr },
        u_dot_size: { value: 3.8 * dpr },
        u_reverse: { value: 0 }
      };

      material = new THREE.ShaderMaterial({
        vertexShader: `
          precision highp float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: `
          precision highp float;
          in vec2 fragCoord;

          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;

          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
              return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
              vec2 st = fragCoord.xy;
              st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
              st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

              float inside = step(0.0, st.x) * step(0.0, st.y);
              vec2 st2 = floor(st / u_total_size);

              float frequency = 4.5;
              float show_offset = random(st2);
              float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
              
              int opIndex = clamp(int(rand * 10.0), 0, 9);
              float opacity = inside * u_opacities[opIndex];
              
              vec2 cellFract = fract(st / u_total_size);
              float inDotX = 1.0 - step(u_dot_size / u_total_size, cellFract.x);
              float inDotY = 1.0 - step(u_dot_size / u_total_size, cellFract.y);
              opacity *= (inDotX * inDotY);

              int colIndex = clamp(int(show_offset * 6.0), 0, 5);
              vec3 color = u_colors[colIndex];

              float animation_speed_factor = 2.5;
              vec2 center_grid = (u_resolution * 0.5) / u_total_size;
              float dist_from_center = distance(center_grid, st2);

              float current_timing_offset = dist_from_center * 0.012 + (random(st2) * 0.15);
              opacity *= step(current_timing_offset, u_time * animation_speed_factor);

              fragColor = vec4(color * opacity, opacity);
          }
        `,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const startTime = performance.now();
      const animate = () => {
        if (!active) return;
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!renderer || !canvasRef.current) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setSize(w, h);
        uniforms.u_resolution.value.set(w * ratio, h * ratio);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    // Dynamically load Three.js via script tag to avoid bundler import errors
    if ((window as any).THREE) {
      const cleanUp = initThree((window as any).THREE);
      return () => {
        active = false;
        if (cleanUp) cleanUp();
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
      };
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).THREE) {
          initThree((window as any).THREE);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  /* ─── Handlers for Supabase & Google Authentication ─── */
  const handleGoogleAuth = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Connecting to Google Authentication...', type: 'info' });
        if (!isSupabaseConfigured) {
          setTimeout(() => {
            try {
              localStorage.setItem('blast_display_name', JSON.stringify('Google Scholar'));
            } catch {}
            if (onSuccess) onSuccess({ email: 'user@gmail.com', name: 'Google Scholar' });
            else window.location.href = '/dashboard';
          }, 800);
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Could not connect to Google auth', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Connecting to GitHub...', type: 'info' });
        if (!isSupabaseConfigured) {
          setTimeout(() => {
            try {
              localStorage.setItem('blast_display_name', JSON.stringify('GitHub Explorer'));
            } catch {}
            if (onSuccess) onSuccess({ email: 'user@github.com', name: 'GitHub Explorer' });
            else window.location.href = '/dashboard';
          }, 800);
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'GitHub authentication error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await signInWithApple();
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Connecting to Apple ID...', type: 'info' });
        if (!isSupabaseConfigured) {
          setTimeout(() => {
            try {
              localStorage.setItem('blast_display_name', JSON.stringify('Apple Scholar'));
            } catch {}
            if (onSuccess) onSuccess({ email: 'user@apple.com', name: 'Apple Scholar' });
            else window.location.href = '/dashboard';
          }, 800);
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Apple authentication error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);
    try {
      if (isLogin) {
        const { error, message: msg } = await signInWithEmail(email);
        if (error) {
          setMessage({ text: error.message, type: 'error' });
        } else {
          setMessage({ text: msg || 'Welcome back! You are now signed in.', type: 'success' });
          try {
            const shortName = email.split('@')[0];
            localStorage.setItem('blast_display_name', JSON.stringify(shortName));
          } catch {}
          setTimeout(() => {
            if (onSuccess) onSuccess({ email, name: email.split('@')[0] });
            else window.location.href = '/dashboard';
          }, 600);
        }
      } else {
        const { error, message: msg } = await signUpWithEmail(email, name);
        if (error) {
          setMessage({ text: error.message, type: 'error' });
        } else {
          setMessage({ text: msg || 'Account created! Welcome to Blast AI.', type: 'success' });
          try {
            localStorage.setItem('blast_display_name', JSON.stringify(name || email.split('@')[0]));
          } catch {}
          setTimeout(() => {
            if (onSuccess) onSuccess({ email, name: name || email.split('@')[0] });
            else window.location.href = '/dashboard';
          }, 600);
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ─── shared button & input styles matching reference Image 2 ─── */
  const socialBtn: React.CSSProperties = {
    width: "100%",
    padding: "0.68rem 1rem",
    borderRadius: 8,
    border: "1px solid #27272a",
    background: "#16161a",
    color: "#f4f4f5",
    fontWeight: 500,
    fontSize: "0.875rem",
    cursor: loading ? "wait" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.65rem",
    marginBottom: "0.55rem",
    transition: "all 0.15s ease",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "0.72rem 0.95rem",
    borderRadius: 8,
    border: "1px solid #27272a",
    background: "#09090b",
    color: "#ffffff",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  /* ─── Google / GitHub / Apple SVGs ─── */
  const GoogleIcon = (
    <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const GitHubIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17, flexShrink: 0 }}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  );

  const AppleIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17, flexShrink: 0 }}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.56.04 2.88.75 3.65 1.89-3.08 1.75-2.58 5.61.35 6.75-1.01 2.37-2.39 4.39-4.29 4.29zM12.03 7.25c-.15-2.23 1.66-4.07 3.72-4.25.36 2.38-1.92 4.34-3.72 4.25z"/>
    </svg>
  );

  /* ─── Blast Kitty Hero Avatar with Glowing Violet Frame ─── */
  const KittyLogo = (
    <div style={{
      width: 76,
      height: 76,
      borderRadius: 22,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1rem",
      boxShadow: "0 0 35px rgba(168, 85, 247, 0.55), 0 8px 16px rgba(0, 0, 0, 0.4)",
      border: "2px solid rgba(192, 132, 252, 0.55)",
      background: "linear-gradient(135deg, #2b1f47 0%, #151026 100%)",
      position: "relative"
    }}>
      <img
        src="/blast-kitty.png"
        alt="Blast AI Kitty"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    </div>
  );

  const Footer = (
    <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: "#71717a", lineHeight: 1.5, textAlign: "center" }}>
      By proceeding, you agree to creating a Blast AI account<br/>subject to our{" "}
      <a href="#" style={{ color: "#a1a1aa", textDecoration: "underline" }}>Terms of Service</a> and{" "}
      <a href="#" style={{ color: "#a1a1aa", textDecoration: "underline" }}>Privacy Policy</a>.
    </div>
  );

  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      background: "#ffffff",
      color: "#ffffff",
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* WebGL Animated Matrix Dot Canvas matching Image 2 */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      {/* Optional Cancel/Close Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: 24,
            right: 28,
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            color: "#3f3f46",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            fontSize: "1.2rem",
            lineHeight: 1
          }}
          aria-label="Close"
        >
          ×
        </button>
      )}

      {/* Modal Card with Radiant Violet Glow from Reference Image 2 */}
      <div style={{
        position: "relative",
        zIndex: 2,
        background: "#121214",
        borderRadius: 22,
        padding: "2.35rem 2.15rem",
        width: "100%",
        maxWidth: 410,
        boxShadow: "0 0 65px -10px rgba(140, 102, 218, 0.45), 0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid rgba(255, 255, 255, 0.08)"
      }}>
        {KittyLogo}

        {isLogin ? (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.38rem", fontWeight: 600, marginBottom: "0.25rem", letterSpacing: "-0.025em", color: "#ffffff" }}>
              Sign in to Account
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "1.1rem", lineHeight: 1.5 }}>
              Sign in to your Account.
            </p>

            {message && (
              <div style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: 8,
                marginBottom: "0.85rem",
                fontSize: "0.8rem",
                textAlign: "left",
                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                color: message.type === 'error' ? '#fca5a5' : '#d8b4fe',
                border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <input
                style={input}
                type="email"
                placeholder="name@work-email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.72rem",
                  borderRadius: 8,
                  border: "none",
                  background: "#f4f4f5",
                  color: "#09090b",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: loading ? "wait" : "pointer"
                }}
              >
                {loading ? "Signing in..." : "Continue with Email"}
              </button>
            </form>

            <div style={{ height: 1, background: "#27272a", width: "100%", margin: "1rem 0" }} />

            <button type="button" onClick={handleGoogleAuth} style={socialBtn}>
              {GoogleIcon}Continue with Google
            </button>
            <button type="button" onClick={handleGitHubAuth} style={socialBtn}>
              {GitHubIcon}Continue with GitHub
            </button>
            <button type="button" onClick={handleAppleAuth} style={{ ...socialBtn, marginBottom: 0 }}>
              {AppleIcon}Continue with Apple
            </button>

            <div style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setMessage(null); }}
                style={{ color: "#ffffff", fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Sign Up
              </button>
            </div>
            {Footer}
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.38rem", fontWeight: 600, marginBottom: "0.25rem", letterSpacing: "-0.025em", color: "#ffffff" }}>
              Sign up for Account
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "1.1rem", lineHeight: 1.5 }}>
              Create a new account to get started.
            </p>

            {message && (
              <div style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: 8,
                marginBottom: "0.85rem",
                fontSize: "0.8rem",
                textAlign: "left",
                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                color: message.type === 'error' ? '#fca5a5' : '#d8b4fe',
                border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <input
                style={input}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                style={input}
                type="email"
                placeholder="name@work-email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.72rem",
                  borderRadius: 8,
                  border: "none",
                  background: "#f4f4f5",
                  color: "#09090b",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: loading ? "wait" : "pointer"
                }}
              >
                {loading ? "Creating account..." : "Sign Up with Email"}
              </button>
            </form>

            <div style={{ height: 1, background: "#27272a", width: "100%", margin: "1rem 0" }} />

            <button type="button" onClick={handleGoogleAuth} style={socialBtn}>
              {GoogleIcon}Sign up with Google
            </button>
            <button type="button" onClick={handleGitHubAuth} style={socialBtn}>
              {GitHubIcon}Sign up with GitHub
            </button>
            <button type="button" onClick={handleAppleAuth} style={{ ...socialBtn, marginBottom: 0 }}>
              {AppleIcon}Sign up with Apple
            </button>

            <div style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setMessage(null); }}
                style={{ color: "#ffffff", fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Sign In
              </button>
            </div>
            {Footer}
          </div>
        )}
      </div>
    </div>
  );
}
