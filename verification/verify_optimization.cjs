const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to app...');
    // Wait for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.goto('http://localhost:3000');

    // Wait for data to load and TopCountriesChart to appear
    console.log('Waiting for chart...');
    await page.waitForSelector('.chart-group', { timeout: 30000 });

    // Check if bars are visible
    const bars = await page.locator('.bar-group');
    const count = await bars.count();
    console.log(`Found ${count} bars in TopCountriesChart`);

    if (count === 0) {
      throw new Error('No bars found in TopCountriesChart. Optimization might have broken data binding.');
    }

    // Take screenshot
    await page.screenshot({ path: 'verification/optimization_verify.png', fullPage: true });
    console.log('Screenshot saved.');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
