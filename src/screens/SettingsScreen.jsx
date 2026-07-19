import { useState } from 'react'
import { storage } from '../lib/storage'
import { supabase } from '../lib/supabase'
import { KAKAO_SCOPES } from '../lib/kakao'
import { COACH_INFO } from '../lib/coaches'

const CRISIS = [
  { name: '국립정신건강센터\n정신건강상담', number: '1577-0199', tel: '1577-0199' },
  { name: '보건복지부\n자살예방상담', number: '109', tel: '109' },
]

const CARD_SHADOW = '0 8px 18px -14px rgba(36,82,63,.2)'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 12.5, fontWeight: 700, color: '#9AA69D', letterSpacing: '0.02em', margin: '15px 0 7px', paddingLeft: 4 }}>
      {children}
    </p>
  )
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#24523F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }} aria-hidden="true">
      <path d="M5.5 3c.3 1 .7 2 1.2 2.8-.4.6-.9 1-1.4 1.3.7 1.4 1.8 2.5 3.2 3.2.3-.5.7-1 1.3-1.4.8.5 1.8.9 2.8 1.2.2 1.1-.1 2-.9 2.6-.4.3-.9.3-1.3.3C6.3 13 3 9.7 3 4.6c0-.4 0-.9.3-1.3C3.9 2.6 4.6 2.4 5.5 3z" />
    </svg>
  )
}

export default function SettingsScreen({ coach, user, nickname, onNicknameChange, onGoToStateCheck, onGoToCoachSelect }) {
  const [notify, setNotify] = useState(() => storage.getNotify())
  const coachName = COACH_INFO[coach]?.name ?? '코치'

  function handleEditNickname() {
    const v = window.prompt('앱에서 불릴 이름을 입력하세요 (최대 12자)', nickname || '')
    if (v != null) onNicknameChange(v.trim().slice(0, 12))
  }

  function handleStateCheck() {
    const completed = storage.getCompletedIds()
    if (completed.length > 0) {
      const ok = window.confirm('마음 날씨를 다시 고르면 오늘 기록이 초기화돼요. 계속할까요?')
      if (!ok) return
    }
    ;['onemove_state', 'onemove_routines', 'onemove_completed', 'onemove_easy', 'onemove_skipped', 'onemove_review']
      .forEach(k => localStorage.removeItem(k))
    storage.removeHistoryEntry(storage.getTodayKey())
    onGoToStateCheck()
  }

  async function handleKakao() {
    if (!supabase) return
    if (user) {
      if (window.confirm('카카오 로그아웃할까요?')) await supabase.auth.signOut()
    } else {
      const redirectTo = window.location.origin + import.meta.env.BASE_URL
      await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo, scopes: KAKAO_SCOPES } })
    }
  }

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FAF6F0' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '8px 20px 14px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, color: '#24523F', margin: '0 0 12px' }}>설정</h2>

        {/* 프로필 헤더 */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '15px 18px', boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 19, fontWeight: 800, color: '#24523F', margin: 0 }}>
              {nickname ? `${nickname}님` : '이름을 정해주세요'}
            </p>
            <button
              onClick={handleEditNickname}
              style={{ fontSize: 12.5, fontWeight: 600, color: '#6F7D72', background: '#F0EDE8', border: 'none', borderRadius: 9, padding: '6px 12px', cursor: 'pointer' }}
            >
              변경
            </button>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#9AA39C', margin: '3px 0 0' }}>{coachName} 코치와 함께</p>
          <button
            onClick={handleKakao}
            style={{ width: '100%', marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FEE500', color: '#3C1E1E', borderRadius: 12, padding: 12, fontSize: 14.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2C4.9 2 1.5 4.6 1.5 7.8c0 2 1.4 3.8 3.5 4.8-.2.6-.7 2.3-.8 2.6 0 .3.2.3.4.2.2-.1 2.4-1.6 3.3-2.2.4 0 .7.1 1.1.1 4.1 0 7.5-2.6 7.5-5.8S13.1 2 9 2z" fill="#3C1E1E" /></svg>
            {user ? '카카오 연결됨' : '카카오 로그인'}
          </button>
        </div>

        {/* 알림 */}
        <SectionLabel>알림</SectionLabel>
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#24523F' }}>카카오톡 알림</span>
          <button
            onClick={() => { const n = !notify; setNotify(n); storage.setNotify(n) }}
            aria-label={notify ? '알림 끄기' : '알림 켜기'}
            style={{ width: 46, height: 26, borderRadius: 13, background: notify ? '#24523F' : '#C4BAB2', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color .2s', flexShrink: 0 }}
          >
            <span style={{ position: 'absolute', top: 3, left: notify ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
          </button>
        </div>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#B7AFA4', margin: '7px 0 0', paddingLeft: 4 }}>카카오 로그인 후 켜면, 오늘의 루틴 카드를 카카오톡(나와의 채팅)으로 보내드려요</p>

        {/* AI 코치 */}
        <SectionLabel>AI 코치</SectionLabel>
        <button
          onClick={onGoToCoachSelect}
          style={{ width: '100%', textAlign: 'left', background: '#fff', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <span>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#24523F' }}>AI 코치 다시 고르기</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#9AA39C', marginTop: 2 }}>AI 코치 성격을 변경할 수 있어요</span>
          </span>
          <span style={{ fontSize: 18, color: '#C4BAB2', lineHeight: 1, flex: 'none' }}>›</span>
        </button>

        {/* 마음 날씨 */}
        <SectionLabel>마음 날씨</SectionLabel>
        <button
          onClick={handleStateCheck}
          style={{ width: '100%', textAlign: 'left', background: '#fff', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <span>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#24523F' }}>마음 날씨 다시 고르기</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#9AA39C', marginTop: 2 }}>다시 고르면 오늘 루틴이 초기화돼요</span>
          </span>
          <span style={{ fontSize: 18, color: '#C4BAB2', lineHeight: 1, flex: 'none' }}>›</span>
        </button>

        {/* 마음이 많이 힘들 때 */}
        <SectionLabel>마음이 많이 힘들 때</SectionLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          {CRISIS.map(({ name, number, tel }) => (
            <a
              key={tel}
              href={`tel:${tel}`}
              style={{ flex: 1, background: '#F1F2EF', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', display: 'block' }}
            >
              <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#3A4A40', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 15, fontWeight: 800, color: '#24523F' }}>
                <PhoneIcon />{number}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
