# Vibe Coding 도입 작업 계획서

> RealWorld Front (Next.js 14) 프로젝트에 바이브 코딩 인프라를 구축하기 위한 4개 에픽 실행 계획

## 인터뷰 결과 요약

| 에픽        | 핵심 결정                                                                       |
| ----------- | ------------------------------------------------------------------------------- |
| 문서화      | 전체 스펙 OpenSpec 문서화 + 프로젝트 전용 스킬 + CLAUDE.md OpenSpec 기반 재구성 |
| 테스트      | Vitest + Playwright, 핵심 경로 집중, ESLint 강화 + Prettier                     |
| CI/CD       | pre-commit + pre-push, Husky + lint-staged, 포괄적 Makefile 통합                |
| 전환 계획서 | 워크숍 참가자 대상, 에픽 1~3 반영, 에픽 1~3 완료 후 생성                        |

---

## Epic 1: 문서화 — OpenSpec + 스킬 생성

**목표**: 프로젝트 전체 아키텍처를 OpenSpec으로 체계화하고, Claude Code가 활용할 프로젝트 전용 스킬을 생성한다.

### 1.1 OpenSpec 프로젝트 스펙 문서화

| 태스크                       | 설명                                                                | 산출물                      |
| ---------------------------- | ------------------------------------------------------------------- | --------------------------- |
| 1.1.1 OpenSpec 초기화        | `/openspec-propose`로 프로젝트 스펙 초기 구조 생성                  | `openspec/` 디렉토리        |
| 1.1.2 API 프록시 레이어 스펙 | Two-Layer API Proxy 패턴 문서화. 모든 API 라우트 매핑 정리          | `openspec/api-proxy.md`     |
| 1.1.3 인증 플로우 스펙       | iron-session 기반 인증 흐름, 세션 구조, 쿠키 설정 문서화            | `openspec/auth-flow.md`     |
| 1.1.4 컴포넌트 구조 스펙     | 도메인별 컴포넌트 트리, 데이터 흐름, Server/Client 구분 문서화      | `openspec/components.md`    |
| 1.1.5 데이터 페칭 패턴 스펙  | Server Component → getSession, Client → axios → API route 패턴 정리 | `openspec/data-fetching.md` |

### 1.2 프로젝트 전용 스킬 생성

| 태스크               | 설명                                                                                | 산출물                                |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| 1.2.1 코드 생성 스킬 | 이 프로젝트의 컨벤션(API route, Server Action, 컴포넌트 패턴)에 맞는 코드 생성 스킬 | `.claude/skills/realworld-codegen.md` |
| 1.2.2 코드 리뷰 스킬 | 프로젝트 아키텍처 규칙(프록시 패턴, 인증 흐름 등) 준수 여부를 검사하는 리뷰 스킬    | `.claude/skills/realworld-review.md`  |

### 1.3 CLAUDE.md OpenSpec 기반 재구성

| 태스크                                 | 설명                                                                       | 산출물                      |
| -------------------------------------- | -------------------------------------------------------------------------- | --------------------------- |
| 1.3.1 CLAUDE.md 재작성                 | OpenSpec 스펙을 참조하는 구조로 CLAUDE.md를 재구성. 중복 제거, 정확도 향상 | `CLAUDE.md` (개선)          |
| 1.3.2 OpenSpec ↔ CLAUDE.md 동기화 규칙 | 스펙 변경 시 CLAUDE.md 업데이트 가이드라인 수립                            | `openspec/README.md`에 포함 |

### 완료 기준

- [ ] OpenSpec 디렉토리에 5개 스펙 문서 존재
- [ ] 2개 프로젝트 전용 스킬이 동작 확인됨
- [ ] CLAUDE.md가 OpenSpec을 참조하는 구조로 재구성됨

---

## Epic 2: 테스트 구현

**목표**: Vitest(단위) + Playwright(E2E) 테스트 인프라를 구축하고, 핵심 사용자 경로를 커버한다.

### 2.1 테스트 인프라 셋업

| 태스크                          | 설명                                                                   | 산출물        |
| ------------------------------- | ---------------------------------------------------------------------- | ------------- |
| 2.1.1 Vitest 설치 및 설정       | vitest, @testing-library/react, jsdom 등 설치. `vitest.config.ts` 작성 | 설정 파일들   |
| 2.1.2 Playwright 설치 및 설정   | @playwright/test 설치. `playwright.config.ts` 작성. 브라우저 설치      | 설정 파일들   |
| 2.1.3 테스트 디렉토리 구조 수립 | `__tests__/` (단위), `e2e/` (E2E) 구조 확립                            | 디렉토리 구조 |

