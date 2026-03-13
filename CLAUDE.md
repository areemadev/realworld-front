# CLAUDE.md

## Project Overview

Next.js 14 기반 [RealWorld](https://github.com/gothinkster/realworld) 스펙 구현체 — Medium.com 클론 "Conduit". 프론트엔드 전용 앱으로 모든 요청을 Next.js API Route를 통해 외부 백엔드 API로 프록시한다.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

테스트 프레임워크는 아직 설정되지 않았다.

## Environment Variables (.env)

```
COOKIE_NAME=<쿠키 이름>
COOKIE_PASSWORD=<32자 이상, iron-session 필수>
BASE_URL=https://api.realworld.io/api
NEXT_PUBLIC_RELATIVE_PATH=http://localhost:3000/api
```

- `BASE_URL` — 외부 RealWorld 백엔드 API (서버 전용)
- `NEXT_PUBLIC_RELATIVE_PATH` — Next.js API Route 기본 URL (클라이언트 + 서버)

## Architecture (상세: openspec/specs/)

아키텍처 상세 문서는 `openspec/specs/` 디렉토리에 있다:

- **[openspec/specs/spec.md](openspec/specs/spec.md)** — 프로젝트 전체 스펙, 기술 스택, 디렉토리 구조
- **[openspec/specs/api-proxy.md](openspec/specs/api-proxy.md)** — 2계층 API 프록시 패턴, 전체 API Route 맵, Server Action 목록
- **[openspec/specs/auth-flow.md](openspec/specs/auth-flow.md)** — iron-session 인증 플로우, 세션 구조, 로그인/로그아웃 흐름
- **[openspec/specs/components.md](openspec/specs/components.md)** — Server/Client 컴포넌트 분류, 도메인별 컴포넌트 맵, 페이지 구성
- **[openspec/specs/data-fetching.md](openspec/specs/data-fetching.md)** — 데이터 페칭 3가지 패턴 (Server Component, Client Component, Server Action)

## Key Conventions

- **프록시 패턴**: Client Component는 외부 API를 직접 호출하지 않는다. 반드시 `NEXT_PUBLIC_RELATIVE_PATH` 경유.
- **인증**: iron-session 쿠키 기반. 페이지에서 `getSession()` 호출 후 자식에게 token props 전달.
- **뮤테이션**: 폼 제출은 Client Component + axios, 버튼 액션은 Server Action + `revalidatePath()`.
- **UI**: Tailwind CSS + shadcn/ui, react-hook-form + zod, react-hot-toast.
- **Path Alias**: `@/*` -> `./src/*`

## Skills

- **`.claude/skills/realworld-codegen.md`** — 이 프로젝트 컨벤션에 맞는 코드 생성 가이드
- **`.claude/skills/realworld-review.md`** — 아키텍처 규칙 기반 코드 리뷰 체크리스트
