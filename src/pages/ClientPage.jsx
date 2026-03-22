import { useState, useEffect, useRef, useMemo } from "react";
import { Download, FileCheck, AlertCircle, ExternalLink, Shield, Clock, Copy, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

function GrainOverlay() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 14;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5, mixBlendMode: "overlay", zIndex: 1 }} />;
}

function parseParams() {
  const search = window.location.search;
  if (!search || search.length < 2) return null;

  // Parse params manually to preserve encoded file URL
  const result = { file: null, ref: null, addr: null, exp: 7, created: null };

  // Split on known param boundaries: &ref=, &addr=, &exp=, &created=
  // This avoids URLSearchParams splitting the S3 URL's & characters
  let remaining = search.slice(1); // remove leading ?

  const extractParam = (str, param) => {
    const idx = str.indexOf(`&${param}=`);
    if (idx === -1) return [str, null];
    const before = str.slice(0, idx);
    const after = str.slice(idx + param.length + 2);
    // Find next known param
    const nextParams = ["&file=", "&ref=", "&addr=", "&exp=", "&created="];
    let endIdx = after.length;
    for (const np of nextParams) {
      const ni = after.indexOf(np);
      if (ni !== -1 && ni < endIdx) endIdx = ni;
    }
    return [before + after.slice(endIdx), after.slice(0, endIdx)];
  };

  // Extract non-file params first (they're simple values)
  [remaining, result.created] = extractParam(remaining, "created");
  [remaining, result.exp] = extractParam(remaining, "exp");
  [remaining, result.addr] = extractParam(remaining, "addr");
  [remaining, result.ref] = extractParam(remaining, "ref");

  // What's left should be file=VALUE
  if (remaining.startsWith("file=")) {
    result.file = remaining.slice(5);
  }

  // Decode values
  try {
    if (result.file) result.file = decodeURIComponent(result.file);
    if (result.ref) result.ref = decodeURIComponent(result.ref);
    if (result.addr) result.addr = decodeURIComponent(result.addr);
    if (result.exp) result.exp = parseInt(result.exp, 10) || 7;
    if (result.created) result.created = decodeURIComponent(result.created);
  } catch {
    return null;
  }

  if (!result.file || !result.file.startsWith("http")) return null;
  return result;
}

