# 바이브 코딩 마이그레이션 튜토리얼

> RealWorld Front (Next.js 14) 프로젝트에 바이브 코딩 인프라를 구축한 실제 워크숍 과정을 재구성한 튜토리얼.
> Claude Code 세션 로그와 생성된 산출물을 기반으로 작성되었다.

---

## 개요

이 튜토리얼은 4시간 워크숍에서 진행한 **3단계 바이브 코딩 마이그레이션** 전체 과정을 다룬다.

| 단계   | 내용                                         | 소요 시간 | 핵심 산출물                                    |
| ------ | -------------------------------------------- | --------- | ---------------------------------------------- |
| 1단계  | 문서화 (OpenSpec + 스킬 + CLAUDE.md)         | ~35분     | 스펙 5개, 스킬 2개, CLAUDE.md 재구성           |
| 2단계  | 테스트 구현 (Vitest + Playwright + Prettier) | ~45분     | 단위 테스트 4파일, E2E 4파일, 포매팅/린트 설정 |
| 3단계  | CI/CD 구축 (Husky + lint-staged + Makefile)  | ~20분     | Git hooks, Makefile, npm scripts 정비          |
| 마무리 | 전환 계획서 생성                             | ~10분     | `migration-plan.md`                            |

### 대상 프로젝트

- **프로젝트**: Next.js 14 RealWorld (Conduit) -- Medium.com 클론
- **기술 스택**: TypeScript 5.5, Tailwind CSS, shadcn/ui, iron-session, axios
- **아키텍처**: 2계층 API 프록시 (Client -> Next.js API Route -> External API)
- **전환 전 상태**: 테스트 없음, Prettier 없음, Git hooks 없음, CLAUDE.md 비구조화

---

## 1단계: 문서화

### 1.1 OpenSpec 프로젝트 스펙 문서화

#### 사용한 프롬프트

```
이 프로젝트의 아키텍처를 분석해서 OpenSpec 형식으로 문서화해줘.
openspec/specs/ 디렉토리에 다음 문서를 생성해줘:

1. spec.md -- 프로젝트 전체 스펙 (기술 스택, 디렉토리 구조, 환경 변수)
2. api-proxy.md -- Two-Layer API Proxy 패턴, 모든 API Route 매핑
3. auth-flow.md -- iron-session 인증 플로우, 세션 구조, 쿠키 설정
4. components.md -- Server/Client 컴포넌트 분류, 도메인별 트리
5. data-fetching.md -- Server Component / Client Component / Server Action 패턴

실제 코드를 읽고 작성해줘. 추측하지 마.
```

#### 생성된 산출물

```
openspec/
├── config.yaml                  # OpenSpec 설정 (schema: spec-driven)
└── specs/
    ├── spec.md                  # 프로젝트 전체 스펙
    ├── api-proxy.md             # 2계층 API 프록시 패턴
    ├── auth-flow.md             # iron-session 인증 플로우
    ├── components.md            # Server/Client 컴포넌트 구조
    └── data-fetching.md         # 데이터 페칭 3가지 패턴
```

#### 각 스펙 문서의 역할

| 문서               | 내용                                                                                               | 왜 필요한가                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `spec.md`          | 기술 스택, 환경 변수 4개, 디렉토리 구조, path alias                                                | Claude Code가 프로젝트 전체 맥락을 파악하는 진입점                    |
| `api-proxy.md`     | API Route 13개 전체 맵, Server Action 6개, 에러 처리 패턴, 인증 토큰 전달 방식 4가지               | 이 프로젝트의 핵심 아키텍처. 새 API를 추가할 때 패턴을 따르도록 유도  |
| `auth-flow.md`     | `ISessionData` 구조, 쿠키 설정, 로그인/회원가입/로그아웃/수정 플로우, 인증 만료 처리               | 인증은 보안과 직결. 잘못된 패턴(토큰을 localStorage에 저장 등)을 방지 |
| `components.md`    | 10개 도메인 40+ 컴포넌트의 Server/Client 분류, 페이지별 컴포넌트 트리                              | 새 컴포넌트 추가 시 Server/Client 경계를 올바르게 설정하기 위함       |
| `data-fetching.md` | Server Component 패턴, Client Component 패턴, Server Action 패턴, 각 패턴을 사용하는 컴포넌트 목록 | "어떤 경우에 어떤 패턴을 쓸 것인가"를 명확히 정의                     |

