# Evaluación de Usabilidad — BiblioTEC

> **Entregable de Interacción Humano–Computador (F6.1).**
> Evaluación de la usabilidad del sistema con tres instrumentos: (1) evaluación
> heurística de Nielsen pantalla por pantalla, (2) recorrido cognitivo de los
> flujos críticos y (3) cuestionario SUS (System Usability Scale).
>
> **Fecha:** 2026-07-11 · **Versión evaluada:** cierre de la Fase 5 (sistema completo).

---

## 1. Metodología

| Instrumento                         | Qué mide                                    | Cómo se aplicó                                                                           |
| ----------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Evaluación heurística (Nielsen)** | Conformidad con 10 principios de usabilidad | Inspección de experto pantalla por pantalla; cada hallazgo con su heurística y severidad |
| **Recorrido cognitivo**             | Facilidad de aprendizaje de tareas nuevas   | Simulación del razonamiento de un usuario novato en 4 flujos críticos                    |
| **SUS**                             | Percepción global de usabilidad             | Cuestionario de 10 ítems tras usar el sistema; puntaje 0–100 (meta ≥ 75)                 |

### Escala de severidad (Nielsen, 0–4)

| Nivel | Significado                                        |
| ----- | -------------------------------------------------- |
| 0     | No es un problema de usabilidad                    |
| 1     | Cosmético: corregir si sobra tiempo                |
| 2     | Menor: prioridad baja                              |
| 3     | Mayor: prioridad alta, importante corregir         |
| 4     | Catástrofe: obligatorio corregir antes de publicar |

### Las 10 heurísticas de Nielsen

H1 Visibilidad del estado del sistema · H2 Correspondencia con el mundo real ·
H3 Control y libertad del usuario · H4 Consistencia y estándares ·
H5 Prevención de errores · H6 Reconocer antes que recordar ·
H7 Flexibilidad y eficiencia de uso · H8 Diseño estético y minimalista ·
H9 Ayudar a reconocer/diagnosticar/recuperarse de errores · H10 Ayuda y documentación.

---

## 2. Evaluación heurística pantalla por pantalla

Para cada pantalla se listan las **fortalezas** observadas y los **hallazgos**
(problemas) con su heurística y severidad. Los hallazgos marcados **✅ Corregido
(F6.1)** se resolvieron en esta subfase.

### 2.1 Acceso — Login / Registro / Recuperación

**Fortalezas**

- H1: estados de carga en el botón ("Ingresando…"), errores de formulario visibles.
- H5: validación con Zod en cliente y servidor; mostrar/ocultar contraseña.
- H9: mensajes de error humanos, sin jerga técnica ni stack traces.
- Seguridad + UX: rate limiting y anti-enumeración no exponen si un código existe.

**Hallazgos**

| #   | Hallazgo                                                                                                                                        | Heurística | Severidad | Estado                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | -------------------------------------------------------------------------------------------- |
| A1  | El texto "Accede con tu código universitario" sugería que solo los estudiantes inician sesión; el personal de biblioteca no sabía dónde entrar. | H2, H10    | 3         | ✅ Corregido (F6.1): copy neutral — "Es el mismo para estudiantes y personal de biblioteca". |
| A2  | El enlace de recuperación depende de SMTP no configurado en el MVP (el correo no se envía).                                                     | H1         | 2         | Pendiente (config de correo, F6.2/producción).                                               |

### 2.2 Catálogo (`/catalogo`) y detalle (`/catalogo/[id]`)

**Fortalezas**

- H1: los **cuatro estados** (skeleton, vacío, error, datos) están presentes.
- H2: búsqueda por título/autor/ISBN; insignias de disponibilidad tipo "semáforo".
- H3: filtros por URL → compartibles y navegables con el botón "atrás".
- H6: filtros visibles (no hay que recordar la sintaxis de búsqueda).

**Hallazgos**

