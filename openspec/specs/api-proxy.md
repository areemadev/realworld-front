# API 프록시 패턴

## 2계층 프록시 구조

클라이언트 컴포넌트는 외부 API를 직접 호출하지 않는다. 모든 요청은 Next.js API Route를 경유한다.

```
[Client Component] --axios--> [Next.js API Route] --axios--> [External RealWorld API]
  (브라우저)           /api/*     (서버, Route Handler)   BASE_URL    (api.realworld.io)
```

### 설계 목적

- 외부 API URL(`BASE_URL`)을 서버 사이드에 은닉
- 인증 토큰을 서버에서만 처리 (iron-session 쿠키 기반)
- 요청/응답 형식을 중간에서 정규화

### 공통 응답 형식

모든 API Route는 다음 형식으로 응답한다:

```typescript
NextResponse.json({ data: responseData, status: httpStatus });
```

### 인증 토큰 전달 방식

- **인증 불필요 라우트** (`/api/tags`): 토큰 없이 외부 API 호출
- **인증 선택 라우트** (`/api/articles`, `/api/profiles/[username]`): 클라이언트가 `Authorization` 헤더로 전달한 토큰을 그대로 포워딩
- **인증 필수 라우트** (`/api/articles/feed`, `/api/user` PUT): 토큰이 없으면 401 에러 또는 로그인 리다이렉트
- **세션 기반 라우트** (`/api/login`, `/api/register`, `/api/user` PUT): 응답에서 받은 토큰을 iron-session에 저장

## 전체 API Route 맵

### 인증 (Auth)

| 메서드 | Next.js 경로    | 외부 API 경로       | 설명                |
| ------ | --------------- | ------------------- | ------------------- |
| POST   | `/api/login`    | `POST /users/login` | 로그인, 세션 저장   |
| POST   | `/api/register` | `POST /users`       | 회원가입, 세션 저장 |

### 게시글 (Articles)

| 메서드 | Next.js 경로           | 외부 API 경로         | 설명                                                      |
| ------ | ---------------------- | --------------------- | --------------------------------------------------------- |
| GET    | `/api/articles`        | `GET /articles`       | 게시글 목록 (필터: tag, limit, offset, author, favorited) |
| POST   | `/api/articles`        | `POST /articles`      | 게시글 생성 (인증 필수)                                   |
| GET    | `/api/articles/feed`   | `GET /articles/feed`  | 팔로우 피드 (인증 필수, 동일 필터 지원)                   |
| GET    | `/api/articles/[slug]` | `GET /articles/:slug` | 단일 게시글 조회                                          |
| PUT    | `/api/articles/[slug]` | `PUT /articles/:slug` | 게시글 수정 (인증 필수)                                   |

### 댓글 (Comments)

| 메서드 | Next.js 경로                    | 외부 API 경로                   | 설명                  |
| ------ | ------------------------------- | ------------------------------- | --------------------- |
| GET    | `/api/articles/[slug]/comments` | `GET /articles/:slug/comments`  | 댓글 목록             |
| POST   | `/api/articles/[slug]/comments` | `POST /articles/:slug/comments` | 댓글 작성 (인증 필수) |

### 프로필 (Profiles)

| 메서드 | Next.js 경로               | 외부 API 경로             | 설명        |
| ------ | -------------------------- | ------------------------- | ----------- |
| GET    | `/api/profiles/[username]` | `GET /profiles/:username` | 프로필 조회 |

### 사용자 (User)

| 메서드 | Next.js 경로 | 외부 API 경로 | 설명                                     |
| ------ | ------------ | ------------- | ---------------------------------------- |
| GET    | `/api/user`  | `GET /user`   | 현재 사용자 정보 (인증 필수)             |
| PUT    | `/api/user`  | `PUT /user`   | 사용자 정보 수정 + 세션 갱신 (인증 필수) |

### 태그 (Tags)

| 메서드 | Next.js 경로 | 외부 API 경로 | 설명                         |
| ------ | ------------ | ------------- | ---------------------------- |
| GET    | `/api/tags`  | `GET /tags`   | 인기 태그 목록 (인증 불필요) |

## Server Actions (직접 외부 API 호출)

`src/actions.ts`의 Server Action들은 API Route를 경유하지 않고 `BASE_URL`로 직접 호출한다. 서버에서 실행되므로 프록시가 불필요하다.

| 함수                | 외부 API 경로                         | 설명               |
| ------------------- | ------------------------------------- | ------------------ |
| `follow`            | `POST /profiles/:username/follow`     | 사용자 팔로우      |
| `unFollow`          | `DELETE /profiles/:username/follow`   | 사용자 언팔로우    |
| `favoriteArticle`   | `POST /articles/:slug/favorite`       | 게시글 좋아요      |
| `unFavoriteArticle` | `DELETE /articles/:slug/favorite`     | 게시글 좋아요 취소 |
| `deleteArticle`     | `DELETE /articles/:slug`              | 게시글 삭제        |
| `deleteComment`     | `DELETE /articles/:slug/comments/:id` | 댓글 삭제          |

## 에러 처리 패턴

모든 API Route는 동일한 에러 처리 구조를 따른다:

```typescript
try {
  const res = await axios.method(url, ...);
  return NextResponse.json({ data: res.data, status: res.status });
} catch (error: any) {
  console.error('LOG_TAG', error);
  if (error.response.status === 401 || error.response.status === 422) {
    return NextResponse.json({ data: error.response.data.errors, status: error.response.status });
  }
  return new NextResponse('Internal server error', { status: 500 });
}
```
