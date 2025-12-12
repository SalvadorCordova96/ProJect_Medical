# 📋 Análisis de Requisitos: Chat con Voz y Gemini Live
**Fecha de Análisis:** 12 de diciembre de 2024  
**Sistema:** PodoSkin - Gestión Clínica Podológica  
**Versión del Sistema:** 1.0.0

---

## 🎯 Requisitos Solicitados

### 1. Comunicación Backend-Frontend por medio de chat de texto con sistema de voz en streaming
### 2. Área de configuraciones para guardar la API Key de Gemini Live
### 3. Área en el backend para respaldar en cada inicio de sesión la API Key por usuario
### 4. Catálogo de comandos para respuestas precisas del backend al chatbot
### 5. Catálogo de llamadas a función del backend al frontend (navegación por voz)

---

## ✅ Estado Actual de Implementación

## 1. 💬 COMUNICACIÓN BACKEND-FRONTEND CON CHAT Y VOZ

### ✅ **IMPLEMENTADO PARCIALMENTE** 

#### **Frontend (React + TypeScript)**

**Ubicación:** `frontend/src/modules/chatbot/`

**Componentes Implementados:**

1. **`FloatingChatbot.tsx`**
   - ✅ Interfaz de chat flotante persistente
   - ✅ Soporte para entrada de texto
   - ✅ Botón de micrófono para grabación de voz
   - ✅ Comandos rápidos predefinidos
   - ✅ Toggle para habilitar/deshabilitar salida de voz

2. **`voiceService.ts`** (204 líneas)
   - ✅ Grabación de audio con MediaRecorder API
   - ✅ Conversión de audio a Base64
   - ✅ Text-to-Speech con Web Speech API
   - ✅ Reproducción de audio
   - ✅ Detección de soporte del navegador

3. **`geminiLiveService.ts`** (296 líneas)
   - ✅ Integración con Gemini 2.0 Flash (modelo multimodal)
   - ✅ Envío de mensajes de texto
   - ✅ Envío de mensajes de audio (base64)
   - ✅ Function calling definido
   - ✅ Historial de conversación
   - ⚠️ **API Key hardcodeada desde .env** (no desde usuario)

4. **`chatService.ts`**
   - ✅ Servicio unificado de chat
   - ✅ Integración con Gemini Live
   - ✅ Ejecución de function calls
   - ⚠️ **Function calls con datos mock** (no conectados al backend real)

5. **`chatStore.ts`** (Zustand)
   - ✅ Estado global del chat
   - ✅ Manejo de mensajes
   - ✅ Control de grabación de voz
   - ✅ Control de reproducción de voz
   - ✅ Manejo de function calls

**Funciones Disponibles en Gemini:**
```typescript
AVAILABLE_FUNCTIONS = {
  get_todays_appointments,
  create_patient,
  search_patient,
  get_active_treatments,
  schedule_appointment
}
```

#### **Backend (FastAPI + Python)**

**Ubicación:** `backend/api/routes/chat.py` (193 líneas)

**Endpoints Implementados:**

1. **`POST /api/v1/chat`**
   - ✅ Recibe mensajes en lenguaje natural
   - ✅ Autenticación JWT requerida
   - ✅ Rate limiting (30 req/min)
   - ✅ Integración con LangGraph Agent
   - ✅ Soporte para thread_id (memoria episódica)
   - ✅ Filtra resultados según rol del usuario
   - ⚠️ **Usa Anthropic Claude** (no Gemini Live)

2. **`GET /api/v1/chat/health`**
   - ✅ Health check del agente
   - ✅ Verificación de configuración LLM

3. **`GET /api/v1/chat/capabilities`**
   - ✅ Lista de capacidades del agente

**Agente LangGraph:**
- ✅ Ubicado en `backend/agents/`
- ✅ Arquitectura de subgrafos
- ✅ NL-to-SQL conversion
- ✅ Fuzzy search
- ✅ Mathematical analyzer
- ✅ Memoria episódica (checkpointing)