| #   | Hallazgo                                                                                                       | Heurística | Severidad | Estado                                           |
| --- | -------------------------------------------------------------------------------------------------------------- | ---------- | --------- | ------------------------------------------------ |
| C1  | Las portadas reales usan `<img>` sin lazy-loading explícito; en catálogos grandes podría pesar.                | H7         | 1         | Pendiente (optimización con next/image en F6.2). |
| C2  | El botón Prestar/Reservar del detalle exige sesión; sin ella la redirección es correcta pero sin aviso previo. | H1         | 1         | Aceptado (el middleware protege la ruta).        |

### 2.3 Circulación del estudiante — Mis préstamos / Historial

**Fortalezas**

- H1: estado efectivo (activo/vencido/devuelto) derivado y siempre visible.
- H3: renovar/devolver **exigen confirmación** (diálogo), evitando acciones accidentales.
- H5: "Renovar" se **deshabilita con tooltip** si hay multa pendiente o se alcanzó el máximo (previene el error antes de que ocurra).
- H9: mensajes claros por cada motivo de fallo (límite, multa, ya devuelto).

**Hallazgos**

| #   | Hallazgo                                                                                                                         | Heurística        | Severidad | Estado                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------- | -------------------------------------------------------------------- |
| M1  | El tooltip que explica por qué "Renovar" está deshabilitado solo aparece al pasar el cursor (no accesible por teclado/lectores). | H6, accesibilidad | 2         | Pendiente (exponer el motivo como texto o `aria-describedby`, F6.2). |

### 2.4 Notificaciones (`/notificaciones`)

**Fortalezas**

- H1: campana con badge de no-leídas siempre visible; 4 estados en la vista.
- H2: color e icono por tipo de aviso (reserva/vencimiento/multa) — metáfora coherente.
- H3: marcar una / todas como leídas.

**Hallazgos**

| #   | Hallazgo                                                       | Heurística | Severidad | Estado                                  |
| --- | -------------------------------------------------------------- | ---------- | --------- | --------------------------------------- |
| N1  | El badge se actualiza al navegar/refrescar, no en tiempo real. | H1         | 1         | Pendiente (Realtime opcional, backlog). |

### 2.5 Perfil (`/perfil`)

**Fortalezas**

- H2/H4: formulario consistente con el resto; carreras en `select`.
- H3: derecho de rectificación (Ley 29733) accesible al usuario.

Sin hallazgos de severidad ≥ 2.

### 2.6 Panel de administración (Dashboard, Libros, Usuarios, Circulación, Reportes, Configuración)

**Fortalezas**

- H1: KPIs reales; cada vista con sus 4 estados; toasts confirman cada acción.
- H3: **todas** las acciones destructivas (retirar libro, desactivar usuario, registrar devolución, marcar multa pagada) piden **confirmación**.
- H5: baja lógica en vez de borrado (no se pierde historial); anti-autobloqueo del propio admin; la devolución **advierte la multa estimada** antes de confirmar.
- H2: nombres de dominio en español; insignias de estado consistentes.
- H8: tablas responsive con scroll horizontal en móvil; diseño minimalista.

**Hallazgos**

| #   | Hallazgo                                                                                                                                           | Heurística | Severidad | Estado                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | ------------------------------------------------------------------------------------ |
| E1  | La navegación del bibliotecario mostraba ítems deshabilitados con cursor "prohibido" (fases no construidas), lo que se leía como "bloqueado/roto". | H1, H2     | 2         | Resuelto por avance: al completar la Fase 5 todos los ítems del admin están activos. |
| E2  | Los listados de préstamos/multas no paginan (bien para el piloto de decenas de filas).                                                             | H7         | 1         | Pendiente (paginación admin si crece el volumen).                                    |
| E3  | La edición de usuario no permite cambiar correo/código (evita desincronizar el login).                                                             | H3         | 1         | Aceptado (decisión de diseño; documentado).                                          |

### 2.7 Componentes transversales (diálogos, toasts, formularios)

**Fortalezas**

