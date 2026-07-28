import { useState, useEffect, useRef } from 'react'
import TabBar from './TabBar'
import { COACH_INFO, COACH_KEYS } from '../lib/coaches'

const FEATURES = [
  '오늘의 마음 날씨에 맞춘 맞춤 루틴',
  '어려우면 더 쉬운 버전으로 — 실패해도 괜찮아요',
  '유쾌·진중·다정, 내가 고른 AI 코치의 격려',
]

// 데스크톱 헤드라인 타이핑 효과용 원문 (멘토링 피드백 7/26)
const HEADLINE = '오늘 할 수 있는 만큼만.'

// ---------- About 모달 (A안 책갈피형, 사용자 확정 7/28) ----------
const AboutH = ({ children }) => (
  <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#24523F', paddingLeft: 11, borderLeft: '3px solid #EE8466', margin: '0 0 8px' }}>{children}</h4>
)
const AboutP = ({ children, last = false }) => (
  <p style={{ fontSize: 13.5, fontWeight: 500, color: '#3A4A40', lineHeight: 1.75, margin: 0, marginBottom: last ? 0 : 14, wordBreak: 'keep-all' }}>{children}</p>
)
const AboutQuote = ({ children }) => (
  <p style={{ fontSize: 14.5, fontWeight: 700, color: '#9B5B45', lineHeight: 1.6, margin: '2px 0 16px', wordBreak: 'keep-all' }}>{children}</p>
)
const StackRow = ({ tag, last = false, children }) => (
  <div style={{ display: 'flex', gap: 12, padding: '11px 0', borderBottom: last ? 'none' : '1px solid #EEE8DC' }}>
    <div style={{ flex: 'none', width: 86, fontSize: 11.5, fontWeight: 800, color: '#24523F', background: '#EFF4EE', borderRadius: 8, padding: '5px 0', textAlign: 'center', height: 'fit-content' }}>{tag}</div>
    <div style={{ fontSize: 13, fontWeight: 500, color: '#3A4A40', lineHeight: 1.6, wordBreak: 'keep-all' }}>{children}</div>
  </div>
)

