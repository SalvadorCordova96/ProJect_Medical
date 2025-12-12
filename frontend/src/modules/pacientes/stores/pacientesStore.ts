import { create } from 'zustand'
import { 
  Paciente, 
  PacienteCreateInput, 
  PacienteUpdateInput, 
  PacienteFilters,
  Tratamiento,
  TratamientoCreateInput,
  TratamientoUpdateInput,
  Evolucion,
  EvolucionCreateInput,
  Podologo
} from '../types/pacientes.types'
import { pacientesService } from '../services/pacientesService'

interface PacientesStore {
  // State
  pacientes: Paciente[]
  selectedPaciente: Paciente | null
  tratamientos: Tratamiento[]
  evoluciones: Evolucion[]
  podologos: Podologo[]
  isLoading: boolean
  error: string | null
  filters: PacienteFilters

  // Actions
  fetchPacientes: (filters?: PacienteFilters) => Promise<void>
  fetchPaciente: (id: number) => Promise<void>
  createPaciente: (data: PacienteCreateInput) => Promise<Paciente | null>
  updatePaciente: (id: number, data: PacienteUpdateInput) => Promise<Paciente | null>
  deletePaciente: (id: number) => Promise<boolean>
  fetchTratamientos: (pacienteId: number) => Promise<void>
  createTratamiento: (data: TratamientoCreateInput) => Promise<Tratamiento | null>
  updateTratamiento: (id: number, data: TratamientoUpdateInput) => Promise<Tratamiento | null>
  fetchEvoluciones: (tratamientoId: number) => Promise<void>
  createEvolucion: (data: EvolucionCreateInput) => Promise<Evolucion | null>
  fetchPodologos: () => Promise<void>
  setSelectedPaciente: (paciente: Paciente | null) => void
  setFilters: (filters: PacienteFilters) => void
  clearError: () => void
}

export const usePacientesStore = create<PacientesStore>((set, get) => ({
  // Initial state
  pacientes: [],
  selectedPaciente: null,
  tratamientos: [],
  evoluciones: [],
  podologos: [],
  isLoading: false,
  error: null,
  filters: {},

  // Fetch all pacientes
  fetchPacientes: async (filters?: PacienteFilters) => {
    set({ isLoading: true, error: null })
    try {
      const pacientes = await pacientesService.getPacientes(filters)
      set({ pacientes, filters: filters || {}, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar pacientes',
        isLoading: false 
      })
    }
  },

  // Fetch single paciente
  fetchPaciente: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const paciente = await pacientesService.getPaciente(id)
      set({ selectedPaciente: paciente, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar paciente',
        isLoading: false 
      })
    }
  },

  // Create new paciente
  createPaciente: async (data: PacienteCreateInput) => {
    set({ isLoading: true, error: null })
    try {
      const newPaciente = await pacientesService.createPaciente(data)
      set(state => ({ 
        pacientes: [...state.pacientes, newPaciente],
        isLoading: false 
      }))
      return newPaciente
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear paciente',
        isLoading: false 
      })
      return null
    }
  },

  // Update existing paciente
  updatePaciente: async (id: number, data: PacienteUpdateInput) => {
    set({ isLoading: true, error: null })
    try {
      const updatedPaciente = await pacientesService.updatePaciente(id, data)
      if (updatedPaciente) {
        set(state => ({
          pacientes: state.pacientes.map(p => p.id_paciente === id ? updatedPaciente : p),
          selectedPaciente: state.selectedPaciente?.id_paciente === id ? updatedPaciente : state.selectedPaciente,
          isLoading: false
        }))
      } else {
        set({ isLoading: false })
      }
      return updatedPaciente
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar paciente',
        isLoading: false 
      })
      return null
    }
  },

  // Delete paciente
  deletePaciente: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const success = await pacientesService.deletePaciente(id)
      if (success) {
        set(state => ({
          pacientes: state.pacientes.filter(p => p.id_paciente !== id),
          selectedPaciente: state.selectedPaciente?.id_paciente === id ? null : state.selectedPaciente,
          isLoading: false
        }))
      } else {
        set({ isLoading: false })
      }
      return success
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar paciente',
        isLoading: false 
      })
      return false
    }
  },

  // Fetch tratamientos for paciente
  fetchTratamientos: async (pacienteId: number) => {
    set({ isLoading: true, error: null })
    try {
      const tratamientos = await pacientesService.getTratamientosByPaciente(pacienteId)
      set({ tratamientos, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tratamientos',
        isLoading: false 
      })
    }
  },

  // Create tratamiento
  createTratamiento: async (data: TratamientoCreateInput) => {
    set({ isLoading: true, error: null })
    try {
      const newTratamiento = await pacientesService.createTratamiento(data)
      set(state => ({
        tratamientos: [...state.tratamientos, newTratamiento],
        isLoading: false
      }))
      return newTratamiento
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear tratamiento',
        isLoading: false 
      })
      return null
    }
  },

  // Update tratamiento
  updateTratamiento: async (id: number, data: TratamientoUpdateInput) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTratamiento = await pacientesService.updateTratamiento(id, data)
      if (updatedTratamiento) {
        set(state => ({
          tratamientos: state.tratamientos.map(t => t.id_tratamiento === id ? updatedTratamiento : t),
          isLoading: false
        }))
      } else {
        set({ isLoading: false })
      }
      return updatedTratamiento
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar tratamiento',
        isLoading: false 
      })
      return null
    }
  },

  // Fetch evoluciones for tratamiento
  fetchEvoluciones: async (tratamientoId: number) => {
    set({ isLoading: true, error: null })
    try {
      const evoluciones = await pacientesService.getEvolucionesByTratamiento(tratamientoId)
      set({ evoluciones, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar evoluciones',
        isLoading: false 
      })
    }
  },

  // Create evolucion
  createEvolucion: async (data: EvolucionCreateInput) => {
    set({ isLoading: true, error: null })
    try {
      const newEvolucion = await pacientesService.createEvolucion(data)
      set(state => ({
        evoluciones: [...state.evoluciones, newEvolucion],
        isLoading: false
      }))
      return newEvolucion
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear evolución',
        isLoading: false 
      })
      return null
    }
  },

  // Fetch podologos
  fetchPodologos: async () => {
    try {
      const podologos = await pacientesService.getPodologos()
      set({ podologos })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Error al cargar podólogos' })
    }
  },

  // Set selected paciente
  setSelectedPaciente: (paciente: Paciente | null) => {
    set({ selectedPaciente: paciente })
  },

  // Set filters
  setFilters: (filters: PacienteFilters) => {
    set({ filters })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
