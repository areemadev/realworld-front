# 바이브 코딩 전환 계획서

> 이 문서는 RealWorld Front (Next.js 14) 프로젝트에 바이브 코딩 인프라를 구축한 실제 경험을 바탕으로 작성되었습니다.
> 워크숍 참가자가 자신의 프로젝트에 동일한 과정을 적용할 수 있도록, 구체적인 명령어와 프롬프트를 포함합니다.

---

## 1. 프로젝트 현황 진단

### 대상 프로젝트

| 항목      | 내용                                                         |
| --------- | ------------------------------------------------------------ |
| 프로젝트  | Next.js 14 RealWorld (Conduit) — Medium.com 클론             |
| 기술 스택 | TypeScript 5.5, Tailwind CSS, shadcn/ui, iron-session, axios |
| 아키텍처  | 2계층 API 프록시 (Client → Next.js API Route → External API) |

### 전환 전 (Before)

| 영역      | 상태                                                            |
| --------- | --------------------------------------------------------------- |
| 문서화    | CLAUDE.md에 인라인으로 아키텍처 설명. 구조화되지 않은 단일 파일 |
| 테스트    | 테스트 프레임워크 없음. `npm run test` 스크립트 없음            |
| 포매팅    | Prettier 없음. ESLint 기본 설정만 존재                          |
| Git Hooks | 없음. 커밋/푸시 시 품질 검증 없음                               |
| 스킬      | Claude Code 커스텀 스킬 없음                                    |

### 전환 후 (After)

| 영역      | 상태                                                               |
| --------- | ------------------------------------------------------------------ |
| 문서화    | OpenSpec 5개 스펙 문서 + CLAUDE.md 재구성 + 프로젝트 전용 스킬 2개 |
| 테스트    | Vitest 단위 테스트 4개 파일 + Playwright E2E 4개 시나리오          |
| 포매팅    | Prettier + ESLint 강화 (`eslint-config-prettier` 통합)             |
| Git Hooks | Husky pre-commit (lint-staged) + pre-push (test + build)           |
| 빌드 통합 | Makefile로 전체 워크플로우 통합 (`make check`)                     |

### 자기 프로젝트에 적용할 때

진단 프롬프트를 Claude Code에 입력하여 현황을 파악하세요:

> **프롬프트:**
>
> 이 프로젝트의 현재 상태를 진단해줘.
> 다음 항목을 확인해줘: 테스트 유무, 린트/포매팅 설정, Git hooks, CI/CD, 문서화 수준.
> 결과를 표로 정리해줘.

---

## 2. 전환 로드맵

### Phase 1: 문서화 (OpenSpec + CLAUDE.md + Skills)

**소요 시간**: 약 30~40분

#### 수행한 작업

1. **OpenSpec으로 프로젝트 스펙 문서화** — 기존 코드를 분석하여 5개 스펙 문서 생성
2. **프로젝트 전용 스킬 생성** — 코드 생성 스킬, 코드 리뷰 스킬
3. **CLAUDE.md 재구성** — OpenSpec을 참조하는 경량 구조로 재작성

#### 산출물

```
openspec/specs/
├── spec.md              # 프로젝트 전체 스펙 (기술 스택, 디렉토리 구조, 환경 변수)
├── api-proxy.md         # 2계층 API 프록시 패턴, 전체 API Route 맵
├── auth-flow.md         # iron-session 인증 플로우, 세션 구조
├── components.md        # Server/Client 컴포넌트 분류, 도메인별 맵
└── data-fetching.md     # 데이터 페칭 3가지 패턴

.claude/skills/
├── realworld-codegen.md # 코드 생성 가이드 (API Route, Server Action, 컴포넌트 템플릿)
└── realworld-review.md  # 코드 리뷰 체크리스트 (프록시 패턴, 인증, 컨벤션)

CLAUDE.md                # OpenSpec 참조 구조로 재구성
```

#### 단계별 가이드

**Step 1: OpenSpec 초기화**

> **프롬프트:**
>
> 이 프로젝트의 아키텍처를 분석해서 OpenSpec 형식으로 문서화해줘.
> `openspec/specs/` 디렉토리에 다음 문서를 생성해줘:
>
> 1. spec.md — 프로젝트 전체 스펙 (기술 스택, 디렉토리 구조, 환경 변수)
> 2. 프로젝트의 핵심 아키텍처 패턴별로 별도 문서 (예: API 패턴, 인증, 데이터 흐름)
>
> 실제 코드를 분석해서 작성해줘. 추측하지 말고.

