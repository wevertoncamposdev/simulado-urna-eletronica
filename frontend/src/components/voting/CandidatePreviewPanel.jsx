import { Frown, UserRound, Vote } from 'lucide-react';
import { CandidateAvatar } from '@/components/candidates/CandidateAvatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PHOTO_SIZE = 'size-14 shrink-0 text-lg md:size-40 md:text-4xl';
const PLACEHOLDER_CIRCLE =
  'flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed text-muted-foreground md:size-40';

// Painel da foto do candidato: no celular, uma faixa compacta (foto ao lado do
// nome) acima do teclado — no desktop/tablet (md+), o painel maior e vertical
// ao lado da cédula, como o monitor separado de uma urna real.
export function CandidatePreviewPanel({ blank, lookup }) {
  let content;

  if (blank) {
    content = (
      <>
        <div className={PLACEHOLDER_CIRCLE}>
          <Vote className="size-6 md:size-14" />
        </div>
        <p className="text-base font-semibold md:text-lg">Voto em branco</p>
      </>
    );
  } else if (lookup?.loading) {
    content = <Skeleton className="size-14 shrink-0 rounded-full md:size-40" />;
  } else if (lookup?.result?.status === 'FOUND') {
    const { candidate } = lookup.result;
    content = (
      <>
        <CandidateAvatar name={candidate.name} photo={candidate.photo} className={PHOTO_SIZE} />
        <div className="min-w-0 md:text-center">
          <p className="truncate text-base font-semibold md:text-xl">{candidate.name}</p>
          <p className="truncate text-sm text-muted-foreground md:text-base">
            {candidate.party?.acronym} ({candidate.party?.number})
          </p>
        </div>
      </>
    );
  } else if (lookup?.result?.status === 'NOT_FOUND') {
    content = (
      <>
        <Frown className="size-6 shrink-0 text-danger md:size-14" />
        <div>
          <p className="text-sm font-medium text-danger md:text-base">Nenhum candidato com este número</p>
          <p className="text-xs text-muted-foreground md:text-sm">O voto será contado como nulo.</p>
        </div>
      </>
    );
  } else if (lookup?.result?.status === 'INACTIVE') {
    content = (
      <>
        <Frown className="size-6 shrink-0 text-danger md:size-14" />
        <div>
          <p className="text-sm font-medium text-danger md:text-base">Este candidato está inativo</p>
          <p className="text-xs text-muted-foreground md:text-sm">O voto será contado como nulo.</p>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className={PLACEHOLDER_CIRCLE}>
          <UserRound className="size-6 md:size-16" />
        </div>
        <p className="text-sm text-muted-foreground md:text-base">Digite o número do candidato</p>
      </>
    );
  }

  return (
    <Card className="flex flex-row items-center gap-3 p-3 md:flex-col md:justify-center md:gap-4 md:p-6 md:text-center md:min-h-80">
      {content}
    </Card>
  );
}
