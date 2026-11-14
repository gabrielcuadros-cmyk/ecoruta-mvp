// Sesión firmada (JWT HS256) en una cookie httpOnly.
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';

const COOKIE = 'eco_session';

function secret() {
  const raw = process.env.AUTH_SECRET ||
    createHash('sha256').update('ecoruta:' + (process.env.DATABASE_URL || 'local-dev')).digest('hex');
  return new TextEncoder().encode(raw);
}

export async function createSession(user) {
  const token = await new SignJWT({ uid: user.id, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export const ROLES = { conductor: 'Conductor', pasajero: 'Pasajero' };

export function homeFor(role) {
  return role === 'conductor' ? '/mis-viajes' : '/viajes';
}
