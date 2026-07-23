# Cuestionario de usabilidad — BiblioTEC

**Participante (id anónimo):** P\_\_\_\_ · **Rol:** ☐ Estudiante ☐ Bibliotecario/a
· **Fecha:** \_\_\_\_\_\_\_\_\_\_

> Gracias por ayudarnos. **Evaluamos el sistema, no a ti**: no hay respuestas
> correctas ni incorrectas. No pedimos tu nombre ni datos personales.

---

## Parte A — Tareas (las realiza el participante; las marca el observador)

Intenta cada tarea por tu cuenta. El observador anota si la **completaste sin
ayuda**. Piensa en voz alta mientras lo haces.

| #   | Tarea                                                              | ¿Completada sin ayuda? | Notas del observador |
| --- | ------------------------------------------------------------------ | ---------------------- | -------------------- |
| T1  | **Buscar** un libro y **prestarlo** (o reservarlo si no hay stock) | ☐ Sí ☐ No              |                      |
| T2  | **Ampliar** uno de tus préstamos activos (1 día más)               | ☐ Sí ☐ No              |                      |
| T3  | **Devolver** un libro prestado                                     | ☐ Sí ☐ No              |                      |
| T4  | **Reservar** un libro que no tiene ejemplares disponibles          | ☐ Sí ☐ No              |                      |

> Objetivo del proyecto: **≥ 90 %** de estas tareas completadas sin ayuda.

---

## Parte B — Cuestionario SUS (escala 1 a 5)

Marca del **1 (Totalmente en desacuerdo)** al **5 (Totalmente de acuerdo)** según
tu experiencia usando BiblioTEC.

| #   | Afirmación                                                        | 1   | 2   | 3   | 4   | 5   |
| --- | ----------------------------------------------------------------- | --- | --- | --- | --- | --- |
| 1   | Creo que me gustaría usar este sistema con frecuencia.            | ☐   | ☐   | ☐   | ☐   | ☐   |
| 2   | Encontré el sistema innecesariamente complejo.                    | ☐   | ☐   | ☐   | ☐   | ☐   |
| 3   | Pensé que el sistema era fácil de usar.                           | ☐   | ☐   | ☐   | ☐   | ☐   |
| 4   | Creo que necesitaría apoyo técnico para poder usar este sistema.  | ☐   | ☐   | ☐   | ☐   | ☐   |
| 5   | Encontré que las funciones del sistema estaban bien integradas.   | ☐   | ☐   | ☐   | ☐   | ☐   |
| 6   | Pensé que había demasiada inconsistencia en el sistema.           | ☐   | ☐   | ☐   | ☐   | ☐   |
| 7   | Imagino que la mayoría aprendería a usar este sistema muy rápido. | ☐   | ☐   | ☐   | ☐   | ☐   |
| 8   | Encontré el sistema muy engorroso de usar.                        | ☐   | ☐   | ☐   | ☐   | ☐   |
| 9   | Me sentí muy seguro/a usando el sistema.                          | ☐   | ☐   | ☐   | ☐   | ☐   |
| 10  | Necesité aprender muchas cosas antes de poder usar el sistema.    | ☐   | ☐   | ☐   | ☐   | ☐   |

---

## Parte C — Comentarios abiertos (opcional)

- ¿Qué te resultó **más fácil**? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

- ¿Qué te **costó** o te confundió? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

- ¿Qué **mejorarías**? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Nota para quien vacía los datos

Traslada las respuestas de la Parte B (ítems 1–10) y de la Parte A (T1–T4, con
1 = "Sí, sin ayuda" y 0 = "No") a `respuestas-plantilla.csv`, una fila por
participante. Luego corre `calcular-sus.mjs` (ver `README.md`).

### Sugerencia para Google Forms

Crea un formulario con: una pregunta de rol (opción múltiple), 10 preguntas de
**escala lineal 1–5** (una por ítem, con el texto exacto de la Parte B) y las 4
tareas como sí/no. Al cerrar, exporta las respuestas a CSV y adáptalo al formato
de `respuestas-plantilla.csv`.
