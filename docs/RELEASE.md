# 출시 체크리스트 (Release Checklist)

코드는 준비됐고, 아래는 **사람이 직접 해야 하는** 출시 작업 목록이다.
(스토어 계정·서명·실기기 빌드는 이 저장소 밖, 로컬 Mac/콘솔에서 진행)

## 1. 계정 · 식별자
- [ ] Apple Developer Program 가입($99/년), App Store Connect 앱 생성
- [ ] Google Play 개발자 등록($25 1회), Play Console 앱 생성
- [ ] Bundle ID `com.circlecamera.app` / Android package 동일 — 필요 시 변경
- [ ] 앱 이름 최종 확정 (후보: `store/LISTING.md` 참고)

## 2. 빌드 (EAS)
- [ ] `npm install` → `npx expo install --fix` (네이티브 버전 정렬)
- [ ] `npx expo prebuild` 로 ios/android 생성
- [ ] 실기기 동작 확인: `npx expo run:android`, `npx expo run:ios`(Mac)
- [ ] `eas build -p android --profile production`
- [ ] `eas build -p ios --profile production` (Apple 서명/프로비저닝)
- [ ] 버전: `app.json` version 1.0.0 / iOS buildNumber / Android versionCode 관리

## 3. 스토어 등록물
- [ ] 아이콘(`assets/icon.png`) · 스플래시 반영 확인
- [ ] 스크린샷 촬영 — `store/SCREENSHOTS.md` 샷 리스트대로 (iPhone 6.7"/6.1", Android)
- [ ] 설명/키워드/프로모션 텍스트 — `store/LISTING.md` (KR/EN)
- [ ] 카테고리: 사진 및 비디오 / 연령등급: 4+ (근거 `store/LISTING.md`)

## 4. 법무 · 데이터 안전
- [ ] 개인정보처리방침 **공개 URL** 필요 → `docs/legal/PRIVACY.md`를 GitHub Pages 등으로 호스팅
- [ ] 이용약관 호스팅(`docs/legal/TERMS.md`)
- [ ] Apple **App Privacy** 라벨: 데이터 수집 "없음"(전부 온디바이스, 미전송)
- [ ] Google Play **데이터 보안** 양식: 수집/공유 "없음", 권한(카메라/사진) 용도 명시

## 5. QA 매트릭스
- [ ] 권한 거부→허용 흐름, 첫 실행 온보딩
- [ ] 원 드래그/핀치/핸들, 비율·그리드·전후면 전환
- [ ] L2 가이드: 게이지/화살표/햅틱, **방향 보정(ORIENT)** 실기기 확인 (회전/미러)
- [ ] 촬영→저장/공유, 후보정 불러오기→비네팅→내보내기
- [ ] 저사양 단말 성능(프레임 프로세서 발열/프레임드랍), 다양한 화면비

## 6. 제출
- [ ] TestFlight / Play 내부 테스트로 베타 검증
- [ ] 심사 제출 → 반려 사유 대응 → 출시

## 자동 검증 (CI)
- `npm run typecheck` · `npm test` — GitHub Actions(`.github/workflows/ci.yml`)에서 PR마다 실행
