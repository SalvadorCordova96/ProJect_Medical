# 🔐 Módulo de Autenticación - PodoSkin

Sistema completo de autenticación con JWT, Zustand, RBAC (Control de Acceso Basado en Roles) y soporte para cambio fácil entre datos MOCK y API real.

## ✨ Características Implementadas

- ✅ Login con JWT (mock/real)
- ✅ Store global con Zustand + persistencia en localStorage
- ✅ 3 roles: Admin, Podologo, Recepcion
- ✅ Sistema de permisos granular (RBAC)
- ✅ Interceptor Axios para manejo automático de tokens
- ✅ Manejo de errores 401/403
- ✅ UI moderna con shadcn/ui
- ✅ Usuarios de prueba pre-configurados
- ✅ Logout con limpieza completa de estado

---

## 📁 Estructura de Archivos

```
src/modules/auth/
├── types/
│   └── auth.types.ts          # Tipos TypeScript + permisos por rol
├── services/
│   ├── authService.mock.ts    # Servicio MOCK (3 usuarios de prueba)
│   └── authService.ts          # Servicio REAL + switch MOCK/REAL
├── stores/
│   └── authStore.ts           # Store Zustand con persistencia
├── components/
│   ├── LoginForm.tsx          # Formulario de login
│   └── LogoutButton.tsx       # Botón de logout reutilizable
├── hooks/
│   └── useAuth.ts             # Hook simplificado para acceder al store
└── utils/
    ├── permissions.ts          # Funciones de verificación de permisos
    └── authInterceptor.ts      # Interceptor Axios para 401
```

---

## 👥 Usuarios de Prueba (MOCK)

| Usuario      | Contraseña    | Rol        |
|--------------|---------------|------------|
| `admin`      | `Admin2024!`  | Admin      |
| `dr.ornelas` | `Podo2024!`   | Podologo   |
| `recepcion`  | `Recep2024!`  | Recepcion  |

---

## 🔑 Permisos por Rol

### Admin
- ✅ Ver dashboard, pacientes, citas, tratamientos, reportes
- ✅ Editar/eliminar pacientes
- ✅ **Gestionar usuarios** (crear, editar, cambiar roles)
- ✅ **Configuración del sistema**
- ✅ Ver finanzas

### Podologo
- ✅ Ver dashboard, pacientes, citas, tratamientos, reportes
- ✅ Editar pacientes (campos clínicos)
- ✅ Crear/editar citas propias
- ✅ Crear evoluciones clínicas
- ❌ No puede gestionar usuarios ni configuración

### Recepcion
- ✅ Ver dashboard, pacientes (datos básicos), citas
- ✅ Agendar/editar citas
- ✅ Ver prospectos
- ❌ No puede editar tratamientos ni evoluciones clínicas
- ❌ No puede gestionar usuarios ni configuración

---

## 🚀 Uso Básico

### 1. Login

```typescript
import { useAuthStore } from '@/modules/auth/stores/authStore'

function LoginPage() {
  const { login, isLoading, error } = useAuthStore()
  
  const handleLogin = async () => {
    try {
      await login('admin', 'Admin2024!')
      // Usuario autenticado → redirigir
    } catch (err) {
      // Error manejado automáticamente en el store
    }
  }
}
```

### 2. Acceder al usuario actual

```typescript
import { useAuthStore } from '@/modules/auth/stores/authStore'

function ProfileComponent() {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) return <Redirect to="/login" />
  
  return <div>Bienvenido, {user?.nombre_usuario} ({user?.rol})</div>
}
```

### 3. Verificar permisos

```typescript
import { usePermissions } from '@/modules/auth/utils/permissions'
import { useAuthStore } from '@/modules/auth/stores/authStore'

function ConfigButton() {
  const { user } = useAuthStore()
  const permissions = usePermissions(user?.rol ?? 'Recepcion')
  
  if (!permissions.canManageSettings) return null
  
  return <Button>Configuraciones</Button>
}
```

### 4. Logout

```typescript
import { useAuthStore } from '@/modules/auth/stores/authStore'

function LogoutButton() {
  const { logout } = useAuthStore()
  
  return <Button onClick={logout}>Cerrar Sesión</Button>
}
```

---

## 🔄 Cambiar de MOCK a API Real

### Opción 1: Editar `authService.ts`

```typescript
// src/modules/auth/services/authService.ts

export const USE_MOCK = false; // 👈 Cambiar a false
```

### Opción 2: Variable de entorno

Crear archivo `.env`:

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

Luego actualizar `authService.ts`:

```typescript
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
```

---

