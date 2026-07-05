import { BusinessRuleViolationException } from '../../domain/exceptions/business-rule-violation.exception';

export interface MonthRange {
  /** First instant of the month (UTC, inclusive). */
  from: Date;
  /** First instant of the next month (UTC, exclusive). */
  to: Date;
  /** Canonical `YYYY-MM` label. */
  label: string;
}

/** Resolves a `YYYY-MM` string (defaults to the current month) into a UTC range. */
export function resolveMonthRange(month?: string): MonthRange {
  const label = month ?? new Date().toISOString().slice(0, 7);
  const match = /^(\d{4})-(\d{2})$/.exec(label);
  const year = match ? Number(match[1]) : NaN;
  const monthNumber = match ? Number(match[2]) : NaN;

  if (!match || monthNumber < 1 || monthNumber > 12) {
    throw new BusinessRuleViolationException(`Invalid month "${label}" — expected YYYY-MM`);
  }

  return {
    from: new Date(Date.UTC(year, monthNumber - 1, 1)),
    to: new Date(Date.UTC(year, monthNumber, 1)),
    label,
  };
}
