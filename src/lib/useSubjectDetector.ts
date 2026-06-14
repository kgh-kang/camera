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
const EVERY = 3; // N프레임마다 1회 처리(약 10fps)

/**
 * L2 피사체 검출기.
 * 카메라 프레임을 작은 그리드로 축소해, '평균 밝기에서 가장 벗어난(밝거나 어두운)
 * 영역'의 무게중심·퍼짐을 구해 피사체의 정규화 중심·반경을 추정한다. 해·달·조명처럼
 * 두드러진 피사체에 잘 잠긴다. 피사체가 무엇인지는 모르며 위치·크기만 낸다.
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

      const N = GRID * GRID;

      // 1패스: 평균 밝기
      let sum = 0;
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        sum += data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114;
      }
      const mean = sum / N;

      // 2패스: '평균에서 가장 벗어난(밝거나 어두운) 영역'을 가중 중심으로
      let sw = 0;
      let sx = 0;
      let sy = 0;
      let sxx = 0;
      let syy = 0;
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const j = (y * GRID + x) * 3;
          const g = data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114;
          const d = g - mean;
          const w = d * d; // 두드러짐(밝거나 어두운 극단) 강조
          sw += w;
          sx += w * x;
          sy += w * y;
          sxx += w * x * x;
          syy += w * y * y;
        }
      }

      if (sw < 2000) {
        setSubject(null); // 두드러진 피사체 없음(평평한 장면)
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
        nr: Math.min(0.5, Math.max(0.06, spread / GRID)),
      });
    },
    [resize],
  );

  return { frameProcessor, subjectRef };
}
