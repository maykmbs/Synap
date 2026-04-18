# Synap v1 — Plan de Proyecto

> Herramienta de captura y organización personal con clasificación automática por IA.
> **Nombre de la app:** Synap
> **Equipo:** 2 devs juniors · <10h semanales c/u · Sin deadline fijo

---

## Índice

1. [Visión del producto](#1-visión-del-producto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura del sistema](#3-arquitectura-del-sistema)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Base de datos — Schema Supabase](#5-base-de-datos--schema-supabase)
6. [Rutas de la aplicación](#6-rutas-de-la-aplicación)
7. [Funcionalidades por módulo](#7-funcionalidades-por-módulo)
8. [Contrato de API — FastAPI](#8-contrato-de-api--fastapi)
9. [Clasificador AI — Prompt](#9-clasificador-ai--prompt)
10. [Plan de fases semana a semana](#10-plan-de-fases-semana-a-semana)
11. [División de trabajo por dev](#11-división-de-trabajo-por-dev)
12. [Variables de entorno](#12-variables-de-entorno)
13. [Convenciones del proyecto](#13-convenciones-del-proyecto)
14. [Criterios de done por fase](#14-criterios-de-done-por-fase)
15. [Fases futuras post-MVP](#15-fases-futuras-post-mvp)

---


## 1. Visión del producto

Synap es una herramienta web personal donde el usuario pega cualquier tipo de contenido (un link, un importe, una idea, una tarea) en una sola caja de texto, y la IA lo clasifica automáticamente y lo organiza en la sección correspondiente.

**Problema que resuelve:** el usuario tiene contenido disperso en notas, capturas de pantalla, marcadores, apps de tareas y hojas de cálculo. Synap es el punto de entrada único.

**Propuesta de valor:** captura en segundos, organización automática, sin fricción.

### Destinos de clasificación

| Tipo | Qué guarda | Datos extraídos |
|------|-----------|-----------------|
| `finance` | Gastos, pagos, importes | importe, moneda, categoría inferida |
| `task` | Pendientes, recordatorios | texto, prioridad inferida (high/medium/low) |
| `library` | Links, reels, artículos | URL, título, resumen corto generado por IA |
| `note` | Texto libre, ideas | texto sin procesar extra |

---

## 2. Stack tecnológico


### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 14 (App Router) | Framework principal, rutas, SSR |
| TypeScript | 5.x | Tipado estático en todo el proyecto |
| Tailwind CSS | 3.x | Estilos utilitarios |
| Zustand | 4.x | Estado global del inbox |
| TanStack Query | 5.x | Fetching, caché y revalidación de datos del backend (ej: items, usuario, etc). Permite manejo eficiente de estados de carga, error y sincronización con Supabase y FastAPI. |

**Nota:**
- No se usará shadcn/ui. Todos los componentes UI serán creados desde cero, priorizando accesibilidad y consistencia visual con la paleta definida.
- Se usará TanStack Query para sincronización y caché de datos remotos (Supabase, FastAPI) y Zustand para estado global local (UI, flags, selección, etc.). Ambos se complementan y son estándar en apps Next.js modernas.

### Backend AI
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| FastAPI | 0.110+ | API del clasificador |
| Python | 3.11+ | Lenguaje del microservicio |
| Groq SDK | latest | LLM rápido para clasificación |
| Pydantic | 2.x | Validación de schemas de entrada/salida |
| Uvicorn | latest | Servidor ASGI de producción |

### Infraestructura
| Servicio | Plan MVP | Uso |
|---------|---------|-----|
| Supabase | Free tier | Auth + PostgreSQL + Storage |
| Vercel | Hobby | Deploy del frontend Next.js |
| Railway | Starter | Deploy del microservicio FastAPI |

### Paleta de colores
```
#0d1b2a  →  bg-base      (fondo principal)
#1b263b  →  bg-surface   (cards, inputs)
#415a77  →  accent       (botones, bordes activos, Dev 1)
#778da9  →  muted        (texto secundario, Dev 2)
#e0e1dd  →  text         (texto principal)
```

---

## 3. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Usuario (browser)                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              Next.js 14 — Vercel                         │
│  App Router · Middleware auth · Server Components        │
│  /dashboard /inbox /finances /tasks /library /notes      │
└──────────┬────────────────────────────┬─────────────────┘
           │ Supabase JS Client         │ fetch REST
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│   Supabase           │    │   FastAPI — Railway          │
│   Auth (JWT)         │    │   POST /classify             │
│   PostgreSQL         │    │   Groq SDK → llama3          │
│   Row Level Security │    │   Pydantic validation        │
└─────────────────────┘    └─────────────────────────────┘
```

**Flujo principal:**
1. Usuario pega texto en `/inbox`
2. Next.js llama `POST /classify` al microservicio FastAPI (con JWT del usuario en header)
3. FastAPI envía el texto a Groq con un prompt estructurado
4. Groq devuelve JSON con `type` + `data` extraída
5. FastAPI valida con Pydantic y responde
6. Next.js guarda el item en Supabase con el `user_id` del usuario autenticado
7. La UI actualiza el historial y redirige a la sección correspondiente

---

## 4. Estructura del repositorio

```
synap/
├── frontend/                  ← Next.js frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx        ← sidebar + auth guard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── inbox/
│   │   │   │   └── page.tsx
│   │   │   ├── finances/
│   │   │   │   └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx
│   │   │   ├── library/
│   │   │   │   └── page.tsx
│   │   │   ├── notes/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   ← componentes propios reutilizables
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── inbox/
│   │   │   ├── CaptureBox.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   └── TypeBadge.tsx
│   │   ├── finances/
│   │   ├── tasks/
│   │   ├── library/
│   │   └── notes/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── api/
│   │   │   └── classifier.ts     ← llamadas a FastAPI
│   │   └── utils.ts
│   ├── store/
│   │   └── inbox.store.ts        ← Zustand
│   ├── types/
│   │   └── index.ts              ← tipos compartidos
│   ├── middleware.ts             ← protección de rutas
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                    ← FastAPI microservicio
│   ├── main.py
│   ├── routers/
│   │   └── classify.py
│   ├── schemas/
│   │   ├── request.py
│   │   └── response.py
│   ├── services/
│   │   └── groq_service.py
│   ├── prompts/
│   │   └── classifier.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Base de datos — Schema Supabase

### Tabla `items`

```sql
create table items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null check (type in ('finance', 'task', 'library', 'note')),
  raw_text    text not null,
  data        jsonb not null default '{}',
  status      text not null default 'pending' check (status in ('pending', 'done', 'archived')),
  confidence  numeric(4,3),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row Level Security
alter table items enable row level security;

create policy "Users see only their items"
  on items for all
  using (auth.uid() = user_id);

-- Índices
create index items_user_id_idx on items(user_id);
create index items_type_idx on items(type);
create index items_created_at_idx on items(created_at desc);
```

### Estructura del campo `data` (JSONB) por tipo

```jsonc
// type: "finance"
{
  "amount": 15.99,
  "currency": "EUR",
  "category": "Suscripciones",
  "description": "Netflix mensual"
}

// type: "task"
{
  "title": "Llamar al banco",
  "priority": "high",    // high | medium | low
  "due_date": null
}

// type: "library"
{
  "url": "https://example.com/article",
  "title": "Título extraído o inferido",
  "summary": "Resumen de 2 líneas generado por IA",
  "content_type": "link"  // link | reel | article
}

// type: "note"
{
  "content": "Texto libre sin procesar"
}
```

### Tabla `user_preferences`

```sql
create table user_preferences (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  default_currency    text default 'EUR',
  classification_hint text,               -- contexto adicional para el clasificador
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "Users manage their own preferences"
  on user_preferences for all
  using (auth.uid() = user_id);
```

---

## 6. Rutas de la aplicación

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/auth/login` | Pública | Login + registro con Supabase Auth |
| `/dashboard` | Privada | Resumen semanal, métricas, actividad reciente, quick capture |
| `/inbox` | Privada | Caja de captura + clasificación AI + historial de items |
| `/finances` | Privada | Lista de gastos, balance del mes, selector por mes |
| `/tasks` | Privada | Pendientes por prioridad, marcar como hecho |
| `/library` | Privada | Links y reels guardados, filtro por tipo |
| `/notes` | Privada | Notas libres con búsqueda simple |
| `/settings` | Privada | Perfil de usuario, preferencias de clasificación |

### Middleware de protección (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')

  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 7. Funcionalidades por módulo

### Dashboard (MVP)
- Stat cards con datos reales: items esta semana, sin revisar, links guardados, tareas pendientes
- Feed de actividad reciente (últimos 10 items de cualquier tipo)
- Widget de quick capture: textarea pequeña + botón Clasificar (misma lógica que /inbox)
- Alerta visual si hay items sin revisar (badge en sidebar)

### Inbox (MVP)
- Textarea grande con placeholder "Pegá cualquier cosa — link, importe, idea..."
- Botón "Clasificar" que llama a FastAPI → muestra loading skeleton → muestra resultado
- El resultado muestra: tipo detectado, datos extraídos, confianza
- Botón de confirmar (guarda en Supabase) o reclasificar manualmente (dropdown con 4 tipos)
- Historial scrolleable de items ya procesados con badge de tipo + preview + fecha

### Finanzas (MVP)
- Lista de gastos del mes actual ordenada por fecha
- Selector de mes (< Noviembre >)
- Cada fila: icono de categoría + descripción + categoría inferida + importe
- Balance total del mes en card destacada (suma de todos los importes)
- Sin presupuestos ni gráficos en MVP

### Tareas (MVP)
- Filtro por prioridad: tabs All / High / Medium / Low
- Cada fila: checkbox + texto de tarea + pill de prioridad + fecha de creación
- Click en checkbox → actualiza `status` a `done` en Supabase → tachado visual
- Sin fechas límite ni subtareas en MVP

### Biblioteca (MVP)
- Grid de 3 columnas de cards
- Cada card: favicon/dominio + título + resumen 2 líneas + tipo (link/reel/article) + fecha
- Filtros horizontales: All / Links / Reels / Articles
- Click en card → abre URL en nueva pestaña

### Notas (MVP)
- Search bar: filtra notas en cliente (no query a DB) por texto
- Grid masonry o lista de cards con preview del texto
- Botón "Nueva nota" → abre inline editor en la misma página
- Sin tags ni categorías en MVP

### Ajustes (MVP)
- Sección Cuenta: nombre, email (read-only), cambiar contraseña
- Sección Preferencias: moneda por defecto, hint de clasificación (campo libre que se añade al prompt)
- Botón Cerrar sesión

---

## 8. Contrato de API — FastAPI

Base URL local: `http://localhost:8000`
Base URL producción: `https://ai-service.up.railway.app`

### `POST /classify`

Clasifica un texto crudo y extrae datos estructurados.

**Request:**
```json
{
  "text": "Pagar Netflix 15.99 EUR este mes",
  "user_hint": "Tengo gastos frecuentes en suscripciones de software"
}
```

**Response 200:**
```json
{
  "type": "finance",
  "confidence": 0.94,
  "data": {
    "amount": 15.99,
    "currency": "EUR",
    "category": "Suscripciones",
    "description": "Netflix mensual"
  }
}
```

**Tipos de respuesta posibles:**
```jsonc
// finance
{ "type": "finance", "confidence": 0.94, "data": { "amount": 15.99, "currency": "EUR", "category": "string", "description": "string" } }

// task
{ "type": "task", "confidence": 0.87, "data": { "title": "string", "priority": "high|medium|low", "due_date": null } }

// library
{ "type": "library", "confidence": 0.91, "data": { "url": "string", "title": "string", "summary": "string", "content_type": "link|reel|article" } }

// note
{ "type": "note", "confidence": 0.78, "data": { "content": "string" } }
```

**Response 422:** texto vacío o inválido
**Response 503:** error de Groq API (timeout o límite de rate)

### `GET /health`

```json
{ "status": "ok", "model": "llama3-8b-8192" }
```

---

## 9. Clasificador AI — Prompt

```python
SYSTEM_PROMPT = """
You are a personal inbox classifier. Your job is to analyze a text input and classify it into one of four categories, then extract structured data from it.

Categories:
- finance: monetary amounts, expenses, payments, subscriptions, bills
- task: to-dos, reminders, things to do, action items
- library: URLs, links, articles, videos, reels, content to save
- note: free text, ideas, thoughts, anything that doesn't fit the above

Rules:
- Always respond with valid JSON only. No markdown, no explanation, no extra text.
- Always include: type, confidence (0.0 to 1.0), and data object.
- For finance: extract amount as a number, currency as 3-letter code, infer category from context, add a short description.
- For task: extract a clean title, infer priority (high/medium/low) based on urgency words, due_date is null if not mentioned.
- For library: extract the URL if present, generate a 1-2 sentence summary, detect content_type (link/reel/article).
- For note: put the full text in content, no extra processing.
- If unsure between types, pick the most likely and set confidence below 0.7.
"""

def build_user_prompt(text: str, user_hint: str = "") -> str:
    hint_block = f"\nUser context: {user_hint}" if user_hint else ""
    return f"Classify this input:{hint_block}\n\n{text}"
```

---

## 10. Plan de fases semana a semana

**Resumen:** 12 semanas estimadas · ~20h de equipo por semana · ~240h totales

---

### Fase 1 — Setup y fundamentos
**Semanas 1–2 · ~40h equipo**

#### Semana 1

| Dev | Tarea |
|-----|-------|
| Dev 1 | Crear repo, configurar Next.js 14 con App Router, Tailwind, shadcn/ui, ESLint, Prettier |
| Dev 1 | Crear estructura de carpetas completa (apps/web + apps/ai-service) |
| Dev 2 | Inicializar proyecto FastAPI con estructura de carpetas, Pydantic, Uvicorn |
| Dev 2 | Conectar Groq SDK, crear endpoint `POST /classify` hardcodeado (respuesta fija) |
| Ambos | Definir contrato de API: tipos TypeScript + schemas Pydantic en sync |
| Ambos | Crear `.env.example` con todas las variables necesarias |

#### Semana 2

| Dev | Tarea |
|-----|-------|
| Dev 1 | Integrar Supabase Auth: login, registro, sesión persistente con cookies |
| Dev 1 | Crear middleware de protección de rutas en Next.js |
| Dev 1 | Página `/auth/login` con formulario básico funcional |
| Dev 2 | Crear proyecto en Supabase, definir schema SQL completo (tablas + RLS) |
| Dev 2 | Configurar CORS en FastAPI para aceptar requests del frontend local |
| Ambos | Smoke test: login → sesión activa → ruta protegida funciona → DB conectada |

**Criterio de done Fase 1:** el dev 1 puede hacer login y ver una ruta protegida. El dev 2 tiene un endpoint `/classify` que responde JSON válido.

---

### Fase 2 — Inbox + Clasificador AI
**Semanas 3–5 · ~60h equipo**

#### Semana 3

| Dev | Tarea |
|-----|-------|
| Dev 1 | Layout principal: sidebar fijo con navegación, 8 rutas con placeholder "Coming soon" |
| Dev 1 | Componente `Sidebar.tsx` con estado activo de ruta, colores de la paleta |
| Dev 2 | Prompt real de clasificación con Groq: llama3-8b-8192, JSON estricto |
| Dev 2 | Schemas Pydantic para request/response del clasificador |
| Dev 2 | Manejo de errores de Groq: timeout, rate limit, respuesta inválida |

#### Semana 4

| Dev | Tarea |
|-----|-------|
| Dev 1 | Página `/inbox`: `CaptureBox.tsx` con textarea + botón Clasificar |
| Dev 1 | Llamada a FastAPI desde Next.js, loading skeleton mientras clasifica |
| Dev 1 | Mostrar resultado: tipo con badge de color + datos extraídos + confianza |
| Dev 2 | Endpoint `POST /items` en Supabase (desde Next.js API route) para guardar item |
| Dev 2 | Validar que el JWT del usuario llega correctamente al microservicio FastAPI |

#### Semana 5

| Dev | Tarea |
|-----|-------|
| Dev 1 | Historial de items en `/inbox`: lista con badge tipo + preview + fecha + botón reclasificar |
| Dev 1 | Dropdown de reclasificación manual: cambia el tipo y actualiza en Supabase |
| Dev 2 | Endpoint `PATCH /items/:id` para actualizar type/status |
| Ambos | Demo interna completa: login → pegar texto → clasificar → ver en historial → reclasificar |

**Criterio de done Fase 2:** el flujo completo de inbox funciona de punta a punta.

---

### Fase 3 — Secciones de contenido
**Semanas 6–10 · ~100h equipo**

#### Semana 6 — Finanzas

| Dev | Tarea |
|-----|-------|
| Dev 1 | Página `/finances`: lista de gastos + selector de mes + balance total |
| Dev 1 | Componente `ExpenseRow.tsx`: icono categoría + descripción + importe |
| Dev 2 | Query Supabase: `items` donde `type='finance'`, filtrar por mes, calcular suma total |

#### Semana 7 — Tareas

| Dev | Tarea |
|-----|-------|
| Dev 1 | Página `/tasks`: lista con tabs de prioridad + checkbox + pill de prioridad |
| Dev 1 | Click en checkbox → optimistic update → PATCH en Supabase |
| Dev 2 | Query con ORDER BY `data->>'priority'` (high → medium → low), filtro por status |

#### Semana 8 — Biblioteca

| Dev | Tarea |
|-----|-------|
| Dev 1 | Página `/library`: grid 3 columnas + filtros por tipo + cards con summary |
| Dev 1 | Componente `LibraryCard.tsx`: favicon + título + resumen + dominio |
| Dev 2 | Mejorar prompt de biblioteca: detectar si es reel (instagram.com, youtube.com), generar summary de calidad |

#### Semana 9 — Notas y Ajustes

| Dev | Tarea |
|-----|-------|
| Dev 1 | Página `/notes`: search bar local + grid de cards + inline editor para nueva nota |
| Dev 2 | Página `/settings`: formulario de perfil + preferencias guardadas en `user_preferences` |

#### Semana 10 — Dashboard

| Dev | Tarea |
|-----|-------|
| Ambos | Página `/dashboard`: stat cards con queries reales, feed de actividad, widget quick capture |
| Ambos | Badge en sidebar para items sin revisar (items con status='pending' creados hoy) |

**Criterio de done Fase 3:** todas las rutas tienen contenido real desde Supabase.

---

### Fase 4 — Pulido y deploy
**Semanas 11–12 · ~40h equipo**

#### Semana 11

| Dev | Tarea |
|-----|-------|
| Dev 1 | Estados vacíos en todas las páginas (ilustración + CTA para capturar) |
| Dev 1 | Loading skeletons en listas y grids mientras cargan datos |
| Dev 1 | Manejo de errores en UI: toasts para errores de red, reintentos |
| Dev 1 | Verificar que el diseño se ve bien en 1280px, 1440px y 1920px |
| Dev 2 | Rate limiting en FastAPI (slowapi: 10 req/min por usuario) |
| Dev 2 | Logging estructurado de errores de Groq para debugging en Railway |
| Dev 2 | Validaciones adicionales: texto mínimo 3 chars, máximo 5000 chars |

#### Semana 12

| Dev | Tarea |
|-----|-------|
| Dev 1 | Deploy Next.js en Vercel: variables de entorno de producción, dominio |
| Dev 1 | Verificar que Supabase Auth funciona en producción (redirect URLs) |
| Dev 2 | Dockerfile para FastAPI + deploy en Railway |
| Dev 2 | Conectar FastAPI de Railway con Supabase de producción |
| Ambos | Smoke test completo en producción: todos los flujos de las 8 páginas |
| Ambos | Fix de bugs bloqueantes encontrados en producción |

**Criterio de done Fase 4:** el MVP está en producción y es usable sin errores bloqueantes.

---

## 11. División de trabajo por dev

### Dev 1 — Frontend + UX

**Responsabilidades permanentes:**
- Todo lo que está en `frontend/`
- Integración con Supabase Auth desde el cliente
- Llamadas a FastAPI desde Next.js
- Diseño de componentes con la paleta del proyecto
- Estado global con Zustand

**Habilidades que va a desarrollar:**
- Next.js App Router con Server y Client Components
- Auth con Supabase + cookies en Next.js
- TanStack Query para fetching y caché
- Manejo de estados de carga y error en UI

### Dev 2 — Backend + AI

**Responsabilidades permanentes:**
- Todo lo que está en `backend/`
- Schema de Supabase + políticas RLS
- Prompt engineering del clasificador
- Endpoints REST en Next.js API routes para operaciones en DB

**Habilidades que va a desarrollar:**
- FastAPI con Pydantic y tipado estricto
- Prompt engineering para JSON estructurado
- Supabase desde Python y desde JS
- Deploy con Docker en Railway

### Punto de sincronización semanal (recomendado)

Una vez por semana, 30 minutos de sync:
1. ¿Qué terminé esta semana?
2. ¿Qué me bloqueó?
3. ¿Qué necesito del otro dev esta semana?
4. ¿El contrato de API sigue igual o hay cambios?

---

## 12. Variables de entorno

### `frontend/.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# FastAPI AI Service
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# Solo en producción
NEXT_PUBLIC_AI_SERVICE_URL=https://ai-service.up.railway.app
```

### `backend/.env`

```bash
# Groq
GROQ_API_KEY=gsk_...

# Supabase (para validar JWTs si se necesita)
SUPABASE_JWT_SECRET=your-jwt-secret

# Config
ENV=development
MAX_TEXT_LENGTH=5000
RATE_LIMIT_PER_MINUTE=10
```

---

## 13. Convenciones del proyecto

### Git

```
# Branches
main          → producción, solo merge via PR
dev           → rama de integración
feat/nombre   → nueva funcionalidad
fix/nombre    → corrección de bug

# Commits (Conventional Commits)
feat(inbox): add manual reclassification dropdown
fix(auth): redirect loop on expired session
chore(deps): update groq sdk to 0.4.0
```

### TypeScript (Frontend)

```typescript
// Tipos centrales en frontend/types/index.ts
export type ItemType = 'finance' | 'task' | 'library' | 'note'
export type Priority = 'high' | 'medium' | 'low'
export type ItemStatus = 'pending' | 'done' | 'archived'

export interface InboxItem {
  id: string
  user_id: string
  type: ItemType
  raw_text: string
  data: FinanceData | TaskData | LibraryData | NoteData
  status: ItemStatus
  confidence: number
  created_at: string
  updated_at: string
}

export interface FinanceData {
  amount: number
  currency: string
  category: string
  description: string
}

export interface TaskData {
  title: string
  priority: Priority
  due_date: string | null
}

export interface LibraryData {
  url: string
  title: string
  summary: string
  content_type: 'link' | 'reel' | 'article'
}

export interface NoteData {
  content: string
}
```

### Tailwind — clases de la paleta

```typescript
// tailwind.config.ts
colors: {
  base:    '#0d1b2a',
  surface: '#1b263b',
  accent:  '#415a77',
  muted:   '#778da9',
  primary: '#e0e1dd',
}

// Uso en componentes:
// bg-base, bg-surface, text-primary, text-muted, border-accent
```

### Python (FastAPI)

```python
# Naming: snake_case en todo Python
# Schemas: siempre con Pydantic BaseModel
# Routers: un archivo por endpoint group
# No lógica de negocio en routers: delegar a services/
```

---

## 14. Criterios de done por fase

| Fase | Criterio de done |
|------|-----------------|
| Fase 1 | Login funciona, ruta protegida redirige, endpoint /classify responde JSON |
| Fase 2 | Flujo completo: pegar texto → clasificar → guardar → ver en historial |
| Fase 3 | Las 8 páginas muestran datos reales desde Supabase |
| Fase 4 | App en producción sin errores bloqueantes, smoke test completo aprobado |

---

## 15. Fases futuras post-MVP

### Fase 4 del producto — Recordatorios
- Alerta de items con `status='pending'` sin abrir en más de 24h
- Sugerencias proactivas basadas en patrones del usuario
- Email digest semanal via Supabase Edge Functions

### Fase 5 del producto — Share Sheet Mobile
- PWA con manifest para instalación en móvil
- Web Share Target API para recibir contenido desde Instagram, YouTube, Safari
- Captura de URLs directamente desde el share sheet del sistema operativo

### Mejoras AI
- Aprendizaje por correcciones: guardar reclasificaciones manuales para mejorar el prompt
- Clasificación de imágenes: fotos de recibos → extracción de importe con vision API
- Búsqueda semántica en notas con embeddings (pgvector en Supabase)

### Colaboración
- Multi-usuario: compartir listas de tareas o biblioteca con otros usuarios
- Auth con múltiples proveedores: Google, GitHub

---

*Plan generado para Synap v1 · 2 devs juniors · Stack: Next.js + Supabase + FastAPI + Groq · Deploy: Vercel + Railway*
