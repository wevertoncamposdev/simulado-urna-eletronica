import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/branding/Logo';
import { useAuth } from '@/hooks/useAuth';
import { fieldOfError } from '@/lib/form-errors';

const FIELD_RULES = [['EMAIL', 'email'], ['PASSWORD', 'password']];

export default function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sempre vai pro dashboard — nunca pra onde o usuário estava antes de ser
  // desviado pro login (ver RequireAuth em App.jsx).
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
      await login(email, password);
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/confirmar-email', { state: { email } });
        return;
      }
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/"><Logo size={56} /></Link>
          <h1 className="text-xl font-semibold">UrnaLab</h1>
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
              <div className="text-right text-sm">
                <Link to="/esqueci-senha" className="font-medium text-foreground underline">
                  Esqueci minha senha
                </Link>
              </div>
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
