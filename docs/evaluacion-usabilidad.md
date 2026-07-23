# Evaluación de Usabilidad — BiblioTEC

> **Entregable de Interacción Humano–Computador (F6.1).**
> Evaluación de la usabilidad del sistema con tres instrumentos: (1) evaluación
> heurística de Nielsen pantalla por pantalla, (2) recorrido cognitivo de los
> flujos críticos y (3) cuestionario SUS (System Usability Scale).
>
> **Fecha:** 2026-07-11 · **Versión evaluada:** cierre de la Fase 5 (sistema completo).

> ⚠️ **Re-evaluación 2026-07-23 (T-021).** El **rediseño de UX del 12-jul**
> (login a dos columnas, **Inicio como tablero**, **catálogo por áreas
> académicas**, shell con degradado azul→índigo) y el **cambio de la política de
> préstamo a 2 días + 1 ampliación de 1 día** dejaron obsoletas partes de esta
> evaluación: describía pantallas que ya no existen y un plazo de préstamo
> anterior. Este documento se **re-pasó sobre la UI actual**. Los apartados
> revisados están marcados **(re-evaluado 07-23)** y los hallazgos nuevos llevan
> prefijo **R** (§8 los resume). La medición del **contraste AA** del texto sobre
> el degradado —nunca hecha antes— se realizó en esta pasada (hallazgo **R1**,
> ✅ corregido). **La recolección del SUS real (§4.3) debe hacerse sobre esta UI**,
> no antes.

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

### 2.1 Acceso — Login / Registro / Recuperación _(re-evaluado 07-23)_

**Rediseño del 12-jul:** en escritorio, dos columnas — panel de marca a la
izquierda (mensaje neutral "Tu biblioteca universitaria, en un solo lugar" + tres
ventajas) y formulario a la derecha; en móvil, una sola columna centrada con marca
compacta. El encabezado del formulario ("Bienvenido de nuevo a tu biblioteca") es
neutral al rol.

**Fortalezas**

- H1: estados de carga en el botón ("Ingresando…"), errores de formulario visibles.
- H5: validación con Zod en cliente y servidor; mostrar/ocultar contraseña.
- H9: mensajes de error humanos, sin jerga técnica ni stack traces.
- H8: el panel de marca comunica el propósito sin ruido; motivos autocontenidos (sin
  imágenes externas, compatibles con la CSP).
- Seguridad + UX: rate limiting y anti-enumeración no exponen si un código existe.

**Hallazgos**

| #   | Hallazgo                                                                                                                                                                  | Heurística | Severidad | Estado                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A1  | El texto "Accede con tu código universitario" sugería que solo los estudiantes inician sesión; el personal de biblioteca no sabía dónde entrar.                           | H2, H10    | 3         | ✅ Corregido (F6.1) — ⚠️ **regresión parcial en el rediseño**, ver **R4**: se eliminó la aclaración explícita para el personal. |
| A2  | El enlace de recuperación depende de SMTP no configurado en el MVP (el correo no se envía).                                                                               | H1         | 2         | Pendiente (config de correo, F6.2/producción).                                                                                  |
| R4  | El rediseño quitó la aclaración de que el login es el mismo para estudiantes y personal. El copy ya no es _engañoso_ (era el problema de A1), pero se perdió el refuerzo. | H2, H10    | 1         | ✅ Corregido (T-021): línea neutral "El mismo acceso para estudiantes y personal de biblioteca" bajo el campo de código.        |

### 2.2 Catálogo (`/catalogo`) y detalle (`/catalogo/[id]`) _(re-evaluado 07-23)_

**Rediseño del 12-jul:** `/catalogo` ya no abre con el listado plano sino con un
**hub por áreas académicas** (`AreaHub`): buscador global arriba, "Tu área"
destacada según la carrera del estudiante y una tarjeta por cada una de las 5
áreas con su icono, color y conteo de libros. Al elegir un área se pasa al listado
filtrado (`?categoria=…`) con **migas de pan** ("Áreas / <área>"); "ver todo"
(`?ver=todo`) muestra el listado completo.

