# 오늘만큼 (onemove)

> 무기력한 날에도 "오늘 할 수 있는 만큼"만 제안하는 CBT 기반 회복탄력성 AI 루틴 코치

배포 사이트: https://seowoo92.github.io/onemove/

## 서비스 소개

- 취업·학업·대인관계 스트레스로 무기력감을 겪는 18~34세 청년을 위한 웹 서비스
- 오늘의 컨디션(좋아요 / 보통이에요 / 힘들어요)에 맞춰 할 수 있는 만큼의 회복 루틴을 추천
- 실패해도 죄책감 없이 재도전: "지금은 어려워요" 선택 시 더 쉬운 버전 제안, 포기해도 격려
- 유쾌·진중·다정 3종의 AI 코치가 상황에 맞는 격려 메시지 생성

## 핵심 기능

- 코치 성격 선택 (유쾌한 햇살 / 진중한 숲 / 다정한 물)
- 마음 날씨(좋아요·보통이에요·힘들어요) 선택 → 상태 기반 루틴 추천 (4개 / 3개 / 2개)
- 7개 생활 영역 × 4개 = 28개 루틴 풀, 각 루틴마다 쉬운 버전 1:1 매칭
- AI 코치 격려 메시지 (Solar API, 호출 실패 시 예비 메시지 자동 전환) — 말풍선 + 코치 캐릭터 팝업
- 모든 루틴 정리 시 완료 축하 카드(풍경 일러스트)
- 기록 탭: 최근 14일 완료율 그래프 + 날짜별 타임라인
- 설정 탭: 코치 변경(진행 중인 루틴 유지) · 카카오 로그인 · 마음 날씨 재선택
- 카카오 로그인 (Supabase OAuth) — 미로그인도 모든 기능 정상 작동
- 데스크톱/모바일 반응형 (PC는 폰 베젤 + 좌측 소개 패널·QR, 모바일은 전체 화면)

## 기술 스택

- Frontend: Vite + React 19 + Tailwind CSS v4
- AI: 업스테이지 Solar API (solar-pro)
- 데이터: localStorage (MVP)
- 배포: GitHub Pages (GitHub Actions 자동 배포)

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 값을 채워주세요

# 3. 로컬 개발 서버 실행
npm run dev
```

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `VITE_SOLAR_API_KEY` | 업스테이지 Solar API 키 |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL (카카오 로그인) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public 키 |

## 프로젝트 구조

```
src/
├── App.jsx                  # 화면 흐름 및 상태 관리 (screen / activeTab / homeKey)
├── components/
│   ├── AppLayout.jsx        # 반응형 레이아웃 (3모드, 폰 베젤, 좌측 소개패널·QR, 스크롤 안내)
│   ├── CoachModal.jsx       # AI 코치 메시지 모달 (S4, 말풍선 + 코치 캐릭터)
│   └── TabBar.jsx           # 하단 탭바 (홈 / 기록 / 설정, 라인 아이콘)
├── screens/
│   ├── WelcomeScreen.jsx    # S0 진입 (오르막 모티프)
│   ├── CoachSelect.jsx      # S1 코치 선택
│   ├── StateCheck.jsx       # S2 마음 날씨
│   ├── Home.jsx             # S3 오늘의 루틴 홈 (+ 완료 축하 카드)
│   ├── RecordScreen.jsx     # 기록 탭
│   └── SettingsScreen.jsx   # 설정 탭
├── lib/
│   ├── solar.js             # Solar API 코치 메시지 (성격 3종 × 상황 4종, 예비, cleanMessage)
│   ├── coaches.js           # 코치 3종 매핑 (이름·색·이미지·tagline)
│   ├── weather.js           # 마음 날씨 매핑 (날씨·설명·이미지·색·tint)
│   ├── routinePicker.js     # 상태별 루틴 추천 (영역 분산, 어제 루틴 제외)
│   ├── storage.js           # localStorage 헬퍼 (로컬 날짜 기반 리셋)
│   └── supabase.js          # Supabase 클라이언트 (카카오 OAuth)
└── data/
    └── routines.js          # 루틴 28개 (7영역 × 4개, 각 루틴마다 easyVersion)
```

## 향후 계획

- 카카오 로그인 완료 (Supabase OAuth). 루틴 카드 카카오톡 보내기는 8월 (talk_message 권한 심사 후)
- Solar API 호출을 Supabase Edge Function 경유로 전환 (API 키 은닉)
- 루틴 난이도 3단계 확장 (아주 쉬움 / 쉬움 / 보통)

## 만든 사람

김서우 (기획·개발) · AI Reboot 부트캠프

---

자세한 개발 컨텍스트는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.
