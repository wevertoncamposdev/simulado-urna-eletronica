import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// items: [{ label, icon, onSelect, disabled }]
export function RowActions({ label, items }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Ações de ${label}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map(({ label: itemLabel, icon: Icon, onSelect, disabled }) => (
          <DropdownMenuItem key={itemLabel} onSelect={onSelect} disabled={disabled}>
            {Icon && <Icon />} {itemLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
