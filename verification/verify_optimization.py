
from playwright.sync_api import sync_playwright, expect
import time

def verify_app_load(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for loading to finish
    # The loading state has text "LOADING" or "CHARGEMENT" depending on locale
    # But we can wait for the main content to appear
    print("Waiting for main content...")
    page.wait_for_selector("#main-content", timeout=15000)

    # Wait for the chart to be visible
    print("Waiting for chart...")
    page.wait_for_selector(".chart-group", timeout=15000)

    # Verify year slider exists (data loaded and range calculated)
    print("Verifying controls...")
    slider = page.locator("input[type='range']")
    expect(slider).to_be_visible()

    # Check if max year is set (should be > 2020)
    max_year = slider.get_attribute("max")
    print(f"Max year found: {max_year}")
    if int(max_year) < 2020:
        raise Exception(f"Max year {max_year} is too low, data processing might be broken")

    # Wait a bit for globe to render
    time.sleep(2)

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/app_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_app_load(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
