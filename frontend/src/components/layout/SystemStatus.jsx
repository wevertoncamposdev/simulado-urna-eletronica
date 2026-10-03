import { Database, RefreshCw, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHealth } from '@/hooks/useHealth';

function StatusRow({ icon: Icon, label, ok, detail }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'Funcionando' : 'Indisponível'}</Badge>
    </div>
  );
}

export function SystemStatus() {
  const { data, error, loading, reload } = useHealth();

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Estado do sistema</CardTitle>
          <CardDescription>Verificação da API e do banco de dados.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Verificar de novo
        </Button>
      </CardHeader>
      <CardContent className="divide-y">
        {error ? (
          <StatusRow icon={Server} label="API (backend)" ok={false} detail={error.message} />
        ) : (
          <>
            <StatusRow
              icon={Server}
              label="API (backend)"
              ok={Boolean(data)}
              detail={data ? `No ar há ${data.uptimeSeconds}s` : 'Verificando...'}
            />
            <StatusRow
              icon={Database}
              label="Banco de dados (PostgreSQL)"
              ok={Boolean(data?.storage.ok)}
              detail={data ? 'Leitura e gravação pelo repository' : 'Verificando...'}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
