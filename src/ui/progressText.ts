// Formats credit values consistently for all progress indicators.
import type { CreditProgress } from '../domain/progress';

export function creditLabel({ capped, required, overflow }: CreditProgress) {
  return `${capped} / ${required} C${overflow ? ` (+${overflow})` : ''}`;
}

export function remainingLabel({ remaining }: CreditProgress) {
  return remaining ? `noch ${remaining} C` : '✓ erfüllt';
}
