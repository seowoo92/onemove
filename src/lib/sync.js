import { supabase } from './supabase'
import { storage, onStorageChange } from './storage'
import { ROUTINE_MAP } from '../data/routines'

// 로그인 사용자의 프로필·오늘 기록을 Supabase에 동기화한다.
// 게스트는 이 모듈이 동작하지 않고 localStorage만 사용(하이브리드).
// 로컬이 정본 — 서버는 백업·기기 간 이어쓰기·알림(미완료 조회)용.

const DEBOUNCE_MS = 1500
let userId = null
let timer = null
let unsubscribe = null

function snapshot() {
  return {
    profile: {
      nickname: storage.getNickname() || null,
      coach: storage.getCoach() || null,
      notify_enabled: storage.getNotify(),
    },
    entry: {
      entry_date: storage.getTodayKey(),
      state: storage.getTodayState(),
      routine_ids: storage.getTodayRoutineIds() ?? [],
      // 표시용 이름도 함께 저장 — 오후 리마인더(서버)가 루틴 이름을 알 수 있도록.
      // 쉬운 버전으로 바꾼 루틴은 쉬운 버전 이름으로. routine_ids와 같은 순서.
      routine_names: (storage.getTodayRoutineIds() ?? []).map((id) => {
        const base = ROUTINE_MAP[id]
        return (storage.getEasyIds().includes(id) ? base?.easyVersion?.name : base?.name) ?? '루틴'
      }),
      completed_ids: storage.getCompletedIds(),
      easy_ids: storage.getEasyIds(),
      skipped_ids: storage.getSkippedIds(),
    },
  }
}

async function push() {
  if (!supabase || !userId) return
  const { profile, entry } = snapshot()
  const now = new Date().toISOString()
  try {
    await supabase.from('profiles').upsert({ user_id: userId, ...profile, updated_at: now })
    await supabase
      .from('daily_entries')
      .upsert({ user_id: userId, ...entry, updated_at: now }, { onConflict: 'user_id,entry_date' })
  } catch {
    // 네트워크·백엔드 장애 시 조용히 넘어간다 — 로컬이 정본이라 유실 없음, 다음 변경 때 재시도
  }
}

function schedulePush() {
  clearTimeout(timer)
  timer = setTimeout(push, DEBOUNCE_MS)
}

// 로그인 직후 1회: 서버 기록으로 빈 로컬을 보충한 뒤(로컬 우선), 현재 로컬을 서버에 반영.
// 다른 기기에서 쓰던 사용자가 새 기기에서 로그인하면 오늘 기록·코치·닉네임이 이어진다.
export async function reconcileOnLogin(id) {
  if (!supabase) return
  userId = id
  try {
    const todayKey = storage.getTodayKey()
    const [{ data: prof }, { data: entry }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('daily_entries').select('*').eq('user_id', id).eq('entry_date', todayKey).maybeSingle(),
    ])
    if (prof) {
      const serverTs = Date.parse(prof.updated_at ?? '') || 0
      if (serverTs > storage.getProfileTs()) {
        // 서버 프로필이 이 기기의 마지막 변경보다 최신 — 다른 기기에서 바꾼 닉네임·코치·알림을 반영
        if (prof.nickname) storage.setNickname(prof.nickname)
        if (prof.coach) storage.setCoach(prof.coach)
        storage.setNotify(!!prof.notify_enabled)
      } else {
        // 로컬이 최신이거나 비교 불가 — 빈 값만 서버로 보충
        if (!storage.getNickname() && prof.nickname) storage.setNickname(prof.nickname)
        if (!storage.getCoach() && prof.coach) storage.setCoach(prof.coach)
      }
    }
    if (entry?.state && !storage.getTodayState()) {
      storage.setTodayState(entry.state)
      storage.setTodayRoutineIds(entry.routine_ids ?? [])
      storage.setCompletedIds(entry.completed_ids ?? [])
      storage.setEasyIds(entry.easy_ids ?? [])
      storage.setSkippedIds(entry.skipped_ids ?? [])
    }
  } catch {
    // 조회 실패해도 로컬 데이터로 계속 진행
  }
  await push()
}

export function startSync(id) {
  userId = id
  if (!unsubscribe) unsubscribe = onStorageChange(schedulePush)
}

export function stopSync() {
  userId = null
  clearTimeout(timer)
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
}
