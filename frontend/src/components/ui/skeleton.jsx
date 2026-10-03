import { cn } from '@/lib/utils';

export const Skeleton = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-lg bg-muted', className)} {...props} />
);