**Step 2: 프로젝트 전용 스킬 생성**

> **프롬프트:**
>
> 이 프로젝트의 코드 컨벤션을 분석해서 Claude Code 스킬 2개를 만들어줘:
>
> 1. `.claude/skills/codegen.md` — 이 프로젝트 스타일로 새 코드를 생성하기 위한 템플릿과 규칙
> 2. `.claude/skills/review.md` — 아키텍처 규칙 위반을 감지하는 코드 리뷰 체크리스트
>
> 실제 코드 패턴에서 추출해줘.

**Step 3: CLAUDE.md 재구성**

> **프롬프트:**
>
> CLAUDE.md를 재구성해줘.
>
> - 상세 아키텍처 설명은 openspec/specs/로 이동했으니 링크만 남겨줘
> - Commands, Environment Variables, Key Conventions, Skills 섹션은 유지
> - 중복을 제거하고 간결하게

#### 자기 프로젝트 커스터마이징 포인트

- OpenSpec 스펙 문서의 **개수와 주제**는 프로젝트 아키텍처에 따라 달라집니다
- 스킬은 프로젝트에서 **반복적으로 수행하는 작업** 기준으로 만드세요 (코드 생성, 리뷰, 마이그레이션 등)
- CLAUDE.md는 **Claude Code가 가장 먼저 읽는 파일**이므로, 핵심 컨벤션만 담고 상세는 참조 링크로 연결하세요

#### 체크리스트

- [ ] `openspec/specs/` 디렉토리에 프로젝트 스펙 문서 생성
- [ ] `.claude/skills/`에 최소 1개 프로젝트 전용 스킬 생성
- [ ] CLAUDE.md가 OpenSpec을 참조하는 구조로 재구성됨
- [ ] 스킬에 실제 코드 패턴이 반영됨 (추상적이지 않고 구체적)

---

### Phase 2: 테스트 인프라 구축 (Vitest + Playwright)

**소요 시간**: 약 40~50분

#### 수행한 작업

1. **Vitest 설치 및 설정** — 단위 테스트 프레임워크
2. **Playwright 설치 및 설정** — E2E 테스트 프레임워크
3. **단위 테스트 작성** — 유틸리티, 파라미터 파싱, API Route 프록시 로직, 인증 로직
4. **E2E 테스트 작성** — 인증, 게시글, 프로필, 피드/태그 시나리오
5. **Prettier + ESLint 강화** — 코드 포매팅 통일

#### 왜 Vitest인가 (Jest 대신)

- Next.js 14 + TypeScript 환경에서 **설정이 간단** (ESM 네이티브 지원)
- `@vitejs/plugin-react`로 React 컴포넌트 테스트 지원
- Jest 대비 **실행 속도가 빠름**
- Path alias (`@/*`) 설정이 `vitest.config.ts`에서 직접 가능

#### 산출물

```
vitest.config.ts          # Vitest 설정 (jsdom, path alias, setup file)
vitest.setup.ts           # @testing-library/jest-dom import
playwright.config.ts      # Playwright 설정 (chromium, webServer)
.prettierrc               # Prettier 규칙
.eslintrc.json            # ESLint 강화 (prettier 통합)

src/__tests__/
├── utils.test.ts         # cn() 유틸리티 테스트 (9개 케이스)
├── get-params.test.ts    # URL 파라미터 파싱 테스트
├── api-articles.test.ts  # Articles API 프록시 로직 테스트
└── api-auth.test.ts      # 인증 API 테스트

e2e/
├── auth.spec.ts          # 로그인/회원가입 플로우
├── articles.spec.ts      # 게시글 CRUD
├── profile.spec.ts       # 프로필 조회
└── feed.spec.ts          # 피드, 태그, 페이지네이션
```

#### 단계별 가이드

**Step 1: Vitest 설치 및 설정**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

