# 컴포넌트 구조

## 컴포넌트 분류 기준

- **Server Component**: `'use client'` 선언이 없는 컴포넌트. 서버에서 렌더링되며 async 함수로 데이터를 직접 fetch할 수 있다.
- **Client Component**: `'use client'` 선언이 있는 컴포넌트. 브라우저에서 실행되며 hooks, 이벤트 핸들러를 사용한다.

## 도메인별 컴포넌트 맵

### article/ - 게시글

| 컴포넌트                | 파일                                      | 유형   | 역할                        |
| ----------------------- | ----------------------------------------- | ------ | --------------------------- |
| `Article`               | `Article.tsx`                             | Server | 게시글 카드 (목록에서 사용) |
| `SingleArticleHeader`   | `singleArticle/SingleArticleHeader.tsx`   | Server | 게시글 상세 헤더 (배너)     |
| `SingleArticleActivity` | `singleArticle/SingleArticleActivity.tsx` | Server | 게시글 하단 액션 영역       |
| `FollowButton`          | `singleArticle/FollowButton.tsx`          | Client | 팔로우/언팔로우 버튼        |
| `FavoriteButton`        | `singleArticle/FavoriteButton.tsx`        | Client | 좋아요/취소 버튼            |
| `DeleteButton`          | `singleArticle/DeleteButton.tsx`          | Client | 게시글 삭제 버튼            |
| `EditButton`            | `singleArticle/EditButton.tsx`            | Server | 게시글 수정 링크 버튼       |
| `CommentForm`           | `comments/CommentForm.tsx`                | Client | 댓글 입력 폼                |
| `Comments`              | `comments/Comments.tsx`                   | Server | 댓글 목록 (async fetch)     |
| `DeleteCommentButton`   | `comments/DeleteCommentButton.tsx`        | Client | 댓글 삭제 버튼              |

### auth/ - 인증

| 컴포넌트     | 파일                      | 유형   | 역할                                |
| ------------ | ------------------------- | ------ | ----------------------------------- |
| `LoginForm`  | `login/LoginForm.tsx`     | Client | 로그인 폼 (react-hook-form + zod)   |
| `SignUpForm` | `register/SignUpForm.tsx` | Client | 회원가입 폼 (react-hook-form + zod) |

**인터페이스 파일:**

- `interfaces/session.ts` - `ISession` (username, email, token)
- `interfaces/state.ts` - `TState` (loading, isError, errors)

### home/ - 홈 페이지

| 컴포넌트              | 파일                      | 유형   | 역할                                           |
| --------------------- | ------------------------- | ------ | ---------------------------------------------- |
| `Header`              | `Header.tsx`              | Server | 홈 페이지 배너 ("conduit")                     |
| `ArticleHeader`       | `ArticleHeader.tsx`       | Client | 피드 탭 헤더 (Global Feed / Your Feed)         |
| `ArticleList`         | `ArticleList.tsx`         | Server | 게시글 목록 (async fetch, 프로필에서도 재사용) |
| `PaginationComponent` | `PaginationComponent.tsx` | Client | 페이지네이션 UI                                |

### profiles/ - 프로필

| 컴포넌트        | 파일                     | 유형   | 역할                                      |
| --------------- | ------------------------ | ------ | ----------------------------------------- |
| `ProfileHeader` | `ProfileHeader.tsx`      | Server | 프로필 배너 (아바타, 바이오, 팔로우 버튼) |
| `AvatarImg`     | `avatar/AvatarImage.tsx` | Server | 아바타 이미지 (외부 API에서 fetch)        |
| `UserAvatar`    | `avatar/UserAvatar.tsx`  | Server | 사용자 아바타 래퍼                        |

### settings/ - 설정

| 컴포넌트      | 파일              | 유형   | 역할                               |
| ------------- | ----------------- | ------ | ---------------------------------- |
| `SettingForm` | `SettingForm.tsx` | Client | 사용자 설정 폼 (react-hook-form)   |
| `Logout`      | `Logout.tsx`      | Client | 로그아웃 버튼 (Server Action 호출) |

