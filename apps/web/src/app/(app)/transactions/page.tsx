'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { MonthSwitcher } from '../../../components/month-switcher';
import { useToast } from '../../../components/toast';
import { TransactionFormModal } from '../../../components/transaction-form-modal';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  Input,
  Select,
  Skeleton,
} from '../../../components/ui';
import { api } from '../../../lib/api';
import { currentMonth, formatBRL, formatDate } from '../../../lib/format';
import type { Account, Category, Transaction, TransactionType } from '../../../lib/types';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <TransactionsPageInner />
    </Suspense>
  );
}

function TransactionsPageInner() {
  const params = useSearchParams();

  const [month, setMonth] = useState(() => params.get('month') ?? currentMonth());
  const [typeFilter, setTypeFilter] = useState<'' | TransactionType>(() => {
    const type = params.get('type');
    return type === 'income' || type === 'expense' ? type : '';
  });
  const [accountFilter, setAccountFilter] = useState(() => params.get('accountId') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(() => params.get('categoryId') ?? '');
  const [search, setSearch] = useState('');

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [pageError, setPageError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const query = new URLSearchParams({ month });
        if (typeFilter) query.set('type', typeFilter);
        if (accountFilter) query.set('accountId', accountFilter);
        if (categoryFilter) query.set('categoryId', categoryFilter);
        const [txs, accs, cats] = await Promise.all([
          api<Transaction[]>(`/transactions?${query}`),
          api<Account[]>('/accounts'),
          api<Category[]>('/categories'),
        ]);
        if (cancelled) return;
        setTransactions(txs);
        setAccounts(accs);
        setCategories(cats);
        setPageError(null);
      } catch (err) {
        if (!cancelled) {
          setPageError(err instanceof Error ? err.message : 'Erro ao carregar lançamentos.');
        }
      }
    }
    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [month, typeFilter, accountFilter, categoryFilter, reloadKey]);

  function onSaved(savedDate: string) {
    // If the entry belongs to another month, jump the view there so it
    // never "disappears" behind the month filter.
    const savedMonth = savedDate.slice(0, 7);
    if (savedMonth !== month) {
      setMonth(savedMonth);
      toast.success(`Mostrando ${savedMonth.split('-').reverse().join('/')}, o mês do lançamento.`);
    } else {
      reload();
    }
  }

  async function duplicate(tx: Transaction) {
    try {
      await api('/transactions', {
        method: 'POST',
        body: {
          type: tx.type,
          description: tx.description,
          amountCents: tx.amountCents,
          date: new Date().toISOString().slice(0, 10),
          accountId: tx.accountId,
          categoryId: tx.categoryId,
        },
      });
      toast.success('Lançamento duplicado para hoje!');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao duplicar.');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/transactions/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Lançamento excluído.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir.');
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv(rows: Transaction[]) {
    const header = 'Data;Descrição;Categoria;Conta;Tipo;Valor (R$)';
    const lines = rows.map((tx) => {
      const value = ((tx.type === 'income' ? 1 : -1) * tx.amountCents) / 100;
      return [
        formatDate(tx.date),
        `"${tx.description.replaceAll('"', '""')}"`,
        `"${tx.category?.name ?? ''}"`,
        `"${tx.account.name}"`,
        tx.type === 'income' ? 'Receita' : 'Despesa',
        value.toFixed(2).replace('.', ','),
      ].join(';');
    });
    // BOM so Excel opens the UTF-8 accents correctly.
    const blob = new Blob(['﻿' + [header, ...lines].join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fluxo-lancamentos-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const visibleTransactions = (transactions ?? []).filter((tx) =>
    tx.description.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const hasActiveFilters = typeFilter || accountFilter || categoryFilter || search;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Lançamentos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher month={month} onChange={setMonth} />
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            + Novo lançamento
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          aria-label="Buscar por descrição"
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-52"
        />
        <Select
          aria-label="Filtrar por tipo"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as '' | TransactionType)}
          className="max-w-44"
        >
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </Select>
        <Select
          aria-label="Filtrar por categoria"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="max-w-44"
        >
          <option value="">Todas as categorias</option>
          {categories
            .filter((c) => !typeFilter || c.kind === typeFilter)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </Select>
        <Select
          aria-label="Filtrar por conta"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="max-w-44"
        >
          <option value="">Todas as contas</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setTypeFilter('');
              setAccountFilter('');
              setCategoryFilter('');
              setSearch('');
            }}
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            Limpar filtros
          </button>
        )}
        {visibleTransactions.length > 0 && (
          <Button variant="secondary" onClick={() => exportCsv(visibleTransactions)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exportar CSV
          </Button>
        )}
      </div>

      <ErrorNote message={pageError} />
      {!transactions && !pageError && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-11" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      )}

      {transactions && transactions.length === 0 && (
        <EmptyState
          title="Nenhum lançamento encontrado"
          hint={
            hasActiveFilters
              ? 'Ajuste os filtros ou clique em "Limpar filtros".'
              : 'Clique em "+ Novo lançamento" para registrar uma receita ou despesa.'
          }
        />
      )}

      {transactions && transactions.length > 0 && visibleTransactions.length === 0 && (
        <EmptyState title={`Nada encontrado para "${search}"`} hint="Tente outro termo de busca." />
      )}

      {visibleTransactions.length > 0 && (
        <div className="animate-fade-up overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Conta</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {visibleTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tx.category.color }}
                          aria-hidden
                        />
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{tx.account.name}</td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '−'}
                    {formatBRL(tx.amountCents)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(tx);
                        setModalOpen(true);
                      }}
                      className="mr-3 text-xs font-medium text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      title="Criar uma cópia com a data de hoje"
                      onClick={() => void duplicate(tx)}
                      className="mr-3 text-xs font-medium text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Duplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(tx)}
                      className="text-xs font-medium text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransactionFormModal
        open={modalOpen}
        transaction={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir lançamento"
        message={`Excluir "${deleteTarget?.description ?? ''}"? Essa ação não pode ser desfeita.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
