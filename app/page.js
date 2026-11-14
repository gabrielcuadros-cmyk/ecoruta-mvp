import { redirect } from 'next/navigation';
import { getSession, homeFor } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const s = await getSession();
  if (s && !sp.ok) redirect(homeFor(s.role));
  return (
    <div className="card">
      {sp.ok && <p className="ok">{sp.ok}</p>}
      <h1>EcoRuta</h1>
      <p>Viajes compartidos entre estudiantes de Tecsup para gastar menos y llegar a tiempo a clase.</p>
      {s
        ? <p><a className="boton" href={homeFor(s.role)}>Continuar</a></p>
        : <p className="fila"><a className="boton" href="/login">Iniciar sesión</a> <a href="/registro">Crear cuenta</a></p>}
    </div>
  );
}
