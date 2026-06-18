import { storage } from '../lib/storage'
import { getWeatherInfo } from '../lib/weather'
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

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

const LEGEND = [
  { color: '#F3D978', label: '좋아요' },
  { color: '#9FD2B0', label: '보통' },
  { color: '#A9CFE0', label: '힘들어요' },
]

export default function RecordScreen() {
  const history = storage.getHistory()
  const todayStr = getTodayStr()
  const last14 = getLast14Days()

  const chartData = last14.map(dateStr => {
    const entry = history[dateStr]
    if (!entry) return { dateStr, value: null, color: 'transparent' }
    const rate = entry.total > 0
      ? Math.round((entry.completed.length / entry.total) * 100)
      : 0
    const info = getWeatherInfo(entry.state)
    return { dateStr, value: rate, color: info?.color ?? '#9AA39C' }
  })

  const timelineEntries = last14
    .filter(dateStr => !!history[dateStr])
    .reverse()

  const hasAnyRecord = timelineEntries.length > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      {/* 1. pt-10→pt-16, px-5→px-6 */}
      <div className="w-full max-w-[480px] mx-auto px-6 pt-6 pb-24">

        {/* 헤더 */}
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#24523F' }}>기록</h2>
        <p className="text-xs mb-6" style={{ color: '#8A9E94' }}>최근 14일 · 멈춘 날도 기록이에요</p>

        {!hasAnyRecord ? (
          <p className="text-sm text-center py-16" style={{ color: '#8A9E94' }}>
            아직 기록이 없어요. 오늘 첫 루틴을 완료해보세요.
          </p>
        ) : (
          <>
            {/* 2. 그래프 카드: 내부 좌우 여백 확보, 범례 간격 추가 */}
            <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold" style={{ color: '#22302A' }}>최근 14일</span>
                <span className="text-xs" style={{ color: '#9AA39C' }}>완료율 · 마음 날씨</span>
              </div>

              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={chartData}
                  barCategoryGap="35%"
                  margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
                >
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* 범례: mt-3→mt-5 */}
              <div className="flex items-center justify-center gap-5 mt-5">
                {LEGEND.map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs" style={{ color: '#9AA39C' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 타임라인: flex 구조로 점·선 가시성 확보 (음수 left 제거) */}
            <div className="flex flex-col">
              {timelineEntries.map((dateStr, idx) => {
                const data = history[dateStr]
                const info = getWeatherInfo(data.state)
                const isToday = dateStr === todayStr
                const isLast = idx === timelineEntries.length - 1

                return (
                  <div key={dateStr} className="flex gap-4">
                    {/* 왼쪽: 컬러 점 + 세로 연결선 */}
                    <div className="flex flex-col items-center" style={{ width: 12 }}>
                      <div
                        className="rounded-full shrink-0"
                        style={{
                          width: 12,
                          height: 12,
                          marginTop: 4,
                          backgroundColor: info?.color ?? '#9AA39C',
                        }}
                      />
                      {!isLast && (
                        <div
                          className="flex-1"
                          style={{ width: 2, marginTop: 4, backgroundColor: '#E0DACE' }}
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
                          {/* 4. 완료 루틴 칩: 배경 #ECE6DC */}
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
          </>
        )}
      </div>
    </div>
  )
}
