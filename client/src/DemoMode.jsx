import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Zap, AlertTriangle, Brain, Terminal, Activity, Cpu, HardDrive, Lock } from "lucide-react";

// ── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  cyan: {
    name: "Cyber Cyan", swatch: "#00d4ff",
    primary: "#00d4ff", primaryDim: "#0099bb", primaryGlow: "rgba(0,212,255,0.25)",
    accent: "#00ff88", bg: "#050d12", panel: "rgba(0,20,30,0.9)", border: "rgba(0,212,255,0.2)",
  },
  green: {
    name: "Matrix Green", swatch: "#00ff41",
    primary: "#00ff41", primaryDim: "#00bb30", primaryGlow: "rgba(0,255,65,0.25)",
    accent: "#39ff14", bg: "#020d02", panel: "rgba(0,15,5,0.9)", border: "rgba(0,255,65,0.2)",
  },
  gold: {
    name: "Electric Gold", swatch: "#ffd700",
    primary: "#ffd700", primaryDim: "#cc9900", primaryGlow: "rgba(255,215,0,0.25)",
    accent: "#ff9500", bg: "#0d0a00", panel: "rgba(20,15,0,0.9)", border: "rgba(255,215,0,0.2)",
  },
  pink: {
    name: "Neon Pink", swatch: "#ff2d78",
    primary: "#ff2d78", primaryDim: "#cc1155", primaryGlow: "rgba(255,45,120,0.25)",
    accent: "#ff00ff", bg: "#0d0008", panel: "rgba(20,0,12,0.9)", border: "rgba(255,45,120,0.2)",
  },
};

// ── TERMINAL LINES ────────────────────────────────────────────────────────────
const TERMINAL_SCRIPT = [
  { t: "INFO",     msg: "AegisFuzz AI v3.1 — Healthcare Security Platform initialised" },
  { t: "INFO",     msg: "Loading seed corpus: 1,847 medical-domain payloads" },
  { t: "INFO",     msg: "Target: pacemaker_v3.2.1.bin (ARM Cortex-M4, 512 KB)" },
  { t: "INFO",     msg: "QEMU sandbox spawned — PID 14821" },
  { t: "INFO",     msg: "Fuzzing BLE packet handler — 1,024 mutations queued" },
  { t: "WARNING",  msg: "ANOMALY: Unexpected response at 0x08004A2F (strcpy region)" },
  { t: "CRITICAL", msg: "CRASH #1 — Buffer overflow in BLE handler — EIP overwritten: 0xcccccccc" },
  { t: "INFO",     msg: "AI Analyzer: Classifying crash... CWE-120 Buffer Overflow confirmed" },
  { t: "INFO",     msg: "Pivoting to DICOM parser — injecting null-byte payloads" },
  { t: "WARNING",  msg: "ANOMALY: Heap allocation failure in malloc at 0x0800F112" },
  { t: "CRITICAL", msg: "CRASH #2 — NULL dereference after OOM — BLE stack panic" },
  { t: "INFO",     msg: "HL7 ADT handler — injecting SQL injection patterns" },
  { t: "CRITICAL", msg: "CRASH #3 — SQL injection in PID-5 field — DB error: DROP TABLE patients" },
  { t: "INFO",     msg: "AI Chain Logger: 3-step exploit chain detected — IDOR → SQLi → Data Exfil" },
  { t: "INFO",     msg: "Coverage: 74.3% — exploring telemetry logger module" },
  { t: "WARNING",  msg: "ANOMALY: Format string in sprintf at 0x0800A344" },
  { t: "CRITICAL", msg: "CRASH #4 — Format string injection — arbitrary write primitive confirmed" },
  { t: "INFO",     msg: "Compliance mapping: HIPAA §164.312 violated — fine exposure ₹12Cr–₹62Cr" },
  { t: "INFO",     msg: "Generating remediation patches... 6 auto-fixes ready" },
  { t: "INFO",     msg: "Session complete — 4 critical vulnerabilities, 0 false positives" },
];

// ── CRASH CARDS ───────────────────────────────────────────────────────────────
const CRASHES = [
  { id: "CVE-2024-0x4A2F", type: "Buffer Overflow", target: "BLE Stack", cwe: "CWE-120", severity: "CRITICAL", detail: "strcpy() overflow — EIP overwritten at 0x08004A2F" },
  { id: "CVE-2024-0xF112", type: "NULL Dereference", target: "malloc()", cwe: "CWE-476", severity: "CRITICAL", detail: "Unchecked allocation — NULL deref on OOM condition" },
  { id: "CVE-2024-0xADT5", type: "SQL Injection",    target: "HL7 Handler", cwe: "CWE-89",  severity: "CRITICAL", detail: "PID-5 field unsanitised — DROP TABLE executed" },
  { id: "CVE-2024-0xA344", type: "Format String",    target: "Telemetry",   cwe: "CWE-134", severity: "HIGH",     detail: "sprintf() format string — arbitrary write primitive" },
];

