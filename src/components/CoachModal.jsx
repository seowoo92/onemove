import { useState } from 'react'
import { COACH_INFO } from '../lib/coaches'

export default function CoachModal({ loading, message, onClose, coach }) {
  const info = COACH_INFO[coach] ?? { name: '코치', color: '#9AA39C', image: null }
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center coach-dim"
      style={{ backgroundColor: 'rgba(20, 46, 34, 0.45)' }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <style>{`
        @keyframes coachDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
        @keyframes coachDim{from{opacity:0}to{opacity:1}}
        @keyframes coachSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .coach-dim{animation:coachDim .22s ease both}
        .coach-sheet{animation:coachSheetUp .34s cubic-bezier(.22,.9,.3,1) both}
        @media (prefers-reduced-motion: reduce){.coach-dim,.coach-sheet{animation:none}}
      `}</style>
      <div
        className="coach-sheet"
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: 'calc(100% - 20px)',
          maxWidth: 480,
          backgroundColor: '#F9F6EE',
          borderRadius: '34px 34px 0 0',
          boxShadow: '0 -20px 50px -10px rgba(0,0,0,.3)',
          padding: '22px 22px 22px',
          boxSizing: 'border-box',
        }}
      >
        {/* 코치 메시지 말풍선 */}
        <div
          style={{
            position: 'relative',
            background: '#fff',
            borderRadius: 22,
            padding: '20px 20px 14px',
            boxShadow: '0 10px 26px -16px rgba(36,82,63,.28)',
            marginBottom: 22,
            minHeight: 92,
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 58 }}>
              <p style={{ fontSize: 14.5, fontWeight: 500, color: '#8A9E94', margin: 0 }}>코치가 메시지를 작성하고 있어요</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#C2A98F', display: 'block', animation: `coachDot 1.2s ${i * 0.16}s infinite ease-in-out` }} />
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 16, fontWeight: 700, color: '#24523F', lineHeight: 1.65, margin: 0, wordBreak: 'keep-all' }}>{message}</p>
          )}
          {/* 말풍선 꼬리 (캐릭터 방향) */}
          <div style={{ position: 'absolute', left: 46, bottom: -8, width: 18, height: 18, background: '#fff', transform: 'rotate(45deg)', borderRadius: '0 0 0 5px' }} />
        </div>

        {/* 코치 캐릭터 (하단 경계 아래로 내려 잘리게) */}
        {info.image && !imgError ? (
          <img
            src={info.image}
            alt={info.name}
            onError={() => setImgError(true)}
            style={{ position: 'absolute', left: 2, bottom: -36, width: 206, height: 'auto', display: 'block', zIndex: 1, pointerEvents: 'none' }}
          />
        ) : (
          <div style={{ position: 'absolute', left: 14, bottom: 0, width: 110, height: 110, borderRadius: '50%', background: info.color, zIndex: 1 }} />
        )}

        {/* 이름 + 계속하기 (캐릭터 오른쪽) */}
        <div style={{ marginLeft: 168, minHeight: 138, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#24523F' }}>{info.name}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#8A9E94', marginTop: 2, whiteSpace: 'nowrap' }}>코치가 한마디 건네요</div>
          <div style={{ flex: 1, minHeight: 18 }} />
          {!loading && (
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'linear-gradient(180deg, #2d6049, #24523F)', color: '#FFFFFF', border: 'none', borderRadius: 16, padding: 14, fontSize: 15.5, fontWeight: 700, boxShadow: '0 10px 22px -8px rgba(36,82,63,.5), inset 0 2px 0 rgba(255,255,255,.16)', cursor: 'pointer' }}
            >
              계속하기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
