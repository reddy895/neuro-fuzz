import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Cpu, Zap, Activity, ShieldAlert, 
  Terminal, Code, Layers, Sparkles, Binary,
  FileJson, FileText, ChevronRight, BarChart3,
  ToggleLeft, ToggleRight, Target
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

export default function NeuroFuzzModule() {
  const [smartInput, setSmartInput] = useState(null);
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    fetchStats();
    fetchPredictions();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE}/api/ai/learning-stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      console.error('Failed to fetch learning stats:', e);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`${BASE}/api/ai/predictions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPredictions(data.high_risk_regions);
    } catch (e) {
      console.error('Failed to fetch predictions:', e);
    }
  };

  const generateInput = async (type) => {
    setLoading(type);
    try {
      const res = await fetch(`${BASE}/api/ai/generate-smart-input?input_type=${type}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSmartInput(await res.json());
    } catch (e) {
      console.error('Failed to generate input:', e);
    } finally {
      setLoading('');
    }
  };

  return (
    <div style={{ color: '#fdf3e4', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header with AI Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.champagne, margin: 0 }}>
            NeuroFuzz <span style={{ color: C.forestBright }}>AI Core</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Neural-guided mutation engine and predictive vulnerability mapping
          </p>
        </div>
        
        <div onClick={() => setAiEnabled(!aiEnabled)} style={{ 
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 10,
          background: aiEnabled ? 'rgba(61,122,83,0.1)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${aiEnabled ? 'rgba(61,122,83,0.3)' : 'rgba(255,255,255,0.1)'}`,
          cursor: 'pointer', transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: aiEnabled ? C.forestBright : 'rgba(255,255,255,0.4)' }}>
            {aiEnabled ? 'AI-DRIVEN MUTATION' : 'RANDOM MUTATION'}
          </span>
          {aiEnabled ? <ToggleRight size={24} style={{ color: C.forestBright }} /> : <ToggleLeft size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          
          {/* AI Input Generator */}
          <Panel style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={14} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                Neural Input Generator
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'hl7', icon: FileText, label: 'HL7' },
                { id: 'json', icon: FileJson, label: 'JSON' },
                { id: 'binary', icon: Binary, label: 'Binary' }
              ].map(t => (
                <button key={t.id} onClick={() => generateInput(t.id)} disabled={loading === t.id}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)', color: C.champagne, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                  }}>
                  <t.icon size={20} style={{ color: loading === t.id ? C.forestBright : 'inherit' }} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {smartInput && (
                <motion.div key={smartInput.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ 
                    padding: 16, borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(61,122,83,0.3)',
                    fontFamily: 'monospace', fontSize: 12
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Badge color="forest">AI GENERATED {smartInput.type}</Badge>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Target: {smartInput.optimized_for}</span>
                  </div>
                  <pre style={{ color: C.forestBright, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {typeof smartInput.payload === 'object' ? JSON.stringify(smartInput.payload, null, 2) : smartInput.payload}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          {/* Prediction Engine */}
          <Panel style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Target size={14} style={{ color: C.danger }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                Vulnerability Prediction Map
              </span>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {predictions.map((p, i) => (
                <div key={i} style={{ 
                  padding: 14, borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', gap: 16, alignItems: 'center'
                }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 8, background: 'rgba(192,57,43,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                  }}>
                    <ShieldAlert size={20} style={{ color: p.risk === 'Critical' ? '#e74c3c' : C.warning }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.champagne }}>{p.module} : L{p.line_range}</span>
                      <Badge color={p.risk === 'Critical' ? 'danger' : 'warning'}>{p.risk}</Badge>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{p.reason}</p>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.2 }} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Sidebar: Learning Stats */}
        <div style={{ display: 'grid', gap: 20 }}>
          <Panel style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Brain size={14} style={{ color: C.forestBright }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                AI Learning Metrics
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(61,122,83,0.08)', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Coverage Boost</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: C.forestBright }}>+{stats?.coverage_increase || '0%'}</p>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(247,231,206,0.05)', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Input Quality</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: C.champagne }}>{stats?.input_quality || '0%'}</p>
              </div>
            </div>

            <div style={{ spaceY: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Training Epochs</span>
                  <span style={{ fontWeight: 700 }}>{stats?.training_epochs} / 500</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} style={{ height: '100%', background: C.champagne, borderRadius: 2 }} />
                </div>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Learned Patterns</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {stats?.learned_patterns.map((lp, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Activity size={12} style={{ color: C.forestBright, marginTop: 2 }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{lp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel style={{ padding: 20, background: 'linear-gradient(135deg, rgba(61,122,83,0.1), rgba(17,26,20,0.85))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Cpu size={14} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                Neural Core Status
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              NeuroFuzz AI is currently observing target execution paths and optimizing bit-flip strategies to maximize unique code coverage.
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.forestBright, boxShadow: `0 0 10px ${C.forestBright}` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.forestBright }}>ACTIVE LEARNING MODE</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
