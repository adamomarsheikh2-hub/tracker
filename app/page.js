"use client";
import { useState, useEffect } from "react";

// ── Zones ─────────────────────────────────────────────────────────────────────
const ZONES = [
  { id: "ABD_UL", label: "Upper Left",  short: "UL", area: "abdomen", active: true },
  { id: "ABD_UR", label: "Upper Right", short: "UR", area: "abdomen", active: true },
  { id: "ABD_ML", label: "Mid Left",    short: "ML", area: "abdomen", active: true },
  { id: "ABD_MR", label: "Mid Right",   short: "MR", area: "abdomen", active: true },
  { id: "ABD_LL", label: "Lower Left",  short: "LL", area: "abdomen", active: true },
  { id: "ABD_LR", label: "Lower Right", short: "LR", area: "abdomen", active: true },
  { id: "GLT_L",  label: "Left Glute",  short: "GL", area: "glute",   active: true  },
  { id: "GLT_R",  label: "Right Glute", short: "GR", area: "glute",   active: false },
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
  if (!log) return "rgba(255,255,255,0.035)";
  if (!isReady(log)) return COMPOUNDS[log.compound]?.bg || "rgba(251,146,60,0.08)";
  return "rgba(52,211,153,0.07)";
}

// ── Abdomen SVG ───────────────────────────────────────────────────────────────
const ABD_POS = {
  ABD_UL: { cx: 70,  cy: 74  },
  ABD_UR: { cx: 130, cy: 74  },
  ABD_ML: { cx: 57,  cy: 120 },
  ABD_MR: { cx: 143, cy: 120 },
  ABD_LL: { cx: 70,  cy: 166 },
  ABD_LR: { cx: 130, cy: 166 },
};

