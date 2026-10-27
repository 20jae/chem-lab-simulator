export type Substance = {
  id: string;
  name: string;
  formula: string;
  state: string;
  molarMass: number;
  description: string;
  accent: string;
  density?: number;
  source?: 'curated' | 'pubchem';
  pubchemCid?: number;
  sourceUrl?: string;
};

export function canonicalSubstanceId(material: Pick<Substance, 'id' | 'pubchemCid' | 'formula'>) {
  const byCid = material.pubchemCid ? substances.find((item) => item.pubchemCid === material.pubchemCid) : undefined;
  if (byCid) return byCid.id;
  const normalizedFormula = material.formula.replace(/[\s₀₁₂₃₄₅₆₇₈₉]/g, (character) => ({ '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' }[character] ?? ''));
  return substances.find((item) => item.formula.replace(/[\s₀₁₂₃₄₅₆₇₈₉]/g, (character) => ({ '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' }[character] ?? '')) === normalizedFormula)?.id ?? material.id;
}

export type AddedSubstance = Substance & {
  amount: string;
  unit: string;
  rowId: number;
};

export type LabConditions = {
  temperature: number;
  pressure: number;
  ph: number;
  time: number;
};

export const substances: Substance[] = [
  { id: 'nacl', name: '염화 나트륨', formula: 'NaCl', state: '고체', molarMass: 58.44, description: '물에 잘 녹는 흰색 결정성 고체', accent: 'bg-cyan-400', source: 'curated', pubchemCid: 5234 },
  { id: 'h2o', name: '증류수', formula: 'H₂O', state: '액체', molarMass: 18.02, density: 1, description: '불순물을 제거한 무색의 액체', accent: 'bg-blue-400', source: 'curated', pubchemCid: 962 },
  { id: 'hcl', name: '염산', formula: 'HCl', state: '수용액', molarMass: 36.46, description: '염화 수소가 물에 녹은 산성 용액', accent: 'bg-amber-400', source: 'curated', pubchemCid: 313 },
  { id: 'naoh', name: '수산화 나트륨', formula: 'NaOH', state: '고체', molarMass: 40, description: '강한 염기성을 띠는 흰색 고체', accent: 'bg-emerald-400', source: 'curated', pubchemCid: 14798 },
  { id: 'cuso4', name: '황산 구리(Ⅱ)', formula: 'CuSO₄', state: '고체', molarMass: 159.61, description: '푸른색을 띠는 결정성 물질', accent: 'bg-indigo-400', source: 'curated', pubchemCid: 24462 },
  { id: 'h2so4', name: '황산', formula: 'H₂SO₄', state: '수용액', molarMass: 98.08, description: '강한 산성을 띠는 무색의 산', accent: 'bg-orange-400', source: 'curated', pubchemCid: 1118 },
  { id: 'caco3', name: '탄산 칼슘', formula: 'CaCO₃', state: '고체', molarMass: 100.09, description: '석회석과 대리석의 주성분인 흰색 고체', accent: 'bg-stone-400', source: 'curated', pubchemCid: 10112 },
  { id: 'agno3', name: '질산 은', formula: 'AgNO₃', state: '고체', molarMass: 169.87, description: '염화 이온 검출에 사용되는 무색 결정', accent: 'bg-zinc-400', source: 'curated', pubchemCid: 24470 },
  { id: 'bacl2', name: '염화 바륨', formula: 'BaCl₂', state: '고체', molarMass: 208.23, description: '황산 이온 검출에 사용되는 흰색 고체', accent: 'bg-slate-400', source: 'curated', pubchemCid: 25204 },
  { id: 'fecl3', name: '염화 철(Ⅲ)', formula: 'FeCl₃', state: '고체', molarMass: 162.2, description: '황갈색을 띠는 흡습성 고체', accent: 'bg-yellow-700', source: 'curated', pubchemCid: 24380 },
  { id: 'h2o2', name: '과산화 수소', formula: 'H₂O₂', state: '액체', molarMass: 34.01, density: 1.45, description: '산화성과 분해 반응성을 가진 무색 액체', accent: 'bg-sky-300', source: 'curated', pubchemCid: 784 },
  { id: 'zinc', name: '아연', formula: 'Zn', state: '고체', molarMass: 65.38, description: '산과 반응해 수소 기체를 발생시키는 금속', accent: 'bg-neutral-400', source: 'curated', pubchemCid: 23994 },
  { id: 'cuoh2', name: '수산화 구리(Ⅱ)', formula: 'Cu(OH)₂', state: '고체', molarMass: 97.56, description: '푸른색 침전을 형성하는 고체', accent: 'bg-sky-600', source: 'curated', pubchemCid: 164826 },
  { id: 'na2so4', name: '황산 나트륨', formula: 'Na₂SO₄', state: '고체', molarMass: 142.04, description: '물에 녹는 흰색 무기염', accent: 'bg-slate-300', source: 'curated', pubchemCid: 24436 },
  { id: 'agcl', name: '염화 은', formula: 'AgCl', state: '고체', molarMass: 143.32, description: '빛에 민감한 흰색 침전', accent: 'bg-gray-300', source: 'curated', pubchemCid: 24561 },
  { id: 'nano3', name: '질산 나트륨', formula: 'NaNO₃', state: '고체', molarMass: 84.99, description: '물에 잘 녹는 무색 결정', accent: 'bg-blue-300', source: 'curated', pubchemCid: 24268 },
  { id: 'baso4', name: '황산 바륨', formula: 'BaSO₄', state: '고체', molarMass: 233.39, description: '물에 거의 녹지 않는 흰색 침전', accent: 'bg-gray-200', source: 'curated', pubchemCid: 24414 },
  { id: 'feoh3', name: '수산화 철(Ⅲ)', formula: 'Fe(OH)₃', state: '고체', molarMass: 106.87, description: '적갈색 침전을 형성하는 고체', accent: 'bg-orange-700', source: 'curated', pubchemCid: 73964 },
  { id: 'cacl2', name: '염화 칼슘', formula: 'CaCl₂', state: '고체', molarMass: 110.98, description: '흡습성이 큰 흰색 무기염', accent: 'bg-slate-300', source: 'curated', pubchemCid: 5284359 },
  { id: 'co2', name: '이산화 탄소', formula: 'CO₂', state: '기체', molarMass: 44.01, description: '무색의 기체 생성물', accent: 'bg-gray-400', source: 'curated', pubchemCid: 280 },
  { id: 'o2', name: '산소', formula: 'O₂', state: '기체', molarMass: 32, description: '연소를 돕는 무색 기체', accent: 'bg-blue-500', source: 'curated', pubchemCid: 977 },
  { id: 'h2', name: '수소', formula: 'H₂', state: '기체', molarMass: 2.016, description: '가연성이 매우 큰 무색 기체', accent: 'bg-cyan-300', source: 'curated', pubchemCid: 783 },
  { id: 'zncl2', name: '염화 아연', formula: 'ZnCl₂', state: '고체', molarMass: 136.28, description: '물에 잘 녹는 흰색 염', accent: 'bg-zinc-300', source: 'curated', pubchemCid: 5727 },
  { id: 'koh', name: '수산화 칼륨', formula: 'KOH', state: '고체', molarMass: 56.11, description: '강한 염기성을 띠는 흰색 고체', accent: 'bg-emerald-500', source: 'curated', pubchemCid: 14797 },
  { id: 'ch3cooh', name: '아세트산', formula: 'CH₃COOH', state: '액체', molarMass: 60.05, density: 1.05, description: '식초의 산성 성분인 약산', accent: 'bg-amber-300', source: 'curated', pubchemCid: 176 },
  { id: 'pbno32', name: '질산 납(Ⅱ)', formula: 'Pb(NO₃)₂', state: '고체', molarMass: 331.21, description: '납 이온을 포함하는 유독성 무기염', accent: 'bg-slate-500', source: 'curated', pubchemCid: 24924 },
  { id: 'ki', name: '아이오딘화 칼륨', formula: 'KI', state: '고체', molarMass: 166.00, description: '물에 잘 녹는 흰색 결정', accent: 'bg-violet-300', source: 'curated', pubchemCid: 4875 },
  { id: 'na2co3', name: '탄산 나트륨', formula: 'Na₂CO₃', state: '고체', molarMass: 105.99, description: '염기성을 띠는 흰색 무기염', accent: 'bg-blue-200', source: 'curated', pubchemCid: 10340 },
  { id: 'mg', name: '마그네슘', formula: 'Mg', state: '고체', molarMass: 24.31, description: '산과 반응하여 수소를 발생시키는 금속', accent: 'bg-neutral-300', source: 'curated', pubchemCid: 5462224 },
  { id: 'iron', name: '철', formula: 'Fe', state: '고체', molarMass: 55.85, description: '치환 반응에 사용되는 금속', accent: 'bg-stone-500', source: 'curated', pubchemCid: 23925 },
  { id: 'copper', name: '구리', formula: 'Cu', state: '고체', molarMass: 63.55, description: '붉은빛을 띠는 금속', accent: 'bg-orange-500', source: 'curated', pubchemCid: 23978 },
  { id: 'nh4cl', name: '염화 암모늄', formula: 'NH₄Cl', state: '고체', molarMass: 53.49, description: '암모늄 이온을 포함하는 흰색 염', accent: 'bg-gray-300', source: 'curated', pubchemCid: 25517 },
];

