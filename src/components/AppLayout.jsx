import { useState, useEffect } from 'react'
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

export default function AppLayout({ children, showTabBar = false, activeTab = 'home', onTabChange = () => {} }) {
  const mode = useViewportMode()

  // 모바일/태블릿: 중앙 정렬 + 그림자(태블릿만) + 조건부 고정 탭바
  if (mode !== 'desktop') {
    return (
      <>
        <div style={{ height: '100vh', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: mode === 'tablet' ? '480px' : '100%',
            height: '100vh',
            boxShadow: mode === 'tablet' ? '0 8px 30px rgba(0,0,0,0.08)' : 'none',
          }}>
            <div style={{ paddingTop: '16px', paddingBottom: showTabBar ? '56px' : 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
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
      </>
    )
  }

  // 데스크톱: 좌우 2단 레이아웃 + 폰 베젤
  return (
    <div className="flex min-h-screen items-center" style={{ backgroundColor: '#FFFFFF' }}>

      {/* 좌측 소개 패널 */}
      <div className="flex-1 flex items-center justify-end pr-10 xl:pr-16 py-16">
        <div style={{ maxWidth: '400px', width: '100%' }}>
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
      </div>

      {/* 우측 폰 베젤 */}
      <div className="flex-1 flex items-center justify-start pl-10 xl:pl-16 py-12">
        <div
          style={{
            position: 'relative',
            width: '390px',
            flexShrink: 0,
            height: '812px',
            border: '10px solid #1C3F2F',
            borderRadius: '46px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            // CSS 트릭: position:fixed 자식들이 베젤 기준으로 고정됨 (CoachModal, TabBar)
            transform: 'translateZ(0)',
          }}
        >
          {/* 상단 노치 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '110px',
              height: '28px',
              backgroundColor: '#1C3F2F',
              borderRadius: '0 0 18px 18px',
              zIndex: 200,
              pointerEvents: 'none',
            }}
          />
          {/* 스크롤 가능한 앱 콘텐츠 */}
          <div
            className="[&::-webkit-scrollbar]:hidden"
            style={{ height: '812px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}
          >
            <div style={{ paddingTop: '48px', paddingLeft: '8px', paddingRight: '8px', paddingBottom: showTabBar ? '56px' : 0, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
            {showTabBar && (
              <TabBar
                activeTab={activeTab}
                onTabChange={onTabChange}
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40 }}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
