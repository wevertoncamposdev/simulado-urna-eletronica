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

const FIELD_RULES = [['NAME', 'name'], ['EMAIL', 'email'], ['PASSWORD', 'password']];

export default function Register() {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      await register(name, email, password);
      navigate('/confirmar-email', { state: { email } });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/"><Logo size={56} /></Link>
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Suas sessões, cargos, partidos e candidatos ficam só na sua conta.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && !errorField && (
                <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
              )}
              <FormField label="Nome" htmlFor="register-name" error={fieldError('name')}>
                <Input id="register-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus autoComplete="name" />
              </FormField>
              <FormField label="E-mail" htmlFor="register-email" error={fieldError('email')}>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Senha" htmlFor="register-password" error={fieldError('password')} hint="Pelo menos 8 caracteres.">
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </FormField>
              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta? <Link to="/login" className="font-medium text-foreground underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
