import test from "node:test";
import assert from "node:assert/strict";
import { safePairingPath, rememberPairing, finishAuth, pairingCodeFromFragment, isLoopbackOAuthCallback, validatedOAuthCallback, oauthCompletionReceipt, oauthClientPresentation, reserveOAuthReturnWindow, closeOAuthReturnWindow } from "../src/lib/return-to.ts";
test("continua a solicitação no mesmo domínio",()=>assert.equal(safePairingPath("/mcp-autorizar?client_id=centraldark.remote-bridge&pair_id=a&pair_nonce=b&pair_code=1234"),"/mcp-autorizar?client_id=centraldark.remote-bridge&pair_id=a&pair_nonce=b"));
test("rejeita redirecionamento externo e caminhos não autorizados",()=>{for(const p of ["https://evil.example/mcp-autorizar?client_id=a","//evil.example/","/auth?next=x","/mcp-autorizar?client_id=a#token","/mcp-autorizar?pair_id=a","/mcp-autorizar?client_id=a&client_id=b"])assert.equal(safePairingPath(p),null);});
test("não preserva tokens nem parâmetros desconhecidos",()=>assert.equal(safePairingPath("/mcp-autorizar?client_id=a&access_token=secret&refresh_token=secret"),"/mcp-autorizar?client_id=a"));

const request = "/mcp-autorizar?client_id=centraldark.remote-bridge&scope=mcp&pair_id=00000000-0000-4000-8000-000000000001&pair_nonce="+"N".repeat(32);
const fragment = "#pair_code=ABCD-1234";
test("prefill somente pelo fragmento da solicitação Bridge válida",()=>{
  const url = new URL(request+fragment,"https://mcp.centralldark.com");
  assert.equal(pairingCodeFromFragment(url.searchParams,url.hash),"ABCD-1234");
  assert.equal(safePairingPath(request+fragment),"/mcp-autorizar?client_id=centraldark.remote-bridge&scope=mcp&pair_id=00000000-0000-4000-8000-000000000001&pair_nonce="+"N".repeat(32)+fragment);
  for(const input of [request+"#pair_code=0000",request+fragment+"&access_token=x",request+"&pair_id=other"+fragment,request.replace("scope=mcp","scope=admin")+fragment,request.replace("centraldark.remote-bridge","centraldark.centraldark-vscode-restore")+fragment]) {
    const invalid = new URL(input,"https://mcp.centralldark.com");
    assert.equal(pairingCodeFromFragment(invalid.searchParams,invalid.hash),"");
    assert.equal(safePairingPath(input),null);
  }
  assert.equal(pairingCodeFromFragment(new URLSearchParams("pair_code=ABCD-1234"),""),"");
});

test("retorno após login consome a solicitação uma única vez",()=>{
  const saved=new Map<string,string>();
  const destinations:string[]=[];
  const oldStorage=Object.getOwnPropertyDescriptor(globalThis,"sessionStorage");
  const oldWindow=Object.getOwnPropertyDescriptor(globalThis,"window");
  Object.defineProperty(globalThis,"sessionStorage",{configurable:true,value:{setItem:(k:string,v:string)=>saved.set(k,v),getItem:(k:string)=>saved.get(k)??null,removeItem:(k:string)=>saved.delete(k)}});
  Object.defineProperty(globalThis,"window",{configurable:true,value:{location:{replace:(p:string)=>destinations.push(p)}}});
  try {
    rememberPairing(request+fragment);
    finishAuth();
    finishAuth();
    assert.deepEqual(destinations,[safePairingPath(request+fragment)]);
    assert.equal(saved.size,0);
  } finally {
    if(oldStorage)Object.defineProperty(globalThis,"sessionStorage",oldStorage);else Reflect.deleteProperty(globalThis,"sessionStorage");
    if(oldWindow)Object.defineProperty(globalThis,"window",oldWindow);else Reflect.deleteProperty(globalThis,"window");
  }
});

