# ADR-0001: Decisiones iniciales de arquitectura y seguridad

**Fecha:** 2026-07-10
**Estado:** Aceptado

## Contexto

BiblioTEC es una web app mediana (proyecto académico de IHC) desarrollada por 2-3 devs full-time, con datos personales de estudiantes (sensibilidad media) y despliegue en internet público. Necesitamos: (1) permitir trabajo en paralelo con fronteras limpias entre módulos, (2) que la calidad de UX sea un requisito de primera clase, y (3) autorización robusta sin depender de la UI. Este ADR fija las decisiones tomadas en el arranque (stack y seguridad).

## Decisión

Construir con **Next.js 15 (App Router) + Supabase (Postgres con RLS)**, una **capa de servicios obligatoria** como frontera entre módulos, y aplicar **OWASP Top 10 completo (ASVS L1)** con RLS como autorización real.

### Detalle de decisiones

1. **Framework: Next.js 15 App Router.** Server Components por defecto; `"use client"` solo con interactividad.
2. **Backend: Supabase** (Postgres, Auth, Storage, Realtime) en lugar de un backend propio.
3. **Autorización: Row Level Security en Postgres**, no condicionales en React.
4. **Capa de servicios `lib/services/*`** como única puerta a los datos y frontera entre módulos verticales (A–E).
5. **Validación: Zod** compartido cliente/servidor.
6. **Estilos: Tailwind + shadcn/ui** con design tokens del prototipo aprobado.
7. **Testing: Vitest + Playwright**, CI en GitHub Actions desde F1.
8. **Organización de trabajo:** módulos reclamables del tablero (collective ownership), no asignación fija dev→módulo.

## Alternativas consideradas

### Backend propio (Node/Express o NestJS) + Postgres administrado
- ✅ Control total del backend y la lógica de auth.
- ❌ Mucho más andamiaje y mantenimiento para un proyecto de curso; RLS y Auth ya resueltos por Supabase.

### Pages Router de Next.js
- ✅ Más ejemplos históricos.
- ❌ App Router + Server Components reduce JS en cliente y encaja mejor con la capa de servicios en servidor.

### Autorización solo en la aplicación (middleware + checks en services)
- ✅ Simple de razonar en un solo lugar.
- ❌ Un bug de código expone datos de otros usuarios. RLS defiende a nivel de base de datos aunque falle la app.

### Asignación fija de un módulo por desarrollador
- ✅ Claridad de "dueño".
- ❌ Frágil: si alguien falta, su módulo se congela; ociosidad si termina antes. Se elige tablero reclamable.

## Consecuencias

**Positivas:**
- Fronteras limpias (services) → varios devs trabajan en paralelo con bajo acoplamiento.
- RLS como red de seguridad real incluso ante errores de la aplicación.
- Menos backend que mantener; despliegue simple en Vercel.

**Negativas:**
- Dependencia de Supabase (lock-in parcial); mitigable porque Postgres es estándar.
- RLS mal escrita puede bloquear consultas legítimas → requiere disciplina y tests de políticas.

**Riesgos:**
- Curva de aprendizaje de RLS y Server Actions para el equipo. Mitigación: F1.2 deja políticas y patrones de referencia; ADRs para cambios de frontera.

## Referencias

- `CLAUDE.md` (§Arquitectura, §Seguridad)
- `docs/especificaciones.md` (§5 Seguridad, §7 Arquitectura y datos)
- `docs/equipo.md` (módulos y fronteras)
- OWASP Top 10 (2025), OWASP ASVS L1
