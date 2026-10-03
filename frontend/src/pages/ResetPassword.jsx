import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/branding/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError({ message: 'As senhas não coincidem.' });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      toast.success('Senha redefinida. Faça login com a nova senha.');
      navigate('/login');
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
          <h1 className="text-xl font-semibold">Definir nova senha</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error.message}
                    {error.code === 'RESET_TOKEN_INVALID' && (
                      <>
                        {' '}
                        <Link to="/esqueci-senha" className="font-medium underline">Peça um novo link.</Link>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <FormField label="Nova senha" htmlFor="reset-password-password" hint="Pelo menos 8 caracteres.">
                <Input
                  id="reset-password-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="new-password"
                />
              </FormField>
              <FormField label="Confirme a nova senha" htmlFor="reset-password-confirm">
                <Input
                  id="reset-password-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </FormField>
              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
