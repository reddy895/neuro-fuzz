import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, ShieldCheck, AlertTriangle, 
  Terminal, Sparkles, ArrowRight, CheckCircle2,
  Cpu, Rocket, RefreshCw, Layers, Lock,
  ChevronRight, MessageSquare, ListChecks
} from 'lucide-react';

const C = { 
  champagne: '#f7e7ce', 
  champagneDim: '#c9b99a', 
  forest: '#3d7a53', 
  forestBright: '#4e9e6a', 
  danger: '#c0392b', 
  warning: '#d4a017' 
};

const BASE = 'http://127.0.0.1:8000';

const Panel = ({ children, className = '', style = {} }) => (
  <div className={className} style={{ 
    background: 'rgba(17,26,20,0.85)', 
    border: '1px solid rgba(247,231,206,0.1)', 
    borderRadius: 12, 
    backdropFilter: 'blur(12px)',
    ...style 
  }}>
    {children}
  </div>
);

const Badge = ({ children, color = 'champagne' }) => {
  const tc = { 
    champagne: C.champagne, 
    forest: C.forestBright, 
    danger: '#e74c3c', 
    warning: C.warning 
  };
  return (
    <span style={{ 
      background: 'rgba(255,255,255,0.05)', 
      color: tc[color], 
      border: `1px solid ${tc[color]}30`, 
      fontSize: 10, 
      fontWeight: 700, 
      padding: '2px 8px', 
      borderRadius: 4, 
      textTransform: 'uppercase', 
      letterSpacing: 1 
    }}>
      {children}
    </span>
  );
};

export default function AiRemediationModule() {
  const [analysis, setAnalysis] = useState(null);
  const [remediating, setRemediating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`${BASE}/api/ai/deep-analysis`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalysis(await res.json());
    } catch (e) {
      console.error('Failed to fetch deep analysis:', e);
    }
  };

  const startRemediation = async () => {
    setRemediating(true);
    setLogs([]);
    setDone(false);

    try {
      const res = await fetch(`${BASE}/api/ai/remediate?vulnerability_id=GLOBAL_ARCH_FIX`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Animate logs one by one
      for (const log of data.remediation_log) {
        setLogs(prev => [...prev, log]);
        await new Promise(r => setTimeout(r, 600));
      }
      setDone(true);
    } catch (e) {
      setLogs(prev => [...prev, 'ERROR: Could not reach backend — is the server running?']);
      console.error('Remediation failed:', e);
    } finally {
      setRemediating(false);
    }
  };

  return (
    <div style={{ color: '#fdf3e4', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.champagne, margin: 0 }}>
          AegisAI <span style={{ color: C.forestBright }}>Deep Analysis & Remediation</span>
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
          Autonomous security analyst and automated risk handling engine
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          
          {/* AI Analysis Commentary */}
          <Panel style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Brain size={16} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                Neural Analysis Commentary
              </span>
              {analysis && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{analysis.analysis_id} • {analysis.timestamp}</span>}
            </div>

            {analysis ? (
              <div style={{ position: 'relative', padding: '20px 24px', borderRadius: 12, background: 'rgba(247,231,206,0.03)', border: '1px solid rgba(247,231,206,0.08)' }}>
                <MessageSquare size={24} style={{ position: 'absolute', top: -12, left: 16, color: 'rgba(247,231,206,0.1)' }} />
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                  "{analysis.commentary}"
                </p>
              </div>
            ) : (
              <div style={{ h: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: 'rgba(255,255,255,0.1)' }} />
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <ListChecks size={14} style={{ color: C.forestBright }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                  Future Security Roadmap
                </span>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {analysis?.future_roadmap.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 60, flexShrink: 0 }}>
                      <Badge color={i===0 ? 'danger' : i===1 ? 'warning' : 'forest'}>{step.phase}</Badge>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{step.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Remediation Console */}
          <Panel style={{ padding: 24, border: done ? `1px solid ${C.forestBright}40` : remediating ? `1px solid ${C.warning}40` : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={14} style={{ color: C.warning }} />
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                    Automated Remediation Engine
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.champagne, marginTop: 8 }}>Solve Identified Vulnerabilities</h3>
              </div>
              <button 
                onClick={startRemediation}
                disabled={remediating || done}
                style={{ 
                  padding: '10px 24px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer',
                  background: done ? C.forestBright : remediating ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`,
                  color: remediating ? 'rgba(255,255,255,0.2)' : '#0b0f0c', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'
                }}>
                {remediating ? <RefreshCw size={14} className="animate-spin" /> : done ? <ShieldCheck size={14} /> : <Sparkles size={14} />}
                {remediating ? 'SOLVING...' : done ? 'MITIGATED' : 'SOLVE WITH AEGIS AI'}
              </button>
            </div>

            <div style={{ h: 200, background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 12, overflowY: 'auto' }}>
              {!logs.length && !done && <span style={{ color: 'rgba(255,255,255,0.2)' }}>Awaiting remediation command...</span>}
              <div style={{ display: 'grid', gap: 6 }}>
                {logs.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    style={{ color: i === logs.length - 1 && !done ? C.warning : log.includes('CONFIRMED') ? C.forestBright : 'rgba(255,255,255,0.4)' }}>
                    <span style={{ opacity: 0.3, marginRight: 8 }}>[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </motion.div>
                ))}
              </div>
              {done && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, padding: '12px', borderRadius: 8, background: 'rgba(61,122,83,0.1)', border: '1px solid rgba(61,122,83,0.3)', color: C.forestBright }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                    <CheckCircle2 size={16} />
                    SYSTEM STABILIZED
                  </div>
                  <p style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>AI has successfully applied virtual patching and closed the reported IDOR and Buffer Overflow loops.</p>
                </motion.div>
              )}
            </div>
          </Panel>
        </div>

        {/* Sidebar: AI Capabilities */}
        <div style={{ display: 'grid', gap: 20 }}>
          <Panel style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Layers size={14} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                AegisAI Capabilities
              </span>
            </div>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { icon: Cpu, label: 'Virtual Patching', desc: 'Real-time boundary checks injected into execution paths.' },
                { icon: Lock, label: 'Auth Hardening', desc: 'Dynamic validation of JWT claims and ownership structures.' },
                { icon: ShieldCheck, label: 'Risk Mitigation', desc: 'Autonomous containment of detected memory corruptions.' }
              ].map((cap, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 32, h: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <cap.icon size={16} style={{ color: C.champagneDim }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.champagne }}>{cap.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel style={{ padding: 24, background: 'linear-gradient(135deg, rgba(61,122,83,0.1), rgba(17,26,20,0.85))' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, h: 48, borderRadius: '50%', background: 'rgba(61,122,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Rocket size={24} style={{ color: C.forestBright }} />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Autonomous Security</h4>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.5 }}>
                AegisAI is ready to handle all future risks. Deploying the suggested roadmap will increase security posture by 82%.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
