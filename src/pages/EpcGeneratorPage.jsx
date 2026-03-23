import { useState } from "react";
import { Copy, Check, Eye, EyeOff, ExternalLink, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const SITE_BASE = "https://orvello.co.uk";

function generateEpcUrl({ rating, heating, insulation, ref, addr }) {
  let url = `${SITE_BASE}/epc?rating=${encodeURIComponent(rating)}`;
  url += `&heating=${encodeURIComponent(heating)}`;
  url += `&insulation=${encodeURIComponent(insulation)}`;
  if (ref) url += `&ref=${encodeURIComponent(ref)}`;
  if (addr) url += `&addr=${encodeURIComponent(addr)}`;
  return url;
}

export default function EpcGeneratorPage() {
  const [rating, setRating] = useState("D");
  const [heating, setHeating] = useState("gas");
  const [insulation, setInsulation] = useState("average");
  const [ref, setRef] = useState("");
  const [addr, setAddr] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    if (!ref.trim()) return;
    setGeneratedUrl(generateEpcUrl({ rating, heating, insulation, ref: ref.trim(), addr: addr.trim() }));
    setCopied(false);
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(generatedUrl); } catch {
      const ta = document.createElement("textarea"); ta.value = generatedUrl;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setRating("D"); setHeating("gas"); setInsulation("average");
    setRef(""); setAddr(""); setGeneratedUrl(""); setCopied(false); setShowPreview(false);
  };

  return (
    <div className="gen-root">
      <style>{STYLES}</style>

      <div className="gen-header">
        <Link to="/" style={{ display: "flex", alignItems: "baseline", textDecoration: "none", gap: 3 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--fg)" }}>Orvello</span>
          <span style={{ width: 3, height: 3, background: "var(--accent)", display: "inline-block", borderRadius: 1 }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/generate" className="tool-switch">Consultancy</Link>
          <span className="mono" style={{ color: "var(--accent)" }}>EPC Generator</span>
        </div>
      </div>

      <div className="gen-card">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "var(--fg)", letterSpacing: "-0.02em", marginBottom: 6 }}>Generate EPC link</h1>
          <p style={{ fontSize: 13, color: "var(--fg-dimmer)", fontWeight: 300 }}>Create a branded EPC experience page for your client.</p>
        </div>

        {/* Rating */}
        <div className="field">
          <label className="field-label">EPC Rating *</label>
          <div className="pill-row">
            {"ABCDEFG".split("").map(r => (
              <button key={r} className={`pill${rating === r ? " active" : ""}`} onClick={() => setRating(r)}
                style={rating === r ? { background: "var(--accent)", color: "var(--bg)", borderColor: "var(--accent)" } : {}}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Heating + Insulation */}
        <div className="row">
          <div className="field">
            <label className="field-label">Heating type</label>
            <select className="field-input" value={heating} onChange={e => setHeating(e.target.value)}>
              <option value="gas">Gas boiler</option>
              <option value="electric">Electric heating</option>
              <option value="oil">Oil boiler</option>
              <option value="lpg">LPG boiler</option>
              <option value="heatpump">Heat pump</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Insulation</label>
            <select className="field-input" value={insulation} onChange={e => setInsulation(e.target.value)}>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Ref + Address */}
        <div className="field">
          <label className="field-label">Reference *</label>
          <input className="field-input" type="text" placeholder="EPC-2026-0041" value={ref} onChange={e => setRef(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Property address</label>
          <input className="field-input" type="text" placeholder="12 High Street, Northampton, NN1 2AB" value={addr} onChange={e => setAddr(e.target.value)} />
        </div>

        <button className="gen-btn" onClick={handleGenerate} disabled={!ref.trim()}>
          <Zap size={14} /> Generate EPC link
        </button>

        {generatedUrl && (
          <div className="output-section">
            <div className="field-label" style={{ marginBottom: 10 }}>Client link</div>
            <div className="output-url">
              {generatedUrl}
              <button className={`copy-btn${copied ? " copied" : ""}`} onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="actions-row">
              <button className="action-btn outline" onClick={handleReset}>Reset</button>
              <button className="action-btn preview" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? "Hide" : "Preview"}
              </button>
              <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="action-btn outline">
                Open <ExternalLink size={10} />
              </a>
            </div>

            {showPreview && (
              <div style={{ marginTop: 20, padding: 16, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
                <div className="field-label" style={{ marginBottom: 12, textAlign: "center" }}>Client will see the full EPC experience</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: `${getRatingColor(rating)}15`, border: `2px solid ${getRatingColor(rating)}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: getRatingColor(rating) }}>{rating}</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 16, fontWeight: 400, color: "var(--fg)" }}>Rating {rating}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300 }}>{addr || "Property address"}</div>
                    {ref && <div className="mono" style={{ color: "var(--muted)", marginTop: 4, fontSize: 9 }}>Ref: {ref}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getRatingColor(r) {
  const c = { A: "#1B8A3A", B: "#3B9B2F", C: "#8BC34A", D: "#F5C518", E: "#F39C12", F: "#E67E22", G: "#C0392B" };
  return c[r] || "#F5C518";
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{-webkit-font-smoothing:antialiased}
  :root{--bg:#1C1A17;--bg-card:#242220;--bg-input:#1A1816;--fg:#F0EEE8;--fg-dim:rgba(240,238,232,0.5);--fg-dimmer:rgba(240,238,232,0.25);--accent:#E4D048;--accent-dim:rgba(228,208,72,0.10);--green:#6EBF7B;--green-dim:rgba(110,191,123,0.1);--border:rgba(255,255,255,0.06);--border-focus:rgba(228,208,72,0.3);--font-display:'Bricolage Grotesque',sans-serif;--font-body:'Bricolage Grotesque',sans-serif;--font-mono:'IBM Plex Mono',monospace}
  .gen-root{font-family:var(--font-body);background:var(--bg);min-height:100vh;padding:clamp(24px,4vw,48px);display:flex;flex-direction:column;align-items:center}
  .gen-header{width:100%;max-width:640px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between}
  .gen-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:clamp(28px,4vw,40px);max-width:640px;width:100%}
  .mono{font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:400}
  .tool-switch{font-family:var(--font-mono);font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--fg-dimmer);text-decoration:none;transition:color 0.2s;padding:6px 12px;border:1px solid var(--border);border-radius:6px}
  .tool-switch:hover{color:var(--fg-dim);border-color:var(--fg-dimmer)}
  .field{margin-bottom:20px}
  .field-label{display:block;font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--fg-dimmer);margin-bottom:8px;font-weight:400}
  .field-input{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px 16px;color:var(--fg);font-size:14px;font-family:var(--font-body);font-weight:300;outline:none;transition:border-color 0.25s;appearance:none}
  .field-input::placeholder{color:var(--fg-dimmer)}
  .field-input:focus{border-color:var(--border-focus)}
  select.field-input{cursor:pointer}
  .row{display:flex;gap:16px}
  .row>.field{flex:1}
  .pill-row{display:flex;gap:6px}
  .pill{flex:1;padding:12px 0;text-align:center;background:transparent;color:var(--fg-dim);border:1px solid var(--border);font-family:var(--font-mono);font-size:14px;font-weight:400;cursor:pointer;transition:all 0.2s;border-radius:8px;letter-spacing:0.02em}
  .pill:hover{border-color:var(--fg-dimmer)}
  .pill.active{background:var(--accent);color:var(--bg);border-color:var(--accent);font-weight:500}
  .gen-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:16px 24px;margin-top:8px;background:var(--accent);color:var(--bg);border:none;border-radius:10px;font-family:var(--font-mono);font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all 0.3s cubic-bezier(.22,1,.36,1)}
  .gen-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}
  .gen-btn:disabled{opacity:0.4;cursor:not-allowed;filter:none;transform:none}
  .output-section{margin-top:28px;padding-top:28px;border-top:1px solid var(--border)}
  .output-url{position:relative;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px 16px;padding-right:52px;font-family:var(--font-mono);font-size:11px;color:var(--fg-dim);word-break:break-all;line-height:1.6;max-height:100px;overflow-y:auto}
  .copy-btn{position:absolute;top:10px;right:10px;background:var(--accent-dim);border:1px solid rgba(228,208,72,0.15);border-radius:6px;padding:8px;cursor:pointer;color:var(--accent);transition:all 0.2s;display:flex}
  .copy-btn:hover{background:rgba(228,208,72,0.18)}
  .copy-btn.copied{background:var(--green-dim);border-color:rgba(110,191,123,0.2);color:var(--green)}
  .actions-row{display:flex;gap:10px;margin-top:16px}
  .action-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:8px;font-family:var(--font-mono);font-size:10px;font-weight:400;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;text-decoration:none}
  .action-btn.outline{background:transparent;color:var(--fg-dim);border:1px solid var(--border)}
  .action-btn.outline:hover{border-color:var(--fg-dim);color:var(--fg)}
  .action-btn.preview{background:transparent;color:var(--accent);border:1px solid rgba(228,208,72,0.15)}
  .action-btn.preview:hover{background:var(--accent-dim)}
  @media(max-width:600px){.row{flex-direction:column;gap:0}.pill-row{flex-wrap:wrap}}
`;
