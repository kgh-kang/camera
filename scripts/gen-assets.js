// 브랜드 에셋 생성기: SVG 마크 → 필요한 PNG들. `node scripts/gen-assets.js`
// sharp는 devtool로만 사용(앱 의존성 아님). 마크 = 잉크 배경 위 민트 타겟(링+중앙 점).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INK = '#0E0F13';
const MINT = '#43D6A3';
const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });

// 풀블리드 아이콘(iOS): 잉크 사각 배경 + 타겟 마크
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${INK}"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="${MINT}" stroke-width="46"/>
  <circle cx="512" cy="512" r="96" fill="${MINT}"/>
</svg>`;

// 안드로이드 적응형 전경(투명 + 안전영역 패딩): 마크만, 배경색은 app.json에서
const adaptive = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="232" fill="none" stroke="${MINT}" stroke-width="40"/>
  <circle cx="512" cy="512" r="74" fill="${MINT}"/>
</svg>`;

// 스플래시 로고(투명): 마크만, 배경색은 app.json splash.backgroundColor
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="250" fill="none" stroke="${MINT}" stroke-width="34"/>
  <circle cx="512" cy="512" r="82" fill="${MINT}"/>
</svg>`;

async function png(svg, file, size = 1024) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(out, file));
  console.log('wrote', file);
}

(async () => {
  await png(icon, 'icon.png');
  await png(adaptive, 'adaptive-icon.png');
  await png(splash, 'splash-icon.png');
  // 알림 아이콘(단색 권장이지만 마크 재사용)
  await png(adaptive, 'notification-icon.png', 96);
  console.log('done');
})();
