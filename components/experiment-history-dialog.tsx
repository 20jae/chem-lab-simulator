'use client';

import { useState } from 'react';
import { CalendarClock, Database, FlaskConical, LoaderCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { ReactionResult } from '@/components/reaction-dialog';
import type { AddedSubstance, LabConditions } from '@/lib/chemistry';
import { ensureAnonymousSession } from '@/lib/supabase-browser';

type ExperimentSnapshot = {
  materials?: AddedSubstance[];
  conditions?: LabConditions;
  apparatus?: string;
  result?: ReactionResult;
};

type ExperimentRecord = {
  id: string;
  title: string;
  result_equation: string | null;
  observation: string | null;
  result_snapshot: ExperimentSnapshot;
  created_at: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return fallback;
}

export function ExperimentHistoryDialog({ materials, conditions, result, apparatus }: { materials: AddedSubstance[]; conditions: LabConditions; result: ReactionResult | null; apparatus: string }) {
  const [records, setRecords] = useState<ExperimentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadRecords = async (clearMessage = true) => {
    setLoading(true);
    if (clearMessage) setMessage('');
    try {
      const client = await ensureAnonymousSession();
      const { data, error } = await client.from('experiments').select('id,title,result_equation,observation,result_snapshot,created_at').order('created_at', { ascending: false }).limit(30);
      if (error) throw error;
      setRecords((data ?? []) as ExperimentRecord[]);
    } catch (error) {
      setMessage(getErrorMessage(error, '실험 기록을 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!result) return;
    setSaving(true);
    setMessage('');
    try {
      const client = await ensureAnonymousSession();
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('저장할 익명 사용자 정보를 확인하지 못했습니다.');
      const { error } = await client.from('experiments').insert({
        user_id: userData.user.id,
        title: result.title.slice(0, 100),
        temperature_c: conditions.temperature,
        pressure_atm: conditions.pressure,
        ph: conditions.ph,
        reaction_time_min: conditions.time,
        result_equation: result.equation ?? null,
        observation: result.observation,
        result_snapshot: { materials, conditions, apparatus, result },
      });
      if (error) throw error;
      setMessage('현재 실험 결과를 Supabase에 저장했습니다.');
      await loadRecords(false);
    } catch (error) {
      setMessage(getErrorMessage(error, '실험 기록 저장에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  return <Dialog onOpenChange={(open) => open && void loadRecords(true)}>
    <DialogTrigger render={<Button variant="outline" className="h-11 rounded-xl px-4" />}><CalendarClock data-icon="inline-start" /> 실험 기록</DialogTrigger>
    <DialogContent className="flex max-h-[92vh] w-[min(900px,calc(100%-24px))] max-w-none flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-none">
      <DialogHeader className="border-b bg-white px-6 py-5 pr-14"><DialogTitle className="text-2xl font-bold">내 실험 기록</DialogTitle><DialogDescription className="text-base">이 브라우저의 익명 사용자 계정에 연결된 실험 결과를 Supabase에 저장하고 확인합니다.</DialogDescription></DialogHeader>
      <div className="overflow-y-auto p-4 sm:p-6">
        <section className="rounded-2xl border border-primary/20 bg-[#f3fbf9] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div><p className="flex items-center gap-2 font-bold"><Save className="size-4 text-primary" />현재 실험 저장</p><p className="mt-1 text-sm text-muted-foreground">{result ? `${result.title} · ${materials.length}개 물질` : '먼저 반응 판정 및 계산을 실행해 주세요.'}</p></div>
          <Button onClick={saveCurrentExperiment} disabled={!result || saving} className="mt-3 w-full rounded-xl sm:mt-0 sm:w-auto">{saving ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Database data-icon="inline-start" />}{saving ? '저장 중' : 'Supabase에 저장'}</Button>
        </section>
        {message && <p className={`mt-3 rounded-xl px-4 py-3 text-sm font-semibold ${message.includes('저장했습니다') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{message}</p>}
        <div className="mt-5 flex items-center justify-between"><h2 className="text-lg font-bold">최근 기록</h2><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{records.length}개</span></div>
        {loading ? <div className="grid min-h-48 place-items-center"><LoaderCircle className="size-7 animate-spin text-primary" /></div> : records.length ? <div className="mt-3 space-y-3">{records.map((record) => {
          const snapshot = record.result_snapshot ?? {};
          return <article key={record.id} className="rounded-2xl border bg-white p-4"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FlaskConical className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{record.title}</h3><time className="text-xs text-muted-foreground">{new Date(record.created_at).toLocaleString('ko-KR')}</time></div>{record.result_equation && <p className="mt-2 overflow-x-auto rounded-lg bg-muted/55 px-3 py-2 font-mono text-sm font-semibold">{record.result_equation}</p>}<p className="mt-2 text-sm leading-6 text-muted-foreground">{record.observation}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-secondary px-2.5 py-1">{snapshot.materials?.map((item) => item.formula).join(' + ') || '물질 정보 없음'}</span>{snapshot.conditions && <span className="rounded-full bg-muted px-2.5 py-1">{snapshot.conditions.temperature} °C · {snapshot.conditions.pressure} atm · pH {snapshot.conditions.ph}</span>}</div>{snapshot.result?.calculation && <p className="mt-3 whitespace-pre-line rounded-lg border px-3 py-2 text-xs leading-5 text-[#275b56]">{snapshot.result.calculation}</p>}</div></div></article>;
        })}</div> : <div className="mt-3 rounded-2xl border border-dashed py-12 text-center"><CalendarClock className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-semibold">저장된 실험 기록이 없습니다.</p><p className="mt-1 text-sm text-muted-foreground">반응을 실행한 뒤 현재 실험을 저장해 보세요.</p></div>}
      </div>
    </DialogContent>
  </Dialog>;
}

