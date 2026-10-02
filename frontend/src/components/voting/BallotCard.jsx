import { CandidateAvatar } from '@/components/candidates/CandidateAvatar';
import { Skeleton } from '@/components/ui/skeleton';

// Mostra os dígitos digitados e, quando completos, a prévia do candidato (ou o
// aviso de que o número não corresponde a ninguém / está inativo — voto nulo).
export function BallotCard({ positionLabel, digits, digitsRequired, blank, lookup }) {
  const slots = Array.from({ length: digitsRequired }, (_, i) => digits[i] ?? '_');

  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border bg-card p-6 text-center">
      <span className="text-sm text-muted-foreground">{positionLabel}</span>

      {blank ? (
        <p className="text-lg font-medium">Voto em branco</p>
      ) : (
        <>
          <div className="flex gap-2 text-3xl font-semibold tabular-nums tracking-widest">
            {slots.map((slot, index) => (
              <span key={index} className="w-8">{slot}</span>
            ))}
          </div>

          {lookup?.loading && <Skeleton className="h-14 w-full max-w-xs" />}

          {lookup?.result?.status === 'FOUND' && (
            <div className="flex items-center gap-3">
              <CandidateAvatar
                name={lookup.result.candidate.name}
                photo={lookup.result.candidate.photo}
                className="size-14"
              />
              <div className="text-left">
                <p className="font-medium">{lookup.result.candidate.name}</p>
                <p className="text-sm text-muted-foreground">
                  {lookup.result.candidate.party?.acronym} ({lookup.result.candidate.party?.number})
                </p>
              </div>
            </div>
          )}

          {lookup?.result?.status === 'NOT_FOUND' && (
            <p className="text-sm text-danger">Nenhum candidato com este número. O voto será contado como nulo.</p>
          )}

          {lookup?.result?.status === 'INACTIVE' && (
            <p className="text-sm text-danger">Este candidato está inativo. O voto será contado como nulo.</p>
          )}
        </>
      )}
    </div>
  );
}
