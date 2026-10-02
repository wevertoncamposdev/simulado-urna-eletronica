import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Briefcase, ClipboardList, Flag, History, IdCard, LayoutDashboard, ShieldCheck, Users, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Eleições', to: '/sessoes', icon: ClipboardList },
  { label: 'Cargos', to: '/cargos', icon: Briefcase },
  { label: 'Partidos', to: '/partidos', icon: Flag },
  { label: 'Pessoas', to: '/pessoas', icon: IdCard },
  { label: 'Candidatos', to: '/candidatos', icon: Users },
  { label: 'Votação', to: '/votacao', icon: Vote },
  { label: 'Resultados', to: '/resultados', icon: BarChart3 },
  { label: 'Auditoria', to: '/auditoria', icon: ShieldCheck },
  { label: 'Sistema eleitoral', to: '/sistema-eleitoral', icon: BookOpen },
  { label: 'Linha do tempo', to: '/linha-do-tempo', icon: History },
];

const itemClass = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm';

export function Sidebar({ collapsed }) {
  if (collapsed) return null;

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="px-5 py-5 text-base font-semibold text-white">Simulador de Eleição</div>
      <nav className="flex flex-col gap-1 px-3" aria-label="Principal">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(itemClass, 'hover:bg-white/10', isActive && 'bg-white/10 text-white')
            }
          >
            <Icon className="size-4" /> {label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto px-5 py-4 text-xs leading-relaxed opacity-60">
        Projeto educacional. Não é uma urna eletrônica oficial.
      </p>
    </aside>
  );
}

// Navegação compacta para telas pequenas (a sidebar fica oculta abaixo de md).
export function MobileNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 md:hidden" aria-label="Principal">
      {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn('flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm', isActive && 'bg-muted font-medium')
          }
        >
          <Icon className="size-4" /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
