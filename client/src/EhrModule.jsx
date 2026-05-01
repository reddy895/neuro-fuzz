import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Shield, Lock, AlertTriangle, Play, 
  Terminal, Search, User, CreditCard, Eye, 
  Skull, Wifi, Globe, ChevronRight, Activity,
  RefreshCcw, FileText, Fingerprint
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

const Badge = ({ children, color = 'champagne' }) => {
  const map = { 
    champagne: 'rgba(247,231,206,0.12)', 
    forest: 'rgba(61,122,83,0.15)', 
    danger: 'rgba(192,57,43,0.15)', 
    warning: 'rgba(212,160,23,0.15)' 
  };
  const tc = { 
    champagne: C.champagne, 
    forest: C.forestBright, 
    danger: '#e74c3c', 
    warning: C.warning 
  };
  return (
    <span style={{ 
      background: map[color], 
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

// ── EHR Hospital Backend Component ──────────────────────────────────────────

export default function EhrModule() {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [fuzzLogs, setFuzzLogs] = useState([]);
  const [isFuzzing, setIsFuzzing] = useState(false);
  const [breachData, setBreachData] = useState(null);
  const [isBreaching, setIsBreaching] = useState(false);

  const endpoints = [
    { method: 'GET', path: '/api/ehr/patients', desc: 'Fetch list of all hospital patients', auth: true },
    { method: 'GET', path: '/api/ehr/records/{id}', desc: 'Retrieve detailed medical history', auth: true, vuln: 'IDOR' },
    { method: 'GET', path: '/api/ehr/billing', desc: 'Get patient financial and insurance data', auth: true },
    { method: 'POST', path: '/api/ehr/records', desc: 'Upload new patient diagnostic record', auth: true, vuln: 'Mass Assignment' },
  ];

  const vulnerabilities = [
    { type: 'IDOR', severity: 'High', desc: 'Missing ownership check on record retrieval' },
    { type: 'SQL Injection', severity: 'Critical', desc: 'Unsanitized query params in search' },
    { type: 'Auth Bypass', severity: 'Critical', desc: 'JWT validation edge-case in POST' },
    { type: 'Data Leak', severity: 'High', desc: 'PII exposure in error responses' },
  ];

  const startFuzzTesting = () => {
    if (isFuzzing) {
      setIsFuzzing(false);
      return;
    }
    setIsFuzzing(true);
    setFuzzLogs([]);
    
    const scenarios = [
      { type: 'JSON Mutation', target: 'POST /api/ehr/records', payload: '{"id": "REC-999", "owner_id": "root"}' },
      { type: 'Query Param Fuzz', target: 'GET /api/ehr/records?id=1\' OR \'1\'=\'1', payload: 'SQLi Injection payload' },
      { type: 'Auth Header Mutation', target: 'GET /api/ehr/billing', payload: 'Authorization: Bearer NULL' },
      { type: 'Path Traversal', target: 'GET /api/ehr/records/../../etc/passwd', payload: '../ fuzzing' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      const s = scenarios[i % scenarios.length];
      const result = Math.random() > 0.6 ? '💥 VULN DETECTED' : '✓ SECURE';
      const log = `[${new Date().toLocaleTimeString()}] [${s.type}] ${s.target} → ${result}`;
      setFuzzLogs(prev => [log, ...prev].slice(0, 50));
      i++;
      if (i > 15 && !isFuzzing) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  };

  const simulateBreach = async () => {
    setIsBreaching(true);
    setBreachData(null);
    try {
      const res = await fetch(`${BASE}/api/ehr/simulate-breach`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTimeout(() => {
        setBreachData(data);
        setIsBreaching(false);
      }, 2000);
    } catch (e) {
      console.error('Breach simulation failed:', e);
      setIsBreaching(false);
    }
  };

  return (
    <div style={{ color: '#fdf3e4', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.champagne, margin: 0 }}>
          EHR API <span style={{ color: C.forestBright }}>Security Defense</span>
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
          Live hospital backend simulation, automated API fuzzing, and breach impact analysis
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div style={{ spaceY: 20 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {[
              { id: 'endpoints', label: '🔌 API Endpoints', icon: Globe },
              { id: 'fuzzing', label: '⚡ Live Fuzzing', icon: Play },
              { id: 'breach', label: '💀 Breach Simulator', icon: Skull },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ 
                  padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${activeTab === t.id ? 'rgba(247,231,206,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  background: activeTab === t.id ? 'rgba(247,231,206,0.1)' : 'transparent',
                  color: activeTab === t.id ? C.champagne : 'rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'endpoints' && (
              <motion.div key="endpoints" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Panel style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Globe size={14} style={{ color: C.champagne }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                      Registered API Endpoints
                    </span>
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {endpoints.map((e, i) => (
                      <div key={i} style={{ 
                        padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                            background: e.method === 'GET' ? 'rgba(61,122,83,0.2)' : 'rgba(192,57,43,0.2)',
                            color: e.method === 'GET' ? C.forestBright : '#e74c3c'
                          }}>{e.method}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.champagne }}>{e.path}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{e.desc}</span>
                          {e.auth && <Lock size={12} style={{ color: C.forestBright }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === 'fuzzing' && (
              <motion.div key="fuzzing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Panel style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Terminal size={14} style={{ color: C.champagne }} />
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                        Live Payload Fuzzing Console
                      </span>
                    </div>
                    <button onClick={startFuzzTesting} 
                      style={{ 
                        padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: isFuzzing ? 'rgba(192,57,43,0.2)' : `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`,
                        color: isFuzzing ? '#e74c3c' : '#0b0f0c', border: 'none'
                      }}>
                      {isFuzzing ? 'Stop Fuzzing' : 'Start Fuzz Testing'}
                    </button>
                  </div>
                  <div style={{ 
                    height: 300, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.5)', 
                    fontFamily: 'monospace', fontSize: 11, overflowY: 'auto'
                  }}>
                    {fuzzLogs.length === 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>Initializing mutation engine...</span>}
                    {fuzzLogs.map((log, i) => (
                      <div key={i} style={{ 
                        marginBottom: 4, 
                        color: log.includes('💥') ? '#e74c3c' : 'rgba(247,231,206,0.6)'
                      }}>{log}</div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === 'breach' && (
              <motion.div key="breach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Panel style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Skull size={14} style={{ color: C.danger }} />
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                        Data Breach Impact Simulator
                      </span>
                    </div>
                    <button onClick={simulateBreach} disabled={isBreaching}
                      style={{ 
                        padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.3)'
                      }}>
                      {isBreaching ? 'Analyzing...' : 'Trigger Breach Simulation'}
                    </button>
                  </div>

                  {breachData ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <div style={{ 
                        padding: 20, borderRadius: 12, background: 'rgba(192,57,43,0.1)', 
                        border: '1px solid rgba(192,57,43,0.3)', textAlign: 'center', marginBottom: 20 
                      }}>
                        <AlertTriangle size={32} style={{ color: C.danger, margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e74c3c', margin: 0 }}>{breachData.event}</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                          <div>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Records Leaked</p>
                            <p style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{breachData.records_leaked}</p>
                          </div>
                          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
                          <div>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Severity</p>
                            <Badge color="danger">{breachData.severity}</Badge>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Attacker Origin</p>
                          <p style={{ fontSize: 12, color: C.champagneDim, fontWeight: 700 }}>{breachData.attacker_origin}</p>
                        </div>
                        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Method</p>
                          <p style={{ fontSize: 12, color: C.champagneDim, fontWeight: 700 }}>{breachData.method}</p>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.4)', fontFamily: 'monospace', fontSize: 10 }}>
                        <p style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>Exfiltrated Data Sample (First 5 records):</p>
                        {breachData.leak_sample.map((s, i) => (
                          <div key={i} style={{ color: '#e74c3c', marginBottom: 2 }}>
                            {s.id} | {s.name.padEnd(15)} | SSN: {s.ssn}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{ h: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                      <Skull size={48} style={{ marginBottom: 12 }} />
                      <p style={{ fontSize: 13 }}>Waiting for breach signal...</p>
                    </div>
                  )}
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar for EHR Module */}
        <div style={{ spaceY: 20 }}>
          <Panel style={{ padding: 16, marginBottom: 20 }}>
            <SectionTitle icon={Shield} text="Vulnerability Monitor" />
            <div style={{ display: 'grid', gap: 8 }}>
              {vulnerabilities.map((v, i) => (
                <div key={i} style={{ 
                  padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.03)',
                  borderLeft: `3px solid ${v.severity === 'Critical' ? C.danger : C.warning}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.champagne }}>{v.type}</span>
                    <Badge color={v.severity === 'Critical' ? 'danger' : 'warning'}>{v.severity}</Badge>
                  </div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel style={{ padding: 16 }}>
            <SectionTitle icon={Activity} text="System Health" />
            <div style={{ spaceY: 10 }}>
              {[
                { label: 'API Latency', value: '42ms', color: C.forestBright },
                { label: 'Auth Success', value: '98.2%', color: C.forestBright },
                { label: 'Fuzzing Coverage', value: isFuzzing ? '64%' : '21%', color: C.warning },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, text, color = C.champagne }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Icon size={14} style={{ color }} />
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
        {text}
      </span>
    </div>
  );
}
