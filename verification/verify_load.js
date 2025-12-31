import { chromium } from 'playwright';

async function verifyAppLoads() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { timeout: 10000 });

    console.log('Waiting for header...');
    await page.waitForSelector('header', { timeout: 15000 });

    console.log('Waiting for main content...');
    await page.waitForSelector('#main-content', { timeout: 15000 });

    console.log('Waiting for chart group...');
    await page.waitForSelector('.chart-group', { timeout: 15000 });

    await page.screenshot({ path: 'verification/app_loaded.png' });
    console.log('Screenshot saved to verification/app_loaded.png');
    console.log('✅ Verification successful');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyAppLoads();
