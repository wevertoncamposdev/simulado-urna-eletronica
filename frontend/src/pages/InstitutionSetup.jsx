import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/branding/Logo';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { fieldOfError } from '@/lib/form-errors';

const FIELD_RULES = [
  ['INSTITUTION_NAME', 'name'],
  ['INSTITUTION_ADDRESS', 'address'],
  ['INSTITUTION_CONTACT', 'contact'],
  ['INSTITUTION_WEBSITE', 'website'],
];

export default function InstitutionSetup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Já completo (ex.: acesso direto à URL depois de preencher) — nada a fazer aqui.
  if (user?.institutionProfileComplete) {
    return <Navigate to="/painel" replace />;
  }

  const errorField = fieldOfError(error, FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.institutionProfile.save({ name, address, contact, website });
      await refreshUser();
      navigate('/painel');
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size={56} />
          <h1 className="text-xl font-semibold">Dados da instituição</h1>
          <p className="text-sm text-muted-foreground">
            Antes de continuar, conte quem está usando o UrnaLab.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && !errorField && (
                <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
              )}
              <FormField label="Nome da instituição" htmlFor="institution-name" error={fieldError('name')}>
                <Input id="institution-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </FormField>
              <FormField label="Endereço" htmlFor="institution-address" error={fieldError('address')}>
                <Input id="institution-address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </FormField>
              <FormField
                label="Contato"
                htmlFor="institution-contact"
                error={fieldError('contact')}
                hint="Telefone, e-mail ou WhatsApp."
              >
                <Input id="institution-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
              </FormField>
              <FormField
                label="Site (opcional)"
                htmlFor="institution-website"
                error={fieldError('website')}
                hint="Começando com http:// ou https://."
              >
                <Input id="institution-website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </FormField>
              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Continuar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