### 2.2 단위 테스트 (Vitest)

| 태스크                         | 설명                                                       | 대상             |
| ------------------------------ | ---------------------------------------------------------- | ---------------- |
| 2.2.1 유틸리티 함수 테스트     | `utils.ts` (cn 헬퍼), `get-params.ts` (검색 파라미터 파싱) | `src/lib/`       |
| 2.2.2 Server Actions 테스트    | `actions.ts`의 follow, favoriteArticle, deleteArticle 등   | `src/actions.ts` |
| 2.2.3 API Route Handler 테스트 | 주요 API 라우트의 요청/응답 프록시 로직                    | `src/app/api/`   |

### 2.3 E2E 테스트 (Playwright)

| 태스크              | 설명                                 | 시나리오  |
| ------------------- | ------------------------------------ | --------- |
| 2.3.1 인증 플로우   | 회원가입 → 로그인 → 로그아웃         | 핵심 경로 |
| 2.3.2 글 CRUD       | 글 작성 → 조회 → 수정 → 삭제         | 핵심 경로 |
| 2.3.3 프로필 & 소셜 | 프로필 조회, 팔로우/언팔로우, 좋아요 | 핵심 경로 |
| 2.3.4 피드 & 태그   | 글로벌 피드, 내 피드, 태그 필터링    | 보조 경로 |

### 2.4 린트 & 포매팅 강화

| 태스크                      | 설명                                                      | 산출물               |
| --------------------------- | --------------------------------------------------------- | -------------------- |
| 2.4.1 Prettier 설치 및 설정 | prettier, eslint-config-prettier 설치. `.prettierrc` 작성 | 설정 파일            |
| 2.4.2 ESLint 규칙 강화      | @typescript-eslint 엄격 모드, import 순서 규칙 등 추가    | `.eslintrc` 업데이트 |
| 2.4.3 전체 코드 포매팅 적용 | Prettier로 전체 코드베이스 일괄 포매팅                    | 포매팅된 소스        |

### 완료 기준

- [ ] `npm run test` (Vitest) 성공
- [ ] `npm run test:e2e` (Playwright) 핵심 경로 4개 시나리오 통과
- [ ] `npm run lint` 에러 0
- [ ] `npm run format:check` 에러 0

---

## Epic 3: CI/CD 파이프라인

**목표**: Husky + lint-staged로 Git hook을 구성하고, Makefile로 전체 워크플로우를 통합한다.

### 3.1 Husky + lint-staged 설정

| 태스크                 | 설명                                                  | 산출물              |
| ---------------------- | ----------------------------------------------------- | ------------------- |
| 3.1.1 Husky 설치       | husky 설치, `npx husky init`, `.husky/` 디렉토리 생성 | `.husky/`           |
| 3.1.2 lint-staged 설정 | 변경된 파일에만 ESLint + Prettier 실행하도록 설정     | `.lintstagedrc`     |
| 3.1.3 pre-commit hook  | lint-staged 실행 → 린트/포매팅 검사                   | `.husky/pre-commit` |
| 3.1.4 pre-push hook    | 단위 테스트 + 빌드 검증 실행                          | `.husky/pre-push`   |

### 3.2 Makefile 통합

| 태스크            | 명령어                       | 동작                                             |
| ----------------- | ---------------------------- | ------------------------------------------------ |
| 3.2.1 개발 명령어 | `make dev`                   | Next.js 개발 서버 시작                           |
| 3.2.2 린트/포맷   | `make lint`, `make format`   | ESLint 실행, Prettier 실행                       |
| 3.2.3 테스트      | `make test`, `make test:e2e` | Vitest 실행, Playwright 실행                     |
| 3.2.4 빌드        | `make build`                 | 프로덕션 빌드                                    |
| 3.2.5 전체 검증   | `make check`                 | lint + format:check + test + build 순차 실행     |
| 3.2.6 셋업        | `make setup`                 | npm install + husky install + playwright install |

### 3.3 package.json scripts 정비