**Fortalezas**

- H1: los **cuatro estados** (skeleton, vacío, error, datos) se conservan en el listado.
- H2: organización por **área/facultad** (metáfora del mundo real de la biblioteca);
  búsqueda por título/autor/ISBN; insignias de disponibilidad tipo "semáforo".
- H3: filtros y área por URL → compartibles y navegables con "atrás"; migas de pan
  para volver a las áreas.
- H6: entrada por reconocimiento (tarjetas de área con icono/color) en vez de recordar
  qué buscar; la carrera del estudiante **personaliza** sin ocultar el resto.
- H8: color e icono por área dan jerarquía visual sin saturar.

**Hallazgos**

| #   | Hallazgo                                                                                                                                                 | Heurística | Severidad | Estado                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| C1  | Las portadas reales usan `<img>` sin lazy-loading explícito; en catálogos grandes podría pesar.                                                          | H7         | 1         | Pendiente (optimización con next/image en el backlog).                                                     |
| C2  | El botón Prestar/Reservar del detalle exige sesión; sin ella la redirección es correcta pero sin aviso previo.                                           | H1         | 1         | Aceptado (el middleware protege la ruta).                                                                  |
| C3  | El hub añade un paso extra para quien solo quiere "ver todos los libros"; el buscador global y "ver todo" lo mitigan, pero no es la opción más evidente. | H7         | 1         | Aceptado — la organización por área es una decisión de diseño del curso (metáfora de biblioteca).          |
| C4  | Un libro cuya `categoria` caiga fuera de `AREA_LABELS` queda huérfano del hub (no aparece en ninguna tarjeta de área).                                   | H5         | 2         | Pendiente — el formulario del bibliotecario ya restringe a lista controlada; falta validar datos migrados. |

### 2.3 Circulación del estudiante — Mis préstamos / Historial _(re-evaluado 07-23)_

**Política vigente (cambio del 12-jul):** préstamo de **2 días** con **1 ampliación
de 1 día** (antes: 7 días con renovaciones). La ampliación suma exactamente 1 día y
reinicia el aviso de vencimiento (regresión corregida el 22-jul, ver
`progreso/fase-7-ux.md`). El margen más corto (horas, no días) hace que la
**visibilidad del vencimiento** sea más crítica que antes.

**Fortalezas**

- H1: estado efectivo (activo/vencido/devuelto) derivado y siempre visible.
- H3: ampliar/devolver **exigen confirmación** (diálogo), evitando acciones accidentales.
- H5: la acción de ampliar se **deshabilita con tooltip** si hay multa pendiente o se alcanzó el máximo (previene el error antes de que ocurra).
- H9: mensajes claros por cada motivo de fallo (límite, multa, ya devuelto).

**Hallazgos**

| #   | Hallazgo                                                                                                                                                                             | Heurística        | Severidad | Estado                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | --------- | --------------------------------------------------------------------------------------------------- |
| M1  | El tooltip que explica por qué la acción está deshabilitada solo aparece al pasar el cursor (no accesible por teclado/lectores).                                                     | H6, accesibilidad | 2         | Pendiente (exponer el motivo como texto o `aria-describedby`, backlog).                             |
| R3  | Terminología inconsistente tras el cambio 2+1: el botón dice **"Renovar"** (y su `aria-label`), pero el diálogo de confirmación y la configuración dicen **"Ampliar"/"ampliación"**. | H4                | 2         | ✅ Corregido (T-021): unificado a **"Ampliar"** (botón, `aria-label`, columna, mensajes y diálogo). |

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