#### OpenSpec config.yaml

```yaml
schema: spec-driven
```

최소한의 설정으로 시작했다. `spec-driven` 스키마는 코드에서 스펙을 추출하는 방식에 맞는 선택이다.

### 1.2 프로젝트 전용 스킬 생성

#### 사용한 프롬프트

```
이 프로젝트의 코드 컨벤션을 분석해서 Claude Code 스킬 2개를 만들어줘:

1. .claude/skills/realworld-codegen.md
   -- API Route, Server Action, 페이지, 클라이언트 컴포넌트 생성 템플릿
   -- 네이밍 컨벤션, UI 컨벤션 포함

2. .claude/skills/realworld-review.md
   -- 프록시 패턴 준수 검사 (Client에서 BASE_URL 직접 호출 금지)
   -- 인증 토큰 처리 검사 (localStorage 사용 금지)
   -- Server/Client 경계 검사
   -- 응답 형식 일관성 검사

실제 코드에서 패턴을 추출해줘.
```

#### 생성된 스킬 파일

**`.claude/skills/realworld-codegen.md`** -- 코드 생성 스킬

이 스킬은 6가지 코드 생성 패턴을 정의한다:

1. **API Route 생성** -- 인증 필요 라우트 / 세션 저장 라우트 템플릿
2. **Server Action 생성** -- `getSession()` -> 토큰 확인 -> API 호출 -> `revalidatePath()` 패턴
3. **페이지 생성** -- Server Component에서 `getSession()` 호출 후 자식에 token 전달
4. **Client Component 생성** -- 폼(react-hook-form + zod) / 액션 버튼(Server Action 호출)
5. **네이밍 컨벤션** -- PascalCase 컴포넌트, `API_RESOURCE_METHOD` 에러 로그, `T`/`I` 타입 접두사
6. **UI 컨벤션** -- Tailwind 직접 사용, `cn()` 조건부 클래스, shadcn/ui 폼 컴포넌트

**`.claude/skills/realworld-review.md`** -- 코드 리뷰 스킬

5가지 필수 아키텍처 규칙과 위반 감지 패턴을 정의한다:

| 규칙               | 위반 예시                            | 올바른 패턴                           |
| ------------------ | ------------------------------------ | ------------------------------------- |
| 프록시 패턴 준수   | Client에서 `BASE_URL` 직접 호출      | `NEXT_PUBLIC_RELATIVE_PATH` 경유      |
| 인증 토큰 처리     | `localStorage.setItem('token', ...)` | iron-session 쿠키만 사용              |
| Server/Client 경계 | Client에서 `getSession()` 호출       | Server -> props 전달                  |
| 뮤테이션 패턴      | 폼 제출에 Server Action 사용         | 폼=axios, 버튼=Server Action          |
| 응답 형식          | `NextResponse.json(res.data)`        | `NextResponse.json({ data, status })` |

추가로 API Route, Server Action, 컴포넌트, 타입 안전성, 보안에 대한 체크리스트를 포함한다.

### 1.3 CLAUDE.md 재구성

#### 사용한 프롬프트

```
CLAUDE.md를 재구성해줘.
상세 아키텍처 설명은 openspec/specs/로 이동했으니 링크만 남겨줘.
중복을 제거하고 간결하게:

1. Project Overview (1~2줄)
2. Commands
3. Environment Variables
4. Architecture -- openspec 문서 링크
5. Key Conventions (핵심 규칙 5개)
6. Skills (파일 경로)
```

#### Before vs After

**Before** (원본 CLAUDE.md): 인라인으로 아키텍처 전체를 설명. `### Two-Layer API Proxy Pattern`, `### Authentication Flow`, `### Key Directories` 등이 하나의 파일에 모두 포함.

**After** (재구성된 CLAUDE.md): 51줄. OpenSpec 스펙 5개로의 링크 + 핵심 컨벤션 5줄 + 스킬 경로 2개.

핵심 변경:

- `Architecture` 섹션이 openspec 링크 목록으로 교체됨
- `Key Conventions` 섹션이 5개 규칙으로 압축됨
- `Skills` 섹션 추가

