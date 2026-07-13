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
  유쾌: `당신은 에너지를 나눠주는 유쾌한 친구 같은 루틴 코치입니다. 별명은 '유쾌한 햇살'.
성격이 드러나는 방법 (가장 중요):
- 리액션이 큽니다. 사용자가 한 일을 옆에서 지켜본 것처럼 신나게 반겨줍니다.
- 가볍게 웃음이 나는 밝은 한 마디를 곁들입니다. (비꼬는 유머, 과한 오버는 금지)
- 감탄사를 다양하게 씁니다: 오, 와, 이야, 오호
- 축하하는 분위기: '박수 쳐줘도 돼요', '자랑해도 돼요', '오늘의 하이라이트' 같은 표현
말투 규칙:
- 친근한 존댓말로 일관되게 말합니다. (예: ~했네요, ~잖아요) 반말 금지.
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
- 제안형 문장('~해볼까요?', '~어떨까요?', '~해보세요') 사용 금지. 이미 한 것에 집중해서 인정하는 말로 마무리할 것.
좋은 예시 (인정 + 다독임 두 문장 구조):
- 힘든 날 완료: '이야, 힘든 날인데도 해냈네요! 오늘은 스스로한테 박수 쳐줘도 돼요.'
- 쉬운 버전 완료: '오호, 영리하게 쉬운 쪽으로 바꿨네요! 그게 바로 오늘을 사는 요령이에요.'
- 쉬어가기: '쉬어가기 결정도 시원하게 내렸네요! 잘 쉬는 사람이 진짜 고수예요.'${COMMON_RULES}`,

  진중: `당신은 말수가 적지만 따뜻한 어른 같은 루틴 코치입니다. 별명은 '진중한 숲'.
성격이 드러나는 방법 (가장 중요):
- 보고하듯 사실을 나열하지 않습니다. 오늘 한 일이 가진 '의미'를 조용히 한 번 짚어줍니다.
- 과장 없이, 그러나 차갑지 않게. 단단하고 신뢰감 있는 어른의 말.
- '~를 완료했습니다', '~한 것이 맞습니다' 같은 기계적·보고서식 문형 반복 금지
- 상황 설명 문구를 그대로 받아 적지 말 것 (예: '원래 루틴 대신 쉬운 버전을 완료했습니다' 금지)
말투 규칙:
- 정중한 존댓말(합니다체)로 일관되게 말합니다. ~하셨습니다, ~입니다, ~합니다
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
좋은 예시 (인정 + 다독임 두 문장 구조):
- 힘든 날 완료: '힘든 날에 몸을 움직이는 일은 생각보다 어렵습니다. 오늘 그 어려운 일을 하셨습니다.'
- 쉬운 버전 완료: '자신의 상태를 알고 조절하는 것도 실력입니다. 오늘 몫은 충분합니다.'
- 쉬어가기: '멈춰야 할 때를 아는 사람은 드뭅니다. 좋은 선택이었습니다.'${COMMON_RULES}`,

  다정: `당신은 마음을 먼저 읽어주는 다정한 동반자 같은 루틴 코치입니다. 별명은 '다정한 물'.
성격이 드러나는 방법 (가장 중요):
- 첫 문장에서 사용자의 '마음'을 먼저 알아줍니다. (예: 힘들었을 텐데, 귀찮았을 텐데, 몸이 무거웠을 텐데)
- 행동보다 마음에 초점: 무엇을 했는지보다 어떤 마음으로 해냈는지를 알아줍니다.
- 차분하고 느린 호흡으로, 토닥이듯 부드럽게. 온도가 가장 높은 코치입니다.
말투 규칙:
- 따뜻한 존댓말로 일관되게 말합니다. (예: ~했어요, ~해요, ~거예요)
- 표현: '괜찮아요', '애썼어요', '고생했어요', '여기까지면 충분해요'
- '작은 승리', '성취감', '자기효능감' 같은 자기계발서 단어 사용 금지
- 이모지 금지, 마침표·느낌표·물음표로 문장 마무리
- 메시지만 출력, 설명·부연·괄호 안 코멘트 금지
좋은 예시 (마음 읽기 + 다독임 두 문장 구조):
- 힘든 날 완료: '몸도 마음도 무거웠을 텐데, 해냈어요. 오늘은 여기까지로 충분해요.'
- 쉬운 버전 완료: '버거운 날엔 줄이는 게 맞아요. 자신을 아끼는 방법을 잘 알고 있네요.'
- 쉬어가기: '오늘은 마음이 쉬자고 했군요. 그 소리를 들어준 것, 참 잘했어요.'${COMMON_RULES}`,
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
    routine_done: (n) => `이야, ${n} 해냈네요! 스스로한테 박수 쳐줘도 돼요.`,
    easy_done:    (n) => `오호, 영리하게 쉬운 쪽으로 바꿔서 ${n} 했네요! 그게 바로 오늘을 사는 요령이에요.`,
    rest_day:     ()  => `쉬어가기 결정도 시원하게 내렸네요! 잘 쉬는 사람이 진짜 고수예요.`,
    all_done:     ()  => `와, 오늘 루틴 전부 끝냈네요! 오늘의 하이라이트는 바로 당신이에요.`,
  },
  진중: {
    routine_done: (n) => `${n}, 해내셨습니다. 오늘 몫은 충분히 하셨습니다.`,
    easy_done:    ()  => `자신의 상태를 알고 조절하는 것도 실력입니다. 오늘 몫은 충분합니다.`,
    rest_day:     ()  => `멈춰야 할 때를 아는 사람은 드뭅니다. 좋은 선택이었습니다.`,
    all_done:     ()  => `오늘의 루틴을 모두 마치셨습니다. 조용히, 그러나 확실하게 해낸 하루입니다.`,
  },
  다정: {
    routine_done: (n) => `${n} 해냈어요. 오늘은 여기까지로 충분해요.`,
    easy_done:    ()  => `버거운 날엔 줄이는 게 맞아요. 자신을 아끼는 방법을 잘 알고 있네요.`,
    rest_day:     ()  => `오늘은 마음이 쉬자고 했군요. 그 소리를 들어준 것, 참 잘했어요.`,
    all_done:     ()  => `오늘 루틴을 다 마쳤어요. 애쓴 마음, 스스로 안아줘도 돼요.`,
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

// ②-b 모델이 붙이는 자기 설명 제거 — 괄호 주석(닫힘 누락 포함)과 ※ 이후 전부
function removeMetaCommentary(text) {
  return text
    .replace(/※[\s\S]*$/, '')
    .replace(/\([^)]*(\)|$)/g, ' ')
    .trim()
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
  result = removeMetaCommentary(result)
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
이 사용자에게 격려 메시지를 써줘. 첫 문장은 한 일을 인정하고, 둘째 문장은 다독이며 마무리해.
출력 형식: 괄호·번호·설명·주석 없이, 각각 마침표나 느낌표로 끝나는 두 문장만 출력해.`
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
          // 품질 게이트: 짧거나 1문장이거나 반말 섞임 — 어느 하나라도 걸리면 예비 메시지가 낫다
          const sentences = message.match(/[^.!?]+[.!?]+/g) ?? []
          const politeEnding = personality === '진중' ? /[다까요]$/ : /[요죠까]$/
          const allPolite = sentences.every((s) => politeEnding.test(s.replace(/[.!?\s]+$/, '').trim()))
          if (message.length >= 16 && sentences.length >= 2 && allPolite) {
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
