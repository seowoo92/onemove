// 오늘만큼 — 웹 푸시 발송 Edge Function
// 배포: Supabase 대시보드 > Edge Functions > New function > 이름 send-push > 이 코드 붙여넣기
// 필요 Secrets: VAPID_KEYS (vapid-keys.json 내용 그대로 — {"publicKey":{...JWK},"privateKey":{...JWK}})
// 주의: "Verify JWT" 옵션은 끄고, 코드 안에서 직접 사용자 JWT를 검증한다 (send-kakao와 동일 패턴)

import { createClient } from 'npm:@supabase/supabase-js@2'
import * as webpush from 'jsr:@negrel/webpush'

const APP_URL = 'https://seowoo92.github.io/onemove/'
const CONTACT = 'mailto:project.greenist21@gmail.com'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let appServer: webpush.ApplicationServer | null = null
async function getAppServer(): Promise<webpush.ApplicationServer> {
  if (appServer) return appServer
  const exported = JSON.parse(Deno.env.get('VAPID_KEYS') ?? '{}')
  const vapidKeys = await webpush.importVapidKeys(exported, { extractable: false })
  appServer = await webpush.ApplicationServer.new({ contactInformation: CONTACT, vapidKeys })
  return appServer
}

// 사용자의 모든 기기 구독으로 발송. 만료된 구독(410/404)은 정리한다.
export async function pushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  const { data: subs } = await admin.from('push_subscriptions').select('*').eq('user_id', userId)
  if (!subs?.length) return { sent: 0, gone: 0 }
  const server = await getAppServer()
  let sent = 0, gone = 0
  for (const s of subs) {
    try {
      const subscriber = server.subscribe({
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      })
      await subscriber.pushTextMessage(JSON.stringify({ url: APP_URL, ...payload }), {})
      sent++
    } catch (e) {
      // 브라우저에서 구독이 사라진 경우 — 서버 행도 정리
      const msg = String(e)
      if (msg.includes('410') || msg.includes('404')) {
        await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        gone++
      }
    }
  }
  return { sent, gone }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    // 앱에서 로그인 사용자 JWT로 호출 — 본인에게만 발송 가능
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

    const { type } = await req.json()
    if (type !== 'test') {
      return new Response(JSON.stringify({ error: 'unknown type' }), { status: 400, headers: CORS })
    }

    // 제목에 실제 메시지를 넣는다 — 제목이 앱 이름이면 iOS 출처 표기와 이중으로 보임
    const result = await pushToUser(user.id, {
      title: '알림이 연결됐어요',
      body: '이렇게 조용히 도착할 거예요.',
    })

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: CORS })
  }
})
