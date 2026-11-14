// Semilla con datos 100 % ficticios. Solo se carga si la base está vacía.
// Usuarios de prueba (contraseña EcoRuta2026!): conductor.demo, conductor2.demo, pasajero.demo y pasajero2.demo @tecsup.edu.pe
import bcrypt from 'bcryptjs';

const DIA = 24 * 60 * 60 * 1000;
function fechaLima(dias, hora) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date(Date.now() + dias * DIA));
  return new Date(`${f}T${hora}:00-05:00`).toISOString();
}

export async function seed(db) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM users');
  if (rows[0].n > 0) return;
  const hash = await bcrypt.hash('EcoRuta2026!', 10);
  const users = [
    ['Conductor Demo', 'conductor.demo@tecsup.edu.pe', 'conductor', 'Diseño y Desarrollo de Software'],
    ['Conductora Demo B', 'conductor2.demo@tecsup.edu.pe', 'conductor', 'Mecatrónica Industrial'],
    ['Pasajero Demo', 'pasajero.demo@tecsup.edu.pe', 'pasajero', 'Redes y Comunicaciones'],
    ['Pasajera Demo B', 'pasajero2.demo@tecsup.edu.pe', 'pasajero', 'Diseño y Desarrollo de Software'],
  ];
  const id = {};
  for (const [name, email, role, career] of users) {
    const r = await db.query('INSERT INTO users (name, email, password_hash, role, career) VALUES ($1,$2,$3,$4,$5) RETURNING id', [name, email, hash, role, career]);
    id[email.split('@')[0]] = r.rows[0].id;
  }
  const trip = async (driver, zone, point, dias, hora, seats, aporte) => (await db.query(
    'INSERT INTO trips (driver_id, zone, meeting_point, arrive_at, seats, contribution) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [id[driver], zone, point, fechaLima(dias, hora), seats, aporte])).rows[0].id;
  const reserve = async (tripId, passenger) => {
    await db.query('INSERT INTO reservations (trip_id, passenger_id) VALUES ($1,$2)', [tripId, id[passenger]]);
    await db.query('UPDATE trips SET seats_taken = seats_taken + 1 WHERE id = $1', [tripId]);
  };
  const t1 = await trip('conductor.demo', 'San Miguel', 'Plaza San Miguel, puerta 2', 28, '07:45', 3, 5);
  await trip('conductor2.demo', 'Los Olivos', 'Plaza Norte, paradero de la Panamericana', 28, '07:30', 2, 6);
  await trip('conductor2.demo', 'San Miguel', 'Parque Media Luna', 29, '08:30', 1, 4);
  const pasado = await trip('conductor.demo', 'San Miguel', 'Plaza San Miguel, puerta 2', -1, '07:45', 3, 5);
  await reserve(t1, 'pasajero2.demo');
  await reserve(pasado, 'pasajero.demo');
  console.log('Semilla cargada: 4 usuarios demo, 3 viajes futuros y 1 viaje pasado.');
}
