// 오늘만큼 — 카카오 '나에게 보내기' 발송 Edge Function
// 배포: Supabase 대시보드 > Edge Functions > New function > 이름 send-kakao > 이 코드 붙여넣기
// 필요 Secrets: KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET (Edge Functions > Secrets)
// 주의: 이 함수는 "Verify JWT" 옵션을 끄고, 코드 안에서 직접 사용자 JWT를 검증한다
//       (켜두면 브라우저 CORS 사전요청(OPTIONS)이 차단됨)

import { createClient } from 'npm:@supabase/supabase-js@2'

const KAKAO_REST_KEY = Deno.env.get('KAKAO_REST_API_KEY') ?? ''
const KAKAO_SECRET = Deno.env.get('KAKAO_CLIENT_SECRET') ?? ''
const APP_URL = 'https://seowoo92.github.io/onemove/'

// service role — kakao_tokens 조회·갱신용 (RLS 우회, 서버 전용)
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function refreshKakaoToken(userId: string, refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: KAKAO_REST_KEY,
    refresh_token: refreshToken,
  })
  if (KAKAO_SECRET) body.set('client_secret', KAKAO_SECRET)
  const res = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`kakao token refresh failed: ${await res.text()}`)
  const tok = await res.json()
  const update: Record<string, unknown> = {
    access_token: tok.access_token,
    expires_at: new Date(Date.now() + (tok.expires_in ?? 21600) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
  // 카카오는 만료가 가까우면 새 refresh_token을 함께 내려준다 — 그때만 교체
  if (tok.refresh_token) update.refresh_token = tok.refresh_token
  await admin.from('kakao_tokens').update(update).eq('user_id', userId)
  return tok.access_token as string
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const { data: row } = await admin.from('kakao_tokens').select('*').eq('user_id', userId).maybeSingle()
  if (!row?.refresh_token) throw new Error('no kakao tokens for user')
  const stale = !row.access_token || !row.expires_at ||
    new Date(row.expires_at).getTime() < Date.now() + 60_000
  return stale ? await refreshKakaoToken(userId, row.refresh_token) : row.access_token
}

// 텍스트 템플릿 사용: 피드(카드) 템플릿은 본문을 2줄까지만 보여줘 루틴 목록이 잘린다.
// 텍스트 템플릿은 전문(최대 200자)이 그대로 표시됨.
export async function sendMemo(accessToken: string, text: string) {
  const template = {
    object_type: 'text',
    text,
    link: { web_url: APP_URL, mobile_web_url: APP_URL },
    button_title: '오늘만큼 열기',
  }
  const res = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ template_object: JSON.stringify(template) }),
  })
  if (!res.ok) throw new Error(`kakao send failed: ${await res.text()}`)
}

const WEATHER = { 좋아요: '맑음', 보통이에요: '구름', 힘들어요: '비' } as Record<string, string>

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    // 앱에서 로그인 사용자 JWT로 호출 — 본인 확인
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: CORS })
    }

    const { type, routine_names = [], state = '', nickname = '' } = await req.json()
    if (type !== 'routine_card') {
      return new Response(JSON.stringify({ error: 'unknown type' }), { status: 400, headers: CORS })
    }

    const accessToken = await getValidAccessToken(user.id)
    const weather = WEATHER[state] ?? ''
    const title = nickname ? `${nickname}님, 오늘의 루틴이 도착했어요` : '오늘의 루틴이 도착했어요'
    const list = routine_names.slice(0, 4).map((n: string) => `· ${n}`).join('\n')
    const text = `${title}${weather ? `\n오늘 마음 날씨 · ${weather}` : ''}\n\n${list}\n\n오늘 할 수 있는 만큼만, 가볍게 시작해요.`
    await sendMemo(accessToken, text)

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: CORS })
  }
})