const ABOUT_SECTIONS = [
  {
    label: '만든 사람',
    sub: '오늘만큼을 기획하고, 디자인하고, 개발했습니다',
    body: (
      <>
        <AboutQuote>"무기력한 날의 나에게 필요했던 도구를 직접 만들었습니다."</AboutQuote>
        <AboutH>김서우</AboutH>
        <AboutP>
          AI Reboot 교육과정에서 개발을 배우면서, 배운 것으로 가장 만들고 싶었던 건 화려한 서비스가 아니라 '못한 날을 견디게 돕는 도구'였습니다.
          무기력은 게으름이 아니라는 걸 알기에, 실패해도 죄책감 없이 다시 시작하는 경험을 설계했습니다.
        </AboutP>
        <AboutP>오늘만큼은 잘하게 만드는 앱이 아니라, 어떤 날이든 괜찮다고 말해주는 앱입니다.</AboutP>
        <div style={{ height: 1, background: '#E8E2D6', margin: '18px 0 12px' }} />
        <a href="mailto:seowoo92@gmail.com" style={{ fontSize: 12.5, fontWeight: 600, color: '#6F7D72', textDecoration: 'none' }}>seowoo92@gmail.com</a>
      </>
    ),
  },
  {
    label: '기획 의도',
    sub: '잘하게 만드는 앱이 아니라, 괜찮다고 말해주는 앱',
    body: (
      <>
        <AboutH>무기력은 게으름이 아니니까</AboutH>
        <AboutP>
          취업·학업·대인관계 스트레스로 무기력을 겪는 청년들은 하려는 마음이 없는 게 아니라, 시작할 힘이 모자란 상태입니다.
          오늘만큼은 그 상태를 탓하지 않고, 오늘 마음 날씨에 맞춰 딱 할 수 있는 만큼만 제안합니다.
        </AboutP>
        <AboutH>심리학 원리를 일상의 언어로</AboutH>
        <AboutP>
          인지행동치료(CBT)에서 검증된 원리들을 빌렸습니다 — 생각보다 행동을 먼저 움직이는 행동 활성화, 어려우면 단계를 낮추는 과제 단계화,
          마음 날씨로 기분을 살피는 기분 모니터링, 완료가 정원으로 쌓이는 긍정적 강화.
          치료 도구가 아니라, 원리를 차용한 일상 자기관리 도구입니다.
        </AboutP>
        <AboutH>실패까지 설계했습니다</AboutH>
        <AboutP last>
          어려우면 쉬운 버전으로 바꾸고, 쉬어가는 날도 오늘의 기록으로 인정합니다. 정원은 시들지 않고, 계절이 끝나면 앨범으로 갈무리됩니다.
          실패해도 죄책감 없이 다시 시작하는 경험 — 모든 기능이 그 한 문장을 향합니다.
        </AboutP>
      </>
    ),
  },
  {
    label: '스토리',
    sub: '여러 앱을 써봤지만',
    body: (
      <>
        <AboutP>무기력에서 벗어나고 싶어서, 남들처럼 앱부터 깔았습니다.</AboutP>
        <AboutP>
          처음엔 루틴 플래너였습니다. 예쁜 계획표를 짜는 것까지는 좋았는데, 문제는 계획을 세울 힘조차 없는 날이었습니다.
          그런 날이 며칠 이어지면 실천율 숫자가 떨어졌고, 앱을 열 때마다 "며칠째 안 했다"는 기록이 먼저 보였습니다.
          나를 도우려던 앱이 어느새 죄책감을 주는 앱이 되어 있었습니다.
        </AboutP>
        <AboutP>
          감정 관리 앱도 써봤습니다. 내 감정에 이름을 붙이고 패턴을 보는 건 의미가 있었지만, 화면을 닫고 나면 같은 질문이 남았습니다.
          "그래서, 오늘 나는 뭘 하면 되지?"
        </AboutP>
        <AboutP>
          전문적인 심리치료 프로그램도 써봤습니다. 근거는 탄탄했지만, 하루 20분씩 글을 쓰는 50일 코스와 월 10만 원 가까운 비용은 —
          역설적이게도 — 가장 무기력한 사람이 넘기 가장 어려운 문턱이었습니다.
        </AboutP>
        <AboutP>
          제게 필요한 건 관리 도구도, 분석 리포트도, 치료 프로그램도 아니었습니다.
          <b> 오늘 내 상태를 묻고, 딱 그만큼만 건네주고, 못 해도 괜찮다고 말해주는 것.</b> 그 단순한 도구가 없어서, 직접 만들었습니다.
        </AboutP>
        <AboutP last>
          마음 날씨를 고르면 오늘 할 수 있는 만큼만 도착하고, 어려우면 더 쉬워지고, 쉬어가도 기록이 되는 서비스.
          무기력한 날의 저에게 필요했던 도구, 오늘만큼입니다.
        </AboutP>
      </>
    ),
  },
  {
    label: '기술 스택',
    sub: '혼자서, 화면부터 서버까지',
    body: (
      <>
        <StackRow tag="화면">
          <b style={{ fontWeight: 700, color: '#24523F' }}>React 19 · Vite · Tailwind CSS v4</b> — 모바일 우선 반응형, 데스크톱은 폰 목업 프레임으로 배려
        </StackRow>
        <StackRow tag="AI 코치">
          <b style={{ fontWeight: 700, color: '#24523F' }}>업스테이지 Solar Pro</b> — 서버 프록시로 키 보호, 품질 게이트 6단계 + 예비 메시지 안전망
        </StackRow>
        <StackRow tag="서버">
          <b style={{ fontWeight: 700, color: '#24523F' }}>Supabase</b> — 카카오 로그인, 기기 간 동기화 DB, Edge Functions 4종, 매일 18시 리마인더(pg_cron)
        </StackRow>
        <StackRow tag="알림">
          <b style={{ fontWeight: 700, color: '#24523F' }}>카카오톡 '나에게 보내기' + 웹 푸시(PWA)</b> — 루틴 카드와 저녁 리마인더 2채널
        </StackRow>
        <StackRow tag="배포" last>
          <b style={{ fontWeight: 700, color: '#24523F' }}>GitHub Pages</b> — 설치 없이 웹에서 바로, 홈 화면 설치(PWA)는 선택
        </StackRow>
      </>
    ),
  },
  {
    label: '앞으로의 계획',
    sub: '오늘만큼은 계속 자랍니다',
    body: (
      <>
        <AboutH>정원의 사계절</AboutH>
        <AboutP>
          지금 정원은 여름입니다. 9월이 오면 가을 세트가 열리고, 실사용자의 첫 완성 앨범이 만들어집니다. 겨울과 봄도 차례로 준비합니다.
        </AboutP>
        <AboutH>코치와의 대화</AboutH>
        <AboutP>
          지금 코치는 격려를 건네는 존재입니다. 다음 단계는 선택지 기반의 짧은 대화 —
          마음이 힘든 사용자를 마주하는 기능인 만큼, 안전 설계를 갖춘 뒤 신중하게 열 계획입니다.
        </AboutP>
        <AboutH>더 깊은 개인화</AboutH>
        <AboutP last>
          완료 패턴을 반영한 루틴 추천 고도화, 카카오 루틴 카드의 동적 이미지, 비 온 날 완료하면 뜨는 무지개 배너 같은 작은 디테일까지 —
          회복의 경험을 계속 다듬어 갑니다.
        </AboutP>
      </>
    ),
  },
]

