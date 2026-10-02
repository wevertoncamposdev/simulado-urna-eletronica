import { Badge } from '@/components/ui/badge';

const STATUS_META = {
  DRAFT: { label: 'Rascunho', variant: 'default' },
  OPEN: { label: 'Aberta', variant: 'success' },
  FINISHED: { label: 'Finalizada', variant: 'dark' },
};

export function SessionStatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, variant: 'default' };
  return (
    <Badge variant={meta.variant}>
      {status === 'OPEN' && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {meta.label}
    </Badge>
  );
}