```markdown
## Architecture (상세: openspec/specs/)

- **[spec.md](openspec/specs/spec.md)** -- 프로젝트 전체 스펙
- **[api-proxy.md](openspec/specs/api-proxy.md)** -- 2계층 API 프록시 패턴
- **[auth-flow.md](openspec/specs/auth-flow.md)** -- iron-session 인증 플로우
- **[components.md](openspec/specs/components.md)** -- Server/Client 컴포넌트 분류
- **[data-fetching.md](openspec/specs/data-fetching.md)** -- 데이터 페칭 패턴

## Key Conventions

- **프록시 패턴**: Client Component는 NEXT_PUBLIC_RELATIVE_PATH만 경유
- **인증**: iron-session 쿠키 기반. 페이지에서 getSession() -> 자식에 token props 전달
- **뮤테이션**: 폼=Client+axios, 버튼=Server Action+revalidatePath()
- **UI**: Tailwind CSS + shadcn/ui, react-hook-form + zod
- **Path Alias**: @/_ -> ./src/_
```

---

## 2단계: 테스트 구현

### 2.1 Vitest 설정

#### 사용한 프롬프트

```
Vitest를 설정해줘.

- vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/jest-dom,
  @testing-library/user-event, jsdom 설치
- vitest.config.ts 생성 (jsdom 환경, @/* path alias, setup file)
- vitest.setup.ts 생성
- package.json에 test, test:watch, test:coverage 스크립트 추가
- e2e/ 디렉토리는 vitest에서 제외
```

#### 생성된 설정 파일

**`vitest.config.ts`**:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

주요 설정 포인트:

- `globals: true` -- `describe`, `it`, `expect`를 import 없이 사용 가능 (하지만 명시적 import를 사용하는 것이 관례)
- `alias` -- tsconfig.json의 `@/*` path alias를 vitest에서도 인식
- `exclude` -- Playwright E2E 테스트 디렉토리를 vitest 실행에서 제외

**`vitest.setup.ts`**:

```typescript
import "@testing-library/jest-dom";
```

**`tsconfig.json` 수정** -- vitest/playwright 설정 파일을 TypeScript 컴파일에서 제외:

```json
{
  "exclude": ["node_modules", "vitest.config.ts", "vitest.setup.ts", "playwright.config.ts", "e2e"]
}
```

### 2.2 Playwright 설정

#### 사용한 프롬프트

```
Playwright를 설정해줘.

- @playwright/test 설치, chromium 브라우저 설치
- playwright.config.ts 생성 (chromium만, baseURL localhost:3000, webServer로 dev 서버 자동 시작)
- package.json에 test:e2e 스크립트 추가
```

#### 생성된 설정 파일

**`playwright.config.ts`**:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

주요 설정 포인트:

- `webServer` -- 테스트 실행 전 자동으로 `npm run dev`를 실행하여 개발 서버 시작
- `reuseExistingServer: !process.env.CI` -- 로컬에서는 이미 실행 중인 서버 재사용, CI에서는 새로 시작
- chromium만 사용하여 테스트 실행 시간 최소화

### 2.3 단위 테스트 작성

#### 사용한 프롬프트

```
src/__tests__/ 디렉토리에 단위 테스트를 작성해줘.
핵심 경로 위주로:

1. utils.ts의 cn() 헬퍼 -- Tailwind 클래스 병합 유틸리티
2. get-params.ts -- URL 검색 파라미터 파싱
3. articles API Route -- 프록시 패턴의 URL 구성과 데이터 전달 로직
4. auth API Route -- 로그인/회원가입 요청 형식과 에러 처리

axios는 vi.mock()으로 모킹해줘. 환경 변수는 vi.stubEnv()로 설정해줘.
실제 코드를 읽고 동작을 정확히 반영해줘.
```

#### 생성된 테스트 파일 4개

**`src/__tests__/utils.test.ts`** -- 9개 테스트 케이스

`cn()` 유틸리티(clsx + tailwind-merge)의 동작을 검증한다:

- 단일 클래스, 다중 클래스, Tailwind 충돌 해소(`text-red-500` vs `text-blue-500` -> 마지막 우선)
- 조건부 클래스(boolean), undefined/null/false 무시
- 객체 형태(`{ 'text-bold': true }`), 배열 형태
- padding 충돌 병합(`p-4` + `p-2` -> `p-2`)

**`src/__tests__/get-params.test.ts`** -- 13개 테스트 케이스

`getParams()` 함수의 URL 검색 파라미터 파싱을 검증한다:

