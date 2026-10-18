create table if not exists public.rfid_locomotives (
  id text primary key,
  name text not null,
  model text not null,
  yard text not null,
  odometer_km numeric not null default 0 check (odometer_km >= 0),
  avg_daily_km numeric not null default 820 check (avg_daily_km >= 0),
  status text not null default 'Ativa',
  last_reading_at timestamptz
);

create table if not exists public.rfid_components (
  id text primary key,
  locomotive_id text not null references public.rfid_locomotives(id) on delete cascade,
  name text not null,
  component_type text not null,
  rfid_tag text not null,
  protheus_code text not null default '',
  installed_at_km numeric not null default 0,
  wear_km numeric not null default 0 check (wear_km >= 0),
  life_km numeric not null check (life_km > 0),
  remaining_life_pct numeric not null default 100 check (remaining_life_pct >= 0 and remaining_life_pct <= 100),
  status text not null default 'Normal',
  active boolean not null default true,
  last_read_at timestamptz
);

create unique index if not exists rfid_components_active_tag_uidx
  on public.rfid_components (upper(rfid_tag)) where active;

create table if not exists public.rfid_readings (
  id uuid primary key default gen_random_uuid(),
  tag_id text not null,
  locomotive_id text not null references public.rfid_locomotives(id),
  component_id text not null references public.rfid_components(id),
  km_acrescentar numeric not null check (km_acrescentar > 0),
  odometer_after numeric not null,
  read_at timestamptz not null default clock_timestamp()
);

create table if not exists public.rfid_maintenance_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text not null default '',
  locomotive_id text not null references public.rfid_locomotives(id),
  component_id text references public.rfid_components(id),
  km numeric not null,
  created_at timestamptz not null default clock_timestamp()
);

insert into public.rfid_locomotives (id, name, model, yard, odometer_km, avg_daily_km, status)
values
  ('L-4027', 'Locomotiva L-4027 - AC4', 'AC44', 'Pátio de Araraquara / Linha 04', 842615, 820, 'Ativa'),
  ('L-4028', 'Locomotiva L-4028 - AC44', 'AC44', 'Pátio de Araraquara / Linha 02', 612400, 820, 'Ativa'),
  ('L-2015', 'Locomotiva L-2015 - C44', 'C44-EMi', 'Pátio de Tubarão / Linha 01', 520100, 820, 'Em Manutenção')
on conflict (id) do nothing;

insert into public.rfid_components
  (id, locomotive_id, name, component_type, rfid_tag, protheus_code, installed_at_km, wear_km, life_km, remaining_life_pct, status)
values
  ('comp-1', 'L-4027', 'Injetor de combustível', 'Injetor de Combustível', 'JFJFJFJ', 'MD2100904', 842615, 0, 180000, 100, 'Normal'),
  ('comp-2', 'L-4027', 'Turbo alimentador', 'Turboalimentador', '9GHRHSUS', 'NE1800507', 842615, 0, 120000, 100, 'Normal'),
  ('comp-3', 'L-4027', 'Governador de potência', 'Governador de Potência', '4A8B9C10', 'NE1400447', 800000, 42615, 100000, 57.4, 'Normal'),
  ('comp-4', 'L-4027', 'Compressor de ar', 'Compressor de Ar', 'F5E607CB', 'ME1400772', 811135, 31480, 150000, 79, 'Normal')
on conflict (id) do nothing;

alter table public.rfid_locomotives enable row level security;
alter table public.rfid_components enable row level security;
alter table public.rfid_readings enable row level security;
alter table public.rfid_maintenance_events enable row level security;

grant select on public.rfid_locomotives, public.rfid_components, public.rfid_maintenance_events to anon, authenticated;
grant all on public.rfid_locomotives, public.rfid_components, public.rfid_readings, public.rfid_maintenance_events to service_role;

drop policy if exists "Public realtime locomotive reads" on public.rfid_locomotives;
create policy "Public realtime locomotive reads" on public.rfid_locomotives for select to anon, authenticated using (true);
drop policy if exists "Public realtime component reads" on public.rfid_components;
create policy "Public realtime component reads" on public.rfid_components for select to anon, authenticated using (true);
drop policy if exists "Public realtime event reads" on public.rfid_maintenance_events;
create policy "Public realtime event reads" on public.rfid_maintenance_events for select to anon, authenticated using (true);

create or replace function public.incrementar_km(tag_id text, km_acrescentar numeric default 300)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_component_id text;
  v_locomotive_id text;
  v_odometer numeric;
  v_average numeric;
  v_read_at timestamptz := clock_timestamp();
  v_old_statuses jsonb;
  v_event_id uuid;
  v_result jsonb;
