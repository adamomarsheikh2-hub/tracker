"use client";
import { useState, useEffect } from "react";

// ── Zones ─────────────────────────────────────────────────────────────────────
const ZONES = [
  { id: "ABD_1",  short: "ULo", label: "Upper · Outer Left",  area: "abdomen", active: true },
  { id: "ABD_2",  short: "ULi", label: "Upper · Inner Left",  area: "abdomen", active: true },
  { id: "ABD_3",  short: "URi", label: "Upper · Inner Right", area: "abdomen", active: true },
  { id: "ABD_4",  short: "URo", label: "Upper · Outer Right", area: "abdomen", active: true },
  { id: "ABD_5",  short: "MLo", label: "Mid · Outer Left",    area: "abdomen", active: true },
  { id: "ABD_6",  short: "MLi", label: "Mid · Inner Left",    area: "abdomen", active: true },
  { id: "ABD_7",  short: "MRi", label: "Mid · Inner Right",   area: "abdomen", active: true },
  { id: "ABD_8",  short: "MRo", label: "Mid · Outer Right",   area: "abdomen", active: true },
  { id: "ABD_9",  short: "LLo", label: "Lower · Outer Left",  area: "abdomen", active: true },
  { id: "ABD_10", short: "LLi", label: "Lower · Inner Left",  area: "abdomen", active: true },
  { id: "ABD_11", short: "LRi", label: "Lower · Inner Right", area: "abdomen", active: true },
  { id: "ABD_12", short: "LRo", label: "Lower · Outer Right", area: "abdomen", active: true },
  { id: "GLT_L",  short: "GL", label: "Left Glute",          area: "glute",   active: true  },
  { id: "GLT_R",  short: "GR", label: "Right Glute",         area: "glute",   active: false },
];

const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]));

const COMPOUNDS = {
  GHK: { label: "GHK-Cu",  color: "#5cc8f0", bg: "rgba(92,200,240,0.09)",  border: "rgba(92,200,240,0.25)"  },
  IPA: { label: "IPA+CJC", color: "#b890e8", bg: "rgba(184,144,232,0.09)", border: "rgba(184,144,232,0.25)" },
};

const TIME_OPTS = [
  { label: "Just now", hours: 0  },
  { label: "12h ago",  hours: 12 },
  { label: "24h ago",  hours: 24 },
  { label: "36h ago",  hours: 36 },
  { label: "48h ago",  hours: 48 },
  { label: "60h ago",  hours: 60 },
  { label: "72h ago",  hours: 72 },
];

const MIN_HOURS = 72;
const F = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const hoursAgo = iso => (Date.now() - new Date(iso).getTime()) / 3600000;
const isReady  = log => !log || hoursAgo(log.time) >= MIN_HOURS;
const coolLeft = log => log ? Math.max(0, MIN_HOURS - hoursAgo(log.time)) : 0;

