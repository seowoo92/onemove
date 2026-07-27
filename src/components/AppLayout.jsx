import { useState, useEffect, useRef } from 'react'
import TabBar from './TabBar'

const FEATURES = [
  '오늘의 마음 날씨에 맞춘 맞춤 루틴',
  '어려우면 더 쉬운 버전으로 — 실패해도 괜찮아요',
  '유쾌·진중·다정, 내가 고른 AI 코치의 격려',
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
  const [aboutOpen, setAboutOpen] = useState(false) // 데스크톱 About(만든 사람) 모달 — 멘토링 피드백 7/26

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
            <div style={{ paddingTop: '6px', paddingBottom: showTabBar ? 'calc(56px + max(calc(env(safe-area-inset-bottom) - 12px), 5px))' : 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
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
    <div className="flex min-h-screen items-center" style={{ backgroundColor: '#FFFFFF' }}>

      {/* 좌측 소개 패널 — 높이를 폰 프레임(812+16)과 맞춰 About·저작권을 프레임 하단 라인에 정렬 */}
      <div className="flex-1 flex items-center justify-end pr-10 xl:pr-16 py-16">
        <div style={{ maxWidth: '400px', width: '100%', height: 828, display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto 0' }}>
          {/* 브랜드 마크 */}
          <div className="flex items-center gap-2.5 mb-8">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#F6C6B4,#EFA58F 55%,#E08066)' }} />
              <div style={{ width: 23, height: 23, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#FFEFB6,#F3D978 55%,#E8C24E)', marginLeft: -7 }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 38% 28%,#3C7A5C,#1C4030)', marginLeft: -7 }} />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#24523F' }}>오늘만큼</span>
          </div>

          {/* 헤드라인 */}
          <h1 className="font-bold mb-5" style={{ fontSize: 38, color: '#24523F', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
            오늘 할 수 있는<br />만큼만.
          </h1>

          {/* 설명 */}
          <p style={{ fontSize: 15, fontWeight: 500, color: '#6f7d72', lineHeight: 1.75, marginBottom: 26 }}>
            무리하지 않은 오늘도 괜찮아요.<br />
            오늘의 마음 날씨에 맞춰 딱 할 수 있는 만큼의<br />
            회복 루틴을 AI 코치가 제안해요.
          </p>

          {/* 핵심 3가지 */}
          <ul className="flex flex-col gap-3" style={{ marginBottom: 28 }}>
            {FEATURES.map((text) => (
              <li key={text} className="flex items-start gap-2.5" style={{ fontSize: 14.5, color: '#22302A' }}>
                <span className="font-bold select-none" style={{ color: '#EE8466', marginTop: 1 }}>·</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* 구분선 */}
          <div style={{ height: 1, background: '#E0DACE', marginBottom: 26 }} />

          {/* QR + 안내 */}
          <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
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

        {/* About 메뉴 + 저작권 표기 — 폰 프레임 하단 라인에 정렬 (멘토링 피드백 7/26, 문안 사용자 확정) */}
        <div style={{ flex: 'none' }}>
          <button
            onClick={() => setAboutOpen(true)}
            style={{ display: 'block', background: 'none', border: 'none', padding: 0, fontSize: 12.5, fontWeight: 700, color: '#6F7D72', cursor: 'pointer', letterSpacing: '0.01em' }}
          >
            About — 만든 사람 ›
          </button>
          <p style={{ fontSize: 11.5, fontWeight: 500, color: '#B7AFA4', letterSpacing: '0.02em', margin: '8px 0 0' }}>
            Designed &amp; Developed by Seowoo Kim
          </p>
        </div>
        </div>
      </div>

      {/* 우측 폰 프레임 (2026-07-26 사용자 확정: 딥그린 슬림 그라데이션 프레임, 노치 없음) */}
      <div className="flex-1 flex items-center justify-start pl-10 xl:pl-16 py-12">
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

      {/* About 모달 — 만든 사람·기획의도 (초안 반영 7/27, 추후 수정 예정) */}
      {aboutOpen && (
        <div
          onClick={() => setAboutOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,46,34,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#FAF6F0', borderRadius: 26, maxWidth: 480, width: '100%', padding: '36px 38px', boxShadow: '0 30px 70px -20px rgba(20,46,34,.5)', position: 'relative' }}
          >
            <button
              onClick={() => setAboutOpen(false)}
              aria-label="닫기"
              style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #EAE3D7', cursor: 'pointer', fontSize: 14, color: '#6F7D72', lineHeight: 1 }}
            >
              ✕
            </button>
            {/* 클레이 3점 마크 — 원본과 동일하게 점점 커지는 형태 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#F6C6B4,#EFA58F 55%,#E08066)' }} />
              <span style={{ width: 23, height: 23, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%,#FFEFB6,#F3D978 55%,#E8C24E)', marginLeft: -7 }} />
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 38% 28%,#3C7A5C,#1C4030)', marginLeft: -7 }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#24523F', margin: 0 }}>김서우</h2>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#6F7D72', margin: '4px 0 0' }}>오늘만큼을 기획하고, 디자인하고, 개발했습니다.</p>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: '#9B5B45', lineHeight: 1.6, margin: '18px 0 0', wordBreak: 'keep-all' }}>
              "무기력한 날의 나에게 필요했던 도구를 직접 만들었습니다."
            </p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: '#3A4A40', lineHeight: 1.75, margin: '14px 0 0', wordBreak: 'keep-all' }}>
              AI Reboot 교육과정에서 개발을 배우면서, 배운 것으로 가장 만들고 싶었던 건 화려한 서비스가 아니라 '못한 날을 견디게 돕는 도구'였습니다.
              무기력은 게으름이 아니라는 걸 알기에, 실패해도 죄책감 없이 다시 시작하는 경험을 설계했습니다.
            </p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: '#3A4A40', lineHeight: 1.75, margin: '10px 0 0', wordBreak: 'keep-all' }}>
              오늘만큼은 잘하게 만드는 앱이 아니라, 어떤 날이든 괜찮다고 말해주는 앱입니다.
            </p>
            <div style={{ height: 1, background: '#E8E2D6', margin: '20px 0 14px' }} />
            <a href="mailto:seowoo92@gmail.com" style={{ fontSize: 12.5, fontWeight: 600, color: '#6F7D72', textDecoration: 'none' }}>
              seowoo92@gmail.com
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
