'use client';

import { useEffect, useMemo, useState } from 'react';
import { Beaker, BookOpen, ExternalLink, LoaderCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { searchPubChem, substances, type Substance } from '@/lib/chemistry';

const filters = ['전체', '고체', '액체', '수용액', '기체'] as const;

export function MaterialCatalogDialog({ substancesData = substances }: { substancesData?: Substance[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('전체');
  const [selectedId, setSelectedId] = useState(substancesData[0]?.id ?? 'nacl');
  const [remoteResults, setRemoteResults] = useState<Substance[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const term = query.trim();
    if (term.length < 2) return () => controller.abort();
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      searchPubChem(term, controller.signal).then(setRemoteResults).catch(() => setRemoteResults([])).finally(() => setIsSearching(false));
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const local = substancesData.filter((item) => (!term || `${item.name} ${item.formula} ${item.description}`.toLowerCase().includes(term)) && (filter === '전체' || item.state === filter));
    const remote = query.trim().length >= 2 ? remoteResults.filter((item) => !local.some((localItem) => localItem.pubchemCid === item.pubchemCid) && filter === '전체') : [];
    return [...local, ...remote];
  }, [filter, query, remoteResults, substancesData]);
  const selected = results.find((item) => item.id === selectedId) ?? results[0] ?? substancesData[0];

  return <Dialog>
    <DialogTrigger render={<Button aria-label="화학물질 도감 열기" variant="outline" className="h-11 self-start rounded-xl px-4 md:self-auto" />}><BookOpen data-icon="inline-start" /> 물질 도감</DialogTrigger>
    <DialogContent className="flex max-h-[92vh] w-[min(1120px,calc(100%-24px))] max-w-none flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-none">
      <DialogHeader className="border-b bg-white px-6 py-5 pr-14"><DialogTitle className="text-2xl font-bold">화학물질 도감</DialogTitle><DialogDescription className="text-base">물질의 성질과 출처를 살펴보는 정보 전용 화면입니다. 실험 투입은 ‘물질 추가’에서 진행하세요.</DialogDescription></DialogHeader>
      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.05fr_.95fr]">
        <section className="border-b p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="물질명·화학식·특징 검색" aria-label="도감 물질 검색" className="h-12 rounded-xl bg-white pl-11 text-base" /></div>
          <div className="mt-3 flex flex-wrap gap-2">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === item ? 'bg-primary text-primary-foreground' : 'border bg-white text-muted-foreground hover:border-primary/40'}`}>{item}</button>)}</div>
          <div className="mb-2 mt-5 flex items-center justify-between text-sm"><span className="font-bold">도감 목록</span><span className="flex items-center gap-2 text-muted-foreground">{isSearching && <LoaderCircle className="size-3.5 animate-spin" />}{results.length}종</span></div>
          <div className="grid max-h-[470px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{results.map((item) => <button key={item.id} type="button" aria-label={`${item.name} 상세 정보 보기`} onClick={() => setSelectedId(item.id)} className={`rounded-xl border p-3 text-left transition-all ${selected?.id === item.id ? 'border-primary bg-primary/7 shadow-sm' : 'bg-white hover:border-primary/30'}`}><div className="flex items-center gap-3"><span className={`size-9 rounded-xl ${item.accent}`} /><span className="min-w-0"><span className="block truncate font-bold">{item.name}</span><span className="text-xs text-muted-foreground">{item.formula} · {item.state}</span></span></div></button>)}</div>
        </section>
        {selected && <section className="bg-[#f3fbf9] p-5 sm:p-7"><div className="flex items-start gap-4"><div className={`grid size-16 shrink-0 place-items-center rounded-2xl ${selected.accent} text-white shadow-sm`}><Beaker className="size-8" /></div><div className="min-w-0"><p className="text-xs font-bold tracking-wider text-primary">SUBSTANCE PROFILE</p><h2 className="mt-1 text-2xl font-bold">{selected.name}</h2><p className="mt-1 font-mono text-lg font-semibold text-[#287c75]">{selected.formula}</p></div></div>
          <dl className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border bg-white p-4"><dt className="text-xs font-semibold text-muted-foreground">물질 상태</dt><dd className="mt-1 text-lg font-bold">{selected.state}</dd></div><div className="rounded-xl border bg-white p-4"><dt className="text-xs font-semibold text-muted-foreground">몰 질량</dt><dd className="mt-1 text-lg font-bold">{selected.molarMass.toFixed(2)} g/mol</dd></div><div className="rounded-xl border bg-white p-4"><dt className="text-xs font-semibold text-muted-foreground">밀도</dt><dd className="mt-1 text-lg font-bold">{selected.density ? `${selected.density} g/mL` : '정보 없음'}</dd></div><div className="rounded-xl border bg-white p-4"><dt className="text-xs font-semibold text-muted-foreground">데이터 출처</dt><dd className="mt-1 text-lg font-bold">{selected.source === 'pubchem' ? 'PubChem' : selected.source === 'supabase' ? 'Supabase' : '교육용 선별'}</dd></div></dl>
          <div className="mt-4 rounded-xl border bg-white p-5"><h3 className="font-bold">기본 정보</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{selected.description}</p></div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-800">안전 안내</p><p className="mt-1 text-sm leading-6 text-amber-900/75">실제 취급 시에는 제품 라벨과 최신 SDS를 확인하고 보호구·환기·폐기 지침을 따라야 합니다.</p></div>
          {(selected.sourceUrl || selected.pubchemCid) && <a href={selected.sourceUrl ?? `https://pubchem.ncbi.nlm.nih.gov/compound/${selected.pubchemCid}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">PubChem 원문 확인 <ExternalLink className="size-4" /></a>}
        </section>}
      </div>
    </DialogContent>
  </Dialog>;
}
