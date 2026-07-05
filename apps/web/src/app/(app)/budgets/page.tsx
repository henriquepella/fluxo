'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MonthSwitcher } from '../../../components/month-switcher';
import { useToast } from '../../../components/toast';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  Modal,
  Select,
  Skeleton,
} from '../../../components/ui';
import { api } from '../../../lib/api';
import { centsToReaisInput, currentMonth, formatBRL, reaisToCents } from '../../../lib/format';
import type { Budget, Category } from '../../../lib/types';

interface FormState {
  id: string | null;
  categoryId: string;
  amount: string;
}

function usageTone(percent: number): { bar: string; text: string } {
  if (percent >= 100) return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
  if (percent >= 80) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { bar: 'bg-emerald-500', text: 'text-zinc-500 dark:text-zinc-400' };
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [budgets, setBudgets] = useState<Budget[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ id: null, categoryId: '', amount: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [budgetsData, categoriesData] = await Promise.all([
          api<Budget[]>(`/budgets?month=${month}`),
          api<Category[]>('/categories'),
        ]);
        if (cancelled) return;
        setBudgets(budgetsData);
        setCategories(categoriesData);
        setPageError(null);
      } catch (err) {
        if (!cancelled) {
          setPageError(err instanceof Error ? err.message : 'Erro ao carregar orçamentos.');
        }
      }
    }
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  const budgetedIds = new Set((budgets ?? []).map((b) => b.categoryId));
  const availableCategories = categories.filter(
    (c) => c.kind === 'expense' && !budgetedIds.has(c.id),
  );

  function openCreate() {
    setForm({ id: null, categoryId: availableCategories[0]?.id ?? '', amount: '' });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(budget: Budget) {
    setForm({
      id: budget.id,
      categoryId: budget.categoryId,
      amount: centsToReaisInput(budget.amountCents),
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const amountCents = reaisToCents(form.amount);
      if (form.id) {
        await api(`/budgets/${form.id}`, { method: 'PATCH', body: { amountCents } });
        toast.success('Orçamento atualizado!');
      } else {
        await api('/budgets', {
          method: 'POST',
          body: { categoryId: form.categoryId, amountCents },
        });
        toast.success('Orçamento criado!');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/budgets/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Orçamento excluído.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Orçamentos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher month={month} onChange={setMonth} />
          <Button
            onClick={openCreate}
            disabled={budgets !== null && availableCategories.length === 0}
          >
            + Novo orçamento
          </Button>
        </div>
      </div>

      <p className="-mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Defina um limite mensal por categoria de despesa e acompanhe quanto já foi gasto.
      </p>

      <ErrorNote message={pageError} />
      {!budgets && !pageError && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {budgets && budgets.length === 0 && (
        <EmptyState
          title="Nenhum orçamento definido"
          hint='Clique em "+ Novo orçamento" para criar um limite de gastos por categoria.'
        />
      )}

      {budgets && budgets.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {budgets.map((budget, index) => {
            const tone = usageTone(budget.percent);
            const remaining = budget.amountCents - budget.spentCents;
            return (
              <div
                key={budget.id}
                className="animate-fade-up flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: budget.categoryColor }}
                      aria-hidden
                    />
                    {budget.categoryName}
                  </span>
                  <span className="flex gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => openEdit(budget)}
                      className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(budget)}
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Excluir
                    </button>
                  </span>
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatBRL(budget.spentCents)}
                      <span className="font-normal text-zinc-400 dark:text-zinc-500">
                        {' '}
                        de {formatBRL(budget.amountCents)}
                      </span>
                    </span>
                    <span className={`text-xs font-medium tabular-nums ${tone.text}`}>
                      {budget.percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`animate-grow-x h-full rounded-full ${tone.bar}`}
                      style={{
                        width: `${Math.min(100, budget.percent)}%`,
                        animationDelay: `${100 + index * 60}ms`,
                      }}
                    />
                  </div>
                  <p className={`mt-1.5 text-xs ${tone.text}`}>
                    {remaining >= 0
                      ? `Restam ${formatBRL(remaining)} neste mês`
                      : `${formatBRL(Math.abs(remaining))} acima do limite`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        title={form.id ? 'Editar orçamento' : 'Novo orçamento'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ErrorNote message={formError} />
          {!form.id && (
            <Field label="Categoria de despesa">
              <Select
                required
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Limite mensal (R$)">
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir orçamento"
        message={`Excluir o orçamento de "${deleteTarget?.categoryName ?? ''}"?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
