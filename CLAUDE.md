# 오늘만큼 (onemove) — CLAUDE.md

## 서비스 개요
- 서비스명: 오늘만큼 (영문: onemove)
- 한 줄 설명: 무기력한 날에도 "오늘 할 수 있는 만큼"만 제안하는 CBT 기반 회복탄력성 AI 루틴 코치 웹서비스
- 타겟: 취업·학업·대인관계 스트레스로 무기력감을 겪는 18~34세 청년
- 핵심 철학: 실패해도 죄책감 없이 재도전할 수 있도록 설계. "어려워요" 선택 시 쉬운 버전 제안, 포기해도 격려 메시지 출력.
- 배포 URL: https://seowoo92.github.io/onemove/
- GitHub: https://github.com/seowoo92/onemove
- MVP 발표: 2026년 6월 22일 (오프라인)
- AI 경진대회: AI Reboot 경진대회 출품 예정

## 기술 스택
- 프레임워크: Vite + React 19 + Tailwind CSS v4
- AI: 업스테이지 Solar API (model: solar-pro)
- 인증/서버: Supabase (P1 카카오 로그인용, 아직 미연동)
- 배포: GitHub Pages (push to main 시 자동 배포)
- 데이터 저장: localStorage (서버 DB 없음, MVP 기간)

## 환경변수
- VITE_SOLAR_API_KEY: 업스테이지 Solar API 키 (GitHub Secret + .env.local)
- VITE_SUPABASE_URL: Supabase 프로젝트 URL
- VITE_SUPABASE_ANON_KEY: Supabase anon public 키
- .env.local은 .gitignore에 포함 — 절대 커밋 금지

## 디자인 시스템
- 배경: #FAF6F0 (오프화이트)
- 메인 컬러: #24523F (딥그린)
- 포인트 컬러: #EE8466 (코랄)
- 텍스트: #22302A
- 카드 배경: #FFFFFF
- 이모지 사용 절대 금지 (코드, UI, 메시지 전부)
- 모바일 우선 반응형 (최대 폭 390px, 중앙 정렬)
- 아이콘 없이 텍스트만으로 UI 구성

## 화면 흐름 (4단계)
S1 코치 선택 → S2 상태 체크 → S3 루틴 홈 → S4 코치 메시지(모달)

### S1 — 코치 성격 선택
- 최초 1회만 표시 (localStorage에 onemove_coach 없을 때)
- 유쾌 / 진중 / 다정 3종 카드 선택
- 선택 후 localStorage 저장 → S2로 이동

### S2 — 오늘 상태 체크
- 좋아요 / 보통이에요 / 힘들어요 3버튼
- 선택 즉시 S3으로 이동 (오늘 날짜 + 상태 localStorage 저장)
- 좌상단 "뒤로" 버튼 → S1으로 이동 (코치 성격 선택값 유지)

### S3 — 오늘의 루틴 홈
- 상단: "오늘만큼" + 날짜 + "오늘 상태 다시 고르기" 버튼
- 진행 표시: "오늘 N / M개 완료" + 진행 바
- 루틴 카드: 루틴명 + 영역 태그 + 난이도
- 각 카드 버튼: [완료] [지금은 어려워요]
- "지금은 어려워요" → 해당 카드가 쉬운 버전으로 전환 → [완료] [오늘은 쉬어가기]
- 완료/어려워요 선택 시 → S4 코치 메시지 모달 표시

### S4 — 코치 메시지 모달
- Solar API 호출로 성격×상황에 맞는 2문장 메시지 생성
- 로딩 중: "코치가 메시지를 작성하고 있어요..."
- 우측 하단: "Solar AI" 또는 "예비 메시지" 출처 표시
- [계속하기] 버튼으로 모달 닫기

## 루틴 추천 로직 (routinePicker.js)
- 좋아요: 4개 (보통3 + 쉬움1)
- 보통이에요: 3개 (보통1 + 쉬움2)
- 힘들어요: 2개 (쉬움2)
- 쉬움 루틴 추출 시: 기본 난이도가 쉬움인 루틴 + 보통 루틴의 easyVersion 모두 후보
- 영역(area) 분산 원칙: 추천 루틴들의 area가 서로 겹치지 않도록 선발
- 어제 추천된 루틴 제외 (onemove_yesterday 기준)

## 루틴 데이터 구조 (routines.js)
- 총 28개 (7개 영역 × 4개)
- 영역: 몸 깨우기 / 자기돌봄 / 에너지 / 공간 / 바깥 / 연결 / 성취
- 각 루틴마다 쉬운 버전(easyVersion) 1:1로 짝지어짐
- 필드: id, name, area, difficulty('보통'|'쉬움'), easyVersion{id, name, area, difficulty}
- 난이도 분포: 보통 22개 / 쉬움 6개 (기본 루틴 기준)

## Solar AI 코치 (solar.js)
- 함수: generateCoachMessage({ personality, state, routineName, situation })
- personality: '유쾌' | '진중' | '다정'
- situation: 'routine_done' | 'easy_done' | 'rest_day' | 'all_done'
- 반환: { message: string, source: 'solar' | 'fallback' }
- API 실패 시 → 성격×상황 12종 예비 메시지로 자동 대체
- 후처리: 이모지 제거, <think> 태그 제거, 화살표·따옴표 제거, 중복 문장 제거, 2문장 제한
- 말투 원칙:
  유쾌: 친근한 존댓말, 감탄사 허용 ("오, 해냈네요!")
  진중: 합니다체, 담백하고 사실 기반
  다정: ~해요체, 공감 먼저, 토닥이는 톤
- 금지어: "작은 걸음", "큰 변화", "성장", 자기계발서 표현
- 금지 행동: 더 하길 권유, 미래 약속, 제안형 문장, 문장 반복

## localStorage 구조
모든 날짜 기반 키는 `{ date: 'YYYY-MM-DD', value: ... }` 형태로 저장되며,
접속 시 날짜가 달라지면 자동으로 null 반환 (하루 리셋).

| 키 | 설명 | 날짜 리셋 |
|----|------|----------|
| `onemove_coach` | 코치 성격 ('유쾌'\|'진중'\|'다정') | 유지 |
| `onemove_state` | 오늘 상태 ('좋아요'\|'보통이에요'\|'힘들어요') | 매일 |
| `onemove_routines` | 오늘 추천된 루틴 ID 배열 | 매일 |
| `onemove_completed` | 완료된 루틴 ID 배열 | 매일 |
| `onemove_easy` | 쉬운버전으로 전환된 루틴 ID 배열 | 매일 |
| `onemove_skipped` | 오늘은 쉬어가기 선택 루틴 ID 배열 | 매일 |
| `onemove_yesterday` | 어제 추천된 루틴 ID 배열 (중복 방지용) | 유지 |

## 개발 명령어
- npm run dev : 로컬 개발 서버 실행 (http://localhost:5173/onemove/)
- npm run build : 프로덕션 빌드
- npm run preview : 빌드 결과 미리보기
- git push origin main : GitHub Actions 자동 배포 트리거

## 다음 작업 (P1, 6/18 예정)
- 카카오 로그인 (Supabase Auth)
- "오늘의 루틴 카드" 카카오톡 나에게 보내기
- OG 태그 설정 (링크 공유 미리보기)
- 파비콘 제작

## 주의사항
- .env.local 절대 커밋 금지
- 이모지 코드에 절대 넣지 말 것
- 루틴 문구, 영역명 임의 변경 금지 (routines.js는 확정본)
- 새 기능 추가 전 반드시 CLAUDE.md 확인
