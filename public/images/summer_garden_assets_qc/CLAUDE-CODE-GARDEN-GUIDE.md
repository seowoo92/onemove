# Claude Code 전달용 — 여름 정원 CSS/JS 구현 가이드

## 목표

`public/images/`의 여름 정원 에셋을 이용해 게이미피케이션 정원 화면을 구현합니다. 에셋 본체와 그림자를 분리해, 요소가 움직일 때 스티커처럼 보이지 않고 지면에 자연스럽게 연결되도록 합니다.

## 구현 전 확인

1. 현재 프로젝트의 프레임워크, 정원 탭 컴포넌트, 루틴 완료 데이터 구조를 먼저 확인하세요.
2. 기존 라우팅·전역 상태·데이터 저장 구조는 불필요하게 변경하지 마세요.
3. 아래 코드는 React 기준 예시이며, 실제 프로젝트 구조에 맞게 파일명과 import만 조정하세요.
4. CSS 애니메이션을 기본으로 사용하고, JavaScript는 잠금 해제 계산과 나비 경로처럼 상태가 필요한 연출에만 사용하세요.

---

## 1. 요소 설정 파일

`src/lib/garden.js` 또는 기존 설정 파일에 통합합니다.

```js
export const GARDEN_ITEMS = [
  { id: 'sprout', file: 'garden-sprout.png', unlockAt: 2,  x: 42, y: 84, w: 8,  motion: 'sway',  shadow: 'ground-sm', z: 32 },
  { id: 'cloud', file: 'garden-cloud.png', unlockAt: 5,  x: 18, y: 16, w: 18, motion: 'drift', shadow: 'air',       z: 10 },
  { id: 'flowerA', file: 'garden-flower-a.png', unlockAt: 9, x: 30, y: 78, w: 10, motion: 'sway', shadow: 'ground-sm', z: 34 },
  { id: 'butterfly', file: 'garden-butterfly.png', unlockAt: 14, x: 35, y: 60, w: 9, motion: 'fly', shadow: 'air', z: 45 },
  { id: 'treeSmall', file: 'garden-tree-small.png', unlockAt: 20, x: 80, y: 62, w: 16, motion: 'tree', shadow: 'ground-md', z: 25 },
  { id: 'sun', file: 'garden-sun.png', unlockAt: 27, x: 78, y: 14, w: 13, motion: 'breathe', shadow: 'glow', z: 8 },
  { id: 'flowerB', file: 'garden-flower-b.png', unlockAt: 36, x: 63, y: 80, w: 10, motion: 'swayAlt', shadow: 'ground-sm', z: 35 },
  { id: 'bird', file: 'garden-bird.png', unlockAt: 47, x: 76, y: 50, w: 9, motion: 'nod', shadow: 'air', z: 44 },
  { id: 'pond', file: 'garden-pond.png', unlockAt: 60, x: 52, y: 91, w: 28, motion: 'pond', shadow: 'ground-wide', z: 20 },
  { id: 'treeBig', file: 'garden-tree-big.png', unlockAt: 75, x: 14, y: 58, w: 32, motion: 'tree', shadow: 'ground-lg', z: 24 },
];

export function getUnlockedGardenItems(completedRoutineCount) {
  const count = Number.isFinite(completedRoutineCount) ? completedRoutineCount : 0;
  return GARDEN_ITEMS.filter((item) => count >= item.unlockAt);
}
```

`x`, `y`는 배경 왼쪽 위를 기준으로 한 퍼센트 좌표입니다. `w`는 정원 컨테이너 너비 대비 퍼센트입니다.

---

## 2. React 구조 예시

그림자와 본체를 같은 요소에 합치지 마세요. 각 항목을 `shadow`와 `body`로 분리해야 합니다.

```jsx
import { GARDEN_ITEMS } from '@/lib/garden';
import './garden.css';

function GardenItem({ item, unlocked }) {
  if (!unlocked) return null;

  const style = {
    '--x': `${item.x}%`,
    '--y': `${item.y}%`,
    '--w': `${item.w}%`,
    '--z': item.z,
  };

  return (
    <div
      className={`garden-item garden-item--${item.id}`}
      style={style}
      data-motion={item.motion}
      aria-hidden="true"
    >
      <span className={`garden-item__shadow garden-item__shadow--${item.shadow}`} />
      <span className="garden-item__body">
        <img
          src={`/images/${item.file}`}
          alt=""
          draggable="false"
          decoding="async"
        />
      </span>
    </div>
  );
}

export default function GardenScene({ completedRoutineCount = 0 }) {
  return (
    <section className="garden" aria-label="나의 여름 정원">
      <img
        className="garden__background"
        src="/images/garden-summer-bg.png"
        alt=""
        draggable="false"
      />

      <div className="garden__stage">
        {GARDEN_ITEMS.map((item) => (
          <GardenItem
            key={item.id}
            item={item}
            unlocked={completedRoutineCount >= item.unlockAt}
          />
        ))}
      </div>
    </section>
  );
}
```