function getExpiryState(created, expDays) {
  if (!created) return { expired: false, daysLeft: null, expiryDate: null };
  const createdDate = new Date(created);
  if (isNaN(createdDate.getTime())) return { expired: false, daysLeft: null, expiryDate: null };
  const expiryDate = new Date(createdDate.getTime() + expDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msLeft = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return {
    expired: msLeft <= 0,
    daysLeft: Math.max(0, daysLeft),
    expiryDate: expiryDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export default function ClientPage() {
  const [downloaded, setDownloaded] = useState(false);
  const params = useMemo(() => parseParams(), []);
  const expiry = useMemo(() => {
    if (!params) return { expired: false, daysLeft: null, expiryDate: null };
    return getExpiryState(params.created, params.exp);
  }, [params]);

  const noParams = !params;
  const isExpired = expiry.expired;
  const isValid = !noParams && !isExpired;

  return (
    <div className="client-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased}
        :root{
          --bg:#272420;--bg-light:#F7F6F3;--bg-off:#EDECE8;
          --fg:#1A1A18;--fg-light:#F0EEE8;
          --muted:#8A8A80;
          --accent:#E4D048;
          --border-light:#DDDBD5;
          --green:#5A7A5F;--green-bg:rgba(90,122,95,0.08);--green-border:rgba(90,122,95,0.15);
          --red:#9B4444;--red-bg:rgba(155,68,68,0.06);--red-border:rgba(155,68,68,0.12);
          --amber:#8B7A2E;--amber-bg:rgba(228,208,72,0.06);--amber-border:rgba(228,208,72,0.15);
          --font-display:'Bricolage Grotesque',sans-serif;
          --font-body:'Bricolage Grotesque',sans-serif;
          --font-mono:'IBM Plex Mono',monospace;
        }
        .client-root{
          font-family:var(--font-body);background:var(--bg);
          min-height:100vh;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:24px;position:relative;overflow:hidden;
        }
        .mono{font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:400}

        .card{
          position:relative;z-index:2;background:var(--bg-light);
          border-radius:20px;padding:clamp(36px,6vw,56px);
          max-width:480px;width:100%;
          box-shadow:0 4px 60px rgba(0,0,0,0.25),0 1px 3px rgba(0,0,0,0.1);
        }

        .icon-wrap{
          width:64px;height:64px;border-radius:16px;
          display:flex;align-items:center;justify-content:center;
          margin-bottom:24px;
        }
        .icon-wrap.success{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
        .icon-wrap.expired{background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-border)}
        .icon-wrap.error{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}

        .card h1{
          font-family:var(--font-display);font-size:clamp(22px,4vw,28px);
          font-weight:400;letter-spacing:-0.02em;color:var(--fg);
          margin-bottom:10px;line-height:1.2;
        }
        .card .subtitle{
          font-size:14px;line-height:1.7;color:var(--muted);
          font-weight:300;margin-bottom:28px;
        }

        .meta-row{
          display:flex;gap:24px;flex-wrap:wrap;
          padding:16px 0;border-top:1px solid var(--border-light);
          margin-bottom:4px;
        }
        .meta-item .meta-label{font-size:10px;color:var(--muted);margin-bottom:4px}
        .meta-item .meta-value{font-size:13px;color:var(--fg);font-weight:400;line-height:1.4}

        .download-btn{
          display:flex;align-items:center;justify-content:center;gap:12px;
          width:100%;padding:18px 28px;margin-top:24px;
          background:var(--accent);color:var(--bg);
          border:none;border-radius:10px;
          font-family:var(--font-mono);font-size:12px;font-weight:500;
          letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);
          text-decoration:none;
        }
        .download-btn:hover{
          filter:brightness(1.06);transform:translateY(-2px);
          box-shadow:0 12px 32px rgba(228,208,72,0.2);
        }
        .download-btn:active{transform:translateY(0)}
        .download-btn.done{
          background:var(--green-bg);color:var(--green);
          border:1px solid var(--green-border);
        }
        .download-btn.done:hover{filter:none;transform:none;box-shadow:none}
        .download-btn.contact{
          background:transparent;color:var(--fg);
          border:1px solid var(--border-light);
        }
        .download-btn.contact:hover{
          border-color:var(--accent);color:var(--accent);
          transform:translateY(-1px);filter:none;box-shadow:none;
        }

        .trust-row{
          display:flex;align-items:center;justify-content:center;gap:8px;
          margin-top:16px;font-size:10px;color:var(--muted);
          font-family:var(--font-mono);letter-spacing:0.04em;text-transform:uppercase;
        }

        .sep{width:100%;height:1px;background:var(--border-light);margin:24px 0}

        .note-box{
          border-radius:8px;padding:14px 18px;text-align:left;
        }
        .note-box.green{background:var(--green-bg);border:1px solid var(--green-border)}
        .note-box.amber{background:var(--amber-bg);border:1px solid var(--amber-border)}
        .note-box p{
          font-size:12px;line-height:1.65;color:var(--muted);font-weight:300;margin:0;
        }
        .note-box a{color:var(--green);text-decoration:none;font-weight:400;transition:opacity 0.2s}
        .note-box a:hover{opacity:0.7}

        .footer-mark{
          position:relative;z-index:2;margin-top:28px;
          display:flex;align-items:baseline;text-decoration:none;gap:3px;
          transition:opacity 0.2s;opacity:0.25;
        }
        .footer-mark:hover{opacity:0.45}

        .glow{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
        .glow-1{width:40%;height:40%;top:15%;left:25%;background:radial-gradient(circle,rgba(228,208,72,0.06) 0%,transparent 60%);animation:drift 16s ease-in-out infinite alternate}
        .glow-2{width:30%;height:30%;bottom:20%;right:20%;background:radial-gradient(circle,rgba(228,208,72,0.04) 0%,transparent 60%);animation:drift 20s ease-in-out infinite alternate-reverse}
        @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(15px,-10px) scale(1.03)}100%{transform:translate(-10px,8px) scale(0.98)}}

        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .ani{animation:fadeUp 0.65s cubic-bezier(.22,1,.36,1) forwards}
        .d1{animation-delay:0.06s;opacity:0}
        .d2{animation-delay:0.12s;opacity:0}
        .d3{animation-delay:0.18s;opacity:0}
        .d4{animation-delay:0.26s;opacity:0}
        .d5{animation-delay:0.34s;opacity:0}
        .d6{animation-delay:0.42s;opacity:0}
      `}</style>

      <GrainOverlay />
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      <div className="card ani">

        {/* ═══ NO PARAMS / BROKEN LINK ═══ */}
        {noParams && (
          <>
            <div className="icon-wrap error ani d1"><AlertCircle size={28} /></div>
            <h1 className="ani d2">Link unavailable</h1>
            <p className="subtitle ani d3">This download link is missing or invalid. If you believe this is an error, please get in touch and we'll reissue your certificate.</p>
            <a href="mailto:hello@orvello.co.uk" className="download-btn contact ani d4">Contact us</a>
            <div className="trust-row ani d5"><span>hello@orvello.co.uk</span></div>
          </>
        )}

        {/* ═══ EXPIRED ═══ */}
        {!noParams && isExpired && (
          <>
            <div className="icon-wrap expired ani d1"><Clock size={28} /></div>
            <h1 className="ani d2">Link expired</h1>
            <p className="subtitle ani d3">This download link expired on {expiry.expiryDate}. Please contact us and we'll send you a new one.</p>

            {params.ref && (
              <div className="meta-row ani d3">
                <div className="meta-item">
                  <div className="meta-label mono">Reference</div>
                  <div className="meta-value" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{params.ref}</div>
                </div>
              </div>
            )}

            <a href="mailto:hello@orvello.co.uk" className="download-btn contact ani d4">Request new link</a>
            <div className="trust-row ani d5"><span>hello@orvello.co.uk</span></div>
          </>
        )}

        {/* ═══ VALID — DOWNLOAD READY ═══ */}
        {isValid && (
          <>
            <div className="icon-wrap success ani d1"><FileCheck size={28} /></div>
            <h1 className="ani d2">Your EPC is ready</h1>
            <p className="subtitle ani d3">Your Energy Performance Certificate has been prepared and is ready to download.</p>

            {/* Meta info */}
            <div className="ani d3">
              <div className="meta-row" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 16 }}>
                {params.ref && (
                  <div className="meta-item">
                    <div className="meta-label mono">Reference</div>
                    <div className="meta-value" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{params.ref}</div>
                  </div>
                )}
                {params.addr && (
                  <div className="meta-item" style={{ flex: 1 }}>
                    <div className="meta-label mono">Property</div>
                    <div className="meta-value">{params.addr}</div>
                  </div>
                )}
              </div>
              {expiry.daysLeft !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 11, color: expiry.daysLeft <= 2 ? "var(--amber)" : "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                  <Clock size={12} />
                  {expiry.daysLeft === 0
                    ? "Expires today"
                    : expiry.daysLeft === 1
                    ? "Expires tomorrow"
                    : `Expires in ${expiry.daysLeft} days`}
                </div>
              )}
            </div>

            {/* Download button */}
            {downloaded ? (
              <a href={params.file} target="_blank" rel="noopener noreferrer" className="download-btn done ani d4" onClick={() => setDownloaded(true)}>
                <FileCheck size={16} /> Downloaded — tap to re-download
              </a>
            ) : (
              <a href={params.file} target="_blank" rel="noopener noreferrer" className="download-btn ani d4" onClick={() => setDownloaded(true)}>
                <Download size={16} /> Download certificate
              </a>
            )}

            <div className="trust-row ani d5">
              <Shield size={11} />
              <span>Secure link · PDF document</span>
            </div>

            <div className="sep ani d5" />

            <div className="note-box green ani d6">
              <p>Your certificate will typically be available on the <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer">GOV.UK EPC register <ExternalLink size={9} style={{ display: "inline", verticalAlign: "middle", marginLeft: 2 }} /></a> within 24 hours of lodgement.</p>
            </div>
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
