# EcoRuta MVP

**Outcome:** que los estudiantes de Tecsup que viajan al campus reduzcan su gasto diario de traslado en al menos 40 % (de ~S/ 15 a S/ 9 o menos) llegando a tiempo a clase en al menos 9 de cada 10 viajes, antes de cerrar el ciclo 2026-2.

EcoRuta conecta a estudiantes con carro que viajan solos al campus con compañeros de su misma ruta: el conductor publica un viaje con zona, punto de encuentro, hora de llegada y cupos; el pasajero reserva un cupo y, después del viaje, registra si llegó a tiempo y cuánto aportó.

> Proyecto académico — Evaluación de Recuperación, Construcción y Pruebas de Software (Tecsup, 2026-2). **Todos los datos son ficticios.**

## Probarlo en línea

- URL pública: **https://ecoruta-mvp-flame.vercel.app**
- Credenciales de prueba (ficticias):

| Rol | Correo | Contraseña |
|---|---|---|
| Conductor | conductor.demo@tecsup.edu.pe | EcoRuta2026! |
| Pasajero | pasajero.demo@tecsup.edu.pe | EcoRuta2026! |

Hay además `conductor2.demo@…` y `pasajero2.demo@…` con la misma contraseña, útiles para probar reservas simultáneas.

La base de datos gratuita (Neon) puede tardar unos segundos en reactivarse en el primer acceso.

## Historias del MVP

| ID | Historia | Rutas |
|---|---|---|
| H-01 | Registro con correo @tecsup.edu.pe y rol | `/registro` |
| H-02 | Inicio y cierre de sesión, rutas protegidas | `/login` |
| H-03 | Publicar un viaje | `/viajes/nuevo`, `/mis-viajes` |
| H-04 | Ver y filtrar viajes por zona y hora de llegada | `/viajes` |
| H-05 | Reservar un cupo sin sobrecupo | `/viajes/[id]` |
| H-06 | Ver los pasajeros de mi viaje | `/mis-viajes/[id]` |
| H-07 | Ver mis reservas | `/mis-reservas` |
| H-08 | Confirmar llegada y aporte, y ver el impacto | `/mis-reservas`, `/impacto` |

## Stack

Next.js 15 (App Router) · PostgreSQL en Neon (driver `pg`) · sesión con JWT firmado en cookie httpOnly (`jose`) · contraseñas con `bcryptjs` · despliegue en Vercel (plan Hobby).

## Ejecutar en local

```bash
npm install
cp .env.example .env      # opcional: sin DATABASE_URL se usa una base PGlite local en ./.pglite
npm run db:migrate        # crea las tablas y carga la semilla ficticia
npm run dev               # http://localhost:3000
```

`npm run build` ejecuta primero las migraciones (`scripts/migrate.mjs`) y luego `next build`; así cada despliegue en Vercel deja la base al día. La semilla solo se carga si la base está vacía, por lo que un redeploy conserva los datos.

## Flujo de trabajo

Una rama por historia (`feature/H-XX-descripcion`), commits que citan su ID (`H-03: …`) e integración a `main` con merge `--no-ff` cuando la historia cumple la Definition of Done. La versión entregada lleva el tag `v1.0.0`.
