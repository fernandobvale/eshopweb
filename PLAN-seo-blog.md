# PLAN: Plataforma de Blogs SEO-First (Template Reutilizável)

## Overview
Criar um sistema de blogs moderno, rápido e altamente otimizado para SEO, focado em performance (Core Web Vitals) e funcionalidades completas de CMS/Admin. O projeto será construído como um **Template Robusto** e reutilizável por projeto, instanciado de forma simples via variáveis de ambiente (`.env`). A arquitetura prezará pela segurança com isolamento severo entre o frontend e a lógica de persistência de dados.

## Project Type
**WEB** (Next.js App Router)

## Success Criteria
- [ ] Lighthouse SEO Score ≥ 90
- [ ] LCP < 2.5s, FCP < 1.2s, Vitals verdes
- [ ] Arquitetura white-label configurável primariamente por variáveis de sistema e painel de tema
- [ ] Separação estrita de segurança onde nenhuma mutation do Supabase ocorre via Client Components.
- [ ] Conteúdos (páginas e posts) renderizados com otimização server-side e schema JSON-LD gerado de forma validada.

## Tech Stack
- **Framework Front/Back:** Next.js (App Router)
- **Styling:** TailwindCSS 
- **Database & Auth:** Supabase (Database PostgreSQL + Native Auth)
- **Security Middleware:** `iron-session` (AES-256-GCM para validação de sessão server-side)
- **Editor:** Markdown / Rich Text extensível (ex: TipTap ou similar compatível com react)
- **Hospedagem Alvo:** Vercel, Docker ou Nuvem de preferência (Zero node server customizado).

## File Structure (Proposta Inicial)
```text
├── app/
│   ├── (public)/          # Rotas públicas do Blog e templates
│   │   ├── page.tsx       # Home do blog
│   │   ├── [slug]/        # Post details
│   │   └── sitemap.ts, robots.ts, llm.txt
│   ├── (admin)/           # Rotas seguras do painel do CMS
│   │   ├── painel/
│   │   └── painel/posts/
│   └── api/               # API Routes (Serverless Functions) - TODAS AS ESCRITAS AQUI
│       ├── auth/
│       ├── admin/
│       └── public/
├── components/
│   ├── ui/                # Componentes base do design system (buttons, inputs)
│   ├── admin/             # Componentes específicos do admin (dashboards, editor)
│   └── blog/              # Layouts e cards públicos (grid, magazine)
├── lib/                   # Utilitários (Supabase client, iron-session conf, SEO helpers)
├── types/                 # Tipagens globais do Supabase e do projeto
└── public/                # Assets estáticos
```

## Task Breakdown

### 1. Project Initialization & Base Infrastructure
**Agent:** `frontend-specialist` | **Skills:** `clean-code`, `frontend-design`
- **INPUT:** Next.js scaffolding e dependências base.
- **ACTION:** Configurar Next.js App Router, TailwindCSS, tipagens globais (Hask/Husky/ESLint opcional se definido), definir design tokens no `.css` base e preparar arquivos de fonts/metadata globais.
- **OUTPUT:** Repositório Next.js inicial configurado sem erros de lint e buildável.
- **VERIFY:** `npm run build` passa; rodar `npm run dev` abre página em branco rodando a 60fps sem erros de console.

### 2. Database Schema & Security Policies (RLS)
**Agent:** `database-architect` | **Skills:** `database-design`
- **INPUT:** Necessidades de dados contidas no PRD (Posts, Categories, Users/Profiles com role, Pages, Theme_Settings).
- **ACTION:** Criar as scripts SQL para geração e migração das tabelas no Supabase RLS policies (RLS focado na segurança de leitura/escrita acoplada as validações da API) e definição de constraints, FKs, Triggers.
- **OUTPUT:** Esquema RLS testável e queries migratórias.
- **VERIFY:** Aplicar migration/schema localmente pelo `mcp` do Supabase Server. Validar integridade das tabelas via list tables.

