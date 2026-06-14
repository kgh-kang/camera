import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, Mask, Rect } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function clampW(v: number, a: number, b: number) {
  'worklet';
  return Math.max(a, Math.min(b, v));
}

export interface CircleOverlayProps {
  width: number;
  height: number;
  /** 원 테두리 색 (정렬 상태에 따라 바뀜; M1은 고정) */
  color?: string;
  /** 원 밖을 어둡게 (후보정 효과) */
  vignette?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
}

/**
 * 화면 위에 드래그·핀치로 위치·크기를 바꾸는 타겟 원.
 * 카메라 화면과 후보정 화면에서 공용으로 쓴다.
 */
export default function CircleOverlay({
  width,
  height,
  color = colors.idle,
  vignette = false,
  showGrid = false,
  interactive = true,
}: CircleOverlayProps) {
  const minSide = Math.min(width, height);
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

  const handlePan = Gesture.Pan()
    .onStart(() => {
      startR.value = r.value;
    })
    .onUpdate((e) => {
      r.value = clampW(startR.value + (e.translationX + e.translationY) / 2, 28, minSide / 2 - 4);
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const circleProps = useAnimatedProps(() => ({
    cx: cx.value,
    cy: cy.value,
    r: r.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx.value + r.value * 0.7071 - 13 },
      { translateY: cy.value + r.value * 0.7071 - 13 },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={composed}>
        <Svg width={width} height={height}>
          {vignette && (
            <>
              <Defs>
                <Mask id="hole">
                  <Rect x={0} y={0} width={width} height={height} fill="white" />
                  <AnimatedCircle animatedProps={circleProps} fill="black" />
                </Mask>
              </Defs>
              <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="black"
                opacity={0.55}
                mask="url(#hole)"
              />
            </>
          )}

          {showGrid && (
            <>
              <Line x1={width / 3} y1={0} x2={width / 3} y2={height} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
              <Line x1={(width * 2) / 3} y1={0} x2={(width * 2) / 3} y2={height} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
              <Line x1={0} y1={height / 3} x2={width} y2={height / 3} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
              <Line x1={0} y1={(height * 2) / 3} x2={width} y2={(height * 2) / 3} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
            </>
          )}

          <AnimatedCircle
            animatedProps={circleProps}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
          />
        </Svg>
      </GestureDetector>

      {interactive && (
        <GestureDetector gesture={handlePan}>
          <Animated.View style={[styles.handle, handleStyle]} />
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#cfd6e0',
  },
});