배경 이미지와 `garden__stage`는 반드시 같은 4:3 영역을 공유해야 합니다.

---

## 3. 기본 레이아웃 CSS

```css
.garden {
  position: relative;
  width: 100%;
  max-width: 1080px;
  margin-inline: auto;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 24px;
  isolation: isolate;
  background: #a9cfe0;
}

.garden__background,
.garden__stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.garden__background {
  display: block;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

.garden__stage {
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.garden-item {
  --x: 50%;
  --y: 50%;
  --w: 10%;
  --z: 1;

  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  z-index: var(--z);
  transform: translate(-50%, -50%);
  aspect-ratio: 1 / 1;
  contain: layout paint;
}

.garden-item--pond {
  aspect-ratio: 2 / 1;
}

.garden-item__body,
.garden-item__shadow {
  position: absolute;
  inset: 0;
  display: block;
}

.garden-item__body {
  z-index: 2;
  will-change: transform;
}

.garden-item__body img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}
```

---

## 4. 분리 그림자

### 지면 그림자

지면 그림자는 본체 이미지가 흔들려도 크게 회전하지 않아야 합니다.

```css
.garden-item__shadow {
  z-index: 1;
  left: 50%;
  top: auto;
  bottom: 1%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(34, 48, 42, 0.14);
  filter: blur(7px);
  will-change: transform, opacity;
}

.garden-item__shadow--ground-sm {
  width: 58%;
  height: 11%;
  bottom: 0;
}

.garden-item__shadow--ground-md {
  width: 70%;
  height: 10%;
  bottom: 1%;
  filter: blur(9px);
  background: rgba(34, 48, 42, 0.13);
}

.garden-item__shadow--ground-lg {
  width: 76%;
  height: 9%;
  bottom: 0;
  filter: blur(12px);
  background: rgba(34, 48, 42, 0.15);
}

.garden-item__shadow--ground-wide {
  width: 88%;
  height: 14%;
  bottom: 5%;
  filter: blur(10px);
  background: rgba(34, 48, 42, 0.11);
}
```

### 공중 요소

공중 요소는 타원형 지면 그림자를 만들지 말고 본체에 아주 약한 `drop-shadow`만 적용합니다.

```css
.garden-item__shadow--air,
.garden-item__shadow--glow {
  display: none;
}

.garden-item[data-motion='fly'] .garden-item__body img,
.garden-item[data-motion='nod'] .garden-item__body img {
  filter: drop-shadow(0 4px 5px rgba(34, 48, 42, 0.10));
}

.garden-item--cloud .garden-item__body img {
  filter: drop-shadow(0 5px 8px rgba(80, 112, 126, 0.08));
}

.garden-item--sun .garden-item__body img {
  filter:
    drop-shadow(0 0 8px rgba(243, 217, 120, 0.42))
    drop-shadow(0 0 18px rgba(243, 217, 120, 0.24));
}
```

그림자를 20% 이상 진하게 만들지 마세요. 진한 그림자는 다시 스티커처럼 보이게 합니다.

---

## 5. 애니메이션 기준점

```css
.garden-item--sprout .garden-item__body,
.garden-item--flowerA .garden-item__body,
.garden-item--flowerB .garden-item__body,
.garden-item--treeSmall .garden-item__body,
.garden-item--treeBig .garden-item__body {
  transform-origin: 50% 100%;
}

.garden-item--cloud .garden-item__body,
.garden-item--butterfly .garden-item__body,
.garden-item--sun .garden-item__body,
.garden-item--bird .garden-item__body,
.garden-item--pond .garden-item__body {
  transform-origin: 50% 50%;
}
```

---

## 6. CSS 애니메이션

### 새싹과 꽃

