import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, Zap, Terminal, AlertTriangle,
  Cpu, HardDrive, BarChart3, Settings, Upload,
  Database, Brain, Play, Square, ChevronRight,
  Search, Bell, HeartPulse, FileText, Lock, Code2,
  Microchip, Wifi, Flame, ChevronDown, CheckCircle2, Sparkles, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DicomModule from './DicomModule.jsx';
import EhrModule from './EhrModule.jsx';
import NeuroFuzzModule from './NeuroFuzzModule.jsx';
import ComplianceModule from './ComplianceModule.jsx';
import AiRemediationModule from './AiRemediationModule.jsx';
import SettingsModule from './SettingsModule.jsx';

// ── Champagne/Forest color tokens ──────────────────────────────
const C = {
  champagne: '#f7e7ce',
  champagneDim: '#c9b99a',
  forest: '#3d7a53',
  forestBright: '#4e9e6a',
  danger: '#c0392b',
  warning: '#d4a017',
  background: '#0b0f0c',
  panel: '#121a14',
};

// ── Helper Components ──────────────────────────────────────────
const Badge = ({ children, color = 'champagne' }) => {
  const styles = {
    champagne: { bg: 'rgba(247,231,206,0.1)', text: C.champagne, border: 'rgba(247,231,206,0.2)' },
    warning: { bg: 'rgba(212,160,23,0.1)', text: C.warning, border: 'rgba(212,160,23,0.2)' },
    danger: { bg: 'rgba(192,57,43,0.1)', text: C.danger, border: 'rgba(192,57,43,0.2)' },
    forest: { bg: 'rgba(61,122,83,0.1)', text: C.forestBright, border: 'rgba(61,122,83,0.2)' },
  };
  const s = styles[color] || styles.champagne;
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {children}
    </span>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all relative group
    ${active ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
    {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-full bg-forestBright" style={{ background: C.forestBright }} />}
    <Icon size={18} className={active ? 'text-forestBright' : 'group-hover:text-white/60'} style={active ? { color: C.forestBright } : {}} />
    <span className="text-sm font-medium tracking-tight">{label}</span>
  </button>
);

const SeverityBadge = ({ s }) => {
  const col = s === 'Critical' ? 'danger' : s === 'High' ? 'warning' : 'champagne';
  return <Badge color={col}>{s}</Badge>;
};

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ executions: 0, paths: 0, crashes: 0, crashes_unique: 0, stability: 98.4, coverage: 0 });
  const [iotStats, setIotStats] = useState({ cpu: 0, mem: 0, crashes: 0 });
  const [loadingIot, setLoadingIot] = useState(false);
  const [iotFw, setIotFw] = useState(null);
  const [iotLogs, setIotLogs] = useState([]);
  const [iotFuzzing, setIotFuzzing] = useState(false);
  const [iotFileIdx, setIotFileIdx] = useState(0);
  const fileInputRef = useRef(null);

  const toggleFuzzing = () => setRunning(!running);

  const uploadFirmware = async (e) => {
    const file = e.target.files?.[0];
    const fileName = file ? file.name : (iotFileIdx === 0 ? 'pacemaker_v3.2.1.bin' : 'insulin_pump_fw_2.0.bin');

    setIotFw(null);
    setLoadingIot(true);
    setIotLogs([`[${new Date().toLocaleTimeString()}] [INFO] AEGIS-IoT: Preparing analyzer for ${fileName}...`]);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/iot/analyze?file_index=${iotFileIdx}`, { method: 'POST' });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 2000));
      setIotFw({ ...data, filename: fileName });
      setIotLogs(p => [...p, `[${new Date().toLocaleTimeString()}] [INFO] AEGIS-IoT: Analysis complete. Found ${data.risky_functions.length} risky patterns.`]);
    } catch (e) {
      setIotLogs(p => [...p, `[${new Date().toLocaleTimeString()}] [ERROR] AEGIS-IoT: Analysis timeout.`]);
    } finally {
      setLoadingIot(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  // ── Dashboard Sub-component ──
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: C.champagne }}>Healthcare <span style={{ color: C.forestBright }}>Command</span></h2>
          <p className="text-sm text-white/30 mt-1 uppercase tracking-widest">Global Security Telemetry & Fuzzing Orchestration</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Active Threads</p>
            <p className="text-xl font-mono font-bold" style={{ color: C.champagne }}>64 / 128</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">AFL++ Instance</p>
            <p className="text-xl font-mono font-bold" style={{ color: C.forestBright }}>AF-V4.2c</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Executions', val: stats.executions.toLocaleString(), sub: 'Total Rounds', ic: Zap, col: C.champagne },
          { label: 'Unique Paths', val: stats.paths.toLocaleString(), sub: 'Code Coverage', ic: Activity, col: C.forestBright },
          { label: 'Crashes', val: stats.crashes_unique, sub: 'Unique Faults', ic: AlertTriangle, col: C.danger },
          { label: 'Stability', val: `${stats.stability}%`, sub: 'Target Health', ic: Shield, col: C.champagneDim }
        ].map(s => (
          <div key={s.label} className="glass-panel p-5 forest-border hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <s.ic size={18} style={{ color: s.col }} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{s.label}</p>
            </div>
            <p className="text-2xl font-mono font-black" style={{ color: s.col }}>{s.val}</p>
            <p className="text-[10px] text-white/30 mt-1 uppercase">{s.sub}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel forest-border p-6 h-80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Fuzzing Performance (Execs/sec)</h3>
            <Badge color="forest">Live Stream</Badge>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={[{n:1,v:120},{n:2,v:150},{n:3,v:140},{n:4,v:180},{n:5,v:170},{n:6,v:210}]}>
              <defs>
                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.forest} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.forest} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={C.forestBright} strokeWidth={2} fillOpacity={1} fill="url(#colorV)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel forest-border p-6 h-80 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Discovery Feed</h3>
          <div className="space-y-4">
            {[
              { type: 'New Path', msg: 'Map density +2.1%', time: '2s ago', col: C.forestBright },
              { type: 'Stability', msg: 'Target heartbeat stable', time: '12s ago', col: C.champagneDim },
              { type: 'Fuzzing', msg: 'Started round 12,402', time: '45s ago', col: C.champagne }
            ].map((ev, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1 h-8 rounded" style={{ background: ev.col }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: ev.col }}>{ev.type}</p>
                  <p className="text-[11px] text-white/50">{ev.msg}</p>
                  <p className="text-[9px] text-white/20 mt-0.5">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const riskColor = (r) => r === 'Critical' ? C.danger : r === 'High' ? C.warning : C.champagneDim;
  const heatColor = (s) => s >= 80 ? C.danger : s >= 55 ? C.warning : s >= 30 ? C.forestBright : '#3d4f44';

  const IoTFirmware = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: C.champagne }}>Medical IoT <span style={{ color: C.forestBright }}>Firmware Analyzer</span></h2>
          <p className="text-sm text-white/30 mt-1 uppercase tracking-widest">Static analysis, live fuzzing, and vulnerability heatmap for embedded medical devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel forest-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload size={15} style={{ color: C.champagne }} />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Firmware Upload</span>
            </div>
            
            <div className="flex gap-4 mb-6">
              {['Pacemaker v3.2.1', 'Insulin Pump v2.0'].map((p, i) => (
                <button key={i} onClick={() => setIotFileIdx(i)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm
                  ${iotFileIdx === i ? 'border-champagne bg-champagne/10 text-champagne' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/10'}`}>
                  {p}
                </button>
              ))}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" onChange={uploadFirmware} accept=".bin,.hex,.elf,.img" />
            <button type="button" onClick={triggerUpload} disabled={loadingIot}
              className="w-full border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-champagne/40 active:scale-[0.98]"
              style={{ borderColor: 'rgba(247,231,206,0.15)', background: 'rgba(247,231,206,0.02)' }}>
              {loadingIot ? (
                <RefreshCw size={28} className="mx-auto mb-2 animate-spin" style={{ color: C.champagne }} />
              ) : (
                <Upload size={28} className="mx-auto mb-2" style={{ color: 'rgba(247,231,206,0.3)' }} />
              )}
              <p className="text-sm font-semibold" style={{ color: C.champagneDim }}>{loadingIot ? 'Analyzing Binary...' : 'Click to Load Firmware'}</p>
              <p className="text-[10px] text-white/30 mt-1 uppercase tracking-tighter">
                {iotFw ? iotFw.filename : (iotFileIdx === 0 ? 'pacemaker_v3.2.1.bin' : 'insulin_pump_fw_2.0.bin')}
              </p>
            </button>
          </div>

          <div className="glass-panel forest-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} style={{ color: iotFw ? C.danger : 'rgba(255,255,255,0.2)' }} />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Risky Functions Detected</span>
              <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(192,57,43,0.15)', color: iotFw ? C.danger : 'rgba(255,255,255,0.1)' }}>{iotFw ? iotFw.risky_functions.length : 0} FOUND</span>
            </div>
            {!iotFw ? (
              <div className="h-20 flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest italic">Awaiting Firmware Analysis...</div>
            ) : (
              <div className="space-y-2">
                {iotFw.risky_functions.map((fn, i) => (
                  <motion.div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)' }}>
                    <span className="font-mono font-bold text-sm" style={{ color: riskColor(fn.risk), minWidth: 80 }}>{fn.name}()</span>
                    <span className="font-mono text-[10px] text-white/30" style={{ minWidth: 110 }}>{fn.addr}</span>
                    <Badge color={fn.risk === 'Critical' ? 'danger' : 'warning'}>{fn.risk}</Badge>
                    <span className="text-xs text-white/50 leading-relaxed">{fn.detail}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel forest-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={14} style={{ color: C.champagne }} />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Fuzzing Control</span>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="flex-1 py-2 rounded-lg bg-forest/20 text-forestBright border border-forest/30 text-[10px] font-bold uppercase">QEMU Mode</button>
              <button className="flex-1 py-2 rounded-lg bg-white/5 text-white/20 border border-white/5 text-[10px] font-bold uppercase">Packet Sim</button>
            </div>
            <button onClick={() => setIotFuzzing(!iotFuzzing)} disabled={!iotFw}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${iotFuzzing ? 'bg-danger/10 text-danger border border-danger/30' : 'bg-champagne text-background'}`}>
              {iotFuzzing ? <><Square size={14} /> Stop IoT Fuzzing</> : <><Play size={14} /> Start IoT Fuzzing</>}
            </button>
          </div>

          <div className="glass-panel forest-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} style={{ color: C.champagne }} />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Live Execution Monitor</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'CPU', val: `${iotStats.cpu}%`, ic: Cpu, col: C.champagne },
                { label: 'Mem', val: `${iotStats.mem}MB`, ic: HardDrive, col: C.forestBright },
                { label: 'Faults', val: iotStats.crashes, ic: AlertTriangle, col: iotStats.crashes > 0 ? C.danger : C.champagneDim }
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <s.ic size={14} className="mx-auto mb-1" style={{ color: s.col }} />
                  <p className="text-[9px] text-white/30 uppercase">{s.label}</p>
                  <p className="font-mono font-bold text-base mt-0.5" style={{ color: s.col }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#0b0f0c', color: '#fdf3e4' }}>
      <aside className="w-60 flex flex-col border-r" style={{ background: '#0e1610', borderColor: 'rgba(247,231,206,0.06)' }}>
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.champagneDim})` }}>
            <Shield size={17} style={{ color: '#0b0f0c' }} />
          </div>
          <h1 className="font-bold tracking-tight text-lg" style={{ color: C.champagne }}>AEGIS<span style={{ color: C.forestBright }}>FUZZ</span></h1>
        </div>
        <nav className="flex-1 mt-2">
          {[
            { icon: Activity,       label: 'Healthcare Command', id: 'Dashboard' },
            { icon: Database,       label: 'DICOM/HL7 Protocols', id: 'DICOM' },
            { icon: HeartPulse,     label: 'EHR API Defense',    id: 'EHR' },
            { icon: Brain,          label: 'NeuroFuzz AI',        id: 'AI' },
            { icon: Sparkles,       label: 'AI Remediation',      id: 'Remediation' },
            { icon: FileText,       label: 'Compliance Reports',  id: 'Reports' },
            { icon: Settings,       label: 'Settings',            id: 'Settings' },
          ].map(({ icon, label, id }) => (
            <SidebarItem key={id} icon={icon} label={label}
              active={activeModule === id}
              onClick={() => setActiveModule(id)} />
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(247,231,206,0.06)' }}>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(247,231,206,0.04)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.champagneDim})`, color: '#0b0f0c' }}>AD</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.champagne }}>Admin User</p>
              <p className="text-[10px] text-white/30">Security Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-7 border-b" style={{ borderColor: 'rgba(247,231,206,0.06)', background: 'rgba(14,22,16,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input type="text" placeholder="Search vulnerabilities..." className="w-full bg-white/5 border border-white/8 rounded-full py-1.5 pl-9 pr-4 text-sm text-white/70 focus:outline-none" style={{ borderColor: 'rgba(247,231,206,0.1)' }} />
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: running ? C.forestBright : 'rgba(255,255,255,0.2)', animation: running ? 'pulse 1.5s infinite' : 'none' }} />
              <span className="text-[10px] font-mono text-white/40">{running ? 'SCANNING' : 'IDLE'}</span>
            </div>
            <button onClick={toggleFuzzing} className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all"
              style={running ? { background: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.4)' } : { background: `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`, color: '#0b0f0c' }}>
              {running ? <><Square size={14} /> Stop Session</> : <><Play size={14} /> Start Fuzzing</>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-7 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeModule === 'Dashboard' && <Dashboard />}
              {activeModule === 'DICOM' && <DicomModule />}
              {activeModule === 'EHR' && <EhrModule />}
              {activeModule === 'AI' && <NeuroFuzzModule />}
              {activeModule === 'Remediation' && <AiRemediationModule />}
              {activeModule === 'Reports' && <ComplianceModule />}
              {activeModule === 'Settings' && <SettingsModule />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
