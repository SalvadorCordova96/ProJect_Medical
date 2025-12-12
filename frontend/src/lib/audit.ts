import { AuditLog, AuditAction, AuditEntity } from './types'

export async function createAuditLog(
  logs: AuditLog[],
  setLogs: (updater: (current: AuditLog[]) => AuditLog[]) => void,
  usuarioId: number,
  action: AuditAction,
  entity: AuditEntity,
  entityId?: number,
  changes?: Record<string, any>
): Promise<void> {
  const newLog: AuditLog = {
    id_audit: Date.now(),
    usuario_id: usuarioId,
    action,
    entity,
    entity_id: entityId,
    changes,
    timestamp: new Date().toISOString()
  }

  setLogs((current) => [newLog, ...(current ?? [])])
}

export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    create: 'Creación',
    update: 'Actualización',
    delete: 'Eliminación',
    login: 'Inicio de sesión',
    logout: 'Cierre de sesión',
    password_change: 'Cambio de contraseña',
    role_change: 'Cambio de rol'
  }
  return labels[action]
}

export function getEntityLabel(entity: AuditEntity): string {
  const labels: Record<AuditEntity, string> = {
    usuario: 'Usuario',
    paciente: 'Paciente',
    cita: 'Cita',
    tratamiento: 'Tratamiento',
    evolucion: 'Evolución',
    evidencia: 'Evidencia',
    podologo: 'Podólogo',
    servicio: 'Servicio',
    prospecto: 'Prospecto'
  }
  return labels[entity]
}
