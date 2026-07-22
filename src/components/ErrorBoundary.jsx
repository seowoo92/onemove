import { Component } from 'react'

// 전역 에러 안전망: 렌더링 중 예상 못 한 오류가 나면 흰 화면 대신 안내 화면을 보여준다.
// 기록은 localStorage에 있으므로 새로고침해도 데이터는 유지된다.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[onemove] 렌더링 오류:', error, info?.componentStack)
    // 초기화 중 오류면 스플래시가 화면을 덮고 있으므로 반드시 걷어낸다
    window.__hideSplash?.()
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF6F0',
          color: '#22302A',
          padding: 24,
          textAlign: 'center',
          fontFamily: "'Pretendard Variable', -apple-system, sans-serif",
        }}
      >
        <img
          src="/onemove/images/weather-rainy.png"
          alt=""
          width={64}
          height={64}
          style={{ objectFit: 'contain', display: 'block', marginBottom: 14 }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <p style={{ fontSize: 19, fontWeight: 800, color: '#24523F', margin: 0 }}>잠깐 소나기를 만났어요</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            padding: '13px 34px',
            borderRadius: 14,
            border: 'none',
            backgroundColor: '#24523F',
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 22px -10px rgba(36,82,63,.45)',
          }}
        >
          새로고침
        </button>
        <p style={{ fontSize: 14.5, fontWeight: 500, color: '#6B7A72', lineHeight: 1.65, margin: '16px 0 0' }}>
          새로고침하면 다시 만날 수 있어요.
          <br />
          오늘의 기록은 그대로 남아 있어요.
        </p>
      </div>
    )
  }
}
