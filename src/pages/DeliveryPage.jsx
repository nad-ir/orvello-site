import { useState, useEffect, useRef, useMemo } from "react";
import { Download, FileCheck, AlertCircle, ExternalLink, Shield, Clock, FileText, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { parseDeliveryUrl } from "../urlCodec";

const SVC_LABELS={pas2035:"PAS2035 Retrofit Assessment",fire:"Fire Risk Assessment",cdm:"CDM Documentation",report:"Consultancy Report"};

function Grain(){const ref=useRef(null);useEffect(()=>{const c=ref.current;if(!c)return;c.width=512;c.height=512;const ctx=c.getContext("2d");const img=ctx.createImageData(512,512);for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=v;img.data[i+1]=v;img.data[i+2]=v;img.data[i+3]=14;}ctx.putImageData(img,0,0)},[]);return<canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.4,mixBlendMode:"overlay",zIndex:1}}/>}

function getExpiry(created,days){
  if(!created)return{expired:false,left:null,date:null};
  const d=new Date(created);if(isNaN(d.getTime()))return{expired:false,left:null,date:null};
  const exp=new Date(d.getTime()+days*864e5),ms=exp.getTime()-Date.now();
  return{expired:ms<=0,left:Math.max(0,Math.ceil(ms/864e5)),date:exp.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})};
}

