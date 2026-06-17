import { storage } from '../lib/storage'

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${m}월 ${d}일 ${days[date.getDay()]}요일`
}

export default function RecordScreen() {
  const history = storage.getHistory()
  const now = new Date()

  const entries = Object.entries(history)
    .filter(([dateStr]) => {
      const [y, m, d] = dateStr.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      return (now - date) / 86400000 < 14
    })
    .sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="w-full max-w-[480px] mx-auto px-5 pt-10 pb-24">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#24523F' }}>지난 기록</h2>

        {entries.length === 0 ? (
          <p className="text-sm text-center py-16" style={{ color: '#8A9E94' }}>
            아직 기록이 없어요. 오늘 첫 루틴을 완료해보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map(([dateStr, data]) => (
              <div
                key={dateStr}
                className="rounded-2xl p-5"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-base font-medium" style={{ color: '#22302A' }}>
                    {formatDate(dateStr)}
                  </p>
                  <p className="text-xs ml-3 shrink-0" style={{ color: '#8A9E94' }}>{data.state}</p>
                </div>
                <p className="text-sm mb-2" style={{ color: '#22302A' }}>
                  <span style={{ color: '#24523F', fontWeight: 600 }}>{data.completed.length}</span>
                  {' '}/ {data.total}개 완료
                </p>
                {data.completed.length > 0 && (
                  <p className="text-xs leading-relaxed" style={{ color: '#9AA39C' }}>
                    {data.completed.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
