# 🎨 INSTRUCCIONES PARA AGENTE DE FRONTEND
**Proyecto:** PodoSkin - Sistema de Gestión Clínica Podológica  
**Tu Rol:** Desarrollador Frontend (React + TypeScript + Vite)  
**Fecha:** 12 de diciembre de 2024  
**Repositorio:** https://github.com/AbrahamCordova96/Proyecto_Clinica_Podoskin.git

---

## 🎯 TU MISIÓN PRINCIPAL

Conectar el chatbot de voz del frontend con el backend real y agregar funcionalidades de navegación por voz. Actualmente el chatbot usa **datos MOCK** y no se comunica con el backend. Tu trabajo es hacerlo funcional.

---

## 📂 TU ÁREA DE TRABAJO

**PUEDES MODIFICAR:**
- ✅ `/frontend/src/modules/chatbot/**/*`
- ✅ `/frontend/src/modules/settings/**/*` (para configuración de API Keys)
- ✅ `/frontend/src/services/**/*` (servicios compartidos)
- ✅ `/frontend/src/types/**/*` (tipos TypeScript)
- ✅ `/frontend/package.json` (solo agregar dependencias si es necesario)

**NO PUEDES TOCAR:**
- ❌ `/backend/**/*` (otro agente se encarga)
- ❌ `/frontend/src/modules/auth/**/*` (autenticación ya funciona)
- ❌ Base de datos (el backend se encarga)
- ❌ Configuración de Docker
- ❌ Archivos de build/deploy

---

## 📋 TAREAS PRIORITARIAS

### **FASE 1: CONECTAR CHATBOT CON BACKEND (CRÍTICO)**

**Objetivo:** Que el chatbot llame al endpoint real del backend en lugar de usar datos mock.

**Archivo principal:** `frontend/src/modules/chatbot/services/chatService.ts`

#### **TAREA 1.1: Crear servicio de integración con backend**

**Crear archivo:** `frontend/src/modules/chatbot/services/backendIntegration.ts`

```typescript
// frontend/src/modules/chatbot/services/backendIntegration.ts

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export interface BackendChatRequest {
  message: string
  thread_id?: string
}

export interface BackendChatResponse {
  success: boolean
  message: string
  data?: any
  intent?: string
  session_id: string
  thread_id?: string
  processing_time_ms: number
}

export class BackendIntegration {
  private token: string | null = null
  private currentThreadId: string | null = null

  setToken(token: string) {
    this.token = token
  }

  setThreadId(threadId: string) {
    this.currentThreadId = threadId
  }

  generateThreadId(userId: number): string {
    return `${userId}_webapp_${Date.now()}`
  }

  async sendMessageToBackend(message: string): Promise<BackendChatResponse> {
    if (!this.token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.')
    }

    try {
      const response = await axios.post<BackendChatResponse>(
        `${API_URL}/chat`,
        {
          message,
          thread_id: this.currentThreadId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos
        }
      )

      // Guardar thread_id para continuidad
      if (response.data.thread_id) {
        this.currentThreadId = response.data.thread_id
      }

      return response.data
    } catch (error: any) {
      console.error('Error calling backend chat:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
      }
      
      if (error.response?.status === 429) {
        throw new Error('Demasiadas solicitudes. Espera un momento e intenta de nuevo.')
      }
      
      throw new Error('Error al comunicarse con el servidor. Intenta de nuevo.')
    }
  }

  async executeFunctionCall(functionName: string, args: Record<string, any>): Promise<any> {
    // Mapeo de funciones a endpoints del backend
    const functionMap: Record<string, { method: string, endpoint: string, buildUrl?: (args: any) => string }> = {
      'get_todays_appointments': {
        method: 'GET',
        endpoint: '/citas',
        buildUrl: () => {
          const today = new Date().toISOString().split('T')[0]
          return `/citas?fecha_inicio=${today}&fecha_fin=${today}`
        }
      },
      'search_patient': {
        method: 'GET',
        endpoint: '/pacientes',
        buildUrl: (args) => `/pacientes?busqueda=${encodeURIComponent(args.query)}`
      },
      'get_active_treatments': {
        method: 'GET',
        endpoint: '/tratamientos',
        buildUrl: () => '/tratamientos?estado=activo'
      },
      'create_patient': {
        method: 'POST',
        endpoint: '/pacientes'
      },
      'schedule_appointment': {
        method: 'POST',
        endpoint: '/citas'
      }
    }

    const mapping = functionMap[functionName]
    
    if (!mapping) {
      console.warn(`Función ${functionName} no mapeada. Usando backend chat.`)
      // Fallback: enviar al backend como mensaje
      return await this.sendMessageToBackend(`Ejecuta: ${functionName} con ${JSON.stringify(args)}`)
    }

    try {
      const url = mapping.buildUrl ? mapping.buildUrl(args) : mapping.endpoint

      if (mapping.method === 'GET') {
        const response = await axios.get(`${API_URL}${url}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        return response.data
      } else {
        // POST/PUT
        const response = await axios.post(`${API_URL}${mapping.endpoint}`, args, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        return response.data
      }
    } catch (error: any) {
      console.error(`Error executing function ${functionName}:`, error)
      return {
        error: true,
        message: error.response?.data?.detail || 'Error al ejecutar la acción'
      }
    }
  }
}

