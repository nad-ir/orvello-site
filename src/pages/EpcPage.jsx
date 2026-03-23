import { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, TrendingUp, Flame, Thermometer, Zap, Home, ChevronRight, ArrowUpRight, Info, Lightbulb, Shield } from "lucide-react";
import { Link } from "react-router-dom";

/* ─── RATING ENGINE ─── */
const RATINGS = {
  A: { color: "#1B8A3A", bg: "rgba(27,138,58,0.08)", border: "rgba(27,138,58,0.18)", score: "92–100", band: 1, label: "Exceptional", percentile: "Top 2% of UK homes", costMultiplier: 0.45 },
  B: { color: "#3B9B2F", bg: "rgba(59,155,47,0.08)", border: "rgba(59,155,47,0.18)", score: "81–91", band: 2, label: "Very efficient", percentile: "Top 15% of UK homes", costMultiplier: 0.6 },
  C: { color: "#8BC34A", bg: "rgba(139,195,74,0.08)", border: "rgba(139,195,74,0.18)", score: "69–80", band: 3, label: "Above average", percentile: "Top 40% of UK homes", costMultiplier: 0.75 },
  D: { color: "#F5C518", bg: "rgba(245,197,24,0.08)", border: "rgba(245,197,24,0.18)", score: "55–68", band: 4, label: "Average", percentile: "Around the UK average", costMultiplier: 1.0 },
  E: { color: "#F39C12", bg: "rgba(243,156,18,0.08)", border: "rgba(243,156,18,0.18)", score: "39–54", band: 5, label: "Below average", percentile: "Bottom 35% of UK homes", costMultiplier: 1.3 },
  F: { color: "#E67E22", bg: "rgba(230,126,34,0.08)", border: "rgba(230,126,34,0.18)", score: "21–38", band: 6, label: "Poor", percentile: "Bottom 15% of UK homes", costMultiplier: 1.65 },
  G: { color: "#C0392B", bg: "rgba(192,57,43,0.08)", border: "rgba(192,57,43,0.18)", score: "1–20", band: 7, label: "Very poor", percentile: "Bottom 5% of UK homes", costMultiplier: 2.1 },
};

const HEATING_DATA = {
  gas: { label: "Gas boiler", baseCost: 1200 },
  electric: { label: "Electric heating", baseCost: 1800 },
  oil: { label: "Oil boiler", baseCost: 1400 },
  lpg: { label: "LPG boiler", baseCost: 1500 },
  heatpump: { label: "Heat pump", baseCost: 750 },
  other: { label: "Other", baseCost: 1300 },
};

const INSULATION_DATA = {
  good: { label: "Good", impact: "low", factor: 0.9, desc: "Well insulated throughout" },
  average: { label: "Average", impact: "moderate", factor: 1.0, desc: "Some areas could be improved" },
  poor: { label: "Poor", impact: "significant", factor: 1.25, desc: "Major heat loss likely" },
};

function getInsights(rating, heating, insulation) {
  const r = RATINGS[rating];
  const h = HEATING_DATA[heating] || HEATING_DATA.gas;
  const ins = INSULATION_DATA[insulation] || INSULATION_DATA.average;
  const annualCost = Math.round(h.baseCost * r.costMultiplier * ins.factor);
  const monthlyCost = Math.round(annualCost / 12);

  // Potential rating (1-2 bands better, capped at A)
  const bands = "ABCDEFG";
  const currentIdx = bands.indexOf(rating);
  const potentialIdx = Math.max(0, currentIdx - 2);
  const potentialRating = bands[potentialIdx];
  const potentialR = RATINGS[potentialRating];
  const potentialAnnual = Math.round(h.baseCost * potentialR.costMultiplier * 0.9);
  const savingsAnnual = annualCost - potentialAnnual;

  // Limiting factors
  const limiters = [];
  if (ins.factor > 1) limiters.push({ icon: "thermo", text: "Insulation is a key limiting factor", detail: ins.desc });
  if (heating === "electric") limiters.push({ icon: "zap", text: "Electric heating has higher running costs", detail: "Consider a heat pump or gas alternative" });
  if (heating === "oil" || heating === "lpg") limiters.push({ icon: "flame", text: `${h.label} has moderate carbon output`, detail: "May affect future compliance requirements" });
  if (currentIdx >= 4) limiters.push({ icon: "home", text: "Property is below the national average", detail: "Improvements could significantly reduce bills" });

  // Suggestions
  const quickWins = [];
  const majorUpgrades = [];
  if (insulation !== "good") {
    quickWins.push("Draught-proof doors and windows");
    quickWins.push("Top up loft insulation to 270mm");
    majorUpgrades.push("Cavity or solid wall insulation");
  }
  if (heating === "electric" || heating === "oil" || heating === "lpg") {
    majorUpgrades.push("Upgrade to a heat pump or modern gas boiler");
  }
  if (currentIdx >= 2) {
    quickWins.push("Install LED lighting throughout");
    quickWins.push("Upgrade hot water cylinder insulation");
  }
  if (currentIdx >= 3) {
    majorUpgrades.push("Install double or triple glazing");
    majorUpgrades.push("Add solar PV panels");
  }
  if (quickWins.length === 0) quickWins.push("Property already performs well — maintain current systems");
  if (majorUpgrades.length === 0) majorUpgrades.push("No major upgrades needed at this time");

  return { r, h, ins, annualCost, monthlyCost, potentialRating, potentialR, savingsAnnual, limiters, quickWins, majorUpgrades };
}

