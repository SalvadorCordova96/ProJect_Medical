import { useState } from 'react'
import { Usuario, UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, MagnifyingGlass, PencilSimple, Trash, LockKey, Eye } from '@phosphor-icons/react'
import { CreateUsuarioDialog } from './UsuariosView/CreateUsuarioDialog'
import { EditUsuarioDialog } from './UsuariosView/EditUsuarioDialog'
import { ChangePasswordDialog } from './UsuariosView/ChangePasswordDialog'
import { ViewAuditDialog } from './UsuariosView/ViewAuditDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { AuditLog } from '@/lib/types'

interface UsuariosViewProps {
  usuarios: Usuario[]
  auditLogs: AuditLog[]
  onAddUsuario: (usuario: Omit<Usuario, 'id_usuario' | 'created_at' | 'last_login'>) => void
  onEditUsuario: (id: number, updates: Partial<Usuario>) => void
  onDeleteUsuario: (id: number) => void
  onChangePassword: (id: number, newPassword: string) => void
  currentUserId: number
}

export function UsuariosView({ 
  usuarios, 
  auditLogs,
  onAddUsuario, 
  onEditUsuario, 
  onDeleteUsuario,
  onChangePassword,
  currentUserId
}: UsuariosViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setEditDialogOpen(true)
  }

  const handleChangePassword = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setPasswordDialogOpen(true)
  }

  const handleViewAudit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setAuditDialogOpen(true)
  }

  const handleDeleteClick = (usuario: Usuario) => {
    if (usuario.id_usuario === currentUserId) {
      toast.error('No puedes eliminar tu propia cuenta')
      return
    }
    setSelectedUsuario(usuario)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedUsuario) {
      onDeleteUsuario(selectedUsuario.id_usuario)
      toast.success('Usuario eliminado exitosamente')
      setDeleteDialogOpen(false)
      setSelectedUsuario(null)
    }
  }

  const getRoleBadgeVariant = (rol: UserRole) => {
    switch (rol) {
      case 'Admin':
        return 'destructive'
      case 'Podologo':
        return 'default'
      case 'Recepcion':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const activeCount = usuarios.filter(u => u.activo).length
  const adminCount = usuarios.filter(u => u.rol === 'Admin').length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground mt-1">Administración de usuarios y control de acceso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-3xl">{usuarios.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usuarios Activos</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-3xl">{adminCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Control de acceso y roles del sistema</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus size={18} />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, usuario o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id_usuario}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{usuario.nombre} {usuario.apellido}</div>
                            <div className="text-sm text-muted-foreground">@{usuario.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(usuario.rol)}>
                            {usuario.rol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.activo ? 'default' : 'outline'}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {usuario.last_login 
                            ? new Date(usuario.last_login).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAudit(usuario)}
                              title="Ver auditoría"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(usuario)}
                              title="Editar"
                            >
                              <PencilSimple size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangePassword(usuario)}
                              title="Cambiar contraseña"
                            >
                              <LockKey size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(usuario)}
                              disabled={usuario.id_usuario === currentUserId}
                              title={usuario.id_usuario === currentUserId ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                            >
                              <Trash size={16} className="text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateUsuarioDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={onAddUsuario}
      />

      {selectedUsuario && (
        <>
          <EditUsuarioDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            usuario={selectedUsuario}
            onSubmit={(updates) => {
              onEditUsuario(selectedUsuario.id_usuario, updates)
              setEditDialogOpen(false)
              setSelectedUsuario(null)
            }}
            currentUserId={currentUserId}
          />

          <ChangePasswordDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
            usuario={selectedUsuario}
            onSubmit={(newPassword) => {
              onChangePassword(selectedUsuario.id_usuario, newPassword)
              setPasswordDialogOpen(false)
              setSelectedUsuario(null)
            }}
          />

          <ViewAuditDialog
            open={auditDialogOpen}
            onOpenChange={setAuditDialogOpen}
            usuario={selectedUsuario}
            auditLogs={auditLogs.filter(log => log.usuario_id === selectedUsuario.id_usuario)}
          />
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedUsuario?.nombre} {selectedUsuario?.apellido}?
              Esta acción es permanente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
