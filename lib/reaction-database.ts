export type ReactionSpeciesDefinition = {
  id: string;
  name: string;
  formula: string;
  coefficient: number;
  molarMass: number;
  displayAs?: 'mol' | 'g';
  role?: string;
};

export type ReactionDefinition = {
  id: string;
  title: string;
  equation: string;
  effect: 'neutralization' | 'precipitate' | 'dissolution' | 'gas' | 'none';
  kind?: 'reaction' | 'none';
  reactants: Array<{ id: string; coefficient: number }>;
  products: ReactionSpeciesDefinition[];
  observation: string;
  minPh?: number;
  maxPh?: number;
  note: string;
};

export const reactionDatabase: ReactionDefinition[] = [
  { id: 'hcl-naoh', title: '염산–수산화 나트륨 중화 반응', equation: 'HCl + NaOH → NaCl + H₂O', effect: 'neutralization', reactants: [{ id: 'hcl', coefficient: 1 }, { id: 'naoh', coefficient: 1 }], products: [{ id: 'nacl', name: '염화 나트륨', formula: 'NaCl', coefficient: 1, molarMass: 58.44 }, { id: 'h2o', name: '물', formula: 'H₂O', coefficient: 1, molarMass: 18.02 }], observation: '산과 염기가 반응하며 열이 발생하고 염과 물이 생성됩니다.', note: '강산과 강염기의 완전 중화를 가정한 교육용 계산입니다.' },
  { id: 'h2so4-naoh', title: '황산–수산화 나트륨 중화 반응', equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O', effect: 'neutralization', reactants: [{ id: 'h2so4', coefficient: 1 }, { id: 'naoh', coefficient: 2 }], products: [{ id: 'na2so4', name: '황산 나트륨', formula: 'Na₂SO₄', coefficient: 1, molarMass: 142.04 }, { id: 'h2o', name: '물', formula: 'H₂O', coefficient: 2, molarMass: 18.02 }], observation: '중화열과 함께 황산 나트륨과 물이 생성됩니다.', note: '황산의 두 양성자가 모두 반응하는 완전 중화를 가정합니다.' },
  { id: 'cuso4-naoh', title: '수산화 구리(Ⅱ) 침전 반응', equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', effect: 'precipitate', minPh: 7, reactants: [{ id: 'cuso4', coefficient: 1 }, { id: 'naoh', coefficient: 2 }], products: [{ id: 'cuoh2', name: '수산화 구리(Ⅱ)', formula: 'Cu(OH)₂', coefficient: 1, molarMass: 97.56, displayAs: 'g', role: '푸른색 침전' }, { id: 'na2so4', name: '황산 나트륨', formula: 'Na₂SO₄', coefficient: 1, molarMass: 142.04 }], observation: '푸른색 수산화 구리(Ⅱ) 침전 생성이 예상됩니다.', note: '기본 규칙에서는 pH 7 이상을 침전 가능 조건으로 사용합니다.' },
  { id: 'agno3-nacl', title: '염화 은 침전 반응', equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', effect: 'precipitate', reactants: [{ id: 'agno3', coefficient: 1 }, { id: 'nacl', coefficient: 1 }], products: [{ id: 'agcl', name: '염화 은', formula: 'AgCl', coefficient: 1, molarMass: 143.32, displayAs: 'g', role: '흰색 침전' }, { id: 'nano3', name: '질산 나트륨', formula: 'NaNO₃', coefficient: 1, molarMass: 84.99 }], observation: '빛에 민감한 흰색 염화 은 침전이 생성됩니다.', note: '수용액에서 완전 침전한다고 가정한 이론값입니다.' },
  { id: 'bacl2-na2so4', title: '황산 바륨 침전 반응', equation: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl', effect: 'precipitate', reactants: [{ id: 'bacl2', coefficient: 1 }, { id: 'na2so4', coefficient: 1 }], products: [{ id: 'baso4', name: '황산 바륨', formula: 'BaSO₄', coefficient: 1, molarMass: 233.39, displayAs: 'g', role: '흰색 침전' }, { id: 'nacl', name: '염화 나트륨', formula: 'NaCl', coefficient: 2, molarMass: 58.44 }], observation: '물에 거의 녹지 않는 흰색 황산 바륨 침전이 생성됩니다.', note: '수용액에서 완전 침전한다고 가정한 이론값입니다.' },
  { id: 'fecl3-naoh', title: '수산화 철(Ⅲ) 침전 반응', equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl', effect: 'precipitate', minPh: 7, reactants: [{ id: 'fecl3', coefficient: 1 }, { id: 'naoh', coefficient: 3 }], products: [{ id: 'feoh3', name: '수산화 철(Ⅲ)', formula: 'Fe(OH)₃', coefficient: 1, molarMass: 106.87, displayAs: 'g', role: '적갈색 침전' }, { id: 'nacl', name: '염화 나트륨', formula: 'NaCl', coefficient: 3, molarMass: 58.44 }], observation: '적갈색 수산화 철(Ⅲ) 침전이 생성됩니다.', note: '기본 규칙에서는 pH 7 이상을 침전 가능 조건으로 사용합니다.' },
  { id: 'caco3-hcl', title: '탄산 칼슘–염산 반응', equation: 'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O', effect: 'gas', reactants: [{ id: 'caco3', coefficient: 1 }, { id: 'hcl', coefficient: 2 }], products: [{ id: 'cacl2', name: '염화 칼슘', formula: 'CaCl₂', coefficient: 1, molarMass: 110.98 }, { id: 'co2', name: '이산화 탄소', formula: 'CO₂', coefficient: 1, molarMass: 44.01, role: '기체 생성물' }, { id: 'h2o', name: '물', formula: 'H₂O', coefficient: 1, molarMass: 18.02 }], observation: '이산화 탄소 기체가 발생하며 고체가 점차 녹습니다.', note: '염산 농도와 표면적에 따른 속도 차이는 아직 반영하지 않습니다.' },
  { id: 'zinc-hcl', title: '아연–염산 반응', equation: 'Zn + 2HCl → ZnCl₂ + H₂↑', effect: 'gas', reactants: [{ id: 'zinc', coefficient: 1 }, { id: 'hcl', coefficient: 2 }], products: [{ id: 'zncl2', name: '염화 아연', formula: 'ZnCl₂', coefficient: 1, molarMass: 136.28 }, { id: 'h2', name: '수소', formula: 'H₂', coefficient: 1, molarMass: 2.016, role: '기체 생성물' }], observation: '무색의 수소 기체가 발생하고 아연이 점차 용해됩니다.', note: '수소는 가연성이 매우 크므로 실제 실험에서는 화기 접근이 금지됩니다.' },
  { id: 'h2o2-decomposition', title: '과산화 수소 분해 반응', equation: '2H₂O₂ → 2H₂O + O₂↑', effect: 'gas', reactants: [{ id: 'h2o2', coefficient: 2 }], products: [{ id: 'h2o', name: '물', formula: 'H₂O', coefficient: 2, molarMass: 18.02 }, { id: 'o2', name: '산소', formula: 'O₂', coefficient: 1, molarMass: 32, role: '기체 생성물' }], observation: '산소 기체가 발생하며 기포가 나타납니다.', note: '촉매와 농도에 따른 분해 속도 차이는 아직 반영하지 않습니다.' },
  { id: 'nacl-water', title: '염화 나트륨 용해', equation: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)', effect: 'dissolution', kind: 'none', reactants: [{ id: 'nacl', coefficient: 1 }, { id: 'h2o', coefficient: 1 }], products: [{ id: 'na-ion', name: '나트륨 이온', formula: 'Na⁺(aq)', coefficient: 1, molarMass: 22.99, role: '용해 이온' }, { id: 'cl-ion', name: '염화 이온', formula: 'Cl⁻(aq)', coefficient: 1, molarMass: 35.45, role: '용해 이온' }], observation: '염화 나트륨이 물에 녹아 나트륨 이온과 염화 이온으로 분산됩니다.', note: '용해도와 포화 여부 계산은 후속 확장 대상입니다.' },
];

