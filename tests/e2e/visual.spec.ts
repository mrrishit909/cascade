import { expect, test } from "@playwright/test";
const SCALES = ["wafer", "die", "interconnects", "logic", "cells", "transistors", "lattice"];
for (let i = 0; i < SCALES.length; i++) {
  test(`visual: ${SCALES[i]}`, async ({ page }) => {
    await page.goto(`/?gfx=off&skip=1&t=${i}`); await page.addStyleTag({ content: "*{animation:none!important;transition:none!important}" });
    await expect(page.getByTestId("hud")).toBeVisible(); await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot(`${SCALES[i]}.png`, { maxDiffPixelRatio: 0.05 });
  });
}
