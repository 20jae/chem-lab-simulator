'use client';

import { useEffect, useMemo, useState } from 'react';
import { Beaker, Check, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Substance = { id: string; name: string; formula: string; state: string; molarMass: string; description: string; accent: string };
type AddedSubstance = Substance & { amount: string; unit: string; rowId: number };

const substances: Substance[] = [
  { id: 'nacl', name: '염화 나트륨', formula: 'NaCl', state: '고체', molarMass: '58.44 g/mol', description: '물에 잘 녹는 흰색 결정성 고체', accent: 'bg-cyan-400' },
  { id: 'h2o', name: '증류수', formula: 'H₂O', state: '액체', molarMass: '18.02 g/mol', description: '불순물을 제거한 무색의 액체', accent: 'bg-blue-400' },
  { id: 'hcl', name: '염산', formula: 'HCl', state: '수용액', molarMass: '36.46 g/mol', description: '염화 수소가 물에 녹은 산성 용액', accent: 'bg-amber-400' },
  { id: 'naoh', name: '수산화 나트륨', formula: 'NaOH', state: '고체', molarMass: '40.00 g/mol', description: '강한 염기성을 띠는 흰색 고체', accent: 'bg-emerald-400' },
  { id: 'cuso4', name: '황산 구리(Ⅱ)', formula: 'CuSO₄', state: '고체', molarMass: '159.61 g/mol', description: '푸른색을 띠는 결정성 물질', accent: 'bg-indigo-400' },
];

export function MaterialDialog({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('nacl');
  const [amount, setAmount] = useState('10');
  const [unit, setUnit] = useState('g');
  const [added, setAdded] = useState<AddedSubstance[]>([
    { ...substances[1], amount: '100', unit: 'mL', rowId: 1 },
    { ...substances[0], amount: '5', unit: 'g', rowId: 2 },
  ]);
  const selected = substances.find((item) => item.id === selectedId) ?? substances[0];
  const allowedUnits = selected.state === '고체' ? ['g', 'mg', 'mol'] : ['g', 'mg', 'mL', 'mol'];

  useEffect(() => {
    if (!allowedUnits.includes(unit)) setUnit(allowedUnits[0]);
  }, [allowedUnits, unit]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? substances.filter((item) => `${item.name} ${item.formula}`.toLowerCase().includes(term)) : substances;
  }, [query]);

  const addSubstance = () => {
    if (!amount || Number(amount) <= 0) return;
    setAdded((current) => [...current, { ...selected, amount, unit, rowId: Date.now() }]);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={compact
          ? <button type="button" className="flex h-11 w-full items-center gap-3 rounded-xl border bg-background px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40" />
          : <button type="button" className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed bg-background px-3 text-sm font-semibold text-primary transition-colors hover:bg-muted" />}
      >
        {compact ? <><Search className="size-4" /> 물질명 또는 화학식 검색</> : <><Plus className="size-4" /> 물질 추가</>}
      </DialogTrigger>

      <DialogContent className="flex max-h-[92vh] w-[min(1180px,calc(100%-24px))] max-w-none flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-none" showCloseButton>
        <DialogHeader className="border-b bg-white px-6 py-5 pr-14">
          <DialogTitle className="text-2xl font-bold tracking-tight">물질 넣기</DialogTitle>
          <DialogDescription className="text-base">물질을 검색하고 투입량을 설정한 뒤 실험에 추가하세요.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
            <section className="rounded-2xl border bg-white p-4 sm:p-5">
              <h2 className="text-lg font-bold">물질 검색</h2>
              <div className="relative mt-3"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 염화 나트륨 또는 NaCl" aria-label="물질 검색" className="h-12 rounded-xl bg-background pl-11 pr-4 text-base" /></div>
              <div className="mb-2 mt-4 flex justify-between text-sm"><span className="font-semibold">검색 결과</span><span className="text-muted-foreground">{filtered.length}개</span></div>
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {filtered.map((item) => {
                  const active = item.id === selected.id;
                  return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${active ? 'border-primary bg-primary/7' : 'border-transparent bg-muted/45 hover:border-primary/25'}`}><span className={`size-10 shrink-0 rounded-xl ${item.accent} shadow-inner`} /><span className="min-w-0 flex-1"><span className="block text-base font-semibold">{item.name}</span><span className="text-sm text-muted-foreground">{item.formula} · {item.state}</span></span><span className={`grid size-7 place-items-center rounded-full ${active ? 'bg-primary text-white' : 'border bg-white text-transparent'}`}><Check className="size-4" /></span></button>;
                })}
                {filtered.length === 0 && <div className="rounded-xl border border-dashed py-9 text-center"><p className="font-semibold">검색 결과가 없습니다</p><p className="mt-1 text-sm text-muted-foreground">물질명이나 화학식을 다시 확인해 주세요.</p></div>}
              </div>
            </section>

            <section className="rounded-2xl border border-primary/15 bg-[#f3fbf9] p-4 sm:p-5">
              <h2 className="text-lg font-bold">선택한 물질</h2>
              <div className="mt-3 rounded-xl bg-white/85 p-4">
                <div className="flex items-center gap-3"><div className={`grid size-12 place-items-center rounded-xl ${selected.accent} text-white`}><Beaker className="size-6" /></div><div><p className="text-lg font-bold">{selected.name}</p><p className="font-semibold text-primary">{selected.formula}</p></div></div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-muted/70 p-3"><dt className="text-muted-foreground">몰 질량</dt><dd className="mt-1 font-bold">{selected.molarMass}</dd></div><div className="rounded-lg bg-muted/70 p-3"><dt className="text-muted-foreground">상태</dt><dd className="mt-1 font-bold">{selected.state}</dd></div></dl>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.description}</p>
              </div>
              <label htmlFor={`amount-${compact}`} className="mt-5 block text-sm font-semibold">투입량과 단위</label>
              <div className="mt-2 grid grid-cols-[1fr_110px] gap-2"><Input id={`amount-${compact}`} type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-12 rounded-xl bg-white px-4 text-base font-semibold" /><Select value={unit} onValueChange={(value) => value && setUnit(value)}><SelectTrigger className="h-12 w-full rounded-xl bg-white px-4 text-base"><SelectValue /></SelectTrigger><SelectContent>{allowedUnits.map((availableUnit) => <SelectItem key={availableUnit} value={availableUnit}>{availableUnit}</SelectItem>)}</SelectContent></Select></div>
              <Button onClick={addSubstance} disabled={!amount || Number(amount) <= 0} className="mt-4 h-12 w-full rounded-xl text-base font-bold"><Plus data-icon="inline-start" /> 현재 실험에 넣기</Button>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">현재 투입 물질</h2><p className="mt-1 text-sm text-muted-foreground">플라스크에 들어갈 물질 목록입니다.</p></div><span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground">총 {added.length}개</span></div>
            {added.length ? <div className="mt-3 divide-y">{added.map((item, index) => <div key={item.rowId} className="grid grid-cols-[32px_1fr_auto_40px] items-center gap-3 py-3"><span className="grid size-8 place-items-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">{index + 1}</span><div className="min-w-0"><p className="truncate text-base font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.formula}</p></div><p className="text-base font-bold text-[#275b56]">{item.amount} {item.unit}</p><button type="button" onClick={() => setAdded((current) => current.filter((row) => row.rowId !== item.rowId))} aria-label={`${item.name} 삭제`} className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="size-4" /></button></div>)}</div> : <div className="py-8 text-center text-sm text-muted-foreground">아직 투입한 물질이 없습니다.</div>}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