### ❌ **PROBLEMAS IDENTIFICADOS:**

#### **1. Desconexión entre Frontend y Backend**
- **Frontend** usa **Gemini Live** (Google)
- **Backend** usa **Claude** (Anthropic)
- **No hay comunicación directa** entre el chatbot del frontend y el endpoint `/chat` del backend

#### **2. Function Calls No Conectados**
```typescript
// En chatService.ts línea 44-67
executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
  // ⚠️ Retorna MOCK DATA - NO llama al backend real
  switch (functionName) {
    case 'get_todays_appointments':
      return { count: 5, appointments: [] } // ❌ Datos falsos
  }
}
```

#### **3. No hay Streaming Implementado**
- El frontend recibe respuestas completas, **no en streaming**
- Gemini Live API soporta streaming pero no está implementado
- El backend tampoco implementa SSE (Server-Sent Events)

---

## 2. ⚙️ ÁREA DE CONFIGURACIONES PARA API KEY DE GEMINI

### ❌ **NO IMPLEMENTADO**

**Estado Actual:**
- API Key de Gemini se configura en `frontend/.env.example`:
  ```bash
  VITE_GEMINI_API_KEY=your_gemini_api_key_here
  ```
- ⚠️ Expuesta al cliente (inseguro en producción)
- ❌ No hay interfaz en el sistema para configurar API Keys
- ❌ No hay validación de API Keys
- ❌ No hay rotación o gestión de keys

**Lo que se necesita:**

1. **Frontend:**
   - Página de configuración en `Settings` o perfil de usuario
   - Formulario seguro para ingresar API Key
   - Validación de formato
   - Indicador de estado (válida/inválida)

2. **Backend:**
   - Nuevo modelo en `auth.sys_usuarios`:
     ```python
     gemini_api_key_encrypted = Column(String, nullable=True)
     gemini_api_key_updated_at = Column(TIMESTAMP(timezone=True))
     ```
   - Endpoint `PUT /api/v1/usuarios/{id}/gemini-key` para actualizar
   - Encriptación de API Key (Fernet o similar)
   - Validación contra Gemini API

---

## 3. 💾 RESPALDO DE API KEY EN CADA INICIO DE SESIÓN

### ❌ **NO IMPLEMENTADO**

**Ubicación actual de login:** `backend/api/routes/auth.py`

**Flujo Actual:**
```python
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm, db: Session):
    # 1. Verifica credenciales
    # 2. Actualiza last_login
    # 3. Resetea failed_login_attempts
    # 4. Retorna JWT token
    # ❌ NO carga/valida API Key de Gemini
```

**Lo que se necesita:**

1. **Modelo de Usuario Extendido:**
   ```python
   # backend/schemas/auth/models.py
   class SysUsuario(Base):
       # ... campos existentes ...
       gemini_api_key_encrypted = Column(String, nullable=True)
       gemini_api_key_updated_at = Column(TIMESTAMP(timezone=True))
       gemini_api_key_last_validated = Column(TIMESTAMP(timezone=True))
   ```

2. **Endpoint de Login Modificado:**
   ```python
   @router.post("/login")
   async def login(...):
       # ... autenticación existente ...
       
       # Nuevo: Cargar API Key si existe
       if usuario.gemini_api_key_encrypted:
           decrypted_key = decrypt_api_key(usuario.gemini_api_key_encrypted)
           # Validar contra Gemini API
           is_valid = await validate_gemini_key(decrypted_key)
           
           if not is_valid:
               logger.warning(f"API Key inválida para usuario {usuario.id_usuario}")
               # Opcional: invalidar la key
       
       # Incluir flag en respuesta
       return {
           "access_token": token,
           "has_gemini_key": bool(usuario.gemini_api_key_encrypted),
           "gemini_key_status": "valid" if is_valid else "invalid"
       }
   ```

