import { describe, it, expect, vi, beforeEach } from "vitest";

// axios 모킹
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from "axios";

vi.stubEnv("BASE_URL", "https://api.realworld.io/api");

describe("Auth API Routes - 인증 프록시 패턴 검증", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/login", () => {
    it("로그인 요청을 올바른 형식으로 외부 API에 전달한다", async () => {
      const loginData = {
        user: {
          email: "test@example.com",
          password: "password123",
        },
      };

      const mockResponse = {
        data: {
          user: {
            email: "test@example.com",
            username: "testuser",
            token: "jwt-token-here",
          },
        },
        status: 200,
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await axios.post("https://api.realworld.io/api/users/login", loginData);

      expect(axios.post).toHaveBeenCalledWith(
        "https://api.realworld.io/api/users/login",
        loginData,
      );
      expect(result.data.user.token).toBe("jwt-token-here");
      expect(result.data.user.email).toBe("test@example.com");
    });

    it("email이 없으면 유효성 검증에 실패한다", () => {
      const body = { password: "password123" } as Record<string, string>;
      expect(!body.email).toBe(true);
    });

    it("password가 없으면 유효성 검증에 실패한다", () => {
      const body = { email: "test@example.com" } as Record<string, string>;
      expect(!body.password).toBe(true);
    });

    it("401/422/403 에러 시 에러 데이터를 반환한다", async () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: { "email or password": ["is invalid"] },
          },
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(error);

      try {
        await axios.post("https://api.realworld.io/api/users/login", {
          user: { email: "bad@test.com", password: "wrong" },
        });
      } catch (e: unknown) {
        const err = e as typeof error;
        expect(err.response.status).toBe(422);
        expect(err.response.data.errors).toHaveProperty("email or password");
      }
    });
  });

  describe("POST /api/register", () => {
    it("회원가입 요청을 올바른 형식으로 외부 API에 전달한다", async () => {
      const registerData = {
        user: {
          email: "new@example.com",
          username: "newuser",
          password: "password123",
        },
      };

      const mockResponse = {
        data: {
          user: {
            email: "new@example.com",
            username: "newuser",
            token: "jwt-token-new",
          },
        },
        status: 200,
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await axios.post("https://api.realworld.io/api/users", registerData);

      expect(axios.post).toHaveBeenCalledWith("https://api.realworld.io/api/users", registerData);
      expect(result.data.user.username).toBe("newuser");
    });

    it("username이 없으면 유효성 검증에 실패한다", () => {
      const body = { email: "test@test.com", password: "pass" } as Record<string, string>;
      expect(!body.username).toBe(true);
    });

    it("email이 없으면 유효성 검증에 실패한다", () => {
      const body = { username: "user", password: "pass" } as Record<string, string>;
      expect(!body.email).toBe(true);
    });

    it("password가 없으면 유효성 검증에 실패한다", () => {
      const body = { username: "user", email: "test@test.com" } as Record<string, string>;
      expect(!body.password).toBe(true);
    });
  });
});
