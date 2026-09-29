import { expect, test } from "@playwright/test";

test("landing page shows the hero, features and auth CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Welcome to Burdaerata!" })
  ).toBeVisible();
  await expect(
    page.getByText("The card game that turns any friend group into a beautiful mess.")
  ).toBeVisible();
  await expect(page.getByText("Creative Cards")).toBeVisible();
  await expect(page.getByText("Multiplayer")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Ready to play?" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
});

test("header shows the brand and authentication buttons", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Burdaerata" })).toBeVisible();
  const header = page.getByRole("banner");
  await expect(header.getByRole("button", { name: /^Sign In$/i })).toBeVisible();
  await expect(header.getByRole("button", { name: /^Sign Up$/i })).toBeVisible();
});