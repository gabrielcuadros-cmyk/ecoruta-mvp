export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="card">
      <h1>Iniciar sesión</h1>
      {sp.ok && <p className="ok">{sp.ok}</p>}
      {sp.error && <p className="error" role="alert">{sp.error}</p>}
      <form className="campos" method="post" action="/api/login" noValidate>
        <label>Correo institucional<input name="email" type="email" defaultValue={sp.email || ''} autoComplete="email" /></label>
        <label>Contraseña<input name="password" type="password" autoComplete="current-password" /></label>
        <button type="submit">Ingresar</button>
      </form>
      <p className="meta">¿No tienes cuenta? <a href="/registro">Regístrate</a></p>
    </div>
  );
}
