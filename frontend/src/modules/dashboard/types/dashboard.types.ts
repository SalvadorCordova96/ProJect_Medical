// ============================================================================
// TIPOS DEL DASHBOARD
// ============================================================================

export interface DashboardKPIs {
  total_patients: number
  active_patients: number
  appointments_today: number
  pending_today: number
  treatments_active: number
  new_prospects: number
  revenue_month?: number
  revenue_change?: number
}

export interface KPICardProps {
  title: string
  value: number | string
  subtitle?: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}
