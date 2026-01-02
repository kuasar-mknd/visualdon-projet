const { chromium } = require('playwright');
const path = require('path');

async function verifyAppLoads() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const url = 'http://localhost:4173'; // Default Vite preview port
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { timeout: 10000 });

    console.log('Waiting for header...');
    await page.waitForSelector('header', { timeout: 15000 });

    console.log('Waiting for main content...');
    await page.waitForSelector('#main-content', { timeout: 15000 });

    console.log('Waiting for chart...');
    // Note: 'chart-group' might be specific to D3 elements.
    // Ensure this selector exists in the built app.
    await page.waitForSelector('.chart-group', { timeout: 15000 });

    const screenshotPath = path.join(__dirname, 'app_loaded_node.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);
    console.log('Verification successful!');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  verifyAppLoads();
}