- 빈 객체 시 기본값(page:1, offset:0, limit:10, 나머지 undefined)
- 각 파라미터(page, offset, tag, limit, author, favorited, feed) 개별 파싱
- offset이 0인 경우 falsy 처리 확인
- 모든 파라미터 동시 처리

**`src/__tests__/api-articles.test.ts`** -- 7개 테스트 케이스

Articles API Route의 프록시 로직을 검증한다:

- GET: 쿼리 파라미터 URL 조합, limit/offset 기본값, tag/author/favorited 추가
- POST: article 데이터 형식 전달, 필수 필드(title, description, body) 누락 감지
- **버그 발견**: `body: body.description` (body 필드에 description 값이 전달되는 버그)

**`src/__tests__/api-auth.test.ts`** -- 8개 테스트 케이스

인증 API Route의 프록시 로직을 검증한다:

- POST /api/login: 요청 형식, 응답에서 토큰 추출, 422 에러 처리
- POST /api/register: 요청 형식, 필수 필드(username, email, password) 누락 감지

#### 단위 테스트 전략: 핵심 경로 집중

모든 코드를 테스트하지 않았다. 우선순위:

1. **순수 유틸리티 함수** (utils.ts, get-params.ts) -- 외부 의존 없이 테스트 가능, ROI 최고
2. **API Route 프록시 로직** -- 이 프로젝트의 핵심 아키텍처 패턴
3. **인증 로직** -- 가장 중요한 사용자 경로

테스트하지 **않은** 것:

- Server Component 렌더링 (E2E로 커버)
- shadcn/ui 컴포넌트 (외부 라이브러리)
- Client Component의 폼 제출 (E2E로 커버)

### 2.4 E2E 테스트 작성

#### 사용한 프롬프트

```
e2e/ 디렉토리에 Playwright E2E 테스트를 작성해줘.
핵심 사용자 시나리오 4개:

1. auth.spec.ts -- 로그인/회원가입 페이지 렌더링, 폼 입력, 페이지 간 네비게이션
2. articles.spec.ts -- 글로벌 피드 로딩, 아티클 목록, 상세 페이지 이동, 에디터 인증 체크
3. profile.spec.ts -- 프로필 페이지, 팔로우 버튼, 좋아요 버튼, 설정 페이지 인증
4. feed.spec.ts -- 글로벌 피드 탭, 태그 목록, 태그 필터링, 페이지네이션, 네비바, 푸터

외부 API에 의존하지 않도록, 페이지 렌더링과 UI 요소 존재 확인 위주로 작성해줘.
```

#### 생성된 E2E 테스트 파일 4개

**`e2e/auth.spec.ts`** -- 5개 시나리오

- 로그인 페이지 렌더링 (이메일/패스워드 입력 필드 존재 확인)
- 로그인 폼 데이터 입력 및 제출
- 회원가입 페이지 렌더링
- 회원가입 폼 입력 필드 확인
- 로그인 -> 회원가입 페이지 링크 네비게이션

**`e2e/articles.spec.ts`** -- 4개 시나리오

- 홈페이지 글로벌 피드 로딩
- 아티클 목록 표시
- 아티클 상세 페이지 이동 (`a[href*="/article/"]` 링크 클릭)
- 에디터 페이지 인증 없이 접근 시 동작 확인

**`e2e/profile.spec.ts`** -- 4개 시나리오

- 프로필 페이지 로딩 (홈에서 작성자 링크로 이동)
- 비로그인 상태 팔로우 버튼 동작
- 좋아요 버튼 존재 확인
- 설정 페이지 인증 필요 확인

**`e2e/feed.spec.ts`** -- 6개 시나리오

- 글로벌 피드 탭 존재 확인
- 태그 목록 사이드바 표시
- 태그 클릭 시 URL에 `tag=` 파라미터 포함 확인
- 페이지네이션 동작 (`a[href*="page="]` 클릭)
- 네비게이션 바 표시
- 푸터 표시

#### E2E 테스트 설계 원칙

1. **외부 API 비의존** -- 실제 백엔드 없이도 실행 가능. 페이지 로딩과 UI 요소 존재 확인 위주
2. **조건부 검증** -- 데이터가 있을 때만 검증 (`if ((await element.count()) > 0)`)
3. **`networkidle` 대기** -- `page.waitForLoadState("networkidle")`로 비동기 데이터 로딩 완료 대기
4. **비파괴적** -- 데이터를 생성/수정/삭제하지 않음

