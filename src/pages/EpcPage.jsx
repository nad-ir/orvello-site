import { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, TrendingUp, Flame, Thermometer, Zap, Home, ArrowRight, Lightbulb, ArrowUpRight, Shield, Award, BarChart3, PiggyBank, Wrench, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

/* ═══ DATA ═══ */
const R={
  A:{c:"#1B8A3A",bg:"#E8F5EC",bdr:"#B8E0C4",score:"92–100",label:"Exceptional",pos:"the top 2%",mult:0.45},
  B:{c:"#2D8E3B",bg:"#EAF6EB",bdr:"#BDE4C5",score:"81–91",label:"Very efficient",pos:"the top 15%",mult:0.6},
  C:{c:"#5A9E2E",bg:"#F0F6E6",bdr:"#D4E8B8",score:"69–80",label:"Above average",pos:"the top 40%",mult:0.75},
  D:{c:"#C49A1A",bg:"#FDF6E3",bdr:"#F0DFA0",score:"55–68",label:"Average",pos:"the median",mult:1.0},
  E:{c:"#C47A18",bg:"#FEF0E0",bdr:"#F0CFA0",score:"39–54",label:"Below average",pos:"the bottom 35%",mult:1.3},
  F:{c:"#B85A1A",bg:"#FDECE0",bdr:"#F0B8A0",score:"21–38",label:"Poor",pos:"the bottom 15%",mult:1.65},
  G:{c:"#A83030",bg:"#FDE8E8",bdr:"#F0A8A8",score:"1–20",label:"Very poor",pos:"the bottom 5%",mult:2.1},
};
const HEAT={gas:{l:"Gas central heating",base:1200},electric:{l:"Electric heating",base:1800},oil:{l:"Oil boiler",base:1400},lpg:{l:"LPG boiler",base:1500},heatpump:{l:"Heat pump",base:750},other:{l:"Other",base:1300}};
const INS={good:{l:"Good",f:0.9},average:{l:"Average",f:1.0},poor:{l:"Poor",f:1.25}};

function engine(rating,heating,insulation){
  const r=R[rating],h=HEAT[heating]||HEAT.gas,ins=INS[insulation]||INS.average;
  const annual=Math.round(h.base*r.mult*ins.f),monthly=Math.round(annual/12);
  const bands="ABCDEFG",ci=bands.indexOf(rating),pi=Math.max(0,ci-2),pr=bands[pi],prD=R[pr];
  const potA=Math.round(h.base*prD.mult*0.9),savings=annual-potA;
  const recs=[];
  if(insulation!=="good"){recs.push({t:"Improve insulation",d:"Top up loft insulation to 270mm",s:"£100–£300/yr",e:"low",icon:"thermo"});if(insulation==="poor")recs.push({t:"Wall insulation",d:"Cavity or external wall insulation",s:"£200–£500/yr",e:"high",icon:"home"});}
  if(ci>=2)recs.push({t:"LED lighting",d:"Replace halogen and CFL bulbs throughout",s:"£40–£80/yr",e:"low",icon:"bulb"});
  if(ci>=3)recs.push({t:"Glazing upgrade",d:"Double or triple glazing where single-glazed",s:"£100–£300/yr",e:"high",icon:"home"});
  if(heating==="electric"||heating==="oil"||heating==="lpg")recs.push({t:"Heating upgrade",d:"Consider a heat pump or condensing boiler",s:"£300–£800/yr",e:"high",icon:"flame"});
  if(ci>=2)recs.push({t:"Smart controls",d:"Smart thermostat and thermostatic radiator valves",s:"£60–£150/yr",e:"low",icon:"zap"});
  if(ci>=4)recs.push({t:"Solar PV",d:"Generate your own electricity",s:"£200–£500/yr",e:"high",icon:"zap"});
  return{r,h,ins,annual,monthly,pr,prD,savings,recs};
}

function parseParams(){const p=new URLSearchParams(window.location.search);const rating=(p.get("rating")||"").toUpperCase();if(!R[rating])return null;return{rating,heating:p.get("heating")||"gas",insulation:p.get("insulation")||"average",ref:p.get("ref")||"",addr:p.get("addr")||""};}

function useInView(t=0.12){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[t]);return[ref,v];}
function Reveal({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:`opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}s`}}>{children}</div>;}