> **프롬프트:**
>
> Vitest를 설정해줘.
>
> - `vitest.config.ts` 생성 (jsdom 환경, `@/*` path alias, setup file 연결)
> - `vitest.setup.ts` 생성 (@testing-library/jest-dom import)
> - `package.json`에 test 스크립트 추가: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`

실제 생성된 `vitest.config.ts`:

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

**Step 2: Playwright 설치 및 설정**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

> **프롬프트:**
>
> Playwright를 설정해줘.
>
> - `playwright.config.ts` 생성 (chromium만, baseURL은 localhost:3000, webServer로 dev 서버 자동 시작)
> - `package.json`에 `"test:e2e": "playwright test"` 스크립트 추가

**Step 3: 단위 테스트 작성**

> **프롬프트:**
>
> `src/__tests__/` 디렉토리에 단위 테스트를 작성해줘.
> 핵심 경로 위주로:
>
> 1. 유틸리티 함수 (utils.ts의 cn 헬퍼)
> 2. URL 파라미터 파싱 (get-params.ts)
> 3. API Route의 프록시 로직 (articles, auth)
>
> 실제 코드를 읽고 동작을 반영해서 작성해줘. axios는 모킹해줘.

**Step 4: E2E 테스트 작성**

> **프롬프트:**
>
> `e2e/` 디렉토리에 Playwright E2E 테스트를 작성해줘.
> 핵심 사용자 시나리오 4개:
>
> 1. 인증 (로그인/회원가입 페이지 렌더링, 폼 제출)
> 2. 게시글 (목록 조회, 상세 페이지)
> 3. 프로필 (프로필 페이지 렌더링)
> 4. 피드 & 태그 (글로벌 피드, 태그 필터링, 페이지네이션)
>
> 외부 API에 의존하지 않도록, 페이지 렌더링과 UI 요소 존재 확인 위주로 작성해줘.

**Step 5: Prettier + ESLint 강화**

```bash
npm install -D prettier eslint-config-prettier
```

> **프롬프트:**
>
> Prettier와 ESLint를 설정해줘.
>
> - `.prettierrc` 생성 (semi: true, singleQuote: false, tabWidth: 2, trailingComma: all, printWidth: 100)
> - `.eslintrc.json`에 prettier extends 추가, 유용한 규칙 추가 (no-unused-vars warn, no-console warn, prefer-const, eqeqeq)
> - `package.json`에 `"format": "prettier --write ."`, `"format:check": "prettier --check ."` 스크립트 추가

#### 핵심 전략: 핵심 경로 집중

모든 코드를 테스트하려 하지 마세요. **핵심 사용자 경로**(Critical Path)에 집중하세요:

1. **유틸리티 함수** — 순수 함수라 테스트하기 쉽고 ROI가 높음
2. **API 프록시 로직** — 프로젝트의 핵심 아키텍처 패턴
3. **인증 플로우** — 가장 중요한 사용자 경로
4. **메인 페이지 렌더링** — E2E로 전체 스택 검증

#### 자기 프로젝트 커스터마이징 포인트

- 테스트 프레임워크 선택: React 프로젝트는 **Vitest**, Node.js 백엔드는 **Jest** 또는 **Vitest** 모두 가능
- E2E 도구: **Playwright** 추천 (Cypress 대비 빠르고 설정이 간단)
- 테스트 대상 선정: 프로젝트에서 **가장 자주 깨지는 부분**, **가장 중요한 비즈니스 로직** 우선

#### 체크리스트

- [ ] Vitest 설치 및 `vitest.config.ts` 생성
- [ ] `vitest.setup.ts` 생성 (testing-library 연결)
- [ ] Playwright 설치 및 `playwright.config.ts` 생성
- [ ] `src/__tests__/`에 최소 2개 단위 테스트 파일
- [ ] `e2e/`에 최소 2개 E2E 테스트 시나리오
- [ ] `npm run test` 통과
- [ ] `.prettierrc` 생성
- [ ] `.eslintrc.json`에 prettier 통합
- [ ] `npm run lint` 에러 0
- [ ] `npm run format:check` 에러 0

---

### Phase 3: 품질 게이트 (Husky + lint-staged + Makefile)

**소요 시간**: 약 15~20분

#### 수행한 작업

1. **Husky + lint-staged 설치** — Git hook 자동화
2. **pre-commit hook** — 커밋 시 변경 파일에 ESLint + Prettier 자동 적용
3. **pre-push hook** — 푸시 시 단위 테스트 + 빌드 검증
4. **Makefile** — 전체 워크플로우 통합 명령어

#### Hook 흐름도

```
git commit
  └─→ .husky/pre-commit
        └─→ npx lint-staged
              ├─→ *.{ts,tsx} → eslint --fix → prettier --write
              └─→ *.{json,md,css} → prettier --write
        ✅ 통과 → 커밋 완료
        ❌ 실패 → 커밋 차단 (린트 에러 수정 필요)

