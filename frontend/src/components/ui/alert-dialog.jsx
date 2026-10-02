import * as Primitive from '@radix-ui/react-alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AlertDialog = Primitive.Root;
export const AlertDialogTrigger = Primitive.Trigger;

export function AlertDialogContent({ className, ...props }) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Primitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-card p-6 shadow-lg',
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-2', className)} {...props} />
);
export const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);
export const AlertDialogTitle = ({ className, ...props }) => (
  <Primitive.Title className={cn('text-lg font-semibold', className)} {...props} />
);
export const AlertDialogDescription = ({ className, ...props }) => (
  <Primitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
);
export const AlertDialogAction = ({ className, ...props }) => (
  <Primitive.Action className={cn(buttonVariants(), className)} {...props} />
);
export const AlertDialogCancel = ({ className, ...props }) => (
  <Primitive.Cancel className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />
);
