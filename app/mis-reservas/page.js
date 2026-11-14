import { requireUser } from '@/lib/guard';
import { query } from '@/lib/db';
import { fmtFecha, fmtHora, soles } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

export default async function MisReservas({ searchParams }) {
  const s = await requireUser();
  const sp = await searchParams;
  if (s.role !== 'pasajero') return <div className="card"><h1>Mis reservas</h1><p className="error">Esta sección es para pasajeros.</p></div>;
  // Primero los viajes por venir (el más próximo primero) y después los ya realizados.
  const { rows } = await query(
    `SELECT r.id, r.arrived_on_time, r.paid, r.confirmed_at, t.id AS trip_id, t.zone, t.meeting_point, t.arrive_at, t.contribution, u.name AS driver
       FROM reservations r JOIN trips t ON t.id = r.trip_id JOIN users u ON u.id = t.driver_id
      WHERE r.passenger_id = $1
      ORDER BY (t.arrive_at <= now()) ASC, CASE WHEN t.arrive_at > now() THEN t.arrive_at END ASC, t.arrive_at DESC`, [s.uid]);
  return (
    <div>
      <h1>Mis reservas</h1>
      {sp.ok && <p className="ok" role="status">{sp.ok}</p>}
      {sp.error && <p className="error" role="alert">{sp.error}</p>}
      {rows.length === 0 && (
        <p className="card">Aún no tienes reservas. <a href="/viajes">Ver viajes disponibles</a></p>
      )}
      {rows.map((r) => (
        <div className="card" key={r.id} data-reserva={r.id}>
          <div className="fila"><b>{r.zone} → Tecsup</b><span className="meta">Conductor: {r.driver}</span></div>
          <div className="meta">Punto de encuentro: {r.meeting_point}</div>
          <div className="meta">{fmtFecha(r.arrive_at)} · llegada al campus {fmtHora(r.arrive_at)} · aporte sugerido {soles(r.contribution)}</div>
          {new Date(r.arrive_at) > new Date() ? (
            <p className="meta" data-testid="estado">Disponible después del viaje</p>
          ) : r.confirmed_at ? (
            <p className="etiqueta" data-testid="estado">{r.arrived_on_time ? 'A tiempo' : 'Tarde'} · {soles(r.paid)}</p>
          ) : (
            <form className="fila" method="post" action={`/api/reservas/${r.id}/confirmar`}>
              <label>¿Llegaste a tiempo?
                <select name="on_time" defaultValue="si"><option value="si">Sí</option><option value="no">No</option></select>
              </label>
              <label>¿Cuánto aportaste? (S/)<input name="paid" type="number" min="0" step="0.5" defaultValue={Number(r.contribution)} /></label>
              <button type="submit">Registrar</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
