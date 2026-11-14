import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createSession, homeFor } from '@/lib/auth';
import { go } from '@/lib/http';

export async function POST(req) {
  const f = await req.formData();
  const email = String(f.get('email') || '').trim().toLowerCase();
  const password = String(f.get('password') || '');
  const r = await query('SELECT id, name, role, password_hash FROM users WHERE email = $1', [email]);
  const user = r.rows[0];
  const ok = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!ok) return go(req, '/login', { error: 'Correo o contraseña incorrectos', email });
  await createSession(user);
  return go(req, homeFor(user.role));
}