## 🛡️ Interceptor Axios (Configuración Automática)

El interceptor se configura en `App.tsx`:

```typescript
import { setupAuthInterceptor } from '@/modules/auth/utils/authInterceptor'
import axios from 'axios'

// Configurar interceptor al iniciar la app
setupAuthInterceptor()

// Restaurar token desde localStorage
const token = useAuthStore.getState().token
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
```

**¿Qué hace?**
- ✅ Agrega automáticamente el token JWT a todas las peticiones Axios
- ✅ Si recibe un 401 (token expirado), hace logout automático
- ✅ Redirige al login en caso de autenticación fallida

---

## 📝 Tipos TypeScript

```typescript
// Usuario autenticado
interface User {
  id_usuario: number
  nombre_usuario: string
  rol: 'Admin' | 'Podologo' | 'Recepcion'
  email: string
  activo: boolean
  clinica_id: number
  clinica_nombre?: string
  last_login?: string
}

// Credenciales de login
interface LoginCredentials {
  username: string
  password: string
}

// Respuesta del backend
interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}
```

---

## 🧪 Testing

### Login con usuario Admin (mock)

```typescript
const { login } = useAuthStore.getState()
await login('admin', 'Admin2024!')
```

### Verificar permisos

```typescript
import { hasPermission } from '@/modules/auth/utils/permissions'

const canEdit = hasPermission('Podologo', 'edit_patients') // true
const canManageUsers = hasPermission('Podologo', 'manage_users') // false
```

---

## 🔐 Seguridad

- ✅ Token JWT almacenado en localStorage (persistente entre sesiones)
- ✅ Interceptor automático para agregar `Authorization: Bearer {token}`
- ✅ Logout limpia completamente el estado (token + headers Axios)
- ✅ Manejo de 401 (token expirado) con redirect automático a login
- ✅ Permisos verificados en frontend (UI) y backend (API)

---

## 📚 Documentación de Endpoints (API Real)

### POST /api/v1/auth/login
**Body** (FormData):
```
username=admin
password=Admin2024!
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id_usuario": 1,
    "nombre_usuario": "admin",
    "rol": "Admin",
    "email": "admin@podoskin.mx",
    "activo": true,
    "clinica_id": 1,
    "clinica_nombre": "Podoskin Solutions/Libertad"
  }
}
```

### GET /api/v1/auth/me
**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "id_usuario": 1,
  "nombre_usuario": "admin",
  "rol": "Admin",
  "email": "admin@podoskin.mx"
}
```

---

## ❓ FAQ

### ¿Cómo agregar un nuevo usuario de prueba?

Editar `src/modules/auth/services/authService.mock.ts`:

```typescript
const MOCK_USERS = {
  // ... usuarios existentes
  nuevo_usuario: {
    username: 'nuevo',
    password: 'password123',
    data: {
      id_usuario: 4,
      nombre_usuario: 'nuevo',
      rol: 'Recepcion',
      email: 'nuevo@podoskin.mx',
      activo: true,
      clinica_id: 1
    }
  }
}
```

### ¿Cómo agregar un nuevo permiso?

1. Editar `auth.types.ts`:
```typescript
export const ROLE_PERMISSIONS = {
  Admin: [
    // ... permisos existentes
    'new_permission'
  ]
}
```

2. Agregar función de verificación en `permissions.ts`:
```typescript
export const canAccess = {
  // ... accesos existentes
  newFeature: (role: UserRole) => hasPermission(role, 'new_permission')
}
```

### ¿Cómo proteger una ruta/componente?

```typescript
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { usePermissions } from '@/modules/auth/utils/permissions'

function ProtectedComponent() {
  const { user, isAuthenticated } = useAuthStore()
  const permissions = usePermissions(user?.rol ?? 'Recepcion')
  
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!permissions.canManageSettings) return <div>No autorizado</div>
  
  return <div>Contenido protegido</div>
}
```

---

## 📦 Dependencias

- `zustand` - State management
- `axios` - HTTP client
- `react-router-dom` - Routing (opcional para ProtectedRoute)
- `@phosphor-icons/react` - Iconos UI

---

## 🎯 Próximas Mejoras

- [ ] Refresh token automático
- [ ] Remember me (persistencia opcional)
- [ ] Login con 2FA
- [ ] Recuperación de contraseña
- [ ] Sesiones múltiples
- [ ] Logs de intentos de login fallidos

---

## 📞 Soporte

Para dudas o problemas, contactar al equipo de desarrollo.

**Estado**: ✅ Producción Ready
**Última actualización**: 2025-01-09
