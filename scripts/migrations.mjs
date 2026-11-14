// Cada historia agrega su propia migración. Nunca se edita una migración ya aplicada.
export const migrations = [
  {
    id: '001_H-01_users',
    sql: `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('conductor','pasajero')),
      career TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`,
  },
  {
    id: '002_H-03_trips',
    sql: `CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      driver_id INTEGER NOT NULL REFERENCES users(id),
      zone TEXT NOT NULL,
      meeting_point TEXT NOT NULL,
      arrive_at TIMESTAMPTZ NOT NULL,
      seats INTEGER NOT NULL CHECK (seats BETWEEN 1 AND 4),
      seats_taken INTEGER NOT NULL DEFAULT 0 CHECK (seats_taken >= 0 AND seats_taken <= seats),
      contribution NUMERIC(6,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS trips_arrive_idx ON trips (arrive_at);`,
  },
  {
    id: '003_H-05_reservations',
    sql: `CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES trips(id),
      passenger_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (trip_id, passenger_id)
    );`,
  },
  {
    id: '004_H-08_trip_feedback',
    sql: `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS arrived_on_time BOOLEAN;
    ALTER TABLE reservations ADD COLUMN IF NOT EXISTS paid NUMERIC(6,2);
    ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;`,
  },
];