function AbdomenSVG({ logs, onZoneClick }) {
  return (
    <svg
      viewBox="0 0 200 245"
      style={{ width: "100%", maxWidth: 240, height: "auto", display: "block" }}
    >
      {/* Outer torso silhouette */}
      <path
        d="M 56,18 C 44,48 40,80 42,118 C 42,154 46,183 60,212 L 140,212 C 154,183 158,154 158,118 C 160,80 156,48 144,18 Z"
        fill="rgba(255,255,255,0.025)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.2"
      />
      {/* Linea alba — vertical center line */}
      <line x1="100" y1="22" x2="100" y2="208" stroke="rgba(255,255,255,0.055)" strokeWidth="0.8" strokeDasharray="3,6" />
      {/* Horizontal zone dividers */}
      <line x1="52" y1="97"  x2="148" y2="97"  stroke="rgba(255,255,255,0.04)" strokeWidth="0.7" strokeDasharray="3,6" />
      <line x1="50" y1="143" x2="150" y2="143" stroke="rgba(255,255,255,0.04)" strokeWidth="0.7" strokeDasharray="3,6" />
      {/* Belly button */}
      <ellipse cx="100" cy="120" rx="6" ry="4.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" />
      <line x1="100" y1="115.5" x2="100" y2="124.5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      {/* Zone dots */}
      {ZONES.filter(z => z.area === "abdomen").map(zone => {
        const { cx, cy } = ABD_POS[zone.id];
        const log   = logs[zone.id];
        const color = zoneColor(log);
        const bg    = zoneBg(log);
        return (
          <g key={zone.id} onClick={() => onZoneClick(zone)} style={{ cursor: "pointer" }}>
            {/* Tap target */}
            <circle cx={cx} cy={cy} r="24" fill="transparent" />
            {/* Zone circle */}
            <circle cx={cx} cy={cy} r="18" fill={bg} stroke={color} strokeWidth="1.5" />
            <text
              x={cx} y={cy - 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7.5" fontWeight="700" fill={color}
              fontFamily="system-ui"
            >
              {zone.short}
            </text>
            {log && (
              <text
                x={cx} y={cy + 8}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="5.5" fill={color} opacity="0.65"
                fontFamily="system-ui"
              >
                {isReady(log) ? "ready" : fmtCool(coolLeft(log))}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Glute SVG ─────────────────────────────────────────────────────────────────
function GluteSVG({ logs, onZoneClick }) {
  const log    = logs["GLT_L"];
  const lColor = zoneColor(log);
  const lBg    = zoneBg(log);

  return (
    <svg
      viewBox="0 0 200 150"
      style={{ width: "100%", maxWidth: 240, height: "auto", display: "block" }}
    >
      {/* Lower back band */}
      <path
        d="M 28,28 C 52,18 76,14 100,14 C 124,14 148,18 172,28 L 170,50 C 148,42 124,38 100,38 C 76,38 52,42 30,50 Z"
        fill="rgba(255,255,255,0.025)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1"
      />
      {/* Gluteal cleft */}
      <line x1="100" y1="36" x2="100" y2="138" stroke="rgba(255,255,255,0.07)" strokeWidth="0.9" />
      {/* Left glute — ACTIVE */}
      <ellipse cx="60" cy="93" rx="48" ry="50" fill={lBg} stroke={lColor} strokeWidth="1.5" />
      {/* Left gluteal fold */}
      <path d="M 18,128 C 30,138 46,143 62,142 C 76,141 84,136 92,132" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.9" />
      {/* Right glute — INACTIVE */}
      <ellipse cx="140" cy="93" rx="48" ry="50" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4,4" />
      {/* Right gluteal fold */}
      <path d="M 182,128 C 170,138 154,143 138,142 C 124,141 116,136 108,132" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.9" />

      {/* Left glute tap target + label */}
      <g onClick={() => onZoneClick(ZONES.find(z => z.id === "GLT_L"))} style={{ cursor: "pointer" }}>
        <circle cx="60" cy="93" r="32" fill="transparent" />
        <text x="60" y="88" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill={lColor} fontFamily="system-ui">GL</text>
        <text x="60" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill={lColor} opacity="0.65" fontFamily="system-ui">
          {log ? (isReady(log) ? "ready" : fmtCool(coolLeft(log))) : "left"}
        </text>
      </g>

      {/* Right glute — greyed out, not tappable */}
      <text x="140" y="88"  textAnchor="middle" dominantBaseline="middle" fontSize="9"   fontWeight="600" fill="rgba(255,255,255,0.18)" fontFamily="system-ui">GR</text>
      <text x="140" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="rgba(255,255,255,0.14)" fontFamily="system-ui">not used</text>
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
    setTimeout(cb, 260);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dismiss(onCancel)}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 260ms ease",
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        maxWidth: 400, margin: "0 auto",
        background: "rgba(16,16,26,0.94)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "none",
        borderRadius: "24px 24px 0 0",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        padding: "20px 20px 44px",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 260ms cubic-bezier(0.32,0.72,0,1)",
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)", margin: "0 auto 22px" }} />

        {/* Zone info */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 5, fontFamily: F }}>
            {zone.area === "abdomen" ? "Abdomen" : "Glute"}
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, color: "#f0f0f8", letterSpacing: -0.4, fontFamily: F }}>
            {zone.label}
          </div>
          {prevLog && (
            <div style={{ marginTop: 5, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: F }}>
              Last: {COMPOUNDS[prevLog.compound]?.label || prevLog.compound} · {fmtAgo(prevLog.time)}
            </div>
          )}
        </div>

        {/* Compound selector */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>
          Compound
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {Object.entries(COMPOUNDS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setCompound(key)}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 14,
                background: compound === key ? c.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${compound === key ? c.border : "rgba(255,255,255,0.07)"}`,
                color: compound === key ? c.color : "rgba(255,255,255,0.35)",
                fontSize: 14, fontWeight: 700, fontFamily: F, cursor: "pointer",
                transition: "all 160ms ease",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Time selector */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>
          When
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 24, scrollbarWidth: "none" }}>
          {TIME_OPTS.map((opt, i) => (
            <button
              key={i}
              onClick={() => setTimeIdx(i)}
              style={{
                flexShrink: 0, padding: "8px 13px", borderRadius: 100,
                background: timeIdx === i ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${timeIdx === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                color: timeIdx === i ? "#f0f0f8" : "rgba(255,255,255,0.38)",
                fontSize: 12, fontFamily: F, cursor: "pointer",
                transition: "all 140ms ease",
                whiteSpace: "nowrap",
              }}
            >
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
            transition: "all 160ms ease",
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
  const activeZones  = ZONES.filter(z => z.active);

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
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6 }}>
          Injection Tracker
        </div>
      </div>

      {/* DB error */}
      {dbError && (
        <div style={{
          width: "100%", marginBottom: 16, padding: "11px 14px", borderRadius: 12,
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
          fontSize: 12, color: "#f87171", lineHeight: 1.5, fontFamily: F,
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
        {[["map","Map"], ["status","Status"], ["log","Log"]].map(([k, l]) => (
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
          {/* Abdomen card */}
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(255,255,255,0.11)",
            borderRadius: 22,
            padding: "18px 0 14px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>
              Abdomen
            </div>
            <AbdomenSVG logs={logs} onZoneClick={handleZoneClick} />
          </div>

          {/* Glutes card */}
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(255,255,255,0.11)",
            borderRadius: 22,
            padding: "16px 0 12px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>
              Glutes
            </div>
            <GluteSVG logs={logs} onZoneClick={handleZoneClick} />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 18, marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.32)" }}>
            <span><span style={{ color: "#5cc8f0" }}>●</span> GHK-Cu</span>
            <span><span style={{ color: "#b890e8" }}>●</span> IPA+CJC</span>
            <span><span style={{ color: "#34d399" }}>●</span> Ready</span>
          </div>

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
            Tap a zone to log a pin
          </div>
        </div>
      )}

      {/* ── STATUS ── */}
      {tab === "status" && (
        <div style={{ width: "100%" }}>
          {/* Abdomen section */}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f8", marginBottom: 3 }}>
                    {zone.label}
                  </div>
                  {log ? (
                    <div style={{ fontSize: 11, color: c ? c.color : "rgba(255,255,255,0.35)" }}>
                      {c?.label || "—"} · {fmtAgo(log.time)}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Never pinned</div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {ready ? (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: "#34d399",
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.18)",
                      padding: "4px 10px", borderRadius: 100,
                    }}>Ready</span>
                  ) : (
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fb923c" }}>{fmtCool(cool)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>remaining</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Glute section */}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase", margin: "18px 0 12px" }}>
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
                  {log ? (
                    <div style={{ fontSize: 11, color: c ? c.color : "rgba(255,255,255,0.35)" }}>
                      {c?.label || "—"} · {fmtAgo(log.time)}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Never pinned</div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {ready ? (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: "#34d399",
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.18)",
                      padding: "4px 10px", borderRadius: 100,
                    }}>Ready</span>
                  ) : (
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fb923c" }}>{fmtCool(cool)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>remaining</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 14, padding: "13px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>Right Glute</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>Not used in rotation</div>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", padding: "4px 10px" }}>—</span>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setLogs({}); setHistory([]); persist({}, []); }}
            style={{
              marginTop: 28, width: "100%", padding: "12px 0", borderRadius: 12,
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "rgba(239,68,68,0.45)",
              fontSize: 12, fontFamily: F, cursor: "pointer",
            }}
          >
            Reset All Data
          </button>
        </div>
      )}

      {/* ── LOG ── */}
      {tab === "log" && (
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>
            Pin History
          </div>

          {history.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, textAlign: "center", padding: "48px 0", fontFamily: F }}>
              No pins logged yet.
            </div>
          )}

          {history.map((entry, i) => {
            const zone = ZONE_MAP[entry.zone];
            const c    = COMPOUNDS[entry.compound];
            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 13, padding: "12px 16px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c?.color || "#f0f0f8", marginBottom: 3 }}>
                    {c?.label || entry.compound}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
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
