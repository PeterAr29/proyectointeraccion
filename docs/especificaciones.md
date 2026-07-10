# Especificaciones Técnicas — BiblioTEC

> Contrato técnico del proyecto. Define QUÉ se construye y bajo qué reglas. La guía de desarrollo (`guia_desarrollo.md`) define CÓMO y en qué orden.

## 1. INTRODUCCIÓN Y PROPÓSITO

Este documento es el contrato técnico de **BiblioTEC**, un sistema web de gestión de biblioteca universitaria desarrollado como proyecto del curso de Interacción Humano–Computador (IHC). Especifica roles, requisitos funcionales y no funcionales, seguridad, arquitectura, modelo de datos y criterios de validación. Cualquier ambigüedad se resuelve consultando este documento; si un dato del dominio no está aquí, se pregunta antes de asumir.

La **calidad de la experiencia de usuario** (heurísticas de Nielsen, metáforas de interfaz, evaluación SUS) forma parte del entregable evaluable y por tanto es un requisito, no un extra.

## 2. ROLES Y USUARIOS DEL SISTEMA

### 2.1 Definición de Roles

| Rol | Puede | NO puede |
|-----|-------|----------|
| **estudiante** | Buscar catálogo, ver detalle, reservar, pedir préstamo, renovar, devolver, marcar favoritos, ver su historial, notificaciones y perfil | Leer o escribir datos de otro usuario; acceder al panel admin; modificar el catálogo |
| **bibliotecario** (admin) | Todo lo anterior + dashboard con KPIs, CRUD de libros y usuarios, gestión de préstamos/devoluciones con cálculo de multa, reportes y configuración | — |

La separación de permisos se garantiza con **Row Level Security en Postgres**, no con condicionales en la UI. Ocultar un botón es UX, no autorización.

### 2.2 Gestión de Usuarios

- El registro crea un `profiles` ligado a `auth.users` de Supabase con `codigo_universitario` único.
- El rol por defecto es `estudiante`. La promoción a `bibliotecario` es una operación administrativa (no autoservicio).
- Un usuario puede desactivarse (`activo = false`) sin borrarse, para preservar el historial de préstamos.

### 2.3 Concurrencia

Contexto académico/piloto: decenas de usuarios concurrentes, no miles. No se requieren estrategias de escalado horizontal complejas, pero sí correcta gestión transaccional en préstamos (evitar prestar el mismo ejemplar dos veces).

## 3. REQUISITOS FUNCIONALES

### 3.1 Módulo A — Plataforma & Acceso
- **RF-A01.** El usuario inicia sesión con código universitario y contraseña.
- **RF-A02.** El usuario se registra proporcionando código, nombre, carrera, correo y teléfono.
- **RF-A03.** El usuario recupera su contraseña mediante enlace enviado a su correo.
- **RF-A04.** La sesión se mantiene entre navegaciones; las rutas de app y admin están protegidas por middleware.
- **RF-A05.** El estudiante ve y edita su perfil (datos de contacto).

### 3.2 Módulo B — Catálogo
- **RF-B01.** El usuario lista los libros del catálogo con paginación.
- **RF-B02.** El usuario busca por título, autor o ISBN.
- **RF-B03.** El usuario filtra por categoría, disponibilidad y ubicación.
- **RF-B04.** El usuario ve el detalle de un libro (portada, metadatos, disponibilidad, ubicación).
- **RF-B05.** El usuario marca/desmarca libros como favoritos.

### 3.3 Módulo C — Circulación
- **RF-C01.** El usuario solicita un préstamo si `cantidad_disponible > 0`; si no, se le ofrece reservar.
- **RF-C02.** El sistema calcula la fecha de devolución estimada (`dias_prestamo`, por defecto 14).
- **RF-C03.** El usuario reserva un libro no disponible y queda en cola.
- **RF-C04.** El usuario renueva un préstamo hasta `max_renovaciones` veces, nunca si está vencido con multa pendiente.
- **RF-C05.** El usuario devuelve un libro; el sistema actualiza disponibilidad y estado.
- **RF-C06.** El usuario ve sus préstamos activos y su historial completo.

