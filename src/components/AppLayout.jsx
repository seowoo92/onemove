import { useState, useEffect } from 'react'

const FEATURES = [
  '오늘의 상태에 맞춘 맞춤 루틴 추천',
  '어려우면 더 쉬운 버전으로, 실패해도 괜찮아요',
  '유쾌·진중·다정, 내가 고른 AI 코치의 격려',
]

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

export default function AppLayout({ children }) {
  const isDesktop = useIsDesktop()

  // 모바일/태블릿: 중앙 정렬 래퍼로 감싸기
  // - 외부 div: 전체 배경(#FAF6F0)을 화면 끝까지 채움
  // - 내부 div: max-width 480px, 가운데 정렬 (flex justify-center 사용)
  //   flex row + justify-center 방식으로 align-items:stretch 간섭을 피함
  if (!isDesktop) {
    return (
      <div
        style={{ minHeight: '100vh', backgroundColor: '#FAF6F0', display: 'flex', justifyContent: 'center' }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {children}
        </div>
      </div>
    )
  }

  // 데스크톱: 좌우 2단 레이아웃 + 폰 베젤
  return (
    <div className="flex min-h-screen items-center" style={{ backgroundColor: '#FAF6F0' }}>

      {/* 좌측 소개 패널 */}
      <div className="flex-1 flex items-center justify-end pr-10 xl:pr-16 py-16">
        <div style={{ maxWidth: '420px', width: '100%' }}>

          <p className="text-2xl font-bold mb-10" style={{ color: '#24523F' }}>
            오늘만큼
          </p>

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
                <span
                  className="mt-[3px] font-bold select-none"
                  style={{ color: '#EE8466' }}
                >
                  ·
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs" style={{ color: '#A8B5AC' }}>
            오른쪽 화면에서 직접 체험해보세요
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
            // 뷰포트 높이에 맞게 조정, 최대 iPhone 14 Pro 높이
            height: 'min(844px, calc(100vh - 96px))',
            border: '10px solid #1C3F2F',
            borderRadius: '52px',
            boxShadow:
              '0 20px 60px rgba(36, 82, 63, 0.22), 0 4px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            // CSS 트릭: transform이 있는 요소는 position:fixed 자식의 containing block이 됨.
            // CoachModal의 "fixed inset-0"이 베젤 기준으로 고정 → 베젤 밖으로 나가지 않음.
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
          {/* 하단 홈 인디케이터 */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '4px',
              backgroundColor: 'rgba(28, 63, 47, 0.3)',
              borderRadius: '2px',
              zIndex: 200,
              pointerEvents: 'none',
            }}
          />
          {/* 스크롤 가능한 앱 콘텐츠 — 스크롤바 숨김 */}
          <div
            className="[&::-webkit-scrollbar]:hidden"
            style={{
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
            }}
          >
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}