function parseParams() {
  const p = new URLSearchParams(window.location.search);
  const rating = (p.get("rating") || "").toUpperCase();
  if (!RATINGS[rating]) return null;
  return {
    rating,
    heating: p.get("heating") || "gas",
    insulation: p.get("insulation") || "average",
    ref: p.get("ref") || null,
    addr: p.get("addr") || null,
  };
}

function GrainOverlay() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 14; }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5, mixBlendMode: "overlay", zIndex: 1 }} />;
}

/* ─── Rating bar visualisation ─── */
function RatingBar({ current }) {
  const bands = "ABCDEFG";
  const colors = ["#1B8A3A","#3B9B2F","#8BC34A","#F5C518","#F39C12","#E67E22","#C0392B"];
  const widths = [35, 45, 55, 65, 75, 85, 95]; // % widths for the stepped bars
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "24px 0" }}>
      {bands.split("").map((b, i) => {
        const active = b === current;
        return (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: `${widths[i]}%`, height: active ? 32 : 24,
              background: active ? colors[i] : `${colors[i]}20`,
              borderRadius: 4, display: "flex", alignItems: "center",
              paddingLeft: 12, transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
              border: active ? `2px solid ${colors[i]}` : "2px solid transparent",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: active ? 13 : 11,
                fontWeight: active ? 600 : 400,
                color: active ? "white" : colors[i],
                letterSpacing: "0.04em",
              }}>{b}</span>
            </div>
            {active && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: colors[i], fontWeight: 500, whiteSpace: "nowrap" }}>
                {RATINGS[b].score} pts
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function EpcPage() {
  const params = useMemo(() => parseParams(), []);
  const data = useMemo(() => params ? getInsights(params.rating, params.heating, params.insulation) : null, [params]);

  if (!params) {
    return (
      <div className="epc-root">
        <style>{STYLES}</style>
        <div className="epc-container" style={{ textAlign: "center", padding: "120px 24px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "var(--fg)", marginBottom: 12 }}>EPC not found</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 300 }}>This link is missing or invalid. Please contact us if you need assistance.</p>
          <a href="mailto:hello@orvello.co.uk" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, padding: "12px 24px", background: "var(--accent)", color: "var(--bg)", borderRadius: 8, textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Contact us</a>
        </div>
      </div>
    );
  }

  const { r, h, ins, annualCost, monthlyCost, potentialRating, potentialR, savingsAnnual, limiters, quickWins, majorUpgrades } = data;

  return (
    <div className="epc-root">
      <style>{STYLES}</style>
      <GrainOverlay />

      {/* Nav */}
      <nav className="epc-nav">
        <Link to="/" style={{ display: "flex", alignItems: "baseline", textDecoration: "none", gap: 3 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--fg-light)" }}>Orvello</span>
          <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
        </Link>
        <span className="mono" style={{ color: "var(--fg-dimmer)" }}>EPC Report</span>
      </nav>

      <div className="epc-container">
        {/* ═══ HERO CARD ═══ */}
        <div className="epc-card hero-card">
          <div className="hero-top">
            <div>
              <div className="mono" style={{ color: "var(--fg-dimmer)", marginBottom: 8 }}>Energy Performance Certificate</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,32px)", fontWeight: 400, color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>
                Your property is rated
              </h1>
              {params.addr && <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 300, lineHeight: 1.5 }}>{params.addr}</p>}
              {params.ref && <div className="mono" style={{ color: "var(--muted)", marginTop: 8, fontSize: 10 }}>Ref: {params.ref}</div>}
            </div>
            <div className="rating-badge" style={{ background: r.bg, borderColor: r.border, color: r.color }}>
              <span className="rating-letter">{params.rating}</span>
              <span className="rating-label">{r.label}</span>
            </div>
          </div>

          <RatingBar current={params.rating} />

          <div className="stat-row">
            <div className="stat-pill" style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color }}>
              <TrendingUp size={14} /> {r.percentile}
            </div>
          </div>
        </div>

        {/* ═══ COSTS ═══ */}
        <div className="epc-card">
          <div className="card-header">
            <Flame size={16} style={{ color: "var(--accent)" }} />
            <span>Estimated energy costs</span>
          </div>
          <div className="cost-grid">
            <div className="cost-box">
              <div className="cost-value">£{monthlyCost}</div>
              <div className="mono" style={{ color: "var(--muted)", fontSize: 9 }}>Per month</div>
            </div>
            <div className="cost-box">
              <div className="cost-value">£{annualCost.toLocaleString()}</div>
              <div className="mono" style={{ color: "var(--muted)", fontSize: 9 }}>Per year</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            <div className="detail-tag"><Flame size={11} /> {h.label}</div>
            <div className="detail-tag"><Thermometer size={11} /> Insulation: {ins.label.toLowerCase()}</div>
          </div>
          <p className="card-footnote">Based on typical usage for a property of this type and rating. Actual costs depend on tariff, usage, and property size.</p>
        </div>

        {/* ═══ LIMITING FACTORS ═══ */}
        {limiters.length > 0 && (
          <div className="epc-card">
            <div className="card-header">
              <Info size={16} style={{ color: "var(--accent)" }} />
              <span>Key factors affecting your rating</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {limiters.map((l, i) => (
                <div key={i} className="limiter-row">
                  <div className="limiter-icon">
                    {l.icon === "thermo" && <Thermometer size={14} />}
                    {l.icon === "zap" && <Zap size={14} />}
                    {l.icon === "flame" && <Flame size={14} />}
                    {l.icon === "home" && <Home size={14} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg)", marginBottom: 2 }}>{l.text}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300 }}>{l.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ POTENTIAL ═══ */}
        {potentialRating !== params.rating && (
          <div className="epc-card" style={{ border: `1px solid ${potentialR.border}` }}>
            <div className="card-header">
              <TrendingUp size={16} style={{ color: potentialR.color }} />
              <span>Potential improvement</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div className="mini-badge" style={{ background: r.bg, color: r.color, borderColor: r.border }}>{params.rating}</div>
              <ChevronRight size={16} style={{ color: "var(--muted)" }} />
              <div className="mini-badge" style={{ background: potentialR.bg, color: potentialR.color, borderColor: potentialR.border }}>{potentialRating}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300 }}>
                Save up to <strong style={{ color: "var(--fg)", fontWeight: 500 }}>£{savingsAnnual.toLocaleString()}/yr</strong>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="mono" style={{ color: "var(--muted)", marginBottom: 10, fontSize: 10 }}>Quick wins</div>
              {quickWins.map((s, i) => (
                <div key={i} className="suggestion-row">
                  <Lightbulb size={12} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 300 }}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="mono" style={{ color: "var(--muted)", marginBottom: 10, fontSize: 10 }}>Major upgrades</div>
              {majorUpgrades.map((s, i) => (
                <div key={i} className="suggestion-row">
                  <ArrowUpRight size={12} style={{ color: potentialR.color, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 300 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ GOV.UK ═══ */}
        <div className="epc-card gov-card">
          <Shield size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, color: "var(--fg)", fontWeight: 400, marginBottom: 4 }}>Official EPC register</p>
            <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300, lineHeight: 1.6, marginBottom: 10 }}>Your certificate will typically appear on the GOV.UK register within 24 hours of lodgement.</p>
            <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer" className="gov-link">
              View on GOV.UK <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* ═══ CTA ═══ */}
        <div className="epc-card cta-card">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--fg)", marginBottom: 6 }}>Want to improve your rating?</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>We offer PAS2035 retrofit assessments to help you plan and fund energy improvements. Get in touch for a free consultation.</p>
          <a href="mailto:hello@orvello.co.uk" className="cta-btn">Speak to us <ChevronRight size={14} /></a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", textDecoration: "none", gap: 3, opacity: 0.3, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 0.5} onMouseLeave={e => e.currentTarget.style.opacity = 0.3}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 400, color: "var(--fg-light)" }}>Orvello</span>
            <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
  :root{
    --bg:#272420;--bg-light:#F7F6F3;--bg-off:#EDECE8;--bg-card:white;
    --fg:#1A1A18;--fg-light:#F0EEE8;--fg-dimmer:rgba(240,238,232,0.25);
    --muted:#8A8A80;--accent:#E4D048;
    --border:#DDDBD5;
    --font-display:'Bricolage Grotesque',sans-serif;
    --font-body:'Bricolage Grotesque',sans-serif;
    --font-mono:'IBM Plex Mono',monospace;
  }
  .epc-root{
    font-family:var(--font-body);background:var(--bg);
    min-height:100vh;position:relative;overflow-x:hidden;
  }
  .epc-nav{
    position:sticky;top:0;z-index:50;
    background:rgba(39,36,32,0.92);backdrop-filter:blur(16px);
    padding:0 24px;height:56px;display:flex;align-items:center;
    justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.05);
  }
  .epc-container{
    max-width:560px;margin:0 auto;padding:24px 16px 48px;
    position:relative;z-index:2;
  }
  .mono{font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
  .epc-card{
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:14px;padding:clamp(20px,4vw,28px);margin-bottom:16px;
  }
  .hero-card{padding:clamp(24px,4vw,32px)}
  .hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
  .rating-badge{
    width:80px;height:80px;border-radius:16px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    border:2px solid;flex-shrink:0;
  }
  .rating-letter{font-family:var(--font-display);font-size:36px;font-weight:500;line-height:1}
  .rating-label{font-size:9px;font-family:var(--font-mono);letter-spacing:0.08em;text-transform:uppercase;margin-top:2px;font-weight:500}
  .stat-row{display:flex;gap:8px;flex-wrap:wrap}
  .stat-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:400;border:1px solid}
  .card-header{display:flex;align-items:center;gap:10px;margin-bottom:18px;font-size:15px;font-weight:400;color:var(--fg)}
  .cost-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .cost-box{background:var(--bg-light);border:1px solid var(--border);border-radius:10px;padding:20px;text-align:center}
  .cost-value{font-family:var(--font-display);font-size:clamp(28px,5vw,36px);font-weight:400;color:var(--fg);letter-spacing:-0.02em}
  .detail-tag{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:var(--bg-light);border:1px solid var(--border);border-radius:6px;font-size:11px;color:var(--muted);font-family:var(--font-mono);letter-spacing:0.02em}
  .card-footnote{font-size:11px;color:var(--muted);font-weight:300;margin-top:16px;line-height:1.6;font-style:italic}
  .limiter-row{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--border)}
  .limiter-row:last-child{border-bottom:none;padding-bottom:0}
  .limiter-icon{width:36px;height:36px;border-radius:10px;background:var(--bg-light);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted);flex-shrink:0}
  .mini-badge{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:500;border:2px solid;flex-shrink:0}
  .suggestion-row{display:flex;gap:10px;align-items:flex-start;padding:6px 0}
  .gov-card{display:flex;gap:16px;align-items:flex-start}
  .gov-link{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--accent);text-decoration:none;font-weight:400;font-family:var(--font-mono);letter-spacing:0.02em;transition:opacity 0.2s}
  .gov-link:hover{opacity:0.7}
  .cta-card{background:var(--bg-light);border:1px solid var(--border);text-align:center}
  .cta-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:var(--accent);color:var(--bg);border-radius:8px;text-decoration:none;font-family:var(--font-mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.3s cubic-bezier(.22,1,.36,1)}
  .cta-btn:hover{filter:brightness(1.06);transform:translateY(-1px);box-shadow:0 8px 24px rgba(228,208,72,0.15)}
`;
