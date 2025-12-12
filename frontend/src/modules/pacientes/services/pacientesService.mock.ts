import { 
  Paciente, 
  PacienteCreateInput, 
  PacienteUpdateInput, 
  PacienteFilters,
  PacienteHistorial,
  Tratamiento,
  TratamientoCreateInput,
  TratamientoUpdateInput,
  Evolucion,
  EvolucionCreateInput,
  Cita,
  Podologo
} from '../types/pacientes.types'

// Mock pacientes data
let mockPacientes: Paciente[] = [
  {
    id_paciente: 1,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez García',
    fecha_nacimiento: '1985-03-15',
    sexo: 'M',
    telefono: '555-0101',
    email: 'juan.perez@email.com',
    domicilio: 'Calle Principal 123, Madrid',
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
    domicilio: 'Avenida Central 456, Barcelona',
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
    domicilio: 'Plaza Mayor 789, Valencia',
    documento_id: '34567890C',
    activo: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id_paciente: 4,
    nombres: 'Ana María',
    apellidos: 'González Fernández',
    fecha_nacimiento: '1995-05-18',
    sexo: 'F',
    telefono: '555-0104',
    email: 'ana.gonzalez@email.com',
    domicilio: 'Calle Luna 321, Sevilla',
    documento_id: '45678901D',
    activo: true,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  }
]

let mockTratamientos: Tratamiento[] = [
  {
    id_tratamiento: 1,
    paciente_id: 1,
    problema: 'Fascitis plantar pie derecho',
    fecha_inicio: '2024-01-15',
    estado: 'activo',
    notas_adicionales: 'Dolor intenso al levantarse por las mañanas',
    activo: true,
    evoluciones: []
  },
  {
    id_tratamiento: 2,
    paciente_id: 2,
    problema: 'Uña encarnada dedo gordo',
    fecha_inicio: '2024-02-01',
    fecha_fin: '2024-03-15',
    estado: 'completado',
    notas_adicionales: 'Tratamiento finalizado con éxito',
    activo: true,
    evoluciones: []
  }
]

let mockEvoluciones: Evolucion[] = [
  {
    id_evolucion: 1,
    tratamiento_id: 1,
    podologo_id: 1,
    fecha_visita: '2024-01-15',
    nota: 'S: Paciente refiere dolor agudo en talón derecho al despertar\nO: Inflamación visible en fascia plantar, dolor a la palpación\nA: Fascitis plantar confirmada\nP: Tratamiento con ejercicios de estiramiento, plantillas ortopédicas',
    tipo_visita: 'Primera consulta',
    signos_vitales: { presion: '120/80', frecuencia_cardiaca: 72 },
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id_evolucion: 2,
    tratamiento_id: 1,
    podologo_id: 1,
    fecha_visita: '2024-02-15',
    nota: 'S: Mejoría parcial del dolor, persiste molestia al caminar\nO: Reducción de inflamación\nA: Evolución favorable\nP: Continuar con tratamiento, fisioterapia adicional',
    tipo_visita: 'Seguimiento',
    created_at: '2024-02-15T10:00:00Z'
  }
]

let mockCitas: Cita[] = [
  {
    id_cita: 1,
    paciente_id: 1,
    podologo_id: 1,
    fecha_hora: '2024-12-20T10:00:00Z',
    duracion_minutos: 30,
    estado: 'confirmado',
    motivo: 'Seguimiento fascitis plantar',
    sala: 'Consultorio 1',
    created_by: 1,
    created_at: '2024-12-01T00:00:00Z'
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

let nextPacienteId = 5
let nextTratamientoId = 3
let nextEvolucionId = 3

export const pacientesServiceMock = {
  // Get all pacientes with filters
  getPacientes: async (filters?: PacienteFilters): Promise<Paciente[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered = [...mockPacientes]
    
    if (filters?.activo !== undefined) {
      filtered = filtered.filter(p => p.activo === filters.activo)
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.nombres.toLowerCase().includes(search) ||
        p.apellidos.toLowerCase().includes(search) ||
        p.telefono.includes(search) ||
        p.email?.toLowerCase().includes(search) ||
        p.documento_id?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  },

  // Get single paciente
  getPaciente: async (id: number): Promise<Paciente | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockPacientes.find(p => p.id_paciente === id) || null
  },

  // Create paciente
  createPaciente: async (data: PacienteCreateInput): Promise<Paciente> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newPaciente: Paciente = {
      id_paciente: nextPacienteId++,
      ...data,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockPacientes.push(newPaciente)
    return newPaciente
  },

  // Update paciente
  updatePaciente: async (id: number, data: PacienteUpdateInput): Promise<Paciente | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockPacientes.findIndex(p => p.id_paciente === id)
    if (index === -1) return null
    
    mockPacientes[index] = {
      ...mockPacientes[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    return mockPacientes[index]
  },

  // Delete paciente (soft delete)
  deletePaciente: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockPacientes.findIndex(p => p.id_paciente === id)
    if (index === -1) return false
    
    mockPacientes[index].activo = false
    mockPacientes[index].updated_at = new Date().toISOString()
    return true
  },

  // Get paciente historial (tratamientos + citas)
  getPacienteHistorial: async (id: number): Promise<PacienteHistorial | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const paciente = mockPacientes.find(p => p.id_paciente === id)
    if (!paciente) return null
    
    const tratamientos = mockTratamientos.filter(t => t.paciente_id === id)
    const citas = mockCitas.filter(c => c.paciente_id === id)
    
    return { paciente, tratamientos, citas }
  },

  // Get tratamientos for paciente
  getTratamientosByPaciente: async (pacienteId: number): Promise<Tratamiento[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return mockTratamientos
      .filter(t => t.paciente_id === pacienteId)
      .map(t => ({
        ...t,
        evoluciones: mockEvoluciones.filter(e => e.tratamiento_id === t.id_tratamiento)
      }))
  },

  // Create tratamiento
  createTratamiento: async (data: TratamientoCreateInput): Promise<Tratamiento> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newTratamiento: Tratamiento = {
      id_tratamiento: nextTratamientoId++,
      ...data,
      estado: data.estado || 'activo',
      activo: true,
      evoluciones: []
    }
    
    mockTratamientos.push(newTratamiento)
    return newTratamiento
  },

  // Update tratamiento
  updateTratamiento: async (id: number, data: TratamientoUpdateInput): Promise<Tratamiento | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockTratamientos.findIndex(t => t.id_tratamiento === id)
    if (index === -1) return null
    
    mockTratamientos[index] = {
      ...mockTratamientos[index],
      ...data
    }
    
    return mockTratamientos[index]
  },

  // Get evoluciones for tratamiento
  getEvolucionesByTratamiento: async (tratamientoId: number): Promise<Evolucion[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return mockEvoluciones
      .filter(e => e.tratamiento_id === tratamientoId)
      .map(e => ({
        ...e,
        podologo: mockPodologos.find(p => p.id_podologo === e.podologo_id)
      }))
  },

  // Create evolucion
  createEvolucion: async (data: EvolucionCreateInput): Promise<Evolucion> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newEvolucion: Evolucion = {
      id_evolucion: nextEvolucionId++,
      ...data,
      created_at: new Date().toISOString(),
      podologo: mockPodologos.find(p => p.id_podologo === data.podologo_id)
    }
    
    mockEvoluciones.push(newEvolucion)
    return newEvolucion
  },

  // Get podologos
  getPodologos: async (): Promise<Podologo[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockPodologos
  }
}
