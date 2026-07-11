# Handoff — F6.1 Evaluación de usabilidad (Nielsen + recorrido cognitivo + SUS)

**Fecha:** 2026-07-11 · **Dev:** integrador · **Estado:** ✅ Completada · **Fase:** 6 (Evaluación IHC & Producción) · **Siguiente:** F6.2 (Endurecimiento, PWA y despliegue — última)

## Qué quedó hecho

El **entregable evaluable de IHC**: `docs/evaluacion-usabilidad.md` con la
evaluación completa, más la **corrección de los hallazgos críticos** de UX/a11y
detectados (sin tocar lógica de negocio).

### Documento `docs/evaluacion-usabilidad.md`

1. **Evaluación heurística de Nielsen** pantalla por pantalla (acceso, catálogo,
   circulación del estudiante, notificaciones, perfil, todo el panel de admin y
   los componentes transversales) con fortalezas y hallazgos, cada uno con su
   heurística (H1–H10) y **severidad 0–4**.
2. **Recorrido cognitivo** de los 4 flujos críticos (buscar+prestar, renovar,
   devolver, reservar) con las 4 preguntas de Wharton por paso.
3. **Cuestionario SUS**: instrumento de 10 ítems en español, fórmula de cálculo,
   y un **piloto simulado** (6 participantes → promedio 81.7 ≥ 75) claramente
   marcado como **ilustrativo, a reemplazar con datos reales** antes de la entrega.

### Hallazgos corregidos en F6.1 (solo copy / accesibilidad / foco)

| #   | Hallazgo                                                                                             | Sev. | Corrección                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| G1  | Diálogos sin nombre accesible (lector de pantalla anunciaba el diálogo sin título)                   | 3    | `Modal` acepta `label`→`aria-label` (y mantiene `aria-labelledby` con `title`); `Dialog` pasa su título. |
| G2  | `Modal` sin trampa de foco ni retorno de foco al cerrar                                              | 3    | Foco atrapado en Tab/Shift+Tab dentro del diálogo; al cerrar, el foco vuelve al elemento previo.         |
| A1  | Copy del login sugería que solo entraban estudiantes (confusión real observada con el bibliotecario) | 3    | Texto neutral: "Es el mismo para estudiantes y personal de biblioteca".                                  |
| G3  | Sin enlace "saltar al contenido" para teclado                                                        | 2    | Skip-link a `<main id="contenido-principal" tabIndex=-1>` en `AppShell`.                                 |

### Verificaciones (todas en verde)

| Check                          | Resultado                                               |
| ------------------------------ | ------------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                             |
| `npm run lint`                 | Sin errores ni warnings                                 |
| `npm run build`                | OK (25/25 páginas)                                      |
| `npm run test -- --run`        | **137/137** (sin cambios en tests; los fixes son de UI) |
| `npm audit --audit-level=high` | **exit 0**                                              |

## Archivos nuevos / tocados

```
docs/evaluacion-usabilidad.md          · NUEVO · entregable IHC (heurística + recorrido + SUS)
components/feedback/Modal.tsx           · (editado) aria-label + trampa de foco + restaurar foco
components/feedback/Dialog.tsx          · (editado) pasa `label` (nombre accesible) al Modal
components/layout/AppShell.tsx          · (editado) skip-link + main con id/tabIndex
app/(auth)/login/LoginForm.tsx          · (editado) copy neutral al rol
```

**Sin migración ni cambios de lógica de negocio** (regla de F6.1).

## Decisiones no triviales

1. **Solo se corrigieron hallazgos de UX/accesibilidad** (copy, `aria-*`, foco,
   skip-link). Ninguna regla de negocio cambió, como exige la subfase.
2. **SUS con piloto simulado claramente etiquetado**: el documento incluye la
   fórmula y un ejemplo calculado que supera 75, pero advierte de forma explícita
   que **no son datos reales** y deben recolectarse con usuarios de prueba. Se
   evita presentar datos fabricados como genuinos.
3. **Trampa de foco propia** (sin librería nueva): ~20 líneas en `Modal`, reutiliza
   el selector estándar de elementos enfocables. No añade dependencias (§5.3).

## TODOs / deudas que hereda F6.2

- [ ] **Recolectar el SUS real** (5–8 usuarios, estudiantes + bibliotecario) y
      sustituir el piloto simulado; medir el % de tareas críticas completadas (≥90%).
- [ ] **M1 (sev. 2):** exponer por teclado/lector el motivo del bloqueo de "Renovar".
- [ ] **G4 (sev. 1):** pausar el autodescarte de toasts en hover.
- [ ] **A2 (sev. 2):** configurar SMTP para el envío real de recuperación de contraseña.
- [ ] **F6.2 (última):** headers de seguridad (CSP/HSTS…), **PWA instalable**
      (manifest + service worker + íconos, Lighthouse PWA en verde), e2e críticos
      en CI, política de privacidad, deploy final y **tag `v1.0.0`** (hito M4).
- [ ] Deudas previas vigentes (F5.x/F4): paginación admin, limpieza de portadas,
      generación de notificaciones/multas en render (→ job), `next lint` deprecado,
      vuln low `@supabase/auth-js`, Playwright install en CI, Leaked Password
      Protection en Supabase Auth.
