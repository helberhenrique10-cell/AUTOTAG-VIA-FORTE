create or replace function public.apply_rfid_read_to_fleet()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_component_id text;
  v_locomotive_id text;
  v_km_per_read constant numeric := 300;
begin
  select c.id, c.locomotive_id
    into v_component_id, v_locomotive_id
    from public.components as c
   where upper(btrim(c.rfid)) = upper(btrim(new.rfid_tag))
   limit 1;

  if not found then
    return new;
  end if;

  perform 1
    from public.locomotives as l
   where l.id = v_locomotive_id
   for update;

  if not found then
    raise exception 'Locomotiva da TAG % não encontrada', new.rfid_tag using errcode = 'P0002';
  end if;

  new.component_id := v_component_id;

  update public.locomotives
     set odometer_km = coalesce(odometer_km, 0) + v_km_per_read
   where id = v_locomotive_id;

  update public.components as c
     set km_since_install = coalesce(c.km_since_install, 0) + v_km_per_read,
         status = case
           when (coalesce(c.km_since_install, 0) + v_km_per_read) / coalesce(nullif(c.life_km, 0), 100000) >= 0.90 then 'Intervenção crítica'
           when (coalesce(c.km_since_install, 0) + v_km_per_read) / coalesce(nullif(c.life_km, 0), 100000) > 0.70 then 'Atenção programada'
           else 'Normal'
         end
   where c.locomotive_id = v_locomotive_id;

  return new;
end;
$$;

revoke all on function public.apply_rfid_read_to_fleet() from public, anon, authenticated;

drop trigger if exists apply_rfid_read_to_fleet on public.rfid_reads;
create trigger apply_rfid_read_to_fleet
before insert on public.rfid_reads
for each row
execute function public.apply_rfid_read_to_fleet();