3. **Nuevo Servicio de Encriptación:**
   ```python
   # backend/api/core/encryption.py
   from cryptography.fernet import Fernet
   
   def encrypt_api_key(plain_key: str) -> str:
       # Encriptar con Fernet
       pass
   
   def decrypt_api_key(encrypted_key: str) -> str:
       # Desencriptar
       pass
   ```

---

## 4. 📚 CATÁLOGO DE COMANDOS PARA RESPUESTAS PRECISAS

### ✅ **PARCIALMENTE IMPLEMENTADO**

**Backend - LangGraph Agent:**

El backend tiene un sistema robusto de comandos a través del agente LangGraph:

**Ubicación:** `backend/agents/`

**Estructura:**
```
agents/
├── graph.py              # Compilador principal
├── state.py              # Estado del agente
├── nodes/                # Nodos de procesamiento
│   ├── intent_classifier.py
│   ├── query_generator.py
│   ├── query_executor.py
│   ├── response_formatter.py
│   └── error_handler.py
└── subgraphs/            # Subgrafos por origen
    ├── terminal_subgraph.py
    ├── webapp_subgraph.py
    └── api_subgraph.py
```

**Capacidades Documentadas:**
```python
# backend/api/routes/chat.py línea 179-186
capabilities = [
    {"category": "Pacientes", "examples": ["Busca al paciente Juan", "¿Cuántos pacientes hay?"]},
    {"category": "Citas", "examples": ["Citas de hoy", "Agenda de mañana"]},
    {"category": "Tratamientos", "examples": ["Tratamientos activos", "Evolución del paciente X"]},
    {"category": "Servicios", "examples": ["Lista de servicios", "Precios"]},
]
```

**Herramientas del Agente:**
```python
# backend/tools/
├── sql_executor.py          # NL-to-SQL
├── mathematical_analyzer.py # Cálculos matemáticos
├── fuzzy_search.py          # Búsqueda difusa
├── schema_info.py           # Info de esquemas
└── appointment_manager.py   # Gestión de citas
```

### ❌ **PROBLEMA: No hay Catálogo Frontend-Backend**

**Lo que falta:**

1. **Endpoint para obtener comandos disponibles:**
   ```python
   @router.get("/chat/commands")
   async def get_available_commands(current_user: SysUsuario):
       return {
           "commands": [
               {
                   "id": "list_appointments_today",
                   "name": "Listar citas de hoy",
                   "category": "Citas",
                   "examples": ["Citas de hoy", "¿Qué citas tengo hoy?"],
                   "backend_endpoint": "/citas?fecha=today",
                   "required_role": ["Admin", "Podologo", "Recepcion"]
               },
               {
                   "id": "search_patient",
                   "name": "Buscar paciente",
                   "category": "Pacientes",
                   "examples": ["Busca al paciente Juan", "Encuentra a María García"],
                   "backend_endpoint": "/pacientes?search={query}",
                   "required_role": ["Admin", "Podologo"]
               },
               # ... más comandos
           ]
       }
   ```

2. **Mapeo de Function Calls a Endpoints Reales:**

**Frontend necesita:**
```typescript
// Catálogo de mapeo función -> endpoint
const FUNCTION_TO_ENDPOINT_MAP = {
  'get_todays_appointments': {
    method: 'GET',
    endpoint: '/api/v1/citas',
    params: { fecha_inicio: 'today', fecha_fin: 'today' }
  },
  'search_patient': {
    method: 'GET',
    endpoint: '/api/v1/pacientes',
    params: (args) => ({ busqueda: args.query })
  },
  'create_patient': {
    method: 'POST',
    endpoint: '/api/v1/pacientes',
    body: (args) => ({
      nombres: args.nombres,
      apellidos: args.apellidos,
      telefono: args.telefono,
      email: args.email
    })
  }
}
```