export const backendIntegration = new BackendIntegration()
```

#### **TAREA 1.2: Modificar chatService.ts para usar backend real**

**Archivo:** `frontend/src/modules/chatbot/services/chatService.ts`

**Cambios necesarios:**

1. Importar `backendIntegration`
2. Modificar `sendMessage` para usar backend
3. Modificar `executeFunctionCall` para usar endpoints reales
4. Mantener Gemini como fallback opcional

```typescript
// MODIFICAR líneas 44-68 aproximadamente

import { backendIntegration } from './backendIntegration'

export const chatServiceReal = {
  /**
   * Enviar mensaje de texto
   */
  sendMessage: async (message: string): Promise<string> => {
    try {
      // OPCIÓN A: Usar solo backend (RECOMENDADO)
      const response = await backendIntegration.sendMessageToBackend(message)
      return response.message

      // OPCIÓN B: Usar Gemini + ejecutar function calls contra backend (ALTERNATIVA)
      /*
      const response = await geminiLiveService.sendTextMessage(message)
      
      if (response.startsWith('[FUNCTION_CALL]')) {
        const functionCallData = JSON.parse(response.replace('[FUNCTION_CALL]', ''))
        const result = await backendIntegration.executeFunctionCall(
          functionCallData.name,
          functionCallData.args
        )
        
        // Enviar resultado a Gemini para que lo formatee
        return await geminiLiveService.sendFunctionResult(functionCallData.name, result)
      }
      
      return response
      */
    } catch (error) {
      console.error('Error calling chat service:', error)
      throw error
    }
  },

  /**
   * Ejecutar una función llamada por Gemini
   */
  executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
    // Usar backend real
    return await backendIntegration.executeFunctionCall(functionName, args)
  },

  // ... resto del código sin cambios
}
```

#### **TAREA 1.3: Integrar token de autenticación en chatStore**

**Archivo:** `frontend/src/modules/chatbot/stores/chatStore.ts`

**Agregar en la inicialización:**

```typescript
import { useAuthStore } from '../../auth/stores/authStore'
import { backendIntegration } from '../services/backendIntegration'

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isOpen: false,
  isTyping: false,
  isRecording: false,
  isSpeaking: false,
  voiceOutputEnabled: true,

  // NUEVO: Inicializar cuando hay usuario
  initializeChat: () => {
    const authStore = useAuthStore.getState()
    const user = authStore.user
    const token = authStore.token
    
    if (user && token) {
      // Configurar token y thread_id
      backendIntegration.setToken(token)
      const threadId = backendIntegration.generateThreadId(user.id_usuario)
      backendIntegration.setThreadId(threadId)
    }
  },

  toggleChat: () => {
    set(state => {
      if (!state.isOpen) {
        get().initializeChat() // Inicializar al abrir
      }
      return { isOpen: !state.isOpen }
    })
  },

  // ... resto del código
}))
```

#### **CRITERIOS DE ACEPTACIÓN FASE 1:**
- ✅ El chatbot envía mensajes al endpoint `/api/v1/chat` del backend
- ✅ Se incluye el token JWT en los headers
- ✅ Las respuestas vienen del backend (no de Gemini directamente)
- ✅ Los errores se manejan apropiadamente (401, 429, 500)
- ✅ Se mantiene el thread_id para contexto de conversación

---

### **FASE 2: CREAR UI PARA CONFIGURAR API KEY DE GEMINI**

**Objetivo:** Permitir que cada usuario configure su API Key de Gemini desde la interfaz.

#### **TAREA 2.1: Crear componente de configuración**

**Crear archivo:** `frontend/src/modules/settings/components/GeminiKeySettings.tsx`

```typescript
// frontend/src/modules/settings/components/GeminiKeySettings.tsx

