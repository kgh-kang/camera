# 빌드 & 실행 가이드 (iPhone · Galaxy)

이 앱은 **Expo + react-native-vision-camera**로 만들어졌습니다.
vision-camera는 Expo Go에서 동작하지 않으므로 **개발 빌드(dev client)** 또는
**네이티브 빌드(prebuild)** 가 필요합니다.

> ⚠️ 이 저장소에는 `ios/`, `android/` 네이티브 폴더가 들어있지 않습니다.
> 아래 `expo prebuild`로 양 플랫폼 프로젝트가 자동 생성됩니다.

---

## 0. 사전 준비

- **공통:** Node 18+ (권장 20/22), Git
- **Android(갤럭시):** Android Studio + Android SDK, JDK 17, USB 디버깅 켠 단말 또는 에뮬레이터
- **iOS(아이폰):** **macOS + Xcode**, CocoaPods, Apple 개발자 계정(실기기 서명용)
  - iOS 빌드는 **반드시 Mac**에서 해야 합니다(리눅스/윈도우 불가).

---

## 1. 의존성 설치 & 버전 정렬

```bash
npm install
# 설치된 Expo SDK에 맞게 네이티브 라이브러리 버전 자동 정렬
npx expo install --fix
```

최신 SDK로 올리고 싶다면:
```bash
npx expo install expo@latest
npx expo install --fix
```

## 2. 네이티브 프로젝트 생성

```bash
npx expo prebuild        # ios/ , android/ 생성 (권한·플러그인 설정 반영됨)
```

## 3. 실기기/에뮬레이터에서 실행

**Android (갤럭시)**
```bash
npx expo run:android     # 연결된 단말 또는 에뮬레이터에 설치·실행
```

**iOS (아이폰) — Mac에서**
```bash
npx expo run:ios --device   # 실기기. Xcode에서 Signing(Team) 한 번 설정 필요
# 시뮬레이터는 카메라가 없어 프리뷰가 안 보입니다 → 실기기 권장
```

## 4. 배포용 빌드 (선택, EAS)

로컬 Mac 없이 iOS까지 빌드하려면 EAS Build 사용:
```bash
npm i -g eas-cli
eas login
eas build -p android        # .apk/.aab
eas build -p ios            # 클라우드에서 iOS 빌드 (Apple 계정 필요)
```

---

## 구현 범위 (M1 + L2)

- 후면/전면 카메라 프리뷰, 투톤(잉크+민트) 디자인
- **드래그·핀치·핸들로 원 위치/크기 조절**
- 그리드, 비율(9:16/1:1/4:5) 토글
- **수동 셔터 촬영** → 미리보기 → 저장/공유/다시찍기/후보정
- **후보정 모드:** 사진 불러오기 → 원 프레이밍 + 비네팅 → 저장/공유
- **L2 정렬 가이드(◎ 토글):** 실시간 피사체 인식 → fit 게이지 링 + 방향 힌트(화살표/✓) + 상태색

## 실기기 튜닝 포인트 (L2)

`src/lib/useSubjectDetector.ts` 와 `src/screens/CameraScreen.tsx` 상단:
- **`ORIENT = { rotate, mirror }`** — 가이드 방향이 회전/반전돼 보이면 이 값만 바꿔 보정.
- `GRID`/`EVERY`/엣지 임계값(`sw < 200`) — 반응성·성능 트레이드오프.
- worklets-core/resize-plugin 버전에 따라 frame processor API가 다를 수 있음.
- L2가 불안정하면 카메라 화면의 **◎ 버튼으로 끄면** 순수 수동(M1)으로 동작.

## 알려진 한계

- iOS 시뮬레이터에는 카메라가 없어 프리뷰가 비어 보입니다(실기기에서 확인).
- L2 인식은 **휴리스틱(엣지 무게중심)** 이라 복잡한 배경에선 정확도가 낮음. 다음 단계에서
  세그멘테이션/객체검출 모드로 보강 예정.
- 후보정 내보내기는 화면 캡처(ViewShot)라 결과 해상도가 화면 크기에 맞춰집니다(원본 합성은 추후).
