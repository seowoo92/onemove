import { supabase } from '../lib/supabase'

export default function WelcomeScreen({ onSkip }) {
  async function handleKakaoLogin() {
    if (!supabase) { onSkip(); return }
    const redirectTo = window.location.origin + import.meta.env.BASE_URL
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo },
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="flex-1 flex flex-col justify-center w-full max-w-[480px] mx-auto px-5 py-12">

        {/* 로고 + 슬로건 */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#24523F' }}>오늘만큼</h1>
          <p className="text-base" style={{ color: '#22302A' }}>오늘 할 수 있는 만큼만</p>
        </div>

        {/* 카카오 혜택 카드 */}
        <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-base font-semibold mb-3" style={{ color: '#22302A' }}>카카오로 시작하면</p>
          <ul className="flex flex-col gap-2">
            <li className="text-sm" style={{ color: '#5C7066' }}>
              · 매일의 루틴 카드를 카카오톡으로 받을 수 있어요
            </li>
            <li className="text-sm" style={{ color: '#5C7066' }}>
              · 루틴 알림을 카카오톡으로 받을 수 있어요
            </li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleKakaoLogin}
            className="w-full py-3.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
          >
            카카오로 시작하기
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#FFFFFF', color: '#24523F', border: '1.5px solid #24523F' }}
          >
            로그인 없이 시작하기
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-xs text-center" style={{ color: '#9AA39C' }}>
          로그인 없이 시작해도 나중에 설정에서 카카오 로그인을 할 수 있어요
        </p>
      </div>
    </div>
  )
}
