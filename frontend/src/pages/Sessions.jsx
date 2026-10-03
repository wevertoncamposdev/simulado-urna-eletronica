import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { SessionsTable } from '@/components/sessions/SessionsTable';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';

export default function Sessions() {
  const { data: sessions, error, loading, reload } = useAsync(() => api.sessions.list(), []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Eleições"
        description="Todas as sessões eleitorais do simulador."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/sessoes/assistente"><Wand2 /> Assistente guiado</Link>
            </Button>
            <Button asChild>
              <Link to="/sessoes/nova"><Plus /> Nova sessão</Link>
            </Button>
          </>
        }
      />

      {loading && !sessions ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma sessão criada"
          description="Uma sessão define o ano e os cargos que estarão em disputa. O assistente guiado ajuda a cadastrar tudo (partidos, pessoas e candidatos) na ordem certa."
          action={
            <Button asChild>
              <Link to="/sessoes/assistente"><Wand2 /> Criar com o assistente</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <SessionsTable sessions={sessions} />
        </Card>
      )}
    </div>
  );
}
