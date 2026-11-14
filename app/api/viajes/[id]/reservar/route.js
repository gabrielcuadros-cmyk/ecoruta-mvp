import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { go } from '@/lib/http';

export async function POST(req, { params }) {
  const { id } = await params;
  const tripId = Number(id);
  const s = await getSession();
  if (!s) return go(req, '/login');
  const back = (k, msg) => go(req, `/viajes/${tripId}`, { [k]: msg });
  if (s.role !== 'pasajero') return back('error', 'Solo los pasajeros pueden reservar cupos');

  const trip = (await query('SELECT id, arrive_at, driver_id FROM trips WHERE id = $1', [tripId])).rows[0];
  if (!trip) return go(req, '/viajes');
  if (new Date(trip.arrive_at) <= new Date()) return back('error', 'Este viaje ya se realizó');

  const dup = await query('SELECT 1 FROM reservations WHERE trip_id = $1 AND passenger_id = $2', [tripId, s.uid]);
  if (dup.rows.length) return back('error', 'Ya tienes un cupo en este viaje');

  // Una sola sentencia atómica: descuenta el cupo solo si queda alguno y crea la reserva.
  // Si dos personas reservan el último cupo a la vez, solo una fila cumple "seats_taken < seats".
  try {
    const r = await query(
      `WITH upd AS (
         UPDATE trips SET seats_taken = seats_taken + 1
          WHERE id = $1 AND seats_taken < seats AND arrive_at > now()
          RETURNING id)
       INSERT INTO reservations (trip_id, passenger_id)
       SELECT id, $2 FROM upd
       RETURNING id`, [tripId, s.uid]);
    if (!r.rows.length) return back('error', 'Este viaje ya no tiene cupos');
  } catch (e) {
    if (e.code === '23505') return back('error', 'Ya tienes un cupo en este viaje');
    throw e;
  }
  return back('ok', 'Reserva confirmada');
}
