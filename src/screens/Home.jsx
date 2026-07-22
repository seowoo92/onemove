import { useState, useEffect } from 'react'
import { ROUTINE_MAP } from '../data/routines'
import { storage } from '../lib/storage'
import { pickRoutines, pickSwapCandidate } from '../lib/routinePicker'
import { generateCoachMessage, generateDailyReview } from '../lib/solar'
import { sendRoutineCard } from '../lib/kakao'
import CoachModal from '../components/CoachModal'
import { COACH_INFO } from '../lib/coaches'

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
  '바깥': '바깥 활동',
  '공간': '공간 정리',
  '연결': '사람 연결',
}
const areaLabel = (area) => AREA_LABEL[area] ?? area

// 코치별 클레이 셰이딩 (완료 축하 카드 아바타)
const CLAY = {
  '유쾌': 'radial-gradient(circle at 34% 30%,#FFEFB6,#F3D978 55%,#E8C24E)',
  '진중': 'radial-gradient(circle at 38% 28%,#3C7A5C,#24523F)',
  '다정': 'radial-gradient(circle at 34% 30%,#F6C6B4,#EFA58F 55%,#E08066)',
}

// 주격 조사 이/가 (받침 있으면 '이')
function subjectParticle(name) {
  const last = name[name.length - 1] ?? ''
  const code = last.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return '가'
  return (code - 0xac00) % 28 === 0 ? '가' : '이'
}

const COMPLETE_BTN = {
  flex: 1,
  textAlign: 'center',
  background: '#F7EBBE',
  color: '#24523F',
  borderRadius: 14,
  padding: 13,
  fontSize: 14.5,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 8px 16px -7px rgba(214,184,90,.38),inset 0 1px 0 rgba(255,255,255,.6)',
}
const SECONDARY_BTN = {
  flex: 1,
  textAlign: 'center',
  borderRadius: 14,
  padding: 13,
  fontSize: 14.5,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
}
// 카드 하단 작은 텍스트 링크 (원래 버전으로 하기 · 다른 루틴으로 바꾸기)
const CARD_LINK = {
  background: 'none',
  border: 'none',
  padding: '2px 6px',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#9aa69d',
  cursor: 'pointer',
}

// 매일 루틴(★) 토글 — 고정하면 매일 추천에 항상 포함
function PinStar({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? '매일 루틴 해제' : '매일 루틴으로 고정'}
      style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', flex: 'none' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? '#F3D978' : 'none'} stroke={active ? '#C9A94E' : '#B9C2BB'} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
      </svg>
    </button>
  )
}

