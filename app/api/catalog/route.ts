import { NextResponse } from 'next/server';
import type { Substance } from '@/lib/chemistry';
import type { ReactionDefinition } from '@/lib/reaction-database';

type MaterialRow = {
  slug: string;
  name_ko: string;
  formula: string;
  state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  molar_mass_g_mol: number;
  density_g_ml: number | null;
  description: string | null;
  accent_class: string | null;
};

type CatalogSpecies = {
  material_slug: string;
  name_ko: string;
  formula: string;
  role: 'reactant' | 'product' | 'catalyst' | 'solvent';
  coefficient: number;
  phase_label: string | null;
};

type ReactionRow = {
  slug: string;
  name_ko: string;
  equation: string;
  reaction_type: string;
  effect: ReactionDefinition['effect'];
  observation: string;
  min_ph: number | null;
  max_ph: number | null;
  note: string | null;
  species: CatalogSpecies[];
};

const stateLabels = { solid: '고체', liquid: '액체', gas: '기체', aqueous: '수용액' } as const;
const categoryLabels: Record<string, ReactionDefinition['category']> = {
  neutralization: '중화', precipitation: '침전', dissolution: '용해', other: '산화·환원',
};

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase environment variables are not configured.' }, { status: 503 });

  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
  const [materialsResponse, reactionsResponse] = await Promise.all([
    fetch(`${url}/rest/v1/materials?select=slug,name_ko,formula,state,molar_mass_g_mol,density_g_ml,description,accent_class&is_active=eq.true&order=name_ko`, { headers, cache: 'no-store' }),
    fetch(`${url}/rest/v1/reaction_catalog?select=*&order=slug`, { headers, cache: 'no-store' }),
  ]);
  if (!materialsResponse.ok || !reactionsResponse.ok) {
    return NextResponse.json({ error: 'Supabase catalog query failed.' }, { status: 502 });
  }

  const materialRows = await materialsResponse.json() as MaterialRow[];
  const reactionRows = await reactionsResponse.json() as ReactionRow[];
  const materials: Substance[] = materialRows.map((row) => ({
    id: row.slug,
    name: row.name_ko,
    formula: row.formula,
    state: stateLabels[row.state],
    molarMass: Number(row.molar_mass_g_mol),
    density: row.density_g_ml === null ? undefined : Number(row.density_g_ml),
    description: row.description ?? 'Supabase 물질 데이터베이스에서 불러온 물질',
    accent: row.accent_class ?? 'bg-teal-400',
    source: 'supabase',
  }));
  const materialMap = new Map(materials.map((material) => [material.id, material]));
  const reactions: ReactionDefinition[] = reactionRows.map((row) => {
    const species = Array.isArray(row.species) ? row.species : [];
    return {
      id: row.slug,
      title: row.name_ko,
      equation: row.equation,
      effect: row.effect,
      kind: row.effect === 'dissolution' ? 'none' : 'reaction',
      category: categoryLabels[row.reaction_type],
      source: 'Supabase DB',
      reactants: species.filter((item) => item.role === 'reactant' || item.role === 'solvent').map((item) => ({ id: item.material_slug, coefficient: Number(item.coefficient) })),
      products: species.filter((item) => item.role === 'product').map((item) => ({
        id: item.material_slug,
        name: item.name_ko,
        formula: item.formula,
        coefficient: Number(item.coefficient),
        molarMass: materialMap.get(item.material_slug)?.molarMass ?? 0,
        displayAs: row.effect === 'precipitate' && item.phase_label === 's' ? 'g' : 'mol',
        role: row.effect === 'precipitate' && item.phase_label === 's' ? '침전 생성물' : '생성물',
      })),
      observation: row.observation,
      minPh: row.min_ph === null ? undefined : Number(row.min_ph),
      maxPh: row.max_ph === null ? undefined : Number(row.max_ph),
      note: row.note ?? 'Supabase 반응 데이터베이스에서 불러온 교육용 반응입니다.',
    };
  });

  return NextResponse.json({ materials, reactions, source: 'supabase' }, { headers: { 'Cache-Control': 'no-store' } });
}
