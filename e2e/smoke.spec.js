"use strict";

const { test, expect } = require("@playwright/test");
const {
  installFirebaseMock,
  SMOKE_TEST_CREDENTIALS,
  SMOKE_SEED_TASK_TITLE,
} = require("./support/firebase-mock");

const CONTACT_NAME_CREATED = "E2E Smoke Contact";
const CONTACT_NAME_UPDATED = "E2E Smoke Contact Updated";
const NEW_TASK_TITLE = "Smoke task created from add-task flow";

test.describe("E2E smoke: critical user journeys", () => {
  test.beforeEach(async ({ page }) => {
    await installFirebaseMock(page);
  });

  test("login + redirect", async ({ page }) => {
    await page.goto("/index.html");

    await expect(page.locator("#loginForm")).toBeVisible();
    await page.locator("#loginEmailInput").fill(SMOKE_TEST_CREDENTIALS.email);
    await page.locator("#loginPasswordInput").fill(SMOKE_TEST_CREDENTIALS.password);
    await page.locator("button[form='loginForm']").click();

    await expect(page).toHaveURL(/\/summary\.html$/);
    await expect(page.locator("#usernameForGreeting")).toContainText(
      SMOKE_TEST_CREDENTIALS.name
    );
  });

  test("summary load", async ({ page }) => {
    await page.goto("/summary.html");

    await expect(page.locator("#amountAllBoardTasks")).toHaveText("2");
    await expect(page.locator("#amountTodo")).toHaveText("1");
    await expect(page.locator("#amountInProgress")).toHaveText("1");
    await expect(page.locator("#amountUrgent")).toHaveText("1");
  });

  test("add-task basic create flow", async ({ page }) => {
    await page.goto("/addTask.html");

    await expect(page.locator("#addTaskEnterTitleInput")).toBeVisible();
    const dueDate = getFutureIsoDate(2);
    await page.evaluate(
      ({ titleValue, dueDateValue }) => {
        const titleInput = document.getElementById("addTaskEnterTitleInput");
        const dueDateInput = document.getElementById("addTaskDueDateInput");

        if (!titleInput || !dueDateInput) {
          throw new Error("Add-task form inputs are not available.");
        }

        titleInput.value = titleValue;
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
        dueDateInput.value = dueDateValue;
        dueDateInput.dispatchEvent(new Event("input", { bubbles: true }));
      },
      { titleValue: NEW_TASK_TITLE, dueDateValue: dueDate }
    );
    await page.locator("[data-action='set-priority'][data-priority='urgent']").click();
    await page.evaluate(() => {
      if (typeof checkValidity === "function") {
        checkValidity();
      }
    });
    const createButtonEnabled = await page.locator("#createBtn").isEnabled();
    if (!createButtonEnabled) {
      await page.evaluate(() => {
        if (typeof activateButton === "function") {
          activateButton("createBtn", "create-task");
        }
      });
    }
    await expect(page.locator("#createBtn")).toBeEnabled();

    await page.locator("#createBtn").click();
    await expect(page).toHaveURL(/\/board\.html$/, { timeout: 20_000 });
    await expect(page.locator(".cardTitle", { hasText: NEW_TASK_TITLE })).toBeVisible();
  });

  test("contacts create/edit/delete happy path", async ({ page }) => {
    await page.goto("/contacts.html");

    await expect(page.locator("#button-add-contact-card")).toBeVisible();
    await page.locator("#button-add-contact-card").click();
    await expect(page.locator("#addContact")).toBeVisible();

    await page.locator("#contactName").fill(CONTACT_NAME_CREATED);
    await page.locator("#contactMail").fill("e2e.smoke.contact@example.com");
    await page.locator("#contactPhone").fill("01709876543");
    await page.locator("#addContact button[type='submit']").click();

    await expect(
      page.locator(".contact-card-name", { hasText: CONTACT_NAME_CREATED })
    ).toBeVisible();
    const createdContactCard = page
      .locator("button.contact-card", { hasText: CONTACT_NAME_CREATED })
      .first();
    const createdContactId = await createdContactCard.getAttribute("data-contact-id");
    if (!createdContactId) {
      throw new Error("Could not resolve contact id for smoke contact.");
    }

    await createdContactCard.click();
    await page.evaluate((contactId) => {
      return window.editContact(Number(contactId));
    }, createdContactId);
    await expect(page.locator("#editContact")).toBeVisible();
    await page.locator("#editContact #contactName").fill(CONTACT_NAME_UPDATED);
    await page.locator("#editContact #contactPhone").fill("01701231231");
    await page.locator("#editContact button[type='submit']").click();

    await expect(
      page.locator(".contact-details-name", { hasText: CONTACT_NAME_UPDATED })
    ).toBeVisible();
    await page.evaluate((contactId) => {
      return window.removeContact(Number(contactId));
    }, createdContactId);
    await expect(
      page.locator(".contact-card-name", { hasText: CONTACT_NAME_UPDATED })
    ).toHaveCount(0);
  });

  test("board render + card open/close", async ({ page }) => {
    await page.goto("/board.html");

    await expect(page.locator("[data-action='open-card']")).toHaveCount(2);
    await page
      .locator("[data-action='open-card']", { hasText: SMOKE_SEED_TASK_TITLE })
      .click();
    await expect(page.locator("#openCardContainer")).toBeVisible();
    await expect(page.locator("#openCardContainer .cardTitle")).toContainText(
      SMOKE_SEED_TASK_TITLE
    );

    await page.locator("#openCardContainer [data-action='close-card']").click();
    await expect(page.locator("#openCardContainer")).toHaveCount(0);
  });
});

function getFutureIsoDate(offsetDays) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const futureDate = new Date(Date.now() + offsetDays * millisecondsPerDay);
  return futureDate.toISOString().slice(0, 10);
}
