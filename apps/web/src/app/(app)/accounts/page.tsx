'use client';

import { useEffect, useState, type FormEvent } from 'react';
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
import { formatBRL } from '../../../lib/format';
import { ACCOUNT_TYPE_LABELS, type Account, type AccountType } from '../../../lib/types';

interface FormState {
  id: string | null;
  name: string;
  type: AccountType;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ id: null, name: '', type: 'checking' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    async function fetchAccounts() {
      try {
        const data = await api<Account[]>('/accounts');
        if (cancelled) return;
        setAccounts(data);
        setPageError(null);
      } catch (err) {
        if (!cancelled)
          setPageError(err instanceof Error ? err.message : 'Erro ao carregar contas.');
      }
    }
    void fetchAccounts();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function openCreate() {
    setForm({ id: null, name: '', type: 'checking' });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(account: Account) {
    setForm({ id: account.id, name: account.name, type: account.type });
    setFormError(null);
    setModalOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (form.id) {
        await api(`/accounts/${form.id}`, {
          method: 'PATCH',
          body: { name: form.name, type: form.type },
        });
        toast.success('Conta atualizada!');
      } else {
        await api('/accounts', { method: 'POST', body: { name: form.name, type: form.type } });
        toast.success('Conta criada!');
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
      await api(`/accounts/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Conta excluída.');
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
        <h1 className="text-2xl font-semibold tracking-tight">Contas</h1>
        <Button onClick={openCreate}>+ Nova conta</Button>
      </div>

      <ErrorNote message={pageError} />
      {!accounts && !pageError && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {accounts && accounts.length === 0 && (
        <EmptyState title="Nenhuma conta" hint='Crie a primeira em "+ Nova conta".' />
      )}

      {accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account, index) => (
            <div
              key={account.id}
              className="animate-fade-up flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{account.name}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {ACCOUNT_TYPE_LABELS[account.type]}
                </p>
              </div>
              <p
                className={`text-xl font-semibold tabular-nums ${
                  account.balanceCents < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-zinc-900 dark:text-zinc-50'
                }`}
              >
                {formatBRL(account.balanceCents)}
              </p>
              <div className="flex gap-3 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => openEdit(account)}
                  className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(account)}
                  className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={form.id ? 'Editar conta' : 'Nova conta'}
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
              placeholder="Ex.: Nubank"
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
            >
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir conta"
        message={`Excluir a conta "${deleteTarget?.name ?? ''}"? Todos os lançamentos dela também serão excluídos.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
