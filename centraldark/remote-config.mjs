// Public origins only. Never infer a trusted endpoint from server metadata.
export const SERVER_ORIGIN = "https://mcp.centralldark.com";
export const SUPABASE_ORIGIN = "https://lyoigsqluyktoclwdaft.supabase.co";
export const REMOTE_PROTOCOL = "centraldark-device-v1";

export function validatePublicKey(value) {
  if (typeof value !== "string" || !value || value.length > 4096) return false;
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
  try {
    const parts = value.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload.role === "anon" && payload.ref === "lyoigsqluyktoclwdaft";
  } catch { return false; }
}

export function validateRemoteInfo(info) {
  if (!info || typeof info !== "object" || Array.isArray(info)) throw new Error("Resposta MCP inválida.");
  if (info.protocol !== REMOTE_PROTOCOL) throw new Error("O servidor ainda não anuncia o protocolo de pareamento CentralDark.");
  if (info.supabaseUrl !== SUPABASE_ORIGIN && info.supabaseUrl !== SUPABASE_ORIGIN + "/") {
    throw new Error("Projeto Supabase não autorizado.");
  }
  if (!validatePublicKey(info.supabasePublishableKey)) throw new Error("Chave pública Supabase inválida.");
  if (info.pairingOnly !== true) throw new Error("Modo de prova de pareamento não autorizado.");
  return { protocol: REMOTE_PROTOCOL, serverOrigin: SERVER_ORIGIN, supabaseUrl: SUPABASE_ORIGIN };
}

export async function checkRemoteConfig(fetchImpl = globalThis.fetch) {
  // No credentials are transmitted. Redirects are prohibited.
  const response = await fetchImpl(new URL("/api/mcp-info", SERVER_ORIGIN), {
    redirect: "error", signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Configuração remota indisponível (HTTP " + response.status + ").");
  return validateRemoteInfo(await response.json());
}
