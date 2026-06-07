"use client";

import { useState, useEffect } from "react";

const ZONES = [
  { id: "UL", label: "Upper Left",  side: "L", x: 30, y: 28 },
  { id: "UR", label: "Upper Right", side: "R", x: 70, y: 28 },
  { id: "ML", label: "Mid Left",    side: "L", x: 25, y: 50 },
  { id: "MR", label: "Mid Right",   side: "R", x: 75, y: 50 },
  { id: "LL", label: "Lower Left",  side: "L", x: 32, y: 70 },
  { id: "LR", label: "Lower Right", side: "R", x: 68, y: 70 },
];

const MIN_HOURS = 72;
const COMPOUND_COLORS = {
  GHK: { primary: "#7ec8e3", bg: "#0a2a35", border: "#7ec8e3" },
  IPA: { primary: "#c8a0e8", bg: "#1e0a35", border: "#c8a0e8" },
};

function hoursAgo(iso) { return (Date.now() - new Date(iso).getTime()) / 3600000; }
function formatTime(iso) {
  const h = hoursAgo(iso);
  if (h < 1) return `${Math.round(h * 60)}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function getCooldownLeft(log) { return log ? Math.max(0, MIN_HOURS - hoursAgo(log.time)) : 0; }
function isReady(log) { return !log || hoursAgo(log.time) >= MIN_HOURS; }
function fmtCool(h) { return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`; }

function restHours(log) {
  return log ? hoursAgo(log.time) : Infinity;
}

function bestZoneOnSide(side, logs) {
  return ZONES
    .filter(z => z.side === side)
    .sort((a, b) => restHours(logs[b.id]) - restHours(logs[a.id]))[0];
}

function getSmartZones(logs, lastGhkSide) {
  const options = ["L", "R"].map((ghkSide) => {
    const ipaSide = ghkSide === "L" ? "R" : "L";
    const ghk = bestZoneOnSide(ghkSide, logs);
    const ipa = bestZoneOnSide(ipaSide, logs);
    const ghkRest = restHours(logs[ghk.id]);
    const ipaRest = restHours(logs[ipa.id]);
    return {
      ghk, ipa, ghkSide,
      ghkReady: ghkRest >= MIN_HOURS,
      ipaReady: ipaRest >= MIN_HOURS,
      bothReady: ghkRest >= MIN_HOURS && ipaRest >= MIN_HOURS,
      minRest: Math.min(ghkRest, ipaRest),
      totalRest: (isFinite(ghkRest) ? ghkRest : 1e6) + (isFinite(ipaRest) ? ipaRest : 1e6),
      flips: ghkSide !== lastGhkSide,
    };
  });

  options.sort((a, b) => {
    if (a.bothReady !== b.bothReady) return a.bothReady ? -1 : 1;
    if (b.minRest !== a.minRest) return b.minRest - a.minRest;
    if (a.flips !== b.flips) return a.flips ? -1 : 1;
    return b.totalRest - a.totalRest;
  });

  return options[0];
}

