import { useState, useEffect, useRef } from “react”;
import { ArrowLeft, Menu, X, ChevronDown } from “lucide-react”;
import { Link } from “react-router-dom”;

const SERVICES = [
{ id: “epc”, title: “Domestic EPCs” },
{ id: “retrofit”, title: “PAS2035 Retrofit” },
{ id: “cdm”, title: “CDM Principal Designer” },
{ id: “fire”, title: “Fire Risk Assessments” },
];

const TERMS_SECTIONS = [
{
num: “01”,
title: “Introduction”,
content: `These Terms of Service ("Terms") govern the provision of services by Orvello ("we", "us", or "our"), a construction consultancy operating in England and Wales. Orvello is a trading name of a sole trader operating within the United Kingdom.\n\nBy instructing or engaging our services, you ("the Client") agree to be bound by these Terms.`,
},
{
num: “02”,
title: “Scope of Services”,
content: `We provide construction consultancy services including, but not limited to:\n\n• Domestic Energy Performance Certificates (EPCs)\n• PAS 2035 Retrofit Assessments\n• CDM Principal Designer services\n• Fire Risk Assessments`,
},
{
num: “03”,
title: “Formation of Contract”,
content: `A contract is formed when a booking is confirmed in writing, an instruction is accepted, or work commences.`,
},
{
num: “04”,
title: “Client Obligations”,
content: `The Client shall provide all necessary information, safe site access, and relevant documentation in a timely manner.\n\nWe are not liable for errors, omissions, or delays arising from inaccurate, incomplete, or misleading information provided by the Client or third parties.`,
},
{
num: “05”,
title: “Pricing & Payment”,
content: `5.1 General: All fees are confirmed prior to work. We reserve the right to request full or partial payment in advance at our discretion.\n\n5.2 Domestic EPCs: Fees below £110 require payment before certificate release. Fees above £110 may require a 50% deposit, with the balance due before release.\n\n5.3 Other Services: 50% upfront / 50% on completion or reached milestones.\n\n5.4 Commercial / Council / Developer Clients: Standard terms are 14 days from invoice.\n\n5.5 Withholding Deliverables: We reserve the right to withhold reports and will not upload EPCs to the Government Register until payment is received in full.\n\n5.6 Changes in Scope: If additional complexity arises, we will notify you and agree on costs before proceeding.`,
},
{
num: “06”,
title: “Travel & Geographic Scope”,
content: `Domestic EPC services are provided within Northamptonshire with travel included. Other services cover Northamptonshire, Bedfordshire, Buckinghamshire, and Milton Keynes.\n\nTravel outside these areas may incur additional charges, agreed in advance. Mileage for commercial clients is charged at HMRC rates or as part of a fixed fee.`,
},
{
num: “07”,
title: “Cancellations & Access”,
content: `We require 24 hours' notice for cancellations. Late cancellations or "No Access" events (including instances where a key-holder is unavailable at the agreed time) will incur a fee of up to 50% of the total quote.`,
},
{
num: “08”,
title: “Delivery of Services”,
content: `Indicative timeframes are 24–48 hours for EPCs and 5–10 working days for other reports. These are estimates and not guaranteed deadlines.`,
},
{
num: “09”,
title: “Intellectual Property”,
content: `All intellectual property rights in reports, data, or deliverables remain the property of Orvello until payment is received in full.\n\nUpon full payment, the Client is granted a non-exclusive licence to use the deliverables for the purpose for which they were commissioned.`,
},
{
num: “10”,
title: “Liability”,
content: `10.1 Liability Cap: Our total liability for any claim shall not exceed the lower of £1,000,000 or the limit of our Professional Indemnity insurance. This limit does not apply to death or personal injury caused by our negligence.\n\n10.2 Exclusions: We are not liable for indirect or consequential losses. Outputs are a "snapshot in time" and do not guarantee future statutory compliance.`,
},
{
num: “11”,
title: “Insurance”,
content: `We maintain Professional Indemnity insurance (minimum £1,000,000) and Public Liability insurance (minimum £2,000,000).`,
},
{
num: “12”,
title: “Data Protection & Confidentiality”,
content: `We comply with UK GDPR and the Data Protection Act 2018. Client information is treated as confidential.\n\nWe may use anonymised data for marketing, benchmarking, or industry analysis. Our full Privacy Notice is available upon request.`,
},
{
num: “13”,
title: “Statutory Compliance”,
content: `We comply with the Health and Safety at Work etc. Act 1974, Equality Act 2010, and Bribery Act 2010.`,
},
{
num: “14”,
title: “Termination & Disputes”,
content: `Either party may terminate with reasonable notice. Disputes should be resolved amicably before legal action.\n\nInterest on late payments may be charged under the Late Payment of Commercial Debts (Interest) Act 1998.`,
},
{
num: “15”,
title: “Service-Specific Provisions”,
content: `• EPCs: Energy Performance of Buildings (England and Wales) Regulations 2012.\n• PAS 2035: PAS 2035:2023 standards.\n• CDM: Construction (Design and Management) Regulations 2015.\n• Fire Risk: Regulatory Reform (Fire Safety) Order 2005.`,
},
{
num: “16”,
title: “Consumer Rights”,
content: `Under the Consumer Contracts Regulations 2013, consumers may have a 14-day cancellation right.\n\nBy booking a service to be delivered within 14 days, the Client explicitly requests the service to begin during the cancellation period and acknowledges that their right to cancel is lost once the service is fully performed.`,
},
{
num: “17”,
title: “Force Majeure & Third Parties”,
content: `We are not liable for events outside our control. Reports are for the Client's use only; no third-party reliance is permitted without written consent.`,
},
];

