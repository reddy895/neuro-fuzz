import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, TrendingUp, Code2, CheckCircle2,
  GitBranch, Package, Radar, Clock, DollarSign, Zap,
  ChevronRight, RefreshCw, Download, Globe, Activity,
  BookOpen, BarChart3, Layers, Target, Cpu
} from "lucide-react";

const C = {
  champagne: "#f7e7ce", champagneDim: "#c9b99a",
  forest: "#3d7a53", forestBright: "#4e9e6a",
  danger: "#c0392b", warning: "#d4a017",
};
const BASE = "http://127.0.0.1:8000";

const Panel = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(17,26,20,0.85)",
    border: "1px solid rgba(247,231,206,0.1)",
    borderRadius: 12, backdropFilter: "blur(12px)", ...style
  }}>{children}</div>
);

const Badge = ({ children, color = "champagne" }) => {
  const tc = { champagne: C.champagne, forest: C.forestBright, danger: "#e74c3c", warning: C.warning };
  return (
    <span style={{
      background: "rgba(255,255,255,0.05)", color: tc[color],
      border: `1px solid ${tc[color]}30`, fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1
    }}>{children}</span>
  );
};

const SectionTitle = ({ icon: Icon, text, color = C.champagne }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
    <Icon size={14} style={{ color }} />
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>{text}</span>
  </div>
);

const severityColor = (s) => s === "Critical" ? "#e74c3c" : s === "High" ? C.warning : C.forestBright;
const statusColor = (s) => s === "COMPLETED" ? C.forestBright : s === "FAILED" ? "#e74c3c" : C.warning;

// ── TAB DEFINITIONS ──────────────────────────────────────────────────────────
const TABS = [
  { id: "heatmap",    label: "🔴 Compliance Heatmap",     icon: Shield },
  { id: "roi",        label: "💰 ROI Calculator",          icon: TrendingUp },
  { id: "lrs",        label: "🏥 Legacy Risk Score",       icon: Activity },
  { id: "patches",    label: "🔧 Auto-Patch Snippets",     icon: Code2 },
  { id: "fp",         label: "✅ False-Positive Engine",   icon: CheckCircle2 },
  { id: "chains",     label: "⛓ Attack Chain Storyboard", icon: GitBranch },
  { id: "regpack",    label: "📦 Regulatory Packager",     icon: Package },
  { id: "agetracer",  label: "🕰 Vulnerability Age Tracer",icon: Clock },
  { id: "payloads",   label: "📈 Payload Library",         icon: BarChart3 },
  { id: "detect",     label: "🔍 Zero-Config Detection",   icon: Radar },
];

