/** Autorizacao OAuth MCP e pareamento em uma unica rota do Cockpit.
 * #OBSERVACOES#
 * @owner apps/instinto-superior/src/routes/mcp-autorizar.tsx
 * @doc_ref docs/RECEIPTS/2026-10-25-MCP-VSCODE-PAIRING-UNIFIED-CONSENT.md
 * @last_updated 2026-11-28T13:37:00Z
 * @implementado consentimento MCP + pareamento do Bridge/Vibe na mesma UI compacta;
 *  codigo vem da solicitacao criada pelo cliente, sem outro store ou segredo no navegador;
 *  visual a partir do HTML CentralDark em Downloads, sem importar handlers simulados.
 * @last_delta 2026-11-28: Codex CLI/Desktop CIMD compartilhado; abertura nativa somente opt-in;
 * fallback confirmado pendente na mesma aba, sem popup adicional.
 * @pendente prova visual do novo fluxo em navegador real; associação nativa depende do Windows.
 */
import { rememberPairing, pairingCodeFromFragment, isLoopbackOAuthCallback, validatedOAuthCallback, oauthCompletionReceipt, oauthClientPresentation, reserveOAuthReturnWindow, closeOAuthReturnWindow, canDeliverOAuthInBackground, deliverOAuthInBackground, oauthNativeLaunchUrl, deliverOAuthFallbackInCurrentTab } from "@/lib/return-to";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";



// Estes campos ja sao consumidos e validados pelo /authorize real.
// Nunca mover client_secret, pair_secret ou refresh_token para o navegador.
const CAMPOS = [
  "client_id", "redirect_uri", "response_type", "code_challenge",
  "code_challenge_method", "state", "scope", "pair_id", "pair_nonce",
] as const;
const CLIENTE_VSCODE = "centraldark.centraldark-vscode-restore";
const CLIENTE_BRIDGE = "centraldark.remote-bridge";

function MarcaROV() {
  // Mesmo SVG do template ROV CentralDark · OS (E:/CentralDark/.../ROV-CentralDark-Templates).
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2"
      className="size-[25px]" aria-hidden="true">
      <circle cx="16" cy="16" r="12" />
      <path d="M5.5 16c5.5-7 15.5-7 21 0-5.5 7-15.5 7-21 0Z" />
      <circle cx="16" cy="16" r="3.7" />
      <path d="M16 1v4m0 22v4M1 16h4m22 0h4" />
    </svg>
  );
}

