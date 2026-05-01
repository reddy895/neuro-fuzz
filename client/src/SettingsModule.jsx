import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Sliders, Cpu, Zap, Shield, 
  Brain, Save, RefreshCw, Layers, Terminal,
  HardDrive, Clock, Activity, ShieldAlert,
  ToggleLeft, ToggleRight
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

export default function SettingsModule() {
  const [config, setConfig] = useState({
    timeout: 5000,
    memory_limit: 1024,
    threads: 4,
    ai_model: 'GPT-4o (NeuroCore)',
    ai_aggressiveness: 75,
    security_mode: 'Safe'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`${BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    setTimeout(() => setSaving(false), 800);
  };

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ color: '#fdf3e4', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.champagne, margin: 0 }}>
            Platform <span style={{ color: C.forestBright }}>Configuration</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Control AegisFuzz engine parameters, neural models, and security posture
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ 
            padding: '10px 24px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer',
            background: saving ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`,
            color: saving ? 'rgba(255,255,255,0.2)' : '#0b0f0c', border: 'none',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'
          }}>
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'SAVING...' : 'APPLY CONFIGURATION'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Fuzzing Config */}
        <div style={{ display: 'grid', gap: 20 }}>
          <Panel style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Sliders size={16} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                Fuzzing Engine Parameters
              </span>
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
              <ConfigItem icon={Clock} label="Execution Timeout" sub="Time allowed per input mutation">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="100" max="10000" step="100" value={config.timeout} onChange={e => update('timeout', parseInt(e.target.value))} style={{ flex: 1, accentColor: C.champagne }} />
                  <span style={{ width: 60, fontSize: 12, fontWeight: 800, color: C.champagne }}>{config.timeout}ms</span>
                </div>
              </ConfigItem>

              <ConfigItem icon={HardDrive} label="Memory Limit" sub="Maximum RAM per execution process">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="256" max="4096" step="256" value={config.memory_limit} onChange={e => update('memory_limit', parseInt(e.target.value))} style={{ flex: 1, accentColor: C.champagne }} />
                  <span style={{ width: 60, fontSize: 12, fontWeight: 800, color: C.champagne }}>{config.memory_limit}MB</span>
                </div>
              </ConfigItem>

              <ConfigItem icon={Cpu} label="Parallel Threads" sub="Number of concurrent fuzzing instances">
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 4, 8, 16].map(t => (
                    <button key={t} onClick={() => update('threads', t)}
                      style={{ 
                        flex: 1, padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        background: config.threads === t ? 'rgba(247,231,206,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${config.threads === t ? C.champagne : 'rgba(255,255,255,0.05)'}`,
                        color: config.threads === t ? C.champagne : 'rgba(255,255,255,0.3)'
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </ConfigItem>
            </div>
          </Panel>

          <Panel style={{ padding: 24, background: config.security_mode === 'Aggressive' ? 'linear-gradient(135deg, rgba(192,57,43,0.1), rgba(17,26,20,0.85))' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} style={{ color: config.security_mode === 'Aggressive' ? '#e74c3c' : C.forestBright }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                  Security Operational Mode
                </span>
              </div>
              <div onClick={() => update('security_mode', config.security_mode === 'Safe' ? 'Aggressive' : 'Safe')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: config.security_mode === 'Aggressive' ? '#e74c3c' : C.forestBright }}>
                  {config.security_mode.toUpperCase()}
                </span>
                {config.security_mode === 'Safe' ? <ToggleLeft size={24} style={{ color: C.forestBright }} /> : <ToggleRight size={24} style={{ color: '#e74c3c' }} />}
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
              {config.security_mode === 'Safe' 
                ? 'Safe mode uses non-invasive bit-flips and does not attempt to exploit crashes. Ideal for production CI/CD.' 
                : 'Aggressive mode enables heap spraying, stack smashing payloads, and invasive bypass attempts. Use only in isolated lab environments.'}
            </p>
          </Panel>
        </div>

        {/* AI & Neural Settings */}
        <div style={{ display: 'grid', gap: 20 }}>
          <Panel style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Brain size={16} style={{ color: C.forestBright }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                NeuroCore AI Configuration
              </span>
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
              <ConfigItem icon={Layers} label="Neural Model" sub="Select the intelligence engine for mutations">
                <select value={config.ai_model} onChange={e => update('ai_model', e.target.value)}
                  style={{ 
                    w: '100%', padding: '12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    color: C.champagne, fontSize: 13, fontWeight: 600, appearance: 'none', cursor: 'pointer'
                  }}>
                  <option>GPT-4o (NeuroCore v2.1)</option>
                  <option>Claude 3.5 (Analyst Engine)</option>
                  <option>Llama-3 (On-Premise Hub)</option>
                  <option>DeepSeek-C (C-Specialist)</option>
                </select>
              </ConfigItem>

              <ConfigItem icon={Zap} label="Mutation Aggressiveness" sub="Controls how radically the AI mutates valid inputs">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="0" max="100" value={config.ai_aggressiveness} onChange={e => update('ai_aggressiveness', parseInt(e.target.value))} style={{ flex: 1, accentColor: C.forestBright }} />
                  <span style={{ width: 40, fontSize: 12, fontWeight: 800, color: C.forestBright }}>{config.ai_aggressiveness}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Conservative</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Chaos</span>
                </div>
              </ConfigItem>
            </div>
          </Panel>

          <Panel style={{ padding: 24 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Terminal size={14} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                System Telemetry
              </span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Kernel Version</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.champagneDim }}>6.2.0-AEGIS-PRO</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Neural Hub Latency</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.forestBright }}>14ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Global Fuzz Queue</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.warning }}>841 Tasks</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ConfigItem({ icon: Icon, label, sub, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{label}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
