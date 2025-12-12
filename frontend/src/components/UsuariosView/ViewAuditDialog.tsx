import { Usuario, AuditLog } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getActionLabel, getEntityLabel } from '@/lib/audit'
import { Calendar, Clock } from '@phosphor-icons/react'

interface ViewAuditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario
  auditLogs: AuditLog[]
}

export function ViewAuditDialog({ open, onOpenChange, usuario, auditLogs }: ViewAuditDialogProps) {
  const sortedLogs = [...auditLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Auditoría de Usuario</DialogTitle>
          <DialogDescription>
            Historial de acciones de {usuario.nombre} {usuario.apellido}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          {sortedLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay registros de auditoría para este usuario
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLogs.map((log) => (
                <div key={log.id_audit} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getEntityLabel(log.entity)}
                          {log.entity_id && ` #${log.entity_id}`}
                        </span>
                      </div>
                      
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="bg-muted/50 rounded p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Cambios realizados:</p>
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="text-muted-foreground">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={14} />
                        {new Date(log.timestamp).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
