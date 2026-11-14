export const dynamic = 'force-dynamic';

export default async function Registro({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="card">
      <h1>Crear cuenta</h1>
      <p className="meta">Solo para estudiantes de Tecsup con correo institucional.</p>
      {sp.error && <p className="error" role="alert">{sp.error}</p>}
      <form className="campos" method="post" action="/api/registro" noValidate>
        <label>Nombre<input name="name" defaultValue={sp.name || ''} autoComplete="name" /></label>
        <label>Carrera<input name="career" defaultValue={sp.career || ''} placeholder="Ej. Diseño y Desarrollo de Software" /></label>
        <label>Correo institucional<input name="email" type="email" defaultValue={sp.email || ''} placeholder="nombre.apellido@tecsup.edu.pe" autoComplete="email" /></label>
        <label>Contraseña (mínimo 8 caracteres)<input name="password" type="password" autoComplete="new-password" /></label>
        <label>Rol
          <select name="role" defaultValue={sp.role || 'pasajero'}>
            <option value="pasajero">Pasajero</option>
            <option value="conductor">Conductor</option>
          </select>
        </label>
        <button type="submit">Registrarme</button>
      </form>
    </div>
  );
}
