import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Vote } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BallotCard } from '@/components/voting/BallotCard';
import { VoteKeypad } from '@/components/voting/VoteKeypad';
import { EmptyState } from '@/components/layout/EmptyState';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAsync } from '@/hooks/useAsync';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { api } from '@/services/api';

// Tela de votação: um cargo por vez, na ordem da sessão, até fechar a cédula.
// Todos os hooks ficam no topo (sem retorno condicional antes deles), já que o
// React exige a mesma sequência de hooks em toda renderização.
export default function Voting() {
  const [searchParams] = useSearchParams();
  const { session: currentSession, select } = useCurrentSession();
  const sessionsState = useAsync(() => api.sessions.list(), []);
  const positionsState = useAsync(() => api.positions.list(), []);

  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') ?? currentSession?.id ?? '');
  const [index, setIndex] = useState(0);
  const [digits, setDigits] = useState('');
  const [blank, setBlank] = useState(false);
  const [lookup, setLookup] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [votesCast, setVotesCast] = useState(0);
  const [closed, setClosed] = useState(false);

  const openSessions = (sessionsState.data ?? []).filter((s) => s.status === 'OPEN');
  const session = openSessions.find((s) => s.id === sessionId) ?? openSessions[0] ?? null;
  const rules = Object.fromEntries((positionsState.data ?? []).map((p) => [p.code, p]));
  const positions = (session?.positions ?? []).map((code) => rules[code]).filter(Boolean);
  const rule = positions[index];
  const ballotDone = session && index >= positions.length;

  useEffect(() => {
    if (!rule || !session || blank || digits.length !== rule.digits) {
      setLookup(null);
      return;
    }
    let active = true;
    setLookup({ loading: true, result: null });
    api.votes
      .lookup({ sessionId: session.id, position: rule.code, number: digits })
      .then((result) => {
        if (active) setLookup({ loading: false, result });
      })
      .catch(() => {
        if (active) setLookup({ loading: false, result: null });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, blank, rule?.code, session?.id]);

  const error = sessionsState.error ?? positionsState.error;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState error={error} onRetry={() => { sessionsState.reload(); positionsState.reload(); }} />
      </div>
    );
  }
  if (!sessionsState.data || !positionsState.data) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-80" />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={Vote}
          title="Nenhuma votação aberta"
          description="Abra a votação de uma sessão para começar a registrar votos."
          action={<Button asChild><Link to="/sessoes">Ver eleições</Link></Button>}
        />
      </div>
    );
  }

  function changeSession(value) {
    setSessionId(value);
    const next = openSessions.find((s) => s.id === value);
    if (next) select(next);
    resetBallot();
  }

  function resetBallot() {
    setIndex(0);
    setDigits('');
    setBlank(false);
    setLookup(null);
    setClosed(false);
  }

  function clearEntry() {
    setDigits('');
    setBlank(false);
  }

  function pressDigit(digit) {
    setBlank(false);
    setDigits((current) => (rule && current.length < rule.digits ? current + digit : current));
  }

  function pressBlank() {
    setDigits('');
    setBlank(true);
  }

  const ready = rule && (blank || (digits.length === rule.digits && lookup && !lookup.loading));

  async function confirmVote() {
    const type = blank ? 'BLANK' : lookup?.result?.status === 'FOUND' ? 'VALID' : 'NULL';
    setSubmitting(true);
    try {
      await api.votes.create({
        sessionId: session.id,
        position: rule.code,
        type,
        number: blank ? undefined : digits,
        confirmed: true,
      });
      setDigits('');
      setBlank(false);
      setLookup(null);
      const next = index + 1;
      setIndex(next);
      if (next >= positions.length) {
        setVotesCast((count) => count + 1);
        sessionsState.reload();
      }
    } catch (err) {
      if (err.code === 'VOTE_SESSION_NOT_OPEN') {
        setClosed(true);
        toast.error('A votação desta sessão foi encerrada.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const sessionPicker = openSessions.length > 1 && (
    <Select value={session.id} onValueChange={changeSession}>
      <SelectTrigger aria-label="Sessão" className="w-56"><SelectValue /></SelectTrigger>
      <SelectContent>
        {openSessions.map((s) => (
          <SelectItem key={s.id} value={s.id}>{s.name} ({s.year})</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (closed) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={Vote}
          title="Votação encerrada"
          description="Esta sessão não está mais recebendo votos."
          action={<Button asChild variant="outline"><Link to={`/sessoes/${session.id}`}>Ver sessão</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Votação"
        description={`${session.name} (${session.year})`}
        actions={sessionPicker}
      />

      {positions.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="Esta sessão não tem cargos habilitados"
          description="Nada a votar aqui."
        />
      ) : ballotDone ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="size-10 text-success" />
          <div>
            <p className="font-medium">Voto computado</p>
            <p className="text-sm text-muted-foreground">
              {votesCast === 1 ? '1 cédula registrada nesta urna.' : `${votesCast} cédulas registradas nesta urna.`}
            </p>
          </div>
          <Button onClick={resetBallot}>Próximo eleitor</Button>
        </Card>
      ) : (
        <>
          <p className="text-center text-sm text-muted-foreground">
            Cargo {index + 1} de {positions.length}
          </p>
          <BallotCard
            positionLabel={rule.label}
            digits={digits}
            digitsRequired={rule.digits}
            blank={blank}
            lookup={lookup}
          />
          <VoteKeypad onDigit={pressDigit} onClear={clearEntry} onBlank={pressBlank} disabled={submitting} />
          <Button className="h-12 text-base" disabled={!ready || submitting} onClick={confirmVote}>
            {submitting ? 'Confirmando...' : 'Confirma'}
          </Button>
        </>
      )}
    </div>
  );
}
