import { useState, useEffect } from 'react'
import TabBar from './TabBar'

const FEATURES = [
  '오늘의 상태에 맞춘 맞춤 루틴 추천',
  '어려우면 더 쉬운 버전으로, 실패해도 괜찮아요',
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
        <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            minHeight: '100vh',
            boxShadow: mode === 'tablet' ? '0 8px 30px rgba(0,0,0,0.08)' : 'none',
          }}>
            <div style={{ paddingBottom: showTabBar ? '56px' : 0 }}>
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
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <p className="text-2xl font-bold mb-10" style={{ color: '#24523F' }}>오늘만큼</p>
          <h1
            className="text-4xl xl:text-[2.75rem] font-bold leading-tight mb-6"
            style={{ color: '#22302A' }}
          >
            오늘 할 수 있는<br />만큼만
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#5C7066' }}>
            무기력한 날에도 부담 없이.<br />
            오늘의 컨디션에 맞춰 딱 할 수 있는 만큼의<br />
            회복 루틴을 AI 코치가 제안합니다.
          </p>
          <ul className="flex flex-col gap-3.5 mb-12">
            {FEATURES.map((text) => (
              <li
                key={text}
                className="flex items-start gap-2.5 text-[15px]"
                style={{ color: '#22302A' }}
              >
                <span className="mt-[3px] font-bold select-none" style={{ color: '#EE8466' }}>·</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs" style={{ color: '#A8B5AC' }}>오른쪽 화면에서 직접 체험해보세요</p>
        </div>
      </div>

      {/* 우측 폰 베젤 */}
      <div className="flex-1 flex items-center justify-start pl-10 xl:pl-16 py-12">
        <div
          style={{
            position: 'relative',
            width: '390px',
            flexShrink: 0,
            height: 'min(844px, calc(100vh - 96px))',
            border: '10px solid #1C3F2F',
            borderRadius: '52px',
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
            style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}
          >
            <div style={{ paddingBottom: showTabBar ? '56px' : 0 }}>
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
