import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ErrorState({ error, onRetry }) {
  const offline = error?.code === 'NETWORK_ERROR';
  return (
    <Alert variant="destructive">
      <AlertTitle>{offline ? 'API indisponível' : 'Não foi possível carregar'}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <span>
          {offline
            ? 'Verifique se o backend está rodando (npm run dev na pasta backend).'
            : error?.message}
        </span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
