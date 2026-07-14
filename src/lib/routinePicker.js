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
 * - 매일 루틴(pinnedIds): 항상 포함하고 맨 앞에 배치. 어제 제외 룰을 적용하지 않음(반복이 목적).
 *   남는 슬롯만 랜덤으로 채우며, 매일 루틴이 그날 개수 이상이면 매일 루틴만 표시됨.
 * - 영역(area) 분산 우선: 이미 선택된 area는 건너뜀 (매일 루틴의 area 포함)
 * - 쉬움 후보: 기본 난이도 '쉬움' 루틴 + '보통' 루틴을 쉬운버전으로 사용
 *   (보통 루틴이 쉬움 슬롯에 선택되면 initialEasyIds에 포함 → 화면에 쉬운버전 표시)
 * - yesterdayIds에 있는 루틴은 가능한 피함 (불가능하면 허용)
 *
 * @returns {{ routineIds: string[], initialEasyIds: string[] }}
 */
export function pickRoutines(state, yesterdayIds = [], pinnedIds = []) {
  const yesterday = new Set(yesterdayIds)
  const byId = new Map(ROUTINES.map(r => [r.id, r]))
  const pinned = pinnedIds.filter(id => byId.has(id)).slice(0, 3)
  const pinnedSet = new Set(pinned)

  // 후보 목록 생성: 매일 루틴 제외, yesterday 제외 루틴 우선(부족하면 포함으로 보충)
  // isEasyMode: true → 이 루틴은 쉬운버전으로 표시
  function buildCandidates(filterFn, isEasyModeFn) {
    const pool = ROUTINES.filter(r => !pinnedSet.has(r.id) && filterFn(r))
    const preferred = pool.filter(r => !yesterday.has(r.id))
    const fallback = pool.filter(r => yesterday.has(r.id))
    const seen = new Set()
    return [...preferred, ...fallback]
      .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
      .map(r => ({ id: r.id, area: r.area, isEasyMode: isEasyModeFn(r) }))
  }

  const usedAreas = new Set(pinned.map(id => byId.get(id).area))
  const routineIds = []
  const initialEasyIds = []

  function addPicked(picked) {
    for (const c of picked) {
      routineIds.push(c.id)
      if (c.isEasyMode) initialEasyIds.push(c.id)
    }
  }

  // 그날 총 개수에서 매일 루틴이 차지한 만큼 뺀 나머지만 랜덤으로 채움
  const total = state === '좋아요' ? 4 : state === '보통이에요' ? 3 : 2
  const remaining = Math.max(0, total - pinned.length)
  let normalCount
  let easyCount
  if (state === '좋아요') {
    easyCount = remaining > 0 ? 1 : 0
    normalCount = remaining - easyCount
  } else if (state === '보통이에요') {
    normalCount = remaining >= 3 ? 1 : 0
    easyCount = remaining - normalCount
  } else {
    normalCount = 0
    easyCount = remaining
  }

  if (normalCount > 0) {
    const normalPool = buildCandidates(r => r.difficulty === '보통', () => false)
    addPicked(pickDiverse(normalPool, normalCount, usedAreas))
  }
  if (easyCount > 0) {
    const usedIds = new Set(routineIds)
    const easyPool = buildCandidates(
      r => !usedIds.has(r.id),
      r => r.difficulty === '보통',
    )
    addPicked(pickDiverse(easyPool, easyCount, usedAreas))
  }

  return { routineIds: [...pinned, ...shuffle(routineIds)], initialEasyIds }
}
