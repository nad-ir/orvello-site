import { useState, useEffect, useRef, useMemo } from "react";
import { Download, FileCheck, AlertCircle, ExternalLink, Shield, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const SERVICE_LABELS = {
  pas2035: "PAS2035 Retrofit Assessment",
  fire: "Fire Risk Assessment",
  cdm: "CDM Documentation",
  report: "Consultancy Report",
};

function GrainOverlay() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 14; }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5, mixBlendMode: "overlay", zIndex: 1 }} />;
}

function parseParams() {
  const search = window.location.search;
  if (!search || search.length < 2) return null;
  const result = { file: null, ref: null, addr: null, exp: 14, created: null, service: "report" };
  let remaining = search.slice(1);

  const extractParam = (str, param) => {
    const idx = str.indexOf(`&${param}=`);
    if (idx === -1) return [str, null];
    const before = str.slice(0, idx);
    const after = str.slice(idx + param.length + 2);
    const nextParams = ["&file=", "&ref=", "&addr=", "&exp=", "&created=", "&service="];
    let endIdx = after.length;
    for (const np of nextParams) { const ni = after.indexOf(np); if (ni !== -1 && ni < endIdx) endIdx = ni; }
    return [before + after.slice(endIdx), after.slice(0, endIdx)];
  };

  [remaining, result.service] = extractParam(remaining, "service");
  [remaining, result.created] = extractParam(remaining, "created");
  [remaining, result.exp] = extractParam(remaining, "exp");
  [remaining, result.addr] = extractParam(remaining, "addr");
  [remaining, result.ref] = extractParam(remaining, "ref");
  if (remaining.startsWith("file=")) result.file = remaining.slice(5);

  try {
    if (result.file) result.file = decodeURIComponent(result.file);
    if (result.ref) result.ref = decodeURIComponent(result.ref);
    if (result.addr) result.addr = decodeURIComponent(result.addr);
    if (result.service) result.service = decodeURIComponent(result.service);
    if (result.exp) result.exp = parseInt(result.exp, 10) || 14;
    if (result.created) result.created = decodeURIComponent(result.created);
  } catch { return null; }

  if (!result.file || !result.file.startsWith("http")) return null;
  return result;
}

