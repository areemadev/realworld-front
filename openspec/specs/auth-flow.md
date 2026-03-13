# 인증 플로우

## iron-session 설정

### 세션 데이터 구조

```typescript
// src/components/auth/interfaces/session.ts
interface ISession {
  username: string;
  email: string;
  token: string; // RealWorld API JWT 토큰
}

// src/lib/config.ts
interface ISessionData extends Partial<ISession> {
  isLoggedIn: boolean;
}
```

### 쿠키 설정

```typescript
// src/lib/config.ts
const sessionOptions: SessionOptions = {
  password: process.env.COOKIE_PASSWORD!, // 32자 이상 암호화 키
  cookieName: process.env.COOKIE_NAME!,
  cookieOptions: {
    httpOnly: true, // JavaScript 접근 차단
    secure: process.env.NODE_ENV === "production", // HTTPS only (운영)
    maxAge: 60 * 60 * 24 * 7, // 7일 유효
  },
};
```

### 기본 세션 값

```typescript
const defaultSession: ISessionData = {
  isLoggedIn: false,
};
```

## 세션 관리 함수

### `getSession()` (src/actions.ts)

모든 세션 접근의 진입점. Server Component, Server Action, API Route에서 사용한다.

```typescript
export const getSession = async () => {
  const session = await getIronSession<ISessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }
  return session;
};
```

## 인증 플로우

### 로그인 (`POST /api/login`)

```
1. 클라이언트 (LoginForm) --POST {email, password}--> /api/login
2. API Route --POST {user: {email, password}}--> BASE_URL/users/login
3. 외부 API 응답 -> {user: {email, username, token}}
4. API Route에서 세션 저장:
   - session.isLoggedIn = true
   - session.email = data.user.email
   - session.username = data.user.username
   - session.token = data.user.token
   - session.save()  -> 암호화된 HTTP-only 쿠키로 저장
5. 클라이언트에 응답 반환
```

### 회원가입 (`POST /api/register`)

```
1. 클라이언트 (SignUpForm) --POST {username, email, password}--> /api/register
2. API Route --POST {user: {email, username, password}}--> BASE_URL/users
3. 외부 API 응답 -> {user: {email, username, token}}
4. 로그인과 동일하게 세션 저장
5. 클라이언트에 응답 반환
```

### 로그아웃 (`logout` Server Action)

```typescript
export const logout = async () => {
  const session = await getSession();
  session.destroy(); // 세션 데이터 삭제 + 쿠키 무효화
  redirect("/");
};
```

`src/components/settings/Logout.tsx`에서 form action으로 호출한다.

### 사용자 정보 수정 (`PUT /api/user`)

수정 후 세션도 함께 갱신한다:

```
1. SettingForm --PUT {email, password, username, bio, imageUrl}--> /api/user
2. API Route --PUT {user: {...}}--> BASE_URL/user (Authorization 헤더 포함)
3. 응답의 새 토큰으로 세션 갱신:
   - session.email = data.user.email
   - session.username = data.user.username
   - session.token = data.user.token
   - session.save()
```

### 인증 만료 처리 (`GET /api/user`)

`GET /api/user`에서 401 응답 시 쿠키를 직접 삭제하고 로그인 페이지로 리다이렉트한다:

```typescript
if (error.response.status == 401) {
  cookieStore.delete(process.env.COOKIE_NAME as string);
  redirect("/login");
}
```

## 인증 상태 사용 패턴

### Server Component에서

```typescript
// 페이지 컴포넌트에서 세션 조회 후 자식에게 전달
const session = await getSession();
<ArticleList token={session.token as string} />
```

### Client Component에서

클라이언트 컴포넌트는 세션에 직접 접근하지 못한다. props로 전달받은 `token`을 axios Authorization 헤더에 포함시킨다:

```typescript
axios.get(`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/...`, {
  headers: { Authorization: token ? `Token ${token}` : undefined },
});
```

### Server Action에서

Server Action은 `getSession()`으로 직접 세션에 접근하여 토큰을 사용한다:

```typescript
const session = await getSession();
if (session.token) {
  await axios.post(
    url,
    {},
    {
      headers: { Authorization: `Token ${session.token}` },
    },
  );
} else {
  redirect("/login");
}
```
