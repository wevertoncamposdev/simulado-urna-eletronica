import { Badge } from '@/components/ui/badge';

const TYPE_META = {
  VALID: { label: 'Válido', variant: 'success' },
  BLANK: { label: 'Branco', variant: 'default' },
  NULL: { label: 'Nulo', variant: 'danger' },
};

export function VoteTypeBadge({ type }) {
  const meta = TYPE_META[type] ?? { label: type, variant: 'default' };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
