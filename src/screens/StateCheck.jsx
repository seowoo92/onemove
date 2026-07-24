import { getWeatherInfo } from '../lib/weather'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
function formatDate() {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`
}

// 마음 날씨 아이콘 — 날씨별 연한 색 동그라미 위 일러스트
function WeatherIcon({ image, tint }) {
  return (
    <div
      style={{
        flex: 'none',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: tint,
        boxShadow: 'inset 0 2px 5px rgba(120,120,90,.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={image} alt="" width={46} height={46} style={{ objectFit: 'contain', display: 'block' }} />
    </div>
  )
}

const STATES = ['좋아요', '보통이에요', '힘들어요'].map((value) => {
  const info = getWeatherInfo(value)
  return { value, sub: info.description, image: info.image, tint: info.tint }
})

export default function StateCheck({ onSelect, onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FAF6F0' }}>
      {/* 마이크로 인터랙션: 카드 프레스 피드백 + 진입 스태거 (reduced-motion 시 연출 정지) */}
      <style>{`
        .sc-card { transition: transform .12s ease, box-shadow .12s ease; }
        .sc-card:active { transform: scale(.97); }
        @keyframes scRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .sc-rise { animation: scRise .45s ease backwards; }
        @media (prefers-reduced-motion: reduce) {
          .sc-rise { animation: none; }
          .sc-card, .sc-card:active { transition: none; transform: none; }
        }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100%',
          padding: '8px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* 뒤로 버튼 */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="뒤로"
            style={{
              flex: 'none',
              width: 42,
              height: 42,
              background: '#fff',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: '0 6px 14px -8px rgba(36,82,63,.3),inset 0 2px 0 rgba(255,255,255,.9)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M10 3l-5 5 5 5" fill="none" stroke="#24523F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* 제목 */}
        <div style={{ marginTop: onBack ? 22 : 8 }}>
          <div style={{ fontSize: 23, fontWeight: 800, color: '#24523F', letterSpacing: '-0.03em', lineHeight: 1.35 }}>
            오늘 마음 날씨는<br />어떤가요?
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#7c8a80', marginTop: 9 }}>
            {formatDate()}
          </div>
        </div>

        {/* 마음 날씨 카드 3종 + 안내 문구 (사용자 확정: 흰 카드 유지, 여백은 안내 한 줄로) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 26 }}>
          {STATES.map(({ value, sub, image, tint }, i) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className="sc-card sc-rise"
              style={{
                animationDelay: `${0.06 + i * 0.1}s`,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: '#fff',
                borderRadius: 24,
                padding: 18,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 22px -13px rgba(36,82,63,.22),inset 0 2px 0 rgba(255,255,255,.9)',
              }}
            >
              <WeatherIcon image={image} tint={tint} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#24523F' }}>{value}</div>
                <div style={{ fontSize: 13, color: '#7c8a80', marginTop: 1 }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* 안내 두 줄 — 무판단 신호 + 서비스 철학 (사용자 확정: 날짜 옆에서 이곳으로 이동) */}
        <div className="sc-rise" style={{ animationDelay: '0.42s', marginTop: 24, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#8a978d', lineHeight: 1.7, wordBreak: 'keep-all' }}>
          어떤 날이든 괜찮아요.<br />
          마음 날씨에 맞춰, 오늘 할 수 있는 만큼만 추천할게요.
        </div>
      </div>
    </div>
  )
}