import { useState, useEffect } from 'react'
import { Eye, EyeSlash, Check, X, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useAuthStore } from '../../auth/stores/authStore'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const GeminiKeySettings = () => {
  const { user, token } = useAuthStore()
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | null>(null)

  useEffect(() => {
    // Verificar si el usuario tiene API Key configurada
    if (user) {
      setHasKey(user.has_gemini_key || false)
      setKeyStatus(user.gemini_key_status || null)
    }
  }, [user])

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Ingresa una API Key válida')
      return
    }

    if (apiKey.length < 20) {
      toast.error('La API Key parece ser demasiado corta')
      return
    }

    setIsValidating(true)

    try {
      const response = await axios.put(
        `${API_URL}/usuarios/${user?.id_usuario}/gemini-key`,
        { api_key: apiKey },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        toast.success('API Key guardada exitosamente')
        setHasKey(true)
        setKeyStatus('valid')
        setApiKey('') // Limpiar input por seguridad
      }
    } catch (error: any) {
      console.error('Error saving API key:', error)
      
      if (error.response?.status === 400) {
        toast.error('API Key inválida. Verifica que sea correcta.')
      } else {
        toast.error('Error al guardar la API Key. Intenta de nuevo.')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!confirm('¿Estás seguro de eliminar tu API Key de Gemini?')) {
      return
    }

    try {
      await axios.delete(
        `${API_URL}/usuarios/${user?.id_usuario}/gemini-key`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      toast.success('API Key eliminada')
      setHasKey(false)
      setKeyStatus(null)
    } catch (error) {
      toast.error('Error al eliminar la API Key')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Info size={24} className="text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración de Gemini Live</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configura tu API Key personal de Google Gemini para habilitar el chatbot con voz.
            Tu API Key será encriptada y almacenada de forma segura.
          </p>
        </div>
      </div>

      {/* Estado actual */}
      {hasKey && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          keyStatus === 'valid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {keyStatus === 'valid' ? (
            <>
              <Check size={20} weight="bold" />
              <span className="text-sm font-medium">API Key configurada y válida</span>
            </>
          ) : (
            <>
              <X size={20} weight="bold" />
              <span className="text-sm font-medium">API Key inválida o expirada</span>
            </>
          )}
        </div>
      )}

      {/* Input para API Key */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          API Key de Gemini
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingresa tu API Key de Gemini"
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showApiKey ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Obtén tu API Key en:{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://aistudio.google.com/app/apikey
          </a>
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveKey}
          disabled={isValidating || !apiKey.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validando...
            </>
          ) : (
            'Guardar API Key'
          )}
        </button>

        {hasKey && (
          <button
            onClick={handleDeleteKey}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar API Key
          </button>
        )}
      </div>

      {/* Información de seguridad */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">🔒 Seguridad</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Tu API Key será encriptada antes de almacenarse</li>
          <li>• Solo tú puedes ver o modificar tu API Key</li>
          <li>• La API Key se valida al iniciar sesión</li>
          <li>• Puedes eliminarla en cualquier momento</li>
        </ul>
      </div>
    </div>
  )
}
```

#### **TAREA 2.2: Integrar en página de settings**

**Archivo a modificar:** `frontend/src/modules/settings/pages/SettingsPage.tsx` (o crear si no existe)

Agregar el componente `<GeminiKeySettings />` en la sección de configuraciones.

#### **CRITERIOS DE ACEPTACIÓN FASE 2:**
- ✅ Existe una página/sección de Settings accesible
- ✅ El usuario puede ingresar su API Key de Gemini
- ✅ La API Key no se muestra en texto plano por defecto
- ✅ Se valida el formato antes de enviar
- ✅ Se muestra el estado (válida/inválida)
- ✅ El usuario puede eliminar su API Key

---

### **FASE 3: NAVEGACIÓN POR VOZ**

**Objetivo:** Permitir que el usuario navegue por la aplicación usando comandos de voz.

#### **TAREA 3.1: Crear NavigationHandler**

**Crear archivo:** `frontend/src/modules/chatbot/services/navigationHandler.ts`

```typescript
// frontend/src/modules/chatbot/services/navigationHandler.ts

