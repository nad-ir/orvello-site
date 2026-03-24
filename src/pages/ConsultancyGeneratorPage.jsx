import { useState, useEffect, useRef } from "react";
import { Copy, Check, Eye, EyeOff, ExternalLink, Shield, Clock, FileText, Lock, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { buildDeliveryUrl } from "../urlCodec";

const SITE_BASE = "https://orvello.co.uk";
const SVCS=[{v:"pas2035",l:"PAS2035 Retrofit Assessment",exp:14},{v:"fire",l:"Fire Risk Assessment",exp:14},{v:"cdm",l:"CDM Documentation",exp:30},{v:"report",l:"Consultancy Report",exp:14}];

function Grain(){const ref=useRef(null);useEffect(()=>{const c=ref.current;if(!c)return;c.width=256;c.height=256;const ctx=c.getContext("2d");const img=ctx.createImageData(256,256);for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=v;img.data[i+1]=v;img.data[i+2]=v;img.data[i+3]=10;}ctx.putImageData(img,0,0)},[]);return<canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.4,mixBlendMode:"overlay",zIndex:0}}/>}

export default function ConsultancyGeneratorPage(){
  const[file,setFile]=useState("");
  const[service,setService]=useState("pas2035");
  const[ref,setRef]=useState("");
  const[addr,setAddr]=useState("");
  const[exp,setExp]=useState(14);
  const[url,setUrl]=useState("");
  const[copied,setCopied]=useState(false);
  const[preview,setPreview]=useState(false);
  const[errors,setErrors]=useState({});

  const svc=SVCS.find(s=>s.v===service);
  const handleService=v=>{setService(v);const s=SVCS.find(x=>x.v===v);if(s)setExp(s.exp)};

  const validate=()=>{const e={};if(!file.trim()||!file.trim().startsWith("http"))e.file=true;if(!ref.trim())e.ref=true;setErrors(e);return!Object.keys(e).length};
  const generate=()=>{if(!validate())return;setUrl(buildDeliveryUrl(SITE_BASE,{file:file.trim(),ref:ref.trim(),addr:addr.trim(),exp,created:new Date().toISOString(),service}));setCopied(false)};
  const copy=async()=>{try{await navigator.clipboard.writeText(url)}catch{const t=document.createElement("textarea");t.value=url;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t)}setCopied(true);setTimeout(()=>setCopied(false),2500)};
  const reset=()=>{setFile("");setService("pas2035");setRef("");setAddr("");setExp(14);setUrl("");setCopied(false);setPreview(false);setErrors({})};

  const expDate=new Date(Date.now()+exp*864e5).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});

  return(
    <div className="g-root">
      <style>{S}</style>
      <Grain/>

      <header className="g-header">
        <Link to="/" className="g-logo"><span className="g-logo-text">Orvello</span><span className="g-dot"/></Link>
        <div className="g-header-right">
          <Link to="/epc-generate" className="g-switch">EPC</Link>
          <span className="g-badge">Consultancy</span>
        </div>
      </header>

      <main className="g-main">
        <div className="g-title-area">
          <div className="g-icon-wrap delivery"><FileText size={20}/></div>
          <div>
            <h1 className="g-h1">Generate delivery link</h1>
            <p className="g-sub">Create a secure, time-limited download link for consultancy deliverables.</p>
          </div>
        </div>

        <div className="g-card">
          <div className="g-field">
            <label className="g-label">Service type</label>
            <select className="g-input" value={service} onChange={e=>handleService(e.target.value)}>
              {SVCS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>

          <div className="g-field">
            <label className="g-label">Pre-signed URL <span className="g-req">*</span></label>
            <textarea className={`g-input${errors.file?" g-err":""}`} rows={3} placeholder="Paste your AWS S3 pre-signed URL here..." value={file} onChange={e=>{setFile(e.target.value);setErrors(p=>({...p,file:undefined}))}} style={{fontFamily:"var(--mono)",fontSize:11,resize:"vertical"}}/>
          </div>

          <div className="g-divider"/>

          <div className="g-row">
            <div className="g-field">
              <label className="g-label">Reference <span className="g-req">*</span></label>
              <input className={`g-input${errors.ref?" g-err":""}`} type="text" placeholder="FRA-2026-0012" value={ref} onChange={e=>{setRef(e.target.value);setErrors(p=>({...p,ref:undefined}))}}/>
            </div>
            <div className="g-field" style={{maxWidth:130}}>
              <label className="g-label">Expiry (days)</label>
              <input className="g-input" type="number" min={1} max={90} value={exp} onChange={e=>setExp(parseInt(e.target.value)||14)}/>
            </div>
          </div>

          <div className="g-field">
            <label className="g-label">Property / site address</label>
            <input className="g-input" type="text" placeholder="Site address or project name" value={addr} onChange={e=>setAddr(e.target.value)}/>
            <span className="g-hint"><Lock size={10}/> Encoded · Hidden after expiry for privacy</span>
          </div>

          <button className="g-generate" onClick={generate}>Generate delivery link</button>
        </div>

        {url&&(
          <div className="g-output-card">
            <div className="g-output-header">
              <span className="g-label" style={{margin:0}}>Client link</span>
              <div style={{display:"flex",gap:8}}>
                <div className="g-tag green"><Lock size={9}/> Encoded</div>
                <div className="g-tag amber"><Clock size={9}/> {expDate}</div>
              </div>
            </div>
            <div className="g-url-box">
              <code>{url}</code>
              <button className={`g-copy${copied?" done":""}`} onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>}</button>
            </div>
            <div className="g-actions">
              <button className="g-act outline" onClick={reset}>Reset</button>
              <button className="g-act accent" onClick={()=>setPreview(!preview)}>{preview?<><EyeOff size={12}/> Hide</>:<><Eye size={12}/> Preview</>}</button>
              <a href={url} target="_blank" rel="noopener noreferrer" className="g-act outline">Open <ExternalLink size={10}/></a>
            </div>

            {preview&&(
              <div className="g-preview">
                <span className="g-label" style={{margin:0,textAlign:"center",display:"block",marginBottom:16}}>Client preview</span>
                <div className="g-preview-card">
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(90,122,95,0.08)",border:"1px solid rgba(90,122,95,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#6EBF7B",marginBottom:16}}><FileText size={20}/></div>
                  <div style={{fontSize:17,fontWeight:400,color:"var(--fg)",marginBottom:4}}>Your report is ready</div>
                  <div style={{fontSize:12,color:"var(--dim)",marginBottom:16}}>{svc?.l}</div>
                  <div style={{display:"flex",gap:16,padding:"12px 0",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",marginBottom:16,flexWrap:"wrap"}}>
                    {ref&&<div><div style={{fontSize:9,color:"var(--dimmer)",fontFamily:"var(--mono)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Ref</div><div style={{fontSize:12,color:"var(--fg)",fontFamily:"var(--mono)",marginTop:2}}>{ref}</div></div>}
                    {addr&&<div><div style={{fontSize:9,color:"var(--dimmer)",fontFamily:"var(--mono)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Site</div><div style={{fontSize:12,color:"var(--fg)",marginTop:2}}>{addr}</div></div>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"var(--accent)",color:"var(--bg)",padding:"13px 0",borderRadius:10,fontFamily:"var(--mono)",fontSize:11,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase"}}><Download size={13}/> Download report</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const S=`
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased}
:root{--bg:#181613;--surface:#1F1C19;--surface2:#262320;--fg:#F0EEE8;--dim:rgba(240,238,232,0.35);--dimmer:rgba(240,238,232,0.18);--accent:#E4D048;--green:#6EBF7B;--amber:#E4D048;--border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);--focus:rgba(228,208,72,0.25);--font:'Bricolage Grotesque',sans-serif;--mono:'IBM Plex Mono',monospace}
.g-root{font-family:var(--font);background:var(--bg);min-height:100vh;color:var(--fg);position:relative}
.g-header{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(20px,4vw,40px);border-bottom:1px solid var(--border);position:relative;z-index:2}
.g-logo{display:flex;align-items:baseline;text-decoration:none;gap:3px}
.g-logo-text{font-family:var(--font);font-size:17px;font-weight:400;color:var(--fg)}
.g-dot{width:3px;height:3px;background:var(--accent);display:inline-block;border-radius:1px}
.g-header-right{display:flex;align-items:center;gap:14px}
.g-switch{font-family:var(--mono);font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--dim);text-decoration:none;padding:6px 14px;border:1px solid var(--border);border-radius:8px;transition:all 0.2s}
.g-switch:hover{border-color:var(--border2);color:var(--fg)}
.g-badge{font-family:var(--mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent)}
.g-main{max-width:580px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(16px,4vw,24px);position:relative;z-index:2}
.g-title-area{display:flex;gap:18px;align-items:flex-start;margin-bottom:32px}
.g-icon-wrap{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.g-icon-wrap.delivery{background:rgba(110,191,123,0.1);border:1px solid rgba(110,191,123,0.18);color:#6EBF7B}
.g-h1{font-family:var(--font);font-size:22px;font-weight:400;letter-spacing:-0.02em;margin-bottom:4px}
.g-sub{font-size:13px;color:var(--dim);font-weight:300;line-height:1.5}
.g-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:clamp(24px,4vw,36px)}
.g-field{margin-bottom:22px}
.g-label{display:block;font-family:var(--mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;font-weight:400}
.g-req{color:var(--accent)}
.g-hint{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dimmer);margin-top:8px;font-weight:300}
.g-input{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 16px;color:var(--fg);font-size:14px;font-family:var(--font);font-weight:300;outline:none;transition:border-color 0.25s;appearance:none;resize:none}
.g-input::placeholder{color:var(--dimmer)}
.g-input:focus{border-color:var(--focus)}
.g-input.g-err{border-color:rgba(239,68,68,0.4)}
select.g-input{cursor:pointer}
.g-row{display:flex;gap:16px}
.g-row>.g-field{flex:1}
.g-divider{height:1px;background:var(--border);margin:4px 0 22px}
.g-generate{width:100%;padding:16px;background:var(--accent);color:var(--bg);border:none;border-radius:12px;font-family:var(--mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);margin-top:4px}
.g-generate:hover{filter:brightness(1.06);transform:translateY(-1px);box-shadow:0 8px 24px rgba(228,208,72,0.15)}
.g-output-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:clamp(24px,4vw,32px);margin-top:20px}
.g-output-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px}
.g-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-family:var(--mono);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;font-weight:500}
.g-tag.green{background:rgba(110,191,123,0.1);color:var(--green);border:1px solid rgba(110,191,123,0.15)}
.g-tag.amber{background:rgba(228,208,72,0.08);color:var(--accent);border:1px solid rgba(228,208,72,0.15)}
.g-url-box{position:relative;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 52px 14px 16px}
.g-url-box code{font-family:var(--mono);font-size:11px;color:var(--dim);word-break:break-all;line-height:1.6;display:block;max-height:80px;overflow-y:auto}
.g-copy{position:absolute;top:10px;right:10px;background:rgba(228,208,72,0.08);border:1px solid rgba(228,208,72,0.15);border-radius:8px;padding:8px;cursor:pointer;color:var(--accent);transition:all 0.2s;display:flex}
.g-copy:hover{background:rgba(228,208,72,0.15)}
.g-copy.done{background:rgba(110,191,123,0.1);border-color:rgba(110,191,123,0.2);color:var(--green)}
.g-actions{display:flex;gap:10px;margin-top:16px}
.g-act{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;border-radius:10px;font-family:var(--mono);font-size:10px;font-weight:400;letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;text-decoration:none}
.g-act.outline{background:transparent;color:var(--dim);border:1px solid var(--border)}
.g-act.outline:hover{border-color:var(--border2);color:var(--fg)}
.g-act.accent{background:rgba(228,208,72,0.08);color:var(--accent);border:1px solid rgba(228,208,72,0.15)}
.g-act.accent:hover{background:rgba(228,208,72,0.14)}
.g-preview{margin-top:20px;padding:24px;background:var(--bg);border:1px solid var(--border);border-radius:12px}
.g-preview-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;text-align:center}
@media(max-width:600px){.g-row{flex-direction:column;gap:0}.g-title-area{flex-direction:column;gap:12px}}
`;