### 2.5 ESLint + Prettier 설정

#### 사용한 프롬프트

```
Prettier와 ESLint를 강화해줘.

- prettier, eslint-config-prettier 설치
- .prettierrc 생성 (semi: true, singleQuote: false, tabWidth: 2, trailingComma: all, printWidth: 100)
- .eslintrc.json에 prettier extends 추가
- ESLint 규칙 추가: no-unused-vars warn, no-console warn (error/warn 허용), prefer-const, no-var, eqeqeq
- 전체 코드베이스에 Prettier 일괄 적용
```

#### 생성된 설정 파일

**`.prettierrc`**:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**`.eslintrc.json`**:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "warn",
    "no-var": "error",
    "eqeqeq": "warn"
  }
}
```

`prettier` extends를 마지막에 추가하여 ESLint와 Prettier의 포매팅 규칙 충돌을 방지한다.

### 2.6 발견된 버그: articles POST route의 body 필드

테스트 작성 과정에서 `src/app/api/articles/route.ts`의 POST 핸들러에서 버그를 발견했다.

**버그 위치**: `src/app/api/articles/route.ts` 29행

```typescript
// 버그: body 필드에 body.description 값이 전달됨
const res = await axios.post(
  `${process.env.BASE_URL}/articles`,
  {
    article: {
      title: body.title,
      description: body.description,
      body: body.description,  // <-- 여기! body.body여야 함
      tagList: body.tagList,
    },
  },
  ...
);
```

**영향**: 게시글 작성 시 본문(body) 대신 설명(description) 텍스트가 본문으로 전달된다. 게시글의 본문 내용이 항상 설명과 동일하게 저장되는 데이터 손상 버그다.

**수정**: `body.description` -> `body.body`

이 버그는 단위 테스트 `src/__tests__/api-articles.test.ts`에서 기록되었다 (98행 주석 참조). 테스트가 **현재 코드의 실제 동작을 반영**하도록 작성되었기 때문에, 버그가 수정되면 테스트도 함께 수정해야 한다.

---

## 3단계: CI/CD 구축

### 3.1 Husky + lint-staged 설정

#### 사용한 프롬프트

```
품질 게이트를 구축해줘.

1. Husky + lint-staged 설치 및 설정
   - pre-commit: npx lint-staged (변경 파일에만 eslint --fix + prettier --write)
   - pre-push: npm run test && npm run build (테스트와 빌드 모두 통과해야 push)

2. .lintstagedrc.json:
   - *.{ts,tsx}: eslint --fix -> prettier --write
   - *.{json,md,css}: prettier --write

3. package.json에 "prepare": "husky" 추가
```

#### 생성된 설정 파일

**`.husky/pre-commit`**:

```bash
npx lint-staged
```

**`.husky/pre-push`**:

```bash
npm run test
npm run build
```

**`.lintstagedrc.json`**:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

#### Hook 동작 흐름

```
git commit
  --> .husky/pre-commit
      --> npx lint-staged
          --> *.{ts,tsx} 파일: eslint --fix -> prettier --write
          --> *.{json,md,css} 파일: prettier --write
      통과 -> 커밋 완료
      실패 -> 커밋 차단 (린트 에러 수정 필요)

git push
  --> .husky/pre-push
      --> npm run test   (vitest run)
      --> npm run build  (next build)
      통과 -> 푸시 완료
      실패 -> 푸시 차단 (테스트/빌드 에러 수정 필요)
```

### 3.2 Makefile 통합

#### 사용한 프롬프트

```
Makefile을 생성해줘. 다음 타겟 포함:
- dev: 개발 서버 실행
- setup: npm install + playwright install
- lint, format, format-check
- test (vitest), test-e2e (playwright), test-all
- build: 프로덕션 빌드
- check: lint + format-check + test + build 순차 실행 (전체 품질 게이트)
- help: 사용 가능한 명령어 목록 출력
```

#### 생성된 Makefile

```makefile
.PHONY: dev setup lint format format-check test test-e2e test-all build check help

.DEFAULT_GOAL := help

dev:           ## 개발 서버 실행
	npm run dev

setup:         ## 초기 설정 (의존성 설치 + Playwright 브라우저)
	npm install
	npx playwright install

lint:          ## ESLint 검사
	npm run lint

format:        ## Prettier 포맷팅 적용
	npx prettier --write .

