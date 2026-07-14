// 오늘만큼 — Solar(업스테이지) 프록시 Edge Function
// 목적: API 키를 브라우저에 노출하지 않고 서버에서만 보관 (키 은닉)
// 배포: Supabase 대시보드 > Edge Functions > New function > 이름 solar-chat > 이 코드 붙여넣기
// 필요 Secrets: UPSTAGE_API_KEY
// 주의: "Verify JWT" 옵션은 끈다 (게스트도 코치 메시지를 받아야 하므로 로그인 불요)

const UPSTAGE_API_KEY = Deno.env.get('UPSTAGE_API_KEY') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const { messages, temperature = 0.8, max_tokens = 150 } = await req.json()

    // 범용 LLM 프록시로 악용되지 않도록 코치 메시지 용도에 맞게 제한
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 4) {
      return new Response(JSON.stringify({ error: 'invalid messages' }), { status: 400, headers: CORS })
    }
    for (const m of messages) {
      const roleOk = m?.role === 'system' || m?.role === 'user'
      const contentOk = typeof m?.content === 'string' && m.content.length <= 4000
      if (!roleOk || !contentOk) {
        return new Response(JSON.stringify({ error: 'invalid message item' }), { status: 400, headers: CORS })
      }
    }

    const res = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${UPSTAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages,
        temperature: Math.min(Number(temperature) || 0.8, 1),
        max_tokens: Math.min(Number(max_tokens) || 150, 200),
      }),
    })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `upstage ${res.status}` }), { status: 502, headers: CORS })
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    return new Response(JSON.stringify({ content }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: CORS })
  }
})
