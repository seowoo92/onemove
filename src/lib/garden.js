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
export const GARDEN_ELEMENTS = [
  { id: 'sprout', name: '새싹', threshold: 2 },
  { id: 'cloud', name: '구름', threshold: 5 },
  { id: 'flower-a', name: '여름 꽃', threshold: 9 },
  { id: 'butterfly', name: '나비', threshold: 14 },
  { id: 'tree-small', name: '작은 나무', threshold: 20 },
  { id: 'sun', name: '햇님', threshold: 27 },
  { id: 'flower-b', name: '들꽃', threshold: 36 },
  { id: 'bird', name: '새', threshold: 47 },
  { id: 'pond', name: '연못', threshold: 60 },
  { id: 'tree-big', name: '큰 나무', threshold: 75 },
]

export function getUnlockedElements(count) {
  return GARDEN_ELEMENTS.filter((el) => count >= el.threshold)
}

export function getNextElement(count) {
  return GARDEN_ELEMENTS.find((el) => count < el.threshold) ?? null
}
