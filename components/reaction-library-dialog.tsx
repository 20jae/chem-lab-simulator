'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Database, Search, TestTubes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { reactionDatabase, type ReactionDefinition } from '@/lib/reaction-database';
import { substances, type AddedSubstance } from '@/lib/chemistry';

export function ReactionLibraryDialog({ onLoad }: { onLoad: (materials: AddedSubstance[]) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return reactionDatabase;
    return reactionDatabase.filter((reaction) => {
      const reactants = reaction.reactants.map((item) => substances.find((substance) => substance.id === item.id)?.name ?? item.id).join(' ');
      const products = reaction.products.map((item) => `${item.name} ${item.formula}`).join(' ');
      return [reaction.title, reaction.equation, reaction.category, reactants, products, ...(reaction.keywords ?? [])].join(' ').toLowerCase().includes(term);
    });
  }, [query]);

  const loadReaction = (reaction: ReactionDefinition) => {
    const now = Date.now();
    const materials = reaction.reactants.flatMap((reactant, index) => {
      const substance = substances.find((item) => item.id === reactant.id);
      return substance ? [{ ...substance, amount: String(reactant.coefficient * 0.1), unit: 'mol', rowId: now + index }] : [];
    });
    onLoad(materials);
    setOpen(false);
  };

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button variant="outline" className="h-11 rounded-xl bg-white px-4 font-bold" />}><Database data-icon="inline-start" /> 반응 DB 검색</DialogTrigger>
    <DialogContent className="flex max-h-[90vh] w-[min(920px,calc(100%-24px))] max-w-none flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-none">
      <DialogHeader className="border-b bg-white px-6 py-5 pr-14"><DialogTitle className="flex items-center gap-2 text-2xl font-bold"><BookOpen className="size-6 text-primary" /> 반응 데이터베이스</DialogTitle><DialogDescription className="text-base">반응명, 반응식, 반응물 또는 생성물로 검색하고 실험 조합을 바로 불러올 수 있습니다.</DialogDescription></DialogHeader>
      <div className="border-b bg-muted/35 px-4 py-4 sm:px-6"><div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 중화, HCl, 염화 은, 기체 발생" className="h-12 rounded-xl bg-white pl-11 text-base" /></div><p className="mt-2 text-xs text-muted-foreground">교육용 일반화학 반응 {reactionDatabase.length}건 · ORD 형식 확장을 고려한 정규화 구조</p></div>
      <div className="overflow-y-auto p-4 sm:p-6">
        {results.length ? <div className="grid gap-3 md:grid-cols-2">{results.map((reaction) => <article key={reaction.id} className="flex flex-col rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><TestTubes className="size-5" /></span><div className="min-w-0"><div className="flex flex-wrap gap-1.5"><span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">{reaction.category ?? '일반 반응'}</span><span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{reaction.source ?? '교육용 선별 DB'}</span></div><h3 className="mt-2 font-bold">{reaction.title}</h3></div></div><p className="mt-3 overflow-x-auto rounded-xl bg-muted/55 px-3 py-2.5 font-mono text-sm font-semibold">{reaction.equation}</p><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{reaction.observation}</p><Button onClick={() => loadReaction(reaction)} className="mt-4 h-10 w-full rounded-xl font-bold">이 조합으로 실험하기</Button></article>)}</div> : <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">일치하는 등록 반응이 없습니다.</div>}
      </div>
    </DialogContent>
  </Dialog>;
}
