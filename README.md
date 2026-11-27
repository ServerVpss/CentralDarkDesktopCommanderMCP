# CentralDark Desktop Commander MCP

### Pesquise, atualize e gerencie arquivos e execute comandos no terminal com IA

> Fork do [Desktop Commander MCP](https://github.com/wonderwhy-er/DesktopCommanderMCP), de Eduards Ruzga e colaboradores, sob licença MIT. Mantemos a compatibilidade com o original e as atribuições. Os selos, estatísticas, integrações e depoimentos abaixo são do projeto original, não certificações nem números de uso da CentralDark.

[![downloads NPM (original)](https://img.shields.io/npm/dw/@wonderwhy-er/desktop-commander)](https://www.npmjs.com/package/@wonderwhy-er/desktop-commander)
[![Verificação AgentAudit (original)](https://agentaudit.dev/api/badge/desktop-commander)](https://agentaudit.dev/skills/desktop-commander)
[![Índice de confiança (original)](https://archestra.ai/mcp-catalog/api/badge/quality/wonderwhy-er/DesktopCommanderMCP)](https://archestra.ai/mcp-catalog/wonderwhy-er__desktopcommandermcp)
[![Selo Smithery (original)](https://smithery.ai/badge/@wonderwhy-er/desktop-commander)](https://smithery.ai/server/@wonderwhy-er/desktop-commander)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg)](https://www.buymeacoffee.com/wonderwhyer)


[![Discord](https://img.shields.io/badge/Join%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/kQ27sNnZr7)

Trabalhe com código e texto, execute processos e automatize tarefas além dos editores de IA tradicionais, utilizando os recursos do cliente de IA em vez de depender necessariamente de créditos de API.

<a href="https://glama.ai/mcp/servers/zempur9oh4">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/zempur9oh4/badge" alt="Desktop Commander MCP" />
</a>

## Conexão remota CentralDark

**Endereço planejado:** [mcp.centralldark.com](https://mcp.centralldark.com).

**Comando próprio — pacote privado em preparação, ainda não publicado:**

```bash
npx @centraldark/desktop-commander@latest remote
```

A primeira versão terá login com o Supabase existente, confirmação do código de pareamento no navegador e execução no computador autorizado. A interface React fica em [web/](web/). Não é necessário um túnel individual ou Docker no computador do usuário para o modelo de conexão de saída.

**Prévia local CentralDark:** na raiz do fork, execute `npm run test:centraldark` ou `npm run start:centraldark -- remote --help`. A opção `remote --check` consulta exclusivamente o nosso servidor. A execução remota está bloqueada até a validação do pareamento e da sessão dedicada; não se utiliza a autenticação do serviço original.

**Estado atual:** o pacote publicado, os instaladores automáticos, a autenticação remota e as integrações nas instruções originais abaixo ainda pertencem ao Desktop Commander original. O domínio MCP da CentralDark já existe, mas não está integrado a este fork. Não use o comando previsto como se já estivesse publicado. A integração, o deploy e a validação do pareamento estão pendentes. Os comandos técnicos e identificadores do protocolo permanecem em inglês por compatibilidade.

## Sumário

- [Recursos](#features)
- [Como instalar](#how-to-install)
- [Primeiros passos](#getting-started)
- [Uso](#usage)
- [Prévia de arquivos e editor Markdown](#file-preview-ui--markdown-editor)
- [Comandos de longa duração](#handling-long-running-commands)
- [Configuração](#configuration-management)
- [Roteiro e pendências](#roadmap)
- [Patrocinadores e apoiadores](#support-desktop-commander)
- [Site](#website)
- [Mídia](#media)
- [Depoimentos](#testimonials)
- [Perguntas frequentes](#frequently-asked-questions)
- [Contribuição](#contributing)
- [Licença](#license)

Todas as ferramentas de desenvolvimento com IA em um só lugar. O Desktop Commander reúne ferramentas de desenvolvimento em uma conversa. Execute comandos de longa duração no seu computador e gerencie processos pelo Model Context Protocol (MCP). Construído sobre o [MCP Filesystem Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem), acrescenta operações de pesquisa e substituição em arquivos.

<a id="features"></a>

## Recursos

- **Controle remoto com IA** — use o Desktop Commander no ChatGPT, Claude web e outros serviços por meio do [MCP remoto original](https://mcp.desktopcommander.app).
- **Prévia visual de arquivos** — no Claude Desktop, renderize Markdown, imagens, conteúdo expansível e use o editor Markdown integrado e o acesso rápido à pasta.
- **Comandos aprimorados de terminal com controle interativo de processos**.
- **Execute código em memória (Python, Node.js, R) sem salvar arquivos**.
- **Análise de dados instantânea** — peça análises de CSV, JSON ou Excel.
- **Suporte nativo a Excel** — leia, escreva, edite e pesquise arquivos .xlsx, .xls e .xlsm sem ferramentas externas.
- **Suporte a PDF** — extraia texto, crie PDFs a partir de Markdown e modifique PDFs existentes.
- **Suporte a DOCX** — leia, crie, edite e pesquise documentos Word, com edição pontual de XML e conversão de Markdown para DOCX.
- **Interaja com processos ativos** (SSH, bancos de dados, servidores de desenvolvimento).
- Execute comandos com transmissão da saída em tempo real.
- Suporte a tempo limite e execução em segundo plano.
- Gerenciamento de processos (listar e encerrar).
- Gerenciamento de sessões de comandos de longa duração.
- **Paginação da saída de processos** — use deslocamento e comprimento para evitar estourar o contexto.
- Gerenciamento da configuração do servidor:
  - Consulte e altere valores.
  - Atualize várias configurações.
  - Altere configurações dinamicamente sem reiniciar o servidor.
- Operações completas do sistema de arquivos:
  - Leia e escreva arquivos de texto, Excel, PDF e DOCX.
  - Crie e liste diretórios.
  - **Listagem recursiva** com profundidade configurável e proteção contra excesso de contexto em pastas grandes.
  - Mova arquivos e diretórios.
  - Pesquise arquivos e conteúdo, inclusive Excel.
  - Consulte metadados de arquivos.
  - **Leitura com deslocamento negativo** — leia a partir do fim do arquivo, como o comando Unix tail.
- Edição de código:
  - Substituições pontuais para pequenas alterações.
  - Reescrita integral para mudanças maiores.
  - Suporte a vários arquivos.
  - Substituição por padrões.
  - Busca recursiva de código e texto com vscode-ripgrep.
- Histórico local e registros de auditoria:
  - Chamadas e argumentos são registrados na máquina que executa o Desktop Commander.
  - O histórico recente, com prévias limitadas dos resultados, está disponível em `get_recent_tool_calls`.
  - Rotação e redução por tamanho limitam os arquivos de histórico ativos.
- Proteções contra acidentes (não são uma caixa de isolamento; veja [SECURITY.md](SECURITY.md)):
  - Prevenção de travessia por links simbólicos nas operações de arquivos.
  - Lista de bloqueio de comandos para reduzir execuções acidentais.
  - [Isolamento com Docker](#option-6-docker-installation--auto-updates-no-nodejs-required) quando corretamente configurado.

<a id="how-to-install"></a>

## Como instalar

**Instruções de compatibilidade com o projeto original.** Os comandos abaixo usam os pacotes e serviços originais, exceto quando explicitamente identificados como comandos de desenvolvimento do fork.

Para ChatGPT, Claude web e outros clientes remotos, consulte os [inicializadores de dispositivo remoto](scripts/remote/README.md). Eles instalam o Node.js quando necessário e executam o Desktop Commander Remote no macOS, Linux ou Windows.

### Instalar no Claude Desktop

Há vários métodos de instalação para o Claude Desktop.

> **📋 Atualização e desinstalação:** as opções 1, 2, 3, 4 e 6 têm atualização automática conforme o comportamento documentado pelo original. A opção 5 exige atualização manual.

<details>
<summary><b>Opção 1: instalar pelo npx ⭐ Atualização automática (requer Node.js)</b></summary>

Execute no terminal:

```
npx @wonderwhy-er/desktop-commander@latest setup
```

Para modo de depuração, que permite conectar o inspetor do Node.js:

```
npx @wonderwhy-er/desktop-commander@latest setup --debug
```

**Opções de linha de comando durante a instalação:**

- `--debug`: ativa a depuração pelo inspetor do Node.js.
- `--no-onboarding`: desativa os avisos introdutórios para novos usuários.

Reinicie o Claude se estiver aberto.

**✅ Atualização automática:** sim, ao reiniciar o Claude.  
**🔄 Atualização manual:** execute novamente o comando de instalação.  
**🗑️ Desinstalação:** execute `npx @wonderwhy-er/desktop-commander@latest remove`.

</details>

<details>
<summary><b>Opção 2: instalador Bash (macOS) ⭐ Atualização automática (instala Node.js se necessário)</b></summary>

```
curl -fsSL https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install.sh | bash
```

O script original configura as dependências e a instalação automaticamente. Revise o script antes de executá-lo.

**✅ Atualização automática:** sim.  
**🔄 Atualização manual:** execute novamente o instalador Bash acima.  
**🗑️ Desinstalação:** execute `npx @wonderwhy-er/desktop-commander@latest remove`.

</details>

<details>
<summary><b>Opção 3: instalar pelo Smithery ⭐ Atualização automática (requer Node.js)</b></summary>

1. **Acesse:** https://smithery.ai/server/@wonderwhy-er/desktop-commander
2. **Entre no Smithery**, se necessário.
3. **Selecione seu cliente** (Claude Desktop) à direita.
4. **Instale com a chave fornecida** depois de selecionar o cliente.
5. **Reinicie o Claude Desktop**.

**✅ Atualização automática:** sim, ao reiniciar o Claude.  
**🔄 Atualização manual:** acesse a página do Smithery e reinstale.

</details>

<details>
<summary><b>Opção 4: adicionar manualmente ao claude_desktop_config ⭐ Atualização automática (requer Node.js)</b></summary>

Adicione a entrada ao arquivo claude_desktop_config.json:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@wonderwhy-er/desktop-commander@latest"
      ]
    }
  }
}
```

Reinicie o Claude se estiver aberto.

**✅ Atualização automática:** sim, ao reiniciar o Claude.  
**🔄 Atualização manual:** execute novamente o comando de instalação.  
**🗑️ Desinstalação:** execute `npx @wonderwhy-er/desktop-commander@latest remove` ou remova a entrada da configuração do Claude.

</details>

<details>
<summary><b>Opção 5: trabalhar com o código-fonte local ❌ Atualização manual (requer Node.js)</b></summary>

**Fork CentralDark — desenvolvimento local (Node.js 22.12 ou superior):**

```bash
git clone https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP.git
cd CentralDarkDesktopCommanderMCP
npm ci
npm run build
npm start
```

O servidor padrão usa STDIO; `npm start` não abre uma página HTTP. A compilação e execução deste roteiro dependem das ferramentas e dependências instaladas. O modo `remote` ainda usa o serviço original até a integração CentralDark ser concluída.

**Instalação pelo código-fonte original:**

```bash
git clone https://github.com/wonderwhy-er/DesktopCommanderMCP.git
cd DesktopCommanderMCP
npm run setup
```

Reinicie o Claude se estiver aberto. O comando setup instala as dependências, compila o servidor e configura o aplicativo Claude Desktop.

**❌ Atualização automática:** não, exige atualização manual pelo Git.  
**🔄 Atualização manual do original:** `cd DesktopCommanderMCP && git pull && npm run setup`.  
**🗑️ Desinstalação:** use o desinstalador original ou remova a entrada MCP e, se não houver trabalho a preservar, a cópia local correspondente.

</details>

<a id="option-6-docker-installation--auto-updates-no-nodejs-required"></a>
<a id="option-6-docker-installation-🐳-⭐-auto-updates-no-nodejs-required"></a>

<details>
<summary><b>Opção 6: instalar com Docker 🐳 ⭐ Atualização automática (dispensa Node.js no host)</b></summary>

Opção para quem deseja isolamento ou não tem Node.js instalado. O motor original roda em um contêiner com ambiente de trabalho persistente.

**Pré-requisitos:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução, além do Claude Desktop.

**macOS/Linux:**

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.sh)
```

**Windows PowerShell:**

```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.ps1'))
```

O instalador verifica o Docker, baixa a imagem, solicita a montagem de pastas e configura o Claude Desktop. Revise os scripts antes da execução.

**Persistência Docker:** ferramentas, configurações, arquivos de trabalho e caches permanecem entre reinicializações conforme os volumes configurados.

<details>
<summary>Configuração manual do Docker</summary>

**Configuração básica (sem acesso aos arquivos do host):**

```json
{
  "mcpServers": {
    "desktop-commander-in-docker": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/desktop-commander:latest"]
    }
  }
}
```

**Com montagem de pastas:**

```json
{
  "mcpServers": {
    "desktop-commander-in-docker": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-v", "/Users/username/Desktop:/mnt/desktop",
        "-v", "/Users/username/Documents:/mnt/documents",
        "mcp/desktop-commander:latest"
      ]
    }
  }
}
```

**Montagem avançada de pastas:**

```json
{
  "mcpServers": {
    "desktop-commander-in-docker": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-v", "dc-system:/usr",
        "-v", "dc-home:/root", 
        "-v", "dc-workspace:/workspace",
        "-v", "dc-packages:/var",
        "-v", "/Users/username/Projects:/mnt/Projects",
        "-v", "/Users/username/Downloads:/mnt/Downloads",
        "mcp/desktop-commander:latest"
      ]
    }
  }
}
```

</details>

<details>
<summary>Comandos de gerenciamento do Docker</summary>

**Atenção:** as opções de reset podem apagar dados persistentes. Faça backup e confirme o ambiente antes de executá-las.

**macOS/Linux:**

```bash
# Verificar estado
bash <(curl -fsSL https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.sh) --status

# Redefinir todos os dados persistentes
bash <(curl -fsSL https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.sh) --reset
```

**Windows PowerShell:**

```powershell
# Verificar estado
$script = (New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.ps1'); & ([ScriptBlock]::Create("$script")) -Status

# Redefinir todos os dados
$script = (New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.ps1'); & ([ScriptBlock]::Create("$script")) -Reset

# Mostrar ajuda
$script = (New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.ps1'); & ([ScriptBlock]::Create("$script")) -Help
```

**Solução de problemas:** redefinir e reinstalar do zero, apenas se o descarte dos dados tiver sido autorizado:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.sh) --reset && bash <(curl -fsSL https://raw.githubusercontent.com/wonderwhy-er/DesktopCommanderMCP/refs/heads/main/install-docker.sh)
```

</details>

**✅ Atualização automática:** a tag `latest` aponta para versões mais recentes.  
**🔄 Atualização manual:** `docker pull mcp/desktop-commander:latest` e reinicie o Claude.

</details>

### Instalar em outros clientes

O Desktop Commander funciona com clientes compatíveis com MCP. Configuração JSON padrão do original:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander@latest"]
    }
  }
}
```

Adicione esta configuração ao arquivo MCP do cliente nas localizações abaixo.

<details>
<summary><b>Cursor</b></summary><br>

[![Instalar MCP original](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=desktop-commander&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkB3b25kZXJ3aHktZXIvZGVza3RvcC1jb21tYW5kZXJAbGF0ZXN0Il19)

[Ver o servidor MCP no diretório](https://cursor.directory/mcp/desktop-commander-mcp).

Ou adicione manualmente a `~/.cursor/mcp.json` (global) ou `.cursor/mcp.json` na pasta do projeto.

Consulte a [documentação MCP do Cursor](https://docs.cursor.com/context/model-context-protocol).

</details>

<details>
<summary><b>Windsurf</b></summary>

Adicione a `~/.codeium/windsurf/mcp_config.json`. Consulte a [documentação MCP do Windsurf](https://docs.windsurf.com/windsurf/cascade/mcp).

</details>

<details>
<summary><b>VS Code / GitHub Copilot</b></summary>

Adicione a `.vscode/mcp.json` no projeto ou às configurações de usuário do VS Code (JSON). Verifique se MCP está habilitado em Chat > MCP. Funciona no modo Agente.

Consulte a [documentação MCP do VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).

</details>

<details>
<summary><b>Cline</b></summary>

Configure nas opções da extensão Cline no VS Code. Abra a barra lateral, clique no ícone de servidores MCP e adicione o JSON acima. Consulte a [documentação MCP do Cline](https://docs.cline.bot/mcp/configuring-mcp-servers).

</details>

<details>
<summary><b>Roo Code</b></summary>

Adicione ao arquivo de configuração MCP do Roo Code. Consulte a [documentação MCP do Roo Code](https://docs.roocode.com/features/mcp/using-mcp-in-roo).

</details>

<details>
<summary><b>Claude Code</b></summary>

```sh
claude mcp add --scope user desktop-commander -- npx -y @wonderwhy-er/desktop-commander@latest
```

Remova `--scope user` para instalar somente no projeto atual. Consulte a [documentação MCP do Claude Code](https://docs.anthropic.com/en/docs/claude-code/mcp).

</details>

<details>
<summary><b>Trae</b></summary>

Use a função “Add manually” (adicionar manualmente) e cole o JSON acima. Consulte a [documentação MCP do Trae](https://docs.trae.ai/ide/model-context-protocol?_lang=en).

</details>

<details>
<summary><b>Kiro</b></summary>

Acesse `Kiro` > `MCP Servers`, clique em `+ Add` e cole o JSON acima. Consulte a [documentação MCP do Kiro](https://kiro.dev/docs/mcp/configuration/).

</details>

<details>
<summary><b>Codex (OpenAI)</b></summary>

O Codex usa configuração TOML. Execute este comando para adicionar o Desktop Commander:

```sh
codex mcp add desktop-commander -- npx -y @wonderwhy-er/desktop-commander@latest
```

Ou adicione manualmente a `~/.codex/config.toml`:

```toml
[mcp_servers.desktop-commander]
command = "npx"
args = ["-y", "@wonderwhy-er/desktop-commander@latest"]
```

Consulte a [documentação MCP do Codex](https://developers.openai.com/codex/mcp/).

</details>

<details>
<summary><b>JetBrains (AI Assistant)</b></summary>

Nas IDEs JetBrains, acesse **Settings → Tools → AI Assistant → Model Context Protocol (MCP)**, clique em `+`, selecione **As JSON** e cole a configuração acima. Consulte a [documentação MCP do JetBrains](https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html).

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Adicione a `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander@latest"]
    }
  }
}
```

Consulte a [documentação MCP do Gemini CLI](https://github.com/google-gemini/gemini-cli).

</details>

<details>
<summary><b>Augment Code</b></summary>

Pressione `Cmd/Ctrl+Shift+P`, abra o painel Augment e adicione um servidor MCP chamado `desktop-commander` com a configuração JSON acima. Consulte a [documentação MCP do Augment Code](https://docs.augmentcode.com/setup-augment/mcp).

</details>

<details>
<summary><b>Qwen Code</b></summary>

Execute o comando para adicionar Desktop Commander:

```sh
qwen mcp add desktop-commander -- npx -y @wonderwhy-er/desktop-commander@latest
```

Ou adicione a `.qwen/settings.json` (projeto) ou `~/.qwen/settings.json` (global). Consulte a [documentação MCP do Qwen Code](https://qwenlm.github.io/qwen-code-docs/en/developers/tools/mcp-server/).

</details>

<details>
<summary><b>ChatGPT / Claude Web (MCP remoto original)</b></summary>

Use o Desktop Commander pelo **ChatGPT**, **Claude web** e outros serviços de IA, mantendo a execução dos comandos no seu computador.

Inicie o dispositivo remoto original:

```bash
npx @wonderwhy-er/desktop-commander@latest remote
```

Na primeira execução, conclua a autenticação no navegador e conecte sua IA em **[mcp.desktopcommander.app](https://mcp.desktopcommander.app)**.

- Interrompa temporariamente o dispositivo local com `Ctrl+C`.
- Consulte as opções disponíveis com `npx @wonderwhy-er/desktop-commander@latest remote --help`.
- Consulte a [documentação de configuração, logout, revogação, opções da CLI e solução de problemas](src/remote-device/README.md).

### Segurança

- ✅ O dispositivo remoto só aceita comandos enquanto está em execução e conectado.
- ✅ Os comandos são executados localmente com as permissões do usuário.
- ✅ Autenticação OAuth e canal de comunicação criptografado.

A conexão CentralDark própria será disponibilizada após a integração e os testes. Não confunda o serviço original com o fork.

</details>

## Atualizar e desinstalar o Desktop Commander

### Atualizações automáticas (opções 1, 2, 3, 4 e 6)

As opções originais **1 (npx), 2 (instalador Bash), 3 (Smithery), 4 (configuração manual) e 6 (Docker)** são documentadas com atualização automática para versões recentes ao reiniciar o Claude, sem intervenção manual.

### Atualizações manuais (opção 5)

- **Opção 5 (cópia local original):** `cd DesktopCommanderMCP && git pull && npm run setup`.
- **Fork CentralDark:** atualize pelo Git, preserve seus trabalhos locais e compile novamente. As alterações de upstream devem ser incorporadas sem perder os deltas CentralDark.

### Desinstalar o Desktop Commander

#### 🤖 Desinstalação automática (recomendada para a instalação original)

A maneira mais simples de remover o Desktop Commander original:

```bash
npx @wonderwhy-er/desktop-commander@latest remove
```

O desinstalador automático:

- ✅ Remove Desktop Commander da configuração MCP do Claude.
- ✅ Cria um backup da configuração do Claude antes de alterar.
- ✅ Orienta a remoção completa do pacote.
- ✅ Restaura o backup se ocorrer um problema.

#### 🔧 Desinstalação manual

Caso o desinstalador automático não funcione ou você prefira a remoção manual:

##### Remover da configuração do Claude

1. **Localize o arquivo de configuração do Claude Desktop:**
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`
2. **Edite o arquivo:**
   - Abra em um editor de texto.
   - Localize e remova a entrada `"desktop-commander"` da seção `"mcpServers"`.
   - Salve o arquivo.

**Exemplo — remover esta seção:**

  ```json
  {
      "desktop-commander": {
        "command": "npx",
        "args": ["@wonderwhy-er/desktop-commander@latest"]
      }
  }
  ```

Feche e reinicie o Claude Desktop para concluir.

#### 🆘 Solução de problemas

**Se a desinstalação automática falhar:** use a opção manual.

**Se o Claude não abrir após a desinstalação:**

- Restaure o backup criado pelo desinstalador.
- Ou corrija a sintaxe JSON de claude_desktop_config.json.

**Precisa de ajuda?** Entre na [comunidade Discord do original](https://discord.com/invite/kQ27sNnZr7).

<a id="getting-started"></a>

## Primeiros passos

Depois de instalar o Desktop Commander e reiniciar o Claude Desktop, você pode começar a trabalhar com as ferramentas.

### 🚀 Orientação para novos usuários

O Desktop Commander inclui uma introdução inteligente para descobrir possibilidades.

**Novos usuários:** quando ainda tiver menos de dez comandos bem-sucedidos, o Claude poderá apresentar orientações e tutoriais depois de uma execução bem-sucedida.

**Peça ajuda a qualquer momento:**

- *"Ajude-me a começar com o Desktop Commander."*
- *"Mostre exemplos do Desktop Commander."*
- *"O que posso fazer com o Desktop Commander?"*

O Claude poderá mostrar tutoriais e exemplos como:

- 📁 Organizar a pasta Downloads automaticamente.
- 📊 Analisar arquivos CSV/Excel com Python.
- ⚙️ Configurar CI/CD com GitHub Actions.
- 🔍 Explorar e entender bases de código.
- 🤖 Executar ambientes de desenvolvimento interativos.

<a id="usage"></a>

## Uso

O servidor fornece um conjunto abrangente de ferramentas, organizado em categorias.

### Ferramentas disponíveis

| Categoria | Ferramenta | Descrição |
|---|---|---|
| **Configuração** | `get_config` | Consulta a configuração completa do servidor em JSON, incluindo blockedCommands, defaultShell, allowedDirectories, fileReadLineLimit, fileWriteLineLimit e telemetryEnabled. |
| | `set_config_value` | Altera uma configuração pela chave. Opções:<br>• `blockedCommands`: comandos bloqueados.<br>• `defaultShell`: shell padrão (bash, zsh, powershell).<br>• `allowedDirectories`: diretórios permitidos para operações de arquivos (⚠️ comandos de terminal ainda podem alcançar outros diretórios).<br>• `fileReadLineLimit`: máximo de linhas por leitura (padrão 1000).<br>• `fileWriteLineLimit`: máximo de linhas por escrita (padrão 50).<br>• `telemetryEnabled`: ativa/desativa a telemetria (booleano). |
| **Terminal** | `start_process` | Inicia programas, detectando quando estão prontos para receber entradas. |
| | `interact_with_process` | Envia comandos a programas ativos e recebe respostas. |
| | `read_process_output` | Lê a saída de processos em execução. |
| | `force_terminate` | Encerra à força uma sessão de terminal ativa. |
| | `list_sessions` | Lista sessões de terminal ativas. |
| | `list_processes` | Lista processos em execução com informações detalhadas. |
| | `kill_process` | Encerra um processo pelo PID. |
| **Arquivos** | `read_file` | Lê arquivos locais, URLs, Excel (.xlsx, .xls, .xlsm) e PDF, com paginação por linhas ou páginas. |
| | `read_multiple_files` | Lê vários arquivos simultaneamente. |
| | `write_file` | Escreve ou acrescenta conteúdo a arquivos. Suporta Excel (matriz JSON bidimensional). Para PDF, use write_pdf. |
| | `write_pdf` | Cria PDFs a partir de Markdown ou modifica PDFs existentes (inserir/remover páginas). Suporta HTML/CSS e SVG. |
| | `create_directory` | Cria um diretório ou garante sua existência. |
| | `list_directory` | Lista arquivos e diretórios recursivamente com detalhes e profundidade configurável (padrão 2). |
| | `move_file` | Move ou renomeia arquivos e diretórios. |
| | `start_search` | Inicia pesquisa progressiva por nome ou padrões de conteúdo, inclusive Excel. |
| | `get_more_search_results` | Obtém resultados paginados de pesquisa ativa, com deslocamento. |
| | `stop_search` | Interrompe uma pesquisa ativa de forma controlada. |
| | `list_searches` | Lista sessões de pesquisa ativas. |
| | `get_file_info` | Consulta metadados detalhados do arquivo ou diretório, incluindo planilhas Excel. |
| **Edição de texto** | `edit_block` | Aplica substituições pontuais de texto ou atualizações de intervalos de células Excel. |
| **Análise** | `get_usage_stats` | Consulta estatísticas de uso. |
| | `get_recent_tool_calls` | Consulta chamadas recentes, argumentos e resultados para depuração e recuperação de contexto. |
| | `give_feedback_to_desktop_commander` | Abre o formulário do projeto original para enviar comentários à equipe Desktop Commander. |

### Exemplos rápidos

**Análise de dados:**

```
"Analise sales.csv e mostre os principais clientes" → Claude executa Python em memória
```

**Acesso remoto:**

```
"Conecte ao meu servidor por SSH e verifique o espaço em disco" → Claude mantém a sessão SSH
```

**Desenvolvimento:**

```
"Inicie Node.js e teste esta API" → Claude executa uma sessão Node interativa
```

### Exemplos de ferramentas

Formato de bloco de pesquisa/substituição:

```
filepath.ext
<<<<<<< SEARCH
conteúdo a localizar
=======
novo conteúdo
>>>>>>> REPLACE
```

Exemplo:

```
src/main.js
<<<<<<< SEARCH
console.log("old message");
=======
console.log("new message");
>>>>>>> REPLACE
```

### Recursos aprimorados da edição por blocos

A ferramenta `edit_block` inclui melhorias de confiabilidade:

1. **Orientação aprimorada:** as descrições incentivam pequenas alterações focadas em vez de uma grande mudança.
2. **Busca aproximada:** se não houver correspondência exata, pesquisa alternativas e apresenta detalhes.
3. **Diferenças por caractere:** mostra precisamente as alterações no formato `{-removed-}{+added+}`.
4. **Múltiplas ocorrências:** permite substituir várias ocorrências com `expected_replacements`.
5. **Registro abrangente:** todas as buscas aproximadas são registradas para análise e depuração.

Quando uma pesquisa falha, são exibidos detalhes da melhor correspondência, incluindo similaridade, tempo de execução e diferenças de caracteres. Essas informações são registradas automaticamente para análise posterior.

### Suporte a Docker

### 🐳 Uso em ambiente isolado

O Desktop Commander pode rodar em contêineres Docker, uma opção para isolar o ambiente de execução do host durante testes e desenvolvimento. O isolamento depende da configuração, das permissões e dos volumes montados; não constitui garantia de risco zero.

### Instruções de instalação

1. **Instale o Docker para Windows/macOS.**
   - Baixe e instale [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Obtenha a configuração Docker do Desktop Commander original.**
   - Acesse https://hub.docker.com/mcp/server/desktop-commander/manual.
   - **Opção A:** use o comando de terminal oferecido para instalação automática.
   - **Opção B:** clique em "Standalone" para obter o JSON e adicioná-lo manualmente à configuração do Claude Desktop.

   ![Configuração Docker](screenshots/docker-config.png)

3. **Monte somente as pastas necessárias do computador.**
   - Consulte os exemplos de montagem da opção 6. O original anuncia instruções adicionais futuras.
   - A montagem permite trabalhar com arquivos específicos do host, limitando o que é compartilhado com o contêiner.

### Benefícios do uso de Docker

- Isolamento do ambiente, quando configurado corretamente.
- Ambiente consistente em diferentes máquinas.
- Limpeza facilitada ao remover o contêiner (preserve volumes necessários).
- Adequado para testar novas funcionalidades e configurações.

## Suporte a URLs

- `read_file` pode obter conteúdo de arquivos locais e URLs.
- Exemplo: `read_file` com `isUrl: true` para ler recursos da web.
- Suporta conteúdo textual e imagens de fontes remotas.
- Imagens locais ou por URL são mostradas visualmente na interface do Claude, não apenas como texto.
- O Claude pode analisar o conteúdo visual.
- Tempo limite padrão de 30 segundos para solicitações de URL.

<a id="file-preview-ui--markdown-editor"></a>

## Prévia de arquivos e editor Markdown

O Desktop Commander inclui uma interface de prévia de arquivos no Claude Desktop, renderizando-os visualmente enquanto a IA trabalha.

### Tipos de arquivo aceitos

- **Markdown** — prévia renderizada com editor integrado.
- **Imagens** — exibição no painel (PNG, JPEG, GIF, WebP etc.).
- **Código** — código-fonte com destaque de sintaxe.
- **HTML** — prévia renderizada com opção de ver o código-fonte.
- **Diretórios** — árvore interativa expansível com carregamento sob demanda.
- **PDF, Excel, DOCX** — extração e exibição nativa de conteúdo.

### Editor Markdown

Ao visualizar um arquivo .md no Claude Desktop, você pode editá-lo diretamente no painel, sem abrir outro aplicativo.

**Como usar:**

1. Peça ao Claude que leia ou crie um arquivo Markdown.
2. Expanda a prévia para tela inteira pelo botão **⤢ Expand** (expandir).
3. O editor é ativado automaticamente nesse modo.
4. Edite com alternância de prévia ao vivo e controles de copiar, desfazer e salvar.
5. As mudanças são salvas no disco; recolha o painel para voltar à visão compacta.

**Recursos do editor:**

- **Alternar edição/prévia ao vivo** — mude entre Markdown bruto e conteúdo renderizado.
- **Salvamento automático** no disco com indicador de estado.
- **Desfazer** alterações ainda não salvas.
- **Copiar** todo o Markdown.
- **Abrir no editor** — inicia o aplicativo Markdown padrão diretamente do painel.
- Consciência de arquivos parciais: carrega e combina linhas adjacentes quando apenas parte do arquivo foi lida.
- Contexto de seleção: selecione texto na prévia para a IA poder referenciá-lo.

### Navegador de diretórios

Quando o Claude executa `list_directory`, o resultado pode abrir como uma árvore interativa de arquivos no painel, não apenas texto.

**Recursos:**

- **Árvore expansível** — abra e feche pastas com um clique; conteúdo inicial mostrado imediatamente.
- **Carregamento sob demanda** — subpastas carregam quando necessárias.
- **Pastas grandes** — exibe botão `⚠ click to load all` em vez de sobrecarregar a interface.
- **Abrir no Finder/Explorer** — acesse cada pasta no gerenciador de arquivos.
- **Clique para visualizar** — abra arquivos no painel de prévia.
- **Voltar** — depois de abrir um arquivo, o botão ← Back retorna à listagem.

### Outros recursos de prévia

- **Expandir/recolher** — alterna entre resumo compacto e painel completo.
- **Abrir na pasta** — mostra o arquivo no Finder/Explorer.
- **Carregar mais linhas** — obtém mais conteúdo acima ou abaixo de uma leitura parcial.
- **Selecionar texto** — realce trechos para a IA referenciar.

## Análise de registros de busca aproximada (scripts npm)

O sistema de registro oferece scripts npm para analisar buscas aproximadas fora do MCP.

```bash
# Consultar registros recentes de busca aproximada
npm run logs:view -- --count 20

# Analisar padrões e desempenho
npm run logs:analyze -- --threshold 0.8

# Exportar registros para CSV ou JSON
npm run logs:export -- --format json --output analysis.json

# Limpar registros (com confirmação)
npm run logs:clear
```

Veja a [documentação detalhada dos scripts](scripts/README.md).

## Registros de busca aproximada

O Desktop Commander registra as operações de busca aproximada do `edit_block`. Quando não encontra correspondência exata, a ferramenta pesquisa alternativas e registra dados para análise.

### O que é registrado

Cada operação registra:

- **Texto procurado e encontrado:** o texto pesquisado em comparação com a correspondência.
- **Similaridade:** proximidade da correspondência (0–100%).
- **Tempo de execução:** duração da pesquisa.
- **Diferenças de caracteres:** comparação detalhada.
- **Metadados do arquivo:** extensão e comprimento dos textos procurado e encontrado.
- **Códigos de caracteres:** valores específicos que causam diferenças.

### Localização dos registros

Salvos automaticamente em:

- **macOS/Linux:** `~/.claude-server-commander-logs/fuzzy-search.log`
- **Windows:** `%USERPROFILE%\.claude-server-commander-logs\fuzzy-search.log`

### O que você pode aprender

Os registros ajudam a entender:

1. **Falhas de correspondência exata:** diferenças de espaços, finais de linha ou codificação.
2. **Desempenho:** como a complexidade afeta a duração.
3. **Tipos de arquivo:** extensões com problemas frequentes.
4. **Codificação:** caracteres específicos que causam diferenças.

<a id="local-tool-history-and-audit-logs"></a>

## Histórico local de ferramentas e auditoria

O Desktop Commander mantém registros das chamadas **na máquina que executa o servidor MCP**. Esses arquivos são separados da telemetria opcional e não constituem um histórico de auditoria no servidor remoto.

### `claude_tool_call.log` — registro local de argumentos

Cada chamada recebida pelo servidor MCP local é acrescentada como uma linha de texto com horário ISO, nome da ferramenta e argumentos em JSON. **Os argumentos não são ocultados nem sanitizados antes da gravação local**, podendo incluir comandos, caminhos ou outros dados sensíveis. Resultados não são gravados neste arquivo.

O arquivo ativo é rotacionado ao atingir 10 MB. O anterior é renomeado com data e hora, por exemplo `claude_tool_call_2026-09-07_14-32-10.log`, e um novo `claude_tool_call.log` é criado. O registrador não exclui automaticamente os arquivos rotacionados.

Localizações:

- **macOS/Linux:** `~/.claude-server-commander/claude_tool_call.log`
- **Windows:** `%USERPROFILE%\.claude-server-commander\claude_tool_call.log`

### `tool-history.jsonl` — histórico recente de chamadas

O Desktop Commander também mantém um histórico JSON Lines utilizado por `get_recent_tool_calls`. Cada registro contém horário, nome da ferramenta, argumentos, duração e resultado. O histórico é carregado do disco na inicialização e pode sobreviver ao reinício do MCP.

Limites do histórico:

- Até 1.000 chamadas recentes em memória.
- Resultados limitados a 4 KiB por registro; conteúdos maiores recebem marcador de omissão.
- O arquivo em disco é reduzido quando ultrapassa 5 MiB, preservando cerca de 4 MiB mais recentes.
- Na inicialização, um histórico com mais de 2.000 registros é reescrito com os 1.000 mais recentes.
- `get_recent_tool_calls` e `track_ui_event` são excluídos desse histórico JSONL.

Localizações:

- **macOS/Linux:** `~/.claude-server-commander/tool-history.jsonl`
- **Windows:** `%USERPROFILE%\.claude-server-commander\tool-history.jsonl`

### Chamadas remotas e retenção no servidor

As chamadas do serviço Remote Desktop Commander original são tratadas pelo servidor MCP local e usam os mesmos arquivos de histórico. O serviço original guarda temporariamente argumentos e resultados em `mcp_remote_calls` para encaminhar e concluir as chamadas. Registros em estado terminal ficam elegíveis à exclusão após um minuto, com limite de segurança de uma hora desde a criação, conforme a documentação original; não são um histórico permanente de auditoria remota.

O histórico local é separado da telemetria opcional do original; os próprios arquivos não são enviados como telemetria. Veja [Coleta de dados e privacidade](#data-collection--privacy) e [PRIVACY.md](PRIVACY.md). A política do futuro serviço remoto CentralDark deverá ser validada separadamente.

<a id="handling-long-running-commands"></a>

## Comandos de longa duração

Quando um comando demora, mantenha a sessão, leia sua saída progressivamente e encerre somente se necessário. Os comandos de gerenciamento são explicados abaixo.

<a id="configuration-management"></a>

## Gerenciamento de configuração

### ⚠️ Avisos importantes de segurança

> **Para informações completas sobre segurança e comunicação de vulnerabilidades:** consulte [SECURITY.md](SECURITY.md).

1. **Limitações conhecidas:** restrições de diretórios e bloqueios de comandos são proteções contra acidentes, não uma barreira de segurança contra execução arbitrária.
2. **Altere configurações em uma conversa separada do trabalho principal.** O cliente de IA pode tentar mudar configurações, como `allowedDirectories`, ao encontrar uma restrição de acesso.
3. **allowedDirectories restringe operações de arquivo, não comandos de terminal.** Comandos ainda podem acessar outros caminhos.
4. **Segurança em produção:** use isolamento no sistema operacional, como [Docker](#option-6-docker-installation--auto-updates-no-nodejs-required) corretamente configurado ou uma máquina virtual.

### Ferramentas de configuração

Gerencie a configuração do servidor com as ferramentas fornecidas:

```javascript
// Consultar configuração completa
get_config({})

// Definir uma configuração específica
set_config_value({ "key": "defaultShell", "value": "/bin/zsh" })

// Definir vários valores em chamadas separadas
set_config_value({ "key": "defaultShell", "value": "/bin/bash" })
set_config_value({ "key": "allowedDirectories", "value": ["/Users/username/projects"] })
```

A configuração é salva em `config.json` e persiste entre reinicializações, conforme a configuração de armazenamento do servidor.

#### Entendendo fileWriteLineLimit

`fileWriteLineLimit` controla quantas linhas podem ser escritas em uma operação `write_file` (padrão: 50).

**Por que existe o limite:**

- **Economia de tokens:** a IA pode reescrever um arquivo inteiro quando duas pequenas edições seriam suficientes. Alterações menores economizam tempo e tokens.
- **Limites de mensagens do Claude:** dividir o trabalho em blocos permite retomar do último bloco bem-sucedido se o cliente atingir o limite de uma mensagem.

**Ajustar o limite:**

```javascript
// Definir um limite maior
set_config_value({ "key": "fileWriteLineLimit", "value": 1000 })

// Ou manter um limite menor para incentivar eficiência
set_config_value({ "key": "fileWriteLineLimit", "value": 25 })
```

**Valor máximo:** a documentação original não impõe um limite técnico específico de milhares de linhas.

**Boas práticas:**

- Mantenha o padrão de 50 para incentivar edições eficientes.
- O sistema sugere divisão em blocos quando os limites são excedidos.
- Blocos menores reduzem a perda de trabalho quando o cliente atinge limites.

### Boas práticas

1. Use uma conversa dedicada para alterações de configuração e outra para o trabalho.
2. Cuidado com `allowedDirectories: []`: a lista vazia permite operações de arquivos em todo o sistema de arquivos acessível ao usuário.
3. Especifique caminhos exatos, evitando caminhos amplos como `/`.
4. Confira a configuração depois de alterar com `get_config({})`.

## Opções de linha de comando

O Desktop Commander oferece opções para personalizar o comportamento.

### Desativar a introdução

Por padrão, o Desktop Commander apresenta orientações a novos usuários (menos de dez chamadas). Você pode desativá-las.

```bash
# Desativar a introdução nesta sessão
node dist/index.js --no-onboarding

# Ou usando scripts npm
npm run start:no-onboarding

# Para instalações npx, ajuste claude_desktop_config.json:
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@wonderwhy-er/desktop-commander@latest",
        "--no-onboarding"
      ]
    }
  }
}
```

O comando `npm run start:no-onboarding` acima é um exemplo legado do original; no package.json atual, use `npm start -- --no-onboarding`.

**Quando a introdução é desativada automaticamente:**

- Quando o nome do cliente MCP é "desktop-commander".
- Ao usar `--no-onboarding`.
- Após utilizar as orientações ou executar dez ou mais chamadas.

**Informação de depuração:** o servidor registra a mensagem `"Onboarding disabled via --no-onboarding flag"` quando essa opção é usada.

## Usar shells diferentes

É possível escolher o shell para executar comandos. Os exemplos abaixo são preservados do README original; `execute_command` é uma referência legada. Para o catálogo atual, consulte `start_process` e os parâmetros anunciados pelo cliente MCP.

```javascript
// Usar o shell padrão
execute_command({ "command": "echo $SHELL" })

// Usar zsh
execute_command({ "command": "echo $SHELL", "shell": "/bin/zsh" })

// Usar bash
execute_command({ "command": "echo $SHELL", "shell": "/bin/bash" })
```

Isso permite usar recursos específicos de cada shell ou manter ambientes consistentes.

Para comandos de longa duração, o fluxo documentado consiste em receber a saída inicial após o tempo limite, manter o processo em segundo plano, ler novas saídas com a ferramenta correspondente ao catálogo atual e usar `force_terminate` se necessário. As referências antigas a `execute_command` e `read_output` correspondem a `start_process` e `read_process_output` no catálogo apresentado acima.

## Depuração

Se precisar depurar o servidor, instale o original em modo de depuração:

```bash
# Usando npx
npx @wonderwhy-er/desktop-commander@latest setup --debug

# Ou com instalação local
npm run setup:debug
```

Isso:

1. Configura o Claude para usar um servidor "desktop-commander" separado.
2. Habilita o protocolo de inspeção Node.js com `--inspect-brk=9229`.
3. Pausa a execução inicial até conectar o depurador.
4. Ativa variáveis adicionais de depuração.

Para conectar um depurador:

- No Chrome, acesse `chrome://inspect` e procure a instância Node.js.
- No VS Code, use a configuração "Attach to Node Process".
- Outras IDEs podem oferecer opções equivalentes.

**Observações:**

- A execução pausa inicialmente pela opção `--inspect-brk`.
- Se não observar atividade, confirme o processo Node.js correto.
- Podem existir vários processos Node; conecte o processo na porta 9229.
- O servidor de depuração é identificado como "desktop-commander-debug" na lista MCP do Claude.

**Solução de problemas:**

- Se o Claude atingir o tempo limite, confira a conexão do depurador.
- Após a conexão, continue a execução a partir do primeiro ponto de interrupção.
- Adicione outros pontos de interrupção na IDE quando necessário.

## Integração com Model Context Protocol

O projeto estende o MCP Filesystem Server para permitir:

- Servidor local no Claude Desktop.
- Execução de comandos do sistema.
- Gerenciamento de processos.
- Operações de arquivos.
- Edição de código por blocos de pesquisa/substituição.

O original foi criado durante a exploração dos MCPs do Claude: https://youtube.com/live/TlbjFDbl5Us

<a id="roadmap"></a>

## Roteiro e pendências

- Integrar o login e o consentimento React existentes no fork.
- Adaptar o protocolo remoto ao servidor e ao Supabase da CentralDark, preservando segurança, revogação e isolamento de sessões.
- Publicar e testar o pacote NPM próprio.
- Publicar a interface de pareamento e validar o domínio antes de alterar a infraestrutura atual.
- Manter o painel administrativo para uma etapa posterior.

<a id="support-desktop-commander"></a>

## Apoie o Desktop Commander original

<div align="center">
  <h3>📢 APOIE O PROJETO ORIGINAL</h3>
  <p><strong>O Desktop Commander MCP é livre e de código aberto; o apoio da comunidade ajuda seu desenvolvimento.</strong></p>
  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; border: 2px solid #007bff;">
    <p>A filosofia dos autores é simples: não querem que você pague se a ferramenta não ajudar. Se o Desktop Commander contribui para seu sucesso, considere apoiar o projeto original.</p>
    <p><strong>Formas de apoiar:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
      <li>🌟 <a href="https://github.com/sponsors/wonderwhy-er"><strong>GitHub Sponsors</strong></a> — apoio recorrente</li>
      <li>☕ <a href="https://www.buymeacoffee.com/wonderwhyer"><strong>Buy Me A Coffee</strong></a> — contribuições pontuais</li>
      <li>💖 <a href="https://www.patreon.com/c/EduardsRuzga"><strong>Patreon</strong></a> — apoio mensal</li>
      <li>⭐ <a href="https://github.com/wonderwhy-er/DesktopCommanderMCP"><strong>Estrela no GitHub</strong></a> — ajude outras pessoas a descobrir o projeto</li>
    </ul>
  </div>
</div>

### ❤️ Galeria de apoiadores

Apoiadores do projeto original. Obrigado por tornar o projeto possível!

<div align="center">
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/jonrichards">
        <img src="https://github.com/jonrichards.png" width="100px;" alt="Jon Richards"/>
        <br />
        <sub><b>Jon Richards</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/stepanic">
        <img src="https://github.com/stepanic.png" width="100px;" alt="Matija Stepanic"/>
        <br />
        <sub><b>Matija Stepanic</b></sub>
      </a>
    </td>
  </tr>
</table>
</div>

<details>
  <summary><strong>Por que seu apoio importa</strong></summary>
  <p>O apoio permite aos autores:</p>
  <ul>
    <li>Continuar o desenvolvimento e a manutenção.</li>
    <li>Adicionar recursos e integrações.</li>
    <li>Melhorar a compatibilidade entre plataformas.</li>
    <li>Oferecer melhor documentação e exemplos.</li>
    <li>Fortalecer a comunidade em torno do projeto.</li>
  </ul>
</details>

<a id="website"></a>

## Site

- **CentralDark:** [mcp.centralldark.com](https://mcp.centralldark.com) — interface própria em preparação.
- **Projeto original:** [desktopcommander.app](https://desktopcommander.app/) — informações, documentação e atualizações do Desktop Commander.

<a id="media"></a>

## Mídia

Saiba mais sobre o projeto original pelos recursos abaixo.

### Artigo

[Claude com MCPs substituiu Cursor e Windsurf. Como aconteceu?](https://wonderwhy-er.medium.com/claude-with-mcps-replaced-cursor-windsurf-how-did-that-happen-c1d1e2795e96) — análise de como o Claude com Model Context Protocol altera fluxos de desenvolvimento.

### Vídeo

[Tutorial em vídeo do Claude Desktop Commander](https://www.youtube.com/watch?v=ly3bed99Dy8) — veja como configurar e usar o Commander.

### Publicação no AnalyticsIndiaMag

[![AnalyticsIndiaMag](testemonials%2Fanalyticsindiamag.png)
Este desenvolvedor deixou Windsurf e Cursor usando Claude com MCPs](https://analyticsindiamag.com/ai-features/this-developer-ditched-windsurf-cursor-using-claude-with-mcps/)

### Comunidade

Participe do [Discord do projeto original](https://discord.gg/kQ27sNnZr7) para pedir ajuda, enviar sugestões e conversar com outros usuários.

<a id="testimonials"></a>

## Depoimentos

Os depoimentos a seguir pertencem ao **Desktop Commander original**, não a usuários do fork CentralDark. Tradução livre dos relatos; as imagens e links mantêm a publicação original.

[![Depoimento sobre evitar assinaturas duplicadas e aproveitar pesquisa na web com MCP](https://raw.githubusercontent.com/wonderwhy-er/ClaudeComputerCommander/main/testemonials/img.png)](https://www.youtube.com/watch?v=ly3bed99Dy8&lc=UgyyBt6_ShdDX_rIOad4AaABAg)

"Salvou minha vida! Eu pagava Claude e Cursor e sempre sentia que havia uma duplicação. Isso resolve o problema. Estou muito feliz. Muito obrigado. Hoje o Claude também adicionou pesquisa na web. Com esse MCP e a pesquisa na internet, ele escreve código com atualizações recentes. É ótimo quando o Cursor falha ou acabam as solicitações rápidas."

[![Depoimento sobre atualizar um aplicativo Flutter e corrigir BLE](https://raw.githubusercontent.com/wonderwhy-er/ClaudeComputerCommander/main/testemonials/img_1.png)](https://www.youtube.com/watch?v=ly3bed99Dy8&lc=UgztdHvDMqTb9jiqnf54AaABAg)

"É o primeiro comentário que deixo em um vídeo do YouTube. Obrigado! Eu tentava atualizar um aplicativo Flutter antigo, anterior à segurança contra nulos, no Cursor, e implementei a segurança contra nulos com Claude 3.7. Avancei bastante, mas passei dias sem resolver erros críticos de BLE. O Augment Code também não conseguiu. Com seu MCP no Claude Desktop, comparei toda a base antiga com a nova, considerando as atualizações, e corrigi os problemas em poucas horas. Um conselho: prepare e registre commits quando apropriado para poder desfazer mudanças indesejadas. Incrível!"

[![Depoimento sobre atualizar um projeto full-stack e evitar retrabalho](https://raw.githubusercontent.com/wonderwhy-er/ClaudeComputerCommander/main/testemonials/img_2.png)](https://www.youtube.com/watch?v=ly3bed99Dy8&lc=UgyQFTmYLJ4VBwIlmql4AaABAg)

"Ótimo! Comprei uma licença do Windsurf uma semana atrás para atualizar um projeto full-stack antigo com sockets. Em muitas ocasiões funcionou bem, mas em outras o Cascade saiu do rumo e precisei desfazer mudanças, perdendo centenas de tokens. Em uma semana restavam menos de cem tokens e eu não queria comprar apenas trezentos por dez dólares. Com esse MCP do Claude, finalmente tive um bom motivo para assinar o Claude Pro junto com o ChatGPT. Agora consigo programar sem me preocupar da mesma forma com o custo de tokens. Além disso, faz muito mais que editar código. Obrigado pelo vídeo!"

[![Depoimento sobre edições pontuais de código](https://raw.githubusercontent.com/wonderwhy-er/ClaudeComputerCommander/main/testemonials/img_3.png)](https://www.youtube.com/watch?v=ly3bed99Dy8&lc=Ugy4-exy166_Ma7TH-h4AaABAg)

"É uma ótima ferramenta, obrigado. Gosto de usá-la porque dá ao Claude a capacidade de fazer edições pontuais, tornando-o mais parecido com um desenvolvedor humano."

[![Depoimento sobre usar Claude diretamente antes de outras IDEs](https://raw.githubusercontent.com/wonderwhy-er/ClaudeComputerCommander/main/testemonials/img_4.png)](https://medium.com/@pharmx/you-sir-are-my-hero-62cff5836a3e)

"Você é meu herói. Resumiu minhas experiências recentes melhor do que eu conseguiria. Cursor e Windsurf me frustravam a ponto de quase gritar com a tela. Por impulso, pensei em perguntar diretamente ao Claude e não voltei atrás. Claude primeiro, para manter a sanidade; depois, se necessário, outras IDEs e frameworks. Achava que era o único; bom saber que não."

Se o projeto original for útil, considere dar uma ⭐ no GitHub para ajudar outras pessoas a descobri-lo e incentivar seu desenvolvimento.

<a id="contributing"></a>

## Contribuição

Contribuições são bem-vindas. Para problemas, ideias e melhorias do fork, use as [issues da CentralDark](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/issues) e preserve a compatibilidade upstream.

- **Encontrou um erro?** Se for do original, abra uma issue em [wonderwhy-er/DesktopCommanderMCP/issues](https://github.com/wonderwhy-er/DesktopCommanderMCP/issues).
- **Tem uma ideia?** Envie uma solicitação de recurso na seção Issues.
- **Quer contribuir com código?** Crie uma branch em um fork e envie um pull request.
- **Perguntas ou discussões?** Use a seção GitHub Discussions quando disponível.

Toda contribuição é bem-vinda. Se a ferramenta original for valiosa para seu trabalho, considere [apoiar os autores](https://www.buymeacoffee.com/wonderwhyer).

<a id="frequently-asked-questions"></a>

## Perguntas frequentes

Veja também o [documento FAQ completo do original](FAQ.md).

### O que é Desktop Commander?

É uma ferramenta MCP que permite ao Claude Desktop acessar o sistema de arquivos e o terminal autorizado, tornando-o um assistente versátil para programação, automação e exploração de código.

### Qual a diferença em relação ao Cursor/Windsurf?

Em vez de se limitar ao ambiente de uma IDE, o Desktop Commander trabalha com recursos do sistema operacional autorizados. O cliente pode ler arquivos, trabalhar em vários projetos e executar mudanças em blocos. A necessidade de revisão depende das permissões e da configuração.

### Preciso pagar créditos de API?

Na documentação original, o uso pelo Claude Desktop com assinatura Pro (citada como US$ 20/mês) dispensa chamadas diretas de API e seus respectivos créditos. A cobrança, disponibilidade e limites dependem do cliente utilizado e de seu plano. Isso não é promessa de gratuidade do futuro serviço CentralDark.

### O Desktop Commander atualiza automaticamente?

O original documenta atualizações automáticas para instalações por npx ou Smithery ao reiniciar o Claude. Instalações locais pelo Git exigem atualização manual. O pacote CentralDark ainda está em preparação.

### Quais são os usos mais comuns?

- Explorar e entender bases de código complexas.
- Gerar diagramas e documentação.
- Automatizar tarefas no sistema.
- Trabalhar em vários projetos.
- Realizar alterações pontuais no código.

### Estou com problemas de instalação ou uso. Onde encontro ajuda?

Participe do [Discord original](https://discord.gg/kQ27sNnZr7), consulte as [issues do original](https://github.com/wonderwhy-er/DesktopCommanderMCP/issues), o [FAQ completo](FAQ.md) ou a [seção de perguntas do site](https://desktopcommander.app#faq). Se encontrar um problema novo no original, [abra uma issue](https://github.com/wonderwhy-er/DesktopCommanderMCP/issues/new) com os detalhes. Para problemas exclusivos do fork, use as issues da CentralDark.

### Como relato vulnerabilidades de segurança?

Consulte primeiro a [política de segurança](SECURITY.md) e seus canais de divulgação responsável. Não publique credenciais nem detalhes exploráveis em issues abertas. O [repositório original](https://github.com/wonderwhy-er/DesktopCommanderMCP/issues) mantém seus próprios canais.

<a id="data-collection--privacy"></a>

## Coleta de dados e privacidade

O Desktop Commander original coleta telemetria limitada e pseudonimizada para melhorar a ferramenta. Segundo sua documentação, não coleta conteúdo ou caminhos de arquivos nem argumentos de comandos como telemetria.

Isso é separado do [histórico local de ferramentas e auditoria](#local-tool-history-and-audit-logs), que permanece na máquina que executa o Desktop Commander e pode conter argumentos e prévias limitadas de resultados.

**Desativar telemetria:** peça ao cliente para desativar a telemetria do Desktop Commander ou defina `"telemetryEnabled": false` na configuração.

Para detalhes, consulte a [política de privacidade original](PRIVACY.md). O fork não deve transferir dados de dispositivos CentralDark para serviços externos sem autorização e avaliação da integração.

## Verificações

Selos de verificação do projeto original:

[![Verificação MseeP do original](https://mseep.ai/badge.svg)](https://mseep.ai/app/25ff7a06-58bc-40b8-bd79-ebb715140f1a)

<a id="license"></a>

## Licença

[MIT](LICENSE). Copyright e créditos do Desktop Commander original preservados.
