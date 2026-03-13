import { describe, it, expect } from "vitest";
import { getParams } from "@/lib/get-params";

describe("getParams() - 검색 파라미터 파싱", () => {
  it("기본값을 올바르게 반환한다 (빈 객체)", () => {
    const result = getParams({});
    expect(result).toEqual({
      page: 1,
      offset: 0,
      tag: undefined,
      limit: 10,
      author: undefined,
      favorited: undefined,
      feed: undefined,
    });
  });

  it("page 파라미터를 파싱한다", () => {
    const result = getParams({ page: 3 });
    expect(result.page).toBe(3);
  });

  it("page가 없으면 기본값 1을 사용한다", () => {
    const result = getParams({});
    expect(result.page).toBe(1);
  });

  it("offset 파라미터를 파싱한다", () => {
    const result = getParams({ offset: 20 });
    expect(result.offset).toBe(20);
  });

  it("offset이 0이면 0을 반환한다", () => {
    const result = getParams({ offset: 0 });
    expect(result.offset).toBe(0);
  });

  it("tag 파라미터를 파싱한다", () => {
    const result = getParams({ tag: "react" });
    expect(result.tag).toBe("react");
  });

  it("tag가 없으면 undefined를 반환한다", () => {
    const result = getParams({});
    expect(result.tag).toBeUndefined();
  });

  it("limit 파라미터를 파싱한다", () => {
    const result = getParams({ limit: 20 });
    expect(result.limit).toBe(20);
  });

  it("limit가 없으면 기본값 10을 사용한다", () => {
    const result = getParams({});
    expect(result.limit).toBe(10);
  });

  it("author 파라미터를 파싱한다", () => {
    const result = getParams({ author: "jake" });
    expect(result.author).toBe("jake");
  });

  it("favorited 파라미터를 파싱한다", () => {
    const result = getParams({ favorited: "jake" });
    expect(result.favorited).toBe("jake");
  });

  it("feed 파라미터를 파싱한다", () => {
    const result = getParams({ feed: 1 });
    expect(result.feed).toBe(1);
  });

  it("모든 파라미터를 동시에 처리한다", () => {
    const result = getParams({
      page: 2,
      offset: 10,
      tag: "nextjs",
      limit: 5,
      author: "john",
      favorited: "jane",
      feed: 1,
    });
    expect(result).toEqual({
      page: 2,
      offset: 10,
      tag: "nextjs",
      limit: 5,
      author: "john",
      favorited: "jane",
      feed: 1,
    });
  });
});
