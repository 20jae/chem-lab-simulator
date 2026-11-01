alter table public.materials add column if not exists source text;
alter table public.materials add column if not exists pubchem_cid bigint;
alter table public.materials add column if not exists source_url text;

alter table public.materials drop constraint if exists materials_state_check;
alter table public.materials add constraint materials_state_check
check (state in ('solid', 'liquid', 'gas', 'aqueous', 'unknown'));

create unique index if not exists materials_pubchem_cid_unique
on public.materials (pubchem_cid)
where pubchem_cid is not null;

create or replace function public.cache_pubchem_material(
  p_cid bigint,
  p_title text,
  p_formula text,
  p_molar_mass numeric,
  p_iupac_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_id uuid;
begin
  if p_cid <= 0
    or char_length(trim(p_title)) not between 1 and 200
    or char_length(trim(p_formula)) not between 1 and 100
    or p_molar_mass <= 0
    or p_molar_mass > 100000
  then
    raise exception 'Invalid PubChem material payload';
  end if;

  insert into public.materials (
    slug, name_ko, name_en, formula, state, molar_mass_g_mol,
    description, accent_class, source, pubchem_cid, source_url, is_active
  ) values (
    'pubchem-' || p_cid,
    trim(p_title),
    trim(p_title),
    trim(p_formula),
    'unknown',
    p_molar_mass,
    case when p_iupac_name is null then 'PubChem에서 검증한 화합물' else 'IUPAC명: ' || p_iupac_name end,
    'bg-violet-400',
    'PubChem PUG REST',
    p_cid,
    'https://pubchem.ncbi.nlm.nih.gov/compound/' || p_cid,
    true
  )
  on conflict (slug) do update set
    name_en = excluded.name_en,
    formula = excluded.formula,
    molar_mass_g_mol = excluded.molar_mass_g_mol,
    description = excluded.description,
    source = excluded.source,
    pubchem_cid = excluded.pubchem_cid,
    source_url = excluded.source_url,
    is_active = true
  returning id into saved_id;

  return saved_id;
end;
$$;

revoke all on function public.cache_pubchem_material(bigint, text, text, numeric, text) from public;
grant execute on function public.cache_pubchem_material(bigint, text, text, numeric, text) to anon, authenticated;
