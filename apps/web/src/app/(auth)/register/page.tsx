'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button, ErrorNote, Field, Input } from '../../../components/ui';
import { api, ApiError } from '../../../lib/api';
import { storeSession } from '../../../lib/auth';
import type { AuthResult } from '../../../lib/types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await api<AuthResult>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      storeSession(result.accessToken, result.user.name);
      window.location.href = '/dashboard';
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_ALREADY_IN_USE') {
        setError('Este e-mail já está cadastrado.');
      } else if (err instanceof ApiError && err.details?.length) {
        setError(err.details.join('; '));
      } else {
        setError(err instanceof Error ? err.message : 'Erro inesperado.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Comece a organizar suas finanças em minutos.
        </p>
      </div>
      <ErrorNote message={error} />
      <Field label="Nome">
        <Input
          type="text"
          required
          minLength={2}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
        />
      </Field>
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo de 8 caracteres"
        />
      </Field>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Criando…' : 'Criar conta'}
      </Button>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Já tem conta?{' '}
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
