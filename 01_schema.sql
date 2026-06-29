-- =====================================================================
-- Renata Belmonte · Makeup Artist — Esquema de base de datos
-- Postgres / Supabase
-- Orden de ejecución: este archivo primero, luego 02_seed.sql
-- =====================================================================

-- Extensión necesaria para el exclusion constraint que combina igualdad
-- (=) con solapamiento de rangos (&&). Hoy es de una sola maquillista, pero
-- al dejarla activa el día que agreguemos `staff_id` el constraint escala
-- sin cambios de infraestructura.
create extension if not exists btree_gist;


-- =====================================================================
-- 1. SERVICES — catálogo de servicios
-- =====================================================================
create table services (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,          -- para URLs y SEO (/servicios/novia)
  name            text not null,
  description     text,
  duration_minutes int  not null check (duration_minutes > 0),
  price_mxn       int  not null check (price_mxn >= 0),  -- pesos enteros
  category        text,                          -- social | novia | add-on | curso
  image_path      text,                          -- ruta en Supabase Storage
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create index services_active_idx on services (is_active);
create index services_slug_idx   on services (slug);


-- =====================================================================
-- 2. AVAILABILITY — horario semanal fijo
-- weekday: 0=domingo, 1=lunes, ... 6=sábado  (igual que JS Date.getDay())
-- Solo se insertan los días que abre. Un día sin fila = cerrado.
-- =====================================================================
create table availability (
  id         uuid primary key default gen_random_uuid(),
  weekday    int  not null check (weekday between 0 and 6),
  opens_at   time not null,
  closes_at  time not null,
  unique (weekday),
  check (closes_at > opens_at)
);


-- =====================================================================
-- 3. BLOCKED_DATES — vacaciones / días bloqueados manualmente
-- Bloqueo por rango de fechas completo (un solo día = start = end).
-- =====================================================================
create table blocked_dates (
  id          uuid primary key default gen_random_uuid(),
  start_date  date not null,
  end_date    date not null,
  reason      text,
  created_at  timestamptz not null default now(),
  check (end_date >= start_date)
);


-- =====================================================================
-- 4. BOOKINGS — reservas
-- =====================================================================
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  service_id      uuid not null references services(id),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','cancelled','completed')),
  event_type      text,        -- boda, graduación, sesión de foto, etc.
  allergies       text,        -- alergias / condiciones de piel
  reference_notes text,        -- referencias o notas de la clienta
  at_home         boolean not null default false,  -- servicio a domicilio
  created_at      timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index bookings_starts_at_idx on bookings (starts_at);
create index bookings_status_idx    on bookings (status);

-- --- Anti doble-booking a nivel de base de datos --------------------
-- Rechaza cualquier cita que se solape en el tiempo con otra que esté
-- pending o confirmed. Las canceladas/completadas no bloquean el espacio.
-- Usamos tstzrange (con zona horaria) porque starts_at/ends_at son timestamptz.
-- Futuro multi-staff: añadir  staff_id WITH =,  antes del rango.
alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending','confirmed'));


-- =====================================================================
-- 5. TRIGGER — calcular ends_at desde la duración del servicio
-- El cliente NUNCA define la hora de fin: se calcula con la duración real
-- del servicio. Esto evita que alguien manipule el formulario para "encajar"
-- en un hueco más corto del que el servicio necesita.
-- =====================================================================
create or replace function set_booking_end()
returns trigger
language plpgsql
as $$
declare
  dur int;
begin
  select duration_minutes into dur from services where id = new.service_id;
  if dur is null then
    raise exception 'Servicio % no existe', new.service_id;
  end if;
  new.ends_at := new.starts_at + make_interval(mins => dur);
  return new;
end;
$$;

create trigger trg_set_booking_end
  before insert or update of starts_at, service_id on bookings
  for each row execute function set_booking_end();


-- =====================================================================
-- 6. ROW LEVEL SECURITY
-- Modelo de roles:
--   anon          -> visitante público (clienta sin login)
--   authenticated -> Renata (única cuenta; deshabilitar registros públicos
--                    en Supabase Auth para que nadie más pueda autenticarse)
-- =====================================================================
alter table services      enable row level security;
alter table availability  enable row level security;
alter table blocked_dates enable row level security;
alter table bookings      enable row level security;

-- ---- SERVICES -------------------------------------------------------
-- Público: solo lee servicios activos.
create policy services_public_read on services
  for select to anon, authenticated
  using (is_active = true);

-- Admin: control total (incluye ver inactivos y editar catálogo).
create policy services_admin_all on services
  for all to authenticated
  using (true) with check (true);

-- ---- AVAILABILITY ---------------------------------------------------
-- Público lee el horario (necesario para calcular los slots libres).
create policy availability_public_read on availability
  for select to anon, authenticated using (true);

create policy availability_admin_all on availability
  for all to authenticated using (true) with check (true);

-- ---- BLOCKED_DATES --------------------------------------------------
-- Público lee los bloqueos (necesario para el cálculo de slots).
create policy blocked_public_read on blocked_dates
  for select to anon, authenticated using (true);

create policy blocked_admin_all on blocked_dates
  for all to authenticated using (true) with check (true);

-- ---- BOOKINGS -------------------------------------------------------
-- Público: SOLO puede crear (insertar) reservas, y SIEMPRE como 'pending'.
-- No puede confirmar, ni leer, ni modificar reservas de nadie.
create policy bookings_public_insert on bookings
  for insert to anon, authenticated
  with check (status = 'pending');

-- Admin: lee y gestiona todas las reservas.
create policy bookings_admin_read on bookings
  for select to authenticated using (true);

create policy bookings_admin_update on bookings
  for update to authenticated using (true) with check (true);

create policy bookings_admin_delete on bookings
  for delete to authenticated using (true);

-- NOTA: como las clientas no tienen login, NO pueden consultar su reserva
-- vía RLS. La página de "tu cita" se sirve del lado servidor buscando por un
-- token único (o el id) usando la service_role key, nunca exponiendo la tabla.
-- La validación de que el horario cae dentro del horario laboral y no choca
-- con blocked_dates se hace en la lógica del servidor (Server Action / RPC);
-- el constraint y el trigger son la última línea de defensa en la BD.
