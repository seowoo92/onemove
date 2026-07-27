import { useRef, useState } from 'react'

// 첫 실행 온보딩 가이드 (2026-07-27, 실사용 테스트 피드백 — 설치 안내 부족) —
// 실제 앱 화면을 미니 폰 프레임에 담아 3장 + 앱 설치 안내 1장. 문구는 사용자 확정본.
// 최초 방문(코치 없음 + 미열람)에만 웰컴 앞에 표시. 설치된 앱(standalone)에서는 설치 장 생략.

const BASE = import.meta.env.BASE_URL

// 접속 브라우저 감지 — 해당 사용자의 설치 방법을 맨 위에 강조
function detectBrowser() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  if (isIOS && /CriOS/.test(ua)) return 'ios-chrome'
  if (isIOS) return 'ios-safari'
  if (/Android/.test(ua)) return 'android'
  return null
}

const INSTALL_METHODS = [
  { key: 'ios-safari', title: '아이폰 사파리', desc: '하단 공유 버튼 → [홈 화면에 추가]' },
  { key: 'ios-chrome', title: '아이폰 크롬', desc: '주소창 옆 공유 버튼 → [홈 화면에 추가] → [추가]' },
  { key: 'android', title: '안드로이드 크롬', desc: '오른쪽 위 점 세 개 메뉴 → [앱 설치]' },
]

const FEATURE_PAGES = [
  {
    id: 'weather',
    title: '먼저, 오늘 마음 날씨를 골라요',
    sub: '좋은 날엔 네 개, 힘든 날엔 두 개.\n딱 오늘만큼만 추천해요.',
    image: `${BASE}images/onboard-weather.png`,
  },
  {
    id: 'home',
    title: '부담되면 더 쉽게 바꿀 수 있어요',
    sub: '쉬어가는 것도 하나의 선택이에요.\n완료하면 AI 코치가 축하해 줘요.',
    image: `${BASE}images/onboard-home.png`,
  },
  {
    id: 'garden',
    title: '하나씩 끝낼 때마다 정원이 자라요',
    sub: '쉬어간 날이 있어도 시들지 않아요.\n계절이 끝나면 앨범에 사진으로 남아요.',
    image: `${BASE}images/onboard-garden.png`,
  },
]

export default function OnboardingGuide({ onDone }) {
  // 이미 설치된 앱에서 열었다면 설치 안내 장은 필요 없다
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  const pageCount = isStandalone ? FEATURE_PAGES.length : FEATURE_PAGES.length + 1
  const [index, setIndex] = useState(0)
  const scrollRef = useRef(null)
  const browser = detectBrowser()
  const methods = [...INSTALL_METHODS].sort((a, b) => (a.key === browser ? -1 : b.key === browser ? 1 : 0))

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(Math.max(0, Math.min(pageCount - 1, i)))
  }

  function goNext() {
    if (index >= pageCount - 1) {
      onDone()
      return
    }
    const el = scrollRef.current
    el?.scrollTo({ left: (index + 1) * el.clientWidth, behavior: 'smooth' })
  }

  const isLast = index === pageCount - 1

  return (
    <div style={{ height: '100%', backgroundColor: '#FAF6F0', position: 'relative', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* 건너뛰기 */}
      <button
        onClick={onDone}
        style={{ position: 'absolute', top: 18, right: 20, zIndex: 5, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#9AA39C', cursor: 'pointer', padding: 6 }}
      >
        건너뛰기
      </button>

      {/* 가로 스와이프 페이지 (scroll-snap) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="[&::-webkit-scrollbar]:hidden"
        style={{ flex: 1, minHeight: 0, display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {FEATURE_PAGES.map((p) => (
          <div key={p.id} style={{ flex: 'none', width: '100%', height: '100%', scrollSnapAlign: 'start', padding: '54px 28px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#24523F', letterSpacing: '-0.03em', lineHeight: 1.38, margin: 0, wordBreak: 'keep-all' }}>{p.title}</h2>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: '#6F7D72', lineHeight: 1.65, margin: '9px 0 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{p.sub}</p>
            {/* 실제 화면 미니 프레임 — 데스크톱 폰 프레임과 같은 딥그린 그라데이션 */}
            <div style={{ marginTop: 20, flex: 'none', padding: 5, borderRadius: 30, background: 'linear-gradient(150deg,#2F604B 0%,#1C3F2F 55%,#142E22 100%)', boxShadow: '0 22px 44px -20px rgba(20,46,34,.45)' }}>
              <img src={p.image} alt="" style={{ width: 200, display: 'block', borderRadius: 25 }} />
            </div>
          </div>
        ))}

        {!isStandalone && (
          <div style={{ flex: 'none', width: '100%', height: '100%', scrollSnapAlign: 'start', padding: '54px 28px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#24523F', letterSpacing: '-0.03em', lineHeight: 1.38, margin: 0, wordBreak: 'keep-all' }}>홈 화면에 추가하면 앱이 돼요</h2>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: '#6F7D72', lineHeight: 1.65, margin: '9px 0 0', wordBreak: 'keep-all' }}>
              홈 화면에 추가하면 아이콘으로 바로 열리고,<br />알림도 이 앱으로 도착해요.
            </p>
            {/* 설치된 모습 목업 — 폰 상단 절반: 18시 푸시 배너 도착 + 홈 화면 아이콘 (사용자 확정 7/27) */}
            <img
              src={`${BASE}images/onboard-install.png`}
              alt=""
              style={{ marginTop: 18, width: 280, display: 'block', filter: 'drop-shadow(0 18px 30px rgba(20,46,34,.28))' }}
            />
            <div style={{ marginTop: 16, width: '100%', textAlign: 'left' }}>
              {methods.map(({ key, title, desc }) => {
                const mine = key === browser
                return (
                  <div key={key} style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', boxShadow: '0 8px 18px -14px rgba(36,82,63,.2)', marginBottom: 9, opacity: browser && !mine ? 0.55 : 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 800, color: '#24523F', margin: 0 }}>
                      {mine ? `지금 쓰는 브라우저 · ${title}` : title}
                      {mine && (
                        <span style={{ display: 'inline-block', background: '#F3D978', color: '#5C4F1E', fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: '2px 8px', marginLeft: 6, verticalAlign: 1 }}>내 방법</span>
                      )}
                    </p>
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: '#6F7D72', margin: '3px 0 0', lineHeight: 1.55, wordBreak: 'keep-all' }}>{desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 점 인디케이터 + CTA */}
      <div style={{ flex: 'none', padding: '10px 28px calc(26px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 16 }}>
          {Array.from({ length: pageCount }, (_, i) => (
            <span key={i} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 4, background: i === index ? '#24523F' : '#DDD5C8', transition: 'all .2s' }} />
          ))}
        </div>
        <button
          onClick={goNext}
          style={
            isLast
              ? { width: '100%', background: '#24523F', color: '#FAF6F0', border: 'none', borderRadius: 16, padding: '15px 0', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px -10px rgba(20,46,34,.4)' }
              : { width: '100%', background: '#fff', color: '#24523F', border: '1px solid #E2DFD6', borderRadius: 16, padding: '15px 0', fontSize: 15.5, fontWeight: 700, cursor: 'pointer' }
          }
        >
          {isLast ? '오늘만큼 시작하기' : '다음'}
        </button>
      </div>
    </div>
  )
}
