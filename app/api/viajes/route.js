import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { go } from '@/lib/http';
import { ZONAS, limaDate, hoyLima } from '@/lib/viaje';

export async function POST(req) {
  const s = await getSession();
  if (!s) return go(req, '/login');
  if (s.role !== 'conductor') return go(req, '/viajes/nuevo');

  const f = await req.formData();
  const v = {
    zone: String(f.get('zone') || ''),
    meeting_point: String(f.get('meeting_point') || '').trim(),
    date: String(f.get('date') || ''),
    time: String(f.get('time') || ''),
    seats: String(f.get('seats') || ''),
    contribution: String(f.get('contribution') || '0').trim() || '0',
  };
  const e = {};
  if (!ZONAS.includes(v.zone)) e.zone = 'Elige una zona de salida';
  if (!v.meeting_point) e.meeting_point = 'Indica el punto de encuentro';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) e.date = 'Indica la fecha del viaje';
  else if (v.date < hoyLima()) e.date = 'La fecha no puede ser pasada';
  if (!/^\d{2}:\d{2}$/.test(v.time)) e.time = 'Indica la hora de llegada al campus';
  if (!e.date && !e.time && limaDate(v.date, v.time) <= new Date()) e.time = 'Esa hora de llegada ya pasó';
  const seats = Number(v.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 4) e.seats = 'Los cupos deben estar entre 1 y 4';
  const contribution = Number(v.contribution);
  if (!Number.isFinite(contribution) || contribution < 0 || contribution > 50) e.contribution = 'El aporte debe estar entre S/ 0 y S/ 50';

  if (Object.keys(e).length) return go(req, '/viajes/nuevo', { e: JSON.stringify(e), v: JSON.stringify(v) });

  await query(
    'INSERT INTO trips (driver_id, zone, meeting_point, arrive_at, seats, contribution) VALUES ($1,$2,$3,$4,$5,$6)',
    [s.uid, v.zone, v.meeting_point, limaDate(v.date, v.time).toISOString(), seats, contribution]);
  return go(req, '/mis-viajes', { ok: 'Viaje publicado' });
}
