import { useState } from 'react'

const COACHES = [
  { key: '유쾌', desc: '가볍고 활기차게 함께해요' },
  { key: '진중', desc: '담백하고 단단하게 함께해요' },
  { key: '다정', desc: '따뜻하고 부드럽게 함께해요' },
]

export default function CoachSelect({ onSelect, initialSelected = null }) {
  const [selected, setSelected] = useState(initialSelected)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="w-full max-w-[480px] mx-auto flex flex-col flex-1 px-6 py-14">
        {/* 로고 */}
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold" style={{ color: '#24523F' }}>오늘만큼</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#8A9E94' }}>오늘 할 수 있는 만큼만</p>
        </div>

        {/* 안내 */}
        <p className="text-base font-medium text-center mb-6" style={{ color: '#22302A' }}>
          어떤 코치와 함께할까요?
        </p>

        {/* 코치 카드 */}
        <div className="flex flex-col gap-3 mb-8">
          {COACHES.map(({ key, desc }) => {
            const active = selected === key
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all"
                style={{
                  backgroundColor: active ? '#24523F' : '#FFFFFF',
                  borderColor: active ? '#24523F' : '#E8E1D8',
                }}
              >
                <p className="font-semibold text-base" style={{ color: active ? '#FFFFFF' : '#22302A' }}>
                  {key}
                </p>
                <p className="text-sm mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#8A9E94' }}>
                  {desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="w-full py-4 rounded-2xl text-base font-semibold transition-all"
          style={{
            backgroundColor: selected ? '#24523F' : '#D4CFC9',
            color: '#FFFFFF',
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  )
}
