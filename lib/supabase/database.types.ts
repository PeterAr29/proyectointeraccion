/**
 * Tipos de la base de datos BiblioTEC.
 *
 * Escrito a mano en F1.2 para reflejar EXACTAMENTE las migraciones de
 * `supabase/migrations/`. Es la fuente de tipos que consumen los helpers de
 * `lib/supabase/*` y, a través de ellos, la capa `lib/services/*`.
 *
 * ⚠️ Cuando exista una BD conectada, regenerar con:
 *   npx supabase gen types typescript --local > lib/supabase/database.types.ts
 * (o `--project-id <ref>` contra el proyecto remoto). Mantener sincronizado
 * con cualquier migración nueva.
 */

export type UserRole = "estudiante" | "bibliotecario";
export type LoanStatus = "activo" | "vencido" | "devuelto";
export type ReservationStatus = "activa" | "cumplida" | "cancelada";
export type FineStatus = "pendiente" | "pagada";
export type NotificationType =
  | "reserva_disponible"
  | "vencimiento_proximo"
  | "multa_generada";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          codigo_universitario: string;
          nombre: string;
          carrera: string | null;
          correo: string;
          telefono: string | null;
          rol: UserRole;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          codigo_universitario: string;
          nombre: string;
          carrera?: string | null;
          correo: string;
          telefono?: string | null;
          rol?: UserRole;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          codigo_universitario?: string;
          nombre?: string;
          carrera?: string | null;
          correo?: string;
          telefono?: string | null;
          rol?: UserRole;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          titulo: string;
          autor: string;
          editorial: string | null;
          anio: number | null;
          isbn: string | null;
          categoria: string | null;
          ubicacion: string | null;
          descripcion: string | null;
          portada_url: string | null;
          cantidad_total: number;
          cantidad_disponible: number;
          /** F5.2: baja lógica del catálogo (false = retirado, oculto al estudiante). */
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          autor: string;
          editorial?: string | null;
          anio?: number | null;
          isbn?: string | null;
          categoria?: string | null;
          ubicacion?: string | null;
          descripcion?: string | null;
          portada_url?: string | null;
          cantidad_total?: number;
          cantidad_disponible?: number;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
        Relationships: [];
      };
      loans: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          fecha_prestamo: string;
          fecha_devolucion_estimada: string;
          fecha_devolucion_real: string | null;
          estado: LoanStatus;
          renovaciones: number;
          /** F4.2: cuándo se avisó del vencimiento próximo (null = aún no). */
          vencimiento_notificado_en: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          fecha_prestamo?: string;
          fecha_devolucion_estimada: string;
          fecha_devolucion_real?: string | null;
          estado?: LoanStatus;
          renovaciones?: number;
          vencimiento_notificado_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["loans"]["Insert"]>;
        Relationships: [];
      };
      reservations: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          fecha_reserva: string;
          fecha_estimada_disponibilidad: string | null;
          estado: ReservationStatus;
          /** F4.2: cuándo se avisó que la reserva pasó a disponible (null = aún no). */
          notificada_disponible_en: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          fecha_reserva?: string;
          fecha_estimada_disponibilidad?: string | null;
          estado?: ReservationStatus;
          notificada_disponible_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservations"]["Insert"]>;
        Relationships: [];
      };
      fines: {
        Row: {
          id: string;
          loan_id: string;
          user_id: string;
          dias_retraso: number;
          monto: number;
          estado: FineStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          user_id: string;
          dias_retraso?: number;
          monto?: number;
          estado?: FineStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fines"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          tipo: NotificationType;
          mensaje: string;
          leida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo: NotificationType;
          mensaje: string;
          leida?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
        Relationships: [];
      };
      favorites: {
        Row: {
          user_id: string;
          book_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          book_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          dias_prestamo: number;
          multa_diaria: number;
          max_renovaciones: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          dias_prestamo?: number;
          multa_diaria?: number;
          max_renovaciones?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_librarian: {
        Args: Record<never, never>;
        Returns: boolean;
      };
      /** F3.1: presta un libro de forma atómica; devuelve la fila de `loans`. */
      create_loan: {
        Args: { p_book_id: string };
        Returns: Database["public"]["Tables"]["loans"]["Row"];
      };
      /** F3.1: reserva un libro sin stock; devuelve la fila de `reservations`. */
      create_reservation: {
        Args: { p_book_id: string };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      /** F3.2: registra la devolución y repone stock; devuelve la fila de `loans`. */
      return_loan: {
        Args: { p_loan_id: string };
        Returns: Database["public"]["Tables"]["loans"]["Row"];
      };
      /** F3.2: renueva el préstamo recalculando la fecha; devuelve la fila de `loans`. */
      renew_loan: {
        Args: { p_loan_id: string };
        Returns: Database["public"]["Tables"]["loans"]["Row"];
      };
    };
    Enums: {
      user_role: UserRole;
      loan_status: LoanStatus;
      reservation_status: ReservationStatus;
      fine_status: FineStatus;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<never, never>;
  };
};
