# PodoSkin - Sistema de Gestión de Clínica Podológica

Sistema integral de gestión para clínicas de podología que conecta pacientes, citas, tratamientos, evoluciones clínicas y evidencias fotográficas en una plataforma web moderna y funcional. Alineado con la especificación de API del repositorio Medical-App.

**Experience Qualities**:
1. **Profesional** - La interfaz transmite confianza médica con diseño limpio, organizado y accesible para personal clínico
2. **Eficiente** - Flujos rápidos para tareas cotidianas (agendar citas, registrar evoluciones, buscar pacientes) con mínimos clics
3. **Informativo** - Dashboard con métricas clave, alertas visuales y acceso directo a información crítica del día

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
- Sistema completo de gestión clínica con 4 módulos principales: Dashboard, Agenda (calendario con drag & drop), Historial de Pacientes (con tratamientos y evoluciones), y Configuraciones (admin). Sistema RBAC con roles Admin, Podólogo y Recepción. Alineado con endpoints REST del backend FastAPI (3 bases de datos PostgreSQL: auth, core, ops).

## Essential Features

### 1. Dashboard Principal
- **Functionality**: Vista panorámica de la actividad diaria con widgets informativos
- **Purpose**: Proporcionar contexto inmediato al iniciar sesión y facilitar acceso rápido a tareas pendientes
- **Trigger**: Al iniciar sesión exitosamente
- **Progression**: Login → Dashboard con widgets (citas del día, alertas, pacientes nuevos, métricas) → Click en widget → Navega a módulo específico
- **Success criteria**: Widgets actualizados en tiempo real, navegación funcional, métricas precisas

### 2. Agenda (Calendario Interactivo con Drag & Drop)
- **Functionality**: Vista semanal de calendario con slots de tiempo (8:00-20:00), recuadros de citas arrastrables, edición inline de estado (pendiente, confirmado, cancelado, completado), reagendación con drag & drop, modal de creación/edición de citas con validación de conflictos
- **Purpose**: Organizar agenda diaria/semanal de forma visual e intuitiva, permitir cambios rápidos de horarios, evitar sobrelapamientos, optimizar flujo de trabajo de recepción
- **Trigger**: Click en "Agenda" en navegación principal
- **Progression**: Vista calendario semanal con slots horarios → Drag cita a nuevo slot (reagendación automática) → Click en cita → Modal con detalles → Editar estado/campos → Guardar → Validación de disponibilidad → Confirmación visual
- **Success criteria**: Drag & drop funcional con feedback visual, validación de conflictos en tiempo real, estados de cita con colores distintivos, navegación por semanas, vista "Hoy" accesible, modal de edición con todos los campos (paciente, podólogo, servicio, fecha/hora, duración, sala, motivo, estado)
- **Endpoints alineados**: GET /api/v1/citas, GET /api/v1/citas/calendar, POST /api/v1/citas, PUT/PATCH /api/v1/citas/{id_cita}, DELETE /api/v1/citas/{id_cita}, POST /api/v1/citas/{id_cita}/reschedule

### 3. Historial de Pacientes
- **Functionality**: Vista de 3 columnas: lista de pacientes con búsqueda (izquierda), ficha completa del paciente seleccionado (derecha), con tabs para Datos Personales, Tratamientos y Citas. CRUD completo de pacientes con todos los campos: nombres, apellidos, fecha_nacimiento (con cálculo automático de edad), sexo, teléfono, email, domicilio, documento_id
- **Purpose**: Acceso rápido a historial completo del paciente, visualización integrada de datos personales, tratamientos activos, evoluciones y citas
- **Trigger**: Click en "Historial Pacientes"
- **Progression**: Vista con lista de pacientes → Buscar por nombre/documento/teléfono → Click en paciente → Ficha detallada se carga → Navegar entre tabs (Datos/Tratamientos/Citas) → Ver evoluciones dentro de tratamientos → Editar paciente desde botón "Editar"
- **Success criteria**: Búsqueda instantánea funcional, cálculo correcto de edad, visualización de tratamientos con sus evoluciones, historial de citas ordenado cronológicamente, validación de campos requeridos en formulario
- **Endpoints alineados**: GET /api/v1/pacientes, POST /api/v1/pacientes, GET /api/v1/pacientes/{id_paciente}, PUT/PATCH /api/v1/pacientes/{id_paciente}, GET /api/v1/pacientes/{id_paciente}/historial, GET /api/v1/pacientes/{id_paciente}/tratamientos

