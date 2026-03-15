import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const APP_PATH = path.resolve('src/App.jsx');

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Introduce an intentional error
  const originalApp = fs.readFileSync(APP_PATH, 'utf-8');
  const errorApp = originalApp.replace(
    'return (',
    'if (true) throw new Error("Simulated Error for ErrorBoundary Testing!"); return ('
  );

  fs.writeFileSync(APP_PATH, errorApp);

  // Wait for HMR
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'verification/app_error.png' });

  // Revert back
  fs.writeFileSync(APP_PATH, originalApp);

  await browser.close();
}

test();
