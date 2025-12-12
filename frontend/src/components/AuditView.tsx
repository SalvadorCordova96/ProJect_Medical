import { useState } from 'react'
import { AuditLog, Usuario } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MagnifyingGlass, CalendarBlank } from '@phosphor-icons/react'
import { getActionLabel, getEntityLabel } from '@/lib/audit'
import { Button } from '@/components/ui/button'

interface AuditViewProps {
  auditLogs: AuditLog[]
  usuarios: Usuario[]
}

export function AuditView({ auditLogs, usuarios }: AuditViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')

  const filteredLogs = auditLogs
    .filter(log => {
      const usuario = usuarios.find(u => u.id_usuario === log.usuario_id)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
        getActionLabel(log.action).toLowerCase().includes(searchLower) ||
        getEntityLabel(log.entity).toLowerCase().includes(searchLower) ||
        (usuario && `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(searchLower))

      const matchesAction = filterAction === 'all' || log.action === filterAction
      const matchesEntity = filterEntity === 'all' || log.entity === filterEntity
      const matchesUser = filterUser === 'all' || log.usuario_id === parseInt(filterUser)

      return matchesSearch && matchesAction && matchesEntity && matchesUser
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'default'
      case 'update':
        return 'secondary'
      case 'delete':
        return 'destructive'
      case 'login':
        return 'outline'
      case 'logout':
        return 'outline'
      case 'password_change':
        return 'secondary'
      case 'role_change':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterAction('all')
    setFilterEntity('all')
    setFilterUser('all')
  }

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)))
  const uniqueEntities = Array.from(new Set(auditLogs.map(log => log.entity)))

  const totalLogs = auditLogs.length
  const todayLogs = auditLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const today = new Date()
    return logDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoría</h1>
        <p className="text-muted-foreground mt-1">Registro completo de acciones del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Registros</CardDescription>
            <CardTitle className="text-3xl">{totalLogs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Registros de Hoy</CardDescription>
            <CardTitle className="text-3xl">{todayLogs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usuarios Activos</CardDescription>
            <CardTitle className="text-3xl">{usuarios.filter(u => u.activo).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoría</CardTitle>
          <CardDescription>Historial completo de acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar en auditoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {getActionLabel(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  {uniqueEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {getEntityLabel(entity)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {usuarios.map(usuario => (
                    <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                      {usuario.nombre} {usuario.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || filterAction !== 'all' || filterEntity !== 'all' || filterUser !== 'all') && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No se encontraron registros
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => {
                      const usuario = usuarios.find(u => u.id_usuario === log.usuario_id)
                      return (
                        <TableRow key={log.id_audit}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarBlank size={16} className="text-muted-foreground" />
                              <div>
                                <div className="text-sm">
                                  {new Date(log.timestamp).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {usuario ? (
                              <div>
                                <div className="font-medium">{usuario.nombre} {usuario.apellido}</div>
                                <div className="text-xs text-muted-foreground">@{usuario.username}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Usuario desconocido</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionColor(log.action)}>
                              {getActionLabel(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getEntityLabel(log.entity)}
                          </TableCell>
                          <TableCell>
                            {log.entity_id ? `#${log.entity_id}` : '-'}
                          </TableCell>
                          <TableCell>
                            {log.changes && Object.keys(log.changes).length > 0 ? (
                              <div className="text-xs text-muted-foreground max-w-md truncate">
                                {Object.keys(log.changes).join(', ')}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Mostrando {filteredLogs.length} de {totalLogs} registros
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