// ── COUNTER HOOK ──────────────────────────────────────────────────────────────
function useCounter(target, duration = 1200, running = true) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    if (!running) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, running]);
  return val;
}

// ── LIVE STAT HOOK ────────────────────────────────────────────────────────────
function useLiveStat(base, variance, interval = 900) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const t = setInterval(() => setVal(base + Math.floor(Math.random() * variance)), interval);
    return () => clearInterval(t);
  }, [base, variance, interval]);
  return val;
}

// ── MAIN DEMO COMPONENT ───────────────────────────────────────────────────────
export default function DemoMode({ onClose }) {
  const [themeKey, setThemeKey] = useState("cyan");
  const T = THEMES[themeKey];

  // Terminal state
  const [lines, setLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const termRef = useRef(null);

  // Crash cards
  const [visibleCrashes, setVisibleCrashes] = useState([]);

  // Live stats
  const execsPerSec = useLiveStat(14200, 3800);
  const coverage    = useLiveStat(74, 6);
  const memUsage    = useLiveStat(312, 80);
  const cpuUsage    = useLiveStat(68, 22);

  // Roll-up counters
  const crashCount  = useCounter(4, 3200);
  const pathCount   = useCounter(2847, 2000);
  const payloadCount= useCounter(1847, 1500);

  // Type terminal lines one by one
  useEffect(() => {
    if (lineIdx >= TERMINAL_SCRIPT.length) return;
    const delay = lineIdx === 0 ? 600 : 700 + Math.random() * 600;
    const t = setTimeout(() => {
      const line = TERMINAL_SCRIPT[lineIdx];
      setLines(prev => [...prev.slice(-18), line]);
      // Spawn crash card on CRITICAL lines
      if (line.t === "CRITICAL") {
        const crashIdx = visibleCrashes.length;
        if (crashIdx < CRASHES.length) {
          setVisibleCrashes(prev => [...prev, CRASHES[crashIdx]]);
        }
      }
      setLineIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [lineIdx]);

  // Auto-scroll terminal
  useEffect(() => { termRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const lineColor = (t) => {
    if (t === "CRITICAL") return "#ff4444";
    if (t === "WARNING")  return T.accent;
    return T.primary + "cc";
  };

  const panelStyle = {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    backdropFilter: "blur(16px)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: T.bg, color: "#fff",
        fontFamily: "Outfit, sans-serif",
        overflowY: "auto",
        backgroundImage: `radial-gradient(ellipse at 20% 20%, ${T.primaryGlow} 0%, transparent 50%),
                          radial-gradient(ellipse at 80% 80%, ${T.primaryGlow.replace("0.25","0.12")} 0%, transparent 50%)`,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: `1px solid ${T.border}`, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDim})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#000" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: T.primary, margin: 0, letterSpacing: 1 }}>AEGISFUZZ AI</h1>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>Healthcare Security Platform — Live Demo</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Pulsing LIVE badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.4)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff4444", animation: "pulse 1s infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: "#ff4444", letterSpacing: 2 }}>LIVE SCAN</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <X size={14} /> Exit Demo
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "20px 28px 0" }}>
        {[
          { icon: Zap,           label: "Executions / sec", value: execsPerSec.toLocaleString(), accent: true },
          { icon: Activity,      label: "Paths Explored",   value: pathCount.toLocaleString() },
          { icon: AlertTriangle, label: "Unique Crashes",   value: crashCount, accent: crashCount > 0 },
          { icon: HardDrive,     label: "Coverage",         value: `${coverage}%` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ ...panelStyle, padding: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, background: s.accent ? `${T.primary}20` : "rgba(255,255,255,0.05)", color: s.accent ? T.primary : "rgba(255,255,255,0.4)" }}>
                <s.icon size={16} />
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>LIVE</span>
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.accent ? T.primary : "#fff", fontFamily: "JetBrains Mono, monospace" }}>{s.value}</div>
            {/* Shimmer bottom bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)`, opacity: 0.5 }} />
          </motion.div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, padding: "16px 28px" }}>

        {/* LEFT — Terminal + Crash Cards */}
        <div style={{ display: "grid", gap: 16 }}>

          {/* Terminal */}
          <div style={{ ...panelStyle, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, background: "rgba(0,0,0,0.4)" }}>
              <Terminal size={13} style={{ color: T.primary }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>Live Execution Stream</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {["#ff5f57","#febc2e","#28c840"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              </div>
            </div>
            <div style={{ height: 280, padding: "12px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, overflowY: "auto", background: "rgba(0,0,0,0.6)" }}>
              <AnimatePresence>
                {lines.map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                    style={{ marginBottom: 5, display: "flex", gap: 10 }}>
                    <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>[{new Date().toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span>
                    <span style={{ color: lineColor(line.t), fontWeight: line.t === "CRITICAL" ? 700 : 400 }}>
                      {line.t !== "INFO" && <span style={{ marginRight: 6, fontSize: 9, padding: "1px 5px", borderRadius: 3, background: line.t === "CRITICAL" ? "rgba(255,68,68,0.2)" : "rgba(255,149,0,0.2)", color: line.t === "CRITICAL" ? "#ff4444" : T.accent }}>{line.t}</span>}
                      {line.msg}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={termRef} />
            </div>
          </div>

          {/* Crash Cards */}
          <div style={{ ...panelStyle, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <AlertTriangle size={14} style={{ color: "#ff4444" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>Detected Vulnerabilities</span>
              <AnimatePresence>
                {visibleCrashes.length > 0 && (
                  <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(255,68,68,0.15)", color: "#ff4444", border: "1px solid rgba(255,68,68,0.3)" }}>
                    {visibleCrashes.length} FOUND
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <AnimatePresence>
                {visibleCrashes.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{ padding: 14, borderRadius: 10, background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>{c.id}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 3, background: c.severity === "CRITICAL" ? "rgba(255,68,68,0.2)" : "rgba(255,149,0,0.2)", color: c.severity === "CRITICAL" ? "#ff4444" : T.accent }}>{c.severity}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{c.type}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>{c.target} — {c.cwe}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", margin: 0 }}>{c.detail}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {visibleCrashes.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 32, opacity: 0.2 }}>
                  <Shield size={32} style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 12 }}>Scanning for vulnerabilities...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — AI Panel + Resource Monitor + Payload Counter */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>

          {/* AI Analysis Panel */}
          <div style={{ ...panelStyle, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Brain size={14} style={{ color: T.primary }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>AegisAI Analysis</span>
              <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.primary, boxShadow: `0 0 8px ${T.primary}`, animation: "pulse 1.5s infinite" }} />
            </div>
            <div style={{ padding: 14, borderRadius: 8, background: "rgba(0,0,0,0.4)", border: `1px solid ${T.border}`, marginBottom: 12, fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
              <p style={{ color: T.primary, margin: "0 0 6px", fontWeight: 700 }}>► CRASH #3 — SQL Injection</p>
              <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>Root cause: Unsanitised PID-5 field passed directly to SQL INSERT statement.</p>
              <p style={{ color: T.accent, margin: 0 }}>Fix: Use parameterised queries — cursor.execute(%s, (pid,))</p>
            </div>
            {[
              { label: "Vulnerability Type", value: "CWE-89 SQL Injection" },
              { label: "CVSS Score",         value: "9.8 CRITICAL" },
              { label: "Compliance Impact",  value: "HIPAA §164.312(b)" },
              { label: "Fine Exposure",      value: "₹3Cr – ₹15Cr" },
              { label: "Fix Time",           value: "~20 minutes" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 11 }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.label.includes("CVSS") || r.label.includes("Fine") ? "#ff4444" : T.primary }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Resource Monitor */}
          <div style={{ ...panelStyle, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Cpu size={14} style={{ color: T.primary }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>System Resources</span>
            </div>
            {[
              { label: "CPU Usage",    value: cpuUsage,  unit: "%",  color: T.primary },
              { label: "Memory Heap", value: memUsage,  unit: "MB", color: T.accent },
              { label: "Coverage",    value: coverage,  unit: "%",  color: T.primaryDim },
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                  <span style={{ fontWeight: 700, color, fontFamily: "monospace" }}>{value}{unit}</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                  <motion.div animate={{ width: `${Math.min(100, value)}%` }} transition={{ type: "spring", stiffness: 60 }}
                    style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Payload Library Counter */}
          <div style={{ ...panelStyle, padding: 20, background: `linear-gradient(135deg, ${T.primaryGlow}, ${T.panel})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Lock size={14} style={{ color: T.primary }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>Healthcare Payload Library</span>
            </div>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: T.primary, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
                {payloadCount.toLocaleString()}
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: 2 }}>Medical-Domain Payloads</p>
            </div>
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.3)", fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              100% healthcare-specific — no generic fuzzer has this
            </div>
          </div>
        </div>
      </div>

      {/* ── THEME SWITCHER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 28px 24px" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2 }}>Theme</span>
        {Object.entries(THEMES).map(([key, th]) => (
          <button key={key} onClick={() => setThemeKey(key)}
            title={th.name}
            style={{
              width: 28, height: 28, borderRadius: "50%", border: themeKey === key ? `3px solid #fff` : "3px solid transparent",
              background: th.swatch, cursor: "pointer", transition: "all 0.2s",
              boxShadow: themeKey === key ? `0 0 12px ${th.swatch}` : "none",
              transform: themeKey === key ? "scale(1.2)" : "scale(1)",
            }} />
        ))}
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{THEMES[themeKey].name}</span>
      </div>

      {/* Pulse keyframe */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </motion.div>
  );
}
