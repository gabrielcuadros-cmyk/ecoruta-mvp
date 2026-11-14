import { requireUser } from '@/lib/guard';
import { query } from '@/lib/db';
import { fmtFecha, fmtHora, soles, cupos } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

export default async function MisViajes({ searchParams }) {
  const s = await requireUser();
  const sp = await searchParams;
  if (s.role !== 'conductor') return <div className="card"><h1>Mis viajes</h1><p className="error">Esta sección es para conductores.</p></div>;
  const { rows } = await query(
    'SELECT id, zone, meeting_point, arrive_at, seats, seats_taken, contribution FROM trips WHERE driver_id = $1 ORDER BY arrive_at DESC', [s.uid]);
  return (
    <div>
      <div className="fila" style={{ justifyContent: 'space-between' }}>
        <h1>Mis viajes</h1>
        <a className="boton" href="/viajes/nuevo">Publicar viaje</a>
      </div>
      {sp.ok && <p className="ok">{sp.ok}</p>}
      {rows.length === 0 && <p className="card">Aún no publicas viajes.</p>}
      {rows.map((t) => (
        <div className="card" key={t.id} data-trip={t.id}>
          <div className="fila"><b>{t.zone}</b><span className="etiqueta">{cupos(t.seats - t.seats_taken)}</span>
            {new Date(t.arrive_at) < new Date() && <span className="meta">Realizado</span>}</div>
          <div className="meta">{t.meeting_point} · {fmtFecha(t.arrive_at)} · llegada {fmtHora(t.arrive_at)} · aporte {soles(t.contribution)}</div>
          <p><a href={`/mis-viajes/${t.id}`}>Ver pasajeros ({t.seats_taken})</a></p>
        </div>
      ))}
    </div>
  );
}
