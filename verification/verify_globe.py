from playwright.sync_api import sync_playwright

def verify_globe_render():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            print("Waiting for loading to complete...")
            page.wait_for_selector('text=Loading...', state="detached", timeout=30000)

            print("Waiting for Globe...")
            page.wait_for_selector('.sphere-path', timeout=10000)

            print("Waiting for country paths...")
            page.wait_for_selector('.country-path', timeout=10000)

            # The glow circle (filter) intercepts clicks/hovers.
            # We can force the hover or interact via JS.
            print("Attempting to hover via JS dispatch...")

            # Locate the first country path
            country = page.locator('.country-path').first

            # Use dispatch_event to bypass the intercepting overlay
            country.dispatch_event('mouseenter')
            country.focus() # Also try focus

            print("Waiting for highlight...")
            page.wait_for_selector('.highlight-path', timeout=5000)

            print("Taking screenshot...")
            page.screenshot(path="verification/globe_verification.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_globe_render()
