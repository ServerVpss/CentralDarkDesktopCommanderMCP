import {test} from "node:test";
import assert from "node:assert/strict";
import {runPairingTest,validateConsentLocation} from "../pairing-test.mjs";
import {SERVER_ORIGIN,SUPABASE_ORIGIN,REMOTE_PROTOCOL} from "../remote-config.mjs";
const pair="00000000-0000-4000-8000-000000000001";
const device="00000000-0000-4000-8000-000000000002";
const secret="S".repeat(32), nonce="N".repeat(32), token="T".repeat(43);
const consent=SERVER_ORIGIN+"/mcp-autorizar?"+new URLSearchParams({client_id:"centraldark.remote-bridge",pair_id:pair,pair_nonce:nonce,scope:"mcp",auth_method:"code"});
test("rejeita origem externa, código na URL, posse e escopo indevido",()=>{
  assert.equal(validateConsentLocation(consent,pair),consent);
  for(const url of [consent.replace(SERVER_ORIGIN,"https://admin.centralldark.com"),consent+"&pair_secret=x",consent+"&pair_code=ABCD-1234",consent+"&pair_id=x",consent+"#pair_code=ABCD-1234",consent.replace("scope=mcp","scope=admin")]){
    assert.throws(()=>validateConsentLocation(url,pair),/autorizad|corresponde/);
  }
});
function fixture({badRedirect=false,failCheck=false,failRevoke=false}={}){
  const calls=[], logs=[], opens=[];
  let clock=0,polls=0,revoked=false;
  const fetchImpl=async(url,init)=>{
    calls.push([url.pathname,init]);
    assert.equal(url.origin,SERVER_ORIGIN);
    assert.equal(init.redirect,url.pathname==="/authorize"?"manual":"error");
    if(url.pathname==="/api/mcp-info")return Response.json({protocol:REMOTE_PROTOCOL,supabaseUrl:SUPABASE_ORIGIN,supabasePublishableKey:"sb_publishable_example",pairingOnly:true});
    if(url.pathname==="/device/desktop/start")return Response.json({ok:true,pair_id:pair,pair_secret:secret,code:"ABCD-1234",expires_at:new Date(Date.now()+120000).toISOString()},{status:201});
    if(url.pathname==="/authorize")return new Response(null,{status:302,headers:{Location:badRedirect?"https://evil.example":consent}});
    if(url.pathname==="/device/pair/status"){
      assert.deepEqual(JSON.parse(init.body),{id:pair,secret});
      assert.equal(init.headers.Authorization,undefined);
      return Response.json(++polls===1?{status:"pending"}:{status:"approved",device_id:device,token,refresh_token:"R".repeat(54)});
    }
    assert.equal(init.headers.Authorization,"Bearer "+token);
    assert.deepEqual(JSON.parse(init.body),{device_id:device});
    if(url.pathname==="/device/desktop/session/check")return revoked?Response.json({ok:false},{status:401}):Response.json({ok:!failCheck,device_id:device,pairing_only:true});
    if(url.pathname==="/device/devices/self/revoke"){if(failRevoke)return Response.json({ok:false},{status:500});revoked=true;return Response.json({ok:true,device_id:device});}
    throw Error("Unexpected path");
  };
  const args={fetchImpl,notify:x=>logs.push(x),openBrowser:async x=>opens.push(x),delay:async ms=>{clock+=ms},monotonicNow:()=>clock,deviceName:"test"};
  return {args,calls,logs,opens};
}
test("fluxo completo confirma e revoga, sem sessão administrativa, sem expor tokens",async()=>{
  const f=fixture();
  assert.deepEqual(await runPairingTest(f.args),{paired:true,revoked:true});
  assert.deepEqual(f.opens,[consent+"#pair_code=ABCD-1234"]);
  const opened=new URL(f.opens[0]);
  assert.equal(opened.searchParams.has("pair_code"),false);
  assert.equal(opened.searchParams.has("pair_secret"),false);
  assert.ok(f.logs.includes(consent));
  assert.ok(f.logs.includes("Código de pareamento: ABCD-1234"));
  assert.ok(f.logs.every(l=>!l.includes("#pair_code=")));
  assert.equal(f.calls.filter(([p])=>p==="/device/desktop/session/check").length,2);
  assert.equal(f.calls.at(-2)[0],"/device/devices/self/revoke");
  assert.match(f.logs.at(-1),/^APROVADO/);
  assert.ok(f.logs.every(l=>!l.includes(secret)&&!l.includes(token)));
});
test("redirect incorreto não abre navegador nem consulta segredo",async()=>{
  const f=fixture({badRedirect:true});
  await assert.rejects(()=>runPairingTest(f.args),/Origem/);
  assert.equal(f.opens.length,0);
  assert.equal(f.calls.some(([p])=>p==="/device/pair/status"),false);
});
test("falha da prova ainda revoga; falha da revogação não declara aprovado",async()=>{
  const f=fixture({failCheck:true});
  await assert.rejects(()=>runPairingTest(f.args),/não comprovou/);
  assert.ok(f.calls.some(([p])=>p==="/device/devices/self/revoke"));
  const g=fixture({failRevoke:true});
  await assert.rejects(()=>runPairingTest(g.args),/Revogação não confirmada/);
  assert.equal(g.logs.some(l=>l.startsWith("APROVADO")),false);
});
