'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, FlaskConical, Gauge, Play, TestTube2, Thermometer, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type AddedSubstance, type LabConditions, toMoles } from '@/lib/chemistry';

type Result = {
  kind: 'reaction' | 'none' | 'warning';
  title: string;
  equation?: string;
  observation: string;
  calculation?: string;
  note?: string;
};

function analyzeReaction(materials: AddedSubstance[], conditions: LabConditions): Result {
  if (conditions.temperature < -273.15 || conditions.pressure <= 0 || conditions.ph < 0 || conditions.ph > 14 || conditions.time < 0) {
    return { kind: 'warning', title: '조건을 확인해 주세요', observation: '온도, 압력, pH 또는 반응 시간의 입력 범위를 벗어났습니다.' };
  }

  const grouped = new Map<string, AddedSubstance[]>();
  materials.forEach((material) => grouped.set(material.id, [...(grouped.get(material.id) ?? []), material]));
  const moles = (id: string) => {
    const values = (grouped.get(id) ?? []).map(toMoles);
    return values.some((value) => value === null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  };

  if (grouped.has('hcl') && grouped.has('naoh')) {
    const acid = moles('hcl');
    const base = moles('naoh');
    const reacted = acid === null || base === null ? null : Math.min(acid, base);
    return {
      kind: 'reaction',
      title: '산–염기 중화 반응 예상',
      equation: 'HCl + NaOH → NaCl + H₂O',
      observation: '발열과 함께 염화 나트륨 수용액과 물이 생성되는 반응입니다.',
      calculation: reacted === null ? '수용액의 농도 정보가 없어 생성량을 계산할 수 없습니다.' : `이론상 NaCl과 H₂O가 각각 약 ${reacted.toFixed(4)} mol 생성됩니다.`,
      note: `현재 설정 pH ${conditions.ph}, ${conditions.temperature} °C 기준의 단순 판정입니다.`,
    };
  }

  if (grouped.has('cuso4') && grouped.has('naoh')) {
    if (conditions.ph < 7) return { kind: 'warning', title: '침전 조건이 충분하지 않음', equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', observation: '현재 pH에서는 염기성 침전 조건이 충족되지 않은 것으로 판정했습니다.', note: '기본 규칙에서는 pH 7 이상을 침전 가능 조건으로 사용합니다.' };
    const copper = moles('cuso4');
    const base = moles('naoh');
    const reacted = copper === null || base === null ? null : Math.min(copper, base / 2);
    return {
      kind: 'reaction',
      title: '수산화 구리(Ⅱ) 침전 반응 예상',
      equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
      observation: '푸른색 수산화 구리(Ⅱ) 침전 생성이 예상됩니다.',
      calculation: reacted === null ? '입력 단위를 몰로 환산할 수 없어 생성량을 계산하지 않았습니다.' : `이론상 Cu(OH)₂ 약 ${(reacted * 97.56).toFixed(3)} g 생성이 가능합니다.`,
      note: '완전 반응과 순수 시약을 가정한 이론값입니다.',
    };
  }

  if (grouped.has('nacl') && grouped.has('h2o')) {
    return { kind: 'none', title: '용해 과정 예상', observation: '염화 나트륨이 물에 녹을 수 있지만, 현재 기본 규칙에서는 새로운 생성물이 생기는 화학 반응으로 판정하지 않습니다.', note: '용해도와 포화 여부 계산은 물질 DB 확장 후 추가할 수 있습니다.' };
  }

  return { kind: 'none', title: '등록된 기본 반응 없음', observation: '현재 입력된 물질 조합과 일치하는 기본 반응 규칙을 찾지 못했습니다.', note: '향후 화학반응 DB를 연결하면 판정 가능한 조합을 확장할 수 있습니다.' };
}

export function ReactionDialog({ materials, conditions, onConditionsChange, trigger }: { materials: AddedSubstance[]; conditions: LabConditions; onConditionsChange: (conditions: LabConditions) => void; trigger: 'temperature' | 'pressure' | 'ph' | 'time' | 'start' }) {
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
        <DialogHeader className="border-b bg-white px-6 py-5 pr-14"><DialogTitle className="text-2xl font-bold">실험 조건 및 반응 판정</DialogTitle><DialogDescription className="text-base">실험 환경을 설정하고 현재 투입 물질의 기본 반응을 확인하세요.</DialogDescription></DialogHeader>
        <div className="overflow-y-auto p-4 sm:p-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ConditionInput icon={<Thermometer />} label="온도" unit="°C" value={conditions.temperature} min={-273.15} onChange={(value) => update('temperature', value)} />
            <ConditionInput icon={<Gauge />} label="압력" unit="atm" value={conditions.pressure} min={0.01} step={0.1} onChange={(value) => update('pressure', value)} />
            <ConditionInput icon={<TestTube2 />} label="pH" unit="pH" value={conditions.ph} min={0} max={14} step={0.1} onChange={(value) => update('ph', value)} />
            <ConditionInput icon={<Timer />} label="반응 시간" unit="min" value={conditions.time} min={0} onChange={(value) => update('time', value)} />
          </section>

          <section className="mt-5 rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold">현재 투입 물질</h2><p className="mt-1 text-sm text-muted-foreground">{materials.length ? materials.map((item) => `${item.formula} ${item.amount}${item.unit}`).join(' · ') : '투입된 물질이 없습니다.'}</p></div><FlaskConical className="size-7 shrink-0 text-primary" /></div>
          </section>

          {hasRun ? (
            <section className={`mt-4 rounded-2xl border p-5 ${result.kind === 'reaction' ? 'border-primary/30 bg-primary/6' : result.kind === 'warning' ? 'border-amber-300 bg-amber-50' : 'bg-muted/45'}`}>
              <div className="flex items-start gap-3">{result.kind === 'reaction' ? <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-primary" /> : <AlertTriangle className="mt-0.5 size-6 shrink-0 text-amber-500" />}<div><p className="text-lg font-bold">{result.title}</p>{result.equation && <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 font-mono text-base font-semibold">{result.equation}</p>}<p className="mt-3 leading-7">{result.observation}</p>{result.calculation && <p className="mt-2 font-semibold text-[#275b56]">{result.calculation}</p>}{result.note && <p className="mt-3 text-sm text-muted-foreground">{result.note}</p>}</div></div>
            </section>
          ) : <div className="mt-4 rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">조건을 확인한 뒤 아래 버튼을 눌러 반응을 판정하세요.</div>}

          <Button onClick={() => setHasRun(true)} disabled={!materials.length} className="mt-4 h-13 w-full rounded-xl text-base font-bold"><Play data-icon="inline-start" /> 판정 및 계산 실행</Button>
          <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">현재 결과는 등록된 기본 규칙과 이상적인 화학량론을 이용한 교육용 예상값이며 실제 실험 결과를 보장하지 않습니다.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConditionInput({ icon, label, unit, value, min, max, step = 1, onChange }: { icon: ReactNode; label: string; unit: string; value: number; min: number; max?: number; step?: number; onChange: (value: string) => void }) {
  return <label className="rounded-xl border bg-white p-3"><span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="text-primary [&_svg]:size-4">{icon}</span>{label}</span><span className="mt-2 flex items-center gap-2"><Input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} className="h-10 text-base font-bold" /><span className="min-w-8 text-sm font-semibold text-muted-foreground">{unit}</span></span></label>;
}
