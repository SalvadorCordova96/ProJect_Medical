// ============================================================================
// TARJETA DE KPI
// ============================================================================

import { KPICardProps } from '../types/dashboard.types'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

export const KPICard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
}: KPICardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} weight="duotone" />
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        
        {change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${changeColors[changeType]}`}>
            {changeType === 'positive' && <TrendUp size={12} />}
            {changeType === 'negative' && <TrendDown size={12} />}
            <span className="text-xs font-semibold">{change}</span>
          </div>
        )}
      </div>
    </div>
  )
}
