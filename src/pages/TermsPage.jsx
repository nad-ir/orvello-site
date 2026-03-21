import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const SERVICES = [
  { id: "epc", title: "Domestic EPCs" },
  { id: "retrofit", title: "PAS2035 Retrofit" },
  { id: "cdm", title: "CDM Principal Designer" },
  { id: "fire", title: "Fire Risk Assessments" },
];

const TERMS_SECTIONS = [
  {
    num: "01",
    title: "Introduction",
    content: `These Terms of Service ("Terms") govern your use of the services provided by Orvello Ltd ("Orvello", "we", "us", or "our"), a construction consultancy registered in England and Wales, operating from Northampton.\n\nBy engaging our services — including but not limited to Domestic Energy Performance Certificates (EPCs), PAS2035 Retrofit Assessments, CDM Principal Designer appointments, and Fire Risk Assessments — you agree to be bound by these Terms.\n\nIf you do not agree with any part of these Terms, please do not proceed with a booking or enquiry.`,
  },
  {
    num: "02",
    title: "Services",
    content: `Orvello provides construction consultancy services across Northamptonshire and surrounding areas. Our current service offering includes:\n\n• Domestic Energy Performance Certificates (EPCs) — assessments conducted in accordance with the Energy Performance of Buildings Regulations.\n• PAS2035 Retrofit Assessments — dwelling assessments and medium-term improvement plans under the PAS2035:2023 framework.\n• CDM Principal Designer — planning, managing, and coordinating health and safety during the pre-construction phase under CDM 2015.\n• Fire Risk Assessments — assessments conducted under the Regulatory Reform (Fire Safety) Order 2005.\n\nServices marked as "Available soon" on our website are not yet accepting bookings. We reserve the right to modify, expand, or discontinue any service at any time.`,
  },
  {
    num: "03",
    title: "Bookings & Scheduling",
    content: `Bookings are made through our website booking forms or by direct arrangement via email. A booking is confirmed only when we issue written confirmation (including email).\n\nWe aim to accommodate your preferred dates and times but cannot guarantee specific appointment slots. We will make reasonable efforts to notify you of any scheduling changes as early as possible.\n\nIf you need to reschedule, please give us at least 24 hours' notice. Failure to provide adequate notice may result in a rebooking fee.`,
  },
  {
    num: "04",
    title: "Pricing & Payment",
    content: `Prices displayed on our website are inclusive of the assessment visit, report preparation, and — where applicable — certificate lodgement.\n\nPrices are subject to change without notice, but any price confirmed in a booking confirmation will be honoured for that booking.\n\nPayment is due upon completion of the assessment unless otherwise agreed in writing. We accept bank transfer and other payment methods as communicated at the time of booking.\n\nFor bulk or portfolio work, bespoke pricing will be agreed in writing before work commences.`,
  },
  {
    num: "05",
    title: "Cancellations & Refunds",
    content: `You may cancel a confirmed booking free of charge provided you give at least 24 hours' notice before the scheduled appointment.\n\nCancellations made with less than 24 hours' notice, or where we are unable to gain access to the property at the agreed time, may be subject to a cancellation fee of up to 50% of the agreed price.\n\nIf we need to cancel an appointment, we will offer an alternative date at no additional cost. If no suitable alternative can be arranged, you will receive a full refund of any amount already paid.\n\nRefunds will be processed within 14 working days.`,
  },
  {
    num: "06",
    title: "Access & Client Responsibilities",
    content: `For property-based assessments, you are responsible for ensuring that the assessor has safe and reasonable access to all areas of the property at the agreed time.\n\nIf access is restricted or denied on the day of the visit, we may not be able to complete the assessment, and a revisit fee may apply.\n\nYou confirm that you have the authority to instruct an assessment on the property, or that you are acting on behalf of the property owner with their consent.`,
  },
  {
    num: "07",
    title: "Reports & Deliverables",
    content: `Assessment reports and certificates will be delivered electronically (typically via email or digital portal) within the timeframe communicated at the time of booking — usually 24–48 hours for EPCs and 5–10 working days for more detailed reports.\n\nEPCs are lodged on the national register in accordance with regulatory requirements. You will receive your certificate reference number upon lodgement.\n\nReports are prepared with reasonable skill and care based on the conditions observed at the time of the assessment. They reflect a point-in-time observation and should not be relied upon as a guarantee of ongoing compliance.`,
  },
  {
    num: "08",
    title: "Limitation of Liability",
    content: `Our liability in connection with any service is limited to the fee paid for that service.\n\nWe shall not be liable for any indirect, consequential, or special losses arising from or in connection with our services, including but not limited to loss of profit, loss of business, or loss of opportunity.\n\nNothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by law.`,
  },
  {
    num: "09",
    title: "Insurance",
    content: `Orvello holds Professional Indemnity insurance and Public Liability insurance appropriate to the services we provide. Details of our insurance arrangements are available on request.`,
  },
  {
    num: "10",
    title: "Intellectual Property",
    content: `All reports, documents, and materials produced by Orvello remain our intellectual property until full payment has been received.\n\nUpon full payment, you are granted a non-exclusive licence to use the deliverables for their intended purpose. You may not reproduce, distribute, or resell our reports or materials without our prior written consent.`,
  },
  {
    num: "11",
    title: "Data Protection & Privacy",
    content: `We collect and process personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.\n\nPersonal data collected during the booking and assessment process — such as your name, email address, property address, and contact details — is used solely for the purpose of delivering our services and communicating with you.\n\nWe do not sell or share your personal data with third parties except where required by law or where necessary to deliver our services (e.g. lodging an EPC on the national register).\n\nYou have the right to access, correct, or request deletion of your personal data at any time by contacting us at hello@orvello.co.uk.`,
  },
  {
    num: "12",
    title: "Complaints",
    content: `If you are dissatisfied with any aspect of our service, please contact us at hello@orvello.co.uk and we will aim to resolve the matter within 14 working days.\n\nIf we are unable to resolve your complaint to your satisfaction, you may refer the matter to the relevant professional body or ombudsman service.`,
  },
  {
    num: "13",
    title: "Governing Law",
    content: `These Terms are governed by and construed in accordance with the laws of England and Wales.\n\nAny disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    num: "14",
    title: "Changes to These Terms",
    content: `We may update these Terms from time to time. The latest version will always be available on our website. Continued use of our services after any changes constitutes acceptance of the revised Terms.\n\nThese Terms were last updated on 21 March 2026.`,
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

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={className} style={{ ...style, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── Header card background — subtle static grain, no canvas animation needed ─── */
function HeaderGrain() {
  const grainRef = useRef(null);
  useEffect(() => {
    const c = grainRef.current;
    if (!c) return;
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 16;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={grainRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5, mixBlendMode: "overlay", borderRadius: "inherit", zIndex: 1 }} />;
}

/* ─── Table of contents sidebar ─── */
function TOCSidebar({ activeSection }) {
  return (
    <nav className="toc-sidebar" style={{ position: "sticky", top: 100 }}>
      <div className="mono-label" style={{ color: "var(--muted)", marginBottom: 20, fontSize: 10 }}>Contents</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {TERMS_SECTIONS.map((s) => {
          const isActive = activeSection === s.num;
          return (
            <a
              key={s.num}
              href={`#section-${s.num}`}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px",
                fontSize: 12, fontWeight: isActive ? 400 : 300,
                color: isActive ? "var(--fg)" : "var(--muted)",
                textDecoration: "none",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                background: isActive ? "rgba(228,208,72,0.04)" : "transparent",
                transition: "all 0.25s",
                fontFamily: "var(--font-body)",
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: isActive ? "var(--accent)" : "var(--muted)", minWidth: 18, opacity: isActive ? 1 : 0.5 }}>{s.num}</span>
              {s.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/* ═══════════════ MAIN ═══════════════ */
export default function OrvelloTerms() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("01");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Track which section is in view */
  useEffect(() => {
    const observers = [];
    TERMS_SECTIONS.forEach((s) => {
      const el = document.getElementById(`section-${s.num}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(s.num); },
        { rootMargin: "-20% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
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
        .mono-label{font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
        .header-card{
          position:relative;overflow:hidden;
          border-radius:20px;
          background:var(--bg);
          box-shadow:0 4px 60px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08);
        }
        .toc-sidebar{display:block}
        .terms-layout{display:grid;grid-template-columns:220px 1fr;gap:60px;align-items:start}
        .terms-section{scroll-margin-top:100px}

        @media(max-width:900px){
          .desktop-nav{display:none!important}.hamburger{display:flex!important}
          .toc-sidebar{display:none!important}
          .terms-layout{grid-template-columns:1fr!important;gap:0!important}
          .header-card{border-radius:14px}
          .toc-grid{grid-template-columns:1fr!important}
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

      {/* ═══ HEADER — same light bg + rounded dark card pattern ═══ */}
      <section style={{ background: "var(--hero-top-bg)", padding: "0 clamp(12px, 2.5vw, 32px)", paddingBottom: "clamp(40px, 5vw, 64px)" }}>
        <div style={{ height: 68 }} />
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <Reveal delay={0.04}>
            <div className="header-card" style={{ padding: "clamp(48px, 7vw, 88px) clamp(36px, 6vw, 88px)", position: "relative" }}>
              <HeaderGrain />
              {/* Subtle accent glow */}
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
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>14 sections</span>
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
            {/* Sticky sidebar TOC */}
            <TOCSidebar activeSection={activeSection} />

            {/* Content */}
            <div>
              {/* Inline contents */}
              <Reveal>
                <div style={{
                  background: "white", border: "1px solid var(--border-light)",
                  borderRadius: 8, padding: "clamp(24px, 3vw, 36px)",
                  marginBottom: 56,
                }}>
                  <div className="mono-label" style={{ color: "var(--muted)", marginBottom: 20, fontSize: 10 }}>Contents</div>
                  <div className="toc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 32px" }}>
                    {TERMS_SECTIONS.map((s) => (
                      <a
                        key={s.num}
                        href={`#section-${s.num}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 0",
                          fontSize: 13, fontWeight: 300,
                          color: "var(--muted)",
                          textDecoration: "none",
                          transition: "color 0.2s",
                          borderBottom: "1px solid var(--border-light)",
                          lineHeight: 1.3,
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--fg)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                      >
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", minWidth: 20, opacity: 0.6 }}>{s.num}</span>
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>

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

      <style>{`
        @media(max-width:900px){
          .footer-grid{grid-template-columns:1fr!important;gap:32px!important}
        }
      `}</style>
    </div>
  );
}
