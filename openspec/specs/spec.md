# RealWorld Front - 프로젝트 스펙

## 개요

[RealWorld](https://github.com/gothinkster/realworld) 스펙을 구현한 Medium.com 클론 애플리케이션 "Conduit". Next.js 14 기반 프론트엔드 전용 앱으로, 모든 요청을 Next.js API Route를 통해 외부 RealWorld 백엔드 API로 프록시한다.

## 기술 스택

| 영역            | 기술                                                 |
| --------------- | ---------------------------------------------------- |
| 프레임워크      | Next.js 14 (App Router)                              |
| 언어            | TypeScript 5.5                                       |
| 스타일링        | Tailwind CSS + shadcn/ui (Radix 기반)                |
| 폼 관리         | react-hook-form + zod                                |
| HTTP 클라이언트 | axios                                                |
| 인증            | iron-session (암호화 HTTP-only 쿠키)                 |
| 알림            | react-hot-toast                                      |
| 폰트            | Source Sans Pro (로컬), Titillium Web (Google Fonts) |
| 로더            | react-loader-spinner                                 |

## 환경 변수

| 변수                        | 용도                               | 범위              |
| --------------------------- | ---------------------------------- | ----------------- |
| `COOKIE_NAME`               | iron-session 쿠키 이름             | 서버 전용         |
| `COOKIE_PASSWORD`           | iron-session 암호화 키 (32자 이상) | 서버 전용         |
| `BASE_URL`                  | 외부 RealWorld 백엔드 API URL      | 서버 전용         |
| `NEXT_PUBLIC_RELATIVE_PATH` | Next.js API Route 기본 URL         | 클라이언트 + 서버 |

## 주요 디렉토리 구조

```
src/
├── app/
│   ├── api/              # BFF 프록시 레이어 (Route Handlers)
│   ├── (auth)/           # 로그인/회원가입 페이지 (Route Group)
│   ├── article/[slug]/   # 단일 게시글 페이지
│   ├── editor/[slug]/    # 게시글 편집기
│   ├── profile/[username]/ # 사용자 프로필 페이지
│   ├── settings/         # 설정 페이지
│   ├── layout.tsx        # 루트 레이아웃 (Navbar + Footer)
│   └── page.tsx          # 홈 페이지
├── actions.ts            # Server Actions (인증 필요 뮤테이션)
├── components/           # 도메인별 컴포넌트
├── lib/                  # 유틸리티 (세션, 폰트, 헬퍼)
└── providers/            # React Context Providers
```

## Path Alias

`@/*` -> `./src/*` (tsconfig.json)

## 세부 스펙 문서

- [API 프록시 패턴](./api-proxy.md) - 2계층 API 프록시 구조와 전체 라우트 맵
- [인증 플로우](./auth-flow.md) - iron-session 기반 인증 구조
- [컴포넌트 구조](./components.md) - Server/Client 컴포넌트 트리
- [데이터 페칭 패턴](./data-fetching.md) - 데이터 조회/변경 패턴
