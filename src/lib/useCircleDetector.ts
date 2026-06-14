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

/** 정규화 원 (nx,ny: 프레임 폭/높이 기준 0..1, nr: 프레임 '폭' 기준 0..1) */
export interface CircleN {
  nx: number;
  ny: number;
  nr: number;
}
export interface Detection {
  aspect: number; // 센서 프레임 가로/세로 (보통 >1, 가로형)
  circles: CircleN[];
}

const RW = 384; // 처리 해상도 폭(원형 유지 위해 종횡비 보존)
const EVERY = 6; // N프레임마다 1회(HoughCircles는 무거움 → ~5fps)
const MAX_CIRCLES = 16;

/**
 * OpenCV HoughCircles로 실제 '둥근 물체'들을 검출해 정규화 좌표 배열로 반환한다.
 * 화면 좌표 변환·원 선택은 CameraScreen에서(프리뷰 cover-crop·회전 보정 포함).
 *
 * ⚠️ 실기기 튜닝: param2(낮을수록 더 많이 검출), 블러 커널, RW, EVERY.
 */
export function useCircleDetector() {
  const detectionRef = useRef<Detection | null>(null);
  const { resize } = useResizePlugin();
  const counter = useSharedValue(0);

  const setDetection = Worklets.createRunOnJS((d: Detection | null) => {
    detectionRef.current = d;
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
        OpenCV.invoke('HoughCircles', gray, circles, HoughModes.HOUGH_GRADIENT, 1, H / 8, 100, 35);

        const out = OpenCV.matToBuffer(circles, 'float32');
        const n = out.cols;
        const found: CircleN[] = [];
        for (let i = 0; i < n && i < MAX_CIRCLES; i++) {
          const x = out.buffer[i * 3];
          const y = out.buffer[i * 3 + 1];
          const r = out.buffer[i * 3 + 2];
          if (r > 0) found.push({ nx: x / W, ny: y / H, nr: r / W });
        }
        setDetection(found.length ? { aspect: frame.width / frame.height, circles: found } : null);
      } catch {
        setDetection(null);
      } finally {
        OpenCV.clearBuffers();
      }
    },
    [resize],
  );

  return { frameProcessor, detectionRef };
}
