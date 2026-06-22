# AI 첫발, 함께 내딛다 — 2분기 GWP 결과 등록 & 추첨

2026년 2분기 GWP 활동 결과물을 등록하고, 등록자 대상으로 경품 추첨을 진행하는 웹페이지입니다.

## 활동
1. AI로 파이썬 프로그램 개발하기
2. 웹페이지 개발해서 GitHub 등록하기
3. AI로 어시스턴트 만들기

참가자는 **활동별로 각각** 이름 + 웹주소를 등록합니다. 등록은 링크만 있으면 누구나 가능하고, 추첨은 관리자가 비밀번호로 실행합니다.

## 기술 스택
- **Cloudflare Pages** — 정적 프론트엔드 (`public/`)
- **Cloudflare Pages Functions** — 서버리스 API (`functions/api/`)
- **Cloudflare D1** (SQLite) — 등록/추첨 데이터 저장
- 프론트엔드: 빌드 스텝 없는 정적 HTML + Tailwind(CDN) + 바닐라 JS

## 구조
```
public/                 정적 페이지
  index.html            랜딩
  register.html         결과물 등록
  participants.html     등록 현황
  draw.html             관리자 추첨
  winners.html          당첨 결과
  js/common.js          공통 헬퍼
functions/api/          API (Pages Functions)
  register.js           POST  /api/register
  registrations.js      GET   /api/registrations
  draw.js               POST  /api/draw   (관리자)
  winners.js            GET   /api/winners
schema.sql              D1 스키마
wrangler.toml           D1 바인딩 + Pages 설정
```

## 로컬 개발
```bash
# 1) 의존성 (wrangler) — 글로벌 설치 없이 npx 사용 가능
npm install -g wrangler   # 또는 npx wrangler ...

# 2) 로컬 D1 생성 및 스키마 적용
npx wrangler d1 execute gwp-2026-2nd --local --file=./schema.sql

# 3) 관리자 비밀번호 설정 (로컬)
cp .dev.vars.example .dev.vars   # ADMIN_PASSWORD 값 수정

# 4) 로컬 서버 실행 (Functions + D1)
npx wrangler pages dev public --d1 DB
```
브라우저에서 `http://localhost:8788` 접속.

## 배포 (Cloudflare)
```bash
# 1) 원격 D1 생성 → 출력된 database_id 를 wrangler.toml 에 입력
npx wrangler d1 create gwp-2026-2nd

# 2) 원격 D1 에 스키마 적용
npx wrangler d1 execute gwp-2026-2nd --remote --file=./schema.sql

# 3) Pages 프로젝트로 배포
npx wrangler pages deploy public

# 4) 관리자 비밀번호를 Secret 으로 등록
npx wrangler pages secret put ADMIN_PASSWORD
```

> Cloudflare 계정 로그인(`wrangler login`) 또는 API 토큰이 필요합니다.
> D1 바인딩(`binding = "DB"`)은 Pages 프로젝트 설정 또는 `wrangler.toml`에서 연결되어야 합니다.

## API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/register` | `{activity, name, url}` 등록 |
| GET  | `/api/registrations?activity=N` | 등록 목록 (activity 생략 시 전체) |
| POST | `/api/draw` | `{scope, count, prize, password}` 관리자 추첨 |
| GET  | `/api/winners` | 추첨/당첨 이력 |

추첨은 서버에서 `crypto.getRandomValues` 기반 셔플로 공정하게 추출하며, 관리자 비밀번호는 서버 측에서만 검증됩니다(프론트에 노출 안 됨).
