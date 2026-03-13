# 데이터 페칭 패턴

## 개요

이 프로젝트는 3가지 데이터 페칭 패턴을 사용한다:

1. **Server Component 패턴** - 페이지/컴포넌트에서 직접 데이터 fetch
2. **Client Component 패턴** - axios로 내부 API Route 호출
3. **Server Action 패턴** - 뮤테이션 처리 + 캐시 무효화

## 1. Server Component 패턴

Server Component(페이지)에서 `getSession()`으로 세션을 조회하고, axios로 `NEXT_PUBLIC_RELATIVE_PATH`에 요청한다.

### 대표 예시: 홈 페이지

```typescript
// src/app/page.tsx
export default async function Home({ searchParams }) {
  const session = await getSession();
  const { page, offset, tag, limit, author, favorited, feed } = getParams(searchParams);

  return (
    <Suspense fallback={<Loading />}>
      <ArticleList
        token={session.token as string}
        tag={tag} page={page} feed={feed}
        limit={limit} offset={offset}
        author={author} favorited={favorited}
      />
    </Suspense>
  );
}
```

### 대표 예시: ArticleList (async Server Component)

```typescript
// src/components/home/ArticleList.tsx
export const ArticleList: React.FC<TArticleListProps> = async ({ token, ... }) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/?limit=${limit}&offset=${offset}`,
    { headers: { Authorization: token ? `Token ${token}` : undefined } }
  );
  const data = await res.data;
  if (data.status === 200) {
    const { articles, articlesCount } = data.data;
    return <>{articles.map(...)}</>;
  }
};
```

### 핵심 특징

- 페이지 컴포넌트가 `getSession()` 호출 -> 자식 컴포넌트에 `token` props 전달
- async Server Component에서 axios로 내부 API Route 호출 (SSR 시점)
- `Suspense`로 로딩 상태 처리
- 에러 발생 시 `FormattedErrors` 컴포넌트로 에러 메시지 표시

### 이 패턴을 사용하는 컴포넌트

| 컴포넌트                 | 호출 대상                                           |
| ------------------------ | --------------------------------------------------- |
| `ArticleList`            | `/api/articles` 또는 `/api/articles/feed`           |
| `SingleArticle` (페이지) | `/api/articles/[slug]`                              |
| `Comments`               | `/api/articles/[slug]/comments`                     |
| `PopularTag`             | `/api/tags`                                         |
| `ProfilePage` (페이지)   | `/api/profiles/[username]`                          |
| `SettingsPage` (페이지)  | `/api/user`                                         |
| `AvatarImg`              | `/api/profiles/[username]` (아바타 이미지 URL 획득) |

## 2. Client Component 패턴

Client Component에서 사용자 인터랙션에 따라 axios로 내부 API Route를 호출한다.

### 대표 예시: CommentForm

```typescript
// src/components/article/comments/CommentForm.tsx
"use client";

const onSubmit = async (values) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/${slug}/comments`,
    { body: values.body },
    { headers: { Authorization: `Token ${token}` } },
  );
};
```

### 핵심 특징

- `'use client'` 선언
- props로 전달받은 `token`을 Authorization 헤더에 사용
- `NEXT_PUBLIC_RELATIVE_PATH` 환경 변수로 내부 API Route 호출
- react-hook-form + zod로 폼 유효성 검사
- react-hot-toast로 성공/실패 알림

### 이 패턴을 사용하는 컴포넌트

| 컴포넌트      | 호출 대상                                   | 메서드     |
| ------------- | ------------------------------------------- | ---------- |
| `LoginForm`   | `/api/login`                                | POST       |
| `SignUpForm`  | `/api/register`                             | POST       |
| `CommentForm` | `/api/articles/[slug]/comments`             | POST       |
| `NewArticle`  | `/api/articles` 또는 `/api/articles/[slug]` | POST / PUT |
| `SettingForm` | `/api/user`                                 | PUT        |

## 3. Server Action 패턴

뮤테이션(데이터 변경) 중 form 제출이 아닌 버튼 클릭 액션은 Server Action으로 처리한다. `src/actions.ts`에 정의되어 있으며, `BASE_URL`로 직접 호출한다 (API Route 경유 불필요).

### 대표 예시: FollowButton

```typescript
// src/components/article/singleArticle/FollowButton.tsx
'use client'

<form action={async () => {
  following ? await unFollow(username) : await follow(username);
}}>
  <Button type="submit">...</Button>
</form>
```

### Server Action 내부 동작

```typescript
// src/actions.ts
export const follow = async (username: string) => {
  const session = await getSession();
  if (session.token) {
    await axios.post(
      `${process.env.BASE_URL}/profiles/${username}/follow`,
      {},
      {
        headers: { Authorization: `Token ${session.token}` },
      },
    );
    revalidatePath(`/profile/${username}`); // 캐시 무효화
  } else {
    redirect("/login");
  }
};
```

### 핵심 특징

- `'use server'` 선언 (파일 최상단)
- `getSession()`으로 서버에서 직접 세션 접근 (props 불필요)
- `BASE_URL`로 외부 API 직접 호출 (서버에서 실행되므로 프록시 불필요)
- `revalidatePath()`로 관련 페이지 캐시 무효화
- 미인증 시 `redirect('/login')`

### Server Action 목록

| 함수                | 트리거              | 캐시 무효화 경로             |
| ------------------- | ------------------- | ---------------------------- |
| `follow`            | FollowButton        | `/profile/[username]`        |
| `unFollow`          | FollowButton        | `/profile/[username]`        |
| `favoriteArticle`   | FavoriteButton      | 호출자가 지정 (`refreshUrl`) |
| `unFavoriteArticle` | FavoriteButton      | 호출자가 지정 (`refreshUrl`) |
| `deleteArticle`     | DeleteButton        | 삭제 후 `/`로 redirect       |
| `deleteComment`     | DeleteCommentButton | `/articles/[slug]`           |
| `logout`            | Logout              | 세션 파괴 후 `/`로 redirect  |

## 검색 파라미터 처리

`src/lib/get-params.ts`의 `getParams()` 함수가 URL 쿼리 파라미터를 정규화한다:

| 파라미터    | 기본값    | 용도                          |
| ----------- | --------- | ----------------------------- |
| `page`      | 1         | 현재 페이지 번호              |
| `offset`    | 0         | API 요청 오프셋               |
| `limit`     | 10        | 페이지당 게시글 수            |
| `tag`       | undefined | 태그 필터                     |
| `author`    | undefined | 작성자 필터                   |
| `favorited` | undefined | 좋아요 사용자 필터            |
| `feed`      | undefined | 팔로우 피드 여부 (1이면 feed) |
