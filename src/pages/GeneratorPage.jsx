import { useState, useRef } from "react";
import { Copy, Check, ExternalLink, Eye, EyeOff, FileCheck, Shield, Clock, Download } from "lucide-react";
import { Link } from "react-router-dom";

const SITE_BASE = "https://orvello.co.uk";

function generateClientUrl({ file, ref, addr, exp, created }) {
  const params = new URLSearchParams();
  // We build the URL manually because URLSearchParams would double-encode
  // the already-encoded S3 URL. Instead, we encode each value once.
  let url = `${SITE_BASE}/client?file=${encodeURIComponent(file)}`;
  if (ref) url += `&ref=${encodeURIComponent(ref)}`;
  if (addr) url += `&addr=${encodeURIComponent(addr)}`;
  url += `&exp=${exp}`;
  url += `&created=${encodeURIComponent(created)}`;
  return url;
}

export default function GeneratorPage() {
  const [file, setFile] = useState("");
  const [ref, setRef] = useState("");
  const [addr, setAddr] = useState("");
  const [exp, setExp] = useState(7);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!file.trim()) e.file = "Pre-signed URL is required";
    else if (!file.trim().startsWith("http")) e.file = "Must be a valid URL";
    if (!ref.trim()) e.ref = "Reference is required";
    if (exp < 1 || exp > 90) e.exp = "Must be 1–90 days";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    const created = new Date().toISOString();
    const url = generateClientUrl({ file: file.trim(), ref: ref.trim(), addr: addr.trim(), exp, created });
    setGeneratedUrl(url);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = generatedUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setFile(""); setRef(""); setAddr(""); setExp(7);
    setGeneratedUrl(""); setCopied(false); setShowPreview(false); setErrors({});
  };

  const expiryDate = new Date(Date.now() + exp * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="gen-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased}
        :root{
          --bg:#1C1A17;--bg-card:#242220;--bg-input:#1A1816;
          --fg:#F0EEE8;--fg-dim:rgba(240,238,232,0.5);--fg-dimmer:rgba(240,238,232,0.25);
          --accent:#E4D048;--accent-dim:rgba(228,208,72,0.10);
          --green:#6EBF7B;--green-dim:rgba(110,191,123,0.1);
          --red:#E06B6B;--red-dim:rgba(224,107,107,0.08);
          --border:rgba(255,255,255,0.06);--border-focus:rgba(228,208,72,0.3);
          --font-display:'Bricolage Grotesque',sans-serif;
          --font-body:'Bricolage Grotesque',sans-serif;
          --font-mono:'IBM Plex Mono',monospace;
        }
        .gen-root{
          font-family:var(--font-body);background:var(--bg);
          min-height:100vh;padding:clamp(24px,4vw,48px);
          display:flex;flex-direction:column;align-items:center;
        }
        .gen-header{
          width:100%;max-width:640px;margin-bottom:32px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .gen-card{
          background:var(--bg-card);border:1px solid var(--border);
          border-radius:16px;padding:clamp(28px,4vw,40px);
          max-width:640px;width:100%;
        }
        .mono{font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}

        .field{margin-bottom:20px}
        .field-label{
          display:block;font-family:var(--font-mono);font-size:10px;
          letter-spacing:0.1em;text-transform:uppercase;
          color:var(--fg-dimmer);margin-bottom:8px;font-weight:400;
        }
        .field-input{
          width:100%;background:var(--bg-input);
          border:1px solid var(--border);border-radius:8px;
          padding:14px 16px;color:var(--fg);font-size:14px;
          font-family:var(--font-body);font-weight:300;
          outline:none;transition:border-color 0.25s;resize:none;
        }
        .field-input::placeholder{color:var(--fg-dimmer)}
        .field-input:focus{border-color:var(--border-focus)}
        .field-input.error{border-color:var(--red)}
        .field-error{font-size:11px;color:var(--red);margin-top:6px;font-weight:300}
        .field-hint{font-size:11px;color:var(--fg-dimmer);margin-top:6px;font-weight:300}

        .row{display:flex;gap:16px}
        .row>.field{flex:1}

        .gen-btn{
          display:flex;align-items:center;justify-content:center;gap:10px;
          width:100%;padding:16px 24px;margin-top:8px;
          background:var(--accent);color:var(--bg);
          border:none;border-radius:10px;
          font-family:var(--font-mono);font-size:12px;font-weight:500;
          letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1);
        }
        .gen-btn:hover{filter:brightness(1.06);transform:translateY(-1px);box-shadow:0 8px 24px rgba(228,208,72,0.15)}
        .gen-btn:active{transform:translateY(0)}

        .output-section{margin-top:28px;padding-top:28px;border-top:1px solid var(--border)}

        .output-url{
          position:relative;background:var(--bg-input);
          border:1px solid var(--border);border-radius:8px;
          padding:14px 16px;padding-right:52px;
          font-family:var(--font-mono);font-size:11px;
          color:var(--fg-dim);word-break:break-all;
          line-height:1.6;max-height:120px;overflow-y:auto;
        }
        .copy-btn{
          position:absolute;top:10px;right:10px;
          background:var(--accent-dim);border:1px solid rgba(228,208,72,0.15);
          border-radius:6px;padding:8px;cursor:pointer;
          color:var(--accent);transition:all 0.2s;display:flex;
        }
        .copy-btn:hover{background:rgba(228,208,72,0.18)}
        .copy-btn.copied{background:var(--green-dim);border-color:rgba(110,191,123,0.2);color:var(--green)}

        .actions-row{display:flex;gap:10px;margin-top:16px}
        .action-btn{
          flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
          padding:12px 16px;border-radius:8px;
          font-family:var(--font-mono);font-size:10px;font-weight:400;
          letter-spacing:0.06em;text-transform:uppercase;
          cursor:pointer;transition:all 0.25s;text-decoration:none;
        }
        .action-btn.outline{
          background:transparent;color:var(--fg-dim);
          border:1px solid var(--border);
        }
        .action-btn.outline:hover{border-color:var(--fg-dim);color:var(--fg)}
        .action-btn.preview{
          background:transparent;color:var(--accent);
          border:1px solid rgba(228,208,72,0.15);
        }
        .action-btn.preview:hover{background:var(--accent-dim)}

        /* Preview card */
        .preview-frame{
          margin-top:24px;padding:24px;
          background:var(--bg);border:1px solid var(--border);
          border-radius:12px;
        }
        .preview-inner{
          background:#F7F6F3;border-radius:14px;
          padding:clamp(24px,4vw,36px);text-align:center;
          max-width:400px;margin:0 auto;
        }
        .preview-inner h3{
          font-family:var(--font-display);font-size:20px;
          font-weight:400;letter-spacing:-0.02em;color:#1A1A18;
          margin-bottom:8px;
        }
        .preview-inner p{font-size:12px;color:#8A8A80;font-weight:300;line-height:1.6;margin-bottom:16px}
        .preview-meta{
          display:flex;gap:20px;justify-content:center;flex-wrap:wrap;
          padding:12px 0;border-top:1px solid #DDDBD5;border-bottom:1px solid #DDDBD5;
          margin-bottom:16px;
        }
        .preview-meta .pm-label{font-size:9px;color:#8A8A80;text-transform:uppercase;letter-spacing:0.1em;font-family:var(--font-mono);margin-bottom:3px}
        .preview-meta .pm-value{font-size:12px;color:#1A1A18;font-weight:400}
        .preview-dl-btn{
          display:inline-flex;align-items:center;gap:8px;
          background:#E4D048;color:#272420;border:none;border-radius:8px;
          padding:14px 28px;font-family:var(--font-mono);font-size:11px;
          font-weight:500;letter-spacing:0.04em;text-transform:uppercase;
          width:100%;justify-content:center;
        }

        .summary-row{
          display:flex;align-items:center;gap:12px;flex-wrap:wrap;
          margin-top:16px;
        }
        .summary-tag{
          display:flex;align-items:center;gap:6px;
          padding:6px 12px;border-radius:6px;font-size:10px;
          font-family:var(--font-mono);letter-spacing:0.04em;
        }
        .summary-tag.green{background:var(--green-dim);color:var(--green);border:1px solid rgba(110,191,123,0.15)}
        .summary-tag.amber{background:var(--accent-dim);color:var(--accent);border:1px solid rgba(228,208,72,0.15)}

        @media(max-width:600px){.row{flex-direction:column;gap:0}}
      `}</style>

      {/* Header */}
      <div className="gen-header">
        <Link to="/" style={{ display: "flex", alignItems: "baseline", textDecoration: "none", gap: 3 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--fg)" }}>Orvello</span>
          <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
        </Link>
        <span className="mono" style={{ color: "var(--fg-dimmer)" }}>Link Generator</span>
      </div>

      {/* Generator card */}
      <div className="gen-card">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "var(--fg)", letterSpacing: "-0.02em", marginBottom: 6 }}>Generate client link</h1>
          <p style={{ fontSize: 13, color: "var(--fg-dimmer)", fontWeight: 300 }}>Create a secure, time-limited download link for your client.</p>
        </div>

        {/* S3 URL */}
        <div className="field">
          <label className="field-label">Pre-signed URL *</label>
          <textarea
            className={`field-input${errors.file ? " error" : ""}`}
            rows={3}
            placeholder="Paste your AWS S3 pre-signed URL here..."
            value={file}
            onChange={e => { setFile(e.target.value); setErrors(p => ({ ...p, file: undefined })); }}
            style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
          />
          {errors.file && <div className="field-error">{errors.file}</div>}
        </div>

        {/* Ref + Expiry row */}
        <div className="row">
          <div className="field">
            <label className="field-label">Reference *</label>
            <input
              className={`field-input${errors.ref ? " error" : ""}`}
              type="text"
              placeholder="EPC-2026-0041"
              value={ref}
              onChange={e => { setRef(e.target.value); setErrors(p => ({ ...p, ref: undefined })); }}
            />
            {errors.ref && <div className="field-error">{errors.ref}</div>}
          </div>
          <div className="field" style={{ maxWidth: 140 }}>
            <label className="field-label">Expiry (days)</label>
            <input
              className={`field-input${errors.exp ? " error" : ""}`}
              type="number"
              min={1} max={90}
              value={exp}
              onChange={e => { setExp(parseInt(e.target.value) || 7); setErrors(p => ({ ...p, exp: undefined })); }}
            />
            {errors.exp && <div className="field-error">{errors.exp}</div>}
          </div>
        </div>

        {/* Address */}
        <div className="field">
          <label className="field-label">Property address</label>
          <input
            className="field-input"
            type="text"
            placeholder="12 High Street, Northampton, NN1 2AB"
            value={addr}
            onChange={e => setAddr(e.target.value)}
          />
          <div className="field-hint">Hidden after link expiry for privacy.</div>
        </div>

        {/* Generate button */}
        <button className="gen-btn" onClick={handleGenerate}>Generate client link</button>

        {/* Output */}
        {generatedUrl && (
          <div className="output-section">
            <div className="field-label" style={{ marginBottom: 10 }}>Client link</div>
            <div className="output-url">
              {generatedUrl}
              <button className={`copy-btn${copied ? " copied" : ""}`} onClick={handleCopy} title="Copy to clipboard">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="summary-row">
              <div className="summary-tag green"><Shield size={10} /> Encoded</div>
              <div className="summary-tag amber"><Clock size={10} /> Expires {expiryDate}</div>
            </div>

            <div className="actions-row">
              <button className="action-btn outline" onClick={handleReset}>Reset</button>
              <button className="action-btn preview" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? "Hide preview" : "Preview"}
              </button>
              <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="action-btn outline">
                Open <ExternalLink size={10} />
              </a>
            </div>

            {/* Client preview */}
            {showPreview && (
              <div className="preview-frame">
                <div className="field-label" style={{ marginBottom: 12, textAlign: "center" }}>Client will see</div>
                <div className="preview-inner">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(90,122,95,0.08)", border: "1px solid rgba(90,122,95,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#5A7A5F" }}>
                    <FileCheck size={22} />
                  </div>
                  <h3>Your EPC is ready</h3>
                  <p>Your Energy Performance Certificate has been prepared and is ready to download.</p>
                  <div className="preview-meta">
                    {ref && (
                      <div style={{ textAlign: "left" }}>
                        <div className="pm-label">Reference</div>
                        <div className="pm-value" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{ref}</div>
                      </div>
                    )}
                    {addr && (
                      <div style={{ textAlign: "left" }}>
                        <div className="pm-label">Property</div>
                        <div className="pm-value">{addr}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 10, color: "#8A8A80", fontFamily: "var(--font-mono)", marginBottom: 16, letterSpacing: "0.04em" }}>
                    <Clock size={10} /> Expires in {exp} days
                  </div>
                  <div className="preview-dl-btn"><Download size={14} /> Download certificate</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