### 3.4 Módulo D — Multas & Notificaciones
- **RF-D01.** El sistema marca un préstamo como `vencido` cuando `fecha_devolucion_estimada < hoy` y no hay devolución real.
- **RF-D02.** El sistema calcula la multa como `dias_retraso × multa_diaria` (soles, `S/`).
- **RF-D03.** El sistema notifica al usuario cuando un libro reservado pasa a disponible.
- **RF-D04.** El sistema notifica vencimientos próximos y multas generadas.
- **RF-D05.** El usuario ve y marca como leídas sus notificaciones.

### 3.5 Módulo E — Administración
- **RF-E01.** El bibliotecario ve un dashboard con KPIs (total de libros, usuarios, préstamos activos, multas pendientes) y préstamos recientes.
- **RF-E02.** El bibliotecario realiza CRUD de libros (incluye portada).
- **RF-E03.** El bibliotecario realiza CRUD de usuarios y gestiona roles/activación.
- **RF-E04.** El bibliotecario registra devoluciones y el sistema calcula la multa correspondiente.
- **RF-E05.** El bibliotecario consulta reportes (préstamos por periodo, libros más prestados, multas).
- **RF-E06.** El bibliotecario ajusta la configuración (`dias_prestamo`, `multa_diaria`, `max_renovaciones`).

## 4. REQUISITOS NO FUNCIONALES

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Usabilidad | Cumple las heurísticas de Nielsen; SUS objetivo ≥ 75; curva de aprendizaje mínima |
| RNF-02 | Usabilidad | Toda pantalla que carga datos tiene 4 estados: cargando, vacío, error, con datos |
| RNF-03 | Accesibilidad | Contraste AA, foco visible, navegación por teclado, `<label>` por input |
| RNF-04 | Rendimiento | Listados con paginación; skeletons durante la carga; transiciones ~150ms |
| RNF-05 | Responsive | Bajo 768px la sidebar colapsa a menú hamburguesa; tablas con scroll horizontal |
| RNF-06 | Mantenibilidad | Archivos de código < 300 líneas; naming consistente; capa de servicios obligatoria |
| RNF-07 | Disponibilidad | Deploy en Vercel; datos en Supabase con backups automáticos |
| RNF-08 | Internacionalización | UI en español; moneda soles (`S/`); fechas mostradas DD/MM/AAAA, almacenadas ISO 8601 |
| RNF-09 | Testabilidad | Cobertura ≥60% en lógica de negocio; e2e de los flujos críticos |

## 5. SEGURIDAD

Nivel aplicado: **OWASP Top 10 (2025) completo**, alineado a **ASVS L1**. Justificación: web app mediana, con PII de estudiantes (sensibilidad media), expuesta en internet público.

### 5.1 OWASP Top 10 — Reglas aplicadas

- **RNF-SEC-A01-1.** Deny-by-default: cada endpoint/Server Action valida el rol antes de ejecutarse.
- **RNF-SEC-A01-2.** Cada tabla tiene políticas RLS; el estudiante nunca accede a datos de otro usuario (garantizado en Postgres).
- **RNF-SEC-A01-3.** IDs de recursos con UUID (no secuenciales predecibles).
- **RNF-SEC-A02-1.** Contraseñas gestionadas por Supabase Auth (bcrypt/argon2); nunca hashing propio débil.
- **RNF-SEC-A02-2.** HTTPS obligatorio (TLS 1.2+) con HSTS en producción.
- **RNF-SEC-A02-3.** `SUPABASE_SERVICE_ROLE_KEY` solo en servidor; nunca en cliente ni en el repo.
- **RNF-SEC-A03-1.** Todas las consultas vía cliente de Supabase o parametrizadas; nunca concatenar input en SQL.
- **RNF-SEC-A03-2.** Validación estricta de entrada con Zod en cliente y servidor.
- **RNF-SEC-A03-4.** Prohibido `eval` y deserialización insegura.
- **RNF-SEC-A04-3.** Rate limiting en login y recuperación de contraseña.
- **RNF-SEC-A04-4.** Confirmación obligatoria para acciones destructivas (eliminar libro/usuario, devolver).
- **RNF-SEC-A05-1.** Headers de seguridad en producción: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy.
- **RNF-SEC-A05-2.** Stack traces nunca expuestos al cliente; errores en lenguaje humano.
- **RNF-SEC-A05-4.** CORS restringido al dominio de Vercel (no `*`).
- **RNF-SEC-A07-1.** Contraseñas ≥8 caracteres con complejidad.
- **RNF-SEC-A07-2.** Bloqueo temporal tras 5 intentos fallidos.
- **RNF-SEC-A07-5.** La sesión se invalida al cerrar sesión.
- **RNF-SEC-A09-1.** Logs de acciones críticas: login, alta/baja de usuarios, cambios de rol, accesos denegados.
- **RNF-SEC-A10-1.** Si se cargan URLs externas (portadas), validar dominio; timeouts en requests externos.