function RecIcon({type,color}){
  const s={color,flexShrink:0};
  if(type==="thermo")return<Thermometer size={18} style={s}/>;
  if(type==="flame")return<Flame size={18} style={s}/>;
  if(type==="zap")return<Zap size={18} style={s}/>;
  if(type==="bulb")return<Lightbulb size={18} style={s}/>;
  if(type==="home")return<Home size={18} style={s}/>;
  return<Wrench size={18} style={s}/>;
}

function Scale({current}){
  const bands="ABCDEFG".split("");
  const colors=["#1B8A3A","#2D8E3B","#5A9E2E","#C49A1A","#C47A18","#B85A1A","#A83030"];
  const widths=[30,37,44,52,60,68,78];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {bands.map((b,i)=>{
        const a=b===current;
        return(
          <div key={b} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:`${widths[i]}%`,height:a?36:26,background:a?colors[i]:`${colors[i]}15`,borderRadius:a?6:4,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",transition:"all 0.5s cubic-bezier(.22,1,.36,1)",border:a?`2px solid ${colors[i]}`:"1px solid transparent",boxShadow:a?`0 3px 12px ${colors[i]}20`:"none"}}>
              <span style={{fontFamily:"var(--f-mono)",fontSize:a?14:11,fontWeight:a?600:400,color:a?"white":colors[i],letterSpacing:"0.03em"}}>{b}</span>
              <span style={{fontFamily:"var(--f-mono)",fontSize:a?10:9,color:a?"rgba(255,255,255,0.7)":`${colors[i]}60`}}>{R[b].score}</span>
            </div>
            {a&&<span style={{fontFamily:"var(--f-mono)",fontSize:10,color:colors[i],fontWeight:500,whiteSpace:"nowrap"}}>← Your property</span>}
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
        :root{--bg-light:#F7F6F3;--bg-white:white;--bg-dark:#272420;--fg:#1A1A18;--fg-light:#F0EEE8;--muted:#8A8A80;--accent:#E4D048;--border:#E8E6E0;--f-display:'Bricolage Grotesque',sans-serif;--f-body:'Bricolage Grotesque',sans-serif;--f-mono:'IBM Plex Mono',monospace;--max-w:1100px;--px:clamp(20px,5vw,72px)}
        .epc{font-family:var(--f-body);background:var(--bg-light);color:var(--fg);min-height:100vh}
        .mono{font-family:var(--f-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
        .epc-nav{position:sticky;top:0;z-index:50;background:rgba(247,246,243,0.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 var(--px);height:56px;display:flex;align-items:center;justify-content:space-between}
        .section{padding:clamp(56px,8vw,100px) var(--px)}
        .section-inner{max-width:var(--max-w);margin:0 auto}
        .s-tag{font-family:var(--f-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:400;display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .s-tag::before{content:'';width:24px;height:1px;background:currentColor;opacity:0.3}
        .s-title{font-family:var(--f-display);font-size:clamp(26px,4vw,40px);font-weight:300;letter-spacing:-0.025em;line-height:1.12}

        .stat-card{background:var(--bg-white);border:1px solid var(--border);border-radius:14px;padding:clamp(20px,3vw,28px);transition:all 0.3s;cursor:default}
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.05);border-color:#D0CEC8}

        .rec-card{padding:20px 24px;background:var(--bg-white);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;gap:16px;transition:all 0.3s;cursor:default}
        .rec-card:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.04);border-color:#D0CEC8}

        .effort-tag{font-family:var(--f-mono);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:4px;font-weight:500;white-space:nowrap}
        .effort-low{background:rgba(27,138,58,0.08);color:#1B8A3A;border:1px solid rgba(27,138,58,0.15)}
        .effort-high{background:rgba(184,90,26,0.08);color:#B85A1A;border:1px solid rgba(184,90,26,0.15)}

        .icon-box{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

        @media(max-width:800px){.hero-grid{grid-template-columns:1fr!important}.context-grid{grid-template-columns:1fr!important}.cta-inner{flex-direction:column!important;align-items:flex-start!important}.stat-grid-4{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* NAV */}
      <nav className="epc-nav">
        <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:3}}>
          <span style={{fontFamily:"var(--f-display)",fontSize:17,fontWeight:400,color:"var(--fg)"}}>Orvello</span>
          <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {params.ref&&<span className="mono" style={{color:"var(--muted)"}}>Ref: {params.ref}</span>}
          <a href="https://orvello.co.uk" target="_blank" rel="noopener noreferrer" className="mono" style={{color:"var(--fg)",textDecoration:"none",padding:"5px 12px",border:"1px solid var(--border)",borderRadius:6,transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#C0BEB8"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>orvello.co.uk</a>
        </div>
      </nav>

      {/* ═══ HERO — Light bg ═══ */}
      <div className="section" style={{background:"var(--bg-light)",paddingBottom:"clamp(32px,5vw,56px)"}}>
        <div className="section-inner">
          <Reveal>
            <div className="s-tag" style={{color:"var(--muted)"}}>Energy Performance Certificate</div>
            <h1 style={{fontFamily:"var(--f-display)",fontSize:"clamp(32px,5.5vw,52px)",fontWeight:300,letterSpacing:"-0.035em",lineHeight:1.08,marginBottom:12}}>{addr}</h1>
            <p style={{fontSize:14,color:"var(--muted)",fontWeight:300}}>Assessment by Orvello{params.ref?` · ${params.ref}`:""}</p>
          </Reveal>
        </div>
      </div>

      {/* ═══ RATING — White bg ═══ */}
      <div className="section" style={{background:"var(--bg-white)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="section-inner">
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"start"}}>
            <Reveal>
              <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:36}}>
                <div style={{width:96,height:96,borderRadius:20,background:r.bg,border:`2px solid ${r.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:"var(--f-display)",fontSize:48,fontWeight:500,color:r.c,lineHeight:1}}>{params.rating}</span>
                </div>
                <div>
                  <div style={{fontSize:24,fontWeight:400,color:r.c,fontFamily:"var(--f-display)",letterSpacing:"-0.01em"}}>{r.label}</div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:300,marginTop:4}}>{r.pos} of UK homes</div>
                </div>
              </div>
              <Scale current={params.rating}/>
            </Reveal>

            <Reveal delay={0.1}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* Annual */}
                <div className="stat-card">
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div className="icon-box" style={{background:"rgba(196,122,24,0.08)",border:"1px solid rgba(196,122,24,0.15)"}}><Flame size={18} style={{color:"#C47A18"}}/></div>
                    <span className="mono" style={{color:"var(--muted)"}}>Est. annual cost</span>
                  </div>
                  <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(34px,4.5vw,46px)",fontWeight:300,letterSpacing:"-0.025em",color:"var(--fg)"}}>£{annual.toLocaleString()}</div>
                  <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:6}}>Based on current energy prices</div>
                </div>
                {/* Monthly */}
                <div className="stat-card">
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div className="icon-box" style={{background:"rgba(90,158,46,0.08)",border:"1px solid rgba(90,158,46,0.15)"}}><Zap size={18} style={{color:"#5A9E2E"}}/></div>
                    <span className="mono" style={{color:"var(--muted)"}}>Est. monthly cost</span>
                  </div>
                  <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(34px,4.5vw,46px)",fontWeight:300,letterSpacing:"-0.025em",color:"var(--fg)"}}>£{monthly}</div>
                  <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:6}}>Approximate monthly average</div>
                </div>
                {/* Heating + Insulation */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div className="stat-card">
                    <div className="icon-box" style={{background:"rgba(196,154,26,0.08)",border:"1px solid rgba(196,154,26,0.15)",marginBottom:12}}><Thermometer size={16} style={{color:"#C49A1A"}}/></div>
                    <div className="mono" style={{color:"var(--muted)",marginBottom:6}}>Heating</div>
                    <div style={{fontSize:15,fontWeight:400}}>{h.l}</div>
                  </div>
                  <div className="stat-card">
                    <div className="icon-box" style={{background:"rgba(90,122,138,0.08)",border:"1px solid rgba(90,122,138,0.15)",marginBottom:12}}><Home size={16} style={{color:"#5A7A8A"}}/></div>
                    <div className="mono" style={{color:"var(--muted)",marginBottom:6}}>Insulation</div>
                    <div style={{fontSize:15,fontWeight:400}}>{ins.l}</div>
                  </div>
                </div>
                {/* Potential */}
                {pr!==params.rating&&(
                  <div className="stat-card" style={{background:prD.bg,borderColor:prD.bdr}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div className="icon-box" style={{background:"white",border:`1px solid ${prD.bdr}`}}><TrendingUp size={18} style={{color:prD.c}}/></div>
                      <div>
                        <div style={{fontSize:15,fontWeight:400}}>Potential rating: <strong style={{color:prD.c,fontWeight:600}}>{pr}</strong></div>
                        <div style={{fontSize:13,color:"var(--muted)",fontWeight:300,marginTop:2}}>Could save up to £{savings}/year</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ═══ CONTEXT — Light bg ═══ */}
      <div className="section" style={{background:"var(--bg-light)"}}>
        <div className="section-inner">
          <div className="context-grid" style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:"clamp(40px,6vw,80px)",alignItems:"start"}}>
            <Reveal>
              <div className="s-tag" style={{color:"var(--muted)"}}>What this means</div>
              <h2 className="s-title" style={{marginBottom:0}}>Your property in context</h2>
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

      {/* ═══ RECOMMENDATIONS — White bg ═══ */}
      <div className="section" style={{background:"var(--bg-white)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="section-inner">
          <Reveal>
            <div className="s-tag" style={{color:"var(--muted)"}}>Recommendations</div>
            <h2 className="s-title" style={{marginBottom:40}}>How to improve your rating</h2>
          </Reveal>

          {recs.filter(x=>x.e==="low").length>0&&(
            <Reveal delay={0.06}>
              <div className="mono" style={{color:"var(--muted)",marginBottom:14}}>Quick wins</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:40}}>
                {recs.filter(x=>x.e==="low").map((rc,i)=>(
                  <div key={i} className="rec-card">
                    <div className="icon-box" style={{background:"rgba(27,138,58,0.06)",border:"1px solid rgba(27,138,58,0.12)"}}>
                      <RecIcon type={rc.icon} color="#1B8A3A"/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:400,marginBottom:3}}>{rc.t}</div>
                      <div style={{fontSize:13,color:"var(--muted)",fontWeight:300}}>{rc.d}</div>
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

          {recs.filter(x=>x.e==="high").length>0&&(
            <Reveal delay={0.1}>
              <div className="mono" style={{color:"var(--muted)",marginBottom:14}}>Major upgrades</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {recs.filter(x=>x.e==="high").map((rc,i)=>(
                  <div key={i} className="rec-card">
                    <div className="icon-box" style={{background:"rgba(184,90,26,0.06)",border:"1px solid rgba(184,90,26,0.12)"}}>
                      <RecIcon type={rc.icon} color="#B85A1A"/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:400,marginBottom:3}}>{rc.t}</div>
                      <div style={{fontSize:13,color:"var(--muted)",fontWeight:300}}>{rc.d}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                      <span style={{fontFamily:"var(--f-mono)",fontSize:12,color:"#B85A1A",letterSpacing:"0.02em"}}>{rc.s}</span>
                      <span className="effort-tag effort-high">{rc.e}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ═══ GOV.UK — Light bg ═══ */}
      <div className="section" style={{background:"var(--bg-light)"}}>
        <div className="section-inner">
          <Reveal>
            <div style={{display:"flex",gap:"clamp(24px,4vw,40px)",alignItems:"flex-start",maxWidth:700}}>
              <div className="icon-box" style={{background:"rgba(27,138,58,0.08)",border:"1px solid rgba(27,138,58,0.15)",width:52,height:52,borderRadius:14,flexShrink:0}}>
                <Shield size={22} style={{color:"#1B8A3A"}}/>
              </div>
              <div>
                <h3 style={{fontFamily:"var(--f-display)",fontSize:20,fontWeight:400,letterSpacing:"-0.01em",marginBottom:10}}>Official EPC register</h3>
                <p style={{fontSize:14,color:"var(--muted)",fontWeight:300,lineHeight:1.8,marginBottom:16}}>Your certificate will typically be available on the GOV.UK EPC register within 24 hours of lodgement. Once lodged, it remains valid for 10 years and can be viewed by anyone using your postcode or address.</p>
                <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:8,color:"var(--fg)",fontFamily:"var(--f-mono)",fontSize:10,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",textDecoration:"none",transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#C0BEB8";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.06)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none"}}>
                  <Shield size={12}/> View on GOV.UK <ExternalLink size={10}/>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ CTA — Dark bg ═══ */}
      <div className="section" style={{background:"var(--bg-dark)",color:"var(--fg-light)"}}>
        <div className="section-inner">
          <div className="cta-inner" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:40,flexWrap:"wrap"}}>
            <Reveal>
              <h2 style={{fontFamily:"var(--f-display)",fontSize:"clamp(24px,3.5vw,34px)",fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:8}}>Need help improving your rating?</h2>
              <p style={{fontSize:14,color:"rgba(240,238,232,0.4)",fontWeight:300,lineHeight:1.7,maxWidth:440}}>We offer PAS2035 retrofit assessments and can advise on the most cost-effective improvements for your property.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <a href="mailto:hello@orvello.co.uk" style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 32px",background:"var(--accent)",color:"var(--bg-dark)",borderRadius:10,textDecoration:"none",fontFamily:"var(--f-mono)",fontSize:12,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase",transition:"all 0.3s cubic-bezier(.22,1,.36,1)"}} onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.08)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(228,208,72,0.2)"}} onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>Get a retrofit quote <ArrowRight size={14}/></a>
                <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,marginTop:14,color:"rgba(240,238,232,0.35)",fontFamily:"var(--f-mono)",fontSize:11,letterSpacing:"0.03em",textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(240,238,232,0.6)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(240,238,232,0.35)"}>View on GOV.UK EPC register <ExternalLink size={10}/></a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:"28px var(--px)",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,background:"var(--bg-light)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:2,opacity:0.4,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=0.6} onMouseLeave={e=>e.currentTarget.style.opacity=0.4}>
            <span style={{fontFamily:"var(--f-display)",fontSize:15,fontWeight:400,color:"var(--fg)"}}>Orvello</span>
            <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
          </Link>
          <span style={{fontSize:12,color:"var(--muted)",fontWeight:300,opacity:0.5}}>· Construction Consultancy</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <a href="mailto:hello@orvello.co.uk" style={{fontSize:12,color:"var(--muted)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}>hello@orvello.co.uk</a>
          <span style={{color:"var(--border)"}}>·</span>
          <a href="https://orvello.co.uk" style={{fontSize:12,color:"var(--muted)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}>orvello.co.uk</a>
        </div>
      </div>
    </div>
  );
}
