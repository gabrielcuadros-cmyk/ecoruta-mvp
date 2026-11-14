import { requireUser } from '@/lib/guard';
import { ZONAS, hoyLima } from '@/lib/viaje';
export const dynamic = 'force-dynamic';

function parse(s) { try { return JSON.parse(s || '{}'); } catch { return {}; } }

export default async function NuevoViaje({ searchParams }) {
  const s = await requireUser();
  if (s.role !== 'conductor') {
    return <div className="card"><h1>Publicar viaje</h1><p className="error" role="alert">Solo los conductores pueden publicar viajes</p></div>;
  }
  const sp = await searchParams;
  const e = parse(sp.e), v = parse(sp.v);
  const Err = ({ k }) => e[k] ? <span className="error-campo">{e[k]}</span> : null;
  return (
    <div className="card">
      <h1>Publicar un viaje</h1>
      {Object.keys(e).length > 0 && <p className="error" role="alert">Revisa los campos marcados</p>}
      <form className="campos" method="post" action="/api/viajes" noValidate>
        <label>Zona de salida
          <select name="zone" defaultValue={v.zone || ''}>
            <option value="">Elige una zona</option>
            {ZONAS.map((z) => <option key={z}>{z}</option>)}
          </select><Err k="zone" />
        </label>
        <label>Punto de encuentro<input name="meeting_point" defaultValue={v.meeting_point || ''} placeholder="Ej. Plaza San Miguel, puerta 2" /><Err k="meeting_point" /></label>
        <label>Fecha<input name="date" type="date" min={hoyLima()} defaultValue={v.date || ''} /><Err k="date" /></label>
        <label>Hora de llegada al campus<input name="time" type="time" defaultValue={v.time || ''} /><Err k="time" /></label>
        <label>Cupos (1 a 4)<input name="seats" type="number" min="1" max="4" defaultValue={v.seats || '3'} /><Err k="seats" /></label>
        <label>Aporte sugerido por pasajero (S/)<input name="contribution" type="number" min="0" step="0.5" defaultValue={v.contribution ?? '5'} /><Err k="contribution" /></label>
        <button type="submit">Publicar viaje</button>
      </form>
    </div>
  );
}
