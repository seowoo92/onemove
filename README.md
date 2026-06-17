# 오늘만큼 (onemove)

> 무기력한 날에도 "오늘 할 수 있는 만큼"만 제안하는 CBT 기반 회복탄력성 AI 루틴 코치

배포 사이트: https://seowoo92.github.io/onemove/

## 서비스 소개

- 취업·학업·대인관계 스트레스로 무기력감을 겪는 18~34세 청년을 위한 웹 서비스
- 오늘의 컨디션(좋아요 / 보통이에요 / 힘들어요)에 맞춰 할 수 있는 만큼의 회복 루틴을 추천
- 실패해도 죄책감 없이 재도전: "지금은 어려워요" 선택 시 더 쉬운 버전 제안, 포기해도 격려
- 유쾌·진중·다정 3종의 AI 코치가 상황에 맞는 격려 메시지 생성

## 핵심 기능

- 코치 성격 선택 (유쾌 / 진중 / 다정)
- 오늘 상태 체크 → 상태 기반 루틴 추천 (좋아요 4개 / 보통이에요 3개 / 힘들어요 2개)
- 7개 생활 영역 × 4개 = 28개 루틴 풀, 각 루틴마다 쉬운 버전 1:1 매칭
- AI 코치 격려 메시지 (Solar API, 호출 실패 시 예비 메시지 자동 전환)
- 기록 탭: 날짜별 루틴 완료 기록 (최근 14일)
- 설정 탭: 코치 변경 (진행 중인 루틴은 유지)
- 데스크톱/모바일 반응형 (PC에서는 폰 베젤 형태 UI, 모바일에서는 전체 화면)

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
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL (P1 예정) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (P1 예정) |

## 프로젝트 구조

```
src/
├── App.jsx                  # 화면 흐름 및 상태 관리 (screen / activeTab / homeKey)
├── components/
│   ├── AppLayout.jsx        # 반응형 레이아웃 (모바일·태블릿·데스크톱 3모드, 폰 베젤)
│   ├── CoachModal.jsx       # AI 코치 메시지 모달 (S4)
│   └── TabBar.jsx           # 하단 탭바 (홈 / 기록 / 설정)
├── screens/
│   ├── CoachSelect.jsx      # S1 코치 성격 선택
│   ├── StateCheck.jsx       # S2 오늘 상태 체크
│   ├── Home.jsx             # S3 오늘의 루틴 홈
│   ├── RecordScreen.jsx     # 기록 탭 화면
│   └── SettingsScreen.jsx   # 설정 탭 화면
├── lib/
│   ├── solar.js             # Solar API 코치 메시지 생성 (성격 3종 × 상황 4종, 예비 메시지, cleanMessage)
│   ├── routinePicker.js     # 상태별 루틴 추천 로직 (영역 분산, 어제 루틴 제외)
│   └── storage.js           # localStorage 헬퍼 (날짜 기반 자동 리셋)
└── data/
    └── routines.js          # 루틴 28개 데이터 (7영역 × 4개, 각 루틴마다 easyVersion)
```

## 향후 계획

- 카카오 로그인 및 루틴 카드 카카오톡 공유 (P1)
- Supabase 연동으로 기기 간 기록 동기화 (P2)
- Solar API 호출을 Supabase Edge Function 경유로 전환 (보안 강화)
- 루틴 난이도 3단계 확장

## 만든 사람

김서우 (기획·개발) · AI Reboot 부트캠프

---

자세한 개발 컨텍스트는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.
