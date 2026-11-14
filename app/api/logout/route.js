import { clearSession } from '@/lib/auth';
import { go } from '@/lib/http';

export async function POST(req) {
  await clearSession();
  return go(req, '/login', { ok: 'Sesión cerrada' });
}
