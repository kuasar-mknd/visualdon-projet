
from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for Vite dev server to be ready
            page.goto("http://localhost:5173", timeout=10000)

            # Wait for loading to finish and content to appear
            page.wait_for_selector('header', timeout=15000)
            page.wait_for_selector('#main-content', timeout=15000)

            # Wait for chart to appear
            page.wait_for_selector('.chart-group', timeout=15000)

            # Take screenshot
            page.screenshot(path="verification/app_loaded.png")
            print("Screenshot saved to verification/app_loaded.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
