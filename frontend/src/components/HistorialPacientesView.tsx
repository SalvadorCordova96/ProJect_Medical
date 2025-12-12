import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Paciente, Tratamiento, Evolucion, Cita, TratamientoEstado, Podologo } from '@/lib/types'
import { MagnifyingGlass, Plus, User, Phone, EnvelopeSimple, MapPin, IdentificationCard, CalendarBlank } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface HistorialPacientesViewProps {
  pacientes: Paciente[]
  tratamientos: Tratamiento[]
  evoluciones: Evolucion[]
  citas: Cita[]
  onAddPaciente: (paciente: Omit<Paciente, 'id_paciente' | 'created_at' | 'updated_at' | 'activo'>) => void
  onEditPaciente: (id: number, updates: Partial<Paciente>) => void
  onAddTratamiento: (tratamiento: Omit<Tratamiento, 'id_tratamiento' | 'activo'>) => void
  onUpdateTratamiento: (id: number, updates: Partial<Tratamiento>) => void
  onAddEvolucion: (evolucion: Omit<Evolucion, 'id_evolucion' | 'created_at'>) => void
  podologos: any[]
}

export function HistorialPacientesView({
  pacientes,
  tratamientos,
  evoluciones,
  citas,
  onAddPaciente,
  onEditPaciente,
  onAddTratamiento,
  onUpdateTratamiento,
  onAddEvolucion,
  podologos
}: HistorialPacientesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showTratamientoModal, setShowTratamientoModal] = useState(false)
  const [showEvolucionModal, setShowEvolucionModal] = useState(false)
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null)

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    domicilio: '',
    documento_id: ''
  })

  const [tratamientoForm, setTratamientoForm] = useState({
    problema: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo' as TratamientoEstado,
    notas_adicionales: ''
  })

  const [evolucionForm, setEvolucionForm] = useState({
    podologo_id: 0,
    fecha_visita: '',
    nota: '',
    tipo_visita: '',
    signos_vitales: ''
  })

  const filteredPacientes = pacientes.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      p.nombres.toLowerCase().includes(term) ||
      p.apellidos.toLowerCase().includes(term) ||
      p.documento_id?.toLowerCase().includes(term) ||
      p.telefono.includes(term)
    )
  })

  const handleViewPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
  }

  const handleCreatePaciente = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      sexo: '',
      telefono: '',
      email: '',
      domicilio: '',
      documento_id: ''
    })
    setIsCreateMode(true)
  }

  const handleEditPaciente = (paciente: Paciente) => {
    setFormData({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      fecha_nacimiento: paciente.fecha_nacimiento,
      sexo: paciente.sexo,
      telefono: paciente.telefono,
      email: paciente.email || '',
      domicilio: paciente.domicilio || '',
      documento_id: paciente.documento_id || ''
    })
    setSelectedPaciente(paciente)
    setIsEditMode(true)
  }

  const handleSavePaciente = () => {
    if (!formData.nombres || !formData.apellidos || !formData.fecha_nacimiento || !formData.sexo || !formData.telefono) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    if (isEditMode && selectedPaciente) {
      onEditPaciente(selectedPaciente.id_paciente, formData)
      toast.success('Paciente actualizado exitosamente')
      setIsEditMode(false)
      setSelectedPaciente(null)
    } else if (isCreateMode) {
      onAddPaciente(formData)
      toast.success('Paciente creado exitosamente')
      setIsCreateMode(false)
    }
  }

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const getPacienteTratamientos = (pacienteId: number) => {
    return tratamientos.filter(t => t.paciente_id === pacienteId)
  }

  const getPacienteCitas = (pacienteId: number) => {
    return citas.filter(c => c.paciente_id === pacienteId)
  }

  const getTratamientoEvoluciones = (tratamientoId: number) => {
    return evoluciones.filter(e => e.tratamiento_id === tratamientoId)
  }

  const handleCreateTratamiento = () => {
    if (!selectedPaciente) return
    setTratamientoForm({
      problema: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      estado: 'activo',
      notas_adicionales: ''
    })
    setShowTratamientoModal(true)
  }

  const handleSaveTratamiento = () => {
    if (!selectedPaciente || !tratamientoForm.problema || !tratamientoForm.fecha_inicio) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    onAddTratamiento({
      paciente_id: selectedPaciente.id_paciente,
      problema: tratamientoForm.problema,
      fecha_inicio: tratamientoForm.fecha_inicio,
      fecha_fin: tratamientoForm.fecha_fin || undefined,
      estado: tratamientoForm.estado,
      notas_adicionales: tratamientoForm.notas_adicionales || undefined
    })

    toast.success('Tratamiento creado exitosamente')
    setShowTratamientoModal(false)
  }

  const handleCreateEvolucion = (tratamiento: Tratamiento) => {
    setSelectedTratamiento(tratamiento)
    setEvolucionForm({
      podologo_id: 0,
      fecha_visita: new Date().toISOString().split('T')[0],
      nota: '',
      tipo_visita: '',
      signos_vitales: ''
    })
    setShowEvolucionModal(true)
  }

  const handleSaveEvolucion = () => {
    if (!selectedTratamiento || !evolucionForm.podologo_id || !evolucionForm.fecha_visita || !evolucionForm.nota) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    const signosVitales = evolucionForm.signos_vitales ? JSON.parse(evolucionForm.signos_vitales) : undefined

    onAddEvolucion({
      tratamiento_id: selectedTratamiento.id_tratamiento,
      podologo_id: evolucionForm.podologo_id,
      fecha_visita: evolucionForm.fecha_visita,
      nota: evolucionForm.nota,
      tipo_visita: evolucionForm.tipo_visita || undefined,
      signos_vitales: signosVitales
    })

    toast.success('Evolución registrada exitosamente')
    setShowEvolucionModal(false)
    setSelectedTratamiento(null)
  }

  const handleUpdateTratamientoEstado = (tratamientoId: number, estado: TratamientoEstado) => {
    onUpdateTratamiento(tratamientoId, { 
      estado,
      fecha_fin: estado === 'completado' ? new Date().toISOString().split('T')[0] : undefined
    })
    toast.success(`Tratamiento marcado como ${estado}`)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historial de Pacientes</h1>
            <p className="text-sm text-muted-foreground">Base de datos completa de pacientes y su historial clínico</p>
          </div>
          <Button onClick={handleCreatePaciente}>
            <Plus size={20} />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-3 gap-6 h-full">
          <div className="col-span-1 space-y-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, documento o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card className="h-[calc(100vh-240px)] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pacientes ({filteredPacientes.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto h-[calc(100%-60px)]">
                  {filteredPacientes.map((paciente) => (
                    <div
                      key={paciente.id_paciente}
                      onClick={() => handleViewPaciente(paciente)}
                      className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {paciente.nombres} {paciente.apellidos}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {paciente.documento_id || 'Sin documento'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {calcularEdad(paciente.fecha_nacimiento)} años • {paciente.sexo}
                          </p>
                        </div>
                        {paciente.activo && (
                          <Badge variant="outline" className="text-xs">Activo</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2">
            {selectedPaciente ? (
              <Card className="h-full overflow-hidden">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedPaciente.nombres} {selectedPaciente.apellidos}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {calcularEdad(selectedPaciente.fecha_nacimiento)} años • {selectedPaciente.sexo}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleEditPaciente(selectedPaciente)}>
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[calc(100%-90px)]">
                  <Tabs defaultValue="datos">
                    <TabsList className="mb-4">
                      <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                      <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
                      <TabsTrigger value="citas">Citas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="datos" className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User size={16} />
                            <span>Nombres</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedPaciente.nombres}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User size={16} />
                            <span>Apellidos</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedPaciente.apellidos}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarBlank size={16} />
                            <span>Fecha de Nacimiento</span>
                          </div>
                          <p className="text-foreground font-medium">
                            {new Date(selectedPaciente.fecha_nacimiento).toLocaleDateString('es')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IdentificationCard size={16} />
                            <span>Documento</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedPaciente.documento_id || 'No registrado'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone size={16} />
                            <span>Teléfono</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedPaciente.telefono}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <EnvelopeSimple size={16} />
                            <span>Email</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedPaciente.email || 'No registrado'}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={16} />
                          <span>Domicilio</span>
                        </div>
                        <p className="text-foreground font-medium">{selectedPaciente.domicilio || 'No registrado'}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="tratamientos" className="space-y-4">
                      <div className="flex justify-end mb-4">
                        <Button onClick={handleCreateTratamiento} size="sm">
                          <Plus size={16} />
                          Nuevo Tratamiento
                        </Button>
                      </div>
                      {getPacienteTratamientos(selectedPaciente.id_paciente).length > 0 ? (
                        getPacienteTratamientos(selectedPaciente.id_paciente).map((tratamiento) => (
                          <Card key={tratamiento.id_tratamiento}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{tratamiento.problema}</CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant={tratamiento.estado === 'activo' ? 'default' : 'secondary'}>
                                    {tratamiento.estado}
                                  </Badge>
                                  {tratamiento.estado === 'activo' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleUpdateTratamientoEstado(tratamiento.id_tratamiento, 'completado')}
                                    >
                                      Completar
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Inicio: {new Date(tratamiento.fecha_inicio).toLocaleDateString('es')}
                                {tratamiento.fecha_fin && ` • Fin: ${new Date(tratamiento.fecha_fin).toLocaleDateString('es')}`}
                              </p>
                            </CardHeader>
                            <CardContent>
                              {tratamiento.notas_adicionales && (
                                <p className="text-sm text-muted-foreground mb-4">{tratamiento.notas_adicionales}</p>
                              )}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    Evoluciones ({getTratamientoEvoluciones(tratamiento.id_tratamiento).length})
                                  </p>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleCreateEvolucion(tratamiento)}
                                  >
                                    <Plus size={16} />
                                    Agregar Evolución
                                  </Button>
                                </div>
                                {getTratamientoEvoluciones(tratamiento.id_tratamiento).map((evolucion) => (
                                  <div key={evolucion.id_evolucion} className="p-3 bg-muted rounded-md">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-medium">
                                        {evolucion.podologo?.nombres} {evolucion.podologo?.apellidos}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(evolucion.fecha_visita).toLocaleDateString('es')}
                                      </p>
                                    </div>
                                    {evolucion.tipo_visita && (
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Tipo: {evolucion.tipo_visita}
                                      </p>
                                    )}
                                    <p className="text-sm text-foreground">{evolucion.nota}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No hay tratamientos registrados</p>
                          <Button onClick={handleCreateTratamiento} size="sm" className="mt-4">
                            <Plus size={16} />
                            Crear Primer Tratamiento
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="citas" className="space-y-4">
                      {getPacienteCitas(selectedPaciente.id_paciente).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Podólogo</TableHead>
                              <TableHead>Servicio</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPacienteCitas(selectedPaciente.id_paciente)
                              .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
                              .map((cita) => (
                                <TableRow key={cita.id_cita}>
                                  <TableCell>
                                    {new Date(cita.fecha_hora).toLocaleDateString('es', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    {cita.podologo?.nombres} {cita.podologo?.apellidos}
                                  </TableCell>
                                  <TableCell>{cita.servicio?.nombre || '-'}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      cita.estado === 'completado' ? 'outline' :
                                      cita.estado === 'confirmado' ? 'default' :
                                      cita.estado === 'cancelado' ? 'destructive' :
                                      'secondary'
                                    }>
                                      {cita.estado}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No hay citas registradas</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <User size={64} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">Seleccione un paciente</p>
                  <p className="text-sm text-muted-foreground">
                    Haga clic en un paciente de la lista para ver su historial completo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCreateMode || isEditMode} onOpenChange={(open) => {
        if (!open) {
          setIsCreateMode(false)
          setIsEditMode(false)
          setSelectedPaciente(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[600px] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  placeholder="Nombres del paciente"
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  placeholder="Apellidos del paciente"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => setFormData({ ...formData, sexo: value })}
                >
                  <SelectTrigger id="sexo">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+52 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="documento_id">Documento de Identidad</Label>
              <Input
                id="documento_id"
                value={formData.documento_id}
                onChange={(e) => setFormData({ ...formData, documento_id: e.target.value })}
                placeholder="INE, Pasaporte, etc."
              />
            </div>

            <div>
              <Label htmlFor="domicilio">Domicilio</Label>
              <Textarea
                id="domicilio"
                value={formData.domicilio}
                onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                placeholder="Calle, número, colonia, ciudad..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => {
                setIsCreateMode(false)
                setIsEditMode(false)
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSavePaciente}>
                {isEditMode ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTratamientoModal} onOpenChange={setShowTratamientoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Tratamiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="problema">Problema / Diagnóstico *</Label>
              <Input
                id="problema"
                value={tratamientoForm.problema}
                onChange={(e) => setTratamientoForm({ ...tratamientoForm, problema: e.target.value })}
                placeholder="Ej: Fascitis plantar, Uña encarnada, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={tratamientoForm.fecha_inicio}
                  onChange={(e) => setTratamientoForm({ ...tratamientoForm, fecha_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={tratamientoForm.fecha_fin}
                  onChange={(e) => setTratamientoForm({ ...tratamientoForm, fecha_fin: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={tratamientoForm.estado}
                onValueChange={(value: TratamientoEstado) => setTratamientoForm({ ...tratamientoForm, estado: value })}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notas_adicionales">Notas Adicionales</Label>
              <Textarea
                id="notas_adicionales"
                value={tratamientoForm.notas_adicionales}
                onChange={(e) => setTratamientoForm({ ...tratamientoForm, notas_adicionales: e.target.value })}
                placeholder="Observaciones, plan de tratamiento, indicaciones..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowTratamientoModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTratamiento}>
                Crear Tratamiento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEvolucionModal} onOpenChange={setShowEvolucionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Evolución</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="podologo_id">Podólogo *</Label>
              <Select
                value={evolucionForm.podologo_id.toString()}
                onValueChange={(value) => setEvolucionForm({ ...evolucionForm, podologo_id: parseInt(value) })}
              >
                <SelectTrigger id="podologo_id">
                  <SelectValue placeholder="Seleccionar podólogo" />
                </SelectTrigger>
                <SelectContent>
                  {podologos.map((podologo) => (
                    <SelectItem key={podologo.id_podologo} value={podologo.id_podologo.toString()}>
                      {podologo.nombres} {podologo.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_visita">Fecha de Visita *</Label>
                <Input
                  id="fecha_visita"
                  type="date"
                  value={evolucionForm.fecha_visita}
                  onChange={(e) => setEvolucionForm({ ...evolucionForm, fecha_visita: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tipo_visita">Tipo de Visita</Label>
                <Input
                  id="tipo_visita"
                  value={evolucionForm.tipo_visita}
                  onChange={(e) => setEvolucionForm({ ...evolucionForm, tipo_visita: e.target.value })}
                  placeholder="Ej: Seguimiento, Control, Evaluación"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nota">Nota Clínica (SOAP) *</Label>
              <Textarea
                id="nota"
                value={evolucionForm.nota}
                onChange={(e) => setEvolucionForm({ ...evolucionForm, nota: e.target.value })}
                placeholder="S: Subjetivo - Lo que el paciente refiere&#10;O: Objetivo - Hallazgos del examen físico&#10;A: Análisis - Impresión diagnóstica&#10;P: Plan - Tratamiento y seguimiento"
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="signos_vitales">Signos Vitales (JSON opcional)</Label>
              <Textarea
                id="signos_vitales"
                value={evolucionForm.signos_vitales}
                onChange={(e) => setEvolucionForm({ ...evolucionForm, signos_vitales: e.target.value })}
                placeholder='{"presion": "120/80", "pulso": "72", "temperatura": "36.5"}'
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => {
                setShowEvolucionModal(false)
                setSelectedTratamiento(null)
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEvolucion}>
                Guardar Evolución
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
