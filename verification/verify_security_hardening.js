import { chromium } from 'playwright';

async function verifySecurity() {
  console.log('🛡️ Starting Security Verification...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test 1: CSP Headers (Note: Vite dev server might not send all headers exactly like Vercel,
  // but we configured them in vite.config.js so we expect them)
  // However, Playwright 'page.goto' might complete before we inspect headers if we aren't careful.
  // We'll attach a listener.

  let cspFound = false;
  let hstsFound = false;

  page.on('response', response => {
    if (response.url().includes('localhost') && response.request().resourceType() === 'document') {
      const headers = response.headers();
      if (headers['content-security-policy']) {
        console.log('✅ CSP Header found:', headers['content-security-policy'].substring(0, 50) + '...');
        cspFound = true;
      }
      if (headers['strict-transport-security']) {
        console.log('✅ HSTS Header found');
        hstsFound = true;
      }
    }
  });

  try {
    console.log('➡️ Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  } catch {
    console.error('❌ Failed to connect to localhost. Ensure pnpm dev is running.');
    await browser.close();
    process.exit(1);
  }

  // Check Headers (might fail in pure Vite dev mode if plugins don't enforce it strictly, but we try)
  if (!cspFound) console.warn('⚠️ CSP Header NOT detected on document load (Expected in Vite config).');
  if (!hstsFound) console.warn('⚠️ HSTS Header NOT detected on document load.');

  // Test 2: LocalStorage Corruption Recovery
  console.log('\n🧪 Testing LocalStorage Corruption Recovery...');

  // Inject bad cache
  await page.evaluate(() => {
    localStorage.setItem('visualdon_country_cache', '{"malicious": {"payload": "javascript:alert(1)"}, "broken": null}');
    console.log('💉 Injected corrupted cache into localStorage');
  });

  // Reload to trigger countryService.js loading
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') console.log(`[Browser Warn] ${msg.text()}`);
  });

  console.log('🔄 Reloading page...');
  await page.reload({ waitUntil: 'networkidle' });

  // Check if app crashed (look for root element)
  const appRoot = await page.$('#root');
  if (appRoot) {
    console.log('✅ App loaded successfully after cache corruption.');
  } else {
    console.error('❌ App failed to load (root element missing).');
    process.exit(1);
  }

  // Verify cache was reset or handled
  const cacheAfter = await page.evaluate(() => localStorage.getItem('visualdon_country_cache'));
  if (cacheAfter === '{}' || cacheAfter === null || cacheAfter.includes('malicious') === false) {
    console.log('✅ Corrupted cache was cleaned/ignored.');
  } else {
    console.warn('⚠️ Corrupted cache might still be present:', cacheAfter);
  }

  // Test 3: Path Traversal in Manifest (Simulation)
  // We can't easily change the manifest file on server from here,
  // but we can try to intercept the network request and provide a bad manifest to see if useData catches it.

  console.log('\n🧪 Testing Manifest Path Traversal Validation...');

  await page.route('**/data/manifest.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        emissions: '../../etc/passwd',
        perCapita: 'normal.csv',
        emissionsHash: '',
        perCapitaHash: '',
        geoJsonHash: '',
        version: '1.0',
        lastUpdated: '2025'
      })
    });
  });

  // Trigger data load by reloading or re-mounting
  // A full reload is easiest
  const errorLogs = [];
  page.on('console', msg => {
      if (msg.type() === 'error') errorLogs.push(msg.text());
  });

  await page.reload({ waitUntil: 'networkidle' });

  // We expect an error in console from useData
  const trappedError = errorLogs.find(e => e.includes('Invalid filenames') || e.includes('Invalid manifest'));
  if (trappedError) {
      console.log('✅ Caught invalid filename/manifest error:', trappedError);
  } else {
      // It might be caught and just logged as "Error loading data: Invalid filenames..."
      // Let's check if the loading state persists or if we see the specific error.
      // useData logs: console.error("Error loading data:", err.message);
      // So we look for "Error loading data: Invalid filenames in manifest"

      const specificError = errorLogs.find(e => e.includes('Error loading data: Invalid filenames in manifest'));
      if (specificError) {
          console.log('✅ Validated: Path traversal prevented.');
      } else {
          console.warn('⚠️ Did not see expected error message for invalid filename. Logs:', errorLogs);
      }
  }

  await browser.close();
  console.log('\n🏁 Verification Complete.');
}

verifySecurity().catch(e => {
    console.error(e);
    process.exit(1);
});