import { NavigateFunction } from 'react-router-dom'
import { toast } from 'sonner'

export interface NavigationCommand {
  page: string
  params?: Record<string, any>
}

export interface ModalCommand {
  modal: string
  prefill?: Record<string, any>
}

export class NavigationHandler {
  private navigate: NavigateFunction | null = null

  setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate
  }

  async navigateToPage(command: NavigationCommand): Promise<any> {
    if (!this.navigate) {
      throw new Error('Navigate function not initialized')
    }

    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'home': '/dashboard',
      'inicio': '/dashboard',
      'patients': '/patients',
      'pacientes': '/patients',
      'appointments': '/appointments',
      'citas': '/appointments',
      'agenda': '/appointments',
      'treatments': '/treatments',
      'tratamientos': '/treatments',
      'services': '/services',
      'servicios': '/services',
      'reports': '/reports',
      'reportes': '/reports',
      'settings': '/settings',
      'configuracion': '/settings',
      'ajustes': '/settings'
    }

    const page = command.page.toLowerCase()
    const path = routes[page]

    if (!path) {
      toast.error(`No se encontró la página: ${command.page}`)
      return { success: false, error: 'Página no encontrada' }
    }

    // Construir ruta con parámetros
    let fullPath = path
    if (command.params?.id) {
      fullPath += `/${command.params.id}`
    }

    // Navegar
    this.navigate(fullPath)
    toast.success(`Navegando a ${command.page}`)

    return {
      success: true,
      page: command.page,
      path: fullPath
    }
  }

  async openModal(command: ModalCommand): Promise<any> {
    // Implementar según tu sistema de modales
    // Por ejemplo, si usas un ModalStore con Zustand:
    
    const modals: Record<string, string> = {
      'create_patient': 'createPatient',
      'crear_paciente': 'createPatient',
      'new_patient': 'createPatient',
      'create_appointment': 'createAppointment',
      'crear_cita': 'createAppointment',
      'agendar_cita': 'createAppointment',
      'create_treatment': 'createTreatment',
      'crear_tratamiento': 'createTreatment'
    }

    const modalKey = command.modal.toLowerCase()
    const modalName = modals[modalKey]

    if (!modalName) {
      toast.error(`No se encontró el modal: ${command.modal}`)
      return { success: false, error: 'Modal no encontrado' }
    }

    // Aquí integrarías con tu sistema de modales
    // Ejemplo: useModalStore.getState().openModal(modalName, command.prefill)
    
    toast.info(`Abriendo formulario: ${command.modal}`)

    return {
      success: true,
      modal: command.modal,
      prefill: command.prefill
    }
  }

  async showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<any> {
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

    return { success: true, message, type }
  }
}