| #   | Hallazgo                                                                                                                                                                                                                                                            | Heurística         | Severidad | Estado                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------- | --------------------------------------------------------------------------------------------------------------------- |
| G1  | Los diálogos (`role="dialog"`) no tenían **nombre accesible**: un lector de pantalla anunciaba el diálogo sin su título.                                                                                                                                            | Accesibilidad (H1) | 3         | ✅ Corregido (F6.1): `Modal` acepta `label`/`aria-label`; `Dialog` pasa su título.                                    |
| G2  | El `Modal` no **atrapaba el foco** ni lo devolvía al cerrar: con teclado se podía "salir" del diálogo hacia el fondo.                                                                                                                                               | Accesibilidad (H3) | 3         | ✅ Corregido (F6.1): trampa de foco en Tab/Shift+Tab + restaurar foco previo al cerrar.                               |
| G3  | No existía un enlace "**saltar al contenido**" para usuarios de teclado.                                                                                                                                                                                            | Accesibilidad (H7) | 2         | ✅ Corregido (F6.1): skip-link al `<main id="contenido-principal">` en el shell.                                      |
| G4  | Los toasts se autodescartan a los 4 s sin pausa al pasar el cursor.                                                                                                                                                                                                 | H1                 | 1         | Pendiente (pausar en hover, backlog).                                                                                 |
| R1  | Tras el rediseño con degradado azul→índigo, cuatro textos con opacidad reducida (`/70`–`/75`) sobre el azul `#1D4ED8` (fecha del hero, nav inactivo del sidebar, features y © del panel de login) quedaban en **4.10–4.48:1**, por debajo del mínimo **AA 4.5:1**. | Accesibilidad (H4) | 3         | ✅ Corregido (T-021, commit `abbc94f`): subidos a `/85` → **5.30:1**. Medición de contraste que nunca se había hecho. |

### 2.8 Inicio — tablero personalizado (`/inicio`) _(nuevo en el rediseño 12-jul)_

**Rediseño del 12-jul:** el Inicio dejó de ser una página de accesos rápidos y pasó
a ser un **tablero**: hero con saludo y fecha en español + chip de rol, una tira de
**estadísticas reales por rol** (estudiante: préstamos/favoritos/avisos ·
bibliotecario: libros/usuarios/préstamos/multas) cada una enlazada a su sección, y un
destacado **"Próxima devolución"** con urgencia por color, más los accesos rápidos.

**Fortalezas**

- H1: cada estadística es un dato real (no un placeholder) y enlaza a su sección; el
  `loading.tsx` muestra skeletons mientras carga.
- H2/H6: "Próxima devolución" con urgencia por color **y texto** ("Vence hoy",
  "Faltan N días", "Venció hace N días") — no depende solo del color (WCAG 1.4.1).
- H7: atajos directos a las tareas frecuentes desde la primera pantalla.
- H8: jerarquía clara (hero → estadísticas → destacado → accesos).

**Hallazgos**

| #   | Hallazgo                                                                                                                                                                                                                                                                                                    | Heurística | Severidad | Estado                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | -------------------------------------------------------------------------------------- |
| R2  | En "Próxima devolución", el badge de urgencia (`Vence hoy` / `Faltan N días`) está oculto en móvil (`hidden … sm:inline`). Con la política 2+1 el margen es de horas, así que perder la señal de urgencia en el celular —el dispositivo objetivo (PWA)— es justo donde más importa. La fecha sí se muestra. | H1         | 2         | ✅ Corregido (T-021): el badge se muestra en móvil; el arrow decorativo se oculta ahí. |

---

## 3. Recorrido cognitivo de flujos críticos

Método: por cada paso se responden las 4 preguntas del recorrido cognitivo
(Wharton et al.): (1) ¿el usuario intentará el efecto correcto?, (2) ¿verá el
control?, (3) ¿lo asociará con su objetivo?, (4) ¿verá progreso tras actuar?

### 3.1 Buscar y prestar un libro (estudiante) _(re-evaluado 07-23)_

