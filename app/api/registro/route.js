import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { go } from '@/lib/http';

export async function POST(req) {
  const f = await req.formData();
  const name = String(f.get('name') || '').trim();
  const career = String(f.get('career') || '').trim();
  const email = String(f.get('email') || '').trim().toLowerCase();
  const password = String(f.get('password') || '');
  const role = String(f.get('role') || '');
  const back = (error) => go(req, '/registro', { error, name, career, email, role });

  if (!name || !career) return back('Completa tu nombre y tu carrera');
  if (!email.endsWith('@tecsup.edu.pe') || email.length <= '@tecsup.edu.pe'.length) return back('Solo se admiten correos @tecsup.edu.pe');
  if (password.length < 8) return back('La contraseña debe tener al menos 8 caracteres');
  if (!['conductor', 'pasajero'].includes(role)) return back('Elige el rol Conductor o Pasajero');

  const exists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rows.length) return back('Este correo ya tiene una cuenta');

  const hash = await bcrypt.hash(password, 10);
  let user;
  try {
    const r = await query(
      'INSERT INTO users (name, email, password_hash, role, career) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, role',
      [name, email, hash, role, career]);
    user = r.rows[0];
  } catch (e) {
    if (e.code === '23505') return back('Este correo ya tiene una cuenta');
    throw e;
  }
  await createSession(user);
  return go(req, '/', { ok: 'Cuenta creada. ¡Bienvenido a EcoRuta!' });
}
