export type Substance = {
  id: string;
  name: string;
  formula: string;
  state: string;
  molarMass: number;
  description: string;
  accent: string;
  density?: number;
};

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
  { id: 'nacl', name: '염화 나트륨', formula: 'NaCl', state: '고체', molarMass: 58.44, description: '물에 잘 녹는 흰색 결정성 고체', accent: 'bg-cyan-400' },
  { id: 'h2o', name: '증류수', formula: 'H₂O', state: '액체', molarMass: 18.02, density: 1, description: '불순물을 제거한 무색의 액체', accent: 'bg-blue-400' },
  { id: 'hcl', name: '염산', formula: 'HCl', state: '수용액', molarMass: 36.46, description: '염화 수소가 물에 녹은 산성 용액', accent: 'bg-amber-400' },
  { id: 'naoh', name: '수산화 나트륨', formula: 'NaOH', state: '고체', molarMass: 40, description: '강한 염기성을 띠는 흰색 고체', accent: 'bg-emerald-400' },
  { id: 'cuso4', name: '황산 구리(Ⅱ)', formula: 'CuSO₄', state: '고체', molarMass: 159.61, description: '푸른색을 띠는 결정성 물질', accent: 'bg-indigo-400' },
];

export const initialMaterials: AddedSubstance[] = [
  { ...substances[1], amount: '100', unit: 'mL', rowId: 1 },
  { ...substances[0], amount: '5', unit: 'g', rowId: 2 },
];

export function toMoles(material: AddedSubstance) {
  const amount = Number(material.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (material.unit === 'mol') return amount;
  if (material.unit === 'g') return amount / material.molarMass;
  if (material.unit === 'mg') return amount / 1000 / material.molarMass;
  if (material.unit === 'mL' && material.density) return amount * material.density / material.molarMass;
  return null;
}