**Implementación sugerida:**
```typescript
// frontend/src/modules/chatbot/services/chatService.ts
executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
  const mapping = FUNCTION_TO_ENDPOINT_MAP[functionName]
  
  if (!mapping) {
    throw new Error(`Función ${functionName} no mapeada`)
  }
  
  // Construir URL con parámetros
  const url = `${VITE_API_URL}${mapping.endpoint}`
  
  // Hacer llamada real al backend
  const response = await fetch(url, {
    method: mapping.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: mapping.body ? JSON.stringify(mapping.body(args)) : undefined
  })
  
  return await response.json()
}
```

---

## 5. 🧭 CATÁLOGO DE LLAMADAS A FUNCIÓN PARA NAVEGACIÓN POR VOZ

### ❌ **NO IMPLEMENTADO**

**Objetivo:** Que el usuario diga "Llévame a la página de pacientes" y el sistema navegue automáticamente.

**Lo que se necesita:**

### **1. Funciones de Navegación en Gemini**

```typescript
// frontend/src/modules/chatbot/services/geminiLiveService.ts

export const NAVIGATION_FUNCTIONS = {
  navigate_to_page: {
    name: 'navigate_to_page',
    description: 'Navega a una página específica del sistema',
    parameters: {
      type: 'object',
      properties: {
        page: { 
          type: 'string', 
          enum: [
            'dashboard', 'patients', 'appointments', 
            'treatments', 'services', 'reports', 'settings'
          ],
          description: 'Página destino'
        },
        params: {
          type: 'object',
          description: 'Parámetros opcionales (ej: patient_id)',
          properties: {
            id: { type: 'number' },
            filter: { type: 'string' }
          }
        }
      },
      required: ['page']
    }
  },
  
  open_modal: {
    name: 'open_modal',
    description: 'Abre un modal específico (crear paciente, agendar cita, etc.)',
    parameters: {
      type: 'object',
      properties: {
        modal: { 
          type: 'string',
          enum: ['create_patient', 'create_appointment', 'create_treatment'],
          description: 'Modal a abrir'
        },
        prefill: {
          type: 'object',
          description: 'Datos para pre-llenar el formulario'
        }
      },
      required: ['modal']
    }
  },
  
  show_notification: {
    name: 'show_notification',
    description: 'Muestra una notificación al usuario',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        type: { type: 'string', enum: ['success', 'error', 'warning', 'info'] }
      },
      required: ['message', 'type']
    }
  }
}
```

### **2. Implementación de Navigation Handler**

```typescript
// frontend/src/modules/chatbot/services/navigationHandler.ts

import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export class NavigationHandler {
  private navigate: any
  
  constructor(navigate: any) {
    this.navigate = navigate
  }
  
  async navigateToPage(page: string, params?: Record<string, any>) {
    const routes = {
      'dashboard': '/dashboard',
      'patients': '/patients',
      'appointments': '/appointments',
      'treatments': '/treatments',
      'services': '/services',
      'reports': '/reports',
      'settings': '/settings'
    }
    
    let path = routes[page]
    
    if (!path) {
      throw new Error(`Página ${page} no encontrada`)
    }
    
    // Agregar parámetros si existen
    if (params?.id) {
      path += `/${params.id}`
    }
    
    // Navegar
    this.navigate(path)
    
    // Notificar al usuario
    toast.success(`Navegando a ${page}`)
    
    return { success: true, page, path }
  }
  
  async openModal(modal: string, prefill?: Record<string, any>) {
    // Usar Zustand store para abrir modales
    const { openModal } = useModalStore.getState()
    
    openModal(modal, prefill)
    
    return { success: true, modal }
  }
  
  async showNotification(message: string, type: string) {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'warning':
        toast.warning(message)
        break
      default:
        toast.info(message)
    }
    
    return { success: true }
  }
}
```

### **3. Integración en ChatService**

```typescript
// frontend/src/modules/chatbot/services/chatService.ts

import { navigationHandler } from './navigationHandler'

executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
  // Funciones de navegación
  if (functionName === 'navigate_to_page') {
    return await navigationHandler.navigateToPage(args.page, args.params)
  }
  
  if (functionName === 'open_modal') {
    return await navigationHandler.openModal(args.modal, args.prefill)
  }
  
  if (functionName === 'show_notification') {
    return await navigationHandler.showNotification(args.message, args.type)
  }
  
  // Funciones de datos (del backend)
  return await backendFunctionHandler.execute(functionName, args)
}
```

