import { Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DIGIT_ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];

// Teclado numérico da votação. Aceita clique ou teclado físico (ver useKeypadKeys).
export function VoteKeypad({ onDigit, onClear, onBlank, disabled }) {
  const digitButton = (digit) => (
    <Button
      key={digit}
      type="button"
      variant="outline"
      className="h-14 text-lg"
      disabled={disabled}
      onClick={() => onDigit(digit)}
    >
      {digit}
    </Button>
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {DIGIT_ROWS.flat().map(digitButton)}
      <Button type="button" variant="outline" className="h-14" disabled={disabled} onClick={onBlank}>
        Branco
      </Button>
      {digitButton('0')}
      <Button type="button" variant="outline" className="h-14" disabled={disabled} onClick={onClear}>
        <Delete /> Corrige
      </Button>
    </div>
  );
}
