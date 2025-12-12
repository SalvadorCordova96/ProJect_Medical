export type UserRole = 'Admin' | 'Podologo' | 'Recepcion'

export type CitaEstado = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'

export type TratamientoEstado = 'activo' | 'completado'

export type ProspectoEstado = 'nuevo' | 'contactado' | 'convertido'

export type EvidenciaTipo = 'foto' | 'radiografia'

export interface Usuario {
  id_usuario: number
  username: string
  email: string
  rol: UserRole
  nombre: string
  apellido: string
  activo: boolean
  last_login?: string
  created_at: string
}

export interface Paciente {
  id_paciente: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  sexo: string
  telefono: string
  email?: string
  domicilio?: string
  documento_id?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Cita {
  id_cita: number
  paciente_id: number
  paciente?: Paciente
  podologo_id: number
  podologo?: Podologo
  servicio_id?: number
  servicio?: Servicio
  fecha_hora: string
  duracion_minutos: number
  estado: CitaEstado
  motivo?: string
  sala?: string
  created_by: number
  created_at: string
}

export interface Tratamiento {
  id_tratamiento: number
  paciente_id: number
  paciente?: Paciente
  problema: string
  fecha_inicio: string
  fecha_fin?: string
  estado: TratamientoEstado
  notas_adicionales?: string
  activo: boolean
  evoluciones?: Evolucion[]
  evidencias?: Evidencia[]
}

export interface Evolucion {
  id_evolucion: number
  tratamiento_id: number
  podologo_id: number
  podologo?: Podologo
  fecha_visita: string
  nota: string
  tipo_visita?: string
  signos_vitales?: Record<string, any>
  created_at: string
}

export interface Evidencia {
  id_evidencia: number
  tratamiento_id: number
  evolucion_id?: number
  archivo_url: string
  thumbnail_url?: string
  tipo: EvidenciaTipo
  metadata?: Record<string, any>
  created_at: string
}

export interface Podologo {
  id_podologo: number
  nombres: string
  apellidos: string
  especialidad?: string
  disponibilidad?: Record<string, any>
  contacto?: string
  activo: boolean
}

export interface Servicio {
  id_servicio: number
  nombre: string
  descripcion?: string
  duracion_minutos: number
  precio: number
  activo: boolean
}

export interface Prospecto {
  id_prospecto: number
  nombre: string
  contacto: string
  fuente?: string
  estado: ProspectoEstado
  notas?: string
  created_at: string
}

export interface DashboardStats {
  citasHoy: number
  pacientesNuevos: number
  tratamientosActivos: number
  proximasCitas: Cita[]
}

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_change' | 'role_change'

export type AuditEntity = 'usuario' | 'paciente' | 'cita' | 'tratamiento' | 'evolucion' | 'evidencia' | 'podologo' | 'servicio' | 'prospecto'

export interface AuditLog {
  id_audit: number
  usuario_id: number
  usuario?: Usuario
  action: AuditAction
  entity: AuditEntity
  entity_id?: number
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}
