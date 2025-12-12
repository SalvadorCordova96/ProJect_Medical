import { useState, useEffect } from 'react'
import { Usuario, UserRole } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface EditUsuarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario
  onSubmit: (updates: Partial<Usuario>) => void
  currentUserId: number
}

export function EditUsuarioDialog({ open, onOpenChange, usuario, onSubmit, currentUserId }: EditUsuarioDialogProps) {
  const [formData, setFormData] = useState({
    username: usuario.username,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
    activo: usuario.activo
  })

  useEffect(() => {
    setFormData({
      username: usuario.username,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      activo: usuario.activo
    })
  }, [usuario])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim()) {
      toast.error('El nombre de usuario es obligatorio')
      return
    }

    if (!formData.email.trim()) {
      toast.error('El email es obligatorio')
      return
    }

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast.error('El nombre y apellido son obligatorios')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('El email no es válido')
      return
    }

    if (usuario.id_usuario === currentUserId && usuario.rol === 'Admin' && formData.rol !== 'Admin') {
      toast.error('No puedes cambiar tu propio rol de Admin')
      return
    }

    if (usuario.id_usuario === currentUserId && !formData.activo) {
      toast.error('No puedes desactivar tu propia cuenta')
      return
    }

    const updates: Partial<Usuario> = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      rol: formData.rol,
      activo: formData.activo
    }

    onSubmit(updates)
    toast.success('Usuario actualizado exitosamente')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido *</Label>
                <Input
                  id="edit-apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Nombre de Usuario *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="juanperez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@podoskin.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol *</Label>
              <Select 
                value={formData.rol} 
                onValueChange={(value) => setFormData({ ...formData, rol: value as UserRole })}
                disabled={usuario.id_usuario === currentUserId && usuario.rol === 'Admin'}
              >
                <SelectTrigger id="edit-rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Podologo">Podólogo</SelectItem>
                  <SelectItem value="Recepcion">Recepción</SelectItem>
                </SelectContent>
              </Select>
              {usuario.id_usuario === currentUserId && usuario.rol === 'Admin' && (
                <p className="text-xs text-muted-foreground">No puedes cambiar tu propio rol</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label 
                htmlFor="edit-activo" 
                className={usuario.id_usuario === currentUserId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              >
                Usuario Activo
              </Label>
              <Switch
                id="edit-activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                disabled={usuario.id_usuario === currentUserId}
              />
            </div>
            {usuario.id_usuario === currentUserId && (
              <p className="text-xs text-muted-foreground">No puedes desactivar tu propia cuenta</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
