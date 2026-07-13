# 오늘만큼 (onemove) — CLAUDE.md

## 서비스 개요
- 서비스명: 오늘만큼 (영문: onemove)
- 한 줄 설명: 무기력한 날에도 "오늘 할 수 있는 만큼"만 제안하는 CBT 기반 회복탄력성 AI 루틴 코치 웹서비스
- 타겟: 취업·학업·대인관계 스트레스로 무기력감을 겪는 18~34세 청년
- 핵심 철학: 실패해도 죄책감 없이 재도전할 수 있도록 설계. "어려워요" 선택 시 쉬운 버전 제안, 포기해도 격려 메시지 출력.
- 배포 URL: https://seowoo92.github.io/onemove/
- GitHub: https://github.com/seowoo92/onemove
- MVP 발표: 2026년 6월 19일 (오프라인) — 당초 6/22에서 앞당겨짐
- AI 경진대회: AI Reboot 경진대회 출품 예정

## 기술 스택
- 프레임워크: Vite + React 19 + Tailwind CSS v4
- 폰트: Pretendard Variable (CDN, 폴백 -apple-system, sans-serif)
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
> 색·타이포·간격·컴포넌트·화면별 사양의 상세 기준은 docs/design-handoff.md (1차 시안 핸드오프). 디자인 작업 시 그 문서를 우선 따른다.
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

