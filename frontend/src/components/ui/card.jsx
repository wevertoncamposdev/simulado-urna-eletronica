import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }) => (
  <div className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...props} />
);
export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 p-5 pb-3', className)} {...props} />
);
export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-base font-semibold leading-snug', className)} {...props} />
);
export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);
export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-5 pt-2', className)} {...props} />
);
