import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { PositionResult } from '@/components/results/PositionResult';
import { SessionStatusBadge } from '@/components/sessions/SessionStatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';

// Apuração por sessão: só sessões finalizadas entram na lista, como numa eleição real.
export default function Results() {
  const [searchParams] = useSearchParams();
  const sessionsState = useAsync(() => api.sessions.list(), []);
  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') ?? '');

  const finishedSessions = (sessionsState.data ?? []).filter((s) => s.status === 'FINISHED');
  const session = finishedSessions.find((s) => s.id === sessionId) ?? finishedSessions[0] ?? null;

  const resultsState = useAsync(
    () => (session ? api.results.get(session.id) : Promise.resolve(null)),
    [session?.id],
  );

  if (sessionsState.error) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState error={sessionsState.error} onRetry={sessionsState.reload} />
      </div>
    );
  }
  if (!sessionsState.data) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Trophy}
          title="Nenhuma eleição finalizada"
          description="Os resultados ficam disponíveis depois que uma sessão é finalizada."
          action={<Button asChild><Link to="/sessoes">Ver eleições</Link></Button>}
        />
      </div>
    );
  }

  const sessionPicker = finishedSessions.length > 1 && (
    <Select value={session.id} onValueChange={setSessionId}>
      <SelectTrigger aria-label="Sessão" className="w-56"><SelectValue /></SelectTrigger>
      <SelectContent>
        {finishedSessions.map((s) => (
          <SelectItem key={s.id} value={s.id}>{s.name} ({s.year})</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Resultados" description={`${session.name} (${session.year})`} actions={sessionPicker}>
        <SessionStatusBadge status={session.status} />
      </PageHeader>

      {resultsState.error ? (
        <ErrorState error={resultsState.error} onRetry={resultsState.reload} />
      ) : !resultsState.data ? (
        <Skeleton className="h-64" />
      ) : (
        resultsState.data.positions.map((position) => <PositionResult key={position.code} result={position} />)
      )}
    </div>
  );
}
