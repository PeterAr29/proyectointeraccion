# Kit SUS — Guía de aplicación

> Todo lo necesario para medir la usabilidad **real** de BiblioTEC con el
> **System Usability Scale (SUS)** y sustituir el piloto simulado de
> `docs/evaluacion-usabilidad.md` §4.3 por datos de usuarios de verdad.
>
> **Meta del proyecto:** SUS ≥ 75 · ≥ 90 % de tareas críticas completadas sin ayuda.

## Contenido del kit

| Archivo                    | Para qué sirve                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `cuestionario-sus.md`      | El cuestionario que responde cada participante (10 ítems) + hoja del observador (4 tareas críticas). Imprímelo o cópialo a un Google Form. |
| `respuestas-plantilla.csv` | Plantilla donde vacías las respuestas de todos los participantes.                                                                          |
| `calcular-sus.mjs`         | Calculadora: lee el CSV y te da el puntaje SUS por persona, el promedio, el grado y el % de tareas completadas. Sin dependencias.          |

## Cómo correr el estudio (paso a paso)

### 1. Recluta participantes

- **5 a 8 personas** representativas: mayoría **estudiantes** + al menos **1
  bibliotecario/a** (el sistema tiene dos roles). Con 5 usuarios ya se detecta la
  mayoría de problemas de usabilidad; 8 da un promedio SUS más estable.
- No uses a nadie que haya desarrollado el sistema.

### 2. Prepara el entorno

- ⚠️ **Verifica que Supabase esté `ACTIVE_HEALTHY` antes de cada sesión.** El plan
  gratuito **pausa el proyecto tras ~7 días sin actividad** y entonces el login queda
  colgado (la app sigue devolviendo la página, pero cualquier acción contra Supabase
  agota el tiempo). Un proyecto pausado arruina la sesión sin avisar. Reactívalo desde
  el panel de Supabase y espera a `ACTIVE_HEALTHY`.
- Da acceso a la app en producción: **https://proyectointeraccion.vercel.app**
  (mejor desde el **móvil**, ya que es PWA e instalable).
- Ten cuentas de prueba listas (usuario/contraseña) para cada rol. **No** uses la
  cuenta personal real de nadie.
- **Prepara los datos para que las 4 tareas sean posibles** (si no, no se pueden
  intentar):
  - **T2 (ampliar)** y **T3 (devolver):** la cuenta de estudiante debe tener **1–2
    préstamos activos**, y el de T2 **sin haber usado aún su ampliación** (política
    2 días + 1 ampliación de 1 día; si ya se amplió, "Ampliar" saldrá deshabilitado).
    Tampoco debe tener multa pendiente (bloquea la ampliación).
  - **T4 (reservar):** debe existir al menos **un libro con 0 ejemplares
    disponibles**, para que aparezca "Reservar" en vez de "Prestar".
  - **T1 (buscar+prestar):** basta con que haya libros con stock (los hay en el seed).

### 3. Sesión con cada participante (~15 min)

1. Explica que se evalúa **el sistema, no a la persona**: no hay respuestas
   correctas ni incorrectas; que piense en voz alta.
2. Pídele que intente **las 4 tareas críticas** (ver `cuestionario-sus.md`). Como
   **observador**, marca por cada tarea si la completó **sin ayuda** (no le des
   pistas salvo que se bloquee del todo).
3. Al terminar las tareas, que responda los **10 ítems del SUS** (escala 1–5).
4. Anota comentarios cualitativos (qué le costó, qué le gustó).

### 4. Vacía las respuestas

- Copia las respuestas de cada participante a `respuestas-plantilla.csv` (una fila
  por persona). Guárdalo, p. ej., como `respuestas.csv`.
- **Privacidad (Ley 29733):** usa un id anónimo (P1, P2, …). **No** anotes nombres,
  códigos ni correos. El CSV con respuestas **no se comitea** (contiene opinión de
  personas identificables por contexto); guárdalo aparte.

### 5. Calcula el puntaje

```bash
node docs/sus-kit/calcular-sus.mjs docs/sus-kit/respuestas.csv
```

Te imprime: la tabla por participante, el **promedio SUS**, el **grado** (A/B/C…),
y el **% de tareas críticas completadas sin ayuda**. También genera una **tabla en
Markdown** lista para pegar en `docs/evaluacion-usabilidad.md` §4.3.

### 6. Actualiza el entregable

- Pega la tabla y el promedio reales en `docs/evaluacion-usabilidad.md` §4.3,
  **reemplazando la nota de "piloto simulado"**.
- Si el promedio **< 75** o el éxito de tareas **< 90 %**, prioriza los hallazgos de
  severidad ≥ 3 de §2, corrige y vuelve a medir.

## Fórmula (referencia)

- Ítems **impares** (1,3,5,7,9): contribución = (respuesta − 1).
- Ítems **pares** (2,4,6,8,10): contribución = (5 − respuesta).
- **SUS = suma de las 10 contribuciones × 2.5** → 0–100.
- Interpretación: < 68 bajo el promedio · ≥ 68 aceptable · ≥ 75 meta del proyecto ·
  ≥ 80.3 excelente (grado A).

La calculadora aplica exactamente esta fórmula (misma que §4.2 del entregable).
