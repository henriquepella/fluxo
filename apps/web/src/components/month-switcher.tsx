'use client';

import { monthLabel, shiftMonth } from '../lib/format';

export function MonthSwitcher({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        ‹
      </button>
      <span className="min-w-36 text-center text-sm font-medium capitalize">
        {monthLabel(month)}
      </span>
      <button
        type="button"
        aria-label="Próximo mês"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        ›
      </button>
    </div>
  );
}
