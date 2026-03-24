import { useState, useEffect, useRef } from "react";
import { Copy, Check, Eye, EyeOff, ExternalLink, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { buildEpcUrl } from "../urlCodec";

const SITE_BASE = "https://orvello.co.uk";

function Grain(){const ref=useRef(null);useEffect(()=>{const c=ref.current;if(!c)return;c.width=256;c.height=256;const ctx=c.getContext("2d");const img=ctx.createImageData(256,256);for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=v;img.data[i+1]=v;img.data[i+2]=v;img.data[i+3]=10;}ctx.putImageData(img,0,0)},[]);return<canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.4,mixBlendMode:"overlay",zIndex:0}}/>}

const RC={A:"#1B8A3A",B:"#2D8E3B",C:"#5A9E2E",D:"#C49A1A",E:"#C47A18",F:"#B85A1A",G:"#A83030"};

export default function EpcGeneratorPage(){
  const[rating,setRating]=useState("D");
  const[heating,setHeating]=useState("gas");
  const[insulation,setInsulation]=useState("average");
  const[bedrooms,setBedrooms]=useState(3);
  const[ref,setRef]=useState("");
  const[addr,setAddr]=useState("");
  const[url,setUrl]=useState("");
  const[copied,setCopied]=useState(false);
  const[preview,setPreview]=useState(false);

  const generate=()=>{if(!ref.trim())return;setUrl(buildEpcUrl(SITE_BASE,{rating,heating,insulation,bedrooms,ref:ref.trim(),addr:addr.trim()}));setCopied(false)};
  const copy=async()=>{try{await navigator.clipboard.writeText(url)}catch{const t=document.createElement("textarea");t.value=url;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t)}setCopied(true);setTimeout(()=>setCopied(false),2500)};
  const reset=()=>{setRating("D");setHeating("gas");setInsulation("average");setBedrooms(3);setRef("");setAddr("");setUrl("");setCopied(false);setPreview(false)};

  return(
    <div className="g-root">
      <style>{S}</style>
      <Grain/>

      {/* Header */}
      <header className="g-header">
        <Link to="/" className="g-logo"><span className="g-logo-text">Orvello</span><span className="g-dot"/></Link>
        <div className="g-header-right">
          <Link to="/generate" className="g-switch">Consultancy</Link>
          <span className="g-badge">EPC Generator</span>
        </div>
      </header>

      <main className="g-main">
        {/* Title area */}
        <div className="g-title-area">
          <div className="g-icon-wrap epc"><Zap size={20}/></div>
          <div>
            <h1 className="g-h1">Generate EPC link</h1>
            <p className="g-sub">Create a branded EPC experience for your client. Address and reference are encoded for privacy.</p>
          </div>
        </div>

        <div className="g-card">
          {/* Rating */}
          <div className="g-field">
            <label className="g-label">EPC Rating</label>
            <div className="g-pills">
              {"ABCDEFG".split("").map(r=>(
                <button key={r} className={`g-pill${rating===r?" active":""}`} onClick={()=>setRating(r)} style={rating===r?{background:RC[r],borderColor:RC[r],color:"white"}:{}}>{r}</button>
              ))}
            </div>
          </div>

          <div className="g-row">
            <div className="g-field">
              <label className="g-label">Heating type</label>
              <select className="g-input" value={heating} onChange={e=>setHeating(e.target.value)}>
                <option value="gas">Gas boiler</option>
                <option value="electric">Electric heating</option>
                <option value="oil">Oil boiler</option>
                <option value="lpg">LPG boiler</option>
                <option value="heatpump">Heat pump</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="g-field">
              <label className="g-label">Insulation</label>
              <select className="g-input" value={insulation} onChange={e=>setInsulation(e.target.value)}>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="g-field" style={{maxWidth:120}}>
              <label className="g-label">Bedrooms</label>
              <input className="g-input" type="number" min={1} max={8} value={bedrooms} onChange={e=>setBedrooms(parseInt(e.target.value)||3)}/>
            </div>
          </div>

          <div className="g-divider"/>

          <div className="g-field">
            <label className="g-label">Reference <span className="g-req">*</span></label>
            <input className="g-input" type="text" placeholder="EPC-2026-0041" value={ref} onChange={e=>setRef(e.target.value)}/>
          </div>
          <div className="g-field">
            <label className="g-label">Property address</label>
            <input className="g-input" type="text" placeholder="12 High Street, Northampton, NN1 2AB" value={addr} onChange={e=>setAddr(e.target.value)}/>
            <span className="g-hint"><Lock size={10}/> Encoded in the URL — not visible as plain text</span>
          </div>

          <button className="g-generate" onClick={generate} disabled={!ref.trim()}>Generate link</button>
        </div>

        {/* Output */}
        {url&&(
          <div className="g-output-card">
            <div className="g-output-header">
              <span className="g-label" style={{margin:0}}>Client link</span>
              <div className="g-tag green"><Lock size={9}/> Encoded</div>
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
                <div className="g-preview-inner">
                  <div className="g-preview-badge" style={{background:`${RC[rating]}12`,borderColor:`${RC[rating]}30`,color:RC[rating]}}>{rating}</div>
                  <div>
                    <div style={{fontSize:16,fontWeight:400,color:"var(--fg)"}}>{addr||"Property address"}</div>
                    <div style={{fontSize:11,color:"var(--dim)",fontFamily:"var(--mono)",marginTop:4}}>Rating {rating} · {ref}</div>
                  </div>
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
:root{--bg:#181613;--surface:#1F1C19;--surface2:#262320;--fg:#F0EEE8;--dim:rgba(240,238,232,0.35);--dimmer:rgba(240,238,232,0.18);--accent:#E4D048;--green:#6EBF7B;--border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);--focus:rgba(228,208,72,0.25);--font:'Bricolage Grotesque',sans-serif;--mono:'IBM Plex Mono',monospace}
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
.g-icon-wrap.epc{background:rgba(228,208,72,0.1);border:1px solid rgba(228,208,72,0.18);color:var(--accent)}
.g-icon-wrap.delivery{background:rgba(90,122,95,0.1);border:1px solid rgba(90,122,95,0.18);color:#6EBF7B}
.g-h1{font-family:var(--font);font-size:22px;font-weight:400;letter-spacing:-0.02em;margin-bottom:4px}
.g-sub{font-size:13px;color:var(--dim);font-weight:300;line-height:1.5}

.g-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:clamp(24px,4vw,36px)}
.g-field{margin-bottom:22px}
.g-label{display:block;font-family:var(--mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;font-weight:400}
.g-req{color:var(--accent)}
.g-hint{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dimmer);margin-top:8px;font-weight:300}
.g-input{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 16px;color:var(--fg);font-size:14px;font-family:var(--font);font-weight:300;outline:none;transition:border-color 0.25s;appearance:none}
.g-input::placeholder{color:var(--dimmer)}
.g-input:focus{border-color:var(--focus)}
select.g-input{cursor:pointer}
.g-row{display:flex;gap:16px}
.g-row>.g-field{flex:1}
.g-divider{height:1px;background:var(--border);margin:4px 0 22px}

.g-pills{display:flex;gap:6px}
.g-pill{flex:1;padding:12px 0;text-align:center;background:transparent;color:var(--dim);border:1px solid var(--border);font-family:var(--mono);font-size:15px;font-weight:400;cursor:pointer;transition:all 0.25s;border-radius:10px;letter-spacing:0.02em}
.g-pill:hover{border-color:var(--border2);color:var(--fg)}
.g-pill.active{font-weight:600}

.g-generate{width:100%;padding:16px;background:var(--accent);color:var(--bg);border:none;border-radius:12px;font-family:var(--mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);margin-top:4px}
.g-generate:hover{filter:brightness(1.06);transform:translateY(-1px);box-shadow:0 8px 24px rgba(228,208,72,0.15)}
.g-generate:disabled{opacity:0.35;cursor:not-allowed;filter:none;transform:none;box-shadow:none}

.g-output-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:clamp(24px,4vw,32px);margin-top:20px}
.g-output-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.g-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-family:var(--mono);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;font-weight:500}
.g-tag.green{background:rgba(110,191,123,0.1);color:var(--green);border:1px solid rgba(110,191,123,0.15)}

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
.g-preview-inner{display:flex;align-items:center;gap:16px;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:10px}
.g-preview-badge{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:28px;font-weight:500;border:2px solid;flex-shrink:0}

@media(max-width:600px){.g-row{flex-direction:column;gap:0}.g-pills{flex-wrap:wrap}.g-title-area{flex-direction:column;gap:12px}}
`;
