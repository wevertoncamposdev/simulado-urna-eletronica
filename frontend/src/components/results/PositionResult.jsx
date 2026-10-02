import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateAvatar } from '@/components/candidates/CandidateAvatar';
import { formatNumber } from '@/lib/format';

function CandidateRow({ candidate, rank, isWinner, maxVotes }) {
  const barWidth = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center gap-3">
        <span className="w-5 text-sm text-muted-foreground tabular-nums">{rank}º</span>
        <CandidateAvatar name={candidate.name} photo={candidate.photo} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-medium">
            {candidate.name}
            {isWinner && <Badge variant="success">Eleito</Badge>}
            {candidate.status === 'INACTIVE' && <Badge>Inativo</Badge>}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {candidate.party?.acronym} ({candidate.number})
          </p>
        </div>
        <div className="shrink-0 text-right text-sm tabular-nums">
          <p className="font-medium">{formatNumber(candidate.votes)}</p>
          <p className="text-xs text-muted-foreground">{candidate.percentValid.toFixed(1)}%</p>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${barWidth}%` }} />
      </div>
    </div>
  );
}

// Apuração de um cargo: ranking por votos válidos, com brancos/nulos à parte (não
// entram na disputa, seguindo a convenção eleitoral).
export function PositionResult({ result }) {
  const { label, candidates, totals, winners } = result;
  const maxVotes = candidates[0]?.votes ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {candidates.map((candidate, index) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              isWinner={winners.includes(candidate.id)}
              maxVotes={maxVotes}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
          <span>Válidos: {formatNumber(totals.validVotes)}</span>
          <span>Brancos: {formatNumber(totals.blankVotes)} ({totals.blankPercent.toFixed(1)}%)</span>
          <span>Nulos: {formatNumber(totals.nullVotes)} ({totals.nullPercent.toFixed(1)}%)</span>
          <span>Total: {formatNumber(totals.totalVotes)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
