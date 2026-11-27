import { createClient } from "@supabase/supabase-js";
const TRUSTED_ORIGIN = "https://lyoigsqluyktoclwdaft.supabase.co";
const url = import.meta.env.VITE_SUPABASE_URL?.trim() || TRUSTED_ORIGIN;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "";
function isPublicKey(value: string) {
  if (value.startsWith("sb_publishable_")) return true;
  try {
    const payload = value.split(".")[1];
    if (!payload || value.split(".").length !== 3) return false;
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return claims.role === "anon" && claims.ref === "lyoigsqluyktoclwdaft";
  } catch { return false; }
}
export function configReady() {
  try {
    const u = new URL(url);
    return u.origin === TRUSTED_ORIGIN
      && u.origin === url.replace(/\/$/, "") && isPublicKey(key);
  } catch { return false; }
}
let client: ReturnType<typeof createClient> | undefined;
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, property, receiver) {
    if (!configReady()) throw new Error("Configure somente a URL e a chave pública do Supabase CentralDark.");
    if (!client) client = createClient(url, key, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      global: { fetch(input, init) {
        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        if (init?.headers) new Headers(init.headers).forEach((v,k) => headers.set(k,v));
        if (key.startsWith("sb_publishable_") && headers.get("Authorization") === "Bearer " + key) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, {...init, headers});
      } }
    });
    return Reflect.get(client, property, receiver);
  }
});