export const navigationHandler = new NavigationHandler()
```

#### **TAREA 3.2: Agregar funciones de navegación a Gemini**

**Archivo:** `frontend/src/modules/chatbot/services/geminiLiveService.ts`

**Agregar a `AVAILABLE_FUNCTIONS` (línea 11):**

```typescript
export const AVAILABLE_FUNCTIONS = {
  // ... funciones existentes ...
  
  navigate_to_page: {
    name: 'navigate_to_page',
    description: 'Navega a una página específica del sistema. Usa esto cuando el usuario pida ir a alguna sección.',
    parameters: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: ['dashboard', 'patients', 'appointments', 'treatments', 'services', 'reports', 'settings'],
          description: 'Página destino'
        },
        params: {
          type: 'object',
          description: 'Parámetros opcionales como ID',
          properties: {
            id: { type: 'number' }
          }
        }
      },
      required: ['page']
    }
  },
  
  open_modal: {
    name: 'open_modal',
    description: 'Abre un formulario modal para crear pacientes, citas, etc.',
    parameters: {
      type: 'object',
      properties: {
        modal: {
          type: 'string',
          enum: ['create_patient', 'create_appointment', 'create_treatment'],
          description: 'Tipo de formulario a abrir'
        },
        prefill: {
          type: 'object',
          description: 'Datos para pre-llenar el formulario'
        }
      },
      required: ['modal']
    }
  }
}
```

#### **TAREA 3.3: Integrar navigationHandler en chatService**

**Archivo:** `frontend/src/modules/chatbot/services/chatService.ts`

```typescript
import { navigationHandler } from './navigationHandler'

executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
  // Funciones de navegación (NO requieren backend)
  if (functionName === 'navigate_to_page') {
    return await navigationHandler.navigateToPage(args)
  }
  
  if (functionName === 'open_modal') {
    return await navigationHandler.openModal(args)
  }
  
  if (functionName === 'show_notification') {
    return await navigationHandler.showNotification(args.message, args.type)
  }
  
  // Funciones de datos (requieren backend)
  return await backendIntegration.executeFunctionCall(functionName, args)
}
```

#### **TAREA 3.4: Inicializar navigate en FloatingChatbot**

**Archivo:** `frontend/src/modules/chatbot/components/FloatingChatbot.tsx`

```typescript
import { useNavigate } from 'react-router-dom'
import { navigationHandler } from '../services/navigationHandler'

export const FloatingChatbot = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  // ... resto del código ...
  
  useEffect(() => {
    // Inicializar navigationHandler con navigate
    navigationHandler.setNavigate(navigate)
  }, [navigate])
  
  // ... resto del código ...
}
```

#### **CRITERIOS DE ACEPTACIÓN FASE 3:**
- ✅ El usuario puede decir "Llévame a pacientes" y navegar automáticamente
- ✅ El usuario puede decir "Abre el formulario de nuevo paciente" y abrir el modal
- ✅ Se muestran notificaciones toast al navegar
- ✅ Funciona tanto con texto como con voz

---

## 🧪 CÓMO PROBAR TU TRABAJO

### **Verificación Manual:**

1. **Probar chat con backend:**
```bash
# En terminal frontend
npm run dev

# Abrir navegador en http://localhost:5173
# Iniciar sesión
# Abrir chatbot
# Enviar mensaje: "¿Cuántos pacientes hay?"
# Verificar que la respuesta venga del backend (Network tab en DevTools)
```

2. **Probar API Key:**
```bash
# Ir a Settings
# Ingresar una API Key de prueba
# Verificar que se envíe al endpoint PUT /usuarios/{id}/gemini-key
# Ver que aparece el estado "válida" o "inválida"
```

3. **Probar navegación por voz:**
```bash
# Abrir chatbot
# Decir o escribir: "Llévame a la página de pacientes"
# Verificar que navegue a /patients
# Decir: "Abre el formulario para crear un paciente"
# Verificar que abra el modal (o redirija si no hay modal)
```

### **Verificación con DevTools:**

```javascript
// En consola del navegador:

// Verificar que backendIntegration está inicializado
window.__DEBUG_BACKEND__ = backendIntegration

// Probar llamada directa
await window.__DEBUG_BACKEND__.sendMessageToBackend("Hola")

// Verificar token
console.log(window.__DEBUG_BACKEND__.token)

