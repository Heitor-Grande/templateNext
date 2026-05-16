# AGENTS.md

Orientações técnicas para agentes e desenvolvedores que forem trabalhar neste template.

## Objetivo Do Projeto

Este repositório é um template padrão para iniciar novas aplicações com Next.js, TypeScript, PostgreSQL e uma base administrativa reutilizável. Ele deve funcionar como ponto de partida genérico, com estrutura, autenticação, componentes, modais, services e utils prontos para evolução.

Ao alterar este repositório, priorize soluções genéricas e reaproveitáveis. Evite incluir regras de negócio específicas de uma aplicação final diretamente no template.

## Stack E Comandos

- Next.js com App Router em `src/app`.
- TypeScript com `strict` habilitado.
- Bootstrap e React Bootstrap para modais e base visual.
- Tailwind CSS importado em `src/app/cssGlobal.css` para classes utilitárias.
- `react-select` para selects.
- `react-icons` para ícones.
- `pg` para PostgreSQL.
- `nodemailer` para envio de e-mail.
- `jsonwebtoken` para autenticação.
- `xlsx` para exportação de tabelas.
- Alias de importação: `@/*` aponta para `src/*`.

Comandos principais:

```bash
npm run dev
npm run build
npm run lint
```

Antes de finalizar alterações relevantes, rode pelo menos `npm run lint`. Para mudanças estruturais, autenticação, APIs, banco ou runtime, rode também `npm run build`.

## Estrutura Esperada

Mantenha a organização por responsabilidade:

```text
src/
  app/                 Rotas, layouts, páginas, APIs e estilos globais
  components/
    inputs/            Inputs, botões, selects e controles reutilizáveis
    layout/            Componentes de estrutura visual, como sidebar/navbar
    modals/            Modais prontos para uso em qualquer aplicação
    tables/            Tabelas reutilizáveis
  services/            Clientes HTTP, banco de dados e integrações externas
  hooks/               Hooks customizados reutilizáveis, quando existirem
  utils/               Funções puras, validadores, helpers e utilitários server-side
database/
  migrations/          Scripts SQL da base inicial
```

Se uma pasta ainda não existir, crie apenas quando houver código real para colocar nela.

## Funcionalidades Base

O template contém:

- login com cookie `httpOnly` e JWT;
- recuperação de senha com token temporário;
- proxy de proteção para páginas e APIs privadas;
- layout autenticado com barra lateral responsiva;
- menu lateral filtrado por permissões do perfil;
- seleção de empresa de navegação por usuário;
- cadastro de usuários;
- cadastro de perfis e permissões;
- cadastro de empresas;
- vínculo usuário/empresa e empresa padrão;
- configurações gerais e SMTP;
- minha conta;
- tabela reutilizável com filtro, paginação, clique em linha e exportação Excel.

Essas funcionalidades devem continuar servindo como base genérica. Não trate este template como um domínio final.

## Diretrizes Para Componentes

- Componentes interativos devem usar `"use client"` no topo do arquivo.
- Prefira componentes pequenos, tipados e com props explícitas.
- Use React Bootstrap quando o componente representar UI Bootstrap, especialmente modais.
- Use o alias `@/` para imports de arquivos dentro de `src`.
- Evite acoplar componentes reutilizáveis a uma rota específica.
- Evite textos, estilos ou comportamentos de um domínio específico dentro de componentes base.
- Mantenha nomes de arquivos consistentes com o padrão atual do projeto.

Componentes atuais:

- `src/components/inputs/button.tsx`: `Botao`, botão base com ícone, loading, variações e estado desabilitado.
- `src/components/inputs/input.tsx`: `CampoTexto`, input controlado com label, ajuda e acessibilidade básica.
- `src/components/inputs/select.tsx`: `Seletor`, wrapper controlado de `react-select`.
- `src/components/tables/dataTable.tsx`: `TabelaDados`, listagem com filtro local, paginação, clique em linha e exportação Excel.
- `src/components/VinculoUsuarioEmpresa.tsx`: seção reutilizável para gerenciar vínculos reais entre usuários e empresas.
- `src/components/layout/sideBar.tsx`: barra lateral autenticada, responsiva, com menu por permissão e seleção de empresa.

## Modais

Os modais base ficam em `src/components/modals`.

Padrões desejados:

