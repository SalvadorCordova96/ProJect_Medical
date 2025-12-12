import { Paciente, Podologo, Servicio } from '@/lib/types'

export type CitaEstado = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'

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

export interface CitaCreateInput {
  paciente_id: number
  podologo_id: number
  servicio_id?: number
  fecha_hora: string
  duracion_minutos: number
  estado?: CitaEstado
  motivo?: string
  sala?: string
}

export interface CitaUpdateInput {
  paciente_id?: number
  podologo_id?: number
  servicio_id?: number
  fecha_hora?: string
  duracion_minutos?: number
  estado?: CitaEstado
  motivo?: string
  sala?: string
}

export interface CitaFilters {
  fecha_inicio?: string
  fecha_fin?: string
  podologo_id?: number
  paciente_id?: number
  estado?: CitaEstado
  page?: number
  per_page?: number
}

export interface CalendarView {
  type: 'week' | 'day' | 'month'
  startDate: Date
  endDate: Date
}
