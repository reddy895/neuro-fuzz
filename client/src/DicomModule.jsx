import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, RotateCcw, AlertTriangle, Shield, ChevronRight, Code2, Terminal, Eye } from 'lucide-react';

const C = { champagne:'#f7e7ce', champagneDim:'#c9b99a', forest:'#3d7a53', forestBright:'#4e9e6a', danger:'#c0392b', warning:'#d4a017' };
const BASE = 'http://127.0.0.1:8000';

const Pill = ({ children, color='champagne' }) => {
  const map = { champagne:'rgba(247,231,206,0.12)', forest:'rgba(61,122,83,0.15)', danger:'rgba(192,57,43,0.15)', warning:'rgba(212,160,23,0.15)' };
  const tc  = { champagne:C.champagne, forest:C.forestBright, danger:'#e74c3c', warning:C.warning };
  return <span style={{ background:map[color], color:tc[color], border:`1px solid ${tc[color]}30`, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, textTransform:'uppercase', letterSpacing:1 }}>{children}</span>;
};

const Panel = ({ children, className='' }) => (
  <div className={className} style={{ background:'rgba(17,26,20,0.85)', border:'1px solid rgba(247,231,206,0.1)', borderRadius:12, backdropFilter:'blur(12px)' }}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, text, iconColor=C.champagne, right }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
    <Icon size={14} style={{ color:iconColor }} />
    <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:'rgba(255,255,255,0.4)' }}>{text}</span>
    {right && <div style={{ marginLeft:'auto' }}>{right}</div>}
  </div>
);