export default function IntelligenceModule() {
  const [tab, setTab] = useState("heatmap");
  return (
    <div style={{ color: "#fdf3e4", fontFamily: "Outfit, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.champagne, margin: 0 }}>
          AegisIntel <span style={{ color: C.forestBright }}>Advanced Intelligence</span>
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          Compliance mapping, ROI analysis, legacy risk scoring, auto-patches, and regulatory evidence packaging
        </p>
      </div>

      {/* Tab bar — scrollable */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            border: `1px solid ${tab === t.id ? "rgba(247,231,206,0.35)" : "rgba(255,255,255,0.08)"}`,
            background: tab === t.id ? "rgba(247,231,206,0.1)" : "transparent",
            color: tab === t.id ? C.champagne : "rgba(255,255,255,0.35)",
          }}>{t.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === "heatmap"   && <ComplianceHeatmap />}
          {tab === "roi"       && <ROICalculator />}
          {tab === "lrs"       && <LegacyRiskScore />}
          {tab === "patches"   && <AutoPatchSnippets />}
          {tab === "fp"        && <FalsePositiveEngine />}
          {tab === "chains"    && <AttackChainStoryboard />}
          {tab === "regpack"   && <RegulatoryPackager />}
          {tab === "agetracer" && <VulnAgeTracer />}
          {tab === "payloads"  && <PayloadLibrary />}
          {tab === "detect"    && <ZeroConfigDetection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── 1. COMPLIANCE HEATMAP ────────────────────────────────────────────────────
function ComplianceHeatmap() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    fetch(`${BASE}/api/intelligence/compliance-heatmap`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);
  if (!data) return <Loader />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
      <div style={{ display: "grid", gap: 16 }}>
        <Panel style={{ padding: 20 }}>
          <SectionTitle icon={Shield} text="Vulnerability → Compliance Clause Mapping" />
          <div style={{ display: "grid", gap: 10 }}>
            {data.vulnerabilities.map((v, i) => (
              <motion.div key={i} whileHover={{ x: 2 }} onClick={() => setSelected(selected?.vuln === v.vuln ? null : v)}
                style={{
                  padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${selected?.vuln === v.vuln ? severityColor(v.severity) + "80" : "rgba(255,255,255,0.06)"}`,
                  background: selected?.vuln === v.vuln ? `${severityColor(v.severity)}10` : "rgba(0,0,0,0.2)"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.champagne, flex: 1 }}>{v.vuln}</span>
                  <Badge color={v.severity === "Critical" ? "danger" : "warning"}>{v.severity}</Badge>
                  <span style={{ fontSize: 11, fontWeight: 800, color: severityColor(v.severity) }}>{v.score}/100</span>
                </div>
                {/* Score bar */}
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${v.score}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${severityColor(v.severity)}, ${severityColor(v.severity)}80)` }} />
                </div>
                <AnimatePresence>
                  {selected?.vuln === v.vuln && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden", marginTop: 12 }}>
                      <div style={{ display: "grid", gap: 8 }}>
                        {v.clauses.map((c, j) => (
                          <div key={j} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(0,0,0,0.3)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: C.forestBright, minWidth: 60 }}>{c.standard}</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 11, color: C.champagneDim, fontFamily: "monospace" }}>{c.clause}</span>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>{c.title}</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#e74c3c", whiteSpace: "nowrap" }}>{c.fine}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
      {/* Sidebar */}
      <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <Panel style={{ padding: 20, textAlign: "center" }}>
          <SectionTitle icon={Activity} text="Compliance Health Score" />
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px" }}>
            <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle cx="60" cy="60" r="52" fill="none"
                stroke={data.health_score < 30 ? "#e74c3c" : data.health_score < 60 ? C.warning : C.forestBright}
                strokeWidth="10" strokeDasharray="327"
                initial={{ strokeDashoffset: 327 }}
                animate={{ strokeDashoffset: 327 - (327 * data.health_score / 100) }}
                strokeLinecap="round" transition={{ duration: 1.5 }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{data.health_score}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Health</span>
            </div>
          </div>
          <Badge color="danger">{data.health_label}</Badge>
          <div style={{ marginTop: 16, padding: "12px", borderRadius: 8, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.25)" }}>
            <p style={{ fontSize: 11, color: "#e74c3c", fontWeight: 700 }}>Total Fine Exposure</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>{data.total_fine_exposure}</p>
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            {data.standards_violated.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.03)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ── 2. ROI CALCULATOR ────────────────────────────────────────────────────────
function ROICalculator() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${BASE}/api/intelligence/roi-calculator`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);
  if (!data) return <Loader />;
  const s = data.summary;
  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Summary banner */}
      <Panel style={{ padding: 20, background: "linear-gradient(135deg, rgba(61,122,83,0.15), rgba(17,26,20,0.85))" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "Total Breach Exposure", value: "₹48.2Cr", color: "#e74c3c" },
            { label: "AegisFuzz Annual Cost", value: "₹12L",    color: C.forestBright },
            { label: "Total Fix Time",         value: `${s.total_fix_hours}h`, color: C.champagne },
            { label: "Blended ROI",            value: `${s.blended_roi_percent.toLocaleString()}%`, color: C.warning },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", padding: "16px 12px", borderRadius: 10, background: "rgba(0,0,0,0.25)" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(61,122,83,0.1)", border: "1px solid rgba(61,122,83,0.25)", textAlign: "center" }}>
          <span style={{ fontSize: 12, color: C.forestBright, fontWeight: 700 }}>{s.vs_manual_pentest}</span>
        </div>
      </Panel>
      {/* Per-vuln cards */}
      <div style={{ display: "grid", gap: 14 }}>
        {data.vulnerabilities.map((v, i) => (
          <Panel key={i} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <Badge color={v.severity === "Critical" ? "danger" : "warning"}>{v.severity}</Badge>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.champagne, marginTop: 6 }}>{v.vuln}</h3>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{v.ibm_reference}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>ROI</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: C.forestBright }}>{v.roi_percent.toLocaleString()}%</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Breach Cost", value: v.breach_cost_label, color: "#e74c3c" },
                { label: "Fix Time",    value: `${v.time_to_fix_hours}h`, color: C.champagne },
                { label: "Aegis Cost",  value: "₹12L/yr", color: C.forestBright },
              ].map((m, j) => (
                <div key={j} style={{ padding: "10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(61,122,83,0.06)", border: "1px solid rgba(61,122,83,0.2)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.forestBright, textTransform: "uppercase", marginBottom: 4 }}>Quick Fix</p>
              <code style={{ fontSize: 11, color: C.champagneDim, fontFamily: "JetBrains Mono, monospace" }}>{v.fix_snippet}</code>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

// ── 3. LEGACY RISK SCORE ─────────────────────────────────────────────────────
function LegacyRiskScore() {
  const [data, setData] = useState(null);
  const [idx, setIdx] = useState(0);
  const load = (i) => {
    setData(null); setIdx(i);
    fetch(`${BASE}/api/intelligence/legacy-risk-score?file_index=${i}`)
      .then(r => r.json()).then(setData).catch(console.error);
  };
  useEffect(() => { load(0); }, []);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["Pacemaker v3.2.1", "Insulin Pump v2.0"].map((label, i) => (
          <button key={i} onClick={() => load(i)} style={{
            padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${idx === i ? C.champagneDim : "rgba(255,255,255,0.1)"}`,
            background: idx === i ? "rgba(247,231,206,0.1)" : "transparent",
            color: idx === i ? C.champagne : "rgba(255,255,255,0.35)"
          }}>{label}</button>
        ))}
      </div>
      {!data ? <Loader /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Panel style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.champagne, margin: 0 }}>{data.system}</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Binary Year: {data.binary_year} — Age: {data.age_years} years</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Legacy Risk Score</p>
                  <p style={{ fontSize: 36, fontWeight: 900, color: data.lrs_color }}>{data.lrs}</p>
                  <Badge color={data.lrs > 80 ? "danger" : "warning"}>{data.lrs_label}</Badge>
                </div>
              </div>
              <SectionTitle icon={BarChart3} text="Risk Factor Breakdown" />
              <div style={{ display: "grid", gap: 12 }}>
                {data.breakdown.map((b, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>{b.factor}</span>
                      <span style={{ fontWeight: 700, color: C.champagne }}>{b.contribution}/{b.max}</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(b.contribution / b.max) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${data.lrs_color}, ${data.lrs_color}80)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel style={{ padding: 20 }}>
              <SectionTitle icon={AlertTriangle} text="Known CVEs in Similar Devices" color="#e74c3c" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.prior_cves.map((cve, i) => (
                  <span key={i} style={{ fontFamily: "monospace", fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(192,57,43,0.12)", color: "#e8a598", border: "1px solid rgba(192,57,43,0.25)" }}>{cve}</span>
                ))}
              </div>
            </Panel>
          </div>
          <Panel style={{ padding: 20, alignSelf: "start" }}>
            <SectionTitle icon={Target} text="Insurance Assessment" color={C.warning} />
            <div style={{ padding: "14px", borderRadius: 10, background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.25)", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: C.warning, lineHeight: 1.6 }}>{data.insurance_note}</p>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "Binary Age",        value: `${data.age_years} years` },
                { label: "Safety Failures",   value: data.memory_safety_failures },
                { label: "Known CVEs",        value: data.prior_cves.length },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.25)" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.champagne }}>{m.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

// ── 4. AUTO-PATCH SNIPPETS ───────────────────────────────────────────────────
function AutoPatchSnippets() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    fetch(`${BASE}/api/intelligence/patch-snippets`)
      .then(r => r.json()).then(d => { setData(d); setSelected(d.patches[0]); }).catch(console.error);
  }, []);
  if (!data) return <Loader />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
      {/* List */}
      <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
        <Panel style={{ padding: 14 }}>
          <SectionTitle icon={Code2} text="Detected Vulnerabilities" />
          {data.patches.map((p, i) => (
            <div key={i} onClick={() => setSelected(p)} style={{
              padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 6,
              border: `1px solid ${selected?.cwe === p.cwe ? "rgba(247,231,206,0.3)" : "rgba(255,255,255,0.06)"}`,
              background: selected?.cwe === p.cwe ? "rgba(247,231,206,0.07)" : "rgba(0,0,0,0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.champagne, fontFamily: "monospace" }}>{p.cwe}</span>
                <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{p.vuln_type}</p>
              <p style={{ fontSize: 10, color: C.forestBright, marginTop: 2 }}>⏱ {p.effort}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "10px", borderRadius: 8, background: "rgba(61,122,83,0.08)", border: "1px solid rgba(61,122,83,0.2)", textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Total Fix Time</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: C.forestBright }}>{data.total_fix_time_minutes} min</p>
          </div>
        </Panel>
      </div>
      {/* Detail */}
      {selected && (
        <Panel style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <Badge color="danger">{selected.cwe}</Badge>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.champagne, marginTop: 8 }}>{selected.vuln_type}</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{selected.explanation}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge color="forest">{selected.language}</Badge>
              <Badge color="champagne">⏱ {selected.effort}</Badge>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#e74c3c", textTransform: "uppercase", marginBottom: 8 }}>❌ Vulnerable Code</p>
              <pre style={{ padding: "14px", borderRadius: 8, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.25)", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e8a598", whiteSpace: "pre-wrap", margin: 0 }}>{selected.before}</pre>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.forestBright, textTransform: "uppercase", marginBottom: 8 }}>✅ Patched Code</p>
              <pre style={{ padding: "14px", borderRadius: 8, background: "rgba(61,122,83,0.08)", border: "1px solid rgba(61,122,83,0.25)", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: C.forestBright, whiteSpace: "pre-wrap", margin: 0 }}>{selected.after}</pre>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── 5. FALSE-POSITIVE ENGINE ─────────────────────────────────────────────────
function FalsePositiveEngine() {
  const [stats, setStats] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [crashId, setCrashId] = useState("CRASH-047");
  useEffect(() => {
    fetch(`${BASE}/api/intelligence/false-positive-stats`)
      .then(r => r.json()).then(setStats).catch(console.error);
  }, []);
  const verify = async () => {
    setVerifying(true); setResult(null);
    try {
      const r = await fetch(`${BASE}/api/intelligence/verify-crash?crash_id=${crashId}&rounds=3`, { method: "POST" });
      setResult(await r.json());
    } catch(e) { console.error(e); }
    setVerifying(false);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <div style={{ display: "grid", gap: 16 }}>
        {stats && (
          <Panel style={{ padding: 20 }}>
            <SectionTitle icon={CheckCircle2} text="Suppression Statistics" color={C.forestBright} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Detected",    value: stats.total_crashes_detected, color: C.champagne },
                { label: "Confirmed Exploits",value: stats.confirmed_exploitable,  color: "#e74c3c" },
                { label: "FP Suppressed",     value: stats.false_positives_suppressed, color: C.forestBright },
              ].map((m, i) => (
                <div key={i} style={{ padding: "14px", borderRadius: 10, background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(61,122,83,0.08)", border: "1px solid rgba(61,122,83,0.2)", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>AegisFuzz FP Rate</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.forestBright }}>{stats.aegis_fp_rate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Industry Average</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#e74c3c" }}>{stats.industry_avg_fp_rate}</span>
              </div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(247,231,206,0.04)", border: "1px solid rgba(247,231,206,0.1)", textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.champagne }}>{stats.noise_reduction}</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Recent Suppressions</p>
              {stats.recent_suppressions.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: C.forestBright, minWidth: 80 }}>{s.id}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.reason}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
      {/* Live verifier */}
      <Panel style={{ padding: 20, alignSelf: "start" }}>
        <SectionTitle icon={RefreshCw} text="Live Crash Verifier" color={C.warning} />
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Crash ID</p>
          <input value={crashId} onChange={e => setCrashId(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: C.champagne, fontSize: 12, fontFamily: "monospace", boxSizing: "border-box" }} />
        </div>
        <button onClick={verify} disabled={verifying} style={{
          width: "100%", padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer",
          background: verifying ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`,
          color: verifying ? "rgba(255,255,255,0.3)" : "#0b0f0c", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          {verifying ? <><RefreshCw size={14} className="animate-spin" /> Verifying...</> : "▶ Verify Crash"}
        </button>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 14 }}>
            <div style={{ padding: "12px", borderRadius: 8, background: result.confirmed_exploitable ? "rgba(192,57,43,0.1)" : "rgba(61,122,83,0.1)", border: `1px solid ${result.confirmed_exploitable ? "rgba(192,57,43,0.3)" : "rgba(61,122,83,0.3)"}`, marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: result.confirmed_exploitable ? "#e74c3c" : C.forestBright }}>{result.verdict}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Confidence: {result.confidence}</p>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11 }}>
              {result.log.map((l, i) => (
                <div key={i} style={{ color: l.includes("CRASH") ? "#e74c3c" : C.forestBright, marginBottom: 4 }}>{l}</div>
              ))}
            </div>
          </motion.div>
        )}
      </Panel>
    </div>
  );
}

// ── 6. ATTACK CHAIN STORYBOARD ───────────────────────────────────────────────
function AttackChainStoryboard() {
  const [chains, setChains] = useState([]);
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  useEffect(() => {
    fetch(`${BASE}/api/intelligence/attack-chains`)
      .then(r => r.json()).then(d => { setChains(d); setActive(d[0]); }).catch(console.error);
  }, []);
  const play = () => {
    setStep(-1); setPlaying(true);
    let i = 0;
    const t = setInterval(() => {
      setStep(i); i++;
      if (i >= active.steps.length) { clearInterval(t); setPlaying(false); }
    }, 1000);
  };
  const typeColor = (t) => t === "exploit" ? "#e74c3c" : t === "recon" ? C.warning : t === "exfil" ? "#9b59b6" : "#e74c3c";
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {chains.map((c, i) => (
          <button key={i} onClick={() => { setActive(c); setStep(-1); }} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${active?.id === c.id ? "rgba(192,57,43,0.5)" : "rgba(255,255,255,0.1)"}`,
            background: active?.id === c.id ? "rgba(192,57,43,0.1)" : "transparent",
            color: active?.id === c.id ? "#e74c3c" : "rgba(255,255,255,0.4)"
          }}>{c.title}</button>
        ))}
      </div>
      {active && (
        <Panel style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <Badge color="danger">{active.severity}</Badge>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.champagne, marginTop: 8 }}>{active.title}</h3>
              <p style={{ fontSize: 12, color: "#e74c3c", marginTop: 4, fontWeight: 700 }}>Outcome: {active.outcome}</p>
            </div>
            <button onClick={play} disabled={playing} style={{
              padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer",
              background: playing ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`,
              color: playing ? "rgba(255,255,255,0.3)" : "#0b0f0c", border: "none"
            }}>{playing ? "⟳ Playing..." : "▶ Play Attack"}</button>
          </div>
          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ display: "grid", gap: 16 }}>
              {active.steps.map((s, i) => {
                const done = step >= i;
                const curr = step === i && playing;
                return (
                  <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: done || !playing ? 1 : 0.3 }}
                    style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: -26, top: 8, width: 12, height: 12, borderRadius: "50%",
                      background: done ? typeColor(s.type) : "rgba(255,255,255,0.1)",
                      boxShadow: curr ? `0 0 12px ${typeColor(s.type)}` : "none",
                      transition: "all 0.4s"
                    }} />
                    <div style={{
                      padding: "12px 16px", borderRadius: 10,
                      border: `1px solid ${done ? typeColor(s.type) + "40" : "rgba(255,255,255,0.05)"}`,
                      background: done ? `${typeColor(s.type)}08` : "rgba(0,0,0,0.2)",
                      transition: "all 0.4s"
                    }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{s.time}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: `${typeColor(s.type)}20`, color: typeColor(s.type), textTransform: "uppercase" }}>{s.type}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: done ? C.champagne : "rgba(255,255,255,0.4)" }}>{s.action}</span>
                      </div>
                      <p style={{ fontSize: 11, color: done ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{s.result}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {active.violated_clauses.map((c, i) => (
              <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(192,57,43,0.1)", color: "#e8a598", border: "1px solid rgba(192,57,43,0.2)", fontFamily: "monospace" }}>{c}</span>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── 7. REGULATORY PACKAGER ───────────────────────────────────────────────────
function RegulatoryPackager() {
  const [standard, setStandard] = useState("hipaa");
  const [data, setData] = useState(null);
  const load = (s) => {
    setStandard(s); setData(null);
    fetch(`${BASE}/api/intelligence/regulatory-package?standard=${s}`)
      .then(r => r.json()).then(setData).catch(console.error);
  };
  useEffect(() => { load("hipaa"); }, []);
  const exportPkg = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${data.standard.replace(/\s+/g, "_")}_evidence_package.json`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["hipaa", "fda", "cdsco"].map(s => (
            <button key={s} onClick={() => load(s)} style={{
              padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: `1px solid ${standard === s ? C.champagneDim : "rgba(255,255,255,0.1)"}`,
              background: standard === s ? "rgba(247,231,206,0.1)" : "transparent",
              color: standard === s ? C.champagne : "rgba(255,255,255,0.35)",
              textTransform: "uppercase"
            }}>{s}</button>
          ))}
        </div>
        <button onClick={exportPkg} disabled={!data} style={{
          padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
          background: `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`, color: "#0b0f0c", border: "none",
          display: "flex", alignItems: "center", gap: 8
        }}><Download size={14} /> Export Evidence Package</button>
      </div>
      {!data ? <Loader /> : (
        <Panel style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.champagne, margin: 0 }}>{data.standard}</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{data.regulation}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge color={data.overall_status.includes("NON") || data.overall_status.includes("NOT") || data.overall_status.includes("BLOCKED") ? "danger" : "forest"}>
                {data.overall_status}
              </Badge>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>Deadline: {data.remediation_deadline}</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {data.sections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(0,0,0,0.2)", border: `1px solid ${statusColor(s.status)}20`, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(s.status), marginTop: 4, flexShrink: 0, boxShadow: `0 0 8px ${statusColor(s.status)}60` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: C.champagneDim, fontWeight: 700 }}>{s.ref}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: statusColor(s.status), textTransform: "uppercase" }}>{s.status}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.champagne, marginBottom: 4 }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.evidence}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── 8. VULNERABILITY AGE TRACER ──────────────────────────────────────────────
function VulnAgeTracer() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${BASE}/api/intelligence/vuln-age-tracer`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);
  if (!data) return <Loader />;
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Panel style={{ padding: 20, background: "linear-gradient(135deg, rgba(192,57,43,0.1), rgba(17,26,20,0.85))" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { label: "Oldest Vulnerability", value: `${data.oldest_vulnerability_years} years`, color: "#e74c3c" },
            { label: "Combined Exposure Years", value: data.total_non_compliant_years, color: C.warning },
            { label: "Vulnerabilities Traced", value: data.vulnerabilities.length, color: C.champagne },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "rgba(0,0,0,0.25)" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(192,57,43,0.2)" }}>
          <p style={{ fontSize: 12, color: C.warning, lineHeight: 1.6 }}>⚠ {data.ciso_summary}</p>
        </div>
      </Panel>
      <div style={{ display: "grid", gap: 14 }}>
        {data.vulnerabilities.map((v, i) => (
          <Panel key={i} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Badge color={v.severity === "Critical" ? "danger" : "warning"}>{v.severity}</Badge>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: C.forestBright }}>{v.cwe}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.champagne, margin: 0 }}>{v.vuln}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>In Codebase</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: "#e74c3c" }}>{v.years_in_codebase}y</p>
              </div>
            </div>
            {/* Timeline bar */}
            <div style={{ position: "relative", height: 32, marginBottom: 14 }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.03)", borderRadius: 6 }} />
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (v.years_in_codebase / 20) * 100)}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 6, background: `linear-gradient(90deg, #e74c3c, ${C.warning})`, display: "flex", alignItems: "center", paddingLeft: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Since {v.first_seen_year}</span>
              </motion.div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.2)", marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: C.warning, lineHeight: 1.6 }}>📋 {v.boardroom_note}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {v.similar_device_cves.map((cve, j) => (
                <span key={j} style={{ fontFamily: "monospace", fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(192,57,43,0.1)", color: "#e8a598", border: "1px solid rgba(192,57,43,0.2)" }}>{cve}</span>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

// ── 9. PAYLOAD LIBRARY ───────────────────────────────────────────────────────
function PayloadLibrary() {
  const [data, setData] = useState(null);
  const refresh = () => {
    fetch(`${BASE}/api/intelligence/payload-library`)
      .then(r => r.json()).then(setData).catch(console.error);
  };
  useEffect(() => { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, []);
  if (!data) return <Loader />;
  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Live counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Total Medical Payloads", value: data.total_payloads, color: C.champagne, pulse: true },
          { label: "Unique to AegisFuzz",    value: data.unique_to_aegis, color: C.forestBright, pulse: true },
          { label: "Learned This Month",     value: data.learned_this_month, color: C.warning, pulse: true },
        ].map((m, i) => (
          <Panel key={i} style={{ padding: 20, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
              {m.pulse && <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, boxShadow: `0 0 8px ${m.color}`, animation: "pulse 1.5s infinite" }} />}
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{m.label}</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: m.color }}>{m.value.toLocaleString()}</p>
          </Panel>
        ))}
      </div>
      {/* Category breakdown */}
      <Panel style={{ padding: 20 }}>
        <SectionTitle icon={BarChart3} text="Payload Categories" />
        <div style={{ display: "grid", gap: 12 }}>
          {data.categories.map((cat, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{cat.name}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: C.forestBright, fontWeight: 700 }}>+{cat.new_this_month} this month</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.champagne }}>{cat.count.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.count / data.total_payloads) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${C.forestBright}, ${C.champagne})` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {/* Moat comparison */}
      <Panel style={{ padding: 20 }}>
        <SectionTitle icon={Shield} text="vs Generic Fuzzers" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {Object.entries(data.vs_generic_fuzzers).map(([name, v], i) => (
            <div key={i} style={{ padding: "14px", borderRadius: 10, background: "rgba(0,0,0,0.25)", textAlign: "center", border: name === "AegisFuzz" ? `1px solid ${C.champagneDim}40` : "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: name === "AegisFuzz" ? C.champagne : "rgba(255,255,255,0.5)", marginBottom: 8 }}>{name}</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: name === "AegisFuzz" ? C.forestBright : "rgba(255,255,255,0.3)" }}>{v.healthcare_specific.toLocaleString()}</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 4 }}>Healthcare Payloads</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(247,231,206,0.04)", border: "1px solid rgba(247,231,206,0.1)", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.champagne, fontWeight: 700 }}>{data.moat_statement}</p>
        </div>
      </Panel>
    </div>
  );
}

// ── 10. ZERO-CONFIG DETECTION ────────────────────────────────────────────────
function ZeroConfigDetection() {
  const [url, setUrl] = useState("http://localhost:8000");
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const detect = async () => {
    setDetecting(true); setResult(null);
    try {
      const r = await fetch(`${BASE}/api/intelligence/detect-profile?api_url=${encodeURIComponent(url)}`, { method: "POST" });
      setResult(await r.json());
    } catch(e) { console.error(e); }
    setDetecting(false);
  };
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Panel style={{ padding: 20 }}>
        <SectionTitle icon={Radar} text="Zero-Config Hospital Profile Detection" />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
          Point AegisFuzz at any healthcare API or binary. It auto-detects EHR system, device manufacturer, and regulatory jurisdiction — no configuration needed.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={url} onChange={e => setUrl(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: C.champagne, fontSize: 13, fontFamily: "monospace" }} />
          <button onClick={detect} disabled={detecting} style={{
            padding: "10px 24px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer",
            background: detecting ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`,
            color: detecting ? "rgba(255,255,255,0.3)" : "#0b0f0c", border: "none",
            display: "flex", alignItems: "center", gap: 8
          }}>
            {detecting ? <><RefreshCw size={14} className="animate-spin" /> Detecting...</> : <><Radar size={14} /> Detect Profile</>}
          </button>
        </div>
      </Panel>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* EHR System */}
          <Panel style={{ padding: 20 }}>
            <SectionTitle icon={Globe} text="EHR System Detected" color={C.forestBright} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.champagne, margin: 0 }}>{result.ehr_system.name}</h3>
              <Badge color="forest">{result.ehr_system.confidence}</Badge>
            </div>
            <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              {result.ehr_system.signals.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  <span style={{ color: C.forestBright }}>✓</span> {s}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Alternatives considered: {result.ehr_system.alternatives.join(", ")}</p>
          </Panel>
          {/* Device Manufacturer */}
          <Panel style={{ padding: 20 }}>
            <SectionTitle icon={Cpu} text="Device Manufacturer" color={C.warning} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.champagne, margin: 0 }}>{result.device_manufacturer.name}</h3>
              <Badge color="warning">{result.device_manufacturer.confidence}</Badge>
            </div>
            {result.device_manufacturer.signals.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                <span style={{ color: C.warning }}>◆</span> {s}
              </div>
            ))}
          </Panel>
          {/* Jurisdiction */}
          <Panel style={{ padding: 20 }}>
            <SectionTitle icon={BookOpen} text="Regulatory Jurisdiction" color={C.champagne} />
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.champagne }}>{result.regulatory_jurisdiction.primary}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Secondary: {result.regulatory_jurisdiction.secondary}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {result.regulatory_jurisdiction.applicable_standards.map((s, i) => (
                <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(247,231,206,0.06)", color: C.champagneDim, border: "1px solid rgba(247,231,206,0.12)" }}>{s}</span>
              ))}
            </div>
          </Panel>
          {/* Auto-config applied */}
          <Panel style={{ padding: 20, background: "linear-gradient(135deg, rgba(61,122,83,0.12), rgba(17,26,20,0.85))" }}>
            <SectionTitle icon={Zap} text="Auto-Config Applied" color={C.forestBright} />
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(result.auto_config_applied).map(([k, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,0.2)" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.forestBright }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "10px", borderRadius: 8, background: "rgba(61,122,83,0.1)", border: "1px solid rgba(61,122,83,0.25)", textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.forestBright }}>⚡ Time to First Scan: {result.time_to_first_scan}</p>
            </div>
          </Panel>
        </motion.div>
      )}
    </div>
  );
}

// ── SHARED LOADER ────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: "rgba(255,255,255,0.2)" }}>
      <RefreshCw size={20} className="animate-spin" />
      <span style={{ fontSize: 13 }}>Loading intelligence data...</span>
    </div>
  );
}
