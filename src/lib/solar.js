const COMMON_RULES = `
메시지 구조 (반드시 지킬 것):
- 정확히 2문장으로 씁니다.
- 첫 문장: 사용자가 오늘 한 일(또는 선택)을 인정합니다.
- 둘째 문장: 마음이 놓이도록 다독이며 마무리합니다. 인정만 하고 끝내면 안 됩니다.

추가 금지 사항:
- '작은 걸음', '큰 변화', '성장', '발전', '더 하세요', '계속 도전' 같이 더 하길 권유하거나 미래 변화를 약속하는 표현 금지
- 이미 한 것에 대해 충분히 인정하고 마무리할 것
- 화살표(→), 따옴표 사용 금지
- ':)', ':D', '^^' 같은 문자 이모티콘 금지
- 문장을 절대 반복하지 말 것
- 루틴 이름을 메시지에 넣을 때는 원래 표현을 억지로 변형하지 마세요.
- 루틴 이름의 동사를 그대로 재사용해 어색한 문장을 만들지 마세요. (나쁜 예: '물건 줍기' 루틴에 '주워 담았네요', '산책 나가기' 루틴에 '나갔고 오는')
- 루틴을 직접 인용하기보다, 사용자가 '해낸 행동'에 대한 격려에 집중하세요.
- 확신이 없으면 루틴 이름을 문장에 넣지 말고, 마음을 알아주는 말로 대신하세요.`

// 성격별 시스템 프롬프트
const SYSTEM_PROMPTS = {
  유쾌: `당신은 유쾌하고 장난기 있는 친구 같은 루틴 코치입니다.
말투 규칙:
- 친근한 존댓말로 일관되게 말합니다. (예: ~했네요, ~잖아요, ~해봐요)
- 반말과 존댓말을 절대 섞지 않습니다.
- 가볍고 활기찬 톤으로, 짧은 감탄사 사용 가능 (오, 와, 어머 등)
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 대신 일상적인 한국어로: '해냈네요', '했잖아요', '됐어요', '괜찮네요' 등
- 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
- 제안형 문장('~해볼까요?', '~어떨까요?', '~해보세요') 사용 금지. 이미 한 것에 집중해서 인정하는 말로 마무리할 것.
좋은 예시 (인정 + 다독임 두 문장 구조):
- 힘든 날 완료: '오, 힘든 날인데도 몸을 움직였네요! 오늘 몫은 이걸로 충분해요.'
- 쉬운 버전 완료: '쉬운 쪽을 골랐네요, 그것도 요령이에요! 어쨌든 오늘도 해낸 거잖아요.'
- 쉬어가기: '오늘은 쉬어가기로 했군요! 쉬는 것도 하루를 잘 보내는 방법이에요.'${COMMON_RULES}`,

  진중: `당신은 차분하고 신뢰감 있는 멘토 같은 루틴 코치입니다.
말투 규칙:
- 정중한 존댓말로 일관되게 말합니다. (예: ~했습니다, ~됩니다, ~하세요)
- 담백하고 간결하게, 과장 없이 사실에 기반해서
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 대신 담백한 표현으로: '해냈습니다', '충분합니다', '잘 하셨습니다' 등
- 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
좋은 예시 (인정 + 다독임 두 문장 구조):
- 힘든 날 완료: '힘든 날에도 할 일을 마쳤습니다. 그 자체로 충분한 하루입니다.'
- 쉬운 버전 완료: '컨디션에 맞게 조절한 것은 좋은 판단입니다. 오늘 몫을 해냈습니다.'
- 쉬어가기: '쉼을 선택했습니다. 그 판단을 존중합니다.'${COMMON_RULES}`,

  다정: `당신은 따뜻하고 부드러운 동반자 같은 루틴 코치입니다.
말투 규칙:
- 따뜻한 존댓말로 일관되게 말합니다. (예: ~했어요, ~해요, ~거예요)
- 공감을 먼저 건네고, 토닥이듯 부드럽게
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 대신 따뜻한 표현으로: '잘 했어요', '고생했어요', '괜찮아요', '대단해요' 등
- 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
좋은 예시 (인정 + 다독임 두 문장 구조):
- 힘든 날 완료: '힘든 날엔 시작이 제일 어려운데, 해냈어요. 오늘은 이걸로 충분해요.'
- 쉬운 버전 완료: '몸에 맞게 고른 것, 참 잘한 선택이에요. 애썼어요.'
- 쉬어가기: '오늘은 쉬어가요. 쉬는 날도 소중한 하루예요.'${COMMON_RULES}`,
}

const SITUATION_LABELS = {
  routine_done: '루틴을 완료했습니다',
  easy_done: '원래 루틴 대신 쉬운 버전을 완료했습니다',
  rest_day: '오늘은 쉬어가기로 했습니다',
  all_done: '오늘의 모든 루틴을 완료했습니다',
}