### 4. Configuraciones (Solo Admin)
- **Functionality**: Panel de administración con 4 tabs: Usuarios (CRUD completo con gestión de roles, cambio de contraseña, activación/desactivación), Podólogos (vista de staff registrado), Servicios (catálogo con nombre, precio, duración), Auditoría (log completo de acciones del sistema)
- **Purpose**: Administración centralizada del sistema, control de acceso basado en roles, tracking de acciones para compliance y seguridad
- **Trigger**: Usuario Admin accede a "Configuraciones"
- **Progression**: Vista de tabs → Usuarios: crear/editar usuario → Asignar rol (Admin/Podólogo/Recepción) → Cambiar contraseña → Activar/desactivar → Validaciones de seguridad (no auto-eliminación, no cambio de propio rol Admin) → Ver auditoría completa con filtros
- **Success criteria**: Permisos aplicados correctamente (solo Admin accede), protecciones de auto-modificación funcionando, cambios registrados en auditoría, visualización completa de podólogos y servicios, timestamps precisos en logs
- **Endpoints alineados**: GET /api/v1/usuarios, POST /api/v1/usuarios, PUT/PATCH /api/v1/usuarios/{id_usuario}, DELETE /api/v1/usuarios/{id_usuario}, POST /api/v1/usuarios/{id_usuario}/reset-password, GET /api/v1/audit, GET /api/v1/podologos, GET /api/v1/servicios

### 5. Tratamientos y Evoluciones (Integrado en Historial de Pacientes)
- **Functionality**: Registro de tratamientos activos con problema, fechas, estado, notas adicionales. Evoluciones tipo SOAP asociadas a tratamientos con nota, fecha_visita, podólogo, tipo_visita, signos_vitales
- **Purpose**: Documentar progreso clínico del paciente con notas estructuradas y seguimiento temporal
- **Trigger**: Desde ficha de paciente, tab "Tratamientos"
- **Progression**: Ver tratamientos del paciente → Crear nuevo tratamiento → Agregar evolución (formato SOAP) → Guardar con auditoría automática
- **Success criteria**: Tratamientos ordenados cronológicamente, evoluciones agrupadas por tratamiento, formato SOAP claro, historial inmutable
- **Endpoints alineados**: GET /api/v1/tratamientos, POST /api/v1/tratamientos, GET /api/v1/tratamientos/{id_tratamiento}, PUT/PATCH /api/v1/tratamientos/{id_tratamiento}, GET /api/v1/evoluciones, POST /api/v1/evoluciones, GET /api/v1/evoluciones/{id_evolucion}

### 6. Asistente Virtual (Chatbot)
- **Functionality**: Chatbot persistente con IA integrada disponible en todas las vistas de la aplicación, con comandos rápidos predefinidos para consultas comunes
- **Purpose**: Proporcionar ayuda contextual instantánea sobre el uso del sistema y responder preguntas generales sobre gestión clínica
- **Trigger**: Click en botón flotante "Asistente Virtual" (bottom-right corner)
- **Progression**: Click botón → Panel lateral se desliza desde la derecha → Ver comandos rápidos predefinidos (categorías: Ayuda, Información) → Seleccionar comando rápido O escribir pregunta personalizada → IA responde en tiempo real → Historial de conversación se mantiene persistente → Botón "Limpiar chat" para reiniciar conversación
- **Success criteria**: Respuestas coherentes y útiles, historial de mensajes guardado entre sesiones, diseño no invasivo, texto de bienvenida en degradado animado, comandos rápidos funcionales y relevantes

