# RealWorld Conduit - 코드 생성 스킬

이 프로젝트의 실제 코드 컨벤션에 맞춰 새로운 코드를 생성하기 위한 가이드.

## API Route 생성 패턴

새 API Route를 `src/app/api/` 하위에 추가할 때 따르는 규칙:

### 파일 구조

```
src/app/api/{resource}/route.ts           # 컬렉션 (GET 목록, POST 생성)
src/app/api/{resource}/[param]/route.ts   # 단일 리소스 (GET, PUT, DELETE)
```

### 템플릿: 인증 필요 라우트

```typescript
import { NextResponse } from "next/server";
import axios from "axios";

export async function METHOD(req: Request, ctx: { params: { param: string } }) {
  const token: string = req.headers.get("authorization") as string;
  try {
    const res = await axios.method(`${process.env.BASE_URL}/endpoint/${ctx.params.param}`, {
      headers: { Authorization: token },
    });
    return NextResponse.json({ data: await res.data, status: res.status });
  } catch (error: any) {
    console.error("API_RESOURCE_METHOD", error);
    if (error.response.status === 401 || error.response.status === 422) {
      return NextResponse.json({ data: error.response.data.errors, status: error.response.status });
    }
    return new NextResponse("Internal server error", {
      status: 500,
      statusText: "Internal server error",
    });
  }
}
```

### 템플릿: 세션 저장이 필요한 라우트 (login/register/user update)

```typescript
import { getSession } from "@/actions";
// ... axios 호출 후
const data = await res.data;
const session = await getSession();
session.isLoggedIn = true;
session.email = data.user.email;
session.username = data.user.username;
session.token = data.user.token;
await session.save();
```

### 응답 형식

항상 `{ data, status }` 형태로 반환:

```typescript
return NextResponse.json({ data: await res.data, status: res.status });
```

## Server Action 생성 패턴

`src/actions.ts`에 추가. 뮤테이션(데이터 변경)에 사용.

```typescript
export const actionName = async (param: string) => {
  const session = await getSession();
  if (session.token) {
    try {
      const res = await axios.method(
        `${process.env.BASE_URL}/endpoint`,
        {},
        {
          headers: { Authorization: `Token ${session.token}` },
        },
      );
      if (res.status === 200) {
        revalidatePath("/affected/path");
      }
    } catch (error: any) {
      console.log("ACTION_NAME", error);
    }
  } else {
    redirect("/login");
  }
};
```

## 페이지 생성 패턴

### Server Component 페이지 (기본)

```typescript
import { getSession } from "@/actions";

export default async function PageName({ params, searchParams }) {
    const session = await getSession();
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_RELATIVE_PATH}/resource/${params.id}`,
            { headers: { Authorization: session.token ? `Token ${session.token}` : undefined } }
        );
        const data = await res.data;
        if (data.status === 200) {
            return (<>{/* 렌더링 */}</>);
        } else {
            return (<FormattedErrors data={data.data} />);
        }
    } catch (err) {
        return (<h1 className="text-rose-500 w-fit mx-auto">Internal server Error</h1>);
    }
}
```

## Client Component 생성 패턴

### 폼 컴포넌트

```typescript
'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";

const formSchema = z.object({ /* ... */ });

export const MyForm = ({ token }: { token: string }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { /* ... */ },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_RELATIVE_PATH}/resource`,
                values,
                { headers: { Authorization: `Token ${token}` } }
            );
            toast.success('성공');
        } catch (error) {
            toast.error('실패');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* shadcn/ui FormField 사용 */}
            </form>
        </Form>
    );
};
```

### 액션 버튼 컴포넌트 (Server Action 호출)

```typescript
'use client'
import { Button } from "@/components/ui/button";
import { serverAction } from "@/actions";

export const ActionButton = ({ param }: { param: string }) => {
    return (
        <form action={async () => { await serverAction(param); }}>
            <Button type="submit">Action</Button>
        </form>
    );
};
```

## 네이밍 컨벤션

- 컴포넌트 파일: PascalCase (`ArticleList.tsx`)
- 인터페이스/타입 파일: camelCase (`session.ts`, `state.ts`)
- API Route: `route.ts`
- 에러 로그 태그: `API_RESOURCE_METHOD` (대문자 + 밑줄)
- 타입 접두사: `T` (type), `I` (interface) - `TArticleListProps`, `ISession`

## UI 컨벤션

- 스타일링: Tailwind CSS 유틸리티 클래스 직접 사용
- 반응형: `md:` / `lg:` 브레이크포인트
- 컬러: `text-green-custom` (테마 색상), `text-rose-500` (에러)
- 레이아웃 패딩: `px-4 md:px-10 lg:px-14`
- 폼 UI: shadcn/ui (`Form`, `FormField`, `Input`, `Button`, `Textarea`)
- 아바타: shadcn/ui `Avatar` 컴포넌트
- cn() 유틸리티로 조건부 클래스 병합
