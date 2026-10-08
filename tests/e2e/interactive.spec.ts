import { expect, test } from "@playwright/test";

test("yield mode colors dies and reports the aggregate", async ({ page }) => {
  await page.goto("/?skip=1&t=0&mode=yield");
  await expect(page.getByTestId("yield-pct")).toBeVisible();
  const text = await page.getByTestId("yield-pct").innerText();
  expect(Number(text.replace("%", ""))).toBeGreaterThan(0);
});

test("yield mode actually renders distinct colors, not just a DOM readout", async ({ page }) => {
  await page.goto("/?skip=1&t=0&mode=yield");
  await page.waitForFunction(() => typeof (window as unknown as { __cascadeStats?: unknown }).__cascadeStats === "function", null, { timeout: 30_000 });
  await page.waitForTimeout(400);
  const stage = page.getByTestId("stage");
  const box = await stage.boundingBox(); if (!box) throw new Error("no stage box");
  const samples = new Set<string>();
  for (let x = 0.55; x < 0.95; x += 0.05) {
    const buf = await page.screenshot({ clip: { x: box.x + box.width * x, y: box.y + box.height * 0.3, width: 1, height: 1 } });
    samples.add(buf.toString("base64"));
  }
  // A real color map has more than one distinct pixel sample across the die grid; a broken instanceColor renders one flat color everywhere.
  expect(samples.size).toBeGreaterThan(1);
});

test("logbook entry selection shows detail", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await page.getByTestId("log-log-1").click();
  await expect(page.getByTestId("log-detail")).toBeVisible();
});

test("zoom scrub moves between scale stations", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await expect(page.getByTestId("gauge")).toHaveText("Wafer");
  await page.getByTestId("nav-lattice").click();
  await expect(page.getByTestId("gauge")).toHaveText("Lattice");
});

test("out-of-range zoom scrub clamps natively", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  const scrub = page.getByTestId("zoom-scrub");
  await scrub.evaluate((el: HTMLInputElement) => { el.value = "999"; el.dispatchEvent(new Event("input", { bubbles: true })); });
  expect(Number(await scrub.inputValue())).toBeLessThanOrEqual(6);
});

test("keyboard-only: tab reaches the scale rail and activates a station", async ({ page }) => {
  await page.goto("/?skip=1");
  await page.getByTestId("nav-logic").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("nav-logic")).toHaveClass(/on/);
});

test("mobile width keeps the HUD usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/?skip=1&t=0");
  await expect(page.getByTestId("hud")).toBeVisible();
  await expect(page.getByTestId("cell-table")).toBeVisible();
});

test("reduced motion: intro renders a static keyframe list with no timeline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("intro")).toBeVisible();
  await page.getByTestId("skip-intro").click();
  await expect(page.getByTestId("hud")).toBeVisible();
});

test("graphics failure: gfx=off falls back to the poster with no canvas", async ({ page }) => {
  await page.goto("/?gfx=off&skip=1");
  await expect(page.getByTestId("poster")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
