// Only resume the existing consent route on this origin. Never store tokens.
const KEY = "centraldark.mcp.pending-consent";
let navigationStarted = false;
const FIELDS = ["client_id","client_name","redirect_uri","response_type","code_challenge","code_challenge_method","state","scope","pair_id","pair_nonce"] as const;
// Somente o código público exibido pelo NPX, ligado à solicitação Bridge.
const PAIR_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const PAIR_NONCE = /^[A-Za-z0-9_-]{32,128}$/;
export function pairingCodeFromFragment(query: URLSearchParams, hash: string): string {
  const match = /^#pair_code=([A-F0-9]{4}-[A-F0-9]{4})$/.exec(hash);
  if (!match || ["client_id","pair_id","pair_nonce","scope"].some(key=>query.getAll(key).length!==1)) return "";
  if (query.get("client_id")!=="centraldark.remote-bridge" || query.get("scope")!=="mcp"
      || !PAIR_ID.test(query.get("pair_id") || "") || !PAIR_NONCE.test(query.get("pair_nonce") || "")) return "";
  return match[1];
}
export function safePairingPath(value: string): string | null {
  if (!value.startsWith("/mcp-autorizar?") || value.length > 8192) return null;
  const url = new URL(value, "https://mcp.centralldark.com");
  if (url.origin !== "https://mcp.centralldark.com" || url.pathname !== "/mcp-autorizar" || !url.searchParams.get("client_id")) return null;
  const code = pairingCodeFromFragment(url.searchParams, url.hash);
  if (url.hash && !code) return null;
  const params = new URLSearchParams();
  for (const field of FIELDS) {
    const entries = url.searchParams.getAll(field);
    if (entries.length > 1) return null;
    if (entries.length) params.set(field, entries[0]);
  }
  return "/mcp-autorizar?" + params.toString() + (code ? "#pair_code="+code : "");
}
export function rememberPairing(value: string) {
  const target = safePairingPath(value);
  if (target) { try { sessionStorage.setItem(KEY, target); } catch { /* Session storage unavailable. */ } }
}
export function finishAuth() {
  if (navigationStarted) return;
  navigationStarted = true;
  let target: string | null = null;
  try {
    target = safePairingPath(sessionStorage.getItem(KEY) || "");
    sessionStorage.removeItem(KEY);
  } catch { /* Login can still return to the home page. */ }
  window.location.replace(target || "/");
}

// Local OAuth uses the exact registered loopback callback, never a substitute.
export function isLoopbackOAuthCallback(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" && ["127.0.0.1", "[::1]", "localhost"].includes(url.hostname)
      && !url.username && !url.password && !url.hash;
  } catch { return false; }
}
export function validatedOAuthCallback(value: string, request: URLSearchParams): URL {
  const destination = new URL(value);
  const expected = new URL(request.get("redirect_uri") || "");
  if (destination.origin !== expected.origin || destination.pathname !== expected.pathname
      || !["https:", "http:"].includes(destination.protocol)
      || destination.username || destination.password || destination.hash !== expected.hash
      || destination.searchParams.getAll("code").length !== 1 || !destination.searchParams.get("code")
      || destination.searchParams.has("error")
      || (request.get("state") && (destination.searchParams.getAll("state").length !== 1
          || destination.searchParams.get("state") !== request.get("state")))) {
    throw new Error("Destino OAuth divergente do cliente registrado.");
  }
  for (const key of new Set(expected.searchParams.keys())) {
    if (["code", "state", "iss"].includes(key)) continue;
    if (JSON.stringify(destination.searchParams.getAll(key)) !== JSON.stringify(expected.searchParams.getAll(key)))
      throw new Error("Parâmetros do retorno OAuth divergentes.");
  }
  return destination;
}
export function oauthCompletionReceipt(result: {consent_receipt?: unknown; consent_expires_at?: unknown}, now = Date.now()) {
  const receipt = result.consent_receipt;
  const expiresAt = result.consent_expires_at;
  if (typeof receipt !== "string" || !/^[a-f0-9]{64}$/.test(receipt)
      || typeof expiresAt !== "number" || !Number.isFinite(expiresAt) || expiresAt <= now || expiresAt > now + 5 * 60_000 + 5000)
    return null;
  return {receipt, expiresAt};
}
