from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for dev server to be ready
            page.goto("http://localhost:5173", timeout=60000)

            # Wait for content to load (LanguageProvider defaults to 'fr' but let's check basic structure)
            page.wait_for_selector('h1', state='visible', timeout=30000)

            # Verify Cloudflare beacon script is present and has the correct token structure (masked/variable)
            # Since we are in dev mode, it might be the raw string "%VITE_CLOUDFLARE_BEACON_TOKEN%" or replaced if Vite loaded .env
            # Vite replaces env vars in index.html during dev too.
            content = page.content()
            if 'd952510ef6c8494181b4824d5030f155' in content:
                print("SUCCESS: Cloudflare token found in source (injected via .env)")
            elif '%VITE_CLOUDFLARE_BEACON_TOKEN%' in content:
                 print("WARNING: Token variable not replaced (check vite config/env loading)")
            else:
                 print("WARNING: Cloudflare token not found")

            # Verify TopCountriesChart doesn't crash (visual check)
            # It loads async, so wait a bit
            page.wait_for_timeout(3000)
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