| 태스크                     | 설명                                                  |
| -------------------------- | ----------------------------------------------------- |
| 3.3.1 테스트 스크립트 추가 | `test`, `test:e2e`, `test:coverage` 스크립트          |
| 3.3.2 포매팅 스크립트 추가 | `format`, `format:check` 스크립트                     |
| 3.3.3 prepare 스크립트     | `"prepare": "husky"` 로 npm install 시 자동 hook 설정 |

### 완료 기준

- [ ] `git commit` 시 lint-staged가 자동 실행됨
- [ ] `git push` 시 테스트+빌드 검증이 실행됨
- [ ] `make check` 가 전체 파이프라인을 순차 실행함
- [ ] 새 클론 후 `make setup` 으로 전체 환경 구성 가능

---

## Epic 4: 전환 계획서

**목표**: 에픽 1~3의 결과를 토대로, 워크숍 참가자가 자신의 프로젝트에 적용할 수 있는 전환 계획 템플릿을 생성한다.

### 4.1 전환 계획서 생성

| 태스크                        | 설명                                                                   | 산출물                     |
| ----------------------------- | ---------------------------------------------------------------------- | -------------------------- |
| 4.1.1 generate-plan 스킬 준비 | `reference/generate-plan/` 스킬의 입력 요건 확인 및 컨텍스트 준비      | 입력 데이터                |
| 4.1.2 계획서 생성 실행        | 에픽 1~3 결과 + 프로젝트 컨텍스트를 입력으로 generate-plan 스킬 실행   | `migration-plan.md`        |
| 4.1.3 계획서 검토 및 보완     | 워크숍 참가자 관점에서 실행 가능성 검토. 단계별 체크리스트 형태로 보완 | `migration-plan.md` (최종) |

### 계획서 포함 내용 (예상)

1. **현황 진단** — 프로젝트 분석 결과 (문서화 수준, 테스트 커버리지, CI/CD 상태)
2. **문서화 전환** — OpenSpec 도입 단계, CLAUDE.md 재구성 방법, 스킬 생성 가이드
3. **테스트 인프라 구축** — Vitest + Playwright 설정, 핵심 경로 우선 전략
4. **품질 게이트 구축** — Husky + lint-staged + Makefile 구성법
5. **단계별 체크리스트** — 참가자가 자기 프로젝트에 바로 적용할 수 있는 실행 목록

### 완료 기준

- [ ] `migration-plan.md` 파일 생성 완료
- [ ] 워크숍 참가자가 독립적으로 실행 가능한 수준의 상세도
- [ ] 에픽 1~3의 실제 경험이 반영된 구체적 가이드

---

## 실행 순서 및 의존성

```
Epic 1: 문서화          ─────────────────────────────┐
  1.1 OpenSpec 스펙                                   │
  1.2 프로젝트 스킬                                    │
  1.3 CLAUDE.md 재구성                                │
                                                      │
Epic 2: 테스트 구현      ─────────────────────────────┤
  2.1 인프라 셋업                                      │
  2.2 단위 테스트 (Vitest)                             │
  2.3 E2E 테스트 (Playwright)                         │
  2.4 린트 & 포매팅 강화                               │
                                                      │
Epic 3: CI/CD           ──── (Epic 2 완료 후) ────────┤
  3.1 Husky + lint-staged                             │
  3.2 Makefile 통합                                    │
  3.3 package.json 정비                               │
                                                      │
Epic 4: 전환 계획서      ──── (Epic 1~3 완료 후) ──────┘
  4.1 generate-plan 스킬로 migration-plan.md 생성
```

- **Epic 1, 2**는 병렬 진행 가능
- **Epic 3**은 Epic 2(테스트/린트 설정) 완료 후 진행
- **Epic 4**는 모든 에픽 완료 후 최종 생성

---

## 기술 스택 요약

| 영역        | 도구                            |
| ----------- | ------------------------------- |
| 스펙 문서화 | OpenSpec                        |
| 스킬        | Claude Code Custom Skills       |
| 단위 테스트 | Vitest + @testing-library/react |
| E2E 테스트  | Playwright                      |
| 린트        | ESLint (강화)                   |
| 포매팅      | Prettier                        |
| Git Hooks   | Husky + lint-staged             |
| 빌드 통합   | Makefile                        |
| 전환 계획   | generate-plan 스킬              |
