import { useState } from 'react'
import { COACH_INFO } from '../lib/coaches'

export default function CoachModal({ loading, message, source, onClose, coach }) {
  const info = COACH_INFO[coach] ?? { name: '코치', color: '#9AA39C', image: null }
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(20, 46, 34, 0.45)' }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <style>{`@keyframes coachDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
      <div
        style={{
          width: 'calc(100% - 20px)',
          maxWidth: 480,
          backgroundColor: '#F9F6EE',
          borderRadius: '34px 34px 0 0',
          boxShadow: '0 -20px 50px -10px rgba(0,0,0,.3)',
          padding: '14px 28px 30px',
          maxHeight: '82vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: '#DDD5C8' }} />
        </div>

        {/* 코치 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 22 }}>
          {info.image && !imgError ? (
            <img
              src={info.image}
              alt={info.name}
              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flex: 'none' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: info.color, flex: 'none' }} />
          )}
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#24523F', margin: 0 }}>{info.name}</p>
            <p style={{ fontSize: 12.5, fontWeight: 500, color: '#8A9E94', margin: '2px 0 0' }}>코치가 한마디 건네요</p>
          </div>
        </div>

        {/* 메시지 본문 */}
        {loading ? (
          <div style={{ minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <p style={{ fontSize: 14.5, fontWeight: 500, color: '#8A9E94', margin: 0 }}>코치가 메시지를 작성하고 있어요</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#C2A98F',
                    display: 'block',
                    animation: `coachDot 1.2s ${i * 0.16}s infinite ease-in-out`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 19, fontWeight: 700, color: '#24523F', lineHeight: 1.6, minHeight: 90, margin: 0, wordBreak: 'keep-all' }}>
              {message}
            </p>

            {/* 출처 배지 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 22 }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '5px 11px',
                  borderRadius: 9,
                  backgroundColor: '#FFFFFF',
                  color: '#9AA39C',
                  boxShadow: '0 4px 10px -7px rgba(36,82,63,.3)',
                }}
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
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, #2d6049, #24523F)',
              color: '#FFFFFF',
              borderRadius: 18,
              paddingTop: 16,
              paddingBottom: 16,
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 22px -8px rgba(36,82,63,.55), inset 0 2px 0 rgba(255,255,255,.16)',
            }}
          >
            계속하기
          </button>
        )}
      </div>
    </div>
  )
}
