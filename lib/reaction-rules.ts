import { canonicalSubstanceId, type AddedSubstance } from '@/lib/chemistry';
import type { ReactionDefinition, ReactionSpeciesDefinition } from '@/lib/reaction-database';

type RuleMaterial = AddedSubstance & { canonicalId: string; normalizedFormula: string };

type AcidProfile = { formula: string; name: string; protons: number; anion: string; anionName: string };
type BaseProfile = { formula: string; name: string; hydroxides: number; cation: string; cationName: string };

const subscriptMap: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
const normalizeFormula = (formula: string) => formula.replace(/[\s₀-₉]/g, (value) => subscriptMap[value] ?? '').replace(/\(aq\)|\(s\)|\(l\)|\(g\)/gi, '');
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

const acids: Record<string, AcidProfile> = {
  HCl: { formula: 'HCl', name: '염산', protons: 1, anion: 'Cl', anionName: '염화' },
  H2SO4: { formula: 'H₂SO₄', name: '황산', protons: 2, anion: 'SO₄', anionName: '황산' },
  HNO3: { formula: 'HNO₃', name: '질산', protons: 1, anion: 'NO₃', anionName: '질산' },
  CH3COOH: { formula: 'CH₃COOH', name: '아세트산', protons: 1, anion: 'CH₃COO', anionName: '아세트산' },
};

const bases: Record<string, BaseProfile> = {
  NaOH: { formula: 'NaOH', name: '수산화 나트륨', hydroxides: 1, cation: 'Na', cationName: '나트륨' },
  KOH: { formula: 'KOH', name: '수산화 칼륨', hydroxides: 1, cation: 'K', cationName: '칼륨' },
  'Ca(OH)2': { formula: 'Ca(OH)₂', name: '수산화 칼슘', hydroxides: 2, cation: 'Ca', cationName: '칼슘' },
  'Mg(OH)2': { formula: 'Mg(OH)₂', name: '수산화 마그네슘', hydroxides: 2, cation: 'Mg', cationName: '마그네슘' },
};

const saltFormula = (base: BaseProfile, acid: AcidProfile) => {
  const cationCharge = base.hydroxides;
  const anionCharge = acid.protons;
  const count = lcm(cationCharge, anionCharge);
  const cations = count / cationCharge;
  const anions = count / anionCharge;
  const cation = cations === 1 ? base.cation : `${base.cation}${toSubscript(cations)}`;
  const complexAnion = /[A-Z].*[A-Z]|CH3COO/.test(normalizeFormula(acid.anion));
  const anionCore = complexAnion && anions > 1 ? `(${acid.anion})` : acid.anion;
  return `${cation}${anionCore}${anions === 1 ? '' : toSubscript(anions)}`;
};

function toSubscript(value: number) {
  return String(value).replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
}

function product(id: string, name: string, formula: string, coefficient: number, molarMass: number, role?: string, displayAs?: 'mol' | 'g'): ReactionSpeciesDefinition {
  return { id, name, formula, coefficient, molarMass, role, displayAs };
}

function estimateMolarMass(formula: string) {
  const masses: Record<string, number> = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.99, Mg: 24.305, Al: 26.982, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.868, Ba: 137.327, Pb: 207.2, I: 126.904 };
  const plain = normalizeFormula(formula);
  const stack: Array<Record<string, number>> = [{}];
  for (let index = 0; index < plain.length;) {
    if (plain[index] === '(') { stack.push({}); index += 1; continue; }
    if (plain[index] === ')') {
      index += 1;
      const match = plain.slice(index).match(/^\d+/);
      const multiplier = match ? Number(match[0]) : 1;
      if (match) index += match[0].length;
      const group = stack.pop() ?? {};
      Object.entries(group).forEach(([element, count]) => { stack[stack.length - 1][element] = (stack[stack.length - 1][element] ?? 0) + count * multiplier; });
      continue;
    }
    const elementMatch = plain.slice(index).match(/^[A-Z][a-z]?/);
    if (!elementMatch) { index += 1; continue; }
    index += elementMatch[0].length;
    const countMatch = plain.slice(index).match(/^\d+/);
    const count = countMatch ? Number(countMatch[0]) : 1;
    if (countMatch) index += countMatch[0].length;
    stack[stack.length - 1][elementMatch[0]] = (stack[stack.length - 1][elementMatch[0]] ?? 0) + count;
  }
  return Object.entries(stack[0]).reduce((sum, [element, count]) => sum + (masses[element] ?? 0) * count, 0);
}

