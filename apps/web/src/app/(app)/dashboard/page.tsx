'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MonthSwitcher } from '../../../components/month-switcher';
import { MonthlyChart } from '../../../components/monthly-chart';
import { TransactionFormModal } from '../../../components/transaction-form-modal';
import { Button, EmptyState, ErrorNote, Skeleton } from '../../../components/ui';
import { api } from '../../../lib/api';
import { currentMonth, formatBRL, formatDate } from '../../../lib/format';
import type { Budget, DashboardSummary, MonthlyTotals } from '../../../lib/types';

function StatTile({
  label,
  cents,
  tone,
  index,
}: {
  label: string;
  cents: number;
  tone?: 'income' | 'expense' | 'net';
  index: number;
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
    <div
      className="animate-fade-up rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      style={{ animationDelay: `${index * 60}ms` }}
    >
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

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<MonthlyTotals[] | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  function onTransactionSaved(savedDate: string) {
    const savedMonth = savedDate.slice(0, 7);
    if (savedMonth !== month) {
      setMonth(savedMonth);
    } else {
      setReloadKey((key) => key + 1);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [summaryData, historyData, budgetsData] = await Promise.all([
          api<DashboardSummary>(`/dashboard/summary?month=${month}`),
          api<MonthlyTotals[]>('/dashboard/history?months=6'),
          api<Budget[]>(`/budgets?month=${month}`),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setHistory(historyData);
        setBudgets(budgetsData);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar o resumo.');
      }
    }
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  const maxCategoryTotal = summary?.expenseByCategory[0]?.totalCents ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher month={month} onChange={setMonth} />
          <Button onClick={() => setModalOpen(true)}>+ Novo lançamento</Button>
        </div>
      </div>

      <ErrorNote message={error} />
      {!summary && !error && <DashboardSkeleton />}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Receitas do mês" cents={summary.incomeCents} tone="income" index={0} />
            <StatTile
              label="Despesas do mês"
              cents={summary.expenseCents}
              tone="expense"
              index={1}
            />
            <StatTile label="Resultado do mês" cents={summary.netCents} tone="net" index={2} />
            <StatTile
              label="Saldo total"
              cents={summary.overallBalanceCents}
              tone="net"
              index={3}
            />
          </div>

          {history && history.some((m) => m.incomeCents > 0 || m.expenseCents > 0) && (
            <section
              className="animate-fade-up rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animationDelay: '120ms' }}
            >
              <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Evolução dos últimos 6 meses
              </h2>
              <MonthlyChart data={history} />
            </section>
          )}

          {budgets.length > 0 && (
            <section
              className="animate-fade-up rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animationDelay: '150ms' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Orçamentos do mês
                </h2>
                <Link
                  href="/budgets"
                  className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Ver todos
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {budgets.slice(0, 4).map((budget) => {
                  const over = budget.percent >= 100;
                  const warn = !over && budget.percent >= 80;
                  return (
                    <li
                      key={budget.id}
                      title={`${budget.categoryName}: ${formatBRL(budget.spentCents)} de ${formatBRL(budget.amountCents)}`}
                    >
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: budget.categoryColor }}
                            aria-hidden
                          />
                          {budget.categoryName}
                        </span>
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            over
                              ? 'text-red-600 dark:text-red-400'
                              : warn
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {budget.percent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`animate-grow-x h-full rounded-full ${
                            over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, budget.percent)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section
              className="animate-fade-up rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animationDelay: '180ms' }}
            >
              <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Despesas por categoria
              </h2>
              {summary.expenseByCategory.length === 0 ? (
                <EmptyState
                  title="Sem despesas neste mês"
                  hint="Registre um lançamento para ver o gráfico."
                />
              ) : (
                <ul className="flex flex-col gap-1">
                  {summary.expenseByCategory.map((entry, index) => {
                    const content = (
                      <>
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
                            className="animate-grow-x h-full rounded-full"
                            style={{
                              width: `${maxCategoryTotal === 0 ? 0 : Math.max(2, (entry.totalCents / maxCategoryTotal) * 100)}%`,
                              backgroundColor: entry.color,
                              animationDelay: `${200 + index * 70}ms`,
                            }}
                          />
                        </div>
                      </>
                    );
                    const tooltip = `${entry.name}: ${formatBRL(entry.totalCents)} (${entry.percent}%)`;
                    return (
                      <li key={entry.categoryId ?? 'none'}>
                        {entry.categoryId ? (
                          <Link
                            href={`/transactions?month=${month}&type=expense&categoryId=${entry.categoryId}`}
                            title={`${tooltip} — clique para ver os lançamentos`}
                            className="block rounded-lg p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="p-2" title={tooltip}>
                            {content}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section
              className="animate-fade-up rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animationDelay: '240ms' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Lançamentos recentes
                </h2>
                <Link
                  href={`/transactions?month=${month}`}
                  className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Ver todos
                </Link>
              </div>
              {summary.recentTransactions.length === 0 ? (
                <EmptyState
                  title="Nenhum lançamento neste mês"
                  hint="Adicione o primeiro em Lançamentos."
                />
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {summary.recentTransactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
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

      <TransactionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={onTransactionSaved}
      />
    </div>
  );
}
