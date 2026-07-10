# Supabase — BiblioTEC

Capa de datos: Postgres + Auth + RLS. La autorización real vive aquí (políticas
RLS), no en la UI. Toda lectura/escritura desde la app pasa por `lib/services/*`,
que usan los helpers de `lib/supabase/*`.

## Contenido

```
supabase/
  config.toml                         · configuración del CLI (no editar a mano sin motivo)
  migrations/
    20260710120000_init_schema.sql    · tablas, enums, índices, triggers, RLS habilitado
    20260710120100_rls_policies.sql   · políticas RLS por rol + función is_librarian()
    20260710120200_harden_functions.sql · endurecimiento (security advisors)
  seed.sql                            · datos semilla (usuarios, catálogo, settings)
```

> ⛔ No editar una migración ya aplicada. Para cambiar el esquema, crear una
> migración nueva con timestamp posterior.

## Proyecto remoto

- Ref del proyecto: `umjelnabjdvrsfnqoszt` (nombre `bibliotec`, región us-east-2).
- URL y claves ya están en `.env.local` (git-ignored). Nunca comitear `.env.local`.
- El esquema, las políticas y el seed **ya están aplicados** en ese proyecto
  (F1.2). Verificado: RLS aísla a cada estudiante y el bibliotecario ve todo.

## Aplicar el esquema en local (requiere Docker)

```bash
# 1) Levantar el stack local de Supabase (Postgres, Auth, Studio…)
npx supabase start

# 2) Aplicar migraciones + seed desde cero
npx supabase db reset
```

`db reset` recrea la BD local, corre las migraciones en orden y ejecuta
`seed.sql`. Necesita Docker Desktop en marcha.

## Aplicar/actualizar el esquema en el proyecto remoto

```bash
# Vincular el repo al proyecto remoto (una sola vez; pide el DB password)
npx supabase link --project-ref umjelnabjdvrsfnqoszt

# Empujar migraciones nuevas al remoto
npx supabase db push
```

## Regenerar los tipos de TypeScript

Tras cualquier cambio de esquema, mantener sincronizado `lib/supabase/database.types.ts`:

```bash
npx supabase gen types typescript --project-id umjelnabjdvrsfnqoszt > lib/supabase/database.types.ts
# o, con stack local:  npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## Usuarios semilla (solo para desarrollo)

Contraseña común: **`Biblioteca123`**

| Rol           | Correo                   | Código    |
| ------------- | ------------------------ | --------- |
| estudiante    | maria.garcia@univ.edu.pe | 202100123 |
| estudiante    | juan.perez@univ.edu.pe   | 202100124 |
| estudiante    | ana.torres@univ.edu.pe   | 202100125 |
| estudiante    | luis.diaz@univ.edu.pe    | 202100126 |
| bibliotecario | admin@univ.edu.pe        | ADMIN0001 |

Solo los datos de María y de los libros "Bases de Datos" y "Sistemas Operativos
Modernos" provienen del contexto (§9); el resto son _fixtures_ de demo marcados
en `seed.sql`.