## Edge Case Handling
- **Conflicto de citas**: Validación en backend y frontend antes de confirmar, sugerir horarios alternativos, feedback visual en drag & drop
- **Paciente duplicado**: Búsqueda preventiva antes de crear, validación de documento_id único
- **Sesión expirada**: Refresh token automático o redirect a login con mensaje claro
- **Eliminación accidental**: Soft-delete con opción de restaurar (solo Admin)
- **Cambio de rol durante sesión**: Actualización de permisos sin cerrar sesión
- **Datos faltantes en formularios**: Validación inline con mensajes específicos en español
- **Auto-eliminación de usuario**: Prevención de que un usuario Admin se elimine o desactive a sí mismo
- **Cambio de rol propio**: Prevención de que un Admin cambie su propio rol desde Admin
- **Contraseñas débiles**: Validación mínima de 6 caracteres y confirmación de contraseña
- **Usuarios duplicados**: Validación de username y email únicos
- **Drag & drop de citas**: Validación de disponibilidad del slot objetivo, rollback visual si hay conflicto
- **Cálculo de edad**: Manejo correcto de años bisiestos y fechas futuras (error)

## Design Direction
El diseño debe evocar **profesionalismo médico moderno** con toques de **calidez y accesibilidad**. Inspirado en software hospitalario contemporáneo pero más amigable, evitando la frialdad clínica excesiva. Debe sentirse como una herramienta confiable, organizada y eficiente que reduce estrés del personal y proyecta orden.

## Color Selection
Paleta inspirada en ambientes clínicos modernos con acento cálido para humanizar la experiencia.

- **Primary Color**: Azul médico profundo `oklch(0.45 0.15 240)` - transmite confianza, profesionalismo y estabilidad clínica
- **Secondary Colors**: 
  - Gris neutro `oklch(0.60 0.01 240)` para backgrounds secundarios y texto de apoyo
  - Verde clínico `oklch(0.65 0.12 150)` para estados exitosos y confirmaciones
