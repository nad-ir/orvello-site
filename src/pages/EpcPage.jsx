import { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, TrendingUp, Flame, Thermometer, Zap, Home, ChevronRight, ArrowUpRight, Lightbulb, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/* ═══ DATA ENGINE ═══ */
const R = {
  A:{c:"#0F7B3F",bg:"#E8F5EC",bdr:"#B8E0C4",score:"92–100",label:"Exceptional",pos:"the top 2%",ctx:"among the most efficient homes in the country",mult:0.45},
  B:{c:"#2D8E3B",bg:"#EAF6EB",bdr:"#BDE4C5",score:"81–91",label:"Very efficient",pos:"the top 15%",ctx:"well above the national average",mult:0.6},
  C:{c:"#5A9E2E",bg:"#F0F6E6",bdr:"#D4E8B8",score:"69–80",label:"Above average",pos:"the top 40%",ctx:"better than most UK homes",mult:0.75},
  D:{c:"#C49A1A",bg:"#FDF6E3",bdr:"#F0DFA0",score:"55–68",label:"Average",pos:"the median",ctx:"typical for UK housing stock",mult:1.0},
  E:{c:"#C47A18",bg:"#FEF0E0",bdr:"#F0CFA0",score:"39–54",label:"Below average",pos:"the bottom 35%",ctx:"less efficient than most homes",mult:1.3},
  F:{c:"#B85A1A",bg:"#FDECE0",bdr:"#F0B8A0",score:"21–38",label:"Poor",pos:"the bottom 15%",ctx:"significantly below the national standard",mult:1.65},
  G:{c:"#A83030",bg:"#FDE8E8",bdr:"#F0A8A8",score:"1–20",label:"Very poor",pos:"the bottom 5%",ctx:"among the least efficient homes in the UK",mult:2.1},
};
const HEAT={gas:{l:"Gas central heating",base:1200},electric:{l:"Electric heating",base:1800},oil:{l:"Oil boiler",base:1400},lpg:{l:"LPG boiler",base:1500},heatpump:{l:"Heat pump",base:750},other:{l:"Other",base:1300}};
const INS={good:{l:"Good",f:0.9},average:{l:"Average",f:1.0},poor:{l:"Poor",f:1.25}};

function engine(rating,heating,insulation){
  const r=R[rating],h=HEAT[heating]||HEAT.gas,ins=INS[insulation]||INS.average;
  const annual=Math.round(h.base*r.mult*ins.f),monthly=Math.round(annual/12);
  const bands="ABCDEFG",ci=bands.indexOf(rating),pi=Math.max(0,ci-2),pr=bands[pi],prData=R[pr];
  const potAnnual=Math.round(h.base*prData.mult*0.9),savings=annual-potAnnual;

  const recs=[];
  if(insulation!=="good"){
    recs.push({title:"Improve insulation",desc:"Top up loft insulation to 270mm",saving:"£100–£300/yr",effort:"low"});
    if(insulation==="poor") recs.push({title:"Wall insulation",desc:"Cavity or external wall insulation",saving:"£200–£500/yr",effort:"medium"});
  }
  if(ci>=2) recs.push({title:"LED lighting",desc:"Replace all remaining halogen and CFL bulbs",saving:"£40–£80/yr",effort:"low"});
  if(ci>=3) recs.push({title:"Glazing upgrade",desc:"Install double or triple glazing where single-glazed",saving:"£100–£300/yr",effort:"high"});
  if(heating==="electric"||heating==="oil"||heating==="lpg") recs.push({title:"Heating system upgrade",desc:"Consider a heat pump or modern condensing boiler",saving:"£300–£800/yr",effort:"high"});
  if(ci>=2) recs.push({title:"Smart heating controls",desc:"Install a smart thermostat and TRVs",saving:"£60–£150/yr",effort:"low"});
  if(ci>=4) recs.push({title:"Solar PV panels",desc:"Generate your own electricity and reduce bills",saving:"£200–£500/yr",effort:"high"});
  if(recs.length===0) recs.push({title:"Well optimised",desc:"Your property already performs well — maintain current systems",saving:"—",effort:"—"});

  return{r,h,ins,annual,monthly,pr,prData,savings,recs};
}

function parseParams(){
  const p=new URLSearchParams(window.location.search);
  const rating=(p.get("rating")||"").toUpperCase();
  if(!R[rating]) return null;
  return{rating,heating:p.get("heating")||"gas",insulation:p.get("insulation")||"average",ref:p.get("ref")||"",addr:p.get("addr")||""};
}

/* ═══ COMPONENTS ═══ */
function useInView(threshold=0.15){
  const ref=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold});o.observe(el);return()=>o.disconnect()},[threshold]);
  return[ref,v];
}
function Reveal({children,delay=0,style={}}){
  const[ref,v]=useInView();
  return <div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:`opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}s`}}>{children}</div>;
}

