# 오늘만큼 (onemove)

CBT 기반 회복탄력성 AI 루틴 코치 웹서비스

## 기술 스택

- **프레임워크**: React 19 + Vite 8
- **스타일링**: Tailwind CSS v4
- **패키지 매니저**: npm
- **배포**: GitHub Pages (Actions 자동 배포)
- **백엔드**: Supabase (예정)
- **AI**: SOLAR API (예정)

## 폴더 구조

```
onemove/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages 자동 배포
├── docs/
│   └── devlog/               # 개발 일지
├── public/                   # 정적 에셋
├── src/
│   ├── assets/               # 이미지, 아이콘
│   ├── App.jsx               # 루트 컴포넌트
│   ├── index.css             # 전역 스타일 (Tailwind import 포함)
│   └── main.jsx              # React 진입점
├── .env.example              # 환경변수 키 목록 (값 없음)
├── .env.local                # 실제 환경변수 (gitignore, 직접 생성)
├── CLAUDE.md                 # 이 파일
├── index.html
├── package.json
└── vite.config.js
```

## 환경변수

`.env.example`을 복사해 `.env.local`을 만들고 값을 채워주세요.

| 변수명 | 설명 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `VITE_SOLAR_API_KEY` | SOLAR AI API 키 |
| `VITE_SITE_URL` | 서비스 URL (예: https://seowoo92.github.io/onemove) |

GitHub Secrets에도 동일한 키를 등록해야 Actions에서 빌드 시 주입됩니다.

## 개발 명령어

```bash
# 로컬 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동 실행되어
`dist/` 폴더를 GitHub Pages에 배포합니다.

배포 URL: `https://seowoo92.github.io/onemove/`

## 디자인 토큰

| 항목 | 값 |
|------|-----|
| 배경색 | `#FAF6F0` (오프화이트) |
| 주요 색상 | `#24523F` (딥그린) |
