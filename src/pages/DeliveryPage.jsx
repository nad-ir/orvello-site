import { useState, useEffect, useRef, useMemo } from "react";
import { Download, FileCheck, AlertCircle, Shield, Clock, FileText, Mail, CheckCircle2, ArrowDownToLine, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { parseDeliveryUrl } from "../urlCodec";

const SVC={
  pas2035:{label:"PAS2035 Retrofit Assessment",icon:"file",accent:"#5A9E2E",accentBg:"rgba(90,158,46,0.08)",accentBdr:"rgba(90,158,46,0.15)"},
  fire:{label:"Fire Risk Assessment",icon:"shield",accent:"#C47A18",accentBg:"rgba(196,122,24,0.08)",accentBdr:"rgba(196,122,24,0.15)"},
  cdm:{label:"CDM Documentation",icon:"file",accent:"#5A7A8A",accentBg:"rgba(90,122,138,0.08)",accentBdr:"rgba(90,122,138,0.15)"},
  report:{label:"Consultancy Report",icon:"file",accent:"#6B5B3E",accentBg:"rgba(107,91,62,0.08)",accentBdr:"rgba(107,91,62,0.15)"},
};

function Grain(){
  const r1=useRef(null),r2=useRef(null);
  useEffect(()=>{
    [r1,r2].forEach((ref,i)=>{const c=ref.current;if(!c)return;c.width=256;c.height=256;const ctx=c.getContext("2d");const img=ctx.createImageData(256,256);for(let j=0;j<img.data.length;j+=4){const v=Math.random()*255;img.data[j]=v;img.data[j+1]=v;img.data[j+2]=v;img.data[j+3]=i===0?14:8;}ctx.putImageData(img,0,0)});
  },[]);
  return<>
    <canvas ref={r1} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.45,mixBlendMode:"overlay",zIndex:1}}/>
    <canvas ref={r2} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.3,mixBlendMode:"soft-light",zIndex:1}}/>
  </>;
}

function getExpiry(created,days){
  if(!created)return{expired:false,left:null,date:null,pct:100};
  const d=new Date(created);if(isNaN(d.getTime()))return{expired:false,left:null,date:null,pct:100};
  const exp=new Date(d.getTime()+days*864e5),ms=exp.getTime()-Date.now();
  const total=days*864e5;
  const pct=Math.max(0,Math.min(100,Math.round((ms/total)*100)));
  return{expired:ms<=0,left:Math.max(0,Math.ceil(ms/864e5)),date:exp.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),pct};
}

