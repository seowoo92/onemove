import { useState } from 'react'
import { COACH_INFO, COACH_KEYS } from '../lib/coaches'

// 한글 조사 '과/와': 받침 있으면 '과', 없으면 '와'
function withParticle(name) {
  const last = name[name.length - 1] ?? ''
  const code = last.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return '와'
  return (code - 0xac00) % 28 === 0 ? '와' : '과'
}

function CoachAvatar({ info, size }) {
  const [imgError, setImgError] = useState(false)

  if (info.image && !imgError) {
    return (
      <img
        src={info.image}
        alt={info.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 34% 30%, ${info.colorLight ?? info.color}cc, ${info.color} 55%, ${info.colorDark ?? info.color}dd)`,
        boxShadow: 'inset 0 -8px 16px rgba(0,0,0,.14), inset 0 6px 11px rgba(255,255,255,.55)',
      }}
    />
  )
}

export default function CoachSelect({ onSelect, initialSelected = '유쾌', onBack = null }) {
  const [selected, setSelected] = useState(initialSelected ?? '유쾌')
  const current = COACH_INFO[selected]

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FAF6F0',
        position: 'relative',
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 16,
            left: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#8A9E94',
            padding: '4px 0',
            zIndex: 1,
          }}
        >
          ← 뒤로
        </button>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100%',
          padding: '24px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* 제목 */}
        <h2 style={{ fontSize: 23, fontWeight: 800, color: '#24523F', letterSpacing: '-0.03em', lineHeight: 1.35, margin: 0 }}>
          함께할 코치를 골라요
        </h2>

        {/* 부제 */}
        <p style={{ fontSize: 14, color: '#6f7d72', marginTop: 12, marginBottom: 0 }}>
          탭해서 성격을 미리 느껴보세요.
        </p>

        {/* 아바타 + 이름 + 한마디 */}
        <div style={{ marginTop: 46, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CoachAvatar info={current} size={200} />
          <p style={{ fontSize: 20, fontWeight: 800, color: '#24523F', marginTop: 18, marginBottom: 0 }}>
            {current.name}
          </p>
          <p
            style={{
              fontSize: 14.5,
              fontWeight: 500,
              color: '#7c8a80',
              marginTop: 7,
              marginBottom: 0,
              maxWidth: 280,
              lineHeight: 1.55,
              wordBreak: 'keep-all',
            }}
          >
            "{current.tagline}"
          </p>
        </div>

        {/* 썸네일 */}
        <div style={{ marginTop: 42, display: 'flex', gap: 18, alignItems: 'flex-end', justifyContent: 'center' }}>
          {COACH_KEYS.map((key) => {
            const info = COACH_INFO[key]
            const active = selected === key
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div
                  style={{
                    borderRadius: '50%',
                    boxShadow: active ? '0 0 0 3px #24523F' : '0 0 0 3px transparent',
                    transition: 'box-shadow 0.15s',
                    padding: 3,
                  }}
                >
                  <CoachAvatar info={info} size={74} />
                </div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: active ? '#24523F' : '#9AA39C', margin: 0, transition: 'color 0.15s' }}>
                  {key}
                </p>
              </button>
            )
          })}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={() => onSelect(selected)}
          style={{
            width: '100%',
            marginTop: 32,
            background: 'linear-gradient(180deg, #2d6049, #24523F)',
            color: '#FFFFFF',
            borderRadius: 18,
            paddingTop: 17,
            paddingBottom: 17,
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 22px -8px rgba(36,82,63,.5), inset 0 2px 0 rgba(255,255,255,.16)',
          }}
        >
          {current.name}{withParticle(current.name)} 함께하기
        </button>
      </div>
    </div>
  )
}
