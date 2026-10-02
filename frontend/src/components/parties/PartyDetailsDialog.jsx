import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActiveBadge } from '@/components/layout/StatusBadge';
import { formatDateTime, formatNumber } from '@/lib/format';

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function PartyDetailsDialog({ party, onOpenChange }) {
  return (
    <Dialog open={Boolean(party)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{party?.name}</DialogTitle>
          <DialogDescription>Detalhes do partido.</DialogDescription>
        </DialogHeader>
        {party && (
          <dl className="divide-y">
            <Row label="Sigla">{party.acronym}</Row>
            <Row label="Número"><span className="tabular-nums">{party.number}</span></Row>
            <Row label="Status"><ActiveBadge status={party.status} /></Row>
            <Row label="Candidatos">{formatNumber(party.candidatesCount)}</Row>
            <Row label="Criado em">{formatDateTime(party.createdAt)}</Row>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
