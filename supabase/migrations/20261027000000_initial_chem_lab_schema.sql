-- CHEM LAB initial Supabase schema
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create type public.material_state as enum ('solid', 'liquid', 'gas', 'aqueous');
create type public.reaction_type as enum ('neutralization', 'precipitation', 'dissolution', 'other');
create type public.reaction_effect as enum ('neutralization', 'precipitate', 'dissolution', 'none');
create type public.species_role as enum ('reactant', 'product', 'catalyst', 'solvent');
create type public.experiment_status as enum ('draft', 'completed', 'failed');
create type public.result_species_role as enum ('product', 'remaining_reactant');

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_ko text not null,
  name_en text,
  formula text not null,
  state public.material_state not null,
  molar_mass_g_mol numeric(12, 5) not null check (molar_mass_g_mol > 0),
  density_g_ml numeric(12, 6) check (density_g_ml is null or density_g_ml > 0),
  description text,
  accent_class text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_ko text not null,
  equation text not null,
  reaction_type public.reaction_type not null,
  effect public.reaction_effect not null default 'none',
  observation text not null,
  min_temperature_c numeric,
  max_temperature_c numeric,
  min_pressure_atm numeric check (min_pressure_atm is null or min_pressure_atm > 0),
  max_pressure_atm numeric check (max_pressure_atm is null or max_pressure_atm > 0),
  min_ph numeric check (min_ph is null or min_ph between 0 and 14),
  max_ph numeric check (max_ph is null or max_ph between 0 and 14),
  min_time_min numeric check (min_time_min is null or min_time_min >= 0),
  calculation_model jsonb not null default '{}'::jsonb,
  note text,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_temperature_c is null or max_temperature_c is null or min_temperature_c <= max_temperature_c),
  check (min_pressure_atm is null or max_pressure_atm is null or min_pressure_atm <= max_pressure_atm),
  check (min_ph is null or max_ph is null or min_ph <= max_ph)
);

