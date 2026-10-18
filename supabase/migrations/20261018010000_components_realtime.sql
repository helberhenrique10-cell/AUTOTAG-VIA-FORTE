do $$
begin
  alter publication supabase_realtime add table public.components;
exception when duplicate_object then
  null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.locomotives;
exception when duplicate_object then
  null;
end;
$$;
