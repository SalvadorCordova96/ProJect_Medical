import { AgendaView } from '@/components/AgendaView'
import { useKV } from '@github/spark/hooks'
import { Cita, Paciente, Podologo, Servicio } from '@/lib/types'

export function AgendaRoute() {
  const [citas, setCitas] = useKV<Cita[]>('citas', [])
  const [pacientes] = useKV<Paciente[]>('pacientes', [])
  const [podologos] = useKV<Podologo[]>('podologos', [])
  const [servicios] = useKV<Servicio[]>('servicios', [])

  const handleAddCita = (nuevaCita: Omit<Cita, 'id_cita' | 'created_at' | 'created_by'>) => {
    const cita: Cita = {
      ...nuevaCita,
      id_cita: Date.now(),
      created_at: new Date().toISOString(),
      created_by: 1
    }
    setCitas((currentCitas) => [...(currentCitas || []), cita])
  }

  const handleUpdateCita = (id: number, updates: Partial<Cita>) => {
    setCitas((currentCitas) =>
      (currentCitas || []).map(cita =>
        cita.id_cita === id ? { ...cita, ...updates } : cita
      )
    )
  }

  return (
    <AgendaView
      citas={citas || []}
      pacientes={pacientes || []}
      podologos={podologos || []}
      servicios={servicios || []}
      onAddCita={handleAddCita}
      onUpdateCita={handleUpdateCita}
    />
  )
}
