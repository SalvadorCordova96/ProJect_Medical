import { Cita, CitaCreateInput, CitaUpdateInput, CitaFilters } from '../types/agenda.types'
import { Paciente, Podologo, Servicio } from '@/lib/types'

// Mock data
const mockPacientes: Paciente[] = [
  {
    id_paciente: 1,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez García',
    fecha_nacimiento: '1985-03-15',
    sexo: 'M',
    telefono: '555-0101',
    email: 'juan.perez@email.com',
    domicilio: 'Calle Principal 123',
    documento_id: '12345678A',
    activo: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id_paciente: 2,
    nombres: 'María Isabel',
    apellidos: 'López Martínez',
    fecha_nacimiento: '1990-07-22',
    sexo: 'F',
    telefono: '555-0102',
    email: 'maria.lopez@email.com',
    domicilio: 'Avenida Central 456',
    documento_id: '23456789B',
    activo: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id_paciente: 3,
    nombres: 'Pedro Antonio',
    apellidos: 'Rodríguez Sánchez',
    fecha_nacimiento: '1978-11-10',
    sexo: 'M',
    telefono: '555-0103',
    email: 'pedro.rodriguez@email.com',
    domicilio: 'Plaza Mayor 789',
    documento_id: '34567890C',
    activo: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

const mockPodologos: Podologo[] = [
  {
    id_podologo: 1,
    nombres: 'Dr. Roberto',
    apellidos: 'González Fernández',
    especialidad: 'Podología General',
    disponibilidad: {},
    contacto: 'roberto.gonzalez@clinica.com',
    activo: true
  },
  {
    id_podologo: 2,
    nombres: 'Dra. Ana',
    apellidos: 'Martínez Silva',
    especialidad: 'Biomecánica Podal',
    disponibilidad: {},
    contacto: 'ana.martinez@clinica.com',
    activo: true
  }
]

const mockServicios: Servicio[] = [
  {
    id_servicio: 1,
    nombre: 'Consulta General',
    descripcion: 'Consulta podológica general',
    duracion_minutos: 30,
    precio: 45.00,
    activo: true
  },
  {
    id_servicio: 2,
    nombre: 'Tratamiento de Uñas',
    descripcion: 'Tratamiento para uñas encarnadas y hongos',
    duracion_minutos: 45,
    precio: 60.00,
    activo: true
  },
  {
    id_servicio: 3,
    nombre: 'Estudio Biomecánico',
    descripcion: 'Análisis completo de la pisada',
    duracion_minutos: 60,
    precio: 80.00,
    activo: true
  }
]

let mockCitas: Cita[] = [
  {
    id_cita: 1,
    paciente_id: 1,
    paciente: mockPacientes[0],
    podologo_id: 1,
    podologo: mockPodologos[0],
    servicio_id: 1,
    servicio: mockServicios[0],
    fecha_hora: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    duracion_minutos: 30,
    estado: 'confirmado',
    motivo: 'Revisión general',
    sala: 'Consultorio 1',
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id_cita: 2,
    paciente_id: 2,
    paciente: mockPacientes[1],
    podologo_id: 2,
    podologo: mockPodologos[1],
    servicio_id: 2,
    servicio: mockServicios[1],
    fecha_hora: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    duracion_minutos: 45,
    estado: 'pendiente',
    motivo: 'Dolor en uña',
    sala: 'Consultorio 2',
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id_cita: 3,
    paciente_id: 3,
    paciente: mockPacientes[2],
    podologo_id: 1,
    podologo: mockPodologos[0],
    servicio_id: 3,
    servicio: mockServicios[2],
    fecha_hora: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    duracion_minutos: 60,
    estado: 'completado',
    motivo: 'Estudio de pisada',
    sala: 'Consultorio 1',
    created_by: 1,
    created_at: new Date().toISOString()
  }
]

let nextId = 4

export const agendaServiceMock = {
  // Get all citas with filters
  getCitas: async (filters?: CitaFilters): Promise<Cita[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filteredCitas = [...mockCitas]
    
    if (filters?.estado) {
      filteredCitas = filteredCitas.filter(c => c.estado === filters.estado)
    }
    if (filters?.podologo_id) {
      filteredCitas = filteredCitas.filter(c => c.podologo_id === filters.podologo_id)
    }
    if (filters?.paciente_id) {
      filteredCitas = filteredCitas.filter(c => c.paciente_id === filters.paciente_id)
    }
    if (filters?.fecha_inicio) {
      filteredCitas = filteredCitas.filter(c => new Date(c.fecha_hora) >= new Date(filters.fecha_inicio!))
    }
    if (filters?.fecha_fin) {
      filteredCitas = filteredCitas.filter(c => new Date(c.fecha_hora) <= new Date(filters.fecha_fin!))
    }
    
    return filteredCitas
  },

  // Get calendar view
  getCalendarView: async (startDate: string, endDate: string, view: 'week' | 'day' | 'month' = 'week'): Promise<Cita[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return mockCitas.filter(c => {
      const citaDate = new Date(c.fecha_hora)
      return citaDate >= new Date(startDate) && citaDate <= new Date(endDate)
    })
  },

  // Get single cita
  getCita: async (id: number): Promise<Cita | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockCitas.find(c => c.id_cita === id) || null
  },

  // Create cita
  createCita: async (data: CitaCreateInput): Promise<Cita> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const paciente = mockPacientes.find(p => p.id_paciente === data.paciente_id)
    const podologo = mockPodologos.find(p => p.id_podologo === data.podologo_id)
    const servicio = data.servicio_id ? mockServicios.find(s => s.id_servicio === data.servicio_id) : undefined
    
    const newCita: Cita = {
      id_cita: nextId++,
      paciente_id: data.paciente_id,
      paciente,
      podologo_id: data.podologo_id,
      podologo,
      servicio_id: data.servicio_id,
      servicio,
      fecha_hora: data.fecha_hora,
      duracion_minutos: data.duracion_minutos,
      estado: data.estado || 'pendiente',
      motivo: data.motivo,
      sala: data.sala,
      created_by: 1,
      created_at: new Date().toISOString()
    }
    
    mockCitas.push(newCita)
    return newCita
  },

  // Update cita
  updateCita: async (id: number, data: CitaUpdateInput): Promise<Cita | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockCitas.findIndex(c => c.id_cita === id)
    if (index === -1) return null
    
    mockCitas[index] = { ...mockCitas[index], ...data }
    
    // Update relationships if IDs changed
    if (data.paciente_id) {
      mockCitas[index].paciente = mockPacientes.find(p => p.id_paciente === data.paciente_id)
    }
    if (data.podologo_id) {
      mockCitas[index].podologo = mockPodologos.find(p => p.id_podologo === data.podologo_id)
    }
    if (data.servicio_id) {
      mockCitas[index].servicio = mockServicios.find(s => s.id_servicio === data.servicio_id)
    }
    
    return mockCitas[index]
  },

  // Delete/Cancel cita
  deleteCita: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockCitas.findIndex(c => c.id_cita === id)
    if (index === -1) return false
    
    // Soft delete - just mark as cancelled
    mockCitas[index].estado = 'cancelado'
    return true
  },

  // Reschedule cita
  rescheduleCita: async (id: number, newDateTime: string): Promise<Cita | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockCitas.findIndex(c => c.id_cita === id)
    if (index === -1) return null
    
    mockCitas[index].fecha_hora = newDateTime
    return mockCitas[index]
  },

  // Get pacientes for dropdown
  getPacientes: async (): Promise<Paciente[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockPacientes
  },

  // Get podologos for dropdown
  getPodologos: async (): Promise<Podologo[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockPodologos
  },

  // Get servicios for dropdown
  getServicios: async (): Promise<Servicio[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockServicios
  }
}
