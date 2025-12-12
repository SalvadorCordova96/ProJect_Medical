import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tratamiento, TratamientoEstado, Paciente, Evolucion } from '@/lib/types'
import { Plus, FirstAid, Note } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface TratamientosViewProps {
  tratamientos: Tratamiento[]
  pacientes: Paciente[]
  evoluciones: Evolucion[]
  onAddTratamiento: (tratamiento: Omit<Tratamiento, 'id_tratamiento' | 'activo'>) => void
  onUpdateTratamiento: (id: number, tratamiento: Partial<Tratamiento>) => void
  onAddEvolucion: (evolucion: Omit<Evolucion, 'id_evolucion' | 'created_at'>) => void
}

export function TratamientosView({ 
  tratamientos, 
  pacientes, 
  evoluciones,
  onAddTratamiento, 
  onUpdateTratamiento,
  onAddEvolucion 
}: TratamientosViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEvolucionDialogOpen, setIsEvolucionDialogOpen] = useState(false)
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null)
  const [formData, setFormData] = useState({
    paciente_id: 0,
    problema: '',
    fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
    fecha_fin: '',
    estado: 'activo' as TratamientoEstado,
    notas_adicionales: ''
  })

  const [evolucionFormData, setEvolucionFormData] = useState({
    tratamiento_id: 0,
    podologo_id: 1,
    fecha_visita: format(new Date(), 'yyyy-MM-dd'),
    nota: '',
    tipo_visita: 'control'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.paciente_id || !formData.problema) {
      toast.error('Por favor complete los campos obligatorios')
      return
    }

    onAddTratamiento(formData)
    toast.success('Tratamiento creado correctamente')
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEvolucionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!evolucionFormData.tratamiento_id || !evolucionFormData.nota) {
      toast.error('Por favor complete los campos obligatorios')
      return
    }

    onAddEvolucion(evolucionFormData)
    toast.success('Evolución registrada correctamente')
    setIsEvolucionDialogOpen(false)
    resetEvolucionForm()
  }

  const resetForm = () => {
    setFormData({
      paciente_id: 0,
      problema: '',
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      fecha_fin: '',
      estado: 'activo',
      notas_adicionales: ''
    })
  }

  const resetEvolucionForm = () => {
    setEvolucionFormData({
      tratamiento_id: 0,
      podologo_id: 1,
      fecha_visita: format(new Date(), 'yyyy-MM-dd'),
      nota: '',
      tipo_visita: 'control'
    })
  }

  const openEvolucionDialog = (tratamiento: Tratamiento) => {
    setEvolucionFormData({
      ...evolucionFormData,
      tratamiento_id: tratamiento.id_tratamiento
    })
    setSelectedTratamiento(tratamiento)
    setIsEvolucionDialogOpen(true)
  }

  const completarTratamiento = (tratamientoId: number) => {
    onUpdateTratamiento(tratamientoId, { 
      estado: 'completado',
      fecha_fin: format(new Date(), 'yyyy-MM-dd')
    })
    toast.success('Tratamiento marcado como completado')
  }

  const getEvolucionesPorTratamiento = (tratamientoId: number) => {
    return evoluciones.filter(e => e.tratamiento_id === tratamientoId)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tratamientos</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de tratamientos activos y completados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} weight="bold" />
              Nuevo Tratamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Tratamiento</DialogTitle>
              <DialogDescription>
                Registre un nuevo tratamiento para un paciente
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
                  <Label htmlFor="problema">Problema / Diagnóstico *</Label>
                  <Input
                    id="problema"
                    value={formData.problema}
                    onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                    placeholder="Ej: Fascitis plantar"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notas_adicionales">Notas Adicionales</Label>
                  <Textarea
                    id="notas_adicionales"
                    value={formData.notas_adicionales}
                    onChange={(e) => setFormData({ ...formData, notas_adicionales: e.target.value })}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Tratamiento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tratamientos Activos</CardTitle>
            <CardDescription>
              {tratamientos.filter(t => t.estado === 'activo').length} en curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tratamientos.filter(t => t.estado === 'activo').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FirstAid size={40} className="mx-auto mb-3 opacity-50" weight="duotone" />
                <p>No hay tratamientos activos</p>
              </div>
            ) : (
              tratamientos.filter(t => t.estado === 'activo').map(tratamiento => {
                const evolucionesTrat = getEvolucionesPorTratamiento(tratamiento.id_tratamiento)
                return (
                  <Card key={tratamiento.id_tratamiento} className="border-accent/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {tratamiento.problema}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {tratamiento.paciente?.nombres} {tratamiento.paciente?.apellidos}
                          </CardDescription>
                        </div>
                        <Badge variant="default">Activo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Inicio:</span>{' '}
                        {format(new Date(tratamiento.fecha_inicio), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                      {tratamiento.notas_adicionales && (
                        <div className="text-sm text-muted-foreground">
                          {tratamiento.notas_adicionales}
                        </div>
                      )}
                      <div className="text-sm font-medium">
                        {evolucionesTrat.length} evolución{evolucionesTrat.length !== 1 ? 'es' : ''} registrada{evolucionesTrat.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => openEvolucionDialog(tratamiento)}
                        >
                          <Note size={16} />
                          Agregar Evolución
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completarTratamiento(tratamiento.id_tratamiento)}
                        >
                          Completar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tratamientos Completados</CardTitle>
            <CardDescription>
              {tratamientos.filter(t => t.estado === 'completado').length} finalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tratamientos.filter(t => t.estado === 'completado').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FirstAid size={40} className="mx-auto mb-3 opacity-50" weight="duotone" />
                <p>No hay tratamientos completados</p>
              </div>
            ) : (
              tratamientos.filter(t => t.estado === 'completado').map(tratamiento => (
                <Card key={tratamiento.id_tratamiento}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {tratamiento.problema}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tratamiento.paciente?.nombres} {tratamiento.paciente?.apellidos}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Completado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">Inicio:</span>{' '}
                        {format(new Date(tratamiento.fecha_inicio), "d MMM yyyy", { locale: es })}
                      </div>
                      {tratamiento.fecha_fin && (
                        <div>
                          <span className="font-medium">Fin:</span>{' '}
                          {format(new Date(tratamiento.fecha_fin), "d MMM yyyy", { locale: es })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEvolucionDialogOpen} onOpenChange={(open) => {
        setIsEvolucionDialogOpen(open)
        if (!open) {
          resetEvolucionForm()
          setSelectedTratamiento(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Evolución</DialogTitle>
            <DialogDescription>
              Registre la evolución del tratamiento: {selectedTratamiento?.problema}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEvolucionSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_visita">Fecha de Visita *</Label>
                <Input
                  id="fecha_visita"
                  type="date"
                  value={evolucionFormData.fecha_visita}
                  onChange={(e) => setEvolucionFormData({ ...evolucionFormData, fecha_visita: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_visita">Tipo de Visita</Label>
                <select
                  id="tipo_visita"
                  value={evolucionFormData.tipo_visita}
                  onChange={(e) => setEvolucionFormData({ ...evolucionFormData, tipo_visita: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="primera_vez">Primera Vez</option>
                  <option value="control">Control</option>
                  <option value="urgencia">Urgencia</option>
                  <option value="seguimiento">Seguimiento</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nota">Nota de Evolución (SOAP) *</Label>
                <Textarea
                  id="nota"
                  value={evolucionFormData.nota}
                  onChange={(e) => setEvolucionFormData({ ...evolucionFormData, nota: e.target.value })}
                  placeholder="S (Subjetivo): Lo que el paciente reporta&#10;O (Objetivo): Hallazgos clínicos&#10;A (Análisis): Evaluación del estado&#10;P (Plan): Tratamiento y próximos pasos"
                  rows={10}
                  required
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEvolucionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Evolución
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
