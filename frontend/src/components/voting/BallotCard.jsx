import { Link } from 'react-router-dom';
import { getPositionInfo, positionSlug } from '@/content/electoral-system';

// Mostra o cargo atual e os dígitos digitados. A prévia do candidato (foto,
// nome, partido) fica no painel lateral maior — ver CandidatePreviewPanel.
export function BallotCard({ positionCode, positionLabel, digits, digitsRequired, blank }) {
  const slots = Array.from({ length: digitsRequired }, (_, i) => digits[i] ?? '_');

  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-4 rounded-lg border bg-card p-6 text-center">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm text-muted-foreground">{positionLabel}</span>
        {positionCode && getPositionInfo(positionCode) && (
          <Link
            to={`/sistema-eleitoral#${positionSlug(positionCode)}`}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Saiba mais sobre este cargo
          </Link>
        )}
      </div>

      {blank ? (
        <p className="text-lg font-medium">Voto em branco</p>
      ) : (
        <div className="flex gap-2 text-3xl font-semibold tabular-nums tracking-widest">
          {slots.map((slot, index) => (
            <span key={index} className="w-8">{slot}</span>
          ))}
        </div>
      )}
    </div>
  );
}
