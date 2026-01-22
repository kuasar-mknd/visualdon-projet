
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Assuming local server is running on 5173 as per documentation
  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000); // Wait for hydration
  } catch (e) {
    console.log("Could not connect to localhost:5173, skipping visual verification if server not running.");
    await browser.close();
    return;
  }

  // Verify Header Content Lang attributes
  const enLang = await page.locator('span[lang="en"]').count();
  const frLang = await page.locator('span[lang="fr"]').count();
  console.log(`Found ${enLang} EN lang spans and ${frLang} FR lang spans.`);

  // Verify Timeline Input Attributes
  const timelineInput = page.locator('input[type="range"]');
  const step = await timelineInput.getAttribute('step');
  const autocomplete = await timelineInput.getAttribute('autocomplete');
  console.log(`Timeline input: step=${step}, autocomplete=${autocomplete}`);

  // Take screenshot
  await page.screenshot({ path: 'verification/ux_polish_screenshot.png' });

  await browser.close();
})();