- **Accent Color**: Coral cálido `oklch(0.68 0.17 25)` - humaniza la interfaz, destaca CTAs importantes sin ser agresivo
- **Foreground/Background Pairings**:
  - Primary (Azul profundo #1E3A8A): Blanco puro (#FFFFFF) - Ratio 8.2:1 ✓
  - Accent (Coral #E87B64): Blanco puro (#FFFFFF) - Ratio 4.6:1 ✓
  - Background (Gris claro #F8FAFC): Texto oscuro (#1E293B) - Ratio 12.8:1 ✓
  - Success (Verde #10B981): Blanco puro (#FFFFFF) - Ratio 4.9:1 ✓

## Font Selection
Tipografía funcional y legible que refleja modernidad profesional sin sacrificar claridad en contextos médicos donde la precisión es crítica.

- **Primary**: Work Sans - sans-serif geométrica humanista, excelente legibilidad en pantallas médicas, sensación profesional pero accesible
- **Secondary/Data**: JetBrains Mono - para campos de datos estructurados (IDs, fechas, códigos) que requieren distinción clara

- **Typographic Hierarchy**:
  - H1 (Títulos de página): Work Sans Bold / 32px / tracking -0.02em / line-height 1.2
  - H2 (Secciones): Work Sans SemiBold / 24px / tracking -0.01em / line-height 1.3
  - H3 (Subsecciones): Work Sans Medium / 18px / tracking normal / line-height 1.4
  - Body (Texto general): Work Sans Regular / 15px / tracking 0.01em / line-height 1.6
  - Caption (Metadatos): Work Sans Regular / 13px / tracking 0.02em / line-height 1.5
  - Data (IDs, códigos): JetBrains Mono Regular / 14px / tracking normal / line-height 1.5

## Animations
Las animaciones deben ser sutiles y funcionales, priorizando feedback inmediato sin distraer del flujo de trabajo clínico.

- **Transiciones de página**: Fade suave 200ms para cambios de vista
- **Modales**: Scale from center (0.95 → 1) + fade, 250ms ease-out
- **Botones**: Hover con lift sutil (shadow + translateY -1px), 150ms
- **Notificaciones toast**: Slide-in desde top-right, 300ms ease-out
- **Loading states**: Skeleton screens en listas, spinner discreto en botones
- **Drag & drop (citas)**: Feedback visual inmediato con ghost element y highlight de drop zones
- **Validación forms**: Shake suave (3px) en campos con error, 200ms
- **Chatbot**: Panel lateral slide-in desde derecha 300ms, botón flotante scale hover 1.05, texto de bienvenida con gradiente animado infinito

## Component Selection
- **Components**: 
  - Layout: Navegación lateral simplificada con 4 items principales (Dashboard, Agenda, Historial Pacientes, Configuraciones), Avatar con iniciales de usuario
  - Dashboard: Card containers para widgets, Badge para alertas, estadísticas en tiempo real
  - Agenda: Grid de calendario personalizado con slots horarios, Cards arrastrables para citas con drag & drop nativo, Dialog para crear/editar, color-coding por estado (pendiente: gris, confirmado: azul, completado: verde, cancelado: rojo), badges de estado
  - Historial Pacientes: Grid de 3 columnas (lista lateral con scroll, ficha detallada con Tabs), Input con icon para búsqueda, Table para citas históricas
  - Configuraciones: Tabs para secciones (Usuarios/Podólogos/Servicios/Auditoría), Table para listados, Dialog para CRUD, Badges para roles y estados
  - Forms: Input, Textarea, Select, DatePicker, Label con validación inline
  - Notificaciones: Toast (sonner) para confirmaciones/errores
  - Estados: Skeleton para loading, Alert para mensajes importantes
  - Acciones: Button (variants: default, destructive, outline, ghost), DropdownMenu para actions
  - Chatbot: Botón flotante fixed bottom-right, panel lateral deslizable con ScrollArea, Input + Button para envío de mensajes, Badges para categorías de comandos rápidos, estado vacío con sugerencias predefinidas
  
- **Customizations**:
  - Calendar semanal con vista de grid (8 columnas: hora + 7 días), drag & drop nativo HTML5 con ghost element, validación de drop zones con highlight visual
  - Citas como Cards con información condensada (nombre paciente, podólogo, servicio, badge de estado), draggable con feedback inmediato
  - Historial con master-detail pattern (lista + ficha), tabs para separar Datos/Tratamientos/Citas, cards expandibles para tratamientos con evoluciones
  - Configuraciones con tabs horizontales, protecciones UI para auto-modificación (botones disabled), modal de cambio de contraseña separado
  - Validación de formularios con mensajes inline, campos requeridos marcados con asterisco
  - Chatbot con texto de bienvenida de tres líneas en gradiente animado (primary-accent-primary), historial persistente de conversación, integración con Spark LLM API, comandos rápidos predefinidos con iconos (CalendarCheck, UserPlus, Notebook, Camera, Question, Lightbulb), botón "Limpiar chat"
  
- **States**:
  - Buttons: hover (lift + shadow), active (scale 0.98), disabled (opacity 0.5 + cursor-not-allowed)
  - Inputs: focus (ring accent), error (ring destructive + shake), success (ring green)
  - Cards: hover (border accent + shadow lift) en elementos clickeables
  - Citas drag: dragging state (opacity 0.5 + cursor-grabbing), drop zone highlight (border-primary + bg-primary/10)
  - Loading: skeleton en listas, spinner en botones de guardar
  
- **Icon Selection**: @phosphor-icons/react
  - House para dashboard, CalendarBlank para agenda, ClipboardText para historial, Gear para configuraciones
  - User para pacientes, Phone/EnvelopeSimple/MapPin para contacto
  - FirstAid para tratamientos, Note para evoluciones, Camera para evidencias
  - Plus para crear, Pencil para editar, Trash para eliminar, LockKey para contraseña
  - CaretLeft/CaretRight para navegación de semanas, MagnifyingGlass para búsqueda
  - ChatCircleDots para chatbot, PaperPlaneRight para enviar mensajes, CalendarCheck/UserPlus/Notebook/Camera/Question/Lightbulb para comandos rápidos
  
- **Spacing**: Sistema base-8
  - Contenedores principales: p-6 (24px)
  - Cards: p-4 (16px)
  - Gaps en grids: gap-4 (16px) para agenda, gap-6 (24px) para historial
  - Stacks verticales: space-y-6 (24px)
  - Slots de calendario: min-h-[80px] para slots horarios
  
- **Mobile**: 
  - Sidebar colapsa a drawer hamburger < 768px
  - Historial de pacientes cambia a layout vertical (lista arriba, ficha abajo)
  - Agenda cambia a vista diaria (1 columna) en móvil
  - Forms a ancho completo con inputs más grandes (touch-friendly)
  - Navegación inferior fixed con tabs principales en mobile
  - Drag & drop deshabilitado en mobile, reemplazado por botón "Reagendar"
  - Chatbot panel a ancho completo en mobile, botón flotante más pequeño

## API Alignment (Medical-App Repository)
La aplicación está alineada con los siguientes endpoints del repositorio Medical-App:

### Auth Module
- POST /api/v1/auth/login — Login con JWT
- GET /api/v1/auth/me — Perfil usuario actual
- POST /api/v1/auth/change-password — Cambio de contraseña

### Pacientes Module (clinica_core_db)
- GET /api/v1/pacientes — Listar con filtros/búsqueda/paginación
- POST /api/v1/pacientes — Crear paciente (Admin, Recepción)
- GET /api/v1/pacientes/{id_paciente} — Ficha completa
- PUT/PATCH /api/v1/pacientes/{id_paciente} — Actualizar
- DELETE /api/v1/pacientes/{id_paciente} — Soft-delete (Admin)
- GET /api/v1/pacientes/{id_paciente}/historial — Tratamientos/evoluciones

### Citas Module (clinica_ops_db)
- GET /api/v1/citas — Listar con filtros (fecha/podólogo/estado)
- GET /api/v1/citas/calendar — Vista calendario (mes/semana/día)
- POST /api/v1/citas — Crear con validación de disponibilidad
- GET /api/v1/citas/{id_cita} — Detalle
- PUT/PATCH /api/v1/citas/{id_cita} — Actualizar/reprogramar/cambiar estado
- DELETE /api/v1/citas/{id_cita} — Cancelar (soft)
- POST /api/v1/citas/{id_cita}/reschedule — Reagendar específico

### Tratamientos Module (clinica_core_db)
- GET /api/v1/tratamientos — Listar (global o por paciente)
- POST /api/v1/tratamientos — Crear para paciente
- GET /api/v1/tratamientos/{id_tratamiento} — Detalle con evoluciones
- PUT/PATCH /api/v1/tratamientos/{id_tratamiento} — Actualizar
- GET /api/v1/pacientes/{id_paciente}/tratamientos — Por paciente

### Evoluciones Module (clinica_core_db)
- GET /api/v1/evoluciones — Listar (filtrar por tratamiento)
- POST /api/v1/evoluciones — Crear nota SOAP
- GET /api/v1/evoluciones/{id_evolucion} — Ver detalle
- PUT/PATCH /api/v1/evoluciones/{id_evolucion} — Editar (propio o Admin)

### Usuarios/Admin Module (clinica_auth_db)
- GET /api/v1/usuarios — Listar usuarios (Admin)
- POST /api/v1/usuarios — Crear con asignación de rol
- GET /api/v1/usuarios/{id_usuario} — Ver usuario
- PUT/PATCH /api/v1/usuarios/{id_usuario} — Editar (rol, activo)
- DELETE /api/v1/usuarios/{id_usuario} — Inactivar
- POST /api/v1/usuarios/{id_usuario}/reset-password — Forzar reset

### Auditoría Module (clinica_auth_db)
- GET /api/v1/audit — Logs completos con filtros (usuario/fecha/acción)
- GET /api/v1/audit/{id} — Detalle de evento

### Servicios Module (clinica_ops_db)
- GET /api/v1/servicios — Listar servicios
- POST /api/v1/servicios — Crear (nombre, duración, precio) [Admin]
- GET /api/v1/servicios/{id_servicio} — Detalle
- PUT/PATCH /api/v1/servicios/{id_servicio} — Editar [Admin]

### Podólogos Module (clinica_ops_db)
- GET /api/v1/podologos — Listar staff
- GET /api/v1/podologos/{id_podologo} — Perfil (horarios, especialidad)
- GET /api/v1/podologos/{id_podologo}/agenda — Agenda por podólogo
