const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.goto("http://localhost:3501", { waitUntil: "networkidle" });
  await page.click("button:first-of-type");
  await page.waitForTimeout(600);
  await page.screenshot({ path: "./ss-logo.png", clip: { x: 0, y: 0, width: 900, height: 76 } });
  await browser.close();
})();
