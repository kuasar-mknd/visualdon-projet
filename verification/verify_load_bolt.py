from playwright.sync_api import sync_playwright, expect
import time

def verify_app_load():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for loading to finish (the year should appear)
        print("Waiting for year display...")
        # The year display has role="status" and contains the year
        # Initially it might be loading, so wait for it to have a year number
        year_display = page.locator("[role='status']").first
        expect(year_display).to_be_visible(timeout=10000)

        # Wait for the chart to be visible
        print("Waiting for chart...")
        chart = page.locator(".glass-panel-light").first
        expect(chart).to_be_visible()

        # Wait for SVG content to load (Globe or Chart)
        print("Waiting for SVG content...")
        # Check for any SVG path which indicates content has rendered
        page.wait_for_selector("path", timeout=10000)

        # Allow some time for animations to settle
        time.sleep(2)

        # Take screenshot
        print("Taking screenshot...")
        screenshot_path = "verification/app_loaded.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_app_load()
