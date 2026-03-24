# PlannerDuck

Plataforma de produtividade pessoal full-stack com Kanban, editor de documentos, calendário e bot WhatsApp com IA.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)

## Features

### Kanban Board
Gestão visual de tarefas com drag-and-drop via `@dnd-kit`. Suporte a múltiplos boards, colunas com limite de cards, prioridades (None, Low, Medium, High, Urgent), labels coloridas, datas de entrega e integração com o calendário.

### Editor de Documentos
Editor rich-text com BlockNote, estrutura hierárquica (documentos dentro de documentos), ícones e capas personalizadas. Suporte a arquivamento e organização por posição.

### Calendário
Visualização mensal, semanal e diária com FullCalendar 6. Tipos de evento: Event, Task, Reminder e Deadline. Eventos all-day e recorrentes. Cards do Kanban com data aparecem automaticamente no calendário.

### Bot WhatsApp com IA
Integração com Evolution API para conectar ao WhatsApp via QR Code. Processamento de mensagens com Google Gemini API. Filtragem por grupos permitidos, log de mensagens e rastreamento de custos de tokens.

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Linguagem | TypeScript 5 |
| Banco de dados | PostgreSQL + Prisma 6 |
| Autenticação | NextAuth v5 (credentials) |
| Editor | BlockNote 0.47 |
| Drag and Drop | @dnd-kit/core + @dnd-kit/sortable |
| Calendário | FullCalendar 6 |
| Estado global | Zustand 5 |
| Validação | Zod 4 |
| IA | Google Gemini API |
| WhatsApp | Evolution API |
| Infra local | Docker Compose |

## Arquitetura

Monolito modular organizado em `src/modules/`. Cada módulo contém:

```
src/modules/<feature>/
├── actions.ts      # Server actions (mutations)
├── queries.ts      # Data fetching
├── schemas.ts      # Validação com Zod
├── types.ts        # TypeScript types
├── components/     # Componentes React do módulo
└── hooks/          # Custom hooks do módulo
```

As páginas em `src/app/` são wrappers finos que chamam os componentes dos módulos. Rotas protegidas via middleware — apenas `/login`, `/register` e `/api/auth` são públicas.

## Setup

### Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL (ou Docker)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/plannerduck.git
cd plannerduck

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Configurar Docker Compose
cp docker-compose.example.yml docker-compose.yml
# Edite o docker-compose.yml com suas credenciais

# Subir o banco com Docker (opcional)
docker compose up -d

# Criar as tabelas no banco
pnpm db:push

# Seed com dados de demonstração (opcional)
pnpm db:seed

# Iniciar o servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Credenciais de demo

Após rodar o seed:

- **Email:** demo@plannerduck.com
- **Senha:** password123

## Modelo de Dados

```
User ──┬── Document (hierárquico, com parent/children)
       ├── Board ── Column ── Card ── CardLabel ── Label
       ├── CalendarEvent (integrado com Card)
       ├── WhatsAppConfig
       └── WhatsAppMessageLog
```

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento (Turbopack) |
| `pnpm build` | Build de produção |
| `pnpm db:push` | Sincronizar schema com o banco |
| `pnpm db:migrate` | Criar migration |
| `pnpm db:seed` | Popular banco com dados de demo |
| `pnpm db:studio` | Abrir Prisma Studio |

## License

MIT
