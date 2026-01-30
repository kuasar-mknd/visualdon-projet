from playwright.sync_api import sync_playwright, expect
import time

def verify_chart(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    print("Waiting for chart to load...")
    # Wait for the chart group to be present in DOM
    page.wait_for_selector(".chart-group", timeout=10000)

    # Wait for bars to be rendered (indicating data loaded)
    page.wait_for_selector(".bar-group", timeout=10000)

    print("Chart loaded. Taking screenshot...")
    # Take a screenshot of the chart area specifically, or full page
    page.screenshot(path="verification/verification.png")
    print("Screenshot saved to verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_chart(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