function makeRule(id: string, title: string, equation: string, effect: ReactionDefinition['effect'], reactants: RuleMaterial[], coefficients: number[], products: ReactionSpeciesDefinition[], observation: string, category: ReactionDefinition['category'], note: string, conditions: Partial<Pick<ReactionDefinition, 'minPh' | 'maxPh' | 'minTemperature' | 'minTime'>> = {}): ReactionDefinition {
  return {
    id: `rule-${id}`,
    title: `${title} (규칙 판정)`,
    equation,
    effect,
    reactants: reactants.map((item, index) => ({ id: item.canonicalId, coefficient: coefficients[index] })),
    products,
    observation,
    category,
    source: '규칙 기반 판정',
    note: `반응 DB에 일치하는 항목이 없어 화학 분류 규칙을 적용한 교육용 예상입니다. ${note}`,
    ...conditions,
  };
}

function neutralization(materials: RuleMaterial[]) {
  const acidMaterial = materials.find((item) => acids[item.normalizedFormula]);
  const baseMaterial = materials.find((item) => bases[item.normalizedFormula]);
  if (!acidMaterial || !baseMaterial) return null;
  const acid = acids[acidMaterial.normalizedFormula];
  const base = bases[baseMaterial.normalizedFormula];
  const equivalents = lcm(acid.protons, base.hydroxides);
  const acidCoefficient = equivalents / acid.protons;
  const baseCoefficient = equivalents / base.hydroxides;
  const waterCoefficient = equivalents;
  const salt = saltFormula(base, acid);
  const saltName = `${acid.anionName} ${base.cationName}`;
  return makeRule('neutralization', `${acid.name}–${base.name} 중화 반응`, `${coefficient(acidCoefficient)}${acid.formula} + ${coefficient(baseCoefficient)}${base.formula} → ${salt} + ${coefficient(waterCoefficient)}H₂O`, 'neutralization', [acidMaterial, baseMaterial], [acidCoefficient, baseCoefficient], [product('rule-salt', saltName, salt, 1, estimateMolarMass(salt)), product('h2o', '물', 'H₂O', waterCoefficient, 18.015)], '산과 염기가 중화되어 염과 물이 생성되며 중화열이 나타날 수 있습니다.', '중화', '완전 중화와 이상적인 수용액을 가정합니다.');
}

const metalProfiles: Record<string, { name: string; charge: number; active: boolean }> = {
  Mg: { name: '마그네슘', charge: 2, active: true }, Al: { name: '알루미늄', charge: 3, active: true }, Zn: { name: '아연', charge: 2, active: true }, Fe: { name: '철', charge: 2, active: true }, Cu: { name: '구리', charge: 2, active: false }, Ag: { name: '은', charge: 1, active: false },
};

function metalAcid(materials: RuleMaterial[]) {
  const metalMaterial = materials.find((item) => metalProfiles[item.normalizedFormula]?.active);
  const acidMaterial = materials.find((item) => ['HCl', 'H2SO4'].includes(item.normalizedFormula));
  if (!metalMaterial || !acidMaterial) return null;
  const metal = metalProfiles[metalMaterial.normalizedFormula];
  const acid = acids[acidMaterial.normalizedFormula];
  const electronCount = lcm(metal.charge, 2);
  const metalCoefficient = electronCount / metal.charge;
  const hydrogenCoefficient = electronCount / 2;
  const acidCoefficient = metalCoefficient * metal.charge / acid.protons;
  const saltBase: BaseProfile = { formula: '', name: '', hydroxides: metal.charge, cation: metalMaterial.formula, cationName: metal.name };
  const salt = saltFormula(saltBase, acid);
  return makeRule('metal-acid', `${metal.name}–${acid.name} 반응`, `${coefficient(metalCoefficient)}${metalMaterial.formula} + ${coefficient(acidCoefficient)}${acid.formula} → ${coefficient(metalCoefficient)}${salt} + ${coefficient(hydrogenCoefficient)}H₂↑`, 'gas', [metalMaterial, acidMaterial], [metalCoefficient, acidCoefficient], [product('rule-metal-salt', `${acid.anionName} ${metal.name}`, salt, metalCoefficient, estimateMolarMass(salt)), product('h2', '수소', 'H₂', hydrogenCoefficient, 2.016, '기체 생성물')], '금속이 점차 녹으며 가연성 수소 기체 발생이 예상됩니다.', '기체 발생', '질산과 농황산의 산화성 반응은 이 규칙에서 제외합니다.');
}