- Usar `react-bootstrap/Modal`.
- Receber estado aberto/fechado por props, como `isOpen` ou `show`.
- Receber callbacks por props, como `onClose`, `onCancel` e `onConfirm`.
- Não buscar dados diretamente dentro de modais genéricos.
- Não executar regra de negócio específica dentro de modais genéricos.
- Manter modais base reutilizáveis.

Modais atuais:

- `confirmModal.tsx`: confirmação genérica.
- `responseModal.tsx`: exibição de mensagens de sucesso, erro ou validação.
- `loading.tsx`: bloqueio visual durante processamentos.
- `src/app/components/modalRecSenha.tsx`: modal do fluxo de recuperação de senha, específico da tela inicial.

Para modais locais de uma tela ou módulo, concentre a regra de negócio dentro do próprio modal. O componente pai deve passar apenas props de controle como `aberto` e `aoFechar`, evitando callbacks como `aoSalvar` quando a ação pertence ao fluxo do modal.

## Hooks

Hooks reutilizáveis ficam em `src/hooks`.

Padrões desejados:

- Nomear hooks com prefixo `use`, por exemplo `useLoading`.
- Encapsular estado e comportamento reutilizável.
- Não misturar UI dentro de hooks.
- Evitar dependência de telas específicas.
- Retornar uma API simples e previsível.

Exemplos de bons candidatos para hooks do template:

- controle de loading;
- controle de modal;
- debounce;
- paginação;
- formulários simples;
- chamadas assíncronas padronizadas.

## Services

Services devem ficar em `src/services`.

Use esta camada para centralizar integrações externas e chamadas server-side.

Services atuais:

- `database.ts`: expõe `consultarBancoDados`, usando `pg` e variáveis `POSTGRES_*`. Sempre passe parâmetros no array para evitar SQL injection.
- `email.ts`: expõe `enviarEmail`, carregando SMTP da tabela `configuracao` e descriptografando valores sensíveis antes de enviar.

Padrões desejados:

- Separar clientes genéricos de services específicos.
- Manter URL base, conexão, headers e tratamento comum em um ponto central.
- Retornar dados tipados.
- Não colocar estado React dentro de services.
- Não importar componentes dentro de services.

## Rotas De API

- Funções de rotas da API, como `GET`, `POST`, `PUT`, `PATCH` e `DELETE`, devem concentrar sua execução dentro de um único bloco `try/catch`.
- Valide corpo, query params, regras básicas, permissões e chamadas ao banco dentro desse `try`.
- Aplique `verificarRateLimitPorIp` no início do `try` quando a rota for sensível.
- Aplique `verificarPermissaoAPI` antes de consultas ou alterações protegidas por perfil.
- Centralize as respostas de erro no `catch`, tratando casos conhecidos, como violação de unicidade, antes da resposta genérica.
- Evite múltiplos `try/catch` dentro da mesma função de rota, salvo quando houver uma justificativa técnica clara.
- Toda resposta deve usar `criarRespostaApi`.

Contrato obrigatório:

```ts
{
    sucesso: boolean;
    msg: string;
    dados: unknown | null;
}
```

## Consultas À API No Frontend

Use `src/utils/api.ts` para chamadas do front para o back. Não espalhe `fetch` diretamente em componentes, páginas ou hooks.

Exemplo:

```ts
const resposta = await requisitarAPI("/api/recurso", {
    method: "POST",
    body: dados,
});
```

Mesmo em consultas `GET`, mantenha o `method` explícito para padronizar a leitura do código.

Toda função do front que fizer requisição ao back deve concentrar a chamada dentro de um único bloco `try/catch`. Se cair no `catch`, exiba a mensagem usando `ModalResposta`.

## Autenticação E Proxy

O arquivo `src/proxy.ts` valida o cookie `app_session` antes de liberar rotas protegidas. Use `obterPayloadJWT` ou `validarJWT` de `src/utils/jwt.ts` para validar assinatura e expiração do token.

O JWT de sessão deve incluir `idUsuario`, `ativo` e `dataLogin`. O proxy usa o payload validado para liberar apenas usuários com `ativo` igual a `true`, evitando consulta ao banco a cada requisição protegida.

Quando uma rota de API precisar do id do usuário logado, use `obterIdUsuarioAutenticado` de `src/utils/autenticacao.ts`. Não leia nem decodifique o cookie `app_session` diretamente dentro da rota quando essa função atender ao caso.

Mantenha rotas públicas explícitas dentro do proxy. Para APIs protegidas sem JWT válido, retorne resposta padronizada com status `401`; para páginas protegidas, redirecione para `/`.