function useInView(threshold = 0.1) {
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

function Reveal({ children, delay = 0, className = “”, style = {} }) {
const [ref, vis] = useInView();
return (
<div ref={ref} className={className} style={{ …style, opacity: vis ? 1 : 0, transform: vis ? “translateY(0)” : “translateY(22px)”, transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
{children}
</div>
);
}

function HeaderGrain() {
const grainRef = useRef(null);
useEffect(() => {
const c = grainRef.current;
if (!c) return;
c.width = 512; c.height = 512;
const ctx = c.getContext(“2d”);
const img = ctx.createImageData(512, 512);
for (let i = 0; i < img.data.length; i += 4) {
const v = Math.random() * 255;
img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 16;
}
ctx.putImageData(img, 0, 0);
}, []);
return <canvas ref={grainRef} style={{ position: “absolute”, inset: 0, width: “100%”, height: “100%”, pointerEvents: “none”, opacity: 0.5, mixBlendMode: “overlay”, borderRadius: “inherit”, zIndex: 1 }} />;
}

/* ─── Sidebar TOC — desktop: sticky, mobile: collapsible ─── */
function TOCSidebar({ activeSection }) {
const [mobileOpen, setMobileOpen] = useState(false);

return (
<nav className="toc-sidebar">
{/* Desktop: always visible sticky */}
<div className=“toc-desktop” style={{ position: “sticky”, top: 100 }}>
<div className=“mono-label” style={{ color: “var(–muted)”, marginBottom: 20, fontSize: 10 }}>Contents</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: 2 }}>
{TERMS_SECTIONS.map((s) => {
const isActive = activeSection === s.num;
return (
<a
key={s.num}
href={`#section-${s.num}`}
style={{
display: “flex”, alignItems: “center”, gap: 10,
padding: “8px 12px”,
fontSize: 12, fontWeight: isActive ? 400 : 300,
color: isActive ? “var(–fg)” : “var(–muted)”,
textDecoration: “none”,
borderLeft: isActive ? “2px solid var(–accent)” : “2px solid transparent”,
background: isActive ? “rgba(228,208,72,0.04)” : “transparent”,
transition: “all 0.25s”,
fontFamily: “var(–font-body)”,
lineHeight: 1.4,
}}
>
<span style={{ fontFamily: “var(–font-mono)”, fontSize: 10, color: isActive ? “var(–accent)” : “var(–muted)”, minWidth: 18, opacity: isActive ? 1 : 0.5 }}>{s.num}</span>
{s.title}
</a>
);
})}
</div>
</div>

```
  {/* Mobile: collapsible dropdown */}
  <div className="toc-mobile">
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: "white", border: "1px solid var(--border-light)",
        borderRadius: mobileOpen ? "10px 10px 0 0" : 10, cursor: "pointer", fontFamily: "var(--font-body)",
        fontSize: 13, fontWeight: 400, color: "var(--fg)", transition: "border-radius 0.2s",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="mono-label" style={{ color: "var(--accent)", fontSize: 10 }}>{activeSection}</span>
        {TERMS_SECTIONS.find(s => s.num === activeSection)?.title || "Contents"}
      </span>
      <ChevronDown size={16} style={{ color: "var(--muted)", transition: "transform 0.3s", transform: mobileOpen ? "rotate(180deg)" : "rotate(0)" }} />
    </button>
    <div style={{
      maxHeight: mobileOpen ? 400 : 0, overflow: "hidden",
      transition: "max-height 0.4s cubic-bezier(.22,1,.36,1)",
      background: "white",
      border: mobileOpen ? "1px solid var(--border-light)" : "none",
      borderTop: mobileOpen ? "1px solid var(--border-light)" : "none",
      borderRadius: "0 0 10px 10px",
    }}>
      <div style={{ padding: "4px 0", maxHeight: 380, overflowY: "auto" }}>
        {TERMS_SECTIONS.map((s) => {
          const isActive = activeSection === s.num;
          return (
            <a
              key={s.num}
              href={`#section-${s.num}`}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 16px",
                fontSize: 13, fontWeight: isActive ? 400 : 300,
                color: isActive ? "var(--fg)" : "var(--muted)",
                textDecoration: "none",
                background: isActive ? "rgba(228,208,72,0.04)" : "transparent",
                transition: "all 0.2s",
                lineHeight: 1.3,
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: isActive ? "var(--accent)" : "var(--muted)", minWidth: 20, opacity: isActive ? 1 : 0.5 }}>{s.num}</span>
              {s.title}
            </a>
          );
        })}
      </div>
    </div>
  </div>