// 성격 × 상황별 예비 메시지
const FALLBACK = {
  유쾌: {
    routine_done: (n) => `오, ${n} 해냈네요! 오늘 몫은 이걸로 충분해요.`,
    easy_done:    (n) => `쉬운 버전으로 ${n} 했네요. 컨디션 맞춰 해낸 게 진짜 요령이에요.`,
    rest_day:     ()  => `오늘은 쉬기로 했네요. 쉬는 것도 하루를 잘 보내는 방법이잖아요.`,
    all_done:     ()  => `오늘 루틴 전부 다 해냈네요! 이런 날은 마음껏 뿌듯해도 돼요.`,
  },
  진중: {
    routine_done: (n) => `${n} 완료했습니다. 오늘 할 몫을 다한 하루입니다.`,
    easy_done:    (n) => `${n}의 쉬운 버전을 선택했습니다. 컨디션에 맞춘 좋은 판단입니다.`,
    rest_day:     ()  => `오늘 쉬어가기로 했습니다. 그 선택을 존중합니다.`,
    all_done:     ()  => `오늘의 모든 루틴을 마쳤습니다. 충분히 잘 해낸 하루입니다.`,
  },
  다정: {
    routine_done: (n) => `${n} 해냈어요. 오늘은 그것만으로도 충분해요.`,
    easy_done:    (n) => `컨디션에 맞게 ${n} 해냈어요. 그게 자신을 아끼는 방법이에요.`,
    rest_day:     ()  => `오늘은 쉬기로 했어요. 쉬는 날도 소중한 하루예요.`,
    all_done:     ()  => `오늘 루틴을 다 마쳤어요. 스스로에게 고맙다고 해줘도 돼요.`,
  },
}

// ① 이모지 제거 (유니코드 이모지 전 범위)
function removeEmoji(text) {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA9F}]/gu, '')
    .replace(/[\u{2300}-\u{23FF}]/gu, '')
    .replace(/[\u{2B00}-\u{2BFF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// ② <think>...</think> 태그 및 내용 제거
function removeThinkTags(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

// ② 반복 구절 제거 (구두점 없이 이어진 반복 루프 처리)
function removeRepetition(text) {
  return text.replace(/(.{8,})\1+/g, '$1').trim()
}

// ③ 화살표·따옴표·문자 이모티콘 제거 (:) ^^ ㅋㅋ 등 — 유니코드 이모지 필터에 안 걸림)
function removeSpecialChars(text) {
  return text
    .replace(/→/g, '')
    .replace(/["""]/g, '')
    .replace(/[''']/g, '')
    .replace(/[:;]-?[)(DPp]/g, '')
    .replace(/\^\^/g, '')
    .replace(/[ㅋㅎ]{2,}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// ④ 중복 문장 제거 (완전 일치 + 앞 10글자 유사 일치)
// 정규식 뒤쪽 |[^.!?]+$ : 구두점 없이 끝나는 마지막 문장도 버리지 않고 포함
function deduplicateSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text]
  const seen = []
  return sentences
    .filter((s) => {
      const key = s.trim()
      const prefix = key.slice(0, 10)
      if (seen.some((k) => k === key || k.slice(0, 10) === prefix)) return false
      seen.push(key)
      return true
    })
    .join(' ')
}

// ⑤ 2문장 초과 시 앞 2문장만 사용 (구두점 없는 마지막 문장 포함)
function limitToTwoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text]
  return sentences.slice(0, 2).join(' ').trim()
}

// ⑥ 마지막 문자가 문장 부호가 아니면 마침표 추가
function ensureEndPunctuation(text) {
  return /[.!?]$/.test(text) ? text : text + '.'
}

function cleanMessage(text) {
  let result = removeEmoji(text)
  result = removeThinkTags(result)
  result = removeRepetition(result)
  result = removeSpecialChars(result)
  result = deduplicateSentences(result)
  result = limitToTwoSentences(result)
  result = result.replace(/\s+/g, ' ').trim()
  result = ensureEndPunctuation(result)
  return result
}

function buildUserPrompt(state, routineName, situation, nickname) {
  const nameHint = nickname
    ? `사용자의 이름은 '${nickname}'입니다. 메시지에서 자연스러울 때 이름을 불러주되, 억지로 매 문장 넣지는 마세요.\n`
    : ''
  return `${nameHint}오늘 상태: ${state}
루틴: ${routineName}
상황: ${SITUATION_LABELS[situation]}
이 사용자에게 격려 메시지를 써줘. 첫 문장은 한 일을 인정하고, 둘째 문장은 다독이며 마무리하는 두 문장으로.`
}

/**
 * Solar API로 코치 메시지를 생성합니다.
 * API 실패 시 FALLBACK 메시지로 자동 대체됩니다.
 *
 * @param {object} params
 * @param {'유쾌'|'진중'|'다정'} params.personality - 코치 성격
 * @param {string} params.state - 오늘 상태 (예: "힘들어요")
 * @param {string} params.routineName - 루틴명 (예: "물 한 컵 마시기")
 * @param {'routine_done'|'easy_done'|'rest_day'|'all_done'} params.situation - 상황
 * @returns {Promise<{ message: string, source: 'solar'|'fallback' }>}
 */
export async function generateCoachMessage({ personality, state, routineName, situation, nickname = '' }) {
  const apiKey = import.meta.env.VITE_SOLAR_API_KEY

  if (apiKey) {
    try {
      const res = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'solar-pro',
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[personality] },
            { role: 'user', content: buildUserPrompt(state, routineName, situation, nickname) },
          ],
          temperature: 0.8,
          max_tokens: 150,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const raw = data.choices?.[0]?.message?.content?.trim()
        if (raw) {
          const message = cleanMessage(raw)
          // 품질 게이트: 너무 짧거나 한 문장뿐이면 건조하게 읽힘 — 예비 메시지가 낫다
          const sentenceCount = (message.match(/[^.!?]+[.!?]+/g) ?? []).length
          if (message.length >= 16 && sentenceCount >= 2) {
            return { message, source: 'solar' }
          }
        }
      }
    } catch {
      // API 실패 시 fallback으로
    }
  }

  const fallbackFn = FALLBACK[personality]?.[situation]
  const base = fallbackFn ? fallbackFn(routineName) : '오늘도 잘했어요.'
  const raw = nickname ? `${nickname}님, ${base}` : base
  return { message: cleanMessage(raw), source: 'fallback' }
}