const carbonateProfiles: Record<string, { name: string; saltFormula: (acid: AcidProfile) => string; saltName: (acid: AcidProfile) => string; acidCoefficient: number }> = {
  CaCO3: { name: '탄산 칼슘', saltFormula: (acid) => saltFormula({ formula: '', name: '', hydroxides: 2, cation: 'Ca', cationName: '칼슘' }, acid), saltName: (acid) => `${acid.anionName} 칼슘`, acidCoefficient: 2 },
  MgCO3: { name: '탄산 마그네슘', saltFormula: (acid) => saltFormula({ formula: '', name: '', hydroxides: 2, cation: 'Mg', cationName: '마그네슘' }, acid), saltName: (acid) => `${acid.anionName} 마그네슘`, acidCoefficient: 2 },
  Na2CO3: { name: '탄산 나트륨', saltFormula: (acid) => saltFormula(bases.NaOH, acid), saltName: (acid) => `${acid.anionName} 나트륨`, acidCoefficient: 2 },
  K2CO3: { name: '탄산 칼륨', saltFormula: (acid) => saltFormula(bases.KOH, acid), saltName: (acid) => `${acid.anionName} 칼륨`, acidCoefficient: 2 },
  NaHCO3: { name: '탄산수소 나트륨', saltFormula: (acid) => saltFormula(bases.NaOH, acid), saltName: (acid) => `${acid.anionName} 나트륨`, acidCoefficient: 1 },
};

function carbonateAcid(materials: RuleMaterial[]) {
  const carbonateMaterial = materials.find((item) => carbonateProfiles[item.normalizedFormula]);
  const acidMaterial = materials.find((item) => acids[item.normalizedFormula]);
  if (!carbonateMaterial || !acidMaterial) return null;
  const carbonate = carbonateProfiles[carbonateMaterial.normalizedFormula];
  const acid = acids[acidMaterial.normalizedFormula];
  const acidCoefficient = carbonate.acidCoefficient / acid.protons;
  if (!Number.isInteger(acidCoefficient)) return null;
  const salt = carbonate.saltFormula(acid);
  return makeRule('carbonate-acid', `${carbonate.name}–${acid.name} 반응`, `${carbonateMaterial.formula} + ${coefficient(acidCoefficient)}${acid.formula} → ${salt} + CO₂↑ + H₂O`, 'gas', [carbonateMaterial, acidMaterial], [1, acidCoefficient], [product('rule-salt', carbonate.saltName(acid), salt, 1, estimateMolarMass(salt)), product('co2', '이산화 탄소', 'CO₂', 1, 44.01, '기체 생성물'), product('h2o', '물', 'H₂O', 1, 18.015)], '이산화 탄소 기체가 발생하여 활발한 기포가 보일 수 있습니다.', '기체 발생', '산이 충분하고 완전 반응한다고 가정합니다.');
}

const ammoniumSalts: Record<string, { name: string; saltWith: Record<string, { formula: string; name: string }>; coefficient: number }> = {
  NH4Cl: { name: '염화 암모늄', coefficient: 1, saltWith: { NaOH: { formula: 'NaCl', name: '염화 나트륨' }, KOH: { formula: 'KCl', name: '염화 칼륨' } } },
  NH4NO3: { name: '질산 암모늄', coefficient: 1, saltWith: { NaOH: { formula: 'NaNO₃', name: '질산 나트륨' }, KOH: { formula: 'KNO₃', name: '질산 칼륨' } } },
  '(NH4)2SO4': { name: '황산 암모늄', coefficient: 2, saltWith: { NaOH: { formula: 'Na₂SO₄', name: '황산 나트륨' }, KOH: { formula: 'K₂SO₄', name: '황산 칼륨' } } },
};

function ammoniumBase(materials: RuleMaterial[]) {
  const ammonium = materials.find((item) => ammoniumSalts[item.normalizedFormula]);
  const base = materials.find((item) => ['NaOH', 'KOH'].includes(item.normalizedFormula));
  if (!ammonium || !base) return null;
  const profile = ammoniumSalts[ammonium.normalizedFormula];
  const salt = profile.saltWith[base.normalizedFormula];
  if (!salt) return null;
  const count = profile.coefficient;
  return makeRule('ammonium-base', `${profile.name}–${bases[base.normalizedFormula].name} 반응`, `${ammonium.formula} + ${coefficient(count)}${base.formula} → ${salt.formula} + ${coefficient(count)}NH₃↑ + ${coefficient(count)}H₂O`, 'gas', [ammonium, base], [1, count], [product('rule-salt', salt.name, salt.formula, 1, estimateMolarMass(salt.formula)), product('nh3', '암모니아', 'NH₃', count, 17.031, '자극성 기체'), product('h2o', '물', 'H₂O', count, 18.015)], '자극성 냄새가 나는 암모니아 기체 발생이 예상됩니다.', '기체 발생', '실제 실험은 반드시 환기 시설에서 진행해야 합니다.');
}

