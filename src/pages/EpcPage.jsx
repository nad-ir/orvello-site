import { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, TrendingUp, Flame, Thermometer, Zap, Home, ArrowRight, Lightbulb, Shield, Wrench, Star, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";

/* ═══ DATA ═══ */
const R={
  A:{c:"#1B8A3A",bg:"#E8F5EC",bdr:"#B8E0C4",score:"92–100",label:"Exceptional",pos:"the top 2%",mult:0.45,idx:0},
  B:{c:"#2D8E3B",bg:"#EAF6EB",bdr:"#BDE4C5",score:"81–91",label:"Very efficient",pos:"the top 15%",mult:0.6,idx:1},
  C:{c:"#5A9E2E",bg:"#F0F6E6",bdr:"#D4E8B8",score:"69–80",label:"Above average",pos:"the top 40%",mult:0.75,idx:2},
  D:{c:"#C49A1A",bg:"#FDF6E3",bdr:"#F0DFA0",score:"55–68",label:"Average",pos:"the median",mult:1.0,idx:3},
  E:{c:"#C47A18",bg:"#FEF0E0",bdr:"#F0CFA0",score:"39–54",label:"Below average",pos:"the bottom 35%",mult:1.3,idx:4},
  F:{c:"#B85A1A",bg:"#FDECE0",bdr:"#F0B8A0",score:"21–38",label:"Poor",pos:"the bottom 15%",mult:1.65,idx:5},
  G:{c:"#A83030",bg:"#FDE8E8",bdr:"#F0A8A8",score:"1–20",label:"Very poor",pos:"the bottom 5%",mult:2.1,idx:6},
};
const HEAT={gas:{l:"Gas central heating",base:1200},electric:{l:"Electric heating",base:1800},oil:{l:"Oil boiler",base:1400},lpg:{l:"LPG boiler",base:1500},heatpump:{l:"Heat pump",base:750},other:{l:"Other",base:1300}};
const INS={good:{l:"Good",f:0.9},average:{l:"Average",f:1.0},poor:{l:"Poor",f:1.25}};

function engine(rating,heating,insulation){
  const r=R[rating],h=HEAT[heating]||HEAT.gas,ins=INS[insulation]||INS.average;
  const annual=Math.round(h.base*r.mult*ins.f),monthly=Math.round(annual/12);
  const bands="ABCDEFG",ci=bands.indexOf(rating),pi=Math.max(0,ci-2),pr=bands[pi],prD=R[pr];
  const potA=Math.round(h.base*prD.mult*0.9),savings=annual-potA;
  const recs=[];
  if(insulation!=="good"){recs.push({t:"Improve insulation",d:"Top up loft insulation to 270mm — one of the most cost-effective improvements",s:"£100–£300/yr",e:"low",icon:"thermo"});if(insulation==="poor")recs.push({t:"Wall insulation",d:"Cavity or external wall insulation to reduce heat loss through walls",s:"£200–£500/yr",e:"high",icon:"home"});}
  if(ci>=2)recs.push({t:"LED lighting",d:"Replace all remaining halogen and CFL bulbs with LEDs",s:"£40–£80/yr",e:"low",icon:"bulb"});
  if(ci>=3)recs.push({t:"Glazing upgrade",d:"Install double or triple glazing where single-glazed windows remain",s:"£100–£300/yr",e:"high",icon:"home"});
  if(heating==="electric"||heating==="oil"||heating==="lpg")recs.push({t:"Heating upgrade",d:"Consider switching to a heat pump or modern condensing boiler",s:"£300–£800/yr",e:"high",icon:"flame"});
  if(ci>=2)recs.push({t:"Smart controls",d:"Install a smart thermostat and thermostatic radiator valves",s:"£60–£150/yr",e:"low",icon:"zap"});
  if(ci>=4)recs.push({t:"Solar PV",d:"Generate your own electricity and reduce reliance on the grid",s:"£200–£500/yr",e:"high",icon:"zap"});
  return{r,h,ins,annual,monthly,pr,prD,savings,recs};
}

function parseParams(){const p=new URLSearchParams(window.location.search);const rating=(p.get("rating")||"").toUpperCase();if(!R[rating])return null;return{rating,heating:p.get("heating")||"gas",insulation:p.get("insulation")||"average",ref:p.get("ref")||"",addr:p.get("addr")||""};}

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
  const data=useMemo(()=>params?engine(params.rating,params.heating,params.insulation):null,[params]);
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

  const{r,h,ins,annual,monthly,pr,prD,savings,recs}=data;
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
                <div className="stat-card" style={{borderTop:"3px solid rgba(196,122,24,0.35)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,right:0,width:"40%",height:"100%",background:"radial-gradient(circle at top right, rgba(196,122,24,0.04) 0%, transparent 60%)",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,position:"relative"}}><div className="icon-box" style={{background:"rgba(196,122,24,0.08)",border:"1px solid rgba(196,122,24,0.15)",width:48,height:48,borderRadius:14}}><Flame size={20} style={{color:"#C47A18"}}/></div><span className="mono" style={{color:"var(--muted)"}}>Est. annual cost</span></div>
                  <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(36px,5vw,50px)",fontWeight:300,letterSpacing:"-0.025em",position:"relative"}}>£<CountUp target={annual}/></div>
                  <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:8,position:"relative"}}>Based on current energy prices</div>
                </div>
                <div className="stat-card" style={{borderTop:"3px solid rgba(90,158,46,0.35)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,right:0,width:"40%",height:"100%",background:"radial-gradient(circle at top right, rgba(90,158,46,0.04) 0%, transparent 60%)",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,position:"relative"}}><div className="icon-box" style={{background:"rgba(90,158,46,0.08)",border:"1px solid rgba(90,158,46,0.15)",width:48,height:48,borderRadius:14}}><Zap size={20} style={{color:"#5A9E2E"}}/></div><span className="mono" style={{color:"var(--muted)"}}>Est. monthly cost</span></div>
                  <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(36px,5vw,50px)",fontWeight:300,letterSpacing:"-0.025em",position:"relative"}}>£<CountUp target={monthly}/></div>
                  <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:8,position:"relative"}}>Approximate monthly average</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div className="stat-card" style={{borderTop:"3px solid rgba(196,154,26,0.25)"}}><div className="icon-box" style={{background:"rgba(196,154,26,0.08)",border:"1px solid rgba(196,154,26,0.15)",marginBottom:14,width:48,height:48,borderRadius:14}}><Thermometer size={18} style={{color:"#C49A1A"}}/></div><div className="mono" style={{color:"var(--muted)",marginBottom:8}}>Heating</div><div style={{fontSize:16,fontWeight:400}}>{h.l}</div></div>
                  <div className="stat-card" style={{borderTop:"3px solid rgba(90,122,138,0.25)"}}><div className="icon-box" style={{background:"rgba(90,122,138,0.08)",border:"1px solid rgba(90,122,138,0.15)",marginBottom:14,width:48,height:48,borderRadius:14}}><Home size={18} style={{color:"#5A7A8A"}}/></div><div className="mono" style={{color:"var(--muted)",marginBottom:8}}>Insulation</div><div style={{fontSize:16,fontWeight:400}}>{ins.l}</div></div>
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
                <p style={{marginBottom:20}}>Your property has been assessed with an EPC rating of <strong style={{color:r.c,fontWeight:500}}>{params.rating}</strong>, placing it in <strong style={{color:"var(--fg)",fontWeight:500}}>{r.pos}</strong> of UK homes for energy efficiency.</p>
                <p style={{marginBottom:20}}>Based on your {h.l.toLowerCase()} and {ins.l.toLowerCase()} insulation, estimated annual energy costs are around <strong style={{color:"var(--fg)",fontWeight:500}}>£{annual.toLocaleString()}</strong> (approximately £{monthly}/month). These figures are estimates based on typical usage and current energy tariffs.</p>
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
              <div style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px) saturate(1.2)",border:"1px solid rgba(255,255,255,0.6)",borderRadius:16,padding:"clamp(28px,3vw,36px)",height:"100%",display:"flex",flexDirection:"column",boxShadow:"0 1px 3px rgba(0,0,0,0.03),0 8px 24px rgba(0,0,0,0.02)",borderTop:"3px solid rgba(27,138,58,0.25)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,width:"50%",height:"100%",background:"radial-gradient(circle at top left, rgba(27,138,58,0.03) 0%, transparent 50%)",pointerEvents:"none"}}/>
                <div style={{position:"relative"}}>
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
              <div style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px) saturate(1.2)",border:"1px solid rgba(255,255,255,0.6)",borderRadius:16,padding:"clamp(28px,3vw,36px)",height:"100%",display:"flex",flexDirection:"column",boxShadow:"0 1px 3px rgba(0,0,0,0.03),0 8px 24px rgba(0,0,0,0.02)",borderTop:"3px solid rgba(228,208,72,0.35)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,right:0,width:"50%",height:"100%",background:"radial-gradient(circle at top right, rgba(228,208,72,0.04) 0%, transparent 50%)",pointerEvents:"none"}}/>
                <div style={{position:"relative"}}>
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
