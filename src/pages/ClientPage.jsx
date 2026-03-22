import { useState, useEffect, useRef } from "react";
import { Download, FileCheck, AlertCircle, ExternalLink, Shield } from "lucide-react";
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

export default function ClientPage() {
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const file = params.get("file");
    if (file) {
      try {
        const decoded = decodeURIComponent(file);
        setFileUrl(decoded);
      } catch {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, []);

  const handleDownload = () => {
    if (fileUrl) {
      setDownloaded(true);
    }
  };

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
          --green:#5A7A5F;--green-bg:rgba(90,122,95,0.08);
          --red:#9B4444;--red-bg:rgba(155,68,68,0.06);
          --font-display:'Bricolage Grotesque',sans-serif;
          --font-body:'Bricolage Grotesque',sans-serif;
          --font-mono:'IBM Plex Mono',monospace;
        }
        .client-root{
          font-family:var(--font-body);
          background:var(--bg);
          min-height:100vh;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:24px;
          position:relative;overflow:hidden;
        }
        .mono-label{font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}

        .card{
          position:relative;z-index:2;
          background:var(--bg-light);
          border-radius:20px;
          padding:clamp(40px,6vw,64px);
          max-width:520px;width:100%;
          box-shadow:0 4px 60px rgba(0,0,0,0.25),0 1px 3px rgba(0,0,0,0.1);
          text-align:center;
        }

        .icon-circle{
          width:72px;height:72px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 28px;
        }
        .icon-circle.success{background:var(--green-bg);color:var(--green)}
        .icon-circle.error{background:var(--red-bg);color:var(--red)}

        .card h1{
          font-family:var(--font-display);
          font-size:clamp(24px,4vw,32px);
          font-weight:400;letter-spacing:-0.02em;
          color:var(--fg);margin-bottom:12px;line-height:1.15;
        }
        .card p{
          font-size:14px;line-height:1.7;color:var(--muted);
          font-weight:300;max-width:380px;margin:0 auto;
        }

        .download-btn{
          display:flex;align-items:center;justify-content:center;gap:12px;
          width:100%;padding:18px 28px;margin-top:32px;
          background:var(--accent);color:var(--bg);
          border:none;border-radius:10px;
          font-family:var(--font-mono);font-size:13px;font-weight:500;
          letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);
          text-decoration:none;
        }
        .download-btn:hover{
          filter:brightness(1.06);transform:translateY(-2px);
          box-shadow:0 12px 32px rgba(228,208,72,0.2);
        }
        .download-btn:active{transform:translateY(0)}

        .download-btn.downloaded{
          background:var(--green-bg);color:var(--green);
          border:1px solid rgba(90,122,95,0.2);
        }
        .download-btn.downloaded:hover{filter:none;transform:none;box-shadow:none}

        .download-btn:disabled{
          background:var(--bg-off);color:var(--muted);
          cursor:not-allowed;opacity:0.6;
        }
        .download-btn:disabled:hover{filter:none;transform:none;box-shadow:none}

        .info-row{
          display:flex;align-items:center;justify-content:center;gap:8px;
          margin-top:20px;font-size:11px;color:var(--muted);
          font-family:var(--font-mono);letter-spacing:0.03em;
        }

        .divider{
          width:100%;height:1px;background:var(--border-light);
          margin:28px 0;
        }

        .gov-note{
          background:rgba(90,122,95,0.04);
          border:1px solid rgba(90,122,95,0.1);
          border-radius:8px;padding:16px 20px;
          margin-top:24px;text-align:left;
        }
        .gov-note p{
          font-size:13px;line-height:1.65;color:var(--muted);
          font-weight:300;margin:0;max-width:none;
        }
        .gov-note a{
          color:var(--green);text-decoration:none;font-weight:400;
          transition:opacity 0.2s;
        }
        .gov-note a:hover{opacity:0.7}

        .footer-link{
          position:relative;z-index:2;
          margin-top:32px;display:flex;align-items:baseline;
          text-decoration:none;gap:3px;
          transition:opacity 0.2s;opacity:0.3;
        }
        .footer-link:hover{opacity:0.5}

        /* Ambient glow */
        .glow{
          position:absolute;border-radius:50%;filter:blur(80px);
          pointer-events:none;z-index:0;
        }
        .glow-1{
          width:40%;height:40%;top:15%;left:25%;
          background:radial-gradient(circle,rgba(228,208,72,0.06) 0%,transparent 60%);
          animation:drift 16s ease-in-out infinite alternate;
        }
        .glow-2{
          width:30%;height:30%;bottom:20%;right:20%;
          background:radial-gradient(circle,rgba(228,208,72,0.04) 0%,transparent 60%);
          animation:drift 20s ease-in-out infinite alternate-reverse;
        }
        @keyframes drift{
          0%{transform:translate(0,0) scale(1)}
          50%{transform:translate(15px,-10px) scale(1.03)}
          100%{transform:translate(-10px,8px) scale(0.98)}
        }

        @keyframes fadeUp{
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
        .animate-in{animation:fadeUp 0.7s cubic-bezier(.22,1,.36,1) forwards}
        .delay-1{animation-delay:0.08s;opacity:0}
        .delay-2{animation-delay:0.14s;opacity:0}
        .delay-3{animation-delay:0.22s;opacity:0}
        .delay-4{animation-delay:0.30s;opacity:0}
        .delay-5{animation-delay:0.38s;opacity:0}
      `}</style>

      {/* Background effects */}
      <GrainOverlay />
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      {/* Main card */}
      <div className="card animate-in">
        {error ? (
          /* ── Error state ── */
          <>
            <div className="icon-circle error animate-in delay-1">
              <AlertCircle size={32} />
            </div>
            <h1 className="animate-in delay-2">Link unavailable</h1>
            <p className="animate-in delay-3">
              This download link is missing or has expired. If you believe this is an error, please contact us and we'll reissue your certificate.
            </p>
            <a href="mailto:hello@orvello.co.uk" className="download-btn animate-in delay-4" style={{ background: "transparent", color: "var(--fg)", border: "1px solid var(--border-light)" }}>
              Contact us
            </a>
            <div className="info-row animate-in delay-5">
              <span>hello@orvello.co.uk</span>
            </div>
          </>
        ) : (
          /* ── Download state ── */
          <>
            <div className="icon-circle success animate-in delay-1">
              <FileCheck size={32} />
            </div>
            <h1 className="animate-in delay-2">Your EPC is ready</h1>
            <p className="animate-in delay-3">
              Your Energy Performance Certificate has been prepared and is ready to download.
            </p>

            {downloaded ? (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-btn downloaded animate-in delay-4" onClick={handleDownload}>
                <FileCheck size={18} /> Downloaded — tap to re-download
              </a>
            ) : (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-btn animate-in delay-4" onClick={handleDownload}>
                <Download size={18} /> Download certificate
              </a>
            )}

            <div className="info-row animate-in delay-4">
              <Shield size={12} />
              <span>Secure link · PDF document</span>
            </div>

            <div className="divider animate-in delay-5" />

            <div className="gov-note animate-in delay-5">
              <p>
                Your certificate will typically be available on the <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener noreferrer">GOV.UK EPC register <ExternalLink size={10} style={{ display: "inline", verticalAlign: "middle", marginLeft: 2 }} /></a> within 24 hours of lodgement.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer logo */}
      <Link to="/" className="footer-link">
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "var(--fg-light)" }}>Orvello</span>
        <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
      </Link>
    </div>
  );
}
