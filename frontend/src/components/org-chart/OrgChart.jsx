import { Fragment } from 'react';
import { cn } from '@/lib/utils';

// Organograma genérico: uma matriz linha x coluna (ex.: Poder x Esfera de
// governo) onde cada célula pode ter um ou mais nós clicáveis. Não sabe nada
// sobre cargos, eleições ou candidatos — hoje mostra os cargos do sistema
// eleitoral brasileiro (ElectoralSystem.jsx); no futuro, a mesma estrutura
// (rows/columns/items) pode mostrar os candidatos vencedores de uma sessão
// finalizada, só trocando o que cada `item` carrega.
export function OrgChart({ rows, columns, items, selectedId, onSelect }) {
  const cellItems = (rowId, columnId) => items.filter((item) => item.rowId === rowId && item.columnId === columnId);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px] gap-2 md:gap-3"
        style={{ gridTemplateColumns: `minmax(90px, 140px) repeat(${columns.length}, 1fr)` }}
      >
        <div />
        {columns.map((column) => (
          <div key={column.id} className="self-end pb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {column.label}
          </div>
        ))}

        {rows.map((row) => (
          <Fragment key={row.id}>
            <div className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {row.label}
            </div>
            {columns.map((column) => {
              const cell = cellItems(row.id, column.id);
              return (
                <div key={column.id} className="flex flex-col gap-1.5 rounded-lg border border-dashed p-1.5 md:gap-2 md:p-2">
                  {cell.length === 0 ? (
                    <span className="flex h-full items-center justify-center text-xs text-muted-foreground/50">—</span>
                  ) : (
                    cell.map((item) => (
                      <OrgChartNode key={item.id} item={item} selected={item.id === selectedId} onClick={() => onSelect?.(item.id)} />
                    ))
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function OrgChartNode({ item, selected, onClick }) {
  return (
    <button
      type="button"
      id={item.anchorId}
      onClick={onClick}
      className={cn(
        'scroll-mt-4 rounded-lg border bg-card px-2 py-1.5 text-left text-xs shadow-sm transition hover:border-primary md:px-3 md:py-2 md:text-sm',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{item.title}</span>
        {item.badge}
      </div>
      {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
      {item.meta}
    </button>
  );
}
