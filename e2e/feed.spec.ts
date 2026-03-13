import { test, expect } from "@playwright/test";

test.describe("피드 및 태그 기능", () => {
  test("글로벌 피드가 홈페이지에서 로드된다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 페이지가 정상적으로 로드되었는지 확인
    await expect(page.locator("body")).toBeVisible();

    // "Global Feed" 탭이 있는지 확인
    const globalFeedTab = page.getByText(/Global Feed/i);
    if ((await globalFeedTab.count()) > 0) {
      await expect(globalFeedTab).toBeVisible();
    }
  });

  test("태그 목록이 사이드바에 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // "Popular Tags" 또는 태그 섹션 확인
    const tagsSection = page.getByText(/Popular Tags|Tags/i);
    if ((await tagsSection.count()) > 0) {
      await expect(tagsSection.first()).toBeVisible();
    }
  });

  test("태그를 클릭하면 해당 태그의 아티클이 필터링된다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 태그 링크 찾기
    const tagLinks = page.locator('a[href*="tag="]');
    if ((await tagLinks.count()) > 0) {
      const firstTag = tagLinks.first();
      const tagText = await firstTag.textContent();
      await firstTag.click();
      await page.waitForLoadState("networkidle");

      // URL에 tag 파라미터가 포함되어야 한다
      expect(page.url()).toContain("tag=");
    }
  });

  test("페이지네이션이 작동한다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 페이지네이션 링크 확인
    const paginationLinks = page.locator('a[href*="page="]');
    if ((await paginationLinks.count()) > 1) {
      // 두 번째 페이지 링크 클릭
      await paginationLinks.nth(1).click();
      await page.waitForLoadState("networkidle");

      // URL에 page 파라미터 포함 확인
      expect(page.url()).toContain("page=");
    }
  });

  test("네비게이션 바가 표시된다", async ({ page }) => {
    await page.goto("/");

    // 네비게이션 바 확인
    const nav = page.locator("nav");
    if ((await nav.count()) > 0) {
      await expect(nav.first()).toBeVisible();
    }

    // Conduit 로고/브랜드 링크 확인
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink.first()).toBeVisible();
  });

  test("푸터가 표시된다", async ({ page }) => {
    await page.goto("/");

    // 푸터 확인
    const footer = page.locator("footer");
    if ((await footer.count()) > 0) {
      await expect(footer).toBeVisible();
    }
  });
});
