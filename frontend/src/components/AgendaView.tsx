import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Cita, Paciente, Podologo, Servicio, CitaEstado } from '@/lib/types'
import { Plus, CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AgendaViewProps {
  citas: Cita[]
  pacientes: Paciente[]
  podologos: Podologo[]
  servicios: Servicio[]
  onAddCita: (cita: Omit<Cita, 'id_cita' | 'created_at' | 'created_by'>) => void
  onUpdateCita: (id: number, updates: Partial<Cita>) => void
}

export function AgendaView({ 
  citas, 
  pacientes, 
  podologos, 
  servicios, 
  onAddCita, 
  onUpdateCita 
}: AgendaViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [draggedCita, setDraggedCita] = useState<Cita | null>(null)

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

  const hoursOfDay = Array.from({ length: 12 }, (_, i) => i + 8)

  const getWeekDates = (date: Date) => {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
  }

  const weekDates = getWeekDates(currentDate)

  const getCitasForSlot = (dayDate: Date, hour: number) => {
    return citas.filter(cita => {
      const citaDate = new Date(cita.fecha_hora)
      return (
        citaDate.getDate() === dayDate.getDate() &&
        citaDate.getMonth() === dayDate.getMonth() &&
        citaDate.getFullYear() === dayDate.getFullYear() &&
        citaDate.getHours() === hour
      )
    })
  }

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateCita = () => {
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
    setIsCreateMode(true)
  }

  const handleEditCita = (cita: Cita) => {
    setSelectedCita(cita)
    setFormData({
      paciente_id: cita.paciente_id,
      podologo_id: cita.podologo_id,
      servicio_id: cita.servicio_id || 0,
      fecha_hora: cita.fecha_hora,
      duracion_minutos: cita.duracion_minutos,
      estado: cita.estado,
      motivo: cita.motivo || '',
      sala: cita.sala || ''
    })
    setIsEditMode(true)
  }

  const handleSaveCita = () => {
    if (isEditMode && selectedCita) {
      onUpdateCita(selectedCita.id_cita, formData)
      toast.success('Cita actualizada exitosamente')
      setIsEditMode(false)
      setSelectedCita(null)
    } else if (isCreateMode) {
      if (!formData.paciente_id || !formData.podologo_id || !formData.fecha_hora) {
        toast.error('Complete todos los campos requeridos')
        return
      }
      onAddCita(formData)
      toast.success('Cita creada exitosamente')
      setIsCreateMode(false)
    }
  }

  const handleCancelCita = (cita: Cita) => {
    onUpdateCita(cita.id_cita, { estado: 'cancelado' })
    toast.success('Cita cancelada')
    setIsEditMode(false)
  }

  const handleDragStart = (cita: Cita) => {
    setDraggedCita(cita)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dayDate: Date, hour: number) => {
    if (!draggedCita) return

    const newDate = new Date(dayDate)
    newDate.setHours(hour, 0, 0, 0)

    onUpdateCita(draggedCita.id_cita, {
      fecha_hora: newDate.toISOString()
    })
    toast.success('Cita reagendada')
    setDraggedCita(null)
  }

  const getEstadoBadge = (estado: CitaEstado) => {
    const variants: Record<CitaEstado, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pendiente: { variant: 'secondary', label: 'Pendiente' },
      confirmado: { variant: 'default', label: 'Confirmado' },
      cancelado: { variant: 'destructive', label: 'Cancelado' },
      completado: { variant: 'outline', label: 'Completado' }
    }
    const config = variants[estado]
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
            <p className="text-sm text-muted-foreground">Gestión de citas y horarios</p>
          </div>
          <Button onClick={handleCreateCita}>
            <Plus size={20} />
            Nueva Cita
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <CaretLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <CaretRight size={16} />
            </Button>
          </div>
          <p className="text-sm font-medium">
            {weekDates[0].toLocaleDateString('es', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-2 text-xs font-medium text-muted-foreground border-r border-border">
              Hora
            </div>
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={cn(
                  'p-2 text-center border-r border-border last:border-r-0',
                  date.toDateString() === new Date().toDateString() && 'bg-primary/5'
                )}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {date.toLocaleDateString('es', { weekday: 'short' })}
                </div>
                <div className={cn(
                  'text-sm font-semibold',
                  date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-foreground'
                )}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {hoursOfDay.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                <div className="p-2 text-xs font-medium text-muted-foreground border-r border-border">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDates.map((dayDate, i) => {
                  const citasInSlot = getCitasForSlot(dayDate, hour)
                  return (
                    <div
                      key={i}
                      className="min-h-[80px] p-1 border-r border-border last:border-r-0 bg-background hover:bg-muted/20 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(dayDate, hour)}
                    >
                      <div className="space-y-1">
                        {citasInSlot.map((cita) => (
                          <Card
                            key={cita.id_cita}
                            draggable
                            onDragStart={() => handleDragStart(cita)}
                            onClick={() => handleEditCita(cita)}
                            className={cn(
                              'p-2 cursor-move hover:shadow-md transition-shadow',
                              cita.estado === 'cancelado' && 'opacity-50',
                              cita.estado === 'completado' && 'bg-success/10 border-success',
                              cita.estado === 'confirmado' && 'bg-primary/10 border-primary',
                              draggedCita?.id_cita === cita.id_cita && 'opacity-50'
                            )}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {cita.paciente?.nombres} {cita.paciente?.apellidos}
                                </p>
                                {getEstadoBadge(cita.estado)}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {cita.podologo?.nombres}
                              </p>
                              {cita.servicio && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {cita.servicio.nombre}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isEditMode || isCreateMode} onOpenChange={(open) => {
        if (!open) {
          setIsEditMode(false)
          setIsCreateMode(false)
          setSelectedCita(null)
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paciente">Paciente *</Label>
              <Select
                value={formData.paciente_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, paciente_id: parseInt(value) })}
              >
                <SelectTrigger id="paciente">
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id_paciente} value={p.id_paciente.toString()}>
                      {p.nombres} {p.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="podologo">Podólogo *</Label>
              <Select
                value={formData.podologo_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, podologo_id: parseInt(value) })}
              >
                <SelectTrigger id="podologo">
                  <SelectValue placeholder="Seleccionar podólogo" />
                </SelectTrigger>
                <SelectContent>
                  {podologos.map((p) => (
                    <SelectItem key={p.id_podologo} value={p.id_podologo.toString()}>
                      {p.nombres} {p.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="servicio">Servicio</Label>
              <Select
                value={formData.servicio_id.toString()}
                onValueChange={(value) => {
                  const servicioId = parseInt(value)
                  const servicio = servicios.find(s => s.id_servicio === servicioId)
                  setFormData({ 
                    ...formData, 
                    servicio_id: servicioId,
                    duracion_minutos: servicio?.duracion_minutos || formData.duracion_minutos
                  })
                }}
              >
                <SelectTrigger id="servicio">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((s) => (
                    <SelectItem key={s.id_servicio} value={s.id_servicio.toString()}>
                      {s.nombre} - ${s.precio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_hora">Fecha y Hora *</Label>
                <Input
                  id="fecha_hora"
                  type="datetime-local"
                  value={formData.fecha_hora.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, fecha_hora: new Date(e.target.value).toISOString() })}
                />
              </div>
              <div>
                <Label htmlFor="duracion">Duración (min)</Label>
                <Input
                  id="duracion"
                  type="number"
                  value={formData.duracion_minutos}
                  onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {isEditMode && (
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value as CitaEstado })}
                >
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                value={formData.sala}
                onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                placeholder="Ej: Consultorio 1"
              />
            </div>

            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Motivo de la consulta..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              {isEditMode && selectedCita && selectedCita.estado !== 'cancelado' && (
                <Button
                  variant="destructive"
                  onClick={() => handleCancelCita(selectedCita)}
                >
                  <X size={16} />
                  Cancelar Cita
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                setIsEditMode(false)
                setIsCreateMode(false)
              }}>
                Cerrar
              </Button>
              <Button onClick={handleSaveCita}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