| Paso | Acción del usuario                                   | ¿Control visible?            | ¿Feedback?                                      | Veredicto |
| ---- | ---------------------------------------------------- | ---------------------------- | ----------------------------------------------- | --------- |
| 1    | Abrir "Catálogo" desde el menú                       | Sí (ítem activo del sidebar) | Se abre el **hub de áreas**                     | ✔        |
| 2    | Buscar por título (buscador global) o elegir un área | Sí (buscador + tarjetas)     | Listado filtrado con migas de pan               | ✔        |
| 3    | Abrir el detalle del libro                           | Sí (tarjeta navegable)       | Página de detalle con disponibilidad            | ✔        |
| 4    | Pulsar "Prestar"                                     | Sí (botón primario)          | Diálogo de confirmación con fecha de devolución | ✔        |
| 5    | Confirmar                                            | Sí (botón "Prestar")         | Toast de éxito + stock decrementado             | ✔        |

**Resultado:** flujo aprendible sin ayuda. El hub de áreas añade un paso frente al
listado plano anterior, mitigado por el buscador global visible arriba (hallazgo C3).
Si el libro no tiene stock, el sistema **ofrece reservar** en el mismo punto (previene
el callejón sin salida).

### 3.2 Ampliar un préstamo (estudiante) _(re-evaluado 07-23)_

> Política vigente: **2 días + 1 ampliación de 1 día**. La UI llama a esta acción
> "Renovar" en el botón pero "Ampliar" en el diálogo/configuración (hallazgo **R3**).

| Paso | Acción                     | ¿Control visible?                            | ¿Feedback?                                        | Veredicto                                                                           |
| ---- | -------------------------- | -------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1    | Ir a "Mis préstamos"       | Sí                                           | Tabla con estado efectivo y "N de 1" renovaciones | ✔                                                                                  |
| 2    | Pulsar "Renovar"/"Ampliar" | Sí (deshabilitado con tooltip si no procede) | Diálogo "Confirmar ampliación"                    | ✔ / ⚠ (el motivo del bloqueo no es accesible por teclado — M1; nombre mixto — R3) |
| 3    | Confirmar ("Ampliar")      | Sí                                           | Diálogo de éxito con la nueva fecha (+1 día)      | ✔                                                                                  |

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

**Conclusión del recorrido:** los 4 flujos críticos siguen siendo completables sin
ayuda externa tras el rediseño. Los roces detectados son de severidad ≤ 2 y no
bloquean la tarea: el motivo de bloqueo de la ampliación no expuesto a teclado (M1),
el paso extra del hub de áreas (C3) y el nombre mixto "Renovar"/"Ampliar" (R3).

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

### 5.1 Corregido en la re-evaluación (T-021, 2026-07-23)

| #   | Hallazgo                                                                   | Severidad | Corrección                                                                            |
| --- | -------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| R1  | Texto con opacidad reducida sobre el degradado azul por debajo de AA 4.5:1 | 3         | Opacidades `/70`–`/75` → `/85` (4.10–4.48:1 → **5.30:1**), commit `abbc94f`. Solo UX. |
| R2  | Badge de urgencia de "Próxima devolución" oculto en móvil                  | 2         | El badge se muestra también en móvil; el arrow decorativo se oculta ahí (`sm:block`). |
| R3  | Terminología "Renovar"/"Ampliar" inconsistente                             | 2         | Unificado a **"Ampliar"** (botón, `aria-label`, columna "Ampliaciones", mensajes).    |
| R4  | Login sin aclaración de rol tras el rediseño                               | 1         | Línea neutral "El mismo acceso para estudiantes y personal de biblioteca".            |

## 6. Hallazgos abiertos (priorizados para el backlog)

**Del rediseño (re-evaluación 07-23):**

- **C4 (sev. 2):** validar que ningún libro tenga `categoria` fuera de `AREA_LABELS`
  (quedaría huérfano del hub de áreas). El formulario del bibliotecario ya restringe a
  lista controlada; falta un chequeo de datos migrados.

> **R1, R2, R3 y R4 se corrigieron en la propia re-evaluación (T-021)** — ver §5.1.

**Previos (F6.1):**

- **M1 (sev. 2):** exponer por teclado/lector el motivo por el que la ampliación está
  deshabilitada (hoy solo tooltip).
- **A2 (sev. 2):** configurar SMTP para que la recuperación de contraseña envíe correo.
- **G4 (sev. 1):** pausar el autodescarte de toasts al pasar el cursor.
- **C1 (sev. 1):** lazy-loading/optimización de portadas.
- **N1 (sev. 1):** actualización en tiempo real del badge de notificaciones.

