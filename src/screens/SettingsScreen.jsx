import { storage } from '../lib/storage'

const COACHES = ['유쾌', '진중', '다정']

export default function SettingsScreen({ coach, onCoachChange, onGoToStateCheck }) {
  function handleStateCheck() {
    const completed = storage.getCompletedIds()
    if (completed.length > 0) {
      const ok = window.confirm('다시 고르면 오늘 기록이 초기화돼요. 계속할까요?')
      if (!ok) return
    }
    ;['onemove_state', 'onemove_routines', 'onemove_completed', 'onemove_easy', 'onemove_skipped']
      .forEach(k => localStorage.removeItem(k))
    onGoToStateCheck()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="w-full max-w-[480px] mx-auto px-5 pt-10 pb-24">
        <h2 className="text-2xl font-bold mb-8" style={{ color: '#24523F' }}>설정</h2>

        {/* AI 코치 변경 */}
        <div className="rounded-2xl p-5 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xs mb-1" style={{ color: '#8A9E94' }}>AI 코치</p>
          <p className="text-base font-medium mb-4" style={{ color: '#22302A' }}>
            현재 코치: {coach}
          </p>
          <div className="flex gap-2">
            {COACHES.map((c) => (
              <button
                key={c}
                onClick={() => onCoachChange(c)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: coach === c ? '#24523F' : '#FFFFFF',
                  color: coach === c ? '#FFFFFF' : '#9AA39C',
                  border: `1.5px solid ${coach === c ? '#24523F' : '#9AA39C'}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 오늘 상태 다시 고르기 */}
        <div className="rounded-2xl p-5 mb-10" style={{ backgroundColor: '#FFFFFF' }}>
          <button onClick={handleStateCheck} className="w-full text-left">
            <p className="text-base font-medium" style={{ color: '#22302A' }}>오늘 상태 다시 고르기</p>
            <p className="text-xs mt-0.5" style={{ color: '#8A9E94' }}>
              상태를 바꾸면 오늘 루틴이 초기화돼요
            </p>
          </button>
        </div>

        {/* 하단 정보 */}
        <p className="text-xs text-center" style={{ color: '#C4BAB2' }}>
          오늘만큼 · CBT 기반 회복 루틴 코치
        </p>
      </div>
    </div>
  )
}
