'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, FlaskConical, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialDialog } from '@/components/material-dialog';
import { ReactionDialog, type ReactionResult } from '@/components/reaction-dialog';
import { ReactionLibraryDialog } from '@/components/reaction-library-dialog';
import { initialMaterials, type AddedSubstance, type LabConditions } from '@/lib/chemistry';

export default function Home() {
  const [materials, setMaterials] = useState<AddedSubstance[]>(initialMaterials);
  const [conditions, setConditions] = useState<LabConditions>({ temperature: 25, pressure: 1, ph: 7, time: 10 });
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);
  const totalVolume = materials.filter((item) => item.unit === 'mL').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  useEffect(() => setReactionResult(null), [materials, conditions]);

  const flaskFill = reactionResult?.effect === 'precipitate' ? 'rgba(56,189,248,.42)' : reactionResult?.effect === 'neutralization' ? 'rgba(103,232,249,.32)' : reactionResult?.effect === 'dissolution' ? 'rgba(125,211,252,.26)' : 'rgba(56,189,248,.22)';

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(16,185,129,.22)]"><FlaskConical className="size-6" strokeWidth={2.2} /></div>
            <div><p className="text-lg font-bold tracking-tight">CHEM LAB</p><p className="text-xs font-medium text-muted-foreground">웹 화학실험실 시뮬레이터</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-medium text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.14)]" />안전 모드 활성화</div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" /> 가상 실험실 01</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">새로운 반응을 설계해 보세요</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">물질과 실험 조건을 선택한 뒤 중앙 플라스크에서 반응을 관찰할 수 있습니다.</p>
          </div>
          <div className="flex flex-wrap gap-2"><ReactionLibraryDialog onLoad={setMaterials} /><MaterialDialog catalog added={materials} onAddedChange={setMaterials} /></div>
        </div>

        <div className="lab-grid grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(380px,1.5fr)_minmax(270px,0.9fr)]">
          <Card className="border-0 bg-card/95 py-0 shadow-[0_18px_60px_rgba(23,62,55,.08)] ring-1 ring-border">
            <CardHeader className="border-b px-5 py-5">
              <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-primary">STEP 1</p><CardTitle className="mt-1 text-lg font-bold">물질 넣기</CardTitle></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{materials.length}개 투입</span></div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 py-5">
              <MaterialDialog compact added={materials} onAddedChange={setMaterials} />
              <div className="max-h-[232px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:var(--primary)_transparent] [scrollbar-width:thin]">
                {materials.map((item) => <div key={item.rowId} className="flex w-full items-center gap-3 rounded-xl bg-muted/55 p-3"><span className={`size-9 shrink-0 rounded-xl ${item.accent} shadow-inner`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.name}</span><span className="block text-xs text-muted-foreground">{item.formula}</span></span><span className="shrink-0 text-xs font-bold text-[#275b56]">{item.amount} {item.unit}</span></div>)}
                {!materials.length && <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">투입된 물질이 없습니다.</div>}
              </div>
              <MaterialDialog added={materials} onAddedChange={setMaterials} />
            </CardContent>
          </Card>

          <Card className="relative min-h-[510px] border-0 bg-[#f3fbf9] py-0 shadow-[0_18px_60px_rgba(23,62,55,.08)] ring-1 ring-border">
            <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(45,212,191,.16),transparent_68%)]" />
            <CardHeader className="relative flex-row items-center justify-between px-6 py-5">
              <div><p className="text-xs font-semibold text-primary">REACTION VESSEL</p><CardTitle className="mt-1 text-lg font-bold">삼각 플라스크</CardTitle></div>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold hover:bg-white/70" type="button">기구 선택 <ChevronDown className="size-4" /></button>
            </CardHeader>
            <CardContent className="relative flex min-h-[400px] flex-col items-center justify-center px-6 pb-7">
              <div className={`relative grid size-64 place-items-center overflow-hidden rounded-full border border-white/80 bg-white/55 shadow-[inset_0_0_60px_rgba(45,212,191,.12),0_20px_50px_rgba(21,94,82,.08)] sm:size-72 ${reactionResult?.effect === 'neutralization' ? 'reaction-warm-glow' : ''}`}>
                <span className="absolute left-12 top-24 size-3 rounded-full bg-cyan-300/60" /><span className="absolute right-14 top-16 size-2 rounded-full bg-emerald-300/70" /><span className="absolute bottom-16 right-12 size-4 rounded-full bg-blue-300/45" />
                <FlaskConical className="size-44 text-[#38a8c8] drop-shadow-[0_18px_18px_rgba(14,116,144,.18)] transition-all duration-700 sm:size-52" fill={flaskFill} strokeWidth={1.5} />
                {(reactionResult?.effect === 'neutralization' || reactionResult?.effect === 'gas') && <div aria-hidden="true" className="absolute inset-0"><span className="reaction-bubble left-[39%] bottom-[28%] size-2" /><span className="reaction-bubble left-[52%] bottom-[25%] size-3 [animation-delay:.45s]" /><span className="reaction-bubble left-[61%] bottom-[31%] size-1.5 [animation-delay:.9s]" />{reactionResult?.effect === 'gas' && <><span className="reaction-bubble left-[45%] bottom-[34%] size-3.5 [animation-delay:.2s]" /><span className="reaction-bubble left-[58%] bottom-[38%] size-2 [animation-delay:1.1s]" /></>}</div>}
                {reactionResult?.effect === 'precipitate' && <div aria-hidden="true" className="absolute bottom-[22%] left-1/2 flex w-28 -translate-x-1/2 flex-wrap items-end justify-center gap-1"><span className="size-3 rounded-full bg-sky-600/70" /><span className="size-2 rounded-full bg-blue-500/80" /><span className="size-4 rounded-full bg-cyan-600/65" /><span className="size-2.5 rounded-full bg-sky-700/75" /><span className="size-3 rounded-full bg-blue-600/70" /><span className="size-2 rounded-full bg-cyan-500/80" /><span className="size-3.5 rounded-full bg-sky-600/70" /></div>}
                {reactionResult?.effect === 'dissolution' && <div aria-hidden="true" className="absolute inset-0"><span className="reaction-dissolve left-[38%] top-[45%]" /><span className="reaction-dissolve left-[57%] top-[56%] [animation-delay:.7s]" /><span className="reaction-dissolve left-[48%] top-[65%] [animation-delay:1.2s]" /></div>}
                <div className="absolute bottom-12 rounded-full border border-primary/15 bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#147a78] shadow-sm sm:bottom-14">{totalVolume > 0 ? `액체 ${totalVolume} mL` : `${materials.length}개 물질`}</div>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">{materials.map((item) => <span key={item.rowId} className="rounded-full border bg-white/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">{item.formula}</span>)}</div>
              {reactionResult && <div className={`mt-4 w-full max-w-md rounded-xl border px-4 py-3 text-center ${reactionResult.kind === 'reaction' ? 'border-primary/25 bg-white/85' : 'bg-white/65'}`} aria-live="polite"><p className="text-sm font-bold text-[#275b56]">{reactionResult.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{reactionResult.observation}</p></div>}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="border-0 bg-card/95 py-0 shadow-[0_18px_60px_rgba(23,62,55,.08)] ring-1 ring-border">
              <CardHeader className="border-b px-5 py-5"><p className="text-xs font-semibold text-primary">STEP 2</p><CardTitle className="mt-1 text-lg font-bold">실험 조건</CardTitle></CardHeader>
              <CardContent className="space-y-3 px-5 py-5"><ReactionDialog trigger="temperature" materials={materials} conditions={conditions} onConditionsChange={setConditions} /><ReactionDialog trigger="pressure" materials={materials} conditions={conditions} onConditionsChange={setConditions} /><ReactionDialog trigger="ph" materials={materials} conditions={conditions} onConditionsChange={setConditions} /><ReactionDialog trigger="time" materials={materials} conditions={conditions} onConditionsChange={setConditions} /></CardContent>
            </Card>
            <Card className="flex-1 border-0 bg-[#173f3a] py-0 text-white shadow-[0_18px_60px_rgba(23,62,55,.18)] ring-0">
              <CardContent className="flex h-full min-h-48 flex-col justify-between px-5 py-5">
                <div><p className="text-xs font-semibold text-emerald-300">STEP 3</p><h2 className="mt-2 text-xl font-bold">{materials.length ? '실험 준비 완료' : '물질을 먼저 넣어 주세요'}</h2><p className="mt-2 text-sm leading-6 text-white/65">입력한 물질과 조건으로 기본 반응을 판정하고 생성량을 계산합니다.</p></div>
                <ReactionDialog trigger="start" materials={materials} conditions={conditions} onConditionsChange={setConditions} onReactionComplete={setReactionResult} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
