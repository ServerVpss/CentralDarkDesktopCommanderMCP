#!/usr/bin/env node
import { SERVER_ORIGIN, SUPABASE_ORIGIN, checkRemoteConfig } from "./remote-config.mjs";
import { runPairingTest } from "./pairing-test.mjs";

const help = `CentralDark Desktop Commander MCP

Uso:
  desktop-commander remote --check   Verificar configuração remota
  desktop-commander remote --pair-test  Confirmar pareamento e revogar sessão de teste
  desktop-commander remote --help    Exibir esta ajuda
  desktop-commander remote           Iniciar conexão (ainda bloqueada nesta versão)

Domínio: ${SERVER_ORIGIN}
Supabase: ${SUPABASE_ORIGIN}

Versão de desenvolvimento: o pareamento e a sessão de dispositivo ainda precisam
ser validados no servidor. Nenhum comando remoto é executado nesta versão.
Não utiliza a sessão, os instaladores ou a telemetria do serviço original.`;

const args = process.argv.slice(2);
if (!args.length || args.length === 1 && ["--help", "-h"].includes(args[0]) ||
    args[0] === "remote" && args.length === 2 && ["--help", "-h"].includes(args[1])) {
  console.log(help);
} else if (args.length === 2 && args[0] === "remote" && args[1] === "--pair-test") {
  try { await runPairingTest(); }
  catch (error) {
    const msg=error instanceof Error && !["TypeError","SyntaxError","TimeoutError","AbortError"].includes(error.name) ? error.message : "Comunicação interrompida. Uma sessão de teste emitida expira em até cinco minutos.";
    console.error("PENDENTE: "+msg);process.exitCode=1;
  }
} else if (args[0] === "remote" && (args.length === 1 || args.length === 2 && args[1] === "--check")) {
  try {
    console.log("CentralDark: verificando " + SERVER_ORIGIN);
    const info = await checkRemoteConfig();
    console.log("Configuração confirmada: " + info.supabaseUrl);
    console.log("Execute remote --pair-test para validar a autorização. Execução remota ainda bloqueada.");
    if (args.length === 1) process.exitCode = 1;
  } catch (error) {
    // Do not print response bodies, tokens or sensitive network error details.
    console.error("PENDENTE: " + (error instanceof Error && !["TypeError", "SyntaxError", "TimeoutError", "AbortError"].includes(error.name) ? error.message : "Não foi possível consultar a configuração remota."));
    process.exitCode = 1;
  }
} else {
  console.error("Comando indisponível nesta versão. Consulte remote --help.");
  process.exitCode = 1;
}
