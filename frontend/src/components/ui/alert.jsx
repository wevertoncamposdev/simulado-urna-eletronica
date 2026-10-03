import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      default: 'bg-card',
      destructive: 'border-danger/30 bg-danger-soft text-danger',
      warning: 'border-coral/30 bg-coral-soft text-coral',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Alert = ({ className, variant, ...props }) => (
  <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
);
export const AlertTitle = ({ className, ...props }) => (
  <h5 className={cn('mb-1 font-medium leading-none', className)} {...props} />
);
export const AlertDescription = ({ className, ...props }) => (
  <div className={cn('text-sm opacity-90', className)} {...props} />
);