### editor/ - 에디터

| 컴포넌트     | 파일             | 유형   | 역할                |
| ------------ | ---------------- | ------ | ------------------- |
| `NewArticle` | `NewArticle.tsx` | Client | 게시글 작성/수정 폼 |

### tag/ - 태그

| 컴포넌트     | 파일             | 유형   | 역할                             |
| ------------ | ---------------- | ------ | -------------------------------- |
| `PopularTag` | `PopularTag.tsx` | Server | 인기 태그 사이드바 (async fetch) |
| `Tag`        | `Tag.tsx`        | Client | 개별 태그 링크                   |
| `TagList`    | `TagList.tsx`    | Server | 태그 목록 래퍼                   |

### navbar/ - 네비게이션

| 컴포넌트  | 파일          | 유형   | 역할                                     |
| --------- | ------------- | ------ | ---------------------------------------- |
| `Navbar`  | `Navbar.tsx`  | Server | 상단 네비게이션 바 (세션 기반 메뉴 분기) |
| `NavLink` | `NavLink.tsx` | Client | 활성 상태 표시가 있는 네비게이션 링크    |

**인터페이스:** `interfaces/navlink.ts` - NavLink props 타입

### footer/ - 푸터

| 컴포넌트 | 파일         | 유형   | 역할      |
| -------- | ------------ | ------ | --------- |
| `Footer` | `Footer.tsx` | Server | 하단 푸터 |

### error/ - 에러

| 컴포넌트          | 파일                  | 유형   | 역할                   |
| ----------------- | --------------------- | ------ | ---------------------- |
| `FormattedErrors` | `FormattedErrors.tsx` | Server | API 에러 메시지 포매팅 |

### loading/ - 로딩

| 컴포넌트  | 파일          | 유형   | 역할                               |
| --------- | ------------- | ------ | ---------------------------------- |
| `Loading` | `Loading.tsx` | Client | 로딩 스피너 (react-loader-spinner) |

### ui/ - shadcn/ui 프리미티브

모두 Client Component (Radix 기반):

| 컴포넌트     | 파일             |
| ------------ | ---------------- |
| `Avatar`     | `avatar.tsx`     |
| `Button`     | `button.tsx`     |
| `Form`       | `form.tsx`       |
| `Input`      | `input.tsx`      |
| `Label`      | `label.tsx`      |
| `Pagination` | `pagination.tsx` |
| `Separator`  | `separator.tsx`  |
| `Textarea`   | `textarea.tsx`   |

## 페이지 구성

### 루트 레이아웃 (`src/app/layout.tsx`)

```
RootLayout (Server)
├── ToasterProvider (Client) - react-hot-toast
├── NavBar (Server) - 세션 기반 네비게이션
├── {children} - 페이지 콘텐츠
└── Footer (Server)
```

### 홈 페이지 (`src/app/page.tsx`)

```
Home (Server) - getSession() 호출
├── Header (Server) - 배너
├── ArticleHeader (Client) - 피드 탭
├── ArticleList (Server) - Suspense 래핑
│   ├── Article (Server) * N
│   └── PaginationComponent (Client)
└── PopularTag (Server) - Suspense 래핑
```

### 게시글 상세 (`src/app/article/[slug]/page.tsx`)

```
SingleArticle (Server) - getSession() + axios fetch
├── SingleArticleHeader (Server)
│   ├── FollowButton (Client) / EditButton (Server)
│   ├── FavoriteButton (Client) / DeleteButton (Client)
├── TagList (Server)
├── SingleArticleActivity (Server) - Suspense 래핑
├── CommentForm (Client) - 로그인 시
└── Comments (Server) - 로그인 시
```

### 프로필 (`src/app/profile/[username]/page.tsx`)

```
ProfilePage (Server) - getSession() + axios fetch
├── ProfileHeader (Server)
├── ArticleHeader (Client) - My Articles / Favorited Posts 탭
└── ArticleList (Server) - Suspense 래핑
```
