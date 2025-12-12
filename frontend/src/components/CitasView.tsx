import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Cita, CitaEstado, Paciente, Podologo, Servicio } from '@/lib/types'
import { Plus, Calendar as CalendarIcon } from '@phosphor-icons/react'
import { format, addDays, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface CitasViewProps {
  citas: Cita[]
  pacientes: Paciente[]
  podologos: Podologo[]
  servicios: Servicio[]
  onAddCita: (cita: Omit<Cita, 'id_cita' | 'created_at' | 'created_by'>) => void
  onUpdateCita: (id: number, cita: Partial<Cita>) => void
}

export function CitasView({ citas, pacientes, podologos, servicios, onAddCita, onUpdateCita }: CitasViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    paciente_id: 0,
    podologo_id: 0,
    servicio_id: 0,
    fecha_hora: '',
    duracion_minutos: 30,
    estado: 'pendiente' as CitaEstado,
    motivo: '',
    sala: ''
  })

  const weekStart = startOfWeek(selectedDate, { locale: es })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const citasDelDia = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return citas.filter(c => format(new Date(c.fecha_hora), 'yyyy-MM-dd') === dateStr)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.paciente_id || !formData.podologo_id || !formData.fecha_hora) {
      toast.error('Por favor complete los campos obligatorios')
      return
    }

    onAddCita(formData)
    toast.success('Cita creada correctamente')
    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      paciente_id: 0,
      podologo_id: 0,
      servicio_id: 0,
      fecha_hora: '',
      duracion_minutos: 30,
      estado: 'pendiente',
      motivo: '',
      sala: ''
    })
  }

  const getEstadoColor = (estado: CitaEstado) => {
    const colors: Record<CitaEstado, string> = {
      pendiente: 'bg-secondary/20 border-secondary text-secondary-foreground',
      confirmado: 'bg-primary/20 border-primary text-primary',
      cancelado: 'bg-destructive/20 border-destructive text-destructive',
      completado: 'bg-success/20 border-success text-success'
    }
    return colors[estado] || colors.pendiente
  }

  const updateEstado = (citaId: number, nuevoEstado: CitaEstado) => {
    onUpdateCita(citaId, { estado: nuevoEstado })
    toast.success(`Cita marcada como ${nuevoEstado}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Citas</h1>
          <p className="text-muted-foreground mt-1">
            Gestión del calendario semanal
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} weight="bold" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva Cita</DialogTitle>
              <DialogDescription>
                Agende una nueva cita para un paciente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="paciente_id">Paciente *</Label>
                  <select
                    id="paciente_id"
                    value={formData.paciente_id}
                    onChange={(e) => setFormData({ ...formData, paciente_id: Number(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value={0}>Seleccione un paciente</option>
                    {pacientes.filter(p => p.activo).map(p => (
                      <option key={p.id_paciente} value={p.id_paciente}>
                        {p.nombres} {p.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podologo_id">Podólogo *</Label>
                  <select
                    id="podologo_id"
                    value={formData.podologo_id}
                    onChange={(e) => setFormData({ ...formData, podologo_id: Number(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value={0}>Seleccione un podólogo</option>
                    {podologos.filter(p => p.activo).map(p => (
                      <option key={p.id_podologo} value={p.id_podologo}>
                        {p.nombres} {p.apellidos} {p.especialidad ? `- ${p.especialidad}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicio_id">Servicio</Label>
                  <select
                    id="servicio_id"
                    value={formData.servicio_id}
                    onChange={(e) => {
                      const servicioId = Number(e.target.value)
                      const servicio = servicios.find(s => s.id_servicio === servicioId)
                      setFormData({ 
                        ...formData, 
                        servicio_id: servicioId,
                        duracion_minutos: servicio?.duracion_minutos || 30,
                        motivo: servicio?.nombre || ''
                      })
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={0}>Seleccione un servicio</option>
                    {servicios.filter(s => s.activo).map(s => (
                      <option key={s.id_servicio} value={s.id_servicio}>
                        {s.nombre} - {s.duracion_minutos} min - ${s.precio}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_hora">Fecha y Hora *</Label>
                    <Input
                      id="fecha_hora"
                      type="datetime-local"
                      value={formData.fecha_hora}
                      onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracion_minutos">Duración (min) *</Label>
                    <Input
                      id="duracion_minutos"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duracion_minutos}
                      onChange={(e) => setFormData({ ...formData, duracion_minutos: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sala">Sala</Label>
                  <Input
                    id="sala"
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    placeholder="Ej: Sala 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Motivo de la consulta"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Cita
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vista Semanal</CardTitle>
              <CardDescription>
                Semana del {format(weekStart, "d 'de' MMMM", { locale: es })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                ← Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoy
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const citasDia = citasDelDia(day)
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              
              return (
                <div 
                  key={idx} 
                  className={`border rounded-lg p-3 min-h-[200px] ${
                    isToday ? 'border-accent bg-accent/5' : 'border-border'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      {format(day, 'EEE', { locale: es })}
                    </div>
                    <div className={`text-xl font-bold ${isToday ? 'text-accent' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {citasDia.length === 0 ? (
                      <div className="text-xs text-center text-muted-foreground py-4">
                        Sin citas
                      </div>
                    ) : (
                      citasDia.map(cita => (
                        <div 
                          key={cita.id_cita}
                          className={`p-2 rounded border text-xs ${getEstadoColor(cita.estado)}`}
                        >
                          <div className="font-mono font-semibold">
                            {format(new Date(cita.fecha_hora), 'HH:mm')}
                          </div>
                          <div className="font-medium truncate mt-1">
                            {cita.paciente?.nombres} {cita.paciente?.apellidos}
                          </div>
                          {cita.servicio && (
                            <div className="text-[10px] opacity-70 mt-0.5 truncate">
                              {cita.servicio.nombre}
                            </div>
                          )}
                          <div className="text-[10px] opacity-80 mt-1">
                            Dr. {cita.podologo?.apellidos}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Citas</CardTitle>
          <CardDescription>Lista completa de citas programadas</CardDescription>
        </CardHeader>
        <CardContent>
          {citas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
              <p>No hay citas programadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {citas.slice(0, 10).map((cita) => (
                <div 
                  key={cita.id_cita} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-all"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium">
                        {format(new Date(cita.fecha_hora), "dd/MM/yyyy HH:mm")}
                      </span>
                      <span className="font-semibold">
                        {cita.paciente?.nombres} {cita.paciente?.apellidos}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dr. {cita.podologo?.nombres} {cita.podologo?.apellidos}
                      {cita.servicio && ` • ${cita.servicio.nombre}`}
                      {` • ${cita.duracion_minutos} min`}
                      {cita.sala && ` • Sala ${cita.sala}`}
                    </div>
                    {cita.motivo && !cita.servicio && (
                      <div className="text-xs text-muted-foreground">
                        {cita.motivo}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {cita.estado}
                    </Badge>
                    {cita.estado === 'pendiente' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateEstado(cita.id_cita, 'confirmado')}
                      >
                        Confirmar
                      </Button>
                    )}
                    {cita.estado === 'confirmado' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateEstado(cita.id_cita, 'completado')}
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