// ── Body diagram ──────────────────────────────────────────────────────────────
function BodyDiagram({ logs, highlightGhk, highlightIpa, onZoneClick, setupMode, setupLogs }) {
  return (
    <div style={{ position: "relative", width: 200, height: 240 }}>
      <svg width="200" height="240" viewBox="0 0 200 240" style={{ position: "absolute", top: 0, left: 0 }}>
        <ellipse cx="100" cy="120" rx="62" ry="95" fill="#12121e" stroke="#2a2a4a" strokeWidth="1.5" />
        <circle cx="100" cy="120" r="3" fill="#333" stroke="#555" strokeWidth="1" />
        <line x1="100" y1="40" x2="100" y2="200" stroke="#1e1e3a" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="42" y1="82" x2="158" y2="82" stroke="#1e1e3a" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="38" y1="120" x2="162" y2="120" stroke="#1e1e3a" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="42" y1="158" x2="158" y2="158" stroke="#1e1e3a" strokeWidth="1" strokeDasharray="4,4" />
        <circle cx="100" cy="120" r="14" fill="none" stroke="#2a2a4a" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
      {ZONES.map((zone) => {
        let borderColor, bg, glow = false;
        if (setupMode) {
          const comp = setupLogs?.[zone.id]?.compound;
          const active = setupLogs?.[zone.id] !== undefined;
          borderColor = comp ? COMPOUND_COLORS[comp].primary : active ? "#e8e8f0" : "#333";
          bg = comp ? COMPOUND_COLORS[comp].bg : active ? "#1e1e2e" : "#0a0a14";
          glow = active;
        } else {
          const log = logs[zone.id];
          const ready = isReady(log);
          const isGhk = highlightGhk === zone.id;
          const isIpa = highlightIpa === zone.id;
          glow = isGhk || isIpa;
          borderColor = isGhk ? COMPOUND_COLORS.GHK.primary : isIpa ? COMPOUND_COLORS.IPA.primary : ready ? "#2ecc71" : "#e67e22";
          bg = isGhk ? COMPOUND_COLORS.GHK.bg : isIpa ? COMPOUND_COLORS.IPA.bg : ready ? "#0d3a1f" : "#3a1a0a";
        }
        return (
          <button key={zone.id} onClick={() => onZoneClick?.(zone.id)} style={{
            position: "absolute", left: `${zone.x}%`, top: `${zone.y}%`,
            transform: "translate(-50%,-50%)", width: 38, height: 38, borderRadius: "50%",
            background: bg, border: `2px solid ${borderColor}`,
            boxShadow: glow ? `0 0 10px ${borderColor}88` : "none",
            cursor: onZoneClick ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", outline: "none",
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: borderColor }}>{zone.id}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Setup screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onDone }) {
  const [setupLogs, setSetupLogs] = useState({});
  const [activeZone, setActiveZone] = useState(null);

  const toggleZone = (zoneId) => {
    if (setupLogs[zoneId]) {
      const n = { ...setupLogs }; delete n[zoneId];
      setSetupLogs(n); setActiveZone(null);
    } else {
      setSetupLogs(prev => ({ ...prev, [zoneId]: { compound: null, hoursAgo: 0 } }));
      setActiveZone(zoneId);
    }
  };

  const pickCompound = (compound) => {
    if (!activeZone) return;
    setSetupLogs(prev => ({ ...prev, [activeZone]: { ...prev[activeZone], compound } }));
  };

  const setHrs = (zoneId, val) => {
    setSetupLogs(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], hoursAgo: val } }));
  };

  const handleDone = () => {
    const logs = {};
    Object.entries(setupLogs).forEach(([zoneId, v]) => {
      logs[zoneId] = {
        time: new Date(Date.now() - (v.hoursAgo || 0) * 3600000).toISOString(),
        count: 1,
        compound: v.compound || null,
      };
    });
    let lastGhkSide = "R";
    const ghkPins = Object.entries(logs).filter(([, v]) => v.compound === "GHK");
    if (ghkPins.length > 0) {
      ghkPins.sort((a, b) => new Date(b[1].time) - new Date(a[1].time));
      const lastZone = ZONES.find(z => z.id === ghkPins[0][0]);
      if (lastZone) lastGhkSide = lastZone.side;
    }
    onDone(logs, lastGhkSide);
  };

  const activeData = activeZone ? setupLogs[activeZone] : null;
  const activeZoneObj = activeZone ? ZONES.find(z => z.id === activeZone) : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#09090f", color: "#e8e8f0",
      fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "24px 16px 40px", maxWidth: 400, margin: "0 auto",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 2, textTransform: "uppercase" }}>Setup</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0", marginBottom: 6 }}>Where did you pin?</div>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 20, textAlign: "center" }}>
        Tap zones you've already used · assign compound + how long ago
      </div>

      <div style={{ marginBottom: 24 }}>
        <BodyDiagram logs={{}} setupMode setupLogs={setupLogs} onZoneClick={toggleZone} />
      </div>

      {activeZone && activeZoneObj && (
        <div style={{
          width: "100%", background: "#111120", border: "1px solid #2a2a4a",
          borderRadius: 12, padding: "14px", marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e8f0", marginBottom: 10 }}>
            {activeZoneObj.label}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["GHK","IPA"].map(c => (
              <button key={c} onClick={() => pickCompound(c)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8,
                border: `1px solid ${activeData?.compound === c ? COMPOUND_COLORS[c].primary : "#2a2a4a"}`,
                background: activeData?.compound === c ? COMPOUND_COLORS[c].bg : "transparent",
                color: COMPOUND_COLORS[c].primary, fontSize: 11,
                fontFamily: "'Courier New', monospace", cursor: "pointer", fontWeight: 700,
              }}>{c === "GHK" ? "GHK-Cu" : "IPA+CJC"}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>How long ago?</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[0,12,24,36,48,60,72].map(h => (
              <button key={h} onClick={() => setHrs(activeZone, h)} style={{
                padding: "4px 9px", borderRadius: 6, fontSize: 10,
                border: `1px solid ${(activeData?.hoursAgo ?? 0) === h ? "#e8e8f0" : "#2a2a3a"}`,
                background: (activeData?.hoursAgo ?? 0) === h ? "#1e1e32" : "transparent",
                color: "#aaa", fontFamily: "'Courier New', monospace", cursor: "pointer",
              }}>{h === 0 ? "Now" : `${h}h`}</button>
            ))}
          </div>
        </div>
      )}

      {Object.keys(setupLogs).length > 0 && (
        <div style={{ width: "100%", marginBottom: 14 }}>
          {Object.entries(setupLogs).map(([zoneId, v]) => {
            const zn = ZONES.find(z => z.id === zoneId);
            const c = v.compound ? COMPOUND_COLORS[v.compound] : { primary: "#888", border: "#444" };
            return (
              <div key={zoneId} onClick={() => setActiveZone(zoneId)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 10px", borderRadius: 8, marginBottom: 5, cursor: "pointer",
                background: "#111118", border: `1px solid ${c.border}44`,
              }}>
                <span style={{ color: c.primary, fontSize: 11, fontWeight: 700 }}>
                  {v.compound ? (v.compound === "GHK" ? "GHK-Cu" : "IPA+CJC") : "On cooldown"}
                </span>
                <span style={{ color: "#555", fontSize: 10 }}>
                  {zn?.label} · {v.hoursAgo === 0 ? "just now" : `${v.hoursAgo}h ago`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={handleDone} style={{
        width: "100%", padding: "11px 0", borderRadius: 8,
        border: "1px solid #2ecc71", background: "#0d3a1f",
        color: "#2ecc71", fontSize: 13, fontFamily: "'Courier New', monospace",
        cursor: "pointer", fontWeight: 700,
      }}>
        {Object.keys(setupLogs).length === 0 ? "Start Fresh →" : "Save & Continue →"}
      </button>
    </div>
  );
}

// ── Main tracker ──────────────────────────────────────────────────────────────
export default function InjectionTracker() {
  const [logs, setLogs]               = useState({});
  const [lastGhkSide, setLastGhkSide] = useState("R");
  const [loaded, setLoaded]           = useState(false);
  const [setup, setSetup]             = useState(false);
  const [tab, setTab]                 = useState("today");
  const [dbError, setDbError]         = useState(null);
  const [, setNow]                    = useState(Date.now());

  useEffect(() => {
    fetch("/api/state")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d.needsSetup) {
          setSetup(true);
        } else {
          setLogs(d.logs || {});
          setLastGhkSide(d.lastGhkSide || "R");
        }
      })
      .catch((e) => {
        setDbError(e.message || "Failed to reach database");
        setSetup(true); // fall through to setup so the UI isn't stuck
      })
      .finally(() => setLoaded(true));

    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  // Persist to backend — optimistic (state already set locally before this fires).
  const persist = (l, side) => {
    fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: l, lastGhkSide: side }),
    })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); setDbError(null); })
      .catch((e) => setDbError(e.message || "Failed to save"));
  };

  const finishSetup = (seedLogs, detectedSide) => {
    setLogs(seedLogs);
    setLastGhkSide(detectedSide);
    persist(seedLogs, detectedSide);
    setSetup(false);
  };

  const logOne = (zone, compound) => {
    const newLogs = {
      ...logs,
      [zone.id]: { time: new Date().toISOString(), count: (logs[zone.id]?.count || 0) + 1, compound },
    };
    setLogs(newLogs);
    const newSide = compound === "GHK" ? zone.side : lastGhkSide;
    if (compound === "GHK") setLastGhkSide(zone.side);
    persist(newLogs, newSide);
  };

  const clearAll = () => {
    setLogs({});
    setLastGhkSide("R");
    // lastGhkSide: null tells the server "needsSetup on next load"
    persist({}, null);
    setSetup(true);
  };

  if (!loaded) return (
    <div style={{ color: "#aaa", padding: 40, fontFamily: "monospace" }}>Loading...</div>
  );

  if (setup) return (
    <>
      {dbError && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 99,
          padding: "10px 16px", background: "#2a0a0a", borderBottom: "1px solid #7a2222",
          fontSize: 11, color: "#e07070", fontFamily: "'Courier New', monospace",
        }}>
          ⚠ DB error: {dbError} — check Railway → Variables → DATABASE_URL
        </div>
      )}
      <SetupScreen onDone={finishSetup} />
    </>
  );

  const { ghk, ipa, ghkReady, ipaReady } = getSmartZones(logs, lastGhkSide);
  const bothReady = ghkReady && ipaReady;

  const fakeLogsAfter = {
    ...logs,
    [ghk.id]: { time: new Date().toISOString(), compound: "GHK" },
    [ipa.id]: { time: new Date().toISOString(), compound: "IPA" },
  };
  const next = getSmartZones(fakeLogsAfter, ghk.side);

  return (
    <div style={{
      minHeight: "100vh", background: "#09090f", color: "#e8e8f0",
      fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "20px 16px 40px", maxWidth: 400, margin: "0 auto",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 2, textTransform: "uppercase" }}>Peptide Rotation</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>Injection Tracker</div>

      {/* DB error banner */}
      {dbError && (
        <div style={{
          width: "100%", marginBottom: 14, padding: "10px 14px", borderRadius: 8,
          background: "#2a0a0a", border: "1px solid #7a2222",
          fontSize: 11, color: "#e07070", lineHeight: 1.5,
        }}>
          ⚠ DB error: {dbError}<br />
          <span style={{ color: "#555" }}>Check Railway → Variables → DATABASE_URL</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#111118", borderRadius: 8, padding: 3 }}>
        {[["today","Today"],["map","Map"],["history","Log"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 11,
            fontFamily: "'Courier New', monospace",
            background: tab === k ? "#1e1e32" : "transparent",
            color: tab === k ? "#e8e8f0" : "#555",
            cursor: "pointer", fontWeight: tab === k ? 700 : 400,
          }}>{l}</button>
        ))}
      </div>

      {/* TODAY */}
      {tab === "today" && (
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 10, textTransform: "uppercase" }}>
            Recommended Session
          </div>

          {[{ compound:"GHK", label:"GHK-Cu", zone:ghk, ready:ghkReady },
            { compound:"IPA", label:"IPA + CJC", zone:ipa, ready:ipaReady }].map(({ compound, label, zone, ready }) => {
            const c = COMPOUND_COLORS[compound];
            const log = logs[zone.id];
            const cool = getCooldownLeft(log);
            const restedHrs = log ? hoursAgo(log.time) : null;
            return (
              <div key={compound} style={{
                background: c.bg, border: `1px solid ${ready ? c.border : "#3a2a0a"}`,
                borderRadius: 12, padding: "14px 16px", marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.primary, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 14, color: "#e8e8f0", fontWeight: 700 }}>→ {zone.label}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>
                      {restedHrs === null
                        ? "Never used — fresh site"
                        : ready
                          ? `Rested ${Math.round(restedHrs)}h — best available`
                          : `Last pinned ${formatTime(log.time)}`
                      }
                    </div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 12 }}>
                    {ready
                      ? <span style={{ fontSize: 11, color: "#2ecc71", background: "#0d3a1f", padding: "4px 9px", borderRadius: 6 }}>✓ Ready</span>
                      : <div>
                          <div style={{ fontSize: 11, color: "#e67e22", fontWeight: 700 }}>{fmtCool(cool)}</div>
                          <div style={{ fontSize: 9, color: "#555" }}>remaining</div>
                        </div>
                    }
                  </div>
                </div>
                <button
                  onClick={() => logOne(zone, compound)}
                  style={{
                    width: "100%", marginTop: 12, padding: "9px 0", borderRadius: 8,
                    border: `1px solid ${c.border}`, background: `${c.primary}18`,
                    color: c.primary, fontSize: 12, fontWeight: 700,
                    fontFamily: "'Courier New', monospace", cursor: "pointer",
                  }}
                >
                  ✓ I pinned {zone.id} ({label})
                </button>
              </div>
            );
          })}

          {!bothReady && (
            <div style={{
              background: "#1a1208", border: "1px solid #3a2a08", borderRadius: 10,
              padding: "10px 14px", marginBottom: 10, fontSize: 11, color: "#a07820",
            }}>
              ⚠ Best available sites shown — confirm each pin separately as you do it
            </div>
          )}

          {/* Next session preview */}
          <div style={{ marginTop: 16, background: "#111118", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#444", marginBottom: 8, textTransform: "uppercase" }}>Next Session Preview</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>
              GHK-Cu → <span style={{ color: "#7ec8e3" }}>{next.ghk.label}</span>
              {next.ghkReady
                ? <span style={{ color: "#2ecc71", fontSize: 10, marginLeft: 6 }}>✓</span>
                : <span style={{ color: "#e67e22", fontSize: 10, marginLeft: 6 }}>{fmtCool(getCooldownLeft(fakeLogsAfter[next.ghk.id]))}</span>
              }
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              IPA+CJC → <span style={{ color: "#c8a0e8" }}>{next.ipa.label}</span>
              {next.ipaReady
                ? <span style={{ color: "#2ecc71", fontSize: 10, marginLeft: 6 }}>✓</span>
                : <span style={{ color: "#e67e22", fontSize: 10, marginLeft: 6 }}>{fmtCool(getCooldownLeft(fakeLogsAfter[next.ipa.id]))}</span>
              }
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button onClick={() => setSetup(true)} style={{
              flex: 1, padding: "7px 0", borderRadius: 8,
              border: "1px solid #1e2a3a", background: "transparent",
              color: "#2a5070", fontSize: 11, fontFamily: "'Courier New', monospace", cursor: "pointer",
            }}>Edit Past Pins</button>
            <button onClick={clearAll} style={{
              flex: 1, padding: "7px 0", borderRadius: 8,
              border: "1px solid #2a1a1a", background: "transparent",
              color: "#552222", fontSize: 11, fontFamily: "'Courier New', monospace", cursor: "pointer",
            }}>Reset All</button>
          </div>
        </div>
      )}

      {/* MAP */}
      {tab === "map" && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 12, textTransform: "uppercase" }}>Site Map</div>
          <div style={{ marginBottom: 20 }}>
            <BodyDiagram logs={logs} highlightGhk={ghk.id} highlightIpa={ipa.id} />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11, marginBottom: 12 }}>
            <span><span style={{ color: "#7ec8e3" }}>●</span> GHK-Cu</span>
            <span><span style={{ color: "#c8a0e8" }}>●</span> IPA+CJC</span>
            <span><span style={{ color: "#2ecc71" }}>●</span> Ready</span>
            <span><span style={{ color: "#e67e22" }}>●</span> Cooldown</span>
          </div>
          <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", width: "100%" }}>
            {ZONES.map((zone) => {
              const log = logs[zone.id];
              const ready = isReady(log);
              const cool = getCooldownLeft(log);
              const restH = log ? Math.round(hoursAgo(log.time)) : null;
              return (
                <div key={zone.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: "1px solid #1a1a2a", fontSize: 11,
                }}>
                  <span style={{ color: "#888" }}>
                    {zone.label}
                    {ghk.id === zone.id && <span style={{ color: "#7ec8e3", marginLeft: 6 }}>← GHK next</span>}
                    {ipa.id === zone.id && <span style={{ color: "#c8a0e8", marginLeft: 6 }}>← IPA next</span>}
                  </span>
                  <span style={{ color: ready ? "#2ecc71" : "#e67e22", fontSize: 10 }}>
                    {ready
                      ? (restH !== null ? `${restH}h rested` : "Fresh")
                      : fmtCool(cool)
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 12, textTransform: "uppercase" }}>Pin History</div>
          {ZONES.map((zone) => {
            const log = logs[zone.id];
            if (!log) return null;
            const c = COMPOUND_COLORS[log.compound] || { primary: "#888" };
            return (
              <div key={zone.id} style={{
                background: "#111118", border: "1px solid #1e1e2a", borderRadius: 8,
                padding: "10px 14px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <span style={{ color: c.primary, fontWeight: 700, fontSize: 12 }}>
                    {log.compound === "GHK" ? "GHK-Cu" : log.compound === "IPA" ? "IPA+CJC" : "Pinned"}
                  </span>
                  <span style={{ color: "#555", fontSize: 11, marginLeft: 8 }}>{zone.label}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{formatTime(log.time)}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>×{log.count} pins</div>
                </div>
              </div>
            );
          })}
          {Object.keys(logs).length === 0 && (
            <div style={{ color: "#444", fontSize: 12, textAlign: "center", padding: 20 }}>No pins logged yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
