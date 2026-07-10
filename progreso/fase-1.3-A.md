# Handoff — F1.3 Sistema de diseño (kitchen-sink) (Módulo A)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Siguiente:** F1.4 (acceso + shell + perfil)

## Qué quedó hecho

Los componentes reutilizables del sistema de diseño de BiblioTEC (semáforo de
estados, portadas, feedback y diálogos globales) más las utilidades de fecha y
moneda, todo mostrado en `/kitchen-sink`. Los tokens (colores, Inter, radio 8px)
ya existían desde F1.1 en `tailwind.config.ts` + `app/globals.css`; esta subfase
construye los componentes que los consumen. Este es **el catálogo de UI que
reutilizan los módulos B–E**. No se conecta a datos: todo recibe props.

### Verificaciones (todas en verde)

| Check                          | Resultado                                   |
| ------------------------------ | ------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                 |
| `npm run lint`                 | Sin errores ni warnings                     |
| `npm run test -- --run`        | **17/17** (smoke + dates + currency)        |
| `npm run build`                | OK; `/kitchen-sink` prerenderizado estático |
| `npm audit --audit-level=high` | **exit 0** (solo low/moderate ya anotadas)  |

## Catálogo de componentes (nombres, ubicación y props)

> Frontera de UI para B–E. Importar por su ruta `@/components/...`.

### `components/ui/button.tsx` — `Button`

Primitivo base (cva). `variant`: `primary` (def) · `secondary` · `danger` ·
`warning` · `ghost` · `link`. `size`: `default` · `sm` · `lg` · `icon`. Acepta
todos los props de `<button>`; `type="button"` por defecto. Foco visible AA
heredado de `globals.css`.
**Nota:** aunque vive en `components/ui/`, **no** lo generó el CLI de shadcn (se
escribió a mano). No está sujeto a la regla "no tocar" de primitivos shadcn.

### `components/biblioteca/StatusBadge.tsx` — `StatusBadge`

Pill del semáforo de estados. Props: `status` (string; entiende los enums de la
BD en minúscula), `label?`, `tone?`, `className?`.
Estados mapeados → tono: `disponible/devuelto/cumplida/pagada`→success ·
`reservado/activa/pendiente`→warning · `prestado/vencido`→danger · `activo`→info ·
`cancelada`→neutral. Un status desconocido cae a neutral con el texto crudo.
Exporta los tipos `BadgeStatus` y `BadgeTone`.

### `components/biblioteca/BookCover.tsx` — `BookCover`

Portada. Props: `title` (obligatorio, semilla del gradiente + alt), `coverUrl?`
(si existe, renderiza `<img>`; si no, marcador con gradiente estable por título),
`seed?`, `showTitle?` (def true), `className?`. Aspecto 2:3. El gradiente se
elige con un hash djb2 estable → mismo libro, mismo color siempre. Cuando F2/F5
suban portadas reales a Storage, pasar `coverUrl` (revisar `next/image` ahí; hoy
usa `<img>` con un eslint-disable puntual).

### Feedback — `components/feedback/`

- **`Skeleton.tsx`** → `Skeleton` (bloque genérico, `aria-hidden`),
  `BookCardSkeleton`, `TableRowSkeleton({columns})`. Estado **cargando**.
- **`EmptyState.tsx`** → `EmptyState`. Props: `icon?` (LucideIcon, def `Inbox`),
  `title`, `message?`, `actionLabel?`, `onAction?`. Estado **vacío**.
- **`ErrorState.tsx`** → `ErrorState`. Props: `title?`, `message?`, `onRetry?`,
  `retryLabel?`. `role="alert"`. Mensaje humano — **nunca** expone el error
  técnico (A04/A09). Estado **error**.
- **`Modal.tsx`** → `Modal` (**client**). Primitivo de diálogo accesible. Props:
  `open`, `onClose`, `title?`, `description?`, `showClose?`, `dismissable?`,
  `className?`, `children`. `role="dialog"` aria-modal, cierra con Escape / clic
  en fondo / X, bloquea scroll del body, lleva foco al panel.
- **`Dialog.tsx`** → `Dialog` (**client**, sobre `Modal`). Diálogos globales por
  `variant`: `success · warning · error · confirm · confirm-danger ·
session-expired · offline · access-denied · incomplete-fields · invalid-date`.
  Props: `open`, `onClose`, `variant`, `title?`, `message?`, `onConfirm?`,
  `confirmLabel?`, `cancelLabel?`. `confirm*` muestran botón Cancelar;
  `session-expired`/`offline` son no-descartables (obligan a actuar). Exporta
  `DialogVariant`.