function useViewportMode() {
  const getMode = () => {
    const w = window.innerWidth
    if (w >= 1024) return 'desktop'
    if (w >= 480) return 'tablet'
    return 'mobile'
  }
  const [mode, setMode] = useState(getMode)
  useEffect(() => {
    const handler = () => setMode(getMode())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mode
}

// 아래로 더 스크롤할 내용이 있을 때 하단에 표시되는 화살표 안내
function ScrollHint({ scrollRef, bottom }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = scrollRef?.current ?? null
    const measure = () => {
      let top, sh, ch
      if (el) {
        top = el.scrollTop; sh = el.scrollHeight; ch = el.clientHeight
      } else {
        const d = document.documentElement
        top = window.scrollY || d.scrollTop; sh = d.scrollHeight; ch = window.innerHeight
      }
      setShow(sh - ch - top > 40)
    }
    measure()
    const target = el ?? window
    target.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      ro.observe(el ?? document.body)
    }
    // 콘텐츠가 늦게 그려지거나 탭 전환 시에도 확실히 갱신되도록 주기 재측정
    const id = setInterval(measure, 400)
    return () => {
      target.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      if (ro) ro.disconnect()
      clearInterval(id)
    }
  }, [scrollRef])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '50%',
        bottom,
        transform: 'translateX(-50%)',
        zIndex: 35,
        pointerEvents: 'none',
        opacity: show ? 1 : 0,
        transition: 'opacity .25s',
      }}
    >
      <style>{`@keyframes scrollHintBob{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}`}</style>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: 'rgba(36,82,63,.55)',
          boxShadow: '0 6px 14px -6px rgba(36,82,63,.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scrollHintBob 1.4s ease-in-out infinite',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6.5l4 4 4-4" />
        </svg>
      </div>
    </div>
  )
}

