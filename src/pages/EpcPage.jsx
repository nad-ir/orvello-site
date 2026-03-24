import { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, TrendingUp, Flame, Thermometer, Zap, Home, ArrowRight, Lightbulb, Shield, Wrench, Star, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { parseEpcUrl } from "../urlCodec";

/* ═══ DATA ═══ */
const R={
  A:{c:"#1B8A3A",bg:"#E8F5EC",bdr:"#B8E0C4",score:"92–100",label:"Exceptional",pos:"the top 1%",pctl:"Top 1% of homes",idx:0},
  B:{c:"#2D8E3B",bg:"#EAF6EB",bdr:"#BDE4C5",score:"81–91",label:"Very efficient",pos:"the top 10%",pctl:"Better than 90% of homes",idx:1},
  C:{c:"#5A9E2E",bg:"#F0F6E6",bdr:"#D4E8B8",score:"69–80",label:"Above average",pos:"the top 40%",pctl:"Better than 60% of homes",idx:2},
  D:{c:"#C49A1A",bg:"#FDF6E3",bdr:"#F0DFA0",score:"55–68",label:"Average",pos:"the median",pctl:"Better than 30% of homes",idx:3},
  E:{c:"#C47A18",bg:"#FEF0E0",bdr:"#F0CFA0",score:"39–54",label:"Below average",pos:"the bottom 35%",pctl:"Bottom 15% of homes",idx:4},
  F:{c:"#B85A1A",bg:"#FDECE0",bdr:"#F0B8A0",score:"21–38",label:"Poor",pos:"the bottom 15%",pctl:"Bottom 5% of homes",idx:5},
  G:{c:"#A83030",bg:"#FDE8E8",bdr:"#F0A8A8",score:"1–20",label:"Very poor",pos:"the bottom 5%",pctl:"Least efficient homes",idx:6},
};

const HEAT_LABELS={gas:"Gas central heating",electric:"Electric heating",oil:"Oil boiler",lpg:"LPG boiler",heatpump:"Heat pump",other:"Other"};
const INS_LABELS={good:"Good",average:"Average",poor:"Poor"};

const BASE_COST={A:600,B:800,C:1100,D:1400,E:1800,F:2200,G:2600};
const IMPROVE_MAP={G:"E",F:"D",E:"C",D:"B",C:"A",B:"A",A:"A"};

function engine(rating, heating, insulation, bedrooms=3) {
  const r = R[rating];

  // ─── Factor scoring system ───
  let yearly = BASE_COST[rating];
  const factors = [];

  function addFactor(name, impact, saving, message, action, icon, effort) {
    factors.push({ name, impact, saving, message, action, icon, effort });
  }

  // Heating factors
  if (heating === "electric") {
    yearly += 200;
    addFactor("Heating", 9, 300, "Electric heating significantly increases running costs", "Upgrade to a heat pump or efficient central heating system", "flame", "high");
  } else if (heating === "gas") {
    addFactor("Heating", 5, 150, "Older gas systems may be less efficient than modern alternatives", "Upgrade to a modern condensing boiler", "flame", "high");
  } else if (heating === "oil") {
    yearly += 100;
    addFactor("Heating", 7, 250, "Oil heating has higher running costs and carbon output", "Consider switching to a heat pump or gas", "flame", "high");
  } else if (heating === "lpg") {
    yearly += 80;
    addFactor("Heating", 6, 200, "LPG has moderate running costs", "Consider switching to mains gas or a heat pump", "flame", "high");
  } else if (heating === "heatpump") {
    yearly -= 150;
  }

  // Insulation factors
  if (insulation === "poor") {
    yearly += 150;
    addFactor("Insulation", 10, 400, "Poor insulation is causing major heat loss through walls, roof, and floors", "Install loft and cavity wall insulation", "thermo", "high");
  } else if (insulation === "average") {
    addFactor("Insulation", 6, 200, "Moderate insulation — some areas could be improved for better heat retention", "Top up loft insulation to 270mm", "thermo", "low");
  }

  // Property size factors
  if (bedrooms >= 4) {
    yearly += 200;
    addFactor("Property Size", 4, 0, "Larger homes naturally require more energy to heat and maintain", null, "home", null);
  }
  if (bedrooms >= 5) yearly += 150;

  // Universal improvement factors
  addFactor("Lighting", 3, 80, "Lighting can be made more efficient with modern LEDs", "Switch to LED lighting throughout", "bulb", "low");
  addFactor("Controls", 4, 120, "Heating usage may not be optimised without smart controls", "Install a smart thermostat and TRVs", "zap", "low");
  addFactor("Windows", 5, 150, "Heat may be lost through inefficient glazing", "Upgrade to double or triple glazing", "home", "high");

  if (rating >= "D") {
    addFactor("Renewables", 6, 250, "Electricity costs could be offset by generating your own", "Install solar PV panels", "zap", "high");
  }

  // Sort by impact (highest first)
  factors.sort((a, b) => b.impact - a.impact);

  // Top recommendations (those with actions, top 4)
  const recs = factors.filter(f => f.action).slice(0, 4).map(f => ({
    t: f.action,
    d: f.message,
    s: f.saving > 0 ? `~£${f.saving}/yr` : "—",
    e: f.effort || "low",
    icon: f.icon,
    impact: f.impact,
  }));

  // Top 2 blockers (highest impact factors)
  const blockers = factors.slice(0, 2).map(f => f.message);

  // Costs
  const monthly = Math.round(yearly / 12);

  // Potential improvement
  const pr = IMPROVE_MAP[rating] || rating;
  const prD = R[pr];
  const improvedCost = BASE_COST[pr];
  const savings = Math.max(0, yearly - improvedCost);

  // Dynamic summary
  let summary;
  if (rating === "A" || rating === "B") {
    summary = "Your property performs very efficiently and is cheaper to run than most homes in the UK.";
  } else if (rating === "C") {
    summary = "Your property is around average energy efficiency. A few targeted improvements could push it higher.";
  } else if (rating === "D") {
    summary = "Your property is typical for UK housing stock. There's meaningful room for improvement.";
  } else {
    summary = "Your property is less efficient than average and likely has higher running costs. Improvements would make a significant difference.";
  }

  return {
    r, 
    h: { l: HEAT_LABELS[heating] || "Other" }, 
    ins: { l: INS_LABELS[insulation] || "Average" },
    annual: yearly, monthly, pr, prD, savings, recs, blockers, summary,
    percentile: r.pctl,
    bedrooms,
  };
}

function parseParams(){const p=parseEpcUrl();if(!R[p.rating])return null;return p;}

function useInView(t=0.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[t]);return[ref,v];}
function Reveal({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",transition:`opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`}}>{children}</div>;}

function RecIcon({type,color}){const s={color,flexShrink:0};if(type==="thermo")return<Thermometer size={18} style={s}/>;if(type==="flame")return<Flame size={18} style={s}/>;if(type==="zap")return<Zap size={18} style={s}/>;if(type==="bulb")return<Lightbulb size={18} style={s}/>;if(type==="home")return<Home size={18} style={s}/>;return<Wrench size={18} style={s}/>;}

function HeaderGrain(){const ref=useRef(null);useEffect(()=>{const c=ref.current;if(!c)return;c.width=512;c.height=512;const ctx=c.getContext("2d");const img=ctx.createImageData(512,512);for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=v;img.data[i+1]=v;img.data[i+2]=v;img.data[i+3]=16;}ctx.putImageData(img,0,0);},[]);return<canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.5,mixBlendMode:"overlay",borderRadius:"inherit",zIndex:1}}/>;}

