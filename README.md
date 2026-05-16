# Template Next.js

Template base para iniciar aplicações web com Next.js, TypeScript, PostgreSQL e uma estrutura administrativa pronta para evoluir. A ideia é oferecer um ponto de partida reutilizável, com autenticação, layout interno, componentes, modais, tabelas, permissões e utilitários já organizados.

Este repositório não representa um produto final nem um domínio específico. Ele deve ser adaptado para a necessidade de cada nova aplicação.

## O Que Já Vem Pronto

- Página inicial com apresentação do template, formulário de login e fluxo de recuperação de senha.
- Área interna autenticada com barra lateral responsiva.
- Controle de sessão por cookie `httpOnly` com JWT.
- Perfis de permissão por recurso e ação.
- Cadastro e manutenção de usuários.
- Cadastro e manutenção de perfis.
- Cadastro e manutenção de empresas.
- Vínculo entre usuários e empresas, com empresa padrão por usuário.
- Tela de configurações gerais da aplicação e SMTP.
- Tabela reutilizável com filtro, paginação, clique em linha e exportação Excel.
- Componentes reutilizáveis de botão, input, select, modais e loading.
- Rotas de API padronizadas com contrato único de resposta.
- Utilitários para validação, autenticação, permissões, rate limit, criptografia e respostas de API.
- Migrations PostgreSQL para a base inicial.

## Stack

- Next.js com App Router.
- TypeScript com `strict`.
- React 19.
- Bootstrap e React Bootstrap para modais e base visual.
- Tailwind CSS para utilitários de layout e acabamento visual.
- React Select para campos de seleção.
- React Icons para ícones.
- PostgreSQL com `pg`.
- Nodemailer para envio de e-mails.
- JSON Web Token para autenticação.
- XLSX para exportação de dados.

## Fluxo Geral

1. O usuário acessa `/` e faz login.
2. A API `/api/auth/login` valida credenciais, perfil, status e empresa padrão.
3. Quando o login é válido, a sessão é gravada no cookie `app_session`.
4. O `src/proxy.ts` protege páginas e APIs privadas.
5. A área autenticada usa `src/app/(app)/layout.tsx` com a barra lateral.
6. A barra lateral consulta `/api/sideBar`, carrega permissões e monta o menu disponível.
7. As telas internas consomem APIs usando `requisitarAPI`.
8. As APIs respondem sempre no formato `{ sucesso, msg, dados }`.

## Telas Internas

- `/menuPrincipal`: ponto de entrada após o login.
- `/usuarios`: listagem e manutenção de usuários.
- `/usuarios/perfil`: listagem e manutenção de perfis de permissão.
- `/empresas`: listagem e manutenção de empresas.
- `/configuracoes`: dados gerais da aplicação, disponibilidade e SMTP.
- `/minhaConta`: manutenção dos dados do usuário autenticado.

## Estrutura

```text
src/
  app/                 Rotas, layouts, páginas, APIs e estilos globais
  components/
    inputs/            Botão, input e select reutilizáveis
    layout/            Barra lateral e estrutura visual
    modals/            Modais genéricos
    tables/            Tabelas reutilizáveis
  services/            Banco de dados e envio de e-mail
  utils/               Helpers reutilizáveis do front e back
database/
  migrations/          Scripts SQL da base inicial
```

## Banco De Dados

As migrations ficam em `database/migrations` e devem ser executadas em ordem crescente:

```text
001_criar_tabela_usuarios.sql
002_criar_tabela_configuracao.sql
004_criar_tabela_perfil.sql
005_criar_tabela_empresas.sql
006_criar_tabela_usuarios_empresas.sql
```

A documentação das tabelas está em `database/migrations/README.md`.

## Variáveis De Ambiente

Use `.env.example` como referência para criar o `.env` local. As principais configurações são:

- `JWT_SECRET`: segredo do JWT de sessão.
- `JWT_SECRET_REVERSIVEL`: segredo para criptografia reversível de valores sensíveis.
- `JWT_VALIDADE` e `MAXAGE_COOKIE`: validade do token e do cookie.
- `POSTGRES_*`: conexão com PostgreSQL.
- `SMTP_*`: valores iniciais de SMTP, quando usados pela aplicação.

## Como Rodar

```bash
npm install
npm run dev
```

A aplicação fica disponível em:

```text
http://localhost:3000
```

Comandos úteis:

```bash
npm run lint
npm run build
```

## Padrões Importantes

- Use `requisitarAPI` em `src/utils/api.ts` para chamadas do front.
- Use `criarRespostaApi` em `src/utils/respostaApi.ts` para respostas do back.
- Use `verificarPermissaoAPI` em rotas protegidas por perfil.
- Use `verificarRateLimitPorIp` em rotas sensíveis, como login e recuperação de senha.
- Use os componentes de `src/components` antes de criar variações novas.
- Mantenha novas funcionalidades genéricas o suficiente para reaproveitamento em outros projetos.
