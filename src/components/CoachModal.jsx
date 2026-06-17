export default function CoachModal({ loading, message, source, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(34, 48, 42, 0.4)' }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="w-full max-w-[480px] rounded-t-3xl px-6 pt-8 pb-10"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: '#8A9E94' }}>
            코치가 메시지를 작성하고 있어요...
          </p>
        ) : (
          <>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: '#22302A' }}>
              {message}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#C4BAB2' }}>
                {source === 'solar' ? 'Solar AI' : '예비 메시지'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#24523F', color: '#FFFFFF' }}
              >
                계속하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
