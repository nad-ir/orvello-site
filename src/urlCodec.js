/**
 * Encodes an object of params into a single Base64 URL-safe string.
 * Sensitive fields (addr, ref) are bundled into one encoded payload.
 * Non-sensitive fields (rating, heating, insulation, exp, service, created) stay as plain params.
 */

export function encodePayload(obj) {
  try {
    const json = JSON.stringify(obj);
    // btoa with Unicode support
    const b64 = btoa(unescape(encodeURIComponent(json)));
    // Make URL-safe: replace + with -, / with _, remove =
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

export function decodePayload(str) {
  try {
    // Restore standard Base64
    let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * EPC URL builder
 * Plain params: rating, heating, insulation
 * Encoded payload (d=): ref, addr
 */
export function buildEpcUrl(base, { rating, heating, insulation, bedrooms, ref, addr }) {
  const payload = encodePayload({ ref, addr });
  let url = `${base}/epc?rating=${encodeURIComponent(rating)}`;
  url += `&heating=${encodeURIComponent(heating)}`;
  url += `&insulation=${encodeURIComponent(insulation)}`;
  if (bedrooms) url += `&bedrooms=${bedrooms}`;
  url += `&d=${payload}`;
  return url;
}

export function parseEpcUrl() {
  const p = new URLSearchParams(window.location.search);
  const rating = (p.get("rating") || "").toUpperCase();
  const heating = p.get("heating") || "gas";
  const insulation = p.get("insulation") || "average";
  const bedrooms = parseInt(p.get("bedrooms") || "3", 10);
  const d = p.get("d");
  let ref = "", addr = "";
  if (d) {
    const decoded = decodePayload(d);
    if (decoded) {
      ref = decoded.ref || "";
      addr = decoded.addr || "";
    }
  }
  // Fallback: check plain params for backwards compat
  if (!ref) ref = p.get("ref") || "";
  if (!addr) addr = p.get("addr") || "";
  return { rating, heating, insulation, bedrooms, ref, addr };
}

/**
 * Delivery URL builder
 * Encoded payload (d=): file (S3 URL), ref, addr, service
 * Plain params: exp, created
 */
export function buildDeliveryUrl(base, { file, ref, addr, exp, created, service }) {
  const payload = encodePayload({ file, ref, addr, service });
  let url = `${base}/delivery?d=${payload}`;
  url += `&exp=${exp}`;
  url += `&created=${encodeURIComponent(created)}`;
  return url;
}

export function parseDeliveryUrl() {
  const search = window.location.search;
  if (!search || search.length < 2) return null;

  const p = new URLSearchParams(search);
  const d = p.get("d");
  const exp = parseInt(p.get("exp"), 10) || 14;
  const created = p.get("created") || null;

  let file = null, ref = null, addr = null, service = "report";

  if (d) {
    const decoded = decodePayload(d);
    if (decoded) {
      file = decoded.file || null;
      ref = decoded.ref || null;
      addr = decoded.addr || null;
      service = decoded.service || "report";
    }
  }

  // Fallback: old-style plain params
  if (!file) {
    // Try extracting file from the old manual parsing
    let remaining = search.slice(1);
    const extractParam = (str, param) => {
      const idx = str.indexOf(`&${param}=`);
      if (idx === -1) return [str, null];
      const before = str.slice(0, idx);
      const after = str.slice(idx + param.length + 2);
      const nextParams = ["&file=", "&ref=", "&addr=", "&exp=", "&created=", "&service=", "&d="];
      let endIdx = after.length;
      for (const np of nextParams) { const ni = after.indexOf(np); if (ni !== -1 && ni < endIdx) endIdx = ni; }
      return [before + after.slice(endIdx), after.slice(0, endIdx)];
    };
    [remaining] = extractParam(remaining, "d");
    [remaining, service] = extractParam(remaining, "service");
    [remaining] = extractParam(remaining, "created");
    [remaining] = extractParam(remaining, "exp");
    [remaining, addr] = extractParam(remaining, "addr");
    [remaining, ref] = extractParam(remaining, "ref");
    if (remaining.startsWith("file=")) file = remaining.slice(5);
    try {
      if (file) file = decodeURIComponent(file);
      if (ref) ref = decodeURIComponent(ref);
      if (addr) addr = decodeURIComponent(addr);
      if (service) service = decodeURIComponent(service);
    } catch { return null; }
  }

  if (!file || !file.startsWith("http")) return null;
  return { file, ref, addr, exp, created, service };
}
