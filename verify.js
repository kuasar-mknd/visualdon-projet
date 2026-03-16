import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.glass-panel-light');

    // Test map focus (GlobePaths)
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // focus map path
    await page.screenshot({ path: '/tmp/map-focus.png' });

    // Evaluate javascript to focus a bar group
    await page.waitForSelector('.chart-group');
    await page.focus('.bar-group');
    await page.screenshot({ path: '/tmp/top-chart-focus.png' });

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
