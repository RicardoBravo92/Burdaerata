import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import fs from "node:fs";

loadEnv({ path: ".env.local" });

const authFile = path.join(__dirname, "playwright", ".clerk", "user.json");

const hasE2ECredentials = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.E2E_CLERK_USER_EMAIL
);

const projects: NonNullable<Parameters<typeof defineConfig>[0]["projects"]> = [];

if (hasE2ECredentials) {
  projects.push({
    name: "global setup",
    testDir: "./tests/e2e",
    testMatch: /global-setup\.ts/,
  });
  projects.push({
    name: "chromium",
    testDir: "./tests/e2e",
    testIgnore: /global-setup\.ts/,
    use: {
      ...devices["Desktop Chrome"],
      storageState: fs.existsSync(authFile) ? authFile : undefined,
    },
    dependencies: ["global setup"],
  });
} else {
  projects.push({
    name: "chromium",
    testDir: "./tests/e2e",
    testIgnore: /global-setup\.ts/,
    use: { ...devices["Desktop Chrome"] },
  });
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  projects,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 300_000,
  },
});