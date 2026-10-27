'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, FlaskConical, Gauge, PackageCheck, Play, Scale, TestTube2, Thermometer, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { substances, type AddedSubstance, type LabConditions, toMoles } from '@/lib/chemistry';
import { reactionDatabase, type ReactionDefinition } from '@/lib/reaction-database';

export type ReactionResult = {
  kind: 'reaction' | 'none' | 'warning';
  effect: 'neutralization' | 'precipitate' | 'dissolution' | 'gas' | 'none';
  title: string;
  equation?: string;
  observation: string;
  calculation?: string;
  note?: string;
  products: ResultSpecies[];
  remainingReactants: ResultSpecies[];
  limitingReactant?: string;
};

export type ResultSpecies = {
  name: string;
  formula: string;
  amount: string;
  role?: string;
};

const emptyResultLists = { products: [], remainingReactants: [] };

function formatMoles(value: number) {
  if (value === 0) return '0 mol';
  if (value < 0.001) return `${value.toExponential(2)} mol`;
  return `${value.toFixed(4)} mol`;
}

function originalAmount(material: AddedSubstance): ResultSpecies {
  return { name: material.name, formula: material.formula, amount: `${material.amount} ${material.unit}`, role: '미반응 물질' };
}

function conditionWarning(reaction: ReactionDefinition, materials: AddedSubstance[], conditions: LabConditions): ReactionResult | null {
  if (reaction.minPh !== undefined && conditions.ph < reaction.minPh) return { kind: 'warning', effect: 'none', title: '반응 조건이 충분하지 않음', equation: reaction.equation, observation: `현재 pH ${conditions.ph}에서는 ${reaction.title}의 최소 pH ${reaction.minPh} 조건을 충족하지 않습니다.`, note: reaction.note, products: [], remainingReactants: materials.map(originalAmount) };
  if (reaction.maxPh !== undefined && conditions.ph > reaction.maxPh) return { kind: 'warning', effect: 'none', title: '반응 조건이 충분하지 않음', equation: reaction.equation, observation: `현재 pH ${conditions.ph}에서는 ${reaction.title}의 최대 pH ${reaction.maxPh} 조건을 벗어납니다.`, note: reaction.note, products: [], remainingReactants: materials.map(originalAmount) };
  return null;
}

