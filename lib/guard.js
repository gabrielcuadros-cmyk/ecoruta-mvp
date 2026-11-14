import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

// Protege una página: sin sesión válida redirige a /login.
export async function requireUser() {
  const s = await getSession();
  if (!s) redirect('/login');
  return s;
}
