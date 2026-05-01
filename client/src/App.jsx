import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, Zap, Terminal, AlertTriangle,
  Cpu, HardDrive, BarChart3, Settings, Upload,
  Database, Brain, Play, Square, ChevronRight,
  Search, Bell, HeartPulse, FileText, Lock, Code2,
  Microchip, Wifi, Flame, ChevronDown, CheckCircle2, Sparkles,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DicomModule from './DicomModule.jsx';
import EhrModule from './EhrModule.jsx';
import NeuroFuzzModule from './NeuroFuzzModule.jsx';
import ComplianceModule from './ComplianceModule.jsx';
import AiRemediationModule from './AiRemediationModule.jsx';
import SettingsModule from './SettingsModule.jsx';
import IntelligenceModule from './IntelligenceModule.jsx';

// ── Champagne/Forest color tokens ──────────────────────────────
const C = {
  champagne: '#f7e7ce',
  champagneDim: '#c9b99a',
  forest: '#3d7a53',
  forestBright: '#4e9e6a',
  danger: '#c0392b',
  warning: '#d4a017',
  info: '#2e86ab',
};

// ── Reusable components ────────────────────────────────────────
const Badge = ({ children, color = 'champagne' }) => {
  const colors = {
    champagne: 'bg-[#f7e7ce]/10 text-[#f7e7ce] border-[#f7e7ce]/30',
    forest: 'bg-[#3d7a53]/15 text-[#4e9e6a] border-[#3d7a53]/40',
    danger: 'bg-red-900/20 text-red-400 border-red-700/40',
    warning: 'bg-yellow-900/20 text-yellow-400 border-yellow-700/40',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${colors[color]}`}>
      {children}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, accent = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-panel forest-border p-4 flex flex-col gap-2 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start">
      <div style={{ background: accent ? 'rgba(247,231,206,0.1)' : 'rgba(61,122,83,0.1)', color: accent ? C.champagne : C.forestBright }}
        className="p-2 rounded-lg">
        <Icon size={18} />
      </div>
      <span className="text-[9px] text-white/20 font-mono">LIVE</span>
    </div>
    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</div>
      <div style={{ color: accent ? C.champagne : 'white' }} className="text-2xl font-mono font-bold">{value}</div>
    </div>
    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
      style={{ background: `linear-gradient(90deg, ${C.forest}, ${C.champagne})` }} />
  </motion.div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200"
    style={{
      background: active ? 'rgba(247,231,206,0.06)' : 'transparent',
      color: active ? C.champagne : 'rgba(255,255,255,0.4)',
      borderRight: active ? `2px solid ${C.champagne}` : '2px solid transparent',
    }}>
    <Icon size={18} />
    <span className="text-sm font-medium">{label}</span>
    {active && <ChevronRight size={13} className="ml-auto" style={{ color: C.champagneDim }} />}
  </div>
);

const SeverityBadge = ({ s }) => {
  const m = { Critical: 'danger', High: 'danger', Medium: 'warning', Low: 'forest' };
  return <Badge color={m[s] || 'champagne'}>{s}</Badge>;
};

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [stats, setStats] = useState({
    execs_per_sec: 0, paths_total: 0, crashes_unique: 0,
    hangs_unique: 0, stability: 100, coverage: 0, cpu_usage: 0, mem_usage: 0
  });
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [aiReport, setAiReport] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [latestCrash, setLatestCrash] = useState({});

  const [iotFw, setIotFw] = useState(null);
  const [iotFuzzing, setIotFuzzing] = useState(false);
  const [iotMode, setIotMode] = useState('QEMU');
  const [iotFileIdx, setIotFileIdx] = useState(0);
  const [iotLogs, setIotLogs] = useState([]);
  const [iotStats, setIotStats] = useState({ cpu: 0, mem: 0, crashes: 0 });
  const iotTimerRef = useRef(null);
  const [loadingIot, setLoadingIot] = useState(false);

  const ws = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/status')
      .then(r => r.json())
      .then(d => { setStats(d.stats); setLogs(d.logs); setRunning(d.running); })
      .catch(() => console.warn('Backend unreachable — status fetch failed'));

    let reconnectTimer = null;

    const connect = () => {
      const socket = new WebSocket('ws://127.0.0.1:8000/ws');
      ws.current = socket;

      socket.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'init') {
          setStats(msg.data.stats); setLogs(msg.data.logs); setRunning(msg.data.running);
        } else if (msg.type === 'update') {
          setStats(msg.stats);
          if (msg.log) setLogs(p => [...p.slice(-79), msg.log]);
          if (msg.latest_crash) setLatestCrash(msg.latest_crash);
          setChartData(p => [...p.slice(-19), { t: new Date().toLocaleTimeString('en',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}), v: msg.stats.execs_per_sec }]);
        }
      };

      socket.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws.current?.close();
    };
  }, []);

  useEffect(() => { termRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const toggleFuzzing = () => {
    ws.current?.send(JSON.stringify({ action: running ? 'stop' : 'start' }));
    setRunning(!running);
  };

  const startIotFuzz = () => {
    if (iotFuzzing) {
      clearInterval(iotTimerRef.current);
      setIotFuzzing(false);
      setIotLogs(p => [...p, `[${new Date().toLocaleTimeString()}] [INFO] AEGIS-IoT: Fuzzing halted by user.`]);
      return;
    }
    if (!iotFw) { alert('Please upload firmware first.'); return; }
    setIotFuzzing(true);
    const msgs = [
      `[INFO] AEGIS-IoT: Starting ${iotMode} sandbox for ${iotFw.filename}`,
      `[INFO] AEGIS-IoT: Architecture ${iotFw.architecture} detected. Loading seed corpus...`,
      `[INFO] FUZZER: Mutating BLE packet inputs — 1024 variants generated`,
      `[WARNING] ANOMALY: Unexpected response at entry 0x08004A2F (strcpy region)`,
      `[CRITICAL] CRASH: Buffer overflow confirmed — strcpy in BLE handler (offset 0x4A2F)`,
      `[INFO] FUZZER: Pivoting to RF packet simulation...`,
      `[WARNING] ANOMALY: Heap allocation failure in malloc at 0x0800F112`,
      `[CRITICAL] CRASH: NULL dereference after malloc failure — BLE stack panic`,
      `[INFO] AEGIS-IoT: Coverage now at 68%. Exploring telemetry logger...`,
      `[INFO] FUZZER: Injecting format string payloads into sprintf at 0x0800A344`,
    ];
    let i = 0;
    iotTimerRef.current = setInterval(() => {
      if (i < msgs.length) {
        setIotLogs(p => [...p.slice(-49), `[${new Date().toLocaleTimeString()}] ${msgs[i++]}`]);
      }
      setIotStats({
        cpu: Math.floor(55 + Math.random() * 35),
        mem: Math.floor(80 + Math.random() * 120),
        crashes: Math.floor(Math.random() * 3),
      });
    }, 1200);
  };

  const runAIAnalysis = async () => {
    try {
      const r = await fetch('http://127.0.0.1:8000/api/analyze');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setAiReport(await r.json());
    } catch (e) {
      console.error('AI analysis failed:', e);
    }
  };

  const uploadFirmware = async () => {
    setIotFw(null);
    setLoadingIot(true);
    setIotLogs([`[${new Date().toLocaleTimeString()}] [INFO] AEGIS-IoT: Preparing analyzer hub...`]);
    setIotStats({ cpu: 0, mem: 0, crashes: 0 });
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/iot/analyze?file_index=${iotFileIdx}`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Simulate real binary analysis time
      await new Promise(r => setTimeout(r, 1500));
      
      setIotFw(data);
      setIotLogs(p => [...p, `[${new Date().toLocaleTimeString()}] [INFO] AEGIS-IoT: Analysis complete for ${data.filename}`]);
    } catch (e) {
      setIotLogs(p => [...p, `[${new Date().toLocaleTimeString()}] [ERROR] AEGIS-IoT: Connection refused — is the backend running?`]);
    } finally {
      setLoadingIot(false);
    }
  };

  const runFullSweep = async () => {
    try {
      const r = await fetch('http://127.0.0.1:8000/api/analyze/all');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setAllReports(data);
      setSelectedReport(data[0]);
    } catch (e) {
      console.error('Full sweep failed:', e);
    }
  };

  const logColor = (log) => {
    if (log.includes('[CRITICAL]')) return C.danger;
    if (log.includes('[WARNING]')) return C.warning;
    if (log.includes('IDOR') || log.includes('CRASH')) return C.danger;
    return 'rgba(247,231,206,0.6)';
  };

  // ── Risk color helper ──
  const riskColor = (r) => r === 'Critical' ? C.danger : r === 'High' ? C.warning : C.champagneDim;

  // ── Heatmap bar color ──
  const heatColor = (score) => {
    if (score >= 80) return `linear-gradient(90deg, ${C.danger}, #e74c3c)`;
    if (score >= 55) return `linear-gradient(90deg, ${C.warning}, #f39c12)`;
    if (score >= 30) return `linear-gradient(90deg, ${C.forestBright}, #27ae60)`;
    return `linear-gradient(90deg, #2c3e50, #3d7a53)`;
  };

  // ── Dashboard ──
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: C.champagne }}>Healthcare Command Center</h2>
          <p className="text-sm text-white/40 mt-1">Real-time medical system fuzzing telemetry</p>
        </div>
        {stats.crashes_unique > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border"
            style={{ background: 'rgba(192,57,43,0.15)', borderColor: 'rgba(192,57,43,0.4)', color: '#e74c3c' }}>
            <AlertTriangle size={16} />
            <span className="text-sm font-bold">{stats.crashes_unique} Vulnerabilities Found</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Executions / sec" value={stats.execs_per_sec.toLocaleString()} accent delay={0.05} />
        <StatCard icon={Activity} label="Paths Explored" value={stats.paths_total} delay={0.1} />
        <StatCard icon={AlertTriangle} label="Unique Crashes" value={stats.crashes_unique} accent={stats.crashes_unique > 0} delay={0.15} />
        <StatCard icon={HardDrive} label="Coverage" value={`${stats.coverage?.toFixed(1)}%`} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-panel forest-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} style={{ color: C.champagne }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Fuzzing Throughput</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.champagne} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.champagne} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111a14', border: '1px solid rgba(247,231,206,0.15)', fontSize: 11, color: C.champagne }} />
                <Area type="monotone" dataKey="v" stroke={C.champagne} strokeWidth={1.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource panel */}
        <div className="glass-panel forest-border p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Cpu size={15} style={{ color: C.forestBright }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">System Resources</span>
          </div>
          {[
            { label: 'CPU Usage', value: stats.cpu_usage, unit: '%', color: C.champagne },
            { label: 'Memory Heap', value: stats.mem_usage, unit: 'MB', color: C.forestBright },
            { label: 'Stability', value: stats.stability, unit: '%', color: C.champagneDim },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">{label}</span>
                <span className="font-mono" style={{ color }}>{value}{unit}</span>
              </div>
              <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div className="h-full rounded-full" style={{ background: color }}
                  animate={{ width: `${Math.min(100, value)}%` }} transition={{ type: 'spring' }} />
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-white/5 text-[10px] space-y-1">
            <div className="flex items-center gap-2 text-white/40">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: running ? C.forestBright : 'rgba(255,255,255,0.2)', animation: running ? 'pulse 1.5s infinite' : 'none' }} />
              <span>QEMU Target: pacemaker-7721</span>
            </div>
            <div className="text-white/30">EHR API: 127.0.0.1:8000</div>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="glass-panel forest-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <Terminal size={13} style={{ color: C.champagne }} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Live Execution Stream</span>
          <div className="ml-auto flex gap-1.5">
            {['#c0392b40','#d4a01740','#3d7a5340'].map((c,i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
          </div>
        </div>
        <div className="h-56 p-3 font-mono text-[11px] overflow-y-auto terminal-scrollbar" style={{ background: 'rgba(0,0,0,0.5)' }}>
          {logs.map((log, i) => {
            const parts = log.match(/^(\[\d{2}:\d{2}:\d{2}\])\s(.*)$/);
            return (
              <div key={i} className="mb-1 flex gap-3">
                <span className="text-white/20 shrink-0">{parts?.[1] ?? ''}</span>
                <span style={{ color: logColor(log) }}>{parts?.[2] ?? log}</span>
              </div>
            );
          })}
          <div ref={termRef} />
        </div>
      </div>
    </div>
  );

  // ── IoT Firmware Module ──
  const IoTFirmware = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: C.champagne }}>Medical IoT <span style={{ color: C.forestBright }}>Firmware Analyzer</span></h2>
        <p className="text-sm text-white/40 mt-1">Static analysis, live fuzzing, and vulnerability heatmap for embedded medical devices</p>
      </div>

      {/* Upload + Fuzzing Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Firmware Upload */}
        <div className="glass-panel forest-border p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Upload size={15} style={{ color: C.champagne }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Firmware Upload</span>
          </div>

          <div className="flex gap-3">
            {[{label:'Pacemaker v3.2.1', i:0},{label:'Insulin Pump v2.0', i:1}].map(({label, i}) => (
              <button key={i} onClick={() => setIotFileIdx(i)}
                className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                style={iotFileIdx === i
                  ? { background: 'rgba(247,231,206,0.12)', color: C.champagne, borderColor: C.champagneDim }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.1)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <button className="w-full border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-champagne/40"
            style={{ borderColor: 'rgba(247,231,206,0.15)', background: 'rgba(247,231,206,0.02)' }}
            onClick={uploadFirmware}
            disabled={loadingIot}>
            {loadingIot ? (
              <RefreshCw size={28} className="mx-auto mb-2 animate-spin" style={{ color: C.champagne }} />
            ) : (
              <Upload size={28} className="mx-auto mb-2" style={{ color: 'rgba(247,231,206,0.3)' }} />
            )}
            <p className="text-sm font-semibold" style={{ color: C.champagneDim }}>
              {loadingIot ? 'Analyzing Binary...' : 'Click to Load Firmware'}
            </p>
            <p className="text-[10px] text-white/30 mt-1">
              {iotFileIdx === 0 ? 'pacemaker_v3.2.1.bin' : 'insulin_pump_fw_2.0.bin'}
            </p>
          </button>

          {iotFw && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: C.forestBright }}>
                <CheckCircle2 size={13} /> Firmware analyzed successfully
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[['Architecture', iotFw.architecture],['Entry Point', iotFw.entry_point],
                  ['File Size', iotFw.file_size],['Compiler', iotFw.compiler]].map(([k,v]) => (
                  <div key={k} className="p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-white/30 text-[9px] uppercase">{k}</p>
                    <p className="font-mono mt-0.5" style={{ color: C.champagneDim }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fuzzing Control + Live Monitor */}
        <div className="space-y-4">
          <div className="glass-panel forest-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Microchip size={15} style={{ color: C.champagne }} />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Fuzzing Control</span>
            </div>

            <div className="flex gap-2">
              {['QEMU','Packet Sim'].map(m => (
                <button key={m} onClick={() => setIotMode(m)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                  style={iotMode === m
                    ? { background: 'rgba(61,122,83,0.2)', color: C.forestBright, borderColor: C.forest }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {m === 'QEMU' ? '🖥 QEMU Mode' : '📡 Packet Sim'}
                </button>
              ))}
            </div>

            <button onClick={startIotFuzz}
              className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={iotFuzzing
                ? { background: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.4)' }
                : { background: `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`, color: '#0b0f0c' }}>
              {iotFuzzing ? <><Square size={14}/> Stop IoT Fuzzing</> : <><Play size={14}/> Start IoT Fuzzing</>}
            </button>
          </div>

          {/* Live Execution Monitor */}
          {iotFw && (
            <div className="glass-panel forest-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={15} style={{ color: C.champagne }} />
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Live Execution Monitor</span>
                {iotFuzzing && <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(61,122,83,0.2)', color: C.forestBright }}>ACTIVE</span>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{label:'CPU',value:`${iotStats.cpu}%`,color:C.champagne,icon:Cpu},
                  {label:'Memory',value:`${iotStats.mem}MB`,color:C.forestBright,icon:HardDrive},
                  {label:'Crashes 💥',value:iotStats.crashes,color:iotStats.crashes>0?C.danger:C.champagneDim,icon:AlertTriangle}].map(({label,value,color,icon:Ic}) => (
                  <div key={label} className="p-3 rounded-lg text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <Ic size={14} className="mx-auto mb-1" style={{ color }} />
                    <p className="text-[9px] text-white/30 uppercase">{label}</p>
                    <p className="font-mono font-bold text-base mt-0.5" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!iotFw && (
            <div className="h-full flex flex-col items-center justify-center glass-panel forest-border p-8 text-center opacity-40">
              <Shield size={32} className="mb-4" />
              <p className="text-sm font-bold">Analysis Offline</p>
              <p className="text-[10px] mt-1">Upload a binary to activate monitoring</p>
            </div>
          )}
        </div>
      </div>

      {/* Memory Sections */}
      {iotFw && (
        <div className="glass-panel forest-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={15} style={{ color: C.forestBright }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Memory Sections</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-white/30 text-left border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {['Section','Address','Size','Flags'].map(h => <th key={h} className="pb-2 font-medium pr-6">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {iotFw.sections.map((s,i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    <td className="py-1.5 pr-6" style={{ color: C.champagne }}>{s.name}</td>
                    <td className="py-1.5 pr-6 text-white/50">{s.addr}</td>
                    <td className="py-1.5 pr-6 text-white/50">{s.size}</td>
                    <td className="py-1.5"><span className="px-2 py-0.5 rounded text-[9px]" style={{ background: 'rgba(61,122,83,0.15)', color: C.forestBright }}>{s.flags}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risky Functions */}
      {iotFw && (
        <div className="glass-panel forest-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} style={{ color: C.danger }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Risky Functions Detected</span>
            <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(192,57,43,0.15)', color: C.danger }}>{iotFw.risky_functions.length} FOUND</span>
          </div>
          <div className="space-y-2">
            {iotFw.risky_functions.map((fn, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)' }}>
                <span className="font-mono font-bold text-sm" style={{ color: riskColor(fn.risk), minWidth: 80 }}>{fn.name}()</span>
                <span className="font-mono text-[10px] text-white/30" style={{ minWidth: 110 }}>{fn.addr}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                  style={{ color: riskColor(fn.risk), borderColor: `${riskColor(fn.risk)}40`, background: `${riskColor(fn.risk)}10` }}>
                  {fn.risk}
                </span>
                <span className="text-xs text-white/50 leading-relaxed">{fn.detail}</span>
              </motion.div>
            ))}
          </div>

          {/* Suspicious Strings */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-[10px] text-white/30 uppercase mb-2">Strings of Interest</p>
            <div className="flex flex-wrap gap-2">
              {iotFw.strings_of_interest.map(s => (
                <span key={s} className="font-mono text-[11px] px-2 py-0.5 rounded"
                  style={{ background: 'rgba(192,57,43,0.12)', color: '#e8a598', border: '1px solid rgba(192,57,43,0.25)' }}>
                  "{s}"
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Vulnerability Heatmap */}
      {iotFw && (
        <div className="glass-panel forest-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Flame size={15} style={{ color: C.danger }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Vulnerability Heatmap</span>
            <span className="text-[10px] text-white/30 ml-auto">Score = exposure risk (0–100)</span>
          </div>
          <div className="space-y-3">
            {iotFw.heatmap.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.06 }} style={{ originX: 0 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white/70">{h.module}</span>
                  <div className="flex items-center gap-3">
                    {h.crashes > 0 && <span className="text-[10px] font-bold" style={{ color: C.danger }}>💥 {h.crashes} crashes</span>}
                    <span className="font-mono text-xs font-bold" style={{ color: h.score >= 80 ? C.danger : h.score >= 55 ? C.warning : C.champagneDim }}>
                      {h.score}/100
                    </span>
                  </div>
                </div>
                <div className="h-5 w-full rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div className="h-full rounded-lg relative"
                    style={{ background: heatColor(h.score), width: `${h.score}%` }}
                    initial={{ width: 0 }} animate={{ width: `${h.score}%` }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.8, ease: 'easeOut' }}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 9px)' }} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Heatmap Legend */}
          <div className="flex gap-5 mt-5 pt-4 border-t text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {[{color:C.danger,label:'Critical (80–100)'},
              {color:C.warning,label:'High (55–79)'},
              {color:C.forestBright,label:'Medium (30–54)'},
              {color:'#3d4f44',label:'Low (0–29)'}].map(({color,label}) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live IoT Execution Stream */}
      {iotFw && (
        <div className="glass-panel forest-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.05)' }}>
            <Terminal size={13} style={{ color: C.champagne }} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">IoT Execution Stream</span>
          </div>
          <div className="h-48 p-3 font-mono text-[11px] overflow-y-auto terminal-scrollbar" style={{ background: 'rgba(0,0,0,0.5)' }}>
            {iotLogs.length === 0 && <p className="text-white/20">Start fuzzing to see live output...</p>}
            {iotLogs.map((log, i) => {
              const col = log.includes('[CRITICAL]') ? C.danger : log.includes('[WARNING]') ? C.warning : 'rgba(247,231,206,0.6)';
              return <div key={i} className="mb-1" style={{ color: col }}>{log}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── AI Analysis ──
  const AIAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: C.champagne }}>NeuroFuzz <span style={{ color: C.forestBright }}>AI Analyzer</span></h2>
          <p className="text-sm text-white/40 mt-1">Neural classification of medical software vulnerabilities with exploitation guidance</p>
        </div>
        <div className="flex gap-3">
          <button onClick={runAIAnalysis}
            className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{ background: 'rgba(247,231,206,0.1)', color: C.champagne, border: `1px solid rgba(247,231,206,0.3)` }}>
            Analyze Latest Crash
          </button>
          <button onClick={runFullSweep}
            className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all champagne-glow-btn">
            Full AI Sweep
          </button>
        </div>
      </div>

      {/* Single report view */}
      {aiReport && !allReports.length && <ReportCard report={aiReport} />}

      {/* Full sweep list */}
      {allReports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            {allReports.map((r, i) => (
              <div key={i} onClick={() => setSelectedReport(r)} className="glass-panel forest-border p-3 cursor-pointer transition-all"
                style={{ borderColor: selectedReport?.id === r.id ? C.champagne : undefined }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono" style={{ color: C.champagneDim }}>{r.id}</span>
                  <SeverityBadge s={r.severity} />
                </div>
                <p className="text-sm font-semibold text-white/80">{r.type}</p>
                <p className="text-[10px] text-white/40 mt-1">{r.target}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            {selectedReport && <ReportCard report={selectedReport} />}
          </div>
        </div>
      )}

      {!aiReport && !allReports.length && (
        <div className="h-72 glass-panel forest-border flex flex-col items-center justify-center text-center p-10">
          <Brain size={40} style={{ color: 'rgba(247,231,206,0.2)' }} className="mb-4" />
          <h3 className="text-lg font-bold mb-2">No Analysis Yet</h3>
          <p className="text-sm text-white/40 max-w-xs">Start a fuzzing session to discover vulnerabilities, then trigger the AI Deep Scan to get detailed exploitation reports.</p>
        </div>
      )}
    </div>
  );

  const ReportCard = ({ report }) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="glass-panel forest-border p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <span className="text-[10px] font-mono text-white/30">{report.id} • {report.timestamp}</span>
            <h3 className="text-xl font-bold mt-1" style={{ color: C.champagne }}>{report.type}</h3>
            <p className="text-xs text-white/40 mt-1 font-mono">{report.cwe} — Target: {report.target}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <SeverityBadge s={report.severity} />
            <Badge color="warning">Exploitability: {report.exploitability}</Badge>
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', borderLeft: `3px solid ${C.champagne}` }}>
          <p className="text-[10px] text-white/40 uppercase mb-1.5">Root Cause</p>
          <p className="text-sm leading-relaxed text-white/80">{report.root_cause}</p>
        </div>
      </div>

      {/* Payload */}
      <div className="glass-panel forest-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code2 size={15} style={{ color: C.danger }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.danger }}>Exploitation Payload — What to Input</span>
        </div>
        <p className="text-sm text-white/60 mb-3">{report.exploitation_explanation}</p>
        <div className="p-4 rounded-lg font-mono text-xs overflow-x-auto" style={{ background: '#060a07', border: '1px solid rgba(192,57,43,0.3)', color: '#e8a598', lineHeight: 1.7 }}>
          <pre className="whitespace-pre-wrap">{report.exploitation_payload}</pre>
        </div>
      </div>

      {/* Compliance & Safety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel forest-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} style={{ color: C.champagne }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Compliance Impact</span>
          </div>
          <p className="text-sm font-semibold" style={{ color: C.warning }}>{report.compliance_impact}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse size={14} style={{ color: C.danger }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.danger }}>Patient Safety Risk</span>
          </div>
          <p className="text-sm font-bold text-white/90">{report.patient_safety}</p>
        </div>
      </div>

      {/* Remediation */}
      <div className="glass-panel p-4" style={{ borderLeft: `3px solid ${C.forestBright}` }}>
        <div className="flex items-center gap-2 mb-2">
          <Lock size={14} style={{ color: C.forestBright }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.forestBright }}>Remediation Strategy</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{report.recommendation}</p>
      </div>
    </motion.div>
  );

  // ── Main Render ──
  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#0b0f0c', color: '#fdf3e4' }}>

      {/* Sidebar */}
      <aside className="w-60 flex flex-col border-r" style={{ background: '#0e1610', borderColor: 'rgba(247,231,206,0.06)' }}>
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.champagneDim})` }}>
            <Shield size={17} style={{ color: '#0b0f0c' }} />
          </div>
          <h1 className="font-bold tracking-tight text-lg" style={{ color: C.champagne }}>
            AEGIS<span style={{ color: C.forestBright }}>FUZZ</span>
          </h1>
        </div>

        <nav className="flex-1 mt-2">
          {[
            { icon: Activity,       label: 'Healthcare Command', id: 'Dashboard' },
            { icon: Upload,         label: 'Medical IoT Firmware',id: 'IoT' },
            { icon: Database,       label: 'DICOM/HL7 Protocols', id: 'DICOM' },
            { icon: HeartPulse,     label: 'EHR API Defense',    id: 'EHR' },
            { icon: Brain,          label: 'NeuroFuzz AI',        id: 'AI' },
            { icon: Sparkles,       label: 'AI Remediation',      id: 'Remediation' },
            { icon: FileText,       label: 'Compliance Reports',  id: 'Reports' },
            { icon: Zap,            label: 'AegisIntel',          id: 'Intelligence' },
            { icon: Settings,       label: 'Settings',            id: 'Settings' },
          ].map(({ icon, label, id }) => (
            <SidebarItem key={id} icon={icon} label={label}
              active={activeModule === id}
              onClick={() => setActiveModule(id)} />
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(247,231,206,0.06)' }}>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(247,231,206,0.04)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.champagneDim})`, color: '#0b0f0c' }}>
              AD
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.champagne }}>Admin User</p>
              <p className="text-[10px] text-white/30">Security Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-7 border-b" style={{ borderColor: 'rgba(247,231,206,0.06)', background: 'rgba(14,22,16,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input type="text" placeholder="Search patients, vulnerabilities, endpoints..."
              className="w-full bg-white/5 border border-white/8 rounded-full py-1.5 pl-9 pr-4 text-sm text-white/70 focus:outline-none"
              style={{ borderColor: 'rgba(247,231,206,0.1)' }} />
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{
                background: running ? C.forestBright : 'rgba(255,255,255,0.2)',
                boxShadow: running ? `0 0 8px ${C.forestBright}` : 'none',
                animation: running ? 'pulse 1.5s infinite' : 'none'
              }} />
              <span className="text-[10px] font-mono text-white/40">{running ? 'SCANNING' : 'IDLE'}</span>
            </div>
            <button className="relative text-white/30 hover:text-white/60 transition-colors">
              <Bell size={18} />
              {stats.crashes_unique > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: C.danger }} />}
            </button>
            <button onClick={toggleFuzzing} className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all"
              style={running
                ? { background: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.4)' }
                : { background: `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`, color: '#0b0f0c' }}>
              {running ? <><Square size={14} /> Stop Session</> : <><Play size={14} /> Start Fuzzing</>}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-7 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeModule === 'Dashboard' && <Dashboard />}
              {activeModule === 'IoT' && <IoTFirmware />}
              {activeModule === 'DICOM' && <DicomModule />}
              {activeModule === 'EHR' && <EhrModule />}
              {activeModule === 'AI' && <NeuroFuzzModule />}
              {activeModule === 'Remediation' && <AiRemediationModule />}
              {activeModule === 'Reports' && <ComplianceModule />}
              {activeModule === 'Intelligence' && <IntelligenceModule />}
              {activeModule === 'Settings' && <SettingsModule />}
              {!['Dashboard','IoT','DICOM','EHR','AI','Reports','Remediation','Intelligence','Settings'].includes(activeModule) && (
                <div className="h-80 flex flex-col items-center justify-center text-center">
                  <Shield size={40} className="mb-4" style={{ color: 'rgba(247,231,206,0.15)' }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: C.champagne }}>{activeModule} Module</h3>
                  <p className="text-sm text-white/40">This module is under development. Start from Healthcare Command to begin fuzzing.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
