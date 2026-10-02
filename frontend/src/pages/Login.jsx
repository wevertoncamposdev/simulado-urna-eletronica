import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Vote } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { fieldOfError } from '@/lib/form-errors';

const FIELD_RULES = [['EMAIL', 'email'], ['PASSWORD', 'password']];

export default function Login() {
  const { status, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from ?? '/'} replace />;
  }

  const errorField = fieldOfError(error, FIELD_RULES);
  const fieldError = (field) => (errorField === field ? error.message : null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Vote className="size-6" />
          </div>
          <h1 className="text-xl font-semibold">Simulador de Urna</h1>
          <p className="text-sm text-muted-foreground">Entre na sua conta para continuar.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && !errorField && (
                <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
              )}
              <FormField label="E-mail" htmlFor="login-email" error={fieldError('email')}>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Senha" htmlFor="login-password" error={fieldError('password')}>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </FormField>
              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta? <Link to="/registro" className="font-medium text-foreground underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
