'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button, ErrorNote, Field, Input } from '../../../components/ui';
import { api, ApiError } from '../../../lib/api';
import { storeSession } from '../../../lib/auth';
import type { AuthResult } from '../../../lib/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await api<AuthResult>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      storeSession(result.accessToken, result.user.name);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'E-mail ou senha incorretos.'
          : err instanceof Error
            ? err.message
            : 'Erro inesperado.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Acesse seu controle financeiro.
        </p>
      </div>
      <ErrorNote message={error} />
      <Field label="E-mail">
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
      </Field>
      <Field label="Senha">
        <Input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Entrando…' : 'Entrar'}
      </Button>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Não tem conta?{' '}
        <Link
          href="/register"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
