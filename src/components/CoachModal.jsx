const COACH_INFO = {
  '유쾌': { name: '유쾌한 코치', avatarColor: '#F3D978' },
  '진중': { name: '진중한 코치', avatarColor: '#24523F' },
  '다정': { name: '다정한 코치', avatarColor: '#EE8466' },
}

export default function CoachModal({ loading, message, source, onClose, coach }) {
  const info = COACH_INFO[coach] ?? { name: '코치', avatarColor: '#9AA39C' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(34, 48, 42, 0.4)' }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="max-w-[480px] rounded-t-3xl pt-5 pb-8"
        style={{
          width: 'calc(100% - 24px)',
          paddingLeft: '28px',
          paddingRight: '28px',
          backgroundColor: '#FAF6F0',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center mb-6">
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#D8D0C4',
            }}
          />
        </div>

        {/* 코치 헤더 */}
        <div className="flex items-center gap-3 mb-7">
          <div
            className="rounded-full shrink-0"
            style={{ width: 48, height: 48, backgroundColor: info.avatarColor }}
          />
          <div>
            <p className="text-base font-bold" style={{ color: '#22302A' }}>{info.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#8A9E94' }}>코치가 한마디 건네요</p>
          </div>
        </div>

        {/* 메시지 본문 */}
        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: '#8A9E94' }}>
            코치가 메시지를 작성하고 있어요...
          </p>
        ) : (
          <>
            <p
              className="mb-5"
              style={{ fontSize: 18, fontWeight: 600, color: '#24523F', lineHeight: 1.7 }}
            >
              {message}
            </p>

            {/* 출처 배지 */}
            <div className="flex justify-end mb-8">
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#FFFFFF', color: '#8A9E94' }}
              >
                {source === 'solar' ? '출처 · AI' : '출처 · 예비'}
              </span>
            </div>
          </>
        )}

        {/* 계속하기 버튼 */}
        {!loading && (
          <button
            onClick={onClose}
            className="w-full rounded-2xl py-4 text-sm font-bold"
            style={{ backgroundColor: '#24523F', color: '#FFFFFF' }}
          >
            계속하기
          </button>
        )}
      </div>
    </div>
  )
}
