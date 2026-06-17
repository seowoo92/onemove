import { ROUTINES } from '../data/routines'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// pool에서 n개를 뽑되, usedAreas에 없는 area를 우선 선택 (usedAreas를 직접 갱신)
function pickDiverse(pool, n, usedAreas) {
  const src = shuffle([...pool])
  const picked = []
  for (let i = 0; i < n; i++) {
    if (src.length === 0) break
    const freshIdx = src.findIndex(c => !usedAreas.has(c.area))
    const idx = freshIdx >= 0 ? freshIdx : 0
    const [item] = src.splice(idx, 1)
    picked.push(item)
    usedAreas.add(item.area)
  }
  return picked
}

/**
 * 오늘 상태에 따라 루틴을 추출합니다.
 *
 * - 영역(area) 분산 우선: 이미 선택된 area는 건너뜀
 * - 쉬움 후보: 기본 난이도 '쉬움' 루틴 + '보통' 루틴을 쉬운버전으로 사용
 *   (보통 루틴이 쉬움 슬롯에 선택되면 initialEasyIds에 포함 → 화면에 쉬운버전 표시)
 * - yesterdayIds에 있는 루틴은 가능한 피함 (불가능하면 허용)
 *
 * @returns {{ routineIds: string[], initialEasyIds: string[] }}
 */
export function pickRoutines(state, yesterdayIds = []) {
  const yesterday = new Set(yesterdayIds)

  // 후보 목록 생성: yesterday 제외 루틴 우선, 부족하면 yesterday 포함으로 보충
  // isEasyMode: true → 이 루틴은 쉬운버전으로 표시
  function buildCandidates(filterFn, isEasyModeFn) {
    const preferred = ROUTINES.filter(r => filterFn(r) && !yesterday.has(r.id))
    const fallback = ROUTINES.filter(r => filterFn(r) && yesterday.has(r.id))
    const seen = new Set()
    return [...preferred, ...fallback]
      .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
      .map(r => ({ id: r.id, area: r.area, isEasyMode: isEasyModeFn(r) }))
  }

  const usedAreas = new Set()
  const routineIds = []
  const initialEasyIds = []

  function addPicked(picked) {
    for (const c of picked) {
      routineIds.push(c.id)
      if (c.isEasyMode) initialEasyIds.push(c.id)
    }
  }

  if (state === '좋아요') {
    // 보통 3개
    const normalPool = buildCandidates(r => r.difficulty === '보통', () => false)
    addPicked(pickDiverse(normalPool, 3, usedAreas))

    // 쉬움 1개 (이미 선택된 ID 제외)
    const usedIds = new Set(routineIds)
    const easyPool = buildCandidates(
      r => !usedIds.has(r.id),
      r => r.difficulty === '보통',
    )
    addPicked(pickDiverse(easyPool, 1, usedAreas))

  } else if (state === '보통이에요') {
    // 보통 1개
    const normalPool = buildCandidates(r => r.difficulty === '보통', () => false)
    addPicked(pickDiverse(normalPool, 1, usedAreas))

    // 쉬움 2개
    const usedIds = new Set(routineIds)
    const easyPool = buildCandidates(
      r => !usedIds.has(r.id),
      r => r.difficulty === '보통',
    )
    addPicked(pickDiverse(easyPool, 2, usedAreas))

  } else {
    // 힘들어요: 쉬움 2개 (전체 후보)
    const easyPool = buildCandidates(() => true, r => r.difficulty === '보통')
    addPicked(pickDiverse(easyPool, 2, usedAreas))
  }

  return { routineIds: shuffle(routineIds), initialEasyIds }
}