### 5.2 Secrets Management

- **RNF-SEC-SEC-1.** `.env*` siempre en `.gitignore` desde el primer commit.
- **RNF-SEC-SEC-2.** `.env.example` con todas las variables y valores dummy (obligatorio).
- **RNF-SEC-SEC-3.** Pre-commit hook con **gitleaks** (secrets scanner).
- **RNF-SEC-SEC-4.** Política: ninguna credencial, token o key va comiteada. En runtime, variables de entorno de Vercel/Supabase.

### 5.3 Dependency Security

- **RNF-SEC-DEP-1.** Versiones pinneadas en `package.json` (sin `^`/`~` para deps críticas de seguridad).
- **RNF-SEC-DEP-2.** `package-lock.json` comiteado.
- **RNF-SEC-DEP-3.** `npm audit --audit-level=high` en el checklist de cada fase y en CI.
- **RNF-SEC-DEP-4.** Revisión antes de añadir librería nueva (mantenimiento <12 meses, vulnerabilidades, peso). Dependabot habilitado en F1.

### 5.4 Logging Seguro

- **RNF-SEC-LOG-1.** NO loggear: contraseñas, tokens, correos completos, teléfonos, código universitario completo.
- **RNF-SEC-LOG-2.** Enmascarar: correo `m***@univ.edu.pe`, código `2021***23`.
- **RNF-SEC-LOG-3.** Niveles ERROR/WARN/INFO/DEBUG correctamente usados; DEBUG desactivado en prod.
- **RNF-SEC-LOG-4.** Logging estructurado (JSON) para eventos de negocio (login, préstamo, devolución).

### 5.5 Hardening específico (web app expuesta a internet)

- HTTPS forzado (HSTS). Headers de seguridad listados en §5.1.
- Cookies de sesión con flags `HttpOnly`, `Secure`, `SameSite=Lax` (gestionadas por Supabase Auth helpers).
- Rate limiting por IP y por usuario en endpoints sensibles.
- Validación de input con Zod en todos los formularios y Server Actions.

### 5.6 Threat Modeling

Ver `docs/threat-model.md` (activos, actores, top 5 amenazas y mitigaciones).

### 5.7 Backup y Recovery

- **Qué se respalda:** base de datos Postgres (Supabase) y Storage de portadas.
- **Frecuencia:** backups automáticos diarios gestionados por Supabase (Point-in-Time Recovery según plan).
- **Retención:** según plan de Supabase (mínimo 7 días recomendado).
- **Dónde se guarda:** infraestructura de Supabase, cifrado en reposo.
- **Cómo se restaura:** desde el dashboard de Supabase (PITR) o `supabase db dump`/restore documentado.
- **Test de restore:** obligatorio al menos una vez en la fase de despliegue (F6.2): restaurar a un proyecto de staging y verificar integridad del seed.

### 5.8 Reglas NO aplicadas y justificación

- **A06 (firma de instaladores) / A08 (integridad de updates de escritorio):** no aplican; no hay binarios distribuibles.
- **2FA (A07-6):** recomendado para admin pero fuera del MVP; se anota como deuda técnica en `progreso/estado-actual.md`.

## 6. RESTRICCIONES Y EXCLUSIONES

### 6.1 Restricciones del proyecto
- Proyecto académico con plazo de curso; equipo de 2-3 devs full-time.
- Stack cerrado (§8.1): no se introducen librerías fuera de él sin acordarlo y registrar ADR.
- Presupuesto de infraestructura: planes gratuitos/educativos de Vercel y Supabase.

### 6.2 Exclusiones (fuera del alcance del MVP)
- Pagos en línea de multas (se registran; el pago es presencial).
- Integración con sistemas académicos externos (SIS/ERP).
- App móvil nativa (la web es responsive).
- 2FA (anotado como deuda técnica).

