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

Estado da integração: o domínio MCP e a API de autorização existentes estão publicados; o OAuth por conta usa Supabase Auth e os papéis vigentes. O pareamento temporário Desktop foi comprovado. Ainda faltam autenticação real de cada cliente MCP, renovação persistente e execução remota multicliente. Nunca promover token administrativo a token de dispositivo, nem considerar um HTTP 200 prova da conexão.

## Origem de autenticação CentralDark

A interface aceita somente o projeto Supabase `lyoigsqluyktoclwdaft` e uma chave pública. A chave deve ser injetada pelo ambiente da publicação. Não copie sessões do cockpit para o dispositivo. O backend ainda deve implementar e testar o protocolo de pareamento e o isolamento das sessões antes de liberar execução remota.

A página do fork preenche o código exibido pelo NPX a partir de um fragmento local restrito ao pedido Bridge válido, remove o fragmento da barra de endereço e pede conferência com o terminal e clique explícito. O retorno após login conserva esse pedido na sessão da aba e o consome uma vez. A digitação continua disponível como fallback. Ignora sucesso e código recebidos por query; só exibe confirmação após resposta de sucesso do backend. Nenhum segredo de posse ou token é levado ao navegador pelo NPX. Backend de pareamento: PR https://github.com/ServerVpss/CentralDark/pull/2191. A publicação e o pareamento temporário NPX foram comprovados em 28/11/2026.

## Login no domínio MCP

A landing em / permanece independente; /auth usa e-mail/senha, cadastro e recuperação existentes. A preferência opcional Lembrar meu e-mail guarda somente o endereço, nunca a senha. A sessão mantém a política do cliente Supabase. O retorno de autenticação consome uma única vez o caminho de consentimento permitido. O botão Google consulta as configurações públicas e fica indisponível enquanto o provedor não estiver habilitado. A validação TypeScript roda antes do build. Para confirmação por e-mail, OAuth e recuperação, conferir os retornos exatos https://mcp.centralldark.com/auth/callback e https://mcp.centralldark.com/reset-password no Supabase. Não alterar Site URL do projeto compartilhado nem conceder papel administrativo ao criar conta.

## Conclusão OAuth local (28/11/2026)

A mesma tela de consentimento acompanha o retorno loopback do cliente MCP. Após consentimento explícito, o código é entregue somente ao callback registrado, em uma janela de retorno aberta pelo gesto do usuário; se o navegador bloquear a janela, existe a opção Concluir no aplicativo. O endereço do callback não é trocado pelo domínio da CentralDark. A tela original mostra Permissão concedida e consulta o recibo temporário da conta no mesmo `POST /authorize`. Só mostra Autenticado com sucesso depois da emissão do token OAuth pelo servidor; se não houver confirmação no prazo, pede iniciar outra conexão no aplicativo. Nenhum token ou código aparece no texto da página ou é persistido pelo componente. O recibo não autentica chamadas MCP, expira e exige a mesma conta/sessão/papel. Clientes HTTPS externos mantêm o redirecionamento registrado normal.

Backend: [Core e99a9b4](https://github.com/ServerVpss/CentralDark/commit/e99a9b4c422e1bc88c46dcd4eebe57dfe6235030). Testes web 9/9, typecheck e build aprovados. Testes backend em contêiner isolado 18/18, incluindo isolamento do recibo e PKCE negativo. Autenticação real pelo Codex/ChatGPT, persistência de sessão e execução de ferramenta continuam dependentes de provas próprias. Não há mudança no ZIP, no NPX, na identidade do plugin ou no endpoint /api/mcp.