### **4. Ejemplos de Uso por Voz**

**Usuario dice:**
```
"Llévame a la página de pacientes"
→ Gemini detecta: navigate_to_page({ page: "patients" })
→ Sistema navega a /patients

"Abre el formulario para crear un paciente"
→ Gemini detecta: open_modal({ modal: "create_patient" })
→ Sistema abre modal de creación

"Busca al paciente Juan y muéstrame su expediente"
→ Gemini detecta: 
   1. search_patient({ query: "Juan" })
   2. navigate_to_page({ page: "patients", params: { id: 123 } })
→ Sistema busca y navega al detalle

"Muéstrame las citas de mañana"
→ Gemini detecta: get_appointments({ date: "tomorrow" })
→ Sistema consulta backend y muestra resultados en el chat
```

---

## 📊 Resumen de Cumplimiento

| Requisito | Estado | Completitud | Prioridad |
|-----------|--------|-------------|-----------|
| 1. Chat texto + voz streaming | 🟡 Parcial | 60% | 🔴 ALTA |
| 2. Configuración API Key Gemini | 🔴 No implementado | 0% | 🟡 MEDIA |
| 3. Respaldo API Key en login | 🔴 No implementado | 0% | 🟡 MEDIA |
| 4. Catálogo de comandos backend | 🟡 Parcial | 50% | 🔴 ALTA |
| 5. Navegación por voz (function calling) | 🔴 No implementado | 0% | 🟢 BAJA |

---

## 🚀 Plan de Implementación Sugerido

### **FASE 1: Conectar Frontend y Backend (CRÍTICO)**

**Objetivo:** Que el chatbot del frontend llame realmente al backend

**Tareas:**
1. Modificar `chatService.ts` para usar endpoint `/api/v1/chat`
2. Mapear function calls de Gemini a endpoints del backend
3. Implementar manejo de errores y timeouts
4. Agregar indicadores de carga (typing, processing)

**Archivos a modificar:**
- `frontend/src/modules/chatbot/services/chatService.ts`
- `frontend/src/modules/chatbot/services/backendIntegration.ts` (nuevo)

**Código sugerido:**
```typescript
// chatService.ts
sendMessage: async (message: string): Promise<string> => {
  // Opción 1: Llamar al backend directamente (LangGraph)
  const backendResponse = await fetch(`${VITE_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      thread_id: currentThreadId
    })
  })
  
  const data = await backendResponse.json()
  return data.message
  
  // Opción 2: Usar Gemini + ejecutar function calls contra backend
  const geminiResponse = await geminiLiveService.sendTextMessage(message)
  
  if (geminiResponse.startsWith('[FUNCTION_CALL]')) {
    const funcCall = JSON.parse(geminiResponse.replace('[FUNCTION_CALL]', ''))
    const result = await executeBackendFunction(funcCall.name, funcCall.args)
    return formatResult(result)
  }
  
  return geminiResponse
}
```

---

### **FASE 2: Gestión de API Keys (SEGURIDAD)**

**Objetivo:** Permitir que cada usuario configure su propia API Key de Gemini

**Tareas:**

1. **Base de Datos:**
```sql
-- Migración
ALTER TABLE auth.sys_usuarios 
ADD COLUMN gemini_api_key_encrypted VARCHAR(500),
ADD COLUMN gemini_api_key_updated_at TIMESTAMPTZ,
ADD COLUMN gemini_api_key_last_validated TIMESTAMPTZ;
```

2. **Backend - Modelo:**
```python
# backend/schemas/auth/models.py
class SysUsuario(Base):
    # ... campos existentes ...
    gemini_api_key_encrypted = Column(String(500), nullable=True)
    gemini_api_key_updated_at = Column(TIMESTAMP(timezone=True))
    gemini_api_key_last_validated = Column(TIMESTAMP(timezone=True))
