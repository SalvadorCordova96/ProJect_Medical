import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface PlaceholderViewProps {
  title: string
  description: string
  icon: ReactNode
  message: string
}

export function PlaceholderView({ title, description, icon, message }: PlaceholderViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <div className="flex justify-center mb-4">
              {icon}
            </div>
            <p className="text-lg">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
