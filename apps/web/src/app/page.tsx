import { redirect } from 'next/navigation';

// proxy.ts already routes "/" by session; this is just the fallback.
export default function Home() {
  redirect('/dashboard');
}