begin
  if tag_id is null or btrim(tag_id) = '' then
    raise exception 'tag_id é obrigatório' using errcode = '22023';
  end if;
  if km_acrescentar is null or km_acrescentar <= 0 or km_acrescentar > 100000 then
    raise exception 'km_acrescentar deve estar entre 0 e 100000' using errcode = '22023';
  end if;

  select c.id, c.locomotive_id
    into v_component_id, v_locomotive_id
    from public.rfid_components as c
   where upper(c.rfid_tag) = upper(btrim(tag_id))
     and c.active;

  if not found then
    raise exception 'TAG RFID ativa não encontrada: %', tag_id using errcode = 'P0002';
  end if;

  perform 1 from public.rfid_locomotives as l where l.id = v_locomotive_id for update;
  if not found then
    raise exception 'Locomotiva associada à TAG não encontrada' using errcode = 'P0002';
  end if;

  perform 1 from public.rfid_components as c where c.id = v_component_id and c.active for update;
  if not found then
    raise exception 'TAG RFID foi desativada durante a leitura' using errcode = 'P0002';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object('id', c.id, 'status', c.status)),
    '[]'::jsonb
  )
    into v_old_statuses
    from public.rfid_components as c
   where c.locomotive_id = v_locomotive_id and c.active;

  update public.rfid_locomotives
     set odometer_km = odometer_km + km_acrescentar,
         last_reading_at = v_read_at
   where id = v_locomotive_id
   returning odometer_km into v_odometer;

  update public.rfid_components as c
     set wear_km = c.wear_km + km_acrescentar,
         remaining_life_pct = greatest(0, round((1 - (c.wear_km + km_acrescentar) / c.life_km) * 100, 1)),
         status = case
           when (c.wear_km + km_acrescentar) / c.life_km >= 0.90 then 'Intervenção crítica'
           when (c.wear_km + km_acrescentar) / c.life_km > 0.70 then 'Atenção programada'
           else 'Normal'
         end,
         last_read_at = v_read_at
   where c.locomotive_id = v_locomotive_id and c.active;

  insert into public.rfid_readings (tag_id, locomotive_id, component_id, km_acrescentar, odometer_after, read_at)
  values (upper(btrim(tag_id)), v_locomotive_id, v_component_id, km_acrescentar, v_odometer, v_read_at);

  insert into public.rfid_maintenance_events (type, title, description, locomotive_id, component_id, km, created_at)
  values (
    'leitura_rfid',
    'Leitura RFID recebida',
    format('TAG %s · +%s km · desgaste atualizado em todos os componentes instalados', upper(btrim(tag_id)), km_acrescentar),
    v_locomotive_id,
    v_component_id,
    v_odometer,
    v_read_at
  ) returning id into v_event_id;

  insert into public.rfid_maintenance_events (type, title, description, locomotive_id, component_id, km, created_at)
  select
    case when c.status = 'Intervenção crítica' then 'alerta_critico' else 'alerta_atencao' end,
    case when c.status = 'Intervenção crítica' then 'Intervenção crítica: ' || c.name else 'Atenção programada: ' || c.name end,
    format('Vida útil restante: %s%% · TAG %s', c.remaining_life_pct, c.rfid_tag),
    v_locomotive_id,
    c.id,
    v_odometer,
    v_read_at
  from public.rfid_components as c
  join jsonb_to_recordset(v_old_statuses) as old(id text, status text) on old.id = c.id
  where c.locomotive_id = v_locomotive_id
    and c.active
    and c.status is distinct from old.status
    and c.status <> 'Normal';

  select coalesce(
    round(
      (select sum(r.km_acrescentar) from public.rfid_readings as r
        where r.locomotive_id = v_locomotive_id and r.read_at >= v_read_at - interval '30 days')
      / nullif((select count(distinct r.read_at::date) from public.rfid_readings as r
        where r.locomotive_id = v_locomotive_id and r.read_at >= v_read_at - interval '30 days'), 0),
      1
    ),
    l.avg_daily_km
  )
    into v_average
    from public.rfid_locomotives as l
   where l.id = v_locomotive_id;

  update public.rfid_locomotives set avg_daily_km = v_average where id = v_locomotive_id;

  select jsonb_build_object(
    'locomotive', to_jsonb(l),
    'components', coalesce((select jsonb_agg(to_jsonb(c) order by c.name)
                              from public.rfid_components as c
                             where c.locomotive_id = v_locomotive_id and c.active), '[]'::jsonb),
    'event', to_jsonb(e),
    'km_added', km_acrescentar
  )
    into v_result
    from public.rfid_locomotives as l
    join public.rfid_maintenance_events as e on e.id = v_event_id
   where l.id = v_locomotive_id;

  return v_result;
end;
$$;

revoke all on function public.incrementar_km(text, numeric) from public, anon, authenticated;
grant execute on function public.incrementar_km(text, numeric) to service_role;

do $$
begin
  alter publication supabase_realtime add table public.rfid_locomotives;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.rfid_components;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.rfid_maintenance_events;
exception when duplicate_object then null;
end;
$$;
