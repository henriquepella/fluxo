'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Button,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  Modal,
  Spinner,
} from '../../../components/ui';
import { api } from '../../../lib/api';
import type { Category, CategoryKind } from '../../../lib/types';

const COLOR_CHOICES = [
  '#16a34a',
  '#0d9488',
  '#0284c7',
  '#2563eb',
  '#7c3aed',
  '#9333ea',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#0891b2',
  '#6b7280',
];

interface FormState {
  id: string | null;
  name: string;
  kind: CategoryKind;
  color: string;
}

function CategoryColumn({
  kind,
  title,
  categories,
  onCreate,
  onEdit,
  onDelete,
}: {
  kind: CategoryKind;
  title: string;
  categories: Category[];
  onCreate: (kind: CategoryKind) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const items = categories.filter((category) => category.kind === kind);
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</h2>
        <button
          type="button"
          onClick={() => onCreate(kind)}
          className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          + Adicionar
        </button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="Nenhuma categoria" />
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((category) => (
            <li
              key={category.id}
              className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-200">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden
                />
                {category.name}
              </span>
              <span className="flex gap-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onEdit(category)}
                  className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(category)}
                  className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  Excluir
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    id: null,
    name: '',
    kind: 'expense',
    color: COLOR_CHOICES[0],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
      try {
        const data = await api<Category[]>('/categories');
        if (cancelled) return;
        setCategories(data);
        setPageError(null);
      } catch (err) {
        if (!cancelled) {
          setPageError(err instanceof Error ? err.message : 'Erro ao carregar categorias.');
        }
      }
    }
    void fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function openCreate(kind: CategoryKind) {
    setForm({ id: null, name: '', kind, color: COLOR_CHOICES[0] });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setForm({ id: category.id, name: category.name, kind: category.kind, color: category.color });
    setFormError(null);
    setModalOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (form.id) {
        await api(`/categories/${form.id}`, {
          method: 'PATCH',
          body: { name: form.name, color: form.color },
        });
      } else {
        await api('/categories', {
          method: 'POST',
          body: { name: form.name, kind: form.kind, color: form.color },
        });
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(category: Category) {
    if (
      !window.confirm(
        `Excluir a categoria "${category.name}"? Os lançamentos dela ficarão sem categoria.`,
      )
    ) {
      return;
    }
    try {
      await api(`/categories/${category.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Erro ao excluir.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>

      <ErrorNote message={pageError} />
      {!categories && !pageError && <Spinner />}

      {categories && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryColumn
            kind="income"
            title="Receitas"
            categories={categories}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={(category) => void onDelete(category)}
          />
          <CategoryColumn
            kind="expense"
            title="Despesas"
            categories={categories}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={(category) => void onDelete(category)}
          />
        </div>
      )}

      <Modal
        title={
          form.id
            ? 'Editar categoria'
            : `Nova categoria de ${form.kind === 'income' ? 'receita' : 'despesa'}`
        }
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ErrorNote message={formError} />
          <Field label="Nome">
            <Input
              required
              maxLength={60}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex.: Pets"
            />
          </Field>
          <Field label="Cor">
            <div className="flex flex-wrap gap-2">
              {COLOR_CHOICES.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Cor ${color}`}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    form.color === color
                      ? 'scale-110 ring-2 ring-zinc-900 ring-offset-2 dark:ring-zinc-100 dark:ring-offset-zinc-900'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
