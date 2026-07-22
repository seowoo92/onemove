// 탭 화면 공통 헤더 — 타이틀·부제 위치와 타이포를 모든 탭에서 동일하게 유지한다.
// right: 타이틀 우측 요소 (예: 기록 탭의 연속 기록 배지)
// bottomGap: 부제 아래 여백 — 부모가 flex gap으로 간격을 관리하면 0을 넘긴다 (예: 오늘 탭)
export default function ScreenHeader({ title, subtitle, right, bottomGap = 16 }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 2px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, color: '#24523F', margin: 0 }}>{title}</h2>
        {right ?? null}
      </div>
      {subtitle && (
        <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: `0 0 ${bottomGap}px` }}>{subtitle}</p>
      )}
    </>
  )
}