const precipitationRules = [
  ['AgNO3', 'NaCl', 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', '염화 은', 'AgCl', 143.32, '흰색'],
  ['AgNO3', 'KCl', 'AgNO₃ + KCl → AgCl↓ + KNO₃', '염화 은', 'AgCl', 143.32, '흰색'],
  ['AgNO3', 'KI', 'AgNO₃ + KI → AgI↓ + KNO₃', '아이오딘화 은', 'AgI', 234.77, '노란색'],
  ['BaCl2', 'Na2SO4', 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl', '황산 바륨', 'BaSO₄', 233.39, '흰색'],
  ['BaCl2', 'H2SO4', 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl', '황산 바륨', 'BaSO₄', 233.39, '흰색'],
  ['CaCl2', 'Na2CO3', 'CaCl₂ + Na₂CO₃ → CaCO₃↓ + 2NaCl', '탄산 칼슘', 'CaCO₃', 100.09, '흰색'],
  ['Pb(NO3)2', 'KI', 'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃', '아이오딘화 납(Ⅱ)', 'PbI₂', 461.01, '노란색'],
  ['CuSO4', 'NaOH', 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', '수산화 구리(Ⅱ)', 'Cu(OH)₂', 97.56, '푸른색'],
  ['FeCl3', 'NaOH', 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl', '수산화 철(Ⅲ)', 'Fe(OH)₃', 106.87, '적갈색'],
] as const;

function precipitation(materials: RuleMaterial[]) {
  for (const [left, right, equation, name, formula, mass, color] of precipitationRules) {
    const first = materials.find((item) => item.normalizedFormula === left);
    const second = materials.find((item) => item.normalizedFormula === right);
    if (!first || !second) continue;
    const leftCoefficient = Number(equation.match(new RegExp(`(\\d*)${left.replace(/[()]/g, '\\$&')}`))?.[1] || 1);
    const rightCoefficient = Number(equation.split('+')[1]?.trim().match(/^(\d*)/)?.[1] || 1);
    return makeRule('solubility', `${name} 침전 반응`, equation, 'precipitate', [first, second], [leftCoefficient, rightCoefficient], [product('rule-precipitate', name, formula, 1, mass, `${color} 침전`, 'g')], `${color} ${name} 침전 생성이 예상됩니다.`, '침전', '대표적인 수용액 용해도 규칙을 적용했습니다.');
  }
  return null;
}

const displacementRules = [
  ['Zn', 'CuSO4', 'Zn + CuSO₄ → ZnSO₄ + Cu', '아연의 구리 치환', '구리', 'Cu', 63.55],
  ['Fe', 'CuSO4', 'Fe + CuSO₄ → FeSO₄ + Cu', '철의 구리 치환', '구리', 'Cu', 63.55],
  ['Mg', 'CuSO4', 'Mg + CuSO₄ → MgSO₄ + Cu', '마그네슘의 구리 치환', '구리', 'Cu', 63.55],
  ['Cu', 'AgNO3', 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag', '구리의 은 치환', '은', 'Ag', 107.87],
  ['Zn', 'AgNO3', 'Zn + 2AgNO₃ → Zn(NO₃)₂ + 2Ag', '아연의 은 치환', '은', 'Ag', 107.87],
] as const;

function displacement(materials: RuleMaterial[]) {
  for (const [metalFormula, saltFormulaValue, equation, title, productName, productFormula, mass] of displacementRules) {
    const metal = materials.find((item) => item.normalizedFormula === metalFormula);
    const salt = materials.find((item) => item.normalizedFormula === saltFormulaValue);
    if (!metal || !salt) continue;
    const saltCoefficient = equation.includes('2AgNO') ? 2 : 1;
    const productCoefficient = equation.endsWith('2Ag') ? 2 : 1;
    return makeRule('displacement', `${title} 반응`, equation, 'none', [metal, salt], [1, saltCoefficient], [product('rule-metal', productName, productFormula, productCoefficient, mass, '석출 금속', 'g')], '금속 표면에 다른 금속이 석출되고 용액의 색이 변할 수 있습니다.', '산화·환원', '금속 활동도 서열에 따른 단일 치환 규칙입니다.');
  }
  return null;
}

const combustibleCids = new Set([180, 702, 887, 5793, 5988]);

function combustion(materials: RuleMaterial[]) {
  const oxygen = materials.find((item) => item.normalizedFormula === 'O2');
  const fuel = materials.find((item) => combustibleCids.has(item.pubchemCid ?? -1) || ['CH4O', 'C2H6O', 'C3H6O', 'C6H12O6', 'C12H22O11'].includes(item.normalizedFormula));
  if (!oxygen || !fuel) return null;
  const counts = Object.fromEntries([...fuel.normalizedFormula.matchAll(/([A-Z][a-z]?)(\d*)/g)].map((match) => [match[1], Number(match[2] || 1)]));
  if (!counts.C || !counts.H || Object.keys(counts).some((element) => !['C', 'H', 'O'].includes(element))) return null;
  const productOxygen = counts.C * 2 + counts.H / 2;
  const oxygenCoefficientRaw = (productOxygen - (counts.O ?? 0)) / 2;
  const multiplier = Number.isInteger(oxygenCoefficientRaw) ? 1 : 2;
  const fuelCoefficient = multiplier;
  const oxygenCoefficient = oxygenCoefficientRaw * multiplier;
  const carbonDioxideCoefficient = counts.C * multiplier;
  const waterCoefficient = counts.H / 2 * multiplier;
  return makeRule('combustion', `${fuel.name} 완전 연소`, `${coefficient(fuelCoefficient)}${fuel.formula} + ${coefficient(oxygenCoefficient)}O₂ → ${coefficient(carbonDioxideCoefficient)}CO₂ + ${coefficient(waterCoefficient)}H₂O`, 'gas', [fuel, oxygen], [fuelCoefficient, oxygenCoefficient], [product('co2', '이산화 탄소', 'CO₂', carbonDioxideCoefficient, 44.01, '기체 생성물'), product('h2o', '물', 'H₂O', waterCoefficient, 18.015)], '완전 연소로 이산화 탄소와 물이 생성되며 열이 발생합니다.', '산화·환원', '점화원과 충분한 산소가 있는 완전 연소를 가정합니다.', { minTemperature: 100 });
}

function decomposition(materials: RuleMaterial[]) {
  const peroxide = materials.find((item) => item.normalizedFormula === 'H2O2');
  if (peroxide) return makeRule('peroxide-decomposition', '과산화 수소 분해', '2H₂O₂ → 2H₂O + O₂↑', 'gas', [peroxide], [2], [product('h2o', '물', 'H₂O', 2, 18.015), product('o2', '산소', 'O₂', 1, 32, '기체 생성물')], '산소 기체 발생으로 기포가 보일 수 있습니다.', '분해', '촉매·농도·빛에 따라 속도가 크게 달라집니다.');
  const bicarbonate = materials.find((item) => item.normalizedFormula === 'NaHCO3');
  if (bicarbonate) return makeRule('bicarbonate-decomposition', '탄산수소 나트륨 열분해', '2NaHCO₃ → Na₂CO₃ + CO₂↑ + H₂O', 'gas', [bicarbonate], [2], [product('na2co3', '탄산 나트륨', 'Na₂CO₃', 1, 105.99), product('co2', '이산화 탄소', 'CO₂', 1, 44.01, '기체 생성물'), product('h2o', '물', 'H₂O', 1, 18.015)], '가열하면 이산화 탄소와 수증기가 발생합니다.', '분해', '가열이 필요한 규칙입니다.', { minTemperature: 80 });
  return null;
}

function coefficient(value: number) {
  return value === 1 ? '' : String(value);
}

export function inferRuleReaction(materials: AddedSubstance[]): ReactionDefinition | null {
  const prepared: RuleMaterial[] = materials.map((material) => ({ ...material, canonicalId: canonicalSubstanceId(material), normalizedFormula: normalizeFormula(material.formula) }));
  return neutralization(prepared)
    ?? carbonateAcid(prepared)
    ?? ammoniumBase(prepared)
    ?? precipitation(prepared)
    ?? metalAcid(prepared)
    ?? displacement(prepared)
    ?? combustion(prepared)
    ?? decomposition(prepared);
}
