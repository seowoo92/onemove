# 오늘만큼 — 작업 환경 핸드오프 (맥 데스크탑 → 리눅스 서버)

> 작성: 2026-07-14. 이 문서 하나로 리눅스 서버에서 `git clone` 후 개발을 자연스럽게 이어가기 위한 안내.
> 프로젝트 전반의 정본 컨텍스트는 **CLAUDE.md**, 일자별 작업 기록은 **docs/devlog/** 참조.

---

## 1. 셋업 (클론 직후 순서대로)

```bash
git clone https://github.com/seowoo92/onemove.git
cd onemove

# ① git 커밋 작성자 연결 — 필수! (repo 설정은 clone에 따라오지 않음.
#    누락 시 커밋이 GitHub 계정과 연결되지 않아 기여 그래프에 안 잡힘 — 대회 제출 요건)
git config user.name "seowoo92"
git config user.email "140497360+seowoo92@users.noreply.github.com"

# ② Node 20+ 확인 후 의존성 설치 (GitHub Actions와 동일 버전)
node -v
npm ci

# ③ 환경변수 파일 생성 (.env.local은 gitignore — 직접 만들어야 함, 아래 3절 참조)

# ④ 개발 서버
npm run dev   # http://localhost:5180/onemove/ (.claude/launch.json이 5180 고정)
```

## 2. 배포

- `git push origin main` → GitHub Actions가 자동 빌드·배포 (`.github/workflows/deploy.yml`)
- 배포 URL: https://seowoo92.github.io/onemove/
- GitHub Secrets (이미 설정됨): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`
  (`VITE_SOLAR_API_KEY`는 프록시 전환으로 빌드에서 제거됨)

## 3. .env.local 값 얻는 곳

```
VITE_SUPABASE_URL=https://lazabfnhhbirolcvwbku.supabase.co
VITE_SUPABASE_ANON_KEY=   ← Supabase 대시보드 > Project Settings > API Keys > "Legacy anon" 키
VITE_SITE_URL=https://seowoo92.github.io/onemove/
VITE_SOLAR_API_KEY=       ← (선택) 업스테이지 콘솔. 앱은 더 이상 안 쓰고, 프롬프트 테스트 스크립트용
```

## 4. 백엔드 지도 (Supabase 프로젝트: onemove / lazabfnhhbirolcvwbku)

| 구성 | 내용 |
|---|---|
| 테이블 | `profiles`(pinned_ids 포함) · `daily_entries`(routine_names 포함) · `kakao_tokens` — 정본 스키마: `supabase/schema.sql` |
| Edge Functions | `send-kakao`(루틴 카드 발송) · `remind-incomplete`(오후 리마인더, x-cron-key 인증) · `solar-chat`(Solar AI 프록시) — 코드 정본: `supabase/functions/` |
| ⚠️ 함수 공통 설정 | 세 함수 모두 **Verify JWT = OFF** (본인 확인은 코드 안에서 수행) |
| Secrets | `UPSTAGE_API_KEY` · `KAKAO_REST_API_KEY` · `KAKAO_CLIENT_SECRET` · `CRON_SECRET` |
| 스케줄 | pg_cron `remind-incomplete-daily` — 매일 09:00 UTC(=18:00 KST) 리마인더 발송. 부수 효과로 무료플랜 7일 미사용 정지 방지 |
| 함수 수정 절차 | 로컬 파일 수정·커밋 → Supabase 대시보드 > Edge Functions > 해당 함수 > Code 탭에 붙여넣어 재배포 (CLI 미사용 워크플로우) |

⚠️ **무료플랜 주의**: 크론이 매일 돌지만, 만약 프로젝트가 일시정지(paused)되면 로그인 사용자에게 흰 화면이 아닌 게스트 폴백으로 동작하도록 하드닝돼 있음. 대시보드에서 Resume하면 복구.

## 5. 외부 콘솔 (계정 접근 필요)

- **Supabase 대시보드** — 스키마·Edge Functions·Secrets·Table Editor·SQL Editor
- **카카오 개발자 콘솔** (developers.kakao.com, 앱 ID 1489350) — talk_message 동의항목 ON, Web 플랫폼 도메인(seowoo92.github.io) 등록 완료 상태
- **업스테이지 콘솔** — Solar API 키 관리 (7/26쯤 재발급 + 구키 폐기 예정)
- **GitHub** (seowoo92/onemove) — Actions·Secrets

## 6. 현재 상태 (2026-07-14 마감 기준)

완료: 코드 하드닝 · Supabase 스키마+동기화(하이브리드) · 코치 프롬프트 품질(페르소나 3인·품질 게이트·번역투 교정·쉬어가기 톤) · 카카오 루틴 카드 + 오후 리마인더(스케줄) · PWA 홈 화면 설치 · Solar 키 은닉(프록시) · 루틴 70개 + 매일 루틴(★)

**대기 중 확인 1건**: `profiles.pinned_ids` 컬럼 ALTER 실행 여부 — Table Editor에서 profiles에 pinned_ids 칼럼이 있는지 확인, 없으면 `supabase/schema.sql` 마지막 ALTER 한 줄 실행

남은 일 (~7/28 예선):
- **디자인 리뉴얼 + 탭 4개(오늘·기록·코치·설정) + 기록 탭 대시보드 승격** — 사용자 시안 대기 중
- 발표 준비 (7/23~): 자료(개인 서사·AI 이해·윤리/저작권)·라이브 카톡 데모·리허설
- 7/26 재검토 3건: ① 과거 커밋 작성자 정정+발표 문서 히스토리 삭제(force push, 백업 후) ② 업스테이지 키 재발급 ③ 에러 안내화면 디자인 다듬기
- 여유 시: 완료 무지개 효과, 랜덤 힐링 문구, '울리는 알림'(Web Push) 재검토

## 7. 작업 리듬·규칙 (새 세션의 Claude가 꼭 알아야 할 것)

- **화면에 보이는 변경은 적용 전에 시안·설계를 먼저 보여주고 컨펌** 받는다 (사용자는 비개발자, 결과 화면으로 판단)
- **루틴 문구·코치 멘트 등 콘텐츠는 사용자 확정 후에만 반영** (routines.js는 확정본)
- 사용자가 **"오늘 작업 마감"**이라고 말하면 → 그날 devlog(docs/devlog/YYYY-MM-DD.md) 작성 + 마무리 커밋·푸시 + 태스크 정리
- **매일 작업 단위로 커밋** (대회 제출 요건: 날짜별 기록). 커밋 메시지 스타일은 기존 git log 참고 (한국어, feat/fix/docs/chore)
- 어색한 AI 멘트를 사용자가 발견하면 → 나쁜 예시로 프롬프트에 추가하는 **반복 개선 루프** (개선 전후를 커밋·devlog에 기록 — 발표 'AI 이해도' 재료)
- **날짜 소급 커밋 등 기록 조작 금지** (평가 항목에 윤리성 있음)

## 8. 대회 컨텍스트 (AI Reboot, 예선 7/28)

평가 5항목: ① 교육 내용 활용도(AI도구·과제 반영) ② 자기주도성·노력도 ③ 실용성·개인적용성 ④ 창의성·표현력 ⑤ AI 이해도·윤리성 — **사업화·기술 깊이는 채점하지 않음**. 상세는 CLAUDE.md.
발표 킬러 데모: 마음 날씨 선택 → 루틴 확정 → **실시간 카카오톡 루틴 카드 수신** 장면.
