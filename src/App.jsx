import { useState, useEffect, useRef } from "react";
import { PenTool, Building2, Home, Landmark, KeyRound, Briefcase, Calendar, ArrowRight, Clock, Shield, Award, FileCheck, Zap } from "lucide-react";

const SERVICES = [
  {
    id: "epc",
    title: "Domestic EPCs",
    subtitle: "Energy Performance Certificates",
    bookable: true,
    description:
      "Fast, reliable Energy Performance Certificates for landlords, homeowners, and estate agents across Northamptonshire. Competitively priced with flexible booking and quick turnaround.",
    items: [
      "Residential EPC assessments",
      "Landlord & letting agent packages",
      "Estate agent partnerships",
      "Bulk & portfolio pricing",
      "Same-week availability",
      "Digital certificate delivery",
    ],
  },
  {
    id: "retrofit",
    title: "PAS2035 Retrofit Assessments",
    subtitle: "Whole-house retrofit under PAS2035:2023",
    bookable: true,
    description:
      "Retrofit assessments supporting government-funded energy efficiency schemes. We assess dwellings under the PAS2035 framework, producing detailed reports that inform the retrofit pathway for each property.",
    items: [
      "Retrofit assessments",
      "Dwelling condition surveys",
      "Medium-term improvement plans",
      "ECO & GBIS scheme support",
      "Batch assessment pricing",
      "Social housing portfolios",
    ],
  },
  {
    id: "cdm",
    title: "CDM Principal Designer",
    subtitle: "Construction (Design & Management) Regulations 2015",
    comingSoon: true,
    description:
      "We take on the Principal Designer role for your construction projects, managing pre-construction health and safety information, coordinating design teams, and ensuring CDM compliance from concept to completion.",
    items: [
      "Principal Designer appointments",
      "Client advisory services",
      "Pre-construction information packs",
      "Health & Safety file compilation",
      "Design risk management",
      "Site inspections & audits",
    ],
  },
  {
    id: "fire",
    title: "Fire Risk Assessments",
    subtitle: "Regulatory Reform (Fire Safety) Order 2005",
    comingSoon: true,
    description:
      "Comprehensive fire risk assessments for commercial properties, HMOs, and residential blocks. We identify hazards, evaluate risk, and provide actionable recommendations to keep your building compliant and your occupants safe.",
    items: [
      "Type 1, 2 & 3 assessments",
      "HMO & residential block assessments",
      "Commercial premises",
      "Fire door inspections",
      "Review & reassessment",
      "Fire safety training",
    ],
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, isVisible];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, isVisible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function GrainOverlay() {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const w = 512;
    const h = 512;
    canvas.width = w;
    canvas.height = h;
    const imageData = ctx.createImageData(w, h);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 22;
    }
    ctx.putImageData(imageData, 0, 0);
    container.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
    container.style.backgroundRepeat = "repeat";
    container.style.backgroundSize = "200px 200px";
  }, []);
  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 999,
        opacity: 0.9,
        mixBlendMode: "overlay",
      }}
    />
  );
}

function HeroGrain() {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const w = 256;
    const h = 256;
    canvas.width = w;
    canvas.height = h;
    const imageData = ctx.createImageData(w, h);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 22;
    }
    ctx.putImageData(imageData, 0, 0);
    container.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
    container.style.backgroundRepeat = "repeat";
    container.style.backgroundSize = "128px 128px";
  }, []);
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.6,
        mixBlendMode: "multiply",
      }}
    />
  );
}

