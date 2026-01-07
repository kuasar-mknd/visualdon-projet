from playwright.sync_api import sync_playwright, expect
import time

def verify_app_loads(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for loading to finish
    # We look for the main content or the header
    print("Waiting for main content...")
    page.wait_for_selector("header", timeout=30000)

    # Check if Year is displayed (meaning data is loaded)
    # The year display might take a moment as data loads
    # We look for the status role which is used for loading, and wait for it to disappear
    # page.wait_for_selector("[role='status']", state="detached", timeout=30000)

    # Or wait for the globe or chart
    page.wait_for_selector(".country-path", timeout=30000)

    # Wait a bit for animations to settle
    time.sleep(2)

    # Check if we have data
    # The year display should show a year
    year_display = page.locator("header")
    expect(year_display).to_be_visible()

    print("Taking screenshot...")
    page.screenshot(path="verification/verification.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app_loads(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
