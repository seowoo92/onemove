// 로컬(기기 시간대) 기준 YYYY-MM-DD. toISOString()은 UTC라 KST와 어긋나므로 사용 금지.
const today = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

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

  // 카카오톡 알림 on/off (영구 보존)
  getNotify: () => localStorage.getItem('onemove_notify') === 'true',
  setNotify: (bool) => localStorage.setItem('onemove_notify', bool ? 'true' : 'false'),

  // 오늘 날짜 키 (로컬 기준) — 기록 저장 시 화면 날짜와 일치시키기 위해 사용
  getTodayKey: () => today(),

  // 날짜별 기록 (자정 리셋 없음, 영구 보존)
  getHistory() {
    try { return JSON.parse(localStorage.getItem('onemove_history') ?? '{}') }
    catch { return {} }
  },
  // 해당 날짜 기록을 현재 완료 집합으로 '덮어쓴다'. 누적이 아니므로 완료수 ≤ 총개수 보장.
  setHistoryEntry(dateKey, state, completedNames, total) {
    const history = this.getHistory()
    history[dateKey] = { state, completed: [...completedNames], total }
    localStorage.setItem('onemove_history', JSON.stringify(history))
  },
  // 마음 날씨 다시 고르기 등으로 그 날을 새로 시작할 때 기록 초기화
  removeHistoryEntry(dateKey) {
    const history = this.getHistory()
    if (dateKey in history) {
      delete history[dateKey]
      localStorage.setItem('onemove_history', JSON.stringify(history))
    }
  },
}
