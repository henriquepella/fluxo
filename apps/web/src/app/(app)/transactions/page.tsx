'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MonthSwitcher } from '../../../components/month-switcher';
import {
  Button,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  Modal,
  Select,
  Spinner,
} from '../../../components/ui';
import { api } from '../../../lib/api';
import {
  centsToReaisInput,
  currentMonth,
  formatBRL,
  formatDate,
  reaisToCents,
  todayInputValue,
} from '../../../lib/format';
import type { Account, Category, Transaction, TransactionType } from '../../../lib/types';

interface FormState {
  id: string | null;
  type: TransactionType;
  description: string;
  amount: string;
  date: string;
  accountId: string;
  categoryId: string;
}

const emptyForm = (accountId = ''): FormState => ({
  id: null,
  type: 'expense',
  description: '',
  amount: '',
  date: todayInputValue(),
  accountId,
  categoryId: '',
});

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [typeFilter, setTypeFilter] = useState<'' | TransactionType>('');
  const [accountFilter, setAccountFilter] = useState('');

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [pageError, setPageError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const params = new URLSearchParams({ month });
        if (typeFilter) params.set('type', typeFilter);
        if (accountFilter) params.set('accountId', accountFilter);
        const [txs, accs, cats] = await Promise.all([
          api<Transaction[]>(`/transactions?${params}`),
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
  }, [month, typeFilter, accountFilter, reloadKey]);

  function openCreate() {
    setForm(emptyForm(accounts[0]?.id ?? ''));
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setForm({
      id: tx.id,
      type: tx.type,
      description: tx.description,
      amount: centsToReaisInput(tx.amountCents),
      date: tx.date.slice(0, 10),
      accountId: tx.accountId,
      categoryId: tx.categoryId ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    const payload = {
      type: form.type,
      description: form.description,
      amountCents: reaisToCents(form.amount),
      date: form.date,
      accountId: form.accountId,
      categoryId: form.categoryId || null,
    };
    try {
      if (form.id) {
        await api(`/transactions/${form.id}`, { method: 'PATCH', body: payload });
      } else {
        await api('/transactions', { method: 'POST', body: payload });
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(tx: Transaction) {
    if (!window.confirm(`Excluir "${tx.description}"?`)) return;
    try {
      await api(`/transactions/${tx.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Erro ao excluir.');
    }
  }

  const formCategories = categories.filter((c) => c.kind === form.type);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Lançamentos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher month={month} onChange={setMonth} />
          <Button onClick={openCreate}>+ Novo lançamento</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
      </div>

      <ErrorNote message={pageError} />
      {!transactions && !pageError && <Spinner />}

      {transactions && transactions.length === 0 && (
        <EmptyState
          title="Nenhum lançamento neste mês"
          hint='Clique em "+ Novo lançamento" para registrar uma receita ou despesa.'
        />
      )}

      {transactions && transactions.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
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
              {transactions.map((tx) => (
                <tr key={tx.id} className="group">
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
                      onClick={() => openEdit(tx)}
                      className="mr-3 text-xs font-medium text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(tx)}
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

      <Modal
        title={form.id ? 'Editar lançamento' : 'Novo lançamento'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ErrorNote message={formError} />
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {(['expense', 'income'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type, categoryId: '' }))}
                className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                  form.type === type
                    ? type === 'expense'
                      ? 'bg-white text-red-600 shadow-sm dark:bg-zinc-900 dark:text-red-400'
                      : 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {type === 'expense' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>
          <Field label="Descrição">
            <Input
              required
              maxLength={200}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex.: Supermercado"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0,00"
              />
            </Field>
            <Field label="Data">
              <Input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Conta">
            <Select
              required
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            >
              <option value="" disabled>
                Selecione…
              </option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Categoria">
            <Select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">Sem categoria</option>
              {formCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