- H4: sistema de diseño único (Button, Input, Label, StatusBadge, Dialog, Toast).
- H9: `ErrorState`/`EmptyState` consistentes; los errores nunca muestran detalle técnico.

**Hallazgos**

| #   | Hallazgo                                                                                                                 | Heurística         | Severidad | Estado                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------- | --------------------------------------------------------------------------------------- |
| G1  | Los diálogos (`role="dialog"`) no tenían **nombre accesible**: un lector de pantalla anunciaba el diálogo sin su título. | Accesibilidad (H1) | 3         | ✅ Corregido (F6.1): `Modal` acepta `label`/`aria-label`; `Dialog` pasa su título.      |
| G2  | El `Modal` no **atrapaba el foco** ni lo devolvía al cerrar: con teclado se podía "salir" del diálogo hacia el fondo.    | Accesibilidad (H3) | 3         | ✅ Corregido (F6.1): trampa de foco en Tab/Shift+Tab + restaurar foco previo al cerrar. |
| G3  | No existía un enlace "**saltar al contenido**" para usuarios de teclado.                                                 | Accesibilidad (H7) | 2         | ✅ Corregido (F6.1): skip-link al `<main id="contenido-principal">` en el shell.        |
| G4  | Los toasts se autodescartan a los 4 s sin pausa al pasar el cursor.                                                      | H1                 | 1         | Pendiente (pausar en hover, backlog).                                                   |

---

## 3. Recorrido cognitivo de flujos críticos

Método: por cada paso se responden las 4 preguntas del recorrido cognitivo
(Wharton et al.): (1) ¿el usuario intentará el efecto correcto?, (2) ¿verá el
control?, (3) ¿lo asociará con su objetivo?, (4) ¿verá progreso tras actuar?

### 3.1 Buscar y prestar un libro (estudiante)

| Paso | Acción del usuario                | ¿Control visible?          | ¿Feedback?                                      | Veredicto |
| ---- | --------------------------------- | -------------------------- | ----------------------------------------------- | --------- |
| 1    | Abrir "Catálogo" desde el menú    | Sí (ítem activo azul)      | La lista carga con skeleton                     | ✔        |
| 2    | Escribir el título en la búsqueda | Sí (campo con placeholder) | Resultados filtran por URL                      | ✔        |
| 3    | Abrir el detalle del libro        | Sí (tarjeta navegable)     | Página de detalle con disponibilidad            | ✔        |
| 4    | Pulsar "Prestar"                  | Sí (botón primario)        | Diálogo de confirmación con fecha de devolución | ✔        |
| 5    | Confirmar                         | Sí (botón "Prestar")       | Toast de éxito + stock decrementado             | ✔        |

**Resultado:** flujo aprendible sin ayuda. Si el libro no tiene stock, el sistema
**ofrece reservar** en el mismo punto (previene el callejón sin salida).

### 3.2 Renovar un préstamo (estudiante)

| Paso | Acción               | ¿Control visible?                            | ¿Feedback?                          | Veredicto                                                                 |
| ---- | -------------------- | -------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| 1    | Ir a "Mis préstamos" | Sí                                           | Tabla con estado efectivo           | ✔                                                                        |
| 2    | Pulsar "Renovar"     | Sí (deshabilitado con tooltip si no procede) | Diálogo de confirmación             | ✔ / ⚠ (el motivo del bloqueo no es accesible por teclado — hallazgo M1) |
| 3    | Confirmar            | Sí                                           | Diálogo de éxito con la nueva fecha | ✔                                                                        |

### 3.3 Devolver un libro (estudiante y bibliotecario)

| Paso | Acción                                                                  | ¿Control visible? | ¿Feedback?                                               | Veredicto |
| ---- | ----------------------------------------------------------------------- | ----------------- | -------------------------------------------------------- | --------- |
| 1    | Estudiante: "Mis préstamos" → "Devolver"; Bibliotecario: "Devoluciones" | Sí                | Tabla con la multa estimada (admin)                      | ✔        |
| 2    | Confirmar la devolución                                                 | Sí                | Diálogo advierte la multa si hay retraso                 | ✔        |
| 3    | —                                                                       | —                 | Toast (con el monto de multa si aplica) + stock repuesto | ✔        |