// Verificar thread_id
console.log(window.__DEBUG_BACKEND__.currentThreadId)
```

---

## ⚠️ LIMITACIONES Y REGLAS

### **NO HAGAS:**
- ❌ NO modifiques archivos del backend
- ❌ NO cambies la estructura de autenticación existente
- ❌ NO agregues librerías pesadas sin justificación
- ❌ NO elimines funcionalidad existente
- ❌ NO expongas tokens o API Keys en logs del frontend
- ❌ NO cambies la configuración de Vite sin razón

### **SÍ PUEDES:**
- ✅ Agregar console.log para debugging (pero quítalos antes del commit final)
- ✅ Mejorar el UX del chatbot (animaciones, iconos, etc.)
- ✅ Agregar validaciones en formularios
- ✅ Crear nuevos componentes en `/modules/chatbot/`
- ✅ Mejorar mensajes de error
- ✅ Optimizar performance del chat

---

## 📤 ENTREGA

### **Cuando termines:**

1. **Verifica que funcione:**
   - ✅ Chat conectado con backend
   - ✅ API Key configurable
   - ✅ Navegación por voz operativa
   - ✅ No hay errores en consola

2. **Haz commit de tus cambios:**
```bash
git add frontend/src/modules/chatbot/*
git add frontend/src/modules/settings/*
git commit -m "feat(frontend): Conectar chatbot con backend y agregar navegación por voz"
```

3. **NO hagas push aún** - esperamos revisión del otro agente

4. **Documenta lo que hiciste:**
   - Archivos modificados
   - Archivos creados
   - Funcionalidades agregadas
   - Problemas encontrados (si los hay)

---

## 📚 RECURSOS ÚTILES

**Documentación del proyecto:**
- `/ANALISIS_REQUISITOS_CHAT_VOZ.md` - Análisis completo del sistema
- `/README.md` - Documentación general
- `/Docs/` - Documentación técnica

**Endpoints del backend que usarás:**
- `POST /api/v1/chat` - Enviar mensajes al agente
- `GET /api/v1/chat/capabilities` - Ver capacidades del agente
- `PUT /api/v1/usuarios/{id}/gemini-key` - Actualizar API Key
- `DELETE /api/v1/usuarios/{id}/gemini-key` - Eliminar API Key

**Variables de entorno:**
- `VITE_API_URL` - URL del backend (default: http://localhost:8000/api/v1)
- `VITE_GEMINI_API_KEY` - API Key de Gemini (usar solo para desarrollo local)

---

## 🆘 SI TIENES PROBLEMAS

1. **Error 401 Unauthorized:**
   - Verifica que el token esté en los headers
   - Usa `useAuthStore` para obtener el token
   - Comprueba que el usuario esté autenticado

2. **Error 429 Too Many Requests:**
   - El backend tiene rate limiting (30 req/min)
   - Agrega un debounce en el input del chat

3. **CORS Error:**
   - El backend ya tiene CORS configurado
   - Si persiste, verifica que `VITE_API_URL` sea correcto

4. **TypeScript Errors:**
   - Actualiza las interfaces en `/types/`
   - Usa `any` temporalmente si es bloqueante (pero documenta el TODO)

---

## ✅ CHECKLIST FINAL

Antes de marcar como completo, verifica:

- [ ] Chat envía mensajes a `/api/v1/chat` del backend
- [ ] Token JWT se incluye en headers
- [ ] Thread ID se mantiene entre mensajes
- [ ] Errores se manejan con mensajes claros al usuario
- [ ] Existe UI para configurar API Key de Gemini
- [ ] API Key se envía al endpoint correcto
- [ ] Navegación por voz funciona (al menos 3 páginas)
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings de TypeScript
- [ ] Código está comentado en partes complejas
- [ ] No dejaste console.logs de debugging
- [ ] Probaste con usuario Admin y Podologo
- [ ] No rompiste funcionalidad existente

---

**¡Éxito en tu misión! 🚀**

Si tienes dudas, revisa `/ANALISIS_REQUISITOS_CHAT_VOZ.md` para más contexto.
