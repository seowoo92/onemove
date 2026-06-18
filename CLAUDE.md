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
- 인증/서버: Supabase Auth (카카오 OAuth 연동 완료, 앱 ID 1489350)
- 배포: GitHub Pages (push to main 시 자동 배포)
- 데이터 저장: localStorage (서버 DB 없음, MVP 기간)
- 차트: recharts ^3.8.1 (기록 탭 막대 그래프)

## 환경변수
- VITE_SOLAR_API_KEY: 업스테이지 Solar API 키 (GitHub Secret + .env.local)
- VITE_SUPABASE_URL: Supabase 프로젝트 URL
- VITE_SUPABASE_ANON_KEY: Supabase anon public 키
- .env.local은 .gitignore에 포함 — 절대 커밋 금지

## 디자인 시스템
- 배경: #FAF6F0 (오프화이트) / 외부 페이지 배경: #FFFFFF
- 메인 컬러: #24523F (딥그린)
- 포인트 컬러: #EE8466 (코랄)
- 텍스트: #22302A
- 카드 배경: #FFFFFF
- 콘텐츠 최대 폭: 480px, 중앙 정렬

## 아이콘·이미지 규칙
- 시스템 기본 이모지 글리프 사용 금지 (예: ☀️ 😀 🍎 등 OS 내장 이모지)
  - 이유: OS마다 렌더링이 다르고 앱의 차분한 톤과 맞지 않음
  - 코드·UI·코치 메시지 어디에도 시스템 이모지를 넣지 않음
- 허용되는 시각 요소:
  - 직접 제작한 일러스트 이미지 (마음 날씨 그림: 맑음/구름/비, 코치 아바타 등)
  - 라인 스타일 UI 아이콘 (탭바 홈/기록/설정, 완료 체크, 별 등 기능성 아이콘)
- 일러스트·아이콘은 라이선스가 명확한 것만 사용 (직접 제작 또는 상용 가능 라이선스)

## 반응형 레이아웃 (AppLayout.jsx)
뷰포트 너비에 따라 3개 모드로 분기 (`useViewportMode` 훅):

| 모드 | 조건 | 동작 |
|------|------|------|
| 모바일 | <480px | 전체 폭, 그림자 없음 |
| 태블릿 | 480–1023px | 중앙 정렬, maxWidth 480px, 박스 그림자 `0 8px 30px rgba(0,0,0,0.08)` |
| 데스크톱 | ≥1024px | 좌우 2단: 좌측 서비스 소개 패널 + 우측 폰 베젤 |

- 데스크톱 폰 베젤: 390px×844px, border-radius 52px, #1C3F2F 테두리, 그림자 `0 20px 50px rgba(0,0,0,0.12)`
- `transform:translateZ(0)` 으로 베젤 안 `position:fixed` 자식(TabBar)이 베젤 기준 고정

## 화면 흐름 (5단계)
S0 진입 → S1 코치 선택 → S2 상태 체크 → S3 루틴 홈 → S4 코치 메시지(모달)