**Resultado:** el cálculo de multa es **transparente antes de confirmar** (H5).

### 3.4 Reservar un libro sin stock (estudiante)

| Paso | Acción                        | ¿Control visible?                         | ¿Feedback?                                        | Veredicto |
| ---- | ----------------------------- | ----------------------------------------- | ------------------------------------------------- | --------- |
| 1    | Abrir un libro sin ejemplares | Sí                                        | Estado "Reservado/Prestado" visible               | ✔        |
| 2    | Pulsar "Reservar"             | Sí (el botón cambia según disponibilidad) | Diálogo con disponibilidad estimada               | ✔        |
| 3    | Confirmar                     | Sí                                        | Toast + aviso posterior cuando el libro se libere | ✔        |

**Conclusión del recorrido:** los 4 flujos críticos son completables sin ayuda
externa; el único roce es el motivo de bloqueo de "Renovar" no expuesto a teclado
(M1, severidad 2), agendado para F6.2.

---

## 4. Cuestionario SUS (System Usability Scale)

### 4.1 Instrumento (10 ítems, escala 1–5)

Escala: **1 = Totalmente en desacuerdo … 5 = Totalmente de acuerdo.**

1. Creo que me gustaría usar este sistema con frecuencia.
2. Encontré el sistema innecesariamente complejo.
3. Pensé que el sistema era fácil de usar.
4. Creo que necesitaría apoyo técnico para poder usar este sistema.
5. Encontré que las funciones del sistema estaban bien integradas.
6. Pensé que había demasiada inconsistencia en el sistema.
7. Imagino que la mayoría aprendería a usar este sistema muy rápido.
8. Encontré el sistema muy engorroso de usar.
9. Me sentí muy seguro/a usando el sistema.
10. Necesité aprender muchas cosas antes de poder usar el sistema.

### 4.2 Cálculo del puntaje

- Ítems **impares** (1,3,5,7,9): contribución = (respuesta − 1).
- Ítems **pares** (2,4,6,8,10): contribución = (5 − respuesta).
- **SUS = suma de las 10 contribuciones × 2.5** → rango 0–100.
- Interpretación: < 68 por debajo del promedio; ≥ 68 aceptable; ≥ 80.3 excelente
  (grado A). **Meta del proyecto: ≥ 75.**

### 4.3 Resultados

> ⚠️ **Nota de honestidad académica:** la siguiente tabla es un **ejemplo
> ilustrativo (piloto simulado)** para mostrar el método de cálculo. **Debe
> reemplazarse con las respuestas reales** de 5–8 usuarios de prueba (RNF: ≥ 90 %
> de tareas críticas completables) antes de la entrega final. No son datos de
> participantes reales.

Ejemplo con 6 participantes (P1–P6), respuestas por ítem I1–I10:

| Part. | I1  | I2  | I3  | I4  | I5  | I6  | I7  | I8  | I9  | I10 | SUS   |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ----- |
| P1    | 5   | 2   | 5   | 2   | 4   | 1   | 5   | 2   | 4   | 2   | 85.0  |
| P2    | 4   | 2   | 4   | 2   | 4   | 2   | 4   | 2   | 4   | 3   | 72.5  |
| P3    | 5   | 1   | 5   | 1   | 5   | 1   | 5   | 1   | 5   | 1   | 100.0 |
| P4    | 4   | 3   | 4   | 2   | 4   | 2   | 4   | 3   | 3   | 2   | 67.5  |
| P5    | 5   | 2   | 4   | 1   | 5   | 2   | 5   | 2   | 4   | 2   | 85.0  |
| P6    | 4   | 2   | 5   | 2   | 4   | 1   | 4   | 2   | 4   | 2   | 80.0  |

