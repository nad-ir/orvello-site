import { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, TrendingUp, Flame, Thermometer, Zap, Home, ArrowRight, Lightbulb, ArrowUpRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";

/* ═══ DATA ═══ */
const R={
  A:{c:"#34D399",cDim:"rgba(52,211,153,0.12)",cBdr:"rgba(52,211,153,0.25)",glow:"52,211,153",score:"92–100",label:"Exceptional",pos:"the top 2%",ctx:"among the most efficient in the country",mult:0.45},
  B:{c:"#4ADE80",cDim:"rgba(74,222,128,0.12)",cBdr:"rgba(74,222,128,0.25)",glow:"74,222,128",score:"81–91",label:"Very efficient",pos:"the top 15%",ctx:"well above the national average",mult:0.6},
  C:{c:"#A3E635",cDim:"rgba(163,230,53,0.12)",cBdr:"rgba(163,230,53,0.25)",glow:"163,230,53",score:"69–80",label:"Above average",pos:"the top 40%",ctx:"better than most UK homes",mult:0.75},
  D:{c:"#FACC15",cDim:"rgba(250,204,21,0.12)",cBdr:"rgba(250,204,21,0.25)",glow:"250,204,21",score:"55–68",label:"Average",pos:"the median",ctx:"typical for UK housing stock",mult:1.0},
  E:{c:"#FB923C",cDim:"rgba(251,146,60,0.12)",cBdr:"rgba(251,146,60,0.25)",glow:"251,146,60",score:"39–54",label:"Below average",pos:"the bottom 35%",ctx:"less efficient than most homes",mult:1.3},
  F:{c:"#F97316",cDim:"rgba(249,115,22,0.12)",cBdr:"rgba(249,115,22,0.25)",glow:"249,115,22",score:"21–38",label:"Poor",pos:"the bottom 15%",ctx:"significantly below the national standard",mult:1.65},
  G:{c:"#EF4444",cDim:"rgba(239,68,68,0.12)",cBdr:"rgba(239,68,68,0.25)",glow:"239,68,68",score:"1–20",label:"Very poor",pos:"the bottom 5%",ctx:"among the least efficient in the UK",mult:2.1},
};
const HEAT={gas:{l:"Gas central heating",base:1200},electric:{l:"Electric heating",base:1800},oil:{l:"Oil boiler",base:1400},lpg:{l:"LPG boiler",base:1500},heatpump:{l:"Heat pump",base:750},other:{l:"Other",base:1300}};
const INS={good:{l:"Good",f:0.9},average:{l:"Average",f:1.0},poor:{l:"Poor",f:1.25}};

function engine(rating,heating,insulation){
  const r=R[rating],h=HEAT[heating]||HEAT.gas,ins=INS[insulation]||INS.average;
  const annual=Math.round(h.base*r.mult*ins.f),monthly=Math.round(annual/12);
  const bands="ABCDEFG",ci=bands.indexOf(rating),pi=Math.max(0,ci-2),pr=bands[pi],prD=R[pr];
  const potA=Math.round(h.base*prD.mult*0.9),savings=annual-potA;
  const recs=[];
  if(insulation!=="good"){recs.push({t:"Improve insulation",d:"Top up loft insulation to 270mm",s:"£100–£300/yr",e:"low"});if(insulation==="poor")recs.push({t:"Wall insulation",d:"Cavity or external wall insulation",s:"£200–£500/yr",e:"high"});}
  if(ci>=2)recs.push({t:"LED lighting",d:"Replace halogen and CFL bulbs throughout",s:"£40–£80/yr",e:"low"});
  if(ci>=3)recs.push({t:"Glazing upgrade",d:"Double or triple glazing where single-glazed",s:"£100–£300/yr",e:"high"});
  if(heating==="electric"||heating==="oil"||heating==="lpg")recs.push({t:"Heating upgrade",d:"Consider a heat pump or condensing boiler",s:"£300–£800/yr",e:"high"});
  if(ci>=2)recs.push({t:"Smart controls",d:"Smart thermostat and thermostatic radiator valves",s:"£60–£150/yr",e:"low"});
  if(ci>=4)recs.push({t:"Solar PV",d:"Generate your own electricity",s:"£200–£500/yr",e:"high"});
  return{r,h,ins,annual,monthly,pr,prD,savings,recs};
}

function parseParams(){const p=new URLSearchParams(window.location.search);const rating=(p.get("rating")||"").toUpperCase();if(!R[rating])return null;return{rating,heating:p.get("heating")||"gas",insulation:p.get("insulation")||"average",ref:p.get("ref")||"",addr:p.get("addr")||""};}

/* ═══ COMPONENTS ═══ */
function useInView(t=0.12){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[t]);return[ref,v];}
function Reveal({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",transition:`opacity 0.75s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}s`}}>{children}</div>;}

function DynamicBg({glow}){
  const c1=useRef(null),c2=useRef(null);
  useEffect(()=>{
    [c1,c2].forEach((ref,i)=>{
      const c=ref.current;if(!c)return;c.width=256;c.height=256;
      const ctx=c.getContext("2d");const img=ctx.createImageData(256,256);
      for(let j=0;j<img.data.length;j+=4){const v=Math.random()*255;img.data[j]=v;img.data[j+1]=v;img.data[j+2]=v;img.data[j+3]=i===0?16:12;}
      ctx.putImageData(img,0,0);
    });
  },[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      {/* Grain */}
      <canvas ref={c1} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.5,mixBlendMode:"overlay"}}/>
      {/* Rating-coloured orbs */}
      <div style={{position:"absolute",top:"-10%",left:"20%",width:"50vw",height:"50vw",borderRadius:"50%",background:`radial-gradient(circle, rgba(${glow},0.12) 0%, rgba(${glow},0.04) 35%, transparent 65%)`,filter:"blur(60px)",animation:"orbA 20s ease-in-out infinite alternate"}}/>
      <div style={{position:"absolute",bottom:"-5%",right:"10%",width:"40vw",height:"40vw",borderRadius:"50%",background:`radial-gradient(circle, rgba(${glow},0.08) 0%, rgba(${glow},0.02) 40%, transparent 65%)`,filter:"blur(50px)",animation:"orbB 25s ease-in-out infinite alternate-reverse"}}/>
      <div style={{position:"absolute",top:"40%",left:"60%",width:"30vw",height:"30vw",borderRadius:"50%",background:`radial-gradient(circle, rgba(${glow},0.06) 0%, transparent 55%)`,filter:"blur(45px)",animation:"orbA 18s ease-in-out infinite alternate-reverse"}}/>
      <canvas ref={c2} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.3,mixBlendMode:"soft-light"}}/>
    </div>
  );
}

