# 기존 앱 / 기능 조사 (Competitive Landscape)

"구도 오버레이/프레이밍 가이드" 카테고리는 이미 존재한다. 하지만 **피사체를 인식해
타겟 도형에 자동으로 맞춰주는** 제품은 사실상 비어 있다 — 여기가 우리의 기회.

## 경쟁/유사 앱

| 앱 | 하는 것 | 한계 (= 우리의 기회) |
|---|---|---|
| [OverCam – Photo Overlay Camera](https://apps.apple.com/app/id6514316633) | 그리드·황금비 나선 등 구도 오버레이 | 정적 가이드. 피사체 인식/자동 맞춤 없음 |
| [Wise Camera](https://apps.apple.com/us/app/wise-camera/id1406085025) | 다양한 구도 오버레이로 프레이밍 보조 | 정적 가이드 |
| [Overgram: Frame Your Reel](https://apps.apple.com/us/app/-/id6751402470) | 릴스 안전영역/자막영역 프레이밍 가이드 | 도형 매칭 개념 아님 |
| [Geometry Projection Camera](https://apps.apple.com/il/app/geometry-projection-camera/id6758648602) | 원·다각형·별 반투명 오버레이(따라그리기용) | 미술 보조용, 인식 없음 |
| [MemoryLens](https://apps.apple.com/us/app/id6751618297) | 이전 사진을 반투명으로 겹쳐 같은 구도 재현 | "재촬영" 용도, 도형 매칭 아님 |

## 빈 칸 = 차별점

1. **정렬 어시스트** — 피사체 실시간 인식 → 원과의 fit 점수/방향 가이드
2. **자동 촬영** — 정렬이 안정적으로 유지되면 흔들림 없이 자동 셔터
3. **스마트 검출(향후)** — 풍경 속 둥근 사물(달·조명·아치·터널)을 찾아 원 제안/스냅

## 활용 가능 기술 (전부 온디바이스 가능)

- **iOS Vision** — `VNGenerateForegroundInstanceMaskRequest`(피사체 분리, iOS 17+), saliency
- **Google [ML Kit Object Detection](https://developers.google.com/ml-kit/vision/object-detection/android)** — 실시간 객체 검출·추적
- **TensorFlow\.js / MediaPipe** — 웹에서 객체 검출/세그멘테이션
- **OpenCV(.js)** — Hough Circle Transform으로 둥근 사물 검출
- **AR 프레임워크**(ARKit/ARCore) — 향후 깊이/추적 고도화 시

## 참고 출처

- https://apps.apple.com/app/id6514316633
- https://apps.apple.com/us/app/wise-camera/id1406085025
- https://apps.apple.com/us/app/-/id6751402470
- https://apps.apple.com/il/app/geometry-projection-camera/id6758648602
- https://apps.apple.com/us/app/id6751618297
- https://developers.google.com/ml-kit/vision/object-detection/android