export default function AutorizarMcp() {
  const [params, alterarParams] = useState<URLSearchParams | null>(null);
  const [pairCode, alterarPairCode] = useState("");
  const [erroEnvio, alterarErroEnvio] = useState("");
  const [enviando, alterarEnviando] = useState(false);
  const [confirmado, alterarConfirmado] = useState(false);
  const [completion, alterarCompletion] = useState<ReturnType<typeof oauthCompletionReceipt>>(null);
  const [estadoOAuth, alterarEstadoOAuth] = useState<"pending" | "authenticated" | "unconfirmed">("pending");
  const [callbackPendente, alterarCallbackPendente] = useState("");
  const janelaRetorno = useRef<Window | null>(null);
  const [retornoAutomatico, alterarRetornoAutomatico] = useState(false);
  const backgroundAttempt = useRef<{url:string; startedAt:number; pending:boolean} | null>(null);
  const backgroundAbort = useRef<AbortController | null>(null);
  const launchAttempt = useRef(false);
  const callbackDeliveryPending = useRef(false);
  useEffect(() => () => backgroundAbort.current?.abort(), []);

  useEffect(() => {
    if (!completion) return;
    const { receipt, expiresAt } = completion;
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const abort = new AbortController();
    // A consulta observa a emissão real da sessão, nunca usa o código como credencial.
    const deadline = Math.min(expiresAt, Date.now() + 60_000);
    async function consultar() {
      if (!ativo) return;
      if (Date.now() >= deadline) {
        backgroundAbort.current?.abort();
        backgroundAttempt.current = null;
        alterarEstadoOAuth("unconfirmed");
        alterarCallbackPendente("");
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!ativo) return;
        if (!data.session?.access_token) {
          alterarEstadoOAuth("unconfirmed");
          alterarCallbackPendente("");
          return;
        }
        const response = await fetch("/authorize", {
          method: "POST",
          headers: { Authorization: "Bearer " + data.session.access_token, Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded" },
          credentials: "omit", redirect: "error", cache: "no-store", signal: abort.signal,
          body: new URLSearchParams({action: "consent_status", receipt}).toString(),
        });
        const result = await response.json();
        if (!ativo) return;
        if (response.ok && result.ok === true && result.status === "authenticated") {
          backgroundAbort.current?.abort();
          backgroundAttempt.current = null;
          alterarEstadoOAuth("authenticated");
          alterarCallbackPendente("");
          return;
        }
        if (response.ok && result.ok === true && result.status === "pending" &&
            backgroundAttempt.current && Date.now() - backgroundAttempt.current.startedAt >= 10_000 &&
            !backgroundAttempt.current.pending && !callbackDeliveryPending.current) {
          // Do not replay automatically. Manual alternative only after server
          // confirms the grant is still pending and the attempt has ended.
          alterarCallbackPendente(backgroundAttempt.current.url);
        }
        if (response.status === 401 || response.status === 403) {
          alterarEstadoOAuth("unconfirmed");
          alterarCallbackPendente("");
          return;
        }
      } catch { /* Sem resposta não há prova de sucesso. */ }
      if (ativo) timer = setTimeout(consultar, 3000);
    }
    void consultar();
    return () => { ativo = false; abort.abort(); if (timer) clearTimeout(timer); };
  }, [completion]);

  useEffect(() => {
    if (estadoOAuth !== "authenticated" || !params) return;
    const appUrl = oauthNativeLaunchUrl(params, retornoAutomatico);
    const closeAfterLeaving = () => {
      // Do not dismiss a visible browser confirmation. A hidden tab after
      // handoff is only a cleanup opportunity, not proof the native app opened.
      if (launchAttempt.current && document.visibilityState === "hidden") {
        try { window.close(); } catch { /* Browser decides. */ }
      }
    };
    document.addEventListener("visibilitychange", closeAfterLeaving);
    closeOAuthReturnWindow(janelaRetorno.current);
    const timer = window.setTimeout(() => {
      closeOAuthReturnWindow(janelaRetorno.current);
      janelaRetorno.current = null;
      if (appUrl && !launchAttempt.current) {
        launchAttempt.current = true;
        try { window.location.assign(appUrl); } catch { /* Manual link remains available. */ }
      } else if (!oauthClientPresentation(params).appUrl && window.opener) {
        try { window.opener.focus(); window.close(); } catch { /* Manual return remains available. */ }
      }
    }, 3000);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", closeAfterLeaving); };
  }, [estadoOAuth, params, retornoAutomatico]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    alterarParams(query);
    const code = pairingCodeFromFragment(query, window.location.hash);
    const resumePath = window.location.pathname + window.location.search + (code ? "#pair_code="+code : "");
    if (code) {
      alterarPairCode(code);
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    if (!query.get("client_id")) return;
    let ativo = true;
    supabase.auth.getSession().then(({data, error}) => {
      if (ativo && (error || !data.session)) {
        rememberPairing(resumePath);
        window.location.replace("/auth");
      }
    }).catch(() => { if (ativo) alterarErroEnvio("Não foi possível verificar sua sessão. Entre novamente."); });
    return () => { ativo = false; };
  }, []);

  const clientId = params?.get("client_id") ?? "";
  const dispositivo = clientId === CLIENTE_BRIDGE || clientId === CLIENTE_VSCODE;
  const apresentacao = oauthClientPresentation(params || new URLSearchParams());
  const nome = dispositivo
    ? (clientId === CLIENTE_BRIDGE ? "CentralDark Remote Bridge" : "CentralDark · Vibe Coding")
    : apresentacao.name;
  const sucesso = (confirmado && dispositivo) || estadoOAuth === "authenticated";
  const falha = params?.get("error") || "";
  const scopes = (params?.get("scope") || "mcp").split(/\s+/).filter(Boolean);
  const pedidoCompleto = dispositivo
    ? Boolean(params?.get("pair_id") && params?.get("pair_nonce"))
    : Boolean(clientId && params?.get("redirect_uri") && params?.get("response_type") === "code"
      && params?.get("code_challenge") && params?.get("code_challenge_method") === "S256");
  const autorizado = pedidoCompleto && (!dispositivo || /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(pairCode.trim()));
  const titulo = dispositivo ? "Confirmar pareamento" : "Autorizar acesso MCP";

  async function enviarConsentimento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!params || !autorizado || enviando) return;
    // currentTarget pertence ao evento síncrono: capturar ANTES do primeiro await.
    const formulario = event.currentTarget;
    if (!(formulario instanceof HTMLFormElement)) {
      alterarErroEnvio("Formulário de autorização indisponível.");
      return;
    }
    const body = new URLSearchParams();
    new FormData(formulario).forEach((value, key) => {
      if (typeof value === "string") body.append(key, value);
    });
    alterarEnviando(true);
    alterarErroEnvio("");
    let retorno: Window | null = null;
    // Known Codex callback attempts background first; other clients retain
    // the previously supported navigation.
    const tentarSegundoPlano = apresentacao.appUrl === "codex://settings";
    if (!dispositivo && !tentarSegundoPlano && isLoopbackOAuthCallback(params.get("redirect_uri") || "")) {
      retorno = reserveOAuthReturnWindow();
    }
    try {
      // Reutilizar o Supabase Auth existente, com sessão própria deste domínio.
      // O servidor valida JWT, user_roles e escopo; sessão local não autoriza por si só.
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) {
        const fragment = "#pair_code="+pairCode.trim();
        const code = pairingCodeFromFragment(params, fragment);
        rememberPairing(window.location.pathname + window.location.search + (code ? fragment : ""));
        try { retorno?.close(); } catch { /* popup unavailable */ }
        window.location.replace("/auth");
        return;
      }

      const response = await fetch("https://mcp.centralldark.com/authorize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "omit",
        redirect: "error",
        body: body.toString(),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error_description || result.error || "Não foi possível autorizar esta solicitação.");
      }
      if (dispositivo) {
        alterarConfirmado(true);
        return;
      }
      const destino = validatedOAuthCallback(String(result.redirect_to || ""), params);
      const receipt = oauthCompletionReceipt(result);
      if (receipt && isLoopbackOAuthCallback(destino.toString())) {
        alterarCompletion(receipt);
        alterarEstadoOAuth("pending");
        if (canDeliverOAuthInBackground(params, destino)) {
          const controller = new AbortController();
          backgroundAbort.current = controller;
          const attempt = {url:destino.href, startedAt:Date.now(), pending:true};
          backgroundAttempt.current = attempt;
          const timeout = window.setTimeout(() => controller.abort(), 8000);
          void deliverOAuthInBackground(params, destino, controller.signal).catch(() => {
            // Permission or transport failure does not mean the code was
            // never delivered. Wait for server receipt/pending state.
          }).finally(() => { attempt.pending = false; window.clearTimeout(timeout); });
          return;
        }
        if (retorno && !retorno.closed) {
          try {
            janelaRetorno.current = retorno;
            retorno.location.replace(destino.toString());
          } catch {
            closeOAuthReturnWindow(retorno);
            janelaRetorno.current = null;
            alterarCallbackPendente(destino.toString());
          }
        } else {
          alterarCallbackPendente(destino.toString());
        }
        return;
      }
      // Servidores anteriores e clientes HTTPS externos recebem o retorno registrado.
      try { retorno?.close(); } catch { /* popup unavailable */ }
      window.location.assign(destino.toString());
    } catch (error) {
      try { retorno?.close(); } catch { /* popup unavailable */ }
      alterarErroEnvio(error instanceof Error ? error.message : "Falha na autorização. Confira sua sessão na CentralDark.");
    } finally {
      alterarEnviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-3 py-5 text-foreground sm:px-5"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", width: "100%", padding: "20px 12px", boxSizing: "border-box" }}>
      <section className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-border bg-card shadow-deep"
        style={{ width: "100%", maxWidth: "480px", marginInline: "auto", boxSizing: "border-box" }}
        aria-label="Autorizacao CentralDark">
        <div className="h-0.5 bg-gradient-to-r from-gold/20 via-gold to-gold/20" aria-hidden="true" />
        <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
          <header className="flex items-center gap-3">
            <div className="grid size-[38px] shrink-0 place-items-center rounded-[11px] border border-gold/40 bg-background text-gold">
              <MarcaROV />
            </div>
            <div>
              <strong className="block text-[16px] font-semibold leading-tight tracking-tight">CentralDark</strong>
              <small className="block font-mono text-[9px] tracking-widest text-muted-foreground">CENTRALDARK · OS</small>
            </div>
            <span className="ml-auto flex items-center gap-1 rounded-full border border-gold/30 px-2 py-1 font-mono text-[9px] font-medium tracking-wide text-gold">
              <LockKeyhole aria-hidden="true" className="size-3" /> {dispositivo ? "PAREAMENTO" : "OAUTH · PKCE"}
            </span>
          </header>

          {sucesso ? (
            <div role="status" className="space-y-3 py-3 text-center">
              <ShieldCheck aria-hidden="true" className="mx-auto size-9 text-neon-green" />
              <h1 className="text-xl font-semibold">{dispositivo ? "Confirmação enviada" : "Autenticado com sucesso"}</h1>
              <p className="text-sm text-muted-foreground">
                Retorne ao {nome} e confira o estado da conexão no próprio aplicativo.
              </p>
              <p className="text-xs text-muted-foreground">
                {dispositivo ? "Volte ao terminal para conferir a sessão." : "A sessão OAuth foi emitida pelo servidor. Confira as ferramentas no aplicativo."} Nenhum token é exibido nesta página.
              </p>
              {!dispositivo && (
                <>
                  <p className="text-xs text-muted-foreground">Se iniciou pelo terminal, retorne ao terminal. Se o navegador não fechar esta aba, pode fechá-la manualmente.</p>
                  {apresentacao.appUrl && <>
                    {retornoAutomatico && <p className="text-xs text-muted-foreground">Retorno automático em 3 segundos. Confirme a abertura se o navegador solicitar.</p>}
                    <a className="inline-block rounded-md border border-gold/40 px-4 py-2 text-sm text-gold"
                      href={apresentacao.appUrl} onClick={() => {launchAttempt.current = true;}}>Abrir aplicativo Codex (opcional)</a>
                  </>}
                  <Button type="button" variant="outline" onClick={() => {
                    closeOAuthReturnWindow(janelaRetorno.current);
                    window.close();
                  }}>Fechar esta tela e voltar ao {nome}</Button>
                </>
              )}
            </div>
          ) : completion ? (
            <div role="status" className="space-y-3 py-3 text-center">
              <ShieldCheck aria-hidden="true" className="mx-auto size-9 text-gold" />
              <h1 className="text-xl font-semibold">{estadoOAuth === "unconfirmed" ? "Conexão ainda não confirmada" : "Permissão concedida"}</h1>
              <p className="text-sm text-muted-foreground">
                {estadoOAuth === "unconfirmed"
                  ? "O aplicativo não concluiu a troca OAuth neste prazo. Inicie uma nova conexão no aplicativo, com o retorno local ativo."
                  : "Aguardando o aplicativo concluir a autenticação. Esta tela confirma automaticamente quando a sessão OAuth for emitida."}
              </p>
              {callbackPendente && estadoOAuth === "pending" && (
                <a className="inline-block rounded-md border border-gold/40 px-4 py-2 text-sm text-gold"
                  href={callbackPendente}
                  onClick={event => {
                    callbackDeliveryPending.current = true;
                    backgroundAttempt.current = null;
                    // The background request may be blocked by browser loopback
                    // permissions. The server still reports pending, so the user
                    // may complete the exact registered callback in this same tab.
                    if (params && canDeliverOAuthInBackground(params, new URL(callbackPendente))) {
                      event.preventDefault();
                      deliverOAuthFallbackInCurrentTab(params, new URL(callbackPendente));
                      return;
                    }
                    const popup = reserveOAuthReturnWindow();
                    // If the popup is blocked, the original registered link still
                    // works in this tab. Never retry an already delivered code.
                    if (!popup) return;
                    event.preventDefault();
                    try {
                      janelaRetorno.current = popup;
                      popup.location.replace(callbackPendente);
                      alterarCallbackPendente("");
                    } catch {
                      closeOAuthReturnWindow(popup);
                      janelaRetorno.current = null;
                      window.location.assign(callbackPendente);
                    }
                  }}>{apresentacao.appUrl === "codex://settings" ? "Concluir nesta aba (sem janela auxiliar)" : "Concluir no aplicativo"}</a>
              )}
              <p className="text-xs text-muted-foreground">O retorno OAuth utiliza o endereço registrado pelo aplicativo. Nenhum código ou token é exibido.</p>
            </div>
          ) : !params ? (
            <p role="status" className="py-4 text-sm text-muted-foreground">Carregando solicitação…</p>
          ) : !clientId ? (
            <p role="alert" className="py-4 text-sm text-muted-foreground">
              Inicie a conexão pelo cliente MCP ou pelo aplicativo CentralDark para receber uma solicitação válida.
            </p>
          ) : (
            <>
              <div className="space-y-1 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
                <p className="break-words text-xs leading-5 text-muted-foreground">
                  <strong className="font-semibold text-foreground">{nome}</strong>
                  {dispositivo ? " solicita conectar este dispositivo à CentralDark." : " solicita acesso aos recursos da sua CentralDark."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-center" aria-label="Conexao solicitada">
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-2 py-2">
                  <p className="text-[10px] font-semibold text-foreground">CentralDark</p>
                  <p className="font-mono text-[9px] text-muted-foreground">PROPRIETÁRIO</p>
                </div>
                <LockKeyhole className="size-4 shrink-0 text-gold" aria-hidden="true" />
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-2 py-2">
                  <p className="truncate text-[10px] font-semibold text-foreground" title={nome}>{nome}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {dispositivo ? "DISPOSITIVO" : "CLIENTE MCP"}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-background/50">
                <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                  <strong className="text-xs">Permissões solicitadas</strong>
                  <span className="truncate font-mono text-[10px] text-gold">{scopes.join(" ")}</span>
                </div>
                <div className="space-y-0 px-3">
                  <div className="flex items-center gap-2 border-b border-border py-2.5">
                    <KeyRound className="size-4 shrink-0 text-gold" aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-xs">{dispositivo ? "Confirmar autorização de pareamento" : "Acessar o MCP com os escopos aprovados"}</p>
                    <Check className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2 py-2.5">
                    <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-xs">
                      {scopes.includes("admin") ? "Inclui acesso administrativo solicitado" : dispositivo ? "O teste de pareamento não libera execução remota" : "Acesso limitado às permissões da conta"}
                    </p>
                    <Check className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {(erroEnvio || falha) && (
                <p role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {erroEnvio || falha}
                </p>
              )}

              <form method="post" action="https://mcp.centralldark.com/authorize" onSubmit={enviarConsentimento} className="space-y-3">
                <input type="hidden" name="auth_method" value="code" />
                {CAMPOS.map(campo => (
                  <input key={campo} type="hidden" name={campo} value={params.get(campo) || ""} />
                ))}
                {dispositivo && (
                  <label className="block text-xs">
                    Confira o código apresentado no terminal antes de confirmar
                    <input type="text" name="pair_code" autoComplete="off" required
                      maxLength={9} pattern="[A-F0-9]{4}-[A-F0-9]{4}"
                      value={pairCode} onChange={e => alterarPairCode(e.target.value.toUpperCase())}
                      className="mt-2 block h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm uppercase tracking-widest"
                      placeholder="0000-0000" />
                  </label>
                )}
                {!pedidoCompleto && (
                  <p role="alert" className="text-xs text-destructive">
                    Solicitação incompleta. Reabra a conexão pelo aplicativo solicitante.
                  </p>
                )}
                {apresentacao.appUrl && !dispositivo && (
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="mt-0.5" checked={retornoAutomatico}
                      onChange={event => alterarRetornoAutomatico(event.target.checked)} disabled={enviando}/>
                    Se iniciou pelo Codex Desktop, marque para abrir o aplicativo automaticamente após autenticar. Pelo terminal, deixe desmarcado.
                  </label>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="glow-gold" disabled={!autorizado || enviando}>
                    {enviando ? "Validando sessão..." : dispositivo ? "Confirmar" : "Autorizar"}
                  </Button>
                </div>
              </form>
              <p className="flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3 text-gold" aria-hidden="true" />
                A sessão e as permissões são validadas pelo servidor.
              </p>
            </>
          )}
          {estadoOAuth !== "authenticated" && <a className="block text-center text-xs text-muted-foreground underline-offset-4 hover:text-gold hover:underline" href="/">Voltar ao MCP</a>}
        </div>
      </section>
    </main>
  );
}
