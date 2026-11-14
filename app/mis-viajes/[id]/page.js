import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/guard';
import { query } from '@/lib/db';
import { fmtFecha, fmtHora, cupos } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

export default async function PasajerosDelViaje({ params }) {
  const s = await requireUser();
  const { id } = await params;
  const t = (await query('SELECT * FROM trips WHERE id = $1', [Number(id) || 0])).rows[0];
  if (!t) notFound();
  // Control de acceso: solo el conductor que publicó el viaje ve a sus pasajeros.
  if (t.driver_id !== s.uid) {
    return <div className="card"><h1>Pasajeros del viaje</h1><p className="error" role="alert">No tienes acceso a este viaje</p></div>;
  }
  const { rows } = await query(
    `SELECT u.name, u.career FROM reservations r JOIN users u ON u.id = r.passenger_id
      WHERE r.trip_id = $1 ORDER BY r.created_at`, [t.id]);
  return (
    <div className="card">
      <a href="/mis-viajes">← Mis viajes</a>
      <h1>{t.zone} → Tecsup</h1>
      <p className="meta">{t.meeting_point} · {fmtFecha(t.arrive_at)} · llegada {fmtHora(t.arrive_at)}</p>
      <p className="fila"><span className="etiqueta" data-testid="cupos">{cupos(t.seats - t.seats_taken)}</span><span className="meta">{rows.length} de {t.seats} cupos reservados</span></p>
      <h2>Pasajeros</h2>
      {rows.length === 0 ? <p className="meta">Todavía nadie reservó.</p> : (
        <ul>{rows.map((p, i) => <li key={i}><b>{p.name}</b> · {p.career}</li>)}</ul>
      )}
    </div>
  );
}