format-check:  ## Prettier 포맷팅 확인
	npx prettier --check .

test:          ## 단위 테스트 (Vitest)
	npm run test

test-e2e:      ## E2E 테스트 (Playwright)
	npm run test:e2e

test-all: test test-e2e  ## 전체 테스트 (단위 + E2E)

build:         ## 프로덕션 빌드
	npm run build

check: lint format-check test build  ## 전체 품질 게이트

help:          ## 사용 가능한 명령어 목록
	@awk '/^[a-zA-Z0-9_-]+:.*## / ...' $(MAKEFILE_LIST)
```

`make check`가 핵심이다. lint -> format-check -> test -> build를 순차 실행하여, 하나라도 실패하면 전체가 실패한다.

### 3.3 package.json scripts 정비

최종 npm scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  }
}
```

- `prepare: "husky"` -- `npm install` 실행 시 자동으로 Husky Git hooks 설치

---

## 마무리: 전환 계획서 생성

### generate-plan 스킬 대체 과정

원래 워크숍 설계에서는 `reference/generate-plan/` 스킬을 사용하여 전환 계획서를 생성할 예정이었다. 실제 워크숍에서는 에픽 1~3의 경험을 직접 Claude Code에게 전달하여 계획서를 생성했다.

#### 사용한 프롬프트

```
에픽 1~3에서 수행한 작업을 바탕으로 전환 계획서를 생성해줘.
docs/vibe-coding-adoption-plan.md의 인터뷰 결과와 에픽 구조를 참조해줘.

포함할 내용:
1. 프로젝트 현황 진단 (Before/After 비교)
2. Phase 1: 문서화 -- 단계별 가이드, 프롬프트, 산출물
3. Phase 2: 테스트 -- 단계별 가이드, 프롬프트, 산출물
4. Phase 3: 품질 게이트 -- 단계별 가이드, 프롬프트, 산출물
5. 도구 설정 가이드 (패키지, 설정 파일 위치, npm scripts)
6. 프롬프트 레시피 (재사용 가능한 프롬프트 모음)
7. 체크리스트 (인쇄해서 따라갈 수 있는 통합 체크리스트)
8. FAQ/트러블슈팅
9. 다음 단계 (팀 도입 전략)

워크숍 참가자가 자기 프로젝트에 독립적으로 적용할 수 있는 수준으로 작성해줘.
```

#### 생성 결과

`migration-plan.md`가 루트에 생성되었다. 전환 계획서는 9개 섹션으로 구성되며 다음을 포함한다:

- Before/After 비교 표
- 3개 Phase 각각의 단계별 가이드, 실제 프롬프트, 산출물 목록
- 전체 패키지 설치 명령어, 설정 파일 위치 맵
- 재사용 가능한 프롬프트 레시피 (프로젝트 진단, 스펙 생성, 테스트, 품질 게이트)
- 인쇄 가능한 통합 체크리스트 (Phase 1~3 총 30+ 항목)
- FAQ 7개 (path alias, 브라우저 미설치, pre-push 느림, lint 에러, Server Component 테스트, 문서 동기화, 테스트 우선순위)
- 팀 도입 로드맵 (파일럿 -> 검증 -> 확산 -> 정착)
- GitHub Actions CI 예시 YAML

---

## 트러블슈팅

워크숍 과정에서 만난 문제와 해결 방법을 정리한다.

### 문제 1: @vitejs/plugin-react 타입 충돌

**증상**: `vitest.config.ts`에서 TypeScript 타입 에러 발생. `@vitejs/plugin-react`의 타입이 Next.js의 타입과 충돌.

**원인**: `tsconfig.json`의 `include`가 `**/*.ts`로 설정되어 vitest 설정 파일도 TypeScript 컴파일 대상에 포함됨.

**해결**: `tsconfig.json`의 `exclude`에 vitest/playwright 설정 파일 추가:

```json
{
  "exclude": ["node_modules", "vitest.config.ts", "vitest.setup.ts", "playwright.config.ts", "e2e"]
}
```

### 문제 2: /api/tags 정적 생성 실패

**증상**: `npm run build` 시 `/api/tags` 라우트에서 빌드 에러. Next.js가 이 라우트를 정적으로 생성하려 하지만, `process.env.BASE_URL`이 빌드 시점에 사용 가능하지 않음.