test("retorno loopback exato, sem substituição de host, caminho, estado ou código",()=>{
  const request=new URLSearchParams({redirect_uri:"http://127.0.0.1:59507/callback?registered=1",state:"fixture-state"});
  const valid="http://127.0.0.1:59507/callback?registered=1&code=fixture-code&state=fixture-state&iss=https%3A%2F%2Fmcp.centralldark.com";
  assert.equal(isLoopbackOAuthCallback(valid),true);
  assert.equal(validatedOAuthCallback(valid,request).href,valid);
  for(const url of [valid.replace("59507","59508"),valid.replace("127.0.0.1","example.invalid"),valid.replace("/callback","/different"),valid.replace("fixture-state","different"),valid.replace("registered=1","registered=2"),valid.replace("code=fixture-code","code="),valid+"&code=duplicate"]) {
    assert.throws(()=>validatedOAuthCallback(url,request));
  }
  assert.equal(isLoopbackOAuthCallback("https://chatgpt.com/connector_platform_oauth_redirect"),false);
  assert.equal(isLoopbackOAuthCallback("http://127.0.0.1.example.invalid/callback"),false);
});
test("recibo apenas vigente e sem capacidade de autenticação",()=>{
  const now=1000000;const receipt="a".repeat(64);
  assert.deepEqual(oauthCompletionReceipt({consent_receipt:receipt,consent_expires_at:now+300000},now),{receipt,expiresAt:now+300000});
  for(const input of [{},{consent_receipt:"fake",consent_expires_at:now+1},{consent_receipt:receipt,consent_expires_at:now},{consent_receipt:receipt,consent_expires_at:now+999999}]) assert.equal(oauthCompletionReceipt(input,now),null);
});

test("identifica cliente por CIMD e retorno registrado, não por nome ou Windows",()=>{
  const info=(id:string,redirect:string,name="ChatGPT")=>oauthClientPresentation(new URLSearchParams({client_id:id,redirect_uri:redirect,client_name:name}));
  assert.deepEqual(info("https://chatgpt.com/oauth/codex/client.json","http://127.0.0.1:51619/callback"),
    {name:"Codex",kind:"native",appUrl:"codex://settings"});
  assert.deepEqual(info("https://chatgpt.com/oauth/client.json?token_endpoint_auth_method=none","https://chatgpt.com/connector_platform_oauth_redirect"),
    {name:"ChatGPT",kind:"web"});
  assert.equal(info("https://chatgpt.com/oauth/callback-id/client.json","https://chatgpt.com/connector/oauth/callback-id").kind,"web");
  for(const [id,redirect] of [
    ["https://fake.example/oauth/codex/client.json","http://127.0.0.1:51619/callback"],
    ["https://chatgpt.com/oauth/codex/client.json","https://evil.example/callback"],
    ["https://chatgpt.com/oauth/client.json","https://evil.example/connector_platform_oauth_redirect"],
    ["https://chatgpt.com/oauth/callback-id/client.json","https://chatgpt.com/connector/oauth/other"]
  ]) {
    const result=info(id,redirect);
    assert.equal(result.kind,"unknown");
    assert.equal(result.appUrl,undefined);
  }
});
test("janela auxiliar tem referência rastreável e não ganha acesso ao opener",()=>{
  const oldWindow=Object.getOwnPropertyDescriptor(globalThis,"window");
  let closed=0;
  const popup={opener:{},document:{title:"",body:{textContent:""}},close:()=>{closed++}};
  Object.defineProperty(globalThis,"window",{configurable:true,value:{open:()=>popup}});
  try{
    assert.equal(reserveOAuthReturnWindow(),popup);
    assert.equal(popup.opener,null);
    closeOAuthReturnWindow(popup);
    closeOAuthReturnWindow(popup);
    assert.equal(closed,2);
    closeOAuthReturnWindow(null);
    assert.doesNotThrow(()=>closeOAuthReturnWindow({close:()=>{throw new Error("isolated");}}));
    Object.defineProperty(globalThis,"window",{configurable:true,value:{open:()=>null}});
    assert.equal(reserveOAuthReturnWindow(),null);
  }finally{
    if(oldWindow)Object.defineProperty(globalThis,"window",oldWindow);else Reflect.deleteProperty(globalThis,"window");
  }
});
