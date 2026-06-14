/**
 * 디자인 토큰 — 투톤(다크 잉크 + 민트 액센트).
 * 카메라 UI는 뷰파인더가 주인공이므로 크롬은 반투명·미니멀하게.
 * 신호등 색(idle/near/good)은 '브랜드'가 아니라 정렬 게이지 '기능색'으로만 사용.
 */
export const colors = {
  // base (ink)
  ink: '#0E0F13',
  ink2: '#15171D',
  surface: 'rgba(16,18,24,0.55)', // 반투명 컨트롤 면
  hair: 'rgba(255,255,255,0.14)',
  scrim: 'rgba(0,0,0,0.45)',

  // text
  text: '#F2F5F9',
  textDim: '#9AA6B6',

  // accent (mint) — 브랜드이자 'good' 신호
  accent: '#43D6A3',
  accentInk: '#06281E',
  white: '#FFFFFF',

  // 정렬 게이지 기능색
  idle: '#9AA6B6',
  near: '#FFCF5C',
  good: '#43D6A3',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
export const type = { tip: 11, label: 12, body: 14, title: 18 };

export const ratios = [
  { label: '9:16', value: 9 / 16 },
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
] as const;
