import { useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import {
  ColorConversionCodes,
  DataTypes,
  HoughModes,
  ObjectType,
  OpenCV,
} from 'react-native-fast-opencv';

/** 정규화([0..1]) 프레임 좌표계의 검출된 원 */
export interface SubjectEstimate {
  nx: number;
  ny: number;
  nr: number;
}

const RW = 384; // 처리 해상도 폭(원형 유지 위해 종횡비 보존)
const EVERY = 6; // N프레임마다 1회(HoughCircles는 무거움 → ~5fps)

/**
 * OpenCV HoughCircles로 실제 '둥근 물체'를 검출한다.
 * 프레임을 종횡비 유지로 축소 → 그레이 → 블러 → HoughCircles → 가장 강한 원의
 * 정규화 중심·반경을 반환. useSubjectDetector와 동일한 인터페이스(드롭인 교체).
 *
 * ⚠️ 실기기 튜닝: param2(낮을수록 더 많이 검출), 블러 커널, RW, EVERY,
 *   그리고 화면 방향 매핑은 CameraScreen의 '방향' 버튼으로 보정.
 */
export function useCircleDetector() {
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
      if (!frame.width || !frame.height) return;

      const W = RW;
      const H = Math.max(1, Math.round((RW * frame.height) / frame.width));

      try {
        const data = resize(frame, {
          scale: { width: W, height: H },
          pixelFormat: 'bgr',
          dataType: 'uint8',
        }) as unknown as Uint8Array;

        const src = OpenCV.frameBufferToMat(H, W, 3, data);
        const gray = OpenCV.createObject(ObjectType.Mat, 0, 0, DataTypes.CV_8U);
        OpenCV.invoke('cvtColor', src, gray, ColorConversionCodes.COLOR_BGR2GRAY);

        const ksize = OpenCV.createObject(ObjectType.Size, 9, 9);
        OpenCV.invoke('GaussianBlur', gray, gray, ksize, 2);

        const circles = OpenCV.createObject(ObjectType.Mat, 0, 0, DataTypes.CV_32F);
        // method, dp, minDist, param1(Canny high), param2(accum thresh; 낮을수록 민감)
        OpenCV.invoke('HoughCircles', gray, circles, HoughModes.HOUGH_GRADIENT, 1, H / 6, 100, 40);

        const out = OpenCV.matToBuffer(circles, 'float32');
        if (out.cols > 0 && out.buffer.length >= 3) {
          // HoughCircles는 누적 강도 순 → 첫 원이 가장 뚜렷
          const x = out.buffer[0];
          const y = out.buffer[1];
          const r = out.buffer[2];
          setSubject({ nx: x / W, ny: y / H, nr: r / Math.min(W, H) });
        } else {
          setSubject(null);
        }
      } catch {
        setSubject(null);
      } finally {
        OpenCV.clearBuffers();
      }
    },
    [resize],
  );

  return { frameProcessor, subjectRef };
}
