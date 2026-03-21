import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ChevronDown, Menu, X, Shield, FileCheck, Zap, Clock, Check, Star, ChevronRight, Calendar, PenTool, Building2, Home, Landmark, KeyRound, Briefcase, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const SERVICES = [
  { id: "epc", tag: "01", title: "Domestic EPCs", subtitle: "Energy Performance Certificates", bookable: true, link: "https://tally.so/r/Gx0jJj", description: "Fast, reliable Energy Performance Certificates for landlords, homeowners, and estate agents across Northamptonshire. Competitively priced with flexible booking and quick turnaround.", items: ["Residential EPC assessments", "Landlord & letting agent packages", "Estate agent partnerships", "Bulk & portfolio pricing", "Same-week availability", "Digital certificate delivery"] },
  { id: "retrofit", tag: "02", title: "PAS2035 Retrofit", subtitle: "Whole-house retrofit under PAS2035:2023", bookable: true, link: "https://tally.so/r/LZ0qVJ", description: "Retrofit assessments supporting government-funded energy efficiency schemes under the PAS2035 framework, producing detailed reports that inform the retrofit pathway.", items: ["Retrofit assessments", "Dwelling condition surveys", "Medium-term improvement plans", "ECO & GBIS scheme support", "Batch assessment pricing", "Social housing portfolios"] },
  { id: "cdm", tag: "03", title: "CDM Principal Designer", subtitle: "CDM Regulations 2015", comingSoon: true, description: "We take on the Principal Designer role, managing pre-construction H&S information, coordinating design teams, and ensuring CDM compliance from concept to completion.", items: ["Principal Designer appointments", "Client advisory services", "Pre-construction info packs", "H&S file compilation", "Design risk management", "Site inspections & audits"] },
  { id: "fire", tag: "04", title: "Fire Risk Assessments", subtitle: "Fire Safety Order 2005", comingSoon: true, description: "Comprehensive fire risk assessments for commercial properties, HMOs, and residential blocks. We identify hazards, evaluate risk, and provide actionable recommendations.", items: ["Type 1, 2 & 3 assessments", "HMO & residential blocks", "Commercial premises", "Fire door inspections", "Review & reassessment", "Fire safety training"] },
];

const FAQ_DATA = [
  { 
    q: "What is an EPC and do I need one?", 
    a: "An Energy Performance Certificate (EPC) rates your property's energy efficiency from A to G. A valid EPC is legally required when selling, letting or renting a property. Certificates remain valid for 10 years." 
  },
  { 
    q: "How long does an EPC assessment take?", 
    a: "Most domestic EPC assessments take 30–60 minutes, depending on property size and layout. Your certificate is typically lodged and issued within 24–48 hours of the visit." 
  },
  { 
    q: "What areas do you cover?", 
    a: "We cover Northampton and the wider Northamptonshire area, including Kettering, Wellingborough, Corby, Daventry and Towcester. Surrounding areas can be accommodated by arrangement." 
  },
  { 
    q: "What is a PAS2035 retrofit assessment?", 
    a: "PAS2035 is the UK standard for domestic retrofit. A retrofit assessment reviews your property’s condition, occupancy and energy performance, then defines a compliant improvement pathway. Required for schemes such as ECO4 and the Great British Insulation Scheme." 
  },
  { 
    q: "What does a CDM Principal Designer do?", 
    a: "Under CDM 2015, the Principal Designer is responsible for planning, managing and coordinating health and safety during the pre-construction phase. This includes identifying design risks, preparing pre-construction information, and ensuring compliance throughout the project lifecycle." 
  },
  { 
    q: "Do you offer bulk or portfolio pricing?", 
    a: "Yes — we provide structured pricing for landlords, estate agents and organisations with multiple properties. Contact us with your requirements for a tailored quote." 
  },
  { 
    q: "How do I book an assessment?", 
    a: "You can book directly online using our instant pricing tool for EPC and retrofit assessments. For CDM or fire risk enquiries, submit a request via the contact form and we’ll respond promptly." 
  },
];

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={className} style={{ ...style, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── HERO BG: Mouse-reactive on desktop, auto-drifting on touch ─── */
function HeroBg() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.4, y: 0.3 });
  const grainRef = useRef(null);
  const isTouchRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, frame;
    isTouchRef.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const resize = () => { w = canvas.width = canvas.offsetWidth * 0.5; h = canvas.height = canvas.offsetHeight * 0.5; };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e) => {
      if (isTouchRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouse);

    let orbX = 0.4, orbY = 0.3;

    const draw = (t) => {
      ctx.fillStyle = "#272420";
      ctx.fillRect(0, 0, w, h);

      let targetX, targetY;
      if (isTouchRef.current) {
        targetX = 0.5 + Math.sin(t * 0.0002) * 0.25;
        targetY = 0.4 + Math.cos(t * 0.00015) * 0.2;
      } else {
        targetX = mouseRef.current.x;
        targetY = mouseRef.current.y;
      }

      orbX += (targetX - orbX) * 0.03;
      orbY += (targetY - orbY) * 0.03;

      const cx = orbX * w;
      const cy = orbY * h;
      const cr = Math.min(w, h) * 0.9;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      grad.addColorStop(0, "rgba(228, 208, 72, 0.14)");
      grad.addColorStop(0.2, "rgba(228, 208, 72, 0.08)");
      grad.addColorStop(0.45, "rgba(228, 208, 72, 0.03)");
      grad.addColorStop(1, "rgba(228, 208, 72, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMouse); };
  }, []);

  useEffect(() => {
    const c = grainRef.current;
    if (!c) return;
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 18;
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, borderRadius: "inherit" }} />
      <canvas ref={grainRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", opacity: 0.5, mixBlendMode: "overlay", borderRadius: "inherit" }} />
    </>
  );
}

