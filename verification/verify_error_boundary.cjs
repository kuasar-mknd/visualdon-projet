const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Wait for the app to load
  await page.waitForTimeout(2000); // Give it some time to fetch data

  // We want to force an error to trigger the ErrorBoundary.
  // One way is to inject an error into the React root or corrupt a component state.
  // Let's modify the DOM to trigger a component error, or execute a script that
  // causes a React lifecycle error if possible.
  // Actually, since we want to see the error boundary, we can temporarily modify App.jsx
  // or a child component to throw an error, take a screenshot, then revert.

  // Taking a screenshot of the normal app first
  await page.screenshot({ path: 'verification/app_normal.png' });

  await browser.close();
})();