**원인**: Next.js 14의 App Router는 기본적으로 Route Handler를 정적으로 최적화하려 한다. `/api/tags`는 요청 객체(`req`)를 사용하지 않아 정적 라우트로 판단됨.

**해결**: `src/app/api/tags/route.ts`에 `force-dynamic` 옵트아웃 추가:

```typescript
export const dynamic = "force-dynamic";
```

이 한 줄이 Next.js에게 "이 라우트는 항상 동적으로 처리하라"고 알려준다.

### 문제 3: Prettier 포매팅 불일치

**증상**: `npm run format:check`에서 기존 코드 전체에 포매팅 에러. Prettier를 처음 도입했기 때문에 기존 코드가 Prettier 규칙과 맞지 않음.

**해결**: 전체 코드베이스에 Prettier 일괄 적용 후 하나의 커밋으로 기록:

```bash
npx prettier --write .
git add -A
git commit -m "style: apply prettier formatting to entire codebase"
```

이 "big bang" 포매팅 커밋은 git blame을 오염시키지만, `git blame --ignore-rev`로 특정 커밋을 무시할 수 있다. `.git-blame-ignore-revs` 파일에 해당 커밋 해시를 기록하면 된다.

### 문제 4: articles POST route body 필드 버그

**증상**: 게시글 작성 시 본문 내용이 설명(description)과 동일하게 저장됨.

**원인**: `src/app/api/articles/route.ts` 29행에서 `body: body.description`으로 잘못 작성됨.

**해결**: `body.description` -> `body.body`로 수정:

```typescript
article: {
  title: body.title,
  description: body.description,
  body: body.body,  // body.description이 아님
  tagList: body.tagList,
}
```

---

## 다른 프로젝트에 적용하는 팁

### 프로젝트별 커스터마이징 포인트

| 항목               | 이 프로젝트                             | 다른 프로젝트 적용 시                          |
| ------------------ | --------------------------------------- | ---------------------------------------------- |
| OpenSpec 스펙 주제 | API 프록시, 인증, 컴포넌트, 데이터 페칭 | 프로젝트 핵심 아키텍처 패턴에 맞게 변경        |
| 스킬 종류          | 코드 생성, 코드 리뷰                    | 마이그레이션, 리팩토링, 배포 등 반복 작업 기준 |
| 단위 테스트 대상   | 유틸리티, API Route 프록시              | 비즈니스 로직, 데이터 변환, 유효성 검사        |
| E2E 시나리오       | 인증, 게시글, 프로필, 피드              | 핵심 사용자 여정(가입->결제 등)                |
| Prettier 규칙      | printWidth: 100, semi: true             | 팀 컨벤션에 맞게 조정                          |
| pre-push hook      | test + build                            | 빌드 시간이 길면 test만, CI에서 build          |

### 프롬프트 재사용 가이드

워크숍에서 사용한 프롬프트의 구조를 분석하면 패턴이 있다:

**패턴 1: 분석 후 생성**

```
이 프로젝트의 [분석 대상]을 분석해서 [산출물 형식]으로 [위치]에 생성해줘.
[구체적 요구사항 목록]
실제 코드를 읽고 작성해줘. 추측하지 마.
```

**패턴 2: 도구 설정**

```
[도구]를 설정해줘.
- [패키지] 설치
- [설정 파일] 생성 ([구체적 옵션])
- package.json에 [스크립트] 추가
```

**패턴 3: 테스트 생성**

```
[위치]에 [테스트 종류]를 작성해줘.
[우선순위/시나리오 목록]
[모킹/환경 설정 지시]
실제 코드를 읽고 동작을 반영해줘.
```

핵심: **"실제 코드를 읽고 작성해줘. 추측하지 마."** 이 지시가 AI의 환각을 방지한다.

### 적용 순서 권장

1. **CLAUDE.md부터** -- Claude Code에게 프로젝트 컨텍스트를 먼저 알려줘야 이후 작업 품질이 올라감
2. **OpenSpec 문서화** -- 아키텍처를 명문화하면 AI가 패턴을 정확히 따름
3. **단위 테스트 + Prettier** -- 순수 함수부터 테스트하고 포매팅 통일
4. **Git hooks** -- 테스트와 포매팅이 있어야 hook이 의미가 있음
5. **E2E 테스트** -- 인프라가 갖춰진 후 통합 테스트 추가
6. **스킬 생성** -- 반복 작업이 명확해진 후 스킬로 정형화

