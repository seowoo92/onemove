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
            {formatDate()} · 어떤 날이든 괜찮아요
          </div>
        </div>

        {/* 마음 날씨 카드 3종 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 26 }}>
          {STATES.map(({ value, sub, image, tint }) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              style={{
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

        {/* 도움말 말풍선 */}
        <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', alignItems: 'flex-end', gap: 11 }}>
          <div
            style={{
              flex: 'none',
              position: 'relative',
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'radial-gradient(120% 120% at 35% 28%,#FFFFFF,#E7F0E8)',
              boxShadow: '0 8px 18px -10px rgba(36,82,63,.45),inset 0 -3px 6px rgba(36,82,63,.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 800, color: '#2d6049', lineHeight: 1 }}>?</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ background: '#FBF4E2', borderRadius: 18, padding: '13px 16px', fontSize: 12.5, fontWeight: 500, color: '#6d6a52', lineHeight: 1.6, wordBreak: 'keep-all', boxShadow: '0 7px 16px -12px rgba(180,150,60,.45)' }}>
              선택한 마음 날씨에 맞추어<br />루틴 개수와 난이도를 조절해서 제안해요.
            </div>
            <div style={{ position: 'relative', background: '#EBF2EB', borderRadius: '18px 18px 18px 6px', padding: '13px 16px', fontSize: 12.5, fontWeight: 500, color: '#566b5c', lineHeight: 1.6, wordBreak: 'keep-all', boxShadow: '0 7px 16px -12px rgba(36,82,63,.4)' }}>
              <div style={{ position: 'absolute', left: -4, bottom: 11, width: 11, height: 11, background: '#EBF2EB', borderRadius: '0 0 0 3px', transform: 'rotate(45deg)' }} />
              마음 날씨는 설정에서 언제든 다시 고를 수 있어요.<br />다시 고르면 오늘의 루틴은 새로 시작돼요.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
