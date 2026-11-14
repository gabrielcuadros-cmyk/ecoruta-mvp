import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/guard';
import { query } from '@/lib/db';
import { fmtFecha, fmtHora, soles, cupos } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

export default async function Viaje({ params, searchParams }) {
  const s = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const t = (await query(
    `SELECT t.*, u.name AS driver, u.career AS driver_career
       FROM trips t JOIN users u ON u.id = t.driver_id WHERE t.id = $1`, [Number(id) || 0])).rows[0];
  if (!t) notFound();
  const libres = t.seats - t.seats_taken;
  const pasado = new Date(t.arrive_at) <= new Date();
  const mia = (await query('SELECT 1 FROM reservations WHERE trip_id = $1 AND passenger_id = $2', [t.id, s.uid])).rows.length > 0;
  return (
    <div className="card">
      <a href="/viajes">← Viajes disponibles</a>
      <h1>{t.zone} → Tecsup</h1>
      {sp.ok && <p className="ok" role="status">{sp.ok}</p>}
      {sp.error && <p className="error" role="alert">{sp.error}</p>}
      <p className="fila"><span className="etiqueta" data-testid="cupos">{cupos(libres)}</span><span>Aporte sugerido {soles(t.contribution)}</span></p>
      <p><b>Punto de encuentro:</b> {t.meeting_point}</p>
      <p><b>Llegada al campus:</b> {fmtFecha(t.arrive_at)} a las {fmtHora(t.arrive_at)}</p>
      <p><b>Conductor:</b> {t.driver} · {t.driver_career}</p>
      {s.role === 'pasajero' && !pasado && (
        mia ? <p className="ok">Tienes un cupo en este viaje. <a href="/mis-reservas">Ver mis reservas</a></p>
            : <form method="post" action={`/api/viajes/${t.id}/reservar`}><button type="submit">Reservar</button></form>
      )}
      {pasado && <p className="meta">Este viaje ya se realizó.</p>}
    </div>
  );
}
