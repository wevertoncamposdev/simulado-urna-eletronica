import { Badge } from '@/components/ui/badge';

// Status ACTIVE/INACTIVE de partidos e candidatos.
export function ActiveBadge({ status }) {
  return status === 'ACTIVE' ? <Badge variant="success">Ativo</Badge> : <Badge>Inativo</Badge>;
}
