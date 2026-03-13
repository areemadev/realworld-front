# RealWorld Conduit - 코드 리뷰 스킬

이 프로젝트의 아키텍처 규칙과 컨벤션을 기준으로 코드를 리뷰한다.

## 필수 아키텍처 규칙

### 1. 프록시 패턴 준수

**위반 감지**: Client Component에서 `BASE_URL` 또는 외부 API URL을 직접 호출하는 코드

```typescript
// BAD - 클라이언트에서 외부 API 직접 호출
"use client";
axios.get(`https://api.realworld.io/api/articles`);

// GOOD - 내부 API Route 경유
("use client");
axios.get(`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles`);
```

**예외**: Server Action(`src/actions.ts`)은 서버에서 실행되므로 `BASE_URL` 직접 호출이 허용된다.

### 2. 인증 토큰 처리

**위반 감지**: 클라이언트에서 토큰을 localStorage/sessionStorage에 저장하는 코드

```typescript
// BAD - 클라이언트 스토리지에 토큰 저장
localStorage.setItem("token", response.data.token);

// GOOD - iron-session 쿠키에만 저장 (API Route에서 처리)
session.token = data.user.token;
await session.save();
```

**체크포인트**:

- 토큰은 iron-session 쿠키에만 저장되는가?
- Server Component는 `getSession()` -> props 전달 패턴을 따르는가?
- Client Component는 props로 전달받은 token만 사용하는가?

### 3. Server/Client 컴포넌트 경계

**위반 감지**: Server Component에서 hooks 사용, Client Component에서 `getSession()` 직접 호출

```typescript
// BAD - Server Component에서 useState
// (use client 선언 없이)
import { useState } from 'react';  // 빌드 에러

// BAD - Client Component에서 getSession() 직접 호출
'use client'
import { getSession } from "@/actions";
const session = await getSession();  // 클라이언트에서 실행 불가

// GOOD - Server Component에서 세션 조회 후 props 전달
// page.tsx (Server)
const session = await getSession();
<ChildComponent token={session.token} />
```

### 4. 데이터 변경(뮤테이션) 패턴

**체크포인트**:

- 폼 제출은 Client Component에서 axios + react-hook-form으로 처리하는가?
- 버튼 액션(팔로우, 좋아요, 삭제)은 Server Action으로 처리하는가?
- Server Action에서 `revalidatePath()`로 캐시를 무효화하는가?
- 미인증 시 `redirect('/login')`으로 리다이렉트하는가?

### 5. 응답 형식 일관성

**API Route 응답**: 항상 `{ data, status }` 형태

```typescript
// BAD - 비일관적 응답 형식
return NextResponse.json(res.data);

// GOOD - 표준 응답 형식
return NextResponse.json({ data: await res.data, status: res.status });
```

## 컨벤션 체크리스트

### API Route

- [ ] `process.env.BASE_URL`로 외부 API 호출하는가?
- [ ] Authorization 헤더를 `req.headers.get('authorization')`으로 가져오는가?
- [ ] try/catch로 에러 처리하는가?
- [ ] 에러 로그에 `console.error('API_RESOURCE_METHOD', error)` 형식을 사용하는가?
- [ ] 422, 401 등 알려진 에러 코드를 개별 처리하는가?
- [ ] 500 에러에 'Internal server error' 메시지를 반환하는가?

### Server Action

- [ ] `'use server'` 파일에 정의되어 있는가? (또는 `src/actions.ts`)
- [ ] `getSession()`으로 세션을 조회하는가?
- [ ] `session.token` 존재 여부를 확인하는가?
- [ ] 토큰이 없으면 `redirect('/login')`하는가?
- [ ] 성공 시 `revalidatePath()`로 캐시를 무효화하는가?
- [ ] 에러 로그에 `console.log('ACTION_NAME', error)` 형식을 사용하는가?

### 컴포넌트

- [ ] Client Component에 `'use client'` 선언이 있는가?
- [ ] `NEXT_PUBLIC_RELATIVE_PATH`로 내부 API를 호출하는가? (`BASE_URL` 직접 사용 금지)
- [ ] 폼에 react-hook-form + zod를 사용하는가?
- [ ] 알림에 react-hot-toast를 사용하는가?
- [ ] 조건부 클래스에 `cn()` 유틸리티를 사용하는가?
- [ ] 에러 표시에 `FormattedErrors` 컴포넌트를 사용하는가?

### 타입 안전성

- [ ] `any` 타입 사용을 최소화했는가?
- [ ] 인터페이스/타입에 `I`/`T` 접두사를 사용하는가?
- [ ] API 응답에 적절한 타입을 정의했는가?

## 보안 체크포인트

- [ ] `BASE_URL`이 서버 사이드에서만 사용되는가? (`NEXT_PUBLIC_` 접두사 없음)
- [ ] 쿠키가 `httpOnly: true`로 설정되어 있는가?
- [ ] 운영 환경에서 `secure: true`가 설정되어 있는가?
- [ ] 민감 정보(비밀번호, 토큰)가 클라이언트에 노출되지 않는가?
- [ ] API Route에서 입력 유효성 검사를 수행하는가?
