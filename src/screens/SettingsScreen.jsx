import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { supabase } from '../lib/supabase'

const COACHES = ['유쾌', '진중', '다정']

export default function SettingsScreen({ coach, user, nickname, onCoachChange, onNicknameChange, onGoToStateCheck }) {
  const [inputValue, setInputValue] = useState(nickname)
  const [saved, setSaved] = useState(false)
  const [notify, setNotify] = useState(() => storage.getNotify())

  useEffect(() => {
    setInputValue(nickname)
  }, [nickname])

  function handleNicknameSave() {
    const trimmed = inputValue.trim()
    onNicknameChange(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleStateCheck() {
    const completed = storage.getCompletedIds()
    if (completed.length > 0) {
      const ok = window.confirm('마음 날씨를 다시 고르면 오늘 기록이 초기화돼요. 계속할까요?')
      if (!ok) return
    }
    ;['onemove_state', 'onemove_routines', 'onemove_completed', 'onemove_easy', 'onemove_skipped']
      .forEach(k => localStorage.removeItem(k))
    onGoToStateCheck()
  }

  async function handleKakaoLogin() {
    if (!supabase) return
    const redirectTo = window.location.origin + import.meta.env.BASE_URL
    await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo } })
  }

  async function handleLogout() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const accountLabel = nickname ? `${nickname}님으로 로그인됨` : '로그인됨'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="w-full max-w-[480px] mx-auto px-5 pt-10 pb-24">
        <h2 className="text-2xl font-bold mb-8" style={{ color: '#24523F' }}>설정</h2>

        {/* 닉네임 */}
        <div className="rounded-2xl p-5 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xs mb-3" style={{ color: '#8A9E94' }}>닉네임</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, 12))}
              placeholder="앱에서 불릴 이름을 입력하세요"
              maxLength={12}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                border: '1.5px solid #ECE6DC',
                color: '#22302A',
                backgroundColor: '#FFFFFF',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#24523F' }}
              onBlur={(e) => { e.target.style.borderColor = '#ECE6DC' }}
            />
            <button
              onClick={handleNicknameSave}
              className="px-4 py-2.5 rounded-xl text-sm font-medium shrink-0"
              style={{ backgroundColor: '#24523F', color: '#FFFFFF' }}
            >
              저장
            </button>
          </div>
          {saved && (
            <p className="text-xs mt-2" style={{ color: '#24523F' }}>저장되었어요</p>
          )}
        </div>

        {/* 카카오톡 알림 토글 */}
        <div className="rounded-2xl p-5 mb-1" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center justify-between">
            <p className="text-base font-medium" style={{ color: '#22302A' }}>카카오톡 알림</p>
            <button
              onClick={() => {
                const next = !notify
                setNotify(next)
                storage.setNotify(next)
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: notify ? '#24523F' : '#C4BAB2',
                position: 'relative',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
              aria-label={notify ? '알림 끄기' : '알림 켜기'}
            >
              <span style={{
                position: 'absolute',
                top: 2,
                left: notify ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                transition: 'left 0.2s',
                display: 'block',
              }} />
            </button>
          </div>
        </div>
        <p className="text-xs mb-3 px-1" style={{ color: '#C4BAB2' }}>
          알림 발송은 카카오 채널 연동 후 제공돼요
        </p>

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

        {/* 마음 날씨 다시 고르기 */}
        <div className="rounded-2xl p-5 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
          <button onClick={handleStateCheck} className="w-full text-left">
            <p className="text-base font-medium" style={{ color: '#22302A' }}>마음 날씨 다시 고르기</p>
            <p className="text-xs mt-0.5" style={{ color: '#8A9E94' }}>
              마음 날씨를 다시 고르면 오늘 루틴이 새로 시작돼요
            </p>
          </button>
        </div>

        {/* 계정 */}
        <div className="rounded-2xl p-5 mb-10" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xs mb-3" style={{ color: '#8A9E94' }}>계정</p>
          {user ? (
            <>
              <p className="text-base font-medium mb-3" style={{ color: '#22302A' }}>
                {accountLabel}
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ backgroundColor: '#F0EDE8', color: '#5C7066' }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: '#8A9E94' }}>
                로그인하면 루틴 카드를 카카오톡으로 받을 수 있어요
              </p>
              <button
                onClick={handleKakaoLogin}
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
              >
                카카오 로그인
              </button>
            </>
          )}
        </div>

        {/* 위기 상담 연락처 */}
        <div className="mb-8">
          <p className="text-xs mb-2" style={{ color: '#8A9E94' }}>마음이 많이 힘들 때</p>
          <div className="flex flex-col gap-2">
            {[
              { name: '국립정신건강센터 정신건강상담', number: '1577-0199', tel: '1577-0199' },
              { name: '보건복지부 자살예방상담', number: '109', tel: '109' },
            ].map(({ name, number, tel }) => (
              <a
                key={tel}
                href={`tel:${tel}`}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: '#FFFFFF', textDecoration: 'none' }}
              >
                <span className="text-sm" style={{ color: '#5C7066' }}>{name}</span>
                <span className="text-sm font-bold" style={{ color: '#24523F' }}>{number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 하단 정보 */}
        <p className="text-xs text-center" style={{ color: '#C4BAB2' }}>
          오늘만큼 · CBT 기반 회복 루틴 코치
        </p>
      </div>
    </div>
  )
}
