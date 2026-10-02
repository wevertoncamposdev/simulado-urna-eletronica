import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {Icon && <Icon className="size-8 text-muted-foreground" />}
        <div>
          <p className="font-medium">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
