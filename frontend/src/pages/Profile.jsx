import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, Landmark, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { fieldOfError } from '@/lib/form-errors';
import { api } from '@/services/api';

// Mesmos limites de backend/src/rules/institution-profile-rules.js (duplicado só pra
// validar no cliente antes de bater na API — o backend continua a fonte de verdade).
const LIMITS = { nameMaxLength: 150, addressMaxLength: 250, websiteMaxLength: 200 };
// Mesma forma aceita em backend/src/services/institution-profile.service.js: protocolo
// + domínio com pelo menos um ponto.
const WEBSITE_PATTERN = /^https?:\/\/[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

const PROFILE_FIELD_RULES = [
  ['INSTITUTION_NAME', 'name'],
  ['INSTITUTION_ADDRESS', 'address'],
  ['INSTITUTION_CONTACT', 'contact'],
  ['INSTITUTION_WEBSITE', 'website'],
];
const PASSWORD_FIELD_RULES = [
  ['CURRENT_PASSWORD', 'currentPassword'],
  ['USER_PASSWORD', 'newPassword'],
];

// Formata enquanto digita: (11) 99999-0000 ou (11) 9999-0000, nunca mais que 11 dígitos.
function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  const splitAt = digits.length <= 10 ? 6 : 7;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, splitAt)}-${digits.slice(splitAt)}`;
}

function validateInstitution({ name, address, contact, website }) {
  if (!name.trim()) return { code: 'INSTITUTION_NAME_REQUIRED', message: 'Informe o nome da instituição.' };
  if (name.length > LIMITS.nameMaxLength) {
    return { code: 'INSTITUTION_NAME_REQUIRED', message: `O nome pode ter no máximo ${LIMITS.nameMaxLength} caracteres.` };
  }
  if (!address.trim()) return { code: 'INSTITUTION_ADDRESS_REQUIRED', message: 'Informe o endereço da instituição.' };
  if (address.length > LIMITS.addressMaxLength) {
    return { code: 'INSTITUTION_ADDRESS_REQUIRED', message: `O endereço pode ter no máximo ${LIMITS.addressMaxLength} caracteres.` };
  }
  const phoneDigits = contact.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return { code: 'INSTITUTION_CONTACT_INVALID', message: 'Informe um telefone válido, com DDD (ex.: (11) 99999-0000).' };
  }
  const trimmedWebsite = website.trim();
  if (trimmedWebsite) {
    if (!WEBSITE_PATTERN.test(trimmedWebsite)) {
      return { code: 'INSTITUTION_WEBSITE_INVALID', message: 'Informe um link válido (ex.: https://suainstituicao.com.br).' };
    }
    if (trimmedWebsite.length > LIMITS.websiteMaxLength) {
      return { code: 'INSTITUTION_WEBSITE_INVALID', message: `O link pode ter no máximo ${LIMITS.websiteMaxLength} caracteres.` };
    }
  }
  return null;
}

function AccountSection() {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <UserRound className="size-5 text-muted-foreground" />
        <div>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Dados de quem está logado.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField label="Nome" htmlFor="profile-name">
          <Input id="profile-name" value={user?.name ?? ''} disabled />
        </FormField>
        <FormField label="E-mail" htmlFor="profile-email">
          <Input id="profile-email" value={user?.email ?? ''} disabled />
        </FormField>
      </CardContent>
    </Card>
  );
}

function InstitutionSection() {
  const { refreshUser } = useAuth();
  const { data: profile, error: loadError, loading, reload } = useAsync(() => api.institutionProfile.get(), []);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !loadError) {
      setName(profile?.name ?? '');
      setAddress(profile?.address ?? '');
      setContact(profile?.contact ?? '');
      setWebsite(profile?.website ?? '');
    }
  }, [profile, loading, loadError]);

  const errorField = fieldOfError(error, PROFILE_FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  async function handleSubmit(event) {
    event.preventDefault();
    const clientError = validateInstitution({ name, address, contact, website });
    if (clientError) {
      setError(clientError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.institutionProfile.save({ name, address, contact, website });
      await refreshUser();
      toast.success('Dados da instituição salvos.');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <Landmark className="size-5 text-muted-foreground" />
        <div>
          <CardTitle>Instituição</CardTitle>
          <CardDescription>Quem está promovendo esta eleição — obrigatório para criar sessões.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64" />
        ) : loadError ? (
          <ErrorState error={loadError} onRetry={reload} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {!profile && (
              <Alert variant="warning">
                <AlertDescription>
                  Complete os dados abaixo — eles são obrigatórios para criar sessões eleitorais.
                </AlertDescription>
              </Alert>
            )}
            {error && !errorField && (
              <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
            )}
            <FormField label="Nome da instituição" htmlFor="institution-name" error={fieldError('name')}>
              <Input
                id="institution-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={LIMITS.nameMaxLength}
                placeholder="Ex.: Colégio Estadual UrnaLab"
              />
            </FormField>
            <FormField label="Endereço" htmlFor="institution-address" error={fieldError('address')}>
              <Input
                id="institution-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={LIMITS.addressMaxLength}
                placeholder="Rua, número, bairro, cidade"
              />
            </FormField>
            <FormField label="Telefone" htmlFor="institution-contact" error={fieldError('contact')} hint="Com DDD.">
              <Input
                id="institution-contact"
                value={contact}
                onChange={(e) => setContact(maskPhone(e.target.value))}
                placeholder="(11) 99999-0000"
                inputMode="tel"
              />
            </FormField>
            <FormField
              label="Site (opcional)"
              htmlFor="institution-website"
              error={fieldError('website')}
              hint="Começando com http:// ou https://."
            >
              <Input
                id="institution-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={LIMITS.websiteMaxLength}
                placeholder="https://suainstituicao.com.br"
              />
            </FormField>
            <Button type="submit" className="mt-2 self-start" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const errorField = fieldOfError(error, PASSWORD_FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError({ code: 'USER_PASSWORD_TOO_SHORT', message: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError({ message: 'As senhas não coincidem.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      toast.success('Senha atualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <KeyRound className="size-5 text-muted-foreground" />
        <div>
          <CardTitle>Senha</CardTitle>
          <CardDescription>Troque sua senha de acesso.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && !errorField && (
            <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
          )}
          <FormField label="Senha atual" htmlFor="password-current" error={fieldError('currentPassword')}>
            <Input
              id="password-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="Nova senha" htmlFor="password-new" error={fieldError('newPassword')} hint="Pelo menos 8 caracteres.">
            <Input
              id="password-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirme a nova senha" htmlFor="password-confirm">
            <Input
              id="password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" className="mt-2 self-start" variant="outline" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Atualizar senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Meu perfil" description="Seus dados de conta e os dados da instituição." />
      <AccountSection />
      <InstitutionSection />
      <PasswordSection />
    </div>
  );
}
