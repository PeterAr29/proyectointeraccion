import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo BiblioTEC trata los datos personales conforme a la Ley N.º 29733 del Perú.",
};

/**
 * Política de privacidad accesible sin sesión (Ley N.º 29733, especificaciones
 * §11). Ruta pública declarada en `middleware.ts`. Documento estático en español,
 * enlazado desde el pie de las pantallas de acceso y del perfil.
 */
export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Volver al inicio de sesión
      </Link>

      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-lg font-bold">BiblioTEC</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: 11 de julio de 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">
            1. Responsable del tratamiento
          </h2>
          <p className="mt-2 text-muted-foreground">
            La biblioteca universitaria es la responsable del tratamiento de los
            datos personales gestionados a través de BiblioTEC. El tratamiento
            se rige por la <strong>Ley N.º 29733</strong>, Ley de Protección de
            Datos Personales del Perú, y su reglamento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Datos que tratamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Nombre completo y código universitario.</li>
            <li>Correo institucional y teléfono de contacto.</li>
            <li>Carrera o programa académico.</li>
            <li>
              Historial de préstamos, reservas, devoluciones y multas (datos de
              comportamiento necesarios para el servicio bibliotecario).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Finalidad y base legal</h2>
          <p className="mt-2 text-muted-foreground">
            Tratamos tus datos para{" "}
            <strong>prestar el servicio bibliotecario</strong> que solicitas:
            gestionar tu cuenta, préstamos, reservas, devoluciones, multas y
            notificaciones. La base legal es la ejecución de la relación
            estudiante–biblioteca y, donde corresponde, el consentimiento
            informado que otorgas al registrarte. No usamos tus datos para
            publicidad ni los cedemos a terceros con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Tus derechos (ARCO+)</h2>
          <p className="mt-2 text-muted-foreground">
            Como titular de los datos puedes ejercer tus derechos de:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Acceso:</strong> consultar tus datos desde tu{" "}
              <Link href="/perfil" className="text-primary hover:underline">
                perfil
              </Link>
              .
            </li>
            <li>
              <strong>Rectificación:</strong> editar tus datos de contacto en el
              perfil.
            </li>
            <li>
              <strong>Supresión / cancelación:</strong> solicitar la baja de tu
              cuenta, preservando las obligaciones pendientes de préstamo.
            </li>
            <li>
              <strong>Oposición y portabilidad:</strong> oponerte a determinados
              tratamientos o solicitar una copia de tus datos.
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Para ejercerlos, contacta al personal de la biblioteca.
            Responderemos en los plazos que fija la Ley N.º 29733 (referencia:
            hasta ~20 días hábiles).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Conservación de datos</h2>
          <p className="mt-2 text-muted-foreground">
            Conservamos tus datos mientras exista tu relación con la biblioteca.
            Al finalizar, el historial se anonimiza para fines estadísticos,
            salvo obligaciones legales de conservación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Seguridad</h2>
          <p className="mt-2 text-muted-foreground">
            Ciframos el tráfico con HTTPS, gestionamos las contraseñas mediante
            algoritmos de hash seguros y restringimos el acceso a tus datos con
            controles a nivel de base de datos: ningún usuario puede leer la
            información de otro. Registramos accesos y eventos de seguridad sin
            almacenar contraseñas ni datos personales completos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            Usamos únicamente cookies <strong>estrictamente necesarias</strong>{" "}
            para mantener tu sesión iniciada. No empleamos cookies de rastreo ni
            de terceros con fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Cambios en esta política</h2>
          <p className="mt-2 text-muted-foreground">
            Podemos actualizar esta política para reflejar cambios legales o del
            servicio. Publicaremos la versión vigente en esta misma página con
            su fecha de actualización.
          </p>
        </section>
      </div>
    </main>
  );
}
