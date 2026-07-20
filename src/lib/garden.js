// 정원 게이미피케이션 — 계절 계산과 요소 언락 로직.
// 별도 저장 없이 onemove_history(날짜별 완료 기록)만으로 계산한다.
// 로그인 사용자는 daily_entries 동기화로 기기를 바꿔도 정원이 그대로 복원된다.

// 계절 구분: 봄 3~5월 / 여름 6~8월 / 가을 9~11월 / 겨울 12~2월 (겨울은 시작 연도 기준)
export function getSeason(dateKey) {
  const [y, m] = dateKey.split('-').map(Number)
  if (m >= 3 && m <= 5) return { key: `${y}-spring`, name: '봄', year: y, start: `${y}-03-01`, end: `${y}-05-31` }
  if (m >= 6 && m <= 8) return { key: `${y}-summer`, name: '여름', year: y, start: `${y}-06-01`, end: `${y}-08-31` }
  if (m >= 9 && m <= 11) return { key: `${y}-autumn`, name: '가을', year: y, start: `${y}-09-01`, end: `${y}-11-30` }
  const startYear = m === 12 ? y : y - 1
  return { key: `${startYear}-winter`, name: '겨울', year: startYear, start: `${startYear}-12-01`, end: `${startYear + 1}-02-29` }
}

// 해당 계절 동안 완료한 루틴 누적 개수 (날짜 키는 YYYY-MM-DD라 문자열 비교로 충분)
export function countSeasonCompleted(history, season) {
  return Object.entries(history)
    .filter(([date]) => date >= season.start && date <= season.end)
    .reduce((sum, [, entry]) => sum + (entry.completed?.length ?? 0), 0)
}

// 여름 정원 요소 — 열리는 순서대로. 초반은 촘촘히, 뒤로 갈수록 느슨하게.
// 퇴보 없음: 한번 열린 요소는 사라지지 않는다 (쉬어간 날 페널티 없음 원칙)
// x·y: 배경 왼쪽 위 기준 % (요소 중심점) / w: 컨테이너 너비 대비 % / z: 겹침 순서
// motion: garden.css의 애니메이션 종류 / shadow: 접지 그림자 종류 (하늘 요소는 none — 본체 drop-shadow만)
export const GARDEN_ELEMENTS = [
  { id: 'sprout', name: '새싹', threshold: 2, file: 'garden-summer-sprout.png', x: 14, y: 85, w: 14, motion: 'sway', shadow: 'ground-sm', z: 32 },
  { id: 'cloud', name: '구름', threshold: 5, file: 'garden-summer-cloud.png', x: 50, y: 26, w: 28, motion: 'cross', shadow: 'none', z: 10 },
  { id: 'flower-a', name: '여름 꽃', threshold: 9, file: 'garden-summer-flower-a.png', x: 47, y: 69, w: 19, motion: 'sway', shadow: 'none', z: 18 },
  { id: 'butterfly', name: '나비', threshold: 14, file: 'garden-summer-butterfly.png', x: 52, y: 50, w: 12, motion: 'fly', shadow: 'none', z: 45 },
  { id: 'tree-small', name: '작은 나무', threshold: 20, file: 'garden-summer-tree-small.png', x: 79, y: 59, w: 39, motion: 'tree', shadow: 'ground-md', z: 25 },
  { id: 'sun', name: '햇님', threshold: 27, file: 'garden-summer-sun.png', x: 66, y: 17, w: 20, motion: 'breathe', shadow: 'none', z: 8 },
  { id: 'flower-b', name: '들꽃', threshold: 36, file: 'garden-summer-flower-b.png', x: 77, y: 83, w: 28, motion: 'sway-alt', shadow: 'ground-md', z: 35 },
  { id: 'bird', name: '새', threshold: 47, file: 'garden-summer-bird.png', x: 91, y: 80, w: 11, motion: 'nod', shadow: 'ground-sm', z: 44 },
  { id: 'pond', name: '연못', threshold: 60, file: 'garden-summer-pond.png', x: 50, y: 88, w: 40, motion: 'pond', shadow: 'ground-wide', z: 20, wide: true },
  { id: 'tree-big', name: '큰 나무', threshold: 75, file: 'garden-summer-tree-big.png', x: 22, y: 55, w: 42, motion: 'tree', shadow: 'ground-lg', z: 24 },
]

export function getUnlockedElements(count) {
  return GARDEN_ELEMENTS.filter((el) => count >= el.threshold)
}

export function getNextElement(count) {
  return GARDEN_ELEMENTS.find((el) => count < el.threshold) ?? null
}

// 계절별 에셋 세트 — 가을·겨울·봄은 에셋 도착 시 등록 (docs/garden-asset-guide.md 1절)
export const SEASON_SETS = {
  여름: { bg: 'garden-summer-bg.jpg', elements: GARDEN_ELEMENTS },
}

// 앨범: 기록에서 지난 계절들을 계산 (별도 저장 없음 — 로그인 사용자는 동기화로 자동 복원)
// 완료가 1개라도 있는 계절만, 최신순
export function getPastSeasons(history, todayKey) {
  const currentKey = getSeason(todayKey).key
  const map = new Map()
  for (const [date, entry] of Object.entries(history)) {
    const s = getSeason(date)
    if (s.key === currentKey) continue
    const acc = map.get(s.key) ?? { ...s, count: 0 }
    acc.count += entry.completed?.length ?? 0
    map.set(s.key, acc)
  }
  return [...map.values()].filter((s) => s.count > 0).sort((a, b) => (a.start < b.start ? 1 : -1))
}
