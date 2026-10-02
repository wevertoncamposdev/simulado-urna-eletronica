import { Frown, UserRound, Vote } from 'lucide-react';
import { CandidateAvatar } from '@/components/candidates/CandidateAvatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PHOTO_SIZE = 'size-40 text-4xl';
const PLACEHOLDER_CIRCLE = 'flex size-40 items-center justify-center rounded-full border-2 border-dashed text-muted-foreground';

// Painel lateral, maior, dedicado só à foto do candidato — como o monitor
// separado de uma urna real, enquanto os dígitos ficam no BallotCard ao lado.
export function CandidatePreviewPanel({ blank, lookup }) {
  let content;

  if (blank) {
    content = (
      <>
        <div className={PLACEHOLDER_CIRCLE}>
          <Vote className="size-14" />
        </div>
        <p className="text-lg font-semibold">Voto em branco</p>
      </>
    );
  } else if (lookup?.loading) {
    content = <Skeleton className="size-40 rounded-full" />;
  } else if (lookup?.result?.status === 'FOUND') {
    const { candidate } = lookup.result;
    content = (
      <>
        <CandidateAvatar name={candidate.name} photo={candidate.photo} className={PHOTO_SIZE} />
        <div>
          <p className="text-xl font-semibold">{candidate.name}</p>
          <p className="text-muted-foreground">
            {candidate.party?.acronym} ({candidate.party?.number})
          </p>
        </div>
      </>
    );
  } else if (lookup?.result?.status === 'NOT_FOUND') {
    content = (
      <>
        <Frown className="size-14 text-danger" />
        <div>
          <p className="font-medium text-danger">Nenhum candidato com este número</p>
          <p className="text-sm text-muted-foreground">O voto será contado como nulo.</p>
        </div>
      </>
    );
  } else if (lookup?.result?.status === 'INACTIVE') {
    content = (
      <>
        <Frown className="size-14 text-danger" />
        <div>
          <p className="font-medium text-danger">Este candidato está inativo</p>
          <p className="text-sm text-muted-foreground">O voto será contado como nulo.</p>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className={PLACEHOLDER_CIRCLE}>
          <UserRound className="size-16" />
        </div>
        <p className="text-sm text-muted-foreground">Digite o número do candidato</p>
      </>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center gap-4 p-6 text-center md:min-h-80">
      {content}
    </Card>
  );
}
