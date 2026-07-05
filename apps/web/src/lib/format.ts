const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

/** Formats an ISO date in UTC — transaction dates are stored as UTC midnight. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(iso));
}

/** `YYYY-MM` of the current month in local time. */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** "jul" — short month label for chart axes. */
export function monthShortLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, monthNumber - 1, 1)))
    .replace('.', '');
}

/** "julho de 2026" */
export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

/** `YYYY-MM-DD` of today in local time (for date inputs). */
export function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Parses a `<input type="number">` value in reais into integer cents. */
export function reaisToCents(value: string): number {
  return Math.round(Number.parseFloat(value.replace(',', '.')) * 100);
}

export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2);
}
