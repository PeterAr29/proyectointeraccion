# Glosario — BiblioTEC

> Términos del dominio del proyecto. Mantén esta lista actualizada conforme aparezcan términos nuevos.

## Términos del negocio

### Préstamo (loan)
**Definición:** Entrega temporal de un ejemplar de un libro a un usuario por un plazo (`dias_prestamo`, por defecto 14).
**Contexto en el sistema:** Tabla `loans`; lógica en `lib/services/loans.ts`. Estados: `activo`, `vencido`, `devuelto`.
**Ejemplo:** María toma prestado "Bases de Datos" con devolución estimada a 14 días.

### Reserva (reservation)
**Definición:** Solicitud de un libro que no está disponible; el usuario queda en cola para cuando se libere.
**Contexto en el sistema:** Tabla `reservations`; `lib/services/reservations.ts`. Estados: `activa`, `cumplida`, `cancelada`. Genera notificación al pasar a disponible.

### Renovación
**Definición:** Extensión del plazo de un préstamo activo. Máximo `max_renovaciones` (por defecto 2). Prohibida si el préstamo está vencido con multa pendiente.
**Contexto en el sistema:** Campo `renovaciones` en `loans`; regla en `loans.ts`.

### Devolución
**Definición:** Registro del retorno del ejemplar; repone `cantidad_disponible` y, si hay retraso, genera multa.
**Contexto en el sistema:** `fecha_devolucion_real` en `loans`; disparado por el estudiante o el bibliotecario (admin).

### Multa (fine)
**Definición:** Cargo por retraso en la devolución. Monto = `dias_retraso × multa_diaria` (soles).
**Contexto en el sistema:** Tabla `fines`; `lib/services/fines.ts`. Estados: `pendiente`, `pagada`. El pago se registra en el panel admin.

### Vencido
**Definición:** Estado de un préstamo cuya `fecha_devolucion_estimada` ya pasó sin devolución real.
**Contexto en el sistema:** Estado `vencido` en `loans`; base para calcular la multa.

### Disponibilidad
**Definición:** Cantidad de ejemplares de un libro que pueden prestarse ahora (`cantidad_disponible` de `cantidad_total`).
**Contexto en el sistema:** Se decrementa al prestar y se repone al devolver; base del StatusBadge del catálogo.

### Favorito (favorite)
**Definición:** Libro marcado por un usuario para acceso rápido.
**Contexto en el sistema:** Tabla `favorites` (PK compuesta user_id + book_id).

### Configuración (settings)
**Definición:** Parámetros globales del sistema: `dias_prestamo` (14), `multa_diaria` (1.00), `max_renovaciones` (2).
**Contexto en el sistema:** Tabla `settings`; editable solo por bibliotecario en `/admin/configuracion`. No retroactivo.

## Términos técnicos del proyecto

### Capa de servicios (services layer)
**Definición:** Conjunto de módulos en `lib/services/` que son la única puerta a los datos y la frontera entre módulos del equipo.
**Dónde aparece:** `lib/services/{users,books,loans,reservations,fines,notifications}.ts`.

### RLS (Row Level Security)
**Definición:** Mecanismo de PostgreSQL que restringe qué filas puede leer/escribir cada usuario a nivel de base de datos.
**Dónde aparece:** `supabase/migrations/*_rls_policies.sql`. Es la autorización **real** del sistema (no la UI).

### Server Component / Server Action
**Definición:** Componentes de React renderizados en el servidor (por defecto en Next.js App Router) y funciones de servidor que ejecutan mutaciones con revalidación de rol.
**Dónde aparece:** Todo `app/` por defecto; `"use client"` solo con interactividad.

### Handoff doc
**Definición:** Documento que una subfase deja al cerrar (`progreso/fase-{n}.{m}-{modulo}.md`) para que la siguiente sesión retome el contexto sin releer todo.

### Módulo (reclamable)
**Definición:** Unidad de trabajo vertical por dominio (A–E) que cualquier dev reclama del tablero. No se asigna fijo a personas. Ver `docs/equipo.md`.

### Kitchen-sink
**Definición:** Página `/kitchen-sink` que muestra todos los componentes del sistema de diseño en sus variantes/estados. Sirve de catálogo visual para el equipo.

## Términos de IHC (Interacción Humano–Computador)

### Heurísticas de Nielsen
**Definición:** 10 principios de usabilidad usados como criterio de aceptación de cada PR de UI (visibilidad del estado, control del usuario, prevención de errores, etc.).

### SUS (System Usability Scale)
**Definición:** Cuestionario estandarizado de 10 ítems que produce un puntaje de usabilidad 0–100. Objetivo del proyecto: ≥ 75.

### Recorrido cognitivo (cognitive walkthrough)
**Definición:** Método de evaluación que simula cómo un usuario nuevo completa una tarea, detectando fricciones en cada paso.

### Metáfora de interfaz
**Definición:** Uso de conceptos familiares (estanterías 📚, carné 🪪, semáforo de estados 🟢🟡🔴) para hacer la interfaz intuitiva. Requisito evaluable del curso.

## Acrónimos

| Acrónimo | Significado | Contexto |
|----------|-------------|----------|
| IHC | Interacción Humano–Computador | Curso y marco de evaluación del proyecto |
| RLS | Row Level Security | Autorización a nivel de base de datos |
| PII | Información de Identificación Personal | Datos de estudiantes (correo, teléfono, código) |
| SUS | System Usability Scale | Métrica de usabilidad objetivo ≥75 |
| ADR | Architecture Decision Record | Registro de decisiones en `docs/adr/` |
| DoD | Definition of Done | Checklist de cierre de cada subfase |
| RF / RNF | Requisito Funcional / No Funcional | `docs/especificaciones.md` |
