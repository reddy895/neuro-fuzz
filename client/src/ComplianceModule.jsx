import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Shield, AlertCircle, CheckCircle2, 
  Download, FileJson, Clock, BarChart3, 
  ChevronRight, ArrowRight, Activity, Globe,
  Lock, ExternalLink, Printer, Save
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

export default function ComplianceModule() {
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rRes, tRes, skRes] = await Promise.all([
        fetch(`${BASE}/api/reports/generate`),
        fetch(`${BASE}/api/reports/timeline`),
        fetch(`${BASE}/api/reports/risk-score`)
      ]);
      if (!rRes.ok || !tRes.ok || !skRes.ok) throw new Error('One or more report endpoints failed');
      const [reportData, timelineData, riskData] = await Promise.all([
        rRes.json(), tRes.json(), skRes.json()
      ]);
      setReport(reportData);
      setTimeline(timelineData);
      setRisk(riskData);
    } catch (e) {
      console.error('Failed to fetch compliance data:', e);
    }
  };

  const handleExport = (type) => {
    if (!report) return;
    setLoading(true);
    try {
      if (type === 'json') {
        const blob = new Blob([JSON.stringify({ report, timeline, risk }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.report_id || 'aegis-report'}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (type === 'pdf') {
        // Build a printable HTML page and open it for the user to save as PDF
        const html = `<!DOCTYPE html><html><head><title>${report.report_id}</title>
          <style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#1a3d2b}h2{color:#3d7a53}
          .finding{border:1px solid #ccc;border-radius:8px;padding:16px;margin:12px 0}
          .fix{background:#f0faf4;padding:12px;border-radius:6px;margin-top:8px}</style></head>
          <body>
          <h1>AegisFuzz Security Report — ${report.report_id}</h1>
          <p><strong>Standard:</strong> ${report.compliance_standard}</p>
          <p><strong>Generated:</strong> ${report.timestamp}</p>
          <p>${report.summary}</p>
          <h2>Findings</h2>
          ${report.findings.map(f => `
            <div class="finding">
              <h3>${f.title} <span style="color:${f.severity==='Critical'?'#c0392b':'#d4a017'}">[${f.severity} — ${f.risk_score}]</span></h3>
              <p>${f.description}</p>
              <div class="fix"><strong>Fix:</strong> ${f.fix}</div>
            </div>`).join('')}
          <h2>Risk Score: ${risk?.score} — ${risk?.label}</h2>
          </body></html>`;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
      }
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: '#fdf3e4', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.champagne, margin: 0 }}>
            Compliance <span style={{ color: C.forestBright }}>Reporting Center</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Enterprise-grade vulnerability assessment and HIPAA/FDA compliance auditing
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleExport('pdf')} disabled={loading}
            style={{ 
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: `linear-gradient(135deg, ${C.champagne}, ${C.champagneDim})`, color: '#0b0f0c', 
              border: 'none', display: 'flex', alignItems: 'center', gap: 8 
            }}>
            <Download size={14} /> PDF Report
          </button>
          <button onClick={() => handleExport('json')} disabled={loading}
            style={{ 
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', color: C.champagne, 
              border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 
            }}>
            <FileJson size={14} /> JSON Data
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          
          {/* Report Summary */}
          {report && (
            <Panel style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <Badge color="forest">ACTIVE ASSESSMENT</Badge>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 8 }}>{report.report_id}</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Standard: {report.compliance_standard}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Report Generated</p>
                  <p style={{ fontSize: 12, color: C.champagneDim, fontWeight: 700 }}>{report.timestamp}</p>
                </div>
              </div>

              <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(247,231,206,0.03)', border: '1px solid rgba(247,231,206,0.08)', marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{report.summary}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Shield size={14} style={{ color: C.champagne }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                  Vulnerability Findings & Remediations
                </span>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                {report.findings.map((f, i) => (
                  <div key={i} style={{ 
                    padding: 20, borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: C.champagne }}>{f.title}</h4>
                      <Badge color={f.severity === 'Critical' ? 'danger' : 'warning'}>{f.severity} (Score: {f.risk_score})</Badge>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{f.description}</p>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(61,122,83,0.05)', border: '1px solid rgba(61,122,83,0.2)' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.forestBright, textTransform: 'uppercase', marginBottom: 4 }}>Suggested Fix</p>
                      <p style={{ fontSize: 12, color: C.forestBright }}>{f.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Sidebar: Risk Score & Timeline */}
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Risk Score Gauge */}
          <Panel style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
              <Activity size={14} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                System Health Index
              </span>
            </div>
            
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <motion.circle cx="70" cy="70" r="64" fill="none" stroke={risk?.color || C.champagne} strokeWidth="12"
                  strokeDasharray="402" initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * (risk?.score || 0) / 100) }}
                  strokeLinecap="round" transition={{ duration: 1.5, ease: 'easeOut' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{risk?.score || 0}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Risk Score</span>
              </div>
            </div>

            <Badge color={risk?.score > 70 ? 'warning' : 'forest'}>{risk?.label}</Badge>
            
            <div style={{ marginTop: 24, textAlign: 'left', display: 'grid', gap: 10 }}>
              {risk?.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{f.name}</span>
                  <span style={{ fontWeight: 700, color: f.impact > 0 ? C.forestBright : '#e74c3c' }}>
                    {f.impact > 0 ? '+' : ''}{f.impact}%
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Timeline View */}
          <Panel style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Clock size={14} style={{ color: C.champagne }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
                Discovery Timeline
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ display: 'grid', gap: 20 }}>
                {timeline.events?.map((e, i) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: 20 }}>
                    <div style={{ 
                      position: 'absolute', left: 0, top: 4, width: 9, height: 9, borderRadius: '50%',
                      background: e.severity === 'Critical' ? '#e74c3c' : e.severity === 'High' ? C.warning : C.forestBright,
                      boxShadow: `0 0 8px ${e.severity === 'Critical' ? '#e74c3c' : e.severity === 'High' ? C.warning : C.forestBright}40`
                    }} />
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{e.time}</p>
                    <p style={{ fontSize: 12, color: C.champagneDim, marginTop: 2, lineHeight: 1.4 }}>{e.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel style={{ padding: 20, background: 'rgba(247,231,206,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Printer size={16} style={{ color: C.champagneDim }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.champagne }}>Audit Readiness</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>All scans are cryptographically signed for HIPAA compliance.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
