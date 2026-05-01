import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Shield, Zap, Terminal, AlertTriangle, 
  Cpu, HardDrive, BarChart3, Settings, Upload, 
  Database, Brain, Users, Globe, Play, Square,
  ChevronRight, Search, Bell
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- Components ---

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-4 hacker-border flex flex-col gap-2 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon size={20} />
      </div>
      <div className="text-[10px] text-white/30 font-mono">LIVE_STREAM</div>
    </div>
    <div>
      <div className="text-xs text-white/50 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-mono font-bold ${color === 'cyber-green' ? 'text-cyber-green' : 'text-white'}`}>
        {value}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 h-[2px] bg-cyber-green/30 w-0 group-hover:w-full transition-all duration-500" />
  </motion.div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group
      ${active ? 'bg-cyber-green/10 text-cyber-green border-r-2 border-cyber-green' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
  >
    <Icon size={20} className={active ? 'drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]' : ''} />
    <span className="text-sm font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto"><ChevronRight size={14} /></motion.div>}
  </div>
);

// --- Main App ---

export default function App() {
  const [stats, setStats] = useState({
    execs_per_sec: 0,
    paths_total: 0,
    crashes_unique: 0,
    hangs_unique: 0,
    stability: 100,
    coverage: 0,
    cpu_usage: 0,
    mem_usage: 0
  });
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [aiReport, setAiReport] = useState(null);
  
  const ws = useRef(null);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:8000/api/status')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setLogs(data.logs);
        setRunning(data.running);
      });

    // WebSocket init
    ws.current = new WebSocket('ws://localhost:8000/ws');
    
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'init') {
        setStats(msg.data.stats);
        setLogs(msg.data.logs);
        setRunning(msg.data.running);
      } else if (msg.type === 'update') {
        setStats(msg.stats);
        if (msg.log) setLogs(prev => [...prev.slice(-49), msg.log]);
        
        // Update chart data
        setChartData(prev => [
          ...prev.slice(-19), 
          { time: new Date().toLocaleTimeString(), val: msg.stats.execs_per_sec }
        ]);
      }
    };

    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleFuzzing = () => {
    const action = running ? 'stop' : 'start';
    ws.current.send(JSON.stringify({ action }));
    setRunning(!running);
  };

  const runAIAnalysis = async () => {
    const res = await fetch('http://localhost:8000/api/analyze');
    const report = await res.json();
    setAiReport(report);
  };

  return (
    <div className="flex h-screen bg-cyber-black text-white font-sans selection:bg-cyber-green/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col glass-panel rounded-none">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyber-green rounded flex items-center justify-center text-black shadow-neon">
            <Shield size={20} />
          </div>
          <h1 className="font-bold tracking-tighter text-xl">AEGIS<span className="text-cyber-green">FUZZ</span></h1>
        </div>

        <nav className="flex-1 mt-4">
          <SidebarItem icon={Activity} label="Dashboard" active={activeModule === 'Dashboard'} onClick={() => setActiveModule('Dashboard')} />
          <SidebarItem icon={Play} label="Start Fuzzing" active={activeModule === 'Fuzzing'} onClick={() => setActiveModule('Fuzzing')} />
          <SidebarItem icon={Upload} label="Upload Binary" active={activeModule === 'Upload'} />
          <SidebarItem icon={AlertTriangle} label="Vulnerability Reports" active={activeModule === 'Reports'} onClick={() => setActiveModule('Reports')} />
          <SidebarItem icon={Brain} label="AI Analysis" active={activeModule === 'AI'} onClick={() => setActiveModule('AI')} />
          <SidebarItem icon={Database} label="Docker Sandbox" active={activeModule === 'Docker'} />
          <SidebarItem icon={Settings} label="Settings" active={activeModule === 'Settings'} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyber-green to-cyber-blue flex items-center justify-center font-bold text-xs">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin_User</p>
              <p className="text-[10px] text-white/40 truncate">System Overseer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-cyber-black/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-cyber-green transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search sessions, binaries, or vulnerabilities..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyber-green/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${running ? 'bg-cyber-green animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[10px] font-mono text-white/50">{running ? 'SYSTEM_ONLINE' : 'SYSTEM_IDLE'}</span>
            </div>
            <button className="text-white/50 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-red rounded-full" />
            </button>
            <button 
              onClick={toggleFuzzing}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300
                ${running 
                  ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/50 hover:bg-cyber-red hover:text-white' 
                  : 'bg-cyber-green text-black hover:shadow-neon-strong active:scale-95'}`}
            >
              {running ? <><Square size={16} /> Stop Session</> : <><Play size={16} /> Start Fuzzing</>}
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {activeModule === 'Dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Zap} label="Executions / Sec" value={stats.execs_per_sec.toLocaleString()} color="cyber-green" delay={0.1} />
                <StatCard icon={Globe} label="Unique Paths" value={stats.paths_total} color="white" delay={0.2} />
                <StatCard icon={AlertTriangle} label="Unique Crashes" value={stats.crashes_unique} color={stats.crashes_unique > 0 ? 'cyber-red' : 'white'} delay={0.3} />
                <StatCard icon={Activity} label="Stability" value={`${stats.stability}%`} color="white" delay={0.4} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph */}
                <div className="lg:col-span-2 glass-panel p-6 hacker-border flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-white/70">
                      <BarChart3 size={16} className="text-cyber-green" /> 
                      Throughput Analysis
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-cyber-green/10 text-[10px] text-cyber-green">REAL_TIME</span>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #ffffff10', fontSize: '10px' }}
                          itemStyle={{ color: '#00ff41' }}
                        />
                        <Area type="monotone" dataKey="val" stroke="#00ff41" fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resource Usage */}
                <div className="glass-panel p-6 hacker-border space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
                    <Cpu size={16} className="text-cyber-blue" /> System Resources
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">CPU Usage</span>
                        <span className="font-mono text-cyber-blue">{stats.cpu_usage}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-cyber-blue"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.cpu_usage}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Memory Heap</span>
                        <span className="font-mono text-cyber-green">{stats.mem_usage}MB</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-cyber-green"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.mem_usage / 512) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyber-blue/5 border border-cyber-blue/20">
                      <HardDrive size={16} className="text-cyber-blue" />
                      <div className="text-[10px]">
                        <p className="text-white/70 font-bold uppercase">Docker Isolation Active</p>
                        <p className="text-white/40">Container: afl-instance-main</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal View */}
              <div className="glass-panel overflow-hidden hacker-border flex flex-col">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyber-green" />
                    <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Live Execution Stream</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyber-red/20" />
                    <div className="w-2 h-2 rounded-full bg-cyber-blue/20" />
                    <div className="w-2 h-2 rounded-full bg-cyber-green/20" />
                  </div>
                </div>
                <div className="h-64 p-4 font-mono text-xs overflow-y-auto terminal-scrollbar bg-black/40">
                  {logs.map((log, i) => (
                    <div key={i} className="mb-1 flex gap-4">
                      <span className="text-white/20 whitespace-nowrap">{log.split(']')[0] + ']'}</span>
                      <span className={`
                        ${log.includes('CRITICAL') ? 'text-cyber-red' : ''}
                        ${log.includes('New path') ? 'text-cyber-green' : ''}
                        ${log.includes('WARNING') ? 'text-yellow-500' : ''}
                        text-white/80
                      `}>
                        {log.split(']')[1]}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </>
          )}

          {activeModule === 'AI' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter">NeuroFuzz <span className="text-cyber-green">AI Analyzer</span></h2>
                  <p className="text-white/40 text-sm">Advanced neural classification of memory corruption patterns.</p>
                </div>
                <button 
                  onClick={runAIAnalysis}
                  className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-cyber-green transition-all"
                >
                  Trigger AI Deep Scan
                </button>
              </div>

              {aiReport ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel p-8 hacker-border space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 rounded bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-[10px] font-bold">
                        {aiReport.severity.toUpperCase()} SEVERITY
                      </div>
                      <div className="text-white/30 font-mono text-xs">{aiReport.id}</div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-cyber-green">{aiReport.type}</h3>
                      <p className="text-white/50 mt-2 font-mono">{aiReport.cwe}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-cyber-green">
                      <p className="text-xs text-white/40 uppercase mb-1">Root Cause Analysis</p>
                      <p className="text-sm leading-relaxed">{aiReport.root_cause}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="glass-panel p-6 hacker-border">
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Remediation Strategy</h4>
                      <p className="text-sm text-white/70 leading-relaxed italic">
                        "{aiReport.recommendation}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="glass-panel p-6 hacker-border text-center">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Exploitability</p>
                        <p className="text-xl font-bold text-cyber-blue">{aiReport.exploitability}</p>
                      </div>
                      <div className="glass-panel p-6 hacker-border text-center">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Risk Factor</p>
                        <p className="text-xl font-bold text-cyber-red">9.8/10</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] glass-panel hacker-border flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                    <Brain size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Crash Data Selected</h3>
                  <p className="text-white/40 max-w-xs text-sm">Initiate a fuzzing session and wait for a crash event to trigger the AI-powered vulnerability analysis engine.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