git push
  └─→ .husky/pre-push
        ├─→ npm run test      (Vitest 단위 테스트)
        └─→ npm run build     (Next.js 프로덕션 빌드)
        ✅ 통과 → 푸시 완료
        ❌ 실패 → 푸시 차단 (테스트/빌드 에러 수정 필요)
```

#### 산출물

```
.husky/
├── pre-commit            # npx lint-staged
└── pre-push              # npm run test && npm run build

.lintstagedrc.json        # lint-staged 규칙
Makefile                  # 통합 워크플로우 명령어
```

실제 `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

실제 Makefile 주요 타겟:

| 명령어          | 동작                                             |
| --------------- | ------------------------------------------------ |
| `make dev`      | 개발 서버 실행                                   |
| `make setup`    | npm install + Playwright 브라우저 설치           |
| `make lint`     | ESLint 검사                                      |
| `make format`   | Prettier 포맷팅 적용                             |
| `make test`     | 단위 테스트 (Vitest)                             |
| `make test-e2e` | E2E 테스트 (Playwright)                          |
| `make build`    | 프로덕션 빌드                                    |
| `make check`    | **lint + format-check + test + build** 순차 실행 |

#### 단계별 가이드

**Step 1: Husky 설치**

```bash
npm install -D husky lint-staged
npx husky init
```

**Step 2: lint-staged 설정**

> **프롬프트:**
>
> lint-staged를 설정해줘.
>
> - `.lintstagedrc.json` 생성
> - TypeScript 파일: eslint --fix + prettier --write
> - JSON, MD, CSS 파일: prettier --write
> - `package.json`의 prepare 스크립트를 `"husky"`로 설정

**Step 3: Git Hooks 설정**

> **프롬프트:**
>
> Husky Git hooks를 설정해줘.
>
> - `.husky/pre-commit`: lint-staged 실행
> - `.husky/pre-push`: npm run test && npm run build (테스트와 빌드 모두 통과해야 push 가능)

**Step 4: Makefile 생성**

> **프롬프트:**
>
> Makefile을 생성해줘. 다음 타겟 포함:
>
> - dev, setup, lint, format, format-check, test, test-e2e, test-all, build, check, help
> - `make check`는 lint + format-check + test + build를 순차 실행
> - `make help`는 사용 가능한 명령어 목록을 출력

#### 자기 프로젝트 커스터마이징 포인트

- **pre-commit**: 프로젝트에 맞는 린트/포맷 도구로 교체 (예: Go 프로젝트면 `gofmt`, Python이면 `black`)
- **pre-push**: 테스트 실행 시간이 길면 핵심 테스트만 실행하도록 조정
- **Makefile**: 프로젝트에 필요한 타겟 추가 (예: `make migrate`, `make seed`, `make docker`)

#### 체크리스트

- [ ] Husky + lint-staged 설치
- [ ] `.lintstagedrc.json` 생성
- [ ] `.husky/pre-commit` — lint-staged 실행
- [ ] `.husky/pre-push` — test + build 실행
- [ ] `package.json`에 `"prepare": "husky"` 스크립트
- [ ] `Makefile` 생성 (`make check` 동작 확인)
- [ ] 테스트 커밋으로 pre-commit hook 동작 확인
- [ ] `make check` 전체 파이프라인 통과

---

## 3. 도구 설정 가이드

### 패키지 설치 (한 번에)

```bash
# 테스트 프레임워크
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E 테스트
npm install -D @playwright/test
npx playwright install chromium

# 포매팅 & 린트
npm install -D prettier eslint-config-prettier

# Git Hooks
npm install -D husky lint-staged
npx husky init
```

### 설정 파일 위치

| 파일                   | 용도                                |
| ---------------------- | ----------------------------------- |
| `vitest.config.ts`     | Vitest 설정 (환경, alias, setup)    |
| `vitest.setup.ts`      | 테스트 전역 설정 (jest-dom)         |
| `playwright.config.ts` | Playwright 설정 (브라우저, baseURL) |
| `.prettierrc`          | Prettier 포맷팅 규칙                |
| `.eslintrc.json`       | ESLint 규칙 (prettier 확장 포함)    |
| `.lintstagedrc.json`   | lint-staged 파일 매칭 규칙          |
| `.husky/pre-commit`    | 커밋 전 hook (lint-staged)          |
| `.husky/pre-push`      | 푸시 전 hook (test + build)         |
| `Makefile`             | 통합 워크플로우 명령어              |

### npm scripts 전체

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

---

## 4. 프롬프트 레시피

### Phase 1: 문서화

#### 프로젝트 분석 및 스펙 생성