```css
.garden-item[data-motion='sway'] .garden-item__body {
  animation: garden-sway 4.8s ease-in-out infinite;
}

.garden-item[data-motion='swayAlt'] .garden-item__body {
  animation: garden-sway-alt 5.3s ease-in-out infinite;
}

.garden-item[data-motion='sway'] .garden-item__shadow,
.garden-item[data-motion='swayAlt'] .garden-item__shadow {
  animation: garden-shadow-soft 4.8s ease-in-out infinite;
}

@keyframes garden-sway {
  0%, 100% { transform: rotate(-1.4deg); }
  50% { transform: rotate(1.8deg); }
}

@keyframes garden-sway-alt {
  0%, 100% { transform: rotate(1.2deg); }
  50% { transform: rotate(-1.6deg); }
}

@keyframes garden-shadow-soft {
  0%, 100% { transform: translateX(-50%) scaleX(0.97); opacity: 0.82; }
  50% { transform: translateX(-48%) scaleX(1.03); opacity: 1; }
}
```

### 나무

```css
.garden-item[data-motion='tree'] .garden-item__body {
  animation: garden-tree-breathe 7.5s ease-in-out infinite;
}

.garden-item[data-motion='tree'] .garden-item__shadow {
  animation: garden-tree-shadow 7.5s ease-in-out infinite;
}

@keyframes garden-tree-breathe {
  0%, 100% { transform: rotate(-0.35deg) scale(1); }
  50% { transform: rotate(0.45deg) scale(1.004); }
}

@keyframes garden-tree-shadow {
  0%, 100% { transform: translateX(-50%) scaleX(0.99); }
  50% { transform: translateX(-50%) scaleX(1.015); }
}
```

현재 나무 PNG는 줄기와 잎이 한 장이므로 전체를 매우 작게 움직이세요. 잎만 크게 흔들면 줄기까지 휘어 보입니다. 예선 이후 잎과 줄기를 별도 에셋으로 나눌 때 잎만 별도로 흔들 수 있습니다.

### 구름

구름은 정원 전체 폭을 횡단시키기보다 기본 위치 주변에서 천천히 떠다니게 하는 편이 레이아웃이 안정적입니다.

```css
.garden-item[data-motion='drift'] .garden-item__body {
  animation: garden-cloud-drift 18s ease-in-out infinite alternate;
}

@keyframes garden-cloud-drift {
  from { transform: translate3d(-8%, 0, 0); }
  to { transform: translate3d(10%, 2%, 0); }
}
```

### 햇님

```css
.garden-item[data-motion='breathe'] .garden-item__body {
  animation: garden-sun-breathe 5.5s ease-in-out infinite;
}

@keyframes garden-sun-breathe {
  0%, 100% { transform: scale(0.985); opacity: 0.96; }
  50% { transform: scale(1.025); opacity: 1; }
}
```

### 새

```css
.garden-item[data-motion='nod'] .garden-item__body {
  animation: garden-bird-nod 4.6s ease-in-out infinite;
  transform-origin: 46% 72%;
}

@keyframes garden-bird-nod {
  0%, 66%, 100% { transform: rotate(0deg) translateY(0); }
  72% { transform: rotate(3deg) translateY(1%); }
  78% { transform: rotate(-1.5deg) translateY(0); }
  84% { transform: rotate(2deg) translateY(1%); }
}
```

### 연못 반짝임

연못 본체를 움직이지 말고 CSS 가상 요소를 위에 얹어 반짝임만 이동시킵니다.

```css
.garden-item--pond .garden-item__body::after {
  content: '';
  position: absolute;
  inset: 27% 17% 30%;
  border-radius: 50%;
  background: linear-gradient(
    105deg,
    transparent 25%,
    rgba(255, 255, 255, 0.28) 46%,
    transparent 62%
  );
  transform: translateX(-40%);
  mix-blend-mode: screen;
  animation: garden-pond-shimmer 5.8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes garden-pond-shimmer {
  0%, 18% { transform: translateX(-45%); opacity: 0; }
  35% { opacity: 0.75; }
  62% { transform: translateX(45%); opacity: 0.35; }
  78%, 100% { transform: translateX(45%); opacity: 0; }
}
```

---

## 7. 나비 이동 — JavaScript/Web Animations API

나비처럼 위치까지 바뀌는 요소만 JavaScript를 사용합니다. `requestAnimationFrame`으로 매 프레임 React state를 변경하지 마세요. 렌더링 비용이 커집니다.