### 3. Server-side Authentication & Security Layer
**Agent:** `security-auditor` & `backend-specialist` | **Skills:** `api-patterns`
- **INPUT:** Chaves Supabase, requerimento de `iron-session`.
- **ACTION:** Implementar login, rota `/api/auth/login`, registro, cookies encryptados via `iron-session`. Criação de wrapper client `getIronSession` para uso em Server Actions, Middlewares do Next.js bloqueando rotas `/painel`.
- **OUTPUT:** Fluxo de login admin finalizado.
- **VERIFY:** Login bem sucedido gera cookie seguro HTTP-only e redireciona ao Admin; tentativa de acesso ao `/painel` sem cookie redireciona à home.

### 4. Admin CMS: Theme Management e Media
**Agent:** `frontend-specialist` | **Skills:** `frontend-design`, `api-patterns`
- **INPUT:** PRD pede temas flexíveis (Logo, title meta base, redes sociais).
- **ACTION:** Construir UI Settings no DB. Criar rota de API para edição e front-end para configurações de Template. Upload local ou Supabase Storage para Logo e imagens de perfil.
- **OUTPUT:** Painel Administrativo estruturado com sidebar, cores institucionais (sem violet/purple se regra ativa), painel de Theme settings modificado na tabela correspondente.
- **VERIFY:** Upload da logo salva e link retornado. `GET /api/admin/settings` retorna as configs. 

### 5. Admin CMS: Post Editor & Content Management
**Agent:** `frontend-specialist` | **Skills:** `clean-code`
- **INPUT:** Módulo CRUD de Articles e Authors. Requisito de WYSIWYG / Markdown.
- **ACTION:** Criar rota de API de CRUD de posts (`/api/admin/posts` methods `POST/PUT/DELETE`). Criar interface WYSIWYG no frontend cliente (Editor.js, TipTap, ou MDX). Lógica unificada para Titles, Tags, SEO Custom Fields, Meta Description.
- **OUTPUT:** Tela de edição capaz de salvar rascunhos, agendar e publicar Posts de blog, definindo o canonical URL ou SEO extra.
- **VERIFY:** Testar payload enviado a API (`POST`); o DB acusa insert seguro; o Post reflete na lista do gerenciador (SSG inavlidado).

### 6. Public Blog Modules & SEO Render 
**Agent:** `frontend-specialist` | **Skills:** `seo-fundamentals`
- **INPUT:** Requisito de performance Vitals, Next.js Metadata API, SSG/ISR, JSON-LD para Article e Organization.
- **ACTION:** Construir páginas públicas (Home, Lista de Filtros de Cat/Autores, Post View com layouts Magazine/Grid dinamicamente escolhidos nas settings). Inserção de schema nativo no HTML via tags `<script type="application/ld+json">`.
- **OUTPUT:** Interface que usuários finais (viewers) visualizarão, consumindo chamadas `fetch` em Server Components.
- **VERIFY:** Validar o head do HTML da página `/[slug]` com tag OGs, Meta e JSON-LD presentes; Sem client-side requests pesados de DB desnecessários.

### 7. Tech SEO Artifacts (XML, TXT)
**Agent:** `backend-specialist` (or Frontend via App Router dynamics) | **Skills:** `seo-fundamentals`
- **INPUT:** Requisitos de `sitemap.xml`, `robots.txt`, `llm.txt`.
- **ACTION:** Criar rotas no Edge/Serverless Next.js (ex. `app/sitemap.ts`) construindo de forma dinâmica e cacheada listas de URLS a partir das chamadas DB com limite e order.
- **OUTPUT:** Endpoints indexáveis que bots podem raspar.
- **VERIFY:** Efetuar Fetch (`GET /sitemap.xml`) e checar retorno XML puro formatado. Validar llm.txt retorno estático.

---

## ✅ Phase X: Verification Checklist
- [ ] P0: Security Scan (vulnerabilidades, credenciais expostas no cliente).
- [ ] P0: Tipagem (Sem any ou erro de build TS no `npm run build`).
- [ ] P1: Checagem Visual e UX (Testes de contraste + Foco em performance Core Web Vitals).
- [ ] P3: Lighthouse Script Audit (Atingir 90+ em SEO, acessibilidade e Performace mobile proxy).
- [ ] P4: Validação Funcional End-2-End Básica (Autenticação, criar post, ver post front).
