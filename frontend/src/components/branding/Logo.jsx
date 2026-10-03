import { cn } from '@/lib/utils';

// Logo oficial do UrnaLab (ver frontend/public/img) — substitui o ícone genérico
// que marcava a marca antes de existir uma identidade visual própria. Reaproveitado
// em todo ponto de entrada do app (landing, login, cadastro, sidebar, votação pública).
export function Logo({ size = 40, className }) {
  return (
    <img
      src="/img/urnalab-logo.png"
      alt="UrnaLab"
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