function analyzeReaction(materials: AddedSubstance[], conditions: LabConditions): ReactionResult {
  if (conditions.temperature < -273.15 || conditions.pressure <= 0 || conditions.ph < 0 || conditions.ph > 14 || conditions.time < 0) {
    return { kind: 'warning', effect: 'none', title: '조건을 확인해 주세요', observation: '온도, 압력, pH 또는 반응 시간의 입력 범위를 벗어났습니다.', ...emptyResultLists };
  }

  const grouped = new Map<string, AddedSubstance[]>();
  materials.forEach((material) => grouped.set(material.id, [...(grouped.get(material.id) ?? []), material]));
  const moles = (id: string) => {
    const values = (grouped.get(id) ?? []).map(toMoles);
    return values.some((value) => value === null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  };

  const reaction = reactionDatabase.find((candidate) => candidate.reactants.every((reactant) => grouped.has(reactant.id)));
  if (!reaction) return { kind: 'none', effect: 'none', title: '등록된 반응 없음', observation: '현재 투입된 물질 조합과 일치하는 반응을 찾지 못했습니다. PubChem 물질 검색 결과도 반응 DB에 반응식이 등록되어 있어야 판정할 수 있습니다.', note: '반응 DB는 일반 실험 반응부터 단계적으로 확장 중입니다.', products: [], remainingReactants: materials.map(originalAmount) };

  const warning = conditionWarning(reaction, materials, conditions);
  if (warning) return warning;

  if (reaction.effect === 'dissolution') return { kind: 'none', effect: 'dissolution', title: reaction.title, equation: reaction.equation, observation: reaction.observation, note: reaction.note, products: reaction.products.map((product) => ({ name: product.name, formula: product.formula, amount: '수용액 내 분산', role: product.role ?? '용해 이온' })), remainingReactants: materials.filter((item) => item.id === 'h2o').map((item) => ({ ...originalAmount(item), role: '용매' })) };

  const extents = reaction.reactants.map((reactant) => {
    const value = moles(reactant.id);
    return value === null ? null : value / reactant.coefficient;
  });
  const canCalculate = extents.every((value) => value !== null && Number.isFinite(value));
  const extent = canCalculate ? Math.min(...(extents as number[])) : null;
  const limitingIndexes = extent === null ? [] : extents.map((value, index) => value !== null && Math.abs(value - extent) < 1e-10 ? index : -1).filter((index) => index >= 0);
  const remainingReactants = reaction.reactants.map((reactant) => {
    const material = grouped.get(reactant.id)![0];
    const total = moles(reactant.id);
    const remaining = extent === null || total === null ? null : Math.max(0, total - extent * reactant.coefficient);
    return { name: material.name, formula: material.formula, amount: remaining === null ? `${material.amount} ${material.unit}` : formatMoles(remaining), role: remaining === 0 ? '전량 반응' : '남은 반응물' };
  });
  const products = reaction.products.map((product) => {
    const productMoles = extent === null ? null : extent * product.coefficient;
    const amount = productMoles === null ? '생성량 계산 불가' : product.displayAs === 'g' ? `${(productMoles * product.molarMass).toFixed(3)} g` : formatMoles(productMoles);
    return { name: product.name, formula: product.formula, amount, role: product.role ?? '생성물' };
  });
  const limitingReactant = extent === null ? '투입 단위 또는 농도 정보 부족으로 판정 불가' : limitingIndexes.map((index) => {
    const id = reaction.reactants[index].id;
    return grouped.get(id)?.[0].formula ?? substances.find((item) => item.id === id)?.formula ?? id;
  }).join(' · ');

  return { kind: reaction.kind ?? 'reaction', effect: reaction.effect, title: reaction.title, equation: reaction.equation, observation: reaction.observation, calculation: extent === null ? '일부 물질을 몰로 환산할 수 없어 생성량 계산을 생략했습니다.' : `반응 진행량은 ${formatMoles(extent)}이며 반응식의 계수비를 적용했습니다.`, note: reaction.note, products, remainingReactants, limitingReactant };

}

export function ReactionDialog({ materials, conditions, onConditionsChange, onReactionComplete, trigger }: { materials: AddedSubstance[]; conditions: LabConditions; onConditionsChange: (conditions: LabConditions) => void; onReactionComplete?: (result: ReactionResult) => void; trigger: 'temperature' | 'pressure' | 'ph' | 'time' | 'start' }) {
  const [hasRun, setHasRun] = useState(false);
  const result = useMemo(() => analyzeReaction(materials, conditions), [materials, conditions]);
  const triggerMap: Record<Exclude<typeof trigger, 'start'>, { icon: ReactNode; label: string; value: string }> = {
    temperature: { icon: <Thermometer />, label: '온도', value: `${conditions.temperature} °C` },
    pressure: { icon: <Gauge />, label: '압력', value: `${conditions.pressure} atm` },
    ph: { icon: <TestTube2 />, label: 'pH', value: `${conditions.ph}` },
    time: { icon: <Timer />, label: '반응 시간', value: `${conditions.time} min` },
  };

  const update = (key: keyof LabConditions, value: string) => onConditionsChange({ ...conditions, [key]: Number(value) });

  return (
    <Dialog onOpenChange={(open) => !open && setHasRun(false)}>
      {trigger === 'start' ? (
        <DialogTrigger render={<Button className="mt-6 h-14 w-full rounded-xl bg-[#50d8c5] text-base font-bold text-[#123e39] shadow-[0_12px_30px_rgba(80,216,197,.2)] hover:bg-[#6ee5d4]" />}><Play data-icon="inline-start" /> 반응 시작</DialogTrigger>
      ) : (
        <DialogTrigger render={<button type="button" className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary/35" />}>
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">{triggerMap[trigger].icon}</span><span className="flex-1 text-sm font-semibold">{triggerMap[trigger].label}</span><span className="text-sm font-bold text-[#275b56]">{triggerMap[trigger].value}</span>
        </DialogTrigger>
      )}

      <DialogContent className="flex max-h-[92vh] w-[min(980px,calc(100%-24px))] max-w-none flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-none">
        <DialogHeader className="border-b bg-white px-6 py-5 pr-14"><DialogTitle className="text-2xl font-bold">{trigger === 'start' ? '반응 판정 및 계산' : '실험 조건 설정'}</DialogTitle><DialogDescription className="text-base">{trigger === 'start' ? '설정한 조건과 현재 투입 물질을 바탕으로 기본 반응을 확인하세요.' : '반응을 시작하기 전에 실험 환경을 설정하세요.'}</DialogDescription></DialogHeader>
        <div className="overflow-y-auto p-4 sm:p-6">
          {trigger === 'start' ? (
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ConditionSummary icon={<Thermometer />} label="온도" value={`${conditions.temperature} °C`} />
              <ConditionSummary icon={<Gauge />} label="압력" value={`${conditions.pressure} atm`} />
              <ConditionSummary icon={<TestTube2 />} label="pH" value={`${conditions.ph}`} />
              <ConditionSummary icon={<Timer />} label="시간" value={`${conditions.time} min`} />
            </section>
          ) : (
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ConditionInput icon={<Thermometer />} label="온도" unit="°C" value={conditions.temperature} min={-273.15} onChange={(value) => update('temperature', value)} />
              <ConditionInput icon={<Gauge />} label="압력" unit="atm" value={conditions.pressure} min={0.01} step={0.1} onChange={(value) => update('pressure', value)} />
              <ConditionInput icon={<TestTube2 />} label="pH" unit="pH" value={conditions.ph} min={0} max={14} step={0.1} onChange={(value) => update('ph', value)} />
              <ConditionInput icon={<Timer />} label="반응 시간" unit="min" value={conditions.time} min={0} onChange={(value) => update('time', value)} />
            </section>
          )}

          <section className="mt-5 rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold">현재 투입 물질</h2><p className="mt-1 text-sm text-muted-foreground">{materials.length ? materials.map((item) => `${item.formula} ${item.amount}${item.unit}`).join(' · ') : '투입된 물질이 없습니다.'}</p></div><FlaskConical className="size-7 shrink-0 text-primary" /></div>
          </section>

          {hasRun ? (
            <ResultView result={result} />
          ) : <div className="mt-4 rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">조건을 확인한 뒤 아래 버튼을 눌러 반응을 판정하세요.</div>}

          <Button onClick={() => { setHasRun(true); if (trigger === 'start') onReactionComplete?.(result); }} disabled={!materials.length} className="mt-4 h-13 w-full rounded-xl text-base font-bold"><Play data-icon="inline-start" /> 판정 및 계산 실행</Button>
          <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">현재 결과는 등록된 기본 규칙과 이상적인 화학량론을 이용한 교육용 예상값이며 실제 실험 결과를 보장하지 않습니다.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultView({ result }: { result: ReactionResult }) {
  return <section className="mt-4 space-y-4" aria-live="polite">
    <div className={`rounded-2xl border p-5 ${result.kind === 'reaction' ? 'border-primary/30 bg-primary/6' : result.kind === 'warning' ? 'border-amber-300 bg-amber-50' : 'bg-muted/45'}`}>
      <div className="flex items-start gap-3">{result.kind === 'reaction' ? <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-primary" /> : <AlertTriangle className="mt-0.5 size-6 shrink-0 text-amber-500" />}<div className="min-w-0 flex-1"><p className="text-xs font-bold tracking-wider text-muted-foreground">실험 결과</p><p className="mt-1 text-xl font-bold">{result.title}</p>{result.equation && <p className="mt-3 overflow-x-auto rounded-xl bg-white/90 px-4 py-3 font-mono text-base font-semibold">{result.equation}</p>}<p className="mt-3 leading-7">{result.observation}</p></div></div>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <ResultList title="생성물" icon={<PackageCheck />} items={result.products} emptyText="생성된 물질이 없습니다." tone="product" />
      <ResultList title="남은 반응물" icon={<Scale />} items={result.remainingReactants} emptyText="표시할 남은 반응물이 없습니다." tone="remaining" />
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border bg-white p-4"><p className="text-xs font-semibold text-muted-foreground">한계 반응물</p><p className="mt-1 font-bold text-[#275b56]">{result.limitingReactant ?? '해당 없음'}</p></div>
      <div className="rounded-xl border bg-white p-4"><p className="text-xs font-semibold text-muted-foreground">이론 계산</p><p className="mt-1 text-sm font-semibold leading-6 text-[#275b56]">{result.calculation ?? '추가 계산 결과가 없습니다.'}</p></div>
    </div>
    {result.note && <p className="rounded-xl bg-muted/55 px-4 py-3 text-sm leading-6 text-muted-foreground">※ {result.note}</p>}
  </section>;
}

function ResultList({ title, icon, items, emptyText, tone }: { title: string; icon: ReactNode; items: ResultSpecies[]; emptyText: string; tone: 'product' | 'remaining' }) {
  return <div className="rounded-2xl border bg-white p-4"><div className="flex items-center gap-2"><span className={`grid size-9 place-items-center rounded-lg ${tone === 'product' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-600'} [&_svg]:size-4`}>{icon}</span><h3 className="font-bold">{title}</h3><span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{items.length}종</span></div>{items.length ? <div className="mt-3 space-y-2">{items.map((item, index) => <div key={`${item.formula}-${index}`} className="flex items-center gap-3 rounded-xl bg-muted/45 p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{item.name} <span className="font-mono text-sm text-muted-foreground">{item.formula}</span></p><p className="mt-0.5 text-xs text-muted-foreground">{item.role}</p></div><p className="shrink-0 text-sm font-bold text-[#275b56]">{item.amount}</p></div>)}</div> : <p className="mt-3 rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">{emptyText}</p>}</div>;
}

function ConditionInput({ icon, label, unit, value, min, max, step = 1, onChange }: { icon: ReactNode; label: string; unit: string; value: number; min: number; max?: number; step?: number; onChange: (value: string) => void }) {
  return <label className="rounded-xl border bg-white p-3"><span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="text-primary [&_svg]:size-4">{icon}</span>{label}</span><span className="mt-2 flex items-center gap-2"><Input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} className="h-10 text-base font-bold" /><span className="min-w-8 text-sm font-semibold text-muted-foreground">{unit}</span></span></label>;
}

function ConditionSummary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border bg-white p-3"><span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="text-primary [&_svg]:size-4">{icon}</span>{label}</span><p className="mt-2 text-lg font-bold text-[#275b56]">{value}</p></div>;
}
