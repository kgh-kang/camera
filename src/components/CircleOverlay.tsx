import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, Mask, Rect } from 'react-native-svg';
import type { CircleController } from '../lib/useCircle';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircleOverlayProps {
  width: number;
  height: number;
  circle: CircleController;
  /** 테두리/게이지 색 (정렬 상태에 따라) */
  color?: string;
  /** 0~1 게이지 채움 (L2). undefined면 게이지 숨김 */
  fit?: number;
  /** 원 중앙 힌트 텍스트 (방향/✓) */
  hint?: string;
  vignette?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
}

/** 드래그·핀치로 위치/크기를 바꾸는 타겟 원 + 정렬 게이지. 카메라·후보정 공용. */
export default function CircleOverlay({
  width,
  height,
  circle,
  color = colors.idle,
  fit,
  hint,
  vignette = false,
  showGrid = false,
  interactive = true,
}: CircleOverlayProps) {
  const { cx, cy, r, moveGesture, resizeGesture } = circle;
  const frac = useSharedValue(0);

  useEffect(() => {
    frac.value = withTiming(fit ?? 0, { duration: 120 });
  }, [fit, frac]);

  const circleProps = useAnimatedProps(() => ({ cx: cx.value, cy: cy.value, r: r.value }));

  const trackProps = useAnimatedProps(() => ({ cx: cx.value, cy: cy.value, r: r.value + 7 }));

  const gaugeProps = useAnimatedProps(() => {
    const rr = r.value + 7;
    const c = 2 * Math.PI * rr;
    return {
      cx: cx.value,
      cy: cy.value,
      r: rr,
      strokeDasharray: [c, c],
      strokeDashoffset: c * (1 - frac.value),
    };
  });

  const handleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx.value + r.value * 0.7071 - 13 },
      { translateY: cy.value + r.value * 0.7071 - 13 },
    ],
  }));

  const hintStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cx.value - 40 }, { translateY: cy.value - 22 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={moveGesture}>
        <Svg width={width} height={height}>
          {vignette && (
            <>
              <Defs>
                <Mask id="hole">
                  <Rect x={0} y={0} width={width} height={height} fill="white" />
                  <AnimatedCircle animatedProps={circleProps} fill="black" />
                </Mask>
              </Defs>
              <Rect x={0} y={0} width={width} height={height} fill="black" opacity={0.55} mask="url(#hole)" />
            </>
          )}

          {showGrid && (
            <>
              <Line x1={width / 3} y1={0} x2={width / 3} y2={height} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
              <Line x1={(width * 2) / 3} y1={0} x2={(width * 2) / 3} y2={height} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
              <Line x1={0} y1={height / 3} x2={width} y2={height / 3} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
              <Line x1={0} y1={(height * 2) / 3} x2={width} y2={(height * 2) / 3} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
            </>
          )}

          {/* 게이지 트랙 + 진행 */}
          {fit !== undefined && (
            <>
              <AnimatedCircle animatedProps={trackProps} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={3} />
              <AnimatedCircle
                animatedProps={gaugeProps}
                fill="none"
                stroke={color}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            </>
          )}

          {/* 가이드 원 */}
          <AnimatedCircle animatedProps={circleProps} fill="none" stroke={color} strokeWidth={2.5} />
        </Svg>
      </GestureDetector>

      {/* 중앙 힌트 */}
      {!!hint && (
        <Animated.View style={[styles.hintWrap, hintStyle]} pointerEvents="none">
          <Text style={[styles.hint, { color }]}>{hint}</Text>
        </Animated.View>
      )}

      {interactive && (
        <GestureDetector gesture={resizeGesture}>
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
  hintWrap: { position: 'absolute', top: 0, left: 0, width: 80, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 26, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
});
