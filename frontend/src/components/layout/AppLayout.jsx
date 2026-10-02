import { Link, Outlet } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { SessionStatusBadge } from '@/components/sessions/SessionStatusBadge';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { MobileNav, Sidebar } from './Sidebar';

export function AppLayout() {
  const { session } = useCurrentSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-card px-6 py-3">
          <span className="font-medium">Simulador de Urna</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sessão atual:</span>
            {session ? (
              <>
                <Link to={`/sessoes/${session.id}`} className="font-medium text-foreground hover:underline">
                  {session.name}
                </Link>
                <SessionStatusBadge status={session.status} />
              </>
            ) : (
              <>
                <span>nenhuma</span> <Badge>Sem sessão</Badge>
              </>
            )}
          </div>
        </header>
        <MobileNav />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
