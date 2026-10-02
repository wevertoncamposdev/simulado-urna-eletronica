import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

export function DialogContent({ className, children, ...props }) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Primitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-card p-6 shadow-lg',
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-4" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1.5 pr-6', className)} {...props} />
);
export const DialogTitle = ({ className, ...props }) => (
  <Primitive.Title className={cn('text-lg font-semibold', className)} {...props} />
);
export const DialogDescription = ({ className, ...props }) => (
  <Primitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
);
