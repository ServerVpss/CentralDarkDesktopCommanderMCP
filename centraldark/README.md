# Pacote CentralDark em preparação

O motor upstream e os scripts de desenvolvimento originais continuam no repositório. O pacote raiz tem nome próprio, está privado e seu binário é a CLI CentralDark. Não há publicação NPM, release ou transferência de sessões do Desktop Commander original nesta etapa.

O contrato de descoberta usa GET https://mcp.centralldark.com/api/mcp-info: protocol = centraldark-device-v1, supabaseUrl = projeto CentralDark e supabasePublishableKey = chave pública. A CLI verifica exclusivamente a origem fixa e não envia tokens nem segue redirecionamentos. Por segurança, o comando remote não inicia o motor até existir a implementação validada de sessões de dispositivo segregadas; --check verifica somente descoberta, nunca prova pareamento ou conectividade.

Antes de liberar o motor: adaptar device/start, device/poll, device/revoke, regras RLS por sessão de dispositivo e canais Realtime privados; testar revogação, replay, usuário cruzado, expiração, concorrência e chamada de teste. Não reutilizar sessão administrativa nem conceder ao dispositivo a identidade completa do administrador. Adaptar os instaladores, diagnóstico, telemetria, diretório de dados e pipeline de publicação upstream antes de publicar.

O Supabase Auth da aplicação web permanece no projeto existente. Não há credenciais privadas no código.

## Prova de pareamento

Backend proposto no PR https://github.com/ServerVpss/CentralDark/pull/2191. Após deploy coordenado e feature flag habilitada, use `npm run start:centraldark -- remote --pair-test`. A CLI abre somente a tela do domínio MCP, preenche o código exibido no terminal para conferência e clique explícito do administrador autenticado no Supabase, recebe uma sessão opaca exclusiva de cinco minutos, confirma via API e revoga. Não salva credenciais e não marca o dispositivo online. Não há chamadas de ferramenta. Falha na revogação é reportada como pendência. CI usa fixtures, não prova o login real.

## Consolidação do motor MCP — catálogo de capacidades

Owner de destino único: este fork. Core conserva governança, memória e domínios; MCP atual permanece ativo até paridade integral comprovada. [Inventário de migração medido](mcp-migration-baseline.json): 164 ferramentas/27 famílias, 163 nomes ausentes no registro do fork, coincidência read_file ainda não equivalente (VPS versus filesystem local). O JSON é snapshot de trabalho, não segundo catálogo executável. O registro real continua em src/server.ts. A matriz deve cobrir também contratos OAuth, dispositivo/conta, recursos, rotas, eventos, stores, política, auditoria e consumidores.

### Setor Windows — primeira capacidade candidata

`notepad_search_context`: consulta literal local de TabState, somente leitura e metadados, sem abrir janela. Opt-in por processo local Windows (CENTRALDARK_NOTEPAD_CONTEXT_LOCAL=1); excluído do child DC_REMOTE_DEVICE=true e recusado para calls com metadata remote. Usa validatePath/allowedDirectories, verifica identidade/tamanho/mtime, não segue links, limita arquivos/bytes/resultados, deduplica por ID; não afirma que a aba está ativa ou nunca salva. O caminho deriva do LOCALAPPDATA do próprio usuário; nenhuma opção de caminho arbitrário. Não retorna texto bruto, não grava args/resultado no histórico genérico. O comportamento completo de privacidade/telemetria e a leitura autorizada de trechos exigem provas adicionais.

Leitor em [src/tools/windows-notepad.ts](../src/tools/windows-notepad.ts) e teste [test/test-notepad-context.js](../test/test-notepad-context.js). Compilação TypeScript isolada e 6/6 testes sintéticos aprovados; blobs testados 4f92d590d02fb671204262ab5212aee22d76ca1d / ba49236cd977e14cfd5b7b296d15c766bed098d4. Registro integrado no source em 90bd39949d844390ea87902bf01881e7f9e52e1b. Rodar npm run build e node --test test/test-notepad-context.js no fork completo. Build integral, list/call autenticados no runtime, empacotamento e exposição remota ainda não provados. Não habilitar o recurso remotamente antes da prova do isolamento e autorização por conta/dispositivo.

Rastro: [CentralDark #2172](https://github.com/ServerVpss/CentralDark/pull/2172) · [HUD #1977](https://github.com/ServerVpss/CentralDark/pull/1977) · [fork #1](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/pull/1). Sem novo serviço, novo catálogo autoritativo ou corte de produção.
