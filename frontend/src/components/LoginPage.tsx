import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import LogoImage from '@/assets/images/Logo.png'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        toast.success('Inicio de sesión exitoso')
      } else {
        toast.error('Credenciales incorrectas')
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-24 h-24 rounded-lg flex items-center justify-center mb-2">
            <img src={LogoImage} alt="PodoSkin Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold">PodoSkin</CardTitle>
          <CardDescription className="text-base">
            Sistema de Gestión de Clínica Podológica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm space-y-1">
            <p className="font-semibold text-foreground">Usuarios de prueba:</p>
            <p className="text-muted-foreground">
              <span className="font-mono">admin / Admin2024!</span> (Administrador)
            </p>
            <p className="text-muted-foreground">
              <span className="font-mono">dr.ornelas / Podo2024!</span> (Podólogo)
            </p>
            <p className="text-muted-foreground">
              <span className="font-mono">recepcion / Recep2024!</span> (Recepción)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
