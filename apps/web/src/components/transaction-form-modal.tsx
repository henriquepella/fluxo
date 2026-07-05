'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { centsToReaisInput, reaisToCents, todayInputValue } from '../lib/format';
import type { Account, Category, Transaction, TransactionType } from '../lib/types';
import { useToast } from './toast';
import { Button, ErrorNote, Field, Input, Modal, Select } from './ui';

interface TransactionFormModalProps {
  open: boolean;
  /** When set, the modal edits this transaction; otherwise it creates a new one. */
  transaction?: Transaction | null;
  onClose: () => void;
  /** Called after a successful save with the saved date (`YYYY-MM-DD`). */
  onSaved: (savedDate: string) => void;
}

export function TransactionFormModal({
  open,
  transaction = null,
  onClose,
  onSaved,
}: TransactionFormModalProps) {
  return (
    <Modal
      title={transaction ? 'Editar lançamento' : 'Novo lançamento'}
      open={open}
      onClose={onClose}
    >
      {/* Mounted only while open, so state resets between uses. */}
      <TransactionForm transaction={transaction} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function TransactionForm({
  transaction,
  onClose,
  onSaved,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: (savedDate: string) => void;
}) {
  const toast = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [amount, setAmount] = useState(
    transaction ? centsToReaisInput(transaction.amountCents) : '',
  );
  const [date, setDate] = useState(transaction?.date.slice(0, 10) ?? todayInputValue());
  const [accountId, setAccountId] = useState(transaction?.accountId ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');

  useEffect(() => {
    let cancelled = false;
    async function fetchOptions() {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          api<Account[]>('/accounts'),
          api<Category[]>('/categories'),
        ]);
        if (cancelled) return;
        setAccounts(accountsData);
        setCategories(categoriesData);
        // Preselect the first account on creation for one less click.
        setAccountId((current) => current || (accountsData[0]?.id ?? ''));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar contas e categorias.');
        }
      }
    }
    void fetchOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      type,
      description,
      amountCents: reaisToCents(amount),
      date,
      accountId,
      categoryId: categoryId || null,
    };
    try {
      if (transaction) {
        await api(`/transactions/${transaction.id}`, { method: 'PATCH', body: payload });
        toast.success('Lançamento atualizado!');
      } else {
        await api('/transactions', { method: 'POST', body: payload });
        toast.success('Lançamento criado!');
      }
      onSaved(date);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  const typeCategories = categories.filter((c) => c.kind === type);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ErrorNote message={error} />
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {(['expense', 'income'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setType(option);
              setCategoryId('');
            }}
            className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
              type === option
                ? option === 'expense'
                  ? 'bg-white text-red-600 shadow-sm dark:bg-zinc-900 dark:text-red-400'
                  : 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {option === 'expense' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>
      <Field label="Descrição">
        <Input
          required
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
        </Field>
        <Field label="Data">
          <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <Field label="Conta">
        <Select required value={accountId} onChange={(e) => setAccountId(e.target.value)}>
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
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sem categoria</option>
          {typeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
