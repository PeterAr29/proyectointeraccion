# Accesibilidad — BiblioTEC (WCAG 2.1 AA)

> Evaluación e implementación de accesibilidad del sistema. Objetivo: que
> cualquier persona —con o sin discapacidad— pueda entrar y navegar sin barreras.
> Estándar de referencia: **WCAG 2.1 nivel AA**.

**Última actualización:** 2026-07-23 · **Estado:** auditoría hecha; correcciones en curso.

## Método

- Revisión de código componente por componente (landmarks, ARIA, foco, teclado,
  contraste, texto alternativo, movimiento) contra los criterios WCAG 2.1 AA.
- Verificación funcional con Playwright (teclado y lector de pantalla simulado).
- Mapeo de cada hallazgo a su criterio WCAG y a una severidad.

Escala de severidad: 🔴 Serio (bloquea a algún grupo) · 🟠 Moderado · 🟡 Menor.

## Lo que ya cumple

`<html lang="es">` · landmarks `main`/`nav`/`header` · **skip-link** "saltar al
contenido" · **foco visible global** (2.4.7) · `aria-current` en la navegación ·
toasts como `aria-live` · **Modal** con trampa de foco + retorno de foco y
`aria-describedby` · labels + `aria-invalid` en todos los campos · botones de
icono con `aria-label` · iconos decorativos `aria-hidden` · **alt en portadas** ·
contraste AA base (T-021) · **reflow** sin scroll horizontal (1.4.10).

## Hallazgos

| ID  | Sev | Criterio WCAG                    | Hallazgo                                                                                        | Estado       |
| --- | --- | -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| S1  | 🔴  | 3.3.1 (A), 1.3.1 (A), 4.1.3 (AA) | Los mensajes de error de formulario no se anuncian ni se asocian al campo (`aria-describedby`). | ✔ Hecho     |
| S2  | 🔴  | 2.4.3 (A), 1.3.1 (A)             | El drawer móvil no atrapa el foco, no lo devuelve al cerrar ni hace inerte el fondo.            | ✔ Hecho     |
| M1  | 🟠  | 2.3.3 / buena práctica AA        | Las animaciones/transiciones no respetan `prefers-reduced-motion`.                              | ✔ Hecho     |
| M2  | 🟠  | 4.1.3 (AA)                       | El conteo de resultados del filtro en tiempo real no se anuncia a lectores de pantalla.         | ⏳ Pendiente |
| M3  | 🟠  | 1.4.1 (A)                        | Enlaces embebidos en texto distinguidos solo por color (sin subrayado permanente).              | ⏳ Pendiente |
| N1  | 🟡  | 2.5.8 (AA)                       | Objetivos táctiles < 24×24 px (cerrar toast, toggle de contraseña).                             | ⏳ Pendiente |
| N2  | 🟡  | 1.4.3 (AA)                       | Texto secundario a baja opacidad (`text-muted-foreground/70–80`) posiblemente < 4.5:1.          | ⏳ Pendiente |
| N3  | 🟡  | 1.3.5 (AA)                       | `autocomplete` faltante en el perfil (nombre, correo, teléfono).                                | ⏳ Pendiente |
| N4  | 🟡  | 2.2.1 (A, con matices)           | Los toasts se autodescartan a 4 s sin poder pausar (mitigado por el botón cerrar).              | ⏳ Pendiente |
| P1  | ⚙️  | Proceso                          | Sin pruebas automáticas de accesibilidad (axe) en CI.                                           | ⏳ Pendiente |

## Detalle de las correcciones aplicadas

### S1 · Errores de formulario anunciados y asociados

Se creó `components/forms/FieldError.tsx`: renderiza el mensaje con
`role="alert"` (lo anuncia al aparecer) e `id` estable. Cada campo enlaza su
error con `aria-describedby={"<campo>-error"}` cuando hay error (y su texto de
ayuda cuando existe). Aplicado a los 8 formularios: login, registro,
recuperación, perfil, libros (admin), usuarios (admin) y configuración.

### S2 · Trampa de foco del drawer móvil

`MobileNav.tsx` ahora, al abrir: recuerda el elemento con foco, mueve el foco al
drawer, **atrapa el `Tab`** dentro (ciclo con Shift+Tab), bloquea el scroll del
fondo y, al cerrar (X, Escape o clic fuera), **devuelve el foco** al botón que lo
abrió. Reutiliza el patrón ya probado del `Modal`.

### M1 · Respeto a `prefers-reduced-motion`

`globals.css` neutraliza animaciones, transiciones y desplazamiento suave para
quien pide movimiento reducido en su sistema operativo (evita mareo/desorientación).

## Pendiente (siguiente tanda)

M2, M3 y los menores (N1–N4), más la incorporación opcional de **axe-core** en
los e2e y una página pública **/accesibilidad** (declaración de accesibilidad).
