// 오늘만큼 — 오후 미완료 루틴 리마인더 (스케줄 실행 전용)
// 배포: Supabase 대시보드 > Edge Functions > New function > 이름 remind-incomplete > 이 코드 붙여넣기
// 필요 Secrets: KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET, CRON_SECRET
// 실행: pg_cron이 매일 오후 6시(KST)에 x-cron-key 헤더와 함께 호출
// 주의: "Verify JWT" 옵션은 끄고, CRON_SECRET 헤더로 호출자를 검증한다

import { createClient } from 'npm:@supabase/supabase-js@2'

const KAKAO_REST_KEY = Deno.env.get('KAKAO_REST_API_KEY') ?? ''
const KAKAO_SECRET = Deno.env.get('KAKAO_CLIENT_SECRET') ?? ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''
const APP_URL = 'https://seowoo92.github.io/onemove/'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

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
  if (tok.refresh_token) update.refresh_token = tok.refresh_token
  await admin.from('kakao_tokens').update(update).eq('user_id', userId)
  return tok.access_token as string
}

async function getValidAccessToken(userId: string): Promise<string> {
  const { data: row } = await admin.from('kakao_tokens').select('*').eq('user_id', userId).maybeSingle()
  if (!row?.refresh_token) throw new Error('no kakao tokens for user')
  const stale = !row.access_token || !row.expires_at ||
    new Date(row.expires_at).getTime() < Date.now() + 60_000
  return stale ? await refreshKakaoToken(userId, row.refresh_token) : row.access_token
}

async function sendMemo(accessToken: string, text: string) {
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

// 서버는 UTC로 돌므로 KST 기준 오늘 날짜를 직접 계산
function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  // 스케줄러 전용 — 비밀 키 없이 호출하면 거부
  if (!CRON_SECRET || req.headers.get('x-cron-key') !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  }

  const today = todayKST()
  const { data: entries } = await admin.from('daily_entries').select('*').eq('entry_date', today)

  let sent = 0, skipped = 0, failed = 0
  for (const e of entries ?? []) {
    const done = new Set([...(e.completed_ids ?? []), ...(e.skipped_ids ?? [])])
    const ids: string[] = e.routine_ids ?? []
    const names: string[] = e.routine_names ?? []
    const remaining = ids
      .map((id, i) => ({ id, name: names[i] ?? '남은 루틴' }))
      .filter(({ id }) => !done.has(id))
    if (remaining.length === 0) { skipped++; continue } // 다 했거나 다 쉬어감 — 방해하지 않는다

    const { data: prof } = await admin.from('profiles').select('*').eq('user_id', e.user_id).maybeSingle()
    if (!prof?.notify_enabled) { skipped++; continue }

    try {
      const accessToken = await getValidAccessToken(e.user_id)
      const nick = prof.nickname ? `${prof.nickname}님, ` : ''
      const list = remaining.map(({ name }) => `· ${name}`).join('\n')
      // 죄책감을 주지 않는 톤 — 재촉이 아니라 가볍게 떠올려주기
      const text = `${nick}오늘 이만큼 남아 있어요\n\n${list}\n\n딱 하나만 해도 충분해요. 무리하지 않아도 괜찮아요.`
      await sendMemo(accessToken, text)
      sent++
    } catch (_e) {
      failed++
    }
  }

  return new Response(JSON.stringify({ ok: true, date: today, sent, skipped, failed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
