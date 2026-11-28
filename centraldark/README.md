# Pacote CentralDark em preparação

O motor upstream e os scripts de desenvolvimento originais continuam no repositório. O pacote raiz tem nome próprio, está privado e seu binário é a CLI CentralDark. Não há publicação NPM, release ou transferência de sessões do Desktop Commander original nesta etapa.

O contrato de descoberta usa GET https://mcp.centralldark.com/api/mcp-info: protocol = centraldark-device-v1, supabaseUrl = projeto CentralDark e supabasePublishableKey = chave pública. A CLI verifica exclusivamente a origem fixa e não envia tokens nem segue redirecionamentos. Por segurança, o comando remote não inicia o motor até existir a implementação validada de sessões de dispositivo segregadas; --check verifica somente descoberta, nunca prova pareamento ou conectividade.

Antes de liberar o motor: adaptar device/start, device/poll, device/revoke, regras RLS por sessão de dispositivo e canais Realtime privados; testar revogação, replay, usuário cruzado, expiração, concorrência e chamada de teste. Não reutilizar sessão administrativa nem conceder ao dispositivo a identidade completa do administrador. Adaptar os instaladores, diagnóstico, telemetria, diretório de dados e pipeline de publicação upstream antes de publicar.

O Supabase Auth da aplicação web permanece no projeto existente. Não há credenciais privadas no código.

## Prova de pareamento

Backend proposto no PR https://github.com/ServerVpss/CentralDark/pull/2191. Após deploy coordenado e feature flag habilitada, use `npm run start:centraldark -- remote --pair-test`. A CLI abre somente a tela do domínio MCP, preenche o código exibido no terminal para conferência e clique explícito do administrador autenticado no Supabase, recebe uma sessão opaca exclusiva de cinco minutos, confirma via API e revoga. Não salva credenciais e não marca o dispositivo online. Não há chamadas de ferramenta. Falha na revogação é reportada como pendência. CI usa fixtures, não prova o login real.