/* ─── Animated count-up ─── */
function CountUp({target,prefix="",duration=1200}){
  const[val,setVal]=useState(0);const[ref,vis]=useInView(0.3);
  useEffect(()=>{if(!vis)return;let start=0;const step=target/((duration/16));const id=setInterval(()=>{start+=step;if(start>=target){setVal(target);clearInterval(id)}else{setVal(Math.round(start))}},16);return()=>clearInterval(id)},[vis,target,duration]);
  return<span ref={ref}>{prefix}{val.toLocaleString()}</span>;
}

/* ─── Big scale ─── */
function Scale({current}){
  const bands="ABCDEFG".split("");
  const colors=["#1B8A3A","#2D8E3B","#5A9E2E","#C49A1A","#C47A18","#B85A1A","#A83030"];
  const widths=[30,37,44,52,60,70,82];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {bands.map((b,i)=>{
        const a=b===current;
        return(
          <div key={b} style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:`${widths[i]}%`,height:a?48:32,background:a?colors[i]:`${colors[i]}12`,borderRadius:a?10:6,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",transition:"all 0.6s cubic-bezier(.22,1,.36,1)",border:a?`2.5px solid ${colors[i]}`:"1px solid transparent",boxShadow:a?`0 4px 16px ${colors[i]}22`:"none"}}>
              <span style={{fontFamily:"var(--f-mono)",fontSize:a?18:13,fontWeight:a?600:400,color:a?"white":colors[i],letterSpacing:"0.03em",transition:"all 0.4s"}}>{b}</span>
              <span style={{fontFamily:"var(--f-mono)",fontSize:a?13:10,color:a?"rgba(255,255,255,0.7)":`${colors[i]}50`,transition:"all 0.4s"}}>{R[b].score}</span>
            </div>
            {a&&<span style={{fontFamily:"var(--f-mono)",fontSize:12,color:colors[i],fontWeight:500,whiteSpace:"nowrap",letterSpacing:"0.02em"}}>← Your property</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Expandable rec card ─── */
function RecCard({rec,effort}){
  const[open,setOpen]=useState(false);
  const isLow=effort==="low";
  const accentColor=isLow?"#1B8A3A":"#B85A1A";
  const accentBg=isLow?"rgba(27,138,58,0.06)":"rgba(184,90,26,0.06)";
  const accentBdr=isLow?"rgba(27,138,58,0.12)":"rgba(184,90,26,0.12)";
  return(
    <div onClick={()=>setOpen(!open)} style={{padding:"20px 24px",background:"white",border:`1px solid ${open?accentBdr:"var(--border)"}`,borderRadius:12,cursor:"pointer",transition:"all 0.3s",borderLeft:open?`3px solid ${accentColor}`:"3px solid transparent"}} onMouseEnter={e=>{if(!open){e.currentTarget.style.borderColor="#D0CEC8";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.04)"}}} onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:44,height:44,borderRadius:12,background:accentBg,border:`1px solid ${accentBdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><RecIcon type={rec.icon} color={accentColor}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:400,color:"var(--fg)"}}>{rec.t}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontFamily:"var(--f-mono)",fontSize:12,color:accentColor,letterSpacing:"0.02em"}}>{rec.s}</span>
          <span className={`effort-tag effort-${rec.e}`}>{rec.e}</span>
          <ChevronDown size={16} style={{color:"var(--muted)",transition:"transform 0.3s",transform:open?"rotate(180deg)":"rotate(0)"}}/>
        </div>
      </div>
      <div style={{maxHeight:open?120:0,overflow:"hidden",transition:"max-height 0.4s cubic-bezier(.22,1,.36,1),opacity 0.3s",opacity:open?1:0}}>
        <p style={{fontSize:13,color:"var(--muted)",fontWeight:300,lineHeight:1.7,paddingTop:14,paddingLeft:60}}>{rec.d}</p>
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function EpcPage(){
  const params=useMemo(()=>parseParams(),[]);
  const data=useMemo(()=>params?engine(params.rating,params.heating,params.insulation,params.bedrooms):null,[params]);
  const[scrolled,setScrolled]=useState(false);
  const[reviewDone,setReviewDone]=useState(false);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>40);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);

  if(!params)return(
    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",background:"#F7F6F3",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <h1 style={{fontSize:24,fontWeight:400,color:"#1A1A18",marginBottom:12}}>EPC not found</h1>
        <p style={{fontSize:14,color:"#8A8A80",fontWeight:300,marginBottom:24}}>This link is missing or invalid. Please contact us.</p>
        <a href="mailto:hello@orvello.co.uk" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",background:"#E4D048",color:"#272420",borderRadius:8,textDecoration:"none",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase"}}>Contact us</a>
      </div>
    </div>
  );

  const{r,h,ins,annual,monthly,pr,prD,savings,recs,blockers,summary,percentile}=data;
  const addr=params.addr||"Property address not specified";

  return(
    <div className="epc">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
        :root{--bg:#F7F6F3;--bg-white:white;--bg-off:#EDECE8;--bg-dark:#272420;--bg-header:#E7E5DF;--fg:#1A1A18;--fg-light:#F0EEE8;--muted:#8A8A80;--accent:#E4D048;--border:#DDDBD5;--f-display:'Bricolage Grotesque',sans-serif;--f-body:'Bricolage Grotesque',sans-serif;--f-mono:'IBM Plex Mono',monospace;--max-w:1100px;--px:clamp(20px,5vw,72px);--card-px:clamp(12px,2.5vw,32px)}
        .epc{font-family:var(--f-body);background:var(--bg);color:var(--fg);min-height:100vh}
        .mono{font-family:var(--f-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
        .section{padding:clamp(56px,8vw,100px) var(--px)}
        .section-inner{max-width:var(--max-w);margin:0 auto}
        .s-tag{font-family:var(--f-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:400;display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .s-tag::before{content:'';width:24px;height:1px;background:currentColor;opacity:0.3}
        .s-title{font-family:var(--f-display);font-size:clamp(26px,4vw,40px);font-weight:300;letter-spacing:-0.025em;line-height:1.12}
        .stat-card{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px) saturate(1.2);border:1px solid rgba(255,255,255,0.6);border-radius:16px;padding:clamp(22px,3vw,30px);transition:all 0.35s cubic-bezier(.22,1,.36,1);cursor:default;box-shadow:0 1px 3px rgba(0,0,0,0.03),0 8px 24px rgba(0,0,0,0.02)}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.07);border-color:rgba(255,255,255,0.8)}
        .icon-box{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .header-card{position:relative;overflow:hidden;border-radius:20px;background:var(--bg-dark);box-shadow:0 4px 60px rgba(0,0,0,0.18),0 1px 3px rgba(0,0,0,0.08)}
        .effort-tag{font-family:var(--f-mono);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:4px;font-weight:500;white-space:nowrap}
        .effort-low{background:rgba(27,138,58,0.08);color:#1B8A3A;border:1px solid rgba(27,138,58,0.15)}
        .effort-high{background:rgba(184,90,26,0.08);color:#B85A1A;border:1px solid rgba(184,90,26,0.15)}
        @media(max-width:800px){.hero-grid{grid-template-columns:1fr!important}.context-grid{grid-template-columns:1fr!important}.cta-flex{flex-direction:column!important;align-items:flex-start!important}.header-card{border-radius:14px}.review-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(39,36,32,0.92)":"transparent",backdropFilter:scrolled?"blur(20px) saturate(1.3)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.4s",padding:"0 var(--px)"}}>
        <div style={{maxWidth:"var(--max-w)",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:3}}>
            <span style={{fontFamily:"var(--f-display)",fontSize:17,fontWeight:400,color:scrolled?"var(--fg-light)":"var(--fg)",transition:"color 0.4s"}}>Orvello</span>
            <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
          </Link>
          {params.ref&&<span className="mono" style={{color:scrolled?"rgba(255,255,255,0.4)":"var(--muted)",transition:"color 0.4s"}}>Ref: {params.ref}</span>}
        </div>
      </nav>

      {/* ═══ HEADER CARD — E7E5DF bg ═══ */}
      <div style={{background:"var(--bg-header)",padding:"0 var(--card-px)",paddingBottom:"clamp(40px,6vw,80px)"}}>
        <div style={{height:68}}/>
        <div style={{maxWidth:"var(--max-w)",margin:"0 auto"}}>
          <Reveal delay={0.04}>
            <div className="header-card" style={{padding:"clamp(48px,7vw,80px) clamp(36px,6vw,80px)",position:"relative"}}>
              <HeaderGrain/>
              <div style={{position:"absolute",top:"20%",right:"15%",width:"40%",height:"60%",borderRadius:"50%",background:"radial-gradient(circle, rgba(228,208,72,0.06) 0%, transparent 60%)",filter:"blur(50px)",pointerEvents:"none",zIndex:0}}/>
              <div style={{position:"relative",zIndex:2}}>
                <Reveal delay={0.08}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
                    <span style={{width:8,height:8,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontWeight:400}}>Energy Performance Certificate</span>
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <h1 style={{fontFamily:"var(--f-display)",fontSize:"clamp(24px,3.5vw,36px)",fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.15,color:"var(--fg-light)",marginBottom:10}}>{addr}</h1>
                </Reveal>
                <Reveal delay={0.16}>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.3)",fontWeight:300}}>Assessment by Orvello{params.ref?` · ${params.ref}`:""}</p>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ RATING — White bg ═══ */}
      <div className="section" style={{background:"var(--bg-white)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="section-inner">
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1.15fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"start"}}>
            <Reveal>
              <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:40}}>
                <div style={{width:100,height:100,borderRadius:22,background:r.bg,border:`2px solid ${r.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:"var(--f-display)",fontSize:52,fontWeight:500,color:r.c,lineHeight:1}}>{params.rating}</span>
                </div>
                <div>
                  <div style={{fontSize:26,fontWeight:400,color:r.c,fontFamily:"var(--f-display)",letterSpacing:"-0.01em"}}>{r.label}</div>
                  <div style={{fontSize:14,color:"var(--muted)",fontWeight:300,marginTop:4}}>{r.pos} of UK homes</div>
                </div>
              </div>
              <Scale current={params.rating}/>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div className="stat-card">
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><div className="icon-box" style={{background:"rgba(196,122,24,0.08)",border:"1px solid rgba(196,122,24,0.15)",width:48,height:48,borderRadius:14}}><Flame size={20} style={{color:"#C47A18"}}/></div><span className="mono" style={{color:"var(--muted)"}}>Est. annual cost</span></div>
                  <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(36px,5vw,50px)",fontWeight:300,letterSpacing:"-0.025em"}}>£<CountUp target={annual}/></div>
                  <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:8}}>Based on current energy prices</div>
                </div>
                <div className="stat-card">
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><div className="icon-box" style={{background:"rgba(90,158,46,0.08)",border:"1px solid rgba(90,158,46,0.15)",width:48,height:48,borderRadius:14}}><Zap size={20} style={{color:"#5A9E2E"}}/></div><span className="mono" style={{color:"var(--muted)"}}>Est. monthly cost</span></div>
                  <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(36px,5vw,50px)",fontWeight:300,letterSpacing:"-0.025em"}}>£<CountUp target={monthly}/></div>
                  <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:8}}>Approximate monthly average</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div className="stat-card"><div className="icon-box" style={{background:"rgba(196,154,26,0.08)",border:"1px solid rgba(196,154,26,0.15)",marginBottom:14,width:48,height:48,borderRadius:14}}><Thermometer size={18} style={{color:"#C49A1A"}}/></div><div className="mono" style={{color:"var(--muted)",marginBottom:8}}>Heating</div><div style={{fontSize:16,fontWeight:400}}>{h.l}</div></div>
                  <div className="stat-card"><div className="icon-box" style={{background:"rgba(90,122,138,0.08)",border:"1px solid rgba(90,122,138,0.15)",marginBottom:14,width:48,height:48,borderRadius:14}}><Home size={18} style={{color:"#5A7A8A"}}/></div><div className="mono" style={{color:"var(--muted)",marginBottom:8}}>Insulation</div><div style={{fontSize:16,fontWeight:400}}>{ins.l}</div></div>
                </div>
                {pr!==params.rating&&(
                  <div className="stat-card" style={{background:prD.bg,borderColor:prD.bdr}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}><div className="icon-box" style={{background:"white",border:`1px solid ${prD.bdr}`}}><TrendingUp size={18} style={{color:prD.c}}/></div><div><div style={{fontSize:15,fontWeight:400}}>Potential rating: <strong style={{color:prD.c,fontWeight:600}}>{pr}</strong></div><div style={{fontSize:13,color:"var(--muted)",fontWeight:300,marginTop:2}}>Could save up to £{savings}/year</div></div></div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ═══ CONTEXT — Light bg ═══ */}
      <div className="section" style={{background:"var(--bg)"}}>
        <div className="section-inner">
          <div className="context-grid" style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:"clamp(40px,6vw,80px)",alignItems:"start"}}>
            <Reveal>
              <div className="s-tag" style={{color:"var(--muted)"}}>What this means</div>
              <h2 className="s-title">Your property in <em style={{fontStyle:"italic",fontWeight:300}}>context</em></h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div style={{fontSize:16,lineHeight:1.9,color:"var(--muted)",fontWeight:300}}>
                <p style={{marginBottom:20}}>{summary}</p>
                <p style={{marginBottom:20}}>Your property has been assessed at rating <strong style={{color:r.c,fontWeight:500}}>{params.rating}</strong> — <strong style={{color:"var(--fg)",fontWeight:500}}>{percentile.toLowerCase()}</strong>. Based on your {h.l.toLowerCase()} and {ins.l.toLowerCase()} insulation, estimated annual energy costs are around <strong style={{color:"var(--fg)",fontWeight:500}}>£{annual.toLocaleString()}</strong> (approximately £{monthly}/month).</p>
                {blockers.length>0&&(
                  <div style={{background:"rgba(196,122,24,0.04)",border:"1px solid rgba(196,122,24,0.1)",borderRadius:10,padding:"16px 20px",marginBottom:20}}>
                    <div className="mono" style={{color:"#C47A18",marginBottom:10,fontSize:9}}>Key limiting factors</div>
                    {blockers.map((b,i)=>(
                      <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<blockers.length-1?8:0}}>
                        <span style={{color:"#C47A18",fontSize:14,lineHeight:"1.7",flexShrink:0}}>·</span>
                        <span style={{fontSize:14,color:"var(--muted)",fontWeight:300,lineHeight:1.7}}>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
                {pr!==params.rating&&<p>With targeted improvements, your property could achieve a rating of <strong style={{color:prD.c,fontWeight:500}}>{pr}</strong>, potentially saving up to <strong style={{color:"var(--fg)",fontWeight:500}}>£{savings} per year</strong> on energy bills.</p>}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ═══ RECOMMENDATIONS — White bg, expandable ═══ */}
      <div className="section" style={{background:"var(--bg-white)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="section-inner">
          <Reveal>
            <div className="s-tag" style={{color:"var(--muted)"}}>Recommendations</div>
            <h2 className="s-title" style={{marginBottom:12}}>How to improve your <em style={{fontStyle:"italic",fontWeight:300}}>rating</em></h2>
            <p style={{fontSize:14,color:"var(--muted)",fontWeight:300,marginBottom:40,maxWidth:520}}>Tap any recommendation to learn more. Savings are estimated annual figures based on typical UK properties.</p>
          </Reveal>
          {recs.filter(x=>x.e==="low").length>0&&(
            <Reveal delay={0.06}>
              <div className="mono" style={{color:"#1B8A3A",marginBottom:14}}>Quick wins</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:36}}>
                {recs.filter(x=>x.e==="low").map((rc,i)=><RecCard key={i} rec={rc} effort={rc.e}/>)}
              </div>
            </Reveal>
          )}
          {recs.filter(x=>x.e==="high").length>0&&(
            <Reveal delay={0.1}>
              <div className="mono" style={{color:"#B85A1A",marginBottom:14}}>Major upgrades</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {recs.filter(x=>x.e==="high").map((rc,i)=><RecCard key={i} rec={rc} effort={rc.e}/>)}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ═══ GOV.UK + REVIEW — Light bg, side by side ═══ */}
      <div className="section" style={{background:"var(--bg)"}}>
        <div className="section-inner">
          <div className="review-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"stretch"}}>
            {/* GOV.UK */}
            <Reveal>
              <div style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px) saturate(1.2)",border:"1px solid rgba(255,255,255,0.6)",borderRadius:16,padding:"clamp(28px,3vw,36px)",height:"100%",display:"flex",flexDirection:"column",boxShadow:"0 1px 3px rgba(0,0,0,0.03),0 8px 24px rgba(0,0,0,0.02)"}}>
                <div>
                  <div className="icon-box" style={{background:"rgba(27,138,58,0.08)",border:"1px solid rgba(27,138,58,0.15)",marginBottom:20,width:48,height:48,borderRadius:14}}><Shield size={20} style={{color:"#1B8A3A"}}/></div>
                  <h3 style={{fontFamily:"var(--f-display)",fontSize:19,fontWeight:400,letterSpacing:"-0.01em",marginBottom:10}}>Official EPC register</h3>
                  <p style={{fontSize:13,color:"var(--muted)",fontWeight:300,lineHeight:1.75,marginBottom:12}}>Your certificate will typically appear on the GOV.UK register within <strong style={{color:"var(--fg)",fontWeight:500}}>24 hours</strong> of lodgement.</p>
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderTop:"1px solid var(--border)",marginBottom:16}}>
                    <Check size={14} style={{color:"#1B8A3A"}}/>
                    <span style={{fontSize:12,color:"var(--muted)",fontWeight:300}}>Valid for 10 years once lodged</span>
                  </div>
                  <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 20px",background:"rgba(27,138,58,0.08)",border:"1px solid rgba(27,138,58,0.15)",borderRadius:10,color:"#1B8A3A",fontFamily:"var(--f-mono)",fontSize:10,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",textDecoration:"none",transition:"all 0.25s",alignSelf:"flex-start",marginTop:"auto"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(27,138,58,0.14)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(27,138,58,0.08)";e.currentTarget.style.transform="translateY(0)"}}><Shield size={11}/> View on GOV.UK <ExternalLink size={10}/></a>
                </div>
              </div>
            </Reveal>
            {/* Review */}
            <Reveal delay={0.08}>
              <div style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px) saturate(1.2)",border:"1px solid rgba(255,255,255,0.6)",borderRadius:16,padding:"clamp(28px,3vw,36px)",height:"100%",display:"flex",flexDirection:"column",boxShadow:"0 1px 3px rgba(0,0,0,0.03),0 8px 24px rgba(0,0,0,0.02)"}}>
                <div>
                  <div style={{display:"flex",gap:4,marginBottom:20}}>
                    {[1,2,3,4,5].map(i=><Star key={i} size={20} fill="#E4D048" color="#D4C038" strokeWidth={1.5}/>)}
                  </div>
                  <h3 style={{fontFamily:"var(--f-display)",fontSize:19,fontWeight:400,letterSpacing:"-0.01em",marginBottom:10}}>How was your <em style={{fontStyle:"italic",fontWeight:300}}>experience?</em></h3>
                  <p style={{fontSize:13,color:"var(--muted)",fontWeight:300,lineHeight:1.75,marginBottom:20}}>Your feedback helps us improve and helps other homeowners find a trusted assessor in Northamptonshire.</p>
                  {reviewDone?(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 18px",background:"rgba(27,138,58,0.06)",border:"1px solid rgba(27,138,58,0.12)",borderRadius:10,color:"#1B8A3A",fontFamily:"var(--f-mono)",fontSize:11,fontWeight:500,letterSpacing:"0.04em"}}><Check size={14}/> Thank you for your feedback</div>
                  ):(
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:"auto"}}>
                      <a href="https://g.page/r/orvello/review" target="_blank" rel="noopener noreferrer" onClick={()=>setReviewDone(true)} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 20px",background:"var(--accent)",color:"var(--bg-dark)",borderRadius:10,textDecoration:"none",fontFamily:"var(--f-mono)",fontSize:10,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.06)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)";e.currentTarget.style.transform="translateY(0)"}}><Star size={12}/> Leave a review</a>
                      <a href="mailto:hello@orvello.co.uk?subject=EPC Feedback" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 20px",background:"transparent",color:"var(--fg)",border:"1px solid var(--border)",borderRadius:10,textDecoration:"none",fontFamily:"var(--f-mono)",fontSize:10,fontWeight:400,letterSpacing:"0.05em",textTransform:"uppercase",transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#C0BEB8";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)"}}>Send feedback</a>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ═══ CTA — Dark bg ═══ */}
      <div className="section" style={{background:"var(--bg-dark)",color:"var(--fg-light)"}}>
        <div className="section-inner">
          <div className="cta-flex" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:40,flexWrap:"wrap"}}>
            <Reveal>
              <h2 style={{fontFamily:"var(--f-display)",fontSize:"clamp(24px,3.5vw,34px)",fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:8}}>Need help improving your rating?</h2>
              <p style={{fontSize:14,color:"rgba(240,238,232,0.4)",fontWeight:300,lineHeight:1.7,maxWidth:440}}>We offer PAS2035 retrofit assessments and can advise on the most cost-effective improvements for your property.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <a href="mailto:hello@orvello.co.uk" style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 32px",background:"var(--accent)",color:"var(--bg-dark)",borderRadius:10,textDecoration:"none",fontFamily:"var(--f-mono)",fontSize:12,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase",transition:"all 0.3s cubic-bezier(.22,1,.36,1)"}} onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.08)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(228,208,72,0.2)"}} onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>Get a retrofit quote <ArrowRight size={14}/></a>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:"28px var(--px)",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,background:"var(--bg)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:2,opacity:0.4,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=0.6} onMouseLeave={e=>e.currentTarget.style.opacity=0.4}>
            <span style={{fontFamily:"var(--f-display)",fontSize:15,fontWeight:400,color:"var(--fg)"}}>Orvello</span>
            <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
          </Link>
          <span style={{fontSize:12,color:"var(--muted)",fontWeight:300,opacity:0.5}}>· Construction Consultancy</span>
        </div>
        <a href="mailto:hello@orvello.co.uk" style={{fontSize:12,color:"var(--muted)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}>hello@orvello.co.uk</a>
      </div>
    </div>
  );
}
