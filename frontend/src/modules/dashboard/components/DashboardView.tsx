// ============================================================================
// VISTA PRINCIPAL DEL DASHBOARD
// ============================================================================

import { useEffect, useState } from 'react'
import { useAuthStore } from '../../auth/stores/authStore'
import { dashboardService } from '../services/dashboardService'
import { DashboardKPIs } from '../types/dashboard.types'
import { WelcomeCard } from './WelcomeCard'
import { KPICard } from './KPICard'
import { Users, CalendarBlank, FirstAid, UserPlus, CurrencyDollar } from '@phosphor-icons/react'

export const DashboardView = () => {
  const { user } = useAuthStore()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getKPIs()
      setKpis(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <WelcomeCard user={user} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Pacientes Activos"
          value={kpis?.total_patients || 0}
          subtitle={`${kpis?.active_patients || 0} activos este mes`}
          change="+12%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        
        <KPICard
          title="Citas Hoy"
          value={kpis?.appointments_today || 0}
          subtitle={`${kpis?.pending_today || 0} pendientes`}
          icon={CalendarBlank}
          color="green"
        />
        
        <KPICard
          title="Tratamientos Activos"
          value={kpis?.treatments_active || 0}
          subtitle="En seguimiento"
          icon={FirstAid}
          color="purple"
        />
        
        <KPICard
          title="Prospectos Nuevos"
          value={kpis?.new_prospects || 0}
          subtitle="Esta semana"
          change="+23%"
          changeType="positive"
          icon={UserPlus}
          color="orange"
        />
      </div>
      
      {user?.rol === 'Admin' && kpis?.revenue_month && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title="Ingresos del Mes"
            value={`$${kpis.revenue_month.toLocaleString()}`}
            change={`+${kpis.revenue_change}%`}
            changeType="positive"
            icon={CurrencyDollar}
            color="green"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 flex items-center justify-center text-gray-400">
          <p>Gráfico de citas (próximamente)</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 flex items-center justify-center text-gray-400">
          <p>Tabla de próximas citas (próximamente)</p>
        </div>
      </div>
    </div>
  )
}
