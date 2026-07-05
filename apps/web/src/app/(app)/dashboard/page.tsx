'use client';

import { useEffect, useState } from 'react';
import { MonthSwitcher } from '../../../components/month-switcher';
import { EmptyState, ErrorNote, Spinner } from '../../../components/ui';
import { api } from '../../../lib/api';
import { currentMonth, formatBRL, formatDate } from '../../../lib/format';
import type { DashboardSummary } from '../../../lib/types';

function StatTile({
  label,
  cents,
  tone,
}: {
  label: string;
  cents: number;
  tone?: 'income' | 'expense' | 'net';
}) {
  const valueColor =
    tone === 'income'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'expense'
        ? 'text-red-600 dark:text-red-400'
        : cents < 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-zinc-900 dark:text-zinc-50';

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 truncate text-xl font-semibold tabular-nums ${valueColor}`}
        title={formatBRL(cents)}
      >
        {formatBRL(cents)}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const data = await api<DashboardSummary>(`/dashboard/summary?month=${month}`);
        if (cancelled) return;
        setSummary(data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar o resumo.');
      }
    }
    void fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const maxCategoryTotal = summary?.expenseByCategory[0]?.totalCents ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>

      <ErrorNote message={error} />
      {!summary && !error && <Spinner />}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Receitas do mês" cents={summary.incomeCents} tone="income" />
            <StatTile label="Despesas do mês" cents={summary.expenseCents} tone="expense" />
            <StatTile label="Resultado do mês" cents={summary.netCents} tone="net" />
            <StatTile label="Saldo total" cents={summary.overallBalanceCents} tone="net" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Despesas por categoria
              </h2>
              {summary.expenseByCategory.length === 0 ? (
                <EmptyState
                  title="Sem despesas neste mês"
                  hint="Registre um lançamento para ver o gráfico."
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {summary.expenseByCategory.map((entry) => (
                    <li
                      key={entry.categoryId ?? 'none'}
                      title={`${entry.name}: ${formatBRL(entry.totalCents)} (${entry.percent}%)`}
                    >
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                            aria-hidden
                          />
                          {entry.name}
                        </span>
                        <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                          {formatBRL(entry.totalCents)} · {entry.percent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${maxCategoryTotal === 0 ? 0 : Math.max(2, (entry.totalCents / maxCategoryTotal) * 100)}%`,
                            backgroundColor: entry.color,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Lançamentos recentes
              </h2>
              {summary.recentTransactions.length === 0 ? (
                <EmptyState
                  title="Nenhum lançamento neste mês"
                  hint="Adicione o primeiro em Lançamentos."
                />
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {summary.recentTransactions.map((tx) => (
                    <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                          {tx.description}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {formatDate(tx.date)} · {tx.account.name}
                          {tx.category ? ` · ${tx.category.name}` : ''}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '−'}
                        {formatBRL(tx.amountCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
