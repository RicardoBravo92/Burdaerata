import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";
import path from "node:path";

setup.describe.configure({ mode: "serial" });

setup("configure Clerk test mode", async () => {
  await clerkSetup();
});

const authFile = path.join(
  __dirname,
  "..",
  "..",
  "playwright",
  ".clerk",
  "user.json"
);

setup("authenticate and save the auth state", async ({ page }) => {
  const email = process.env.E2E_CLERK_USER_EMAIL!;

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: email });

  await page.goto("/game");
  await expect(
    page.getByRole("heading", { name: "Game Night" })
  ).toBeVisible();
  await page.context().storageState({ path: authFile });
});