import { Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VoteTypeBadge } from './VoteTypeBadge';
import { formatDateTime, shortHash } from '@/lib/format';
import { cn } from '@/lib/utils';

// Lista os votos na ordem em que foram gravados, cada um com seu elo da cadeia de
// hashes. Uma linha some do verde para o vermelho assim que a cadeia quebra.
export function VoteChainTable({ votes, positionLabels }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Número</TableHead>
          <TableHead>Hash anterior</TableHead>
          <TableHead>Hash</TableHead>
          <TableHead>Registrado em</TableHead>
          <TableHead className="text-right">Íntegro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {votes.map((vote, index) => {
          const ok = vote.hashValid && vote.previousHashValid;
          return (
            <TableRow key={vote.id} className={cn(!ok && 'bg-danger-soft')}>
              <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
              <TableCell>{positionLabels[vote.position] ?? vote.position}</TableCell>
              <TableCell><VoteTypeBadge type={vote.type} /></TableCell>
              <TableCell className="font-mono tabular-nums">{vote.candidateNumber ?? '—'}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground" title={vote.previousHash ?? ''}>
                {shortHash(vote.previousHash)}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground" title={vote.hash ?? ''}>
                {shortHash(vote.hash)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(vote.createdAt)}</TableCell>
              <TableCell className="text-right">
                {ok ? (
                  <Check className="ml-auto size-4 text-success" />
                ) : (
                  <X className="ml-auto size-4 text-danger" />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
