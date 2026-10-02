import * as Primitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;

export function DropdownMenuContent({ className, ...props }) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        align="end"
        sideOffset={4}
        className={cn('z-50 min-w-40 rounded-md border bg-card p-1 shadow-md', className)}
        {...props}
      />
    </Primitive.Portal>
  );
}

export const DropdownMenuItem = ({ className, ...props }) => (
  <Primitive.Item
    className={cn(
      'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted [&_svg]:size-4',
      className,
    )}
    {...props}
  />
);
