import { useState } from 'react'
import { getWeatherInfo } from '../lib/weather'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 월간 마음 날씨 캘린더 — 날짜 칸에 그날의 날씨 아이콘, ◀▶ 월 이동 (미래 달 이동 불가)
export default function MonthCalendar({ history, todayStr }) {
  const [ty, tm] = todayStr.split('-').map(Number)
  const [ym, setYm] = useState({ y: ty, m: tm })
  const isCurrentMonth = ym.y === ty && ym.m === tm

  const firstWeekday = new Date(ym.y, ym.m - 1, 1).getDay()
  const daysInMonth = new Date(ym.y, ym.m, 0).getDate()
  const dateKey = (d) => `${ym.y}-${String(ym.m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function move(delta) {
    setYm(({ y, m }) => {
      const next = new Date(y, m - 1 + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() + 1 }
    })
  }

  // 표시 중인 달의 요약 (기록일·완료 수)
  const monthEntries = Array.from({ length: daysInMonth }, (_, i) => history[dateKey(i + 1)]).filter(Boolean)
  const completedTotal = monthEntries.reduce((sum, e) => sum + (e.completed?.length ?? 0), 0)

  const navBtn = (disabled) => ({
    width: 30,
    height: 30,
    borderRadius: 9,
    border: 'none',
    background: '#F0EDE8',
    color: disabled ? '#C4BAB2' : '#24523F',
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer',
    lineHeight: 1,
  })

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => move(-1)} style={navBtn(false)} aria-label="이전 달">‹</button>
        <span className="text-sm font-bold" style={{ color: '#22302A' }}>
          {ym.y}년 {ym.m}월
        </span>
        <button onClick={() => !isCurrentMonth && move(1)} style={navBtn(isCurrentMonth)} aria-label="다음 달" disabled={isCurrentMonth}>
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-center" style={{ fontSize: 11, fontWeight: 600, color: '#9AA39C', padding: '3px 0' }}>
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 3 }}>
        {cells.map((d, i) => {
          if (d == null) return <span key={`empty-${i}`} />
          const key = dateKey(d)
          const entry = history[key]
          const info = entry ? getWeatherInfo(entry.state) : null
          const isToday = key === todayStr
          return (
            <div
              key={key}
              className="flex flex-col items-center"
              style={{
                padding: '3px 0 2px',
                borderRadius: 10,
                backgroundColor: isToday ? '#EFF4EE' : 'transparent',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: isToday ? '#24523F' : '#8A9E94', lineHeight: 1.2 }}>
                {d}
              </span>
              <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {info?.image ? (
                  <img src={info.image} alt={info.weather} width={20} height={20} style={{ objectFit: 'contain', display: 'block' }} />
                ) : (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: isCurrentMonth && d > Number(todayStr.slice(8)) ? 'transparent' : '#E0DACE',
                    }}
                  />
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* 이 달 요약 */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #F0EDE8' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9E94' }}>
          기록 <span style={{ color: '#24523F', fontWeight: 800 }}>{monthEntries.length}</span>일
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9E94' }}>
          완료 루틴 <span style={{ color: '#24523F', fontWeight: 800 }}>{completedTotal}</span>개
        </span>
      </div>
    </div>
  )
}
