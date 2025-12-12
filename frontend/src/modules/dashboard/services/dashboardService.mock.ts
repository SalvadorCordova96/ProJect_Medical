// ============================================================================
// SERVICIO MOCK DEL DASHBOARD
// ============================================================================

import { DashboardKPIs } from '../types/dashboard.types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const dashboardServiceMock = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    await delay(600)
    
    return {
      total_patients: 245,
      active_patients: 189,
      appointments_today: 8,
      pending_today: 2,
      treatments_active: 42,
      new_prospects: 12,
      revenue_month: 45230,
      revenue_change: 18.5,
    }
  }
}
