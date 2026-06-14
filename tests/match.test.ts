import { computeFit } from '../src/lib/match';

describe('computeFit', () => {
  it('완벽 정렬 → good, 높은 점수', () => {
    const r = computeFit({ cx: 100, cy: 100, r: 50 }, { px: 100, py: 100, pr: 50 });
    expect(r.state).toBe('good');
    expect(r.score).toBeGreaterThan(0.95);
  });

  it('많이 벗어남 → idle, 점수 낮음', () => {
    const r = computeFit({ cx: 100, cy: 100, r: 50 }, { px: 300, py: 300, pr: 20 });
    expect(r.state).toBe('idle');
    expect(r.score).toBeLessThan(0.3);
  });

  it('피사체가 더 크면 grow=true (가까이/원 키우기)', () => {
    const r = computeFit({ cx: 100, cy: 100, r: 40 }, { px: 100, py: 100, pr: 80 });
    expect(r.grow).toBe(true);
  });

  it('방향 벡터는 피사체 쪽(오른쪽)을 가리킨다', () => {
    const r = computeFit({ cx: 100, cy: 100, r: 50 }, { px: 170, py: 100, pr: 50 });
    expect(r.dir.x).toBeGreaterThan(0);
    expect(Math.abs(r.dir.y)).toBeLessThan(0.2);
  });

  it('score는 0~1 범위로 클램프된다', () => {
    const r = computeFit({ cx: 0, cy: 0, r: 10 }, { px: 9999, py: 9999, pr: 9999 });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(1);
  });
});
