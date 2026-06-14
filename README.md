# Circle Camera (가칭)

여행 릴스에서 자주 보이는 **"화면 속 동그라미에 풍경 피사체를 맞춰 찍기"** 무드를
하나의 카메라 앱으로 만드는 프로젝트.

화면에 타겟 도형(동그라미)을 **직접 위치·크기 지정**해 띄워두고, 사용자가 피사체를
그 안에 맞춰가도록 앱이 **정렬을 실시간 가이드**한다. 촬영은 사용자가 **직접(수동 셔터)**.
못 맞춘 사진은 **후보정 모드**에서 원 프레이밍을 입힐 수 있다.

## 한 줄 컨셉

> 동그라미에 피사체를 맞추도록 가이드해주는 카메라. 셔터는 내가, 보정도 나중에.

## 현재 상태

- 단계: **M1 + L2 구현 (React Native)** — 카메라·원 오버레이·수동촬영·후보정 + 실시간 정렬 가이드
- 플랫폼: **iOS · Android 공용** — React Native (Expo) + vision-camera
- 디자인: **투톤(다크 잉크 + 민트 액센트)**
- 다음: 실기기 빌드 검증 + L2 인식 튜닝

## 실행 (요약)

```bash
npm install
npx expo install --fix
npx expo prebuild
npx expo run:android   # 갤럭시
npx expo run:ios       # 아이폰 (Mac 필요)
```
자세한 내용은 [docs/BUILD.md](docs/BUILD.md).

## 문서

- [docs/BUILD.md](docs/BUILD.md) — iPhone·Galaxy 빌드/실행 가이드
- [docs/mockup.html](docs/mockup.html) — 인터랙티브 UI 목업 + 기능 설명
- [docs/DESIGN.md](docs/DESIGN.md) — 제품/기술 설계 전체
- [docs/COMPETITORS.md](docs/COMPETITORS.md) — 기존 앱·기능 조사 및 차별점
- [docs/ROADMAP.md](docs/ROADMAP.md) — 단계별 범위(L1→L2→L3)와 마일스톤

## 코드 구조

```
App.tsx                       화면 전환(camera/preview/edit)
index.ts                      진입점
src/screens/CameraScreen      프리뷰 + 원 오버레이 + 정렬 가이드 + 수동 셔터
src/screens/PreviewScreen     촬영 결과 저장/공유/후보정 이동
src/screens/EditScreen        사진 불러와 원 프레이밍·비네팅 → 내보내기
src/components/CircleOverlay   드래그·핀치 원 + 정렬 게이지(SVG+Reanimated), 공용
src/components/ui.tsx          투톤 UI 컴포넌트(BlurBar/Pill/Button/Shutter)
src/lib/useCircle.ts          원 위치·크기 상태 + 제스처(공유)
src/lib/useSubjectDetector.ts L2 실시간 피사체 검출(vision-camera frame processor)
src/lib/match.ts              정렬 fit 계산
src/theme.ts                  디자인 토큰(투톤)·비율 상수
```

## 핵심 차별점

기존 "구도 오버레이" 앱들은 **정적인 가이드**만 그려준다.
이 프로젝트의 차별점은:

1. **정렬 가이드** — 피사체를 실시간 인식해 원과의 fit 점수·방향 힌트를 표시(셔터는 수동)
2. **후보정 모드** — 찍거나 고른 사진에 원 프레이밍·크롭·효과를 사후 적용
3. **(향후) 스마트 검출** — 풍경 속 둥근 사물을 찾아 원을 제안/스냅