```js
export function startButterflyMotion(element) {
  if (!element) return () => {};

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return () => {};

  const animation = element.animate(
    [
      { transform: 'translate3d(-10%, 4%, 0) rotate(-3deg)' },
      { transform: 'translate3d(6%, -8%, 0) rotate(2deg)', offset: 0.32 },
      { transform: 'translate3d(13%, 3%, 0) rotate(4deg)', offset: 0.65 },
      { transform: 'translate3d(-4%, -4%, 0) rotate(-2deg)' },
    ],
    {
      duration: 7200,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
    }
  );

  return () => animation.cancel();
}
```

React에서 사용할 경우:

```jsx
import { useEffect, useRef } from 'react';
import { startButterflyMotion } from '@/lib/gardenMotion';

function ButterflyBody({ children }) {
  const ref = useRef(null);

  useEffect(() => startButterflyMotion(ref.current), []);

  return (
    <span ref={ref} className="garden-item__body garden-butterfly-motion">
      {children}
    </span>
  );
}
```

날갯짓을 더하고 싶다면 이동 wrapper 안에 내부 wrapper를 하나 더 두고 `scaleX(0.94~1)` 정도만 적용하세요. 한 요소에 이동과 날갯짓 transform을 동시에 적용하면 서로 덮어씁니다.

```css
.garden-butterfly-motion img {
  animation: garden-butterfly-flutter 0.55s ease-in-out infinite alternate;
}

@keyframes garden-butterfly-flutter {
  from { transform: scaleX(0.95) scaleY(1.01); }
  to { transform: scaleX(1) scaleY(0.99); }
}
```

---

## 8. 잠금 해제 등장 효과

새로 열린 요소는 한 번만 부드럽게 나타나게 합니다. 매 렌더링마다 반복하지 마세요.

```css
.garden-item.is-newly-unlocked .garden-item__body {
  animation: garden-unlock 700ms cubic-bezier(.2,.85,.3,1.18) both;
}

@keyframes garden-unlock {
  from { opacity: 0; transform: translateY(10%) scale(0.72); }
  65% { opacity: 1; transform: translateY(-2%) scale(1.04); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

`localStorage`나 기존 사용자 데이터에 마지막으로 확인한 unlock 단계가 있다면, 그 이후 새로 열린 항목에만 `is-newly-unlocked`를 붙이세요.

---

## 9. 접근성과 성능

```css
@media (prefers-reduced-motion: reduce) {
  .garden *,
  .garden *::before,
  .garden *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

- 애니메이션은 `transform`과 `opacity` 중심으로 구현하세요.
- `top`, `left`, `width`, `height`를 프레임마다 변경하지 마세요.
- 동시에 움직이는 요소가 많아도 각 애니메이션 진폭은 작게 유지하세요.
- `will-change`는 움직이는 body와 shadow에만 제한적으로 사용하세요.
- 탭이 보이지 않을 때 애니메이션을 멈추려면 `document.visibilityState`를 이용할 수 있지만, 우선 CSS/Web Animations API만으로 구현해도 충분합니다.

---

## 10. 완료 조건

1. 네 화면 폭에서 확인: 360px, 390px, 768px, 1080px.
2. 모든 요소가 4:3 컨테이너 안에서 잘리지 않아야 함.
3. 지면 그림자는 본체보다 훨씬 약하고 덜 움직여야 함.
4. 해의 흰색/크림색 사각 배경이 보이지 않아야 함.
5. 마젠타 또는 딥그린 테스트 배경에서 PNG 프린지가 없어야 함.
6. `prefers-reduced-motion: reduce`에서 정지해야 함.
7. 누적 완료 수 0, 2, 5, 9, 14, 20, 27, 36, 47, 60, 75 각각에서 잠금 해제 상태를 확인해야 함.
8. 루틴을 쉬어도 이미 열린 요소가 사라지지 않아야 함.

## Claude Code에 줄 최종 지시

위 가이드와 `gardenassetguide.md`를 함께 읽고 현재 코드 구조에 맞게 구현하세요. 먼저 관련 파일과 데이터 흐름을 확인해 수정 계획을 설명한 뒤 작업하세요. 기존 루틴 완료 집계와 충돌하는 새 상태 구조를 만들지 말고, 현재 누적 완료 수를 단일 source of truth로 사용하세요. 구현 후 변경 파일 목록, 잠금 해제 테스트 결과, 반응형 및 reduced-motion 확인 결과를 보고하세요.
