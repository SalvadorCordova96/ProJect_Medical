import { create } from 'zustand'
import { Cita, CitaCreateInput, CitaUpdateInput, CitaFilters } from '../types/agenda.types'
import { Paciente, Podologo, Servicio } from '@/lib/types'
import { agendaService } from '../services/agendaService'

interface AgendaStore {
  // State
  citas: Cita[]
  pacientes: Paciente[]
  podologos: Podologo[]
  servicios: Servicio[]
  selectedCita: Cita | null
  isLoading: boolean
  error: string | null
  filters: CitaFilters

  // Actions
  fetchCitas: (filters?: CitaFilters) => Promise<void>
  fetchCalendarView: (startDate: string, endDate: string, view?: 'week' | 'day' | 'month') => Promise<void>
  fetchCita: (id: number) => Promise<void>
  createCita: (data: CitaCreateInput) => Promise<Cita | null>
  updateCita: (id: number, data: CitaUpdateInput) => Promise<Cita | null>
  deleteCita: (id: number) => Promise<boolean>
  rescheduleCita: (id: number, newDateTime: string) => Promise<Cita | null>
  fetchPacientes: () => Promise<void>
  fetchPodologos: () => Promise<void>
  fetchServicios: () => Promise<void>
  setSelectedCita: (cita: Cita | null) => void
  setFilters: (filters: CitaFilters) => void
  clearError: () => void
}

export const useAgendaStore = create<AgendaStore>((set, get) => ({
  // Initial state
  citas: [],
  pacientes: [],
  podologos: [],
  servicios: [],
  selectedCita: null,
  isLoading: false,
  error: null,
  filters: {},

  // Fetch all citas with filters
  fetchCitas: async (filters?: CitaFilters) => {
    set({ isLoading: true, error: null })
    try {
      const citas = await agendaService.getCitas(filters)
      set({ citas, filters: filters || {}, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar citas',
        isLoading: false 
      })
    }
  },

  // Fetch calendar view
  fetchCalendarView: async (startDate: string, endDate: string, view: 'week' | 'day' | 'month' = 'week') => {
    set({ isLoading: true, error: null })
    try {
      const citas = await agendaService.getCalendarView(startDate, endDate, view)
      set({ citas, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar calendario',
        isLoading: false 
      })
    }
  },

  // Fetch single cita
  fetchCita: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const cita = await agendaService.getCita(id)
      set({ selectedCita: cita, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar cita',
        isLoading: false 
      })
    }
  },

  // Create new cita
  createCita: async (data: CitaCreateInput) => {
    set({ isLoading: true, error: null })
    try {
      const newCita = await agendaService.createCita(data)
      set(state => ({ 
        citas: [...state.citas, newCita],
        isLoading: false 
      }))
      return newCita
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear cita',
        isLoading: false 
      })
      return null
    }
  },

  // Update existing cita
  updateCita: async (id: number, data: CitaUpdateInput) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCita = await agendaService.updateCita(id, data)
      if (updatedCita) {
        set(state => ({
          citas: state.citas.map(c => c.id_cita === id ? updatedCita : c),
          selectedCita: state.selectedCita?.id_cita === id ? updatedCita : state.selectedCita,
          isLoading: false
        }))
      } else {
        set({ isLoading: false })
      }
      return updatedCita
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar cita',
        isLoading: false 
      })
      return null
    }
  },

  // Delete/Cancel cita
  deleteCita: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const success = await agendaService.deleteCita(id)
      if (success) {
        set(state => ({
          citas: state.citas.filter(c => c.id_cita !== id),
          selectedCita: state.selectedCita?.id_cita === id ? null : state.selectedCita,
          isLoading: false
        }))
      } else {
        set({ isLoading: false })
      }
      return success
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar cita',
        isLoading: false 
      })
      return false
    }
  },

  // Reschedule cita
  rescheduleCita: async (id: number, newDateTime: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCita = await agendaService.rescheduleCita(id, newDateTime)
      if (updatedCita) {
        set(state => ({
          citas: state.citas.map(c => c.id_cita === id ? updatedCita : c),
          selectedCita: state.selectedCita?.id_cita === id ? updatedCita : state.selectedCita,
          isLoading: false
        }))
      } else {
        set({ isLoading: false })
      }
      return updatedCita
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al reagendar cita',
        isLoading: false 
      })
      return null
    }
  },

  // Fetch pacientes
  fetchPacientes: async () => {
    try {
      const pacientes = await agendaService.getPacientes()
      set({ pacientes })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Error al cargar pacientes' })
    }
  },

  // Fetch podologos
  fetchPodologos: async () => {
    try {
      const podologos = await agendaService.getPodologos()
      set({ podologos })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Error al cargar podólogos' })
    }
  },

  // Fetch servicios
  fetchServicios: async () => {
    try {
      const servicios = await agendaService.getServicios()
      set({ servicios })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Error al cargar servicios' })
    }
  },

  // Set selected cita
  setSelectedCita: (cita: Cita | null) => {
    set({ selectedCita: cita })
  },

  // Set filters
  setFilters: (filters: CitaFilters) => {
    set({ filters })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