## 7. ARQUITECTURA Y MODELO DE DATOS

### 7.1 Visión General

Next.js 15 App Router con Server Components por defecto. Backend Supabase (Auth + Postgres + Storage + Realtime). La capa `lib/services/*.ts` es la única puerta a los datos y la frontera entre módulos. La autorización real vive en las políticas RLS de Postgres. Ver diagrama en `CLAUDE.md`.

Mapa de rutas previsto (se crea por fases, no de golpe):
```
app/(auth)/login · registro · recuperar
app/(app)/inicio · catalogo · catalogo/[id] · mis-prestamos · historial · favoritos · notificaciones · perfil
app/(admin)/dashboard · libros · usuarios · prestamos · devoluciones · multas · reportes · configuracion
```

### 7.2 Modelo de Datos

Tablas principales (todas con RLS activo):

- **profiles** — id (FK auth.users), codigo_universitario (único), nombre, carrera, correo, telefono, rol (`estudiante`|`bibliotecario`), activo
- **books** — id, titulo, autor, editorial, anio, isbn (único), categoria, ubicacion, descripcion, portada_url, cantidad_total, cantidad_disponible
- **loans** — id, book_id, user_id, fecha_prestamo, fecha_devolucion_estimada, fecha_devolucion_real, estado (`activo`|`vencido`|`devuelto`), renovaciones
- **reservations** — id, book_id, user_id, fecha_reserva, fecha_estimada_disponibilidad, estado (`activa`|`cumplida`|`cancelada`)
- **fines** — id, loan_id, user_id, dias_retraso, monto, estado (`pendiente`|`pagada`)
- **notifications** — id, user_id, tipo, mensaje, leida, created_at
- **favorites** — user_id, book_id (PK compuesta)
- **settings** — dias_prestamo (14), multa_diaria (1.00), max_renovaciones (2)

**Reglas de negocio (en la capa de servicios, no en la UI):**
1. Un libro solo se presta si `cantidad_disponible > 0`; si no, se ofrece reservar.
2. La fecha de devolución no puede ser anterior a hoy.
3. Un préstamo pasa a `vencido` cuando `fecha_devolucion_estimada < hoy` y no hay devolución real.
4. Multa = `dias_retraso × multa_diaria` (soles).
5. Renovación máxima `max_renovaciones` veces; nunca si está vencido con multa pendiente.
6. Reservar genera notificación cuando el libro pasa a disponible.
7. El estudiante nunca lee/escribe datos de otro usuario (RLS).

Moneda: soles (`S/`). Fechas UI: DD/MM/AAAA. BD: `timestamptz` ISO 8601.

### 7.3 Esquema de integración (frontera entre módulos)

Cada módulo expone su lógica mediante funciones tipadas en `lib/services/`:
- `users.ts` (Módulo A) · `books.ts`, favoritos (B) · `loans.ts`, `reservations.ts` (C) · `fines.ts`, `notifications.ts` (D).
- El Módulo E (admin) **consume** estos services; no accede a tablas de otros módulos directamente.
- Un cambio a la firma de un service es un cambio de frontera: avisar al equipo antes y registrar ADR si es de largo plazo.

## 8. ESPECIFICACIONES TÉCNICAS DETALLADAS

### 8.1 Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript strict |
| BD / Backend | Supabase (Postgres, Auth, Storage, Realtime), RLS activo |
| Estilos | Tailwind CSS + shadcn/ui |
| Formularios/validación | react-hook-form + Zod (reusado en servidor) |
| Iconos | lucide-react |
| Deploy | Vercel |
| Testing | Vitest (unit/integration) + Playwright (e2e) |

### 8.2 Testing Strategy

- **Unit:** Vitest para lógica de negocio de los services (cálculo de multa, reglas de préstamo/renovación, validaciones Zod). Cobertura objetivo ≥60% en `lib/services` y `lib/validations`.
- **Integration:** services contra una BD de test de Supabase (o esquema local con `supabase db reset`), verificando RLS.
- **E2E:** Playwright para los 3-5 flujos críticos: login, buscar+prestar, renovar/devolver, reservar, gestión admin de devolución con multa.
- **CI/CD:** GitHub Actions desde F1 (`.github/workflows/ci.yml`): lint + typecheck + tests + `npm audit`. Cada fase introduce sus propios tests; no se acumulan para el final.

