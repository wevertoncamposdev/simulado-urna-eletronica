import { useState } from 'react';
import { resolvePhotoUrl } from '@/services/api';
import { cn } from '@/lib/utils';

const initialsOf = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

// Mostra a foto; se não houver (ou falhar ao carregar), usa as iniciais.
export function CandidateAvatar({ name, photo, className }) {
  const [failed, setFailed] = useState(false);
  const base = 'size-9 shrink-0 rounded-full';

  if (photo && !failed) {
    return (
      <img
        src={resolvePhotoUrl(photo)}
        alt=""
        className={cn(base, 'object-cover', className)}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span aria-hidden="true" className={cn(base, 'flex items-center justify-center bg-muted text-xs font-medium text-muted-foreground', className)}>
      {initialsOf(name)}
    </span>
  );
}
