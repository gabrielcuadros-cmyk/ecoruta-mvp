import { query } from '@/lib/db';
import { soles } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

// Indicadores del outcome: puntualidad, gasto y calce oferta–demanda.
export default async function Impacto() {
  const c = (await query(
    `SELECT COUNT(*)::int AS n,
            COALESCE(SUM(CASE WHEN arrived_on_time THEN 1 ELSE 0 END),0)::int AS a_tiempo,
            COALESCE(AVG(paid),0)::float AS aporte
       FROM reservations WHERE confirmed_at IS NOT NULL`)).rows[0];
  const o = (await query(
    `SELECT COALESCE(SUM(seats),0)::int AS ofrecidos, COALESCE(SUM(seats_taken),0)::int AS reservados FROM trips`)).rows[0];
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const puntualidad = pct(c.a_tiempo, c.n);
  const calce = pct(o.reservados, o.ofrecidos);
  return (
    <div>
      <h1>Impacto de EcoRuta</h1>
      <p className="meta">Calculado con las confirmaciones de los pasajeros después de cada viaje. Datos ficticios del MVP.</p>
      <div className="kpis">
        <div className="card kpi" data-testid="puntualidad"><b>{puntualidad} %</b>viajes a tiempo<br /><span className="meta">Meta ≥ 90 % · {c.a_tiempo} de {c.n} confirmaciones</span></div>
        <div className="card kpi" data-testid="aporte"><b>{soles(c.aporte)}</b>aporte promedio por pasajero<br /><span className="meta">Meta ≤ S/ 9 (línea base S/ 15)</span></div>
        <div className="card kpi" data-testid="calce"><b>{calce} %</b>cupos reservados<br /><span className="meta">Meta ≥ 60 % · {o.reservados} de {o.ofrecidos} cupos</span></div>
      </div>
    </div>
  );
}