export default function AppLayout({ children, showTabBar = false, activeTab = 'home', onTabChange = () => {} }) {
  const mode = useViewportMode()
  const bezelRef = useRef(null)
  const [aboutOpen, setAboutOpen] = useState(false) // 데스크톱 About 모달 — 멘토링 피드백 7/26, 7/28 책갈피 5탭으로 확장
  const [aboutTab, setAboutTab] = useState(0)

  // ---------- 데스크톱 연출 3종 (멘토링 피드백 7/26) ----------
  const reduceMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current
  // ① 헤드라인 타이핑
  const [typedLen, setTypedLen] = useState(0)
  useEffect(() => {
    if (mode !== 'desktop') return
    if (reduceMotion) {
      setTypedLen(HEADLINE.length)
      return
    }
    setTypedLen(0)
    const id = setInterval(() => {
      setTypedLen((n) => {
        if (n >= HEADLINE.length) {
          clearInterval(id)
          return n
        }
        return n + 1
      })
    }, 130)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])
  // ② 마우스 따라 메인 3색 배경 무빙 — 리렌더 없이 DOM 직접 갱신(rAF 러프)
  const blobLayerRef = useRef(null)
  useEffect(() => {
    if (mode !== 'desktop' || reduceMotion) return
    const layer = blobLayerRef.current
    if (!layer) return
    const blobs = [...layer.children]
    const factors = [0.06, -0.05, 0.04]
    let tx = 0, ty = 0, cx = 0, cy = 0, raf
    const onMove = (e) => {
      tx = e.clientX - window.innerWidth / 2
      ty = e.clientY - window.innerHeight / 2
    }
    const tick = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      blobs.forEach((b, i) => {
        b.style.transform = `translate3d(${cx * factors[i]}px, ${cy * factors[i]}px, 0)`
      })
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])
  // ③ 코치 캐릭터 캐러셀
  const [coachIdx, setCoachIdx] = useState(0)
  const carouselCoach = COACH_INFO[COACH_KEYS[coachIdx]]

  // 모바일/태블릿: 중앙 정렬 + 그림자(태블릿만) + 조건부 고정 탭바
  if (mode !== 'desktop') {
    return (
      <>
        <div style={{ height: '100vh', backgroundColor: mode === 'tablet' ? '#FFFFFF' : '#FAF6F0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: mode === 'tablet' ? '480px' : '100%',
            height: '100vh',
            backgroundColor: '#FAF6F0',
            boxShadow: mode === 'tablet' ? '0 8px 30px rgba(0,0,0,0.08)' : 'none',
          }}>
            {/* 상단 안전영역: 홈 화면 설치 앱(standalone)에서 노치·상태바가 콘텐츠를 덮지 않도록 확보 — 일반 브라우저에선 env()가 0 */}
            <div style={{ paddingTop: 'calc(6px + env(safe-area-inset-top))', paddingBottom: showTabBar ? 'calc(56px + max(calc(env(safe-area-inset-bottom) - 12px), 5px))' : 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
          </div>
        </div>
        {showTabBar && (
          <TabBar
            activeTab={activeTab}
            onTabChange={onTabChange}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '480px',
              zIndex: 40,
            }}
          />
        )}
        {/* ScrollHint: 스크롤 콘텐츠가 있는 기록 탭에서만 표시 (2026-07-21) */}
        {showTabBar && activeTab === 'record' && (
          <ScrollHint scrollRef={null} bottom={'calc(64px + max(calc(env(safe-area-inset-bottom) - 12px), 5px))'} />
        )}
      </>
    )
  }

  // 데스크톱: 좌우 2단 레이아웃 + 폰 프레임
  return (
    <div className="flex min-h-screen items-center" style={{ backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>

      {/* 마우스 따라 움직이는 메인 3색 배경 블롭 (멘토링 피드백 7/26) — reduced-motion 시 정지 */}
      <div ref={blobLayerRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-12%', right: '4%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,132,102,0.11), transparent 70%)', filter: 'blur(70px)', willChange: 'transform' }} />
        <div style={{ position: 'absolute', bottom: '-14%', left: '2%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(243,217,120,0.16), transparent 70%)', filter: 'blur(70px)', willChange: 'transform' }} />
        <div style={{ position: 'absolute', top: '26%', left: '40%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(36,82,63,0.08), transparent 70%)', filter: 'blur(80px)', willChange: 'transform' }} />
      </div>

      {/* 좌측 소개 패널 — 높이를 폰 프레임(812+16)과 맞춰 About·저작권을 프레임 하단 라인에 정렬 */}
      <div className="flex-1 flex items-center justify-end pr-10 xl:pr-16 py-16" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '520px', width: '100%', height: 828, display: 'flex', flexDirection: 'column' }}>
        {/* 본문 항목들을 세로로 고르게 분산 — 위쪽 뭉침 해소 (사용자 피드백 7/27) */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', paddingBottom: 18 }}>
          {/* 브랜드 마크 */}
          <div className="flex items-center gap-2.5 mb-8">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#F6C6B4,#EFA58F 55%,#E08066)' }} />
              <div style={{ width: 23, height: 23, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#FFEFB6,#F3D978 55%,#E8C24E)', marginLeft: -7 }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 38% 28%,#3C7A5C,#1C4030)', marginLeft: -7 }} />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#24523F' }}>오늘만큼</span>
          </div>

          {/* 헤드라인 — 한 줄 타이핑 효과, 캐럿은 완료 후에도 상시 깜빡임 (사용자 확정 7/27) */}
          <h1 className="font-bold mb-5" style={{ fontSize: 32, color: '#24523F', letterSpacing: '-0.04em', lineHeight: 1.3, whiteSpace: 'nowrap', minHeight: '1.3em' }}>
            {HEADLINE.slice(0, typedLen)}
            <span className="caret-blink" style={{ display: 'inline-block', width: 3, height: '0.85em', background: '#24523F', marginLeft: 5, verticalAlign: '-0.08em' }} />
          </h1>

          {/* 캐릭터(좌) + 텍스트 뭉치(우) 2단 레이아웃 — 캐릭터 아래엔 코치명만 (사용자 요청 7/27)
              stretch + space-between: 텍스트 첫 줄이 캐릭터 머리, 마지막 줄이 '코치명'과 같은 라인 */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 34, marginBottom: 20 }}>
            {/* 코치 캐릭터 캐러셀 — 꺽쇠(원형 24px·꺽쇠 16px)를 캐릭터 좌우 투명 여백 위에 겹침 */}
            <div style={{ flex: 'none', width: 150, textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                {/* key 교체로 부드러운 페이드 재생 (coach-swap 0.45s, opacity만) */}
                <img
                  key={coachIdx}
                  src={carouselCoach.image}
                  alt={carouselCoach.name}
                  className="coach-swap"
                  style={{ width: '100%', height: 180, objectFit: 'contain', display: 'block' }}
                />
                <button
                  onClick={() => setCoachIdx((i) => (i + COACH_KEYS.length - 1) % COACH_KEYS.length)}
                  aria-label="이전 코치 보기"
                  style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #E7E1D6', boxShadow: '0 6px 14px -8px rgba(36,82,63,.25)', cursor: 'pointer', fontSize: 16, color: '#24523F', lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="no-press"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCoachIdx((i) => (i + 1) % COACH_KEYS.length)}
                  aria-label="다음 코치 보기"
                  style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #E7E1D6', boxShadow: '0 6px 14px -8px rgba(36,82,63,.25)', cursor: 'pointer', fontSize: 16, color: '#24523F', lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="no-press"
                >
                  ›
                </button>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 800, color: '#24523F', margin: '6px 0 0' }}>{carouselCoach.name}</p>
            </div>

            {/* 설명 + 핵심 3가지 — 캐릭터 컬럼과 상·하단 라인 정렬
                paddingTop 14: 캐릭터 PNG 상단 투명 여백만큼 내려 정수리 라인에 첫 줄을 맞춤 */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#6f7d72', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'nowrap' }}>
                무리하지 않은 오늘도 괜찮아요.<br />
                오늘의 마음 날씨에 맞춰 딱 할 수 있는 만큼의<br />
                회복 루틴을 AI 코치가 제안해요.
              </p>
              <ul className="flex flex-col gap-2">
                {FEATURES.map((text) => (
                  <li key={text} className="flex items-start gap-2.5" style={{ fontSize: 13.5, color: '#22302A', whiteSpace: 'nowrap' }}>
                    <span className="font-bold select-none" style={{ color: '#EE8466', marginTop: 1 }}>·</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: '#E0DACE', marginBottom: 20 }} />

          {/* QR + 안내 */}
          <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
            <div style={{ flex: 'none', width: 92, height: 92, borderRadius: 14, background: '#fff', border: '1px solid #E7E1D6', padding: 9, boxSizing: 'border-box', boxShadow: '0 8px 18px -14px rgba(36,82,63,.3)' }}>
              <img src="/onemove/images/qr-onemove.svg" alt="오늘만큼 QR 코드" width={72} height={72} style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#24523F', lineHeight: 1.6 }}>
              휴대폰으로 스캔하면<br />
              <span style={{ color: '#6f7d72', fontWeight: 500 }}>손안에서 바로 시작해요</span>
            </p>
          </div>

          {/* 슬로건 */}
          <p style={{ fontSize: 16, fontWeight: 800, color: '#24523F', lineHeight: 1.4, margin: 0 }}>
            오늘만큼, 딱 그만큼<br />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#9aa69d', letterSpacing: '0.02em' }}>One move a day</span>
          </p>

        </div>

        {/* About 버튼(테두리 필 + 둥둥 부유) + 저작권 표기 — 폰 프레임 하단 라인에 정렬 (7/28 사용자 확정) */}
        <div style={{ flex: 'none' }}>
          <div className="about-float" style={{ display: 'inline-block' }}>
            <button
              onClick={() => { setAboutTab(0); setAboutOpen(true) }}
              style={{ display: 'inline-block', background: '#FFFFFF', border: '1.5px solid #24523F', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 800, color: '#24523F', cursor: 'pointer', letterSpacing: '0.01em', boxShadow: '0 12px 24px -16px rgba(36,82,63,.45)' }}
            >
              About 오늘만큼
            </button>
          </div>
          <p style={{ fontSize: 11.5, fontWeight: 500, color: '#B7AFA4', letterSpacing: '0.02em', margin: '10px 0 0' }}>
            Designed &amp; Developed by Seowoo Kim
          </p>
        </div>
        </div>
      </div>

      {/* 우측 폰 프레임 (2026-07-26 사용자 확정: 딥그린 슬림 그라데이션 프레임, 노치 없음) */}
      <div className="flex-1 flex items-center justify-start pl-10 xl:pl-16 py-12" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            flexShrink: 0,
            padding: 8,
            background: 'linear-gradient(150deg,#2F604B 0%,#1C3F2F 55%,#142E22 100%)',
            borderRadius: 48,
            // 그린 톤 깊은 그림자 + 상단 안쪽 하이라이트로 입체감
            boxShadow: '0 40px 80px -30px rgba(20,46,34,.45), inset 0 1px 1px rgba(255,255,255,.28)',
          }}
        >
        <div
          style={{
            position: 'relative',
            width: '390px',
            flexShrink: 0,
            height: '812px',
            borderRadius: '40px',
            overflow: 'hidden',
            // CSS 트릭: position:fixed 자식들이 프레임 기준으로 고정됨 (CoachModal, TabBar)
            transform: 'translateZ(0)',
          }}
        >
          {/* 스크롤 가능한 앱 콘텐츠 */}
          <div
            ref={bezelRef}
            className="[&::-webkit-scrollbar]:hidden"
            style={{ height: '812px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', backgroundColor: '#FAF6F0' }}
          >
            <div style={{ paddingTop: '26px', paddingLeft: '8px', paddingRight: '8px', paddingBottom: showTabBar ? '58px' : 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
            {showTabBar && (
              <TabBar
                activeTab={activeTab}
                onTabChange={onTabChange}
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40 }}
              />
            )}
            {showTabBar && activeTab === 'record' && <ScrollHint scrollRef={bezelRef} bottom={66} />}
          </div>
        </div>
        </div>
      </div>

      {/* About 모달 — A안 책갈피형: 좌측 5개 메뉴 + 우측 내용 (사용자 확정 7/28) */}
      {aboutOpen && (
        <div
          onClick={() => setAboutOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,46,34,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#FAF6F0', borderRadius: 26, width: 780, maxWidth: '94vw', height: 560, maxHeight: '86vh', display: 'flex', overflow: 'hidden', boxShadow: '0 30px 70px -20px rgba(20,46,34,.5)', position: 'relative' }}
          >
            <button
              onClick={() => setAboutOpen(false)}
              aria-label="닫기"
              style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #EAE3D7', cursor: 'pointer', fontSize: 14, color: '#6F7D72', lineHeight: 1, zIndex: 5 }}
            >
              ✕
            </button>

            {/* 좌측 책갈피 */}
            <div style={{ width: 196, flex: 'none', padding: '30px 20px 26px', borderRight: '1px solid #EAE3D7', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 15, height: 15, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#F6C6B4,#EFA58F 55%,#E08066)' }} />
                <span style={{ width: 19, height: 19, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#FFEFB6,#F3D978 55%,#E8C24E)', marginLeft: -6 }} />
                <span style={{ width: 23, height: 23, borderRadius: '50%', background: 'radial-gradient(circle at 38% 28%,#3C7A5C,#1C4030)', marginLeft: -6 }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#24523F', marginTop: 10 }}>About 오늘만큼</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#B7AFA4', letterSpacing: '0.06em', marginTop: 3 }}>ABOUT ONEMOVE</div>
              <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ABOUT_SECTIONS.map((s, i) => {
                  const on = i === aboutTab
                  return (
                    <button
                      key={s.label}
                      onClick={() => setAboutTab(i)}
                      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: 'none', background: on ? '#FFFFFF' : 'none', borderRadius: 11, fontSize: 13.5, fontWeight: on ? 800 : 600, color: on ? '#24523F' : '#9AA69D', textAlign: 'left', cursor: 'pointer', boxShadow: on ? '0 6px 14px -10px rgba(36,82,63,.25)' : 'none', fontFamily: 'inherit' }}
                    >
                      {on && <span style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 3, borderRadius: 2, background: '#EE8466' }} />}
                      <span style={{ fontSize: 11, fontWeight: 800, color: on ? '#EE8466' : '#C9C2B4', letterSpacing: '0.03em', width: 18 }}>{String(i + 1).padStart(2, '0')}</span>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 우측 내용 — 탭 전환 시 페이드(coach-swap 재사용), 길면 이 영역만 스크롤 */}
            <div key={aboutTab} className="coach-swap [&::-webkit-scrollbar]:hidden" style={{ flex: 1, padding: '34px 38px 30px', overflowY: 'auto', scrollbarWidth: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#EE8466' }}>{String(aboutTab + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 21, fontWeight: 800, color: '#24523F', letterSpacing: '-0.02em' }}>{ABOUT_SECTIONS[aboutTab].label}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#9AA69D', marginBottom: 22 }}>{ABOUT_SECTIONS[aboutTab].sub}</div>
              {ABOUT_SECTIONS[aboutTab].body}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