export default function DeliveryPage(){
  const[downloaded,setDownloaded]=useState(false);
  const params=useMemo(()=>parseDeliveryUrl(),[]);
  const expiry=useMemo(()=>params?getExpiry(params.created,params.exp):{expired:false,left:null,date:null},[params]);
  const noParams=!params;
  const isExpired=expiry.expired;
  const isValid=!noParams&&!isExpired;
  const label=params?(SVC_LABELS[params.service]||SVC_LABELS.report):"";

  return(
    <div className="dl-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased}
        :root{--bg:#181613;--surface:#F7F6F3;--fg:#1A1A18;--fg-l:#F0EEE8;--muted:#8A8A80;--accent:#E4D048;--border:#DDDBD5;--green:#5A7A5F;--green-bg:rgba(90,122,95,0.06);--green-bdr:rgba(90,122,95,0.15);--amber:#8B7A2E;--amber-bg:rgba(228,208,72,0.06);--amber-bdr:rgba(228,208,72,0.15);--red:#9B4444;--red-bg:rgba(155,68,68,0.05);--red-bdr:rgba(155,68,68,0.12);--font:'Bricolage Grotesque',sans-serif;--mono:'IBM Plex Mono',monospace}
        .dl-root{font-family:var(--font);background:var(--bg);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;position:relative;overflow:hidden}
        .mono{font-family:var(--mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;font-weight:400}

        .dl-card{position:relative;z-index:2;background:var(--surface);border-radius:24px;padding:clamp(40px,6vw,60px);max-width:480px;width:100%;box-shadow:0 8px 60px rgba(0,0,0,0.3),0 1px 3px rgba(0,0,0,0.1)}

        .dl-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:24px}
        .dl-icon.ok{background:var(--green-bg);color:var(--green);border:1px solid var(--green-bdr)}
        .dl-icon.exp{background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-bdr)}
        .dl-icon.err{background:var(--red-bg);color:var(--red);border:1px solid var(--red-bdr)}

        .dl-h1{font-family:var(--font);font-size:clamp(22px,4vw,28px);font-weight:400;letter-spacing:-0.02em;color:var(--fg);margin-bottom:8px;line-height:1.2}
        .dl-sub{font-size:14px;line-height:1.7;color:var(--muted);font-weight:300;margin-bottom:28px}

        .dl-meta{display:flex;gap:24px;flex-wrap:wrap;padding:16px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:20px}
        .dl-meta-label{font-size:9px;color:var(--muted);font-family:var(--mono);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px}
        .dl-meta-value{font-size:13px;color:var(--fg);font-weight:400;line-height:1.4}

        .dl-expiry{display:flex;align-items:center;gap:8px;padding:10px 0;font-size:11px;font-family:var(--mono);letter-spacing:0.03em;margin-bottom:4px}

        .dl-btn{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;padding:18px;margin-top:20px;border:none;border-radius:14px;font-family:var(--mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);text-decoration:none}
        .dl-btn.primary{background:var(--accent);color:var(--bg)}
        .dl-btn.primary:hover{filter:brightness(1.06);transform:translateY(-2px);box-shadow:0 12px 32px rgba(228,208,72,0.18)}
        .dl-btn.done{background:var(--green-bg);color:var(--green);border:1px solid var(--green-bdr)}
        .dl-btn.done:hover{filter:none;transform:none;box-shadow:none}
        .dl-btn.outline{background:transparent;color:var(--fg);border:1px solid var(--border)}
        .dl-btn.outline:hover{border-color:var(--muted);transform:translateY(-1px)}

        .dl-trust{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;font-size:10px;color:var(--muted);font-family:var(--mono);letter-spacing:0.04em;text-transform:uppercase}

        .dl-footer{position:relative;z-index:2;margin-top:32px;display:flex;align-items:baseline;text-decoration:none;gap:3px;opacity:0.2;transition:opacity 0.2s}
        .dl-footer:hover{opacity:0.4}

        /* Ambient glow */
        .dl-glow{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}

        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .ani{animation:fadeUp 0.65s cubic-bezier(.22,1,.36,1) forwards}
        .d1{animation-delay:0.05s;opacity:0}.d2{animation-delay:0.1s;opacity:0}.d3{animation-delay:0.16s;opacity:0}.d4{animation-delay:0.24s;opacity:0}.d5{animation-delay:0.32s;opacity:0}
        @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.04)}100%{transform:translate(-15px,10px) scale(0.97)}}
      `}</style>

      <Grain/>
      <div className="dl-glow" style={{width:"40vw",height:"40vw",top:"10%",left:"20%",background:"radial-gradient(circle, rgba(228,208,72,0.06) 0%, transparent 60%)",animation:"drift 18s ease-in-out infinite alternate"}}/>
      <div className="dl-glow" style={{width:"30vw",height:"30vw",bottom:"15%",right:"15%",background:"radial-gradient(circle, rgba(228,208,72,0.04) 0%, transparent 60%)",animation:"drift 22s ease-in-out infinite alternate-reverse"}}/>

      <div className="dl-card ani">

        {/* ERROR */}
        {noParams&&(<>
          <div className="dl-icon err ani d1"><AlertCircle size={26}/></div>
          <h1 className="dl-h1 ani d2">Link unavailable</h1>
          <p className="dl-sub ani d3">This download link is missing or invalid. Please get in touch and we'll reissue your document.</p>
          <a href="mailto:hello@orvello.co.uk" className="dl-btn outline ani d4"><Mail size={15}/> Contact us</a>
          <div className="dl-trust ani d5">hello@orvello.co.uk</div>
        </>)}

        {/* EXPIRED */}
        {!noParams&&isExpired&&(<>
          <div className="dl-icon exp ani d1"><Clock size={26}/></div>
          <h1 className="dl-h1 ani d2">Link expired</h1>
          <p className="dl-sub ani d3">This download link expired on {expiry.date}. Contact us and we'll send a new one.</p>
          {params.ref&&(
            <div className="dl-meta ani d3">
              <div><div className="dl-meta-label">Reference</div><div className="dl-meta-value" style={{fontFamily:"var(--mono)"}}>{params.ref}</div></div>
              <div><div className="dl-meta-label">Service</div><div className="dl-meta-value">{label}</div></div>
            </div>
          )}
          <a href="mailto:hello@orvello.co.uk" className="dl-btn outline ani d4"><Mail size={15}/> Request new link</a>
          <div className="dl-trust ani d5">hello@orvello.co.uk</div>
        </>)}

        {/* VALID */}
        {isValid&&(<>
          <div className="dl-icon ok ani d1"><FileText size={26}/></div>
          <h1 className="dl-h1 ani d2">Your report is ready</h1>
          <p className="dl-sub ani d3">Your {label.toLowerCase()} has been prepared and is ready to download.</p>

          <div className="ani d3">
            <div className="dl-meta">
              {params.ref&&<div><div className="dl-meta-label">Reference</div><div className="dl-meta-value" style={{fontFamily:"var(--mono)"}}>{params.ref}</div></div>}
              <div><div className="dl-meta-label">Service</div><div className="dl-meta-value">{label}</div></div>
              {params.addr&&<div style={{flex:1}}><div className="dl-meta-label">Property</div><div className="dl-meta-value">{params.addr}</div></div>}
            </div>
            {expiry.left!==null&&(
              <div className="dl-expiry" style={{color:expiry.left<=2?"var(--amber)":"var(--muted)"}}>
                <Clock size={12}/>
                {expiry.left===0?"Expires today":expiry.left===1?"Expires tomorrow":`Expires in ${expiry.left} days`}
              </div>
            )}
          </div>

          {downloaded?(
            <a href={params.file} target="_blank" rel="noopener noreferrer" className="dl-btn done ani d4" onClick={()=>setDownloaded(true)}><FileCheck size={16}/> Downloaded — tap to re-download</a>
          ):(
            <a href={params.file} target="_blank" rel="noopener noreferrer" className="dl-btn primary ani d4" onClick={()=>setDownloaded(true)}><Download size={16}/> Download report</a>
          )}
          <div className="dl-trust ani d5"><Shield size={11}/> Secure link · Time-limited</div>
        </>)}
      </div>

      <Link to="/" className="dl-footer">
        <span style={{fontFamily:"var(--font)",fontSize:15,fontWeight:400,color:"var(--fg-l)"}}>Orvello</span>
        <span style={{width:3,height:3,background:"var(--accent)",display:"inline-block",borderRadius:1}}/>
      </Link>
    </div>
  );
}
