'use client';

import { useState } from 'react';
import { formatBRL, monthShortLabel } from '../lib/format';
import type { MonthlyTotals } from '../lib/types';

const WIDTH = 560;
const HEIGHT = 190;
const BASELINE = HEIGHT - 22;
const TOP_PAD = 10;

/**
 * Grouped bars, income vs. expense, for the last N months. Identity is carried
 * by the legend and the hover tooltip (values stay in ink text, per chart rules);
 * bars are thin, rounded and animate up from the baseline.
 */
export function MonthlyChart({ data }: { data: MonthlyTotals[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...data.flatMap((d) => [d.incomeCents, d.expenseCents]));
  const groupWidth = WIDTH / data.length;
  const barWidth = Math.min(20, groupWidth / 2 - 6);

  const barHeight = (cents: number) =>
    cents === 0 ? 2 : Math.max(3, (cents / max) * (BASELINE - TOP_PAD));

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden />
          Despesas
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Evolução mensal de receitas e despesas"
        onMouseLeave={() => setHovered(null)}
      >
        {/* recessive gridlines */}
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            x2={WIDTH}
            y1={BASELINE - fraction * (BASELINE - TOP_PAD)}
            y2={BASELINE - fraction * (BASELINE - TOP_PAD)}
            className="stroke-zinc-100 dark:stroke-zinc-800"
            strokeWidth="1"
          />
        ))}
        <line
          x1="0"
          x2={WIDTH}
          y1={BASELINE}
          y2={BASELINE}
          className="stroke-zinc-200 dark:stroke-zinc-700"
          strokeWidth="1"
        />

        {data.map((entry, index) => {
          const center = index * groupWidth + groupWidth / 2;
          const incomeHeight = barHeight(entry.incomeCents);
          const expenseHeight = barHeight(entry.expenseCents);
          const dimmed = hovered !== null && hovered !== index;

          return (
            <g key={entry.month} opacity={dimmed ? 0.4 : 1} className="transition-opacity">
              <rect
                x={center - barWidth - 1}
                y={BASELINE - incomeHeight}
                width={barWidth}
                height={incomeHeight}
                rx="3"
                className="animate-grow-y fill-emerald-500"
                style={{ animationDelay: `${index * 60}ms` }}
              />
              <rect
                x={center + 1}
                y={BASELINE - expenseHeight}
                width={barWidth}
                height={expenseHeight}
                rx="3"
                className="animate-grow-y fill-rose-500"
                style={{ animationDelay: `${index * 60 + 40}ms` }}
              />
              <text
                x={center}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize="11"
                className="fill-zinc-400 capitalize dark:fill-zinc-500"
              >
                {monthShortLabel(entry.month)}
              </text>
              {/* hover hit target: the whole month column */}
              <rect
                x={index * groupWidth}
                y="0"
                width={groupWidth}
                height={HEIGHT}
                fill="transparent"
                onMouseEnter={() => setHovered(index)}
              />
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div
          className="pointer-events-none absolute bottom-14 z-10 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          style={{ left: `${((hovered + 0.5) / data.length) * 100}%` }}
          role="status"
        >
          <p className="mb-1 font-medium capitalize text-zinc-700 dark:text-zinc-200">
            {monthShortLabel(data[hovered].month)} · {data[hovered].month.slice(0, 4)}
          </p>
          <p className="flex items-center gap-1.5 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Receitas:{' '}
            <span className="font-medium tabular-nums">{formatBRL(data[hovered].incomeCents)}</span>
          </p>
          <p className="flex items-center gap-1.5 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
            Despesas:{' '}
            <span className="font-medium tabular-nums">
              {formatBRL(data[hovered].expenseCents)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
