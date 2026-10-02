import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fieldOfError } from '@/lib/form-errors';
import { api } from '@/services/api';
import { PhotoCaptureField } from './PhotoCaptureField';

const FIELD_RULES = [
  ['SESSION_NOT_FOUND', 'sessionId'],
  ['NAME', 'name'],
  ['NUMBER', 'number'],
  ['PARTY', 'partyId'],
  ['POSITION', 'position'],
  ['PHOTO', 'photo'],
];

function CandidateForm({ candidate, sessions, parties, positions, defaultSessionId, onSaved, onCancel }) {
  const editing = Boolean(candidate);

  // Novo candidato: só sessões em rascunho. Edição: a sessão do candidato (fixa).
  const selectableSessions = editing
    ? sessions.filter((s) => s.id === candidate.sessionId)
    : sessions.filter((s) => s.status === 'DRAFT');

  const [sessionId, setSessionId] = useState(
    candidate?.sessionId ??
      (selectableSessions.some((s) => s.id === defaultSessionId) ? defaultSessionId : selectableSessions[0]?.id ?? ''),
  );
  const [position, setPosition] = useState(candidate?.position ?? '');
  const [partyId, setPartyId] = useState(candidate?.partyId ?? '');
  const [number, setNumber] = useState(candidate?.number ?? '');
  const [name, setName] = useState(candidate?.name ?? '');
  const [photo, setPhoto] = useState(candidate?.photo ?? '');
  const [status, setStatus] = useState(candidate?.status ?? 'ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const session = sessions.find((s) => s.id === sessionId);
  const rules = Object.fromEntries(positions.map((p) => [p.code, p]));
  const sessionPositions = (session?.positions ?? []).map((code) => rules[code]).filter(Boolean);
  const digits = rules[position]?.digits;
  const partyOptions = parties.filter((p) => p.status === 'ACTIVE' || p.id === candidate?.partyId);

  // Depois que a votação abre, o backend só aceita mudar nome, foto e status.
  const identityLocked = editing && session?.status !== 'DRAFT';

  const errorField = fieldOfError(error, FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  function changeSession(value) {
    setSessionId(value);
    setPosition('');
    setNumber('');
  }

  function changePosition(value) {
    setPosition(value);
    setNumber('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = { sessionId, partyId, position, number, name, photo, ...(editing && { status }) };
    try {
      if (editing) await api.candidates.update(candidate.id, payload);
      else await api.candidates.create(payload);
      toast.success(editing ? 'Alterações salvas.' : 'Candidato criado.');
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
      {identityLocked && (
        <Alert><AlertDescription>A votação já abriu: só nome, foto e status podem ser alterados.</AlertDescription></Alert>
      )}

      <FormField label="Sessão" htmlFor="candidate-session" error={fieldError('sessionId')}>
        <Select value={sessionId} onValueChange={changeSession} disabled={editing}>
          <SelectTrigger id="candidate-session"><SelectValue placeholder="Selecione a sessão" /></SelectTrigger>
          <SelectContent>
            {selectableSessions.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.year})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Cargo" htmlFor="candidate-position" error={fieldError('position')}>
          <Select value={position} onValueChange={changePosition} disabled={!session || identityLocked}>
            <SelectTrigger id="candidate-position"><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
            <SelectContent>
              {sessionPositions.map((p) => (
                <SelectItem key={p.code} value={p.code}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Número"
          htmlFor="candidate-number"
          error={fieldError('number')}
          hint={digits ? `${digits} dígitos para este cargo.` : 'Escolha o cargo primeiro.'}
        >
          <Input
            id="candidate-number"
            inputMode="numeric"
            value={number}
            disabled={!digits || identityLocked}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, digits))}
          />
        </FormField>
      </div>

      <FormField label="Partido" htmlFor="candidate-party" error={fieldError('partyId')}>
        <Select value={partyId} onValueChange={setPartyId} disabled={identityLocked}>
          <SelectTrigger id="candidate-party"><SelectValue placeholder="Selecione o partido" /></SelectTrigger>
          <SelectContent>
            {partyOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.acronym} — {p.name} ({p.number})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Nome do candidato" htmlFor="candidate-name" error={fieldError('name')}>
        <Input id="candidate-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome fictício" />
      </FormField>

      <FormField
        label="Foto (opcional)"
        htmlFor="candidate-photo"
        error={fieldError('photo')}
        hint="Um link de imagem (https://) ou uma foto tirada agora pela câmera."
      >
        <PhotoCaptureField id="candidate-photo" value={photo} onChange={setPhoto} disabled={submitting} />
      </FormField>

      {editing && (
        <FormField label="Status" htmlFor="candidate-status" hint="Candidato inativo não recebe novos votos.">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="candidate-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar candidato'}
        </Button>
      </div>
    </form>
  );
}

// `candidate` = null para criar; objeto para editar.
export function CandidateFormDialog({ open, candidate, onOpenChange, onSaved, ...formProps }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{candidate ? 'Editar candidato' : 'Novo candidato'}</DialogTitle>
          <DialogDescription>O número deve ser único para o cargo dentro da sessão.</DialogDescription>
        </DialogHeader>
        <CandidateForm
          candidate={candidate}
          {...formProps}
          onSaved={() => { onOpenChange(false); onSaved(); }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
