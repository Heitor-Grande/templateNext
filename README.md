# 🚀 Template Next.js (TypeScript + Bootstrap)

Este projeto é um **template base** criado com Next.js para acelerar o desenvolvimento de aplicações modernas utilizando boas práticas desde o início.

A proposta é ter uma base pronta com estrutura organizada, componentes reutilizáveis e estilização utilizando Bootstrap.

---

## 🧱 Stack utilizada

* Next.js
* TypeScript
* React Bootstrap
* Bootstrap
* ESLint

---

## ⚙️ Criação do projeto

Este template foi criado com o comando:

```bash
npx create-next-app@latest template-next
```

Configurações:

* ✅ TypeScript
* ✅ ESLint
* ❌ React Compiler
* ❌ Tailwind CSS
* ❌ Estrutura com `src/`
* ✅ App Router 
* ❌ Alias de importação (`@/*`)
* ❌ AGENTS.md

---

## 📦 Instalação de dependências de UI

Após criar o projeto, foram adicionadas as dependências de estilização:

```bash
npm install react-bootstrap bootstrap
```

---

## 🎨 Configuração do Bootstrap

No arquivo `src/app/layout.tsx`, importe o CSS do Bootstrap:

```tsx
import 'bootstrap/dist/css/bootstrap.min.css';
```

---

## 📁 Estrutura inicial

```bash
template-next/
├── public/
├── src/
│   ├── app/
│   │   ├── api/      # API interna do next 
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── cssGlobal.css
│   ├── components/   # componentes reutilizáveis
│   ├── services/     # integração com APIs
│   ├── hooks/        # hooks customizados
│   └── utils/        # funções auxiliares
```

---

## 🚀 Como rodar o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```bash
http://localhost:3000
```

---

## 📌 Objetivo do template

Este template foi criado com foco em:

* Desenvolvimento rápido com componentes prontos
* Organização de código
* Reutilização de componentes
* Escalabilidade para pequenos e médios projetos
