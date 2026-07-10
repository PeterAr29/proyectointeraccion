-- ==========================================================================
-- BiblioTEC · F1.2 · Esquema inicial
-- Fuente: docs/especificaciones.md §7.2 (modelo de datos y reglas de negocio)
-- Todas las tablas se crean con RLS HABILITADO. Las POLÍTICAS viven en la
-- migración siguiente (20260710120100_rls_policies.sql). Con RLS activo y sin
-- políticas, el acceso queda denegado por defecto (deny-by-default, A01).
-- IDs de recursos con UUID (no secuenciales). Fechas en timestamptz (ISO 8601).
-- ==========================================================================

-- gen_random_uuid() y crypt()/gen_salt() para el seed viven en pgcrypto.
create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Enums del dominio
-- --------------------------------------------------------------------------
create type public.user_role as enum ('estudiante', 'bibliotecario');
create type public.loan_status as enum ('activo', 'vencido', 'devuelto');
create type public.reservation_status as enum ('activa', 'cumplida', 'cancelada');
create type public.fine_status as enum ('pendiente', 'pagada');
create type public.notification_type as enum (
  'reserva_disponible',   -- un libro reservado pasa a disponible (RF-D03)
  'vencimiento_proximo',  -- un préstamo está por vencer (RF-D04)
  'multa_generada'        -- se generó una multa por retraso (RF-D04)
);

-- --------------------------------------------------------------------------
-- profiles — datos del usuario, ligados 1:1 a auth.users
-- --------------------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  codigo_universitario  text        not null unique,
  nombre                text        not null,
  carrera               text,
  correo                text        not null,
  telefono              text,
  rol                   public.user_role not null default 'estudiante',
  activo                boolean     not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.profiles is 'Perfil del usuario (Módulo A). El rol y la activación son operaciones administrativas.';

-- --------------------------------------------------------------------------
-- books — catálogo (Módulo B)
-- --------------------------------------------------------------------------
create table public.books (
  id                    uuid primary key default gen_random_uuid(),
  titulo                text        not null,
  autor                 text        not null,
  editorial             text,
  anio                  integer     check (anio is null or anio between 1450 and 2100),
  isbn                  text        unique,
  categoria             text,
  ubicacion             text,
  descripcion           text,
  portada_url           text,
  cantidad_total        integer     not null default 0 check (cantidad_total >= 0),
  cantidad_disponible   integer     not null default 0 check (cantidad_disponible >= 0),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- nunca puede haber más disponibles que ejemplares totales
  constraint books_disponible_lte_total check (cantidad_disponible <= cantidad_total)
);

comment on table public.books is 'Catálogo de libros (Módulo B). Lectura pública para autenticados; escritura solo bibliotecario.';

-- --------------------------------------------------------------------------
-- loans — préstamos (Módulo C)
-- --------------------------------------------------------------------------
create table public.loans (
  id                          uuid primary key default gen_random_uuid(),
  book_id                     uuid not null references public.books (id) on delete restrict,
  user_id                     uuid not null references public.profiles (id) on delete cascade,
  fecha_prestamo              timestamptz not null default now(),
  fecha_devolucion_estimada   timestamptz not null,
  fecha_devolucion_real       timestamptz,
  estado                      public.loan_status not null default 'activo',
  renovaciones                integer not null default 0 check (renovaciones >= 0),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table public.loans is 'Préstamos (Módulo C). El estudiante solo ve/gestiona los suyos (RLS).';

create index loans_user_id_idx on public.loans (user_id);
create index loans_book_id_idx on public.loans (book_id);
create index loans_estado_idx  on public.loans (estado);

-- --------------------------------------------------------------------------
-- reservations — reservas (Módulo C)
-- --------------------------------------------------------------------------
create table public.reservations (
  id                              uuid primary key default gen_random_uuid(),
  book_id                         uuid not null references public.books (id) on delete cascade,
  user_id                         uuid not null references public.profiles (id) on delete cascade,
  fecha_reserva                   timestamptz not null default now(),
  fecha_estimada_disponibilidad   timestamptz,
  estado                          public.reservation_status not null default 'activa',
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

comment on table public.reservations is 'Reservas de libros sin stock (Módulo C).';

create index reservations_user_id_idx on public.reservations (user_id);
create index reservations_book_id_idx on public.reservations (book_id);

-- --------------------------------------------------------------------------
-- fines — multas (Módulo D)
-- --------------------------------------------------------------------------
create table public.fines (
  id            uuid primary key default gen_random_uuid(),
  loan_id       uuid not null references public.loans (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  dias_retraso  integer not null default 0 check (dias_retraso >= 0),
  monto         numeric(10, 2) not null default 0 check (monto >= 0),
  estado        public.fine_status not null default 'pendiente',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.fines is 'Multas por retraso (Módulo D). monto = dias_retraso × multa_diaria (S/). El estudiante solo lee; el pago lo registra el bibliotecario.';

create index fines_user_id_idx on public.fines (user_id);
create index fines_loan_id_idx on public.fines (loan_id);

-- --------------------------------------------------------------------------
-- notifications — notificaciones in-app (Módulo D)
-- --------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  tipo        public.notification_type not null,
  mensaje     text not null,
  leida       boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.notifications is 'Notificaciones in-app del usuario (Módulo D).';

create index notifications_user_id_idx on public.notifications (user_id, leida);

-- --------------------------------------------------------------------------
-- favorites — favoritos (Módulo B), PK compuesta
-- --------------------------------------------------------------------------
create table public.favorites (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  book_id     uuid not null references public.books (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, book_id)
);

comment on table public.favorites is 'Favoritos del usuario (Módulo B).';

-- --------------------------------------------------------------------------
-- settings — configuración global (fila única, Módulo E)
-- --------------------------------------------------------------------------
create table public.settings (
  id                integer primary key default 1 check (id = 1), -- singleton
  dias_prestamo     integer not null default 14 check (dias_prestamo > 0),
  multa_diaria      numeric(10, 2) not null default 1.00 check (multa_diaria >= 0),
  max_renovaciones  integer not null default 2 check (max_renovaciones >= 0),
  updated_at        timestamptz not null default now()
);

comment on table public.settings is 'Configuración global de circulación (fila única). Solo el bibliotecario la edita.';

-- --------------------------------------------------------------------------
-- Trigger genérico: mantener updated_at al día
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at     before update on public.profiles     for each row execute function public.set_updated_at();
create trigger books_set_updated_at        before update on public.books        for each row execute function public.set_updated_at();
create trigger loans_set_updated_at        before update on public.loans        for each row execute function public.set_updated_at();
create trigger reservations_set_updated_at before update on public.reservations for each row execute function public.set_updated_at();
create trigger fines_set_updated_at        before update on public.fines        for each row execute function public.set_updated_at();
create trigger settings_set_updated_at     before update on public.settings     for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- RLS: habilitar en TODAS las tablas (deny-by-default hasta definir políticas)
-- --------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.books         enable row level security;
alter table public.loans         enable row level security;
alter table public.reservations  enable row level security;
alter table public.fines         enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites     enable row level security;
alter table public.settings      enable row level security;
