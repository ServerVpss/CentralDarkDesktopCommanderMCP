# CentralDark · MCP — login e pareamento

Aplicação React isolada para a interface de conexão; não é o servidor MCP nem um painel administrativo. Porta a UI existente do CentralDark (login, Google, recuperação, retorno OAuth, consentimento e confirmação humana). Não transporta o Core, o motor local, credenciais, stores ou o dashboard. Preserva a API de autorização em https://mcp.centralldark.com/authorize.

## Desenvolvimento e publicação

Node >=22.12; `npm install`, `npm test`, `npm run build` dentro de `web/`. Cloudflare Pages: diretório raiz `web`, comando `npm run build`, saída `dist`. Configure apenas VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY do projeto autorizado existente; jamais service_role ou sb_secret_. Sem configuração, a UI fica explicitamente indisponível. A sessão do novo domínio é própria; não se copiam tokens de admin.centralldark.com. Não configure credenciais reais em previews públicos não aprovados.

## Proveniência e limites

Fonte: https://github.com/ServerVpss/CentralDark/tree/main/CentralDark-Core/apps/instinto-superior/src
- routes/auth.tsx: 90fe66cc0f63782769551e478236acfc55ecc9f4
- routes/mcp-autorizar.tsx: 79c3b42f45c735917fb9e2e854a8a7c4f0ff08d1
- routes/auth.callback.tsx: e517ed849dc3363f93c94daebfaaa281cd51d625
- routes/reset-password.tsx: 8c664f926ed7434fc48d174d7c09acac0dbff545
- components/ui/button.tsx: bc3bc9f6bbefc3155d1f4d053ff58f9b8662edbe
- components/ui/input.tsx: 7db524115c08e80b10d5282d1bb504b06b238d17
- lib/utils.ts: a5ef193506d07d0459fec4f187af08283094d7c8
- styles.css: c1efb3e7453bc6235ba44a406410db6884ab71e6

Pendências antes da troca de domínio: validar e permitir exclusivamente a nova origem MCP no backend /authorize; ajustar URLs de consentimento, documentação e /status; autorizar callbacks exatos no Supabase; conservar o túnel/API até existir encaminhamento de todas as rotas MCP/OAuth; compatibilizar /device/start, /device/poll e /api/mcp-info do fork com o backend existente e sessões de dispositivo segregadas. Não promover token administrativo a token de dispositivo nem aceitar cliente novo por mudança apenas de UI. Testar anônimo, usuário comum, admin, expiração, nonce, replay e confirmação humana, além de tools/list e uma chamada inofensiva. A aplicação não declara computador conectado sem prova de execução do cliente. Nenhuma alteração de produção foi feita por este PR.

## Origem de autenticação CentralDark

A interface aceita somente o projeto Supabase `lyoigsqluyktoclwdaft` e uma chave pública. A chave deve ser injetada pelo ambiente da publicação. Não copie sessões do cockpit para o dispositivo. O backend ainda deve implementar e testar o protocolo de pareamento e o isolamento das sessões antes de liberar execução remota.
