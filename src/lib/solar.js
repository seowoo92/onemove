const COMMON_RULES = `
추가 금지 사항:
- '작은 걸음', '큰 변화', '성장', '발전', '더 하세요', '계속 도전' 같이 더 하길 권유하거나 미래 변화를 약속하는 표현 금지
- 이미 한 것에 대해 충분히 인정하고 마무리할 것
- 화살표(→), 따옴표 사용 금지
- 문장을 절대 반복하지 말 것`

// 성격별 시스템 프롬프트
const SYSTEM_PROMPTS = {
  유쾌: `당신은 유쾌하고 장난기 있는 친구 같은 루틴 코치입니다.
말투 규칙:
- 친근한 존댓말로 일관되게 말합니다. (예: ~했네요, ~잖아요, ~해봐요)
- 반말과 존댓말을 절대 섞지 않습니다.
- 가볍고 활기찬 톤으로, 짧은 감탄사 사용 가능 (오, 와, 어머 등)
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 대신 일상적인 한국어로: '해냈네요', '했잖아요', '됐어요', '괜찮네요' 등
- 2문장만 출력, 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
- 제안형 문장('~해볼까요?', '~어떨까요?', '~해보세요') 사용 금지. 이미 한 것에 집중해서 인정하는 말로 마무리할 것.
예시: '오, 해냈네요! 나갔다 온 것만으로도 충분했잖아요.'${COMMON_RULES}`,

  진중: `당신은 차분하고 신뢰감 있는 멘토 같은 루틴 코치입니다.
말투 규칙:
- 정중한 존댓말로 일관되게 말합니다. (예: ~했습니다, ~됩니다, ~하세요)
- 담백하고 간결하게, 과장 없이 사실에 기반해서
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 대신 담백한 표현으로: '해냈습니다', '충분합니다', '잘 하셨습니다' 등
- 2문장만 출력, 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
예시: '머리를 빗었습니다. 오늘도 자신을 챙겼습니다.'${COMMON_RULES}`,

  다정: `당신은 따뜻하고 부드러운 동반자 같은 루틴 코치입니다.
말투 규칙:
- 따뜻한 존댓말로 일관되게 말합니다. (예: ~했어요, ~해요, ~거예요)
- 공감을 먼저 건네고, 토닥이듯 부드럽게
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 대신 따뜻한 표현으로: '잘 했어요', '고생했어요', '괜찮아요', '대단해요' 등
- 2문장만 출력, 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
예시: '머리 빗는 것도 오늘을 버티는 힘이에요. 잘 했어요.'${COMMON_RULES}`,
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
    routine_done: (n) => `오, ${n} 해냈네요! 진짜로 해냈잖아요.`,
    easy_done:    (n) => `쉬운 버전으로 ${n} 했네요. 어쨌든 해낸 거잖아요.`,
    rest_day:     ()  => `오늘은 쉬기로 했네요. 그것도 오늘의 선택이잖아요.`,
    all_done:     (n) => `오늘 루틴 전부 다 해냈네요! ${n}까지 다 했잖아요.`,
  },
  진중: {
    routine_done: (n) => `${n} 완료했습니다. 오늘 할 것을 해냈습니다.`,
    easy_done:    (n) => `${n}의 쉬운 버전을 선택했습니다. 해낸 것으로 충분합니다.`,
    rest_day:     ()  => `오늘 쉬어가기로 했습니다. 그 선택을 존중합니다.`,
    all_done:     ()  => `오늘의 모든 루틴을 마쳤습니다. 잘 하셨습니다.`,
  },
  다정: {
    routine_done: (n) => `${n} 해냈어요. 오늘 그것만으로도 충분해요.`,
    easy_done:    (n) => `컨디션 맞게 ${n} 해냈어요. 그걸로 됐어요.`,
    rest_day:     ()  => `오늘 쉬기로 했어요. 그래도 괜찮아요.`,
    all_done:     ()  => `오늘 루틴을 다 마쳤어요. 정말 잘 했어요.`,
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

// ③ 화살표·따옴표 제거
function removeSpecialChars(text) {
  return text.replace(/→/g, '').replace(/["""]/g, '').replace(/[''']/g, '').replace(/\s{2,}/g, ' ').trim()
}

// ④ 중복 문장 제거 (완전 일치 + 앞 10글자 유사 일치)
function deduplicateSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
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

// ⑤ 2문장 초과 시 앞 2문장만 사용
function limitToTwoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  return sentences.slice(0, 2).join(' ').trim()
}

// ⑥ 마지막 문자가 문장 부호가 아니면 마침표 추가
function ensureEndPunctuation(text) {
  return /[.!?]$/.test(text) ? text : text + '.'
}

function cleanMessage(text) {
  let result = removeEmoji(text)
  result = removeThinkTags(result)
  result = removeSpecialChars(result)
  result = deduplicateSentences(result)
  result = limitToTwoSentences(result)
  result = ensureEndPunctuation(result)
  return result
}

function buildUserPrompt(state, routineName, situation) {
  return `오늘 상태: ${state}
루틴: ${routineName}
상황: ${SITUATION_LABELS[situation]}
이 사용자에게 격려 메시지를 써줘.`
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
export async function generateCoachMessage({ personality, state, routineName, situation }) {
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
            { role: 'user', content: buildUserPrompt(state, routineName, situation) },
          ],
          temperature: 0.8,
          max_tokens: 150,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const raw = data.choices?.[0]?.message?.content?.trim()
        if (raw) return { message: cleanMessage(raw), source: 'solar' }
      }
    } catch {
      // API 실패 시 fallback으로
    }
  }

  const fallbackFn = FALLBACK[personality]?.[situation]
  const message = fallbackFn ? fallbackFn(routineName) : '오늘도 잘했어요.'
  return { message, source: 'fallback' }
}
