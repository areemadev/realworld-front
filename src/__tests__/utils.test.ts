import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() - Tailwind 클래스 병합 유틸리티", () => {
  it("단일 클래스를 그대로 반환한다", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("여러 클래스를 공백으로 합친다", () => {
    expect(cn("text-red-500", "bg-blue-200")).toBe("text-red-500 bg-blue-200");
  });

  it("충돌하는 Tailwind 클래스에서 마지막 값이 우선한다", () => {
    // tailwind-merge가 충돌 해소: text-red-500 vs text-blue-500
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("조건부 클래스를 처리한다 (clsx 동작)", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
  });

  it("undefined, null, false 값을 무시한다", () => {
    expect(cn("base", undefined, null, false, "extra")).toBe("base extra");
  });

  it("빈 인자 시 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });

  it("객체 형태의 조건부 클래스를 처리한다", () => {
    expect(cn({ "text-bold": true, "text-italic": false })).toBe("text-bold");
  });

  it("배열 형태의 클래스를 처리한다", () => {
    expect(cn(["p-4", "m-2"])).toBe("p-4 m-2");
  });

  it("padding 충돌을 올바르게 병합한다", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
});
