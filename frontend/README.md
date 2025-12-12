# PodoSkin - Sistema de Gestión de Clínica Podológica

Sistema integral de gestión para clínicas de podología con interfaz moderna y asistente virtual con IA.

## 🚀 Características Principales

- **Gestión de Citas**: Calendario interactivo con drag & drop
- **Historial de Pacientes**: Gestión completa de pacientes con tratamientos y evoluciones
- **Asistente Virtual con IA**: Chatbot flotante con:
  - 🎤 **Entrada de voz**: Graba mensajes de voz para interactuar
  - 🔊 **Salida de voz**: Respuestas habladas del asistente
  - 🤖 **Gemini Live API**: Integración con IA de Google
  - 📞 **Function Calling**: Ejecuta acciones en el sistema mediante comandos de voz
- **Dashboard con KPIs**: Métricas y estadísticas en tiempo real
- **Control de Acceso**: Sistema de roles (Admin, Podólogo, Recepción)

## 🎙️ Asistente Virtual

El chatbot flotante está disponible en toda la aplicación y ofrece:

### Capacidades de Voz
- **Grabación de Audio**: Haz clic en el ícono del micrófono para grabar tu pregunta
- **Transcripción Automática**: Gemini Live procesa el audio y extrae el texto
- **Respuestas Habladas**: Activa/desactiva la reproducción de voz de las respuestas
- **Soporte Multilingüe**: Español (ES/MX)

### Function Calling
El asistente puede ejecutar acciones en el sistema:
- \`get_todays_appointments\`: Ver citas del día
- \`search_patient\`: Buscar pacientes
- \`create_patient\`: Crear nuevo paciente
- \`schedule_appointment\`: Agendar cita
- \`get_active_treatments\`: Ver tratamientos activos

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo \`.env\` basado en \`.env.example\`:

\`\`\`bash
cp .env.example .env
\`\`\`

Configura las siguientes variables:

\`\`\`env
# Backend API
VITE_API_URL=http://localhost:8000/api/v1

# Gemini Live API (obligatorio para funciones de voz)
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
\`\`\`

**Obtener API Key de Gemini:**
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea un proyecto o selecciona uno existente
3. Genera una nueva API key
4. Copia la key al archivo \`.env\`

### Instalación

\`\`\`bash
npm install
\`\`\`

### Desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:5173\`

### Build de Producción

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🏗️ Arquitectura

\`\`\`
src/
├── modules/
│   ├── auth/           # Autenticación y autorización
│   ├── agenda/         # Gestión de citas
│   ├── pacientes/      # Historial de pacientes
│   ├── chatbot/        # Asistente virtual con IA
│   │   ├── services/
│   │   │   ├── geminiLiveService.ts  # Integración Gemini Live
│   │   │   ├── voiceService.ts       # Grabación y reproducción
│   │   │   └── chatService.ts        # Servicio principal
│   │   ├── stores/     # Estado global (Zustand)
│   │   └── components/ # UI del chatbot
│   ├── dashboard/      # Dashboard con KPIs
│   └── layout/         # Layout principal
└── components/         # Componentes UI (Radix UI)
\`\`\`

## �� Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Radix UI + Tailwind CSS
- **Estado**: Zustand
- **Routing**: React Router v7
- **IA**: Google Gemini Live API
- **Audio**: Web Audio API + MediaRecorder API

## 📝 Uso del Asistente Virtual

### Activar el Chatbot
1. Haz clic en el botón flotante azul (esquina inferior derecha)
2. El panel se desliza desde la derecha

### Enviar Mensaje de Texto
1. Escribe tu pregunta en el área de texto
2. Presiona Enter o haz clic en el botón de enviar

### Enviar Mensaje de Voz
1. Haz clic en el ícono del micrófono 🎤
2. Comienza a hablar (verás el ícono rojo pulsando)
3. Haz clic nuevamente para detener y enviar
4. El asistente procesará tu audio y responderá

### Controlar la Voz de Salida
- Haz clic en el ícono del altavoz 🔊 en el header del chat
- Activa/desactiva la reproducción automática de respuestas

### Comandos Rápidos
Usa los botones de comando rápido para acciones comunes:
- Ver citas de hoy
- Crear paciente
- Tratamientos activos
- Subir evidencias
- Ayuda del sistema

## 🔒 Seguridad

- Las API keys deben mantenerse privadas
- No commitear el archivo \`.env\` al repositorio
- El archivo \`.env.example\` solo contiene plantillas sin datos sensibles

## 📖 Documentación Adicional

- [PRD.md](./PRD.md): Especificación completa del producto
- [ARCHITECTURE.md](./ARCHITECTURE.md): Detalles de arquitectura
- [Gemini API Docs](https://ai.google.dev/tutorials/rest_quickstart)

## 📄 Licencia

MIT License - Copyright GitHub, Inc.
