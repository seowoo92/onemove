import { supabase } from '../lib/supabase'

export default function WelcomeScreen({ onSkip }) {
  async function handleKakaoLogin() {
    if (!supabase) { onSkip(); return }
    const redirectTo = window.location.origin + import.meta.env.BASE_URL
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo },
    })
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAF6F0',
        padding: '24px 30px 34px',
        boxSizing: 'border-box',
      }}
    >
      {/* 브랜드 마크 — 클레이 3점 + 워드마크 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 34% 30%,#F6C6B4,#EFA58F 55%,#E08066)',
              boxShadow: 'inset 0 -3px 5px rgba(0,0,0,.16),inset 0 2px 4px rgba(255,255,255,.45)',
            }}
          />
          <div
            style={{
              width: 21,
              height: 21,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 34% 30%,#FFEFB6,#F3D978 55%,#E8C24E)',
              boxShadow: 'inset 0 -3px 6px rgba(0,0,0,.14),inset 0 3px 5px rgba(255,255,255,.55)',
              marginLeft: -6,
            }}
          />
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 28%,#3C7A5C,#1C4030)',
              boxShadow: 'inset 0 -4px 8px rgba(0,0,0,.2),inset 0 3px 5px rgba(255,255,255,.3)',
              marginLeft: -6,
            }}
          />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#24523F' }}>오늘만큼</span>
      </div>

      {/* 헤드라인 */}
      <h1
        style={{
          marginTop: 48,
          marginBottom: 0,
          fontSize: 39,
          fontWeight: 800,
          color: '#24523F',
          letterSpacing: '-0.045em',
          lineHeight: 1.22,
        }}
      >
        오늘<br />할 수 있는<br />만큼만.
      </h1>

      {/* 서브카피 */}
      <p
        style={{
          marginTop: 22,
          marginBottom: 0,
          fontSize: 15,
          fontWeight: 500,
          color: '#6f7d72',
          lineHeight: 1.7,
          maxWidth: 330,
          wordBreak: 'keep-all',
        }}
      >
        오늘의 한 걸음, 그거면 충분해요.<br />
        완벽 대신 꾸준함으로 멈춘 자리에서 다시 이어가요.
      </p>

      {/* 오르막 점 패스 — 한 걸음씩 나아간다 (전부 SVG) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', minHeight: 120 }}>
        <svg
          width="100%"
          height="128"
          viewBox="0 0 390 128"
          fill="none"
          preserveAspectRatio="xMidYMax meet"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <path
            d="M52 104 Q150 92 196 64 T330 26"
            stroke="#D8E2DA"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 15"
          />
          <circle cx="52" cy="104" r="5" fill="#CFE0D4" />
          <circle cx="116" cy="86" r="7.5" fill="#9FC1A9" />
          <circle cx="182" cy="64" r="10.5" fill="#EFA58F" />
          <circle cx="252" cy="44" r="14" fill="#F3D978" />
          <circle cx="330" cy="26" r="20" fill="#24523F" />
        </svg>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 24 }}>
        <button
          onClick={handleKakaoLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#FEE500',
            color: '#3C1E1E',
            borderRadius: 18,
            padding: 17,
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow:
              '0 9px 20px -7px rgba(220,195,0,.6),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -3px 6px rgba(160,140,0,.2)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M9 2C4.9 2 1.5 4.6 1.5 7.8c0 2 1.4 3.8 3.5 4.8-.2.6-.7 2.3-.8 2.6 0 .3.2.3.4.2.2-.1 2.4-1.6 3.3-2.2.4 0 .7.1 1.1.1 4.1 0 7.5-2.6 7.5-5.8S13.1 2 9 2z"
              fill="#3C1E1E"
            />
          </svg>
          카카오로 시작하기
        </button>
        <button
          onClick={onSkip}
          style={{
            color: '#6f7d72',
            padding: 11,
            fontSize: 14.5,
            fontWeight: 600,
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          로그인 없이 시작하기
        </button>
      </div>
    </div>
  )
}
