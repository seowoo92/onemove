import { ROUTINES } from '../data/routines'

// 발표 시연용 데모 기록 (?record=demo) — 실제 저장 데이터는 건드리지 않는다.
// 고정 패턴이라 리허설 때마다 같은 화면이 나온다: 최근 3주, 마음 날씨 혼합,
// 완료율 다양, 미접속 날(빈칸) 포함, 오늘부터 5일 연속 기록(연속 배지 노출).
// [며칠 전, 마음 날씨, 완료 수, 총 개수]
const PATTERN = [
  [0, '보통이에요', 2, 3],
  [1, '좋아요', 4, 4],
  [2, '힘들어요', 1, 2],
  [3, '보통이에요', 3, 3],
  [4, '좋아요', 3, 4],
  [6, '힘들어요', 2, 2],
  [7, '보통이에요', 1, 3],
  [9, '좋아요', 4, 4],
  [10, '보통이에요', 2, 3],
  [12, '힘들어요', 1, 2],
  [13, '보통이에요', 3, 3],
  [15, '좋아요', 2, 4],
  [17, '보통이에요', 2, 3],
  [19, '힘들어요', 2, 2],
]

export function buildDemoHistory(todayKey) {
  const names = ROUTINES.map((r) => r.name)
  const [y, m, d] = todayKey.split('-').map(Number)
  const history = {}
  PATTERN.forEach(([ago, state, done, total], i) => {
    const dt = new Date(y, m - 1, d - ago)
    const key = [
      dt.getFullYear(),
      String(dt.getMonth() + 1).padStart(2, '0'),
      String(dt.getDate()).padStart(2, '0'),
    ].join('-')
    const from = (i * 3) % (names.length - 4)
    history[key] = { state, completed: names.slice(from, from + done), total }
  })
  return history
}
