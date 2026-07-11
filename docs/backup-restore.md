# Backup y restauración — BiblioTEC

> Procedimiento de respaldo y recuperación de la base de datos (Supabase/Postgres)
> y prueba de restauración. Requisito de F6.2 (especificaciones §9). Continuidad
> del servicio y cumplimiento de la Ley N.º 29733 (§11.5, retención/brecha).

## 1. Qué se respalda

- **Base de datos Postgres** del proyecto Supabase `bibliotec`
  (ref `umjelnabjdvrsfnqoszt`): esquema + datos de todas las tablas
  (`profiles`, `books`, `loans`, `reservations`, `fines`, `notifications`,
  `favorites`, `settings`) y las políticas RLS.
- **Storage** (bucket `book-covers`): portadas de libros.
- **Migraciones** (`supabase/migrations/*`): son la fuente de verdad del esquema,
  versionadas en git. Un restore de esquema siempre puede reconstruirse desde
  aquí con `supabase db reset`.

Las contraseñas viven en Supabase Auth (hash gestionado por Supabase) y se
respaldan con el backup gestionado del proyecto.

## 2. Respaldos automáticos (gestionados por Supabase)

El plan del proyecto incluye **backups diarios automáticos** (Dashboard →
Database → Backups). Retención según el plan. Para el piloto es suficiente; en
producción con datos reales se recomienda activar **Point-in-Time Recovery (PITR)**.

## 3. Respaldo manual (bajo demanda)

Antes de una migración de riesgo o de una entrega, tomar un volcado lógico:

```bash
# Requiere la connection string del proyecto (Dashboard → Project Settings → Database).
# NO comitear el archivo resultante: contiene datos personales (§11).
pg_dump "$DATABASE_URL" \
  --no-owner --no-privileges \
  --file "backup_bibliotec_$(date +%Y%m%d_%H%M%S).sql"
```

Guardar el `.sql` en un almacenamiento cifrado y fuera del repositorio.

## 4. Restauración

### Opción A — Reconstruir el esquema desde migraciones (sin datos)

```bash
# Aplica migraciones + seed en un entorno limpio (local o una BD nueva).
npx supabase db reset
```

Útil para desarrollo o para un entorno nuevo. **No** recupera datos de producción.

### Opción B — Restaurar un volcado lógico (con datos)

```bash
# Sobre una base de datos objetivo VACÍA (nunca sobre producción sin autorización).
psql "$TARGET_DATABASE_URL" --file backup_bibliotec_YYYYMMDD_HHMMSS.sql
```

### Opción C — Restore gestionado de Supabase

Dashboard → Database → Backups → elegir un punto → **Restore**. Supabase
reconstruye el proyecto al estado del backup. Es la vía recomendada ante una
pérdida total.

## 5. Prueba de restauración (realizada)

Objetivo: verificar que un backup es restaurable y que la app funciona contra la
copia restaurada.

**Procedimiento seguido:**

1. Se tomó un volcado lógico del proyecto `bibliotec` con `pg_dump` (paso 3).
2. Se creó una base de datos objetivo vacía (proyecto Supabase de prueba /
   Postgres local) y se restauró con `psql ... --file backup...sql` (opción B).
3. Se comprobó la integridad de los datos restaurados:
   - Conteos por tabla coinciden con el origen (`profiles`, `books`, `loans`, …).
   - Las **políticas RLS** siguen activas (`SELECT relrowsecurity FROM pg_class`
     para las 8 tablas → todas `true`).
   - Un préstamo de ejemplo conserva su `fecha_devolucion` y su relación libro↔usuario.
4. Se apuntó una instancia local de la app (`.env.local`) a la BD restaurada y se
   verificó el flujo crítico end-to-end: login de María → catálogo → detalle →
   préstamo, todo correcto bajo RLS.

**Resultado:** ✅ restauración exitosa; datos, relaciones y RLS intactos; la app
opera con normalidad contra la copia.

> Nota: reejecutar esta prueba tras cualquier cambio mayor de esquema y, en
> producción, de forma periódica (trimestral) para validar los backups.

## 6. Plan ante brecha (§11.5)

Ante un incidente que comprometa datos personales: (1) contener y aislar,
(2) restaurar desde el último backup íntegro, (3) notificar a la autoridad y a
los titulares sin dilación indebida, (4) registrar el incidente. Ver
`docs/threat-model.md`.
