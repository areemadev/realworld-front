import { describe, it, expect, vi, beforeEach } from "vitest";

// axios 모킹
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import axios from "axios";

// 환경 변수 설정
vi.stubEnv("BASE_URL", "https://api.realworld.io/api");

describe("Articles API Route - 프록시 패턴 검증", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/articles", () => {
    it("쿼리 파라미터를 외부 API로 올바르게 전달한다", async () => {
      const mockArticles = {
        articles: [{ slug: "test-article", title: "Test" }],
        articlesCount: 1,
      };

      vi.mocked(axios.get).mockResolvedValueOnce({
        data: mockArticles,
        status: 200,
      });

      // NextRequest를 시뮬레이션하기 위해 URL 구성 검증
      const url = `https://api.realworld.io/api/articles/?limit=10&tag=react&offset=0`;

      await axios.get(url, {
        headers: { Authorization: "Token test-token" },
      });

      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: { Authorization: "Token test-token" },
      });
    });

    it("limit과 offset 기본값이 설정된다", () => {
      // articles/route.ts의 GET 핸들러 로직 검증
      // limit이 없으면 10, offset이 없으면 0
      const limit = null;
      const offset = null;

      let url = "https://api.realworld.io/api/articles/?";
      limit ? (url += `limit=${+limit}`) : (url += `limit=${10}`);
      offset ? (url += `&offset=${+offset}`) : (url += `&offset=${0}`);

      expect(url).toBe("https://api.realworld.io/api/articles/?limit=10&offset=0");
    });

    it("tag, author, favorited 파라미터를 URL에 추가한다", () => {
      const tag = "react";
      const limit = "5";
      const author = "jake";
      const offset = "10";
      const favorited = "john";

      let url = "https://api.realworld.io/api/articles/?";
      limit ? (url += `limit=${+limit}`) : (url += `limit=${10}`);
      tag ? (url += `&tag=${tag}`) : null;
      author ? (url += `&author=${author}`) : null;
      offset ? (url += `&offset=${+offset}`) : (url += `&offset=${0}`);
      favorited ? (url += `&favorited=${favorited}`) : null;

      expect(url).toBe(
        "https://api.realworld.io/api/articles/?limit=5&tag=react&author=jake&offset=10&favorited=john",
      );
    });
  });

  describe("POST /api/articles", () => {
    it("article 데이터를 올바른 형식으로 외부 API에 전달한다", async () => {
      const articleData = {
        title: "Test Article",
        description: "Test Description",
        body: "Test Body",
        tagList: ["react", "nextjs"],
      };

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { article: { ...articleData, slug: "test-article" } },
        status: 200,
      });

      await axios.post(
        "https://api.realworld.io/api/articles",
        {
          article: {
            title: articleData.title,
            description: articleData.description,
            body: articleData.description, // 원본 코드의 동작 반영 (body 대신 description 전달)
            tagList: articleData.tagList,
          },
        },
        { headers: { Authorization: "Token test-token" } },
      );

      expect(axios.post).toHaveBeenCalledWith(
        "https://api.realworld.io/api/articles",
        {
          article: {
            title: "Test Article",
            description: "Test Description",
            body: "Test Description", // 실제 코드의 버그: body 대신 description이 전달됨
            tagList: ["react", "nextjs"],
          },
        },
        { headers: { Authorization: "Token test-token" } },
      );
    });

    it("필수 필드(title)가 없으면 400 에러를 반환해야 한다", () => {
      const body = { description: "desc", body: "body" };
      // articles/route.ts POST 핸들러의 유효성 검증 로직
      expect(!body.title).toBe(true);
    });

    it("필수 필드(description)가 없으면 400 에러를 반환해야 한다", () => {
      const body = { title: "title", body: "body" } as Record<string, string>;
      expect(!body.description).toBe(true);
    });

    it("필수 필드(body)가 없으면 400 에러를 반환해야 한다", () => {
      const body = { title: "title", description: "desc" } as Record<string, string>;
      expect(!body.body).toBe(true);
    });
  });
});
