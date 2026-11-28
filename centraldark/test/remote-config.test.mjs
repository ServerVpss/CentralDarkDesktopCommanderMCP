import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SERVER_ORIGIN, SUPABASE_ORIGIN, REMOTE_PROTOCOL, validatePublicKey, validateRemoteInfo, checkRemoteConfig } from "../remote-config.mjs";

const valid = { protocol: REMOTE_PROTOCOL, supabaseUrl: SUPABASE_ORIGIN, supabasePublishableKey: "sb_publishable_example", pairingOnly: true };
test("permite somente o projeto e protocolo CentralDark", () => {
  assert.deepEqual(validateRemoteInfo(valid), { protocol: REMOTE_PROTOCOL, serverOrigin: SERVER_ORIGIN, supabaseUrl: SUPABASE_ORIGIN });
  for (const supabaseUrl of ["http://lyoigsqluyktoclwdaft.supabase.co", "https://other.supabase.co", SUPABASE_ORIGIN + ":8443", SUPABASE_ORIGIN + "/path", SUPABASE_ORIGIN + ".example.org"]) {
    assert.throws(() => validateRemoteInfo({ ...valid, supabaseUrl }), /não autorizado/);
  }
  assert.throws(() => validateRemoteInfo({ ...valid, protocol: "old" }), /protocolo/);
});
test("recusa chaves secretas e tokens administrativos", () => {
  const jwt = (role, ref) => "header." + Buffer.from(JSON.stringify({ role, ref })).toString("base64url") + ".signature";
  assert.equal(validatePublicKey(jwt("anon", "lyoigsqluyktoclwdaft")), true);
  for (const key of ["sb_secret_example", jwt("service_role", "lyoigsqluyktoclwdaft"), jwt("anon", "other"), jwt("authenticated", "lyoigsqluyktoclwdaft"), "invalid"]) {
    assert.equal(validatePublicKey(key), false);
    assert.throws(() => validateRemoteInfo({ ...valid, supabasePublishableKey: key }), /Chave pública/);
  }
});
test("consulta somente a origem fixa e não segue redirecionamentos", async () => {
  const result = await checkRemoteConfig(async (url, init) => {
    assert.equal(url.href, SERVER_ORIGIN + "/api/mcp-info");
    assert.equal(init.redirect, "error");
    assert.equal(init.headers.Authorization, undefined);
    return new Response(JSON.stringify(valid), { status: 200 });
  });
  assert.equal(result.supabaseUrl, SUPABASE_ORIGIN);
  await assert.rejects(() => checkRemoteConfig(async () => new Response("", { status: 404 })), /HTTP 404/);
});
test("ajuda em português não inicia rede nem utiliza a CLI original", () => {
  const run = spawnSync(process.execPath, [fileURLToPath(new URL("../cli.mjs", import.meta.url)), "remote", "--help"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /CentralDark Desktop Commander MCP/);
  assert.match(run.stdout, /pareamento/);
  assert.match(run.stdout, /mcp.centralldark.com/);
});