export async function searchPubChem(query: string, signal?: AbortSignal): Promise<Substance[]> {
  const term = query.trim();
  if (term.length < 2) return [];
  const fields = 'Title,MolecularFormula,MolecularWeight,IUPACName';
  const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(term)}/property/${fields}/JSON`, { signal });
  if (!response.ok) return [];
  const payload = await response.json() as { PropertyTable?: { Properties?: Array<{ CID: number; Title?: string; MolecularFormula?: string; MolecularWeight?: string; IUPACName?: string }> } };
  return (payload.PropertyTable?.Properties ?? []).slice(0, 3).map((item) => ({
    id: `pubchem-${item.CID}`,
    name: item.Title ?? item.IUPACName ?? `PubChem CID ${item.CID}`,
    formula: item.MolecularFormula ?? '화학식 미상',
    state: '상태 정보 없음',
    molarMass: Number(item.MolecularWeight) || 0,
    description: item.IUPACName ? `IUPAC명: ${item.IUPACName}` : 'PubChem에서 불러온 화합물',
    accent: 'bg-violet-400',
    source: 'pubchem',
    pubchemCid: item.CID,
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${item.CID}`,
  }));
}

export const initialMaterials: AddedSubstance[] = [
  { ...substances[1], amount: '100', unit: 'mL', rowId: 1 },
  { ...substances[0], amount: '5', unit: 'g', rowId: 2 },
];

export function toMoles(material: AddedSubstance) {
  const amount = Number(material.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (material.unit === 'mol') return amount;
  if (material.unit === 'g' && material.molarMass > 0) return amount / material.molarMass;
  if (material.unit === 'mg' && material.molarMass > 0) return amount / 1000 / material.molarMass;
  if (material.unit === 'mL' && material.density) return amount * material.density / material.molarMass;
  return null;
}