create table public.reaction_species (
  id bigint generated always as identity primary key,
  reaction_id uuid not null references public.reactions(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  role public.species_role not null,
  stoichiometric_coefficient numeric(12, 6) not null default 1 check (stoichiometric_coefficient > 0),
  phase_label text,
  display_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (reaction_id, material_id, role)
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '새 실험' check (char_length(title) between 1 and 100),
  status public.experiment_status not null default 'draft',
  matched_reaction_id uuid references public.reactions(id) on delete set null,
  temperature_c numeric not null default 25 check (temperature_c >= -273.15),
  pressure_atm numeric not null default 1 check (pressure_atm > 0),
  ph numeric not null default 7 check (ph between 0 and 14),
  reaction_time_min numeric not null default 10 check (reaction_time_min >= 0),
  result_kind text check (result_kind is null or result_kind in ('reaction', 'none', 'warning')),
  result_title text,
  result_equation text,
  observation text,
  limiting_reactant text,
  calculation_summary text,
  result_snapshot jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiment_inputs (
  id bigint generated always as identity primary key,
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  amount numeric(18, 8) not null check (amount > 0),
  unit text not null check (unit in ('mg', 'g', 'mL', 'mol')),
  calculated_moles numeric(18, 10) check (calculated_moles is null or calculated_moles >= 0),
  display_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.experiment_outputs (
  id bigint generated always as identity primary key,
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  name text not null,
  formula text not null,
  role public.result_species_role not null,
  amount numeric(18, 8) check (amount is null or amount >= 0),
  unit text check (unit is null or unit in ('mg', 'g', 'mL', 'mol')),
  amount_label text,
  display_order smallint not null default 0,
  created_at timestamptz not null default now(),
  check (amount is not null or amount_label is not null)
);

create index reaction_species_reaction_idx on public.reaction_species (reaction_id, role, display_order);
create index reaction_species_material_idx on public.reaction_species (material_id);
create index experiments_user_created_idx on public.experiments (user_id, created_at desc);
create index experiments_reaction_idx on public.experiments (matched_reaction_id);
create index experiment_inputs_experiment_idx on public.experiment_inputs (experiment_id, display_order);
create index experiment_outputs_experiment_idx on public.experiment_outputs (experiment_id, role, display_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger materials_set_updated_at
before update on public.materials
for each row execute function public.set_updated_at();

create trigger reactions_set_updated_at
before update on public.reactions
for each row execute function public.set_updated_at();

create trigger experiments_set_updated_at
before update on public.experiments
for each row execute function public.set_updated_at();

alter table public.materials enable row level security;
alter table public.reactions enable row level security;
alter table public.reaction_species enable row level security;
alter table public.experiments enable row level security;
alter table public.experiment_inputs enable row level security;
alter table public.experiment_outputs enable row level security;

create policy "Anyone can read active materials"
on public.materials for select
using (is_active);

create policy "Anyone can read active reactions"
on public.reactions for select
using (is_active);

create policy "Anyone can read species of active reactions"
on public.reaction_species for select
using (
  exists (
    select 1 from public.reactions
    where reactions.id = reaction_species.reaction_id
      and reactions.is_active
  )
);

create policy "Users can read their experiments"
on public.experiments for select
using ((select auth.uid()) = user_id);

create policy "Users can create their experiments"
on public.experiments for insert
with check ((select auth.uid()) = user_id);

create policy "Users can update their experiments"
on public.experiments for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their experiments"
on public.experiments for delete
using ((select auth.uid()) = user_id);

create policy "Users can read their experiment inputs"
on public.experiment_inputs for select
using (exists (select 1 from public.experiments where experiments.id = experiment_inputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can create their experiment inputs"
on public.experiment_inputs for insert
with check (exists (select 1 from public.experiments where experiments.id = experiment_inputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can update their experiment inputs"
on public.experiment_inputs for update
using (exists (select 1 from public.experiments where experiments.id = experiment_inputs.experiment_id and experiments.user_id = (select auth.uid())))
with check (exists (select 1 from public.experiments where experiments.id = experiment_inputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can delete their experiment inputs"
on public.experiment_inputs for delete
using (exists (select 1 from public.experiments where experiments.id = experiment_inputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can read their experiment outputs"
on public.experiment_outputs for select
using (exists (select 1 from public.experiments where experiments.id = experiment_outputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can create their experiment outputs"
on public.experiment_outputs for insert
with check (exists (select 1 from public.experiments where experiments.id = experiment_outputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can update their experiment outputs"
on public.experiment_outputs for update
using (exists (select 1 from public.experiments where experiments.id = experiment_outputs.experiment_id and experiments.user_id = (select auth.uid())))
with check (exists (select 1 from public.experiments where experiments.id = experiment_outputs.experiment_id and experiments.user_id = (select auth.uid())));

create policy "Users can delete their experiment outputs"
on public.experiment_outputs for delete
using (exists (select 1 from public.experiments where experiments.id = experiment_outputs.experiment_id and experiments.user_id = (select auth.uid())));

create view public.reaction_catalog
with (security_invoker = true)
as
select
  r.id,
  r.slug,
  r.name_ko,
  r.equation,
  r.reaction_type,
  r.effect,
  r.observation,
  r.min_temperature_c,
  r.max_temperature_c,
  r.min_pressure_atm,
  r.max_pressure_atm,
  r.min_ph,
  r.max_ph,
  r.min_time_min,
  r.calculation_model,
  r.note,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'material_id', m.id,
        'material_slug', m.slug,
        'name_ko', m.name_ko,
        'formula', m.formula,
        'role', rs.role,
        'coefficient', rs.stoichiometric_coefficient,
        'phase_label', rs.phase_label
      ) order by rs.role, rs.display_order
    ) filter (where rs.id is not null),
    '[]'::jsonb
  ) as species
from public.reactions r
left join public.reaction_species rs on rs.reaction_id = r.id
left join public.materials m on m.id = rs.material_id
where r.is_active
group by r.id;

grant select on public.materials, public.reactions, public.reaction_species, public.reaction_catalog to anon, authenticated;
grant select, insert, update, delete on public.experiments, public.experiment_inputs, public.experiment_outputs to authenticated;
grant usage, select on all sequences in schema public to authenticated;
