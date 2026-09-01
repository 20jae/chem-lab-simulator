import { ArrowRight, BookOpen, ChevronDown, FlaskConical, Gauge, Plus, Search, Sparkles, Thermometer, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const substances = [
  { name: '염화 나트륨', formula: 'NaCl', color: 'bg-cyan-400' },
  { name: '증류수', formula: 'H₂O', color: 'bg-blue-400' },
  { name: '염산', formula: 'HCl', color: 'bg-amber-400' },
];

export default function Home() {
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
          <Button variant="outline" className="h-11 self-start rounded-xl px-4 md:self-auto"><BookOpen data-icon="inline-start" /> 물질 도감</Button>
        </div>

        <div className="lab-grid grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(380px,1.5fr)_minmax(270px,0.9fr)]">
          <Card className="border-0 bg-card/95 py-0 shadow-[0_18px_60px_rgba(23,62,55,.08)] ring-1 ring-border">
            <CardHeader className="border-b px-5 py-5">
              <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-primary">STEP 1</p><CardTitle className="mt-1 text-lg font-bold">물질 넣기</CardTitle></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">3개 선택</span></div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 py-5">
              <button className="flex h-11 w-full items-center gap-3 rounded-xl border bg-background px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40" type="button"><Search className="size-4" /> 물질명 또는 화학식 검색</button>
              <div className="space-y-2">
                {substances.map((item) => (
                  <button key={item.formula} className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/55 p-3 text-left transition-all hover:border-primary/25 hover:bg-primary/5" type="button">
                    <span className={`size-9 rounded-xl ${item.color} shadow-inner`} />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.name}</span><span className="block text-xs text-muted-foreground">{item.formula}</span></span>
                    <Plus className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </button>
                ))}
              </div>
              <Button variant="outline" className="h-11 w-full rounded-xl border-dashed text-primary"><Plus data-icon="inline-start" /> 물질 추가</Button>
            </CardContent>
          </Card>

          <Card className="relative min-h-[510px] border-0 bg-[#f3fbf9] py-0 shadow-[0_18px_60px_rgba(23,62,55,.08)] ring-1 ring-border">
            <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(45,212,191,.16),transparent_68%)]" />
            <CardHeader className="relative flex-row items-center justify-between px-6 py-5">
              <div><p className="text-xs font-semibold text-primary">REACTION VESSEL</p><CardTitle className="mt-1 text-lg font-bold">삼각 플라스크</CardTitle></div>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold hover:bg-white/70" type="button">기구 선택 <ChevronDown className="size-4" /></button>
            </CardHeader>
            <CardContent className="relative flex min-h-[400px] flex-col items-center justify-center px-6 pb-7">
              <div className="relative grid size-64 place-items-center rounded-full border border-white/80 bg-white/55 shadow-[inset_0_0_60px_rgba(45,212,191,.12),0_20px_50px_rgba(21,94,82,.08)] sm:size-72">
                <span className="absolute left-12 top-24 size-3 rounded-full bg-cyan-300/60" /><span className="absolute right-14 top-16 size-2 rounded-full bg-emerald-300/70" /><span className="absolute bottom-16 right-12 size-4 rounded-full bg-blue-300/45" />
                <FlaskConical className="size-44 text-[#38a8c8] drop-shadow-[0_18px_18px_rgba(14,116,144,.18)] sm:size-52" fill="rgba(56,189,248,.22)" strokeWidth={1.5} />
                <div className="absolute bottom-12 rounded-full border border-primary/15 bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#147a78] shadow-sm sm:bottom-14">총 150 mL</div>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">{substances.map((item) => <span key={item.formula} className="rounded-full border bg-white/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">{item.formula}</span>)}</div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="border-0 bg-card/95 py-0 shadow-[0_18px_60px_rgba(23,62,55,.08)] ring-1 ring-border">
              <CardHeader className="border-b px-5 py-5"><p className="text-xs font-semibold text-primary">STEP 2</p><CardTitle className="mt-1 text-lg font-bold">실험 조건</CardTitle></CardHeader>
              <CardContent className="space-y-3 px-5 py-5"><Condition icon={<Thermometer />} label="온도" value="25 °C" /><Condition icon={<Gauge />} label="압력" value="1 atm" /><Condition icon={<Timer />} label="반응 시간" value="10 min" /></CardContent>
            </Card>
            <Card className="flex-1 border-0 bg-[#173f3a] py-0 text-white shadow-[0_18px_60px_rgba(23,62,55,.18)] ring-0">
              <CardContent className="flex h-full min-h-48 flex-col justify-between px-5 py-5">
                <div><p className="text-xs font-semibold text-emerald-300">STEP 3</p><h2 className="mt-2 text-xl font-bold">실험 준비 완료</h2><p className="mt-2 text-sm leading-6 text-white/65">선택한 조건으로 반응을 시작할 수 있습니다.</p></div>
                <Button className="mt-6 h-14 w-full rounded-xl bg-[#50d8c5] text-base font-bold text-[#123e39] shadow-[0_12px_30px_rgba(80,216,197,.2)] hover:bg-[#6ee5d4]">반응 시작 <ArrowRight data-icon="inline-end" /></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function Condition({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <button type="button" className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary/35"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">{icon}</span><span className="flex-1 text-sm font-semibold">{label}</span><span className="text-sm font-bold text-[#275b56]">{value}</span><ChevronDown className="size-4 text-muted-foreground" /></button>;
}
