/**
 * 정렬 가이드 계산 (L2에서 실제 인식과 함께 사용).
 * 피사체의 추정 중심(px,py)·반경(pr)과 타겟 원(cx,cy,r)을 비교해
 * fit 점수와 상태를 낸다. M1에서는 인식이 없으므로 사용하지 않지만,
 * L2에서 그대로 재사용하기 위해 미리 정의해 둔다.
 */
export type FitState = 'idle' | 'near' | 'good';

export interface Subject {
  px: number;
  py: number;
  pr: number;
}

export interface Circle {
  cx: number;
  cy: number;
  r: number;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export interface FitResult {
  score: number; // 0~1
  state: FitState;
  /** 피사체 쪽으로 원을 옮길 방향(단위벡터). good이면 (0,0) */
  dir: { x: number; y: number };
  /** true면 원을 키워야(가까이), false면 줄여야(멀리) */
  grow: boolean;
}

export function computeFit(
  c: Circle,
  s: Subject,
  w: { center: number; size: number } = { center: 0.6, size: 0.4 },
): FitResult {
  const dx = s.px - c.cx;
  const dy = s.py - c.cy;
  const dist = Math.hypot(dx, dy);
  const centerErr = dist / c.r;
  const sizeErr = Math.abs(s.pr - c.r) / c.r;
  const score = clamp(1 - (w.center * centerErr + w.size * sizeErr), 0, 1);

  let state: FitState = 'idle';
  if (score >= 0.9) state = 'good';
  else if (score >= 0.6) state = 'near';

  const len = dist || 1;
  return {
    score,
    state,
    dir: state === 'good' ? { x: 0, y: 0 } : { x: dx / len, y: dy / len },
    grow: s.pr > c.r,
  };
}
