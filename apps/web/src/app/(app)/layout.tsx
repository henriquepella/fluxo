'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { ThemeToggle } from '../../components/theme-toggle';
import { ToastProvider } from '../../components/toast';
import { clearSession, getUserName } from '../../lib/auth';

// Cookie is read once per render on the client; '' during SSR/hydration.
const emptySubscribe = () => () => {};

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-12h8V3h-8v6Z',
  },
  { href: '/transactions', label: 'Lançamentos', icon: 'M4 7h16M4 12h16M4 17h10' },
  {
    href: '/budgets',
    label: 'Orçamentos',
    icon: 'M12 2a10 10 0 1 0 10 10H12V2Zm4 0a8 8 0 0 1 6 6h-6V2Z',
  },
  {
    href: '/accounts',
    label: 'Contas',
    icon: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm13 5h3',
  },
  {
    href: '/categories',
    label: 'Categorias',
    icon: 'M7 7h.01M7 3h5a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-5 5a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 5 10V5a2 2 0 0 1 2-2Z',
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userName = useSyncExternalStore(
    emptySubscribe,
    () => getUserName() ?? '',
    () => '',
  );

  function logout() {
    clearSession();
    window.location.href = '/login';
  }

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-zinc-200 bg-white md:w-60 md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 px-5 py-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-500 dark:text-emerald-950">
              F
            </span>
            <span className="text-lg font-semibold tracking-tight">Fluxo</span>
            <span className="ml-auto">
              <ThemeToggle />
            </span>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center justify-between gap-2 border-t border-zinc-200 px-5 py-4 md:flex dark:border-zinc-800">
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {(userName || '?').charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-sm text-zinc-600 dark:text-zinc-300" title={userName}>
                {userName || '—'}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
            >
              Sair
            </button>
          </div>
        </aside>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
