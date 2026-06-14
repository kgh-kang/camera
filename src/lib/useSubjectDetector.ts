import { useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';

/** 정규화([0..1]) 프레임 좌표계의 피사체 추정 */
export interface SubjectEstimate {
  nx: number;
  ny: number;
  nr: number;
}

const GRID = 48; // 다운샘플 해상도
const EVERY = 4; // N프레임마다 1회 처리(약 7~8fps)

/**
 * L2 피사체 검출기.
 * 카메라 프레임을 작은 그리드로 축소해, '대비(엣지)가 강한 영역'의 무게중심·퍼짐을
 * 구해 피사체의 정규화 중심·반경을 추정한다. 피사체가 무엇인지는 모르며 위치·크기만 낸다.
 *
 * ⚠️ 실기기 튜닝 포인트:
 *  - 프레임 방향(회전/미러)에 따라 nx/ny 매핑이 달라질 수 있어 ORIENT(아래 화면쪽)에서 보정.
 *  - GRID/EVERY/임계값은 성능·반응성 트레이드오프로 조정.
 *  - worklets-core/resize-plugin API는 설치된 버전에 맞춰 시그니처가 다를 수 있음.
 */
export function useSubjectDetector() {
  const subjectRef = useRef<SubjectEstimate | null>(null);
  const { resize } = useResizePlugin();
  const counter = useSharedValue(0);

  const setSubject = Worklets.createRunOnJS((s: SubjectEstimate | null) => {
    subjectRef.current = s;
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      counter.value = (counter.value + 1) % 1000000;
      if (counter.value % EVERY !== 0) return;

      // RGB uint8 다운샘플 버퍼
      const data = resize(frame, {
        scale: { width: GRID, height: GRID },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      }) as unknown as Uint8Array;

      let sw = 0;
      let sx = 0;
      let sy = 0;
      let sxx = 0;
      let syy = 0;

      for (let y = 1; y < GRID - 1; y++) {
        for (let x = 1; x < GRID - 1; x++) {
          const i = (y * GRID + x) * 3;
          const ir = (y * GRID + (x + 1)) * 3;
          const id = ((y + 1) * GRID + x) * 3;
          const g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          const gr = data[ir] * 0.299 + data[ir + 1] * 0.587 + data[ir + 2] * 0.114;
          const gd = data[id] * 0.299 + data[id + 1] * 0.587 + data[id + 2] * 0.114;
          const w = Math.abs(g - gr) + Math.abs(g - gd); // 엣지 세기
          sw += w;
          sx += w * x;
          sy += w * y;
          sxx += w * x * x;
          syy += w * y * y;
        }
      }

      if (sw < 200) {
        setSubject(null); // 두드러진 피사체 없음
        return;
      }
      const mx = sx / sw;
      const my = sy / sw;
      const varx = Math.max(0, sxx / sw - mx * mx);
      const vary = Math.max(0, syy / sw - my * my);
      const spread = Math.sqrt(varx + vary);

      setSubject({
        nx: mx / GRID,
        ny: my / GRID,
        nr: Math.min(0.5, (spread * 1.2) / GRID),
      });
    },
    [resize],
  );

  return { frameProcessor, subjectRef };
}