</nav>
```

);
}

/* ═══════════════ MAIN ═══════════════ */
export default function OrvelloTerms() {
const [menuOpen, setMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);
const [activeSection, setActiveSection] = useState(“01”);

useEffect(() => {
const fn = () => setScrolled(window.scrollY > 40);
window.addEventListener(“scroll”, fn);
return () => window.removeEventListener(“scroll”, fn);
}, []);

useEffect(() => {
const observers = [];
TERMS_SECTIONS.forEach((s) => {
const el = document.getElementById(`section-${s.num}`);
if (!el) return;
const obs = new IntersectionObserver(
([entry]) => { if (entry.isIntersecting) setActiveSection(s.num); },
{ rootMargin: “-20% 0px -60% 0px” }
);
obs.observe(el);
observers.push(obs);
});
return () => observers.forEach(o => o.disconnect());
}, []);

return (
<div className="orvello-root">
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap’);
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
:root{
–bg:#272420;–bg-light:#F7F6F3;–bg-off:#EDECE8;
–fg:#1A1A18;–fg-light:#F0EEE8;
–muted:#8A8A80;–muted-light:#B0B0A8;
–accent:#E4D048;–accent-dim:rgba(228,208,72,0.10);
–border-light:#DDDBD5;–border-dark:rgba(255,255,255,0.10);
–font-display:‘Bricolage Grotesque’,sans-serif;
–font-body:‘Bricolage Grotesque’,sans-serif;
–font-mono:‘IBM Plex Mono’,monospace;
–max-w:1240px;–px:clamp(20px,5vw,72px);
–hero-top-bg:#E8E6E0;
}
.orvello-root{font-family:var(–font-body);background:var(–bg-light);color:var(–fg);min-height:100vh;overflow-x:hidden}
.nav-link{font-family:var(–font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#262420;text-decoration:none;cursor:pointer;transition:color 0.2s;background:none;border:none;font-weight:400;padding:0;opacity:0.45}
.nav-link:hover{opacity:0.85}
.nav-scrolled .nav-link{color:rgba(255,255,255,1);opacity:0.4}
.nav-scrolled .nav-link:hover{opacity:0.8}
.btn-accent{display:inline-flex;align-items:center;gap:10px;background:var(–accent);color:var(–bg);border:none;padding:14px 28px;font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);font-family:var(–font-mono);border-radius:2px}
.btn-accent:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 8px 24px rgba(228,208,72,0.18)}
.mono-label{font-family:var(–font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
.header-card{
position:relative;overflow:hidden;
border-radius:20px;
background:var(–bg);
box-shadow:0 4px 60px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08);
}
.terms-layout{display:grid;grid-template-columns:220px 1fr;gap:60px;align-items:start}
.terms-section{scroll-margin-top:100px}

```
    /* Desktop: show sticky sidebar, hide mobile dropdown */
    .toc-desktop{display:block}
    .toc-mobile{display:none}

    @media(max-width:900px){
      .desktop-nav{display:none!important}.hamburger{display:flex!important}
      .terms-layout{grid-template-columns:1fr!important;gap:0!important}
      .header-card{border-radius:14px}
      .footer-grid{grid-template-columns:1fr!important;gap:32px!important}

      /* Mobile: hide sticky sidebar, show dropdown */
      .toc-desktop{display:none!important}
      .toc-mobile{display:block!important;margin-bottom:24px}
      .toc-sidebar{position:sticky;top:60px;z-index:50;background:var(--bg-light);padding:12px 0}
    }
  `}</style>

  {/* NAV */}
  <nav className={scrolled ? "nav-scrolled" : ""} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(43,43,35,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px) saturate(1.3)" : "none", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.05)" : "transparent"}`, transition: "all 0.4s", padding: "0 var(--px)" }}>
    <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
      <Link to="/" style={{ cursor: "pointer", display: "flex", alignItems: "baseline", textDecoration: "none" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: scrolled ? "var(--fg-light)" : "#262420", letterSpacing: "-0.02em", transition: "color 0.4s" }}>Orvello</span>
        <span style={{ width: 4, height: 4, background: "var(--accent)", display: "inline-block", marginLeft: 2, marginBottom: 2, borderRadius: 1 }} />
      </Link>
      <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link to="/" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={12} /> Home</Link>
        <a href="https://tally.so/r/Gx0jJj" target="_blank" rel="noopener noreferrer" className="btn-accent" style={{ padding: "7px 16px", fontSize: 10, textDecoration: "none" }}>Book EPC</a>
      </div>
      <button className="hamburger" style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4 }} onClick={() => setMenuOpen(true)}><Menu size={20} color={scrolled ? "var(--fg-light)" : "#262420"} /></button>
    </div>
  </nav>

  {menuOpen && (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", cursor: "pointer" }}><X size={24} color="var(--fg-light)" /></button>
      <Link to="/" className="nav-link" style={{ fontSize: 16, color: "var(--fg-light)", opacity: 1, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}><ArrowLeft size={16} /> Home</Link>
    </div>
  )}

  {/* ═══ HEADER ═══ */}
  <section style={{ background: "var(--hero-top-bg)", padding: "0 clamp(12px, 2.5vw, 32px)", paddingBottom: "clamp(40px, 5vw, 64px)" }}>
    <div style={{ height: 68 }} />
    <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <Reveal delay={0.04}>
        <div className="header-card" style={{ padding: "clamp(48px, 7vw, 88px) clamp(36px, 6vw, 88px)", position: "relative" }}>
          <HeaderGrain />
          <div style={{ position: "absolute", top: "20%", right: "15%", width: "40%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(228,208,72,0.06) 0%, transparent 60%)", filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <Reveal delay={0.08}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>Legal</span>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <h1 style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.12,
                color: "var(--fg-light)", marginBottom: 20,
              }}>
                Terms of <em style={{ fontStyle: "italic", fontWeight: 300 }}>Service</em>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>Last updated: 21 March 2026</span>
                <span style={{ width: 4, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "inline-block" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>{TERMS_SECTIONS.length} sections</span>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </div>
  </section>

  {/* ═══ TERMS BODY ═══ */}
  <section style={{ padding: "clamp(48px, 6vw, 80px) var(--px)", background: "var(--bg-light)" }}>
    <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="terms-layout">
        {/* Sidebar TOC — sticky on desktop, collapsible dropdown on mobile */}
        <TOCSidebar activeSection={activeSection} />

        {/* Content */}
        <div>
          {TERMS_SECTIONS.map((s, i) => (
            <Reveal key={s.num} delay={Math.min(i * 0.03, 0.2)}>
              <div
                id={`section-${s.num}`}
                className="terms-section"
                style={{
                  paddingBottom: 48,
                  marginBottom: 48,
                  borderBottom: i < TERMS_SECTIONS.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.05em", fontWeight: 400, opacity: 0.7 }}>{s.num}</span>
                  <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: "clamp(20px, 2.5vw, 28px)",
                    fontWeight: 400, letterSpacing: "-0.02em", color: "var(--fg)",
                  }}>{s.title}</h2>
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.85, color: "var(--muted)", fontWeight: 300, maxWidth: 680 }}>
                  {s.content.split("\n\n").map((para, j) => (
                    <p key={j} style={{ marginBottom: 16 }}>
                      {para.startsWith("•") ? (
                        <span style={{ display: "block", paddingLeft: 20 }}>
                          {para.split("\n").map((line, k) => (
                            <span key={k} style={{ display: "block", marginBottom: 8 }}>
                              {line.startsWith("•") ? (
                                <span style={{ display: "flex", gap: 10 }}>
                                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>·</span>
                                  <span>{line.replace(/^•\s*/, "")}</span>
                                </span>
                              ) : line}
                            </span>
                          ))}
                        </span>
                      ) : para}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}

          {/* Contact box */}
          <Reveal>
            <div style={{
              background: "white", border: "1px solid var(--border-light)",
              borderRadius: 8, padding: "clamp(28px, 4vw, 40px)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 24, flexWrap: "wrap",
            }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 6 }}>Questions about these terms?</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 300 }}>Get in touch and we'll respond within one working day.</p>
              </div>
              <a href="mailto:hello@orvello.co.uk" className="btn-accent" style={{ textDecoration: "none", flexShrink: 0 }}>
                hello@orvello.co.uk
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer style={{ background: "var(--bg)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "44px var(--px) 28px", color: "var(--fg-light)" }}>
    <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 44 }} className="footer-grid">
        <div>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400 }}>Orvello</span>
            <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", marginLeft: 2, borderRadius: 1 }} />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, maxWidth: 320, fontWeight: 300 }}>Construction consultancy specialising in CDM, fire safety, energy performance, and retrofit across Northamptonshire and surrounding areas.</p>
        </div>
        <div>
          <div className="mono-label" style={{ color: "rgba(255,255,255,0.2)", marginBottom: 16, fontSize: 10 }}>Services</div>
          {SERVICES.map(s => <div key={s.id} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 300 }}>{s.title}</div>)}
        </div>
        <div>
          <div className="mono-label" style={{ color: "rgba(255,255,255,0.2)", marginBottom: 16, fontSize: 10 }}>Contact</div>
          <a href="mailto:hello@orvello.co.uk" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, display: "block", textDecoration: "none", transition: "color 0.2s", fontWeight: 300 }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>hello@orvello.co.uk</a>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>Northampton, UK</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="mono-label" style={{ color: "rgba(255,255,255,0.18)", fontSize: 10 }}>© 2026 Orvello. All rights reserved.</div>
        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/terms" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>Terms</Link>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
          <Link to="/privacy" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>Privacy</Link>
        </div>
      </div>
    </div>
  </footer>
</div>
```

);
}