function RatingScale({current}){
  const bands="ABCDEFG".split("");
  const colors=["#0F7B3F","#2D8E3B","#5A9E2E","#C49A1A","#C47A18","#B85A1A","#A83030"];
  const widths=[30,38,46,54,62,70,80];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {bands.map((b,i)=>{
        const active=b===current;
        return(
          <div key={b} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:`${widths[i]}%`,height:active?36:28,
              background:active?colors[i]:`${colors[i]}18`,
              borderRadius:active?"6px":"4px",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"0 14px",
              transition:"all 0.5s cubic-bezier(.22,1,.36,1)",
              border:active?`2px solid ${colors[i]}`:"2px solid transparent",
              boxShadow:active?`0 4px 16px ${colors[i]}25`:"none",
            }}>
              <span style={{fontFamily:"var(--f-mono)",fontSize:active?14:12,fontWeight:active?600:400,color:active?"white":colors[i],letterSpacing:"0.03em"}}>{b}</span>
              <span style={{fontFamily:"var(--f-mono)",fontSize:active?11:10,fontWeight:400,color:active?"rgba(255,255,255,0.75)":`${colors[i]}80`,letterSpacing:"0.02em"}}>{R[b].score}</span>
            </div>
            {active&&<span style={{fontFamily:"var(--f-mono)",fontSize:11,color:colors[i],fontWeight:500,whiteSpace:"nowrap",letterSpacing:"0.03em"}}>← Your property</span>}
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

  if(!params) return(
    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",background:"#F7F6F3",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <h1 style={{fontSize:24,fontWeight:400,color:"#1A1A18",marginBottom:12}}>EPC not found</h1>
        <p style={{fontSize:14,color:"#8A8A80",fontWeight:300,marginBottom:24}}>This link is missing or invalid. Please contact us.</p>
        <a href="mailto:hello@orvello.co.uk" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",background:"#E4D048",color:"#272420",borderRadius:8,textDecoration:"none",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase"}}>Contact us</a>
      </div>
    </div>
  );

  const{r,h,ins,annual,monthly,pr,prData,savings,recs}=data;
  const addr=params.addr||"Property address not specified";

  return(
    <div className="epc">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
        :root{--bg:#F7F6F3;--fg:#1A1A18;--muted:#8A8A80;--accent:#E4D048;--border:#E8E6E0;--dark:#272420;--f-display:'Bricolage Grotesque',sans-serif;--f-body:'Bricolage Grotesque',sans-serif;--f-mono:'IBM Plex Mono',monospace;--max-w:800px;--px:clamp(20px,5vw,48px)}
        .epc{font-family:var(--f-body);background:var(--bg);color:var(--fg);min-height:100vh}

        /* Nav */
        .epc-nav{position:sticky;top:0;z-index:50;background:rgba(247,246,243,0.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 var(--px);height:52px;display:flex;align-items:center;justify-content:space-between}
        .mono{font-family:var(--f-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}

        /* Sections */
        .s{padding:clamp(48px,8vw,96px) var(--px);max-width:var(--max-w);margin:0 auto}
        .s-border{border-top:1px solid var(--border)}
        .s-tag{font-family:var(--f-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:16px;font-weight:400}
        .s-title{font-family:var(--f-display);font-size:clamp(26px,4vw,38px);font-weight:300;letter-spacing:-0.025em;line-height:1.15;margin-bottom:24px}

        /* CTA band */
        .cta-band{background:var(--dark);color:#F0EEE8;padding:clamp(48px,6vw,72px) var(--px)}
        .cta-inner{max-width:var(--max-w);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap}
        .cta-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:white;color:var(--dark);border-radius:10px;text-decoration:none;font-family:var(--f-mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.3s cubic-bezier(.22,1,.36,1);white-space:nowrap}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.2)}
        .gov-link{display:inline-flex;align-items:center;gap:6px;color:rgba(240,238,232,0.45);font-family:var(--f-mono);font-size:11px;letter-spacing:0.03em;text-decoration:none;transition:color 0.2s;margin-top:12px}
        .gov-link:hover{color:rgba(240,238,232,0.7)}

        /* Footer */
        .epc-footer{padding:28px var(--px);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}

        /* Rec cards */
        .rec-card{padding:20px 24px;background:white;border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:16px;transition:all 0.3s;cursor:default}
        .rec-card:hover{border-color:#D0CEC8;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.04)}

        .effort-tag{font-family:var(--f-mono);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:4px;font-weight:500;white-space:nowrap}
        .effort-low{background:rgba(90,158,46,0.08);color:#5A9E2E;border:1px solid rgba(90,158,46,0.15)}
        .effort-medium{background:rgba(196,154,26,0.08);color:#C49A1A;border:1px solid rgba(196,154,26,0.15)}
        .effort-high{background:rgba(184,90,26,0.08);color:#B85A1A;border:1px solid rgba(184,90,26,0.15)}

        @media(max-width:700px){
          .cta-inner{flex-direction:column;align-items:flex-start}
          .hero-grid{grid-template-columns:1fr!important}
          .cost-row{flex-direction:column!important}
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className="epc-nav">
        <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:3}}>
          <span style={{fontFamily:"var(--f-display)",fontSize:17,fontWeight:400,color:"var(--fg)"}}>Orvello</span>
          <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {params.ref&&<span className="mono" style={{color:"var(--muted)"}}>Ref: {params.ref}</span>}
          <a href="https://orvello.co.uk" target="_blank" rel="noopener noreferrer" style={{fontFamily:"var(--f-mono)",fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase",color:"var(--fg)",textDecoration:"none",padding:"6px 14px",border:"1px solid var(--border)",borderRadius:6,transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#C0BEB8"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>Orvello.co.uk</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="s" style={{paddingBottom:"clamp(32px,5vw,56px)"}}>
        <Reveal>
          <div className="s-tag">Energy Performance Certificate</div>
          <h1 style={{fontFamily:"var(--f-display)",fontSize:"clamp(30px,5vw,48px)",fontWeight:300,letterSpacing:"-0.03em",lineHeight:1.1,marginBottom:8,color:"var(--fg)"}}>{addr}</h1>
          <p style={{fontSize:14,color:"var(--muted)",fontWeight:300}}>Assessment by Orvello{params.ref?` · Ref: ${params.ref}`:""}</p>
        </Reveal>
      </div>

      {/* ═══ RATING + SUMMARY ═══ */}
      <div className="s s-border" style={{paddingTop:"clamp(48px,6vw,72px)"}}>
        <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"start"}}>
          {/* Left: Rating badge + scale */}
          <Reveal>
            <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:32}}>
              <div style={{width:88,height:88,borderRadius:18,background:r.bg,border:`2px solid ${r.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontFamily:"var(--f-display)",fontSize:42,fontWeight:500,color:r.c,lineHeight:1}}>{params.rating}</span>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:400,color:r.c,fontFamily:"var(--f-display)",letterSpacing:"-0.01em"}}>{r.label}</div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:300,marginTop:2}}>Median of UK homes</div>
              </div>
            </div>
            <RatingScale current={params.rating}/>
          </Reveal>

          {/* Right: Key stats */}
          <Reveal delay={0.1}>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* Annual cost */}
              <div style={{background:"white",border:"1px solid var(--border)",borderRadius:12,padding:"24px 28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <Flame size={14} style={{color:"var(--muted)"}}/>
                  <span className="mono" style={{color:"var(--muted)"}}>Est. annual cost</span>
                </div>
                <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(32px,4vw,42px)",fontWeight:300,color:"var(--fg)",letterSpacing:"-0.02em"}}>£{annual.toLocaleString()}</div>
                <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:4}}>Based on current energy prices</div>
              </div>
              {/* Monthly */}
              <div style={{background:"white",border:"1px solid var(--border)",borderRadius:12,padding:"24px 28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <Zap size={14} style={{color:"var(--muted)"}}/>
                  <span className="mono" style={{color:"var(--muted)"}}>Est. monthly cost</span>
                </div>
                <div style={{fontFamily:"var(--f-display)",fontSize:"clamp(32px,4vw,42px)",fontWeight:300,color:"var(--fg)",letterSpacing:"-0.02em"}}>£{monthly}</div>
                <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:4}}>Approximate monthly average</div>
              </div>
              {/* Heating + Insulation */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{background:"white",border:"1px solid var(--border)",borderRadius:12,padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Thermometer size={12} style={{color:"var(--muted)"}}/><span className="mono" style={{color:"var(--muted)"}}>Heating</span></div>
                  <div style={{fontSize:15,fontWeight:400,color:"var(--fg)",lineHeight:1.3}}>{h.l}</div>
                </div>
                <div style={{background:"white",border:"1px solid var(--border)",borderRadius:12,padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Home size={12} style={{color:"var(--muted)"}}/><span className="mono" style={{color:"var(--muted)"}}>Insulation</span></div>
                  <div style={{fontSize:15,fontWeight:400,color:"var(--fg)",lineHeight:1.3}}>{ins.l} insulation</div>
                </div>
              </div>
              {/* Potential */}
              {pr!==params.rating&&(
                <div style={{background:prData.bg,border:`1px solid ${prData.bdr}`,borderRadius:12,padding:"20px 24px",display:"flex",alignItems:"center",gap:14}}>
                  <TrendingUp size={18} style={{color:prData.c,flexShrink:0}}/>
                  <div>
                    <span style={{fontSize:14,fontWeight:400,color:"var(--fg)"}}>Potential rating: <strong style={{color:prData.c}}>{pr}</strong></span>
                    <div style={{fontSize:12,color:"var(--muted)",fontWeight:300,marginTop:2}}>Could save up to £{savings}/year with improvements</div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ CONTEXT — What this means ═══ */}
      <div className="s s-border">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"clamp(40px,6vw,80px)",alignItems:"start"}} className="hero-grid">
          <Reveal>
            <div className="s-tag">What this means</div>
            <h2 className="s-title">Your property in context</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{fontSize:16,lineHeight:1.85,color:"var(--muted)",fontWeight:300}}>
              <p style={{marginBottom:20}}>Your property has been assessed with an EPC rating of <strong style={{color:r.c,fontWeight:500}}>{params.rating}</strong>, placing it in <strong style={{color:"var(--fg)",fontWeight:500}}>{r.pos}</strong> of UK homes for energy efficiency.</p>
              <p style={{marginBottom:20}}>Based on your {h.l.toLowerCase()} and {ins.l.toLowerCase()} insulation, estimated annual energy costs are around <strong style={{color:"var(--fg)",fontWeight:500}}>£{annual.toLocaleString()}</strong> (approximately £{monthly}/month). These figures are estimates based on typical usage and current energy tariffs.</p>
              {pr!==params.rating&&<p>With targeted improvements, your property could achieve a rating of <strong style={{color:prData.c,fontWeight:500}}>{pr}</strong>, potentially saving up to <strong style={{color:"var(--fg)",fontWeight:500}}>£{savings} per year</strong> on energy bills.</p>}
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

        {/* Quick wins */}
        <Reveal delay={0.06}>
          <div className="mono" style={{color:"var(--muted)",marginBottom:14,marginTop:8}}>Quick wins</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:36}}>
            {recs.filter(r=>r.effort==="low").map((rec,i)=>(
              <div key={i} className="rec-card">
                <div>
                  <div style={{fontSize:15,fontWeight:400,color:"var(--fg)",marginBottom:4}}>{rec.title}</div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:300}}>{rec.desc}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  <span style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--fg)",letterSpacing:"0.02em"}}>{rec.saving}</span>
                  <span className={`effort-tag effort-${rec.effort}`}>{rec.effort}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Major upgrades */}
        {recs.filter(r=>r.effort!=="low"&&r.effort!=="—").length>0&&(
          <Reveal delay={0.1}>
            <div className="mono" style={{color:"var(--muted)",marginBottom:14}}>Major upgrades</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {recs.filter(r=>r.effort!=="low"&&r.effort!=="—").map((rec,i)=>(
                <div key={i} className="rec-card">
                  <div>
                    <div style={{fontSize:15,fontWeight:400,color:"var(--fg)",marginBottom:4}}>{rec.title}</div>
                    <div style={{fontSize:13,color:"var(--muted)",fontWeight:300}}>{rec.desc}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:12,color:rec.effort==="high"?"#B85A1A":"#C49A1A",letterSpacing:"0.02em"}}>{rec.saving}</span>
                    <span className={`effort-tag effort-${rec.effort}`}>{rec.effort}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      {/* ═══ CTA BAND ═══ */}
      <div className="cta-band">
        <div className="cta-inner">
          <Reveal>
            <h2 style={{fontFamily:"var(--f-display)",fontSize:"clamp(24px,3.5vw,34px)",fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:8}}>Need help improving your rating?</h2>
            <p style={{fontSize:14,color:"rgba(240,238,232,0.45)",fontWeight:300,lineHeight:1.7,maxWidth:440}}>We offer PAS2035 retrofit assessments and can advise on the most cost-effective improvements for your property.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <a href="mailto:hello@orvello.co.uk" className="cta-btn">Get a retrofit quote <ArrowRight size={14}/></a>
              <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer" className="gov-link">View on GOV.UK EPC register <ExternalLink size={10}/></a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="epc-footer">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Link to="/" style={{display:"flex",alignItems:"baseline",textDecoration:"none",gap:2}}>
            <span style={{fontFamily:"var(--f-display)",fontSize:15,fontWeight:400,color:"var(--fg)",opacity:0.4}}>Orvello</span>
            <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1,opacity:0.4}}/>
          </Link>
          <span style={{fontSize:12,color:"var(--muted)",fontWeight:300,opacity:0.5}}>· Construction Consultancy</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <a href="mailto:hello@orvello.co.uk" style={{fontSize:12,color:"var(--muted)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}>hello@orvello.co.uk</a>
          <span style={{color:"var(--border)"}}>·</span>
          <a href="https://orvello.co.uk" style={{fontSize:12,color:"var(--muted)",textDecoration:"none",fontWeight:300,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--fg)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}>orvello.co.uk</a>
        </div>
      </div>
    </div>
  );
}