**Ejemplo de cálculo (P1):** impares (5,5,4,5,4)→(4+4+3+4+3)=18; pares
(2,2,1,2,2)→(3+3+4+3+3)=16; total 34 × 2.5 = **85.0**.

**Promedio del piloto simulado: (85.0+72.5+100.0+67.5+85.0+80.0)/6 = 81.7** →
**supera la meta de 75** (grado A, "excelente"). Con datos reales, si el promedio
quedara por debajo de 75 se priorizarían los hallazgos de severidad ≥ 3.

### 4.4 Plantilla de recolección — Kit SUS listo para aplicar

El **kit completo** para el piloto real está en **`docs/sus-kit/`**:

- `cuestionario-sus.md` — cuestionario distribuible (10 ítems + hoja del observador
  para las 4 tareas críticas), imprimible o para copiar a un Google Form.
- `respuestas-plantilla.csv` — plantilla donde se vacían las respuestas (id anónimo,
  rol, I1–I10, T1–T4, notas).
- `calcular-sus.mjs` — calculadora sin dependencias:
  `node docs/sus-kit/calcular-sus.mjs docs/sus-kit/respuestas.csv` imprime el SUS por
  participante, el **promedio + grado**, el **% de tareas completadas** y una **tabla
  Markdown lista para pegar en §4.3**.
- `README.md` — guía paso a paso del estudio (reclutar 5–8 usuarios, sesión,
  privacidad Ley 29733, cálculo).

Registrar id de participante **anónimo** (P1, P2, …), rol, las 10 respuestas (1–5) y
notas cualitativas. El SUS se calcula con la fórmula de §4.2. **Los CSV con
respuestas reales no se versionan** (ver `.gitignore`).

---

## 5. Hallazgos corregidos en F6.1

| #   | Hallazgo                                    | Severidad | Corrección                                                                |
| --- | ------------------------------------------- | --------- | ------------------------------------------------------------------------- |
| G1  | Diálogos sin nombre accesible               | 3         | `Modal` con `aria-label`/`aria-labelledby`; `Dialog` pasa su título.      |
| G2  | Modal sin trampa de foco ni retorno de foco | 3         | Foco atrapado en Tab/Shift+Tab; se devuelve al elemento previo al cerrar. |
| A1  | Login confuso sobre quién inicia sesión     | 3         | Copy neutral al rol (estudiantes y personal).                             |
| G3  | Sin "saltar al contenido" para teclado      | 2         | Skip-link al `<main>` en el shell.                                        |

**No se modificó lógica de negocio** (regla de F6.1): solo copy, accesibilidad y
foco.

## 6. Hallazgos abiertos (priorizados para F6.2 / backlog)

- **M1 (sev. 2):** exponer por teclado/lector el motivo por el que "Renovar" está
  deshabilitado (hoy solo tooltip).
- **G4 (sev. 1):** pausar el autodescarte de toasts al pasar el cursor.
- **C1 (sev. 1):** lazy-loading/optimización de portadas.
- **A2 (sev. 2):** configurar SMTP para que la recuperación de contraseña envíe correo.
- **N1 (sev. 1):** actualización en tiempo real del badge de notificaciones.

## 7. Conclusiones

BiblioTEC parte de una base de usabilidad **alta**: los cuatro estados en cada
vista, la confirmación en toda acción destructiva, la prevención de errores
(renovar deshabilitado, multa advertida antes de devolver) y un sistema de diseño
consistente cubren bien las heurísticas de Nielsen. La evaluación detectó cuatro
hallazgos de severidad ≥ 2 de accesibilidad/comprensión, **corregidos en F6.1**.
El SUS objetivo (≥ 75) es alcanzable según el piloto simulado; **queda pendiente
recolectar datos reales** de usuarios de prueba para la entrega final. Los
hallazgos abiertos son de severidad ≤ 2 y no bloquean la publicación.
