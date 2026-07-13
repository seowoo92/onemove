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
          gap: 10,
          backgroundColor: '#FAF6F0',
          color: '#22302A',
          padding: 24,
          textAlign: 'center',
          fontFamily: "'Pretendard Variable', -apple-system, sans-serif",
        }}
      >
        <p style={{ fontSize: 19, fontWeight: 700, color: '#24523F' }}>잠시 문제가 생겼어요</p>
        <p style={{ fontSize: 14.5, color: '#6B7A72', lineHeight: 1.6 }}>
          새로고침하면 다시 만날 수 있어요.
          <br />
          오늘의 기록은 그대로 남아 있어요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 10,
            padding: '12px 28px',
            borderRadius: 12,
            border: 'none',
            backgroundColor: '#24523F',
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          새로고침
        </button>
      </div>
    )
  }
}
