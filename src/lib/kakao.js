import { supabase } from './supabase'
import { storage } from './storage'

// 카카오 로그인 시 요청할 동의 항목.
// scopes를 지정하면 기본값을 덮어쓰므로, 기존 항목(닉네임·프로필·이메일)도 함께 나열해야 한다.
export const KAKAO_SCOPES = 'profile_nickname profile_image account_email talk_message'

// 로그인 직후 세션에 실려 오는 카카오 토큰을 서버(kakao_tokens)에 보관.
// provider 토큰은 갓 로그인한 세션에만 정확하므로 SIGNED_IN 이벤트에서만 호출할 것 —
// 저장된 옛 세션의 토큰으로 덮어쓰면 서버가 갱신해 둔 최신 토큰이 깨진다.
export async function saveKakaoTokens(session) {
  if (!supabase || !session?.provider_refresh_token) return
  try {
    await supabase.from('kakao_tokens').upsert({
      user_id: session.user.id,
      access_token: session.provider_token ?? null,
      // 카카오 access token 유효기간(약 6시간)보다 보수적으로 5시간
      expires_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      refresh_token: session.provider_refresh_token,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // 저장 실패는 조용히 — 다음 로그인 때 다시 시도된다
  }
}

// 오늘의 루틴 카드를 사용자 카톡(나와의 채팅)으로 발송.
// 조건: 로그인 + 알림 동의(onemove_notify) + 오늘 아직 안 보냄. 실패해도 앱 사용엔 지장 없음.
export async function sendRoutineCard(routineNames) {
  if (!supabase) return
  if (!storage.getNotify()) return
  const todayKey = storage.getTodayKey()
  if (localStorage.getItem('onemove_card_sent') === todayKey) return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.functions.invoke('send-kakao', {
      body: {
        type: 'routine_card',
        routine_names: routineNames,
        state: storage.getTodayState(),
        nickname: storage.getNickname(),
      },
    })
    if (!error) localStorage.setItem('onemove_card_sent', todayKey)
  } catch {
    // 발송 실패는 조용히 — 다음에 루틴을 새로 뽑을 때 재시도
  }
}
