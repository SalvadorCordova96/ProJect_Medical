import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, FirstAid, TrendUp } from '@phosphor-icons/react'
import { Cita } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DashboardViewProps {
  citasHoy: Cita[]
  stats: {
    citasHoy: number
    pacientesNuevos: number
    tratamientosActivos: number
    prospectosNuevos: number
  }
}

export function DashboardView({ citasHoy, stats }: DashboardViewProps) {
  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendiente: 'secondary',
      confirmado: 'default',
      cancelado: 'destructive',
      completado: 'outline'
    }
    return (
      <Badge variant={variants[estado] || 'default'} className="capitalize">
        {estado}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de actividad y métricas del día
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Hoy
            </CardTitle>
            <Calendar size={20} className="text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.citasHoy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Programadas para hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Nuevos
            </CardTitle>
            <User size={20} className="text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.pacientesNuevos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tratamientos Activos
            </CardTitle>
            <FirstAid size={20} className="text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.tratamientosActivos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En curso actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prospectos
            </CardTitle>
            <TrendUp size={20} className="text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{stats.prospectosNuevos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sin contactar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citas de Hoy</CardTitle>
          <CardDescription>
            Agenda programada para {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citasHoy.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
              <p>No hay citas programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citasHoy.map((cita) => (
                <div 
                  key={cita.id_cita} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-muted-foreground">
                        {format(new Date(cita.fecha_hora), 'HH:mm')}
                      </span>
                      <span className="font-semibold text-foreground">
                        {cita.paciente?.nombres} {cita.paciente?.apellidos}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{cita.podologo?.nombres} {cita.podologo?.apellidos}</span>
                      <span>•</span>
                      <span>{cita.duracion_minutos} min</span>
                      {cita.sala && (
                        <>
                          <span>•</span>
                          <span>Sala {cita.sala}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getEstadoBadge(cita.estado)}
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