- **`Toast.tsx`** → `ToastProvider`, `useToast()`, tipos `ToastVariant`
  (`success·error·warning·info`). Notificaciones efímeras (auto-cierre 4 s,
  `aria-live="polite"`). Uso: envolver el árbol con `<ToastProvider>` y llamar
  `const { toast } = useToast(); toast("mensaje", "success")`.

### Utilidades — `lib/utils/`

- **`cn.ts`** → `cn(...)` (ya existía en F1.1).
- **`dates.ts`** → `formatDate` (`DD/MM/AAAA`), `toDate`, `today`, `isPastDate`,
  `daysBetween`, const `NO_DATE` (`"—"`). **Detalle clave:** las cadenas
  date-only `AAAA-MM-DD` se parsean en **hora local** para evitar el corrimiento
  de un día por UTC (bug real con las columnas `date`/`timestamptz` de Postgres).
  Valores nulos/ inválidos → `NO_DATE`, no rompen la UI.
- **`currency.ts`** → `formatCurrency` (`S/ 1,234.50`, 2 decimales,
  determinista sin depender del locale), const `CURRENCY_SYMBOL` (`"S/"`).
  Entradas no finitas → `S/ 0.00`.

## Decisiones y detalles no triviales

1. **Server Components por defecto.** Solo `Modal`, `Dialog`, `Toast` y la demo
   `InteractiveShowcase` llevan `"use client"` (tienen estado/eventos). La página
   `/kitchen-sink` es Server Component e importa el showcase cliente.
2. **Colores de las insignias con contraste AA.** El prototipo usa texto en el
   color base (p. ej. `#16A34A` sobre `#DCFCE7`); aquí se usa `bg-*-100` con
   `text-*-800` para asegurar AA. Misma metáfora de semáforo, mejor contraste.
3. **`ToastProvider` aún no montado en la app.** Para la demo se envuelve solo el
   showcase. **F1.4 debe montar `<ToastProvider>` en el shell** (`app/(app)/layout.tsx`)
   para que `useToast()` funcione en toda la app.
4. **`Button` no es de shadcn CLI.** Se escribió a mano (sin red para el CLI).
   Vive en `components/ui/` por convención, pero puede editarse sin la ceremonia
   de "primitivo generado".
5. **`BookCover` usa `<img>`**, no `next/image`, con un `eslint-disable` puntual;
   decisión a revisar en F2/F5 cuando haya portadas reales en Storage.

## Archivos nuevos

```
components/ui/button.tsx                       · Button (cva, 6 variantes)
components/biblioteca/StatusBadge.tsx          · semáforo de estados
components/biblioteca/BookCover.tsx            · portada (gradiente/imagen)
components/feedback/Skeleton.tsx               · Skeleton + variantes
components/feedback/EmptyState.tsx             · estado vacío
components/feedback/ErrorState.tsx             · estado de error
components/feedback/Modal.tsx                  · modal base accesible (client)
components/feedback/Dialog.tsx                 · 10 diálogos globales (client)
components/feedback/Toast.tsx                  · ToastProvider + useToast (client)
lib/utils/dates.ts        (+ dates.test.ts)    · fechas DD/MM/AAAA
lib/utils/currency.ts     (+ currency.test.ts) · moneda S/
app/kitchen-sink/page.tsx                      · catálogo visual (server)
app/kitchen-sink/InteractiveShowcase.tsx       · demo interactiva (client)
```

No se añadieron dependencias nuevas (se reusan `class-variance-authority`,
`clsx`, `tailwind-merge`, `lucide-react`, ya presentes desde F1.1).

## TODOs para F1.4

- [ ] Montar `<ToastProvider>` en el shell `app/(app)/layout.tsx`.
- [ ] Usar los diálogos globales (`Dialog`) para los errores de auth en lenguaje
      humano (login/registro/recuperar), y `useToast` para confirmaciones.
- [ ] Crear `middleware.ts` raíz que consuma `lib/supabase/middleware.ts:updateSession`
      (recordatorio: `middleware.ts` está en la lista de "no tocar sin avisar").
- [ ] Activar Leaked Password Protection en Supabase Auth (deuda de F1.2).
- [ ] `supabase link` + regenerar `database.types.ts` con el CLI.

## Cómo lo prueba el siguiente dev

1. `npm run dev` → abrir `http://localhost:3000/kitchen-sink`.
2. Ver botones, insignias (semáforo), portadas, skeletons y estados vacío/error.
3. En "Componentes interactivos": abrir cada diálogo, disparar los toasts y el
   modal base (probar cierre con Escape / clic fuera / X).
4. `npm run test -- --run` → 17 verdes (incluye `dates` y `currency`).