## 7. Conclusiones

BiblioTEC parte de una base de usabilidad **alta**: los cuatro estados en cada
vista, la confirmación en toda acción destructiva, la prevención de errores
(ampliación deshabilitada, multa advertida antes de devolver) y un sistema de
diseño consistente cubren bien las heurísticas de Nielsen. La evaluación de F6.1
detectó cuatro hallazgos de severidad ≥ 2 de accesibilidad/comprensión,
**corregidos en F6.1**. La **re-evaluación del 2026-07-23** sobre la UI rediseñada
del 12-jul añadió cinco hallazgos, **cuatro de ellos corregidos en la misma pasada**:
el de accesibilidad de severidad 3 (**R1**, contraste sobre el degradado) y tres de
severidad ≤ 2 (**R2** badge de urgencia en móvil, **R3** término "Ampliar" unificado,
**R4** aclaración de rol en el login). Queda abierto un único hallazgo de severidad 2
(**C4**, validar categorías fuera de áreas), sin impacto en los flujos críticos. El
SUS objetivo (≥ 75) es alcanzable según el piloto simulado; **queda pendiente
recolectar datos reales** de usuarios de prueba sobre esta UI para la entrega final.
Los hallazgos abiertos son de severidad ≤ 2 y no bloquean la publicación.

---

## 8. Resumen de la re-evaluación heurística (T-021, 2026-07-23)

Pasada de inspección sobre la UI rediseñada del 12-jul (login a dos columnas, Inicio
como tablero, catálogo por áreas, shell con degradado azul→índigo) y la política de
préstamo 2+1. Incluye la **primera medición de contraste AA** del texto sobre el
degradado.

| #   | Pantalla / componente               | Heurística         | Severidad | Estado                          |
| --- | ----------------------------------- | ------------------ | --------- | ------------------------------- |
| R1  | Texto sobre el degradado azul       | Accesibilidad (H4) | 3         | ✅ Corregido (commit `abbc94f`) |
| R2  | Inicio · "Próxima devolución"       | H1                 | 2         | ✅ Corregido (T-021)            |
| R3  | Circulación · "Renovar/Ampliar"     | H4                 | 2         | ✅ Corregido (T-021)            |
| C4  | Catálogo · categoría fuera de áreas | H5                 | 2         | Abierto (backlog)               |
| C3  | Catálogo · paso extra del hub       | H7                 | 1         | Aceptado (decisión de diseño)   |
| R4  | Login · aclaración de rol           | H2, H10            | 1         | ✅ Corregido (T-021)            |

**Método del contraste (R1):** ratio WCAG 2.1 calculado con el peor caso del
degradado (extremo claro `#1D4ED8` = `hsl(224 76% 48%)`), componiendo el texto blanco
a su opacidad sobre ese fondo. Umbral AA para texto normal: **4.5:1**. Textos
afectados: fecha del hero (`/70`, 4.10:1), nav inactivo del sidebar (`/75`, 4.48:1),
features del panel de login (`/75`, 4.48:1) y © del panel (`/70`, 4.10:1). Todos
subidos a `/85` (**5.30:1**). El texto blanco pleno (6.70:1) y los botones ya cumplían;
los ítems deshabilitados están exentos (WCAG 1.4.3).

**Cierre de la re-evaluación:** de los cinco hallazgos, **R1–R4 quedaron corregidos**
(ver §5.1); solo **C4** sigue en backlog (severidad 2, sin impacto en los flujos).
Verificado tras las correcciones: typecheck/lint limpios y **145/145 unit**. Con la UI
ya pulida, el siguiente paso es el **SUS real** (T-022, kit `docs/sus-kit/`).

**Siguiente:** recolectar el **SUS real** (§4.3) sobre esta UI con el kit
`docs/sus-kit/` (T-022). Verificar antes que Supabase esté `ACTIVE_HEALTHY`.