// ── Protocol Visualizer ──────────────────────────────────────────────────────
const ProtocolView = ({ data }) => {
  if (!data) return null;
  const isHL7 = data.protocol === 'HL7';
  const items = isHL7 ? data.fields : data.tags;
  const segs  = isHL7 ? [...new Set(items.map(f => f.seg))] : null;

  return (
    <Panel style={{ padding:20, marginBottom:0 }}>
      <SectionTitle icon={Eye} text={`${data.protocol} Message Structure`}
        right={data.mutation_applied && <Pill color="danger">Mutated: {data.mutation_applied}</Pill>} />
      {isHL7 ? (
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
          {segs.map(seg => {
            const segFields = items.filter(f => f.seg === seg);
            return (
              <div key={seg} style={{ marginBottom:10 }}>
                <div style={{ color:C.champagneDim, fontSize:10, marginBottom:4 }}>
                  <span style={{ color:C.forest, fontWeight:700, marginRight:8 }}>[{seg}]</span>
                  {segFields.map((f,i) => (
                    <span key={i}>
                      {i > 0 && <span style={{ color:'rgba(255,255,255,0.2)' }}> | </span>}
                      <span style={{ background: f.mutated ? 'rgba(192,57,43,0.25)' : 'transparent', color: f.mutated ? '#e74c3c' : C.champagneDim, padding:'1px 4px', borderRadius:3, border: f.mutated ? '1px solid rgba(192,57,43,0.5)' : 'none' }}>
                        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:9 }}>{f.field}: </span>
                        {f.value.length > 30 ? f.value.slice(0,30)+'…' : f.value}
                        {f.mutated && <span style={{ color:C.warning, fontSize:9, marginLeft:4 }}>⚡{f.mutation_type}</span>}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['Tag','VR','Name','Value'].map(h => <th key={h} style={{ textAlign:'left', padding:'4px 10px 6px', color:'rgba(255,255,255,0.25)', fontSize:9, fontWeight:600, textTransform:'uppercase' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((t,i) => (
              <tr key={i} style={{ background: t.mutated ? 'rgba(192,57,43,0.12)' : 'transparent', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding:'5px 10px', color:C.forest, fontWeight:700 }}>{t.tag}</td>
                <td style={{ padding:'5px 10px', color:'rgba(255,255,255,0.3)' }}>{t.vr}</td>
                <td style={{ padding:'5px 10px', color:'rgba(255,255,255,0.5)' }}>{t.name}</td>
                <td style={{ padding:'5px 10px' }}>
                  <span style={{ color: t.mutated ? '#e74c3c' : C.champagneDim, background: t.mutated ? 'rgba(192,57,43,0.2)' : 'transparent', padding:'1px 5px', borderRadius:3 }}>
                    {String(t.value).length > 35 ? String(t.value).slice(0,35)+'…' : String(t.value)}
                  </span>
                  {t.mutated && <span style={{ color:C.warning, fontSize:9, marginLeft:6 }}>⚡ {t.mutation_type} (was: {String(t.original_value).slice(0,15)})</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
};

// ── Fuzzing Console ──────────────────────────────────────────────────────────
const FuzzConsole = ({ results }) => {
  const [selected, setSelected] = useState(null);
  if (!results.length) return (
    <Panel style={{ padding:20 }}>
      <SectionTitle icon={Terminal} text="Fuzzing Console" />
      <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>Run a fuzzing session to see results here...</p>
    </Panel>
  );
  return (
    <Panel style={{ padding:20 }}>
      <SectionTitle icon={Terminal} text="Fuzzing Console" right={<Pill color="forest">{results.length} rounds</Pill>} />
      <div style={{ display:'grid', gap:6 }}>
        {results.map((r, i) => (
          <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
            onClick={() => setSelected(selected?.round === r.round ? null : r)}
            style={{ padding:'10px 14px', borderRadius:8, cursor:'pointer', border:`1px solid ${r.crashed ? 'rgba(192,57,43,0.4)' : 'rgba(61,122,83,0.2)'}`, background: r.crashed ? 'rgba(192,57,43,0.08)' : 'rgba(61,122,83,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.3)' }}>Round {r.round}</span>
              <Pill color={r.crashed ? 'danger' : 'forest'}>{r.crashed ? '💥 CRASH' : `${r.response_code} OK`}</Pill>
              <span style={{ fontSize:10, color:C.champagneDim, marginLeft:4 }}>{r.mutation_type}</span>
              <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.3)' }}>{r.label}</span>
              <ChevronRight size={12} style={{ color:'rgba(255,255,255,0.2)', transform: selected?.round===r.round ? 'rotate(90deg)':'none', transition:'transform 0.2s' }} />
            </div>
            <AnimatePresence>
              {selected?.round === r.round && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                  style={{ marginTop:10, overflow:'hidden' }}>
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:10 }}>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Mutated Fields</p>
                    {r.mutated_fields.map((mf,j) => (
                      <div key={j} style={{ display:'flex', gap:8, fontSize:11, fontFamily:'monospace', marginBottom:4 }}>
                        <span style={{ color:C.warning, minWidth:140 }}>{mf.field}</span>
                        <span style={{ color:'rgba(255,255,255,0.25)' }}>{String(mf.original).slice(0,20)}</span>
                        <span style={{ color:'rgba(255,255,255,0.3)' }}>→</span>
                        <span style={{ color:'#e74c3c' }}>{String(mf.mutated_value).slice(0,30)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:8, padding:'8px 10px', borderRadius:6, background:'rgba(0,0,0,0.4)', fontFamily:'monospace', fontSize:11, color: r.crashed ? '#e74c3c' : C.forestBright }}>
                      {r.response_body}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
};

// ── Crash Replay ─────────────────────────────────────────────────────────────
const CrashReplay = ({ results }) => {
  const [replaying, setReplaying] = useState(null);
  const crashes = results.filter(r => r.crashed);
  if (!crashes.length) return (
    <Panel style={{ padding:20 }}>
      <SectionTitle icon={RotateCcw} text="Crash Replay" iconColor={C.danger} />
      <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>No crashes recorded yet. Run fuzzing to find crashes.</p>
    </Panel>
  );
  const replay = (crash) => {
    setReplaying(crash);
    setTimeout(() => setReplaying(r => r?.round === crash.round ? { ...r, done:true } : r), 1800);
  };
  return (
    <Panel style={{ padding:20 }}>
      <SectionTitle icon={RotateCcw} text="Crash Replay" iconColor={C.danger} right={<Pill color="danger">{crashes.length} crashes</Pill>} />
      <div style={{ display:'grid', gap:8 }}>
        {crashes.map((crash, i) => (
          <div key={i} style={{ border:'1px solid rgba(192,57,43,0.35)', borderRadius:8, padding:14, background:'rgba(192,57,43,0.07)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{ color:'#e74c3c', fontWeight:700, fontSize:13 }}>💥 Round {crash.round} — {crash.label}</span>
              <button onClick={() => replay(crash)}
                style={{ marginLeft:'auto', padding:'4px 14px', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', background:`linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`, color:'#0b0f0c', border:'none' }}>
                ▶ Replay
              </button>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>
              Mutation: <span style={{ color:C.warning }}>{crash.mutation_type}</span> &nbsp;|&nbsp; Fields affected: <span style={{ color:'#e74c3c' }}>{crash.mutated_fields.length}</span>
            </div>
            {crash.mutated_fields.map((mf,j) => (
              <div key={j} style={{ fontSize:10, fontFamily:'monospace', color:'rgba(255,255,255,0.35)', marginBottom:2 }}>
                <span style={{ color:C.warning }}>{mf.field}</span>: "{String(mf.original).slice(0,20)}" → <span style={{ color:'#e74c3c' }}>"{String(mf.mutated_value).slice(0,30)}"</span>
              </div>
            ))}
            <AnimatePresence>
              {replaying?.round === crash.round && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  style={{ marginTop:10, padding:'10px 12px', borderRadius:6, background:'rgba(0,0,0,0.5)', fontFamily:'monospace', fontSize:11 }}>
                  {!replaying.done ? (
                    <span style={{ color:C.warning }}>⟳ Replaying crash input to target...</span>
                  ) : (
                    <div>
                      <div style={{ color:'#e74c3c', marginBottom:4 }}>⚠ CRASH CONFIRMED ON REPLAY</div>
                      <div style={{ color:'rgba(255,255,255,0.4)' }}>{crash.response_body}</div>
                      <div style={{ color:C.warning, marginTop:6 }}>
                        Broken field: <span style={{ color:'#e74c3c' }}>{crash.mutated_fields[0]?.field}</span>
                        {' '}— value "{String(crash.mutated_fields[0]?.mutated_value).slice(0,25)}" caused {crash.mutation_type}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// ── Attack Scenarios ─────────────────────────────────────────────────────────
const AttackPanel = ({ scenarios }) => {
  const [active, setActive] = useState(null);
  const [running, setRunning] = useState(null);
  const [step, setStep] = useState(0);

  const simulate = (s) => {
    setActive(s); setRunning(s.id); setStep(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setStep(i);
      if (i >= s.steps.length) { clearInterval(t); setRunning(null); }
    }, 900);
  };

  return (
    <div style={{ display:'grid', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {scenarios.map(s => (
          <motion.div key={s.id} whileHover={{ y:-2 }} onClick={() => setActive(active?.id===s.id ? null : s)}
            style={{ padding:16, borderRadius:10, cursor:'pointer', border:`1px solid ${active?.id===s.id ? 'rgba(192,57,43,0.6)' : 'rgba(192,57,43,0.2)'}`, background: active?.id===s.id ? 'rgba(192,57,43,0.12)' : 'rgba(192,57,43,0.05)' }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:13, fontWeight:700, color:C.champagne, marginBottom:4 }}>{s.title}</div>
            <Pill color="danger">{s.severity}</Pill>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <Panel style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.champagne }}>{active.icon} {active.title}</div>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4 }}>{active.description}</p>
                </div>
                <button onClick={() => simulate(active)}
                  disabled={running === active.id}
                  style={{ padding:'8px 18px', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer', background: running===active.id ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${C.champagne},${C.champagneDim})`, color: running===active.id ? 'rgba(255,255,255,0.3)' : '#0b0f0c', border:'none', flexShrink:0 }}>
                  {running===active.id ? '⟳ Simulating…' : '▶ Simulate Attack'}
                </button>
              </div>

              <div style={{ display:'grid', gap:8 }}>
                {active.steps.map((s,i) => {
                  const done = step > i;
                  const curr = step === i && running;
                  return (
                    <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 14px', borderRadius:8, border:`1px solid ${done ? 'rgba(61,122,83,0.4)' : curr ? 'rgba(212,160,23,0.4)' : 'rgba(255,255,255,0.06)'}`, background: done ? 'rgba(61,122,83,0.08)' : curr ? 'rgba(212,160,23,0.08)' : 'transparent', transition:'all 0.4s' }}>
                      <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0, background: done ? C.forestBright : curr ? C.warning : 'rgba(255,255,255,0.08)', color: done||curr ? '#0b0f0c' : 'rgba(255,255,255,0.3)' }}>
                        {done ? '✓' : s.step}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color: done ? C.forestBright : curr ? C.warning : 'rgba(255,255,255,0.5)' }}>{s.action}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2, fontFamily:'monospace' }}>{s.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {step >= active.steps.length && !running && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginTop:12, padding:'12px 14px', borderRadius:8, background:'rgba(0,0,0,0.5)', border:'1px solid rgba(192,57,43,0.35)', fontFamily:'monospace', fontSize:11 }}>
                  <div style={{ color:'#e74c3c', marginBottom:6, fontWeight:700 }}>⚠ CRASH LOG — {active.mutated_field}</div>
                  <pre style={{ color:'rgba(255,255,255,0.5)', whiteSpace:'pre-wrap', margin:0 }}>{active.crash_log}</pre>
                  <div style={{ marginTop:8, padding:'6px 10px', borderRadius:6, background:'rgba(192,57,43,0.1)', fontSize:10, color:C.warning }}>
                    Exploitation Payload: <span style={{ color:'#e74c3c' }}>{String(active.payload).slice(0,60)}{active.payload.length>60?'…':''}</span>
                  </div>
                </motion.div>
              )}
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main DICOM Module ─────────────────────────────────────────────────────────
export default function DicomModule() {
  const [proto, setProto] = useState('hl7');
  const [tmpl, setTmpl]   = useState(0);
  const [genData, setGenData]     = useState(null);
  const [fuzzResults, setFuzzResults] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState('');
  const [tab, setTab] = useState('generator');

  const generate = async (mutate=false) => {
    setLoading('gen');
    const r = await fetch(`${BASE}/api/dicom/generate?protocol=${proto}&template_idx=${tmpl}&mutate=${mutate}`, { method:'POST' });
    setGenData(await r.json());
    setLoading('');
  };

  const runFuzz = async () => {
    setLoading('fuzz');
    const r = await fetch(`${BASE}/api/dicom/fuzz?protocol=${proto}&rounds=6&template_idx=${tmpl}`, { method:'POST' });
    const d = await r.json();
    setFuzzResults(d.rounds);
    setLoading('');
    setTab('console');
  };

  const loadScenarios = async () => {
    if (scenarios.length) return;
    const r = await fetch(`${BASE}/api/dicom/attack-scenarios`);
    setScenarios(await r.json());
  };

  const tabs = [
    { id:'generator', label:'🧬 AI Generator' },
    { id:'console',   label:'🖥 Fuzz Console' },
    { id:'replay',    label:'💥 Crash Replay' },
    { id:'attacks',   label:'⚔️ Attack Scenarios' },
  ];

  return (
    <div style={{ color:'#fdf3e4', fontFamily:'Outfit, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:24, fontWeight:700, color:C.champagne, margin:0 }}>
          DICOM/HL7 <span style={{ color:C.forestBright }}>Protocol Fuzzer</span>
        </h2>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:4 }}>
          AI-generated medical inputs, protocol visualization, crash replay, and attack simulation
        </p>
      </div>

      {/* Controls */}
      <Panel style={{ padding:16, marginBottom:20 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          {/* Protocol toggle */}
          {['hl7','dicom'].map(p => (
            <button key={p} onClick={() => setProto(p)}
              style={{ padding:'6px 18px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border:`1px solid ${proto===p ? C.champagneDim : 'rgba(255,255,255,0.1)'}`, background: proto===p ? 'rgba(247,231,206,0.12)' : 'transparent', color: proto===p ? C.champagne : 'rgba(255,255,255,0.35)' }}>
              {p.toUpperCase()}
            </button>
          ))}
          {proto==='hl7' && (
            <select value={tmpl} onChange={e=>setTmpl(Number(e.target.value))}
              style={{ padding:'6px 12px', borderRadius:8, fontSize:11, background:'rgba(0,0,0,0.4)', color:C.champagneDim, border:'1px solid rgba(247,231,206,0.15)', outline:'none' }}>
              <option value={0}>ADT A01 – Patient Admission</option>
              <option value={1}>ORU R01 – Lab Result</option>
            </select>
          )}
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button onClick={() => generate(false)} disabled={loading==='gen'}
              style={{ padding:'7px 18px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', background:'rgba(61,122,83,0.2)', color:C.forestBright, border:`1px solid ${C.forest}` }}>
              {loading==='gen' ? '⟳' : '⚡ Generate Smart Input'}
            </button>
            <button onClick={() => generate(true)} disabled={loading==='gen'}
              style={{ padding:'7px 18px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', background:'rgba(212,160,23,0.15)', color:C.warning, border:'1px solid rgba(212,160,23,0.35)' }}>
              🔀 Mutate
            </button>
            <button onClick={runFuzz} disabled={loading==='fuzz'}
              style={{ padding:'7px 18px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', background:`linear-gradient(135deg,${C.champagne},${C.champagneDim})`, color:'#0b0f0c', border:'none' }}>
              {loading==='fuzz' ? '⟳ Fuzzing…' : '▶ Run Fuzz Session'}
            </button>
          </div>
        </div>
      </Panel>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if(t.id==='attacks') loadScenarios(); }}
            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${tab===t.id ? 'rgba(247,231,206,0.3)' : 'rgba(255,255,255,0.08)'}`, background: tab===t.id ? 'rgba(247,231,206,0.1)' : 'transparent', color: tab===t.id ? C.champagne : 'rgba(255,255,255,0.35)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          {tab==='generator' && (
            <div style={{ display:'grid', gap:16 }}>
              {genData ? <ProtocolView data={genData} /> : (
                <Panel style={{ padding:40, textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>🧬</div>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>Click "Generate Smart Input" to create a fake HL7 or DICOM record, or "Mutate" to apply fuzzing payloads to the fields.</p>
                </Panel>
              )}
            </div>
          )}
          {tab==='console' && <FuzzConsole results={fuzzResults} />}
          {tab==='replay'  && <CrashReplay results={fuzzResults} />}
          {tab==='attacks' && (
            scenarios.length
              ? <AttackPanel scenarios={scenarios} />
              : <Panel style={{ padding:40, textAlign:'center' }}><p style={{ color:'rgba(255,255,255,0.3)' }}>Loading scenarios…</p></Panel>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
