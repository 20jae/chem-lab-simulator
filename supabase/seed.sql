insert into public.materials (slug, name_ko, name_en, formula, state, molar_mass_g_mol, density_g_ml, description, accent_class)
values
  ('nacl', '염화 나트륨', 'Sodium chloride', 'NaCl', 'solid', 58.44, null, '물에 잘 녹는 흰색 결정성 고체', 'bg-cyan-400'),
  ('h2o', '증류수', 'Water', 'H₂O', 'liquid', 18.02, 1, '불순물을 제거한 무색의 액체', 'bg-blue-400'),
  ('hcl', '염산', 'Hydrochloric acid', 'HCl', 'aqueous', 36.46, null, '염화 수소가 물에 녹은 산성 용액', 'bg-amber-400'),
  ('naoh', '수산화 나트륨', 'Sodium hydroxide', 'NaOH', 'solid', 40, null, '강한 염기성을 띠는 흰색 고체', 'bg-emerald-400'),
  ('cuso4', '황산 구리(Ⅱ)', 'Copper(II) sulfate', 'CuSO₄', 'solid', 159.61, null, '푸른색을 띠는 결정성 물질', 'bg-indigo-400'),
  ('cuoh2', '수산화 구리(Ⅱ)', 'Copper(II) hydroxide', 'Cu(OH)₂', 'solid', 97.56, null, '푸른색 침전을 형성하는 고체', 'bg-sky-500'),
  ('na2so4', '황산 나트륨', 'Sodium sulfate', 'Na₂SO₄', 'aqueous', 142.04, null, '침전 반응 후 수용액에 남는 염', 'bg-slate-400'),
  ('na-ion', '나트륨 이온', 'Sodium ion', 'Na⁺', 'aqueous', 22.99, null, '수용액에 분산된 나트륨 이온', 'bg-cyan-500'),
  ('cl-ion', '염화 이온', 'Chloride ion', 'Cl⁻', 'aqueous', 35.45, null, '수용액에 분산된 염화 이온', 'bg-teal-500')
on conflict (slug) do update set
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  formula = excluded.formula,
  state = excluded.state,
  molar_mass_g_mol = excluded.molar_mass_g_mol,
  density_g_ml = excluded.density_g_ml,
  description = excluded.description,
  accent_class = excluded.accent_class,
  is_active = true;

insert into public.reactions (slug, name_ko, equation, reaction_type, effect, observation, min_ph, calculation_model, note, priority)
values
  ('hcl-naoh-neutralization', '염산-수산화 나트륨 중화', 'HCl + NaOH → NaCl + H₂O', 'neutralization', 'neutralization', '발열과 함께 염화 나트륨 수용액과 물이 생성됩니다.', null, '{"model":"limiting_reagent","yield":1}'::jsonb, '완전 반응과 순수 시약을 가정한 교육용 모델', 10),
  ('cuso4-naoh-precipitation', '수산화 구리(Ⅱ) 침전', 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', 'precipitation', 'precipitate', '푸른색 수산화 구리(Ⅱ) 침전 생성이 예상됩니다.', 7, '{"model":"limiting_reagent","yield":1,"precipitate":"cuoh2"}'::jsonb, '기본 규칙에서는 pH 7 이상을 침전 가능 조건으로 사용', 20),
  ('nacl-water-dissolution', '염화 나트륨 용해', 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)', 'dissolution', 'dissolution', '염화 나트륨이 물에 녹아 나트륨 이온과 염화 이온으로 분산됩니다.', null, '{"model":"dissolution"}'::jsonb, '용해도와 포화 여부 계산은 후속 확장 대상', 30)
on conflict (slug) do update set
  name_ko = excluded.name_ko,
  equation = excluded.equation,
  reaction_type = excluded.reaction_type,
  effect = excluded.effect,
  observation = excluded.observation,
  min_ph = excluded.min_ph,
  calculation_model = excluded.calculation_model,
  note = excluded.note,
  priority = excluded.priority,
  is_active = true;

insert into public.reaction_species (reaction_id, material_id, role, stoichiometric_coefficient, phase_label, display_order)
select r.id, m.id, x.role::public.species_role, x.coefficient, x.phase_label, x.display_order
from (
  values
    ('hcl-naoh-neutralization', 'hcl', 'reactant', 1::numeric, 'aq', 1),
    ('hcl-naoh-neutralization', 'naoh', 'reactant', 1::numeric, 'aq', 2),
    ('hcl-naoh-neutralization', 'nacl', 'product', 1::numeric, 'aq', 3),
    ('hcl-naoh-neutralization', 'h2o', 'product', 1::numeric, 'l', 4),
    ('cuso4-naoh-precipitation', 'cuso4', 'reactant', 1::numeric, 'aq', 1),
    ('cuso4-naoh-precipitation', 'naoh', 'reactant', 2::numeric, 'aq', 2),
    ('cuso4-naoh-precipitation', 'cuoh2', 'product', 1::numeric, 's', 3),
    ('cuso4-naoh-precipitation', 'na2so4', 'product', 1::numeric, 'aq', 4),
    ('nacl-water-dissolution', 'nacl', 'reactant', 1::numeric, 's', 1),
    ('nacl-water-dissolution', 'h2o', 'solvent', 1::numeric, 'l', 2),
    ('nacl-water-dissolution', 'na-ion', 'product', 1::numeric, 'aq', 3),
    ('nacl-water-dissolution', 'cl-ion', 'product', 1::numeric, 'aq', 4)
) as x(reaction_slug, material_slug, role, coefficient, phase_label, display_order)
join public.reactions r on r.slug = x.reaction_slug
join public.materials m on m.slug = x.material_slug
on conflict (reaction_id, material_id, role) do update set
  stoichiometric_coefficient = excluded.stoichiometric_coefficient,
  phase_label = excluded.phase_label,
  display_order = excluded.display_order;