export default function DeliveryPage(){
  const[downloaded,setDownloaded]=useState(false);
  const[hover,setHover]=useState(false);
  const params=useMemo(()=>parseDeliveryUrl(),[]);
  const expiry=useMemo(()=>params?getExpiry(params.created,params.exp):{expired:false,left:null,date:null,pct:100},[params]);
  const noParams=!params;
  const isExpired=expiry.expired;
  const isValid=!noParams&&!isExpired;
  const svc=params?SVC[params.service]||SVC.report:SVC.report;

  return(
    <div className="dl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased}
        :root{
          --bg:#151311;--card:#F7F6F3;--fg:#1A1A18;--fg-l:#F0EEE8;
          --muted:#8A8A80;--accent:#E4D048;--border:#E2E0DA;
          --green:#4A8A52;--green-bg:rgba(74,138,82,0.06);--green-bdr:rgba(74,138,82,0.15);
          --amber:#9B7A1A;--amber-bg:rgba(155,122,26,0.06);--amber-bdr:rgba(155,122,26,0.15);
          --red:#9B4444;--red-bg:rgba(155,68,68,0.05);--red-bdr:rgba(155,68,68,0.12);
          --font:'Bricolage Grotesque',sans-serif;--mono:'IBM Plex Mono',monospace
        }
        .dl{font-family:var(--font);background:var(--bg);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(20px,4vw,40px);position:relative;overflow:hidden}
        .mono{font-family:var(--mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;font-weight:400}

        /* Card */
        .dl-card{
          position:relative;z-index:2;
          background:var(--card);
          border-radius:28px;
          max-width:460px;width:100%;
          box-shadow:0 20px 80px rgba(0,0,0,0.35),0 2px 6px rgba(0,0,0,0.1),0 0 0 1px rgba(255,255,255,0.03);
          overflow:hidden;
        }

        /* Top accent strip */
        .dl-strip{height:4px;width:100%}

        .dl-body{padding:clamp(32px,6vw,48px) clamp(28px,5vw,44px)}

        /* Icon */
        .dl-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:24px}

        /* Typography */
        .dl-h1{font-size:clamp(22px,4vw,26px);font-weight:400;letter-spacing:-0.02em;color:var(--fg);margin-bottom:8px;line-height:1.25}
        .dl-sub{font-size:14px;line-height:1.7;color:var(--muted);font-weight:300;margin-bottom:0}

        /* Service tag */
        .dl-svc-tag{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:6px;font-family:var(--mono);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;font-weight:500;margin-bottom:20px}

        /* Meta */
        .dl-meta{padding:18px 0;border-top:1px solid var(--border);margin-top:24px}
        .dl-meta-grid{display:flex;gap:28px;flex-wrap:wrap}
        .dl-meta-item .dl-ml{font-size:9px;color:var(--muted);font-family:var(--mono);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:5px}
        .dl-meta-item .dl-mv{font-size:14px;color:var(--fg);font-weight:400;line-height:1.4}

        /* Expiry bar */
        .dl-exp-wrap{margin-top:16px;padding-top:14px;border-top:1px solid var(--border)}
        .dl-exp-bar-bg{width:100%;height:4px;background:rgba(0,0,0,0.04);border-radius:4px;overflow:hidden;margin-top:10px}
        .dl-exp-bar{height:100%;border-radius:4px;transition:width 1.5s cubic-bezier(.22,1,.36,1)}

        /* Download btn */
        .dl-btn{
          display:flex;align-items:center;justify-content:center;gap:12px;
          width:100%;padding:18px;margin-top:28px;
          border:none;border-radius:16px;
          font-family:var(--mono);font-size:12px;font-weight:500;
          letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;transition:all 0.35s cubic-bezier(.22,1,.36,1);
          text-decoration:none;position:relative;overflow:hidden;
        }
        .dl-btn.primary{background:var(--fg);color:var(--card)}
        .dl-btn.primary:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,0.12)}
        .dl-btn.primary:active{transform:translateY(0)}
        .dl-btn.done{background:var(--green-bg);color:var(--green);border:1px solid var(--green-bdr)}
        .dl-btn.done:hover{background:rgba(74,138,82,0.1)}
        .dl-btn.outline{background:transparent;color:var(--fg);border:1px solid var(--border)}
        .dl-btn.outline:hover{border-color:var(--muted);transform:translateY(-2px)}

        /* Trust */
        .dl-trust{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;font-size:10px;color:var(--muted);font-family:var(--mono);letter-spacing:0.04em;text-transform:uppercase}

        /* Powered by */
        .dl-powered{
          position:relative;z-index:2;margin-top:36px;
          display:flex;align-items:center;gap:6px;
          opacity:0.18;transition:opacity 0.25s;
        }
        .dl-powered:hover{opacity:0.35}

        /* Glow */
        .dl-glow{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
        @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(25px,-18px) scale(1.05)}100%{transform:translate(-18px,12px) scale(0.96)}}

        /* Entrance */
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
        .ani-card{animation:scaleIn 0.6s cubic-bezier(.22,1,.36,1) forwards}
        .ani{animation:slideUp 0.55s cubic-bezier(.22,1,.36,1) forwards}
        .d1{animation-delay:0.08s;opacity:0}
        .d2{animation-delay:0.14s;opacity:0}
        .d3{animation-delay:0.2s;opacity:0}
        .d4{animation-delay:0.28s;opacity:0}
        .d5{animation-delay:0.36s;opacity:0}
        .d6{animation-delay:0.44s;opacity:0}

        /* Download pulse animation */
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(26,26,24,0.1)}50%{box-shadow:0 0 0 8px rgba(26,26,24,0)}}
        .dl-btn.primary.pulse{animation:pulse 2s ease-in-out infinite}

        @media(max-width:500px){.dl-card{border-radius:22px}}
      `}</style>

      <Grain/>

      {/* Ambient glow — uses service accent colour */}
      <div className="dl-glow" style={{width:"50vw",height:"50vw",top:"5%",left:"15%",background:`radial-gradient(circle, ${isValid?svc.accentBg:"rgba(228,208,72,0.04)"} 0%, transparent 55%)`,animation:"drift 20s ease-in-out infinite alternate"}}/>
      <div className="dl-glow" style={{width:"35vw",height:"35vw",bottom:"10%",right:"10%",background:"radial-gradient(circle, rgba(228,208,72,0.03) 0%, transparent 55%)",animation:"drift 24s ease-in-out infinite alternate-reverse"}}/>

      <div className="dl-card ani-card">
        {/* Accent strip at top — coloured by service */}
        <div className="dl-strip" style={{background:isValid?svc.accent:isExpired?"var(--amber)":"var(--red)"}}/>

        <div className="dl-body">

          {/* ═══ ERROR ═══ */}
          {noParams&&(<>
            <div className="dl-icon ani d1" style={{background:"var(--red-bg)",border:`1px solid var(--red-bdr)`,color:"var(--red)"}}><AlertCircle size={24}/></div>
            <h1 className="dl-h1 ani d2">Link unavailable</h1>
            <p className="dl-sub ani d3" style={{marginBottom:24}}>This download link is missing or invalid. Please get in touch and we'll reissue your document.</p>
            <a href="mailto:hello@orvello.co.uk" className="dl-btn outline ani d4"><Mail size={16}/> Contact us</a>
            <div className="dl-trust ani d5">hello@orvello.co.uk</div>
          </>)}

          {/* ═══ EXPIRED ═══ */}
          {!noParams&&isExpired&&(<>
            <div className="dl-icon ani d1" style={{background:"var(--amber-bg)",border:`1px solid var(--amber-bdr)`,color:"var(--amber)"}}><Clock size={24}/></div>
            <div className="dl-svc-tag ani d1" style={{background:svc.accentBg,color:svc.accent,border:`1px solid ${svc.accentBdr}`}}>{svc.label}</div>
            <h1 className="dl-h1 ani d2">Link expired</h1>
            <p className="dl-sub ani d3">This download link expired on <strong style={{color:"var(--fg)",fontWeight:500}}>{expiry.date}</strong>. Contact us and we'll send you a new one.</p>

            {params.ref&&(
              <div className="dl-meta ani d3">
                <div className="dl-meta-grid">
                  <div className="dl-meta-item"><div className="dl-ml">Reference</div><div className="dl-mv" style={{fontFamily:"var(--mono)"}}>{params.ref}</div></div>
                </div>
              </div>
            )}

            <a href={`mailto:hello@orvello.co.uk?subject=New link request — ${params.ref||"document"}`} className="dl-btn outline ani d4"><RefreshCw size={15}/> Request new link</a>
            <div className="dl-trust ani d5">hello@orvello.co.uk</div>
          </>)}

          {/* ═══ VALID ═══ */}
          {isValid&&(<>
            <div className="dl-icon ani d1" style={{background:svc.accentBg,border:`1px solid ${svc.accentBdr}`,color:svc.accent}}><FileText size={24}/></div>
            <div className="dl-svc-tag ani d1" style={{background:svc.accentBg,color:svc.accent,border:`1px solid ${svc.accentBdr}`}}>{svc.label}</div>
            <h1 className="dl-h1 ani d2">Your report is <em style={{fontStyle:"italic",fontWeight:300}}>ready</em></h1>
            <p className="dl-sub ani d3">Your {svc.label.toLowerCase()} has been prepared and is available to download.</p>

            {/* Meta */}
            <div className="dl-meta ani d3">
              <div className="dl-meta-grid">
                {params.ref&&<div className="dl-meta-item"><div className="dl-ml">Reference</div><div className="dl-mv" style={{fontFamily:"var(--mono)",fontSize:13}}>{params.ref}</div></div>}
                {params.addr&&<div className="dl-meta-item" style={{flex:1}}><div className="dl-ml">Property</div><div className="dl-mv">{params.addr}</div></div>}
              </div>

              {/* Expiry progress bar */}
              {expiry.left!==null&&(
                <div className="dl-exp-wrap">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontFamily:"var(--mono)",letterSpacing:"0.03em",color:expiry.left<=2?"var(--amber)":"var(--muted)"}}>
                      <Clock size={11}/>
                      {expiry.left===0?"Expires today":expiry.left===1?"Expires tomorrow":`Expires in ${expiry.left} days`}
                    </div>
                    <span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--muted)",opacity:0.5}}>{expiry.date}</span>
                  </div>
                  <div className="dl-exp-bar-bg">
                    <div className="dl-exp-bar" style={{width:`${expiry.pct}%`,background:expiry.pct>30?svc.accent:expiry.pct>10?"var(--amber)":"var(--red)"}}/>
                  </div>
                </div>
              )}
            </div>

            {/* Download */}
            {downloaded?(
              <a href={params.file} target="_blank" rel="noopener noreferrer" className="dl-btn done ani d4">
                <CheckCircle2 size={16}/> Downloaded — tap to re-download
              </a>
            ):(
              <a
                href={params.file} target="_blank" rel="noopener noreferrer"
                className={`dl-btn primary ani d4${!hover?" pulse":""}`}
                onClick={()=>setDownloaded(true)}
                onMouseEnter={()=>setHover(true)}
                onMouseLeave={()=>setHover(false)}
              >
                <ArrowDownToLine size={16}/> Download report
              </a>
            )}
            <div className="dl-trust ani d5"><Shield size={11}/> Secure link · Time-limited access</div>
          </>)}
        </div>
      </div>

      {/* Powered by */}
      <Link to="/" className="dl-powered" style={{textDecoration:"none"}}>
        <span style={{fontFamily:"var(--font)",fontSize:14,fontWeight:400,color:"var(--fg-l)"}}>Orvello</span>
        <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
      </Link>
    </div>
  );
}
