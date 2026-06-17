const STATES = ['좋아요', '보통이에요', '힘들어요']

export default function StateCheck({ onSelect, onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="w-full max-w-[480px] mx-auto flex flex-col flex-1 px-6 py-14">

        {/* 뒤로 버튼 */}
        {onBack && (
          <button
            onClick={onBack}
            className="self-start text-sm mb-10"
            style={{ color: '#8A9E94' }}
          >
            ← 뒤로
          </button>
        )}

        {/* 로고 */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold" style={{ color: '#24523F' }}>오늘만큼</h1>
        </div>

        {/* 인사말 */}
        <p className="text-xl font-medium text-center mb-8" style={{ color: '#22302A' }}>
          오늘 컨디션은 어때요?
        </p>

        {/* 상태 버튼 */}
        <div className="flex flex-col gap-3">
          {STATES.map((state) => (
            <button
              key={state}
              onClick={() => onSelect(state)}
              className="w-full py-4 px-5 rounded-2xl text-base font-medium text-left transition-all hover:border-[#24523F]"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#22302A',
                border: '1.5px solid #E8E1D8',
              }}
            >
              {state}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
