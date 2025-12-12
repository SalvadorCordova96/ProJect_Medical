import { ProhibitInset } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-destructive/10 rounded-full mx-auto mb-6 flex items-center justify-center">
          <ProhibitInset size={48} className="text-destructive" weight="duotone" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Acceso No Autorizado
        </h1>
        <p className="text-muted-foreground mb-6">
          No tienes permisos para acceder a esta sección del sistema.
        </p>
        <Button onClick={() => window.location.reload()}>
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
};