### 8.3 Convenciones de desarrollo

- Conventional Commits obligatorio (scope = módulo, ej. `feat(C): renovación de préstamo`).
- Pre-commit hooks: eslint, prettier, gitleaks (secrets), fin de archivo, tamaño de archivos.
- Archivos < 300 líneas; naming consistente (ver CLAUDE.md).
- Branching: `main` protegida; ramas `modulo/tarea-corta`; PR con ≥1 review y CI verde.
- Tags semánticos al cerrar fases (`v0.1.0` tras F1).

## 9. INFRAESTRUCTURA Y DESPLIEGUE

### 9.1 Hardware / Hosting
- App: Vercel (serverless). BD/Auth/Storage: Supabase. Sin servidores propios que mantener.

### 9.2 Variables de entorno
Ver `.env.example`. Claves: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas, cliente), `SUPABASE_SERVICE_ROLE_KEY` (solo servidor).

### 9.3 Comandos de despliegue
- Deploy automático a Vercel al mergear a `main` (preview deploys por PR).
- Migraciones aplicadas con Supabase CLI (`supabase db push`) o desde el dashboard; nunca editar migraciones ya aplicadas.

## 10. EVALUACIÓN Y VALIDACIÓN

### 10.1 Métricas de éxito
| Métrica | Meta | Método de medición |
|---------|------|---------------------|
| SUS | ≥ 75 | Cuestionario SUS a usuarios de prueba (F6.1) |
| Tareas críticas sin ayuda | ≥ 90% | Recorrido cognitivo / test de usuario |
| Heurísticas Nielsen en PRs de UI | 100% | Checklist en cada PR de UI |
| Cobertura lógica de negocio | ≥ 60% | Reporte de Vitest en CI |

### 10.2 Casos de prueba (flujos críticos)
- Estudiante busca un libro disponible, lo presta y ve la fecha de devolución.
- Estudiante intenta prestar un libro sin stock y el sistema le ofrece reservar.
- Estudiante renueva un préstamo; falla al renovar con multa pendiente.
- Devolución con retraso genera la multa correcta (`dias_retraso × multa_diaria`).
- Estudiante no puede acceder a datos de otro usuario (RLS) ni al panel admin.

### 10.3 Criterios mínimos de aprobación
Todas las fases completas con su Definition of Done, flujos críticos e2e en verde, evaluación IHC documentada (`docs/evaluacion-usabilidad.md`, creado en F6.1) con SUS ≥ 75, y `npm audit` sin vulnerabilidades altas.

## 11. CUMPLIMIENTO REGULATORIO

### 11.1 Jurisdicción aplicable
**Perú — Ley N.º 29733 (Ley de Protección de Datos Personales)** y su reglamento. Usuarios son estudiantes de una universidad peruana.

### 11.2 Datos personales que maneja el sistema
Nombre, código universitario, correo institucional, teléfono, carrera, e historial de préstamos (comportamiento).

### 11.3 Bases legales de tratamiento
Ejecución del servicio bibliotecario solicitado por el titular (relación estudiante–biblioteca) y, donde aplique, consentimiento informado en el registro.

### 11.4 Derechos del titular implementados
- [ ] Acceso (ver mis datos en el perfil)
- [ ] Rectificación (editar datos de contacto)
- [ ] Supresión / cancelación (baja de cuenta, preservando obligaciones de préstamo)
- [ ] Portabilidad (exportar mis datos)
- [ ] Oposición al tratamiento

Estos derechos se implementan progresivamente; el mínimo (acceso y rectificación) entra con el perfil en F1.4.

### 11.5 Plazos
- Respuesta a solicitud de derechos: según Ley 29733 (referencia: hasta ~20 días hábiles).
- Notificación de brecha: a la autoridad y titulares sin dilación indebida.
- Retención de datos: mientras exista la relación con la biblioteca; luego anonimización del historial.

### 11.6 Cookies y política de privacidad
Solo cookies estrictamente necesarias (sesión de Supabase Auth); no hay tracking de terceros. Publicar una política de privacidad accesible desde el pie de página antes del despliegue (F6.2).