function Chip({ bg, color, weight = 600, children }) {
  return (
    <span
      style={{
        fontSize: 11.5,
        fontWeight: weight,
        color,
        background: bg,
        borderRadius: 8,
        padding: '4px 9px',
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
  const coachName = COACH_INFO[coach]?.name ?? '코치'

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
          padding: '14px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* 헤더 — 인사 + 날짜·마음 날씨 */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#24523F', letterSpacing: '-0.02em' }}>
            {nickname ? `${nickname}님, 오늘도 와줘서 고마워요` : '오늘도 와줘서 고마워요'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#7c8a80', marginTop: 2 }}>
            {formatDate()} · {todayState}
          </div>
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

        {/* 루틴 항목 */}
        {routineIds.map((id) => {
          const base = ROUTINE_MAP[id]
          if (!base) return null

          const isEasy = easyIds.has(id)
          const isDone = completedIds.has(id)
          const isSkipped = skippedIds.has(id)
          const routine = isEasy ? base.easyVersion : base
          const areaChip = AREA_CHIP[routine.area] ?? { bg: '#F0EDE8', color: '#6B7B6F' }

          // 완료된 루틴 — 연녹 행 + 체크 원
          if (isDone) {
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#EFF4EE', borderRadius: 18, padding: '14px 16px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#24523F', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13"><path d="M2 7l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: 15.5, fontWeight: 600, color: '#5c6960', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routine.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#6FB988', flex: 'none' }}>완료</span>
              </div>
            )
          }

          // 오늘은 쉬어가기 선택 — 차분한 행
          if (isSkipped) {
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#F4F1EC', borderRadius: 18, padding: '14px 16px' }}>
                <span style={{ fontSize: 15.5, fontWeight: 600, color: '#9aa39c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routine.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#B07E6C', flex: 'none' }}>오늘은 쉬어가요</span>
              </div>
            )
          }

          // 쉬운 버전으로 전환된 활성 카드
          if (isEasy) {
            return (
              <div key={id} style={{ position: 'relative', background: '#fff', borderRadius: 22, padding: '18px 19px', boxShadow: '0 14px 28px -15px rgba(36,82,63,.26),inset 0 2px 0 rgba(255,255,255,.9)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBEDE6', borderRadius: 9, padding: '5px 10px', marginBottom: 12 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13"><path d="M6.5 1.5l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3L1.7 5l3.3-.5z" fill="#E5B4A4" /></svg>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#B07E6C' }}>{autoEasyIds.has(id) ? '오늘은 쉬운 버전으로 준비했어요' : '더 쉬운 버전으로 바꿨어요'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#9aa69d', textDecoration: 'line-through', fontWeight: 500 }}>{base.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#24523F', marginTop: 5 }}>{base.easyVersion.name}</div>
                  </div>
                  <div style={{ flex: 'none', display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    <PinStar active={pinned.includes(id)} onClick={() => togglePin(id)} />
                    <Chip bg={DIFF_CHIP.bg} color={DIFF_CHIP.color} weight={700}>{routine.difficulty}</Chip>
                    <Chip bg={areaChip.bg} color={areaChip.color}>{areaLabel(routine.area)}</Chip>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
                  <button onClick={() => handleComplete(id)} style={COMPLETE_BTN}>완료</button>
                  <button onClick={() => handleSkip(id)} style={{ ...SECONDARY_BTN, background: '#FBEDE6', color: '#B07E6C', fontWeight: 700 }}>오늘은 쉬어가기</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10 }}>
                  <button onClick={() => handleSwitchToNormal(id)} style={CARD_LINK}>원래 버전으로 하기 ›</button>
                  {!pinned.includes(id) && !swapUsedIds.has(id) && (
                    <button onClick={() => handleSwapRoutine(id)} style={CARD_LINK}>다른 루틴으로 바꾸기 ›</button>
                  )}
                </div>
              </div>
            )
          }

          // 일반 활성 카드
          return (
            <div key={id} style={{ background: '#fff', borderRadius: 22, padding: '18px 19px', boxShadow: '0 12px 24px -15px rgba(36,82,63,.22),inset 0 2px 0 rgba(255,255,255,.9)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#24523F', flex: 1, minWidth: 0 }}>{routine.name}</div>
                <div style={{ flex: 'none', display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                  <PinStar active={pinned.includes(id)} onClick={() => togglePin(id)} />
                  <Chip bg={DIFF_CHIP.bg} color={DIFF_CHIP.color} weight={700}>{routine.difficulty}</Chip>
                  <Chip bg={areaChip.bg} color={areaChip.color}>{areaLabel(routine.area)}</Chip>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 15 }}>
                <button onClick={() => handleComplete(id)} style={COMPLETE_BTN}>완료</button>
                <button onClick={() => handleSwitchToEasy(id)} style={{ ...SECONDARY_BTN, background: '#F1F5F0', color: '#5c6960' }}>지금은 어려워요</button>
              </div>
              {!pinned.includes(id) && !swapUsedIds.has(id) && (
                <button
                  onClick={() => handleSwapRoutine(id)}
                  style={{ ...CARD_LINK, display: 'block', margin: '10px auto 0' }}
                >
                  다른 루틴으로 바꾸기 ›
                </button>
              )}
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, background: '#F4F8F3', borderRadius: 13, padding: '9px 15px' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: CLAY[coach] ?? CLAY['유쾌'] }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#24523F' }}>{coachName}{subjectParticle(coachName)} 오늘의 너를 안아줘요</span>
              </div>

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

        {/* 마음 날씨 다시 고르기 */}
        <button
          onClick={handleRequestStateChange}
          style={{ alignSelf: 'center', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#9aa39c' }}
        >
          마음 날씨 다시 고르기
        </button>
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