## Permissões

As permissões ficam no campo `perfil.permissoes` em JSON e seguem recursos e ações tipadas:

```ts
type RecursoPermissao = "usuario" | "empresa" | "configuracao" | "perfil" | "dashboard";
type AcaoPermissao = "visualizar" | "criar" | "atualizar" | "deletar";
```

Use `verificarPermissaoAPI` em APIs protegidas. A função retorna `null` quando permitido ou uma resposta padronizada quando a sessão, usuário, perfil ou permissão for inválida.

A barra lateral usa as permissões carregadas pela rota `/api/sideBar` para montar somente os menus disponíveis ao usuário.

## Empresas E Vínculos

O template possui cadastro de empresas e relação muitos-para-muitos entre usuários e empresas por `usuarios_empresas`.

Padrões:

- A tabela `usuarios_empresas` representa vínculo existente. Remover vínculo significa excluir o registro.
- O campo `usuarios.empresa_padrao` guarda a empresa padrão opcional do usuário.
- Use `VinculoUsuarioEmpresa` nos formulários de usuário e empresa.
- Use `verificarEmpresaPertenceAoUsuario` quando uma API precisar garantir que a empresa informada pertence ao usuário autenticado.
- Use `verificarUsuarioAdministrador` quando a operação depender do campo `"isAdmin"` da tabela `usuarios`.

## Utils

Utils devem ficar em `src/utils`.

Use esta pasta para funções puras, helpers compartilhados e utilitários server-side pequenos. Evite colocar regra de negócio extensa em `utils`; se a função depender de contexto de domínio, ela provavelmente pertence a um service, hook ou módulo específico da aplicação final.

Utils atuais e uso esperado:

- `api.ts`: `requisitarAPI` e tipo `RespostaApi`. Use no frontend para centralizar `method`, headers JSON, body e tratamento de erro.
- `autenticacao.ts`: `obterIdUsuarioAutenticado`. Use em APIs para obter o usuário logado pelo cookie `app_session`.
- `criptografia.ts`: `criarHash` e `validarHash`. Use para senhas e valores que não devem ser recuperados em texto puro.
- `criptografiaReversivel.ts`: `criptografarValor` e `descriptografarValor`. Use somente server-side para valores sensíveis que precisam ser recuperados, como SMTP.
- `empresaUsuario.ts`: `verificarEmpresaPertenceAoUsuario`. Use para validar acesso por empresa antes de consultas ou alterações.
- `jwt.ts`: `criarJWT`, `criarJWTRecuperacaoSenha`, `obterPayloadJWT`, `obterPayloadRecuperacaoSenhaJWT` e `validarJWT`. Use para sessão e recuperação de senha.
- `permissoes.ts`: `verificarPermissaoAPI` e tipos de recurso/ação. Use para proteger APIs por perfil.
- `rateLimit.ts`: `obterIpRequisicao` e `verificarRateLimitPorIp`. Use em login, recuperação de senha e outras rotas sensíveis.
- `respostaApi.ts`: `criarRespostaApi` e tipo `RespostaApi`. Use em todas as rotas de API.
- `usuarioAdmin.ts`: `verificarUsuarioAdministrador`. Use em rotas que exigem usuário administrador.
- `validacoes.ts`: `validarStringComConteudo`, `validarEmail` e `normalizarCampoOpcional`. Use para validar entrada antes de normalizar ou salvar.

Antes de criar uma nova validação, verifique se ela pertence a `validacoes.ts` ou se é uma regra específica do módulo.

## Rate Limit

Use `src/utils/rateLimit.ts` para limitar tentativas em rotas sensíveis por IP, como login, recuperação de senha, validação de código e alteração de senha.

Padrão desejado:

```ts
const respostaRateLimit = verificarRateLimitPorIp({
    request: request,
    identificador: "login",
    limite: 5,
    janelaMs: 15 * 60 * 1000,
});

if (respostaRateLimit) {
    return respostaRateLimit;
}
```

- Aplique o rate limit no início do `try`, antes de consultas ao banco, envio de e-mail ou validação de credenciais.
- Use um `identificador` específico para cada fluxo.
- O util atual guarda tentativas em memória do processo. Ele atende ao template e ao desenvolvimento local, mas para produção com múltiplas instâncias, serverless ou balanceamento de carga, substitua por armazenamento compartilhado.
- Mantenha resposta padronizada com status `429` quando o limite for excedido.

## Páginas E Layout

