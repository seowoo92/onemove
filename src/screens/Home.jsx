import { useState, useEffect } from 'react'
import { ROUTINE_MAP } from '../data/routines'
import { storage } from '../lib/storage'
import { pickRoutines } from '../lib/routinePicker'
import { generateCoachMessage } from '../lib/solar'
import CoachModal from '../components/CoachModal'

function formatDate() {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
}

export default function Home({ coach, todayState, onGoToStateCheck }) {
  const [routineIds, setRoutineIds] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [easyIds, setEasyIds] = useState(new Set())
  const [skippedIds, setSkippedIds] = useState(new Set())
  const [modal, setModal] = useState(null) // { loading, message, source } | null

  useEffect(() => {
    let ids = storage.getTodayRoutineIds()
    if (!ids) {
      const prev = storage.getRawRoutineIds()
      if (prev) storage.setYesterdayIds(prev)
      const { routineIds: newIds, initialEasyIds } = pickRoutines(todayState, storage.getYesterdayIds())
      storage.setTodayRoutineIds(newIds)
      storage.setEasyIds(initialEasyIds)
      ids = newIds
    }
    setRoutineIds(ids)
    setCompletedIds(new Set(storage.getCompletedIds()))
    setEasyIds(new Set(storage.getEasyIds()))
    setSkippedIds(new Set(storage.getSkippedIds()))
  }, [todayState])

  async function handleComplete(routineId) {
    const isEasy = easyIds.has(routineId)
    const active = routineIds.filter(id => !completedIds.has(id) && !skippedIds.has(id))
    const isLast = active.length === 1 && active[0] === routineId
    const situation = isLast ? 'all_done' : isEasy ? 'easy_done' : 'routine_done'
    const base = ROUTINE_MAP[routineId]
    const routineName = (isEasy ? base?.easyVersion?.name : base?.name) ?? '루틴'

    const newCompleted = new Set([...completedIds, routineId])
    setCompletedIds(newCompleted)
    storage.setCompletedIds([...newCompleted])

    setModal({ loading: true, message: null, source: null })
    const result = await generateCoachMessage({ personality: coach, state: todayState, routineName, situation })
    setModal({ loading: false, message: result.message, source: result.source })
  }

  async function handleSkip(routineId) {
    const base = ROUTINE_MAP[routineId]
    const routineName = base?.easyVersion?.name ?? base?.name ?? '루틴'

    const newSkipped = new Set([...skippedIds, routineId])
    setSkippedIds(newSkipped)
    storage.setSkippedIds([...newSkipped])

    setModal({ loading: true, message: null, source: null })
    const result = await generateCoachMessage({ personality: coach, state: todayState, routineName, situation: 'rest_day' })
    setModal({ loading: false, message: result.message, source: result.source })
  }

  function handleRequestStateChange() {
    if (completedIds.size > 0) {
      const ok = window.confirm('다시 고르면 오늘 기록이 초기화돼요. 계속할까요?')
      if (!ok) return
    }
    ;['onemove_state', 'onemove_routines', 'onemove_completed', 'onemove_easy', 'onemove_skipped']
      .forEach(k => localStorage.removeItem(k))
    onGoToStateCheck()
  }

  function handleSwitchToEasy(routineId) {
    const newEasy = new Set([...easyIds, routineId])
    setEasyIds(newEasy)
    storage.setEasyIds([...newEasy])
  }

  const completedCount = completedIds.size
  const totalCount = routineIds.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="w-full max-w-[480px] mx-auto px-5 pt-10 pb-24">

        {/* 헤더 */}
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-bold" style={{ color: '#24523F' }}>오늘만큼</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRequestStateChange}
              className="text-xs"
              style={{ color: '#8A9E94' }}
            >
              상태 다시 고르기
            </button>
            <p className="text-xs" style={{ color: '#C4BAB2' }}>{formatDate()}</p>
          </div>
        </div>

        {/* 진행 현황 */}
        <p className="text-sm mb-2" style={{ color: '#22302A' }}>
          오늘{' '}
          <span className="font-semibold" style={{ color: '#24523F' }}>{completedCount}</span>
          {' '}/ {totalCount}개 완료
        </p>
        <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: '#E8E1D8' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ backgroundColor: '#24523F', width: `${progress}%` }}
          />
        </div>

        {/* 루틴 카드 목록 */}
        <div className="flex flex-col gap-3">
          {routineIds.map((id) => {
            const base = ROUTINE_MAP[id]
            if (!base) return null

            const isEasy = easyIds.has(id)
            const isDone = completedIds.has(id)
            const isSkipped = skippedIds.has(id)
            const isDimmed = isDone || isSkipped
            const routine = isEasy ? base.easyVersion : base

            return (
              <div
                key={id}
                className="rounded-2xl p-5 transition-opacity duration-300"
                style={{ backgroundColor: '#FFFFFF', opacity: isDimmed ? 0.45 : 1 }}
              >
                {/* 루틴명 + 쉬운버전 뱃지 */}
                <div className="flex items-start justify-between mb-3">
                  <p
                    className="text-base font-medium leading-snug"
                    style={{
                      color: '#22302A',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {routine.name}
                  </p>
                  {isEasy && !isDimmed && (
                    <span
                      className="ml-2 mt-0.5 shrink-0 text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#FFF0EC', color: '#EE8466' }}
                    >
                      쉬운 버전
                    </span>
                  )}
                </div>

                {/* 태그 */}
                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F0EDE8', color: '#6B7B6F' }}>
                    {routine.area}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F0EDE8', color: '#6B7B6F' }}>
                    {routine.difficulty}
                  </span>
                </div>

                {/* 상태 레이블 또는 버튼 */}
                {isDone && (
                  <p className="text-xs" style={{ color: '#8A9E94' }}>완료했어요</p>
                )}
                {isSkipped && (
                  <p className="text-xs" style={{ color: '#8A9E94' }}>오늘은 쉬어가요</p>
                )}
                {!isDimmed && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(id)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: '#24523F', color: '#FFFFFF' }}
                    >
                      완료
                    </button>
                    {isEasy ? (
                      <button
                        onClick={() => handleSkip(id)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#FAF6F0', color: '#8A9E94' }}
                      >
                        오늘은 쉬어가기
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSwitchToEasy(id)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#FAF6F0', color: '#8A9E94' }}
                      >
                        지금은 어려워요
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <CoachModal
          loading={modal.loading}
          message={modal.message}
          source={modal.source}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