### S0 — 진입 화면 (WelcomeScreen.jsx)
- 최초 사용자(onemove_coach 없음)에게만 표시, 기존 사용자는 건너뜀
- 카카오 OAuth 복귀 시(세션 있음) coach 없어도 welcome 건너뛰고 S1으로 직행
- "카카오로 시작하기" (#FEE500 노란 버튼) / "로그인 없이 시작하기" 두 가지 선택 제공
- 안내: 루틴 카드·알림을 카카오톡으로 받을 수 있음, 나중에 설정에서도 로그인 가능

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
- 하단 탭바 표시 (홈 / 기록 / 설정)

### S4 — 코치 메시지 모달 (하단 시트)
- 하단에서 올라오는 시트 구조: 드래그 핸들 + 코치 아바타(색 원) + 코치 이름 + 메시지 + 출처 배지 + 계속하기 버튼
- 코치 매핑: 유쾌→유쾌한 코치(#F3D978), 진중→진중한 코치(#24523F), 다정→다정한 코치(#EE8466)
- 배경 오버레이 클릭 시 닫기 가능 (로딩 중 제외)
- Solar API 호출로 성격×상황에 맞는 2문장 메시지 생성
- 로딩 중: "코치가 메시지를 작성하고 있어요..."
- 우측 하단 배지: "출처 · AI" 또는 "출처 · 예비"
- [계속하기] 버튼으로 모달 닫기

## 탭바 구조 (TabBar.jsx, App.jsx)
- 탭: 홈 / 기록 / 설정 (텍스트만, 아이콘 없음)
- `activeTab` state: 'home' | 'record' | 'settings' (App.jsx에서 관리)
- `showTabBar`: `!!coach` — 코치를 한 번이라도 고른 뒤 항상 표시 (온보딩 welcome·coach-select 화면 제외)
- `handleTabChange(tab)`: 홈 탭 클릭 시 `homeKey` 증가 → Home 컴포넌트 리마운트 (이미 홈에 있어도 반응)
- 활성 탭: #24523F 굵게 / 비활성: #9AA39C 보통체

### 기록 탭 (RecordScreen.jsx)
- 최근 14일 막대 그래프 (recharts): 높이=완료율, 색=마음 날씨 color, 미접속 날은 빈칸(null)
- 범례: 맑음(#F3D978) / 구름(#9FD2B0) / 비(#A9CFE0)
- 타임라인: 좌측 컬러 점+세로선, 날짜·마음 날씨·완료수, 완료 루틴명 칩 나열

### 설정 탭 (SettingsScreen.jsx)
- AI 코치 성격 변경: 유쾌 / 진중 / 다정
- 코치 변경 시 루틴·완료 기록·상태 일체 초기화 없음 (`onemove_coach`만 업데이트)
- 마음 날씨 다시 고르기: 완료 기록 있으면 confirm 경고, 5개 localStorage 키 초기화
- 닉네임 설정: 직접 입력 (onemove_nickname, 최대 12자), 저장 시 "저장되었어요" 2초 표시
- 카카오톡 알림 토글: CSS-only 토글 스위치, onemove_notify 저장, 실제 발송은 채널 연동 후 (안내 문구 표시)
- 위기 상담 연락처: 국립정신건강센터 1577-0199, 보건복지부 자살예방상담전화 109 (tel: 링크)
- 계정 항목:
  - 미로그인: "카카오로 시작하기" 노란 버튼 + 안내 문구
  - 로그인: "OO님으로 로그인됨" (닉네임 기반) + 로그아웃 버튼

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
- 함수: generateCoachMessage({ personality, state, routineName, situation, nickname })
- personality: '유쾌' | '진중' | '다정'
- situation: 'routine_done' | 'easy_done' | 'rest_day' | 'all_done'
- 반환: { message: string, source: 'solar' | 'fallback' }
- API 실패 시 → 성격×상황 12종 예비 메시지로 자동 대체
- 후처리(cleanMessage 6단계):
  ① 이모지 제거 → ② `<think>` 태그 제거 → ③ 반복 구절 제거(`.{8,}\1+`) → ④ 화살표·따옴표 제거 → ⑤ 중복 문장 제거(앞 10자 유사 감지) → ⑥ 2문장 초과 커팅 → 마침표 보완
- Solar 경로와 fallback 경로 모두 cleanMessage 적용
- 말투 원칙:
  유쾌: 친근한 존댓말, 감탄사 허용 ("오, 해냈네요!")
  진중: 합니다체, 담백하고 사실 기반
  다정: ~해요체, 공감 먼저, 토닥이는 톤
- 금지어: "작은 걸음", "큰 변화", "성장", 자기계발서 표현
- 금지 행동: 더 하길 권유, 미래 약속, 제안형 문장, 문장 반복
- 닉네임: 자연스러울 때만 사용, 매 문장 강제 삽입 금지. 루틴 이름 동사 억지 변형 금지 (어색하면 루틴명 언급 없이 일반 격려로 표현)
- fallback 메시지: 닉네임 있으면 앞에 "${nickname}님, " 접두 후 cleanMessage 통과

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
| `onemove_nickname` | 앱 내 닉네임 (최대 12자) | 유지 |
| `onemove_notify` | 카카오톡 알림 수신 동의 ('true'\|'false') | 유지 |
| `onemove_history` | 날짜별 완료 기록 `{"YYYY-MM-DD": {state, completed:[], total}}` | 영구 (날짜 리셋 없음) |

## 개발 명령어
- npm run dev : 로컬 개발 서버 실행 (http://localhost:5173/onemove/)
- npm run build : 프로덕션 빌드
- npm run preview : 빌드 결과 미리보기
- git push origin main : GitHub Actions 자동 배포 트리거

## 마음 날씨 (용어 및 매핑)
- "상태"를 앱 내에서 "마음 날씨"로 통일 (StateCheck, Home, Settings 모두)
- 매핑 레이어: src/lib/weather.js
  - 좋아요 → 맑음, 설명: "맑게 갠 하루예요", 색: #F3D978
  - 보통이에요 → 구름, 설명: "구름 조금, 그런대로", 색: #9FD2B0
  - 힘들어요 → 비, 설명: "비 오는 날도 지나가요", 색: #A9CFE0
- 헬퍼: getWeather(state) → 날씨 문자열, getWeatherInfo(state) → 전체 객체, 잘못된 값 null 반환

## 카카오 로그인 (6/18 완료)
- 카카오 개발자 앱 ID: 1489350, 비즈앱 전환 완료
- Supabase Auth ↔ 카카오 OAuth 연결: Redirect URI, REST API 키·시크릿, Site URL/Redirect URLs 등록
- src/lib/supabase.js: createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY), env 미설정 시 null 반환
- App.jsx에서 getSession + onAuthStateChange 구독, redirectTo는 origin + BASE_URL (로컬/배포 자동 대응)
- 로그인은 선택사항 — 미로그인도 모든 핵심 기능 정상 작동
- KOE205 트러블슈팅: Supabase가 account_email 스코프 강제 요청 → 개인 앱에서 해결 불가 → 비즈앱 전환으로 해결 (Supabase 이슈 #36878)

## 닉네임 (6/18 완료)
- 설정 탭에서 직접 입력 (localStorage: onemove_nickname, 최대 12자)
- 카카오 닉네임은 기본값으로만 자동 채움, 직접 설정한 값이 있으면 덮어쓰지 않음
- generateCoachMessage에 nickname 파라미터 전달 (Home.jsx → solar.js)
- 시스템 프롬프트: 자연스러울 때만 이름 사용, 루틴 이름 동사 억지 변형 금지

## 다음 작업 (6/19~)
- P1 잔여: 루틴 카드 카카오톡 보내기 (talk_message 권한 활용, 8월 버전 목표)
- og-image.png 실제 이미지 제작 후 public/ 추가 (OG 태그는 이미 index.html에 설정됨)
- 파비콘 적용 (제작한 심볼 이미지 활용)
- 코치 아바타: 현재 단색 원 → 시안 일러스트 아바타로 교체 (디자인 확정 후)
- 전체 디자인 시안 반영: 현재 구조·기능 위주 임시 디자인, 클로드 시안 확정 후 입힐 예정
- 기록 탭 완료수 버그: completed 중복 누적 → "16/4" 표시 현상, storage 로직 점검 필요
- 보안: 6/22 발표 후 Solar API 키 폐기, 추후 Supabase Edge Function 전환 검토

## 주의사항
- .env.local 절대 커밋 금지
- 시스템 기본 이모지 글리프를 코드·메시지에 절대 넣지 말 것 (직접 제작 일러스트·UI 아이콘은 허용)
- 루틴 문구, 영역명 임의 변경 금지 (routines.js는 확정본)
- 새 기능 추가 전 반드시 CLAUDE.md 확인
- Solar API 키: VITE_ 접두사로 빌드에 번들됨 → 브라우저에서 노출 상태. 발표(6/22) 후 업스테이지 콘솔에서 폐기 필요
- 코치 변경 시 루틴/완료/상태 절대 초기화하지 않음 (`onemove_coach`만 교체)
- src/index.css 전역 리셋(`* { margin:0; padding:0 }`)은 반드시 `@layer base { }` 안에 있어야 함 — 밖에 두면 Tailwind 간격 유틸리티(mb-*, pt-* 등) 전체를 덮어씀
