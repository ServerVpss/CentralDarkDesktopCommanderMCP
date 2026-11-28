import test from "node:test";
import assert from "node:assert/strict";
import { safePairingPath, rememberPairing, finishAuth, pairingCodeFromFragment } from "../src/lib/return-to.ts";
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