```

3. **Backend - Servicio de Encriptación:**
```python
# backend/api/core/encryption.py
from cryptography.fernet import Fernet
from backend.api.core.config import get_settings

settings = get_settings()
ENCRYPTION_KEY = settings.ENCRYPTION_KEY  # Nueva variable en config

cipher = Fernet(ENCRYPTION_KEY)

def encrypt_api_key(plain_key: str) -> str:
    return cipher.encrypt(plain_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    return cipher.decrypt(encrypted_key.encode()).decode()
```

4. **Backend - Endpoint para actualizar API Key:**
```python
# backend/api/routes/usuarios.py
class GeminiKeyUpdate(BaseModel):
    api_key: str = Field(..., min_length=20, max_length=200)

@router.put("/{usuario_id}/gemini-key")
async def update_gemini_key(
    usuario_id: int,
    data: GeminiKeyUpdate,
    current_user: SysUsuario = Depends(get_current_active_user),
    db: Session = Depends(get_auth_db)
):
    # Solo el propio usuario puede actualizar su key
    if usuario_id != current_user.id_usuario and current_user.rol != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Validar la API key contra Gemini
    is_valid = await validate_gemini_api_key(data.api_key)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="API Key inválida")
    
    # Encriptar y guardar
    usuario = db.query(SysUsuario).filter(SysUsuario.id_usuario == usuario_id).first()
    usuario.gemini_api_key_encrypted = encrypt_api_key(data.api_key)
    usuario.gemini_api_key_updated_at = func.now()
    usuario.gemini_api_key_last_validated = func.now()
    
    db.commit()
    
    return {"message": "API Key actualizada exitosamente"}
```

5. **Frontend - Página de Configuración:**
```typescript
// frontend/src/modules/settings/components/GeminiKeySettings.tsx
export const GeminiKeySettings = () => {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  
  const handleSave = async () => {
    setIsValidating(true)
    
    try {
      const response = await fetch(`${VITE_API_URL}/usuarios/${userId}/gemini-key`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: apiKey })
      })
      
      if (response.ok) {
        toast.success('API Key guardada exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.detail)
      }
    } catch (error) {
      toast.error('Error al guardar API Key')
    } finally {
      setIsValidating(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3>Configuración de Gemini Live</h3>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Ingresa tu API Key de Gemini"
      />
      <button onClick={handleSave} disabled={isValidating}>
        {isValidating ? 'Validando...' : 'Guardar API Key'}
      </button>
      <p className="text-sm text-gray-500">
        Obtén tu API Key en: https://aistudio.google.com/app/apikey
      </p>
    </div>
  )
}
```

6. **Backend - Modificar Login:**
```python
# backend/api/routes/auth.py
@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm,
    db: Session = Depends(get_auth_db)
):
    # ... autenticación existente ...
    
    # Cargar estado de API Key
    has_gemini_key = bool(usuario.gemini_api_key_encrypted)
    gemini_key_status = None
    
    if has_gemini_key:
        # Opcional: validar si la key sigue siendo válida
        decrypted_key = decrypt_api_key(usuario.gemini_api_key_encrypted)
        is_valid = await validate_gemini_api_key(decrypted_key)
        
        gemini_key_status = "valid" if is_valid else "invalid"
        
        if not is_valid:
            logger.warning(f"API Key inválida para usuario {usuario.id_usuario}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": usuario.id_usuario,
            "username": usuario.nombre_usuario,
            "rol": usuario.rol,
            "has_gemini_key": has_gemini_key,
            "gemini_key_status": gemini_key_status
        }
    }
```

---

### **FASE 3: Catálogo de Comandos Dinámico**

**Objetivo:** Centralizar y exponer los comandos disponibles

**1. Backend - Endpoint de Comandos:**
```python
# backend/api/routes/chat.py

