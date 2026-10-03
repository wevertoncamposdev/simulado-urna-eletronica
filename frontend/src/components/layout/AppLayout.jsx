import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/branding/Logo';
import { SessionStatusBadge } from '@/components/sessions/SessionStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { cn } from '@/lib/utils';
import { MobileNav, Sidebar } from './Sidebar';

const SIDEBAR_COLLAPSED_KEY = 'urna-sidebar-collapsed';

function readStoredCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppLayout() {
  const { session } = useCurrentSession();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Sem localStorage (modo privado, etc.): a preferência só não sobrevive ao reload.
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-card px-6 py-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={toggleSidebar}
              aria-label={collapsed ? 'Mostrar menu' : 'Ocultar menu'}
              title={collapsed ? 'Mostrar menu' : 'Ocultar menu'}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            {/* A sidebar já carrega a marca; aqui só reaparece quando ela some: no celular (sempre) ou quando o botão acima a recolhe. */}
            <div className={cn('flex items-center gap-2 md:hidden', collapsed && 'md:flex')}>
              <Logo size={28} />
              <span className="font-medium">UrnaLab</span>
            </div>
          </div>
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
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
            <span className="hidden sm:inline">{user?.name}</span>
            <Button type="button" variant="ghost" size="icon" onClick={logout} aria-label="Sair" title="Sair">
              <LogOut />
            </Button>
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
