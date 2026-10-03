import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/branding/Logo';
import { SessionStatusBadge } from '@/components/sessions/SessionStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { cn } from '@/lib/utils';
import { getNotifications } from '@/lib/notifications';
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
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);
  const notifications = getNotifications(user);

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" className="relative gap-1.5 px-2">
                  <span className="hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="size-3.5" />
                  {notifications.length > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-danger ring-2 ring-card"
                      aria-label={`${notifications.length} notificação pendente`}
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {notifications.length > 0 && (
                  <>
                    {notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} onSelect={() => navigate(notification.to)}>
                        <AlertTriangle className="text-danger" /> {notification.message}
                      </DropdownMenuItem>
                    ))}
                    <div className="my-1 h-px bg-border" aria-hidden="true" />
                  </>
                )}
                <DropdownMenuItem onSelect={() => navigate('/perfil')}>
                  <Settings /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>
                  <LogOut /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
