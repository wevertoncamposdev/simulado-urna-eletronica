import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mostra a mensagem do backend junto do campo certo, a partir do código do erro.
const FIELD_BY_CODE = [['NAME', 'name'], ['YEAR', 'year'], ['POSITION', 'positions']];

function fieldOf(error) {
  const hit = error && FIELD_BY_CODE.find(([key]) => error.code?.includes(key));
  return hit ? hit[1] : null;
}

function FieldError({ children }) {
  return children ? <p className="text-sm text-danger">{children}</p> : null;
}

export function SessionForm({ positions, initial, error, submitting, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
  const [selected, setSelected] = useState(initial?.positions ?? []);

  const errorField = fieldOf(error);
  const fieldError = (field) => (errorField === field ? error.message : null);

  const togglePosition = (code, checked) =>
    setSelected((current) => (checked ? [...current, code] : current.filter((c) => c !== code)));

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, year: year === '' ? null : Number(year), positions: selected });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {error && !errorField && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="session-name">Nome da sessão</Label>
        <Input
          id="session-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Eleição Geral 2026"
          aria-invalid={errorField === 'name'}
          autoFocus
        />
        <FieldError>{fieldError('name')}</FieldError>
      </div>

      <div className="flex max-w-40 flex-col gap-2">
        <Label htmlFor="session-year">Ano</Label>
        <Input
          id="session-year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-invalid={errorField === 'year'}
        />
        <FieldError>{fieldError('year')}</FieldError>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Cargos disponíveis</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {positions.map((position) => (
            <Label
              key={position.code}
              htmlFor={`position-${position.code}`}
              className="flex cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2.5 font-normal hover:bg-muted/50"
            >
              <Checkbox
                id={`position-${position.code}`}
                checked={selected.includes(position.code)}
                onCheckedChange={(checked) => togglePosition(position.code, checked === true)}
              />
              <span className="flex-1">{position.label}</span>
              <span className="text-xs text-muted-foreground">{position.digits} dígitos</span>
            </Label>
          ))}
        </div>
        <FieldError>{fieldError('positions')}</FieldError>
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
