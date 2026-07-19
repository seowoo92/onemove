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

// 저장 변경 구독 — 로그인 사용자의 Supabase 동기화(sync.js)가 사용.
// localStorage는 같은 탭에서 이벤트를 내지 않으므로 여기서 직접 알린다.
const listeners = new Set()
export function onStorageChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const notify = () => listeners.forEach((fn) => { try { fn() } catch { /* 구독자 오류가 저장을 막지 않게 */ } })

export const storage = {
  // 프로필(닉네임·코치·알림)의 마지막 로컬 변경 시각 — 기기 간 동기화 때 서버와 최신 비교용
  getProfileTs: () => Number(localStorage.getItem('onemove_profile_ts') ?? 0),
  touchProfileTs: () => localStorage.setItem('onemove_profile_ts', String(Date.now())),

  // 코치 성격 (날짜 무관 유지)
  getCoach: () => localStorage.getItem('onemove_coach'),
  setCoach(v) { localStorage.setItem('onemove_coach', v); this.touchProfileTs(); notify() },

  // 오늘 상태 (날짜 기반 리셋)
  getTodayState: () => getKeyed('onemove_state'),
  setTodayState: (v) => { setKeyed('onemove_state', v); notify() },

  // 오늘 루틴 ID 목록
  getTodayRoutineIds: () => getKeyed('onemove_routines'),
  setTodayRoutineIds: (ids) => { setKeyed('onemove_routines', ids); notify() },
  // 날짜 무관 — 어제 루틴 저장용
  getRawRoutineIds: () => getRawValue('onemove_routines'),

  // 완료된 루틴 ID
  getCompletedIds: () => getKeyed('onemove_completed') ?? [],
  setCompletedIds: (ids) => { setKeyed('onemove_completed', ids); notify() },
  addCompleted(id) {
    this.setCompletedIds([...new Set([...this.getCompletedIds(), id])])
  },

  // 쉬운 버전으로 전환된 루틴 ID
  getEasyIds: () => getKeyed('onemove_easy') ?? [],
  setEasyIds: (ids) => { setKeyed('onemove_easy', ids); notify() },
  addEasy(id) {
    this.setEasyIds([...new Set([...this.getEasyIds(), id])])
  },

  // 오늘은 쉬어가기 선택 루틴 ID
  getSkippedIds: () => getKeyed('onemove_skipped') ?? [],
  setSkippedIds: (ids) => { setKeyed('onemove_skipped', ids); notify() },
  addSkipped(id) {
    this.setSkippedIds([...new Set([...this.getSkippedIds(), id])])
  },

  // 어제 루틴 ID (중복 방지)
  getYesterdayIds: () => {
    try { return JSON.parse(localStorage.getItem('onemove_yesterday') ?? '[]') }
    catch { return [] }
  },
  setYesterdayIds: (ids) => localStorage.setItem('onemove_yesterday', JSON.stringify(ids)),

  // 매일 루틴(★) — 항상 오늘 추천에 포함되는 고정 루틴 ID (최대 3개, 영구 보존)
  getPinnedIds: () => {
    try { return JSON.parse(localStorage.getItem('onemove_pinned') ?? '[]') }
    catch { return [] }
  },
  setPinnedIds(ids) {
    localStorage.setItem('onemove_pinned', JSON.stringify(ids))
    this.touchProfileTs()
    notify()
  },

  // 닉네임 (영구 보존)
  getNickname: () => localStorage.getItem('onemove_nickname') ?? '',
  setNickname(v) { localStorage.setItem('onemove_nickname', v); this.touchProfileTs(); notify() },

  // 카카오톡 알림 on/off (영구 보존)
  getNotify: () => localStorage.getItem('onemove_notify') === 'true',
  setNotify(bool) { localStorage.setItem('onemove_notify', bool ? 'true' : 'false'); this.touchProfileTs(); notify() },

  // 오늘 날짜 키 (로컬 기준) — 기록 저장 시 화면 날짜와 일치시키기 위해 사용
  getTodayKey: () => today(),

  // 하루 마무리(회고) 메시지 — 하루 1회 생성 후 재사용, 자정 리셋
  getTodayReview: () => getKeyed('onemove_review'),
  setTodayReview: (v) => setKeyed('onemove_review', v),

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
    notify()
  },
  // 마음 날씨 다시 고르기 등으로 그 날을 새로 시작할 때 기록 초기화
  removeHistoryEntry(dateKey) {
    const history = this.getHistory()
    if (dateKey in history) {
      delete history[dateKey]
      localStorage.setItem('onemove_history', JSON.stringify(history))
      notify()
    }
  },
}
