import { useState, useEffect } from 'react'
import { ROUTINE_MAP } from '../data/routines'
import { storage } from '../lib/storage'
import { pickRoutines, pickSwapCandidate } from '../lib/routinePicker'
import { generateCoachMessage, generateDailyReview } from '../lib/solar'
import { sendRoutineCard, resendRoutineCard } from '../lib/kakao'
import CoachModal from '../components/CoachModal'
import ScreenHeader from '../components/ScreenHeader'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
function formatDate() {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`
}

// 영역(area) → 시안 칩 색 (몸돌봄=초록 / 환경=파랑 / 마음=코랄)
const AREA_CHIP = {
  '몸 깨우기': { bg: '#D5EFD8', color: '#24523F' },
  '자기돌봄': { bg: '#D5EFD8', color: '#24523F' },
  '에너지': { bg: '#D5EFD8', color: '#24523F' },
  '공간': { bg: '#E4F0F6', color: '#3D6E8A' },
  '바깥': { bg: '#E4F0F6', color: '#3D6E8A' },
  '연결': { bg: '#FBE3DA', color: '#9B5B45' },
  '성취': { bg: '#FBE3DA', color: '#9B5B45' },
}
const DIFF_CHIP = { bg: '#EFEAE2', color: '#97907F' }

// 영역 표시명 — 단독으로 봐도 뜻이 통하도록 보완 (데이터의 area 값은 routines.js 확정본 그대로)
const AREA_LABEL = {
  '몸 깨우기': '몸 움직이기',
  '바깥': '바깥 활동',
  '공간': '공간 정리',
  '연결': '마음 연결',
}
const areaLabel = (area) => AREA_LABEL[area] ?? area

// 완료 — 노랑 필 (사용자 확정: 부드럽고 따뜻한 톤)
const COMPLETE_BTN = {
  background: '#F7EBBE',
  color: '#24523F',
  borderRadius: 999,
  padding: '7px 24px',
  fontSize: 13.5,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 8px 16px -7px rgba(214,184,90,.38),inset 0 1px 0 rgba(255,255,255,.6)',
}
// 보조 버튼(지금은 어려워요·오늘은 쉬어가기) — 회색 테두리 아웃라인
const SECONDARY_BTN = {
  background: 'none',
  border: '1.5px solid #E2DFD6',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: '6px 16px',
}

// '원래 난이도로' — 위아래 맞바꿈 화살표 (쉬운버전 ↔ 원래 버전)
function VersionToggleLink({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px', fontSize: 12, fontWeight: 600, color: '#9aa69d' }}>
      원래 난이도로
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aa69d" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7.5h13.5M14.5 4l3.5 3.5L14.5 11" />
        <path d="M20 16.5H6.5M9.5 13L6 16.5 9.5 20" />
      </svg>
    </button>
  )
}

// '다른 루틴으로 바꾸기' — 새로고침 라인 아이콘
function SwapIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="다른 루틴으로 바꾸기"
      style={{ background: 'none', border: 'none', padding: 3, cursor: 'pointer', display: 'flex', flex: 'none' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa69d" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 11.3A8.1 8.1 0 1 0 19 16" />
        <path d="M20.4 5.8v5.5h-5.5" />
      </svg>
    </button>
  )
}

// 매일 루틴(★) 토글 — 고정하면 매일 추천에 항상 포함
function PinStar({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? '매일 루틴 해제' : '매일 루틴으로 고정'}
      style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', flex: 'none' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? '#F3D978' : 'none'} stroke={active ? '#C9A94E' : '#B9C2BB'} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
      </svg>
    </button>
  )
}

function Chip({ bg, color, weight = 600, children }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: weight,
        color,
        background: bg,
        borderRadius: 7,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export default function Home({ coach, todayState, nickname = '', onGoToStateCheck }) {
  const [routineIds, setRoutineIds] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [easyIds, setEasyIds] = useState(new Set())
  const [autoEasyIds, setAutoEasyIds] = useState(new Set())
  const [swapUsedIds, setSwapUsedIds] = useState(new Set())
  const [skippedIds, setSkippedIds] = useState(new Set())
  const [pinned, setPinned] = useState(storage.getPinnedIds())
  const [modal, setModal] = useState(null) // { loading, message, source } | null
  const [sendingCard, setSendingCard] = useState(false) // 루틴 카드 수동 재발송 중
  const [review, setReview] = useState(null) // { loading } | { message, source } | null

  function togglePin(routineId) {
    const cur = storage.getPinnedIds()
    if (cur.includes(routineId)) {
      const next = cur.filter((id) => id !== routineId)
      storage.setPinnedIds(next)
      setPinned(next)
      return
    }
    if (cur.length >= 3) {
      window.alert('매일 루틴은 3개까지 고정할 수 있어요.')
      return
    }
    const next = [...cur, routineId]
    storage.setPinnedIds(next)
    setPinned(next)
  }

  useEffect(() => {
    let ids = storage.getTodayRoutineIds()
    if (!ids) {
      const prev = storage.getRawRoutineIds()
      if (prev) storage.setYesterdayIds(prev)
      const { routineIds: newIds, initialEasyIds } = pickRoutines(todayState, storage.getYesterdayIds(), storage.getPinnedIds())
      storage.setTodayRoutineIds(newIds)
      storage.setEasyIds(initialEasyIds)
      storage.setAutoEasyIds(initialEasyIds)
      ids = newIds
      // 오늘의 루틴이 막 확정된 순간 — 카톡 루틴 카드 발송 (로그인+알림 동의 시, 하루 1회)
      const cardNames = newIds.map((id) => {
        const base = ROUTINE_MAP[id]
        return (initialEasyIds.includes(id) ? base?.easyVersion?.name : base?.name) ?? '루틴'
      })
      sendRoutineCard(cardNames)
    }
    setRoutineIds(ids)
    setCompletedIds(new Set(storage.getCompletedIds()))
    setEasyIds(new Set(storage.getEasyIds()))
    setAutoEasyIds(new Set(storage.getAutoEasyIds()))
    setSwapUsedIds(new Set(storage.getSwapUsedIds()))
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

    // 날짜별 기록: 현재 완료 집합을 그대로 저장 (누적 X → 완료수 ≤ 총개수 보장)
    const completedNames = [...newCompleted].map((cid) => {
      const b = ROUTINE_MAP[cid]
      return (easyIds.has(cid) ? b?.easyVersion?.name : b?.name) ?? '루틴'
    })
    storage.setHistoryEntry(storage.getTodayKey(), todayState, completedNames, routineIds.length)

    setModal({ loading: true, message: null, source: null })
    const result = await generateCoachMessage({ personality: coach, state: todayState, routineName, situation, nickname })
    setModal({ loading: false, message: result.message, source: result.source })
  }

  async function handleSkip(routineId) {
    const base = ROUTINE_MAP[routineId]
    const routineName = base?.easyVersion?.name ?? base?.name ?? '루틴'

    const newSkipped = new Set([...skippedIds, routineId])
    setSkippedIds(newSkipped)
    storage.setSkippedIds([...newSkipped])

    setModal({ loading: true, message: null, source: null })
    const result = await generateCoachMessage({ personality: coach, state: todayState, routineName, situation: 'rest_day', nickname })
    setModal({ loading: false, message: result.message, source: result.source })
  }

  // 완료 실수 방지 — 완료 행을 탭하면 조용히 활성 카드로 복귀 (기록도 함께 되돌림)
  function handleUndoComplete(routineId) {
    const newCompleted = new Set(completedIds)
    newCompleted.delete(routineId)
    setCompletedIds(newCompleted)
    storage.setCompletedIds([...newCompleted])
    const completedNames = [...newCompleted].map((cid) => {
      const b = ROUTINE_MAP[cid]
      return (easyIds.has(cid) ? b?.easyVersion?.name : b?.name) ?? '루틴'
    })
    storage.setHistoryEntry(storage.getTodayKey(), todayState, completedNames, routineIds.length)
  }

  // 루틴 카드 수동 재발송 — 교체·난이도 조절로 구성이 바뀐 뒤 사용자가 원할 때
  async function handleResendCard() {
    if (sendingCard) return
    setSendingCard(true)
    const names = routineIds.map((id) => {
      const b = ROUTINE_MAP[id]
      return (easyIds.has(id) ? b?.easyVersion?.name : b?.name) ?? '루틴'
    })
    const ok = await resendRoutineCard(names)
    setSendingCard(false)
    window.alert(ok ? '카카오톡(나와의 채팅)으로 오늘 루틴을 보냈어요.' : '발송하지 못했어요. 카카오 로그인과 알림 설정을 확인해주세요.')
  }

  function handleUndoSkip(routineId) {
    const newSkipped = new Set(skippedIds)
    newSkipped.delete(routineId)
    setSkippedIds(newSkipped)
    storage.setSkippedIds([...newSkipped])
  }

  function handleRequestStateChange() {
    if (completedIds.size > 0) {
      const ok = window.confirm('마음 날씨를 다시 고르면 오늘 기록이 초기화돼요. 계속할까요?')
      if (!ok) return
    }
    ;['onemove_state', 'onemove_routines', 'onemove_completed', 'onemove_easy', 'onemove_easy_auto', 'onemove_swap_used', 'onemove_swapped_out', 'onemove_skipped', 'onemove_review']
      .forEach(k => localStorage.removeItem(k))
    storage.removeHistoryEntry(storage.getTodayKey())
    onGoToStateCheck()
  }

  function handleSwitchToEasy(routineId) {
    const newEasy = new Set([...easyIds, routineId])
    setEasyIds(newEasy)
    storage.setEasyIds([...newEasy])
  }

  // '다른 루틴으로 바꾸기' — 하기 싫은 루틴을 같은 난이도의 다른 루틴으로 교체 (카드당 1회)
  function handleSwapRoutine(routineId) {
    const slotDifficulty = easyIds.has(routineId) ? '쉬움' : (ROUTINE_MAP[routineId]?.difficulty ?? '보통')
    const cand = pickSwapCandidate({
      slotDifficulty,
      oldId: routineId,
      currentIds: routineIds,
      excludeIds: storage.getSwappedOutIds(),
      yesterdayIds: storage.getYesterdayIds(),
    })
    if (!cand) return

    const newIds = routineIds.map((id) => (id === routineId ? cand.id : id))
    setRoutineIds(newIds)
    storage.setTodayRoutineIds(newIds)

    // 쉬운버전 상태 이관: 나간 카드 상태 제거, 들어온 카드가 쉬운버전이면 '시스템 준비'로 표시
    const newEasy = new Set(easyIds)
    newEasy.delete(routineId)
    const newAuto = new Set(autoEasyIds)
    newAuto.delete(routineId)
    if (cand.isEasyMode) {
      newEasy.add(cand.id)
      newAuto.add(cand.id)
    }
    setEasyIds(newEasy)
    storage.setEasyIds([...newEasy])
    setAutoEasyIds(newAuto)
    storage.setAutoEasyIds([...newAuto])

    storage.addSwappedOut(routineId)
    storage.addSwapUsed(cand.id)
    setSwapUsedIds(new Set(storage.getSwapUsedIds()))
  }

  // 쉬운 버전 → 원래(보통) 버전으로 되돌리기. 자동 준비 카드였다면 이후엔 사용자 선택으로 취급
  function handleSwitchToNormal(routineId) {
    const newEasy = new Set(easyIds)
    newEasy.delete(routineId)
    setEasyIds(newEasy)
    storage.setEasyIds([...newEasy])
    if (autoEasyIds.has(routineId)) {
      const newAuto = new Set(autoEasyIds)
      newAuto.delete(routineId)
      setAutoEasyIds(newAuto)
      storage.removeAutoEasy(routineId)
    }
  }

  const completedCount = completedIds.size
  const totalCount = routineIds.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allResolved = totalCount > 0 && routineIds.every((id) => completedIds.has(id) || skippedIds.has(id))

  // 하루 마무리(회고) — 모든 루틴이 정리되면 하루 1회 생성, 이후엔 저장본 재사용
  useEffect(() => {
    if (!allResolved) { setReview(null); return }
    const saved = storage.getTodayReview()
    if (saved) { setReview(saved); return }
    let cancelled = false
    setReview({ loading: true })
    const completedList = routineIds.filter((id) => completedIds.has(id)).map((id) => {
      const b = ROUTINE_MAP[id]
      const r = easyIds.has(id) ? b?.easyVersion : b
      return { name: r?.name ?? '루틴', area: r?.area ?? '' }
    })
    generateDailyReview({ personality: coach, state: todayState, completedList, skippedCount: skippedIds.size, nickname })
      .then((result) => {
        if (cancelled) return
        const value = { message: result.message, source: result.source }
        storage.setTodayReview(value)
        setReview(value)
      })
    return () => { cancelled = true }
  }, [allResolved]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FAF6F0' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          padding: '8px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* 헤더 — 다른 탭과 동일한 공통 ScreenHeader (타이포·위치 통일) */}
        <div>
          <ScreenHeader
            title={nickname ? `${nickname}님, 오늘도 와줘서 고마워요` : '오늘도 와줘서 고마워요'}
            subtitle={`${formatDate()} · ${todayState}`}
            bottomGap={0}
          />
        </div>

        {/* 진행 카드 (딥그린) */}
        <div style={{ background: '#24523F', borderRadius: 22, padding: '17px 19px', boxShadow: '0 14px 30px -14px rgba(36,82,63,.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>
              오늘 <b style={{ color: '#fff', fontWeight: 800 }}>{completedCount} / {totalCount}</b>개 완료
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F3D978' }}>한 걸음씩</span>
          </div>
          <div style={{ marginTop: 11, height: 11, borderRadius: 6, background: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#D9F2EE,#F3D978)', transition: 'width .5s' }} />
          </div>
        </div>

        {/* 루틴 항목 — 완료·쉬어가기 행이 위, 미완료 카드가 아래 */}
        {[
          ...routineIds.filter((id) => completedIds.has(id) || skippedIds.has(id)),
          ...routineIds.filter((id) => !completedIds.has(id) && !skippedIds.has(id)),
        ].map((id) => {
          const base = ROUTINE_MAP[id]
          if (!base) return null

          const isEasy = easyIds.has(id)
          const isDone = completedIds.has(id)
          const isSkipped = skippedIds.has(id)
          const routine = isEasy ? base.easyVersion : base
          const areaChip = AREA_CHIP[routine.area] ?? { bg: '#F0EDE8', color: '#6B7B6F' }
          const canSwap = !pinned.includes(id) && !swapUsedIds.has(id)

          // 완료된 루틴 — 연녹 행. 왼쪽 체크 원을 누르면 체크 해제(카드 복원)
          if (isDone) {
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EFF4EE', borderRadius: 16, padding: '9px 14px' }}>
                <button
                  onClick={() => handleUndoComplete(id)}
                  aria-label="체크를 해제하면 루틴 카드로 돌아가요"
                  style={{ width: 24, height: 24, borderRadius: '50%', background: '#24523F', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <svg width="11" height="11" viewBox="0 0 13 13"><path d="M2 7l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#5c6960', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routine.name}</span>
              </div>
            )
          }

          // 오늘은 쉬어가기 선택 — 차분한 행 (탭하면 되돌리기)
          if (isSkipped) {
            return (
              <div
                key={id}
                onClick={() => handleUndoSkip(id)}
                role="button"
                aria-label="탭하면 쉬어가기를 취소해요"
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F4F1EC', borderRadius: 16, padding: '11px 14px', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: '#9aa39c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routine.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 700, color: '#B07E6C', flex: 'none' }}>오늘은 쉬어가요</span>
              </div>
            )
          }

          // 활성 카드: 칩 행 → 루틴명 한 줄 → (쉬운버전 줄) → 버튼
          // 시안 1·3: 아이콘 왼쪽·칩 오른쪽 / 시안 2: 칩 왼쪽 + 이름·버튼 오른쪽 정렬 / 시안 3: 필 버튼 + 자동 배지 제거
          const chipRow = (
            <div key="chips" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <PinStar active={pinned.includes(id)} onClick={() => togglePin(id)} />
                {canSwap && <SwapIcon onClick={() => handleSwapRoutine(id)} />}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {isEasy && <VersionToggleLink onClick={() => handleSwitchToNormal(id)} />}
                <Chip bg={DIFF_CHIP.bg} color={DIFF_CHIP.color} weight={700}>{routine.difficulty}</Chip>
                <Chip bg={areaChip.bg} color={areaChip.color}>{areaLabel(routine.area)}</Chip>
              </span>
            </div>
          )
          const nameRow = (
            <div key="name" style={{ fontSize: 16.5, fontWeight: 700, color: '#24523F', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routine.name}</div>
          )
          const btnRowStyle = { display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, justifyContent: 'flex-end' }

          // 쉬운 버전으로 진행 중인 활성 카드 — 일반 카드와 같은 뼈대.
          // 사용자가 직접 바꾼 경우에만 배지 줄 표시 (시스템 자동 준비 카드는 배지 없음 — 사용자 확정)
          if (isEasy) {
            const isAuto = autoEasyIds.has(id)
            return (
              <div key={id} style={{ background: '#fff', borderRadius: 20, padding: '12px 15px', boxShadow: '0 12px 24px -15px rgba(36,82,63,.24),inset 0 2px 0 rgba(255,255,255,.9)' }}>
                {chipRow}
                {nameRow}
                {!isAuto && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FBEDE6', borderRadius: 7, padding: '3px 8px', flex: 'none' }}>
                      <svg width="11" height="11" viewBox="0 0 13 13"><path d="M6.5 1.5l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3L1.7 5l3.3-.5z" fill="#E5B4A4" /></svg>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B07E6C' }}>더 쉬운 버전으로 바꿨어요</span>
                    </div>
                  </div>
                )}
                <div style={btnRowStyle}>
                  <button onClick={() => handleSkip(id)} style={{ ...SECONDARY_BTN, color: '#B07E6C', fontWeight: 700 }}>오늘은 쉬어가기</button>
                  <button onClick={() => handleComplete(id)} style={COMPLETE_BTN}>완료</button>
                </div>
              </div>
            )
          }

          // 일반 활성 카드
          return (
            <div key={id} style={{ background: '#fff', borderRadius: 20, padding: '12px 15px', boxShadow: '0 12px 24px -15px rgba(36,82,63,.22),inset 0 2px 0 rgba(255,255,255,.9)' }}>
              {chipRow}
              {nameRow}
              <div style={btnRowStyle}>
                <button onClick={() => handleSwitchToEasy(id)} style={{ ...SECONDARY_BTN, color: '#8a958c' }}>지금은 어려워요</button>
                <button onClick={() => handleComplete(id)} style={COMPLETE_BTN}>완료</button>
              </div>
            </div>
          )
        })}

        {/* 완료 축하 카드 (오늘 루틴을 모두 정리했을 때) */}
        {allResolved && (
          <div style={{ borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 14px 30px -18px rgba(36,82,63,.26)' }}>
            {/* 배너 (풍경 이미지 전체 표시 — 잘림 없음, 세로는 비율대로) */}
            <div style={{ minHeight: 110, background: 'linear-gradient(#F7E7C8,#F3D5C0)' }}>
              <img
                src="/onemove/images/complete-banner.png"
                alt=""
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            {/* 본문 */}
            <div style={{ padding: '16px 20px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#24523F' }}>오늘 하루도 잘 해냈어요</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#7c8a80', marginTop: 7, lineHeight: 1.55, wordBreak: 'keep-all' }}>완료든 쉬어가기든 모두 오늘의 기록이에요.</div>

              {/* 하루 마무리 — 오늘 수행한 루틴 영역을 종합한 코치의 회고 한마디 */}
              {review && (
                <div style={{ marginTop: 14, background: '#FAF6F0', borderRadius: 14, padding: '12px 15px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#9AA69D', letterSpacing: '0.02em' }}>하루 마무리</span>
                    {!review.loading && (
                      <span style={{ fontSize: 10.5, fontWeight: 500, color: '#B7AFA4' }}>출처 · {review.source === 'solar' ? 'AI' : '예비'}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: '#3A4A40', lineHeight: 1.6, margin: '6px 0 0', wordBreak: 'keep-all' }}>
                    {review.loading ? '코치가 오늘 하루를 돌아보고 있어요...' : review.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 하단 보조 액션 — 2단 그리드, 각 칸 가운데 정렬 (알림 미사용자는 1단).
            오늘 루틴이 모두 정리된 뒤에는 완료 축하 화면만 남도록 숨긴다 */}
        {!allResolved && (
          <div style={{ width: '100%', marginTop: 4, display: 'grid', gridTemplateColumns: storage.getNotify() ? '1fr 1fr' : '1fr', justifyItems: 'center' }}>
            <button
              onClick={handleRequestStateChange}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#9aa39c' }}
            >
              마음 날씨 다시 고르기
            </button>
            {storage.getNotify() && (
              <button
                onClick={handleResendCard}
                disabled={sendingCard}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#9aa39c', opacity: sendingCard ? 0.5 : 1 }}
              >
                {sendingCard ? '카톡으로 보내는 중...' : '오늘 루틴 카톡으로 받기'}
              </button>
            )}
          </div>
        )}
      </div>

      {modal && (
        <CoachModal
          loading={modal.loading}
          message={modal.message}
          source={modal.source}
          onClose={() => setModal(null)}
          coach={coach}
        />
      )}
    </div>
  )
}
