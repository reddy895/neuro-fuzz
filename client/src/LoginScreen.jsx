import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Shield, HeartPulse, Zap } from "lucide-react";

// ── GLITCH TEXT HOOK ──────────────────────────────────────────
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&ABCDEFabcdef0123456789";
function useGlitchText(original, interval = 4000) {
  const [text, setText] = useState(original);
  useEffect(() => {
    let timeout;
    const glitch = () => {
      let iter = 0;
      const max = original.length * 3;
      const t = setInterval(() => {
        setText(
          original.split("").map((ch, i) => {
            if (i < iter / 3) return original[i];
            return ch === " " ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }).join("")
        );
        iter++;
        if (iter > max) { clearInterval(t); setText(original); timeout = setTimeout(glitch, interval); }
      }, 40);
    };
    timeout = setTimeout(glitch, 1200);
    return () => clearTimeout(timeout);
  }, [original, interval]);
  return text;
}

// ── MAGNETIC BUTTON ───────────────────────────────────────────
function MagneticButton({ children, onClick, disabled, style, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button ref={ref} style={{ ...style, x: sx, y: sy }}
      className={className} onClick={onClick} disabled={disabled}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}>
      {children}
    </motion.button>
  );
}

// ── PULSE RINGS ───────────────────────────────────────────────
function PulseRings({ color }) {
  return (
    <div style={{ position: "absolute", inset: -60, pointerEvents: "none", zIndex: 0 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1px solid ${color}`,
            margin: `${i * 28}px`,
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.4, delay: i * 0.7, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── ECG LINE SVG ──────────────────────────────────────────────
function EcgLine({ color }) {
  const pathRef = useRef(null);
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = ((ts - start) / 2000) % 1;
      el.style.strokeDashoffset = len * (1 - p);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);
  return (
    <svg viewBox="0 0 300 40" style={{ width: "100%", height: 40, opacity: 0.25 }}>
      <path ref={pathRef}
        d="M0,20 L40,20 L50,5 L60,35 L70,5 L80,20 L120,20 L130,8 L140,32 L150,8 L160,20 L200,20 L210,5 L220,35 L230,5 L240,20 L300,20"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── MAIN LOGIN SCREEN ─────────────────────────────────────────
export default function LoginScreen({ onLogin }) {
  const title = useGlitchText("NEUROFUZZ AI");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const VALID = { user: "admin", pass: "aegis123" };

  const handleLogin = async () => {
    if (loading) return;
    if (user === VALID.user && pass === VALID.pass) {
      setLoading(true);
      setError("");
      await new Promise(r => setTimeout(r, 1200));
      onLogin();
    } else {
      setShake(true);
      setError("Invalid credentials — access denied");
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#F4F6F3", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        backgroundImage: "radial-gradient(ellipse at 30% 40%, rgba(26,122,74,0.12) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(247,231,206,0.05) 0%, transparent 50%)",
      }}>

      {/* ECG background lines */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[15, 35, 55, 75].map(top => (
          <div key={top} style={{ position: "absolute", top: `${top}%`, left: 0, right: 0 }}>
            <EcgLine color="#1A7A4A" />
          </div>
        ))}
      </div>

      {/* Login card */}
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative", width: 400, padding: "44px 40px",
          background: "rgba(255,255,255,0.9)", borderRadius: 20,
          border: "1px solid rgba(26,122,74,0.15)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(26,122,74,0.15), 0 24px 80px rgba(0,0,0,0.05)",
          zIndex: 1,
        }}>

        {/* Pulse rings around card */}
        <PulseRings color="rgba(78,158,106,0.5)" />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(78,158,106,0.3)", "0 0 40px rgba(78,158,106,0.6)", "0 0 20px rgba(78,158,106,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #1A7A4A, #374151)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Shield size={30} color="#F4F6F3" />
          </motion.div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 4px", letterSpacing: 3, fontFamily: "JetBrains Mono, monospace" }}>
            {title}
          </h1>
          <p style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: 3 }}>
            Healthcare Security Platform
          </p>

          {/* ECG subtitle line */}
          <div style={{ marginTop: 12 }}>
            <EcgLine color="#111827" />
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gap: 14, marginBottom: 20, position: "relative", zIndex: 1 }}>
          {[
            { label: "Username", value: user, set: setUser, type: "text",     placeholder: "admin" },
            { label: "Password", value: pass, set: setPass, type: "password", placeholder: "••••••••" },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type} value={f.value} placeholder={f.placeholder}
                onChange={e => f.set(e.target.value)} onKeyDown={handleKey}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
                  background: "rgba(0,0,0,0.04)", border: "1px solid rgba(26,122,74,0.15)",
                  color: "#111827", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(78,158,106,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(26,122,74,0.15)"}
              />
            </div>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: 11, color: "#DC2626", marginBottom: 14, textAlign: "center", fontWeight: 600, position: "relative", zIndex: 1 }}>
              ⚠ {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Login button */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <MagneticButton onClick={handleLogin} disabled={loading}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 800,
              background: loading ? "rgba(0,0,0,0.04)" : "linear-gradient(135deg, #1A7A4A, #22A05A)",
              color: loading ? "rgba(255,255,255,0.3)" : "#F4F6F3",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Zap size={16} />
                </motion.div>
                Authenticating...
              </>
            ) : (
              <><Shield size={16} /> Access Platform</>
            )}
          </MagneticButton>
        </div>

        {/* Demo hint */}
        <p style={{ fontSize: 10, color: "#374151", textAlign: "center", marginTop: 16, position: "relative", zIndex: 1 }}>
          Demo: <span style={{ color: "#374151", fontFamily: "monospace" }}>admin / aegis123</span>
        </p>
      </motion.div>
    </motion.div>
  );
}








