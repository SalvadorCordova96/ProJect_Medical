import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Buildings, Briefcase, FileText, GearSix } from '@phosphor-icons/react'

interface ConfiguracionesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfiguracionesModal({ open, onOpenChange }: ConfiguracionesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">Configuraciones</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="usuarios" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-full grid-cols-5">
            <TabsTrigger value="usuarios" className="gap-2">
              <Users size={18} weight="duotone" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="clinicas" className="gap-2">
              <Buildings size={18} weight="duotone" />
              <span>Clínicas</span>
            </TabsTrigger>
            <TabsTrigger value="servicios" className="gap-2">
              <Briefcase size={18} weight="duotone" />
              <span>Servicios</span>
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="gap-2">
              <FileText size={18} weight="duotone" />
              <span>Auditoría</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="gap-2">
              <GearSix size={18} weight="duotone" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="usuarios" className="m-0">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Users size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Gestión de Usuarios</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenido de usuarios pendiente de especificación
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinicas" className="m-0">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Buildings size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Gestión de Clínicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenido de clínicas pendiente de especificación
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="servicios" className="m-0">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Briefcase size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Gestión de Servicios</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenido de servicios pendiente de especificación
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auditoria" className="m-0">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <FileText size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Auditoría del Sistema</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenido de auditoría pendiente de especificación
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sistema" className="m-0">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <GearSix size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Configuración del Sistema</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenido del sistema pendiente de especificación
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