function fmtCool(h) {
  const hrs  = Math.floor(h);
  const mins = Math.round((h % 1) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function fmtAgo(iso) {
  const h = hoursAgo(iso);
  if (h < 1)  return `${Math.round(h * 60)}m ago`;
  if (h < 48) return `${Math.round(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function zoneColor(log) {
  if (!log) return "rgba(255,255,255,0.22)";
  if (!isReady(log)) return COMPOUNDS[log.compound]?.color || "#fb923c";
  return "#34d399";
}

function zoneBg(log) {
  if (!log) return "rgba(255,255,255,0.03)";
  if (!isReady(log)) return COMPOUNDS[log.compound]?.bg || "rgba(251,146,60,0.08)";
  return "rgba(52,211,153,0.07)";
}

// ── Abdomen SVG ───────────────────────────────────────────────────────────────
const ABD_POS = {
  ABD_1:  { cx: 58, cy: 78  }, ABD_2:  { cx: 82, cy: 78  }, ABD_3:  { cx: 118, cy: 78  }, ABD_4:  { cx: 142, cy: 78  },
  ABD_5:  { cx: 58, cy: 124 }, ABD_6:  { cx: 82, cy: 124 }, ABD_7:  { cx: 118, cy: 124 }, ABD_8:  { cx: 142, cy: 124 },
  ABD_9:  { cx: 58, cy: 170 }, ABD_10: { cx: 82, cy: 170 }, ABD_11: { cx: 118, cy: 170 }, ABD_12: { cx: 142, cy: 170 },
};

function AbdomenSVG({ logs, onZoneClick }) {
  return (
    <svg viewBox="0 0 200 250" style={{ width: "100%", maxWidth: 232, height: "auto", display: "block" }}>

      {/* ── Torso silhouette ── */}
      <path
        d="M 60,14 C 48,40 44,72 44,108 C 44,150 44,184 58,212 C 72,226 88,232 100,232 C 112,232 128,226 142,212 C 156,184 156,150 156,108 C 156,72 152,40 140,14 Z"
        fill="rgba(255,255,255,0.022)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.3"
      />

      {/* ── Costal arch ── */}
      <path d="M 62,16 C 72,7 86,4 100,4 C 114,4 128,7 138,16"
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.1" strokeLinecap="round"/>

      {/* ── Oblique flank hints ── */}
      <path d="M 58,22 C 50,56 46,96 46,134"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M 142,22 C 150,56 154,96 154,134"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.9" strokeLinecap="round"/>

      {/* ── Linea alba ── */}
      <line x1="100" y1="18" x2="100" y2="222"
        stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="2,5"/>

      {/* ── Belly button ── */}
      <ellipse cx="100" cy="124" rx="6" ry="5"
        fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.1"/>
      <ellipse cx="100" cy="123.5" rx="3" ry="2.4" fill="rgba(0,0,0,0.65)"/>

      {/* ── Zone targets ── */}
      {ZONES.filter(z => z.area === "abdomen").map(zone => {
        const { cx, cy } = ABD_POS[zone.id];
        const log   = logs[zone.id];
        const color = zoneColor(log);
        const bg    = zoneBg(log);
        return (
          <g key={zone.id} onClick={() => onZoneClick(zone)} style={{ cursor: "pointer" }}>
            {/* Large invisible tap target */}
            <circle cx={cx} cy={cy} r="19" fill="transparent"/>
            {/* Main circle */}
            <circle cx={cx} cy={cy} r="11" fill={bg} stroke={color} strokeWidth="1.3"/>
            {/* Label */}
            <text x={cx} y={cy}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fontWeight="700" fill={color} fontFamily="system-ui" letterSpacing="-0.1">
              {zone.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Glute SVG ─────────────────────────────────────────────────────────────────
function GluteSVG({ logs, onZoneClick }) {
  const log   = logs["GLT_L"];
  const lColor = zoneColor(log);
  const lBg   = zoneBg(log);
  const GLT_L = ZONES.find(z => z.id === "GLT_L");

  return (
    <svg viewBox="0 0 200 178" style={{ width: "100%", maxWidth: 230, height: "auto", display: "block" }}>

      {/* ── Sacrum ── */}
      <path
        d="M 88,16 L 112,16 C 110,38 106,56 100,66 C 94,56 90,38 88,16 Z"
        fill="rgba(255,255,255,0.028)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      {/* Sacral foramina (pairs) */}
      {[[94,26],[106,26],[93,36],[107,36],[93,46],[107,46],[93,56],[107,56]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="rgba(255,255,255,0.16)"/>
      ))}
      {/* Coccyx tip */}
      <path d="M 96,66 C 97,72 98,78 100,82 C 102,78 103,72 104,66"
        fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.9"/>

      {/* ── Iliac crests ── */}
      <path d="M 100,28 C 96,26 86,22 72,20 C 56,18 40,24 28,36 C 20,44 16,56 18,68"
        fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M 100,28 C 104,26 114,22 128,20 C 144,18 160,24 172,36 C 180,44 184,56 182,68"
        fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.3" strokeLinecap="round"/>

      {/* ── PSIS dimples ── */}
      <circle cx="82" cy="58" r="3" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      <circle cx="82" cy="58" r="1" fill="rgba(255,255,255,0.18)"/>
      <circle cx="118" cy="58" r="3" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <circle cx="118" cy="58" r="1" fill="rgba(255,255,255,0.09)"/>

      {/* ── Gluteal cleft ── */}
      <line x1="100" y1="66" x2="100" y2="162" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>

      {/* ── Left glute (ACTIVE) ── */}
      <path
        d="M 100,72 C 98,90 98,114 100,142 C 90,154 74,162 56,160 C 38,156 24,142 18,120 C 14,100 16,78 26,64 C 36,52 52,46 68,46 C 84,46 96,58 100,72 Z"
        fill={lBg}
        stroke={lColor}
        strokeWidth="1.4"
      />
      {/* Left gluteal fold */}
      <path d="M 18,136 C 30,150 50,158 68,158 C 84,158 94,152 100,146"
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
      {/* Left greater trochanter hint */}
      <path d="M 16,80 C 14,90 14,102 16,112"
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Right glute (INACTIVE) ── */}
      <path
        d="M 100,72 C 102,90 102,114 100,142 C 110,154 126,162 144,160 C 162,156 176,142 182,120 C 186,100 184,78 174,64 C 164,52 148,46 132,46 C 116,46 104,58 100,72 Z"
        fill="rgba(255,255,255,0.015)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1"
        strokeDasharray="4,4"
      />
      {/* Right gluteal fold */}
      <path d="M 182,136 C 170,150 150,158 132,158 C 116,158 106,152 100,146"
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeLinecap="round"/>
      {/* Right greater trochanter hint */}
      <path d="M 184,80 C 186,90 186,102 184,112"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Left zone target ── */}
      <g onClick={() => onZoneClick(GLT_L)} style={{ cursor: "pointer" }}>
        <circle cx="56" cy="108" r="28" fill="transparent"/>
        <circle cx="56" cy="108" r="16" fill={lBg} stroke={lColor} strokeWidth="1.3"/>
        <text x="56" y={log ? "104" : "108"} textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fontWeight="700" fill={lColor} fontFamily="system-ui" letterSpacing="0.5">GL</text>
        {log && (
          <text x="56" y="115" textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fill={lColor} opacity="0.6" fontFamily="system-ui">
            {isReady(log) ? "ready" : fmtCool(coolLeft(log))}
          </text>
        )}
      </g>

      {/* ── Right glute — inactive label ── */}
      <text x="144" y="105" textAnchor="middle" dominantBaseline="middle"
        fontSize="7.5" fontWeight="600" fill="rgba(255,255,255,0.17)" fontFamily="system-ui">GR</text>
      <text x="144" y="117" textAnchor="middle" dominantBaseline="middle"
        fontSize="6" fill="rgba(255,255,255,0.12)" fontFamily="system-ui">not used</text>
    </svg>
  );
}

// ── Log Modal ─────────────────────────────────────────────────────────────────
function LogModal({ zone, prevLog, onConfirm, onCancel }) {
  const [compound, setCompound] = useState(null);
  const [timeIdx,  setTimeIdx]  = useState(0);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dismiss = (cb) => {
    setVisible(false);
    setTimeout(cb, 240);
  };

  return (
    <>
      {/* Backdrop — simple dark overlay, no blur to avoid iOS touch issues */}
      <div
        onClick={() => dismiss(onCancel)}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.65)",
          opacity: visible ? 1 : 0,
          transition: "opacity 240ms ease",
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        maxWidth: 400, margin: "0 auto",
        background: "rgba(14,14,24,0.96)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "none",
        borderRadius: "24px 24px 0 0",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        padding: "16px 20px 44px",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 240ms cubic-bezier(0.32,0.72,0,1)",
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.13)", margin: "0 auto 20px" }}/>

        {/* Close button */}
        <button
          onClick={() => dismiss(onCancel)}
          style={{
            position: "absolute", top: 18, right: 18,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 16, lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F,
          }}
        >×</button>

        {/* Zone header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 5, fontFamily: F }}>
            {zone.area === "abdomen" ? "Abdomen" : "Glute"}
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, color: "#f0f0f8", letterSpacing: -0.4, fontFamily: F }}>
            {zone.label}
          </div>
          {prevLog && (
            <div style={{ marginTop: 5, fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: F }}>
              Last: {COMPOUNDS[prevLog.compound]?.label || prevLog.compound} · {fmtAgo(prevLog.time)}
            </div>
          )}
        </div>

        {/* Compound */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>
          Compound
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {Object.entries(COMPOUNDS).map(([key, c]) => (
            <button key={key} onClick={() => setCompound(key)} style={{
              flex: 1, padding: "13px 0", borderRadius: 14,
              background: compound === key ? c.bg : "rgba(255,255,255,0.04)",
              border: `1px solid ${compound === key ? c.border : "rgba(255,255,255,0.07)"}`,
              color: compound === key ? c.color : "rgba(255,255,255,0.32)",
              fontSize: 14, fontWeight: 700, fontFamily: F, cursor: "pointer",
              transition: "all 150ms ease",
            }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Time */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>
          When
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
          {TIME_OPTS.map((opt, i) => (
            <button key={i} onClick={() => setTimeIdx(i)} style={{
              flexShrink: 0, padding: "8px 13px", borderRadius: 100,
              background: timeIdx === i ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${timeIdx === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
              color: timeIdx === i ? "#f0f0f8" : "rgba(255,255,255,0.36)",
              fontSize: 12, fontFamily: F, cursor: "pointer",
              transition: "all 130ms ease",
              whiteSpace: "nowrap",
            }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          onClick={() => compound && dismiss(() => onConfirm(zone, compound, timeIdx))}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 14,
            background: compound ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${compound ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
            color: compound ? "#f0f0f8" : "rgba(255,255,255,0.2)",
            fontSize: 15, fontWeight: 600, fontFamily: F,
            cursor: compound ? "pointer" : "default",
            transition: "all 150ms ease",
          }}
        >
          {compound ? "Log Pin →" : "Select a compound"}
        </button>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InjectionTracker() {
  const [logs,    setLogs]    = useState({});
  const [history, setHistory] = useState([]);
  const [tab,     setTab]     = useState("map");
  const [loaded,  setLoaded]  = useState(false);
  const [dbError, setDbError] = useState(null);
  const [modal,   setModal]   = useState(null);
  const [, setNow]            = useState(Date.now());

  useEffect(() => {
    fetch("/api/state")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setLogs(d.logs || {}); setHistory(d.history || []); })
      .catch(e => setDbError(e.message || "Failed to reach database"))
      .finally(() => setLoaded(true));

    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const persist = (l, h) => {
    fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: l, history: h }),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); setDbError(null); })
      .catch(e => setDbError(e.message || "Failed to save"));
  };

  const handleZoneClick = zone => {
    if (!zone.active) return;
    setModal(zone);
  };

  const handleLogConfirm = (zone, compound, timeIdx) => {
    const time    = new Date(Date.now() - TIME_OPTS[timeIdx].hours * 3600000).toISOString();
    const newLogs = { ...logs, [zone.id]: { time, compound, count: (logs[zone.id]?.count || 0) + 1 } };
    const newHist = [{ zone: zone.id, compound, time }, ...history].slice(0, 200);
    setLogs(newLogs);
    setHistory(newHist);
    persist(newLogs, newHist);
  };

  if (!loaded) return (
    <div style={{ color: "rgba(255,255,255,0.25)", padding: 40, fontFamily: F, textAlign: "center", fontSize: 13 }}>
      Loading
    </div>
  );

  const abdomenZones = ZONES.filter(z => z.area === "abdomen");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#f0f0f8",
      fontFamily: F,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 16px 56px",
      maxWidth: 400, margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ width: "100%", marginBottom: 26 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 4 }}>
          Peptide Rotation
        </div>
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6 }}>Injection Tracker</div>
      </div>

      {/* DB error */}
      {dbError && (
        <div style={{
          width: "100%", marginBottom: 16, padding: "11px 14px", borderRadius: 12,
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
          fontSize: 12, color: "#f87171", lineHeight: 1.5,
        }}>
          ⚠ {dbError}
        </div>
      )}

      {/* Pill tabs */}
      <div style={{
        display: "flex", gap: 3, width: "100%", marginBottom: 24,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 100, padding: 3,
      }}>
        {[["map","Map"],["status","Status"],["log","Log"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "9px 0", borderRadius: 100,
            background: tab === k ? "rgba(255,255,255,0.12)" : "transparent",
            border: tab === k ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
            color: tab === k ? "#f0f0f8" : "rgba(255,255,255,0.35)",
            fontSize: 13, fontWeight: tab === k ? 600 : 400, fontFamily: F, cursor: "pointer",
            transition: "all 160ms ease",
          }}>{l}</button>
        ))}
      </div>

      {/* ── MAP ── */}
      {tab === "map" && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 22, padding: "16px 0 14px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>
              Abdomen
            </div>
            <AbdomenSVG logs={logs} onZoneClick={handleZoneClick}/>
          </div>

          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 22, padding: "16px 0 12px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>
              Glutes
            </div>
            <GluteSVG logs={logs} onZoneClick={handleZoneClick}/>
          </div>

          <div style={{ display: "flex", gap: 18, marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            <span><span style={{ color: "#5cc8f0" }}>●</span> GHK-Cu</span>
            <span><span style={{ color: "#b890e8" }}>●</span> IPA+CJC</span>
            <span><span style={{ color: "#34d399" }}>●</span> Ready</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 0 }}>
            Tap a zone to log a pin
          </div>
        </div>
      )}

      {/* ── STATUS ── */}
      {tab === "status" && (
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>
            Abdomen
          </div>
          {abdomenZones.map(zone => {
            const log   = logs[zone.id];
            const ready = isReady(log);
            const cool  = coolLeft(log);
            const c     = log?.compound ? COMPOUNDS[log.compound] : null;
            return (
              <div key={zone.id} style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${!ready && c ? c.border : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14, padding: "13px 16px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f8", marginBottom: 3 }}>{zone.label}</div>
                  {log
                    ? <div style={{ fontSize: 11, color: c ? c.color : "rgba(255,255,255,0.35)" }}>{c?.label || "—"} · {fmtAgo(log.time)}</div>
                    : <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Never pinned</div>
                  }
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {ready
                    ? <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", padding: "4px 10px", borderRadius: 100 }}>Ready</span>
                    : <div><div style={{ fontSize: 14, fontWeight: 700, color: "#fb923c" }}>{fmtCool(cool)}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>remaining</div></div>
                  }
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5, textTransform: "uppercase", margin: "18px 0 12px" }}>
            Glutes
          </div>
          {(() => {
            const zone  = ZONES.find(z => z.id === "GLT_L");
            const log   = logs["GLT_L"];
            const ready = isReady(log);
            const cool  = coolLeft(log);
            const c     = log?.compound ? COMPOUNDS[log.compound] : null;
            return (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${!ready && c ? c.border : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14, padding: "13px 16px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f8", marginBottom: 3 }}>{zone.label}</div>
                  {log
                    ? <div style={{ fontSize: 11, color: c ? c.color : "rgba(255,255,255,0.35)" }}>{c?.label || "—"} · {fmtAgo(log.time)}</div>
                    : <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Never pinned</div>
                  }
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {ready
                    ? <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", padding: "4px 10px", borderRadius: 100 }}>Ready</span>
                    : <div><div style={{ fontSize: 14, fontWeight: 700, color: "#fb923c" }}>{fmtCool(cool)}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>remaining</div></div>
                  }
                </div>
              </div>
            );
          })()}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 14, padding: "13px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.22)" }}>Right Glute</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.14)" }}>Not used in rotation</div>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.16)", padding: "4px 10px" }}>—</span>
          </div>

          <button
            onClick={() => { setLogs({}); setHistory([]); persist({}, []); }}
            style={{
              marginTop: 28, width: "100%", padding: "12px 0", borderRadius: 12,
              background: "transparent", border: "1px solid rgba(239,68,68,0.18)",
              color: "rgba(239,68,68,0.42)", fontSize: 12, fontFamily: F, cursor: "pointer",
            }}
          >
            Reset All Data
          </button>
        </div>
      )}

      {/* ── LOG ── */}
      {tab === "log" && (
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>
            Pin History
          </div>
          {history.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, textAlign: "center", padding: "48px 0" }}>
              No pins logged yet.
            </div>
          )}
          {history.map((entry, i) => {
            const zone = ZONE_MAP[entry.zone];
            const c    = COMPOUNDS[entry.compound];
            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 13, padding: "12px 16px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c?.color || "#f0f0f8", marginBottom: 3 }}>
                    {c?.label || entry.compound}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                    {zone ? `${zone.label} (${zone.area === "abdomen" ? "Abd" : "Glt"})` : entry.zone}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", textAlign: "right" }}>
                  {fmtAgo(entry.time)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Modal */}
      {modal && (
        <LogModal
          zone={modal}
          prevLog={logs[modal.id] || null}
          onConfirm={(zone, compound, timeIdx) => {
            handleLogConfirm(zone, compound, timeIdx);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