```
이 프로젝트의 전체 아키텍처를 분석해서 openspec/specs/ 디렉토리에 문서화해줘.
실제 코드를 읽고, 다음 관점에서 정리해줘:
- 기술 스택과 디렉토리 구조
- 핵심 아키텍처 패턴 (각각 별도 문서)
- 데이터 흐름
- 인증/보안 구조

모든 내용은 실제 코드에서 추출해줘. 추측하지 마.
```

#### CLAUDE.md 최적화

```
CLAUDE.md를 재구성해줘.
openspec/specs/에 상세 문서가 있으니, CLAUDE.md는 다음만 포함해줘:
1. Project Overview (1~2줄)
2. Commands (개발, 빌드, 테스트, 린트)
3. Environment Variables
4. Architecture — openspec 문서로의 링크만
5. Key Conventions (5줄 이내 핵심 규칙)
6. Skills (스킬 파일 경로)
```

### Phase 2: 테스트

#### 단위 테스트 생성

```
src/__tests__/ 디렉토리에 단위 테스트를 작성해줘.

우선순위:
1. 순수 유틸리티 함수 (테스트하기 쉬움, ROI 높음)
2. 비즈니스 로직의 핵심 함수
3. API 프록시 로직

axios 등 외부 의존성은 vi.mock()으로 모킹해줘.
환경 변수는 vi.stubEnv()로 설정해줘.
```

#### E2E 테스트 생성

```
e2e/ 디렉토리에 Playwright E2E 테스트를 작성해줘.
핵심 사용자 시나리오만 커버:

1. 인증 페이지 렌더링 및 폼 존재 확인
2. 메인 페이지 피드 로딩
3. 네비게이션 동작

외부 API 의존을 최소화하고, UI 요소 존재 확인 위주로 작성해줘.
page.waitForLoadState('networkidle')를 적절히 활용해줘.
```

### Phase 3: 품질 게이트

#### Git Hooks + Makefile 설정

```
품질 게이트를 구축해줘:

1. Husky + lint-staged 설정
   - pre-commit: 변경 파일에 eslint --fix + prettier --write
   - pre-push: npm run test && npm run build

2. Makefile 생성
   - make check: lint + format-check + test + build 순차 실행
   - make help: 명령어 목록 출력

3. package.json scripts 정비
   - prepare: husky (npm install 시 자동 hook 설정)
```

### 범용 프롬프트

#### 프로젝트 초기 진단

```
이 프로젝트를 분석해줘.
1. 어떤 프레임워크/언어를 사용하는지
2. 테스트가 있는지, 있다면 어떤 프레임워크인지
3. CI/CD가 설정되어 있는지
4. CLAUDE.md가 있는지, 있다면 품질은 어떤지
5. 코드 품질 도구(린트, 포매팅, Git hooks)가 있는지

결과를 Before/After 표로 정리하고, 개선 우선순위를 제안해줘.
```

---

## 5. 체크리스트

참가자가 인쇄하여 따라갈 수 있는 통합 체크리스트입니다.

### Phase 1: 문서화

- [ ] `openspec/specs/` 디렉토리 생성
- [ ] 프로젝트 전체 스펙 문서 작성 (`spec.md`)
- [ ] 핵심 아키텍처 패턴별 문서 작성 (최소 2개)
- [ ] `.claude/skills/`에 코드 생성 스킬 작성
- [ ] `.claude/skills/`에 코드 리뷰 스킬 작성
- [ ] `CLAUDE.md` 재구성 (OpenSpec 참조 구조)
- [ ] 스킬이 실제 코드 패턴을 반영하는지 검증

### Phase 2: 테스트 인프라

