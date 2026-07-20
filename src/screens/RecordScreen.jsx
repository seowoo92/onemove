import { useState } from 'react'
import { storage } from '../lib/storage'
import { getWeatherInfo } from '../lib/weather'
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis } from 'recharts'
import MonthCalendar from '../components/MonthCalendar'
import ScreenHeader from '../components/ScreenHeader'
import { buildDemoHistory } from '../lib/demoRecord'

function getTodayStr() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${m}월 ${d}일 (${days[date.getDay()]})`
}

function getLast14Days() {
  const result = []
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    result.push([
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-'))
  }
  return result
}

const LEGEND = ['좋아요', '보통이에요', '힘들어요'].map((state) => {
  const info = getWeatherInfo(state)
  return { image: info.image, label: info.weather }
})

// 오늘(기록 없으면 어제)부터 거꾸로 이어진 기록 일수
function getStreak(history, todayStr) {
  const [y, m, d] = todayStr.split('-').map(Number)
  let cursor = new Date(y, m - 1, d)
  const key = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
  if (!history[key(cursor)]) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (history[key(cursor)]) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function RecordScreen() {
  const todayStr = getTodayStr()
  // ?record=demo — 발표 시연용 데모 기록 (실제 저장 데이터 영향 없음)
  const isDemo = new URLSearchParams(window.location.search).get('record') === 'demo'
  const history = isDemo ? buildDemoHistory(todayStr) : storage.getHistory()
  const last14 = getLast14Days()

  const chartData = last14.map(dateStr => {
    const entry = history[dateStr]
    const day = Number(dateStr.slice(8))
    if (!entry) return { dateStr, day, value: null, color: 'transparent' }
    const rate = entry.total > 0
      ? Math.round((entry.completed.length / entry.total) * 100)
      : 0
    const info = getWeatherInfo(entry.state)
    return { dateStr, day, value: rate, color: info?.color ?? '#9AA39C' }
  })

  const hasAnyRecord = Object.keys(history).length > 0
  const streak = getStreak(history, todayStr)

  // 타임라인: 전체 기록을 월·주차(1~7일=1주차)로 그룹 — 현재 주차만 기본 오픈
  const weekLabel = (dateStr) => `${Number(dateStr.slice(5, 7))}월 ${Math.floor((Number(dateStr.slice(8)) - 1) / 7) + 1}주차`
  const timelineGroups = []
  for (const dateStr of Object.keys(history).sort().reverse()) {
    const label = weekLabel(dateStr)
    const last = timelineGroups[timelineGroups.length - 1]
    if (last && last.label === label) last.dates.push(dateStr)
    else timelineGroups.push({ label, dates: [dateStr] })
  }
  const currentWeekLabel = weekLabel(todayStr)
  const [openGroups, setOpenGroups] = useState(() => new Set([currentWeekLabel]))
  const toggleGroup = (label) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className="h-full" style={{ backgroundColor: '#FAF6F0' }}>
      {/* 1. pt-10→pt-16, px-5→px-6 */}
      <div className="w-full max-w-[480px] mx-auto px-5 pt-2 pb-24">

        <ScreenHeader
          title="기록"
          subtitle="모아보면 제법 든든한 날들"
          right={streak >= 2 ? (
            <span
              className="text-xs rounded-full px-3 py-1.5"
              style={{ backgroundColor: '#EFF4EE', color: '#24523F', fontWeight: 700 }}
            >
              {streak}일 연속 기록 중
            </span>
          ) : null}
        />

        {/* 월간 마음 날씨 캘린더 — 기록이 없어도 항상 표시 */}
        <MonthCalendar history={history} todayStr={todayStr} />

        {!hasAnyRecord ? (
          <p className="text-sm text-center py-10" style={{ color: '#8A9E94' }}>
            아직 기록이 없어요. 오늘 첫 루틴을 완료해보세요.
          </p>
        ) : (
          <>
            {/* 2. 그래프 카드: 내부 좌우 여백 확보, 범례 간격 추가 */}
            <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: '#22302A' }}>최근 14일</span>
                <span className="text-xs" style={{ color: '#9AA39C' }}>완료율 · 마음 날씨</span>
              </div>

              <ResponsiveContainer width="100%" height={140}>
                <BarChart
                  data={chartData}
                  barCategoryGap="35%"
                  margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
                >
                  <XAxis dataKey="day" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 9.5, fill: '#9AA39C' }} dy={2} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* 범례: mt-3→mt-5 */}
              <div className="flex items-center justify-center gap-5 mt-2">
                {LEGEND.map(({ image, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <img
                      src={image}
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0"
                      style={{ objectFit: 'contain', display: 'block' }}
                    />
                    <span className="text-xs" style={{ color: '#9AA39C' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 타임라인: 월·주차 아코디언 — 현재 주차만 기본 오픈, 지난 주차는 탭하면 펼침 */}
            <div className="flex flex-col" style={{ gap: 8 }}>
              {timelineGroups.map(({ label, dates }) => {
                const isOpen = openGroups.has(label)
                return (
                  <div key={label} style={{ background: '#FFFFFF', borderRadius: 16, padding: isOpen ? '12px 16px 4px' : '12px 16px', boxShadow: '0 8px 18px -14px rgba(36,82,63,.2)' }}>
                    <button
                      onClick={() => toggleGroup(label)}
                      aria-expanded={isOpen}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#24523F' }}>
                        {label}
                        {label === currentWeekLabel && <span style={{ fontSize: 11, fontWeight: 600, color: '#8A9E94' }}> · 이번 주</span>}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#9AA39C' }}>{dates.length}일</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#B7AFA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} aria-hidden="true">
                          <path d="M4 6.5l4 4 4-4" />
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="flex flex-col" style={{ marginTop: 12 }}>
                        {dates.map((dateStr, idx) => {
                          const data = history[dateStr]
                          const info = getWeatherInfo(data.state)
                          const isToday = dateStr === todayStr
                          const isLast = idx === dates.length - 1

                          return (
                            <div key={dateStr} className="flex gap-4">
                              {/* 왼쪽: 날씨 아이콘 + 세로 연결선 */}
                              <div className="flex flex-col items-center" style={{ width: 30 }}>
                                {info?.image ? (
                                  <img
                                    src={info.image}
                                    alt=""
                                    width={30}
                                    height={30}
                                    className="shrink-0"
                                    style={{ objectFit: 'contain', display: 'block', marginTop: 2 }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-full shrink-0"
                                    style={{ width: 12, height: 12, marginTop: 4, backgroundColor: '#9AA39C' }}
                                  />
                                )}
                                {!isLast && (
                                  <div
                                    className="flex-1"
                                    style={{ width: 2, marginTop: 6, backgroundColor: '#E0DACE' }}
                                  />
                                )}
                              </div>

                              {/* 오른쪽: 날짜·상태·칩 */}
                              <div className="flex-1 min-w-0 pb-5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: '#22302A' }}>
                                      {formatDate(dateStr)}
                                      {isToday && (
                                        <span className="font-normal" style={{ color: '#8A9E94' }}> · 오늘</span>
                                      )}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: '#8A9E94' }}>
                                      {data.state} · {info?.weather ?? ''}
                                    </p>
                                    {data.completed.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {data.completed.map((name, i) => (
                                          <span
                                            key={i}
                                            className="text-xs rounded-full px-2.5 py-1"
                                            style={{ backgroundColor: '#ECE6DC', color: '#22302A' }}
                                          >
                                            {name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className="text-sm font-semibold shrink-0 pt-0.5"
                                    style={{ color: '#24523F' }}
                                  >
                                    {data.completed.length} / {data.total}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
