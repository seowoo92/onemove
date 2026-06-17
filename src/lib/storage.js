const today = () => new Date().toISOString().slice(0, 10)

function getKeyed(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { date, value } = JSON.parse(raw)
    return date === today() ? value : null
  } catch { return null }
}

function setKeyed(key, value) {
  localStorage.setItem(key, JSON.stringify({ date: today(), value }))
}

function getRawValue(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw).value ?? null : null
  } catch { return null }
}

export const storage = {
  // 코치 성격 (날짜 무관 유지)
  getCoach: () => localStorage.getItem('onemove_coach'),
  setCoach: (v) => localStorage.setItem('onemove_coach', v),

  // 오늘 상태 (날짜 기반 리셋)
  getTodayState: () => getKeyed('onemove_state'),
  setTodayState: (v) => setKeyed('onemove_state', v),

  // 오늘 루틴 ID 목록
  getTodayRoutineIds: () => getKeyed('onemove_routines'),
  setTodayRoutineIds: (ids) => setKeyed('onemove_routines', ids),
  // 날짜 무관 — 어제 루틴 저장용
  getRawRoutineIds: () => getRawValue('onemove_routines'),

  // 완료된 루틴 ID
  getCompletedIds: () => getKeyed('onemove_completed') ?? [],
  setCompletedIds: (ids) => setKeyed('onemove_completed', ids),
  addCompleted(id) {
    this.setCompletedIds([...new Set([...this.getCompletedIds(), id])])
  },

  // 쉬운 버전으로 전환된 루틴 ID
  getEasyIds: () => getKeyed('onemove_easy') ?? [],
  setEasyIds: (ids) => setKeyed('onemove_easy', ids),
  addEasy(id) {
    this.setEasyIds([...new Set([...this.getEasyIds(), id])])
  },

  // 오늘은 쉬어가기 선택 루틴 ID
  getSkippedIds: () => getKeyed('onemove_skipped') ?? [],
  setSkippedIds: (ids) => setKeyed('onemove_skipped', ids),
  addSkipped(id) {
    this.setSkippedIds([...new Set([...this.getSkippedIds(), id])])
  },

  // 어제 루틴 ID (중복 방지)
  getYesterdayIds: () => {
    try { return JSON.parse(localStorage.getItem('onemove_yesterday') ?? '[]') }
    catch { return [] }
  },
  setYesterdayIds: (ids) => localStorage.setItem('onemove_yesterday', JSON.stringify(ids)),

  // 닉네임 (영구 보존)
  getNickname: () => localStorage.getItem('onemove_nickname') ?? '',
  setNickname: (v) => localStorage.setItem('onemove_nickname', v),

  // 날짜별 기록 (자정 리셋 없음, 영구 보존)
  getHistory() {
    try { return JSON.parse(localStorage.getItem('onemove_history') ?? '{}') }
    catch { return {} }
  },
  addHistoryEntry(dateKey, state, completedName, total) {
    const history = this.getHistory()
    const entry = history[dateKey] ?? { state, completed: [], total }
    if (!entry.completed.includes(completedName)) {
      entry.completed = [...entry.completed, completedName]
    }
    entry.total = total
    history[dateKey] = entry
    localStorage.setItem('onemove_history', JSON.stringify(history))
  },
}
