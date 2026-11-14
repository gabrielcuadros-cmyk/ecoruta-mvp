import { requireUser } from '@/lib/guard';
import { query } from '@/lib/db';
import { ZONAS, fmtFecha, fmtHora, soles, cupos } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

export default async function Viajes({ searchParams }) {
  await requireUser();
  const sp = await searchParams;
  const zona = ZONAS.includes(sp.zona) ? sp.zona : '';
  const hasta = /^\d{2}:\d{2}$/.test(sp.hasta || '') ? sp.hasta : '';

  // Solo viajes futuros con cupos libres, filtrados por zona y por hora de llegada (hora de Lima).
  const where = ['t.arrive_at > now()', 't.seats_taken < t.seats'];
  const params = [];
  if (zona) { params.push(zona); where.push(`t.zone = $${params.length}`); }
  if (hasta) { params.push(hasta); where.push(`(t.arrive_at AT TIME ZONE 'America/Lima')::time <= $${params.length}::time`); }
  const { rows } = await query(
    `SELECT t.id, t.zone, t.meeting_point, t.arrive_at, t.seats, t.seats_taken, t.contribution, u.name AS driver
       FROM trips t JOIN users u ON u.id = t.driver_id
      WHERE ${where.join(' AND ')}
      ORDER BY t.arrive_at ASC`, params);

  return (
    <div>
      <h1>Viajes disponibles</h1>
      <form className="card fila" method="get" action="/viajes">
        <label>Zona
          <select name="zona" defaultValue={zona}>
            <option value="">Todas</option>
            {ZONAS.map((z) => <option key={z}>{z}</option>)}
          </select>
        </label>
        <label>Llegar antes de<input type="time" name="hasta" defaultValue={hasta} /></label>
        <button type="submit">Filtrar</button>
        {(zona || hasta) && <a href="/viajes">Quitar filtros</a>}
      </form>
      {rows.length === 0 && <p className="card">No hay viajes con cupos para ese filtro.</p>}
      {rows.map((t) => (
        <div className="card" key={t.id} data-trip={t.id}>
          <div className="fila"><b>{t.zone}</b><span className="etiqueta">{cupos(t.seats - t.seats_taken)}</span><span className="meta">Aporte sugerido {soles(t.contribution)}</span></div>
          <div className="meta">Punto de encuentro: {t.meeting_point}</div>
          <div className="meta">{fmtFecha(t.arrive_at)} · llegada al campus {fmtHora(t.arrive_at)} · conductor {t.driver}</div>
          <p><a className="boton" href={`/viajes/${t.id}`}>Ver y reservar</a></p>
        </div>
      ))}
    </div>
  );
}
