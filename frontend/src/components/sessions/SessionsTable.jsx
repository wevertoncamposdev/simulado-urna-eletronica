import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, formatNumber } from '@/lib/format';
import { SessionStatusBadge } from './SessionStatusBadge';

export function SessionsTable({ sessions }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Ano</TableHead>
          <TableHead>Cargos</TableHead>
          <TableHead>Candidatos</TableHead>
          <TableHead>Votos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criada em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.name}</TableCell>
            <TableCell>{session.year}</TableCell>
            <TableCell>{session.positionsCount}</TableCell>
            <TableCell>{formatNumber(session.candidatesCount)}</TableCell>
            <TableCell>{formatNumber(session.votesCount)}</TableCell>
            <TableCell><SessionStatusBadge status={session.status} /></TableCell>
            <TableCell className="text-muted-foreground">{formatDateTime(session.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button asChild size="sm" variant="outline">
                <Link to={`/sessoes/${session.id}`}>Gerenciar</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