function getExpiryState(created, expDays) {
  if (!created) return { expired: false, daysLeft: null, expiryDate: null };
  const d = new Date(created);
  if (isNaN(d.getTime())) return { expired: false, daysLeft: null, expiryDate: null };
  const exp = new Date(d.getTime() + expDays * 86400000);
  const ms = exp.getTime() - Date.now();
  return {
    expired: ms <= 0,
    daysLeft: Math.max(0, Math.ceil(ms / 86400000)),
    expiryDate: exp.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export default function DeliveryPage() {
  const [downloaded, setDownloaded] = useState(false);
  const params = useMemo(() => parseParams(), []);
  const expiry = useMemo(() => params ? getExpiryState(params.created, params.exp) : { expired: false, daysLeft: null, expiryDate: null }, [params]);

  const noParams = !params;
  const isExpired = expiry.expired;
  const isValid = !noParams && !isExpired;
  const serviceLabel = params ? (SERVICE_LABELS[params.service] || SERVICE_LABELS.report) : "";

  return (
    <div className="dl-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased}
        :root{--bg:#272420;--bg-light:#F7F6F3;--bg-off:#EDECE8;--fg:#1A1A18;--fg-light:#F0EEE8;--muted:#8A8A80;--accent:#E4D048;--border:#DDDBD5;--green:#5A7A5F;--green-bg:rgba(90,122,95,0.08);--green-border:rgba(90,122,95,0.15);--red:#9B4444;--red-bg:rgba(155,68,68,0.06);--red-border:rgba(155,68,68,0.12);--amber:#8B7A2E;--amber-bg:rgba(228,208,72,0.06);--amber-border:rgba(228,208,72,0.15);--font-display:'Bricolage Grotesque',sans-serif;--font-body:'Bricolage Grotesque',sans-serif;--font-mono:'IBM Plex Mono',monospace}
        .dl-root{font-family:var(--font-body);background:var(--bg);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;position:relative;overflow:hidden}
        .mono{font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:400}
        .card{position:relative;z-index:2;background:var(--bg-light);border-radius:20px;padding:clamp(36px,6vw,56px);max-width:480px;width:100%;box-shadow:0 4px 60px rgba(0,0,0,0.25),0 1px 3px rgba(0,0,0,0.1)}
        .icon-wrap{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:24px}
        .icon-wrap.success{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
        .icon-wrap.expired{background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-border)}
        .icon-wrap.error{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}
        .card h1{font-family:var(--font-display);font-size:clamp(22px,4vw,28px);font-weight:400;letter-spacing:-0.02em;color:var(--fg);margin-bottom:10px;line-height:1.2}
        .card .sub{font-size:14px;line-height:1.7;color:var(--muted);font-weight:300;margin-bottom:28px}
        .meta-row{display:flex;gap:24px;flex-wrap:wrap;padding:16px 0;border-top:1px solid var(--border);margin-bottom:4px}
        .meta-label{font-size:10px;color:var(--muted);margin-bottom:4px;font-family:var(--font-mono);letter-spacing:0.08em;text-transform:uppercase}
        .meta-value{font-size:13px;color:var(--fg);font-weight:400;line-height:1.4}
        .dl-btn{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;padding:18px 28px;margin-top:24px;background:var(--accent);color:var(--bg);border:none;border-radius:10px;font-family:var(--font-mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);text-decoration:none}
        .dl-btn:hover{filter:brightness(1.06);transform:translateY(-2px);box-shadow:0 12px 32px rgba(228,208,72,0.2)}
        .dl-btn.done{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
        .dl-btn.done:hover{filter:none;transform:none;box-shadow:none}
        .dl-btn.contact{background:transparent;color:var(--fg);border:1px solid var(--border)}
        .dl-btn.contact:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-1px)}
        .trust-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;font-size:10px;color:var(--muted);font-family:var(--font-mono);letter-spacing:0.04em;text-transform:uppercase}
        .sep{width:100%;height:1px;background:var(--border);margin:24px 0}
        .footer-mark{position:relative;z-index:2;margin-top:28px;display:flex;align-items:baseline;text-decoration:none;gap:3px;transition:opacity 0.2s;opacity:0.25}
        .footer-mark:hover{opacity:0.45}
        .glow{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
        .g1{width:40%;height:40%;top:15%;left:25%;background:radial-gradient(circle,rgba(228,208,72,0.06) 0%,transparent 60%);animation:drift 16s ease-in-out infinite alternate}
        .g2{width:30%;height:30%;bottom:20%;right:20%;background:radial-gradient(circle,rgba(228,208,72,0.04) 0%,transparent 60%);animation:drift 20s ease-in-out infinite alternate-reverse}
        @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(15px,-10px) scale(1.03)}100%{transform:translate(-10px,8px) scale(0.98)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .ani{animation:fadeUp 0.65s cubic-bezier(.22,1,.36,1) forwards}
        .d1{animation-delay:0.06s;opacity:0}.d2{animation-delay:0.12s;opacity:0}.d3{animation-delay:0.18s;opacity:0}.d4{animation-delay:0.26s;opacity:0}.d5{animation-delay:0.34s;opacity:0}
      `}</style>

      <GrainOverlay />
      <div className="glow g1" /><div className="glow g2" />

      <div className="card ani">
        {noParams && (
          <>
            <div className="icon-wrap error ani d1"><AlertCircle size={28} /></div>
            <h1 className="ani d2">Link unavailable</h1>
            <p className="sub ani d3">This download link is missing or invalid. Please contact us and we'll reissue your document.</p>
            <a href="mailto:hello@orvello.co.uk" className="dl-btn contact ani d4">Contact us</a>
            <div className="trust-row ani d5"><span>hello@orvello.co.uk</span></div>
          </>
        )}

        {!noParams && isExpired && (
          <>
            <div className="icon-wrap expired ani d1"><Clock size={28} /></div>
            <h1 className="ani d2">Link expired</h1>
            <p className="sub ani d3">This download link expired on {expiry.expiryDate}. Contact us for a new link.</p>
            {params.ref && (
              <div className="meta-row ani d3">
                <div><div className="meta-label">Reference</div><div className="meta-value" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{params.ref}</div></div>
                <div><div className="meta-label">Service</div><div className="meta-value">{serviceLabel}</div></div>
              </div>
            )}
            <a href="mailto:hello@orvello.co.uk" className="dl-btn contact ani d4">Request new link</a>
            <div className="trust-row ani d5"><span>hello@orvello.co.uk</span></div>
          </>
        )}

        {isValid && (
          <>
            <div className="icon-wrap success ani d1"><FileText size={28} /></div>
            <h1 className="ani d2">Your report is ready</h1>
            <p className="sub ani d3">Your {serviceLabel.toLowerCase()} has been prepared and is ready to download.</p>

            <div className="ani d3">
              <div className="meta-row" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                {params.ref && <div><div className="meta-label">Reference</div><div className="meta-value" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{params.ref}</div></div>}
                <div><div className="meta-label">Service</div><div className="meta-value">{serviceLabel}</div></div>
                {params.addr && <div style={{ flex: 1 }}><div className="meta-label">Property</div><div className="meta-value">{params.addr}</div></div>}
              </div>
              {expiry.daysLeft !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 11, color: expiry.daysLeft <= 2 ? "var(--amber)" : "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                  <Clock size={12} />
                  {expiry.daysLeft === 0 ? "Expires today" : expiry.daysLeft === 1 ? "Expires tomorrow" : `Expires in ${expiry.daysLeft} days`}
                </div>
              )}
            </div>

            {downloaded ? (
              <a href={params.file} target="_blank" rel="noopener noreferrer" className="dl-btn done ani d4" onClick={() => setDownloaded(true)}>
                <FileCheck size={16} /> Downloaded — tap to re-download
              </a>
            ) : (
              <a href={params.file} target="_blank" rel="noopener noreferrer" className="dl-btn ani d4" onClick={() => setDownloaded(true)}>
                <Download size={16} /> Download report
              </a>
            )}
            <div className="trust-row ani d5"><Shield size={11} /> <span>Secure link · Time-limited</span></div>
          </>
        )}
      </div>

      <Link to="/" className="footer-mark">
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 400, color: "var(--fg-light)" }}>Orvello</span>
        <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
      </Link>
    </div>
  );
}