COMMAND_CATALOG = [
    {
        "id": "list_appointments_today",
        "name": "Listar citas de hoy",
        "category": "Citas",
        "examples": [
            "Citas de hoy",
            "¿Qué citas tengo hoy?",
            "Muéstrame la agenda de hoy"
        ],
        "backend_function": "get_todays_appointments",
        "endpoint": "/citas",
        "method": "GET",
        "params": {"fecha_inicio": "today", "fecha_fin": "today"},
        "required_role": ["Admin", "Podologo", "Recepcion"],
        "response_format": "list"
    },
    {
        "id": "search_patient",
        "name": "Buscar paciente",
        "category": "Pacientes",
        "examples": [
            "Busca al paciente Juan",
            "Encuentra a María García",
            "¿Quién es el paciente con teléfono 555-1234?"
        ],
        "backend_function": "search_patient",
        "endpoint": "/pacientes",
        "method": "GET",
        "params": {"busqueda": "{query}"},
        "required_role": ["Admin", "Podologo"],
        "response_format": "list"
    },
    {
        "id": "create_patient",
        "name": "Crear nuevo paciente",
        "category": "Pacientes",
        "examples": [
            "Crea un paciente llamado Juan Pérez",
            "Registra un nuevo paciente"
        ],
        "backend_function": "create_patient",
        "endpoint": "/pacientes",
        "method": "POST",
        "body_schema": {
            "nombres": "string (required)",
            "apellidos": "string (required)",
            "telefono": "string (required)",
            "email": "string (optional)"
        },
        "required_role": ["Admin", "Podologo"],
        "response_format": "object"
    }
]

@router.get("/chat/commands")
async def get_command_catalog(
    current_user: SysUsuario = Depends(get_current_active_user)
):
    # Filtrar por rol del usuario
    available_commands = [
        cmd for cmd in COMMAND_CATALOG
        if current_user.rol in cmd["required_role"]
    ]
    
    return {
        "total": len(available_commands),
        "commands": available_commands,
        "user_role": current_user.rol
    }
```

**2. Frontend - Cargar Catálogo al Iniciar:**
```typescript
// frontend/src/modules/chatbot/services/commandCatalog.ts

export class CommandCatalog {
  private commands: any[] = []
  
  async load(token: string) {
    const response = await fetch(`${VITE_API_URL}/chat/commands`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = await response.json()
    this.commands = data.commands
    
    return this.commands
  }
  
  findByExample(userInput: string): any | null {
    // Buscar comando que coincida con el input del usuario
    for (const cmd of this.commands) {
      for (const example of cmd.examples) {
        if (userInput.toLowerCase().includes(example.toLowerCase())) {
          return cmd
        }
      }
    }
    return null
  }
  
  getByFunction(functionName: string): any | null {
    return this.commands.find(cmd => cmd.backend_function === functionName)
  }
}

export const commandCatalog = new CommandCatalog()
```

**3. Usar Catálogo en Function Calls:**
```typescript
// chatService.ts
executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
  // Obtener comando del catálogo
  const command = commandCatalog.getByFunction(functionName)
  
  if (!command) {
    throw new Error(`Comando ${functionName} no encontrado en el catálogo`)
  }
  
  // Construir request según el catálogo
  const url = `${VITE_API_URL}${command.endpoint}`
  
  let requestConfig: RequestInit = {
    method: command.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  
  // Agregar parámetros según método
  if (command.method === 'GET') {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(command.params)) {
      // Reemplazar placeholders con args
      const finalValue = value.toString().replace(/\{(\w+)\}/g, (_, k) => args[k])
      params.append(key, finalValue)
    }
    url += `?${params.toString()}`
  } else {
    // POST/PUT: cuerpo JSON
    requestConfig.body = JSON.stringify(args)
  }
  
  // Ejecutar llamada
  const response = await fetch(url, requestConfig)
  const data = await response.json()
  
