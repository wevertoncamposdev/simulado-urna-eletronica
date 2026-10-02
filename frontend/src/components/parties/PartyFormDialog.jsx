import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { fieldOfError } from '@/lib/form-errors';
import { api } from '@/services/api';

const FIELD_RULES = [['NAME', 'name'], ['ACRONYM', 'acronym'], ['NUMBER', 'number']];

function PartyForm({ party, onSaved, onCancel }) {
  const editing = Boolean(party);
  const [name, setName] = useState(party?.name ?? '');
  const [acronym, setAcronym] = useState(party?.acronym ?? '');
  const [number, setNumber] = useState(party ? String(party.number) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const errorField = fieldOfError(error, FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = { name, acronym, number: number === '' ? null : Number(number) };
    try {
      if (editing) await api.parties.update(party.id, payload);
      else await api.parties.create(payload);
      toast.success(editing ? 'Alterações salvas.' : 'Partido criado.');
      onSaved();
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && !errorField && (
        <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
      )}
      <FormField label="Nome do partido" htmlFor="party-name" error={fieldError('name')}>
        <Input id="party-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Partido ABC" autoFocus />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Sigla" htmlFor="party-acronym" error={fieldError('acronym')}>
          <Input id="party-acronym" value={acronym} onChange={(e) => setAcronym(e.target.value.toUpperCase())} placeholder="ABC" maxLength={10} />
        </FormField>
        <FormField label="Número" htmlFor="party-number" error={fieldError('number')} hint="De 1 a 99.">
          <Input id="party-number" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="10" />
        </FormField>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar partido'}
        </Button>
      </div>
    </form>
  );
}

// `party` = null para criar; objeto para editar.
export function PartyFormDialog({ open, party, onOpenChange, onSaved }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{party ? 'Editar partido' : 'Novo partido'}</DialogTitle>
          <DialogDescription>O número e a sigla não podem se repetir entre partidos.</DialogDescription>
        </DialogHeader>
        <PartyForm
          party={party}
          onSaved={() => { onOpenChange(false); onSaved(); }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
