import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/branding/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // O backend sempre responde sucesso (não revela se o e-mail tem conta) — o frontend
  // segue a mesma regra: a mensagem é igual não importa o resultado.
  const [sent, setSent] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setNetworkError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setNetworkError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/"><Logo size={56} /></Link>
          <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {sent ? (
              <Alert>
                <AlertDescription>
                  Se esse e-mail tiver uma conta, enviamos um link de redefinição.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {networkError && (
                  <Alert variant="destructive"><AlertDescription>{networkError.message}</AlertDescription></Alert>
                )}
                <FormField label="E-mail" htmlFor="forgot-password-email">
                  <Input
                    id="forgot-password-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    autoComplete="email"
                  />
                </FormField>
                <Button type="submit" className="mt-2" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-foreground underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
