import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/branding/Logo';
import { useAuth } from '@/hooks/useAuth';
import { fieldOfError } from '@/lib/form-errors';

const FIELD_RULES = [['VERIFICATION_CODE', 'code']];

export default function ConfirmEmail() {
  const { status, verifyEmail, resendVerification } = useAuth();
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);

  // Sem e-mail no state (ex.: acesso direto à URL) não tem o que confirmar.
  if (!email) {
    return <Navigate to="/login" replace />;
  }
  if (status === 'authenticated') {
    return <Navigate to="/painel" replace />;
  }

  const errorField = fieldOfError(error, FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await verifyEmail(email, code);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendVerification(email);
      toast.success('Código reenviado.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/"><Logo size={56} /></Link>
          <h1 className="text-xl font-semibold">Confirme seu e-mail</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um código de 6 dígitos para <strong>{email}</strong>.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && !errorField && (
                <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
              )}
              <FormField label="Código" htmlFor="confirm-email-code" error={fieldError('code')}>
                <Input
                  id="confirm-email-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </FormField>
              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? 'Confirmando...' : 'Confirmar'}
              </Button>
              <Button type="button" variant="ghost" disabled={resending} onClick={handleResend}>
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
