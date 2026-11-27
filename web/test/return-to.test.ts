import test from "node:test";
import assert from "node:assert/strict";
import { safePairingPath } from "../src/lib/return-to.ts";
test("continua a solicitação no mesmo domínio",()=>assert.equal(safePairingPath("/mcp-autorizar?client_id=centraldark.remote-bridge&pair_id=a&pair_nonce=b&pair_code=1234"),"/mcp-autorizar?client_id=centraldark.remote-bridge&pair_id=a&pair_nonce=b&pair_code=1234"));
test("rejeita redirecionamento externo e caminhos não autorizados",()=>{for(const p of ["https://evil.example/mcp-autorizar?client_id=a","//evil.example/","/auth?next=x","/mcp-autorizar?client_id=a#token","/mcp-autorizar?pair_id=a","/mcp-autorizar?client_id=a&client_id=b"])assert.equal(safePairingPath(p),null);});
test("não preserva tokens nem parâmetros desconhecidos",()=>assert.equal(safePairingPath("/mcp-autorizar?client_id=a&access_token=secret&refresh_token=secret"),"/mcp-autorizar?client_id=a"));
