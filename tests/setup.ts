import "@testing-library/jest-dom/vitest";

/**
 * Variables de entorno DUMMY para los tests.
 * La capa `lib/services/*` importa `lib/supabase/config`, que exige estas vars
 * al cargar el módulo. En los tests unitarios no se hace ninguna llamada real a
 * Supabase (se prueba la lógica pura), así que basta con valores ficticios para
 * que los módulos se puedan importar. NUNCA poner aquí claves reales.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
