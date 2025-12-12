# Estructura Modular Unificada - PodoSkin

## Arquitectura

La aplicación sigue una arquitectura modular coherente inspirada en el módulo de autenticación:

```
src/
├── modules/                    # Módulos de negocio
│   ├── auth/                   # ✅ Autenticación y autorización
│   │   ├── components/         # Componentes UI del módulo
│   │   ├── stores/             # Estado global (Zustand)
│   │   ├── services/           # Lógica de negocio y API
│   │   ├── types/              # TypeScript types
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utilidades del módulo
│   │
│   ├── layout/                 # ✅ Layout y navegación
│   │   ├── components/         # MainLayout, Header, NavTabs, UserMenu
│   │   ├── config/             # Configuración de navegación
│   │   └── types/              # Tipos del layout
│   │
│   ├── dashboard/              # ✅ Dashboard con KPIs
│   │   ├── components/         # DashboardView, WelcomeCard, KPICard
│   │   ├── services/           # dashboardService + mock
│   │   └── types/              # Tipos de KPIs
│   │
│   └── chatbot/                # ✅ Asistente virtual flotante
│       ├── components/         # FloatingChatbot, ChatMessage
│       ├── services/           # chatService (Spark LLM)
│       ├── stores/             # chatStore (Zustand)
│       └── types/              # Tipos de mensajes
│
├── components/                 # ⚠️ Componentes legacy (migrar a módulos)
│   ├── AgendaView.tsx
│   ├── HistorialPacientesView.tsx
│   └── ConfiguracionesView.tsx
│
├── routes/                     # Rutas de la aplicación
│   ├── ProtectedRoute.tsx      # HOC para rutas protegidas
│   └── AppRoutes.tsx           # Definición de rutas
│
└── App.tsx                     # Punto de entrada simplificado
```

## Estado Actual

### ✅ Módulos completados (estructura unificada):
- **auth**: Login, JWT, RBAC, permisos
- **layout**: Header responsive, navegación por rol, menú de usuario
- **dashboard**: KPIs con datos mock, tarjeta de bienvenida
- **chatbot**: Asistente con Spark LLM, comandos rápidos, historial persistente

### ⚠️ Componentes pendientes de modularización:
Los siguientes componentes funcionan pero están en la carpeta legacy `/components`:
- `AgendaView.tsx` → mover a `/modules/agenda`
- `HistorialPacientesView.tsx` → mover a `/modules/pacientes`
- `ConfiguracionesView.tsx` → mover a `/modules/configuraciones`

## Patrón de Módulo

Cada módulo sigue esta estructura estándar:

```typescript
modules/
└── {nombre}/
    ├── components/              # UI components del módulo
    │   └── {Feature}View.tsx
    ├── services/                # Lógica de negocio
    │   ├── {feature}Service.ts       # Servicio real (API)
    │   └── {feature}Service.mock.ts  # Datos mock
    ├── stores/                  # Estado global (Zustand)
    │   └── {feature}Store.ts
    ├── types/                   # TypeScript interfaces
    │   └── {feature}.types.ts
    ├── hooks/                   # Custom React hooks
    │   └── use{Feature}.ts
    └── utils/                   # Utilidades específicas
        └── {feature}.utils.ts
```

## Servicios: Mock vs Real

Todos los módulos usan el patrón de intercambio fácil entre mock y API real:

```typescript
// {feature}Service.ts
import { {feature}ServiceMock } from './{feature}Service.mock'

export const USE_MOCK = true  // ← Cambiar a false para API real

export const {feature}Service = USE_MOCK 
  ? {feature}ServiceMock 
  : {feature}ServiceReal
```

## Rutas Protegidas

Las rutas usan React Router v6 con protección por roles:

```typescript
<Route element={<ProtectedRoute allowedRoles={['Admin', 'Podologo']} />}>
  <Route path="/historial-pacientes" element={<HistorialPacientesView />} />
</Route>
```

## Estado Global (Zustand)

Cada módulo que necesita estado global usa Zustand:

```typescript
// authStore.ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (username, password) => { ... },
      logout: () => { ... }
    }),
    { name: 'podoskin-auth' }
  )
)
```

## Próximos Pasos

### 1. Migrar componentes legacy a módulos:

**Agenda → `/modules/agenda`:**
```
modules/agenda/
├── components/
│   ├── AgendaView.tsx
│   ├── CalendarGrid.tsx
│   └── CitaCard.tsx
├── services/
│   ├── agendaService.ts
│   └── agendaService.mock.ts
├── stores/
│   └── agendaStore.ts
└── types/
    └── agenda.types.ts
```

**Pacientes → `/modules/pacientes`:**
```
modules/pacientes/
├── components/
│   ├── HistorialPacientesView.tsx
│   ├── PacientesList.tsx
│   ├── PacienteDetail.tsx
│   └── TratamientoCard.tsx
├── services/
│   ├── pacientesService.ts
│   └── pacientesService.mock.ts
├── stores/
│   └── pacientesStore.ts
└── types/
    └── pacientes.types.ts
```

**Configuraciones → `/modules/configuraciones`:**
```
modules/configuraciones/
├── components/
│   ├── ConfiguracionesView.tsx
│   ├── UsuariosTab.tsx
│   ├── PodologosTab.tsx
│   └── AuditoriaTab.tsx
├── services/
│   ├── configuracionesService.ts
│   └── configuracionesService.mock.ts
└── types/
    └── configuraciones.types.ts
```

### 2. Consolidar tipos globales

Mover `/lib/types.ts` a tipos por módulo para mejor encapsulación.

### 3. Eliminar carpeta `/components` legacy

Una vez migrados todos los componentes a sus respectivos módulos.

## Convenciones

- **Nombres de archivos**: PascalCase para componentes, camelCase para utilities
- **Exports**: Named exports preferidos sobre default exports
- **Tipos**: Siempre en archivos `.types.ts` separados
- **Servicios**: Siempre con versión mock y real
- **Stores**: Un store por módulo funcional
- **Iconos**: Usar Phosphor Icons con peso "duotone"

## Variables de entorno

```bash
# .env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000
```

## Uso del Chatbot con Spark LLM

El chatbot usa la API global de Spark:

```typescript
const response = await window.spark.llm(promptText, 'gpt-4o-mini')
```

Para cambiar a mock:
```typescript
// modules/chatbot/services/chatService.ts
export const USE_MOCK = true  // ← Cambiar aquí
```
