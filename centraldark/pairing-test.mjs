import os from "node:os";
import { setTimeout as sleep } from "node:timers/promises";
import { SERVER_ORIGIN, checkRemoteConfig } from "./remote-config.mjs";

const CLIENT = "centraldark.remote-bridge";
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const opaque = /^[A-Za-z0-9_-]{32,128}$/;
const codePattern = /^[A-F0-9]{4}-[A-F0-9]{4}$/;
const permittedConsentFields = new Set(["client_id","client_name","scope","pair_id","pair_nonce","auth_method"]);
const MAX_WAIT_MS = 120000;

export function validateConsentLocation(value, pairId) {
  if (typeof value !== "string" || value.length > 4096) throw Error("Endereço de consentimento inválido.");
  let url;
  try { url = new URL(value); } catch { throw Error("Endereço de consentimento inválido."); }
  if (url.origin !== SERVER_ORIGIN || url.pathname !== "/mcp-autorizar" || url.username || url.password || url.hash)
    throw Error("Origem de consentimento não autorizada.");
  for (const key of url.searchParams.keys()) {
    if (!permittedConsentFields.has(key) || url.searchParams.getAll(key).length !== 1)
      throw Error("Parâmetros de consentimento não autorizados.");
  }
  if (url.searchParams.get("client_id") !== CLIENT || url.searchParams.get("pair_id") !== pairId ||
      !opaque.test(url.searchParams.get("pair_nonce") || "") || url.searchParams.get("scope") !== "mcp" ||
      url.searchParams.get("auth_method") !== "code") throw Error("Consentimento não corresponde à solicitação.");
  return url.href;
}

async function post(fetchImpl, path, body, token) {
  return fetchImpl(new URL(path, SERVER_ORIGIN), {
    method:"POST", redirect:"error", signal:AbortSignal.timeout(10000),
    headers:{"Content-Type":"application/json", Accept:"application/json", ...(token ? {Authorization:"Bearer "+token} : {})},
    body:JSON.stringify(body)
  });
}
async function json(response, label) {
  if(!response.ok) throw Error(label+" (HTTP "+response.status+").");
  try { return await response.json(); } catch { throw Error(label+": resposta inválida."); }
}

export async function runPairingTest({
  fetchImpl=globalThis.fetch,
  openBrowser=async url=>{const {default:open}=await import("open");await open(url,{wait:false});},
  notify=console.log,
  delay=sleep,
  monotonicNow=()=>performance.now(),
  deviceName=os.hostname()
}={}) {
  await checkRemoteConfig(fetchImpl);
  const deadline=monotonicNow()+MAX_WAIT_MS;
  const pair=await json(await post(fetchImpl,"/device/desktop/start",{device_name:String(deviceName).slice(0,160)}),"Não foi possível iniciar o pareamento");
  if(pair?.ok!==true||!uuid.test(pair.pair_id||"")||!opaque.test(pair.pair_secret||"")||
    !codePattern.test(pair.code||"")||!Number.isFinite(Date.parse(pair.expires_at)))throw Error("Solicitação de pareamento inválida.");
  const authorize=new URL("/authorize",SERVER_ORIGIN);
  authorize.searchParams.set("client_id",CLIENT);
  authorize.searchParams.set("pair_id",pair.pair_id);
  const page=await fetchImpl(authorize,{redirect:"manual",signal:AbortSignal.timeout(10000)});
  if(page.status!==302)throw Error("Página de autorização indisponível (HTTP "+page.status+").");
  const url=validateConsentLocation(page.headers.get("Location"),pair.pair_id);
  // Somente o código exibido ao usuário; nunca o segredo de posse.
  const browserUrl = new URL(url);
  browserUrl.hash = "pair_code=" + pair.code;
  notify("Entre na sua conta CentralDark, confira o código do terminal e clique em Confirmar.");
  notify(url);
  notify("Código de pareamento: "+pair.code);
  try { await openBrowser(browserUrl.href); } catch { notify("Não foi possível abrir o navegador automaticamente. Use o endereço acima e digite o código."); }
  let session;
  while(monotonicNow()<deadline){
    await delay(2000);
    if(monotonicNow()>=deadline)break;
    const result=await json(await post(fetchImpl,"/device/pair/status",{id:pair.pair_id,secret:pair.pair_secret}),"Falha na consulta de pareamento");
    if(result?.status==="pending")continue;
    if(result?.status==="expired")throw Error("Código expirado. Inicie um novo teste.");
    if(result?.status!=="approved"||!uuid.test(result.device_id||"")||!opaque.test(result.token||""))
      throw Error("Não foi possível obter uma sessão exclusiva de teste. A sessão, se emitida, expira em até cinco minutos.");
    session={id:result.device_id,token:result.token};break;
  }
  if(!session)throw Error("Tempo de pareamento encerrado.");
  let verified=false;
  try{
    const result=await json(await post(fetchImpl,"/device/desktop/session/check",{device_id:session.id},session.token),"Prova da sessão falhou");
    if(result?.ok!==true||result.device_id!==session.id||result.pairing_only!==true)
      throw Error("O servidor não comprovou a sessão de teste.");
    verified=true;
  }finally{
    // Never persist or print access/refresh tokens. Revoke even if verification fails.
    const revoke=await post(fetchImpl,"/device/devices/self/revoke",{device_id:session.id},session.token).catch(()=>null);
    if(!revoke?.ok)throw Error("Revogação não confirmada. A sessão de teste expira em até cinco minutos.");
    const result=await revoke.json().catch(()=>null);
    if(result?.ok!==true||result.device_id!==session.id)throw Error("Revogação não confirmada. A sessão de teste expira em até cinco minutos.");
    const denied=await post(fetchImpl,"/device/desktop/session/check",{device_id:session.id},session.token);
    if(denied.status!==401)throw Error("Contraprova de revogação não confirmada.");
  }
  if(verified)notify("APROVADO: pareamento autenticado e sessão de teste revogada. Execução remota ainda desabilitada.");
  return {paired:verified,revoked:true};
}
