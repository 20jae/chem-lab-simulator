import type { ReactionResult } from '@/components/reaction-dialog';

export type ReactionVisual = {
  liquid: string;
  initial: string;
  final: string;
  precipitate?: string;
  precipitateLabel?: string;
  deposit?: string;
  depositLabel?: string;
};

export function getReactionVisual(result: ReactionResult | null): ReactionVisual {
  if (!result) return { liquid: 'rgba(56,189,248,.28)', initial: '반응 전', final: '연한 청색 용액' };
  const text = `${result.title} ${result.equation ?? ''} ${result.observation} ${result.products.map((item) => `${item.formula} ${item.role}`).join(' ')}`;
  if (/PbI|아이오딘화 납|노란색 침전/.test(text)) return { liquid: 'rgba(254,240,138,.48)', initial: '무색 용액', final: '노란색 침전 생성', precipitate: '#eab308', precipitateLabel: '노란색 PbI₂ 침전' };
  if (/Fe\(OH\)|수산화 철|적갈색 침전/.test(text)) return { liquid: 'rgba(251,191,36,.24)', initial: '황갈색 용액', final: '적갈색 침전 생성', precipitate: '#9a3412', precipitateLabel: '적갈색 Fe(OH)₃ 침전' };
  if (/Cu\(OH\)|수산화 구리|푸른색 침전/.test(text)) return { liquid: 'rgba(56,189,248,.38)', initial: '푸른색 용액', final: '푸른색 침전 생성', precipitate: '#0284c7', precipitateLabel: '푸른색 Cu(OH)₂ 침전' };
  if (/AgCl|BaSO|CaCO|염화 은|황산 바륨|탄산 칼슘|흰색 침전/.test(text)) return { liquid: 'rgba(224,242,254,.34)', initial: '무색 용액', final: '흰색 침전 생성', precipitate: '#e5e7eb', precipitateLabel: '흰색 침전' };
  if (/Fe \+ CuSO|철–황산 구리|철의 구리 치환/.test(text)) return { liquid: 'rgba(134,239,172,.4)', initial: '푸른색 CuSO₄ 용액', final: '연한 녹색 FeSO₄ 용액', deposit: '#b45309', depositLabel: '적갈색 구리 석출' };
  if (/Cu \+ 2AgNO|구리–질산 은|구리의 은 치환/.test(text)) return { liquid: 'rgba(56,189,248,.42)', initial: '무색 AgNO₃ 용액', final: '푸른색 Cu(NO₃)₂ 용액', deposit: '#d1d5db', depositLabel: '은색 결정 석출' };
  if (result.effect === 'gas') return { liquid: 'rgba(186,230,253,.28)', initial: '반응물 혼합', final: '기체 발생', depositLabel: '기포 발생' };
  if (result.effect === 'neutralization') return { liquid: 'rgba(103,232,249,.3)', initial: '산성·염기성 용액', final: '중화된 무색 용액' };
  if (result.effect === 'dissolution') return { liquid: 'rgba(125,211,252,.3)', initial: '고체 + 용매', final: '균일한 용액' };
  return { liquid: 'rgba(56,189,248,.25)', initial: '반응 전', final: result.kind === 'reaction' ? '반응 완료' : '뚜렷한 변화 없음' };
}
