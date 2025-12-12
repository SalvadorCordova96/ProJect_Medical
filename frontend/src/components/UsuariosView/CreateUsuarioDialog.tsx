import { useState } from 'react'
import { Usuario, UserRole } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface CreateUsuarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (usuario: Omit<Usuario, 'id_usuario' | 'created_at' | 'last_login'>) => void
}

export function CreateUsuarioDialog({ open, onOpenChange, onSubmit }: CreateUsuarioDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    rol: 'Recepcion' as UserRole,
    activo: true
  })

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

    if (!formData.password) {
      toast.error('La contraseña es obligatoria')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
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

    onSubmit({
      username: formData.username.trim(),
      email: formData.email.trim(),
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      rol: formData.rol,
      activo: formData.activo
    })

    toast.success('Usuario creado exitosamente')
    
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      apellido: '',
      rol: 'Recepcion',
      activo: true
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo usuario del sistema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="juanperez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@podoskin.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repite la contraseña"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value as UserRole })}>
                <SelectTrigger id="rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Podologo">Podólogo</SelectItem>
                  <SelectItem value="Recepcion">Recepción</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="activo" className="cursor-pointer">Usuario Activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Usuario</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
