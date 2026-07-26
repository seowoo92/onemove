import { supabase } from './supabase'

// 웹 푸시 (2026-07-26) — 카카오 카드는 '풍부한 내용', 웹 푸시는 '설치된 앱(PWA)으로 바로 진입' 역할.
// 구독은 기기 단위: 이 기기에서 켜면 이 기기로만 온다. 서버 발송은 send-push · remind-incomplete Edge Function.
// 아이폰은 iOS 16.4+ 에서 '홈 화면에 추가'한 앱으로 열었을 때만 푸시를 지원한다.

// VAPID 공개키 (raw P-256, base64url) — 비밀키는 Supabase Secrets(VAPID_KEYS)에만 존재
const VAPID_PUBLIC_KEY = 'BOCO6H-0w2uPI52atxMZBVXeOu_qi9JfxgxmMgcdXWXYcL_OCjTV582TFQwE2nGTutxiini5c_dZJyAeoV977j0'

function urlBase64ToUint8Array(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

async function getRegistration() {
  // 푸시 전용 SW — base(/onemove/) 스코프로 등록
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}push-sw.js`)
}

// 이 기기의 현재 구독 상태 (설정 토글 초기값용)
export async function getPushSubscription() {
  if (!isPushSupported()) return null
  try {
    const reg = await navigator.serviceWorker.getRegistration(`${import.meta.env.BASE_URL}push-sw.js`)
    return (await reg?.pushManager.getSubscription()) ?? null
  } catch {
    return null
  }
}

// 푸시 켜기: 권한 요청(사용자 탭에서만 호출) → 구독 → 서버에 저장
// 반환: { ok: true } | { ok: false, reason: 'unsupported'|'denied'|'error' }
export async function enablePush(userId) {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }
  if (!supabase || !userId) return { ok: false, reason: 'error' }
  try {
    const reg = await getRegistration()
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: 'denied' }

    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }))

    const json = sub.toJSON()
    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      user_id: userId,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    })
    if (error) return { ok: false, reason: 'error' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'error' }
  }
}

// 푸시 끄기: 구독 해지 + 서버 행 삭제
export async function disablePush() {
  try {
    const sub = await getPushSubscription()
    if (sub) {
      if (supabase) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      await sub.unsubscribe()
    }
    return true
  } catch {
    return false
  }
}

// 테스트 알림 — 실기기 검증·시연용 (send-push Edge Function 호출, 본인 구독 전체로 발송)
export async function sendTestPush() {
  if (!supabase) return false
  try {
    const { error } = await supabase.functions.invoke('send-push', { body: { type: 'test' } })
    return !error
  } catch {
    return false
  }
}
