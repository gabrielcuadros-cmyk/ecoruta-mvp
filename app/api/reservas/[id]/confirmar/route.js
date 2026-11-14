import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { go } from '@/lib/http';

export async function POST(req, { params }) {
  const { id } = await params;
  const s = await getSession();
  if (!s) return go(req, '/login');
  const back = (k, msg) => go(req, '/mis-reservas', { [k]: msg });

  const r = (await query(
    `SELECT r.id, r.passenger_id, r.confirmed_at, t.arrive_at
       FROM reservations r JOIN trips t ON t.id = r.trip_id WHERE r.id = $1`, [Number(id) || 0])).rows[0];
  if (!r || r.passenger_id !== s.uid) return back('error', 'No encontramos esa reserva');
  if (new Date(r.arrive_at) > new Date()) return back('error', 'Disponible después del viaje');
  if (r.confirmed_at) return back('error', 'Ya registraste cómo fue este viaje');

  const f = await req.formData();
  const aTiempo = String(f.get('on_time') || '');
  const paid = Number(String(f.get('paid') || '').replace(',', '.'));
  if (!['si', 'no'].includes(aTiempo)) return back('error', 'Indica si llegaste a tiempo');
  if (!Number.isFinite(paid) || paid < 0 || paid > 50) return back('error', 'Indica cuánto aportaste (entre S/ 0 y S/ 50)');

  // "confirmed_at IS NULL" evita una segunda respuesta aunque se envíe dos veces.
  const u = await query(
    `UPDATE reservations SET arrived_on_time = $2, paid = $3, confirmed_at = now()
      WHERE id = $1 AND confirmed_at IS NULL RETURNING id`, [r.id, aTiempo === 'si', paid]);
  if (!u.rows.length) return back('error', 'Ya registraste cómo fue este viaje');
  return back('ok', 'Gracias, registramos tu viaje');
}
