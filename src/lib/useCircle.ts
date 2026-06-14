import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

function clampW(v: number, a: number, b: number) {
  'worklet';
  return Math.max(a, Math.min(b, v));
}

export interface CircleController {
  cx: SharedValue<number>;
  cy: SharedValue<number>;
  r: SharedValue<number>;
  /** 본체 드래그(이동) + 핀치(크기) */
  moveGesture: ReturnType<typeof Gesture.Simultaneous>;
  /** 핸들 드래그(크기) */
  resizeGesture: ReturnType<typeof Gesture.Pan>;
  /** JS 스레드에서 현재 값 스냅샷 읽기 (fit 계산용) */
  snapshot: () => { cx: number; cy: number; r: number };
}

/**
 * 타겟 원의 위치/크기를 소유하는 훅. 화면(CameraScreen)과 오버레이가 공유하기 위해
 * 상위에서 만들어 내려준다. snapshot()으로 JS 스레드에서 현재 값을 읽어 정렬 계산에 쓴다.
 */
export function useCircle(width: number, height: number): CircleController {
  const minSide = Math.min(width, height) || 300;
  const cx = useSharedValue(width / 2);
  const cy = useSharedValue(height / 2);
  const r = useSharedValue(minSide * 0.24);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startR = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = cx.value;
      startY.value = cy.value;
    })
    .onUpdate((e) => {
      cx.value = clampW(startX.value + e.translationX, r.value, width - r.value);
      cy.value = clampW(startY.value + e.translationY, r.value, height - r.value);
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startR.value = r.value;
    })
    .onUpdate((e) => {
      r.value = clampW(startR.value * e.scale, 28, minSide / 2 - 4);
    });

  const resizeGesture = Gesture.Pan()
    .onStart(() => {
      startR.value = r.value;
    })
    .onUpdate((e) => {
      r.value = clampW(startR.value + (e.translationX + e.translationY) / 2, 28, minSide / 2 - 4);
    });

  return {
    cx,
    cy,
    r,
    moveGesture: Gesture.Simultaneous(pan, pinch),
    resizeGesture,
    snapshot: () => ({ cx: cx.value, cy: cy.value, r: r.value }),
  };
}