- [ ] Vitest 설치: `npm install -D vitest @vitejs/plugin-react jsdom`
- [ ] Testing Library 설치: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`
- [ ] `vitest.config.ts` 생성 (path alias 포함)
- [ ] `vitest.setup.ts` 생성
- [ ] Playwright 설치: `npm install -D @playwright/test && npx playwright install chromium`
- [ ] `playwright.config.ts` 생성
- [ ] 유틸리티 함수 단위 테스트 작성
- [ ] 핵심 비즈니스 로직 단위 테스트 작성
- [ ] E2E 인증 시나리오 작성
- [ ] E2E 메인 기능 시나리오 작성
- [ ] Prettier 설치 및 `.prettierrc` 생성
- [ ] ESLint에 prettier 통합
- [ ] `npm run test` 통과 확인
- [ ] `npm run format:check` 통과 확인

### Phase 3: 품질 게이트

- [ ] Husky 설치: `npm install -D husky && npx husky init`
- [ ] lint-staged 설치: `npm install -D lint-staged`
- [ ] `.lintstagedrc.json` 생성
- [ ] `.husky/pre-commit` — lint-staged 실행
- [ ] `.husky/pre-push` — test + build 실행
- [ ] `package.json`에 `"prepare": "husky"` 추가
- [ ] `Makefile` 생성
- [ ] `make check` 전체 파이프라인 통과 확인
- [ ] 테스트 커밋으로 pre-commit hook 동작 확인

---

## 6. FAQ / 트러블슈팅

### Q: Vitest에서 `@/*` path alias가 인식되지 않는다

`vitest.config.ts`에 alias 설정을 추가하세요:

```typescript
test: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

### Q: Playwright 테스트 실행 시 브라우저가 없다는 에러

```bash
npx playwright install chromium
```

### Q: pre-push hook에서 빌드가 너무 오래 걸린다

pre-push에서 빌드를 제거하고 테스트만 남기세요:

```bash
# .husky/pre-push
npm run test
```

빌드 검증은 CI (GitHub Actions)에서 처리하는 것을 권장합니다.

### Q: lint-staged에서 ESLint 에러로 커밋이 안 된다

두 가지 방법:

1. **에러 수정** (권장): ESLint가 감지한 문제를 실제로 수정
2. **긴급 우회**: `git commit --no-verify` (hook 건너뛰기, 팀 합의 필요)

### Q: Vitest에서 Next.js Server Component를 테스트할 수 없다

Server Component는 단위 테스트 대상으로 적합하지 않습니다. 대신:

- **순수 로직** (유틸리티, 파라미터 파싱)은 Vitest로 단위 테스트
- **Server Component 렌더링**은 Playwright E2E로 통합 테스트

### Q: OpenSpec 문서가 코드와 동기화되지 않는다

CLAUDE.md에 다음 규칙을 추가하세요:

```
## 문서 동기화 규칙
아키텍처 변경 시 관련 openspec/specs/ 문서도 함께 업데이트할 것.
```

Claude Code에게 코드 변경 시 문서 업데이트를 함께 요청하세요:

> 이 변경사항을 openspec/specs/ 문서에도 반영해줘.

### Q: 어떤 것부터 테스트해야 할지 모르겠다

우선순위:

1. **순수 함수** — 입력/출력이 명확하고 외부 의존 없음
2. **핵심 비즈니스 로직** — 버그 발생 시 사용자 영향이 큰 부분
3. **자주 변경되는 코드** — 회귀 버그 방지

---

## 7. 다음 단계

워크숍에서 구축한 인프라를 팀 프로젝트에 확장하기 위한 액션 아이템입니다.

### 즉시 (워크숍 직후)

1. **`migration-plan.md`를 팀 프로젝트에 맞게 수정** — 기술 스택, 테스트 대상, 린트 규칙을 프로젝트에 맞게 조정
2. **팀 프로젝트에 `CLAUDE.md` 생성** — Claude Code에게 프로젝트 컨텍스트를 한 번에 전달
3. **핵심 기능 1개에 테스트 작성** — 가장 중요한 비즈니스 로직부터 시작

### 1주차

4. **OpenSpec 문서화** — 팀 프로젝트의 핵심 아키텍처 패턴을 문서화
5. **Git Hooks 설정** — pre-commit (lint + format), pre-push (test)
6. **팀원 1명과 파일럿** — 바이브 코딩 워크플로우를 소규모로 시도

### 2주차 이후

7. **GitHub Actions CI 추가** — push/PR 시 자동 lint + test + build
8. **테스트 커버리지 확장** — 핵심 경로에서 전체 코드베이스로 점진적 확장
9. **팀 전체 도입** — 파일럿 결과를 공유하고 팀 표준으로 채택

### GitHub Actions CI 예시

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test
      - run: npm run build
```

### 팀 도입 전략

| 단계   | 활동                                    | 기간 |
| ------ | --------------------------------------- | ---- |
| 파일럿 | 1~2명이 사이드 프로젝트에 적용          | 1주  |
| 검증   | 효과 측정 (생산성, 버그 감소) + 팀 공유 | 1주  |
| 확산   | CLAUDE.md + Git Hooks를 팀 표준으로     | 2주  |
| 정착   | OpenSpec 문서화 + 커스텀 스킬 팀 공유   | 지속 |