- Rotas ficam em `src/app`.
- `src/app/layout.tsx` deve manter configurações globais.
- `src/app/(app)/layout.tsx` deve manter a estrutura comum da área autenticada.
- Estilos globais ficam em `src/app/cssGlobal.css`.
- Evite transformar `page.tsx` em catálogo permanente de exemplos.
- Telas que usarem `TabelaDados` devem seguir o padrão de `src/app/(app)/usuarios/page.tsx` e `src/app/(app)/empresas/page.tsx`: cabeçalho simples, ação principal com `Botao`, carregamento via `requisitarAPI`, erros com `ModalResposta` e tabela renderizada por `TabelaDados`.

Rotas internas atuais:

- `/menuPrincipal`: primeira tela autenticada.
- `/usuarios`: listagem e cadastro de usuários.
- `/usuarios/perfil`: listagem e cadastro de perfis.
- `/empresas`: listagem e cadastro de empresas.
- `/configuracoes`: configurações gerais e SMTP.
- `/minhaConta`: dados do usuário autenticado.

## Banco E Migrations

As migrations ficam em `database/migrations` e devem ser executadas em ordem crescente. Atualize `database/migrations/README.md` sempre que criar, remover ou alterar tabelas, colunas, índices ou relacionamentos.

Tabelas atuais:

- `usuarios`;
- `configuracao`;
- `perfil`;
- `empresas`;
- `usuarios_empresas`.

Ao criar migrations, prefira scripts idempotentes quando fizer sentido (`if not exists`) e mantenha nomes com prefixo numérico.

## Estilo E TypeScript

- Mantenha `strict` sem relaxar configurações do TypeScript.
- Prefira tipos e interfaces explícitos para props.
- Evite `any`; use tipos específicos, `unknown` com validação ou generics quando necessário.
- Não adicione bibliotecas novas sem necessidade clara para o template.
- Preserve o padrão visual atual.
- Mantenha português correto em textos visíveis, mensagens de API, placeholders, metadados e comentários.
- Comentários devem explicar decisões ou trechos não óbvios, não repetir o que o código já diz.
- Funções e componentes devem possuir comentários explicando seu uso e sua utilidade no template. Prefira comentários curtos em formato JSDoc acima da função ou componente.
- Nomes de funções devem ser escritos em português e deixar claro o que a função faz. Evite nomes genéricos como `handle`, `process`, `execute` ou abreviações sem contexto.

## Padrão De Cores

Use a paleta da sidebar como referência visual da aplicação:

- Fundo principal da aplicação: `#f4f7fb`.
- Superfícies claras, cards e formulários: `#ffffff`.
- Bordas claras: `#dce3ec`.
- Texto principal em telas claras: `#172033` ou `#273142`.
- Texto secundário: `#6c757d`.
- Sidebar e áreas de navegação internas: `#111827`.
- Texto principal sobre fundo escuro: `#e5edf8`.
- Texto secundário sobre fundo escuro: `#94a3b8`.
- Destaque/ação primária: `#0d6efd`.
- Destaque de ícones na sidebar: `#60a5fa`.
- Hover/ativo em navegação escura: `rgba(255, 255, 255, 0.09)`.
- Divisórias em navegação escura: `rgba(255, 255, 255, 0.08)` ou `rgba(255, 255, 255, 0.1)`.

Ao criar novas telas internas, mantenha fundos claros com conteúdo em cards brancos e use a sidebar escura como âncora visual. Evite criar uma nova paleta dominante sem necessidade.

## Critérios Para Aceitar Mudanças No Template

Uma mudança é adequada para este repositório quando:

- ajuda novos projetos a começarem mais rápido;
- reduz repetição comum entre aplicações;
- melhora a organização base;
- permanece genérica o suficiente para vários domínios;
- não obriga uma aplicação final a seguir uma regra de negócio específica.

Uma mudança provavelmente não pertence ao template quando:

- depende de um cliente, produto ou domínio específico;
- adiciona fluxo de negócio fechado;
- adiciona dependência pesada sem uso amplo;
- torna a base mais difícil de remover ou adaptar.

## Cuidados Ao Editar

- Não reverta alterações existentes sem pedido explícito.
- Leia os arquivos ao redor antes de mudar padrões.
- Mantenha alterações pequenas e coesas.
- Atualize este arquivo quando a arquitetura base mudar.
- Se criar componentes, hooks, services ou utils reutilizáveis, considere atualizar o `README.md` com exemplos de uso.