/* ─── CSS lava + grain overlay for non-hero dark sections ─── */
function LavaBg() {
  const grainRef = useRef(null);
  useEffect(() => {
    const c = grainRef.current;
    if (!c) return;
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 14;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return (
    <>
      <div className="lava-blobs" />
      <canvas ref={grainRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5, mixBlendMode: "overlay", zIndex: 1 }} />
    </>
  );
}

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      {FAQ_DATA.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={i} className="faq-item">
            <button className="faq-btn" onClick={() => setOpenIdx(open ? null : i)}>
              <span style={{ fontSize: 15, fontWeight: 400, transition: "color 0.2s", lineHeight: 1.4, color: open ? "var(--fg)" : "var(--muted)" }}>{item.q}</span>
              <ChevronDown size={18} style={{ transition: "transform 0.35s", transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--muted)", flexShrink: 0 }} />
            </button>
            <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height 0.45s cubic-bezier(.22,1,.36,1), opacity 0.3s", opacity: open ? 1 : 0 }}>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--muted)", fontWeight: 300, paddingBottom: 24, maxWidth: 560 }}>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── ACCORDION SERVICES ─── */
function ServiceAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  const timeoutRef = useRef(null);

  const handleEnter = (i) => {
    clearTimeout(timeoutRef.current);
    setOpenIdx(i);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenIdx(null), 300);
  };

  return (
    <div>
      {SERVICES.map((s, i) => {
        const open = openIdx === i;
        return (
          <div key={s.id}
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={handleLeave}
            onClick={() => setOpenIdx(open ? null : i)}
            style={{
              borderBottom: "1px solid var(--border-light)",
              borderLeft: open ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.3s",
              paddingLeft: open ? 24 : 0,
              background: open ? "rgba(228,208,72,0.02)" : "transparent",
              cursor: "pointer",
            }}>
            <div
              style={{
                width: "100%", padding: "28px 0",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 20, textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: open ? "var(--accent)" : "var(--muted)", letterSpacing: "0.05em", fontWeight: 400, minWidth: 24, transition: "color 0.3s" }}>{s.tag}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: open ? 400 : 300, color: "var(--fg)", transition: "all 0.3s", letterSpacing: "-0.02em" }}>{s.title}</span>
                {s.comingSoon && <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B7A2E", background: "rgba(228,208,72,0.18)", padding: "3px 10px", borderRadius: 2 }}>Available soon</span>}
                {s.bookable && <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5A7A5F", background: "rgba(90,122,95,0.08)", padding: "3px 10px", borderRadius: 2 }}>Book now</span>}
              </div>
              <ChevronRight size={18} style={{ transition: "transform 0.35s cubic-bezier(.22,1,.36,1)", transform: open ? "rotate(90deg)" : "rotate(0)", color: open ? "var(--accent)" : "var(--muted)", flexShrink: 0 }} />
            </div>
            <div style={{
              maxHeight: open ? 500 : 0, overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(.22,1,.36,1), opacity 0.35s",
              opacity: open ? 1 : 0,
            }}>
              <div style={{ paddingBottom: 32, paddingLeft: 40 }}>
                <div className="mono-label" style={{ color: "var(--muted)", marginBottom: 10, fontSize: 10 }}>{s.subtitle}</div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--muted)", maxWidth: 560, marginBottom: 24, fontWeight: 300 }}>{s.description}</p>
                <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px", marginBottom: 24 }}>
                  {s.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--fg)", fontWeight: 300 }}>
                      <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />{item}
                    </div>
                  ))}
                </div>
                {s.bookable ? (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn-accent" style={{ textDecoration: "none" }}>Book now <ArrowRight size={14} /></a>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "var(--accent-dim)", border: "1px solid rgba(228,208,72,0.15)", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 400, borderRadius: 2 }}><Clock size={12} /> Available soon</div>
                    <button className="btn-outline-light" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Register interest <ArrowRight size={13} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PricingCalc() {
  const [service, setService] = useState(null);
  const [bedrooms, setBedrooms] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const epcPrices = { "1-2": 75, "3": 85, "4": 95, "5+": 110 };
  const retroPrices = { "1": 200, "2-10": 180, "11-50": 160, "50+": "Quote" };
  const price = service === "epc" && bedrooms ? `£${epcPrices[bedrooms]}` : service === "retrofit" && quantity ? (typeof retroPrices[quantity] === "number" ? `£${retroPrices[quantity]}` : retroPrices[quantity]) : null;
  const isQuote = price === "Quote";
  const link = service === "epc" ? "https://tally.so/r/Gx0jJj" : "https://tally.so/r/LZ0qVJ";

  const Pill = ({ active, children, onClick }) => (
    <button onClick={onClick} style={{ padding: "12px 0", flex: 1, textAlign: "center", background: active ? "var(--accent)" : "transparent", color: active ? "var(--bg)" : "rgba(255,255,255,0.45)", border: active ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.1)", fontWeight: active ? 500 : 300, fontSize: 13, cursor: "pointer", transition: "all 0.25s", fontFamily: "var(--font-mono)", letterSpacing: "0.02em", borderRadius: 2 }}>{children}</button>
  );

  return (
    <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px) saturate(1.1)", border: "1px solid rgba(255,255,255,0.1)", padding: "clamp(24px,4vw,40px)", borderRadius: 8, boxShadow: "0 2px 24px rgba(0,0,0,0.1)" }}>
      <div style={{ marginBottom: 24 }}>
        <label className="mono-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 10, display: "block" }}>01 — Select service</label>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill active={service === "epc"} onClick={() => { setService("epc"); setBedrooms(null); setQuantity(null); }}>Domestic EPC</Pill>
          <Pill active={service === "retrofit"} onClick={() => { setService("retrofit"); setBedrooms(null); setQuantity(null); }}>Retrofit</Pill>
          <Pill active={service === "cdm"} onClick={() => { setService("cdm"); setBedrooms(null); setQuantity(null); }}>CDM / FRA</Pill>
        </div>
      </div>
      {service === "epc" && (
        <div style={{ marginBottom: 24 }}>
          <label className="mono-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 10, display: "block" }}>02 — Bedrooms</label>
          <div style={{ display: "flex", gap: 8 }}>{[["1-2", "1–2 bed"], ["3", "3 bed"], ["4", "4 bed"], ["5+", "5+ bed"]].map(([k, l]) => <Pill key={k} active={bedrooms === k} onClick={() => setBedrooms(k)}>{l}</Pill>)}</div>
        </div>
      )}
      {service === "retrofit" && (
        <div style={{ marginBottom: 24 }}>
          <label className="mono-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 10, display: "block" }}>02 — Properties</label>
          <div style={{ display: "flex", gap: 8 }}>{[["1", "1"], ["2-10", "2–10"], ["11-50", "11–50"], ["50+", "50+"]].map(([k, l]) => <Pill key={k} active={quantity === k} onClick={() => setQuantity(k)}>{l}</Pill>)}</div>
        </div>
      )}
      {service === "cdm" && <div style={{ padding: "14px 18px", background: "rgba(228,208,72,0.06)", border: "1px solid rgba(228,208,72,0.12)", fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6, fontWeight: 300, borderRadius: 2 }}>CDM and fire risk services available soon. Register your interest and we'll scope your requirements within 48 hours.</div>}
      {price && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="mono-label" style={{ color: "rgba(255,255,255,0.35)" }}>{isQuote ? "Bespoke pricing" : "Your price"}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 300, color: "var(--fg-light)", marginTop: 4 }}>{isQuote ? "Get a quote" : price}</div>
            {!isQuote && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>{service === "retrofit" ? "per property · inc. survey & report" : "inc. visit, lodgement & certificate"}</span>}
          </div>
          <a href={isQuote ? "#contact" : link} target={isQuote ? "_self" : "_blank"} rel="noopener noreferrer" onClick={isQuote ? (e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); } : undefined} className="btn-accent" style={{ textDecoration: "none" }}>{isQuote ? "Speak to us" : "Continue booking"} <ArrowRight size={14} /></a>
        </div>
      )}
      {service === "cdm" && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-accent" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Register interest <ArrowRight size={14} /></button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="orvello-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
        :root{
          --bg:#272420;--bg-light:#F7F6F3;--bg-off:#EDECE8;
          --fg:#1A1A18;--fg-light:#F0EEE8;
          --muted:#8A8A80;--muted-light:#B0B0A8;
          --accent:#E4D048;--accent-dim:rgba(228,208,72,0.10);
          --border-light:#DDDBD5;--border-dark:rgba(255,255,255,0.10);
          --font-display:'Bricolage Grotesque',sans-serif;
          --font-body:'Bricolage Grotesque',sans-serif;
          --font-mono:'IBM Plex Mono',monospace;
          --max-w:1240px;--px:clamp(20px,5vw,72px);
          --hero-top-bg:#E8E6E0;
        }
        .orvello-root{font-family:var(--font-body);background:var(--bg-light);color:var(--fg);min-height:100vh;overflow-x:hidden}
        .nav-link{font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#262420;text-decoration:none;cursor:pointer;transition:color 0.2s;background:none;border:none;font-weight:400;padding:0;opacity:0.45}
        .nav-link:hover{opacity:0.85}
        .nav-scrolled .nav-link{color:rgba(255,255,255,1);opacity:0.4}
        .nav-scrolled .nav-link:hover{opacity:0.8}
        .btn-accent{display:inline-flex;align-items:center;gap:10px;background:var(--accent);color:var(--bg);border:none;padding:14px 28px;font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);font-family:var(--font-mono);border-radius:2px}
        .btn-accent:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 8px 24px rgba(228,208,72,0.18)}
        .btn-outline-dark{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--fg-light);border:1px solid rgba(255,255,255,0.18);padding:14px 28px;font-size:12px;font-weight:300;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s;font-family:var(--font-mono);text-decoration:none;border-radius:2px}
        .btn-outline-dark:hover{border-color:var(--accent);color:var(--accent)}
        .btn-outline-light{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--fg);border:1px solid var(--border-light);padding:14px 28px;font-size:12px;font-weight:400;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s;font-family:var(--font-mono);text-decoration:none;border-radius:2px}
        .btn-outline-light:hover{border-color:var(--fg)}
        .mono-label{font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
        .section-tag{font-family:var(--font-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:400;display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .section-tag::before{content:'';display:inline-block;width:32px;height:1px;background:currentColor;opacity:0.3}
        .section-heading{font-family:var(--font-display);font-weight:300;letter-spacing:-0.03em;line-height:1.08}
        .faq-item{border-bottom:1px solid var(--border-light)}
        .faq-btn{width:100%;padding:24px 0;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;font-family:inherit;text-align:left}
        .form-input{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);padding:14px 18px;color:var(--fg-light);font-size:14px;font-family:var(--font-body);font-weight:300;outline:none;transition:border-color 0.3s;border-radius:2px}
        .form-input:focus{border-color:var(--accent)}
        .form-input::placeholder{color:rgba(255,255,255,0.2)}
        .cred-card{background:white;border:1px solid var(--border-light);padding:28px;border-radius:4px;transition:all 0.35s cubic-bezier(.22,1,.36,1);cursor:default;display:flex;flex-direction:column;height:100%}
        .cred-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.06);border-color:rgba(228,208,72,0.3)}
        .lava-blobs{position:absolute;inset:0;overflow:hidden;z-index:0}
        .lava-blobs::before,.lava-blobs::after{content:'';position:absolute;border-radius:50%;filter:blur(80px);animation:lavaFloat 12s ease-in-out infinite alternate}
        .lava-blobs::before{width:50%;height:50%;top:-5%;left:15%;background:radial-gradient(circle,rgba(228,208,72,0.05) 0%,transparent 70%);animation-duration:16s}
        .lava-blobs::after{width:40%;height:40%;bottom:0%;right:10%;background:radial-gradient(circle,rgba(228,208,72,0.04) 0%,transparent 70%);animation-duration:20s;animation-delay:-5s}
        @keyframes lavaFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(25px,-15px) scale(1.05)}100%{transform:translate(-15px,10px) scale(0.97)}}

        .marquee-track{display:flex;gap:48px;animation:marquee 35s linear infinite;width:max-content}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .marquee-item{font-family:var(--font-display);font-size:clamp(24px,3.5vw,38px);color:var(--border-light);white-space:nowrap;font-style:italic;font-weight:300;user-select:none}

        /* Hero card */
        .hero-card{
          position:relative;overflow:hidden;
          border-radius:20px;
          box-shadow:0 4px 60px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08);
        }

        @media(max-width:900px){
          .desktop-nav{display:none!important}.hamburger{display:flex!important}
          .g2,.g3{grid-template-columns:1fr!important}
          .g4{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr!important;gap:32px!important}
          .hero-title{font-size:clamp(36px,9vw,54px)!important}
          .hero-btns{flex-direction:column!important}
          .booking-banner{flex-direction:column!important;align-items:flex-start!important}
          .booking-banner>div:last-child{width:100%!important;flex-direction:column!important}
          .booking-banner>div:last-child>a{width:100%!important;text-align:center!important;justify-content:center!important}
          .hero-pills{flex-wrap:wrap!important}
          .hero-card{border-radius:14px}
        }
        @media(max-width:600px){.g4{grid-template-columns:1fr!important}}
      `}</style>

      {/* NAV — sits on the light hero-top background, switches to dark on scroll */}
      <nav className={scrolled ? "nav-scrolled" : ""} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(43,43,35,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px) saturate(1.3)" : "none", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.05)" : "transparent"}`, transition: "all 0.4s", padding: "0 var(--px)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ cursor: "pointer", display: "flex", alignItems: "baseline" }} onClick={() => scrollTo("top")}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: scrolled ? "var(--fg-light)" : "#262420", letterSpacing: "-0.02em", transition: "color 0.4s" }}>Orvello</span>
            <span style={{ width: 4, height: 4, background: "var(--accent)", display: "inline-block", marginLeft: 2, marginBottom: 2, borderRadius: 1 }} />
          </div>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {["services", "about", "faq", "contact"].map(s => <button key={s} className="nav-link" onClick={() => scrollTo(s)}>{s}</button>)}
            <a href="https://tally.so/r/Gx0jJj" target="_blank" rel="noopener noreferrer" className="btn-accent" style={{ padding: "7px 16px", fontSize: 10, textDecoration: "none" }}>Book EPC</a>
          </div>
          <button className="hamburger" style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4 }} onClick={() => setMenuOpen(true)}><Menu size={20} color={scrolled ? "var(--fg-light)" : "#262420"} /></button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", cursor: "pointer" }}><X size={24} color="var(--fg-light)" /></button>
          {["services", "about", "faq", "contact"].map(s => <button key={s} className="nav-link" onClick={() => scrollTo(s)} style={{ fontSize: 16, color: "var(--fg-light)", opacity: 1 }}>{s}</button>)}
        </div>
      )}

      {/* ═══ HERO — Light top with nav, then rounded dark card ═══ */}
      <section id="top" style={{ background: "var(--hero-top-bg)", padding: "0 clamp(12px, 2.5vw, 32px)", paddingBottom: "clamp(40px, 6vw, 80px)" }}>
        {/* Spacer for fixed nav */}
        <div style={{ height: 68 }} />

        {/* Rounded dark card */}
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <Reveal delay={0.04}>
            <div className="hero-card" style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center" }}>
              <HeroBg />
              <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "clamp(56px, 8vw, 120px) clamp(36px, 6vw, 88px)" }}>
                <Reveal delay={0.08}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                    <span style={{ width: 8, height: 8, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>Construction Consultancy</span>
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <h1 className="hero-title" style={{
                    fontFamily: "var(--font-display)", fontSize: "clamp(34px, 5vw, 58px)",
                    fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.12,
                    maxWidth: 720, marginBottom: 28, color: "var(--fg-light)",
                  }}>
                    Safe design, compliant buildings, <em style={{ fontStyle: "italic", fontWeight: 300 }}>trusted advice.</em>
                  </h1>
                </Reveal>
                <Reveal delay={0.16}>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.45)", maxWidth: 500, marginBottom: 44, fontWeight: 300 }}>
                    CDM Principal Designer services, fire risk assessments, domestic EPCs, and PAS2035 retrofit assessments — delivered with rigour across Northamptonshire and surrounding areas.
                  </p>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="hero-btns" style={{ display: "flex", gap: 14, marginBottom: 56 }}>
                    <button className="btn-accent" onClick={() => scrollTo("book")}>Get instant price <ArrowRight size={14} /></button>
                    <button className="btn-outline-dark" onClick={() => scrollTo("services")}>Our services</button>
                  </div>
                </Reveal>

                {/* Service pills */}
                <Reveal delay={0.24}>
                  <div className="hero-pills" style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                    {["Domestic EPC", "PAS2035", "CDM 2015", "Fire Safety"].map(label => (
                      <div key={label} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
                        background: "rgba(240,238,232,0.08)", backdropFilter: "blur(4px)",
                        border: "1px solid rgba(240,238,232,0.1)", borderRadius: 2,
                        fontSize: 14, color: "var(--fg-light)", fontWeight: 300,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5A7A5F" }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={0.28}>
                  <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                    {["Same-week availability", "From £75", "Fully insured"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
                        <Check size={14} style={{ color: "var(--accent)" }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SCROLLING MARQUEE ═══ */}
      <div style={{ overflow: "hidden", padding: "32px 0", background: "var(--bg-light)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, rep) =>
            ["Principal Designer", "Fire Risk Assessment", "Energy Performance", "Retrofit Assessment", "CDM Compliance", "Building Safety"].map((t, i) => (
              <span className="marquee-item" key={`${rep}-${i}`}>
                {t} <span style={{ margin: "0 16px", opacity: 0.3, fontSize: "0.6em" }}>✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ═══ BOOKING BANNER ═══ */}
      <section style={{
        background: "var(--bg)",
        padding: "52px var(--px)", position: "relative", overflow: "hidden",
      }}>
        <LavaBg />
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div className="booking-banner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(228,208,72,0.12)", padding: "5px 14px", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 14, borderRadius: 2 }}>
                <Calendar size={12} /> Now booking
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 300, color: "var(--fg-light)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>
                Get your EPC or Retrofit quote in <em style={{ fontStyle: "italic" }}>60 seconds</em>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 300, lineHeight: 1.6 }}>Instant pricing. Flexible appointments. Same-week availability.</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="https://tally.so/r/Gx0jJj" target="_blank" rel="noopener noreferrer" className="booking-cta-primary" style={{
                background: "var(--accent)", color: "var(--bg)", border: "none", padding: "16px 32px",
                fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10,
                fontFamily: "var(--font-mono)", transition: "all 0.3s cubic-bezier(.22,1,.36,1)", borderRadius: 2,
              }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(228,208,72,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >Book an EPC <ArrowRight size={14} /></a>
              <a href="https://tally.so/r/LZ0qVJ" target="_blank" rel="noopener noreferrer" style={{
                background: "transparent", color: "var(--fg-light)", border: "1px solid rgba(255,255,255,0.15)",
                padding: "16px 32px", fontSize: 12, fontWeight: 300, letterSpacing: "0.05em",
                textTransform: "uppercase", textDecoration: "none", display: "inline-flex",
                alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", transition: "all 0.3s cubic-bezier(.22,1,.36,1)", borderRadius: 2,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "var(--fg-light)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >Book a Retrofit <ArrowRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHO WE WORK WITH ═══ */}
      <section style={{ padding: "100px var(--px)", background: "var(--bg-light)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <Reveal>
              <div className="section-tag" style={{ color: "var(--muted)" }}>Who we work with</div>
              <h2 className="section-heading" style={{ fontSize: "clamp(26px, 3.5vw, 40px)", marginBottom: 24 }}>
                Trusted by architects, developers & housing providers across <em style={{ fontStyle: "italic" }}>Northamptonshire.</em>
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--muted)", fontWeight: 300 }}>
                From single-dwelling EPC assessments to multi-phase CDM appointments, we support clients at every scale. Our work spans private developments, social housing portfolios, local authority contracts, and commercial property management across Northamptonshire and surrounding areas — always with the same standard of technical rigour.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: <PenTool size={15} />, label: "Architects & designers" },
                  { icon: <Building2 size={15} />, label: "Property developers" },
                  { icon: <Home size={15} />, label: "Housing associations" },
                  { icon: <Landmark size={15} />, label: "Local authorities" },
                  { icon: <KeyRound size={15} />, label: "Estate agents" },
                  { icon: <Briefcase size={15} />, label: "Landlords & portfolio owners" },
                ].map((c, i) => (
                  <div key={i} style={{
                    padding: "16px 18px", background: "white", border: "1px solid var(--border-light)",
                    borderRadius: 4, display: "flex", alignItems: "center", gap: 12,
                    fontSize: 14, fontWeight: 300, color: "var(--fg)", transition: "border-color 0.3s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(228,208,72,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-light)"}
                  >
                    <span style={{ color: "var(--muted)", display: "flex", alignItems: "center" }}>{c.icon}</span>
                    {c.label}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section id="services" style={{ padding: "100px var(--px)", background: "white", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <Reveal>
            <div className="section-tag" style={{ color: "var(--muted)" }}>What we do</div>
            <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 46px)", marginBottom: 48 }}>Our <em style={{ fontStyle: "italic" }}>services</em></h2>
          </Reveal>
          <Reveal delay={0.06}>
            <ServiceAccordion />
          </Reveal>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" style={{ background: "var(--bg-light)", color: "var(--fg)", padding: "100px var(--px)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 80, alignItems: "center" }}>
            <Reveal>
              <div className="section-tag" style={{ color: "var(--muted)" }}>About Orvello</div>
              <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 28 }}>Built on engineering, driven by <em style={{ fontStyle: "italic" }}>diligence.</em></h2>
              <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--muted)", fontWeight: 300, marginBottom: 20 }}>Orvello is a construction consultancy based in Northampton, founded on a civil engineering background and a commitment to getting the details right. We work with architects, developers, housing associations, and local authorities across Northamptonshire and surrounding areas.</p>
              <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--muted)", fontWeight: 300 }}>Whether you need a Principal Designer for a complex multi-phase build or a straightforward EPC for a two-bed terrace, we bring the same standard of care to every instruction.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[{ num: "4", label: "Core services" }, { num: "CDM", label: "2015 compliant" }, { num: "PAS", label: "2035 qualified" }, { num: "FRA", label: "Certified assessor" }].map((s, i) => (
                  <div key={i} style={{
                    background: "white", padding: 28, borderRadius: 6,
                    border: "1px solid var(--border-light)",
                    transition: "all 0.3s cubic-bezier(.22,1,.36,1)", cursor: "default",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 300, color: "var(--accent)", marginBottom: 6 }}>{s.num}</div>
                    <div className="mono-label" style={{ color: "var(--muted)", fontSize: 10 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CREDENTIALS ═══ */}
      <section style={{ padding: "100px var(--px)", background: "white", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <Reveal>
            <div className="section-tag" style={{ color: "var(--muted)" }}>Why Orvello</div>
            <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 16 }}>What sets us <em style={{ fontStyle: "italic" }}>apart.</em></h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", fontWeight: 300, maxWidth: 520, marginBottom: 48 }}>Engineering-led consultancy with the qualifications, insurance, and responsiveness your project demands.</p>
          </Reveal>
          <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { icon: <Shield size={20} />, title: "Qualified & Specialist", desc: "BEng Civil Engineering with postgraduate expertise in energy assessment and compliance.", stat: "BEng + MSc", color: "#4A5D4F", bg: "rgba(74,93,79,0.08)", border: "rgba(74,93,79,0.15)" },
              { icon: <FileCheck size={20} />, title: "Fully Insured", desc: "Professionally insured with PI & Public Liability, in line with all industry standards.", stat: "PI + PL", color: "#6B5B3E", bg: "rgba(107,91,62,0.08)", border: "rgba(107,91,62,0.15)" },
              { icon: <ClipboardList size={20} />, title: "Clear Reports", desc: "Every report includes clear findings, practical recommendations, and full regulatory alignment.", stat: "100%", color: "#5A7A8A", bg: "rgba(90,122,138,0.08)", border: "rgba(90,122,138,0.15)" },
              { icon: <Zap size={20} />, title: "Fast & Reliable", desc: "Same-week EPC availability. Retrofit and consultancy scoped within 48 hours.", stat: "48hr", color: "#8B6D3F", bg: "rgba(139,109,63,0.08)", border: "rgba(139,109,63,0.15)" },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{
                  background: "var(--bg-light)", border: "1px solid var(--border-light)",
                  borderRadius: 8, padding: 28, height: "100%",
                  display: "flex", flexDirection: "column",
                  transition: "all 0.35s cubic-bezier(.22,1,.36,1)", cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color }}>{c.icon}</div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: c.color, letterSpacing: "0.05em", fontWeight: 500, opacity: 0.7 }}>{c.stat}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>{c.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)", fontWeight: 300, flex: 1 }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="book" style={{ padding: "100px var(--px)", background: "var(--bg)", color: "var(--fg-light)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "45%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(228,208,72,0.07) 0%, rgba(228,208,72,0.02) 40%, transparent 65%)", filter: "blur(40px)", pointerEvents: "none", animation: "lavaFloat 16s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "20%", width: "30%", height: "35%", borderRadius: "50%", background: "radial-gradient(circle, rgba(228,208,72,0.04) 0%, transparent 60%)", filter: "blur(35px)", pointerEvents: "none", animation: "lavaFloat 20s ease-in-out infinite alternate-reverse" }} />
        <LavaBg />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="section-tag" style={{ color: "var(--accent)", justifyContent: "center" }}>Instant pricing</div>
              <h2 className="section-heading" style={{ fontSize: "clamp(26px, 3.5vw, 40px)", color: "var(--fg-light)" }}>Ready to book your <em style={{ fontStyle: "italic" }}>assessment?</em></h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 300, marginTop: 12 }}>Get your quote in under 60 seconds.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}><PricingCalc /></Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{ padding: "100px var(--px)", background: "var(--bg-light)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 80, alignItems: "start" }}>
            <Reveal>
              <div className="section-tag" style={{ color: "var(--muted)" }}>FAQ</div>
              <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 20 }}>Common <em style={{ fontStyle: "italic" }}>questions</em></h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)", fontWeight: 300 }}>Can't find your answer? Get in touch — we respond within 24 hours.</p>
            </Reveal>
            <Reveal delay={0.08}><FaqAccordion /></Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" style={{ background: "var(--bg)", color: "var(--fg-light)", padding: "100px var(--px)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <Reveal>
              <div className="section-tag" style={{ color: "var(--accent)" }}>Get in touch</div>
              <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 28, color: "var(--fg-light)" }}>Tell us what you <em style={{ fontStyle: "italic" }}>need.</em></h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.4)", fontWeight: 300, maxWidth: 440, marginBottom: 48 }}>Describe your project or requirement and we'll come back with a clear scope and quote within 24 hours. No obligation.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[{ label: "Email", value: "hello@orvello.co.uk", href: "mailto:hello@orvello.co.uk" }, { label: "Location", value: "Northampton, UK" }, { label: "Coverage", value: "Northamptonshire & surrounding areas" }].map(item => (
                  <div key={item.label}>
                    <div className="mono-label" style={{ color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>{item.label}</div>
                    {item.href ? <a href={item.href} style={{ color: "var(--accent)", textDecoration: "none", fontSize: 15, fontWeight: 300 }}>{item.value}</a> : <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{item.value}</div>}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: 36, borderRadius: 4 }}>
                {(() => {
                  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
                  const [submitted, setSubmitted] = useState(false);
                  const [sending, setSending] = useState(false);
                  const handleSubmit = async () => { setSending(true); try { const res = await fetch("https://formspree.io/f/mvzwlvww", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (res.ok) setSubmitted(true); } catch (err) { console.error(err); } setSending(false); };
                  if (submitted) return (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ width: 44, height: 44, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 18, color: "var(--bg)", borderRadius: 2 }}>✓</div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, marginBottom: 8 }}>Enquiry sent</h3>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Thanks {form.name.split(" ")[0]}. We'll respond within one working day.</p>
                    </div>
                  );
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div><label className="mono-label" style={{ display: "block", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Name</label><input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                      <div><label className="mono-label" style={{ display: "block", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Email</label><input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                      <div><label className="mono-label" style={{ display: "block", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Service</label><select className="form-input" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={{ appearance: "none" }}><option value="" style={{ background: "var(--bg)" }}>Select a service</option>{["Domestic EPC", "PAS2035 Retrofit Assessment", "CDM Principal Designer", "Fire Risk Assessment", "Multiple services", "Not sure yet"].map(o => <option key={o} value={o} style={{ background: "var(--bg)" }}>{o}</option>)}</select></div>
                      <div><label className="mono-label" style={{ display: "block", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Message</label><textarea className="form-input" rows={4} placeholder="Tell us about your project..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical" }} /></div>
                      <button className="btn-accent" onClick={handleSubmit} disabled={sending || !form.name || !form.email} style={{ width: "100%", marginTop: 4, justifyContent: "center", opacity: (sending || !form.name || !form.email) ? 0.5 : 1, cursor: (sending || !form.name || !form.email) ? "not-allowed" : "pointer" }}>{sending ? "Sending..." : "Request a quote"}</button>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "var(--font-mono)" }}>We typically respond within 24 hours · No obligation</p>
                    </div>
                  );
                })()}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--bg)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "44px var(--px) 28px", color: "var(--fg-light)" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}><span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400 }}>Orvello</span><span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", marginLeft: 2, borderRadius: 1 }} /></div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, maxWidth: 320, fontWeight: 300 }}>Construction consultancy specialising in CDM, fire safety, energy performance, and retrofit across Northamptonshire and surrounding areas.</p>
            </div>
            <div>
              <div className="mono-label" style={{ color: "rgba(255,255,255,0.2)", marginBottom: 16, fontSize: 10 }}>Services</div>
              {SERVICES.map(s => <div key={s.id} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, cursor: "pointer", transition: "color 0.2s", fontWeight: 300 }} onClick={() => scrollTo("services")} onMouseEnter={e => e.target.style.color = "var(--fg-light)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>{s.title}</div>)}
            </div>
            <div>
              <div className="mono-label" style={{ color: "rgba(255,255,255,0.2)", marginBottom: 16, fontSize: 10 }}>Contact</div>
              <a href="mailto:hello@orvello.co.uk" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, display: "block", textDecoration: "none", transition: "color 0.2s", fontWeight: 300 }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>hello@orvello.co.uk</a>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>Northampton, UK</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div className="mono-label" style={{ color: "rgba(255,255,255,0.18)", fontSize: 10 }}>© 2026 Orvello. All rights reserved.</div>
            <div className="mono-label" style={{ color: "rgba(255,255,255,0.18)", fontSize: 10 }}>CDM · Fire Safety · EPC · Retrofit</div>
            <Link to="/terms" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
