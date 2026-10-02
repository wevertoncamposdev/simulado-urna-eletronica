import { useState } from 'react';
import { Eye, Flag, Pencil, Plus, Power, PowerOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { EmptyState } from '@/components/layout/EmptyState';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { RowActions } from '@/components/layout/RowActions';
import { ActiveBadge } from '@/components/layout/StatusBadge';
import { PartyDetailsDialog } from '@/components/parties/PartyDetailsDialog';
import { PartyFormDialog } from '@/components/parties/PartyFormDialog';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { formatNumber } from '@/lib/format';
import { api } from '@/services/api';

export default function Parties() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const debouncedSearch = useDebounce(search);

  const { data: parties, error, loading, reload } = useAsync(
    () => api.parties.list({ search: debouncedSearch, status: status === 'ALL' ? '' : status }),
    [debouncedSearch, status],
  );

  const [form, setForm] = useState({ open: false, party: null });
  const [viewing, setViewing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);

  const filtering = Boolean(debouncedSearch) || status !== 'ALL';
  const openForm = (party = null) => setForm({ open: true, party });

  async function changeStatus(action, party, message) {
    try {
      await action();
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const newButton = (
    <Button onClick={() => openForm()}><Plus /> Novo partido</Button>
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Partidos" description="Partidos disponíveis para o cadastro de candidatos." actions={newButton} />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome, sigla ou número" aria-label="Buscar partidos" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-40">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="INACTIVE">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && !parties ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : parties.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={filtering ? 'Nenhum partido encontrado' : 'Nenhum partido cadastrado'}
          description={filtering ? 'Ajuste a busca ou o filtro de status.' : 'Cadastre os partidos antes de registrar candidatos.'}
          action={!filtering && newButton}
        />
      ) : (
        <Card className={loading ? 'opacity-60 transition-opacity' : undefined}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Candidatos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.map((party) => (
                <TableRow key={party.id}>
                  <TableCell className="font-medium tabular-nums">{party.number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{party.name}</div>
                    <div className="text-xs text-muted-foreground">{party.acronym}</div>
                  </TableCell>
                  <TableCell>{formatNumber(party.candidatesCount)}</TableCell>
                  <TableCell><ActiveBadge status={party.status} /></TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      label={party.name}
                      items={[
                        { label: 'Ver detalhes', icon: Eye, onSelect: () => setViewing(party) },
                        { label: 'Editar', icon: Pencil, onSelect: () => openForm(party) },
                        party.status === 'ACTIVE'
                          ? { label: 'Desativar', icon: PowerOff, onSelect: () => setDeactivating(party) }
                          : {
                              label: 'Reativar',
                              icon: Power,
                              onSelect: () =>
                                changeStatus(() => api.parties.update(party.id, { status: 'ACTIVE' }), party, 'Partido reativado.'),
                            },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <PartyFormDialog
        open={form.open}
        party={form.party}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
        onSaved={reload}
      />
      <PartyDetailsDialog party={viewing} onOpenChange={(open) => !open && setViewing(null)} />
      <ConfirmDialog
        open={Boolean(deactivating)}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Desativar partido?"
        description={`${deactivating?.name ?? 'O partido'} não poderá receber novos candidatos. Candidatos já cadastrados e votos são mantidos.`}
        confirmLabel="Desativar"
        onConfirm={() =>
          changeStatus(() => api.parties.deactivate(deactivating.id), deactivating, 'Partido desativado.')
        }
      />
    </div>
  );
}