- 데스크톱 폰 베젤: 390px×812px **고정** (창 높이를 늘려도 콘텐츠가 베젤을 넘지 않음), border-radius 46px, 10px solid #1C3F2F 테두리, 그림자 `0 20px 50px rgba(0,0,0,0.12)`
- `transform:translateZ(0)` 으로 베젤 안 `position:fixed` 자식(TabBar·CoachModal)이 베젤 기준 고정
- **(핵심 규칙) 베젤 안에서는 `height:100vh` 절대 금지 → `height:100%`만 사용.** 100vh는 베젤 밖 뷰포트를 참조해 콘텐츠가 베젤을 넘침
- 모바일/태블릿 화면 컨테이너에도 `height:100%`(부모 100vh 기준) + `box-sizing:border-box`를 지정. 빠지면 한 화면을 채우는 화면(코치 선택·웰컴 등)이 위로 쏠리고 아래 여백이 생김 (AppLayout.jsx)
- 모바일/태블릿 컨테이너 + 베젤 안쪽 스크롤 컨테이너 **배경을 크림(#FAF6F0)으로 지정** — paddingTop 영역에 흰 바깥 배경이 비치는 "상단 흰 띠"를 방지

## 화면 흐름 (5단계)
S0 진입 → S1 코치 선택 → S2 마음 날씨 → S3 루틴 홈 → S4 코치 메시지(모달)

### S0 — 진입 화면 (WelcomeScreen.jsx)
- 최초 사용자(onemove_coach 없음)에게만 표시, 기존 사용자는 건너뜀
- 카카오 OAuth 복귀 시(세션 있음) coach 없어도 welcome 건너뛰고 S1으로 직행
- "카카오로 시작하기" (#FEE500 노란 버튼) / "로그인 없이 시작하기" 두 가지 선택 제공
- 안내: 루틴 카드·알림을 카카오톡으로 받을 수 있음, 나중에 설정에서도 로그인 가능

### S1 — 코치 선택 (CoachSelect.jsx)
- 표시 조건: localStorage에 onemove_coach 없을 때 (설정의 'AI 코치 다시 고르기'로도 재진입)
- 큰 코치 아바타(150px) + 코치명 + 한마디(tagline) + 하단 3종 썸네일(유쾌/진중/다정)로 탭하며 미리보기 전환
- 코치 3종 이름: 유쾌→유쾌한 햇살 / 진중→진중한 숲 / 다정→다정한 물 (이름·색·이미지·tagline은 src/lib/coaches.js에서 관리)
- 아바타 이미지: public/images/coach-cheerful|calm|warm.png (로드 실패 시 클레이 셰이딩 색 원으로 폴백)
- 선택 후 localStorage 저장 → 온보딩이면 S2로, 설정에서 왔으면 설정 탭으로 복귀 (루틴·완료·상태 초기화 없음)

### S2 — 마음 날씨 (StateCheck.jsx)
- 제목 "오늘 마음 날씨는 어떤가요?" + 날짜, 좌상단 뒤로 버튼(42px 흰 카드)
- 날씨 카드 3종(좋아요/맑음, 보통이에요/구름, 힘들어요/비): **연한 색 동그라미 위에 실제 클레이 PNG 아이콘**(public/images/weather-sunny|cloudy|rainy.png) + 제목 + 부제. 아이콘·tint는 weather.js에서 관리
- 하단 도움말 말풍선 2개("?" 아바타 + 노랑/초록 버블)
- 선택 즉시 S3으로 이동 (날짜+상태 저장), 뒤로 → S1 (코치 유지)

### S3 — 오늘의 루틴 홈 (Home.jsx)
- 헤더: "OO님, 오늘도 와줘서 고마워요" + 날짜·마음 날씨 부제
- 진행 카드(딥그린): "오늘 N / M개 완료" + "한 걸음씩"(옐로) + 진행 바(그라데이션 #D9F2EE→#F3D978)
- 완료된 루틴: 연녹(#EFF4EE) 행 + 딥그린 체크 원 + 취소선 + "완료"(#6FB988)
- 활성 루틴 카드(흰): 루틴명 + 난이도칩(중립) + 영역칩(카테고리 색) + 버튼 [완료(노랑 #F7EBBE)] [지금은 어려워요(회색)]
- 쉬운버전 카드: "더 쉬운 버전으로 바꿨어요" 별 배지 + 원래명 취소선 + 새 루틴명 + [완료] [오늘은 쉬어가기(코랄)]
- 영역칩 색: 몸 깨우기·자기돌봄·에너지 → 초록(#D5EFD8), 공간·바깥 → 파랑(#E4F0F6), 연결·성취 → 코랄(#FBE3DA)
- 완료/어려워요/쉬어가기 시 → S4 코치 모달
- **완료 축하 카드**: 모든 루틴이 완료/쉬어가기로 정리되면(allResolved) 하단에 표시. 풍경 이미지 배너(complete-banner.png 전체 표시) + "오늘 하루도 잘 해냈어요" + "{코치명}이 오늘의 너를 안아줘요"(코치 클레이 점)
- 하단 "마음 날씨 다시 고르기" 작은 버튼

### S4 — 코치 메시지 모달 (CoachModal.jsx, 바텀시트)
- **스케치 디자인**: 메시지 **말풍선**(꼬리 포함) + **선택한 코치 상반신 캐릭터**(public/images의 coach PNG, 시트 하단 경계 아래로 블리드해 잘리며 올라옴, overflow:hidden으로 클립) + 코치 이름 + "코치가 한마디 건네요" + [계속하기]
- 캐릭터는 좌측, 이름·버튼은 우측. 캐릭터 PNG 좌우 투명 여백(약 20~24%)이 있어 우측 텍스트 영역이 그 위로 겹쳐도 됨
- 배경 딤 rgba(20,46,34,.45), 오버레이 클릭 닫기(로딩 중 제외)
- Solar API로 성격×상황 2문장 생성, 로딩 중 "코치가 메시지를 작성하고 있어요" + 점 애니메이션
- 우측 하단 배지 "출처 · AI" / "출처 · 예비"

## 탭바 구조 (TabBar.jsx, App.jsx)
- 탭: 홈 / 기록 / 설정 — **라인 아이콘(SVG) + 라벨** (홈=집, 기록=문서, 설정=슬라이더)
- `activeTab` state: 'home' | 'record' | 'settings' (App.jsx에서 관리)
- `showTabBar`: `!!coach` — 코치를 한 번이라도 고른 뒤 항상 표시 (온보딩 welcome·coach-select 화면 제외)
- `handleTabChange(tab)`: 홈 탭 클릭 시 `homeKey` 증가 → Home 컴포넌트 리마운트 (이미 홈에 있어도 반응)
- 활성: #24523F / 비활성: #9AA39C

### 스크롤 안내 (AppLayout 내부 ScrollHint)
- 아래로 더 스크롤할 내용이 있을 때 하단 중앙에 **딥그린 ⌄ 버블** 표시, 끝까지 내리면 자동 숨김
- 모바일(window 스크롤)·데스크톱 베젤(내부 스크롤 컨테이너) 양쪽 대응, 콘텐츠 늦은 렌더 대비 주기 재측정

### 기록 탭 (RecordScreen.jsx)
- 최근 14일 막대 그래프 (recharts): 높이=완료율, 색=마음 날씨 color, 미접속 날은 빈칸(null)
- 범례: 색 점 → **날씨 아이콘**(맑음/구름/비 PNG) + 라벨
- 타임라인: 좌측 세로선 + **날씨 아이콘**(날짜별), 날짜·마음 날씨·완료수, 완료 루틴명 칩

### 설정 탭 (SettingsScreen.jsx) — 시안 재구성
- **상단 프로필 헤더 카드**: 닉네임("OO님" 없으면 "이름을 정해주세요") + "변경" 버튼(prompt로 닉네임 편집) + "{코치명} 코치와 함께" + 카카오 버튼(미로그인 "카카오 로그인" / 로그인 "카카오 연결됨", 탭 시 로그아웃 confirm)
- 섹션 라벨(12.5px #9AA69D): 알림 / AI 코치 / 마음 날씨 / 마음이 많이 힘들 때
- **알림**: 카카오톡 알림 토글(on=#24523F) + "알림 발송은 카카오 채널 연동 후 제공돼요" 안내
- **AI 코치 다시 고르기** / **마음 날씨 다시 고르기**: 동일 디자인 흰 박스(제목+부제+› 화살표). 코치 → CoachSelect 이동(coachSelectFrom='settings'), 마음 날씨 → confirm 후 state 초기화 + 당일 기록 제거
- **마음이 많이 힘들 때**: 연한 회색 2칸 카드(국립정신건강센터 1577-0199 / 보건복지부 109), 전화 아이콘 + tel: 링크
- **계정 섹션은 없음** — 로그인/로그아웃은 프로필 카카오 버튼에 통합
- 전체 컴팩트 — 모바일·베젤 모두 스크롤 없이 한 화면

### 데스크톱 좌측 소개 패널 (AppLayout 데스크톱 모드)
- 클레이 3점 브랜드 마크 + 헤드라인("오늘 할 수 있는 / 만큼만.") + 핵심 3가지 + 구분선 + **QR 코드**(public/images/qr-onemove.svg, 라이브 주소, 휴대폰 스캔 유도) + 슬로건("오늘만큼, 딱 그만큼 / One move a day")

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

## localStorage 구조 (storage.js)
- 날짜 기반 키는 `{ date: 'YYYY-MM-DD', value: ... }` 형태. 접속 시 날짜가 달라지면 자동 null 반환(하루 리셋)
- **날짜는 로컬(기기 시간대, KST) 기준**: `today()`는 `toISOString()`(UTC) 금지, 로컬 YYYY-MM-DD 사용. 화면 표시(Home/Record formatDate)와 일치시켜 하루 경계·기록 키 어긋남 방지. history 저장도 `storage.getTodayKey()` 사용
- 날짜별 기록(onemove_history)은 `setHistoryEntry(dateKey, state, completedNames, total)`로 **현재 완료 집합을 덮어쓴다**(누적 X → 완료수 ≤ 총개수 보장). 마음 날씨 재선택 시 `removeHistoryEntry`로 당일 기록 초기화 ("16/4" 누적 버그 해결)

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
- **getSession은 3초 제한(Promise.race)** — 백엔드가 응답 없으면(예: Supabase 무료플랜 자동 일시정지) 게스트로 진행해 흰 화면 방지 (7/6 장애의 재발 방지책)
- **전역 ErrorBoundary** (src/components/ErrorBoundary.jsx, main.jsx에서 App 래핑) — 렌더링 오류 시 흰 화면 대신 안내 화면 + 새로고침 버튼
- 로그인은 선택사항 — 미로그인도 모든 핵심 기능 정상 작동
- KOE205 트러블슈팅: Supabase가 account_email 스코프 강제 요청 → 개인 앱에서 해결 불가 → 비즈앱 전환으로 해결 (Supabase 이슈 #36878)

## 닉네임
- 설정 프로필 헤더의 "변경" 버튼 → prompt 입력 (onemove_nickname, 최대 12자)
- 카카오 닉네임은 기본값으로만 자동 채움, 직접 설정한 값이 있으면 덮어쓰지 않음
- generateCoachMessage에 nickname 전달 (Home.jsx → solar.js)
- 시스템 프롬프트: 자연스러울 때만 이름 사용, 루틴 이름 동사 억지 변형 금지

## 에셋 (public/images/)
- 코치 캐릭터 3종: coach-cheerful|calm|warm.png (상반신 클레이 일러스트, 좌우 투명 여백 ~20%)
- 마음 날씨 아이콘 3종: weather-sunny|cloudy|rainy.png (배경 제거·256px, 각 27~36KB)
- 완료 축하 배너: complete-banner.png (풍경 클레이 일러스트, 820px·389KB)
- QR 코드: qr-onemove.svg (라이브 주소, 데스크톱 소개 패널)
- 앱 아이콘·파비콘 제공됨
- 시안 원본 .dc.html: docs/design/ (참고용, 배포 비포함)

## 현재 상태 (2026-07-13)
- 6/19 MVP 발표 완료 (디자인 시안 적용·버그 수정·5차 배포, 상세: docs/devlog/2026-06-19.md)
- 7/6 Supabase 무료플랜 자동 일시정지로 인한 흰 화면 장애 진단·복구 (대시보드 Resume)
- 7/10 강사님 멘토링 1차 (기능 피드백 5건) + 대회 공식 평가기준 5항목 확보
- 7/11 OG 공유 이미지(1200×630) 제작·배포 — 링크 미리보기 404 해결
- 7/13 2차 스프린트 시작: 코드 하드닝(getSession 3초 제한 + ErrorBoundary), git 계정 연결, .gitignore 정비 (상세: docs/devlog/2026-07-13-재정비기간-정리.md)

## 남은 일 (2차 스프린트 · ~7/28 예선 마감)
- **localStorage → Supabase 전환** (로그인 사용자 데이터 동기화) — 게스트는 localStorage 유지(하이브리드)
- **카카오 '나에게 보내기'(talk_message) 알림**: ① 루틴 확정 시 오늘의 루틴 카드 발송 ② 오후 미완료 루틴 리마인더 (Edge Function + 스케줄, 토큰 저장·갱신 필요)
- 디자인 리뉴얼 + 탭 4개 개편(오늘·기록·코치·설정) + 기록 탭 대시보드 승격(캘린더형 마음 날씨)
- PWA manifest (홈 화면 설치) — Web Push는 카카오 알림으로 대체(컷)
- Solar API 키 Supabase Edge Function 이전 (키 은닉)
- 여유 시: 완료 무지개 효과, 랜덤 힐링 문구, 루틴 확장(28→42)
- 발표 준비(7/23~): 발표자료(개인 서사·AI 이해·윤리/저작권)·데모 동선·리허설

## 기술 부채 / 알려진 이슈 (이어서 개발 시 참고)
- **Solar API 키 노출**: VITE_ 접두사로 번들에 포함 → 브라우저 노출. 발표 후 업스테이지 콘솔에서 폐기, 8월 Supabase Edge Function으로 이전
- **기존 브라우저 데이터**: 6/19 날짜 수정 배포 전 생성된 localStorage엔 옛 UTC 날짜키·누적 기록이 남을 수 있음. 새 활동 시 당일분은 자가 치유, 필요하면 사이트 데이터 초기화로 깨끗하게
- **이미지 처리 도구(임시)**: 배경 제거·리사이즈·QR 생성에 `jimp`·`qrcode`를 `npm i <pkg> --no-save`로 임시 설치해 사용(package.json·번들 미반영). 재작업 시 동일하게 임시 설치 후 사용. 처리 패턴: 캐릭터/날씨 배경 제거 = 테두리 flood-fill, 배너 = resize(폭 지정)
- **경량화 여지**: complete-banner.png 389KB(PNG) → JPG 전환 시 더 작아짐
- **UX 개선 여지**: 설정 닉네임 "변경"이 window.prompt 기반 → 인라인 입력으로 개선 가능
- **미리보기**: 로컬은 `npm run dev`(base `/onemove/`). 새 세션에서 화면 확인 시 dev 서버 띄워 검증할 것 (사용자는 비개발자라 결과 화면으로 판단)

## 주의사항
- .env.local 절대 커밋 금지
- 시스템 기본 이모지 글리프를 코드·메시지에 절대 넣지 말 것 (직접 제작 일러스트·UI 아이콘은 허용)
- 루틴 문구, 영역명 임의 변경 금지 (routines.js는 확정본)
- 새 기능 추가 전 반드시 CLAUDE.md 확인
- Solar API 키: VITE_ 접두사로 빌드에 번들됨 → 브라우저에서 노출 상태. 발표(6/19) 후 업스테이지 콘솔에서 폐기 필요
- 코치 변경 시 루틴/완료/상태 절대 초기화하지 않음 (`onemove_coach`만 교체)
- 베젤 안 `height:100vh` 금지 → `height:100%`만 (베젤 밖 뷰포트 참조로 콘텐츠가 베젤 넘침)
- src/index.css 전역 리셋(`* { margin:0; padding:0 }`)은 반드시 `@layer base { }` 안에 있어야 함 — 밖에 두면 Tailwind 간격 유틸리티(mb-*, pt-* 등) 전체를 덮어씀
