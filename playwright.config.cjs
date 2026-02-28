"use strict";

const { defineConfig, devices } = require("@playwright/test");

const PLAYWRIGHT_HOST = "127.0.0.1";
const PLAYWRIGHT_PORT = 4173;
const PLAYWRIGHT_BASE_URL = `http://${PLAYWRIGHT_HOST}:${PLAYWRIGHT_PORT}`;

module.exports = defineConfig({
  testDir: "./e2e",
  testMatch: ["smoke.spec.js"],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || PLAYWRIGHT_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  webServer: {
    command: `python3 -m http.server ${PLAYWRIGHT_PORT} --bind ${PLAYWRIGHT_HOST}`,
    url: `${PLAYWRIGHT_BASE_URL}/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
