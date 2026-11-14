import './globals.css';
import { getSession, ROLES } from '@/lib/auth';

export const metadata = {
  title: 'EcoRuta · viajes compartidos a Tecsup',
  description: 'MVP de EcoRuta: estudiantes de Tecsup comparten viajes al campus. Datos ficticios.',
};

export default async function RootLayout({ children }) {
  const s = await getSession();
  return (
    <html lang="es">
      <body>
        <header className="top">
          <a className="marca" href="/">EcoRuta</a>
          <nav>
            {!s && <><a href="/login">Iniciar sesión</a><a href="/registro">Crear cuenta</a></>}
            {s?.role === 'conductor' && <><a href="/mis-viajes">Mis viajes</a><a href="/viajes/nuevo">Publicar viaje</a></>}
            {s?.role === 'pasajero' && <><a href="/viajes">Viajes disponibles</a><a href="/mis-reservas">Mis reservas</a></>}
            <a href="/impacto">Impacto</a>
          </nav>
          {s && (
            <span className="usuario" data-testid="usuario">
              <b>{s.name}</b> · <span className="etiqueta">{ROLES[s.role]}</span>
              <form method="post" action="/api/logout"><button className="secundario" type="submit">Cerrar sesión</button></form>
            </span>
          )}
        </header>
        <main>{children}</main>
        <footer>EcoRuta MVP · todos los datos son ficticios · Tecsup 2026-2</footer>
      </body>
    </html>
  );
}
