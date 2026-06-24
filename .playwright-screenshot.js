const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro
  await page.goto("http://localhost:3501", { waitUntil: "networkidle" });
  await page.click("button:first-of-type");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "./ss-mobile-current.png", fullPage: false });
  
  // desktop também
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "./ss-desktop-products.png" });
  await browser.close();
})();