  return data
}
```

---

### **FASE 4: Navegación por Voz (OPCIONAL)**

**Tareas:**
1. Agregar funciones de navegación a Gemini
2. Implementar NavigationHandler
3. Integrar con React Router
4. Agregar comandos de voz para abrir modales

**Complejidad:** Media  
**Valor de negocio:** Bajo (feature "wow" pero no crítica)

---

## 🔍 Problemas Críticos Identificados

### **1. Arquitectura Mixta (Gemini + Claude)**
- ❌ Frontend usa Gemini Live
- ❌ Backend usa Claude
- ⚠️ **No se comunican entre sí**

**Solución recomendada:**
- **Opción A (Recomendada):** Migrar todo a Claude
  - Usar endpoint `/chat` del backend para todo
  - Implementar SSE para streaming
  - Eliminar llamadas directas a Gemini desde frontend
  
- **Opción B:** Mantener Gemini pero integrar con backend
  - Gemini hace function calling
  - Function calls ejecutan contra endpoints del backend
  - Backend filtra por permisos de usuario

### **2. Seguridad de API Keys**
- 🔴 **CRÍTICO:** API Key de Gemini expuesta en frontend
- ❌ No hay encriptación
- ❌ No hay validación

**Impacto:** En producción, cualquier usuario puede extraer la API Key del código JS y usarla externamente → **Costos incontrolados**

**Solución:** Implementar Fase 2 (Gestión de API Keys)

### **3. Function Calls Simulados**
- ❌ Function calls retornan datos mock
- ❌ No hay integración real con el backend

**Impacto:** El chatbot no es funcional, solo una demo

**Solución:** Implementar Fase 1 y Fase 3

### **4. No hay Streaming**
- ❌ Respuestas completas (no token por token)
- ❌ Mala UX en respuestas largas

**Solución:** Implementar SSE o WebSockets

---

## 📝 Recomendaciones Finales

### **PRIORIDAD ALTA (Hacer YA):**

1. ✅ **Conectar Frontend con Backend `/chat`**
   - Modificar `chatService.ts`
   - Mapear function calls a endpoints reales
   - **Tiempo estimado:** 2-3 días

2. ✅ **Implementar Gestión de API Keys**
   - Base de datos
   - Encriptación
   - UI de configuración
   - **Tiempo estimado:** 3-4 días

3. ✅ **Crear Catálogo de Comandos Dinámico**
   - Endpoint `/chat/commands`
   - Documentación de comandos
   - Integración en frontend
   - **Tiempo estimado:** 2 días

### **PRIORIDAD MEDIA (Próxima iteración):**

4. ⚠️ **Implementar Streaming de Respuestas**
   - SSE en backend
   - EventSource en frontend
   - **Tiempo estimado:** 3-4 días

5. ⚠️ **Añadir Navegación por Voz**
   - Function calls de navegación
   - NavigationHandler
   - **Tiempo estimado:** 2-3 días

### **PRIORIDAD BAJA (Futuro):**

6. 🔵 **Mejorar UX del Chatbot**
   - Avatares
   - Markdown rich formatting
   - Code highlighting
   - **Tiempo estimado:** 2 días

7. 🔵 **Analytics del Chat**
   - Tracking de comandos usados
   - Métricas de satisfacción
   - **Tiempo estimado:** 1-2 días

---

## 🎯 Conclusión

**El sistema tiene una base sólida pero está incompleto:**

- ✅ **Frontend tiene interfaz de chat funcional con voz**
- ✅ **Backend tiene agente LangGraph robusto**
- ❌ **NO están conectados**
- ❌ **API Keys expuestas (riesgo de seguridad)**
- ❌ **Function calls simulados (no funcional)**

**Para tener un sistema productivo se requiere:**

1. Conectar frontend y backend (CRÍTICO)
2. Asegurar API Keys (CRÍTICO)
3. Implementar catálogo de comandos (ALTA)
4. Añadir streaming (MEDIA)
5. Navegación por voz (BAJA)

**Tiempo total estimado:** 12-15 días de desarrollo

---

**Generado el:** 12 de diciembre de 2024  
**Revisado por:** GitHub Copilot CLI  
**Versión:** 1.0
