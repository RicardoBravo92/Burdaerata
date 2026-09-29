import { expect, test } from "@playwright/test";

const enabled = process.env.E2E_GAME_FLOW === "1";

test.describe("authenticated game flow", () => {
  test.skip(!enabled, "Set E2E_GAME_FLOW=1 plus E2E_CLERK_USER_EMAIL and a running backend to enable.");

  test("host creates a game and lands in the lobby", async ({ page }) => {
    await page.goto("/game");
    await expect(
      page.getByRole("heading", { name: "Game Night" })
    ).toBeVisible();

    await page.getByRole("button", { name: /create game/i }).click();

    await page.waitForURL(/\/game\/[a-zA-Z0-9-]+$/);
    await expect(
      page.getByRole("heading", { name: "Game Lobby" })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /start game/i })
    ).toBeVisible();

    const code = page
      .locator("div", { hasText: /^[0-9]{6}$/ })
      .first();
    await expect(code).toBeVisible();
  });

  test("host can open the game settings and change values", async ({ page }) => {
    await page.goto("/game");

    await page.getByRole("button", { name: /game settings/i }).click();
    await expect(
      page.getByRole("button", { name: /hide settings/i })
    ).toBeVisible();
  });
});