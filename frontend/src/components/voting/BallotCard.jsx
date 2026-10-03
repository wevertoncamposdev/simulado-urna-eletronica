import { Link } from 'react-router-dom';
import { getPositionInfo, positionSlug } from '@/content/electoral-system';

// Mostra o cargo atual e os dígitos digitados. A prévia do candidato (foto,
// nome, partido) fica no painel lateral maior — ver CandidatePreviewPanel.
export function BallotCard({ positionCode, positionLabel, digits, digitsRequired, blank, showLearnMore = true }) {
  const slots = Array.from({ length: digitsRequired }, (_, i) => digits[i] ?? '_');

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-3 text-center md:min-h-32 md:gap-4 md:p-6">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground md:text-sm">{positionLabel}</span>
        {showLearnMore && positionCode && getPositionInfo(positionCode) && (
          <Link
            to={`/sistema-eleitoral#${positionSlug(positionCode)}`}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Saiba mais sobre este cargo
          </Link>
        )}
      </div>

      {blank ? (
        <p className="text-base font-medium md:text-lg">Voto em branco</p>
      ) : (
        <div className="flex gap-1.5 text-2xl font-semibold tabular-nums tracking-widest md:gap-2 md:text-3xl">
          {slots.map((slot, index) => (
            <span key={index} className="w-6 md:w-8">{slot}</span>
          ))}
        </div>
      )}
    </div>
  );
}