### 시간 투자 대비 효과 (ROI) 순위

| 순위 | 작업                   | 시간 | 효과                                   |
| ---- | ---------------------- | ---- | -------------------------------------- |
| 1    | CLAUDE.md 작성         | 5분  | AI의 모든 후속 작업 품질 향상          |
| 2    | Prettier + ESLint 설정 | 10분 | 코드 스타일 논쟁 제거, 일관성 확보     |
| 3    | pre-commit hook        | 5분  | 린트/포맷 위반을 커밋 시점에 자동 차단 |
| 4    | 순수 함수 단위 테스트  | 15분 | 핵심 로직의 회귀 버그 방지             |
| 5    | OpenSpec 문서화        | 20분 | AI가 아키텍처 패턴을 정확히 파악       |
| 6    | E2E 테스트             | 20분 | 전체 스택 통합 검증                    |
| 7    | 커스텀 스킬            | 15분 | 반복 작업의 품질과 속도 향상           |

---

## 전체 산출물 목록

워크숍에서 생성/수정한 파일 전체 목록:

### 1단계: 문서화

| 파일                                  | 유형 | 설명                        |
| ------------------------------------- | ---- | --------------------------- |
| `openspec/config.yaml`                | 신규 | OpenSpec 설정               |
| `openspec/specs/spec.md`              | 신규 | 프로젝트 전체 스펙          |
| `openspec/specs/api-proxy.md`         | 신규 | API 프록시 패턴 스펙        |
| `openspec/specs/auth-flow.md`         | 신규 | 인증 플로우 스펙            |
| `openspec/specs/components.md`        | 신규 | 컴포넌트 구조 스펙          |
| `openspec/specs/data-fetching.md`     | 신규 | 데이터 페칭 패턴 스펙       |
| `.claude/skills/realworld-codegen.md` | 신규 | 코드 생성 스킬              |
| `.claude/skills/realworld-review.md`  | 신규 | 코드 리뷰 스킬              |
| `CLAUDE.md`                           | 수정 | OpenSpec 참조 구조로 재구성 |

### 2단계: 테스트 구현

| 파일                                 | 유형 | 설명                            |
| ------------------------------------ | ---- | ------------------------------- |
| `vitest.config.ts`                   | 신규 | Vitest 설정                     |
| `vitest.setup.ts`                    | 신규 | 테스트 전역 설정                |
| `playwright.config.ts`               | 신규 | Playwright 설정                 |
| `.prettierrc`                        | 신규 | Prettier 규칙                   |
| `.eslintrc.json`                     | 수정 | prettier extends + 규칙 강화    |
| `tsconfig.json`                      | 수정 | exclude에 테스트 설정 파일 추가 |
| `src/__tests__/utils.test.ts`        | 신규 | cn() 유틸리티 테스트            |
| `src/__tests__/get-params.test.ts`   | 신규 | URL 파라미터 파싱 테스트        |
| `src/__tests__/api-articles.test.ts` | 신규 | Articles API 프록시 테스트      |
| `src/__tests__/api-auth.test.ts`     | 신규 | 인증 API 테스트                 |
| `e2e/auth.spec.ts`                   | 신규 | 인증 E2E 테스트                 |
| `e2e/articles.spec.ts`               | 신규 | 게시글 E2E 테스트               |
| `e2e/profile.spec.ts`                | 신규 | 프로필 E2E 테스트               |
| `e2e/feed.spec.ts`                   | 신규 | 피드/태그 E2E 테스트            |

### 3단계: CI/CD 구축

| 파일                 | 유형 | 설명                                    |
| -------------------- | ---- | --------------------------------------- |
| `.husky/pre-commit`  | 신규 | lint-staged 실행 hook                   |
| `.husky/pre-push`    | 신규 | test + build 실행 hook                  |
| `.lintstagedrc.json` | 신규 | lint-staged 규칙                        |
| `Makefile`           | 신규 | 통합 워크플로우 명령어                  |
| `package.json`       | 수정 | scripts 추가 (test, format, prepare 등) |

### 마무리

| 파일                                | 유형 | 설명                         |
| ----------------------------------- | ---- | ---------------------------- |
| `migration-plan.md`                 | 신규 | 바이브 코딩 전환 계획서      |
| `docs/vibe-coding-adoption-plan.md` | 기존 | 인터뷰 기반 작업 계획 (입력) |
