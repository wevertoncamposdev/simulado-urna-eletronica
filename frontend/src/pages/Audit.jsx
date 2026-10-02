import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { VoteChainTable } from '@/components/audit/VoteChainTable';
import { EmptyState } from '@/components/layout/EmptyState';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAsync } from '@/hooks/useAsync';
import { formatNumber } from '@/lib/format';
import { api } from '@/services/api';

// Reconfere a cadeia de hashes dos votos de uma sessão finalizada: cada voto
// referencia o hash do voto anterior, então qualquer alteração no arquivo depois
// da gravação aparece aqui.
export default function Audit() {
  const [searchParams] = useSearchParams();
  const sessionsState = useAsync(() => api.sessions.list(), []);
  const positionsState = useAsync(() => api.positions.list(), []);
  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') ?? '');

  const finishedSessions = (sessionsState.data ?? []).filter((s) => s.status === 'FINISHED');
  const session = finishedSessions.find((s) => s.id === sessionId) ?? finishedSessions[0] ?? null;

  const auditState = useAsync(
    () => (session ? api.audit.get(session.id) : Promise.resolve(null)),
    [session?.id],
  );

  const error = sessionsState.error ?? positionsState.error;
  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState error={error} onRetry={() => { sessionsState.reload(); positionsState.reload(); }} />
      </div>
    );
  }
  if (!sessionsState.data || !positionsState.data) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon={ShieldCheck}
          title="Nenhuma eleição finalizada"
          description="A auditoria fica disponível depois que uma sessão é finalizada."
          action={<Button asChild><Link to="/sessoes">Ver eleições</Link></Button>}
        />
      </div>
    );
  }

  const positionLabels = Object.fromEntries(positionsState.data.map((p) => [p.code, p.label]));

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
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Auditoria" description={`${session.name} (${session.year})`} actions={sessionPicker} />

      {auditState.error ? (
        <ErrorState error={auditState.error} onRetry={auditState.reload} />
      ) : !auditState.data ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              {auditState.data.valid ? (
                <ShieldCheck className="size-8 shrink-0 text-success" />
              ) : (
                <ShieldAlert className="size-8 shrink-0 text-danger" />
              )}
              <div>
                <p className="font-medium">
                  {auditState.data.valid ? 'Cadeia de votos íntegra' : 'Violação detectada na cadeia de votos'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(auditState.data.totalVotes)}{' '}
                  {auditState.data.totalVotes === 1 ? 'voto verificado' : 'votos verificados'}
                  {!auditState.data.valid &&
                    ` — divergência a partir do voto #${auditState.data.brokenAtIndex + 1}`}
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {auditState.data.votes.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nenhum voto registrado"
              description="Esta sessão foi finalizada sem votos."
            />
          ) : (
            <Card>
              <VoteChainTable votes={auditState.data.votes} positionLabels={positionLabels} />
            </Card>
          )}

          <p className="text-xs text-muted-foreground">
            Cada voto guarda o hash do voto anterior da mesma sessão. Alterar, remover ou reordenar
            um registro depois de gravado quebra essa cadeia — é isso que esta tela reconfere.
          </p>
        </>
      )}
    </div>
  );
}
