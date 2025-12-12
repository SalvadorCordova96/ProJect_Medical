import { HistorialPacientesView } from '@/components/HistorialPacientesView'
import { useKV } from '@github/spark/hooks'
import { Paciente, Tratamiento, Evolucion, Cita, Evidencia, Servicio, Podologo } from '@/lib/types'

export function HistorialPacientesRoute() {
  const [pacientes, setPacientes] = useKV<Paciente[]>('pacientes', [])
  const [tratamientos, setTratamientos] = useKV<Tratamiento[]>('tratamientos', [])
  const [evoluciones, setEvoluciones] = useKV<Evolucion[]>('evoluciones', [])
  const [citas] = useKV<Cita[]>('citas', [])
  const [evidencias, setEvidencias] = useKV<Evidencia[]>('evidencias', [])
  const [servicios] = useKV<Servicio[]>('servicios', [])
  const [podologos] = useKV<Podologo[]>('podologos', [])

  const handleAddPaciente = (nuevoPaciente: Omit<Paciente, 'id_paciente' | 'created_at' | 'updated_at'>) => {
    const paciente: Paciente = {
      ...nuevoPaciente,
      id_paciente: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setPacientes((currentPacientes) => [...currentPacientes, paciente])
  }

  const handleEditPaciente = (id: number, updates: Partial<Paciente>) => {
    setPacientes((currentPacientes) =>
      currentPacientes.map(paciente =>
        paciente.id_paciente === id
          ? { ...paciente, ...updates, updated_at: new Date().toISOString() }
          : paciente
      )
    )
  }

  const handleDeletePaciente = (id: number) => {
    setPacientes((currentPacientes) =>
      currentPacientes.map(paciente =>
        paciente.id_paciente === id ? { ...paciente, activo: false } : paciente
      )
    )
  }

  const handleAddTratamiento = (nuevoTratamiento: Omit<Tratamiento, 'id_tratamiento' | 'created_at'>) => {
    const tratamiento: Tratamiento = {
      ...nuevoTratamiento,
      id_tratamiento: Date.now(),
      created_at: new Date().toISOString()
    }
    setTratamientos((currentTratamientos) => [...currentTratamientos, tratamiento])
  }

  const handleEditTratamiento = (id: number, updates: Partial<Tratamiento>) => {
    setTratamientos((currentTratamientos) =>
      currentTratamientos.map(tratamiento =>
        tratamiento.id_tratamiento === id ? { ...tratamiento, ...updates } : tratamiento
      )
    )
  }

  const handleAddEvolucion = (nuevaEvolucion: Omit<Evolucion, 'id_evolucion' | 'created_at'>) => {
    const evolucion: Evolucion = {
      ...nuevaEvolucion,
      id_evolucion: Date.now(),
      created_at: new Date().toISOString()
    }
    setEvoluciones((currentEvoluciones) => [...currentEvoluciones, evolucion])
  }

  const handleAddEvidencia = (nuevaEvidencia: Omit<Evidencia, 'id_evidencia' | 'created_at'>) => {
    const evidencia: Evidencia = {
      ...nuevaEvidencia,
      id_evidencia: Date.now(),
      created_at: new Date().toISOString()
    }
    setEvidencias((currentEvidencias) => [...currentEvidencias, evidencia])
  }

  return (
    <HistorialPacientesView
      pacientes={pacientes}
      tratamientos={tratamientos}
      evoluciones={evoluciones}
      citas={citas}
      evidencias={evidencias}
      servicios={servicios}
      podologos={podologos}
      onAddPaciente={handleAddPaciente}
      onEditPaciente={handleEditPaciente}
      onDeletePaciente={handleDeletePaciente}
      onAddTratamiento={handleAddTratamiento}
      onEditTratamiento={handleEditTratamiento}
      onAddEvolucion={handleAddEvolucion}
      onAddEvidencia={handleAddEvidencia}
    />
  )
}
