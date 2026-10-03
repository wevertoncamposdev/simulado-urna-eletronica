import { Link } from 'react-router-dom';
import { Plus, Vote, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { SystemStatus } from '@/components/layout/SystemStatus';
import { SessionCard } from '@/components/sessions/SessionCard';
import { useAsync } from '@/hooks/useAsync';
import { formatNumber } from '@/lib/format';
import { api } from '@/services/api';

const RECENT_LIMIT = 6;

function Stat({ label, value }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  );
}

function Stats({ sessions }) {
  const sum = (key) => sessions.reduce((total, session) => total + session[key], 0);
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Stat label="Sessões" value={formatNumber(sessions.length)} />
      <Stat label="Sessões abertas" value={formatNumber(sessions.filter((s) => s.status === 'OPEN').length)} />
      <Stat label="Candidatos" value={formatNumber(sum('candidatesCount'))} />
      <Stat label="Votos registrados" value={formatNumber(sum('votesCount'))} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => <Skeleton key={i} className="h-40" />)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: sessions, error, loading, reload } = useAsync(() => api.sessions.list(), []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do simulador."
        actions={
          <Button asChild>
            <Link to="/sessoes/nova"><Plus /> Nova sessão</Link>
          </Button>
        }
      />

      {loading && !sessions ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <Stats sessions={sessions} />

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Sessões recentes</h2>
            {sessions.length === 0 ? (
              <EmptyState
                icon={Vote}
                title="Nenhuma sessão eleitoral ainda"
                description="O assistente guiado ajuda a cadastrar tudo (sessão, partidos, pessoas e candidatos) na ordem certa."
                action={
                  <Button asChild>
                    <Link to="/sessoes/assistente"><Wand2 /> Criar com o assistente</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sessions.slice(0, RECENT_LIMIT).map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <SystemStatus />
    </div>
  );
}