export default function OrvelloSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F6F5F0", color: "#1A1A18", minHeight: "100vh", overflowX: "hidden" }}>
      <GrainOverlay />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        :root {
          --ink: #1A1A18;
          --chalk: #F6F5F0;
          --sage: #4A5D4F;
          --sage-deep: #3A4B3E;
          --sage-light: #E4EAE5;
          --sage-mid: #7A9580;
          --warm: #C4A882;
          --warm-light: #F0E8DC;
          --border: #DDDBD5;
          --text-secondary: #6B6B66;
          --cream: #EDEBD6;
        }

        .nav-link {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.25s;
          font-weight: 500;
          background: none;
          border: none;
          font-family: inherit;
        }
        .nav-link:hover { color: var(--sage); }

        .btn-primary {
          background: var(--sage);
          color: var(--chalk);
          border: none;
          padding: 16px 36px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(.16,1,.3,1);
          font-family: inherit;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover { background: var(--sage-deep); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,93,79,0.2); }

        .btn-outline {
          background: transparent;
          color: var(--sage);
          border: 1.5px solid var(--sage);
          padding: 16px 36px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(.16,1,.3,1);
          font-family: inherit;
          text-transform: uppercase;
        }
        .btn-outline:hover { background: var(--sage); color: var(--chalk); transform: translateY(-2px); }

        .service-tab {
          padding: 18px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 15px;
          color: var(--text-secondary);
          transition: all 0.3s;
          border-left: 2px solid var(--border);
          width: 100%;
          font-weight: 400;
        }
        .service-tab:hover { color: var(--ink); border-left-color: var(--sage-mid); }
        .service-tab.active {
          color: var(--ink);
          font-weight: 600;
          border-left-color: var(--sage);
          background: var(--sage-light);
        }

        .credential-card {
          padding: 32px;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          transition: all 0.35s cubic-bezier(.16,1,.3,1);
        }
        .credential-card:hover { border-color: var(--sage-mid); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.06); }

        .credential-card-v2:hover {
          border-color: var(--sage-mid) !important;
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }
        .credential-card-v2:hover > div:first-child {
          height: 5px !important;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(6px);
          border: 1px solid var(--border);
          font-size: 14px;
          color: var(--ink);
          font-weight: 500;
          transition: all 0.3s;
        }
        .stat-pill:hover { background: rgba(255,255,255,0.8); }
        .stat-pill .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--sage);
        }

        .marquee-track {
          display: flex;
          gap: 48px;
          animation: marquee 30s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-item {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 4vw, 44px);
          color: var(--border);
          white-space: nowrap;
          font-style: italic;
          user-select: none;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: var(--ink);
          transition: all 0.3s;
        }

        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .desktop-nav { display: none !important; }
          .mobile-menu {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: var(--chalk);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 32px;
          }
          .mobile-menu .nav-link { font-size: 18px; }
          .mobile-close {
            position: absolute;
            top: 24px; right: 24px;
            background: none; border: none;
            font-size: 28px; cursor: pointer;
            color: var(--ink);
          }
          .hero-title { font-size: clamp(36px, 9vw, 64px) !important; }
          .hero-subtitle { font-size: 16px !important; }
          .section-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr !important; }
          .service-detail-grid { grid-template-columns: 1fr !important; }
          .service-detail-grid > div:last-child { padding: 24px 0 0 0 !important; }
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .stat-pills { flex-wrap: wrap !important; }
          .intro-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-pad { padding: 140px 20px 80px !important; }
          .booking-banner-grid { flex-direction: column !important; align-items: flex-start !important; }
          .booking-banner-grid > div:last-child { width: 100% !important; flex-direction: column !important; }
          .booking-banner-grid > div:last-child > a { width: 100% !important; text-align: center !important; justify-content: center !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(246,245,240,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 0.4s",
        padding: "0 clamp(20px, 4vw, 64px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2, cursor: "pointer" }} onClick={() => scrollTo("top")}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400, color: "var(--sage)", letterSpacing: "-0.01em" }}><em>O</em>rvello</span>
          </div>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <button className="nav-link" onClick={() => scrollTo("services")}>Services</button>
            <button className="nav-link" onClick={() => scrollTo("about")}>About</button>
            <button className="nav-link" onClick={() => scrollTo("credentials")}>Credentials</button>
            <button className="nav-link" onClick={() => scrollTo("contact")}>Contact</button>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>×</button>
          <button className="nav-link" onClick={() => scrollTo("services")}>Services</button>
          <button className="nav-link" onClick={() => scrollTo("about")}>About</button>
          <button className="nav-link" onClick={() => scrollTo("credentials")}>Credentials</button>
          <button className="nav-link" onClick={() => scrollTo("contact")}>Contact</button>
        </div>
      )}

      {/* HERO */}
      <section id="top" className="hero-pad" style={{
        padding: "180px clamp(20px, 4vw, 64px) 100px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(165deg, #F6F5F0 0%, #EBE9E0 40%, #E4EAE5 70%, #DDE5DF 100%)",
      }}>
        {/* Animated floating orbs */}
        <style>{`
          @keyframes float1 {
            0% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(120px, -60px) scale(1.3); }
            50% { transform: translate(40px, 40px) scale(0.85); }
            75% { transform: translate(-80px, -20px) scale(1.15); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes float2 {
            0% { transform: translate(0, 0) scale(1); }
            30% { transform: translate(-100px, 80px) scale(1.25); }
            60% { transform: translate(60px, -50px) scale(0.8); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes float3 {
            0% { transform: translate(0, 0) scale(1); }
            40% { transform: translate(90px, 70px) scale(1.35); }
            70% { transform: translate(-60px, -40px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes float4 {
            0% { transform: translate(0, 0) scale(1); }
            35% { transform: translate(-70px, -80px) scale(1.2); }
            65% { transform: translate(50px, 60px) scale(0.85); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes float5 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(100px, -40px) scale(1.4); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes morphBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        {/* Morphing gradient base */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, #F6F5F0, #E4EAE5, #DDE5DF, #EBE9E0, #E8E3D8, #E4EAE5)",
          backgroundSize: "300% 300%",
          animation: "morphBg 15s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        {/* Large sage orb - top right */}
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,93,79,0.22) 0%, rgba(74,93,79,0.05) 50%, transparent 70%)",
          animation: "float1 8s ease-in-out infinite",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />
        {/* Warm orb - mid left */}
        <div style={{
          position: "absolute", top: "30%", left: "-8%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,168,130,0.2) 0%, rgba(196,168,130,0.05) 50%, transparent 70%)",
          animation: "float2 10s ease-in-out infinite",
          filter: "blur(35px)",
          pointerEvents: "none",
        }} />
        {/* Deep sage orb - bottom centre */}
        <div style={{
          position: "absolute", bottom: "-15%", right: "25%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(58,75,62,0.18) 0%, rgba(58,75,62,0.04) 50%, transparent 70%)",
          animation: "float3 12s ease-in-out infinite",
          filter: "blur(50px)",
          pointerEvents: "none",
        }} />
        {/* Small accent orb - top left */}
        <div style={{
          position: "absolute", top: "10%", left: "30%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,93,79,0.15) 0%, transparent 60%)",
          animation: "float4 7s ease-in-out infinite",
          filter: "blur(25px)",
          pointerEvents: "none",
        }} />
        {/* Warm highlight orb - bottom left */}
        <div style={{
          position: "absolute", bottom: "10%", left: "10%",
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,168,130,0.14) 0%, transparent 60%)",
          animation: "float5 9s ease-in-out infinite",
          filter: "blur(30px)",
          pointerEvents: "none",
        }} />
        {/* Subtle diagonal lines */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none" }}>
          {[...Array(20)].map((_, i) => (
            <line key={i} x1={`${i * 6}%`} y1="0" x2={`${i * 6 + 20}%`} y2="100%" stroke="var(--sage)" strokeWidth="0.5" />
          ))}
        </svg>
        {/* Hero-only grain overlay */}
        <HeroGrain />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <p style={{
              fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--sage)", fontWeight: 600, marginBottom: 28,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "var(--sage)" }} />
              Construction Consultancy
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="hero-title" style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(44px, 6vw, 78px)",
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: "-0.025em",
              maxWidth: 820,
              color: "var(--ink)",
            }}>
              Safe design,<br />
              compliant buildings,<br />
              <span style={{ color: "var(--sage)", fontStyle: "italic" }}>trusted advice.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="hero-subtitle" style={{
              fontSize: 18, lineHeight: 1.7, color: "var(--text-secondary)",
              maxWidth: 520, marginTop: 36, fontWeight: 300,
            }}>
              CDM Principal Designer services, fire risk assessments, domestic EPCs, and PAS2035 retrofit assessments — delivered with rigour and clarity from Northampton.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="hero-buttons" style={{ display: "flex", gap: 16, marginTop: 48 }}>
              <button className="btn-primary" onClick={() => scrollTo("contact")}>Get in touch</button>
              <button className="btn-outline" onClick={() => scrollTo("services")}>Our services</button>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="stat-pills" style={{ display: "flex", gap: 12, marginTop: 56, flexWrap: "wrap" }}>
              {["Domestic EPC", "PAS2035", "CDM 2015", "Fire Safety"].map((label) => (
                <div className="stat-pill" key={label}>
                  <span className="dot" />
                  {label}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SCROLLING MARQUEE */}
      <div style={{ overflow: "hidden", padding: "36px 0", background: "var(--chalk)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, rep) =>
            ["Principal Designer", "Fire Risk Assessment", "Energy Performance", "Retrofit Assessment", "CDM Compliance", "Building Safety"].map((t, i) => (
              <span className="marquee-item" key={`${rep}-${i}`}>
                {t} <span style={{ margin: "0 16px", opacity: 0.3 }}>✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* BOOKING BANNER */}
      <section id="book" style={{
        background: "linear-gradient(135deg, var(--sage) 0%, var(--sage-deep) 100%)",
        padding: "56px clamp(20px, 4vw, 64px)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 90% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="booking-banner-grid" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <Calendar size={13} />
                  Now booking
                </div>
              </div>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(24px, 3.5vw, 36px)",
                fontWeight: 400,
                color: "white",
                letterSpacing: "-0.015em",
                lineHeight: 1.2,
                marginBottom: 10,
              }}>
                Book your EPC or Retrofit Assessment
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", fontWeight: 300, lineHeight: 1.6, maxWidth: 500 }}>
                Same-week availability across Northamptonshire. Competitive rates from £75 for domestic EPCs and £160 for batch retrofit assessments.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" }}>
              <a href="https://tally.so/r/Gx0jJj" target="_blank" rel="noopener noreferrer" style={{
                background: "white",
                color: "var(--sage-deep)",
                border: "none",
                padding: "18px 36px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "inherit",
              }}
                onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
                onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
              >
                Book an EPC
                <ArrowRight size={16} />
              </a>
              <a href="https://tally.so/r/LZ0qVJ" target="_blank" rel="noopener noreferrer" style={{
                background: "transparent",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.4)",
                padding: "18px 36px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "inherit",
              }}
                onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(255,255,255,0.4)"; }}
              >
                Book a Retrofit
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO / TRUST STRIP */}
      <section className="section-pad" style={{ padding: "100px clamp(20px, 4vw, 64px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="intro-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <FadeIn>
              <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sage)", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "inline-block", width: 28, height: 1, background: "var(--sage)" }} />
                Who we work with
              </p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.2, marginBottom: 24 }}>
                Trusted by architects, developers &amp; housing providers across the Midlands.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 300 }}>
                From single-dwelling EPC assessments to multi-phase CDM appointments, we support clients at every scale. Our work spans private developments, social housing portfolios, local authority contracts, and commercial property management — always with the same standard of technical rigour.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { icon: <PenTool size={16} />, label: "Architects & designers" },
                  { icon: <Building2 size={16} />, label: "Property developers" },
                  { icon: <Home size={16} />, label: "Housing associations" },
                  { icon: <Landmark size={16} />, label: "Local authorities" },
                  { icon: <KeyRound size={16} />, label: "Estate agents" },
                  { icon: <Briefcase size={16} />, label: "Landlords & portfolio owners" },
                ].map((c, i) => (
                  <div key={i} style={{
                    padding: "20px 22px",
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 14,
                    fontSize: 14, fontWeight: 400, color: "var(--ink)",
                    transition: "all 0.3s",
                  }}>
                    <span style={{ color: "var(--sage)", display: "flex", alignItems: "center" }}>{c.icon}</span>
                    {c.label}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section-pad" style={{ padding: "100px clamp(20px, 4vw, 64px)", background: "white", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sage)", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "var(--sage)" }} />
              What we do
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 56 }}>
              Our services
            </h2>
          </FadeIn>

          <div className="service-detail-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {SERVICES.map((s, i) => (
                <button
                  key={s.id}
                  className={`service-tab ${activeService === i ? "active" : ""}`}
                  onClick={() => setActiveService(i)}
                  style={s.comingSoon ? { position: "relative" } : { position: "relative" }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    {s.title}
                    {s.comingSoon && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--warm)",
                        background: "var(--warm-light)",
                        padding: "3px 8px",
                        marginLeft: 8,
                        whiteSpace: "nowrap",
                      }}>Soon</span>
                    )}
                    {s.bookable && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--sage)",
                        background: "var(--sage-light)",
                        padding: "3px 8px",
                        marginLeft: 8,
                        whiteSpace: "nowrap",
                      }}>Book now</span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ padding: "24px 0 24px 48px", minHeight: 340 }}>
              <FadeIn key={activeService}>
                <p style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sage-mid)", fontWeight: 500, marginBottom: 12 }}>
                  {SERVICES[activeService].subtitle}
                </p>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, fontWeight: 400, marginBottom: 20, letterSpacing: "-0.01em" }}>
                  {SERVICES[activeService].title}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: 560, marginBottom: 36, fontWeight: 300 }}>
                  {SERVICES[activeService].description}
                </p>
                <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 36px" }}>
                  {SERVICES[activeService].items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "var(--ink)" }}>
                      <span style={{ color: "var(--sage)", marginTop: 3, fontSize: 8 }}>◆</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 36, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {SERVICES[activeService].bookable ? (
                    <a href={SERVICES[activeService].id === "epc" ? "https://tally.so/r/Gx0jJj" : "https://tally.so/r/LZ0qVJ"} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
                      Book now
                      <ArrowRight size={15} />
                    </a>
                  ) : (
                    <>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 18px",
                        background: "var(--warm-light)",
                        border: "1px solid var(--warm)",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#8B7355",
                      }}>
                        <Clock size={14} />
                        Coming soon — currently in qualification
                      </div>
                      <button className="btn-outline" onClick={() => scrollTo("contact")} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        Register interest
                        <ArrowRight size={15} />
                      </button>
                    </>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{
        background: "linear-gradient(170deg, #4A5D4F 0%, #3A4B3E 50%, #2E3D32 100%)",
        color: "var(--chalk)",
        padding: "100px clamp(20px, 4vw, 64px)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <FadeIn>
              <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(255,255,255,0.4)" }} />
                About Orvello
              </p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 28 }}>
                Built on engineering,<br />driven by <span style={{ fontStyle: "italic" }}>diligence.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.8, fontWeight: 300, marginBottom: 20 }}>
                Orvello is a construction consultancy based in Northampton, founded on a civil engineering background and a commitment to getting the details right. We work with architects, developers, housing associations, and local authorities to deliver regulation-compliant advisory services across health &amp; safety, fire safety, and energy performance.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.8, fontWeight: 300 }}>
                Whether you need a Principal Designer for a complex multi-phase build or a straightforward EPC for a two-bed terrace, we bring the same standard of care and professionalism to every instruction.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { num: "4", label: "Core services" },
                  { num: "CDM", label: "2015 compliant" },
                  { num: "PAS", label: "2035 qualified" },
                  { num: "FRA", label: "Certified assessor" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    padding: 30,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(4px)",
                    transition: "all 0.3s",
                  }}>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, marginBottom: 8 }}>{stat.num}</div>
                    <div style={{ fontSize: 12, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CREDENTIALS */}
      <section id="credentials" className="section-pad" style={{ padding: "100px clamp(20px, 4vw, 64px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sage)", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "var(--sage)" }} />
              Why Orvello
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 56 }}>
              Credentials &amp; approach
            </h2>
          </FadeIn>

          <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, alignItems: "stretch" }}>
            {[
              { title: "Qualified", icon: <Award size={22} />, accent: "var(--sage)", desc: "BEng Civil Engineering with postgraduate qualifications in safety management and energy assessment.", stat: "BEng + MSc", statLabel: "Qualified" },
              { title: "Regulated", icon: <Shield size={22} />, accent: "var(--sage-mid)", desc: "Professionally insured with PI and public liability cover. Registered with relevant industry bodies.", stat: "PI + PL", statLabel: "Insured" },
              { title: "Thorough", icon: <FileCheck size={22} />, accent: "var(--warm)", desc: "Every report is produced to a consistent standard with clear findings, practical recommendations, and full regulatory referencing.", stat: "100%", statLabel: "Compliance" },
              { title: "Responsive", icon: <Zap size={22} />, accent: "#6B8F71", desc: "Same-week availability for EPCs and retrofit assessments. CDM and fire risk work scoped and quoted within 48 hours.", stat: "48hr", statLabel: "Turnaround" },
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 0.1} style={{ display: "flex" }}>
                <div className="credential-card-v2" style={{
                  padding: 0,
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(.16,1,.3,1)",
                  cursor: "default",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}>
                  {/* Top accent bar */}
                  <div style={{ height: 3, background: card.accent, transition: "height 0.3s", flexShrink: 0 }} />
                  
                  <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Icon + number row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{
                        width: 48, height: 48,
                        background: `${card.accent}12`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: card.accent,
                        borderRadius: 4,
                      }}>
                        {card.icon}
                      </div>
                      <span style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: 36,
                        color: "var(--border)",
                        fontStyle: "italic",
                        lineHeight: 1,
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 style={{ fontSize: 19, fontWeight: 600, marginBottom: 12, letterSpacing: "-0.01em", color: "var(--ink)" }}>{card.title}</h3>
                    
                    {/* Description */}
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 300, marginBottom: 20, flex: 1 }}>{card.desc}</p>
                    
                    {/* Bottom stat chip */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 14px",
                      background: `${card.accent}10`,
                      border: `1px solid ${card.accent}25`,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: card.accent,
                      alignSelf: "flex-start",
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{card.stat}</span>
                      <span style={{ opacity: 0.7, textTransform: "uppercase", fontSize: 10 }}>{card.statLabel}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="contact" style={{
        background: "linear-gradient(175deg, #1A1A18 0%, #232320 100%)",
        color: "var(--chalk)",
        padding: "100px clamp(20px, 4vw, 64px)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 20% 80%, rgba(74,93,79,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <FadeIn>
              <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.35, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(255,255,255,0.25)" }} />
                Get in touch
              </p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 28 }}>
                Let's discuss<br />your <span style={{ fontStyle: "italic" }}>project.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.55, fontWeight: 300, maxWidth: 440, marginBottom: 48 }}>
                Whether you have a specific requirement or want to explore how we can support your next project, get in touch and we'll respond within one working day.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { label: "Email", value: "hello@orvello.co.uk", href: "mailto:hello@orvello.co.uk" },
                  { label: "Location", value: "Northampton, United Kingdom" },
                  { label: "Coverage", value: "Northamptonshire & surrounding counties" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.3, marginBottom: 6 }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} style={{ color: "var(--warm)", textDecoration: "none", fontSize: 16, transition: "opacity 0.3s" }}>{item.value}</a>
                    ) : (
                      <div style={{ fontSize: 16, opacity: 0.75 }}>{item.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: 44,
                backdropFilter: "blur(4px)",
              }}>
                {(() => {
                  const [formState, setFormState] = useState({ name: "", email: "", service: "", message: "" });
                  const [submitted, setSubmitted] = useState(false);
                  const [sending, setSending] = useState(false);

                  const handleSubmit = async (e) => {
                    e.preventDefault();
                    setSending(true);
                    try {
                      const res = await fetch("https://formspree.io/f/mvzwlvww", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formState),
                      });
                      if (res.ok) setSubmitted(true);
                    } catch (err) {
                      console.error(err);
                    }
                    setSending(false);
                  };

                  if (submitted) {
                    return (
                      <div style={{ textAlign: "center", padding: "48px 20px" }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: "50%",
                          background: "var(--sage)", display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 24px", fontSize: 24, color: "white",
                        }}>✓</div>
                        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
                          Enquiry sent
                        </h3>
                        <p style={{ fontSize: 15, opacity: 0.5, fontWeight: 300 }}>
                          Thanks {formState.name.split(" ")[0]}. We'll get back to you within one working day.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: 10 }}>Name</label>
                        <input
                          type="text" placeholder="Your full name" value={formState.name} required
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 18px", color: "var(--chalk)", fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.3s" }}
                          onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.25)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: 10 }}>Email</label>
                        <input
                          type="email" placeholder="you@company.com" value={formState.email} required
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 18px", color: "var(--chalk)", fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.3s" }}
                          onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.25)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: 10 }}>Service of interest</label>
                        <select
                          value={formState.service}
                          onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 18px", color: "var(--chalk)", fontSize: 15, fontFamily: "inherit", outline: "none", appearance: "none", transition: "border-color 0.3s" }}
                        >
                          <option value="" style={{ background: "#232320" }}>Select a service</option>
                          {["Domestic EPC", "PAS2035 Retrofit Assessment", "CDM Principal Designer", "Fire Risk Assessment", "Multiple services", "Not sure yet"].map((o) => (
                            <option key={o} value={o} style={{ background: "#232320" }}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: 10 }}>Message</label>
                        <textarea
                          placeholder="Tell us about your project or requirement..." rows={4}
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 18px", color: "var(--chalk)", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color 0.3s" }}
                          onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.25)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                      </div>
                      <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={sending || !formState.name || !formState.email}
                        style={{
                          width: "100%", marginTop: 8, background: "var(--sage)", padding: "18px 36px",
                          opacity: (sending || !formState.name || !formState.email) ? 0.5 : 1,
                          cursor: (sending || !formState.name || !formState.email) ? "not-allowed" : "pointer",
                        }}
                      >
                        {sending ? "Sending..." : "Send enquiry"}
                      </button>
                      <p style={{ fontSize: 12, opacity: 0.3, textAlign: "center", marginTop: 4 }}>
                        We typically respond within one working day.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1A1A18", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "48px clamp(20px, 4vw, 64px) 32px", color: "var(--chalk)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "var(--sage-mid)" }}><em>O</em>rvello</span>
              <p style={{ fontSize: 14, opacity: 0.35, marginTop: 14, lineHeight: 1.7, maxWidth: 320 }}>
                Construction consultancy specialising in CDM, fire safety, energy performance, and retrofit assessment. Based in Northampton, serving clients across the Midlands.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.25, marginBottom: 18 }}>Services</div>
              {SERVICES.map((s) => (
                <div key={s.id} style={{ fontSize: 14, opacity: 0.45, marginBottom: 12, cursor: "pointer", transition: "opacity 0.3s" }}
                  onClick={() => { scrollTo("services"); setActiveService(SERVICES.indexOf(s)); }}>
                  {s.title}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.25, marginBottom: 18 }}>Contact</div>
              <div style={{ fontSize: 14, opacity: 0.45, marginBottom: 12 }}>hello@orvello.co.uk</div>
              <div style={{ fontSize: 14, opacity: 0.45, marginBottom: 12 }}>Northampton, UK</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.25 }}>© 2026 Orvello. All rights reserved.</div>
            <div style={{ fontSize: 13, opacity: 0.25 }}>CDM · Fire Safety · EPC · Retrofit</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