function Scale({current}){
  const bands="ABCDEFG".split("");
  const widths=[28,35,42,50,58,66,76];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {bands.map((b,i)=>{
        const a=b===current,rd=R[b];
        return(
          <div key={b} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:`${widths[i]}%`,height:a?38:26,
              background:a?rd.c:`rgba(255,255,255,0.04)`,
              borderRadius:a?8:5,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",
              transition:"all 0.5s cubic-bezier(.22,1,.36,1)",
              border:a?`2px solid ${rd.c}`:"1px solid rgba(255,255,255,0.06)",
              boxShadow:a?`0 4px 20px rgba(${rd.glow},0.3)`:"none",
            }}>
              <span style={{fontFamily:"var(--f-mono)",fontSize:a?14:11,fontWeight:a?600:400,color:a?"rgba(0,0,0,0.8)":`rgba(255,255,255,0.25)`,letterSpacing:"0.03em"}}>{b}</span>
              <span style={{fontFamily:"var(--f-mono)",fontSize:a?10:9,color:a?"rgba(0,0,0,0.5)":`rgba(255,255,255,0.15)`}}>{rd.score}</span>
            </div>
            {a&&<span style={{fontFamily:"var(--f-mono)",fontSize:10,color:rd.c,fontWeight:500,whiteSpace:"nowrap"}}>← Your property</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function EpcPage(){
  const params=useMemo(()=>parseParams(),[]);
  const data=useMemo(()=>params?engine(params.rating,params.heating,params.insulation):null,[params]);

  if(!params)return(
    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",background:"#151311",color:"#F0EEE8",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:380}}>
        <h1 style={{fontSize:24,fontWeight:400,marginBottom:12}}>EPC not found</h1>
        <p style={{fontSize:14,color:"rgba(240,238,232,0.4)",fontWeight:300,marginBottom:24}}>This link is missing or invalid.</p>
        <a href="mailto:hello@orvello.co.uk" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",background:"#E4D048",color:"#151311",borderRadius:8,textDecoration:"none",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase"}}>Contact us</a>
      </div>
    </div>
  );

  const{r,h,ins,annual,monthly,pr,prD,savings,recs}=data;
  const addr=params.addr||"Property address not specified";
  const glass="rgba(255,255,255,0.04)";
  const glassBdr="rgba(255,255,255,0.08)";
  const glassHeavy="rgba(255,255,255,0.06)";

  return(
    <div className="epc">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
        :root{--bg:#151311;--fg:#F0EEE8;--dim:rgba(240,238,232,0.4);--dimmer:rgba(240,238,232,0.2);--accent:#E4D048;--f-display:'Bricolage Grotesque',sans-serif;--f-body:'Bricolage Grotesque',sans-serif;--f-mono:'IBM Plex Mono',monospace;--max-w:820px;--px:clamp(20px,5vw,48px)}
        .epc{font-family:var(--f-body);background:var(--bg);color:var(--fg);min-height:100vh;position:relative}
        .mono{font-family:var(--f-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
        .epc-nav{position:sticky;top:0;z-index:60;background:rgba(21,19,17,0.8);backdrop-filter:blur(20px) saturate(1.2);border-bottom:1px solid rgba(255,255,255,0.05);padding:0 var(--px);height:52px;display:flex;align-items:center;justify-content:space-between}
        .s{position:relative;z-index:2;padding:clamp(56px,8vw,100px) var(--px);max-width:var(--max-w);margin:0 auto}
        .s-border{border-top:1px solid rgba(255,255,255,0.06)}
        .s-tag{font-family:var(--f-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--dim);margin-bottom:16px}
        .s-title{font-family:var(--f-display);font-size:clamp(26px,4vw,38px);font-weight:300;letter-spacing:-0.025em;line-height:1.15;margin-bottom:28px}
        .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(24px) saturate(1.1);border:1px solid rgba(255,255,255,0.08);border-radius:14px}
        .glass-dense{background:rgba(255,255,255,0.06);backdrop-filter:blur(24px) saturate(1.1);border:1px solid rgba(255,255,255,0.1);border-radius:14px}
        .rec-card{padding:20px 24px;background:rgba(255,255,255,0.03);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06);border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:16px;transition:all 0.3s;cursor:default}
        .rec-card:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.1);transform:translateY(-1px)}
        .effort-tag{font-family:var(--f-mono);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:4px;font-weight:500;white-space:nowrap}
        .effort-low{background:rgba(52,211,153,0.1);color:#34D399;border:1px solid rgba(52,211,153,0.2)}
        .effort-medium{background:rgba(250,204,21,0.1);color:#FACC15;border:1px solid rgba(250,204,21,0.2)}
        .effort-high{background:rgba(251,146,60,0.1);color:#FB923C;border:1px solid rgba(251,146,60,0.2)}
        .cta-band{position:relative;z-index:2;background:rgba(255,255,255,0.03);backdrop-filter:blur(24px);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);padding:clamp(48px,6vw,72px) var(--px)}
        .cta-inner{max-width:var(--max-w);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap}
        .cta-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:var(--accent);color:var(--bg);border-radius:10px;text-decoration:none;font-family:var(--f-mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.3s cubic-bezier(.22,1,.36,1);white-space:nowrap}
        .cta-btn:hover{filter:brightness(1.08);transform:translateY(-2px);box-shadow:0 12px 32px rgba(228,208,72,0.2)}
        .gov-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:var(--dim);font-family:var(--f-mono);font-size:10px;letter-spacing:0.04em;text-decoration:none;transition:all 0.25s;text-transform:uppercase}
        .gov-badge:hover{background:rgba(255,255,255,0.08);color:var(--fg);border-color:rgba(255,255,255,0.15)}
        .epc-footer{position:relative;z-index:2;padding:28px var(--px);border-top:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        @keyframes orbA{0%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.05)}100%{transform:translate(-20px,15px) scale(0.97)}}
        @keyframes orbB{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,18px) scale(1.04)}100%{transform:translate(15px,-12px) scale(0.96)}}
        @media(max-width:700px){.hero-grid{grid-template-columns:1fr!important}.cta-inner{flex-direction:column;align-items:flex-start}}
      `}</style>

      <DynamicBg glow={r.glow}/>

      {/* NAV */}
      <nav className="epc-nav">
        <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:3}}>
          <span style={{fontFamily:"var(--f-display)",fontSize:17,fontWeight:400,color:"var(--fg)"}}>Orvello</span>
          <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {params.ref&&<span className="mono" style={{color:"var(--dim)"}}>Ref: {params.ref}</span>}
          <a href="https://orvello.co.uk" target="_blank" rel="noopener noreferrer" className="mono" style={{color:"var(--dim)",textDecoration:"none",padding:"5px 12px",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";e.currentTarget.style.color="var(--fg)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="var(--dim)"}}>orvello.co.uk</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="s" style={{paddingBottom:"clamp(24px,4vw,48px)"}}>
        <Reveal>
          <div className="mono" style={{color:"var(--dim)",marginBottom:20}}>Energy Performance Certificate</div>
          <h1 style={{fontFamily:"var(--f-display)",fontSize:"clamp(32px,5.5vw,54px)",fontWeight:300,letterSpacing:"-0.035em",lineHeight:1.08,marginBottom:12}}>{addr}</h1>
          <p style={{fontSize:14,color:"var(--dim)",fontWeight:300}}>Assessment by Orvello{params.ref?` · ${params.ref}`:""}</p>
        </Reveal>
      </div>

      {/* ═══ RATING ═══ */}
      <div className="s s-border">
        <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(32px,5vw,64px)",alignItems:"start"}}>
          <Reveal>
            {/* Badge */}
            <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:36}}>
              <div style={{width:96,height:96,borderRadius:22,background:r.cDim,border:`2px solid ${r.cBdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 8px 32px rgba(${r.glow},0.15)`,backdropFilter:"blur(12px)"}}>
                <span style={{fontFamily:"var(--f-display)",fontSize:48,fontWeight:500,color:r.c,lineHeight:1}}>{params.rating}</span>
              </div>
              <div>
                <div style={{fontSize:24,fontWeight:400,color:r.c,fontFamily:"var(--f-display)",letterSpacing:"-0.01em"}}>{r.label}</div>
                <div style={{fontSize:13,color:"var(--dim)",fontWeight:300,marginTop:4}}>{r.pos} of UK homes</div>
              </div>
            </div>
            <Scale current={params.rating}/>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.1}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="glass" style={{padding:"28px 28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Flame size={14} style={{color:r.c}}/><span className="mono" style={{color:"var(--dim)"}}>Est. annual cost</span></div>
                <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(36px,5vw,48px)",fontWeight:300,letterSpacing:"-0.03em"}}>£{annual.toLocaleString()}</div>
                <div style={{fontSize:12,color:"var(--dimmer)",fontWeight:300,marginTop:6}}>Based on current energy prices</div>
              </div>
              <div className="glass" style={{padding:"28px 28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Zap size={14} style={{color:r.c}}/><span className="mono" style={{color:"var(--dim)"}}>Est. monthly cost</span></div>
                <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(36px,5vw,48px)",fontWeight:300,letterSpacing:"-0.03em"}}>£{monthly}</div>
                <div style={{fontSize:12,color:"var(--dimmer)",fontWeight:300,marginTop:6}}>Approximate monthly average</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div className="glass" style={{padding:"22px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Thermometer size={12} style={{color:"var(--dim)"}}/><span className="mono" style={{color:"var(--dimmer)"}}>Heating</span></div>
                  <div style={{fontSize:14,fontWeight:400,lineHeight:1.3}}>{h.l}</div>
                </div>
                <div className="glass" style={{padding:"22px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Home size={12} style={{color:"var(--dim)"}}/><span className="mono" style={{color:"var(--dimmer)"}}>Insulation</span></div>
                  <div style={{fontSize:14,fontWeight:400,lineHeight:1.3}}>{ins.l}</div>
                </div>
              </div>
              {pr!==params.rating&&(
                <div className="glass-dense" style={{padding:"22px 24px",display:"flex",alignItems:"center",gap:14,borderColor:prD.cBdr}}>
                  <TrendingUp size={18} style={{color:prD.c,flexShrink:0}}/>
                  <div>
                    <span style={{fontSize:14,fontWeight:400}}>Potential rating: <strong style={{color:prD.c}}>{pr}</strong></span>
                    <div style={{fontSize:12,color:"var(--dim)",fontWeight:300,marginTop:2}}>Could save up to £{savings}/year</div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ CONTEXT ═══ */}
      <div className="s s-border">
        <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"clamp(32px,5vw,64px)",alignItems:"start"}}>
          <Reveal>
            <div className="s-tag">What this means</div>
            <h2 className="s-title">Your property in context</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{fontSize:16,lineHeight:1.9,color:"var(--dim)",fontWeight:300}}>
              <p style={{marginBottom:20}}>Your property has been assessed with an EPC rating of <strong style={{color:r.c,fontWeight:500}}>{params.rating}</strong>, placing it in <strong style={{color:"var(--fg)",fontWeight:500}}>{r.pos}</strong> of UK homes for energy efficiency.</p>
              <p style={{marginBottom:20}}>Based on your {h.l.toLowerCase()} and {ins.l.toLowerCase()} insulation, estimated annual energy costs are around <strong style={{color:"var(--fg)",fontWeight:500}}>£{annual.toLocaleString()}</strong> (approximately £{monthly}/month). These figures are estimates based on typical usage and current energy tariffs.</p>
              {pr!==params.rating&&<p>With targeted improvements, your property could achieve a rating of <strong style={{color:prD.c,fontWeight:500}}>{pr}</strong>, potentially saving up to <strong style={{color:"var(--fg)",fontWeight:500}}>£{savings} per year</strong> on energy bills.</p>}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ RECOMMENDATIONS ═══ */}
      <div className="s s-border">
        <Reveal>
          <div className="s-tag">Recommendations</div>
          <h2 className="s-title">How to improve your rating</h2>
        </Reveal>

        {recs.filter(x=>x.e==="low").length>0&&(
          <Reveal delay={0.06}>
            <div className="mono" style={{color:"var(--dim)",marginBottom:14}}>Quick wins</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:36}}>
              {recs.filter(x=>x.e==="low").map((rc,i)=>(
                <div key={i} className="rec-card">
                  <div>
                    <div style={{fontSize:15,fontWeight:400,marginBottom:3}}>{rc.t}</div>
                    <div style={{fontSize:13,color:"var(--dim)",fontWeight:300}}>{rc.d}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--fg)",letterSpacing:"0.02em"}}>{rc.s}</span>
                    <span className="effort-tag effort-low">{rc.e}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {recs.filter(x=>x.e==="high"||x.e==="medium").length>0&&(
          <Reveal delay={0.1}>
            <div className="mono" style={{color:"var(--dim)",marginBottom:14}}>Major upgrades</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {recs.filter(x=>x.e==="high"||x.e==="medium").map((rc,i)=>(
                <div key={i} className="rec-card">
                  <div>
                    <div style={{fontSize:15,fontWeight:400,marginBottom:3}}>{rc.t}</div>
                    <div style={{fontSize:13,color:"var(--dim)",fontWeight:300}}>{rc.d}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:12,color:rc.e==="high"?"#FB923C":"#FACC15",letterSpacing:"0.02em"}}>{rc.s}</span>
                    <span className={`effort-tag effort-${rc.e}`}>{rc.e}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      {/* ═══ GOV.UK + LODGEMENT ═══ */}
      <div className="s s-border" style={{paddingBottom:"clamp(40px,5vw,60px)"}}>
        <Reveal>
          <div className="glass" style={{padding:"clamp(24px,4vw,36px)",display:"flex",alignItems:"flex-start",gap:20}}>
            <Shield size={20} style={{color:r.c,flexShrink:0,marginTop:2}}/>
            <div>
              <div style={{fontSize:15,fontWeight:400,marginBottom:6}}>Official EPC register</div>
              <p style={{fontSize:13,color:"var(--dim)",fontWeight:300,lineHeight:1.7,marginBottom:16}}>Your certificate will typically be available on the GOV.UK EPC register within 24 hours of lodgement. Once lodged, it remains valid for 10 years and can be viewed by anyone using your postcode or address.</p>
              <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer" className="gov-badge">
                <Shield size={11}/> View on GOV.UK <ExternalLink size={10}/>
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ═══ CTA ═══ */}
      <div className="cta-band">
        <div className="cta-inner">
          <Reveal>
            <h2 style={{fontFamily:"var(--f-display)",fontSize:"clamp(24px,3.5vw,34px)",fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:8}}>Need help improving your rating?</h2>
            <p style={{fontSize:14,color:"var(--dim)",fontWeight:300,lineHeight:1.7,maxWidth:420}}>We offer PAS2035 retrofit assessments and can advise on the most cost-effective improvements for your property.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <a href="mailto:hello@orvello.co.uk" className="cta-btn">Get a retrofit quote <ArrowRight size={14}/></a>
          </Reveal>
        </div>
      </div>

      {/* Footer */}
      <div className="epc-footer">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:2,opacity:0.3,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=0.5} onMouseLeave={e=>e.currentTarget.style.opacity=0.3}>
            <span style={{fontFamily:"var(--f-display)",fontSize:15,fontWeight:400,color:"var(--fg)"}}>Orvello</span>
            <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
          </Link>
          <span style={{fontSize:12,color:"var(--dimmer)",fontWeight:300}}>· Construction Consultancy</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <a href="mailto:hello@orvello.co.uk" style={{fontSize:12,color:"var(--dimmer)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--dimmer)"}>hello@orvello.co.uk</a>
          <span style={{color:"rgba(255,255,255,0.08)"}}>·</span>
          <a href="https://orvello.co.uk" style={{fontSize:12,color:"var(--dimmer)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--dimmer)"}>orvello.co.uk</a>
        </div>
      </div>
    </div>
  );
}
