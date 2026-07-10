# Modelo de Amenazas — BiblioTEC

> Modelo ligero (1-2 páginas) para una web app mediana con PII de estudiantes (Ley 29733) en internet público. Se revisa al cerrar cada fase que toque auth, datos personales o admin.

## Activos a proteger

| Activo | Tipo | Sensibilidad |
|--------|------|--------------|
| Datos de estudiantes (código, nombre, correo, teléfono, carrera) | PII | Alta |
| Historial de préstamos por usuario | PII / comportamiento | Media |
| Sesiones y tokens de autenticación | Credencial | Alta |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto (bypassa RLS) | Crítica |
| Integridad del catálogo y disponibilidad | Datos de negocio | Media |
| Configuración (multa_diaria, dias_prestamo) | Datos de negocio | Media |

## Actores

- **Estudiantes:** usuarios legítimos; podrían intentar ver datos de otros o manipular préstamos/multas.
- **Bibliotecarios (admin):** acceso ampliado; riesgo de abuso o cuenta comprometida.
- **Atacantes externos anónimos:** buscan vulnerabilidades comunes (inyección, acceso roto, credenciales débiles).
- **Bots/scrapers:** automatizados contra login y endpoints públicos.

## Top 5 amenazas

### A1: Acceso a datos de otro usuario (Broken Access Control)
- **Vector:** manipular IDs o llamar a endpoints sin la autorización correcta.
- **Impacto:** fuga de PII e historial de otros estudiantes.
- **Mitigación:** RLS en todas las tablas (el estudiante solo accede a sus filas); revalidación de rol en cada Server Action; IDs con UUID; tests de políticas RLS.
- **Prioridad:** Alta.

### A2: Exposición de la Service Role Key
- **Vector:** importar `SUPABASE_SERVICE_ROLE_KEY` en un archivo `"use client"` o comitearla.
- **Impacto:** bypass total de RLS → acceso a toda la base de datos.
- **Mitigación:** la key solo se usa en servidor; `.env*` en `.gitignore`; gitleaks en pre-commit; revisión en PR; CLAUDE.md lo marca como regla inviolable.
- **Prioridad:** Crítica.

### A3: Robo de credenciales / fuerza bruta en login
- **Vector:** phishing o intentos automatizados de login.
- **Impacto:** toma de cuenta (peor si es admin).
- **Mitigación:** rate limiting y bloqueo tras 5 intentos; contraseñas ≥8 con complejidad (Supabase Auth); sesión invalidada al cerrar; 2FA para admin anotado como mejora futura.
- **Prioridad:** Alta.

### A4: Inyección / entrada maliciosa
- **Vector:** input en búsqueda de catálogo o formularios.
- **Impacto:** lectura/alteración de datos; XSS.
- **Mitigación:** consultas parametrizadas vía cliente Supabase (nunca concatenar SQL); validación Zod cliente+servidor; escape automático de React; sin `eval`.
- **Prioridad:** Alta.

### A5: Manipulación de la lógica de negocio (préstamos/multas)
- **Vector:** condiciones de carrera al prestar (doble préstamo del último ejemplar), o alterar montos de multa desde el cliente.
- **Impacto:** inconsistencia de inventario; multas incorrectas.
- **Mitigación:** decremento atómico de `cantidad_disponible` (transacción/RPC); toda la lógica (cálculo de multa, reglas de renovación) en la capa de servicios en servidor, no en la UI; tests unitarios de las reglas.
- **Prioridad:** Media-Alta.

## Mitigaciones generales aplicadas

- ✅ HTTPS forzado (HSTS) en producción
- ✅ Headers de seguridad (CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy)
- ✅ CORS restringido al dominio de Vercel
- ✅ Rate limiting en login y recuperación
- ✅ RLS en todas las tablas + revalidación de rol en servidor
- ✅ Validación de input con Zod en todos los formularios/Server Actions
- ✅ Secrets fuera del repo (gitleaks en pre-commit) y `npm audit` en CI
- ✅ Logging sin PII ni tokens (enmascarado)

## Mitigaciones pendientes (riesgo aceptado de momento)

- ⏸️ 2FA para el rol bibliotecario (mejora post-MVP)
- ⏸️ WAF/monitoreo avanzado de anomalías (se evaluará en producción)
- ⏸️ Alertas automáticas por patrones de login sospechosos (post-MVP)
