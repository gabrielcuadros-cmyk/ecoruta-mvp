// Utilidades de viajes: zonas, fechas en hora de Lima y formato.
export const ZONAS = ['San Miguel', 'Los Olivos', 'San Martín de Porres', 'Santiago de Surco', 'San Juan de Lurigancho', 'Ate', 'Callao', 'Chorrillos'];
const TZ = 'America/Lima';

// "2026-11-20" + "07:45" en hora de Lima (UTC-5, sin horario de verano) → Date
export function limaDate(fecha, hora) {
  return new Date(`${fecha}T${hora}:00-05:00`);
}
export function hoyLima() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}
export function fmtFecha(d) {
  return new Intl.DateTimeFormat('es-PE', { timeZone: TZ, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}
export function fmtHora(d) {
  return new Intl.DateTimeFormat('es-PE', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(d));
}
export function soles(n) {
  return 'S/ ' + Number(n).toFixed(Number(n) % 1 ? 2 : 0);
}
export function cupos(n) {
  return `${n} ${n === 1 ? 'cupo libre' : 'cupos libres'}`;
}
